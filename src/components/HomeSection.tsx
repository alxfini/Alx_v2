import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { YouTubeVideo, ProductItem, ALXApp, NewsArticle } from '../types';

interface HomeSectionProps {
  onPlayVideo?: (video: YouTubeVideo) => void;
  onSelectProduct?: (product: ProductItem) => void;
}

// Helper to parse dates/timestamps for news
const parseNewsDate = (dateStr?: string, id?: string): number => {
  if (id) {
    const matchId = id.match(/\d{10,}/);
    if (matchId) {
      return parseInt(matchId[0], 10);
    }
  }
  if (!dateStr) return 0;

  const directParse = Date.parse(dateStr);
  if (!isNaN(directParse) && directParse > 0) {
    return directParse;
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
    return new Date(parseInt(slashMatch[3], 10), parseInt(slashMatch[2], 10) - 1, parseInt(slashMatch[1], 10)).getTime();
  }

  const match = dateStr.toLowerCase().match(/(\d{1,2})\s+(?:de\s+)?([a-zçãõ]+)[,\s]+(?:de\s+)?(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = ptMonths[match[2].trim()] ?? 0;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day).getTime();
  }

  return 0;
};

// Helper to get the absolute newest app
const getLatestApp = (appsList?: ALXApp[]): ALXApp | null => {
  if (!appsList || appsList.length === 0) return null;
  const copy = [...appsList];
  copy.sort((a, b) => {
    // 1. Compare numeric timestamp from ID if registered via admin (e.g., app-1760412345678)
    const matchA = a.id.match(/\d{10,}/);
    const matchB = b.id.match(/\d{10,}/);
    const timeA = matchA ? parseInt(matchA[0], 10) : 0;
    const timeB = matchB ? parseInt(matchB[0], 10) : 0;

    if (timeA && timeB) return timeB - timeA;
    if (timeA) return -1;
    if (timeB) return 1;

    // 2. Check if explicitly marked isNew or isUpdated
    if ((a.isNew || a.isUpdated) && !(b.isNew || b.isUpdated)) return -1;
    if (!(a.isNew || a.isUpdated) && (b.isNew || b.isUpdated)) return 1;

    return 0;
  });
  return copy[0] || appsList[0];
};

