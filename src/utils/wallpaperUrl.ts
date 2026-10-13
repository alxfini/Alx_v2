import { WallpaperItem } from '../types';

/**
 * Utilitário central para resolução de URLs de download de Wallpapers:
 * - Para papéis de parede animados (tipo 'video'), prioriza o arquivo de vídeo completo
 *   hospedado no GitHub Releases ou link externo, garantindo que o usuário baixe o vídeo
 *   em alta definição e nunca o arquivo WebM leve (4s) gerado para a capa/preview do card.
 */
export function resolveWallpaperDownloadUrl(item: WallpaperItem, ghConfig?: any): string {
  if (item.type === 'video') {
    const candidateUrls = [item.downloadUrl, item.videoUrl].filter(Boolean) as string[];

    // 1. Prioridade máxima: Link do GitHub Releases (onde fica o vídeo original)
    const githubUrl = candidateUrls.find((u) => u.includes('github.com') && u.includes('/releases/'));
    if (githubUrl) return githubUrl;

    // 2. Arquivo de vídeo completo que não seja preview_ nem poster_
    const fullVideoUrl = candidateUrls.find((u) => 
      !u.includes('preview_') && 
      !u.includes('poster_') && 
      !u.startsWith('data:') &&
      Boolean(u.match(/\.(mp4|webm|mov|mkv|avi)(\?.*)?$/i))
    );
    if (fullVideoUrl) return fullVideoUrl;

    // 3. Se downloadUrl for diferente de previewUrl e não contiver 'preview_'
    if (item.downloadUrl && item.downloadUrl !== item.previewUrl && !item.downloadUrl.includes('preview_')) {
      return item.downloadUrl;
    }

    // 4. Se videoUrl for diferente de previewUrl e não contiver 'preview_'
    if (item.videoUrl && item.videoUrl !== item.previewUrl && !item.videoUrl.includes('preview_')) {
      return item.videoUrl;
    }

    // 5. Caso de auto-recuperação: Se foi gerado um preview_nome.webm e o GitHub está configurado,
    // reconstrói o link direto da release no GitHub
    const previewMatch = (item.downloadUrl || item.previewUrl || '').match(/preview_([^/?#]+)\.webm/i);
    if (previewMatch && ghConfig?.owner && ghConfig?.repo) {
      const baseName = previewMatch[1];
      const tag = ghConfig.defaultReleaseTag || 'v1.0';
      return `https://github.com/${ghConfig.owner}/${ghConfig.repo}/releases/download/${tag}/${baseName}.mp4`;
    }

    return item.downloadUrl || item.videoUrl || item.previewUrl || '';
  }

  return item.downloadUrl || item.previewUrl || '';
}

/**
 * Normaliza lista de wallpapers carregados do armazenamento para garantir que
 * vídeos não tenham seu downloadUrl apontando para o arquivo de prévia.
 */
export function normalizeWallpapersList(wps: WallpaperItem[], ghConfig?: any): WallpaperItem[] {
  if (!Array.isArray(wps)) return [];
  return wps.map((w) => {
    if (w.type === 'video') {
      const realDownload = resolveWallpaperDownloadUrl(w, ghConfig);
      return {
        ...w,
        downloadUrl: realDownload || w.downloadUrl,
      };
    }
    return w;
  });
}
