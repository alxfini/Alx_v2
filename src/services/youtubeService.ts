import { YouTubeVideo } from '../types';

/**
 * Service para integração e sincronização automática com canais do YouTube.
 * Utiliza o proxy oficial do servidor (/api/youtube-sync e /api/youtube-sync.php)
 * para contornar limitações de CORS e bloqueios de APIs públicas de terceiros.
 */

/**
 * Extrai o ID de um vídeo do YouTube a partir de um link ou ID bruto.
 */
export function extractYouTubeVideoId(urlOrId: string): string {
  if (!urlOrId) return '';
  const clean = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  const match = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : clean;
}

/**
 * Tenta extrair o Channel ID (UC...) de um link ou string do YouTube.
 */
export function extractYouTubeChannelId(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();

  // Se já for um Channel ID no formato UC...
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(clean)) {
    return clean;
  }

  // Tenta extrair de uma URL do tipo youtube.com/channel/UC... ou channel_id=UC...
  const channelMatch = clean.match(/(?:channel\/|channel_id=)(UC[a-zA-Z0-9_-]{22})/);
  if (channelMatch) {
    return channelMatch[1];
  }

  return null;
}

/**
 * Atribui uma categoria automática ao vídeo com base em palavras-chave no título.
 */
export function autoCategorizeVideo(title: string): string {
  const lower = (title || '').toLowerCase();
  if (lower.includes('ota') || lower.includes('firmware') || lower.includes('atualiza') || lower.includes('versão')) {
    return 'Atualizações & OTA';
  }
  if (lower.includes('tutorial') || lower.includes('passo a passo') || lower.includes('como instalar') || lower.includes('guia') || lower.includes('desbloque')) {
    return 'Tutoriais';
  }
  if (lower.includes('review') || lower.includes('teste') || lower.includes('comparat') || lower.includes('análise') || lower.includes('vs')) {
    return 'Análise & Teste';
  }
  if (lower.includes('multimídia') || lower.includes('dilink') || lower.includes('som') || lower.includes('áudio') || lower.includes('app') || lower.includes('launcher')) {
    return 'Multimídia & Som';
  }
  return 'Multimídia & Som';
}

/**
 * Formata data em português amigável.
 */
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Decodifica entidades HTML em títulos do RSS / API.
 */
export function unescapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Busca vídeos do canal via YouTube Data API v3 (se chave for fornecida diretamente pelo usuário).
 */
