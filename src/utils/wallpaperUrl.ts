import { WallpaperItem } from '../types';

/**
 * Utilitário central para resolução de URLs de download de Wallpapers:
 * - Para papéis de parede animados (tipo 'video'), prioriza o arquivo de vídeo completo (.mp4 / GitHub Releases)
 *   hospedado no GitHub Releases ou link externo, garantindo que o usuário baixe o vídeo
 *   em alta definição e nunca o arquivo WebM/JPG leve de prévia.
 */
export function resolveWallpaperDownloadUrl(item: WallpaperItem, ghConfig?: any): string {
  if (item.type === 'video') {
    const candidateUrls = [item.downloadUrl, item.videoUrl].filter(Boolean) as string[];

    // 1. Prioridade máxima: Link do GitHub Releases (onde fica o vídeo original .mp4), desconsiderando previews
    const githubFullVideoUrl = candidateUrls.find((u) => 
      u.includes('github.com') && 
      u.includes('/releases/') && 
      !u.includes('preview_') && 
      !u.includes('poster_') &&
      !u.endsWith('.webm')
    );
    if (githubFullVideoUrl) return githubFullVideoUrl;

    // 2. Qualquer link de vídeo completo MP4/MKV/MOV/AVI que não seja prévia (preview_ ou poster_)
    const fullVideoUrl = candidateUrls.find((u) => 
      !u.includes('preview_') && 
      !u.includes('poster_') && 
      !u.startsWith('data:') &&
      Boolean(u.match(/\.(mp4|mov|mkv|avi)(\?.*)?$/i))
    );
    if (fullVideoUrl) return fullVideoUrl;

    // 3. Qualquer URL no GitHub Releases que não contenha 'preview_'
    const anyGithubCleanUrl = candidateUrls.find((u) => 
      u.includes('github.com') && 
      u.includes('/releases/') && 
      !u.includes('preview_')
    );
    if (anyGithubCleanUrl) return anyGithubCleanUrl;

    // 4. Se downloadUrl for diferente de previewUrl e não contiver 'preview_' nem 'poster_'
    if (item.downloadUrl && item.downloadUrl !== item.previewUrl && !item.downloadUrl.includes('preview_') && !item.downloadUrl.includes('poster_')) {
      return item.downloadUrl;
    }

    // 5. Se videoUrl for diferente de previewUrl e não contiver 'preview_'
    if (item.videoUrl && item.videoUrl !== item.previewUrl && !item.videoUrl.includes('preview_') && !item.videoUrl.includes('poster_')) {
      return item.videoUrl;
    }

    // 6. Caso de auto-recuperação de prévia do GitHub: se o arquivo preview_nome.webm existe no GitHub, reconstrói o link direto do .mp4 no GitHub Releases
    const previewMatch = (item.downloadUrl || item.previewUrl || '').match(/preview_([^/?#]+)\.webm/i);
    if (previewMatch && (ghConfig?.owner || item.downloadUrl?.includes('github.com') || item.previewUrl?.includes('github.com'))) {
      const baseName = previewMatch[1];
      let owner = ghConfig?.owner;
      let repo = ghConfig?.repo;
      const ghUrlMatch = (item.downloadUrl || item.previewUrl || '').match(/github\.com\/([^/]+)\/([^/]+)/);
      if (ghUrlMatch) {
        owner = ghUrlMatch[1];
        repo = ghUrlMatch[2];
      }
      if (owner && repo) {
        const tag = ghConfig?.defaultReleaseTag || 'v1.0';
        return `https://github.com/${owner}/${repo}/releases/download/${tag}/${baseName}.mp4`;
      }
    }

    // 7. Qualquer URL candidata que não seja um arquivo de prévia WebM/JPG
    const nonPreviewCandidate = candidateUrls.find((u) => !u.includes('preview_') && !u.includes('poster_'));
    if (nonPreviewCandidate) return nonPreviewCandidate;

    return item.downloadUrl || item.videoUrl || item.previewUrl || '';
  }

  return item.downloadUrl || item.previewUrl || '';
}

/**
 * Normaliza lista de wallpapers para garantir que vídeos não tenham seu downloadUrl apontando para a prévia.
 */
export function normalizeWallpapersList(wps: WallpaperItem[], ghConfig?: any): WallpaperItem[] {
  if (!Array.isArray(wps)) return [];
  return wps.map((w) => {
    if (w.type === 'video') {
      const realDownload = resolveWallpaperDownloadUrl(w, ghConfig);
      return {
        ...w,
        downloadUrl: realDownload || w.downloadUrl,
        videoUrl: realDownload || w.videoUrl || w.downloadUrl,
      };
    }
    return w;
  });
}
