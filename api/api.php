<?php

class ImageUploader
{
    private $allowedTypes = ["image/gif", "image/jpeg", "image/jpg", "image/pjpeg", "image/x-png", "image/png"];
    private $maxSize = 5 * 1024 * 1024;
    private $domains = ['img.selipoi.top','picture.atago.moe'];

    public function upload()
    {
        if (!isset($_FILES["file"])) {
            $this->outputResult(["code" => 201, "msg" => "没有上传文件！"]);
            exit;
        }

        $file = $_FILES["file"]["name"];
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        $fileType = $_FILES["file"]["type"];
        if (!in_array($fileType, $this->allowedTypes)) {
            $this->outputResult(["code" => 201, "msg" => "只允许上传gif、jpeg、jpg、png格式的图片文件！"]);
            exit;
        }

        $fileSize = $_FILES["file"]["size"];
        if ($fileSize > $this->maxSize) {
            $compressedImage = $this->compress_image($_FILES["file"]);
            if (!$compressedImage) {
                $this->outputResult(["code" => 201, "msg" => "图片压缩失败！"]);
                exit;
            }
            $fileType = $compressedImage['type'];
            $fileSize = $compressedImage['size'];
            $filepath = $compressedImage['tmp_name'];
        } else {
            $filepath = $_FILES["file"]["tmp_name"];
        }

        $imgpath = $this->upload_image($filepath, $fileType, $file);
        if ($imgpath) {
            $image_host = 'https://'. $this->domains[array_rand($this->domains)];
            $this->outputResult(["code" => 200, "msg" => "上传成功", "url" => $image_host . $imgpath]);
        } else {
            $this->outputResult(["code" => 201, "msg" => "图片上传失败！请检查接口可用性！"]);
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
        echo json_encode($result, true);
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
