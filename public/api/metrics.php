<?php
// ALX Tech - API Oficial de Métricas e Analytics (MySQL Hostinger + Fallback JSON Seguro)
date_default_timezone_set('America/Sao_Paulo');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Cache-Control');
header('Cache-Control: no-cache, no-store, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$uploadsDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}
$analyticsFile = $uploadsDir . '/analytics.json';

function getEmptyAnalyticsStruct() {
    return [
        'totalPageViews' => 0,
        'totalDownloads' => 0,
        'sources'        => [],
        'devices'        => [],
        'countries'      => [],
        'pages'          => [],
        'downloads'      => [],
        'recentEvents'   => [],
        'dailyHistory'   => [],
        'lastUpdated'    => date('c'),
        'resetAt'        => null,
    ];
}

function normalizeAnalyticsStruct($data) {
    if (!is_array($data)) {
        return getEmptyAnalyticsStruct();
    }
    $def = getEmptyAnalyticsStruct();
    return [
        'totalPageViews' => isset($data['totalPageViews']) ? (int)$data['totalPageViews'] : 0,
        'totalDownloads' => isset($data['totalDownloads']) ? (int)$data['totalDownloads'] : 0,
        'sources'        => (isset($data['sources']) && is_array($data['sources'])) ? $data['sources'] : [],
        'devices'        => (isset($data['devices']) && is_array($data['devices'])) ? $data['devices'] : [],
        'countries'      => (isset($data['countries']) && is_array($data['countries'])) ? $data['countries'] : [],
        'pages'          => (isset($data['pages']) && is_array($data['pages'])) ? $data['pages'] : [],
        'downloads'      => (isset($data['downloads']) && is_array($data['downloads'])) ? $data['downloads'] : [],
        'recentEvents'   => (isset($data['recentEvents']) && is_array($data['recentEvents'])) ? array_values($data['recentEvents']) : [],
        'dailyHistory'   => (isset($data['dailyHistory']) && is_array($data['dailyHistory'])) ? $data['dailyHistory'] : [],
        'lastUpdated'    => $data['lastUpdated'] ?? date('c'),
        'resetAt'        => $data['resetAt'] ?? null,
    ];
}

function loadAnalyticsStore($analyticsFile) {
    // 1. Tenta carregar do Banco de Dados MySQL (Fonte Principal Permanente)
    $fromDb = loadAnalyticsFromDb();
    if (is_array($fromDb) && isset($fromDb['totalPageViews'])) {
        return normalizeAnalyticsStruct($fromDb);
    }

    // 2. Fallback: Arquivo em /uploads/analytics.json (preservado em deploys FTP)
    if (file_exists($analyticsFile)) {
        $raw = @file_get_contents($analyticsFile);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed) && isset($parsed['totalPageViews'])) {
                return normalizeAnalyticsStruct($parsed);
            }
        }
    }

    return getEmptyAnalyticsStruct();
}

function formatAnalyticsForJson($data) {
    $norm = normalizeAnalyticsStruct($data);
    return [
        'totalPageViews' => $norm['totalPageViews'],
        'totalDownloads' => $norm['totalDownloads'],
        'sources'        => (object)$norm['sources'],
        'devices'        => (object)$norm['devices'],
        'countries'      => (object)$norm['countries'],
        'pages'          => (object)$norm['pages'],
        'downloads'      => (object)$norm['downloads'],
        'recentEvents'   => array_values($norm['recentEvents']),
        'dailyHistory'   => (object)$norm['dailyHistory'],
        'lastUpdated'    => $norm['lastUpdated'],
        'resetAt'        => $norm['resetAt'],
    ];
}

function saveAnalyticsStore($data, $analyticsFile) {
    $data['lastUpdated'] = date('c');
    $formatted = formatAnalyticsForJson($data);

    // 1. Grava no Banco de Dados MySQL
    saveAnalyticsToDb($formatted);

    // 2. Grava espelho local em /uploads/analytics.json
    $jsonStr = json_encode($formatted, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($jsonStr) {
        @file_put_contents($analyticsFile, $jsonStr);
    }
    return $formatted;
}

function detectCountryPhp($bodyLang = '') {
    $headerCountry = $_SERVER['HTTP_CF_IPCOUNTRY']
        ?? $_SERVER['HTTP_X_COUNTRY_CODE']
        ?? $_SERVER['HTTP_X_APPENGINE_COUNTRY']
        ?? $_SERVER['GEOIP_COUNTRY_CODE']
        ?? '';

    if (!empty($headerCountry)) {
        $code = strtoupper(trim((string)$headerCountry));
        $map = [
            'BR' => 'Brasil 🇧🇷',
            'PT' => 'Portugal 🇵🇹',
            'US' => 'Estados Unidos 🇺🇸',
            'ES' => 'Espanha 🇪🇸',
            'AR' => 'Argentina 🇦🇷',
            'CL' => 'Chile 🇨🇱',
            'UY' => 'Uruguai 🇺🇾',
            'PY' => 'Paraguai 🇵🇾',
            'MX' => 'México 🇲🇽',
            'DE' => 'Alemanha 🇩🇪',
            'FR' => 'França 🇫🇷',
            'GB' => 'Reino Unido 🇬🇧',
            'IT' => 'Itália 🇮🇹',
            'CA' => 'Canadá 🇨🇦',
            'JP' => 'Japão 🇯🇵',
            'CN' => 'China 🇨🇳',
        ];
        if (isset($map[$code])) {
            return $map[$code];
        }
        if ($code !== 'XX' && $code !== 'T1') {
            return $code . ' 🌐';
        }
    }

    $lang = strtolower((string)($bodyLang ?: ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '')));
    if (strpos($lang, 'pt-br') !== false || strpos($lang, 'pt_br') !== false) return 'Brasil 🇧🇷';
    if (strpos($lang, 'pt-pt') !== false || strpos($lang, 'pt_pt') !== false) return 'Portugal 🇵🇹';
    if (strpos($lang, 'en-us') !== false || strpos($lang, 'en_us') !== false) return 'Estados Unidos 🇺🇸';
    if (strpos($lang, 'es') !== false) return 'Espanha / Latam 🇪🇸';
    if (strpos($lang, 'pt') !== false) return 'Brasil 🇧🇷';
    return 'Brasil 🇧🇷';
}

