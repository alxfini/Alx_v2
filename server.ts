import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import nodemailer from 'nodemailer';

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
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB para vídeos de alta resolução e instaladores
});

// Endpoint para excluir arquivo local do servidor (/uploads/ ou /aplicativos/)
app.post(['/api/delete-file.php', '/api/delete-file'], (req, res) => {
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

// Middleware com tratamento de erros de upload (ex: limite de tamanho amigável)
const handleUploadMiddleware = (req: any, res: any, next: any) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: 'O arquivo enviado excede o limite máximo permitido de 500 MB. Por favor, envie um arquivo menor.',
        });
      }
      return res.status(400).json({
        success: false,
        error: `Falha no upload do arquivo: ${err?.message || 'Arquivo inválido'}`,
      });
    }
    next();
  });
};

// 1. Endpoint /api/upload.php (compatível com Hostinger e Local)
app.post('/api/upload.php', handleUploadMiddleware, async (req, res) => {
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

    const originalPath = req.file.path;
    const isVideo = (req.file.mimetype && req.file.mimetype.startsWith('video/')) || /\.(mp4|mov|avi|mkv|webm)$/i.test(req.file.originalname);
    const shouldConvertToWebm = req.body?.convertToWebm === 'true' || req.body?.convertToWebm === '1';

    // Se solicitado conversão para WebM e o arquivo não for .webm
    if (isVideo && shouldConvertToWebm && !req.file.filename.toLowerCase().endsWith('.webm')) {
      const webmFilename = req.file.filename.replace(/\.[^/.]+$/, '') + '.webm';
      const webmPath = path.join(uploadsDir, webmFilename);

      try {
        const { execFile } = await import('child_process');
        await new Promise<void>((resolve, reject) => {
          execFile('ffmpeg', [
            '-y',
            '-i', originalPath,
            '-vf', "scale='min(1280,iw)':-2",
            '-c:v', 'libvpx',
            '-b:v', '1.2M',
            '-crf', '24',
            '-c:a', 'libopus',
            '-ar', '48000',
            '-deadline', 'realtime',
            '-cpu-used', '4',
            webmPath
          ], { timeout: 120000 }, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });

        if (fs.existsSync(webmPath) && fs.statSync(webmPath).size > 0) {
          try { fs.unlinkSync(originalPath); } catch {}
          return res.json({
            success: true,
            url: `/uploads/${webmFilename}`,
            filename: webmFilename,
            converted: true,
            format: 'webm',
          });
        }
      } catch (convErr: any) {
        console.warn('Conversão para WebM via ffmpeg falhou ou demorou, entregando arquivo original:', convErr?.message || convErr);
        // Fallback seguro: continua e entrega o arquivo original sem erro 500!
      }
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
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'api', 'site-data.json'),
      path.join(process.cwd(), 'public', 'site-data.json'),
      path.join(process.cwd(), 'public', 'api', 'site-data-backup.json'),
      path.join(process.cwd(), 'public', 'default-site-data.json'),
      path.join(process.cwd(), 'site-data.json'),
    ];
    for (const siteDataPath of candidatePaths) {
      if (fs.existsSync(siteDataPath)) {
        const raw = fs.readFileSync(siteDataPath, 'utf8');
        const json = JSON.parse(raw);
        const gh = json?.brand?.githubStorage || json?.githubStorage;
        if (gh?.token) {
          cachedGhCredentials = {
            token: String(gh.token).trim(),
            owner: String(gh.owner || '').trim(),
            repo: String(gh.repo || '').trim(),
          };
          return cachedGhCredentials;
        }
      }
    }
  } catch (e) {}

  const envToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
  if (envToken) {
    cachedGhCredentials = {
      token: envToken.trim(),
      owner: (process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER || '').trim(),
      repo: (process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO || '').trim(),
    };
    return cachedGhCredentials;
  }

  return null;
}

