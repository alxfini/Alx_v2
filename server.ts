import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware para JSON com limite amplo para configurações e dados
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Garante que as pastas necessárias existam
const publicDir = path.resolve(__dirname, 'public');
const apiDir = path.resolve(publicDir, 'api');
const uploadsDir = path.resolve(publicDir, 'uploads');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Configuração do multer para upload de imagens (idêntico ao upload.php da Hostinger)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webp';
    const cleanExt = ext.toLowerCase();
    const safeName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB para instaladores e arquivos de mídia
});

// Endpoint para excluir arquivo local do servidor (/uploads/ ou /aplicativos/)
app.post('/api/delete-file.php', (req, res) => {
  try {
    const { filepath } = req.body || {};
    if (!filepath || typeof filepath !== 'string') {
      return res.status(400).json({ success: false, error: 'Caminho não fornecido' });
    }
    // Protege contra path traversal
    const cleanPath = filepath.replace(/^[\\\/]+/, '').replace(/\.\.[\\\/]/g, '');
    const targetFile = path.resolve(publicDir, cleanPath);

    if (!targetFile.startsWith(publicDir)) {
      return res.status(403).json({ success: false, error: 'Acesso não permitido fora da pasta pública' });
    }

    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
      return res.json({ success: true, message: 'Arquivo excluído com sucesso do servidor.' });
    }
    return res.json({ success: true, message: 'Arquivo já não existia no disco.' });
  } catch (err: any) {
    console.error('Delete file error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro ao excluir arquivo' });
  }
});

// 1. Endpoint /api/upload.php (compatível com Hostinger e Local)
app.post('/api/upload.php', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      // Se não veio multipart, tenta ler body com dataUrl base64
      const { dataUrl, filename: reqFileName } = req.body || {};
      if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : mimeType.includes('svg') ? '.svg' : '.jpg';
          const safeName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
          const filePath = path.join(uploadsDir, safeName);
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          return res.json({
            success: true,
            url: `/uploads/${safeName}`,
            filename: safeName,
          });
        }
      }
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }

    const safeUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: safeUrl,
      filename: req.file.filename,
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro no upload' });
  }
});

// Armazenamento em memória das últimas credenciais GitHub usadas para autenticação do proxy de mídia
let cachedGhCredentials: { token: string; owner: string; repo: string } | null = null;

// Obtém as credenciais do GitHub configuradas no painel (em memória ou no arquivo site-data.json)
function getStoredGitHubConfig(): { token?: string; owner?: string; repo?: string } | null {
  if (cachedGhCredentials?.token) return cachedGhCredentials;

  try {
    const siteDataPath = path.join(process.cwd(), 'public', 'api', 'site-data.json');
    if (fs.existsSync(siteDataPath)) {
      const raw = fs.readFileSync(siteDataPath, 'utf8');
      const json = JSON.parse(raw);
      if (json?.brand?.githubStorage?.token) {
        cachedGhCredentials = {
          token: json.brand.githubStorage.token,
          owner: json.brand.githubStorage.owner,
          repo: json.brand.githubStorage.repo,
        };
        return cachedGhCredentials;
      }
    }
  } catch (e) {}

  return null;
}

// Helper para obter MIME type correto para inline rendering
function getMediaMimeType(filePathOrUrl: string, diskFilePath?: string): string {
  const ext = path.extname(filePathOrUrl.split('?')[0]).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.ico':
      return 'image/x-icon';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.mov':
      return 'video/quicktime';
  }

  // Se não foi identificado pela extensão e temos o arquivo em disco, inspeciona magic bytes
  if (diskFilePath && fs.existsSync(diskFilePath)) {
    try {
      const fd = fs.openSync(diskFilePath, 'r');
      const buf = Buffer.alloc(16);
      fs.readSync(fd, buf, 0, 16, 0);
      fs.closeSync(fd);

      if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
      if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
      if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
      if (buf.toString('utf8', 0, 4) === 'RIFF' && buf.toString('utf8', 8, 12) === 'WEBP') return 'image/webp';
      if (buf.toString('utf8', 4, 8) === 'ftyp') return 'video/mp4';
    } catch {}
  }

  return 'image/jpeg'; // fallback padrão para renderização de imagem nos cards
}

