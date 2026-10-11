<?php
// ALX Tech - Gerador Dinâmico de Cartões e Metatags para Redes Sociais (WhatsApp, Telegram, Facebook, X, LinkedIn, Discord)
// Suporte total a carregamento atômico do MySQL e fallbacks locais

error_reporting(0);
ini_set('display_errors', '0');

function norm_key($s) {
    if (!$s || !is_string($s)) return '';
    $s = strtolower(trim($s));
    $s = preg_replace('/^(app|ota|tut|news|prod|serv|wall|vid)-/', '', $s);
    return preg_replace('/[^a-z0-9]/', '', $s);
}

function find_item_in_array($items, $reqSlug) {
    if (empty($items) || !is_array($items) || empty($reqSlug)) return null;
    $reqSlugLower = strtolower(trim($reqSlug));
    $normReq = norm_key($reqSlug);

    // 1. Match exato por slug ou id
    foreach ($items as $item) {
        if (!is_array($item)) continue;
        $slug = strtolower(trim($item['slug'] ?? ''));
        $id = strtolower(trim($item['id'] ?? ''));
        if (($slug && $slug === $reqSlugLower) || ($id && $id === $reqSlugLower)) {
            return $item;
        }
    }

    // 2. Match normalizado por slug ou id
    if (!empty($normReq)) {
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $slugNorm = norm_key($item['slug'] ?? '');
            $idNorm = norm_key($item['id'] ?? '');
            if (($slugNorm && $slugNorm === $normReq) || ($idNorm && $idNorm === $normReq)) {
                return $item;
            }
        }
    }

    // 3. Match por título / nome
    if (!empty($normReq)) {
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $title = $item['title'] ?? ($item['name'] ?? '');
            if ($title) {
                $titleNorm = norm_key($title);
                if ($titleNorm === $normReq || strpos($titleNorm, $normReq) !== false || strpos($normReq, $titleNorm) !== false) {
                    return $item;
                }
            }
        }
    }

    return null;
}

function extract_item_image($item, $defaultFallback) {
    if (!$item || !is_array($item)) return $defaultFallback;
    $candidates = [
        $item['imageUrl'] ?? null,
        $item['coverImage'] ?? null,
        $item['previewUrl'] ?? null,
        $item['thumbnailUrl'] ?? null,
        $item['iconUrl'] ?? null,
        $item['icon'] ?? null,
        (isset($item['screenshots']) && is_array($item['screenshots']) && !empty($item['screenshots'][0])) ? $item['screenshots'][0] : null,
        (isset($item['images']) && is_array($item['images']) && !empty($item['images'][0])) ? $item['images'][0] : null
    ];
    foreach ($candidates as $img) {
        if (!empty($img) && is_string($img)) {
            $img = trim($img);
            if (strpos($img, 'blob:') === 0) continue;
            return $img;
        }
    }
    return $defaultFallback;
}

// Captura o caminho da URL solicitada
$path = isset($_GET['path']) ? trim($_GET['path'], '/') : '';
if (empty($path) && isset($_SERVER['REQUEST_URI'])) {
    $parsedUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = trim($parsedUri, '/');
}

$type = '';
$slug = '';
if (!empty($path) && $path !== 'share.php') {
    $parts = explode('/', $path);
    $type = strtolower(trim($parts[0] ?? ''));
    $slug = strtolower(trim($parts[1] ?? ''));
    if (count($parts) >= 3) {
        $slug = strtolower(trim(end($parts)));
    }
} else {
    $type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : '';
    $slug = isset($_GET['slug']) ? strtolower(trim($_GET['slug'])) : '';
}

// Normalização de URL base e protocolo seguro HTTPS
$host = !empty($_SERVER['HTTP_X_FORWARDED_HOST']) 
    ? $_SERVER['HTTP_X_FORWARDED_HOST'] 
    : (!empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'alx.7f.com.br');
$baseUrl = 'https://' . rtrim($host, '/');
$currentUrl = $baseUrl . (!empty($path) ? '/' . $path : ($type ? '/' . rawurlencode($type) . ($slug ? '/' . rawurlencode($slug) : '') : '/'));