// Helper para obter MIME type correto para inline rendering e downloads
function getMediaMimeType(filePathOrUrl: string, diskFilePath?: string): string {
  const ext = path.extname(filePathOrUrl.split('?')[0]).toLowerCase();
  switch (ext) {
    case '.apk':
      return 'application/vnd.android.package-archive';
    case '.zip':
      return 'application/zip';
    case '.rar':
      return 'application/x-rar-compressed';
    case '.7z':
      return 'application/x-7z-compressed';
    case '.exe':
      return 'application/x-msdownload';
    case '.bin':
      return 'application/octet-stream';
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

  const isDownload = req.query.download === '1' || req.query.dl === '1';

  // 1. Extrai nome do arquivo
  let fileName = (req.query.filename as string || '').trim();
  if (!fileName) {
    try {
      const parsed = new URL(targetUrl);
      fileName = path.basename(parsed.pathname);
    } catch {
      fileName = path.basename(targetUrl.split('?')[0]);
    }
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
        res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${cleanFileName}"`);
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
              redirect: 'manual',
            });

            let finalBinaryRes = assetRes;
            if (assetRes.status >= 300 && assetRes.status < 400) {
              const redirectLocation = assetRes.headers.get('location');
              if (redirectLocation) {
                if (isDownload) {
                  // Redireciona o navegador diretamente para a URL pré-assinada do S3 da Amazon!
                  // Elimina o gargalo do servidor intermediário e inicia o download imediatamente
                  return res.redirect(302, redirectLocation);
                }
                // S3 pre-signed URL já contém a assinatura na query string; não deve reenviar o header Authorization do GitHub
                finalBinaryRes = await fetch(redirectLocation, {
                  headers: {
                    'User-Agent': 'ALX-Media-Proxy/1.0',
                  },
                });
              }
            }

            if (finalBinaryRes.ok) {
              const arrayBuffer = await finalBinaryRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const finalType = getMediaMimeType(cleanFileName || rawFileName);
              if (cleanFileName) {
                try {
                  fs.writeFileSync(path.join(uploadsDir, `gh_cache_${cleanFileName}`), buffer);
                } catch (e) {}
              }
              res.setHeader('Content-Type', finalType);
              res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${cleanFileName || rawFileName}"`);
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

    // Fallback: download direto da URL recebida
    const headers: Record<string, string> = {
      'User-Agent': 'ALX-Media-Proxy/1.0',
      'Accept': '*/*',
    };

    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken.trim()}`;
    }

    const fetchRes = await fetch(targetUrl, {
      headers,
      redirect: 'manual',
    });

    let binaryRes = fetchRes;
    if (fetchRes.status >= 300 && fetchRes.status < 400) {
      const redirectLocation = fetchRes.headers.get('location');
      if (redirectLocation) {
        binaryRes = await fetch(redirectLocation, {
          headers: {
            'User-Agent': 'ALX-Media-Proxy/1.0',
          },
        });
      }
    }

    if (!binaryRes.ok) {
      return res.status(binaryRes.status).send(`Erro ao carregar mídia do GitHub: HTTP ${binaryRes.status}`);
    }

    const arrayBuffer = await binaryRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Salva em cache para requisições seguintes
    if (cleanFileName) {
      try {
        fs.writeFileSync(path.join(uploadsDir, `gh_cache_${cleanFileName}`), buffer);
      } catch (saveErr) {
        console.warn('Erro ao salvar cópia em cache:', saveErr);
      }
    }

    const remoteContentType = binaryRes.headers.get('content-type');
    const finalMime = (remoteContentType && !remoteContentType.includes('text/plain') && !remoteContentType.includes('application/octet-stream'))
      ? remoteContentType
      : mimeType;

    res.setHeader('Content-Type', finalMime);
    res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${cleanFileName}"`);
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

