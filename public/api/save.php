<?php
// ALX Tech - API para Salvar Alterações no MySQL e no Servidor Hostinger
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

require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$json = json_decode($rawInput, true);

if (!$json || (!isset($json['data']) && !isset($json['brand']))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dados inválidos fornecidos para gravação']);
    exit;
}

$payloadToSave = isset($json['data']) ? $json['data'] : $json;
$content = json_encode($payloadToSave, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// 1. Verifica se o MySQL está configurado
$dbCfg = getDbConfig();
$isDbConfigured = !empty($dbCfg['dbname']) && !empty($dbCfg['user']);

// 2. Grava no Banco de Dados MySQL
$savedInDb = saveSiteDataToDb($content);

// 3. Log de Auditoria Seguro (Registro de horário, IP e resumo de apps sem salvar senhas)
try {
    $logsDir = __DIR__ . '/logs';
    if (!is_dir($logsDir)) {
        @mkdir($logsDir, 0755, true);
    }
    $logFile = $logsDir . '/save-audit.log';
    $clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
    $appCount = isset($payloadToSave['apps']) && is_array($payloadToSave['apps']) ? count($payloadToSave['apps']) : 0;
    $appNames = isset($payloadToSave['apps']) && is_array($payloadToSave['apps']) 
        ? implode(', ', array_slice(array_map(function($a) { return $a['name'] ?? 'App sem nome'; }, $payloadToSave['apps']), 0, 5)) 
        : 'Nenhum';
    $ts = $payloadToSave['lastSaved'] ?? date('c');

    $logLine = sprintf(
        "[%s] IP: %s | lastSaved: %s | Apps (%d): [%s] | MySQL: %s
",
        date('Y-m-d H:i:s'),
        $clientIp,
        $ts,
        $appCount,
        $appNames,
        $savedInDb ? 'OK' : ($isDbConfigured ? 'ERRO_BANCO' : 'NÃO_CONFIG')
    );
    @file_put_contents($logFile, $logLine, FILE_APPEND);
} catch (Exception $e) {}

// Se o MySQL estiver configurado, a gravação no MySQL é OBRIGATÓRIA.
if ($isDbConfigured && !$savedInDb) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'A gravação no Banco de Dados MySQL da Hostinger falhou. As alterações não foram confirmadas.',
        'dbConfigured' => true,
        'savedInDb' => false,
        'savedInFile' => false
    ]);
    exit;
}

// 4. Salva paralelamente em arquivos JSON locais como espelho e backup contínuo
$dataFile = __DIR__ . '/site-data.json';
$rootDataFile = dirname(__DIR__) . '/site-data.json';
$backupFile = __DIR__ . '/site-data-backup.json';
$rootBackupFile = dirname(__DIR__) . '/site-data-backup.json';

// Pasta de histórico de backups no servidor
$backupsDir = __DIR__ . '/backups';
if (!is_dir($backupsDir)) {
    @mkdir($backupsDir, 0755, true);
}
$timestamp = date('Y-m-d_H-i-s');
$histFile = $backupsDir . '/site-data-' . $timestamp . '.json';
@file_put_contents($histFile, $content);

// Limpa backups históricos mantendo os 30 mais recentes
$allBackups = glob($backupsDir . '/site-data-*.json');
if ($allBackups && count($allBackups) > 30) {
    usort($allBackups, function($a, $b) {
        return filemtime($a) - filemtime($b);
    });
    $toDelete = array_slice($allBackups, 0, count($allBackups) - 30);
    foreach ($toDelete as $oldFile) {
        @unlink($oldFile);
    }
}

$savedLocal = @file_put_contents($dataFile, $content);
$savedRoot = @file_put_contents($rootDataFile, $content);
$savedBackup = @file_put_contents($backupFile, $content);
$savedRootBackup = @file_put_contents($rootBackupFile, $content);

$savedInFile = ($savedLocal !== false || $savedRoot !== false || $savedBackup !== false || $savedRootBackup !== false);

if ($savedInDb || $savedInFile) {
    echo json_encode([
        'success' => true,
        'message' => $savedInDb 
             ? 'Dados gravados com sucesso no Banco de Dados MySQL da Hostinger!' 
             : 'Dados gravados no arquivo JSON local (MySQL não configurado).',
        'savedInDb' => $savedInDb,
        'savedInFile' => $savedInFile,
        'dbConfigured' => $isDbConfigured,
        'savedAt' => date('c'),
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erro crítico: Não foi possível gravar no banco MySQL nem nos arquivos locais do servidor.',
        'dbConfigured' => $isDbConfigured,
        'savedInDb' => false,
        'savedInFile' => false
    ]);
}
?>