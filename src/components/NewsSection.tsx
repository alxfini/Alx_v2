import React, { useState, useEffect } from 'react';
import { Calendar, Newspaper, RefreshCw, ArrowRight, Search, CheckCircle2, ChevronDown, Crown, Lock } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { isItemVip } from '../utils/vip';
import { NewsArticle } from '../types';
import { getMediaPreviewUrl } from '../utils/mediaUrl';

interface NewsSectionProps {
  onSelectArticle: (article: NewsArticle) => void;
  isStandalone?: boolean;
}

const TARGET_PORTALS = [
  { key: 'InsideEVs', name: 'InsideEVs Brasil' },
  { key: 'Motor1', name: 'Motor1.com Brasil' },
  { key: 'Autoesporte', name: 'Autoesporte' },
  { key: 'Quatro Rodas', name: 'Quatro Rodas' },
  { key: 'Canaltech', name: 'Canaltech' },
  { key: 'Auto+', name: 'Auto+ TV' },
];

// Helper function to parse dates and timestamps reliably into epoch milliseconds
const parseArticleDate = (dateStr?: string): number => {
  if (!dateStr) return 0;
  
  // Try direct timestamp / ISO date parse
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

  // Format: DD/MM/YYYY
  const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    const year = parseInt(slashMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  // Format: "17 de Setembro, 2026" or "17 de Setembro de 2026"
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

export const NewsSection: React.FC<NewsSectionProps> = ({ onSelectArticle, isStandalone = false }) => {
  const { news, setActivePage, isSyncingNews, syncNewsArticles, lastNewsSync, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [visibleCountMobile, setVisibleCountMobile] = useState<number>(4);

  // Auto-sync news articles if empty or if last sync was more than 10 minutes ago
  useEffect(() => {
    const TEN_MINUTES = 600000;
    const isOld = !lastNewsSync || (Date.now() - lastNewsSync > TEN_MINUTES);
    if (!news || news.length === 0 || isOld) {
      syncNewsArticles();
    }
  }, [news, lastNewsSync]);

  // Helper to match article with a specific source
  const matchesSource = (article: NewsArticle, channelKey: string) => {
    const authorLower = (article.author || '').toLowerCase();
    const sourceUrlLower = (article.sourceUrl || '').toLowerCase();
    const idLower = (article.id || '').toLowerCase();
    const tagsStr = (article.tags || []).join(' ').toLowerCase();
    const searchKey = channelKey.toLowerCase().replace('.com', '').replace(' brasil', '').replace(' tv', '').trim();
    
    return authorLower.includes(searchKey) || sourceUrlLower.includes(searchKey) || idLower.includes(searchKey) || tagsStr.includes(searchKey);
  };

  const handleManualSync = async () => {
    setSyncStatusMsg('Conectando aos portais e buscando feeds RSS...');
    const res = await syncNewsArticles();
    if (res.success) {
      setSyncStatusMsg(`Sincronização concluída! ${res.count > 0 ? `${res.count} matérias atualizadas.` : 'Você já tem as últimas matérias.'}`);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } else {
      setSyncStatusMsg(res.error || 'Erro ao atualizar portais.');
      setTimeout(() => setSyncStatusMsg(null), 5000);
    }
  };

  const handleOpenArticle = (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation();
    setActivePage({ type: 'news', idOrSlug: article.slug || article.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute 2 latest articles from EACH portal and sort in descending order of date (most recent first)
  const getDisplayArticles = (): NewsArticle[] => {
    const selectedArticles: NewsArticle[] = [];
    const addedIds = new Set<string>();

    // 1. Pick the 2 most recent articles for each portal
    TARGET_PORTALS.forEach((portal) => {
      const portalMatches = news
        .filter((item) => matchesSource(item, portal.key))
        .sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));

      portalMatches.slice(0, 2).forEach((art) => {
        if (!addedIds.has(art.id)) {
          addedIds.add(art.id);
          selectedArticles.push(art);
        }
      });
    });

    // If there are any other news not matched by the 6 portals, append them
    if (selectedArticles.length === 0) {
      const sortedAll = [...news].sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
      sortedAll.slice(0, 12).forEach((art) => {
        if (!addedIds.has(art.id)) {
          addedIds.add(art.id);
          selectedArticles.push(art);
        }
      });
    }

    // 2. Filter by Search Query if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return news
        .filter((item) =>
          item.title.toLowerCase().includes(q) ||
          (item.summary && item.summary.toLowerCase().includes(q)) ||
          (item.content && item.content.toLowerCase().includes(q)) ||
          (item.author && item.author.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
        )
        .sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
    }

    // Sort all selected articles by most recent date first
    return selectedArticles.sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
  };

  const displayArticles = getDisplayArticles();

  return (
    <section id="noticias" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative`}>
      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-6">
        
        {/* Controls Bar */}
        <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between text-center sm:text-left gap-4">
          
          {/* Header Tag */}
          <div className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#ebbf01] uppercase tracking-wider bg-[#181820] px-3.5 py-2.5 rounded-2xl border border-white/[0.08] shrink-0 mx-auto sm:mx-0">
            <Newspaper className="w-4 h-4 text-[#ebbf01]" />
            <span>Notícias Automotivas</span>
          </div>

          {/* Right Controls (Search + Refresh Button) */}
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-56 h-8.5">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Buscar matérias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8.5 pl-8 pr-3 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none placeholder:text-neutral-500 transition-all"
              />
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualSync}
              disabled={isSyncingNews}
              className="h-8.5 inline-flex items-center justify-center gap-1.5 px-3.5 bg-[#ebbf01] hover:bg-[#f5cc14] text-black text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#ebbf01]/20 shrink-0 disabled:opacity-50 cursor-pointer"
              title="Buscar notícias recentes dos portais automotivos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNews ? 'animate-spin' : ''}`} />
              <span className="whitespace-nowrap">{isSyncingNews ? 'Buscando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatusMsg && (
          <div className="p-3.5 rounded-2xl bg-[#16161E] border border-[#ebbf01]/30 text-white text-xs flex items-center gap-2.5 animate-in fade-in duration-300">
            {isSyncingNews ? (
              <RefreshCw className="w-4 h-4 text-[#ebbf01] animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-medium">{syncStatusMsg}</span>
          </div>
        )}

        {/* Empty State */}
        {displayArticles.length === 0 && (
          <div className="p-12 text-center bg-[#111116] border border-white/[0.08] rounded-3xl space-y-4">
            <Newspaper className="w-10 h-10 text-neutral-500 mx-auto" />
            <h4 className="text-white font-bold text-base">Nenhuma notícia encontrada</h4>
            <p className="text-neutral-400 text-xs max-w-sm mx-auto">
              Clique no botão Atualizar para sincronizar as matérias mais recentes dos portais.
            </p>
            <button
              onClick={handleManualSync}
              className="px-4 py-2 bg-[#ebbf01] text-black font-bold text-xs rounded-xl hover:bg-[#f5cc14] transition-all cursor-pointer"
            >
              Atualizar Portais Agora
            </button>
          </div>
        )}

        {/* Uniform Grid - Responsive: on mobile only first 4 initially visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.map((article, index) => {
            const isArticleVIP = isItemVip(article);
            return (
              <article
                key={article.id}
                onClick={(e) => handleOpenArticle(e, article)}
                className={`group bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-2xl flex-col justify-between cursor-pointer h-full ${
                  index >= visibleCountMobile ? 'hidden md:flex' : 'flex'
                }`}
              >
                {/* Card Thumbnail Image - Clean without overlay text on top */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#16161D]">
                  <img
                    src={getMediaPreviewUrl(article.imageUrl)}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/imagens/noticias/noticia-1.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/20" />

                  {/* Member Badge if VIP Exclusive */}
                  {isArticleVIP && (
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#ebbf01] text-black font-mono uppercase flex items-center gap-1 shadow-md">
                        <Crown className="w-3 h-3 fill-black" />
                        <span>Membros</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body (Uniform height & structure) */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Meta info: Date only (no reading time) */}
                    <div className="flex items-center text-[11px] font-mono text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#ebbf01]" />
                        {article.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug font-heading line-clamp-2 min-h-[3rem]">
                      {article.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 min-h-[3rem]">
                      {article.summary}
                    </p>
                  </div>

                  {/* Footer Button - Styled identical to the App card button */}
                  <div className="pt-2">
                    <div className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase tracking-wider group-hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20">
                      {isArticleVIP && !isUserAuthenticated ? (
                        <span className="flex items-center gap-1.5 text-black whitespace-nowrap truncate">
                          <Lock className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                          <span className="truncate">ÁREA DE MEMBROS</span>
                        </span>
                      ) : (
                        <span>LER MATÉRIA</span>
                      )}
                      <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Load More Button - Mobile Only */}
        {displayArticles.length > visibleCountMobile && (
          <div className="flex justify-center pt-2 md:hidden">
            <button
              onClick={() => setVisibleCountMobile((prev) => prev + 4)}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#16161D] hover:bg-[#1f1f28] border border-white/[0.1] hover:border-[#ebbf01]/50 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              <span>Carregar mais notícias</span>
              <ChevronDown className="w-4 h-4 text-[#ebbf01]" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};