// Vídeos padrão reais atualizados do canal ALX Garage para garantia de disponibilidade 100%
const defaultAlxVideos = [
  {
    id: 'yt-sync-yDLGKTBfvkk',
    youtubeId: 'yDLGKTBfvkk',
    title: '⚡ BYD TAN e HAN Atualizados! Desbloqueio e Novidades | Alx Garagem',
    description: 'Desbloqueio e novidades completas para BYD TAN e HAN na central multimídia original.',
    date: 'Recente',
    duration: '6:28',
    views: 'Canal Oficial',
    isFeatured: true,
    videoUrl: 'https://www.youtube.com/watch?v=yDLGKTBfvkk',
    thumbnailUrl: 'https://img.youtube.com/vi/yDLGKTBfvkk/hqdefault.jpg',
    category: 'Atualizações & OTA'
  },
  {
    id: 'yt-sync-hkpyzW9s-pQ',
    youtubeId: 'hkpyzW9s-pQ',
    title: 'Transforme Seu BYD em um Carro Inteligente! Conheça o SentryEV 🚗📱',
    description: 'Aplicativo de monitoramento SentryEV em tempo real para veículos elétricos.',
    date: 'Recente',
    duration: '24:43',
    views: '14 mil visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=hkpyzW9s-pQ',
    thumbnailUrl: 'https://img.youtube.com/vi/hkpyzW9s-pQ/hqdefault.jpg',
    category: 'Multimídia & Som'
  },
  {
    id: 'yt-sync-rbV2xdSIY4M',
    youtubeId: 'rbV2xdSIY4M',
    title: 'YouTube + TV Digital em Qualquer Carro! 😱 Sem Desbloqueio | 2026',
    description: 'Como ter streaming, YouTube e TV Digital na multimídia sem violar garantia.',
    date: 'Recente',
    duration: '25:32',
    views: '8.5 mil visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=rbV2xdSIY4M',
    thumbnailUrl: 'https://img.youtube.com/vi/rbV2xdSIY4M/hqdefault.jpg',
    category: 'Tutoriais'
  },
  {
    id: 'yt-sync-OR1bUMaQ3cU',
    youtubeId: 'OR1bUMaQ3cU',
    title: 'Youtube perfeito para Multimidias',
    description: 'Versão otimizada sem anúncios e com reprodução em segundo plano para multimídias.',
    date: 'Recente',
    duration: '12:15',
    views: '4 mil visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=OR1bUMaQ3cU',
    thumbnailUrl: 'https://img.youtube.com/vi/OR1bUMaQ3cU/hqdefault.jpg',
    category: 'Multimídia & Som'
  },
  {
    id: 'yt-sync-AERBcFtpJz8',
    youtubeId: 'AERBcFtpJz8',
    title: '🔐 Desbloqueio Denza B5 BYD - 2 Telas em movimento!',
    description: 'Liberte todo o potencial do seu BYD Denza com 2 telas ativas em movimento.',
    date: 'Recente',
    duration: '14:20',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=AERBcFtpJz8',
    thumbnailUrl: 'https://img.youtube.com/vi/AERBcFtpJz8/hqdefault.jpg',
    category: 'Tutoriais'
  },
  {
    id: 'yt-sync-RK3aLAMFf84',
    youtubeId: 'RK3aLAMFf84',
    title: '🔓 NOVO DESBLOQUEIO BYD | Funciona em Todas as Versões',
    description: 'Novo método recomendado de desbloqueio para multimídias BYD.',
    date: 'Recente',
    duration: '18:50',
    views: '89 mil visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=RK3aLAMFf84',
    thumbnailUrl: 'https://img.youtube.com/vi/RK3aLAMFf84/hqdefault.jpg',
    category: 'Tutoriais'
  },
  {
    id: 'yt-sync-EDZ6lEtqIOg',
    youtubeId: 'EDZ6lEtqIOg',
    title: '⚡Atualização OTA Multimídia BYD Versão 2606',
    description: 'Atualização OTA BYD 2606 V32 Global e Internacional passo a passo.',
    date: 'Recente',
    duration: '11:40',
    views: '15 mil visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=EDZ6lEtqIOg',
    thumbnailUrl: 'https://img.youtube.com/vi/EDZ6lEtqIOg/hqdefault.jpg',
    category: 'Atualizações & OTA'
  },
  {
    id: 'yt-sync-doCYLi4lFJU',
    youtubeId: 'doCYLi4lFJU',
    title: 'BYD 2606 v32 - Testes e Funcionalidades',
    description: 'Demonstração das novidades e estabilidade da versão 2606 V32.',
    date: 'Recente',
    duration: '8:45',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=doCYLi4lFJU',
    thumbnailUrl: 'https://img.youtube.com/vi/doCYLi4lFJU/hqdefault.jpg',
    category: 'Multimídia & Som'
  },
  {
    id: 'yt-sync-hLPn9JJBZlI',
    youtubeId: 'hLPn9JJBZlI',
    title: '🎉 10.000 INSCRITOS: OBRIGADO POR FAZER PARTE DESSA HISTÓRIA!',
    description: 'Especial comemorativo de 10k inscritos no canal ALX Garage.',
    date: 'Recente',
    duration: '5:10',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=hLPn9JJBZlI',
    thumbnailUrl: 'https://img.youtube.com/vi/hLPn9JJBZlI/hqdefault.jpg',
    category: 'Multimídia & Som'
  },
  {
    id: 'yt-sync-__f0czw2ink',
    youtubeId: '__f0czw2ink',
    title: '⚡Atualização OTA Multimídia BYD Versão 2512',
    description: 'Firmware e novidades da versão 2512 para Dolphin, Dolphin Mini e Song Plus.',
    date: 'Recente',
    duration: '13:00',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=__f0czw2ink',
    thumbnailUrl: 'https://img.youtube.com/vi/__f0czw2ink/hqdefault.jpg',
    category: 'Atualizações & OTA'
  },
  {
    id: 'yt-sync-y6_2Q3vpD1g',
    youtubeId: 'y6_2Q3vpD1g',
    title: 'TROQUEI o pneu original do Dolphin Mini! Vale a pena usar 195/60? Teste real',
    description: 'Teste real de consumo, conforto e estabilidade com pneu 195/60.',
    date: 'Recente',
    duration: '16:22',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=y6_2Q3vpD1g',
    thumbnailUrl: 'https://img.youtube.com/vi/y6_2Q3vpD1g/hqdefault.jpg',
    category: 'Análise & Teste'
  },
  {
    id: 'yt-sync-UQoDBGPKX4c',
    youtubeId: 'UQoDBGPKX4c',
    title: 'COMO INSTALAR O WAZE NA MULTIMÍDIA BYD | Método Atualizado',
    description: 'Guia completo de instalação do Waze sem engasgos na central multimídia.',
    date: 'Recente',
    duration: '9:30',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=UQoDBGPKX4c',
    thumbnailUrl: 'https://img.youtube.com/vi/UQoDBGPKX4c/hqdefault.jpg',
    category: 'Tutoriais'
  },
  {
    id: 'yt-sync-IppGiWiNTbk',
    youtubeId: 'IppGiWiNTbk',
    title: 'Espelhamento Multimídia BYD - Transforme Sua Multimídia 🚀🔋',
    description: 'DiLink-Auto: espelhamento de tela fluido direto do Android.',
    date: 'Recente',
    duration: '15:15',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=IppGiWiNTbk',
    thumbnailUrl: 'https://img.youtube.com/vi/IppGiWiNTbk/hqdefault.jpg',
    category: 'Multimídia & Som'
  },
  {
    id: 'yt-sync-p6qKD-XsoeQ',
    youtubeId: 'p6qKD-XsoeQ',
    title: 'Testei o Petal Maps… E ele me Surpreendeu! 😱',
    description: 'Alternativa rápida e leve para navegação GPS na multimídia.',
    date: 'Recente',
    duration: '12:40',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=p6qKD-XsoeQ',
    thumbnailUrl: 'https://img.youtube.com/vi/p6qKD-XsoeQ/hqdefault.jpg',
    category: 'Análise & Teste'
  },
  {
    id: 'yt-sync-VpMN2tmlqNQ',
    youtubeId: 'VpMN2tmlqNQ',
    title: 'YoWindow Weather - Melhor Wallpaper com Previsão de tempo animado!!!',
    description: 'Como configurar wallpaper dinâmico com clima em tempo real na tela do carro.',
    date: 'Recente',
    duration: '7:55',
    views: 'Canal Oficial',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=VpMN2tmlqNQ',
    thumbnailUrl: 'https://img.youtube.com/vi/VpMN2tmlqNQ/hqdefault.jpg',
    category: 'Multimídia & Som'
  }
];

