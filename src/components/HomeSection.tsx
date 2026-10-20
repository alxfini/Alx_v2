import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { YouTubeVideo, ProductItem, ALXApp, NewsArticle } from '../types';
import { getMediaPreviewUrl } from '../utils/mediaUrl';
import { isItemVisibleOnSite } from '../utils/visibility';

interface HomeSectionProps {
  onPlayVideo?: (video: YouTubeVideo) => void;
  onSelectProduct?: (product: ProductItem) => void;
}

export interface CarouselSlide {
  id: string;
  badge: string;
  highlightBadge?: string;
  title: string;
  description: string;
  imageUrl: string;
  onClick: () => void;
}

// Helper to parse dates/timestamps for news (matching NewsSection logic)
const parseArticleDate = (dateStr?: string): number => {
  if (!dateStr) return 0;

  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed) && parsed > 0) {
    return parsed;
  }

  const ptMonths: Record<string, number> = {
    'janeiro': 0, 'jan': 0,
    'fevereiro': 1, 'fev': 1,
    'março': 2, 'marco': 2, 'mar': 2,
    'abril': 3, 'abr': 3,
    'maio': 4, 'mai': 4,
    'junho': 5, 'jun': 5,
    'julho': 6, 'jul': 6,
    'agosto': 7, 'ago': 7,
    'setembro': 8, 'set': 8,
    'outubro': 9, 'out': 9,
    'novembro': 10, 'nov': 10,
    'dezembro': 11, 'dez': 11,
  };

  const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    const year = parseInt(slashMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  const match = dateStr.toLowerCase().match(/(\d{1,2})\s+(?:de\s+)?([a-zçãõ]+)[,\s]+(?:de\s+)?(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].trim();
    const year = parseInt(match[3], 10);
    const month = ptMonths[monthName] !== undefined ? ptMonths[monthName] : 0;
    return new Date(year, month, day).getTime();
  }

  return 0;
};

