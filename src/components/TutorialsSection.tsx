import React, { useState } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import { isItemVip } from '../utils/vip';
import { getMediaPreviewUrl } from '../utils/mediaUrl';
import { Tutorial } from '../types';
import { BookOpen, Search, ArrowRight, ArrowLeft, Share2, Check, Crown, Lock, ChevronDown } from 'lucide-react';
import { TutorialDocumentView } from './tutorials/TutorialDocumentView';

interface TutorialsSectionProps {
  isStandalone?: boolean;
}

export const TutorialsSection: React.FC<TutorialsSectionProps> = ({ isStandalone = false }) => {
  const { tutorials, setActivePage, activePage, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();
  const isMember = isVipLoggedIn || isAdminAuthenticated;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination: Desktop starts with 6, loads 3 by 3. Mobile starts with 3, loads 2 by 2.
  const [visibleCountDesktop, setVisibleCountDesktop] = useState<number>(6);
  const [visibleCountMobile, setVisibleCountMobile] = useState<number>(3);

  // Reset visible counts on filter/search change
  React.useEffect(() => {
    setVisibleCountDesktop(6);
    setVisibleCountMobile(3);
  }, [searchTerm, selectedCategory]);

  // If page type is 'tutorial' with idOrSlug, find it
  React.useEffect(() => {
    if (activePage.type === 'tutorial' && activePage.idOrSlug) {
      const target = decodeURIComponent(activePage.idOrSlug).toLowerCase();
      const found = tutorials.find(t => 
        t.id === activePage.idOrSlug || 
        t.slug === activePage.idOrSlug ||
        t.id.toLowerCase() === target ||
        (t.slug && t.slug.toLowerCase() === target)
      );
      if (found) {
        setActiveTutorial(found);
      } else if (tutorials.length > 0) {
        setActiveTutorial(tutorials[0]);
      }
    } else if (activePage.type === 'tutoriais') {
      setActiveTutorial(null);
    }
  }, [activePage, tutorials]);

  const categories = ['Todos', ...Array.from(new Set(tutorials.map(t => t.category)))];

  const filteredTutorials = tutorials.filter(t => {
    const matchesCategory = selectedCategory === 'Todos' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.applicableCars && t.applicableCars.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenTutorial = (tutorial: Tutorial) => {
    const isVIP = isItemVip(tutorial);
    if (isVIP && !isMember) {
      if (openVipModal) openVipModal();
      return;
    }
    setActiveTutorial(tutorial);
    setActivePage({ type: 'tutorial', idOrSlug: tutorial.slug || tutorial.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveTutorial(null);
    setActivePage({ type: 'tutoriais' });
  };

  const handleShareCard = (e: React.MouseEvent, tutorial: Tutorial) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
    const directUrl = `${origin}/tutoriais/${tutorial.slug || tutorial.id}`;

    if (navigator.share) {
      navigator.share({
        title: tutorial.title,
        url: directUrl,
      }).catch(() => {});
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      setCopiedId(tutorial.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  if (activeTutorial) {
    return (
      <section id="tutoriais" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] relative`}>
        {/* Green ambient lighting glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#1EFF00]/5 blur-[160px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10">
          <TutorialDocumentView tutorial={activeTutorial} onBack={handleBackToList} />
        </div>
      </section>
    );
  }

  return (
    <section id="tutoriais" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative`}>
      {/* Green laser ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#1EFF00]/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-6">
        
        {/* Controls Bar (Igual ao primeiro de notícias) */}
        <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between text-center sm:text-left gap-4">
          
          {/* Header Tag com Título Tutoriais */}
          <div className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#1EFF00] uppercase tracking-wider bg-[#181820] px-3.5 py-2.5 rounded-2xl border border-white/[0.08] shrink-0 mx-auto sm:mx-0">
            <BookOpen className="w-4 h-4 text-[#1EFF00]" />
            <span>Tutoriais</span>
          </div>

          {/* Right Controls (Busca + Janela com o tipo de tutorial) */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-60 h-8.5">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Buscar tutoriais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8.5 pl-8 pr-3 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#1EFF00] focus:outline-none placeholder:text-neutral-500 transition-all font-medium"
              />
            </div>

            {/* Janela com o tipo de tutorial (Select Dropdown) */}
            <div className="relative w-full sm:w-52 h-8.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-8.5 pl-3 pr-8 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#1EFF00] focus:outline-none transition-all cursor-pointer font-medium appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#16161D] text-white py-1">
                    {cat === 'Todos' ? 'Todos os Tipos' : cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400">
                <ChevronDown className="w-3.5 h-3.5 text-[#1EFF00]" />
              </div>
            </div>

          </div>
        </div>

        {/* Tutorial Cards Grid */}
        {filteredTutorials.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#111116] border border-white/[0.08] space-y-3">
            <BookOpen className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 font-mono text-sm">Nenhum tutorial encontrado com os termos pesquisados.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutorials.map((tut, index) => {
                const isVisibleMobile = index < visibleCountMobile;
                const isVisibleDesktop = index < visibleCountDesktop;

                if (!isVisibleMobile && !isVisibleDesktop) return null;

                const visibilityClass = isVisibleMobile && isVisibleDesktop
                  ? 'flex'
                  : isVisibleMobile
                    ? 'flex md:hidden'
                    : 'hidden md:flex';

                return (
                  <div
                    key={tut.id}
                    onClick={() => handleOpenTutorial(tut)}
                    className={`group bg-[#111115] border border-white/[0.08] hover:border-[#1EFF00]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-2xl ${visibilityClass} flex-col justify-between cursor-pointer h-full`}
                  >
                    <div>
                      {/* Card Thumbnail Container - exact 16/10 aspect ratio matching Apps & News */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#16161D]">
                        <img
                          src={getMediaPreviewUrl(tut.imageUrl) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop'}
                          alt={tut.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/30" />

                        {/* Member Badge if Exclusive */}
                        {(tut.isMembersOnly || tut.isVipExclusive) && (
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#1EFF00] text-black font-mono uppercase flex items-center gap-1 shadow-md">
                              <Crown className="w-3 h-3 fill-black" />
                              <span>Membros</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body Details */}
                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-bold text-white font-heading line-clamp-2">
                          {tut.title}
                        </h3>

                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                          {tut.summary}
                        </p>
                      </div>
                    </div>

                    {/* Card Action Button Footer */}
                    <div className="p-6 pt-0 flex items-center gap-2">
                      <div className="flex-1 inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#1EFF00] text-black border border-[#1EFF00] shadow-md shadow-[#1EFF00]/20 hover:bg-[#1ceb00] text-xs font-mono font-extrabold transition-all whitespace-nowrap overflow-hidden">
                        {(tut.isMembersOnly || tut.isVipExclusive) && !isMember ? (
                          <span className="flex items-center gap-1.5 text-black whitespace-nowrap truncate">
                            <Lock className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                            <span className="truncate">ÁREA DE MEMBROS</span>
                          </span>
                        ) : (
                          <span className="text-black whitespace-nowrap truncate">VER GUIA COMPLETO</span>
                        )}
                        <ArrowRight className="w-4 h-4 stroke-[2.5] text-black shrink-0 ml-1" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleShareCard(e, tut)}
                        className="p-2.5 rounded-xl bg-[#181820] hover:bg-[#22222d] border border-white/[0.08] text-neutral-300 hover:text-[#1EFF00] transition-all cursor-pointer shrink-0"
                        title="Compartilhar link deste tutorial"
                      >
                        {copiedId === tut.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carregar Mais - Versão Mobile (< md): inicial 3, carrega 2 por vez */}
            {filteredTutorials.length > visibleCountMobile && (
              <div className="flex justify-center pt-2 md:hidden">
                <button
                  type="button"
                  onClick={() => setVisibleCountMobile(prev => prev + 2)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#111116] hover:bg-[#181822] border border-white/10 hover:border-[#1EFF00]/50 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer"
                >
                  <span>Carregar mais</span>
                  <ChevronDown className="w-4 h-4 text-[#1EFF00]" />
                </button>
              </div>
            )}

            {/* Carregar Mais - Versão Desktop (>= md): inicial 6, carrega 3 por vez */}
            {filteredTutorials.length > visibleCountDesktop && (
              <div className="hidden md:flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCountDesktop(prev => prev + 3)}
                  className="py-3.5 px-8 rounded-2xl bg-[#111116] hover:bg-[#181822] border border-white/10 hover:border-[#1EFF00]/50 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer"
                >
                  <span>Carregar mais</span>
                  <ChevronDown className="w-4 h-4 text-[#1EFF00]" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