// 1. Tenta carregar dados do banco de dados MySQL no Hostinger
$data = null;
try {
    $dbFile = __DIR__ . '/api/db.php';
    if (file_exists($dbFile)) {
        @include_once $dbFile;
        if (function_exists('loadSiteDataFromDb')) {
            $dbContent = loadSiteDataFromDb();
            if ($dbContent !== null) {
                $parsedDb = @json_decode($dbContent, true);
                if (is_array($parsedDb) && !empty($parsedDb)) {
                    $data = $parsedDb;
                }
            }
        }
    }
} catch (Throwable $e) {}

// 2. Fallback para arquivos de dados locais em JSON
if (!$data) {
    $possibleFiles = [
        __DIR__ . '/site-data.json',
        __DIR__ . '/api/site-data.json',
        __DIR__ . '/site-data-backup.json',
        __DIR__ . '/api/site-data-backup.json',
        __DIR__ . '/default-site-data.json'
    ];
    foreach ($possibleFiles as $filePath) {
        if (file_exists($filePath)) {
            $jsonContent = @file_get_contents($filePath);
            if ($jsonContent) {
                $parsed = @json_decode($jsonContent, true);
                if (is_array($parsed) && (isset($parsed['news']) || isset($parsed['brand']) || isset($parsed['apps']) || isset($parsed['tutorials']) || isset($parsed['products']))) {
                    $data = $parsed;
                    break;
                }
            }
        }
    }
}

// Configurações Padrão de Marca
$siteName = 'Alx⁺';
$tagline = 'Portal Automotivo & Multimídia';
$subTagline = 'Portal oficial especialista em desbloqueio de central multimídia (BYD, Haval, Chery), atualizações de firmware OTA, tutoriais de instalação e APKs exclusivos.';
$defaultShareImage = '/imagens/og-padrao.jpg';

if ($data && !empty($data['brand']) && is_array($data['brand'])) {
    if (!empty($data['brand']['brandName'])) $siteName = trim($data['brand']['brandName']);
    if (!empty($data['brand']['tagline'])) $tagline = trim($data['brand']['tagline']);
    if (!empty($data['brand']['subTagline'])) $subTagline = trim($data['brand']['subTagline']);
    if (!empty($data['brand']['defaultShareImageUrl']) && strpos($data['brand']['defaultShareImageUrl'], 'blob:') !== 0) {
        $defaultShareImage = trim($data['brand']['defaultShareImageUrl']);
    }
}

$title = $siteName . ' • ' . $tagline;
$description = $subTagline;
$imageUrl = $defaultShareImage;
$ogType = 'website';