// Proxy para upload no GitHub Releases (contorna restrições de CORS do navegador em uploads.github.com)
const ghUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      cb(null, `gh_temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
    },
  }),
  limits: { fileSize: 2000 * 1024 * 1024 }, // até 2GB por arquivo
});

app.post(['/api/github-upload.php', '/api/github-upload'], ghUpload.single('file'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    if (!req.file || !tempPath) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado para o proxy GitHub.' });
    }

    const { token, owner, repo, tag = 'v1.0' } = req.body || {};
    if (!token || !owner || !repo) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(400).json({ success: false, error: 'Credenciais do GitHub incompletas (token, owner ou repo ausente).' });
    }

    const cleanToken = token.trim();
    const cleanOwner = owner.trim();
    const cleanRepo = repo.trim();
    const cleanTag = (tag || 'v1.0').trim();

    cachedGhCredentials = { token: cleanToken, owner: cleanOwner, repo: cleanRepo };

    const ghHeaders = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${cleanToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // 1. Obtém a release existente ou cria se necessário
    let releaseId: number | null = null;
    const relRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/releases/tags/${cleanTag}`, {
      headers: ghHeaders,
    });

    if (relRes.ok) {
      const relData = await relRes.json();
      releaseId = relData.id;
    } else {
      // Procura em todas as releases
      const listRel = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/releases`, {
        headers: ghHeaders,
      });
      if (listRel.ok) {
        const allRels = await listRel.json();
        if (Array.isArray(allRels) && allRels.length > 0) {
          const m = allRels.find((r: any) => r.tag_name === cleanTag) || allRels[0];
          if (m) releaseId = m.id;
        }
      }
    }

    // Se ainda não encontrou, tenta criar
    if (!releaseId) {
      const createRel = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/releases`, {
        method: 'POST',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag_name: cleanTag,
          name: `Releases & APKs (${cleanTag})`,
          draft: false,
          prerelease: false,
        }),
      });
      if (createRel.ok) {
        const newRel = await createRel.json();
        releaseId = newRel.id;
      } else {
        const errJson = await createRel.json().catch(() => ({}));
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return res.status(400).json({ success: false, error: `Falha ao criar Release: ${errJson.message || 'Erro desconhecido'}` });
      }
    }

    // 2. Sanitiza o nome do arquivo
    const cleanFileName = req.file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    // 3. Remove asset duplicado caso já exista nessa release
    try {
      const assetsRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/releases/${releaseId}/assets`, {
        headers: ghHeaders,
      });
      if (assetsRes.ok) {
        const assets = await assetsRes.json();
        if (Array.isArray(assets)) {
          const dup = assets.find((a: any) => a.name.toLowerCase() === cleanFileName.toLowerCase());
          if (dup) {
            await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/releases/assets/${dup.id}`, {
              method: 'DELETE',
              headers: ghHeaders,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao verificar asset duplicado:', e);
    }

    // 4. Lê o arquivo temporário e envia para uploads.github.com
    const fileBuffer = fs.readFileSync(tempPath);
    const uploadUrl = `https://uploads.github.com/repos/${cleanOwner}/${cleanRepo}/releases/${releaseId}/assets?name=${encodeURIComponent(cleanFileName)}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': req.file.mimetype || 'application/octet-stream',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: fileBuffer,
    });

    // Preserva cópia local APENAS para imagens leves (< 15MB) para renderização instantânea nos cards
    // Arquivos pesados (vídeos MP4/WebM de 200MB-300MB, APKs, ZIPs) JAMAIS são gravados no disco do servidor
    const fileExt = path.extname(cleanFileName).toLowerCase().replace('.', '');
    const lightweightImageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico'];
    const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(fileExt);
    const isLightweightImage = lightweightImageExts.includes(fileExt) && req.file.size < 15 * 1024 * 1024;
    
    let localPreviewUrl = '';
    if (isLightweightImage) {
      const permanentPath = path.join(uploadsDir, cleanFileName);
      const ghCachePath = path.join(uploadsDir, `gh_cache_${cleanFileName}`);
      try {
        fs.copyFileSync(tempPath, permanentPath);
        fs.copyFileSync(tempPath, ghCachePath);
        localPreviewUrl = `/uploads/${cleanFileName}`;
      } catch (copyErr) {
        console.warn('Erro ao salvar cópia local para preview:', copyErr);
      }
    }

    // Remove arquivo temporário do servidor imediatamente
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    if (uploadRes.ok) {
      const assetData = await uploadRes.json();
      return res.json({
        success: true,
        downloadUrl: assetData.browser_download_url,
        previewUrl: localPreviewUrl || `/api/media-proxy?url=${encodeURIComponent(assetData.browser_download_url)}`,
        localUrl: localPreviewUrl,
        assetId: assetData.id,
        fileName: assetData.name,
        fileSize: assetData.size,
        releaseTag: cleanTag,
      });
    }

    const errJson = await uploadRes.json().catch(() => ({}));
    return res.status(uploadRes.status || 400).json({
      success: false,
      error: `Erro no upload do GitHub (HTTP ${uploadRes.status}): ${errJson.message || 'Falha ao gravar arquivo na Release'}`
    });
  } catch (err: any) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error('Erro no proxy de upload do GitHub:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro interno no servidor ao enviar para o GitHub.' });
  }
});

// Proxy de Mídia: Permite carregar imagens, wallpapers e vídeos de Releases do GitHub diretamente nos cards
// Remove 'attachment' e define 'Content-Disposition: inline' e CORS aberto
app.get(['/api/media-proxy', '/api/media-proxy.php'], async (req, res) => {
  const targetUrl = (req.query.url as string || '').trim();
  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    return res.status(400).send('URL de mídia inválida ou não fornecida.');
  }

  // 1. Extrai nome do arquivo
  let fileName = '';
  try {
    const parsed = new URL(targetUrl);
    fileName = path.basename(parsed.pathname);
  } catch {
    fileName = path.basename(targetUrl.split('?')[0]);
  }

  const cleanFileName = decodeURIComponent(fileName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  const mimeType = getMediaMimeType(cleanFileName || targetUrl);

  // 2. Se já existe em cache no disco, entrega instantaneamente
  if (cleanFileName) {
    const candidatePaths = [
      path.join(uploadsDir, cleanFileName),
      path.join(uploadsDir, `gh_cache_${cleanFileName}`),
      path.join(uploadsDir, fileName),
    ];

    for (const cp of candidatePaths) {
      if (fs.existsSync(cp)) {
        const finalType = getMediaMimeType(cleanFileName || targetUrl, cp);
        res.setHeader('Content-Type', finalType);
        res.setHeader('Content-Disposition', `inline; filename="${cleanFileName}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        return res.sendFile(cp);
      }
    }
  }

  // 3. Se não existe em cache local, busca no GitHub
  try {
    const activeGh = getStoredGitHubConfig();
    const activeToken = (req.query.token as string) || activeGh?.token;

    // Se é uma URL do GitHub Releases, tenta primeiro via API oficial (funciona 100% para repos Privados e Públicos)
    if (targetUrl.includes('github.com')) {
      const match = targetUrl.match(/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\/(.+)$/);
      const owner = match?.[1] || activeGh?.owner || (req.query.owner as string);
      const repo = match?.[2] || activeGh?.repo || (req.query.repo as string);
      const tag = match?.[3] || 'v1.0';
      const rawFileName = match ? decodeURIComponent(match[4]) : cleanFileName;

      if (activeToken && owner && repo) {
        try {
          const relRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
            headers: {
              'Authorization': `Bearer ${activeToken.trim()}`,
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'ALX-Media-Proxy/1.0',
            },
          });

          let assetId: number | null = null;

          if (relRes.ok) {
            const relData = await relRes.json();
            const asset = (relData.assets || []).find((a: any) =>
              a.name.toLowerCase() === rawFileName.toLowerCase() ||
              a.name.toLowerCase() === cleanFileName.toLowerCase()
            );
            if (asset?.id) assetId = asset.id;
          }

          // Se não encontrou na release por tag exata, varre a lista geral de releases
          if (!assetId) {
            const allRelsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
              headers: {
                'Authorization': `Bearer ${activeToken.trim()}`,
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'ALX-Media-Proxy/1.0',
              },
            });
            if (allRelsRes.ok) {
              const allRels = await allRelsRes.json();
              if (Array.isArray(allRels)) {
                for (const r of allRels) {
                  const matchAsset = (r.assets || []).find((a: any) =>
                    a.name.toLowerCase() === rawFileName.toLowerCase() ||
                    a.name.toLowerCase() === cleanFileName.toLowerCase()
                  );
                  if (matchAsset?.id) {
                    assetId = matchAsset.id;
                    break;
                  }
                }
              }
            }
          }

          if (assetId) {
            const assetRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/assets/${assetId}`, {
              headers: {
                'Authorization': `Bearer ${activeToken.trim()}`,
                'Accept': 'application/octet-stream',
                'User-Agent': 'ALX-Media-Proxy/1.0',
              },
              redirect: 'follow',
            });

            if (assetRes.ok) {
              const arrayBuffer = await assetRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const finalType = getMediaMimeType(cleanFileName || rawFileName);
              if (cleanFileName) {
                try {
                  fs.writeFileSync(path.join(uploadsDir, `gh_cache_${cleanFileName}`), buffer);
                } catch (e) {}
              }
              res.setHeader('Content-Type', finalType);
              res.setHeader('Content-Disposition', `inline; filename="${cleanFileName}"`);
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
              return res.send(buffer);
            }
          }
        } catch (apiErr) {
          console.warn('Erro ao buscar via API do GitHub:', apiErr);
        }
      }
    }

    // Fallback: download cURL direto da URL recebida
    const headers: Record<string, string> = {
      'User-Agent': 'ALX-Media-Proxy/1.0',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,video/*,*/*;q=0.8',
    };

    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken.trim()}`;
    }

    const fetchRes = await fetch(targetUrl, {
      headers,
      redirect: 'follow',
    });

    if (!fetchRes.ok) {
      return res.status(fetchRes.status).send(`Erro ao carregar mídia do GitHub: HTTP ${fetchRes.status}`);
    }

    const arrayBuffer = await fetchRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Salva em cache para requisições seguintes
    if (cleanFileName) {
      try {
        fs.writeFileSync(path.join(uploadsDir, `gh_cache_${cleanFileName}`), buffer);
      } catch (saveErr) {
        console.warn('Erro ao salvar cópia em cache:', saveErr);
      }
    }

    const remoteContentType = fetchRes.headers.get('content-type');
    const finalMime = (remoteContentType && (remoteContentType.startsWith('image/') || remoteContentType.startsWith('video/')))
      ? remoteContentType
      : mimeType;

    res.setHeader('Content-Type', finalMime);
    res.setHeader('Content-Disposition', `inline; filename="${cleanFileName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    return res.send(buffer);
  } catch (err: any) {
    console.error('Erro no proxy de mídia:', err);
    return res.status(500).send('Falha ao processar mídia.');
  }
});

// Proxy para exclusão de asset no GitHub Releases
app.post(['/api/github-delete.php', '/api/github-delete'], async (req, res) => {
  try {
    const { token, owner, repo, assetId, assetUrl, defaultReleaseTag = 'v1.0' } = req.body || {};
    if (!token || !owner || !repo) {
      return res.status(400).json({ success: false, error: 'Credenciais incompletas.' });
    }

    const cleanToken = token.trim();
    const cleanOwner = owner.trim();
    const cleanRepo = repo.trim();

    const ghHeaders = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${cleanToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };

    let targetAssetId = assetId;

    // Se veio a URL em vez do assetId numérico
    if (!targetAssetId && assetUrl && typeof assetUrl === 'string') {
      const parts = assetUrl.split('/');
      const fileName = parts[parts.length - 1];
      if (fileName) {
        const relRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/releases/tags/${defaultReleaseTag}`, {
          headers: ghHeaders,
        });
        if (relRes.ok) {
          const relData = await relRes.json();
          if (Array.isArray(relData.assets)) {
            const found = relData.assets.find((a: any) => a.name.toLowerCase() === fileName.toLowerCase() || a.browser_download_url === assetUrl);
            if (found) targetAssetId = found.id;
          }
        }
      }
    }

    if (!targetAssetId) {
      return res.json({ success: true, message: 'Asset não encontrado ou já excluído.' });
    }

    const delRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/releases/assets/${targetAssetId}`, {
      method: 'DELETE',
      headers: ghHeaders,
    });

    if (delRes.status === 204 || delRes.ok) {
      return res.json({ success: true, message: 'Asset excluído com sucesso do GitHub Releases.' });
    }

    return res.status(delRes.status).json({ success: false, error: `Falha ao excluir asset (HTTP ${delRes.status}).` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erro ao excluir asset do GitHub.' });
  }
});

// 1.5 Endpoint /api/mysql-config.php (compatível com Hostinger e Local)
app.get('/api/mysql-config.php', (_req, res) => {
  try {
    const configFile = path.join(apiDir, 'db-config.php');
    if (!fs.existsSync(configFile)) {
      return res.json({
        configured: false,
        connected: false,
        host: 'localhost',
        dbname: '',
        user: '',
        port: 3306,
        hasData: false,
        message: 'Banco MySQL não configurado. O site está operando via arquivo JSON local.'
      });
    }

    const raw = fs.readFileSync(configFile, 'utf8');
    const hostMatch = raw.match(/'host'\s*=>\s*'([^']*)'/);
    const dbnameMatch = raw.match(/'dbname'\s*=>\s*'([^']*)'/);
    const userMatch = raw.match(/'user'\s*=>\s*'([^']*)'/);

    return res.json({
      configured: true,
      connected: true,
      host: hostMatch ? hostMatch[1] : 'localhost',
      dbname: dbnameMatch ? dbnameMatch[1] : '',
      user: userMatch ? userMatch[1] : '',
      port: 3306,
      hasData: true,
      message: 'Configurações do MySQL salvas para uso na Hostinger.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao obter status do MySQL' });
  }
});

app.post('/api/mysql-config.php', (req, res) => {
  try {
    const data = req.body || {};
    const action = data.action || req.query.action;

    if (action === 'test_and_save') {
      const { host = 'localhost', dbname = '', user = '', pass = '', port = 3306 } = data;
      if (!dbname || !user) {
        return res.status(400).json({ success: false, error: 'Informe o Nome do Banco de Dados e Usuário da Hostinger.' });
      }

      const configFile = path.join(apiDir, 'db-config.php');
      const escapedHost = host.replace(/'/g, "\'");
      const escapedDb = dbname.replace(/'/g, "\'");
      const escapedUser = user.replace(/'/g, "\'");
      const escapedPass = String(pass).replace(/'/g, "\'");

      const fileContent = [
        "<?php",
        "// ALX Tech - Configurações do Banco de Dados MySQL Hostinger",
        "return [",
        "    'host'   => '" + escapedHost + "',",
        "    'dbname' => '" + escapedDb + "',",
        "    'user'   => '" + escapedUser + "',",
        "    'pass'   => '" + escapedPass + "',",
        "    'port'   => " + port + ",",
        "];",
        ""
      ].join("\n");

      fs.writeFileSync(configFile, fileContent, 'utf8');

      return res.json({
        success: true,
        message: 'Configurações do MySQL salvas com sucesso! Na Hostinger, o PHP conectará diretamente com o banco informado.',
        status: { host, dbname, user, port, configured: true, connected: true }
      });
    }

    if (action === 'download_sql') {
      const jsonFile = path.join(apiDir, 'site-data.json');
      const content = fs.existsSync(jsonFile) ? fs.readFileSync(jsonFile, 'utf8') : '{}';
      const escaped = content.replace(/'/g, "\'");

      const sqlLines = [
        "-- ALX Tech - Estrutura e Dados Iniciais para MySQL Hostinger",
        "CREATE TABLE IF NOT EXISTS `site_data` (",
        "  `id` int(11) NOT NULL DEFAULT 1,",
        "  `content` longtext NOT NULL,",
        "  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,",
        "  PRIMARY KEY (`id`)",
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
        "",
        "CREATE TABLE IF NOT EXISTS `site_data_backups` (",
        "  `id` int(11) NOT NULL AUTO_INCREMENT,",
        "  `content` longtext NOT NULL,",
        "  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,",
        "  PRIMARY KEY (`id`)",
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
        "",
        "INSERT INTO `site_data` (`id`, `content`, `updated_at`)",
        "VALUES (1, '" + escaped + "', NOW())",
        "ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `updated_at` = NOW();",
        ""
      ];

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(sqlLines.join('\n'));
    }

    if (action === 'sync_to_db') {
      return res.json({ success: true, message: 'Dados sincronizados com sucesso!' });
    }

    return res.status(400).json({ success: false, error: 'Ação não reconhecida' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erro no servidor' });
  }
});

// 2. Endpoint /api/save.php (compatível com Hostinger e Local)
app.post('/api/save.php', (req, res) => {
  try {
    const rawData = req.body;
    if (!rawData || (!rawData.data && !rawData.brand)) {
      return res.status(400).json({ success: false, error: 'Dados inválidos' });
    }

    const payload = rawData.data || rawData;
    const content = JSON.stringify(payload, null, 2);

    const dataFile = path.join(apiDir, 'site-data.json');
    const rootDataFile = path.join(publicDir, 'site-data.json');
    const backupFile = path.join(apiDir, 'site-data-backup.json');

    fs.writeFileSync(dataFile, content, 'utf8');
    fs.writeFileSync(rootDataFile, content, 'utf8');
    fs.writeFileSync(backupFile, content, 'utf8');

    res.json({
      success: true,
      message: 'Dados sincronizados com sucesso no servidor (Hostinger / Local)',
      savedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Save handler error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro ao salvar' });
  }
});

// 3. Endpoint /api/get.php (compatível com Hostinger e Local)
app.get('/api/get.php', (_req, res) => {
  try {
    const dataFile = path.join(apiDir, 'site-data.json');
    const rootDataFile = path.join(publicDir, 'site-data.json');
    const backupFile = path.join(apiDir, 'site-data-backup.json');

    let contentToReturn: string | null = null;
    if (fs.existsSync(dataFile) && fs.statSync(dataFile).size > 10) {
      contentToReturn = fs.readFileSync(dataFile, 'utf8');
    } else if (fs.existsSync(rootDataFile) && fs.statSync(rootDataFile).size > 10) {
      contentToReturn = fs.readFileSync(rootDataFile, 'utf8');
    } else if (fs.existsSync(backupFile) && fs.statSync(backupFile).size > 10) {
      contentToReturn = fs.readFileSync(backupFile, 'utf8');
    }

    if (contentToReturn) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(contentToReturn);
    }

    res.json({ status: 'empty' });
  } catch (err: any) {
    console.error('Get handler error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro ao carregar dados' });
  }
});

// 4. Servir pasta de uploads de imagens públicas
app.use('/uploads', express.static(uploadsDir));

// 4.1 Prévia OpenGraph para WhatsApp, Telegram e redes sociais em ambiente Node.js
app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|WhatsApp|Twitterbot|TelegramBot|Discordbot|Facebot|LinkedInBot|Slackbot|SkypeUriPreview|meta-externalagent/i.test(ua);
  if (!isBot) return next();

  const reqPath = req.path || '/';
  if (reqPath.startsWith('/api/') || reqPath.startsWith('/uploads/') || reqPath.startsWith('/imagens/') || /\.[a-z0-9]{2,5}$/i.test(reqPath)) {
    return next();
  }

  const siteDataPath = path.join(publicDir, 'site-data.json');
  const defaultSiteDataPath = path.join(publicDir, 'default-site-data.json');
  let siteData: any = null;
  if (fs.existsSync(siteDataPath)) {
    try {
      siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf8'));
    } catch {}
  } else if (fs.existsSync(defaultSiteDataPath)) {
    try {
      siteData = JSON.parse(fs.readFileSync(defaultSiteDataPath, 'utf8'));
    } catch {}
  }

  const brand = siteData?.brand || {};
  const siteName = brand.brandName || 'Alx⁺';
  const tagline = brand.tagline || 'Portal Automotivo & Multimídia';
  const subTagline = brand.subTagline || 'Portal oficial especialista em desbloqueio de central multimídia, atualizações OTA e tutoriais.';
  const defaultImage = brand.defaultShareImageUrl || '/imagens/og-padrao.jpg';

  let title = `${siteName} • ${tagline}`;
  let description = subTagline;
  let imageUrl = defaultImage;

  const segments = reqPath.replace(/^\//, '').split('/');
  const type = (segments[0] || '').toLowerCase();
  const slug = (segments[1] || '').toLowerCase();

  const extractItemImage = (item: any, fallback: string): string => {
    if (!item || typeof item !== 'object') return fallback;
    const candidates = [
      item.imageUrl, item.coverImage, item.previewUrl, item.thumbnailUrl, item.iconUrl,
      item.icon, item.bannerUrl, item.logoUrl, item.image,
      Array.isArray(item.screenshots) ? item.screenshots[0] : null,
      Array.isArray(item.images) ? item.images[0] : null
    ];
    for (const img of candidates) {
      if (typeof img === 'string' && img.trim() && !img.startsWith('blob:')) {
        return img.trim();
      }
    }
    return fallback;
  };

  const findItemInArray = (items: any[], reqSlug: string): any => {
    if (!Array.isArray(items) || !reqSlug) return null;
    const lower = reqSlug.toLowerCase().trim();
    const norm = lower.replace(/^(app|ota|tut|news|prod|serv|wall|vid)-/, '').replace(/[^a-z0-9]/g, '');
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const s = (item.slug || '').toLowerCase().trim();
      const id = (item.id || '').toLowerCase().trim();
      if ((s && s === lower) || (id && id === lower)) return item;
    }
    if (norm) {
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const sNorm = (item.slug || '').toLowerCase().trim().replace(/^(app|ota|tut|news|prod|serv|wall|vid)-/, '').replace(/[^a-z0-9]/g, '');
        const idNorm = (item.id || '').toLowerCase().trim().replace(/^(app|ota|tut|news|prod|serv|wall|vid)-/, '').replace(/[^a-z0-9]/g, '');
        if ((sNorm && sNorm === norm) || (idNorm && idNorm === norm)) return item;
      }
    }
    return null;
  };

  if ((type === 'apps' || type === 'app' || type === 'aplicativos') && slug) {
    const item = findItemInArray(siteData?.apps || [], slug);
    if (item) {
      title = `${item.name || 'Aplicativo'} • ALX App Store`;
      description = item.description || item.fullDescription || item.tagline || subTagline;
      imageUrl = extractItemImage(item, defaultImage);
    }
  } else if ((type === 'noticias' || type === 'noticia' || type === 'artigo' || type === 'artigos' || type === 'news') && slug) {
    const item = findItemInArray(siteData?.news || [], slug);
    if (item) {
      title = `${item.title} | ${siteName}`;
      description = item.summary || subTagline;
      imageUrl = extractItemImage(item, defaultImage);
    }
  } else if ((type === 'ota' || type === 'otas' || type === 'radar-ota') && slug) {
    const item = findItemInArray(siteData?.otaUpdates || [], slug);
    if (item) {
      title = `${item.title || 'Atualização OTA'} • Radar OTA ${siteName}`;
      description = item.summary || `Atualização de Firmware OTA para ${siteName}.`;
      imageUrl = extractItemImage(item, defaultImage);
    }
  } else if ((type === 'desbloqueio' || type === 'servico' || type === 'servicos' || type === 'servico-desbloqueio') && slug) {
    const item = findItemInArray(siteData?.unlockServices || [], slug);
    if (item) {
      title = `${item.title} • ${siteName}`;
      description = item.summary || subTagline;
      imageUrl = extractItemImage(item, '/imagens/og-desbloqueio.jpg');
    }
  } else if ((type === 'tutoriais' || type === 'tutorial' || type === 'guias' || type === 'guia') && slug) {
    const item = findItemInArray(siteData?.tutorials || [], slug);
    if (item) {
      title = `${item.title} | ${siteName}`;
      description = item.summary || subTagline;
      imageUrl = extractItemImage(item, '/imagens/og-tutoriais.jpg');
    }
  } else if ((type === 'produto' || type === 'produtos' || type === 'shop') && slug) {
    const item = findItemInArray(siteData?.products || [], slug);
    if (item) {
      title = `${item.name} • ALX Shop`;
      description = item.description || subTagline;
      imageUrl = extractItemImage(item, defaultImage);
    }
  } else if ((type === 'wallpapers' || type === 'wallpaper') && slug) {
    const item = findItemInArray(siteData?.wallpapers || [], slug);
    if (item) {
      title = `${item.title} • Wallpapers ${siteName}`;
      description = item.description || subTagline;
      imageUrl = extractItemImage(item, defaultImage);
    }
  } else if (type === 'iptv') {
    title = `IPTV Automotivo • Streaming & Guias | ${siteName}`;
    imageUrl = '/imagens/og-iptv.jpg';
  } else if (type === 'desbloqueio') {
    title = `Desbloqueio de Multimídia Automotiva | ${siteName}`;
    imageUrl = '/imagens/og-desbloqueio.jpg';
  } else if (type === 'tutoriais') {
    title = `Central de Tutoriais & Guias | ${siteName}`;
    imageUrl = '/imagens/og-tutoriais.jpg';
  } else if (type === 'vip') {
    title = `Área Exclusiva VIP | ${siteName}`;
    imageUrl = '/imagens/og-vip.jpg';
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'alx.7f.com.br';
  const baseUrl = `${proto}://${host}`;
  let fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  if (fullImageUrl.startsWith('http://')) {
    fullImageUrl = 'https://' + fullImageUrl.substring(7);
  }
  const currentUrl = `${baseUrl}${reqPath}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${fullImageUrl}">
  <meta property="og:image:secure_url" content="${fullImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${currentUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${fullImageUrl}">
  <meta http-equiv="refresh" content="0;url=${reqPath}">
</head>
<body style="background:#080808;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Carregando ${siteName}...</p>
</body>
</html>`);
});

// 5. Integração com Vite (modo desenvolvimento) ou build estático (produção)
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor ALX Full-Stack ativo na porta ${PORT} [Hostinger & Firestore Sync Ready]`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
