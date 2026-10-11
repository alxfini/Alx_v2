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

