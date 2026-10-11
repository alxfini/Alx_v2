<?php
// ALX Tech - API para Ler Dados do Site (Fonte de Verdade Absoluta: MySQL Hostinger)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: no-cache, no-store, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// 1. Fonte Absoluta: Banco de Dados MySQL da Hostinger
$dbContent = loadSiteDataFromDb();
if ($dbContent !== null) {
    header('X-Data-Source: MySQL-Hostinger');
    echo $dbContent;
    exit;
}

// 2. Fallback de primeira instalação (somente se MySQL não configurado)
$dbCfg = getDbConfig();
$isDbConfigured = !empty($dbCfg['dbname']) && !empty($dbCfg['user']);

if (!$isDbConfigured) {
    header('X-Data-Source: Local-JSON-Fallback');
    $dataFile = __DIR__ . '/site-data.json';
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
        exit;
    }
}

echo json_encode(['status' => 'empty']);
?>