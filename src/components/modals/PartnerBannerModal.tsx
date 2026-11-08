import React, { useEffect, useState, useMemo } from 'react';
import { 
  X, 
  ExternalLink, 
  Play, 
  Smartphone, 
  Crown, 
  Lock, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Image as ImageIcon,
  Send,
  Share2,
  Check,
  Download,
  Handshake
} from 'lucide-react';
import { PartnerItem, ALXApp } from '../../types';
import { useSiteData } from '../../context/SiteDataContext';
import { getMediaPreviewUrl, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../../utils/mediaUrl';
import { isItemVip } from '../../utils/vip';
import { formatAppDownloads } from '../AppsSection';

interface PartnerBannerModalProps {
  partner: PartnerItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerBannerModal: React.FC<PartnerBannerModalProps> = ({
  partner,
  isOpen,
  onClose,
}) => {
  const { 
    apps: storeApps, 
    setActivePage, 
    openDownloadGateway, 
    isVipLoggedIn, 
    isAdminAuthenticated, 
    openVipModal 
  } = useSiteData();

  const isUserAuthenticated = Boolean(isVipLoggedIn || isAdminAuthenticated);
  const [copiedShare, setCopiedShare] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Fecha o modal ou a imagem ampliada ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (enlargedImage) {
          setEnlargedImage(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, enlargedImage]);

  // Filtra e ORDENA aplicativos vinculados conforme a ordem definida no ADM do parceiro
  const linkedApps = useMemo(() => {
    if (!partner) return [];
    const rawApps = storeApps || [];
    const orderedIds = partner.linkedAppIds || [];

    // 1. Aplicativos explicitamente vinculados na ordem exata de linkedAppIds
    const explicitlyOrdered: ALXApp[] = [];
    orderedIds.forEach((idOrSlug) => {
      const found = rawApps.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
      if (found && !explicitlyOrdered.some((x) => x.id === found.id)) {
        explicitlyOrdered.push(found);
      }
    });

    // 2. Outros apps vinculados por partnerSlug mas que não estavam na lista de IDs
    const bySlugApps = rawApps.filter((a) => {
      const isPartnerLinked = Boolean(a.partnerSlug && (a.partnerSlug === partner.slug || a.partnerSlug === partner.id));
      return isPartnerLinked && !explicitlyOrdered.some((x) => x.id === a.id);
    });

    return [...explicitlyOrdered, ...bySlugApps];
  }, [storeApps, partner?.linkedAppIds, partner?.slug, partner?.id, partner]);

  if (!isOpen || !partner) return null;

  const youtubeEmbedUrl = getYouTubeEmbedUrl(partner.youtubeUrl);

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

  const handleShare = async () => {
    const slug = partner.slug || partner.id;
    const directUrl = `${window.location.origin}/parceiros/${encodeURIComponent(slug)}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${partner.name} • Parceiro Alx⁺`,
          text: partner.shortDescription || partner.tagline || `Conheça ${partner.name}!`,
          url: directUrl,
        });
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
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
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const bannerImage = partner.bannerImageUrl || partner.imageUrl || '/imagens/modelos/seal-awd.jpg';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full md:w-[65vw] md:max-w-[65vw] max-h-[92vh] bg-gradient-to-b from-[#111116] via-[#0b0b0f] to-[#060608] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior com Título, Botão de Compartilhar e Fechar */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-4 border-b border-white/[0.08] bg-[#0c0c10]/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center shrink-0 border border-[var(--color-brand)]/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate font-heading">
                {partner.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botão de Compartilhar Link Direto */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-xs font-mono font-bold text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Copiar link direto para este parceiro"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span className="text-emerald-400 text-[11px]">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[var(--color-brand)] stroke-[2.5]" />
                  <span className="hidden sm:inline text-[11px]">Compartilhar</span>
                </>
              )}
            </button>

            {/* Botão X de Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
              aria-label="Fechar"
              title="Fechar banner da parceria"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Conteúdo rolável interno */}
        <div className="p-5 sm:p-7 md:p-8 overflow-y-auto space-y-6 sm:space-y-8 scrollbar-thin scrollbar-thumb-white/10 relative z-10 bg-transparent">
          
          {/* 1. CABEÇALHO DO BANNER: Card modo UI/UX com leve borda, degradê e glow ambiente */}
          <div className="rounded-3xl overflow-hidden border border-white/[0.08] hover:border-[var(--color-brand)]/30 bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] shadow-xl p-5 sm:p-7 space-y-4 relative transition-colors duration-300 group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl pointer-events-none" />

            {bannerImage && (
              <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] overflow-hidden bg-[#16161D] rounded-2xl border border-white/[0.08]">
                <img
                  src={getMediaPreviewUrl(bannerImage)}
                  alt={partner.name}
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Transição suave em degradê na cor da página */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-transparent to-black/30 pointer-events-none" />
              </div>
            )}

            {/* Dizeres e Títulos posicionados ABAIXO da foto (foto limpa sem nenhum texto por cima) */}
            <div className="space-y-2 pt-1 relative z-10 text-center sm:text-left flex flex-col items-center sm:items-start">
              {partner.badge && (
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--color-brand)] text-black font-mono font-black text-xs uppercase tracking-wider shadow-md">
                    <Sparkles className="w-3.5 h-3.5 fill-black" />
                    <span>{partner.badge}</span>
                  </span>
                </div>
              )}

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-heading tracking-tight leading-tight group-hover:text-[var(--color-brand)] transition-colors">
                {partner.bannerHeaderTitle || partner.name}
              </h2>

              {partner.bannerHeaderSubtitle && (
                <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed max-w-3xl text-center sm:text-left">
                  {partner.bannerHeaderSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* 2. MEIO - INFORMAÇÕES: Card modo UI/UX com texto centralizado no mobile e à esquerda no desktop */}
          {partner.content && (
            <div className="bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-[var(--color-brand)]/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden transition-colors duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-center sm:justify-start gap-2.5 border-b border-white/[0.08] pb-3.5 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center font-bold border border-[var(--color-brand)]/30">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                  Informações
                </h3>
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 space-y-3.5 leading-relaxed relative z-10">
                {partner.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="text-base sm:text-lg font-bold text-[var(--color-brand)] pt-3 font-heading text-center sm:text-left">
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('#### ')) {
                    return (
                      <h5 key={idx} className="text-sm sm:text-base font-bold text-white pt-2 font-heading text-center sm:text-left">
                        {paragraph.replace('#### ', '')}
                      </h5>
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

              {/* FOTOS ADICIONAIS NO MEIO DO TEXTO */}
              {partner.additionalImages && Array.isArray(partner.additionalImages) && partner.additionalImages.length > 0 && (
                <div className="pt-4 space-y-3 relative z-10">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4 text-[var(--color-brand)]" />
                    <span>Fotos Anexas</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {partner.additionalImages.map((imgUrl, imgIdx) => {
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
                            alt={`${partner.name} - Imagem ${imgIdx + 1}`}
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

          {/* 3. ABAIXO - VÍDEOS: Card modo UI/UX com cabeçalho centralizado no mobile */}
          {youtubeEmbedUrl && (
            <div className="bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden transition-colors duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 relative z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold border border-red-500/30">
                    <Play className="w-4 h-4 fill-red-400 text-red-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                    Vídeos
                  </h3>
                </div>

                {partner.youtubeUrl && (
                  <a
                    href={getYouTubeWatchUrl(partner.youtubeUrl)}
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

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-red-500/30 shadow-2xl bg-black relative z-10">
                <iframe
                  src={youtubeEmbedUrl}
                  title={`Vídeo Parceria ${partner.name}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              {partner.youtubeUrl && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono text-neutral-400">
                  <span>Vídeo demonstrativo oficial</span>
                  <a
                    href={getYouTubeWatchUrl(partner.youtubeUrl)}
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

          {/* 4. MAIS ABAIXO - APLICATIVOS VINCULADOS AO PARCEIRO: Cards IDÊNTICOS aos da Página de Apps */}
          {linkedApps.length > 0 && (
            <div className="space-y-6 bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-[var(--color-brand)]/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-center sm:justify-start border-b border-white/[0.08] pb-3.5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center font-bold border border-[var(--color-brand)]/30">
                    <Smartphone className="w-4 h-4 text-[var(--color-brand)]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                    Aplicativos Homologados & Parceria
                  </h3>
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
                        {/* Top Preview Image Container */}
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

                          {/* Member Badge if VIP Exclusive */}
                          {isAppVIP && (
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md bg-[#ebbf01] text-black font-mono uppercase flex items-center gap-1 shadow-md">
                                <Crown className="w-3 h-3 fill-black" />
                                <span>Membros</span>
                              </span>
                            </div>
                          )}

                          {/* Partner Badge if linked to partner */}
                          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md bg-amber-400 text-black font-mono uppercase flex items-center gap-1 shadow-md">
                              <Handshake className="w-3 h-3 text-black" />
                              <span>{app.partnerName || partner.name || 'Parceiro'}</span>
                            </span>
                          </div>

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
                            {app.fullDescription || app.description || app.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action Button - Directs to Download or VIP */}
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

          {/* 5. NO FINAL - BANNER DO ATENDIMENTO / CONTATO EM DEGRADÊ AZUL CIANO (CONFIGURÁVEL NO ADM) */}
          {partner.contactUrl && (
            <div className="group bg-gradient-to-b from-[#061e27] via-[#04151b] to-[#020b0e] border border-cyan-500/35 hover:border-cyan-400/70 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 relative overflow-hidden transition-all duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="max-w-xl mx-auto space-y-2 relative z-10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white font-heading tracking-wide">
                  {partner.contactTitle || 'Atendimento & Contato'}
                </h3>
                <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed font-medium">
                  {partner.contactSubtitle || 'Entre em contato diretamente pelos canais oficiais para agendamentos, orçamentos e informações.'}
                </p>
              </div>

              <div className="pt-2 relative z-10">
                <a
                  href={partner.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm font-mono uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-black cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>{partner.contactButtonText || 'Entrar em Contato'}</span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Lightbox / Modal de Ampliação de Imagem (Capa e Fotos Anexas) */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
          onClick={() => setEnlargedImage(null)}
        >
          <div 
            className="relative max-w-6xl w-full max-h-[94vh] flex flex-col items-center justify-center cursor-default space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra Superior do Lightbox */}
            <div className="w-full flex items-center justify-between text-white px-1">
              <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--color-brand)]" />
                <span>Foto Ampliada • {partner.name}</span>
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

            {/* Imagem Ampliada */}
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
    </div>
  );
};
