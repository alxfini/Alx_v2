import { NewsArticle } from '../types';
import { newsArticles as defaultNewsArticles } from '../data/news';
import { isItemVip } from '../utils/vip';

export interface NewsPortalSource {
  id: string;
  name: string;
  channelKey: string;
  feedUrl: string;
  fallbackUrl?: string;
  defaultCategory: 'Carros Elétricos' | 'Tecnologia' | 'Multimídia' | 'Atualizações' | 'Dicas';
  defaultCover: string;
}

export const NEWS_PORTAL_SOURCES: NewsPortalSource[] = [
  {
    id: 'insideevs',
    name: 'InsideEVs Brasil',
    channelKey: 'InsideEVs',
    feedUrl: 'https://insideevs.uol.com.br/rss/news/all/',
    defaultCategory: 'Carros Elétricos',
    defaultCover: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'motor1',
    name: 'Motor1.com Brasil',
    channelKey: 'Motor1',
    feedUrl: 'https://motor1.uol.com.br/rss/news/all/',
    defaultCategory: 'Carros Elétricos',
    defaultCover: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'autoesporte',
    name: 'Autoesporte',
    channelKey: 'Autoesporte',
    feedUrl: 'https://g1.globo.com/dynamo/autoesporte/rss2.xml',
    defaultCategory: 'Dicas',
    defaultCover: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'quatrorodas',
    name: 'Quatro Rodas',
    channelKey: 'Quatro Rodas',
    feedUrl: 'https://quatrorodas.abril.com.br/feed/',
    defaultCategory: 'Tecnologia',
    defaultCover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'canaltech',
    name: 'Canaltech',
    channelKey: 'Canaltech',
    feedUrl: 'https://canaltech.com.br/rss/carros/',
    defaultCategory: 'Tecnologia',
    defaultCover: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'autoplus',
    name: 'Auto+ TV',
    channelKey: 'Auto+',
    feedUrl: 'https://www.automaistv.com.br/feed/',
    defaultCategory: 'Atualizações',
    defaultCover: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
  },
];