// ROTEAMENTO DINÂMICO DE METADADOS
if ($type === 'apps' || $type === 'app' || $type === 'aplicativos') {
    $matchedApp = find_item_in_array($data['apps'] ?? [], $slug);
    if ($matchedApp) {
        if (!empty($matchedApp['name'])) $title = $matchedApp['name'] . ' • ALX App Store';
        if (!empty($matchedApp['description'])) $description = $matchedApp['description'];
        elseif (!empty($matchedApp['fullDescription'])) $description = $matchedApp['fullDescription'];
        elseif (!empty($matchedApp['tagline'])) $description = $matchedApp['tagline'];
        $imageUrl = extract_item_image($matchedApp, $defaultShareImage);
    } else {
        $title = 'Loja de Aplicativos ALX Store | ' . $siteName;
        $description = 'Baixe aplicativos e launchers otimizados para centrais multimídia automotivas.';
    }
} elseif ($type === 'ota' || $type === 'otas' || $type === 'radar-ota') {
    $matchedOta = find_item_in_array($data['otaUpdates'] ?? [], $slug);
    if ($matchedOta) {
        if (!empty($matchedOta['title'])) $title = $matchedOta['title'] . ' • Radar OTA ' . $siteName;
        elseif (!empty($matchedOta['version'])) $title = 'Atualização DiLink ' . $matchedOta['version'] . ' • ' . $siteName;
        $cars = !empty($matchedOta['applicableCars']) ? $matchedOta['applicableCars'] : (!empty($matchedOta['modelTarget']) ? $matchedOta['modelTarget'] : '');
        $verStr = !empty($matchedOta['version']) ? ' (' . $matchedOta['version'] . ')' : '';
        if (!empty($matchedOta['summary'])) {
            $description = $matchedOta['summary'];
        } else {
            $description = 'Atualização de Firmware OTA' . $verStr . ($cars ? ' para ' . $cars : '') . '. Pacote de instalação no ' . $siteName . '.';
        }
        $imageUrl = extract_item_image($matchedOta, $defaultShareImage);
    } else {
        $title = 'Radar de Atualizações OTA • Firmware | ' . $siteName;
        $description = 'Acompanhe as versões de firmware OTA e pacotes de atualização para veículos BYD, Haval e Chery.';
    }
} elseif ($type === 'desbloqueio' || $type === 'servico' || $type === 'servicos' || $type === 'servico-desbloqueio') {
    $matchedUnlock = find_item_in_array($data['unlockServices'] ?? [], $slug);
    if ($matchedUnlock) {
        if (!empty($matchedUnlock['title'])) $title = $matchedUnlock['title'] . ' • ' . $siteName;
        if (!empty($matchedUnlock['summary'])) $description = $matchedUnlock['summary'];
        elseif (!empty($matchedUnlock['content'])) $description = strip_tags($matchedUnlock['content']);
        $imageUrl = extract_item_image($matchedUnlock, '/imagens/og-desbloqueio.jpg');
    } else {
        $title = 'Desbloqueio de Multimídia Automotiva | ' . $siteName;
        $description = 'Serviços especializados de desbloqueio e suporte técnico remoto para centrais multimídia.';
        $imageUrl = '/imagens/og-desbloqueio.jpg';
    }
} elseif ($type === 'tutoriais' || $type === 'tutorial' || $type === 'guias' || $type === 'guia') {
    $matchedTut = find_item_in_array($data['tutorials'] ?? [], $slug);
    if ($matchedTut) {
        if (!empty($matchedTut['title'])) $title = $matchedTut['title'] . ' | ' . $siteName;
        if (!empty($matchedTut['summary'])) $description = $matchedTut['summary'];
        $imageUrl = extract_item_image($matchedTut, '/imagens/og-tutoriais.jpg');
    } else {
        $title = 'Central de Tutoriais & Guias Técnicos | ' . $siteName;
        $description = 'Aprenda o passo a passo para atualizar o sistema via OTA por pendrive USB e instalar APKs.';
        $imageUrl = '/imagens/og-tutoriais.jpg';
    }
} elseif ($type === 'noticias' || $type === 'noticia' || $type === 'artigo' || $type === 'artigos') {
    $matchedNews = find_item_in_array($data['news'] ?? [], $slug);
    if ($matchedNews) {
        if (!empty($matchedNews['title'])) $title = $matchedNews['title'] . ' | ' . $siteName;
        if (!empty($matchedNews['summary'])) $description = $matchedNews['summary'];
        $imageUrl = extract_item_image($matchedNews, $defaultShareImage);
    } else {
        $title = 'Notícias & Tendências EV | ' . $siteName;
        $description = 'Acompanhe as últimas novidades de veículos elétricos, tecnologia automotiva e atualizações.';
    }
} elseif ($type === 'produto' || $type === 'produtos' || $type === 'shop') {
    $matchedProd = find_item_in_array($data['products'] ?? [], $slug);
    if ($matchedProd) {
        if (!empty($matchedProd['name'])) $title = $matchedProd['name'] . ' • ALX Shop';
        if (!empty($matchedProd['description'])) $description = $matchedProd['description'];
        $imageUrl = extract_item_image($matchedProd, $defaultShareImage);
    } else {
        $title = 'ALX Shop • Produtos & Acessórios | ' . $siteName;
        $description = 'Equipamentos, adaptadores streaming, cabos de recarga e softwares homologados.';
    }
} elseif ($type === 'wallpapers' || $type === 'wallpaper') {
    $matchedWall = find_item_in_array($data['wallpapers'] ?? [], $slug);
    if ($matchedWall) {
        if (!empty($matchedWall['title'])) $title = $matchedWall['title'] . ' • Wallpapers ' . $siteName;
        if (!empty($matchedWall['description'])) $description = $matchedWall['description'];
        $imageUrl = extract_item_image($matchedWall, $defaultShareImage);
    } else {
        $title = 'Galeria de Wallpapers & Wallpapers Animados | ' . $siteName;
        $description = 'Baixe wallpapers estáticos em 4K e animados para central multimídia automotiva.';
    }
} elseif ($type === 'youtube' || $type === 'video' || $type === 'videos') {
    $matchedVid = find_item_in_array($data['videos'] ?? [], $slug);
    if ($matchedVid) {
        if (!empty($matchedVid['title'])) $title = $matchedVid['title'] . ' • ALX YouTube';
        if (!empty($matchedVid['description'])) $description = $matchedVid['description'];
        $imageUrl = extract_item_image($matchedVid, $defaultShareImage);
    }
} elseif ($type === 'iptv') {
    $title = 'IPTV Automotivo • Streaming & Guias | ' . $siteName;
    $description = 'Aplicativos IPTV testados e otimizados para centrais multimídia automotivas.';
    $imageUrl = '/imagens/og-iptv.jpg';
} elseif ($type === 'vip' || $type === 'area-vip' || $type === 'membros') {
    $title = 'Área Exclusiva VIP | ' . $siteName;
    $description = 'Acesse downloads exclusivos, APKs especiais e manuais técnicos do clube VIP.';
    $imageUrl = '/imagens/og-vip.jpg';
}

