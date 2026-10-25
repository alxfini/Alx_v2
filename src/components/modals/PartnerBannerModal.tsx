import React, { useEffect, useState } from 'react';
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
  Check
} from 'lucide-react';
import { PartnerItem, ALXApp } from '../../types';
import { useSiteData } from '../../context/SiteDataContext';
import { getMediaPreviewUrl } from '../../utils/mediaUrl';
import { isItemVip } from '../../utils/vip';

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

  // Fecha o modal ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen || !partner) return null;

  // Extrai embed seguro de vídeo do YouTube
  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (trimmed.includes('youtube.com/embed/')) return trimmed;
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}`;
    }
    return null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(partner.youtubeUrl);

  // Filtra aplicativos vinculados
  const linkedApps = (partner.linkedAppIds || [])
    .map((id) => (storeApps || []).find((app) => app.id === id || app.slug === id))
    .filter((app): app is ALXApp => Boolean(app));

  const handleAppClick = (app: ALXApp) => {
    onClose();
    const isVip = isItemVip(app);
    if (isVip && !isUserAuthenticated) {
      openVipModal();
    } else {
      setActivePage({ type: 'app', idOrSlug: app.slug || app.id });
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
        className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-[#111116] via-[#0b0b0f] to-[#060608] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
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
                    <span>Fotos</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {partner.additionalImages.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[var(--color-brand)]/40 aspect-video bg-[#16161D] relative group transition-colors">
                        <img
                          src={getMediaPreviewUrl(imgUrl)}
                          alt={`${partner.name} - Imagem ${imgIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. ABAIXO - VÍDEOS: Card modo UI/UX com cabeçalho centralizado no mobile */}
          {youtubeEmbedUrl && (
            <div className="bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden transition-colors duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-center sm:justify-start gap-2.5 border-b border-white/[0.08] pb-3.5 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold border border-red-500/30">
                  <Play className="w-4 h-4 fill-red-400 text-red-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                  Vídeos
                </h3>
              </div>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-red-500/30 shadow-2xl bg-black relative z-10">
                <iframe
                  src={youtubeEmbedUrl}
                  title={`Vídeo Parceria ${partner.name}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; webshare"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* 4. MAIS ABAIXO - APLICATIVOS: Card modo UI/UX com cabeçalho centralizado no mobile */}
          {linkedApps.length > 0 && (
            <div className="space-y-5 bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-[var(--color-brand)]/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-center sm:justify-start border-b border-white/[0.08] pb-3.5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center font-bold border border-[var(--color-brand)]/30">
                    <Smartphone className="w-4 h-4 text-[var(--color-brand)]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                    Aplicativos
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1 relative z-10">
                {linkedApps.map((app) => {
                  const coverImage = app.coverImage || app.iconUrl;
                  const isAppVIP = isItemVip(app);

                  return (
                    <div
                      key={app.id}
                      onClick={() => handleAppClick(app)}
                      className="group bg-gradient-to-b from-[#14141d] to-[#0c0c10] border border-white/[0.08] hover:border-[var(--color-brand)]/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl flex flex-col justify-between cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-white/[0.08] relative">
                            {coverImage ? (
                              <img
                                src={getMediaPreviewUrl(coverImage)}
                                alt={app.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--color-brand)]">
                                <Smartphone className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm sm:text-base font-bold text-white truncate font-heading group-hover:text-[var(--color-brand)] transition-colors">
                                {app.name}
                              </h4>
                              {isAppVIP && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[var(--color-brand)] text-black font-mono uppercase shrink-0 flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5 fill-black" />
                                  <span>VIP</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 font-mono truncate">
                              {app.category || 'Aplicativo Automotivo'} • {app.version || 'v1.0'}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                          {app.description || app.tagline}
                        </p>
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppClick(app);
                          }}
                          className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-black font-mono font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          {isAppVIP && !isUserAuthenticated ? (
                            <span className="flex items-center gap-1.5 text-black">
                              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>ÁREA DE MEMBROS</span>
                            </span>
                          ) : (
                            <span>VER DETALHES & DOWNLOAD</span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
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
    </div>
  );
};