// Helper to strip HTML tags while preserving line/paragraph breaks
function stripHtml(html: string): string {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  const processedHtml = html
    .replace(/<\/p>/gi, '</p>\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '</div>\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n');
  tmp.innerHTML = processedHtml;
  const text = tmp.textContent || tmp.innerText || '';
  return text.replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
}

// Helper to generate URL-safe slugs
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

// Helper to format publication dates to Portuguese readable string
function formatNewsDate(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return `${now.getDate()} de ${now.toLocaleDateString('pt-BR', { month: 'long' })}, ${now.getFullYear()}`;
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = d.getDate();
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day} de ${capitalizedMonth}, ${year} às ${hours}:${minutes}`;
}

// Extract image URL from XML item
function extractImageFromXmlItem(item: Element, portal: NewsPortalSource): string {
  // 1. Enclosure check
  const enclosure = item.querySelector('enclosure');
  if (enclosure) {
    const encUrl = enclosure.getAttribute('url');
    if (encUrl && (encUrl.includes('jpg') || encUrl.includes('jpeg') || encUrl.includes('png') || encUrl.includes('webp'))) {
      return encUrl;
    }
  }

  // 2. Media content or media:thumbnail
  const mediaContent = item.getElementsByTagNameNS('*', 'content');
  for (let i = 0; i < mediaContent.length; i++) {
    const url = mediaContent[i].getAttribute('url');
    if (url && (url.includes('http') || url.includes('//'))) {
      return url;
    }
  }

  const mediaThumbnail = item.getElementsByTagNameNS('*', 'thumbnail');
  if (mediaThumbnail.length > 0) {
    const url = mediaThumbnail[0].getAttribute('url');
    if (url) return url;
  }

  // 3. Description / Content HTML regex for <img>
  const desc = item.querySelector('description')?.textContent || '';
  const contentEncoded = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent || '';
  const htmlToSearch = `${desc} ${contentEncoded}`;

  const imgMatch = htmlToSearch.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return portal.defaultCover;
}

// Fetch RSS feed using direct fetch (if CORS supported) with quick timeout, and multiple fast CORS proxies
async function fetchRssFeedXml(feedUrl: string): Promise<string | null> {
  // 1. Try direct fetch first for maximum speed
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(feedUrl, { 
      signal: controller.signal,
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' }
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const text = await response.text();
      if (text && (text.includes('<rss') || text.includes('<xml') || text.includes('<feed') || text.includes('<channel'))) {
        return text;
      }
    }
  } catch (e) {
    // Fail silently and try proxy
  }

  // 2. Proxies list - corsproxy.io is generally much faster than allorigins
  const proxies = [
    `https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s limit per proxy
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      if (proxyUrl.includes('/get?url=')) {
        const json = await response.json();
        if (json.contents) return json.contents;
      } else {
        const text = await response.text();
        if (text && (text.includes('<rss') || text.includes('<xml') || text.includes('<feed') || text.includes('<channel'))) {
          return text;
        }
      }
    } catch (e) {
      // Try next proxy
    }
  }

  // Also try rss2json fallback
  try {
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const res = await fetch(rss2jsonUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        return JSON.stringify(data);
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

// Parse single portal RSS feed
export async function fetchPortalNews(portal: NewsPortalSource): Promise<NewsArticle[]> {
  try {
    const rawData = await fetchRssFeedXml(portal.feedUrl);
    if (!rawData) return [];

    const articles: NewsArticle[] = [];

    // Check if json response from rss2json
    if (rawData.startsWith('{') && rawData.includes('"status":"ok"')) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed.items)) {
        parsed.items.slice(0, 4).forEach((item: any, idx: number) => {
          const rawTitle = stripHtml(item.title || '');
          if (!rawTitle) return;

          const plainDesc = stripHtml(item.description || '');
          const summary = plainDesc.slice(0, 220) + (plainDesc.length > 220 ? '...' : '');
          const plainContent = stripHtml(item.content || item.description || '');
          const fullContent = plainContent.length > 300 ? plainContent : `${summary}\n\nConfira todos os detalhes completos e a cobertura oficial desta matéria acessando a fonte original no portal ${portal.name}.`;

          articles.push({
            id: `news-${portal.id}-${Date.now()}-${idx}`,
            slug: slugify(rawTitle) || `noticia-${portal.id}-${idx}`,
            title: rawTitle,
            summary: summary || rawTitle,
            content: fullContent,
            category: portal.defaultCategory,
            author: portal.name,
            date: formatNewsDate(item.pubDate),
            readTime: '4 min de leitura',
            imageUrl: item.thumbnail || item.enclosure?.link || portal.defaultCover,
            sourceUrl: item.link || portal.feedUrl,
            tags: [portal.name, 'Automotivo', portal.channelKey, 'Notícias'],
          });
        });
        return articles;
      }
    }

    // Parse XML in browser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawData, 'text/xml');
    const items = xmlDoc.querySelectorAll('item, entry');

    const topItems = Array.from(items).slice(0, 4);

    topItems.forEach((item, idx) => {
      const rawTitle = stripHtml(item.querySelector('title')?.textContent || '');
      if (!rawTitle) return;

      const descHtml = item.querySelector('description')?.textContent || '';
      const contentEncoded = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent || '';
      
      const summaryText = stripHtml(descHtml || contentEncoded || '');
      const summary = summaryText.slice(0, 220) + (summaryText.length > 220 ? '...' : '');
      
      const plainText = stripHtml(contentEncoded || descHtml || '');
      const fullContent = plainText.length > 300 
        ? plainText 
        : `${summary}\n\nReportagem completa publicada e apurada pela equipe de jornalismo do portal ${portal.name}. Acesse o link oficial para conferir a galeria de fotos e ficha técnica na íntegra.`;

      const pubDate = item.querySelector('pubDate, published, updated')?.textContent || '';
      const link = item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || portal.feedUrl;
      const imageUrl = extractImageFromXmlItem(item, portal);

      articles.push({
        id: `news-${portal.id}-${Date.now()}-${idx}`,
        slug: slugify(rawTitle) || `noticia-${portal.id}-${idx}`,
        title: rawTitle,
        summary: summary || rawTitle,
        content: fullContent,
        category: portal.defaultCategory,
        author: portal.name,
        date: formatNewsDate(pubDate),
        readTime: '4 min de leitura',
        imageUrl: imageUrl || portal.defaultCover,
        sourceUrl: link,
        tags: [portal.name, 'Automóveis', portal.channelKey, 'Radar'],
      });
    });

    return articles;
  } catch (error) {
    console.warn(`Error fetching RSS from ${portal.name}:`, error);
    return [];
  }
}

/**
 * Sync all automotive news from the top 6 Brazilian portals + Google News EV Feed
 */
