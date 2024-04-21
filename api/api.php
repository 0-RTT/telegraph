<?php

class ImageUploader {
    private const ALLOWED_TYPES = ["image/gif", "image/jpeg", "image/jpg", "image/pjpeg", "image/x-png", "image/png"];
    private const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    private const DOMAINS = ['你的反代域名'];
    private const UPLOAD_URL = 'https://telegra.ph/upload';

    public function upload(): void {
        try {
            $file = $this->validateFile($_FILES['file'] ?? null);
            $file = $this->checkSizeAndCompress($file);
            $imgPath = $this->uploadToServer($file);
            if (!$imgPath) {
                throw new Exception("请确保图片分辨率≤25M！");
            }
            $imageHost = 'https://' . self::DOMAINS[array_rand(self::DOMAINS)];
            $this->outputSuccess("上传成功", $imageHost . $imgPath);
        } catch (Exception $e) {
            $this->outputError($e->getMessage());
        }
    }

    private function validateFile($file): array {
        if (!$file) {
            throw new Exception("没有上传文件！");
        }
        if (!in_array($file['type'], self::ALLOWED_TYPES)) {
            throw new Exception("只允许上传gif、jpeg、jpg、png格式的图片文件！");
        }
        return $file;
    }

    private function checkSizeAndCompress(array $file): array {
        if ($file['size'] > self::MAX_SIZE) {
            if ($file['type'] === 'image/gif') {
                throw new Exception("GIF文件超过5MB，无法上传！");
            }
            return $this->compressImage($file);
        }
        return $file;
    }

    private function compressImage(array $image): array {
        $sourceImage = imagecreatefromstring(file_get_contents($image['tmp_name']));
        if ($sourceImage === false) {
            throw new Exception("图片加载失败！");
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'img');
        imagejpeg($sourceImage, $tempFile, 75);
        imagedestroy($sourceImage);

        $compressedSize = filesize($tempFile);
        if ($compressedSize > self::MAX_SIZE) {
            unlink($tempFile);
            throw new Exception("图片压缩失败或压缩后仍超过最大限制！");
        }

        return ['name' => $image['name'], 'type' => 'image/jpeg', 'tmp_name' => $tempFile, 'error' => 0, 'size' => $compressedSize];
    }

    private function uploadToServer(array $file): ?string {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, self::UPLOAD_URL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, ['file' => new CURLFile($file['tmp_name'], $file['type'], $file['name'])]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
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

?>
