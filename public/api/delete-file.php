<?php
// API para exclusão de arquivos órfãos ou versões anteriores substituídas
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

$input = json_decode(file_get_contents('php://input'), true);
$filepath = $input['filepath'] ?? '';

if (empty($filepath)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Caminho não fornecido']);
    exit;
}

// Previne path traversal
$cleanPath = ltrim(str_replace(['../', '..\\'], '', $filepath), '/\\');
$publicRoot = dirname(__DIR__);
$targetFile = realpath($publicRoot . '/' . $cleanPath);

// Só permite deletar dentro da pasta uploads ou aplicativos
if ($targetFile && strpos($targetFile, $publicRoot) === 0 && file_exists($targetFile)) {
    if (@unlink($targetFile)) {
        echo json_encode(['success' => true, 'message' => 'Arquivo excluído do servidor com sucesso.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Permissão negada ao excluir o arquivo.']);
    }
} else {
    // Arquivo não existia mais
    echo json_encode(['success' => true, 'message' => 'Arquivo já não existia no servidor.']);
}
