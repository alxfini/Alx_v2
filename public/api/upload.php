<?php
// API para upload e compactação automática de imagens em formato web sem perda de qualidade (Hostinger)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Nenhum arquivo enviado ou erro no upload']);
    exit;
}

$file = $_FILES['file'];
$compressAsJpg = isset($_POST['compressAsJpg']) && $_POST['compressAsJpg'] === 'true';

$allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska'
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$isVideo = strpos($mime, 'video/') === 0;

$uploadDir = dirname(__DIR__) . '/uploads/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
    @chmod($uploadDir, 0777);
}

$uploadHtaccess = $uploadDir . '.htaccess';
if (!file_exists($uploadHtaccess)) {
    @file_put_contents($uploadHtaccess, "Options -Indexes\n<FilesMatch \"\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|mov|mkv)$\">\nOrder Allow,Deny\nAllow from all\n</FilesMatch>\n");
}

$originalName = $file['name'];
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

$safeName = 'media_' . time() . '_' . bin2hex(random_bytes(4));
$targetPath = '';
$finalExt = $ext;

if ($isVideo) {
    if (!$finalExt || strlen($finalExt) > 5) {
        $finalExt = 'mp4';
    }
    $safeName .= '.' . $finalExt;
    $targetPath = $uploadDir . $safeName;
    $success = move_uploaded_file($file['tmp_name'], $targetPath);
} else {
    // Se for SVG, GIF ou ICO, manter formato original sem reprocessar canvas GD
    $isVectorOrSpecial = in_array($mime, ['image/svg+xml', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon']) || in_array($ext, ['svg', 'gif', 'ico']);

    if ($isVectorOrSpecial || !extension_loaded('gd')) {
        if (!$finalExt || strlen($finalExt) > 5) {
            $finalExt = 'png';
        }
        $safeName .= '.' . $finalExt;
        $targetPath = $uploadDir . $safeName;
        $success = move_uploaded_file($file['tmp_name'], $targetPath);
    } else {
        // Processamento de compressão web sem perda de qualidade (converte para JPG se compressAsJpg for true, senão WebP)
        $finalExt = $compressAsJpg ? 'jpg' : 'webp';
        $safeName .= '.' . $finalExt;
        $targetPath = $uploadDir . $safeName;

        $image = null;
        if ($mime === 'image/jpeg' || $ext === 'jpg' || $ext === 'jpeg') {
            $image = @imagecreatefromjpeg($file['tmp_name']);
        } elseif ($mime === 'image/png' || $ext === 'png') {
            $image = @imagecreatefrompng($file['tmp_name']);
        } elseif ($mime === 'image/webp' || $ext === 'webp') {
            $image = @imagecreatefromwebp($file['tmp_name']);
        }

        if ($image) {
            $width = imagesx($image);
            $height = imagesy($image);
            
            // Redimensionamento inteligente se ultrapassar 1920px mantendo proporção
            $maxWidth = 1920;
            $maxHeight = 1920;
            if ($width > $maxWidth || $height > $maxHeight) {
                $ratio = min($maxWidth / $width, $maxHeight / $height);
                $newWidth = (int)($width * $ratio);
                $newHeight = (int)($height * $ratio);
                
                $newImage = imagecreatetruecolor($newWidth, $newHeight);
                if (!$compressAsJpg) {
                    imagealphablending($newImage, false);
                    imagesavealpha($newImage, true);
                    $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
                    imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
                } else {
                    $white = imagecolorallocate($newImage, 255, 255, 255);
                    imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $white);
                }
                
                imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                imagedestroy($image);
                $image = $newImage;
            }

            if ($compressAsJpg) {
                // Se for JPG, garantir fundo branco caso tivesse alpha
                if ($mime === 'image/png' || $mime === 'image/webp') {
                    $widthCurrent = imagesx($image);
                    $heightCurrent = imagesy($image);
                    $trueBg = imagecreatetruecolor($widthCurrent, $heightCurrent);
                    $whiteBg = imagecolorallocate($trueBg, 255, 255, 255);
                    imagefilledrectangle($trueBg, 0, 0, $widthCurrent, $heightCurrent, $whiteBg);
                    imagecopy($trueBg, $image, 0, 0, 0, 0, $widthCurrent, $heightCurrent);
                    imagedestroy($image);
                    $image = $trueBg;
                }
                $success = imagejpeg($image, $targetPath, 88);
            } else {
                $success = imagewebp($image, $targetPath, 88);
            }
            imagedestroy($image);

            if (!$success) {
                $finalExt = $ext ?: ($compressAsJpg ? 'jpg' : 'png');
                $safeName = 'media_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $finalExt;
                $targetPath = $uploadDir . $safeName;
                $success = move_uploaded_file($file['tmp_name'], $targetPath);
            }
        } else {
            $finalExt = $ext ?: ($compressAsJpg ? 'jpg' : 'png');
            $safeName .= '.' . $finalExt;
            $targetPath = $uploadDir . $safeName;
            $success = move_uploaded_file($file['tmp_name'], $targetPath);
        }
    }
}

if ($success) {
    echo json_encode([
        'success' => true,
        'url' => '/uploads/' . $safeName,
        'filename' => $safeName
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Falha ao compactar e gravar arquivo na pasta uploads']);
}
?>
