<?php
/**
 * ALX+ - Motor Nativo de Disparo de E-mails via SMTP Autenticado (Hostinger / Qualquer Provedor)
 * Suporta SSL (Porta 465), STARTTLS (Porta 587), E-mails em HTML e Lembretes Automáticos VIP.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$smtpConfigFile = __DIR__ . '/smtp-config.json';

/**
 * Carrega a configuração SMTP salva no arquivo local ou no banco MySQL (brand.smtpConfig)
 */
function loadSmtpConfiguration($overrideConfig = null) {
    global $smtpConfigFile;

    $defaultConfig = [
        'host' => 'smtp.hostinger.com',
        'port' => 465,
        'encryption' => 'ssl',
        'user' => 'contact@7f.com.br',
        'password' => '',
        'fromName' => 'Portal Alx⁺',
        'adminReceiverEmail' => 'contact@7f.com.br',
        'autoReminderEnabled' => true,
    ];

    // 1. Tenta carregar do banco de dados MySQL (site_data -> brand -> smtpConfig)
    $dbJson = loadSiteDataFromDb();
    if ($dbJson) {
        $siteData = @json_decode($dbJson, true);
        if (is_array($siteData) && !empty($siteData['brand']['smtpConfig']) && is_array($siteData['brand']['smtpConfig'])) {
            $defaultConfig = array_merge($defaultConfig, $siteData['brand']['smtpConfig']);
        }
        if (is_array($siteData) && !empty($siteData['brand']['links']['email']) && empty($defaultConfig['adminReceiverEmail'])) {
            $defaultConfig['adminReceiverEmail'] = $siteData['brand']['links']['email'];
        }
    }

    // 2. Tenta carregar do arquivo dedicado api/smtp-config.json (se existir e tiver senha salva)
    if (file_exists($smtpConfigFile)) {
        $fileJson = @file_get_contents($smtpConfigFile);
        $parsedFile = @json_decode($fileJson, true);
        if (is_array($parsedFile)) {
            foreach ($parsedFile as $k => $v) {
                if ($v !== '' && $v !== null) {
                    $defaultConfig[$k] = $v;
                }
            }
        }
    }

    // 3. Aplica sobrescrita enviada na requisição atual
    if (is_array($overrideConfig)) {
        foreach ($overrideConfig as $k => $v) {
            if ($v !== '' && $v !== null) {
                $defaultConfig[$k] = $v;
            }
        }
    }

    return $defaultConfig;
}

/**
 * Salva a configuração SMTP em api/smtp-config.json para uso em segundo plano
 */
