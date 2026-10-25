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
    // Se a conexão externa com o feed do YouTube falhar no servidor compartilhado, entrega o catálogo oficial
    $defaultVideos = [
        [
            'id' => 'yt-sync-yDLGKTBfvkk',
            'youtubeId' => 'yDLGKTBfvkk',
            'title' => '⚡ BYD TAN e HAN Atualizados! Desbloqueio e Novidades | Alx Garagem',
            'description' => 'Desbloqueio e novidades completas para BYD TAN e HAN na central multimídia original.',
            'date' => 'Recente',
            'duration' => '6:28',
            'views' => 'Canal Oficial',
            'isFeatured' => true,
            'videoUrl' => 'https://www.youtube.com/watch?v=yDLGKTBfvkk',
            'thumbnailUrl' => 'https://img.youtube.com/vi/yDLGKTBfvkk/hqdefault.jpg',
            'category' => 'Atualizações & OTA'
        ],
        [
            'id' => 'yt-sync-hkpyzW9s-pQ',
            'youtubeId' => 'hkpyzW9s-pQ',
            'title' => 'Transforme Seu BYD em um Carro Inteligente! Conheça o SentryEV 🚗📱',
            'description' => 'Aplicativo de monitoramento SentryEV em tempo real para veículos elétricos.',
            'date' => 'Recente',
            'duration' => '24:43',
            'views' => '14 mil visualizações',
            'isFeatured' => false,
            'videoUrl' => 'https://www.youtube.com/watch?v=hkpyzW9s-pQ',
            'thumbnailUrl' => 'https://img.youtube.com/vi/hkpyzW9s-pQ/hqdefault.jpg',
            'category' => 'Multimídia & Som'
        ],
        [
            'id' => 'yt-sync-rbV2xdSIY4M',
            'youtubeId' => 'rbV2xdSIY4M',
            'title' => 'YouTube + TV Digital em Qualquer Carro! 😱 Sem Desbloqueio | 2026',
            'description' => 'Como ter streaming, YouTube e TV Digital na multimídia sem violar garantia.',
            'date' => 'Recente',
            'duration' => '25:32',
            'views' => '8.5 mil visualizações',
            'isFeatured' => false,
            'videoUrl' => 'https://www.youtube.com/watch?v=rbV2xdSIY4M',
            'thumbnailUrl' => 'https://img.youtube.com/vi/rbV2xdSIY4M/hqdefault.jpg',
            'category' => 'Tutoriais'
        ],
        [
            'id' => 'yt-sync-OR1bUMaQ3cU',
            'youtubeId' => 'OR1bUMaQ3cU',
            'title' => 'Youtube perfeito para Multimidias',
            'description' => 'Versão otimizada sem anúncios e com reprodução em segundo plano para multimídias.',
            'date' => 'Recente',
            'duration' => '12:15',
            'views' => '4 mil visualizações',
            'isFeatured' => false,
            'videoUrl' => 'https://www.youtube.com/watch?v=OR1bUMaQ3cU',
            'thumbnailUrl' => 'https://img.youtube.com/vi/OR1bUMaQ3cU/hqdefault.jpg',
            'category' => 'Multimídia & Som'
        ],
        [
            'id' => 'yt-sync-AERBcFtpJz8',
            'youtubeId' => 'AERBcFtpJz8',
            'title' => '🔐 Desbloqueio Denza B5 BYD - 2 Telas em movimento!',
            'description' => 'Liberte todo o potencial do seu BYD Denza com 2 telas ativas em movimento.',
            'date' => 'Recente',
            'duration' => '14:20',
            'views' => 'Canal Oficial',
            'isFeatured' => false,
            'videoUrl' => 'https://www.youtube.com/watch?v=AERBcFtpJz8',
            'thumbnailUrl' => 'https://img.youtube.com/vi/AERBcFtpJz8/hqdefault.jpg',
            'category' => 'Tutoriais'
        ],
        [
            'id' => 'yt-sync-RK3aLAMFf84',
            'youtubeId' => 'RK3aLAMFf84',
            'title' => '🔓 NOVO DESBLOQUEIO BYD | Funciona em Todas as Versões',
            'description' => 'Novo método recomendado de desbloqueio para multimídias BYD.',
            'date' => 'Recente',
            'duration' => '18:50',
            'views' => '89 mil visualizações',
            'isFeatured' => false,
            'videoUrl' => 'https://www.youtube.com/watch?v=RK3aLAMFf84',
            'thumbnailUrl' => 'https://img.youtube.com/vi/RK3aLAMFf84/hqdefault.jpg',
            'category' => 'Tutoriais'
        ],
        [
            'id' => 'yt-sync-EDZ6lEtqIOg',
            'youtubeId' => 'EDZ6lEtqIOg',
            'title' => '⚡Atualização OTA Multimídia BYD Versão 2606',
            'description' => 'Atualização OTA BYD 2606 V32 Global e Internacional passo a passo.',
            'date' => 'Recente',
            'duration' => '11:40',
            'views' => '15 mil visualizações',
            'isFeatured' => false,
            'videoUrl' => 'https://www.youtube.com/watch?v=EDZ6lEtqIOg',
            'thumbnailUrl' => 'https://img.youtube.com/vi/EDZ6lEtqIOg/hqdefault.jpg',
            'category' => 'Atualizações & OTA'
        ]
    ];

    echo json_encode([
        'success' => true,
        'count' => count($defaultVideos),
        'videos' => $defaultVideos,
        'channelId' => 'UCa7fjaKfkkwk1OdzinQNStA',
        'channelTitle' => 'Alx Garage'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
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