// Validação final de segurança da URL da imagem para WhatsApp e crawlers
if (empty($imageUrl) || strpos($imageUrl, 'blob:') === 0) {
    $imageUrl = $defaultShareImage;
}

if (strpos($imageUrl, 'http://') === 0) {
    $imageUrl = 'https://' . substr($imageUrl, 7);
} elseif (strpos($imageUrl, 'https://') !== 0) {
    $imageUrl = $baseUrl . '/' . ltrim($imageUrl, '/');
}

$imageUrl = str_replace(' ', '%20', $imageUrl);

// Determinar o MIME type correto para OpenGraph
$cleanImgPath = parse_url($imageUrl, PHP_URL_PATH);
$imgExt = strtolower(pathinfo($cleanImgPath, PATHINFO_EXTENSION));
$imageMime = 'image/jpeg';
if ($imgExt === 'png') $imageMime = 'image/png';
elseif ($imgExt === 'webp') $imageMime = 'image/webp';
elseif ($imgExt === 'gif') $imageMime = 'image/gif';
elseif ($imgExt === 'svg') $imageMime = 'image/svg+xml';

// Higienização rigorosa para impedir quebras de atributos HTML no WhatsApp
$cleanTitle = htmlspecialchars(trim(preg_replace('/\s+/', ' ', strip_tags($title))), ENT_QUOTES, 'UTF-8');
$cleanDesc = htmlspecialchars(trim(preg_replace('/\s+/', ' ', strip_tags($description))), ENT_QUOTES, 'UTF-8');

if (mb_strlen($cleanDesc) > 220) {
    $cleanDesc = mb_substr($cleanDesc, 0, 217) . '...';
}

$targetRedirect = '/' . ltrim(!empty($path) ? $path : ($type ? $type . ($slug ? '/' . $slug : '') : ''), '/');
if (empty($targetRedirect) || $targetRedirect === '/') {
    $targetRedirect = '/';
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title><?= $cleanTitle ?></title>
    <meta name="description" content="<?= $cleanDesc ?>">
    <!-- Open Graph Oficial para WhatsApp, Telegram e Redes Sociais -->
    <meta property="og:site_name" content="<?= htmlspecialchars($siteName, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:type" content="<?= htmlspecialchars($ogType, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:title" content="<?= $cleanTitle ?>">
    <meta property="og:description" content="<?= $cleanDesc ?>">
    <meta property="og:url" content="<?= htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image" content="<?= htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image:secure_url" content="<?= htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image:type" content="<?= htmlspecialchars($imageMime, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <link rel="image_src" href="<?= htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8') ?>">
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= $cleanTitle ?>">
    <meta name="twitter:description" content="<?= $cleanDesc ?>">
    <meta name="twitter:image" content="<?= htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8') ?>">
    <!-- Redirecionamento instantâneo para navegadores normais -->
    <meta http-equiv="refresh" content="0;url=<?= htmlspecialchars($targetRedirect, ENT_QUOTES, 'UTF-8') ?>">
    <script>
        window.location.replace(<?= json_encode($targetRedirect) ?>);
    </script>
</head>
<body style="background:#080808;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
    <p>Carregando <?= htmlspecialchars($siteName, ENT_QUOTES, 'UTF-8') ?>...</p>
</body>
</html>
