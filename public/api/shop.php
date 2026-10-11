<?php
/**
 * API Proxy de Produtos WooCommerce da ALX Shop
 * Permite buscar os produtos e preços atualizados sem restrições de CORS no navegador
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$cacheFile = __DIR__ . '/shop-cache.json';
$cacheTime = 60; // 60 segundos de cache
$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

// Verifica se existe cache recente válido
if (!$forceRefresh && file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
    $cached = @file_get_contents($cacheFile);
    if ($cached) {
        $json = @json_decode($cached, true);
        if (is_array($json) && count($json) > 0) {
            echo $cached;
            exit;
        }
    }
}

$targetUrl = 'https://alxshop.7f.com.br/wp-json/wc/store/v1/products?per_page=100';
$response = false;

// 1. Tentar via cURL
if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'ALXGaragePlatform/1.0');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        $response = false;
    }
}

// 2. Fallback via file_get_contents se cURL falhar
if ($response === false && ini_get('allow_url_fopen')) {
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 10,
            'header' => "Accept: application/json\r\nUser-Agent: ALXGaragePlatform/1.0\r\n"
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ]
    ]);
    $response = @file_get_contents($targetUrl, false, $ctx);
}

if ($response !== false) {
    $decoded = @json_decode($response, true);
    if (is_array($decoded) && count($decoded) > 0) {
        @file_put_contents($cacheFile, $response);
        echo $response;
        exit;
    }
}

// 3. Fallback se a loja remota estiver temporariamente inacessível:
// Retorna cache anterior se existir
if (file_exists($cacheFile)) {
    $cached = @file_get_contents($cacheFile);
    if ($cached) {
        echo $cached;
        exit;
    }
}

// 4. Último fallback: tenta ler produtos de site-data.json
$siteDataFile = dirname(__DIR__) . '/site-data.json';
if (file_exists($siteDataFile)) {
    $raw = @file_get_contents($siteDataFile);
    if ($raw) {
        $data = @json_decode($raw, true);
        if (!empty($data['products']) && is_array($data['products'])) {
            echo json_encode($data['products'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }
}

http_response_code(502);
echo json_encode(['error' => 'Não foi possível carregar produtos da loja no momento']);
