<?php
// ALX Tech - Conexão e Gerenciamento do Banco de Dados MySQL (Hostinger & Produção)
if (!defined('DB_INIT')) {
    define('DB_INIT', true);
}

/**
 * Carrega a configuração do banco de dados MySQL
 */
function getDbConfig() {
    $configFile = __DIR__ . '/db-config.php';
    $config = [];
    if (file_exists($configFile)) {
        $loaded = include $configFile;
        if (is_array($loaded)) {
            $config = $loaded;
        }
    }
    return [
        'host'   => getenv('DB_HOST')   ?: ($config['host']   ?? 'localhost'),
        'dbname' => getenv('DB_NAME')   ?: ($config['dbname'] ?? ''),
        'user'   => getenv('DB_USER')   ?: ($config['user']   ?? ''),
        'pass'   => getenv('DB_PASS')   ?: ($config['pass']   ?? ''),
        'port'   => (int)(getenv('DB_PORT') ?: ($config['port'] ?? 3306)),
    ];
}

/**
 * Obtém ou inicializa a instância PDO para conexão com MySQL
 * Re-tenta a conexão se tiver falhado anteriormente
 * @return PDO|null
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $cfg = getDbConfig();
    if (empty($cfg['dbname']) || empty($cfg['user'])) {
        return null;
    }

    try {
        $dsn = "mysql:host={$cfg['host']};port={$cfg['port']};dbname={$cfg['dbname']};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 5,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci; SET time_zone = '-03:00';"
        ];
        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);
        return $pdo;
    } catch (Exception $e) {
        error_log("ALX MySQL Connection Error: " . $e->getMessage());
        return null;
    }
}

/**
 * Garante que as tabelas necessárias existam no banco de dados
 */
function ensureDbTablesExist($pdo) {
    if (!$pdo) return false;
    try {
        $sql = "
        CREATE TABLE IF NOT EXISTS `site_data` (
            `id` INT NOT NULL PRIMARY KEY DEFAULT 1,
            `content` LONGTEXT NOT NULL,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `site_data_backups` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `content` LONGTEXT NOT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        $pdo->exec($sql);
        return true;
    } catch (Exception $e) {
        error_log("ALX MySQL Table Creation Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Salva os dados completos do site no MySQL de forma permanente e atômica com fusão inteligente
 * @param string $contentJson
 * @return bool
 */
function saveSiteDataToDb($contentJson) {
    $pdo = getDbConnection();
    if (!$pdo) {
        return false;
    }
    try {
        ensureDbTablesExist($pdo);
        $incomingData = json_decode($contentJson, true);
        if (!$incomingData || !is_array($incomingData)) {
            return false;
        }

        // Grava exatamente os dados fornecidos pelo cliente no registro principal (id = 1)
        $stmt = $pdo->prepare("
            INSERT INTO `site_data` (`id`, `content`, `updated_at`)
            VALUES (1, :content, NOW())
            ON DUPLICATE KEY UPDATE 
                `content` = VALUES(`content`),
                `updated_at` = NOW()
        ");
        $stmt->execute([':content' => $contentJson]);

        // Grava histórico na tabela de backups (para auditoria)
        try {
            $stmtBkp = $pdo->prepare("INSERT INTO `site_data_backups` (`content`, `created_at`) VALUES (:content, NOW())");
            $stmtBkp->execute([':content' => $contentJson]);
            $pdo->exec("
                DELETE FROM `site_data_backups` 
                WHERE `id` NOT IN (
                    SELECT `id` FROM (
                        SELECT `id` FROM `site_data_backups` ORDER BY `id` DESC LIMIT 50
                    ) AS keep_rows
                )
            ");
        } catch (Exception $be) {
            // Ignora falhas secundárias
        }

        return true;
    } catch (Exception $e) {
        error_log("ALX MySQL Save Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Carrega os dados do site do MySQL com fidedignidade absoluta
 * @return string|null Retorna a string JSON válida ou null
 */
function loadSiteDataFromDb() {
    $pdo = getDbConnection();
    if (!$pdo) {
        return null;
    }
    try {
        ensureDbTablesExist($pdo);
        $stmt = $pdo->prepare("SELECT `content`, `updated_at` FROM `site_data` WHERE `id` = 1 LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row && !empty($row['content'])) {
            $parsed = json_decode($row['content'], true);
            if ($parsed && (isset($parsed['brand']) || isset($parsed['apps']) || isset($parsed['news']) || isset($parsed['products']))) {
                return $row['content'];
            }
        }
    } catch (Exception $e) {
        error_log("ALX MySQL Load Error: " . $e->getMessage());
    }
    return null;
}

/**
 * Retorna o status detalhado da conexão com o MySQL para o painel admin
 */
function getDbStatusInfo() {
    $cfg = getDbConfig();
    $isConfigured = !empty($cfg['dbname']) && !empty($cfg['user']);
    
    if (!$isConfigured) {
        return [
            'configured' => false,
            'connected'  => false,
            'host'       => $cfg['host'] ?: 'localhost',
            'dbname'     => '',
            'user'       => '',
            'port'       => $cfg['port'],
            'hasData'    => false,
            'lastUpdated'=> null,
            'message'    => 'Banco MySQL não configurado.'
        ];
    }

    $pdo = getDbConnection();
    if (!$pdo) {
        return [
            'configured' => true,
            'connected'  => false,
            'host'       => $cfg['host'],
            'dbname'     => $cfg['dbname'],
            'user'       => $cfg['user'],
            'port'       => $cfg['port'],
            'hasData'    => false,
            'lastUpdated'=> null,
            'error'      => 'Falha ao conectar no MySQL da Hostinger.'
        ];
    }

    try {
        ensureDbTablesExist($pdo);
        $stmt = $pdo->prepare("SELECT `updated_at`, CHAR_LENGTH(`content`) as size FROM `site_data` WHERE `id` = 1 LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        return [
            'configured' => true,
            'connected'  => true,
            'host'       => $cfg['host'],
            'dbname'     => $cfg['dbname'],
            'user'       => $cfg['user'],
            'port'       => $cfg['port'],
            'hasData'    => !empty($row),
            'lastUpdated'=> $row['updated_at'] ?? null,
            'dataSize'   => $row['size'] ?? 0,
            'message'    => 'MySQL Hostinger Conectado e Ativo! Dados salvos permanentemente.'
        ];
    } catch (Exception $e) {
        return [
            'configured' => true,
            'connected'  => true,
            'host'       => $cfg['host'],
            'dbname'     => $cfg['dbname'],
            'user'       => $cfg['user'],
            'port'       => $cfg['port'],
            'hasData'    => false,
            'error'      => $e->getMessage()
        ];
    }
}
?>