/**
 * Utilitário central para resolução de URLs de mídia (imagens, fotos, capas, wallpapers e vídeos).
 * Contorna problemas comuns de carregamento, tais como:
 * 1. URLs do GitHub Releases que retornam 'Content-Disposition: attachment' e MIME 'application/octet-stream',
 *    o que impede a exibição nativa em tags <img> e <video> do navegador.
 * 2. Repositórios privados do GitHub onde URLs públicas retornam 404 sem autenticação.
 * 3. Restrições de CORS e ORB (Opaque Response Blocking) em iframes.
 */

export function getMediaPreviewUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs e Blobs locais são renderizados diretamente
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Se já estiver passando pelo proxy
  if (trimmed.startsWith('/api/media-proxy') || trimmed.startsWith('/api/media-proxy.php')) {
    return trimmed;
  }

  // Detecta URLs do GitHub Releases (ou CDN objects/release-assets do GitHub)
  const isGitHubRelease =
    (trimmed.includes('github.com') && (trimmed.includes('/releases/download/') || trimmed.includes('/releases/assets/'))) ||
    trimmed.includes('release-assets.githubusercontent.com') ||
    trimmed.includes('objects.githubusercontent.com');

  if (isGitHubRelease) {
    return `/api/media-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Verifica se a URL é de um vídeo compatível (MP4, WebM, MOV, etc.)
 */
export function isVideoMediaUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  let targetUrl = url;
  if (url.includes('/api/media-proxy?url=')) {
    try {
      const parsed = new URL(url, window.location.origin);
      const original = parsed.searchParams.get('url');
      if (original) targetUrl = original;
    } catch {
      // fallback
    }
  }
  const trimmed = targetUrl.trim().toLowerCase();
  return Boolean(
    trimmed.match(/\.(mp4|webm|mov|mkv|avi)(\?.*)?$/i) ||
    trimmed.startsWith('data:video/')
  );
}

/**
 * Converte URLs de download de repositórios privados ou públicos do GitHub
 * para passarem pelo proxy autenticado com 'Content-Disposition: attachment'.
 * Garante que em qualquer navegador/dispositivo o download ocorra sem erro 404 do GitHub.
 */
export function getMediaDownloadUrl(url?: string | null, customFileName?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const isGitHub =
    trimmed.includes('github.com') ||
    trimmed.includes('release-assets.githubusercontent.com') ||
    trimmed.includes('objects.githubusercontent.com');

  if (isGitHub) {
    const fnParam = customFileName ? `&filename=${encodeURIComponent(customFileName)}` : '';
    return `/api/media-proxy?url=${encodeURIComponent(trimmed)}&download=1${fnParam}`;
  }

  return trimmed;
}

/**
 * Extrai o ID de 11 caracteres de um vídeo do YouTube a partir de qualquer formato de link ou ID bruto.
 */
export function extractYouTubeVideoId(urlOrId?: string | null): string {
  if (!urlOrId || typeof urlOrId !== 'string') return '';
  const clean = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  const match = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
  return match && match[1] ? match[1] : '';
}

/**
 * Converte um link ou ID do YouTube em URL de embed oficial e segura,
 * configurada para evitar a mensagem "Faça login para confirmar que você não é um bot".
 * 
 * Motivo do problema:
 * O domínio 'youtube-nocookie.com' é agressivamente bloqueado pelos filtros anti-bot do YouTube.
 * A solução recomendada pela documentação oficial da Google é utilizar 'www.youtube.com/embed/'
 * com os parâmetros de 'origin', 'enablejsapi=1' e 'playsinline=1', permitindo validar sessões legítimas.
 */
export function getYouTubeEmbedUrl(urlOrId?: string | null, options?: { loop?: boolean; autoplay?: boolean }): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const vidId = extractYouTubeVideoId(urlOrId);
  if (!vidId) return null;

  const params = new URLSearchParams();
  params.set('rel', '0');
  params.set('modestbranding', '1');
  params.set('playsinline', '1');
  params.set('enablejsapi', '1');

  if (typeof window !== 'undefined' && window.location.origin) {
    try {
      params.set('origin', window.location.origin);
    } catch {}
  }

  if (options?.autoplay) {
    params.set('autoplay', '1');
  }

  if (options?.loop) {
    params.set('loop', '1');
    params.set('playlist', vidId);
  }

  return `https://www.youtube.com/embed/${vidId}?${params.toString()}`;
}

/**
 * Retorna o link direto para assistir no site ou app do YouTube (fallback de alta conveniência).
 */
export function getYouTubeWatchUrl(urlOrId?: string | null): string {
  if (!urlOrId || typeof urlOrId !== 'string') return '';
  const vidId = extractYouTubeVideoId(urlOrId);
  return vidId ? `https://www.youtube.com/watch?v=${vidId}` : urlOrId;
}


