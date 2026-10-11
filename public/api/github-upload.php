<?php
// Proxy PHP para upload no GitHub Releases sem restrições de CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
    echo json_encode(['success' => false, 'error' => 'Nenhum arquivo enviado']);
    exit;
}

$token = trim($_POST['token'] ?? '');
$owner = trim($_POST['owner'] ?? '');
$repo = trim($_POST['repo'] ?? '');
$tag = trim($_POST['tag'] ?? 'v1.0');

if (empty($token) || empty($owner) || empty($repo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Credenciais do GitHub incompletas']);
    exit;
}

$file = $_FILES['file'];
$fileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $file['name']);
$fileTmp = $file['tmp_name'];
$fileSize = $file['size'];

$headers = [
    'User-Agent: ALX-Storage-Uploader',
    'Authorization: Bearer ' . $token,
    'Accept: application/vnd.github+json',
    'X-GitHub-Api-Version: 2022-11-28'
];

// 1. Obtém a release pela tag
$ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases/tags/{$tag}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$releaseId = null;
if ($httpCode === 200) {
    $relData = json_decode($response, true);
    $releaseId = $relData['id'] ?? null;
}

// Se não encontrou pela tag, procura em todas as releases
if (!$releaseId) {
    $ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $allRels = curl_exec($ch);
    curl_close($ch);
    $rels = json_decode($allRels, true);
    if (is_array($rels) && count($rels) > 0) {
        $releaseId = $rels[0]['id'] ?? null;
    }
}

// Se ainda não tem release, cria uma nova
if (!$releaseId) {
    $ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'tag_name' => $tag,
        'name' => "Releases & APKs ({$tag})",
        'draft' => false,
        'prerelease' => false
    ]));
    $createHeaders = array_merge($headers, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $createHeaders);
    $createRes = curl_exec($ch);
    $createCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($createCode === 200 || $createCode === 201) {
        $created = json_decode($createRes, true);
        $releaseId = $created['id'] ?? null;
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Falha ao criar release no GitHub']);
        exit;
    }
}

// 2. Remove asset duplicado se já existir nessa release
$ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases/{$releaseId}/assets");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$assetsRes = curl_exec($ch);
curl_close($ch);
$assets = json_decode($assetsRes, true);
if (is_array($assets)) {
    foreach ($assets as $asset) {
        if (strtolower($asset['name']) === strtolower($fileName)) {
            $delCh = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases/assets/{$asset['id']}");
            curl_setopt($delCh, CURLOPT_CUSTOMREQUEST, 'DELETE');
            curl_setopt($delCh, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($delCh, CURLOPT_RETURNTRANSFER, true);
            curl_exec($delCh);
            curl_close($delCh);
            break;
        }
    }
}

// 3. Envia o arquivo para uploads.github.com
$uploadUrl = "https://uploads.github.com/repos/{$owner}/{$repo}/releases/{$releaseId}/assets?name=" . rawurlencode($fileName);
$fileData = file_get_contents($fileTmp);

$uploadHeaders = [
    'User-Agent: ALX-Storage-Uploader',
    'Authorization: Bearer ' . $token,
    'Accept: application/vnd.github+json',
    'Content-Type: application/octet-stream',
    'X-GitHub-Api-Version: 2022-11-28'
];

$upCh = curl_init($uploadUrl);
curl_setopt($upCh, CURLOPT_POST, true);
curl_setopt($upCh, CURLOPT_POSTFIELDS, $fileData);
curl_setopt($upCh, CURLOPT_HTTPHEADER, $uploadHeaders);
curl_setopt($upCh, CURLOPT_RETURNTRANSFER, true);
$upRes = curl_exec($upCh);
$upCode = curl_getinfo($upCh, CURLINFO_HTTP_CODE);
curl_close($upCh);

if ($upCode >= 200 && $upCode < 300) {
    $assetData = json_decode($upRes, true);

    // Preserva cópia local APENAS para imagens leves (< 15MB) para visualização instantânea nos cards
    // Arquivos pesados (vídeos de 200MB-300MB, APKs, etc.) NÃO são copiados para o disco do servidor
    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $lightweightImageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico'];
    $fileSize = filesize($fileTmp);
    $localUrl = '';
    if (in_array($ext, $lightweightImageExts) && $fileSize < 15 * 1024 * 1024) {
        $uploadsDir = realpath(__DIR__ . '/../uploads') ?: (__DIR__ . '/../uploads');
        if (!is_dir($uploadsDir)) {
            @mkdir($uploadsDir, 0755, true);
        }
        $destPath = $uploadsDir . '/' . $fileName;
        $cachePath = $uploadsDir . '/gh_cache_' . $fileName;
        @copy($fileTmp, $destPath);
        @copy($fileTmp, $cachePath);
        $localUrl = '/uploads/' . $fileName;
    }

    $downloadUrl = $assetData['browser_download_url'] ?? '';
    $previewUrl = $localUrl ?: ('/api/media-proxy.php?url=' . urlencode($downloadUrl));

    echo json_encode([
        'success' => true,
        'downloadUrl' => $downloadUrl,
        'previewUrl' => $previewUrl,
        'localUrl' => $localUrl,
        'assetId' => $assetData['id'] ?? null,
        'fileName' => $assetData['name'] ?? $fileName,
        'fileSize' => $assetData['size'] ?? $fileSize,
        'releaseTag' => $tag
    ]);
} else {
    $errData = json_decode($upRes, true);
    http_response_code($upCode ?: 400);
    echo json_encode([
        'success' => false,
        'error' => $errData['message'] ?? 'Erro no upload para o GitHub Releases'
    ]);
}