$rawInput = file_get_contents('php://input');
$body = [];
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $body = $decoded;
    }
}
if (empty($body) && !empty($_POST)) {
    $body = $_POST;
}

$action = $_GET['action'] ?? ($body['action'] ?? ($_SERVER['REQUEST_METHOD'] === 'POST' ? 'event' : 'stats'));

// AÇÃO 1: ZERAR ESTATÍSTICAS
if ($action === 'clear') {
    $empty = getEmptyAnalyticsStruct();
    $empty['resetAt'] = date('c');
    $saved = saveAnalyticsStore($empty, $analyticsFile);
    echo json_encode([
        'success' => true,
        'message' => 'Estatísticas resetadas com sucesso!',
        'stats'   => $saved
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// AÇÃO 2: REGISTRAR EVENTO (PAGEVIEW OU DOWNLOAD)
if ($action === 'event' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $type = $body['type'] ?? 'pageview';
    $source = !empty($body['source']) ? (string)$body['source'] : '🌐 Acesso Direto';
    $device = !empty($body['device']) ? (string)$body['device'] : '💻 Computador';
    $country = detectCountryPhp($body['language'] ?? '');
    $today = !empty($body['dateKey']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$body['dateKey'])
        ? (string)$body['dateKey']
        : date('Y-m-d');

    $data = loadAnalyticsStore($analyticsFile);

    if (!isset($data['dailyHistory'][$today]) || !is_array($data['dailyHistory'][$today])) {
        $data['dailyHistory'][$today] = ['pageViews' => 0, 'downloads' => 0];
    }

    $data['sources'][$source] = (isset($data['sources'][$source]) ? (int)$data['sources'][$source] : 0) + 1;
    $data['devices'][$device] = (isset($data['devices'][$device]) ? (int)$data['devices'][$device] : 0) + 1;
    $data['countries'][$country] = (isset($data['countries'][$country]) ? (int)$data['countries'][$country] : 0) + 1;

    $eventName = '';

    if ($type === 'download') {
        $data['totalDownloads'] = (int)$data['totalDownloads'] + 1;
        $data['dailyHistory'][$today]['downloads'] = (int)($data['dailyHistory'][$today]['downloads'] ?? 0) + 1;

        $itemId = !empty($body['itemId']) ? (string)$body['itemId'] : 'item-geral';
        $title = !empty($body['itemTitle']) ? (string)$body['itemTitle'] : 'Arquivo de Download';
        $category = !empty($body['itemCategory']) ? (string)$body['itemCategory'] : 'Geral';

        $currentCount = isset($data['downloads'][$itemId]['count']) ? (int)$data['downloads'][$itemId]['count'] : 0;
        $data['downloads'][$itemId] = [
            'title'            => $title,
            'category'         => $category,
            'count'            => $currentCount + 1,
            'lastDownloadedAt' => date('c'),
        ];

        $eventName = 'Download: ' . $title;
    } else {
        $data['totalPageViews'] = (int)$data['totalPageViews'] + 1;
        $data['dailyHistory'][$today]['pageViews'] = (int)($data['dailyHistory'][$today]['pageViews'] ?? 0) + 1;

        $path = !empty($body['path']) ? (string)$body['path'] : '/';
        $data['pages'][$path] = (isset($data['pages'][$path]) ? (int)$data['pages'][$path] : 0) + 1;

        $pageTitle = !empty($body['pageTitle']) ? (string)$body['pageTitle'] : $path;
        $eventName = 'Página: ' . $pageTitle;
    }

    array_unshift($data['recentEvents'], [
        'id'        => 'evt-' . round(microtime(true) * 1000) . '-' . mt_rand(100, 999),
        'type'      => $type,
        'name'      => $eventName,
        'source'    => $source,
        'country'   => $country,
        'device'    => $device,
        'timestamp' => date('c'),
    ]);

    if (count($data['recentEvents']) > 50) {
        $data['recentEvents'] = array_slice($data['recentEvents'], 0, 50);
    }

    $saved = saveAnalyticsStore($data, $analyticsFile);

    echo json_encode([
        'success'        => true,
        'totalPageViews' => $saved['totalPageViews'],
        'totalDownloads' => $saved['totalDownloads'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// AÇÃO 3: LER ESTATÍSTICAS (GET ?action=stats)
$data = loadAnalyticsStore($analyticsFile);
echo json_encode(formatAnalyticsForJson($data), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
