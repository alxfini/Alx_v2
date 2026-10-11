import React, { useState, useEffect } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import { isItemVip } from '../utils/vip';
import { getMediaPreviewUrl } from '../utils/mediaUrl';
import { UnlockServiceItem } from '../types';
import { initialUnlockServices } from '../data/unlockServices';
import { KeyRound, Search, ArrowRight, ArrowLeft, Share2, Check, ShieldCheck, ChevronDown, ExternalLink, Play, FileText, Eye } from 'lucide-react';
import { SocialIcon } from './common/SocialIcon';

interface DesbloqueioSectionProps {
  isStandalone?: boolean;
}

export const DesbloqueioSection: React.FC<DesbloqueioSectionProps> = ({ isStandalone = false }) => {
  const { setActivePage, activePage, brand, unlockServices, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeService, setActiveService] = useState<UnlockServiceItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination: Desktop starts with 6, loads 3 by 3. Mobile starts with 3, loads 2 by 2.
  const [visibleCountDesktop, setVisibleCountDesktop] = useState<number>(6);
  const [visibleCountMobile, setVisibleCountMobile] = useState<number>(3);

  // Reset visible counts on filter/search change
  useEffect(() => {
    setVisibleCountDesktop(6);
    setVisibleCountMobile(3);
  }, [searchTerm, selectedCategory]);

  // Handle URL active page matching
  useEffect(() => {
    if (activePage.type === 'servico-desbloqueio' && activePage.idOrSlug) {
      const target = decodeURIComponent(activePage.idOrSlug).toLowerCase();
      const found = (unlockServices || []).find(s => 
        s.id === activePage.idOrSlug || 
        s.slug === activePage.idOrSlug ||
        s.id.toLowerCase() === target ||
        (s.slug && s.slug.toLowerCase() === target)
      );
      if (found) {
        setActiveService(found);
      } else if (unlockServices && unlockServices.length > 0) {
        setActiveService(unlockServices[0]);
      }
    } else if (activePage.type === 'desbloqueio') {
      setActiveService(null);
    }
  }, [activePage, unlockServices]);

  const categories = ['Todos', ...Array.from(new Set((unlockServices || []).map(s => s.category)))];

  const filteredServices = (unlockServices || []).filter(s => {
    const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.applicableCars && s.applicableCars.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenService = (service: UnlockServiceItem) => {
    setActiveService(service);
    setActivePage({ type: 'servico-desbloqueio', idOrSlug: service.slug || service.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareCard = (e: React.MouseEvent, service: UnlockServiceItem) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
    const directUrl = `${origin}/desbloqueio/${service.slug || service.id}`;

    if (navigator.share) {
      navigator.share({
        title: service.title,
        url: directUrl,
      }).catch(() => {});
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      setCopiedId(service.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Detailed View for a Selected Unlock Service
  if (activeService) {
    const directUrl = typeof window !== 'undefined' ? `${window.location.origin}/desbloqueio/${activeService.slug || activeService.id}` : '';

    return (
      <section id="desbloqueio" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] relative`}>
        {/* Ambient lighting glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ebbf01]/4 blur-[160px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-6">
          {/* Document / Service Specification Sheet (70% width matching other pages) */}
          <article className="w-full bg-[#111115] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl relative text-neutral-100 p-6 sm:p-10 lg:p-14 space-y-8">
            
            {/* Header Info */}
            <header className="space-y-4 pb-6 border-b border-white/[0.08]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg bg-[#ebbf01]/10 border border-[#ebbf01]/30 text-[#ebbf01] text-xs font-mono font-bold uppercase">
                  {activeService.category}
                </span>
                {activeService.badge && (
                  <span
                    className="px-3 py-1 rounded-lg text-black text-xs font-mono font-bold uppercase shadow-md"
                    style={{ backgroundColor: activeService.badgeColor || '#10B981' }}
                  >
                    {activeService.badge}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading leading-tight">
                {activeService.title}
              </h1>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-sans">
                {activeService.summary}
              </p>
            </header>

            {/* Main Service Image with Card Effect */}
            {activeService.imageUrl && (
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-[#16161D] border border-white/[0.08] hover:border-[#ebbf01]/40 shadow-2xl group transition-all duration-300">
                <img
                  src={getMediaPreviewUrl(activeService.imageUrl)}
                  alt={activeService.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e13] via-transparent to-black/30 pointer-events-none" />
              </div>
            )}

            {/* Content Details */}
            <div className="space-y-6 pt-2 text-sm text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
              {activeService.content}
            </div>

            {/* Applicable Vehicles Badge */}
            {activeService.applicableCars && (
              <div className="p-4 rounded-2xl bg-[#14141c] border border-white/[0.08] space-y-1">
                <div className="text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider">
                  Veículos Compatíveis:
                </div>
                <div className="text-sm font-bold text-white">
                  {activeService.applicableCars}
                </div>
              </div>
            )}

            {/* Copyright & Security Notice / Warranty */}
            {((activeService.warrantyTitle === undefined && activeService.warrantyText === undefined) ||
              (activeService.warrantyTitle && activeService.warrantyTitle.trim() !== '') ||
              (activeService.warrantyText && activeService.warrantyText.trim() !== '')) && (
              <div className="p-4 rounded-2xl bg-[#14141c] border border-amber-500/20 flex items-start gap-3 text-xs font-mono text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-[#ebbf01] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-white font-bold flex items-center gap-2">
                    <span>{activeService.warrantyTitle !== undefined && activeService.warrantyTitle.trim() !== '' ? activeService.warrantyTitle : 'Garantia & Execução de Serviços'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-[#ebbf01] uppercase font-bold">Oficial</span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    {activeService.warrantyText !== undefined && activeService.warrantyText.trim() !== '' ? activeService.warrantyText : 'Todos os serviços são executados com ferramentas de nível profissional, garantindo integridade dos sistemas originais do veículo.'}
                  </p>
                </div>
              </div>
            )}

            {/* Hire / Contact Banner */}
            <div className="p-6 rounded-2xl bg-[#14141c] border border-[#25D366]/30 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-white font-bold text-base">Gostaria de contratar este serviço?</h4>
                <p className="text-xs text-neutral-400">
                  Fale diretamente via WhatsApp para agendamento presencial ou atendimento remoto.
                </p>
              </div>
              <a
                href="https://alx.short.gy/desbloqueio_alx"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 shrink-0 cursor-pointer"
              >
                <SocialIcon platform="whatsapp" className="w-4 h-4 text-white" />
                <span>Solicitar Orçamento</span>
              </a>
            </div>

          </article>

        </div>
      </section>
    );
  }

  // Grid View for Unlock Services
  return (
    <section id="desbloqueio" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative`}>
      {/* Yellow laser ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ebbf01]/4 blur-[160px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-6">
        
        {/* Controls Bar (Igual ao primeiro de notícias e tutoriais) */}
        <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between text-center sm:text-left gap-4">
          
          {/* Header Tag com Título Desbloqueio */}
          <div className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#ebbf01] uppercase tracking-wider bg-[#181820] px-3.5 py-2.5 rounded-2xl border border-white/[0.08] shrink-0 mx-auto sm:mx-0">
            <KeyRound className="w-4 h-4 text-[#ebbf01]" />
            <span>Desbloqueio</span>
          </div>

          {/* Right Controls (Busca + Janela com o tipo de serviço) */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-60 h-8.5">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Buscar serviços de desbloqueio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8.5 pl-8 pr-3 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none placeholder:text-neutral-500 transition-all font-medium"
              />
            </div>

            {/* Janela com o tipo de serviço (Select Dropdown) */}
            <div className="relative w-full sm:w-52 h-8.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-8.5 pl-3 pr-8 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none transition-all cursor-pointer font-medium appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#16161D] text-white py-1">
                    {cat === 'Todos' ? 'Todos os Serviços' : cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400">
                <ChevronDown className="w-3.5 h-3.5 text-[#ebbf01]" />
              </div>
            </div>

          </div>
        </div>

        {/* Services Cards Grid */}
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#111116] border border-white/[0.08] space-y-3">
            <KeyRound className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 font-mono text-sm">Nenhum serviço de desbloqueio encontrado com os termos pesquisados.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => {
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
                    key={service.id}
                    onClick={() => handleOpenService(service)}
                    className={`group bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-2xl ${visibilityClass} flex-col justify-between cursor-pointer h-full`}
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#16161D]">
                        <img
                          src={getMediaPreviewUrl(service.imageUrl) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop'}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/30" />

                        {/* Badge do Destaque */}
                        {service.badge && (
                          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                            <span
                              className="text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md font-mono uppercase flex items-center gap-1 shadow-md text-black"
                              style={{ backgroundColor: service.badgeColor || '#10B981' }}
                            >
                              <span>{service.badge}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body Details */}
                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-bold text-white font-heading line-clamp-2">
                          {service.title}
                        </h3>

                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                          {service.summary}
                        </p>
                      </div>
                    </div>

                    {/* Card Action Button Footer */}
                    <div className="p-6 pt-0 flex items-center gap-2">
                      <div className="flex-1 inline-flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#ebbf01] bg-[#ebbf01] text-black font-mono font-extrabold text-xs shadow-md shadow-[#ebbf01]/20 transition-all">
                        <span>VER DETALHES</span>
                        <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleShareCard(e, service)}
                        className="p-2.5 rounded-xl bg-[#181820] hover:bg-[#22222d] border border-white/[0.08] text-neutral-300 hover:text-[#ebbf01] transition-all cursor-pointer shrink-0"
                        title="Compartilhar este serviço"
                      >
                        {copiedId === service.id ? (
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
            {filteredServices.length > visibleCountMobile && (
              <div className="flex justify-center pt-2 md:hidden">
                <button
                  type="button"
                  onClick={() => setVisibleCountMobile(prev => prev + 2)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#111116] hover:bg-[#181822] border border-white/10 hover:border-[#ebbf01]/50 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer"
                >
                  <span>Carregar mais</span>
                  <ChevronDown className="w-4 h-4 text-[#ebbf01]" />
                </button>
              </div>
            )}

            {/* Carregar Mais - Versão Desktop (>= md): inicial 6, carrega 3 por vez */}
            {filteredServices.length > visibleCountDesktop && (
              <div className="hidden md:flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCountDesktop(prev => prev + 3)}
                  className="py-3.5 px-8 rounded-2xl bg-[#111116] hover:bg-[#181822] border border-white/10 hover:border-[#ebbf01]/50 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer"
                >
                  <span>Carregar mais</span>
                  <ChevronDown className="w-4 h-4 text-[#ebbf01]" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
