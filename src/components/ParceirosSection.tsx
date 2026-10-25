import React, { useState, useEffect } from 'react';
import { 
  Handshake, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Share2, 
  Check 
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { PartnerItem } from '../types';
import { getMediaPreviewUrl } from '../utils/mediaUrl';
import { PartnerBannerModal } from './modals/PartnerBannerModal';

interface ParceirosSectionProps {
  isStandalone?: boolean;
}

export const ParceirosSection: React.FC<ParceirosSectionProps> = ({ isStandalone = false }) => {
  const { partners, activePage, setActivePage } = useSiteData();
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Abertura automática caso a URL contenha um id ou slug de parceiro (ex: /parceiros/ev-garage-custom ou ?p=... ou #...)
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
      }
    }
  }, [activePage, partners]);

  // Filtra parceiros ativos e ordena por `order`
  const activePartners = (partners || [])
    .filter((p) => p.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleOpenPartnerModal = (partner: PartnerItem) => {
    setSelectedPartner(partner);
    try {
      window.history.pushState(null, '', `/parceiros/${encodeURIComponent(partner.slug || partner.id)}`);
    } catch {}
  };

  const handleCloseModal = () => {
    setSelectedPartner(null);
    if (activePage.type === 'parceiros' && activePage.idOrSlug) {
      setActivePage({ type: 'parceiros' });
    }
    try {
      window.history.pushState(null, '', '/parceiros');
    } catch {}
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

  return (
    <section 
      id="parceiros" 
      className={`${isStandalone ? 'pt-0 pb-12 sm:pb-16' : 'py-10 sm:py-16'} bg-[#060608] border-t border-white/[0.06] relative overflow-hidden`}
    >
      {/* Iluminação ambiente sutil na cor da marca (como no IPTV) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[var(--color-brand)]/4 blur-[160px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-10">
        
        {/* Cabeçalho da Página: Estilo idêntico ao card de cabeçalho do IPTV (leve borda e degradê na cor da página) */}
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

        {/* Lista de Parceiros: Grid de 2 Colunas (2 cards lado a lado) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {activePartners.length > 0 ? (
            activePartners.map((partner) => {
              const cardImage = partner.imageUrl || partner.bannerImageUrl || '/imagens/modelos/seal-awd.jpg';

              return (
                <div
                  key={partner.id}
                  onClick={() => handleOpenPartnerModal(partner)}
                  className="group relative bg-gradient-to-b from-[#111116] via-[#0c0c10] to-[#060608] border border-white/[0.08] hover:border-[var(--color-brand)]/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between w-full h-full cursor-pointer"
                >
                  {/* Glow ambiente sutil no canto superior direito igual ao IPTV */}
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--color-brand)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-brand)]/15 transition-all pointer-events-none" />

                  {/* Foto em destaque com proporção 16/10 ideal para 2 colunas */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#16161D]">
                    <img
                      src={getMediaPreviewUrl(cardImage)}
                      alt={partner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      loading="lazy"
                    />
                    {/* Degradê suave que se funde diretamente ao corpo do card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-transparent to-black/30 pointer-events-none" />
                  </div>

                  {/* Dizeres abaixo da foto com flex-1 e justify-between para cards alinhados */}
                  <div className="p-6 sm:p-7 space-y-4 relative z-10 flex flex-col flex-1 justify-between">
                    {/* Badge e Título */}
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

                    {/* Breve resumo com limitador para manter altura uniforme */}
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-3">
                      {partner.shortDescription}
                    </p>

                    {/* Linha de Ações: Compartilhar e Saiba Mais alinhados no fundo */}
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
                          handleOpenPartnerModal(partner);
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-black font-extrabold text-xs uppercase tracking-wider font-mono transition-all duration-300 shadow-md shadow-[var(--color-brand)]/20 hover:shadow-[var(--color-brand)]/30 cursor-pointer active:scale-95"
                      >
                        <span>Saiba Mais</span>
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

      {/* Modal / Banner de Informações da Parceria */}
      <PartnerBannerModal
        partner={selectedPartner}
        isOpen={Boolean(selectedPartner)}
        onClose={handleCloseModal}
      />
    </section>
  );
};
