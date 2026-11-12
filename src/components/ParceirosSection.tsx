import React, { useState, useEffect, useMemo } from 'react';
import { 
  Handshake, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Building2, 
  Share2, 
  Check,
  ExternalLink,
  Play,
  Smartphone,
  Crown,
  Lock,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  Download,
  X
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { PartnerItem, ALXApp } from '../types';
import { getMediaPreviewUrl, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/mediaUrl';
import { isItemVip } from '../utils/vip';
import { formatAppDownloads } from './AppsSection';

interface ParceirosSectionProps {
  isStandalone?: boolean;
}

export const ParceirosSection: React.FC<ParceirosSectionProps> = ({ isStandalone = false }) => {
  const { 
    partners, 
    apps: storeApps,
    activePage, 
    setActivePage,
    openDownloadGateway,
    isVipLoggedIn,
    isAdminAuthenticated,
    openVipModal
  } = useSiteData();

  const isUserAuthenticated = Boolean(isVipLoggedIn || isAdminAuthenticated);
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Sincroniza a página do parceiro caso a URL contenha um id ou slug (ex: /parceiros/ev-garage-custom)
  useEffect(() => {
    let targetSlugOrId: string | null = null;

    if (activePage.type === 'parceiros' && activePage.idOrSlug) {
      targetSlugOrId = decodeURIComponent(activePage.idOrSlug);
    }

    if (!targetSlugOrId && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryVal = searchParams.get('parceiro') || searchParams.get('p') || searchParams.get('id');
      if (queryVal) {
        targetSlugOrId = decodeURIComponent(queryVal);
      }
    }

    if (!targetSlugOrId && typeof window !== 'undefined' && window.location.hash) {
      const hashClean = window.location.hash.replace(/^#\/?/, '');
      const match = hashClean.match(/(?:parceiros?\/|^)([a-zA-Z0-9_-]+)/);
      if (match && match[1] && match[1] !== 'parceiros') {
        targetSlugOrId = decodeURIComponent(match[1]);
      }
    }

    if (targetSlugOrId && partners && partners.length > 0) {
      const targetLower = targetSlugOrId.toLowerCase().trim();
      const found = partners.find(
        (p) => 
          p.id === targetSlugOrId || 
          p.slug === targetSlugOrId || 
          p.id.toLowerCase() === targetLower || 
          (p.slug && p.slug.toLowerCase() === targetLower)
      );
      if (found) {
        setSelectedPartner(found);
      } else {
        setSelectedPartner(null);
      }
    } else if (activePage.type === 'parceiros' && !activePage.idOrSlug) {
      setSelectedPartner(null);
    }
  }, [activePage, partners]);

  // Fecha o lightbox de foto ampliada com ESC
  useEffect(() => {
    if (!enlargedImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEnlargedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enlargedImage]);

  // Filtra e ordena aplicativos vinculados ao parceiro selecionado
  const linkedApps = useMemo(() => {
    if (!selectedPartner) return [];
    const rawApps = storeApps || [];
    const orderedIds = selectedPartner.linkedAppIds || [];

    const explicitlyOrdered: ALXApp[] = [];
    orderedIds.forEach((idOrSlug) => {
      const found = rawApps.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
      if (found && !explicitlyOrdered.some((x) => x.id === found.id)) {
        explicitlyOrdered.push(found);
      }
    });

    const bySlugApps = rawApps.filter((a) => {
      const isPartnerLinked = Boolean(
        a.partnerSlug && (a.partnerSlug === selectedPartner.slug || a.partnerSlug === selectedPartner.id)
      );
      return isPartnerLinked && !explicitlyOrdered.some((x) => x.id === a.id);
    });

    return [...explicitlyOrdered, ...bySlugApps];
  }, [storeApps, selectedPartner]);

  // Filtra parceiros ativos e ordena por `order`
  const activePartners = (partners || [])
    .filter((p) => p.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleOpenPartnerPage = (partner: PartnerItem) => {
    setSelectedPartner(partner);
    setActivePage({ type: 'parceiros', idOrSlug: partner.slug || partner.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPartnersList = () => {
    setSelectedPartner(null);
    setActivePage({ type: 'parceiros' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppClick = (app: ALXApp) => {
    const isVip = isItemVip(app);
    if (isVip && !isUserAuthenticated) {
      openVipModal();
    } else {
      openDownloadGateway({
        id: app.id,
        title: app.name,
        category: 'app',
        version: app.version,
        rawDownloadUrl: app.downloadUrl || 'https://drive.google.com',
        applicableCars: app.compatibility?.join(', '),
        slug: app.slug,
        isMembersOnly: isVip,
        isVipExclusive: isVip,
      });
    }
  };

  const handleShare = async (e: React.MouseEvent, partner: PartnerItem) => {
    e.stopPropagation();
    const slug = partner.slug || partner.id;
    const directUrl = `${window.location.origin}/parceiros/${encodeURIComponent(slug)}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${partner.name} • Parceiro Alx⁺`,
          text: partner.shortDescription || partner.tagline || `Conheça ${partner.name}!`,
          url: directUrl,
        });
        setCopiedId(partner.id);
        setTimeout(() => setCopiedId(null), 2500);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(directUrl);
      } else {
        const input = document.createElement('input');
        input.value = directUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedId(partner.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(partner.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // ================= PÁGINA INTERNA NORMAL DO PARCEIRO SELECIONADO =================
  if (selectedPartner) {
    const bannerImage = selectedPartner.bannerImageUrl || selectedPartner.imageUrl || '/imagens/modelos/seal-awd.jpg';
    const youtubeEmbedUrl = getYouTubeEmbedUrl(selectedPartner.youtubeUrl);

    return (
      <section
        id="parceiros"
        className={`${isStandalone ? 'pt-0 pb-12 sm:pb-16' : 'py-10 sm:py-16'} bg-[#060608] border-t border-white/[0.06] relative overflow-hidden`}
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[var(--color-brand)]/4 blur-[160px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          
          {/* Barra Superior de Navegação da Página (Voltar & Compartilhar) */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleBackToPartnersList}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[var(--color-brand)]/40 text-xs font-mono font-bold text-neutral-200 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--color-brand)]" />
              <span>Voltar para Parceiros</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleShare(e, selectedPartner)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-xs font-mono font-bold text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Copiar link direto para compartilhar esta página"
            >
              {copiedId === selectedPartner.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span className="text-emerald-400">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[var(--color-brand)] stroke-[2.5]" />
                  <span>Compartilhar Página</span>
                </>
              )}
            </button>
          </div>

          {/* 1. CABEÇALHO DO PARCEIRO */}
          <div className="rounded-3xl overflow-hidden border border-white/[0.08] hover:border-[var(--color-brand)]/30 bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] shadow-xl p-5 sm:p-7 space-y-4 relative transition-colors duration-300 group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl pointer-events-none" />

            {bannerImage && (
              <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] overflow-hidden bg-[#16161D] rounded-2xl border border-white/[0.08]">
                <img
                  src={getMediaPreviewUrl(bannerImage)}
                  alt={selectedPartner.name}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-transparent to-black/30 pointer-events-none" />
              </div>
            )}

            <div className="space-y-2 pt-1 relative z-10 text-center sm:text-left flex flex-col items-center sm:items-start">
              {selectedPartner.badge && (
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--color-brand)] text-black font-mono font-black text-xs uppercase tracking-wider shadow-md">
                    <Sparkles className="w-3.5 h-3.5 fill-black" />
                    <span>{selectedPartner.badge}</span>
                  </span>
                </div>
              )}

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-heading tracking-tight leading-tight group-hover:text-[var(--color-brand)] transition-colors">
                {selectedPartner.bannerHeaderTitle || selectedPartner.name}
              </h1>

              {selectedPartner.bannerHeaderSubtitle && (
                <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed max-w-3xl text-center sm:text-left">
                  {selectedPartner.bannerHeaderSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* 2. INFORMAÇÕES E FOTOS ANEXAS */}
          {selectedPartner.content && (
            <div className="bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-[var(--color-brand)]/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden transition-colors duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-center sm:justify-start gap-2.5 border-b border-white/[0.08] pb-3.5 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center font-bold border border-[var(--color-brand)]/30">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)]" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                  Informações
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 space-y-3.5 leading-relaxed relative z-10">
                {selectedPartner.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-base sm:text-lg font-bold text-[var(--color-brand)] pt-3 font-heading text-center sm:text-left">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('#### ')) {
                    return (
                      <h4 key={idx} className="text-sm sm:text-base font-bold text-white pt-2 font-heading text-center sm:text-left">
                        {paragraph.replace('#### ', '')}
                      </h4>
                    );
                  }
                  return (
                    <div 
                      key={idx} 
                      className="bg-[#16161D]/70 border border-white/[0.06] p-4 sm:p-5 rounded-2xl whitespace-pre-line text-neutral-200 shadow-sm text-center sm:text-left"
                    >
                      {paragraph}
                    </div>
                  );
                })}
              </div>

              {/* Fotos Adicionais */}
              {selectedPartner.additionalImages && Array.isArray(selectedPartner.additionalImages) && selectedPartner.additionalImages.length > 0 && (
                <div className="pt-4 space-y-3 relative z-10">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4 text-[var(--color-brand)]" />
                    <span>Fotos Anexas</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedPartner.additionalImages.map((imgUrl, imgIdx) => {
                      const fullUrl = getMediaPreviewUrl(imgUrl);
                      return (
                        <div
                          key={imgIdx}
                          onClick={() => setEnlargedImage(fullUrl)}
                          className="rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[var(--color-brand)]/50 aspect-video bg-[#16161D] relative group/img transition-all duration-300 block cursor-pointer hover:shadow-xl hover:shadow-[var(--color-brand)]/10"
                          title="Clique para ampliar a foto"
                        >
                          <img
                            src={fullUrl}
                            alt={`${selectedPartner.name} - Imagem ${imgIdx + 1}`}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-2.5 right-2.5">
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-xl bg-black/75 hover:bg-black text-white hover:text-[var(--color-brand)] border border-white/15 transition-all shadow-md flex items-center justify-center cursor-pointer"
                              title="Abrir em nova janela"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. VÍDEOS */}
          {youtubeEmbedUrl && (
            <div className="bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden transition-colors duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 relative z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold border border-red-500/30">
                    <Play className="w-4 h-4 fill-red-400 text-red-400" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                    Vídeos
                  </h2>
                </div>

                {selectedPartner.youtubeUrl && (
                  <a
                    href={getYouTubeWatchUrl(selectedPartner.youtubeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-mono font-bold transition-all shadow-sm"
                    title="Assistir diretamente no site/app do YouTube"
                  >
                    <span>Assistir no YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-red-500/30 shadow-2xl bg-black z-10">
                <iframe
                  src={youtubeEmbedUrl}
                  title={`Vídeo Parceria ${selectedPartner.name}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              {selectedPartner.youtubeUrl && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono text-neutral-400">
                  <span>Vídeo demonstrativo oficial</span>
                  <a
                    href={getYouTubeWatchUrl(selectedPartner.youtubeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline font-bold flex items-center gap-1"
                  >
                    <span>Assistir direto no YouTube sem restrições</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 4. APLICATIVOS VINCULADOS AO PARCEIRO */}
          {linkedApps.length > 0 && (
            <div className="space-y-6 bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-[var(--color-brand)]/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-center sm:justify-start border-b border-white/[0.08] pb-3.5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center font-bold border border-[var(--color-brand)]/30">
                    <Smartphone className="w-4 h-4 text-[var(--color-brand)]" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                    Aplicativos Homologados & Parceria
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 relative z-10">
                {linkedApps.map((app) => {
                  const isAppVIP = isItemVip(app);

                  return (
                    <div
                      key={app.id}
                      onClick={() => handleAppClick(app)}
                      className="group bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#16161D]">
                          <img
                            src={getMediaPreviewUrl(app.coverImage || app.iconUrl)}
                            alt={app.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/imagens/apps/byd-cockpit.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/30" />

                          {isAppVIP && (
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#ebbf01] text-black font-mono uppercase flex items-center gap-1 shadow-md">
                                <Crown className="w-3 h-3 fill-black" />
                                <span>Membros</span>
                              </span>
                            </div>
                          )}

                          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md bg-amber-400 text-black font-mono uppercase flex items-center gap-1 shadow-md">
                              <Handshake className="w-3 h-3 text-black" />
                              <span>{app.partnerName || selectedPartner.name || 'Parceiro'}</span>
                            </span>
                          </div>

                          {(app.downloadsCount !== undefined && app.downloadsCount !== null) && (
                            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-[10px] font-mono text-neutral-300 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                              <span className="text-[#ebbf01] font-bold">
                                {formatAppDownloads(app.downloadsCount)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-6 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-xl font-bold text-white font-heading truncate">
                              {app.name}
                            </h3>
                            {(app.isUpdated || app.isNew) && (
                              <span className="flex items-center shrink-0" title="Aplicativo Atualizado / Novo">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-xs shadow-red-500/80" />
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line line-clamp-4">
                            {app.fullDescription || app.description || app.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 pt-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppClick(app);
                          }}
                          className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                        >
                          {isAppVIP && !isUserAuthenticated ? (
                            <span className="flex items-center gap-1.5 text-black whitespace-nowrap truncate font-mono font-black">
                              <Lock className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                              <span className="truncate">ÁREA DE MEMBROS</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-black whitespace-nowrap truncate font-mono font-black">
                              <Download className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                              <span className="truncate">DOWNLOAD</span>
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. ATENDIMENTO & CONTATO */}
          {selectedPartner.contactUrl && (
            <div className="group bg-gradient-to-b from-[#061e27] via-[#04151b] to-[#020b0e] border border-cyan-500/35 hover:border-cyan-400/70 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 relative overflow-hidden transition-all duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="max-w-xl mx-auto space-y-2 relative z-10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white font-heading tracking-wide">
                  {selectedPartner.contactTitle || 'Atendimento & Contato'}
                </h2>
                <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed font-medium">
                  {selectedPartner.contactSubtitle || 'Entre em contato diretamente pelos canais oficiais para agendamentos, orçamentos e informações.'}
                </p>
              </div>

              <div className="pt-2 relative z-10">
                <a
                  href={selectedPartner.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm font-mono uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-black cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>{selectedPartner.contactButtonText || 'Entrar em Contato'}</span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Lightbox de Ampliação de Fotos Anexas */}
        {enlargedImage && (
          <div 
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
            onClick={() => setEnlargedImage(null)}
          >
            <div 
              className="relative max-w-6xl w-full max-h-[94vh] flex flex-col items-center justify-center cursor-default space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between text-white px-1">
                <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--color-brand)]" />
                  <span>Foto Ampliada • {selectedPartner.name}</span>
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={enlargedImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all border border-white/20 cursor-pointer shadow-md"
                    title="Abrir imagem original em nova aba"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                    <span>Abrir em Nova Aba</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setEnlargedImage(null)}
                    className="p-2 text-neutral-400 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
                    title="Fechar ampliação"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative max-h-[84vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-black/90 flex items-center justify-center p-1 sm:p-2">
                <img 
                  src={enlargedImage} 
                  alt="Foto Ampliada" 
                  className="max-w-full max-h-[82vh] object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ================= PÁGINA CATÁLOGO DE PARCEIROS =================
  return (
    <section 
      id="parceiros" 
      className={`${isStandalone ? 'pt-0 pb-12 sm:pb-16' : 'py-10 sm:py-16'} bg-[#060608] border-t border-white/[0.06] relative overflow-hidden`}
    >
      {/* Iluminação ambiente sutil na cor da marca */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[var(--color-brand)]/4 blur-[160px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-10">
        
        {/* Cabeçalho da Página */}
        <div className="bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-[var(--color-brand)]/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden text-center sm:text-left space-y-4 transition-all duration-300">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/30 text-[var(--color-brand)] mx-auto sm:mx-0 shadow-sm">
            <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-brand)] shrink-0" />
            <h1 className="text-sm sm:text-base md:text-lg font-mono font-extrabold uppercase tracking-wider">
              Parceiros Alx⁺
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
            Conheça nossos parceiros credenciados em oficinas especializadas, estética automotiva, películas térmicas e serviços de tecnologia para seu veículo elétrico e multimídia.
          </p>
        </div>

        {/* Lista de Parceiros: Grid de 2 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {activePartners.length > 0 ? (
            activePartners.map((partner) => {
              const cardImage = partner.imageUrl || partner.bannerImageUrl || '/imagens/modelos/seal-awd.jpg';

              return (
                <div
                  key={partner.id}
                  onClick={() => handleOpenPartnerPage(partner)}
                  className="group relative bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-[var(--color-brand)]/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between w-full h-full cursor-pointer"
                >
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-brand)]/15 transition-all pointer-events-none" />

                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#16161D]">
                    <img
                      src={getMediaPreviewUrl(cardImage)}
                      alt={partner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-transparent to-black/30 pointer-events-none" />
                  </div>

                  <div className="p-6 sm:p-7 space-y-4 relative z-10 flex flex-col flex-1 justify-between">
                    <div className="space-y-2">
                      {partner.badge && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--color-brand)] text-black font-mono font-black text-xs uppercase tracking-wider shadow-md">
                            <Sparkles className="w-3.5 h-3.5 fill-black" />
                            <span>{partner.badge}</span>
                          </span>
                        </div>
                      )}

                      <h2 className="text-xl sm:text-2xl font-black text-white font-heading group-hover:text-[var(--color-brand)] transition-colors">
                        {partner.name}
                      </h2>

                      {partner.tagline && (
                        <p className="text-xs sm:text-sm text-[var(--color-brand)] font-mono font-medium leading-relaxed">
                          {partner.tagline}
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-3">
                      {partner.shortDescription}
                    </p>

                    <div className="pt-4 flex items-center justify-end gap-2 sm:gap-3 border-t border-white/[0.08] relative z-10 w-full mt-auto">
                      <button
                        type="button"
                        onClick={(e) => handleShare(e, partner)}
                        className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-sm shrink-0"
                        title="Copiar link direto para compartilhar este parceiro"
                      >
                        {copiedId === partner.id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                            <span className="text-emerald-400 hidden sm:inline">Link Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 text-[var(--color-brand)] stroke-[2.5]" />
                            <span className="hidden sm:inline">Compartilhar</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPartnerPage(partner);
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-black font-extrabold text-xs uppercase tracking-wider font-mono transition-all duration-300 shadow-md shadow-[var(--color-brand)]/20 hover:shadow-[var(--color-brand)]/30 cursor-pointer active:scale-95"
                      >
                        <span>Abrir Página</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center rounded-3xl bg-gradient-to-b from-[#111116] to-[#060608] border border-white/[0.08] text-neutral-400 space-y-3">
              <Building2 className="w-12 h-12 mx-auto text-neutral-600" />
              <p className="text-sm font-medium">Nenhum parceiro cadastrado no momento.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

