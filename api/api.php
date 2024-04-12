<?php

class ImageUploader {
    private array $allowedTypes = ["image/gif", "image/jpeg", "image/jpg", "image/pjpeg", "image/x-png", "image/png"];
    private int $maxSize = 5 * 1024 * 1024; // 5MB
    private array $domains = ['img.selipoi.top', 'picture.atago.moe'];

    public function upload(): void {
        $file = $_FILES["file"] ?? null;

        if (!$file) {
            $this->outputError("没有上传文件！");
            return;
        }

        if (!in_array($file["type"], $this->allowedTypes)) {
            $this->outputError("只允许上传gif、jpeg、jpg、png格式的图片文件！");
            return;
        }

        if ($file["size"] > $this->maxSize) {
            if ($file["type"] === "image/gif") {
                $this->outputError("GIF文件超过5MB，无法上传！");
                return;
            }

            $file = $this->compressImage($file);
            if ($file === null) {
                $this->outputError("图片压缩失败或压缩后仍超过最大限制！");
                return;
            }
        }

        $imgPath = $this->uploadImage($file);
        if ($imgPath) {
            $imageHost = 'https://' . $this->domains[array_rand($this->domains)];
            $this->outputSuccess("上传成功", $imageHost . $imgPath);
        } else {
            $this->outputError("请确保图片分辨率≤25M！");
        }
    }

    private function compressImage(array $image): ?array {
        $sourceImage = imagecreatefromstring(file_get_contents($image['tmp_name']));
        if ($sourceImage === false) {
            return null;
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'img');
        imagejpeg($sourceImage, $tempFile, 75);
        imagedestroy($sourceImage);

        $compressedSize = filesize($tempFile);
        if ($compressedSize > $this->maxSize) {
            unlink($tempFile);
            return null;
        }

        return [
            'name' => $image['name'],
            'type' => 'image/jpeg',
            'tmp_name' => $tempFile,
            'error' => 0,
            'size' => $compressedSize
        ];
    }

    private function uploadImage(array $file): ?string {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://telegra.ph/upload');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, ['file' => new CURLFile($file['tmp_name'], $file['type'], $file['name'])]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);

        $response = curl_exec($ch);
        if ($response === false) {
            return null;
        }

        curl_close($ch);

        $json = json_decode($response, true);
        if ($json === null || !isset($json[0]['src'])) {
            return null;
        }

        return $json[0]['src'];
    }

    private function outputResult(array $result): void {
        header("Content-type: application/json");
        echo json_encode($result);
        exit;
    }

    private function outputError(string $msg): void {
        $this->outputResult(["status" => "error", "message" => $msg]);
    }

    private function outputSuccess(string $msg, string $url): void {
        $this->outputResult(["status" => "success", "message" => $msg, "url" => $url]);
    }
}

$uploader = new ImageUploader();
$uploader->upload();