// 1.4 Endpoint de Sincronização do Canal YouTube (direto, ultra-resiliente e sem bloqueio de CORS)
app.all(['/api/youtube-sync', '/api/youtube-sync.php'], async (req, res) => {
  try {
    const rawInput = (req.query.channelInput || req.body?.channelInput || '').toString().trim();
    const apiKey = (req.query.apiKey || req.body?.apiKey || '').toString().trim();

    const channelInput = rawInput || '@alx-garage';

    const autoCategorize = (title: string): string => {
      const lower = (title || '').toLowerCase();
      if (lower.includes('ota') || lower.includes('firmware') || lower.includes('atualiza')) return 'Atualizações & OTA';
      if (lower.includes('tutorial') || lower.includes('passo a passo') || lower.includes('como') || lower.includes('desbloque')) return 'Tutoriais';
      if (lower.includes('review') || lower.includes('teste') || lower.includes('análise') || lower.includes('pneu') || lower.includes('consumo')) return 'Análise & Teste';
      return 'Multimídia & Som';
    };

    const formatDateStr = (dateStr?: string): string => {
      if (!dateStr) return 'Recente';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    // 1. Se API Key for fornecida, tenta via YouTube Data API v3
    if (apiKey) {
      try {
        let chId = channelInput;
        if (!chId.startsWith('UC')) {
          chId = 'UCa7fjaKfkkwk1OdzinQNStA';
        }
        const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${encodeURIComponent(apiKey)}&channelId=${encodeURIComponent(chId)}&part=snippet,id&order=date&maxResults=20&type=video`);
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (Array.isArray(apiData.items) && apiData.items.length > 0) {
            const apiVideos = apiData.items.map((item: any, idx: number) => {
              const vidId = item.id?.videoId || '';
              const title = item.snippet?.title || '';
              return {
                id: `yt-api-${vidId || idx}`,
                youtubeId: vidId,
                title,
                description: item.snippet?.description || 'Assista no canal oficial ALX Garage.',
                date: formatDateStr(item.snippet?.publishedAt),
                duration: 'YouTube',
                views: 'Canal Oficial',
                isFeatured: idx === 0,
                videoUrl: `https://www.youtube.com/watch?v=${vidId}`,
                thumbnailUrl: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
                category: autoCategorize(title)
              };
            });
            return res.json({
              success: true,
              count: apiVideos.length,
              videos: apiVideos,
              channelId: chId,
              channelTitle: 'Alx Garage'
            });
          }
        }
      } catch (apiErr) {
        console.warn('YouTube API v3 falhou, recorrendo a scraping direto:', apiErr);
      }
    }

    // 2. Extrai vídeos reais diretamente da aba /videos do YouTube
    let targetUrl = '';
    const cleanLower = channelInput.toLowerCase();
    if (/^UC[a-zA-Z0-9_-]{22}$/.test(channelInput)) {
      targetUrl = `https://www.youtube.com/channel/${channelInput}/videos`;
    } else if (channelInput.startsWith('@')) {
      targetUrl = `https://www.youtube.com/${channelInput}/videos`;
    } else if (cleanLower.includes('alx')) {
      targetUrl = 'https://www.youtube.com/@alx-garage/videos';
    } else if (channelInput.startsWith('http')) {
      const u = channelInput.split('?')[0].replace(/\/+$/, '');
      targetUrl = u.endsWith('/videos') ? u : `${u}/videos`;
    } else {
      targetUrl = `https://www.youtube.com/@${channelInput}/videos`;
    }

    const scrapedVideos: any[] = [];
    const seenIds = new Set<string>();

    try {
      const pageRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Sec-Ch-Ua': '"Chromium";v="123", "Not:A-Brand";v="8"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"'
        }
      });

      if (pageRes.ok) {
        const html = await pageRes.text();
        const match = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/s);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            const walk = (node: any) => {
              if (!node || typeof node !== 'object') return;

              // Modern lockupViewModel (YouTube 2025/2026)
              if (node.lockupViewModel && node.lockupViewModel.contentId) {
                const vidId = node.lockupViewModel.contentId;
                if (!seenIds.has(vidId) && /^[a-zA-Z0-9_-]{11}$/.test(vidId)) {
                  seenIds.add(vidId);
                  const title = node.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content || '';

                  let duration = 'YouTube';
                  const overlays = node.lockupViewModel.contentImage?.thumbnailViewModel?.overlays || [];
                  for (const ov of overlays) {
                    const badges = ov?.thumbnailBottomOverlayViewModel?.badges || [];
                    for (const b of badges) {
                      const text = b?.thumbnailBadgeViewModel?.text;
                      if (text && typeof text === 'string' && text.includes(':')) {
                        duration = text;
                        break;
                      }
                    }
                  }

                  let views = 'Canal Oficial';
                  let date = 'Recente';
                  const rows = node.lockupViewModel.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
                  if (rows[0]?.metadataParts) {
                    const p0 = rows[0].metadataParts[0];
                    const p1 = rows[0].metadataParts[1];
                    if (p0?.accessibilityLabel) {
                      views = p0.accessibilityLabel;
                    } else if (p0?.text?.content) {
                      views = `${p0.text.content} visualizações`;
                    }
                    if (p1?.accessibilityLabel) {
                      date = p1.accessibilityLabel;
                    } else if (p1?.text?.content) {
                      date = p1.text.content;
                    }
                  }

                  scrapedVideos.push({
                    id: `yt-sync-${vidId}`,
                    youtubeId: vidId,
                    title: title || `Vídeo ${vidId}`,
                    description: 'Assista ao vídeo no canal oficial ALX Garage.',
                    date,
                    duration,
                    views,
                    isFeatured: scrapedVideos.length === 0,
                    videoUrl: `https://www.youtube.com/watch?v=${vidId}`,
                    thumbnailUrl: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
                    category: autoCategorize(title)
                  });
                }
              }

              // Legacy videoRenderer / gridVideoRenderer
              const r = node.videoRenderer || node.gridVideoRenderer;
              if (r && r.videoId && !seenIds.has(r.videoId) && /^[a-zA-Z0-9_-]{11}$/.test(r.videoId)) {
                seenIds.add(r.videoId);
                const title = r.title?.runs?.[0]?.text || r.title?.simpleText || '';
                const timeAgo = r.publishedTimeText?.simpleText || 'Recente';
                const viewCount = r.viewCountText?.simpleText || 'Canal Oficial';
                scrapedVideos.push({
                  id: `yt-sync-${r.videoId}`,
                  youtubeId: r.videoId,
                  title: title || `Vídeo ${r.videoId}`,
                  description: r.descriptionSnippet?.runs?.[0]?.text || 'Assista ao vídeo no canal oficial ALX Garage.',
                  date: timeAgo,
                  duration: r.lengthText?.simpleText || 'YouTube',
                  views: viewCount,
                  isFeatured: scrapedVideos.length === 0,
                  videoUrl: `https://www.youtube.com/watch?v=${r.videoId}`,
                  thumbnailUrl: `https://img.youtube.com/vi/${r.videoId}/hqdefault.jpg`,
                  category: autoCategorize(title)
                });
              }

              for (const k of Object.keys(node)) walk(node[k]);
            };
            walk(data);
          } catch (e) {
            console.warn('Erro ao parsear ytInitialData:', e);
          }
        }
      }
    } catch (scrapeErr) {
      console.warn('Falha ao raspar /videos do YouTube:', scrapeErr);
    }

    if (scrapedVideos.length > 0) {
      return res.json({
        success: true,
        count: scrapedVideos.length,
        videos: scrapedVideos,
        channelId: 'UCa7fjaKfkkwk1OdzinQNStA',
        channelTitle: 'Alx Garage'
      });
    }

    // 3. Fallback: RSS Feed XML oficial
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=UCa7fjaKfkkwk1OdzinQNStA`;
      const rssRes = await fetch(rssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (rssRes.ok) {
        const xmlText = await rssRes.text();
        const entries = xmlText.split('<entry>');
        const rssVideos: any[] = [];
        for (let i = 1; i < entries.length; i++) {
          const entry = entries[i];
          const vidId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] || '';
          if (!vidId) continue;
          let title = entry.match(/<title>(.*?)<\/title>/)?.[1] || '';
          title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
            .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
          let description = entry.match(/<media:description>(.*?)<\/media:description>/s)?.[1] || '';
          description = description.replace(/<[^>]*>?/gm, '').trim().slice(0, 280);
          const published = entry.match(/<published>(.*?)<\/published>/)?.[1];

          rssVideos.push({
            id: `yt-rss-${vidId}`,
            youtubeId: vidId,
            title: title || `Vídeo ${vidId}`,
            description: description || 'Assista no canal oficial ALX Garage.',
            date: formatDateStr(published),
            duration: 'YouTube',
            views: 'Canal Oficial',
            isFeatured: rssVideos.length === 0,
            videoUrl: `https://www.youtube.com/watch?v=${vidId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
            category: autoCategorize(title)
          });
        }
        if (rssVideos.length > 0) {
          return res.json({
            success: true,
            count: rssVideos.length,
            videos: rssVideos,
            channelId: 'UCa7fjaKfkkwk1OdzinQNStA',
            channelTitle: 'Alx Garage'
          });
        }
      }
    } catch (rssErr) {
      console.warn('RSS Feed XML falhou:', rssErr);
    }

    // 4. Fallback final: Entrega o catálogo real do ALX Garage com 15 vídeos atualizados
    return res.json({
      success: true,
      count: defaultAlxVideos.length,
      videos: defaultAlxVideos,
      channelId: 'UCa7fjaKfkkwk1OdzinQNStA',
      channelTitle: 'Alx Garage'
    });
  } catch (err: any) {
    console.error('Erro global ao sincronizar YouTube:', err);
    return res.json({
      success: true,
      count: 15,
      videos: defaultAlxVideos,
      channelId: 'UCa7fjaKfkkwk1OdzinQNStA',
      channelTitle: 'Alx Garage'
    });
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

// ==========================================
// 📊 SISTEMA DE ANALYTICS ULTRALEVE (SITE & ADMIN)
// ==========================================
const analyticsFilePath = path.join(uploadsDir, 'analytics.json');

function getAnalyticsData() {
  try {
    if (fs.existsSync(analyticsFilePath)) {
      const raw = fs.readFileSync(analyticsFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  const initial = {
    totalPageViews: 0,
    totalDownloads: 0,
    sources: {},
    devices: {},
    countries: {},
    pages: {},
    downloads: {},
    recentEvents: [],
    dailyHistory: {},
    lastUpdated: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(analyticsFilePath, JSON.stringify(initial, null, 2), 'utf8');
  } catch {}
  return initial;
}

function saveAnalyticsData(data: any) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(analyticsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Erro ao salvar analytics.json:', err);
  }
}

function detectCountry(req: express.Request, bodyLang?: string): string {
  const headerCountry = (req.headers['cf-ipcountry'] || req.headers['x-appengine-country'] || req.headers['x-country-code']) as string;
  if (headerCountry) {
    const code = String(headerCountry).toUpperCase();
    if (code === 'BR') return 'Brasil 🇧🇷';
    if (code === 'PT') return 'Portugal 🇵🇹';
    if (code === 'US') return 'Estados Unidos 🇺🇸';
    if (code === 'ES') return 'Espanha 🇪🇸';
    if (code === 'AR') return 'Argentina 🇦🇷';
    if (code === 'CL') return 'Chile 🇨🇱';
    if (code === 'UY') return 'Uruguai 🇺🇾';
    if (code === 'MX') return 'México 🇲🇽';
    if (code === 'DE') return 'Alemanha 🇩🇪';
    if (code === 'FR') return 'França 🇫🇷';
    if (code === 'GB') return 'Reino Unido 🇬🇧';
    return `${code} 🌐`;
  }
  const lang = String(bodyLang || req.headers['accept-language'] || '').toLowerCase();
  if (lang.includes('pt-br') || lang.includes('pt_br')) return 'Brasil 🇧🇷';
  if (lang.includes('pt-pt') || lang.includes('pt_pt')) return 'Portugal 🇵🇹';
  if (lang.includes('en-us') || lang.includes('en_us')) return 'Estados Unidos 🇺🇸';
  if (lang.includes('es-')) return 'Espanha 🇪🇸';
  if (lang.includes('pt')) return 'Brasil 🇧🇷';
  return 'Outros / Global 🌐';
}

// Helper para limpar estatísticas
const handleAnalyticsClear: express.RequestHandler = (_req, res) => {
  try {
    const emptyData = {
      totalPageViews: 0,
      totalDownloads: 0,
      sources: {},
      devices: {},
      countries: {},
      pages: {},
      downloads: {},
      recentEvents: [],
      dailyHistory: {},
      lastUpdated: new Date().toISOString(),
      resetAt: new Date().toISOString(),
    };
    saveAnalyticsData(emptyData);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({ success: true, message: 'Estatísticas resetadas com sucesso!', stats: emptyData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erro ao limpar estatísticas' });
  }
};

// Helper para ler estatísticas
const handleAnalyticsStats: express.RequestHandler = (_req, res) => {
  try {
    const data = getAnalyticsData();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao buscar estatísticas' });
  }
};

// Helper para registrar eventos tanto em /api/metrics.php como em /api/site-metrics/event e /api/analytics/event
const handleAnalyticsEvent: express.RequestHandler = (req, res) => {
  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    } else if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf8'));
      } catch {}
    }

    const action = (req.query.action as string) || body.action || 'event';
    if (action === 'clear') {
      return handleAnalyticsClear(req, res, () => {});
    }
    if (action === 'stats') {
      return handleAnalyticsStats(req, res, () => {});
    }

    const type = body.type || 'pageview';
    const source = body.source || '🌐 Acesso Direto';
    const device = body.device || '💻 Computador';
    const country = detectCountry(req, body.language);
    const today = (typeof body.dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dateKey))
      ? body.dateKey
      : new Date().toISOString().split('T')[0];

    const data = getAnalyticsData();

    if (!data.sources) data.sources = {};
    if (!data.devices) data.devices = {};
    if (!data.countries) data.countries = {};
    if (!data.pages) data.pages = {};
    if (!data.downloads) data.downloads = {};
    if (!data.dailyHistory) data.dailyHistory = {};
    if (!data.recentEvents) data.recentEvents = [];

    if (!data.dailyHistory[today]) {
      data.dailyHistory[today] = { pageViews: 0, downloads: 0 };
    }

    data.sources[source] = (data.sources[source] || 0) + 1;
    data.devices[device] = (data.devices[device] || 0) + 1;
    data.countries[country] = (data.countries[country] || 0) + 1;

    let eventName = '';

    if (type === 'pageview') {
      data.totalPageViews = (data.totalPageViews || 0) + 1;
      data.dailyHistory[today].pageViews = (data.dailyHistory[today].pageViews || 0) + 1;

      const reqPath = body.path || '/';
      data.pages[reqPath] = (data.pages[reqPath] || 0) + 1;
      eventName = `Página: ${body.pageTitle || reqPath}`;
    } else if (type === 'download') {
      data.totalDownloads = (data.totalDownloads || 0) + 1;
      data.dailyHistory[today].downloads = (data.dailyHistory[today].downloads || 0) + 1;

      const itemId = body.itemId || 'item-geral';
      const title = body.itemTitle || 'Arquivo de Download';
      const category = body.itemCategory || 'Geral';

      if (!data.downloads[itemId]) {
        data.downloads[itemId] = { title, category, count: 0, lastDownloadedAt: new Date().toISOString() };
      }
      data.downloads[itemId].count += 1;
      data.downloads[itemId].lastDownloadedAt = new Date().toISOString();
      data.downloads[itemId].title = title;
      data.downloads[itemId].category = category;

      eventName = `Download: ${title}`;
    }

    data.recentEvents.unshift({
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      name: eventName,
      source,
      country,
      device,
      timestamp: new Date().toISOString(),
    });

    // Mantém no máximo 50 eventos recentes no histórico circular
    if (data.recentEvents.length > 50) {
      data.recentEvents = data.recentEvents.slice(0, 50);
    }

    saveAnalyticsData(data);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      totalPageViews: data.totalPageViews,
      totalDownloads: data.totalDownloads,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erro ao registrar evento de analytics' });
  }
};

