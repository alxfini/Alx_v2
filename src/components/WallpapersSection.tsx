import React, { useState, useMemo, useEffect } from 'react';
import { 
  Image, 
  Video, 
  Download, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Play, 
  Eye, 
  ChevronDown, 
  Monitor, 
  Maximize2, 
  X,
  Crown,
  Share2,
  Check,
  Layers
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { WallpaperItem } from '../types';
import { getMediaPreviewUrl, isVideoMediaUrl } from '../utils/mediaUrl';

interface WallpapersSectionProps {
  isStandalone?: boolean;
}

export const WallpapersSection: React.FC<WallpapersSectionProps> = ({ isStandalone = false }) => {
  const { wallpapers = [], openDownloadGateway, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');
  const [activePreview, setActivePreview] = useState<WallpaperItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Responsive Pagination State
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const batchSize = isMobile ? 5 : 15;
  const [visibleLimit, setVisibleLimit] = useState(batchSize);

  useEffect(() => {
    setVisibleLimit(isMobile ? 5 : 15);
  }, [searchQuery, selectedCategory, selectedType, isMobile]);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const list = ['Todos'];
    wallpapers.forEach((w) => {
      if (w.category && !list.includes(w.category)) {
        list.push(w.category);
      }
    });
    return list;
  }, [wallpapers]);

  // Filtered and Sorted wallpapers (ordered by upload / addition date, newest first)
  const filteredWallpapers = useMemo(() => {
    const list = [...wallpapers];
    list.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateA !== dateB && !isNaN(dateA) && !isNaN(dateB)) {
        return dateB - dateA;
      }
      return 0;
    });

    return list.filter((w) => {
      const matchSearch =
        !searchQuery.trim() ||
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.tags && w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchCategory =
        selectedCategory === 'Todos' || w.category === selectedCategory;

      const matchType =
        selectedType === 'all' || w.type === selectedType;

      return matchSearch && matchCategory && matchType;
    });
  }, [wallpapers, searchQuery, selectedCategory, selectedType]);

  const visibleWallpapers = useMemo(() => {
    return filteredWallpapers.slice(0, visibleLimit);
  }, [filteredWallpapers, visibleLimit]);

  const hasMore = visibleLimit < filteredWallpapers.length;

  const handleLoadMore = () => {
    setVisibleLimit((prev) => prev + (isMobile ? 5 : 15));
  };

  const handleDownload = (item: WallpaperItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (item.isMembersOnly && !isVipLoggedIn && !isAdminAuthenticated) {
      openVipModal();
      return;
    }

    openDownloadGateway({
      id: item.id,
      title: item.title,
      category: 'wallpaper',
      version: item.resolution || item.badge || 'HD 4K',
      rawDownloadUrl: item.downloadUrl || item.videoUrl || item.previewUrl,
      applicableCars: item.category,
      modelTarget: item.aspectRatio || 'Centrais & Telas',
      fileSize: item.type === 'video' ? 'Vídeo MP4 Animado' : 'Wallpaper High-Res',
      isMembersOnly: item.isMembersOnly || item.isVipExclusive,
      isVipExclusive: item.isMembersOnly || item.isVipExclusive,
    });
  };

  const handleShare = (item: WallpaperItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/wallpapers/${item.slug || item.id}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: shareUrl
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <section id="wallpapers" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative`}>
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ebbf01]/4 blur-[160px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-6">
        
        {/* Controls Bar Card */}
        <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between text-center sm:text-left gap-4">
          
          {/* Header Tag */}
          <div className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#ebbf01] uppercase tracking-wider bg-[#181820] px-3.5 py-2.5 rounded-2xl border border-white/[0.08] shrink-0 mx-auto sm:mx-0">
            <Layers className="w-4 h-4 text-[#ebbf01]" />
            <span>Wallpapers & Wallpapers Animados</span>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            
            {/* Filter Pill Tabs (Todos | Wallpapers | Wallpaper Animado) */}
            <div className="flex items-center p-1 bg-[#16161D] rounded-xl border border-white/[0.08] text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedType === 'all' ? 'bg-[#ebbf01] text-black shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('image')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedType === 'image' ? 'bg-[#ebbf01] text-black shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Wallpapers</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('video')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedType === 'video' ? 'bg-[#ebbf01] text-black shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Wallpaper Animado</span>
              </button>
            </div>

          </div>
        </div>

        {/* Wallpapers Grid */}
        {filteredWallpapers.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleWallpapers.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActivePreview(item)}
                  className="group relative aspect-video bg-[#111116] border border-white/[0.08] hover:border-[#ebbf01]/60 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[#ebbf01]/10 cursor-pointer"
                >
                  {(() => {
                    const hasAnimatedPreview = isVideoMediaUrl(item.previewUrl) || (item.type === 'video' && !item.previewUrl && isVideoMediaUrl(item.videoUrl));
                    const videoSrc = (item.previewUrl && isVideoMediaUrl(item.previewUrl))
                      ? item.previewUrl
                      : (item.previewUrl || item.videoUrl || item.downloadUrl);

                    if (hasAnimatedPreview) {
                      return (
                        <video
                          src={getMediaPreviewUrl(videoSrc)}
                          poster={item.previewUrl && !item.previewUrl.startsWith('data:video/') && !isVideoMediaUrl(item.previewUrl) ? getMediaPreviewUrl(item.previewUrl) : undefined}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      );
                    }

                    return (
                      <img
                        src={getMediaPreviewUrl(item.previewUrl || item.downloadUrl)}
                        alt={item.title || 'Wallpaper'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          if (item.downloadUrl && item.downloadUrl !== item.previewUrl) {
                            (e.target as HTMLImageElement).src = getMediaPreviewUrl(item.downloadUrl);
                          }
                        }}
                      />
                    );
                  })()}

                  {/* Subtle hover icon overlay indicator */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-3 rounded-full bg-[#ebbf01] text-black shadow-lg shadow-black/50">
                      {item.type === 'video' ? <Play className="w-5 h-5 fill-black" /> : <Maximize2 className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-8 py-3.5 rounded-2xl bg-[#16161D] hover:bg-[#20202B] border border-white/[0.1] hover:border-[#ebbf01]/40 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-[#ebbf01]/10 inline-flex items-center gap-2 cursor-pointer group"
                >
                  <ChevronDown className="w-4 h-4 text-[#ebbf01] group-hover:translate-y-0.5 transition-transform" />
                  <span>Carregar Mais Wallpapers ({filteredWallpapers.length - visibleLimit} restantes)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-12 text-center space-y-4">
            <Image className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum wallpaper encontrado</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Não encontramos arquivos correspondentes ao tipo selecionado.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setSelectedType('all');
              }}
              className="px-4 py-2 bg-[#181820] hover:bg-[#222230] border border-white/[0.08] text-xs font-bold text-white rounded-xl cursor-pointer"
            >
              Ver Todos
            </button>
          </div>
        )}

      </div>

      {/* Fullscreen Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-[#111116] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4">
            
            {/* Modal Header - Close button & type badge only, NO file name */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="px-3 py-1 rounded-lg bg-[#ebbf01]/10 border border-[#ebbf01]/30 text-[#ebbf01] text-xs font-mono font-extrabold uppercase">
                {activePreview.type === 'video' ? 'Wallpaper Animado' : 'Wallpaper'}
              </span>

              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Screen Box */}
            <div className="relative aspect-video max-h-[65vh] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              {(activePreview.type === 'video' || isVideoMediaUrl(activePreview.previewUrl) || isVideoMediaUrl(activePreview.videoUrl) || isVideoMediaUrl(activePreview.downloadUrl)) ? (
                <video
                  src={getMediaPreviewUrl(
                    (activePreview.previewUrl && isVideoMediaUrl(activePreview.previewUrl))
                      ? activePreview.previewUrl
                      : (activePreview.videoUrl || activePreview.previewUrl || activePreview.downloadUrl)
                  )}
                  poster={activePreview.previewUrl && !activePreview.previewUrl.startsWith('data:video/') && !isVideoMediaUrl(activePreview.previewUrl) ? getMediaPreviewUrl(activePreview.previewUrl) : undefined}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={getMediaPreviewUrl(activePreview.downloadUrl || activePreview.previewUrl)}
                  alt=""
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Footer - ONLY DOWNLOAD BUTTON (NO TEXT, NO FILE NAMES) */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleDownload(activePreview)}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs sm:text-sm uppercase font-mono tracking-wider shadow-lg shadow-[#ebbf01]/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>
                  {activePreview.type === 'video' ? 'Baixar Wallpaper Animado' : 'Baixar Wallpaper'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