async function fetchViaYouTubeApi(channelId: string, apiKey: string): Promise<YouTubeVideo[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=15&type=video`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro na API do YouTube (${res.status})`);
  }
  const data = await res.json();
  if (!data.items || !Array.isArray(data.items)) {
    return [];
  }

  return data.items.map((item: any, idx: number) => {
    const vidId = item.id?.videoId || '';
    const snippet = item.snippet || {};
    const title = snippet.title || 'Vídeo sem título';
    const description = snippet.description || '';
    const pubDate = snippet.publishedAt ? formatDate(snippet.publishedAt) : 'Recente';

    return {
      id: `yt-api-${vidId || idx}`,
      youtubeId: vidId,
      title: unescapeHtml(title),
      description: unescapeHtml(description),
      date: pubDate,
      duration: 'YouTube',
      views: 'Canal Oficial',
      isFeatured: idx === 0,
      videoUrl: `https://www.youtube.com/watch?v=${vidId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
      category: autoCategorizeVideo(title)
    };
  });
}

/**
 * Normaliza objeto de vídeo recebido do servidor ou proxy para garantir compatibilidade
 */
function normalizeVideoItem(item: any, idx: number): YouTubeVideo {
  const vidId = item.youtubeId || extractYouTubeVideoId(item.videoUrl || item.link || item.id || '');
  const title = unescapeHtml(item.title || 'Vídeo sem título');
  const description = unescapeHtml(item.description || item.summary || 'Assista ao vídeo no canal oficial ALX Garage.');
  const date = item.date || (item.pubDate ? formatDate(item.pubDate) : 'Recente');

  return {
    id: item.id || `yt-sync-${vidId || idx}`,
    youtubeId: vidId,
    title,
    description,
    date,
    duration: item.duration || 'YouTube',
    views: item.views || 'Canal Oficial',
    isFeatured: item.isFeatured !== undefined ? item.isFeatured : idx === 0,
    videoUrl: item.videoUrl || `https://www.youtube.com/watch?v=${vidId}`,
    thumbnailUrl: item.thumbnailUrl || (vidId ? `https://img.youtube.com/vi/${vidId}/hqdefault.jpg` : undefined),
    category: item.category || autoCategorizeVideo(title),
    isMembersOnly: !!item.isMembersOnly,
    isVipExclusive: !!item.isVipExclusive,
  };
}

/**
 * Função principal para buscar e sincronizar vídeos do YouTube.
 * Utiliza o backend proxy do próprio projeto (/api/youtube-sync e /api/youtube-sync.php)
 * eliminando problemas de CORS e 'Failed to fetch' no navegador.
 */
export async function syncYouTubeVideosFromChannel(options: {
  channelInput: string;
  apiKey?: string;
}): Promise<{
  success: boolean;
  videos: YouTubeVideo[];
  channelTitle?: string;
  channelId?: string;
  count?: number;
  error?: string;
}> {
  const { channelInput, apiKey } = options;

  const targetInput = (channelInput || '').trim() || 'UCa7fjaKfkkwk1OdzinQNStA';

  // 1. Se o usuário forneceu explicitamente uma chave da API do YouTube v3, tenta via API direta primeiro
  if (apiKey && apiKey.trim()) {
    try {
      let resolvedId = extractYouTubeChannelId(targetInput);
      if (!resolvedId && (targetInput.toLowerCase().includes('alx-garage') || targetInput.toLowerCase().includes('alx_garage'))) {
        resolvedId = 'UCa7fjaKfkkwk1OdzinQNStA';
      }
      if (resolvedId) {
        const apiVideos = await fetchViaYouTubeApi(resolvedId, apiKey.trim());
        if (apiVideos && apiVideos.length > 0) {
          return {
            success: true,
            videos: apiVideos,
            count: apiVideos.length,
            channelId: resolvedId,
            channelTitle: 'Canal Oficial'
          };
        }
      }
    } catch (apiErr) {
      console.warn('API oficial falhou, recorrendo ao proxy do servidor:', apiErr);
    }
  }

  // 2. Tenta sincronização através do proxy do backend Node/Express (/api/youtube-sync)
  try {
    const params = new URLSearchParams();
    params.set('channelInput', targetInput);
    if (apiKey) params.set('apiKey', apiKey.trim());

    const proxyRes = await fetch(`/api/youtube-sync?${params.toString()}`);
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        const mappedVideos = data.videos.map(normalizeVideoItem);
        return {
          success: true,
          videos: mappedVideos,
          count: mappedVideos.length,
          channelTitle: data.channelTitle || 'Alx Garage',
          channelId: data.channelId || 'UCa7fjaKfkkwk1OdzinQNStA',
        };
      }
    }
  } catch (expressProxyErr) {
    console.warn('Erro ao chamar /api/youtube-sync:', expressProxyErr);
  }

  // 3. Fallback: tenta sincronização através do proxy PHP (/api/youtube-sync.php) para ambientes Hostinger/Apache
  try {
    const params = new URLSearchParams();
    params.set('channelInput', targetInput);
    if (apiKey) params.set('apiKey', apiKey.trim());

    const phpProxyRes = await fetch(`/api/youtube-sync.php?${params.toString()}`);
    if (phpProxyRes.ok) {
      const data = await phpProxyRes.json();
      if (data && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        const mappedVideos = data.videos.map(normalizeVideoItem);
        return {
          success: true,
          videos: mappedVideos,
          count: mappedVideos.length,
          channelTitle: data.channelTitle || 'Alx Garage',
          channelId: data.channelId || 'UCa7fjaKfkkwk1OdzinQNStA',
        };
      }
    }
  } catch (phpProxyErr) {
    console.warn('Erro ao chamar /api/youtube-sync.php:', phpProxyErr);
  }

  // 4. Se ambos os proxies falharam, tenta resolver via CORS proxy público sem quebrar a UI
  try {
    let resolvedId = extractYouTubeChannelId(targetInput);
    if (!resolvedId && (targetInput.toLowerCase().includes('alx-garage') || targetInput.toLowerCase().includes('alx_garage'))) {
      resolvedId = 'UCa7fjaKfkkwk1OdzinQNStA';
    }
    if (!resolvedId) {
      resolvedId = 'UCa7fjaKfkkwk1OdzinQNStA';
    }

    const directRss = `https://www.youtube.com/feeds/videos.xml?channel_id=${resolvedId}`;
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(directRss)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(directRss)}`
    ];

    for (const proxyUrl of corsProxies) {
      try {
        const r = await fetch(proxyUrl);
        if (r.ok) {
          const xml = await r.text();
          if (xml && xml.includes('<entry>')) {
            const entries = xml.split('<entry>');
            const parsedVideos: YouTubeVideo[] = [];
            for (let i = 1; i < entries.length; i++) {
              const entry = entries[i];
              const vidMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
              const vidId = vidMatch ? vidMatch[1] : '';
              if (!vidId) continue;

              const titleMatch = entry.match(/<title>(.*?)<\/title>/);
              const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';

              const descMatch = entry.match(/<media:description>(.*?)<\/media:description>/s);
              const desc = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').slice(0, 280) : '';

              const dateMatch = entry.match(/<published>(.*?)<\/published>/);
              const pubDate = dateMatch ? formatDate(dateMatch[1]) : 'Recente';

              parsedVideos.push({
                id: `yt-rss-${vidId}`,
                youtubeId: vidId,
                title: unescapeHtml(title),
                description: unescapeHtml(desc),
                date: pubDate,
                duration: 'YouTube',
                views: 'Canal Oficial',
                isFeatured: parsedVideos.length === 0,
                videoUrl: `https://www.youtube.com/watch?v=${vidId}`,
                thumbnailUrl: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
                category: autoCategorizeVideo(title)
              });
            }

            if (parsedVideos.length > 0) {
              return {
                success: true,
                videos: parsedVideos,
                count: parsedVideos.length,
                channelId: resolvedId,
                channelTitle: 'Alx Garage'
              };
            }
          }
        }
      } catch (e) {
        console.warn('Proxy alternativo falhou:', e);
      }
    }
  } catch (e) {
    console.warn('Fallback de CORS falhou:', e);
  }

  return {
    success: false,
    videos: [],
    error: 'Não foi possível carregar os vídeos do canal no momento. Verifique a conexão com a internet ou o ID do canal.'
  };
}
