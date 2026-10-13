import React, { useState, useEffect } from 'react';
import { AppWindow, CheckCircle2, Download, ShoppingBag, Eye, Search, ChevronDown, Sparkles, ArrowRight, Crown, Lock } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { isItemVip } from '../utils/vip';
import { isItemVisibleOnSite } from '../utils/visibility';
import { ALXApp } from '../types';
import { getMediaPreviewUrl } from '../utils/mediaUrl';

// Helper to format app downloads count (multiplied by 51, e.g. 10 -> 510 downloads)
const formatAppDownloads = (rawCount?: number): string => {
  if (!rawCount || rawCount <= 0) return '0 downloads';
  const val = rawCount * 51;
  if (val >= 1000000) {
    const formatted = (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1);
    return `${formatted}M downloads`;
  }
  if (val >= 1000) {
    const formatted = (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1);
    return `${formatted}k downloads`;
  }
  return `${val} downloads`;
};

interface AppsSectionProps {
  onSelectApp: (app: ALXApp) => void;
  onOpenVipModal: () => void;
  isStandalone?: boolean;
}

export const AppsSection: React.FC<AppsSectionProps> = ({ onSelectApp, onOpenVipModal, isStandalone = false }) => {
  const { apps, setActivePage, openDownloadGateway, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedSort, setSelectedSort] = useState<'recent' | 'downloads' | 'free' | 'vip' | 'paid' | 'all'>('recent');

  const handleTriggerVip = () => {
    if (onOpenVipModal) onOpenVipModal();
    else openVipModal();
  };

  const handleOpenApp = (app: ALXApp) => {
    setActivePage({ type: 'app', idOrSlug: app.slug || app.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [displayLimit, setDisplayLimit] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 3;
    }
    return 12;
  });

  // Reset pagination limit when search or filters change
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    setDisplayLimit(isMobile ? 3 : 12);
  }, [searchTerm, selectedCategory, selectedSort]);

  const publicApps = apps.filter(isItemVisibleOnSite);

  const categories = Array.from(
    new Set(
      publicApps
        .map((a) => a.category)
        .filter((c): c is string => Boolean(c && c.trim().length > 0))
    )
  );

  const filteredApps = publicApps
    .filter((app) => {
      // 1. Search term filter
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        app.name.toLowerCase().includes(search) ||
        app.tagline.toLowerCase().includes(search) ||
        app.description.toLowerCase().includes(search) ||
        (app.category && app.category.toLowerCase().includes(search)) ||
        (app.features && app.features.some((f) => f.toLowerCase().includes(search))) ||
        (app.compatibility && app.compatibility.some((c) => c.toLowerCase().includes(search)));

      // 2. Category filter
      const matchesCategory =
        selectedCategory === 'Todas' ||
        (app.category && app.category.toLowerCase() === selectedCategory.toLowerCase());

      // 3. Classification / type filter
      if (selectedSort === 'free' && (!app.isFree || app.isVipExclusive)) return false;
      if (selectedSort === 'vip' && !isItemVip(app)) return false;
      if (selectedSort === 'paid' && (app.isFree || app.isVipExclusive)) return false;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (selectedSort === 'downloads') {
        return (b.downloadsCount || 0) - (a.downloadsCount || 0);
      }
      if (selectedSort === 'recent') {
        const indexA = apps.findIndex((item) => item.id === a.id);
        const indexB = apps.findIndex((item) => item.id === b.id);
        return indexA - indexB;
      }
      return 0;
    });

  const visibleApps = filteredApps.slice(0, displayLimit);
  const hasMore = visibleApps.length < filteredApps.length;

  const handleDownloadApp = (e: React.MouseEvent, app: ALXApp) => {
    e.stopPropagation();
    const isVIP = isItemVip(app);
    if (isVIP && !isVipLoggedIn && !isAdminAuthenticated) {
      onOpenVipModal();
      return;
    }
    
    openDownloadGateway({
      id: app.id,
      title: app.name,
      category: 'app',
      version: app.version,
      rawDownloadUrl: app.downloadUrl || 'https://drive.google.com',
      applicableCars: app.compatibility?.join(', '),
      slug: app.slug,
      isMembersOnly: isVIP,
      isVipExclusive: isVIP,
    });
  };

  return (
    <section id="aplicativos" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#09090C] border-t border-white/[0.06] relative`}>
      {/* Yellow laser ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ebbf01]/4 blur-[160px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-8">
        
        {/* Controls Bar Card - Estilo OTA: 1. Procura | 2. Categorias | 3. Classificação de Download */}
        <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between text-center lg:text-left gap-4">
          
          {/* Header Tag / Badge com Título */}
          <div className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#ebbf01] uppercase tracking-wider bg-[#181820] px-3.5 py-2.5 rounded-2xl border border-white/[0.08] shrink-0 mx-auto lg:mx-0">
            <AppWindow className="w-4 h-4 text-[#ebbf01]" />
            <span>Aplicativos & APKs</span>
          </div>

          {/* Right Controls em Ordem Direta: Procura ➔ Categorias ➔ Classificação de Download */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto">
            
            {/* 1. Primeiro: Campo de Procura */}
            <div className="relative w-full sm:w-56 h-8.5">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Procurar aplicativo ou APK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8.5 pl-8 pr-3 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none placeholder:text-neutral-500 transition-all font-medium"
              />
            </div>

            {/* 2. Segundo: Seletor de Categorias */}
            <div className="relative w-full sm:w-48 h-8.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-8.5 pl-3 pr-8 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none transition-all cursor-pointer font-medium appearance-none truncate"
              >
                <option value="Todas" className="bg-[#16161D] text-white">Todas as Categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#16161D] text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400">
                <ChevronDown className="w-3.5 h-3.5 text-[#ebbf01]" />
              </div>
            </div>

            {/* 3. Terceiro: Classificação por Download / Tipo */}
            <div className="relative w-full sm:w-52 h-8.5">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="w-full h-8.5 pl-3 pr-8 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none transition-all cursor-pointer font-medium appearance-none truncate"
              >
                <option value="recent" className="bg-[#16161D] text-white">Lançamentos / Mais Recentes</option>
                <option value="downloads" className="bg-[#16161D] text-white">Mais Baixados (Ranking)</option>
                <option value="free" className="bg-[#16161D] text-white">Gratuitos / APK</option>
                <option value="vip" className="bg-[#16161D] text-white">Exclusivos VIP</option>
                <option value="paid" className="bg-[#16161D] text-white">Licença Individual</option>
                <option value="all" className="bg-[#16161D] text-white">Todos os Apps</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400">
                <ChevronDown className="w-3.5 h-3.5 text-[#ebbf01]" />
              </div>
            </div>

          </div>
        </div>

        {/* Apps Cards Grid */}
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#111116] border border-white/[0.08] space-y-3">
            <AppWindow className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 font-mono text-sm">Nenhum aplicativo encontrado com os termos ou filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleApps.map((app) => {
                const isAppVIP = isItemVip(app);
                return (
                  <div
                    key={app.id}
                    onClick={() => handleOpenApp(app)}
                    className="group bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Top Preview Image Container */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#16161D]">
                        <img
                          src={getMediaPreviewUrl(app.coverImage)}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/imagens/apps/byd-cockpit.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/30" />

                        {/* Member Badge if VIP Exclusive */}
                        {isAppVIP && (
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#ebbf01] text-black font-mono uppercase flex items-center gap-1 shadow-md">
                              <Crown className="w-3 h-3 fill-black" />
                              <span>Membros</span>
                            </span>
                          </div>
                        )}

                        {/* Download Count Badge */}
                        {(app.downloadsCount !== undefined && app.downloadsCount !== null) && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-[10px] font-mono text-neutral-300 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                            <span className="text-[#ebbf01] font-bold">
                              {formatAppDownloads(app.downloadsCount)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* App Details */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-xl font-bold text-white font-heading truncate">
                            {app.name}
                          </h3>
                          {/* Bolinha vermelha piscando indicando atualização / novo */}
                          {(app.isUpdated || app.isNew) && (
                            <span className="flex items-center shrink-0" title="Aplicativo Atualizado / Novo">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-xs shadow-red-500/80" />
                            </span>
                          )}
                        </div>

                        {/* Full Description */}
                        <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line line-clamp-4">
                          {app.fullDescription || app.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Button - Directs to App Details Page or VIP Modal */}
                    <div className="p-6 pt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenApp(app);
                        }}
                        className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                      >
                        {isAppVIP && !isUserAuthenticated ? (
                          <span className="flex items-center gap-1.5 text-black whitespace-nowrap truncate font-mono font-black">
                            <Lock className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                            <span className="truncate">ÁREA DE MEMBROS</span>
                          </span>
                        ) : (
                          <span>DOWNLOAD</span>
                        )}
                        <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4 space-y-2">
                <button
                  onClick={() => {
                    const increment = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 12;
                    setDisplayLimit((prev) => prev + increment);
                  }}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#111116] border border-[#ebbf01]/40 hover:border-[#ebbf01] text-[#ebbf01] hover:text-[#f5cc14] font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 text-[#ebbf01] animate-bounce" />
                  <span>Carregar Mais Aplicativos ({filteredApps.length - visibleApps.length} restantes)</span>
                </button>
                <p className="text-[11px] font-mono text-neutral-500">
                  Exibindo {visibleApps.length} de {filteredApps.length} aplicativos
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