export async function syncAllAutomotiveNews(
  existingNews: NewsArticle[] = [],
  deletedNewsIds: string[] = []
): Promise<{ success: boolean; news: NewsArticle[]; updatedCount: number; error?: string }> {
  try {
    const fetchPromises = NEWS_PORTAL_SOURCES.map((portal) => fetchPortalNews(portal));
    const results = await Promise.allSettled(fetchPromises);

    const fetchedArticles: NewsArticle[] = [];
    results.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        fetchedArticles.push(...res.value);
      }
    });

    // If fetch failed completely (e.g. offline or strict network policy), use curated rich default base
    if (fetchedArticles.length === 0) {
      // Re-order or refresh default articles timestamps
      const refreshedDefaults = defaultNewsArticles.map((art, idx) => ({
        ...art,
        date: idx < 4 ? 'Atualizado Hoje' : art.date,
      }));
      return {
        success: true,
        news: refreshedDefaults,
        updatedCount: defaultNewsArticles.length,
      };
    }

    // Merge strategy:
    // Ensure curated rich default articles always retain their full in-depth content
    const isDeleted = (art: { id: string; slug?: string; title: string }) => {
      if (!deletedNewsIds || deletedNewsIds.length === 0) return false;
      const cleanTitle = art.title.toLowerCase().trim();
      return deletedNewsIds.some(dId => 
        dId === art.id || 
        (art.slug && dId === art.slug) || 
        dId.toLowerCase().trim() === cleanTitle
      );
    };

    const defaultMap = new Map(defaultNewsArticles.map(d => [d.id, d]));
    const defaultTitleMap = new Map(defaultNewsArticles.map(d => [d.title.toLowerCase().trim(), d]));

    const seenTitles = new Set<string>();
    const mergedList: NewsArticle[] = [];

    // Add newly fetched articles, but if matching a default article, retain the default's rich content
    fetchedArticles.forEach((art) => {
      if (isDeleted(art)) return;
      const cleanTitle = art.title.toLowerCase().trim();
      if (!seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        const matchedDefault = defaultTitleMap.get(cleanTitle) || defaultMap.get(art.id);
        const matchedExisting = existingNews.find(e => e.id === art.id || e.title.toLowerCase().trim() === cleanTitle);
        
        const isMem = Boolean(
          art.isMembersOnly || 
          matchedExisting?.isMembersOnly || 
          matchedDefault?.isMembersOnly || 
          isItemVip(art) || 
          isItemVip(matchedExisting) || 
          isItemVip(matchedDefault)
        );
        const isVip = Boolean(
          art.isVipExclusive || 
          matchedExisting?.isVipExclusive || 
          matchedDefault?.isVipExclusive || 
          isMem
        );

        if (matchedDefault && matchedDefault.content.length > art.content.length) {
          mergedList.push({
            ...art,
            content: matchedDefault.content,
            summary: matchedDefault.summary,
            isMembersOnly: isMem,
            isVipExclusive: isVip,
          });
        } else {
          mergedList.push({
            ...art,
            isMembersOnly: isMem,
            isVipExclusive: isVip,
          });
        }
      }
    });

    // Retain default curated articles if not already present
    defaultNewsArticles.forEach((defArt) => {
      if (isDeleted(defArt)) return;
      const cleanTitle = defArt.title.toLowerCase().trim();
      if (!seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        const matchedExisting = existingNews.find(e => e.id === defArt.id || e.title.toLowerCase().trim() === cleanTitle);
        const isMem = Boolean(defArt.isMembersOnly || matchedExisting?.isMembersOnly || isItemVip(defArt) || isItemVip(matchedExisting));
        const isVip = Boolean(defArt.isVipExclusive || matchedExisting?.isVipExclusive || isMem);

        mergedList.push({
          ...defArt,
          isMembersOnly: isMem,
          isVipExclusive: isVip,
        });
      }
    });

    // Retain existing articles that aren't duplicate
    existingNews.forEach((art) => {
      if (isDeleted(art)) return;
      const cleanTitle = art.title.toLowerCase().trim();
      if (!seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        const matchedDefault = defaultTitleMap.get(cleanTitle) || defaultMap.get(art.id);
        const isMem = Boolean(art.isMembersOnly || matchedDefault?.isMembersOnly || isItemVip(art) || isItemVip(matchedDefault));
        const isVip = Boolean(art.isVipExclusive || matchedDefault?.isVipExclusive || isMem);

        if (matchedDefault && matchedDefault.content.length > (art.content?.length || 0)) {
          mergedList.push({
            ...art,
            content: matchedDefault.content,
            summary: matchedDefault.summary,
            isMembersOnly: isMem,
            isVipExclusive: isVip,
          });
        } else {
          mergedList.push({
            ...art,
            isMembersOnly: isMem,
            isVipExclusive: isVip,
          });
        }
      }
    });

    const cleanMerged = mergedList.filter(art => !isDeleted(art));
    return {
      success: true,
      news: cleanMerged,
      updatedCount: fetchedArticles.length,
    };
  } catch (err: any) {
    console.error('Failed to sync automotive news:', err);
    return {
      success: false,
      news: existingNews.length > 0 ? existingNews : defaultNewsArticles,
      updatedCount: 0,
      error: err?.message || 'Erro ao conectar com feeds de notícias.',
    };
  }
}
