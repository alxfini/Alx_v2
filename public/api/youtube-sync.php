<?php
/**
 * API Proxy de Sincronização do Canal YouTube
 * Busca diretamente os vídeos oficiais via RSS do YouTube sem bloqueio de CORS no navegador
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$channelInput = isset($_GET['channelInput']) ? trim($_GET['channelInput']) : '';
if (!$channelInput && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $jsonData = @json_decode($rawInput, true);
    if (isset($jsonData['channelInput'])) {
        $channelInput = trim($jsonData['channelInput']);
    }
}

if (!$channelInput) {
    $channelInput = 'UCa7fjaKfkkwk1OdzinQNStA';
}

$channelId = '';

// 1. Se já for formato UC...
if (preg_match('/^UC[a-zA-Z0-9_-]{22}$/', $channelInput)) {
    $channelId = $channelInput;
} else if (preg_match('/(?:channel\/|channel_id=)(UC[a-zA-Z0-9_-]{22})/', $channelInput, $matches)) {
    $channelId = $matches[1];
}

$lowerInput = strtolower($channelInput);
if (!$channelId && (strpos($lowerInput, 'alx-garage') !== false || strpos($lowerInput, 'alx_garage') !== false)) {
    $channelId = 'UCa7fjaKfkkwk1OdzinQNStA';
}

// 2. Se for @handle ou URL, tenta extrair
if (!$channelId) {
    $cleanHandle = preg_replace('/^.*youtube\.com\/@?/', '', $channelInput);
    $cleanHandle = preg_replace('/^@/', '', $cleanHandle);
    $parts = explode('/', $cleanHandle);
    $cleanHandle = trim($parts[0]);

    if ($cleanHandle) {
        $handleUrl = 'https://www.youtube.com/@' . $cleanHandle;
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\nAccept-Language: pt-BR,pt;q=0.9\r\n",
                'timeout' => 8,
            ]
        ]);
        $html = @file_get_contents($handleUrl, false, $context);
        if ($html && preg_match('/(?:channel_id=|\/channel\/|"channelId":")(UC[a-zA-Z0-9_-]{22})/', $html, $m)) {
            $channelId = $m[1];
        }
    }
}

if (!$channelId) {
    $channelId = 'UCa7fjaKfkkwk1OdzinQNStA';
}

// 3. Busca o feed RSS oficial
$rssUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=' . $channelId;
$rssContext = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n",
        'timeout' => 10,
    ]
]);

$xmlText = @file_get_contents($rssUrl, false, $rssContext);

if (!$xmlText && function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $rssUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    $xmlText = curl_exec($ch);
    curl_close($ch);
}

if (!$xmlText) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => 'Não foi possível conectar aos servidores do YouTube no momento.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. Parse do XML com Regex seguro
$channelTitle = 'ALX Garage';
if (preg_match('/<author>\s*<name>(.*?)<\/name>/s', $xmlText, $cm)) {
    $channelTitle = trim(strip_tags($cm[1]));
}

$entries = explode('<entry>', $xmlText);
$videos = [];

function autoCategorizeVideoPhp($title) {
    $lower = mb_strtolower($title, 'UTF-8');
    if (strpos($lower, 'ota') !== false || strpos($lower, 'firmware') !== false || strpos($lower, 'atualiza') !== false) {
        return 'Atualizações & OTA';
    }
    if (strpos($lower, 'tutorial') !== false || strpos($lower, 'passo a passo') !== false || strpos($lower, 'desbloque') !== false) {
        return 'Tutoriais';
    }
    if (strpos($lower, 'review') !== false || strpos($lower, 'teste') !== false || strpos($lower, 'análise') !== false) {
        return 'Análise & Teste';
    }
    return 'Multimídia & Som';
}

function formatDatePhp($dateStr) {
    if (!$dateStr) return 'Recente';
    $time = strtotime($dateStr);
    if (!$time) return 'Recente';
    $meses = [
        1 => 'janeiro', 2 => 'fevereiro', 3 => 'março', 4 => 'abril',
        5 => 'maio', 6 => 'junho', 7 => 'julho', 8 => 'agosto',
        9 => 'setembro', 10 => 'outubro', 11 => 'novembro', 12 => 'dezembro'
    ];
    $dia = date('d', $time);
    $mesNum = (int)date('m', $time);
    $ano = date('Y', $time);
    $mes = isset($meses[$mesNum]) ? $meses[$mesNum] : date('F', $time);
    return "$dia de $mes de $ano";
}

for ($i = 1; $i < count($entries); $i++) {
    $entry = $entries[$i];
    $vidId = '';
    if (preg_match('/<yt:videoId>(.*?)<\/yt:videoId>/', $entry, $vm)) {
        $vidId = trim($vm[1]);
    }
    if (!$vidId) continue;

    $title = '';
    if (preg_match('/<title>(.*?)<\/title>/', $entry, $tm)) {
        $title = html_entity_decode(trim($tm[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    $description = '';
    if (preg_match('/<media:description>(.*?)<\/media:description>/s', $entry, $dm)) {
        $description = mb_substr(trim(strip_tags($dm[1])), 0, 280, 'UTF-8');
    }

    $published = '';
    if (preg_match('/<published>(.*?)<\/published>/', $entry, $pm)) {
        $published = trim($pm[1]);
    }

    $videos[] = [
        'id' => 'yt-rss-' . $vidId,
        'youtubeId' => $vidId,
        'title' => $title ?: "Vídeo $vidId",
        'description' => $description ?: 'Assista ao vídeo no canal oficial ALX Garage.',
        'date' => formatDatePhp($published),
        'duration' => 'YouTube',
        'views' => 'Canal Oficial',
        'isFeatured' => count($videos) === 0,
        'videoUrl' => "https://www.youtube.com/watch?v=$vidId",
        'thumbnailUrl' => "https://img.youtube.com/vi/$vidId/hqdefault.jpg",
        'category' => autoCategorizeVideoPhp($title)
    ];
}

echo json_encode([
    'success' => true,
    'count' => count($videos),
    'videos' => $videos,
    'channelId' => $channelId,
    'channelTitle' => $channelTitle
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