function saveSmtpConfiguration($config) {
    global $smtpConfigFile;
    if (!is_array($config)) return false;
    $current = loadSmtpConfiguration();
    $merged = array_merge($current, $config);
    return @file_put_contents($smtpConfigFile, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
}

/**
 * Lê a resposta multilinha de um socket SMTP
 */
function smtpReadResponse($socket) {
    $response = '';
    while ($line = @fgets($socket, 515)) {
        $response .= $line;
        if (substr($line, 3, 1) === ' ') {
            break;
        }
    }
    return $response;
}

/**
 * Envia um comando ao socket SMTP e verifica se o código HTTP/SMTP inicia com 2 ou 3
 */
function smtpSendCommand($socket, $command, $expectedPrefixes = ['2', '3']) {
    if ($command !== null) {
        @fwrite($socket, $command . "\r\n");
    }
    $response = smtpReadResponse($socket);
    $codePrefix = substr(trim($response), 0, 1);
    $ok = in_array($codePrefix, $expectedPrefixes, true);
    return ['ok' => $ok, 'response' => trim($response)];
}

/**
 * Envia um e-mail via Socket SMTP Direto (Suporta SSL 465 e TLS 587)
 */
function sendMailViaSmtp($smtp, $toEmail, $subject, $htmlBody, $textBody = '', $replyTo = '') {
    $host = trim($smtp['host'] ?? 'smtp.hostinger.com');
    $port = intval($smtp['port'] ?? 465);
    $encryption = strtolower(trim($smtp['encryption'] ?? ($port === 465 ? 'ssl' : 'tls')));
    $user = trim($smtp['user'] ?? '');
    $pass = $smtp['password'] ?? '';
    $fromName = trim($smtp['fromName'] ?? 'Portal Alx⁺');

    if (empty($host) || empty($user) || empty($pass)) {
        return [
            'success' => false,
            'error' => 'Credenciais SMTP incompletas. Configure o Host, E-mail/Login e Senha SMTP no Painel Administrativo.'
        ];
    }

    $remoteSocket = ($encryption === 'ssl' || $port === 465)
        ? "ssl://{$host}:{$port}"
        : "tcp://{$host}:{$port}";

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ]
    ]);

    $errno = 0;
    $errstr = '';
    $socket = @stream_socket_client($remoteSocket, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);

    if (!$socket) {
        return [
            'success' => false,
            'error' => "Não foi possível conectar ao servidor SMTP ({$host}:{$port}): {$errstr} ({$errno})"
        ];
    }

    stream_set_timeout($socket, 15);

    // 1. Greeting inicial
    $greeting = smtpReadResponse($socket);
    if (substr(trim($greeting), 0, 1) !== '2') {
        fclose($socket);
        return ['success' => false, 'error' => "Erro na saudação SMTP: {$greeting}"];
    }

    $serverHost = $_SERVER['HTTP_HOST'] ?? 'alx.7f.com.br';

    // 2. EHLO
    $ehlo = smtpSendCommand($socket, "EHLO {$serverHost}");
    if (!$ehlo['ok']) {
        $ehlo = smtpSendCommand($socket, "HELO {$serverHost}");
        if (!$ehlo['ok']) {
            fclose($socket);
            return ['success' => false, 'error' => "Falha no EHLO: {$ehlo['response']}"];
        }
    }

    // 3. STARTTLS se for porta 587 ou encryption === 'tls'
    if ($encryption === 'tls' && $port !== 465) {
        $starttls = smtpSendCommand($socket, "STARTTLS", ['2']);
        if (!$starttls['ok']) {
            fclose($socket);
            return ['success' => false, 'error' => "Falha ao iniciar STARTTLS: {$starttls['response']}"];
        }
        $cryptoOk = @stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        if (!$cryptoOk) {
            fclose($socket);
            return ['success' => false, 'error' => 'Não foi possível negociar criptografia TLS com o servidor SMTP.'];
        }
        smtpSendCommand($socket, "EHLO {$serverHost}");
    }

    // 4. Autenticação AUTH LOGIN
    $auth = smtpSendCommand($socket, "AUTH LOGIN", ['3']);
    if (!$auth['ok']) {
        fclose($socket);
        return ['success' => false, 'error' => "Servidor recusou AUTH LOGIN: {$auth['response']}"];
    }

    $userStep = smtpSendCommand($socket, base64_encode($user), ['3']);
    if (!$userStep['ok']) {
        fclose($socket);
        return ['success' => false, 'error' => "Usuário SMTP recusado: {$userStep['response']}"];
    }

    $passStep = smtpSendCommand($socket, base64_encode($pass), ['2']);
    if (!$passStep['ok']) {
        fclose($socket);
        return ['success' => false, 'error' => "Senha SMTP incorreta ou recusada pelo servidor: {$passStep['response']}"];
    }

    // 5. Envelope MAIL FROM & RCPT TO
    $mailFrom = smtpSendCommand($socket, "MAIL FROM:<{$user}>", ['2']);
    if (!$mailFrom['ok']) {
        fclose($socket);
        return ['success' => false, 'error' => "Erro em MAIL FROM: {$mailFrom['response']}"];
    }

    $recipients = array_unique(array_filter(array_map('trim', explode(',', $toEmail))));
    foreach ($recipients as $rcpt) {
        $rcptStep = smtpSendCommand($socket, "RCPT TO:<{$rcpt}>", ['2', '3']);
        if (!$rcptStep['ok']) {
            fclose($socket);
            return ['success' => false, 'error' => "Destinatário recusado ({$rcpt}): {$rcptStep['response']}"];
        }
    }

    // 6. DATA
    $dataCmd = smtpSendCommand($socket, "DATA", ['3']);
    if (!$dataCmd['ok']) {
        fclose($socket);
        return ['success' => false, 'error' => "Erro ao iniciar DATA: {$dataCmd['response']}"];
    }

    $boundary = "=_AlxPlusPart_" . md5(uniqid((string)mt_rand(), true));
    $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $encodedFromName = "=?UTF-8?B?" . base64_encode($fromName) . "?=";
    $cleanReplyTo = !empty($replyTo) ? trim($replyTo) : $user;
    $plainFallback = !empty($textBody) ? $textBody : strip_tags(str_replace(['<br>', '<br/>', '</p>'], "\n", $htmlBody));

    $headers = [];
    $headers[] = "Date: " . date('r');
    $headers[] = "From: {$encodedFromName} <{$user}>";
    $headers[] = "To: " . implode(', ', $recipients);
    $headers[] = "Reply-To: <{$cleanReplyTo}>";
    $headers[] = "Subject: {$encodedSubject}";
    $headers[] = "Message-ID: <" . uniqid() . "@{$serverHost}>";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: multipart/alternative; boundary=\"{$boundary}\"";
    $headers[] = "X-Mailer: AlxPlus-SMTP-Engine/2.0";

    $messageBody = implode("\r\n", $headers) . "\r\n\r\n";
    $messageBody .= "--{$boundary}\r\n";
    $messageBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $messageBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $messageBody .= chunk_split(base64_encode($plainFallback)) . "\r\n";

    $messageBody .= "--{$boundary}\r\n";
    $messageBody .= "Content-Type: text/html; charset=UTF-8\r\n";
    $messageBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $messageBody .= chunk_split(base64_encode($htmlBody)) . "\r\n";
    $messageBody .= "--{$boundary}--\r\n.";

    $sendResult = smtpSendCommand($socket, $messageBody, ['2']);
    smtpSendCommand($socket, "QUIT");
    fclose($socket);

    if (!$sendResult['ok']) {
        return ['success' => false, 'error' => "Falha ao transmitir corpo do e-mail: {$sendResult['response']}"];
    }

    return [
        'success' => true,
        'method' => 'SMTP',
        'response' => $sendResult['response']
    ];
}

