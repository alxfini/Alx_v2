import { YouTubeVideo } from '../types';

/**
 * Service para integração e sincronização automática com canais do YouTube.
 */

// Interface do retorno do RSS2JSON
interface RSS2JsonItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
}

interface RSS2JsonResponse {
  status: string;
  message?: string;
  feed?: {
    title?: string;
    link?: string;
  };
  items?: RSS2JsonItem[];
}

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

  // Tenta extrair de uma URL do tipo youtube.com/channel/UC...
  const channelMatch = clean.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/);
  if (channelMatch) {
    return channelMatch[1];
  }

  return null;
}

/**
 * Atribui uma categoria automática ao vídeo com base em palavras-chave no título.
 */
function autoCategorizeVideo(title: string): string {
  const lower = title.toLowerCase();
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
function formatDate(dateStr: string): string {
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
 * Busca vídeos do canal via YouTube Data API v3 (se chave for fornecida).
 */
async function fetchViaYouTubeApi(channelId: string, apiKey: string): Promise<YouTubeVideo[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`;
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
    const pubDate = snippet.publishedAt ? formatDate(snippet.publishedAt) : '';

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
      category: autoCategorizeVideo(title)
    };
  });
}

/**
 * Decodifica entidades HTML em títulos do RSS / API.
 */
function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Busca vídeos de um canal do YouTube automaticamente via RSS / RSS2JSON.
 */
async function fetchViaRssFeed(channelId: string): Promise<{ videos: YouTubeVideo[]; channelTitle?: string }> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Erro ao conectar ao feed RSS (${res.status})`);
  }
  
  const data: RSS2JsonResponse = await res.json();

  if (data.status !== 'ok' || !data.items || !Array.isArray(data.items)) {
    throw new Error(data.message || 'Não foi possível ler o feed de vídeos do canal.');
  }

  const channelTitle = data.feed?.title || 'Canal do YouTube';

  const videos: YouTubeVideo[] = data.items.map((item, idx) => {
    let vidId = '';
    if (item.guid && item.guid.includes('yt:video:')) {
      vidId = item.guid.replace('yt:video:', '');
    } else if (item.link) {
      vidId = extractYouTubeVideoId(item.link);
    }

    const title = unescapeHtml(item.title || '');
    const cleanDesc = item.description
      ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 280)
      : '';

    return {
      id: `yt-rss-${vidId || idx}`,
      youtubeId: vidId,
      title: title,
      description: cleanDesc,
      date: item.pubDate ? formatDate(item.pubDate) : 'Recente',
      duration: 'Assistir',
      views: 'Canal Oficial',
      isFeatured: idx === 0,
      videoUrl: item.link || `https://www.youtube.com/watch?v=${vidId}`,
      category: autoCategorizeVideo(title)
    };
  });

  return { videos, channelTitle };
}

/**
 * Função principal para buscar e sincronizar vídeos do YouTube.
 */
export async function syncYouTubeVideosFromChannel(options: {
  channelInput: string;
  apiKey?: string;
}): Promise<{
  success: boolean;
  videos: YouTubeVideo[];
  channelTitle?: string;
  channelId?: string;
  error?: string;
}> {
  const { channelInput, apiKey } = options;

  if (!channelInput || !channelInput.trim()) {
    return {
      success: false,
      videos: [],
      error: 'Por favor, insira o ID ou Link do Canal do YouTube (ex: UC... ou https://youtube.com/channel/UC...)'
    };
  }

  let channelId = extractYouTubeChannelId(channelInput);

  // Mapeamento direto de handles conhecidos
  const normalizedInput = channelInput.toLowerCase();
  if (normalizedInput.includes('alx-garage') || normalizedInput.includes('alx_garage')) {
    channelId = 'UCa7fjaKfkkwk1OdzinQNStA';
  }

  // Se não foi possível extrair o UC... e o usuário digitou uma URL com @handle ou nome do canal
  if (!channelId) {
    const cleanHandle = channelInput.replace(/^.*youtube\.com\/@?/, '').replace(/^@/, '').trim();
    
    // Tenta primeiro via API v3 se a chave for fornecida
    if (apiKey && apiKey.trim()) {
      try {
        const handleUrl = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forHandle=${cleanHandle}&part=id,snippet`;
        const handleRes = await fetch(handleUrl);
        if (handleRes.ok) {
          const handleData = await handleRes.json();
          if (handleData.items && handleData.items[0]?.id) {
            channelId = handleData.items[0].id;
          }
        }
      } catch (e) {
        console.warn('Falha ao buscar handle via YouTube API:', e);
      }
    }

    // Se ainda não tiver ID, tenta buscar via AllOrigins / CORS proxy publicamente
    if (!channelId && cleanHandle) {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/@${cleanHandle}`)}`;
        const pageRes = await fetch(proxyUrl);
        if (pageRes.ok) {
          const html = await pageRes.text();
          const match = html.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/);
          if (match && match[1]) {
            channelId = match[1];
          }
        }
      } catch (e) {
        console.warn('Falha ao resolver handle via CORS proxy:', e);
      }
    }
  }

  // Se ainda assim não encontrar um ID no formato UC...
  if (!channelId) {
    return {
      success: false,
      videos: [],
      error: 'Não foi possível localizar o ID do Canal (começa com "UC"). Por favor, insira o ID do canal (ex: UC1234567890abcdef12345) ou configure uma Chave da API do YouTube.'
    };
  }

  try {
    let videos: YouTubeVideo[] = [];
    let channelTitle: string | undefined = undefined;

    // Se tiver API key, tenta via API v3 primeiro
    if (apiKey && apiKey.trim()) {
      try {
        videos = await fetchViaYouTubeApi(channelId, apiKey.trim());
      } catch (apiErr) {
        console.warn('Erro na API v3, recorrendo ao feed RSS:', apiErr);
      }
    }

    // Se não tiver API key ou falhou na API key, usa o Feed RSS oficial do YouTube
    if (!videos || videos.length === 0) {
      const rssResult = await fetchViaRssFeed(channelId);
      videos = rssResult.videos;
      channelTitle = rssResult.channelTitle;
    }

    if (!videos || videos.length === 0) {
      return {
        success: false,
        videos: [],
        error: 'Nenhum vídeo recente foi encontrado neste canal do YouTube.'
      };
    }

    return {
      success: true,
      videos,
      channelTitle,
      channelId
    };
  } catch (err: any) {
    return {
      success: false,
      videos: [],
      error: err?.message || 'Falha ao conectar com o canal do YouTube. Verifique sua conexão e o ID do canal.'
    };
  }
}
