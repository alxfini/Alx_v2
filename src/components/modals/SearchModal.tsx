import React, { useState, useEffect } from 'react';
import { Search, X, AppWindow, Youtube, FileText, ShoppingBag, ArrowRight, Crown } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { isItemVip } from '../../utils/vip';
import { youtubeVideos } from '../../data/videos';
import { ALXApp, YouTubeVideo, NewsArticle, ProductItem } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (app: ALXApp) => void;
  onSelectVideo: (video: YouTubeVideo) => void;
  onSelectArticle: (article: NewsArticle) => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenVip: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectApp,
  onSelectVideo,
  onSelectArticle,
  onSelectProduct,
  onOpenVip
}) => {
  const { apps, news, products, setActivePage, isVipLoggedIn, isAdminAuthenticated } = useSiteData();
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredApps = query.trim()
    ? apps.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase()))
    : apps.slice(0, 3);

  const filteredVideos = query.trim()
    ? youtubeVideos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()) || v.description.toLowerCase().includes(query.toLowerCase()))
    : youtubeVideos.slice(0, 2);

  const filteredArticles = query.trim()
    ? news.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.summary.toLowerCase().includes(query.toLowerCase()))
    : news.slice(0, 2);

  const filteredProducts = query.trim()
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
    : products.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0F0F13] border border-[#ebbf01]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/[0.08] bg-[#14141A]">
          <Search className="w-5 h-5 text-[#ebbf01] mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Pesquisar aplicativos, vídeos, notícias, OTA, produtos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-neutral-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-neutral-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#1E1E26] text-neutral-400 px-2 py-1 rounded border border-white/[0.06]">
            ESC
          </kbd>
        </div>

        {/* Search Results Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Apps Section */}
          {filteredApps.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#ebbf01] flex items-center gap-1.5 font-mono">
                <AppWindow className="w-3.5 h-3.5" />
                Aplicativos ALX
              </span>
              <div className="grid grid-cols-1 gap-2">
                {filteredApps.map(app => {
                  const isAppVIP = isItemVip(app);
                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        setActivePage({ type: 'app', idOrSlug: app.slug || app.id });
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-[#141419] border border-white/[0.04] hover:border-[#ebbf01]/40 hover:bg-[#1A1A22] flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#ebbf01] text-black font-black flex items-center justify-center text-sm font-heading">
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{app.name}</span>
                            {isAppVIP && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#ebbf01] text-black font-mono">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 line-clamp-1">{app.tagline}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#ebbf01]">{app.priceText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {filteredVideos.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#ebbf01] flex items-center gap-1.5 font-mono">
                <Youtube className="w-3.5 h-3.5" />
                Vídeos & Tutoriais
              </span>
              <div className="grid grid-cols-1 gap-2">
                {filteredVideos.map(video => (
                  <div
                    key={video.id}
                    onClick={() => {
                      onSelectVideo(video);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-[#141419] border border-white/[0.04] hover:border-[#ebbf01]/40 hover:bg-[#1A1A22] flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                        <Youtube className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">{video.title}</div>
                        <div className="text-[11px] text-neutral-400">{video.duration} • {video.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#ebbf01] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News Section */}
          {filteredArticles.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#ebbf01] flex items-center gap-1.5 font-mono">
                <FileText className="w-3.5 h-3.5" />
                Notícias & Artigos
              </span>
              <div className="grid grid-cols-1 gap-2">
                {filteredArticles.map(art => {
                  const isArtVIP = isItemVip(art);
                  return (
                    <div
                      key={art.id}
                      onClick={() => {
                        if (isArtVIP && !isUserAuthenticated) {
                          onOpenVip();
                        } else {
                          setActivePage({ type: 'news', idOrSlug: art.slug || art.id });
                        }
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-[#141419] border border-white/[0.04] hover:border-[#ebbf01]/40 hover:bg-[#1A1A22] flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1 flex items-center gap-1.5">
                          <span>{art.title}</span>
                          {isArtVIP && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#ebbf01] text-black font-mono">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400">{art.category} • {art.readTime}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#ebbf01] transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products Section */}
          {filteredProducts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#ebbf01] flex items-center gap-1.5 font-mono">
                <ShoppingBag className="w-3.5 h-3.5" />
                Produtos & Acessórios
              </span>
              <div className="grid grid-cols-1 gap-2">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setActivePage({ type: 'product', idOrSlug: prod.slug || prod.id });
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-[#141419] border border-white/[0.04] hover:border-[#ebbf01]/40 hover:bg-[#1A1A22] flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">{prod.name}</div>
                      <div className="text-[11px] text-neutral-400">{prod.category}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#ebbf01]">{prod.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIP Shortcut */}
          <div
            onClick={() => {
              onOpenVip();
              onClose();
            }}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#ebbf01]/15 to-[#ebbf01]/5 border border-[#ebbf01]/30 hover:border-[#ebbf01] flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ebbf01] text-black flex items-center justify-center font-bold">
                <Crown className="w-5 h-5 fill-black" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Desbloquear Painel ALX VIP</div>
                <div className="text-[11px] text-neutral-300">Acesse downloads exclusivos, tutoriais de multimídia e APKs</div>
              </div>
            </div>
            <span className="text-xs font-black text-[#ebbf01] uppercase tracking-wider">Acessar</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] bg-[#0B0B0E] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>ALX AutoTech Ecosystem</span>
          <span>Navegue com precisão</span>
        </div>

      </div>
    </div>
  );
};