// Lê payload JSON
$rawInput = file_get_contents('php://input');
$payload = @json_decode($rawInput, true);
if (!is_array($payload)) {
    $payload = [];
}

$action = $_GET['action'] ?? ($payload['action'] ?? 'send');

// AÇÃO 1: Salvar configuração SMTP
if ($action === 'save_config') {
    $smtpCfg = $payload['smtpConfig'] ?? $payload;
    $saved = saveSmtpConfiguration($smtpCfg);
    echo json_encode([
        'success' => $saved,
        'message' => $saved ? 'Configuração SMTP salva no servidor com sucesso!' : 'Não foi possível gravar o arquivo smtp-config.json.'
    ]);
    exit;
}

// AÇÃO 2: Disparar e-mail
$smtp = loadSmtpConfiguration($payload['smtpConfig'] ?? null);
if (!empty($payload['smtpConfig']['password'])) {
    saveSmtpConfiguration($payload['smtpConfig']);
}

$to = trim($payload['to'] ?? '');
if ($to === 'ADMIN' || empty($to)) {
    $to = !empty($smtp['adminReceiverEmail']) ? $smtp['adminReceiverEmail'] : ($smtp['user'] ?? 'contact@7f.com.br');
}

$subject = trim($payload['subject'] ?? '[Alx⁺] Notificação do Site');
$html = $payload['html'] ?? '';
$text = $payload['text'] ?? '';
$replyTo = trim($payload['replyTo'] ?? '');

if (empty($html) && !empty($text)) {
    $html = nl2br(htmlspecialchars($text, ENT_QUOTES, 'UTF-8'));
}

$result = sendMailViaSmtp($smtp, $to, $subject, $html, $text, $replyTo);
echo json_encode($result, JSON_UNESCAPED_UNICODE);
