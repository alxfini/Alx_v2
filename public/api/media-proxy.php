<?php
// Proxy de Mídia em PHP: Permite carregar imagens, wallpapers e vídeos de Releases do GitHub diretamente nos cards
// Remove 'attachment' e define 'Content-Disposition: inline' e CORS aberto
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$targetUrl = trim($_GET['url'] ?? '');
if (empty($targetUrl)) {
    http_response_code(400);
    echo 'URL de mídia não fornecida.';
    exit;
}

$parsedPath = parse_url($targetUrl, PHP_URL_PATH);
$fileName = basename($parsedPath ?: '');
$cleanFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', urldecode($fileName));
$ext = strtolower(pathinfo($cleanFileName, PATHINFO_EXTENSION));

$mimeTypes = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'gif'  => 'image/gif',
    'svg'  => 'image/svg+xml',
    'ico'  => 'image/x-icon',
    'mp4'  => 'video/mp4',
    'webm' => 'video/webm',
    'mov'  => 'video/quicktime'
];
$mimeType = $mimeTypes[$ext] ?? 'image/jpeg';

$uploadsDir = realpath(__DIR__ . '/../uploads') ?: (__DIR__ . '/../uploads');
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}

// 1. Verifica se já existe em cache local no servidor
if (!empty($cleanFileName)) {
    $candidatePaths = [
        $uploadsDir . '/' . $cleanFileName,
        $uploadsDir . '/gh_cache_' . $cleanFileName,
        $uploadsDir . '/' . $fileName
    ];

    foreach ($candidatePaths as $cp) {
        if (file_exists($cp) && filesize($cp) > 0) {
            header('Content-Type: ' . $mimeType);
            header('Content-Disposition: inline; filename="' . $cleanFileName . '"');
            header('Cache-Control: public, max-age=604800, immutable');
            readfile($cp);
            exit;
        }
    }
}

// 2. Tenta recuperar credenciais do GitHub (via GET ou site-data.json)
$token = trim($_GET['token'] ?? '');
$owner = trim($_GET['owner'] ?? '');
$repo = trim($_GET['repo'] ?? '');

if (empty($token)) {
    $siteDataFile = __DIR__ . '/site-data.json';
    if (file_exists($siteDataFile)) {
        $json = json_decode(file_get_contents($siteDataFile), true);
        if (isset($json['brand']['githubStorage']['token'])) {
            $token = trim($json['brand']['githubStorage']['token']);
            if (empty($owner)) $owner = trim($json['brand']['githubStorage']['owner'] ?? '');
            if (empty($repo)) $repo = trim($json['brand']['githubStorage']['repo'] ?? '');
        }
    }
}

// 3. Se for URL do GitHub Releases, consulta via REST API (suporta repositórios públicos e privados)
if (preg_match('/github\.com\/([^\/]+)\/([^\/]+)\/releases\/download\/([^\/]+)\/(.+)$/', $targetUrl, $matches)) {
    if (empty($owner)) $owner = $matches[1];
    if (empty($repo)) $repo = $matches[2];
    $tag = $matches[3];
    $rawFileName = urldecode($matches[4]);

    if (!empty($token) && !empty($owner) && !empty($repo)) {
        $ghHeaders = [
            'User-Agent: ALX-Media-Proxy/1.0',
            'Authorization: Bearer ' . $token,
            'Accept: application/vnd.github+json'
        ];

        $ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases/tags/{$tag}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $ghHeaders);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $relRes = curl_exec($ch);
        curl_close($ch);

        $relData = json_decode($relRes, true);
        $assetId = null;
        if (is_array($relData) && isset($relData['assets'])) {
            foreach ($relData['assets'] as $asset) {
                if (strtolower($asset['name']) === strtolower($rawFileName) || strtolower($asset['name']) === strtolower($cleanFileName)) {
                    $assetId = $asset['id'];
                    break;
                }
            }
        }

        // Se não encontrou pela tag exata, busca na lista de todas as releases
        if (!$assetId) {
            $ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $ghHeaders);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $allRelsRes = curl_exec($ch);
            curl_close($ch);

            $allRelsData = json_decode($allRelsRes, true);
            if (is_array($allRelsData)) {
                foreach ($allRelsData as $r) {
                    if (isset($r['assets']) && is_array($r['assets'])) {
                        foreach ($r['assets'] as $asset) {
                            if (strtolower($asset['name']) === strtolower($rawFileName) || strtolower($asset['name']) === strtolower($cleanFileName)) {
                                $assetId = $asset['id'];
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        if ($assetId) {
            $upHeaders = [
                'User-Agent: ALX-Media-Proxy/1.0',
                'Authorization: Bearer ' . $token,
                'Accept: application/octet-stream'
            ];
            $ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases/assets/{$assetId}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $upHeaders);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $data = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300 && !empty($data)) {
                if (!empty($cleanFileName)) {
                    @file_put_contents($uploadsDir . '/gh_cache_' . $cleanFileName, $data);
                }
                header('Content-Type: ' . $mimeType);
                header('Content-Disposition: inline; filename="' . $cleanFileName . '"');
                header('Cache-Control: public, max-age=604800, immutable');
                echo $data;
                exit;
            }
        }
    }
}

// 4. Fallback: cURL direto
$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'ALX-Media-Proxy/1.0');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

if (!empty($token)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'User-Agent: ALX-Media-Proxy/1.0'
    ]);
}

$data = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300 && !empty($data)) {
    if (!empty($cleanFileName)) {
        @file_put_contents($uploadsDir . '/gh_cache_' . $cleanFileName, $data);
    }

    $finalMime = (!empty($contentType) && (strpos($contentType, 'image/') === 0 || strpos($contentType, 'video/') === 0))
        ? $contentType
        : $mimeType;

    header('Content-Type: ' . $finalMime);
    header('Content-Disposition: inline; filename="' . $cleanFileName . '"');
    header('Cache-Control: public, max-age=604800, immutable');
    echo $data;
    exit;
}

http_response_code($httpCode ?: 404);
echo 'Mídia não encontrada no GitHub Releases.';