// Helper to get the top N newest news articles (unique)
const getLatestNewsArticles = (newsList?: NewsArticle[], count: number = 3): NewsArticle[] => {
  if (!newsList || newsList.length === 0) return [];

  // Deduplicate by title or ID
  const uniqueArticles: NewsArticle[] = [];
  const seenTitles = new Set<string>();

  for (const article of newsList) {
    const key = (article.title || article.id || article.slug).toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueArticles.push(article);
    }
  }

  uniqueArticles.sort((a, b) => {
    // 1. Compare numeric timestamp from ID if registered via admin (e.g., news-1760412345678)
    const matchA = a.id.match(/\d{10,}/);
    const matchB = b.id.match(/\d{10,}/);
    const timeA = matchA ? parseInt(matchA[0], 10) : 0;
    const timeB = matchB ? parseInt(matchB[0], 10) : 0;

    if (timeA && timeB) return timeB - timeA;
    if (timeA) return -1;
    if (timeB) return 1;

    // 2. Compare parsed date
    const dateA = parseNewsDate(a.date, a.id);
    const dateB = parseNewsDate(b.date, b.id);

    if (dateA && dateB) return dateB - dateA;
    return 0;
  });

  return uniqueArticles.slice(0, count);
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
  } = useSiteData();

  // ----------------------------------------------------
  // 1. CAROUSEL DATA SETUP (Notícias alternadas entre as outras seções)
  // ----------------------------------------------------
  const appItem = getLatestApp(apps);
  const latestNewsList = getLatestNewsArticles(news, 3);
  const otaItem = otaUpdates && otaUpdates.length > 0 ? otaUpdates[0] : null;
  const unlockItem = unlockServices && unlockServices.length > 0 ? unlockServices[0] : null;
  const tutorialItem = tutorials && tutorials.length > 0 ? tutorials[0] : null;

  const news1 = latestNewsList[0];
  const news2 = latestNewsList[1];
  const news3 = latestNewsList[2];

  const slideNews1 = news1 ? {
    id: `slide-noticia-1-${news1.id}`,
    badge: 'NOTÍCIAS',
    title: news1.title,
    description: news1.summary || news1.content || 'Cobertura completa sobre lançamentos, atualizações de tecnologia e infraestrutura para carros elétricos.',
    imageUrl: news1.imageUrl || '/imagens/og-padrao.jpg',
    onClick: () => setActivePage({ type: 'noticia', idOrSlug: news1.slug || news1.id }),
  } : null;

  const slideNews2 = news2 ? {
    id: `slide-noticia-2-${news2.id}`,
    badge: 'NOTÍCIAS',
    title: news2.title,
    description: news2.summary || news2.content || 'Cobertura completa sobre lançamentos, atualizações de tecnologia e infraestrutura para carros elétricos.',
    imageUrl: news2.imageUrl || '/imagens/og-padrao.jpg',
    onClick: () => setActivePage({ type: 'noticia', idOrSlug: news2.slug || news2.id }),
  } : null;

  const slideNews3 = news3 ? {
    id: `slide-noticia-3-${news3.id}`,
    badge: 'NOTÍCIAS',
    title: news3.title,
    description: news3.summary || news3.content || 'Cobertura completa sobre lançamentos, atualizações de tecnologia e infraestrutura para carros elétricos.',
    imageUrl: news3.imageUrl || '/imagens/og-padrao.jpg',
    onClick: () => setActivePage({ type: 'noticia', idOrSlug: news3.slug || news3.id }),
  } : null;

  const slides = [
    // 1. APLICATIVOS (Primeiro slide - nome limpo, descrição e foto do último app)
    {
      id: 'slide-apps',
      badge: 'APLICATIVOS ALX',
      title: appItem?.name || 'Catálogo de Aplicativos Homologados Automotivos',
      description: appItem?.description || appItem?.fullDescription || appItem?.tagline || 'Aplicativos testados e otimizados para centrais multimídia automotivas (DiLink, Android Auto e mais).',
      imageUrl: appItem?.coverImage || '/imagens/og-padrao.jpg',
      onClick: () => appItem ? setActivePage({ type: 'app', idOrSlug: appItem.slug || appItem.id }) : setActivePage({ type: 'apps' }),
    },

    // 2. PRIMEIRA NOTÍCIA (Alternada)
    ...(slideNews1 ? [slideNews1] : []),

    // 3. ATUALIZAÇÕES OTA
    {
      id: 'slide-ota',
      badge: 'ATUALIZAÇÕES OTA',
      title: otaItem?.title || 'Guia Definitivo: Como Instalar Atualização OTA via Pendrive USB nos Carros BYD',
      description: otaItem?.changelog || otaItem?.notes || 'Aprenda o passo a passo seguro para formatar seu pendrive, baixar a ROM oficial OTA e realizar o update na multimídia DiLink.',
      imageUrl: otaItem?.imageUrl || '/imagens/fundo-calculadora.jpg',
      onClick: () => setActivePage({ type: 'radar-ota' }),
    },

    // 4. SEGUNDA NOTÍCIA (Alternada - Não sequencial)
    ...(slideNews2 ? [slideNews2] : []),

    // 5. DESBLOQUEIOS
    {
      id: 'slide-desbloqueio',
      badge: 'DESBLOQUEIOS',
      title: unlockItem?.title || 'Serviços Especializados de Desbloqueio DiLink',
      description: unlockItem?.description || 'Liberte todo o potencial da central multimídia com instalação de aplicativos, GPS online e personalização avançada.',
      imageUrl: unlockItem?.imageUrl || '/imagens/og-desbloqueio.jpg',
      onClick: () => setActivePage({ type: 'desbloqueio' }),
    },

    // 6. TERCEIRA NOTÍCIA (Alternada - Não sequencial)
    ...(slideNews3 ? [slideNews3] : []),

    // 7. TUTORIAIS
    {
      id: 'slide-tutoriais',
      badge: 'TUTORIAIS',
      title: tutorialItem?.title || 'Central de Tutoriais e Guias Práticos em Vídeo',
      description: tutorialItem?.description || 'Aprenda como atualizar o sistema, configurar aplicativos e solucionar dúvidas técnicas do seu veículo.',
      imageUrl: tutorialItem?.imageUrl || '/imagens/og-tutoriais.jpg',
      onClick: () => setActivePage({ type: 'tutoriais' }),
    },
  ];

  // Carousel State & Auto-Play Timer (13 Seconds / 13000ms)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const activeSlide = slides[currentSlideIndex] || slides[0];

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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-20 sm:pt-24 pb-12 sm:pb-16 space-y-8 sm:space-y-10">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION (Desktop Grid: 73% Left / 27% Right)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[73%_27%] gap-4 lg:gap-5 items-stretch">
        
        {/* COLUNA DA ESQUERDA (73% - CARROSSEL PRINCIPAL 13s) */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#05070b] border border-white/10 shadow-2xl min-h-[380px] sm:min-h-[440px] lg:min-h-[460px] flex flex-col justify-end group cursor-pointer transition-all duration-300"
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
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
            <span 
              className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-[#061410] shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #00e5a3 0%, #00c4b4 100%)'
              }}
            >
              {activeSlide.badge}
            </span>
          </div>

          {/* Bottom Left: Title, Description & Action Button */}
          <div className="relative z-10 p-5 sm:p-8 lg:p-10 max-w-2xl space-y-3 sm:space-y-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white leading-tight drop-shadow-md tracking-tight">
              {activeSlide.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow">
              {activeSlide.description}
            </p>
            <div className="pt-2 relative inline-block group/btn">
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
                className="relative inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, #1d8cd8 0%, #1064a3 100%)',
                  boxShadow: '0 4px 18px rgba(16, 100, 163, 0.45)'
                }}
              >
                Ver detalhes →
              </button>
            </div>
          </div>

          {/* Bottom Right: Translucent Pill Controls */}
          <div 
            className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-xl"
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

            {/* Slide Indicators */}
            <div className="flex items-center gap-1.5 px-1">
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

            <button 
              type="button"
              onClick={handleTogglePause}
              className="p-1 hover:text-[#00e5a3] transition-colors focus:outline-none"
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
                      Calculadora EV BYD
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
            {recentVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onPlayVideo ? onPlayVideo(video) : setActivePage({ type: 'youtube' })}
                className="relative h-[230px] rounded-2xl p-[1px] bg-gradient-to-l from-red-800/80 via-red-950/30 to-transparent group cursor-pointer shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
            onClick={() => {
              if (currentProduct && onSelectProduct) {
                onSelectProduct(currentProduct);
              } else {
                setActivePage({ type: 'shop' });
              }
            }}
            className="relative h-[230px] rounded-2xl overflow-hidden bg-[#09101d] border border-white/10 group cursor-pointer shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-[#38bdf8]/50"
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
