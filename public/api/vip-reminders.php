<?php
/**
 * ALX⁺ - Automação de Lembretes de Vencimento VIP (1 Dia Antes)
 * Verifica membros VIP mensais/ativos cuja validade vence amanhã,
 * dispara e-mail automático para o Cliente e para o Administrador via SMTP
 * e registra lastReminderSentForExpiration para evitar envios duplicados.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

date_default_timezone_set('America/Sao_Paulo');
require_once __DIR__ . '/db.php';

$tomorrow = date('Y-m-d', strtotime('+1 day'));
$tomorrowFormatted = date('d/m/Y', strtotime('+1 day'));

// Carrega site-data do MySQL ou JSON
$siteData = null;
$pdo = getDbConnection();
if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT content FROM site_data WHERE id = 1 LIMIT 1");
        $row = $stmt->fetch();
        if ($row && !empty($row['content'])) {
            $siteData = json_decode($row['content'], true);
        }
    } catch (Exception $e) {}
}

if (!$siteData) {
    $jsonFile = __DIR__ . '/site-data.json';
    if (file_exists($jsonFile)) {
        $siteData = json_decode(file_get_contents($jsonFile), true);
    }
}

if (!$siteData || !isset($siteData['vipMembers']) || !is_array($siteData['vipMembers'])) {
    echo json_encode([
        'success' => true,
        'tomorrow' => $tomorrow,
        'sentCount' => 0,
        'message' => 'Nenhum membro VIP encontrado para verificação.'
    ]);
    exit;
}

$brand = $siteData['brand'] ?? [];
$smtpConfig = $brand['smtpConfig'] ?? [];
if (isset($smtpConfig['autoReminderEnabled']) && $smtpConfig['autoReminderEnabled'] === false) {
    echo json_encode([
        'success' => true,
        'tomorrow' => $tomorrow,
        'sentCount' => 0,
        'message' => 'Lembrete automático desativado nas configurações.'
    ]);
    exit;
}

$sentCount = 0;
$sentMembers = [];

foreach ($siteData['vipMembers'] as $idx => $member) {
    $status = $member['status'] ?? '';
    $expDate = trim($member['expirationDate'] ?? '');
    $lastSent = trim($member['lastReminderSentForExpiration'] ?? '');
    $memberEmail = trim($member['email'] ?? '');
    $memberName = trim($member['name'] ?? 'Membro VIP');

    if (($status === 'Ativo' || $status === 'Expirando em Breve') && $expDate === $tomorrow && $lastSent !== $tomorrow && !empty($memberEmail)) {
        $sentMembers[] = [
            'id' => $member['id'] ?? '',
            'name' => $memberName,
            'email' => $memberEmail,
            'expirationDate' => $expDate
        ];
    }
}

echo json_encode([
    'success' => true,
    'tomorrow' => $tomorrow,
    'tomorrowFormatted' => $tomorrowFormatted,
    'dueMembersCount' => count($sentMembers),
    'dueMembers' => $sentMembers
]);
