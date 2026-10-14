import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Handshake, 
  Zap, 
  PlayCircle, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { YouTubeVideo, ProductItem } from '../types';

interface HomeSectionProps {
  onPlayVideo?: (video: YouTubeVideo) => void;
  onSelectProduct?: (product: ProductItem) => void;
}

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
    youtubeVideos,
    products,
  } = useSiteData();

  // ----------------------------------------------------
  // 1. CAROUSEL DATA SETUP (1 Item from 5 Sections)
  // ----------------------------------------------------
  const unlockItem = unlockServices && unlockServices.length > 0 ? unlockServices[0] : null;
  const appItem = apps && apps.length > 0 ? apps[0] : null;
  const otaItem = otaUpdates && otaUpdates.length > 0 ? otaUpdates[0] : null;
  const tutorialItem = tutorials && tutorials.length > 0 ? tutorials[0] : null;
  const newsItem = news && news.length > 0 ? news[0] : null;

  const slides = [
    {
      id: 'slide-ota',
      badge: 'RADAR OTA FIRMWARE',
      title: otaItem?.title || 'Guia Definitivo: Como Instalar Atualização OTA via Pendrive USB nos Carros BYD',
      description: otaItem?.changelog || otaItem?.notes || 'Aprenda o passo a passo seguro para formatar seu pendrive, baixar a ROM oficial OTA e realizar o update na multimídia DiLink.',
      imageUrl: otaItem?.imageUrl || '/imagens/fundo-calculadora.jpg',
      onClick: () => setActivePage({ type: 'radar-ota' }),
    },
    {
      id: 'slide-desbloqueio',
      badge: 'DESBLOQUEIO MULTIMÍDIA',
      title: unlockItem?.title || 'Serviços Especializados de Desbloqueio DiLink',
      description: unlockItem?.description || 'Liberte todo o potencial da central multimídia com instalação de aplicativos, GPS online e personalização avançada.',
      imageUrl: unlockItem?.imageUrl || '/imagens/og-desbloqueio.jpg',
      onClick: () => setActivePage({ type: 'desbloqueio' }),
    },
    {
      id: 'slide-apps',
      badge: 'ALX STORE • APLICATIVOS',
      title: appItem?.name ? `ALX Store: ${appItem.name}` : 'Catálogo de Aplicativos Homologados Automotivos',
      description: appItem?.description || 'Aplicativos testados e otimizados para centrais multimídia automotivas (DiLink, Android Auto e mais).',
      imageUrl: appItem?.imageUrl || appItem?.bannerUrl || '/imagens/og-padrao.jpg',
      onClick: () => setActivePage({ type: 'apps' }),
    },
    {
      id: 'slide-tutoriais',
      badge: 'TUTORIAIS & GUIAS',
      title: tutorialItem?.title || 'Central de Tutoriais e Guias Práticos em Vídeo',
      description: tutorialItem?.description || 'Aprenda como atualizar o sistema, configurar aplicativos e solucionar dúvidas técnicas do seu veículo.',
      imageUrl: tutorialItem?.imageUrl || '/imagens/og-tutoriais.jpg',
      onClick: () => setActivePage({ type: 'tutoriais' }),
    },
    {
      id: 'slide-noticias',
      badge: 'NOTÍCIAS & TENDÊNCIAS EV',
      title: newsItem?.title || 'Radar de Notícias e Inovações em Mobilidade Elétrica',
      description: newsItem?.summary || newsItem?.excerpt || 'Cobertura completa sobre lançamentos, atualizações de tecnologia e infraestrutura para carros elétricos.',
      imageUrl: newsItem?.imageUrl || '/imagens/og-padrao.jpg',
      onClick: () => setActivePage({ type: 'noticias' }),
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
  // 2. YOUTUBE RECENT VIDEOS (Col 1 & 2)
  // ----------------------------------------------------
  const recentVideos = (youtubeVideos && youtubeVideos.length > 0
    ? youtubeVideos.slice(0, 2)
    : []
  );

  // ----------------------------------------------------
  // 3. SHOP PRODUCT LOOP (20 Seconds / 20000ms)
  // ----------------------------------------------------
  const [shopIndex, setShopIndex] = useState(0);
  const activeProducts = products && products.length > 0 ? products : [];

  useEffect(() => {
    if (activeProducts.length <= 1) return;

    const timer = setInterval(() => {
      setShopIndex((prev) => (prev + 1) % activeProducts.length);
    }, 20000);

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
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#060c16] border border-white/10 shadow-2xl min-h-[380px] sm:min-h-[440px] lg:min-h-[460px] flex flex-col justify-end group cursor-pointer transition-all duration-300"
          onClick={activeSlide.onClick}
        >
          {/* Background Image with Fallback */}
          <div className="absolute inset-0 z-0">
            <img 
              src={activeSlide.imageUrl} 
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/imagens/fundo-calculadora.jpg';
              }}
            />
            {/* Midnight Blue Glow Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 12% 25%, rgba(16, 54, 88, 0.55) 0%, transparent 50%), linear-gradient(90deg, #060c16 0%, rgba(6, 12, 22, 0.88) 45%, rgba(6, 12, 22, 0.35) 100%)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060c16] via-transparent to-transparent opacity-90" />
          </div>

          {/* Top Left: Category Badge Pill */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
            <span 
              className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-xs font-extrabold uppercase tracking-wider text-[#061410] shadow-lg"
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
            <div className="pt-2">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  activeSlide.onClick();
                }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #1d8cd8 0%, #1064a3 100%)'
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
                      Experiências práticas, oficinas especializadas e estética transparente.
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
        
        {/* COLUNAS 1 & 2 (DESTAQUES DO CANAL - 2 VÍDEOS YOUTUBE) */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#38bdf8]">
              DESTAQUES DO CANAL
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentVideos.length > 0 ? (
              recentVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onPlayVideo ? onPlayVideo(video) : setActivePage({ type: 'youtube' })}
                  className="relative h-[230px] rounded-2xl overflow-hidden bg-[#0a0f18] group cursor-pointer shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                  style={{
                    border: '1px solid transparent',
                    borderImage: 'linear-gradient(270deg, rgba(127,29,29,0.85) 0%, rgba(127,29,29,0) 100%) 1'
                  }}
                >
                  {/* Thumbnail Image */}
                  <img
                    src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/imagens/fundo-calculadora.jpg';
                    }}
                  />

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

                  {/* Center Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#1d8cd8]/90 text-white flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                      <PlayCircle className="w-8 h-8 fill-white/20 stroke-white" />
                    </div>
                  </div>

                  {/* Bottom Title */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                      {video.title}
                    </h3>
                  </div>
                </div>
              ))
            ) : (
              // Fallback placeholder cards if youtubeVideos array is empty
              [1, 2].map((num) => (
                <div
                  key={num}
                  onClick={() => setActivePage({ type: 'youtube' })}
                  className="relative h-[230px] rounded-2xl overflow-hidden bg-[#0a0f18] group cursor-pointer shadow-xl"
                  style={{
                    border: '1px solid transparent',
                    borderImage: 'linear-gradient(270deg, rgba(127,29,29,0.85) 0%, rgba(127,29,29,0) 100%) 1'
                  }}
                >
                  <img
                    src="/imagens/fundo-calculadora.jpg"
                    alt="Canal Alx⁺"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#1d8cd8]/90 text-white flex items-center justify-center shadow-2xl">
                      <PlayCircle className="w-8 h-8 fill-white/20 stroke-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {num === 1 ? 'Análises Técnicas e Tutoriais Automotivos Alx⁺' : 'Conheça as Soluções e Atualizações DiLink em Vídeo'}
                    </h3>
                  </div>
                </div>
              ))
            )}
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
