import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { YouTubeVideo } from '../types';
import { useSiteData } from '../context/SiteDataContext';

const YouTubeLogoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#FF0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
    />
    <polygon fill="#FFFFFF" points="9.545,15.568 15.818,12 9.545,8.432" />
  </svg>
);

interface YouTubeSectionProps {
  onPlayVideo: (video: YouTubeVideo) => void;
  isStandalone?: boolean;
}

export const YouTubeSection: React.FC<YouTubeSectionProps> = ({ onPlayVideo, isStandalone = false }) => {
  const { videos, brand, syncYouTubeChannel, isSyncingYouTube } = useSiteData();
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const displayedVideos = videos.slice(0, 9);

  const getThumbnail = (video?: YouTubeVideo) => {
    if (!video) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';
    if (video.thumbnailUrl && video.thumbnailUrl.startsWith('http')) {
      return video.thumbnailUrl;
    }
    if (video.youtubeId) {
      return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';
  };

  const getVideoDescription = (video: YouTubeVideo): string => {
    if (video.description && typeof video.description === 'string') {
      const clean = video.description.replace(/<[^>]*>?/gm, '').trim();
      if (clean.length > 0) {
        return clean;
      }
    }
    const t = (video.title || '').toLowerCase();
    if (t.includes('desbloque')) {
      return 'Tutorial completo de desbloqueio, configuração de aplicativos e testes práticos de funcionamento em movimento.';
    }
    if (t.includes('ota') || t.includes('atualiza')) {
      return 'Análise detalhada de todas as melhorias, novidades e correções desta nova versão de atualização.';
    }
    if (t.includes('app') || t.includes('instala') || t.includes('waze') || t.includes('maps')) {
      return 'Passo a passo prático para instalação e otimização de aplicativos na central multimídia com máxima fluidez.';
    }
    if (t.includes('som') || t.includes('áudio') || t.includes('equaliza')) {
      return 'Dicas e regulagens de equalização para extrair o melhor desempenho sonoro do seu veículo.';
    }
    return `Demonstração detalhada e dicas práticas gravadas pela equipe ALX Garage no canal oficial.`;
  };

  const handleManualSync = async () => {
    setSyncFeedback('Sincronizando vídeos do canal...');
    const res = await syncYouTubeChannel();
    if (res.success) {
      setSyncFeedback(`${res.count} vídeos atualizados do canal!`);
    } else {
      setSyncFeedback(res.error || 'Não foi possível sincronizar.');
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const getYouTubeUrl = (video: YouTubeVideo) => {
    if (video.videoUrl && video.videoUrl.startsWith('http')) {
      return video.videoUrl;
    }
    if (video.youtubeId) {
      return `https://www.youtube.com/watch?v=${video.youtubeId}`;
    }
    return brand.links.youtube || 'https://www.youtube.com/@alx-garage';
  };

  return (
    <section id="youtube" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative`}>
      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-6">
        
        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="p-3.5 rounded-2xl bg-[#16161E] border border-[#ebbf01]/30 text-white text-xs flex items-center gap-2.5 animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-[#ebbf01] shrink-0" />
            <span className="font-medium">{syncFeedback}</span>
          </div>
        )}

        {/* Actions Bar Card (Matching News Section Header) */}
        <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between text-center sm:text-left gap-4">
          
          {/* Left: ALX Garage PNG Logo */}
          <div className="flex items-center justify-center sm:justify-start shrink-0 mx-auto sm:mx-0">
            <img
              src={brand.youtubeSectionLogoUrl || '/logo_alx_garage.png'}
              alt="ALX Garage"
              className="h-8 sm:h-9.5 w-auto object-contain max-w-[200px]"
            />
          </div>

          {/* Right Controls: Sincronizar Canal & Inscrever-se */}
          <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-wrap w-full sm:w-auto">
            <button
              onClick={handleManualSync}
              disabled={isSyncingYouTube}
              className="h-8.5 px-3.5 bg-[#ebbf01] hover:bg-[#f5cc14] text-black text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#ebbf01]/20 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              title="Sincronizar vídeos mais recentes do YouTube"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingYouTube ? 'animate-spin' : ''}`} />
              <span className="whitespace-nowrap">{isSyncingYouTube ? 'Sincronizando...' : 'Sincronizar Canal'}</span>
            </button>

            <a
              href={brand.links.youtube || 'https://www.youtube.com/@alx-garage'}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8.5 px-3.5 bg-[#16161D] border border-red-500/40 hover:border-red-500 text-white font-extrabold text-[11px] tracking-wider uppercase transition-all shadow-md inline-flex items-center justify-center gap-2 rounded-xl cursor-pointer shrink-0"
            >
              <YouTubeLogoIcon className="w-4 h-4 shrink-0" />
              <span>Inscrever-se</span>
              <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* Video Cards Grid - Identical to News Grid */}
        {displayedVideos.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVideos.map((video, idx) => (
                <a
                  key={video.id}
                  href={getYouTubeUrl(video)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${idx >= 4 ? 'hidden md:flex' : 'flex'} group bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-2xl flex-col justify-between cursor-pointer h-full`}
                >
                  {/* Card Thumbnail Image - Same aspect-[16/10] and visual treatment as News */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#16161D]">
                    <img
                      src={getThumbnail(video)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/20" />
                  </div>

                  {/* Card Body (Uniform height & structure identical to News) */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug font-heading line-clamp-2 min-h-[3rem]">
                        {video.title}
                      </h3>

                      {/* Summary / Brief Description */}
                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 min-h-[3.25rem]">
                        {getVideoDescription(video)}
                      </p>
                    </div>

                    {/* Footer Button - Styled identical to the App card button */}
                    <div className="pt-2">
                      <div className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase tracking-wider group-hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20">
                        <span>ASSISTIR</span>
                        <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Button below grid to go directly to the YouTube Channel */}
            <div className="pt-2 flex justify-center">
              <a
                href={brand.links.youtube || 'https://www.youtube.com/@alx-garage'}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-3.5 px-8 py-4 rounded-2xl bg-[#141419] border border-[#ebbf01]/40 hover:border-[#ebbf01] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-xl shadow-[#ebbf01]/10 hover:shadow-[#ebbf01]/20 hover:scale-[1.02] cursor-pointer"
              >
                <YouTubeLogoIcon className="w-7 h-7 shrink-0 group-hover:scale-110 transition-transform drop-shadow-[0_2px_10px_rgba(255,0,0,0.4)]" />
                <span className="text-white font-extrabold group-hover:text-[#ebbf01] transition-colors">
                  Acessar Canal Oficial no YouTube
                </span>
                <ExternalLink className="w-4 h-4 text-[#ebbf01] shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-[#09090D] border border-white/10 rounded-3xl space-y-4">
            <YouTubeLogoIcon className="w-12 h-12 mx-auto" />
            <div className="text-lg font-bold text-white">Nenhum vídeo nesta categoria</div>
            <p className="text-xs text-white/80 max-w-md mx-auto">
              Clique em "Todos" ou no botão "Sincronizar Canal" para carregar novos vídeos do seu canal.
            </p>
            <button
              onClick={handleManualSync}
              className="px-5 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all"
            >
              Sincronizar Canal Agora
            </button>
          </div>
        )}

      </div>
    </section>
  );
};