export const HomeSection: React.FC<HomeSectionProps> = ({
  onPlayVideo,
  onSelectProduct,
}) => {
  const {
    setActivePage,
    unlockServices,
    apps,
    otaUpdates,
    tutorials,
    news,
    videos,
    products,
    syncNewsArticles,
  } = useSiteData();

  // Garante sincronização de notícias caso ainda não estejam no estado
  useEffect(() => {
    if (!news || news.length === 0) {
      syncNewsArticles();
    }
  }, [news, syncNewsArticles]);

  // -------------------------------------------------------------------------
  // 1. CAROUSEL DATA SETUP (100% DADOS REAIS EXTRAÍDOS DAS PÁGINAS DO SITE)
  // -------------------------------------------------------------------------

  // Helper para extrair a descrição real cadastrada no app sem exibir texto genérico de placeholder
  const getCleanAppDescription = (app: ALXApp): string => {
    const genericPlaceholders = [
      'descrição completa',
      'descrição detalhada',
      'descrição curta',
      'detalhes de instalação',
      'para a página do app',
    ];

    const isValidRealText = (text?: string): boolean => {
      if (!text || !text.trim()) return false;
      const lower = text.toLowerCase().trim();
      return !genericPlaceholders.some((p) => lower.includes(p));
    };

    // 1. Prioriza a descrição principal do catálogo (app.description)
    if (isValidRealText(app.description)) {
      return app.description.trim();
    }

    // 2. Se a descrição for placeholder, tenta a tagline/subtítulo (app.tagline)
    if (isValidRealText(app.tagline)) {
      return app.tagline.trim();
    }

    // 3. Tenta a descrição detalhada (app.fullDescription)
    if (isValidRealText(app.fullDescription)) {
      return app.fullDescription.trim();
    }

    // Se todos forem placeholders, retorna o melhor texto disponível
    return (
      app.description ||
      app.tagline ||
      app.fullDescription ||
      'Aplicativo homologado e otimizado para centrais multimídia automotivas.'
    );
  };

  // 1a. SLIDE DE APPS: Sorteio aleatório a cada F5 / carregamento do componente
  const [appRandomSeed] = useState(() => Math.random());
  const randomApp = useMemo<ALXApp | null>(() => {
    if (!apps || apps.length === 0) return null;
    const visiblePool = apps.filter(isItemVisibleOnSite);
    const pool = visiblePool.length > 0 ? visiblePool : apps;
    const randomIndex = Math.floor(appRandomSeed * pool.length);
    return pool[randomIndex] || pool[0];
  }, [apps, appRandomSeed]);

  // 1b. SLIDES DE NOTÍCIAS: Deduplicadas, ordenadas pelas mais novas e alternadas sem repetição
  const [newsShuffleSeed] = useState(() => Math.random());
  const randomizedNews = useMemo<NewsArticle[]>(() => {
    if (!news || news.length === 0) return [];

    // Deduplica notícias reais por ID ou Título
    const uniqueMap = new Map<string, NewsArticle>();
    for (const article of news) {
      const key = (article.id || article.slug || article.title).toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, article);
      }
    }

    const uniqueArticles = Array.from(uniqueMap.values());

    // Ordena do mais recente para o mais antigo com base na data real / timestamp do ID
    uniqueArticles.sort((a, b) => {
      const matchA = a.id?.match(/\d{10,}/);
      const matchB = b.id?.match(/\d{10,}/);
      const timeA = matchA ? parseInt(matchA[0], 10) : 0;
      const timeB = matchB ? parseInt(matchB[0], 10) : 0;

      if (timeA && timeB) return timeB - timeA;
      if (timeA) return -1;
      if (timeB) return 1;

      const dateA = parseArticleDate(a.date);
      const dateB = parseArticleDate(b.date);
      if (dateA && dateB) return dateB - dateA;
      return 0;
    });

    // Pega o conjunto das notícias mais recentes (até 8) e varia entre elas a cada F5
    const recentPool = uniqueArticles.slice(0, Math.min(8, uniqueArticles.length));
    const shuffled = [...recentPool].sort((a, b) => {
      const hashA = (a.id + newsShuffleSeed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hashB = (b.id + newsShuffleSeed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return (hashA % 100) - (hashB % 100);
    });

    // Retorna até 3 notícias distintas para intercalar no carrossel
    return shuffled.slice(0, Math.min(3, shuffled.length));
  }, [news, newsShuffleSeed]);

  // 1c. SLIDE DE ATUALIZAÇÃO OTA: Sempre a mais nova cadastrada
  const latestOta = useMemo(() => {
    if (!otaUpdates || otaUpdates.length === 0) return null;
    return otaUpdates[0];
  }, [otaUpdates]);

  // 1d. SLIDE DE DESBLOQUEIO: Mais recente cadastrado
  const latestUnlock = useMemo(() => {
    if (!unlockServices || unlockServices.length === 0) return null;
    return unlockServices[0];
  }, [unlockServices]);

  // 1e. SLIDE DE TUTORIAIS: Sempre o mais novo cadastrado (índice 0)
  const latestTutorial = useMemo(() => {
    if (!tutorials || tutorials.length === 0) return null;
    const visibleTuts = tutorials.filter(isItemVisibleOnSite);
    const pool = visibleTuts.length > 0 ? visibleTuts : tutorials;
    return pool[0] || null;
  }, [tutorials]);

  // Montagem da lista final de slides do carrossel (Ordem: Apps -> Notícias -> OTA -> Notícias -> Desbloqueios -> Notícias -> Tutoriais)
  const slides: CarouselSlide[] = useMemo(() => {
    const result: CarouselSlide[] = [];

    // 1. APP (Sorteio aleatório a cada F5, sem 'ALX Store', com título, descrição e foto reais)
    if (randomApp) {
      const appDesc = getCleanAppDescription(randomApp);

      result.push({
        id: `slide-app-${randomApp.id}`,
        badge: 'APLICATIVOS ALX',
        title: randomApp.name,
        description: appDesc,
        imageUrl: getMediaPreviewUrl(randomApp.coverImage) || randomApp.coverImage || '/imagens/apps/byd-cockpit.jpg',
        onClick: () => setActivePage({ type: 'app', idOrSlug: randomApp.slug || randomApp.id }),
      });
    }

    // 2. PRIMEIRA NOTÍCIA REAL (Sorteada entre as mais recentes, sem duplicidade)
    if (randomizedNews[0]) {
      const art = randomizedNews[0];
      result.push({
        id: `slide-noticia-1-${art.id}`,
        badge: 'NOTÍCIAS',
        title: art.title,
        description: art.summary || art.content || '',
        imageUrl: getMediaPreviewUrl(art.imageUrl) || art.imageUrl || '/imagens/noticias/noticia-1.jpg',
        onClick: () => setActivePage({ type: 'news', idOrSlug: art.slug || art.id }),
      });
    }

    // 3. ATUALIZAÇÕES OTA (Mais recente + Destaque da atualização)
    if (latestOta) {
      const otaDescription = (Array.isArray(latestOta.changelog) && latestOta.changelog.length > 0)
        ? latestOta.changelog.join(' • ')
        : (typeof latestOta.changelog === 'string' ? latestOta.changelog : '') ||
          latestOta.installationGuide ||
          latestOta.applicableCars ||
          `Firmware oficial ${latestOta.version} com melhorias e otimizações de sistema.`;

      result.push({
        id: `slide-ota-${latestOta.id}`,
        badge: 'ATUALIZAÇÕES OTA',
        highlightBadge: '⚡ ÚLTIMA ATUALIZAÇÃO',
        title: latestOta.title || `Atualização Oficial DiLink ${latestOta.version}`,
        description: otaDescription,
        imageUrl: getMediaPreviewUrl(latestOta.imageUrl) || latestOta.imageUrl || '/imagens/fundo-calculadora.jpg',
        onClick: () => setActivePage({ type: 'ota', idOrSlug: latestOta.slug || latestOta.id }),
      });
    }

    // 4. SEGUNDA NOTÍCIA REAL (Intercalada, sem repetição)
    if (randomizedNews[1]) {
      const art = randomizedNews[1];
      result.push({
        id: `slide-noticia-2-${art.id}`,
        badge: 'NOTÍCIAS',
        title: art.title,
        description: art.summary || art.content || '',
        imageUrl: getMediaPreviewUrl(art.imageUrl) || art.imageUrl || '/imagens/noticias/noticia-1.jpg',
        onClick: () => setActivePage({ type: 'news', idOrSlug: art.slug || art.id }),
      });
    }

    // 5. DESBLOQUEIOS (Mais recente cadastrado)
    if (latestUnlock) {
      result.push({
        id: `slide-desbloqueio-${latestUnlock.id}`,
        badge: 'DESBLOQUEIOS',
        title: latestUnlock.title,
        description: latestUnlock.summary || latestUnlock.content || 'Serviço profissional de desbloqueio para centrais multimídia BYD.',
        imageUrl: getMediaPreviewUrl(latestUnlock.imageUrl) || latestUnlock.imageUrl || '/imagens/og-desbloqueio.jpg',
        onClick: () => setActivePage({ type: 'servico-desbloqueio', idOrSlug: latestUnlock.slug || latestUnlock.id }),
      });
    }

    // 6. TERCEIRA NOTÍCIA REAL (Intercalada, sem repetição)
    if (randomizedNews[2]) {
      const art = randomizedNews[2];
      result.push({
        id: `slide-noticia-3-${art.id}`,
        badge: 'NOTÍCIAS',
        title: art.title,
        description: art.summary || art.content || '',
        imageUrl: getMediaPreviewUrl(art.imageUrl) || art.imageUrl || '/imagens/noticias/noticia-1.jpg',
        onClick: () => setActivePage({ type: 'news', idOrSlug: art.slug || art.id }),
      });
    }

    // 7. TUTORIAIS (Sempre o mais novo cadastrado)
    if (latestTutorial) {
      result.push({
        id: `slide-tutorial-${latestTutorial.id}`,
        badge: 'TUTORIAIS',
        title: latestTutorial.title,
        description: latestTutorial.summary || latestTutorial.content || 'Guias passo a passo para sua central multimídia e veículo elétrico.',
        imageUrl: getMediaPreviewUrl(latestTutorial.imageUrl) || latestTutorial.imageUrl || '/imagens/og-tutoriais.jpg',
        onClick: () => setActivePage({ type: 'tutorial', idOrSlug: latestTutorial.slug || latestTutorial.id }),
      });
    }

    return result;
  }, [randomApp, randomizedNews, latestOta, latestUnlock, latestTutorial, setActivePage]);

  // Fallback seguro se não houver dados carregados
  const fallbackSlide: CarouselSlide = {
    id: 'slide-fallback',
    badge: 'ALX⁺',
    title: 'Portal Oficial ALX⁺',
    description: 'Central multimídia, aplicativos homologados, atualizações de firmware e tutoriais automotivos.',
    imageUrl: '/imagens/fundo-calculadora.jpg',
    onClick: () => setActivePage({ type: 'home' }),
  };

  // Carousel State & Auto-Play Timer (13 Seconds / 13000ms)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Garante que o índice não fique fora dos limites caso a quantidade de slides mude
  useEffect(() => {
    if (slides.length > 0 && currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 13000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused((prev) => !prev);
  };

  const activeSlide = (slides.length > 0 && slides[currentSlideIndex])
    ? slides[currentSlideIndex]
    : (slides[0] || fallbackSlide);

  // ----------------------------------------------------
  // 2. YOUTUBE RECENT VIDEOS (Pegar sempre os 2 últimos vídeos)
  // ----------------------------------------------------
  const getVideoThumbnail = (video: YouTubeVideo): string => {
    if (video.thumbnailUrl && video.thumbnailUrl.startsWith('http')) {
      return video.thumbnailUrl;
    }
    if (video.youtubeId) {
      return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
    }
    return 'https://img.youtube.com/vi/AERBcFtpJz8/hqdefault.jpg';
  };

  const rawVideos = (videos && videos.length > 0)
    ? videos.filter((v) => !v.isVipExclusive && !v.isMembersOnly)
    : [];

  const recentVideos = rawVideos.length >= 2
    ? rawVideos.slice(0, 2)
    : rawVideos.length === 1
    ? [
        rawVideos[0],
        {
          id: 'vid-alx-1',
          youtubeId: 'AERBcFtpJz8',
          title: 'YouTube Perfeito para Multimídias Automotivas: Configuração & Dicas',
          description: '',
          date: '',
          duration: '',
          category: 'Multimídia',
          thumbnailUrl: 'https://img.youtube.com/vi/AERBcFtpJz8/hqdefault.jpg',
        }
      ]
    : [
        {
          id: 'vid-alx-1',
          youtubeId: 'AERBcFtpJz8',
          title: 'YouTube Perfeito para Multimídias Automotivas: Configuração & Dicas',
          description: '',
          date: '',
          duration: '',
          category: 'Multimídia',
          thumbnailUrl: 'https://img.youtube.com/vi/AERBcFtpJz8/hqdefault.jpg',
        },
        {
          id: 'vid-alx-2',
          youtubeId: 'EDZ6lEtqIOg',
          title: '🔓 NOVO DESBLOQUEIO BYD | Funciona em Todas as Versões',
          description: '',
          date: '',
          duration: '',
          category: 'Tutoriais',
          thumbnailUrl: 'https://img.youtube.com/vi/EDZ6lEtqIOg/hqdefault.jpg',
        },
      ];

  // ----------------------------------------------------
  // 3. SHOP PRODUCT LOOP (23 Seconds / 23000ms)
  // ----------------------------------------------------
  const [shopIndex, setShopIndex] = useState(0);
  const activeProducts = products && products.length > 0 ? products : [];

  useEffect(() => {
    if (activeProducts.length <= 1) return;

    const timer = setInterval(() => {
      setShopIndex((prev) => (prev + 1) % activeProducts.length);
    }, 23000);

    return () => clearInterval(timer);
  }, [activeProducts.length]);

  const currentProduct = activeProducts[shopIndex] || null;

  return (
    <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 pt-[72px] sm:pt-20 pb-12 sm:pb-16 space-y-8 sm:space-y-10">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION (Desktop Grid: 70% Left / 30% Right)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4 lg:gap-5 items-stretch">
        
        {/* COLUNA DA ESQUERDA (70% - CARROSSEL PRINCIPAL 13s) */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#05070b] border border-white/10 shadow-2xl min-h-[300px] sm:min-h-[420px] lg:min-h-[440px] flex flex-col justify-end group cursor-pointer transition-all duration-300"
          onClick={activeSlide.onClick}
        >
          {/* Background Image - Clean & Visually Sharp */}
          <div className="absolute inset-0 z-0">
            <img 
              src={activeSlide.imageUrl} 
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/imagens/fundo-calculadora.jpg';
              }}
            />
            {/* Smooth Neutral Gradient Overlay (Only on left & bottom for text readability) */}
            <div 
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background: 'linear-gradient(90deg, rgba(5,7,11,0.88) 0%, rgba(5,7,11,0.45) 45%, transparent 100%), linear-gradient(0deg, rgba(5,7,11,0.85) 0%, rgba(5,7,11,0.2) 40%, transparent 80%)'
              }}
            />
          </div>

          {/* Top Left: Category Badge Pill */}
          <div className="absolute top-3.5 sm:top-6 left-3.5 sm:left-6 z-10">
            <span 
              className="inline-flex items-center px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#061410] shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #00e5a3 0%, #00c4b4 100%)'
              }}
            >
              {activeSlide.badge}
            </span>
          </div>

          {/* Bottom Left: Title, Description & Action Button */}
          <div className="relative z-10 p-4 sm:p-8 lg:p-10 max-w-2xl space-y-2 sm:space-y-4 pr-16 sm:pr-8">
            {activeSlide.highlightBadge && (
              <div>
                <span 
                  className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black shadow-md"
                  style={{
                    background: 'linear-gradient(90deg, #ffe600 0%, #c6f50b 100%)'
                  }}
                >
                  {activeSlide.highlightBadge}
                </span>
              </div>
            )}
            <h1 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white leading-tight drop-shadow-md tracking-tight">
              {activeSlide.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow">
              {activeSlide.description}
            </p>
            <div className="pt-1 sm:pt-2 relative inline-block group/btn">
              {/* Vibrant Glowing Light Aura on Hover */}
              <div 
                className="absolute -inset-1 rounded-full opacity-0 group-hover/btn:opacity-100 transition-all duration-500 blur-md pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, #00e5a3 0%, #1d8cd8 50%, #00c4b4 100%)'
                }}
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  activeSlide.onClick();
                }}
                className="relative inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, #1d8cd8 0%, #1064a3 100%)',
                  boxShadow: '0 4px 18px rgba(16, 100, 163, 0.45)'
                }}
              >
                Ver detalhes →
              </button>
            </div>
          </div>

          {/* Bottom Right: Slide Controls (On mobile: ONLY prev/next arrows to avoid overlapping button; on desktop: full pill with indicators & pause) */}
          <div 
            className="absolute bottom-3.5 sm:bottom-6 right-3.5 sm:right-6 z-20 flex items-center gap-1 sm:gap-2.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={handlePrevSlide}
              className="p-1 hover:text-[#00e5a3] transition-colors focus:outline-none"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Slide Indicators - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1.5 px-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentSlideIndex
                      ? 'w-5 sm:w-6 h-1.5 bg-[#1d8cd8]'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause toggle - Hidden on mobile */}
            <button 
              type="button"
              onClick={handleTogglePause}
              className="hidden sm:block p-1 hover:text-[#00e5a3] transition-colors focus:outline-none"
              title={isPaused ? 'Continuar' : 'Pausar'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button 
              type="button"
              onClick={handleNextSlide}
              className="p-1 hover:text-[#00e5a3] transition-colors focus:outline-none"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* COLUNA DA DIREITA (27% - 2 CARDS EMPILHADOS) */}
        <div className="flex flex-col gap-4 lg:gap-5 justify-between">
          
          {/* CARD 1 (Superior - Área VIP na cor #c6f50b) */}
          <div 
            className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:border-[#c6f50b]/50 h-full min-h-[210px]"
            style={{
              background: 'radial-gradient(circle at 18% 22%, rgba(198, 245, 11, 0.18) 0%, transparent 58%), radial-gradient(circle at 88% 85%, rgba(198, 245, 11, 0.10) 0%, transparent 55%), linear-gradient(160deg, #111809 0%, #060906 52%, #0d1408 100%)',
              border: '1px solid rgba(198, 245, 11, 0.28)'
            }}
          >
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#c6f50b] block mb-1.5">
                PLATAFORMA PRÓPRIA
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug mb-2">
                Mais que um portal: o ponto de encontro da comunidade Alx⁺.
              </h2>
              <p className="text-xs sm:text-xs text-slate-300 leading-relaxed">
                O Alx⁺ é a casa oficial dos conteúdos, arquivos, parceiros e benefícios exclusivos.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setActivePage({ type: 'vip' })}
                className="w-full py-2.5 sm:py-3 px-4 rounded-full font-extrabold text-xs sm:text-sm text-[#1a2600] flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #ffe600 0%, #c6f50b 52%, #73ff00 100%)',
                  boxShadow: '0 0 26px rgba(198, 245, 11, 0.45)'
                }}
              >
                Conhecer a Área VIP →
              </button>
            </div>
          </div>

          {/* CARD 2 (Inferior - Ecossistema Alx⁺ em Tom Verde) */}
          <div 
            className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:border-[#34d399]/50 h-full min-h-[210px]"
            style={{
              background: 'radial-gradient(circle at 15% 22%, rgba(16, 185, 129, 0.18) 0%, transparent 55%), linear-gradient(160deg, #081815 0%, #050a09 55%, #071512 100%)',
              border: '1px solid rgba(16, 185, 129, 0.28)'
            }}
          >
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#34d399] block mb-3">
                ECOSSISTEMA ALX⁺
              </span>

              <div className="space-y-3">
                {/* Item 1: Parceiros Credenciados */}
                <button
                  type="button"
                  onClick={() => setActivePage({ type: 'parceiros' })}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#10382d] border border-[#34d399]/30 flex items-center justify-center shrink-0 text-base">
                    🤝
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover/item:text-[#34d399] transition-colors">
                      Parceiros Credenciados
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight mt-0.5">
                      Parceiros Alx⁺, Empresas e serviços qualificados com exclusividade.
                    </p>
                  </div>
                </button>

                {/* Item 2: Calculadora EV BYD */}
                <button
                  type="button"
                  onClick={() => setActivePage({ type: 'calculadora' })}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#10382d] border border-[#34d399]/30 flex items-center justify-center shrink-0 text-base">
                    🔋
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover/item:text-[#34d399] transition-colors">
                      Calculadora EV
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight mt-0.5">
                      Simule autonomia real, tempo de recarga e custo por km na hora.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. SEÇÃO INFERIOR (Grid 3 Colunas: 2 Vídeos + 1 Shop)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 pt-2">
        
        {/* COLUNAS 1 & 2 (DESTAQUES DO CANAL - 2 VÍDEOS YOUTUBE REAL THUMBNAIL, SEM ÍCONE PLAY) */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#38bdf8]">
              DESTAQUES DO CANAL
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentVideos.map((video, idx) => (
              <div
                key={video.id}
                onClick={() => setActivePage({ type: 'youtube' })}
                className={`relative h-[210px] sm:h-[220px] rounded-2xl p-[1px] bg-gradient-to-l from-red-800/80 via-red-950/30 to-transparent group cursor-pointer shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  idx > 0 ? 'hidden sm:block' : 'block'
                }`}
              >
                <div className="relative w-full h-full rounded-[15px] overflow-hidden bg-[#0a0f18]">
                  {/* Real YouTube Video Thumbnail Image */}
                  <img
                    src={getVideoThumbnail(video)}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const fallbackUrl = video.youtubeId 
                        ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                        : 'https://img.youtube.com/vi/AERBcFtpJz8/hqdefault.jpg';
                      (e.target as HTMLImageElement).src = fallbackUrl;
                    }}
                  />

                  {/* Dark Vignette Overlay for Title Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

                  {/* Bottom Title in White (Matching Alx Shop Card style) */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA 3 (ALX SHOP - 1 CARD EM LOOP DE 20 SECONDS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#38bdf8]">
              ALX SHOP
            </h2>
          </div>

          <div
            onClick={() => setActivePage({ type: 'shop' })}
            className="relative h-[210px] sm:h-[220px] rounded-2xl overflow-hidden bg-[#09101d] border border-white/10 group cursor-pointer shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-[#38bdf8]/50"
          >
            {/* Background Image / Product Image */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#070d18]">
              <img
                src={currentProduct?.imageUrl || '/logo_alx_garage.png'}
                alt={currentProduct?.name || 'ALX Shop'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo_alx_garage.png';
                }}
              />
            </div>

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            {/* Bottom Info: Product Title & Description ONLY (NO PRICE) */}
            <div className="absolute bottom-0 inset-x-0 p-4 z-10">
              <h3 className="text-sm font-bold text-white line-clamp-1 drop-shadow-md">
                {currentProduct?.name || 'Scanner De Diagnóstico Automotivo Uscan...'}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {currentProduct?.description || 'Acessórios e equipamentos homologados para veículos elétricos.'}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
