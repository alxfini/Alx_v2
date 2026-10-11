<?php
// ALX Tech - Endpoint para Testar, Configurar e Sincronizar o Banco MySQL da Hostinger
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// 1. GET: Retorna o status atual do MySQL
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(getDbStatusInfo());
    exit;
}

// 2. POST: Ações de configuração e sincronização
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];
$action = $data['action'] ?? ($_GET['action'] ?? '');

if ($action === 'test_and_save') {
    $host   = trim($data['host'] ?? 'localhost');
    $dbname = trim($data['dbname'] ?? '');
    $user   = trim($data['user'] ?? '');
    $pass   = (string)($data['pass'] ?? '');
    $port   = (int)($data['port'] ?? 3306);

    if (empty($dbname) || empty($user)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Informe o Nome do Banco de Dados e o Usuário MySQL da Hostinger.'
        ]);
        exit;
    }

    // Testa a conexão antes de salvar o arquivo
    try {
        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 6,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        $testPdo = new PDO($dsn, $user, $pass, $options);
        
        // Cria tabelas se não existirem
        ensureDbTablesExist($testPdo);

        // Se a tabela site_data estiver vazia, migra o conteúdo atual do site-data.json
        $stmtCheck = $testPdo->query("SELECT COUNT(*) as cnt FROM `site_data` WHERE `id` = 1");
        $rowCount = (int)$stmtCheck->fetchColumn();
        
        if ($rowCount === 0) {
            $jsonFile = __DIR__ . '/site-data.json';
            $rootJsonFile = dirname(__DIR__) . '/site-data.json';
            $seedContent = null;
            if (file_exists($jsonFile) && filesize($jsonFile) > 20) {
                $seedContent = file_get_contents($jsonFile);
            } elseif (file_exists($rootJsonFile) && filesize($rootJsonFile) > 20) {
                $seedContent = file_get_contents($rootJsonFile);
            }

            if ($seedContent) {
                $stmtInsert = $testPdo->prepare("
                    INSERT INTO `site_data` (`id`, `content`, `updated_at`)
                    VALUES (1, :content, NOW())
                    ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `updated_at` = NOW()
                ");
                $stmtInsert->execute([':content' => $seedContent]);
            }
        }

        // Grava o arquivo db-config.php com as credenciais
        $configFile = __DIR__ . '/db-config.php';
        $escapedHost = addslashes($host);
        $escapedDb   = addslashes($dbname);
        $escapedUser = addslashes($user);
        $escapedPass = addslashes($pass);

        $fileContent = "<?php\n"
                     . "// ALX Tech - Configurações do Banco de Dados MySQL Hostinger\n"
                     . "// Gerado automaticamente pelo Painel Administrativo\n"
                     . "return [\n"
                     . "    'host'   => '{$escapedHost}',\n"
                     . "    'dbname' => '{$escapedDb}',\n"
                     . "    'user'   => '{$escapedUser}',\n"
                     . "    'pass'   => '{$escapedPass}',\n"
                     . "    'port'   => {$port},\n"
                     . "];\n";

        @file_put_contents($configFile, $fileContent);

        echo json_encode([
            'success' => true,
            'message' => 'Conexão com o MySQL da Hostinger realizada com sucesso! As tabelas foram criadas e seus dados já estão salvos permanentemente no banco.',
            'status' => [
                'host' => $host,
                'dbname' => $dbname,
                'user' => $user,
                'connected' => true,
                'configured' => true,
            ]
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Falha ao conectar ao MySQL: ' . $e->getMessage() . '. Verifique se o banco e usuário foram criados no hPanel da Hostinger.'
        ]);
        exit;
    }
}

if ($action === 'sync_to_db') {
    $payload = $data['data'] ?? null;
    $contentToSave = null;
    if ($payload) {
        $contentToSave = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        $jsonFile = __DIR__ . '/site-data.json';
        if (file_exists($jsonFile)) {
            $contentToSave = file_get_contents($jsonFile);
        }
    }

    if (!$contentToSave) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nenhum dado encontrado para sincronizar.']);
        exit;
    }

    $saved = saveSiteDataToDb($contentToSave);
    if ($saved) {
        echo json_encode(['success' => true, 'message' => 'Dados sincronizados com sucesso no MySQL da Hostinger!']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Não foi possível gravar no MySQL. Verifique se a conexão está ativa.']);
    }
    exit;
}

if ($action === 'download_sql') {
    $jsonFile = __DIR__ . '/site-data.json';
    $content = file_exists($jsonFile) ? file_get_contents($jsonFile) : '{}';
    $escaped = addslashes($content);

    $sql = "-- ========================================================\n"
         . "-- ALX Tech - Estrutura e Dados Iniciais para MySQL Hostinger\n"
         . "-- Para importar: acesse phpMyAdmin na Hostinger -> Importar -> Selecionar este arquivo\n"
         . "-- ========================================================\n\n"
         . "CREATE TABLE IF NOT EXISTS `site_data` (\n"
         . "  `id` int(11) NOT NULL DEFAULT 1,\n"
         . "  `content` longtext NOT NULL,\n"
         . "  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n"
         . "  PRIMARY KEY (`id`)\n"
         . ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n"
         . "CREATE TABLE IF NOT EXISTS `site_data_backups` (\n"
         . "  `id` int(11) NOT NULL AUTO_INCREMENT,\n"
         . "  `content` longtext NOT NULL,\n"
         . "  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n"
         . "  PRIMARY KEY (`id`)\n"
         . ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n"
         . "INSERT INTO `site_data` (`id`, `content`, `updated_at`)\n"
         . "VALUES (1, '{$escaped}', NOW())\n"
         . "ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `updated_at` = NOW();\n";

    header('Content-Type: text/plain; charset=utf-8');
    echo $sql;
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Ação não reconhecida']);
?>
