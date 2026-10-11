<?php
// Proxy PHP para exclusão de asset no GitHub Releases sem CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$token = trim($input['token'] ?? '');
$owner = trim($input['owner'] ?? '');
$repo = trim($input['repo'] ?? '');
$assetId = $input['assetId'] ?? null;
$assetUrl = $input['assetUrl'] ?? '';
$tag = trim($input['defaultReleaseTag'] ?? 'v1.0');

if (empty($token) || empty($owner) || empty($repo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Credenciais incompletas']);
    exit;
}

$headers = [
    'User-Agent: ALX-Storage-Uploader',
    'Authorization: Bearer ' . $token,
    'Accept: application/vnd.github+json',
    'X-GitHub-Api-Version: 2022-11-28'
];

// Se não tem assetId, tenta descobrir pela URL
if (!$assetId && !empty($assetUrl)) {
    $parts = explode('/', $assetUrl);
    $fileName = end($parts);
    if ($fileName) {
        $ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases/tags/{$tag}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $res = curl_exec($ch);
        curl_close($ch);
        $relData = json_decode($res, true);
        if (isset($relData['assets']) && is_array($relData['assets'])) {
            foreach ($relData['assets'] as $a) {
                if (strtolower($a['name']) === strtolower($fileName) || ($a['browser_download_url'] ?? '') === $assetUrl) {
                    $assetId = $a['id'];
                    break;
                }
            }
        }
    }
}

if (!$assetId) {
    echo json_encode(['success' => true, 'message' => 'Asset não encontrado ou já excluído']);
    exit;
}

$ch = curl_init("https://api.github.com/repos/{$owner}/{$repo}/releases/assets/{$assetId}");
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$delRes = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code === 204 || ($code >= 200 && $code < 300)) {
    echo json_encode(['success' => true, 'message' => 'Arquivo excluído do GitHub Releases com sucesso']);
} else {
    http_response_code($code ?: 400);
    echo json_encode(['success' => false, 'error' => 'Falha ao excluir asset do GitHub']);
}