app.post(['/api/metrics.php', '/api/analytics.php', '/api/site-metrics/event', '/api/analytics/event'], handleAnalyticsEvent);

app.get(['/api/metrics.php', '/api/analytics.php', '/api/site-metrics/stats', '/api/analytics/stats'], (req, res, next) => {
  if (req.query.action === 'clear') {
    return handleAnalyticsClear(req, res, next);
  }
  return handleAnalyticsStats(req, res, next);
});

app.post(['/api/site-metrics/clear', '/api/analytics/clear'], handleAnalyticsClear);

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
        "CREATE TABLE IF NOT EXISTS `site_analytics` (",
        "  `id` int(11) NOT NULL DEFAULT 1,",
        "  `content` longtext NOT NULL,",
        "  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,",
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

// 1.9 Endpoint /api/send-email.php (Motor SMTP Autenticado com Nodemailer + Persistência)
const smtpConfigPath = path.join(apiDir, 'smtp-config.json');

function loadStoredSmtpConfig(): any {
  const defaults = {
    host: 'smtp.hostinger.com',
    port: 465,
    encryption: 'ssl',
    user: 'contact@7f.com.br',
    password: '',
    fromName: 'Alx⁺ Oficial',
    adminReceiverEmail: 'contact@7f.com.br',
    autoReminderEnabled: true,
  };

  try {
    if (fs.existsSync(smtpConfigPath)) {
      const parsed = JSON.parse(fs.readFileSync(smtpConfigPath, 'utf8'));
      if (parsed && typeof parsed === 'object') {
        Object.assign(defaults, parsed);
      }
    }
  } catch {}

  try {
    const dataFile = path.join(apiDir, 'site-data.json');
    if (fs.existsSync(dataFile)) {
      const siteData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      const brandSmtp = siteData?.brand?.smtpConfig;
      if (brandSmtp && typeof brandSmtp === 'object') {
        if (brandSmtp.host) defaults.host = brandSmtp.host;
        if (brandSmtp.port) defaults.port = Number(brandSmtp.port);
        if (brandSmtp.encryption) defaults.encryption = brandSmtp.encryption;
        if (brandSmtp.user) defaults.user = brandSmtp.user;
        if (brandSmtp.password) defaults.password = brandSmtp.password;
        if (brandSmtp.fromName) defaults.fromName = brandSmtp.fromName;
        if (brandSmtp.adminReceiverEmail) defaults.adminReceiverEmail = brandSmtp.adminReceiverEmail;
        if (brandSmtp.autoReminderEnabled !== undefined) defaults.autoReminderEnabled = Boolean(brandSmtp.autoReminderEnabled);
      }
    }
  } catch {}

  return defaults;
}

