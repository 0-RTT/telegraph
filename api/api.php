<?php

class ImageUploader
{
    private $allowedTypes = ["image/gif", "image/jpeg", "image/jpg", "image/pjpeg", "image/x-png", "image/png"];
    private $maxSize = 5 * 1024 * 1024;
    private $domains = ['img.selipoi.top', 'picture.atago.moe'];

    public function upload()
    {
        $errors = [];

        if (!isset($_FILES["file"])) {
            $errors[] = "没有上传文件！";
        }

        $file = $_FILES["file"]["name"];
        $fileType = $_FILES["file"]["type"];
        if (!in_array($fileType, $this->allowedTypes)) {
            $errors[] = "只允许上传gif、jpeg、jpg、png格式的图片文件！";
        }

        $fileSize = $_FILES["file"]["size"];
        $filepath = $_FILES["file"]["tmp_name"];
        
        if ($fileType == "image/gif") {
            if ($fileSize > $this->maxSize) {
                $errors[] = "GIF文件超过5MB，无法上传！";
            } else {
                $imgpath = $this->upload_image($filepath, $fileType, $file);
            }
        } else {
            if ($fileSize > $this->maxSize) {
                $compressedImage = $this->compress_image($_FILES["file"]);
                if (!$compressedImage) {
                    $errors[] = "图片压缩失败！";
                }
                $fileType = $compressedImage['type'];
                $fileSize = $compressedImage['size'];
                $filepath = $compressedImage['tmp_name'];
            }
            $imgpath = $this->upload_image($filepath, $fileType, $file);
        }

        if (isset($imgpath) && $imgpath) {
            $image_host = 'https://' . $this->domains[array_rand($this->domains)];
            $this->outputSuccess("上传成功", $image_host . $imgpath);
        } elseif (!in_array("GIF文件超过5MB，无法上传！", $errors)) {
            $errors[] = "Telegraph不支持该格式";
        }

        if (!empty($errors)) {
            $this->outputError(implode(' ', $errors));
        }
    }

    private function compress_image($image)
    {
        if ($image['size'] <= $this->maxSize) {
            return $image;
        }

        $temp_file = tempnam(sys_get_temp_dir(), 'image');
        if (!$temp_file) {
            return false;
        }
        imagejpeg(imagecreatefromstring(file_get_contents($image['tmp_name'])), $temp_file, 80);
        $compressed_size = filesize($temp_file);

        if ($compressed_size <= $this->maxSize) {
            return [
                'name' => $image['name'],
                'type' => 'image/jpeg',
                'tmp_name' => $temp_file,
                'error' => 0,
                'size' => $compressed_size
            ];
        } else {
            unlink($temp_file);
            return false;
        }
    }

    private function outputResult($result)
    {
        header("Content-type: application/json");
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
    }

    private function outputError($msg)
    {
        $this->outputResult(["code" => 201, "msg" => $msg]);
    }

    private function outputSuccess($msg, $url)
    {
        $this->outputResult(["code" => 200, "msg" => $msg, "url" => $url]);
    }

    private function upload_image($filepath, $fileType, $fileName)
    {
        $data = [
            'file' => curl_file_create($filepath, $fileType, $fileName)
        ];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://telegra.ph/upload');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        $json = json_decode($response, true);
        if ($json && isset($json[0]['src'])) {
            return $json[0]['src'];
        } else {
            return false;
        }
    }
}

$uploader = new ImageUploader();
$uploader->upload();