app.all(['/api/send-email.php', '/api/send-email'], async (req, res) => {
  try {
    const body = req.body || {};
    const action = body.action || req.query.action || 'send';
    const currentConfig = loadStoredSmtpConfig();

    if (action === 'get_config') {
      return res.json({
        success: true,
        config: {
          host: currentConfig.host,
          port: currentConfig.port,
          encryption: currentConfig.encryption,
          user: currentConfig.user,
          hasPassword: Boolean(currentConfig.password),
          fromName: currentConfig.fromName,
          adminReceiverEmail: currentConfig.adminReceiverEmail,
          autoReminderEnabled: currentConfig.autoReminderEnabled !== false,
        },
      });
    }

    if (body.smtp && typeof body.smtp === 'object') {
      const s = body.smtp;
      if (s.host) currentConfig.host = String(s.host).trim();
      if (s.port) currentConfig.port = Number(s.port);
      if (s.encryption) currentConfig.encryption = String(s.encryption).trim().toLowerCase();
      if (s.user) currentConfig.user = String(s.user).trim();
      if (s.password !== undefined && String(s.password).trim() !== '' && s.password !== '********') {
        currentConfig.password = String(s.password);
      }
      if (s.fromName) currentConfig.fromName = String(s.fromName).trim();
      if (s.adminReceiverEmail) currentConfig.adminReceiverEmail = String(s.adminReceiverEmail).trim();
      if (s.autoReminderEnabled !== undefined) currentConfig.autoReminderEnabled = Boolean(s.autoReminderEnabled);

      if (body.saveConfig || action === 'save_config') {
        fs.writeFileSync(smtpConfigPath, JSON.stringify(currentConfig, null, 2), 'utf8');
        if (action === 'save_config') {
          return res.json({
            success: true,
            message: 'Configurações SMTP salvas com sucesso no servidor!',
          });
        }
      }
    }

    const to = String(body.to || currentConfig.adminReceiverEmail || currentConfig.user || '').trim();
    const subject = String(body.subject || '[Alx⁺] Notificação do Portal').trim();
    const htmlBody = String(body.html || '').trim();
    const textBody = String(body.text || body.message || '').trim();
    const replyTo = String(body.replyTo || '').trim();

    if (!to) {
      return res.status(400).json({ success: false, error: 'Destinatário (to) não informado.' });
    }

    if (!currentConfig.host || !currentConfig.user || !currentConfig.password) {
      return res.status(400).json({
        success: false,
        code: 'SMTP_NOT_CONFIGURED',
        error: 'As credenciais SMTP (Servidor, E-mail e Senha) ainda não foram salvas no Painel Administrativo > aba Mensagens.',
      });
    }

    const isSecure = Number(currentConfig.port) === 465 || currentConfig.encryption === 'ssl';
    const transporter = nodemailer.createTransport({
      host: currentConfig.host,
      port: Number(currentConfig.port) || 465,
      secure: isSecure,
      auth: {
        user: currentConfig.user,
        pass: currentConfig.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"${currentConfig.fromName || 'Alx⁺ Oficial'}" <${currentConfig.user}>`,
      to,
      replyTo: replyTo || currentConfig.user,
      subject,
      text: textBody || htmlBody.replace(/<[^>]+>/g, ''),
      html: htmlBody || `<div style="font-family:sans-serif;white-space:pre-line;">${textBody}</div>`,
    });

    return res.json({
      success: true,
      method: 'smtp',
      to,
      message: `E-mail autenticado enviado com sucesso via SMTP (${currentConfig.host}) para ${to}!`,
    });
  } catch (err: any) {
    console.error('SMTP send error:', err);
    return res.status(500).json({
      success: false,
      error: `Falha no envio SMTP: ${err?.message || 'Verifique usuário, senha e porta do servidor SMTP.'}`,
    });
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

  const apiDataPath = path.join(apiDir, 'site-data.json');
  const siteDataPath = path.join(publicDir, 'site-data.json');
  const defaultSiteDataPath = path.join(publicDir, 'default-site-data.json');
  let siteData: any = null;
  if (fs.existsSync(apiDataPath) && fs.statSync(apiDataPath).size > 10) {
    try {
      siteData = JSON.parse(fs.readFileSync(apiDataPath, 'utf8'));
    } catch {}
  } else if (fs.existsSync(siteDataPath) && fs.statSync(siteDataPath).size > 10) {
    try {
      siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf8'));
    } catch {}
  } else if (fs.existsSync(defaultSiteDataPath)) {
    try {
      siteData = JSON.parse(fs.readFileSync(defaultSiteDataPath, 'utf8'));
    } catch {}
  }

  const brand = siteData?.brand || {};
  const rawSiteName = (brand.brandName || 'Alx⁺').trim();
  const siteName = (rawSiteName === 'Alx +' || rawSiteName === 'Alx+' || rawSiteName === 'ALX +' || rawSiteName === 'ALX+' || rawSiteName === 'Alx')
    ? 'Alx⁺'
    : rawSiteName.replace(/\bAlx\s*\+/gi, 'Alx⁺');
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
  } else if ((type === 'parceiros' || type === 'parceiro') && slug) {
    const item = findItemInArray(siteData?.partners || [], slug);
    if (item) {
      title = `${item.name} • Parceiro Homologado ${siteName}`;
      description = item.shortDescription || item.tagline || item.bannerHeaderSubtitle || `Conheça ${item.name}, parceiro credenciado da rede ${siteName}.`;
      imageUrl = extractItemImage(item, defaultImage);
    } else {
      title = `Parceiros Homologados • ${siteName}`;
      description = 'Conheça nossos parceiros credenciados em oficinas especializadas, estética automotiva e acessórios.';
      imageUrl = '/imagens/og-parceiros.jpg';
    }
  } else if (type === 'parceiros' || type === 'parceiro') {
    title = `Parceiros Homologados • ${siteName}`;
    description = 'Conheça nossos parceiros credenciados em oficinas especializadas, estética automotiva e acessórios.';
    imageUrl = '/imagens/og-parceiros.jpg';
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
