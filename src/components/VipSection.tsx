import React, { useState } from 'react';
import { Crown, Check, Lock, Sparkles, Download, Play, BookOpen, LogIn, LogOut, ArrowRight, ShieldCheck, UserCheck, Zap, Key, Smartphone, Layers, Youtube, Mail, Send, X, MessageSquare, User, Megaphone, Eye, ExternalLink, FileText } from 'lucide-react';
import { vipBenefits, demoVipUser } from '../data/vip';
import { VipContentItem } from '../types';
import { useSiteData } from '../context/SiteDataContext';
import { SocialIcon } from './common/SocialIcon';
import { getPageThemeHex } from '../utils/pageColors';
import { VipPlansSection } from './vip/VipPlansSection';
import { getMediaPreviewUrl } from '../utils/mediaUrl';
import { isItemVisibleInVipSection } from '../utils/visibility';

function parseDateToTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const s = String(dateStr).trim();
  
  const parsed = Date.parse(s);
  if (!isNaN(parsed)) return parsed;

  const ptMonths: Record<string, number> = {
    janeiro: 0, jan: 0,
    fevereiro: 1, fev: 1,
    março: 2, marco: 2, mar: 2,
    abril: 3, abr: 3,
    maio: 4, mai: 4,
    junho: 5, jun: 5,
    julho: 6, jul: 6,
    agosto: 7, ago: 7,
    setembro: 8, set: 8,
    outubro: 9, out: 9,
    novembro: 10, nov: 10,
    dezembro: 11, dez: 11,
  };

  const brMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    return new Date(parseInt(brMatch[3], 10), parseInt(brMatch[2], 10) - 1, parseInt(brMatch[1], 10)).getTime();
  }

  const textMatch = s.toLowerCase().match(/(\d{1,2})\s+de\s+([a-zçã]+)(?:\s+de|\s*,)?\s+(\d{4})/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const month = ptMonths[textMatch[2]] ?? 0;
    const year = parseInt(textMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10)).getTime();
  }

  const yearMatch = s.match(/\b(20\d\d)\b/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1], 10), 0, 1).getTime();
  }

  return 0;
}

function formatExpiryDate(dateStr?: string): string {
  if (!dateStr) return 'Ativo';
  const clean = String(dateStr).trim();
  if (clean.toLowerCase().includes('vitalício') || clean.toLowerCase().includes('vitalicio')) {
    return 'Vitalício';
  }
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return clean;
}

interface VipSectionProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
  onOpenAuthModal: () => void;
  isStandalone?: boolean;
}

export const VipSection: React.FC<VipSectionProps> = ({
  isLoggedIn,
  onLogout,
  onOpenAuthModal,
  isStandalone = false,
}) => {
  const { brand, addContactMessage, currentVipMember, logoutVip, apps = [], tutorials = [], news = [], videos = [], wallpapers = [], setActivePage, openDownloadGateway } = useSiteData();
  const [activeTab, setActiveTab] = useState<'all' | 'app' | 'video' | 'tutorial' | 'news' | 'wallpaper'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Cor exata configurada no Painel Administrativo para a Área VIP
  const vipThemeHex = getPageThemeHex('vip', brand?.pageColors);

  // Modal para formulário de contato / pedido de adesão
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryTarget = (brand.links?.email && brand.links.email !== 'contato@alxtech.com.br')
    ? brand.links.email
    : 'contact@7f.com.br';

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) return;

    setIsSubmitting(true);

    const fullSubject = `[${brand.brandName || 'Alx +'}] Pedido de Adesão VIP - ${contactName}`;
    const fullBody = `Nome: ${contactName}\nE-mail: ${contactEmail}\nWhatsApp: ${contactPhone}\n\nMensagem / Solicitação:\n${contactMessage}`;

    // 1. Salva na Caixa de Entrada / Painel Administrativo do site
    try {
      addContactMessage({
        name: contactName,
        email: contactEmail,
        subject: fullSubject,
        message: fullBody,
      });
    } catch (err) {
      console.warn('Erro ao salvar no inbox:', err);
    }

    // 2. Disparo Multi-Gateway de Alta Velocidade (Webhook, Web3Forms e FormSubmit) - Idêntico à página de contato
    try {
      const web3Key = brand.links?.web3formsKey?.trim();
      const webhookUrl = brand.links?.customWebhookUrl?.trim();
      let sentSuccessfully = false;

      // Gateway A: Webhook Instantâneo (Zapier / Make / Telegram / Discord)
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `📬 **Novo Pedido de Adesão VIP**\n**Nome:** ${contactName}\n**E-mail:** ${contactEmail}\n**WhatsApp:** ${contactPhone}\n**Mensagem:** ${contactMessage}`,
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            subject: fullSubject,
            message: fullBody,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => null);
      }

      // Gateway B: Web3Forms (Ultra Rápido)
      if (web3Key) {
        try {
          const w3Res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              access_key: web3Key,
              name: contactName,
              email: contactEmail,
              replyto: contactEmail,
              subject: fullSubject,
              message: fullBody,
              from_name: `${brand.brandName || 'Alx +'} Website`,
            }),
          });
          const w3Data = await w3Res.json().catch(() => null);
          if (w3Data?.success || w3Res.ok) {
            sentSuccessfully = true;
          }
        } catch (e) {
          console.warn('Web3Forms dispatch error:', e);
        }
      }

      // Gateway C: FormSubmit (Fallback / Padrão)
      if (!sentSuccessfully) {
        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(primaryTarget)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            Nome: contactName,
            Email: contactEmail,
            WhatsApp: contactPhone,
            Mensagem: contactMessage,
            _replyto: contactEmail,
            _subject: fullSubject,
            _template: 'box',
            _captcha: 'false',
          }),
        });

        const data = await res.json().catch(() => null);
        if (data?.success === 'true' || data?.success === true || res.ok) {
          sentSuccessfully = true;
        }
      }
    } catch (err) {
      console.warn('Erro ao disparar gateways de e-mail:', err);
    } finally {
      setIsSubmitting(false);
      setContactSubmitted(true);
    }
  };

  // Mapeia dinamicamente aplicativos, tutoriais e vídeos do Painel ADM marcados como VIP
  const dynamicVipApps: (VipContentItem & { rawItem?: any; rawDate?: number })[] = (apps || [])
    .filter(isItemVisibleInVipSection)
    .map((a) => ({
      id: `dyn-app-${a.id}`,
      title: a.name || a.title,
      type: 'app' as const,
      category: a.category || 'Aplicativo VIP',
      description: a.fullDescription || a.description || a.summary || 'Aplicativo exclusivo para membros da Área VIP.',
      imageUrl: getMediaPreviewUrl(a.coverImage || (a as any).iconUrl || '/imagens/apps/byd-cockpit.jpg'),
      downloadSize: (a as any).fileSize || 'APK',
      downloadUrl: a.downloadUrl || '#',
      releaseDate: (a as any).releaseDate || a.updatedAt || '2026',
      isNew: Boolean(a.isNew || a.isUpdated || a.badge?.toLowerCase().includes('novo') || a.badge?.toLowerCase().includes('beta')),
      version: a.version,
      rawItem: a,
      rawDate: parseDateToTimestamp(a.updatedAt || (a as any).releaseDate || (a as any).createdAt),
    }));

  const dynamicVipTutorials: (VipContentItem & { rawItem?: any; rawDate?: number })[] = (tutorials || [])
    .filter(isItemVisibleInVipSection)
    .map((t) => ({
      id: `dyn-tut-${t.id}`,
      title: t.title,
      type: 'tutorial' as const,
      category: t.category || 'Guia Passo a Passo',
      description: t.summary || 'Guia e manual técnico exclusivo para membros.',
      imageUrl: getMediaPreviewUrl(t.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop'),
      downloadUrl: `/tutoriais/${t.slug || t.id}`,
      releaseDate: t.date || '2026',
      isNew: Boolean(t.badge?.toLowerCase().includes('novo')),
      rawItem: t,
      rawDate: parseDateToTimestamp(t.date || (t as any).createdAt),
    }));

  const dynamicVipVideos: (VipContentItem & { rawItem?: any; rawDate?: number })[] = (videos || [])
    .filter((v) => (v as any).isMembersOnly || (v as any).isVipExclusive)
    .map((v) => ({
      id: `dyn-vid-${v.id}`,
      title: v.title,
      type: 'video' as const,
      category: 'Vídeo Exclusivo',
      description: v.summary || v.description || 'Aula e vídeo exclusivo para membros.',
      imageUrl: getMediaPreviewUrl(v.thumbnailUrl || (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop')),
      videoUrl: v.youtubeUrl || v.videoUrl || (v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : '#'),
      releaseDate: v.date || '2026',
      isNew: false,
      rawItem: v,
      rawDate: parseDateToTimestamp(v.date),
    }));

  const dynamicVipWallpapers: (VipContentItem & { rawItem?: any; rawDate?: number })[] = (wallpapers || [])
    .filter((w) => w.isMembersOnly || (w as any).isVipExclusive)
    .map((w) => ({
      id: `dyn-wp-${w.id}`,
      title: w.title,
      type: 'wallpaper' as const,
      category: w.category || 'Wallpaper VIP',
      description: w.description || 'Wallpaper exclusivo para membros da Área VIP.',
      imageUrl: getMediaPreviewUrl(w.previewUrl || (w.videoUrl ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop' : '')),
      downloadSize: w.resolution || '4K Ultra HD',
      downloadUrl: w.downloadUrl || w.previewUrl,
      releaseDate: w.date || '2026',
      isNew: Boolean(w.badge?.toLowerCase().includes('novo')),
      rawItem: w,
      rawDate: parseDateToTimestamp(w.date),
    }));

  const dynamicVipNews: (VipContentItem & { rawItem?: any; rawDate?: number })[] = (news || [])
    .filter((n) => n.isMembersOnly || n.isVipExclusive || (n as any).category === 'VIP')
    .map((n) => ({
      id: `dyn-news-${n.id}`,
      title: n.title,
      type: 'news' as const,
      category: n.category || 'Artigo VIP',
      description: n.summary || 'Artigo técnico e análise exclusiva para membros.',
      imageUrl: getMediaPreviewUrl(n.imageUrl || '/imagens/noticias/noticia-1.jpg'),
      downloadUrl: `/noticias/${n.slug || n.id}`,
      releaseDate: n.date || '2026',
      isNew: false,
      rawItem: n,
      rawDate: parseDateToTimestamp(n.date),
    }));

  const allVipItems: (VipContentItem & { rawItem?: any; rawDate?: number })[] = [
    ...dynamicVipApps,
    ...dynamicVipTutorials,
    ...dynamicVipNews,
    ...dynamicVipVideos,
    ...dynamicVipWallpapers,
  ].sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));

  // Link do grupo VIP do WhatsApp com fallback inteligente
  const defaultWa = brand.links?.whatsapp || 'https://wa.me/5551999999999';
  const whatsappGroupLink = brand.vipWhatsappGroupUrl?.trim()
    ? brand.vipWhatsappGroupUrl.trim()
    : (defaultWa.includes('chat.whatsapp.com')
        ? defaultWa
        : `${defaultWa.includes('?') ? defaultWa : defaultWa + '?'}text=${encodeURIComponent('Olá! Sou membro VIP e gostaria de acessar o Grupo VIP no WhatsApp.')}`);

  const filteredItems = activeTab === 'all'
    ? allVipItems
    : allVipItems.filter(item => item.type === activeTab);

  const handleActionClick = (item: VipContentItem & { rawItem?: any }) => {
    if (!isLoggedIn) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    if (item.type === 'wallpaper' || item.category?.toLowerCase().includes('wallpaper')) {
      if (item.rawItem) {
        setActivePage({ type: 'wallpaper', idOrSlug: item.rawItem.slug || item.rawItem.id });
      } else {
        setActivePage({ type: 'wallpapers' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (item.type === 'news') {
      if (item.rawItem) {
        setActivePage({ type: 'news', idOrSlug: item.rawItem.slug || item.rawItem.id });
      } else {
        setActivePage({ type: 'noticias' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (item.type === 'tutorial') {
      if (item.rawItem) {
        setActivePage({ type: 'tutorial', idOrSlug: item.rawItem.slug || item.rawItem.id });
      } else {
        setActivePage({ type: 'tutoriais' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (item.type === 'app') {
      if (item.rawItem) {
        setActivePage({ type: 'app', idOrSlug: item.rawItem.slug || item.rawItem.id });
      } else {
        setActivePage({ type: 'apps' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (item.type === 'video' && item.videoUrl && item.videoUrl !== '#') {
      window.open(item.videoUrl, '_blank');
      return;
    }

    if (item.rawItem && openDownloadGateway) {
      openDownloadGateway(item.rawItem);
      return;
    }

    setDownloadSuccessMsg(`Iniciando recurso "${item.title}"...`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  const renderBenefitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 stroke-[2.5]" />;
      case 'Download':
        return <Download className="w-5 h-5 stroke-[2.5]" />;
      case 'Zap':
        return <Zap className="w-5 h-5 stroke-[2.5]" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 stroke-[2.5]" />;
      case 'Layers':
        return <Layers className="w-5 h-5 stroke-[2.5]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 stroke-[2.5]" />;
      default:
        return <Sparkles className="w-5 h-5 stroke-[2.5]" />;
    }
  };

  return (
    <section id="vip" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative overflow-hidden`}>
      {/* High-Tech Ambient Light */}
      <div 
        style={{ backgroundColor: `${vipThemeHex}15` }}
        className="absolute top-1/4 right-1/4 w-[600px] h-[350px] blur-[150px] pointer-events-none rounded-full" 
      />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[75%] lg:max-w-[75vw] mx-auto px-2 sm:px-4 relative z-10 space-y-12">
        
        {/* Controls Bar (Apenas exibido para visitantes não autenticados) */}
        {!isLoggedIn && (
          <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
            
            {/* Header Tag com Título Área Exclusiva VIP */}
            <div 
              style={{ color: vipThemeHex }}
              className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#181820] px-3.5 py-2.5 rounded-2xl border border-white/[0.08] shrink-0 mx-auto sm:mx-0 shadow-xs"
            >
              <Crown className="w-4 h-4" style={{ fill: vipThemeHex, color: vipThemeHex }} />
              <span>Área Exclusiva VIP</span>
            </div>

            {/* Mode Switcher / Auth State Button */}
            <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenAuthModal}
                style={{
                  backgroundColor: vipThemeHex,
                  borderColor: vipThemeHex,
                  color: '#000000',
                  boxShadow: `0 4px 14px ${vipThemeHex}30`,
                }}
                className="px-5 py-2.5 rounded-xl border text-xs font-mono font-extrabold uppercase tracking-wider transition-all flex items-center justify-between gap-2.5 hover:brightness-110 active:scale-95 cursor-pointer shadow-md"
                title="Entrar na Área VIP"
              >
                <span>ENTRAR</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= GUEST VIEW ================= */}
        {!isLoggedIn ? (
          <div className="space-y-12">
            
            {/* Card de Largura Total no TOPO: Alx+ VIP */}
            <div 
              style={{ borderColor: `${vipThemeHex}40` }}
              className="bg-[#111116] border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-center sm:text-left"
            >
              {/* Laser Accent Bar - Borda de Cima dinâmica com a cor do Painel ADM */}
              <div 
                style={{ background: `linear-gradient(to right, transparent, ${vipThemeHex}, transparent)` }}
                className="absolute top-0 left-0 right-0 h-1 opacity-90" 
              />

              {/* Title & Subtitle */}
              <div className="space-y-2.5 text-center sm:text-left flex flex-col items-center sm:items-start">
                <div 
                  style={{ color: vipThemeHex, borderColor: `${vipThemeHex}40`, backgroundColor: `${vipThemeHex}15` }}
                  className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl border text-xs font-mono font-bold uppercase"
                >
                  <Crown className="w-3.5 h-3.5" style={{ fill: vipThemeHex, color: vipThemeHex }} />
                  <span>Alx⁺ VIP</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans max-w-4xl text-center sm:text-left">
                  Entre para o Alx⁺ VIP, apoie nosso trabalho e faça parte dessa evolução. Toda adesão é realizada sob a modalidade de <strong>doação voluntária</strong> para custeio de servidores e pesquisas técnicas da plataforma independente, sem configuração de prestação de serviços nem vínculo de associado.
                </p>
              </div>

              {/* 3 Columns Inside Full-width Card: 1º WhatsApp (Verde), 2º Assinante VIP (Branco/Dourado), 3º YouTube (Vermelho) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">

                {/* 1º Card: Apoiadores no WhatsApp (Textos e Botão de Contato WhatsApp) */}
                <div className="bg-gradient-to-br from-[#122e1e]/60 via-[#0a1c12]/80 to-[#060e09] border border-[#25D366]/30 hover:border-[#25D366]/70 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:-translate-y-1 shadow-lg relative overflow-hidden items-center sm:items-start text-center sm:text-left">
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#25D366]/10 blur-2xl rounded-full pointer-events-none" />
                  <div className="space-y-3 relative z-10 flex flex-col items-center sm:items-start w-full">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 flex items-center justify-center font-bold shadow-sm">
                      <SocialIcon platform="whatsapp" className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-[#25D366] font-heading">
                        Apoiadores no WhatsApp
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-200/90 leading-relaxed font-sans space-y-1">
                      <span>Nossa jornada só foi possible graças aos amigos que acreditaram e estiveram ao nosso lado.</span><br />
                      <span>A cada doação, ajuda ou incentivo no WhatsApp, vocês fazem parte e têm um lugar especial na nossa história!</span>
                    </p>
                  </div>
                  <div className="pt-5 relative z-10 w-full">
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#25D366]/25 cursor-pointer active:scale-98"
                    >
                      <SocialIcon platform="whatsapp" className="w-4 h-4 text-white" />
                      <span>FALAR NO WHATSAPP</span>
                    </button>
                  </div>
                </div>

                {/* 2º Card: Assinando a Área VIP (Textos e Botão em Branco/Dourado) */}
                <div className="bg-gradient-to-br from-white/20 via-neutral-200/10 to-neutral-900/80 border border-white/30 hover:border-white/70 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:-translate-y-1 shadow-lg relative overflow-hidden backdrop-blur-sm items-center sm:items-start text-center sm:text-left">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 blur-xl rounded-full pointer-events-none" />

                  <div className="space-y-3 relative z-10 flex flex-col items-center sm:items-start w-full">
                    <div className="w-10 h-10 rounded-xl bg-white/20 text-white border border-white/40 flex items-center justify-center font-bold shadow-sm">
                      <Crown className="w-5 h-5 fill-white text-white" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white font-heading">
                        Assinando a Área VIP
                      </h4>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      Assinatura direta no portal com liberação imediata para baixar todos os APKs, firmwares e tutoriais exclusivos sem limites.
                    </p>
                  </div>
                  <div className="pt-5 relative z-10 w-full">
                    <button
                      onClick={() => {
                        const el = document.getElementById('planos-vip');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          onOpenAuthModal();
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-neutral-100 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-white/25 cursor-pointer"
                    >
                      <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>ASSINAR ÁREA VIP</span>
                    </button>
                  </div>
                </div>

                {/* 3º Card: YouTube (Textos e Botão em Vermelho YouTube) */}
                <div className="bg-gradient-to-br from-[#330f13]/60 via-[#1f090b]/80 to-[#0d0405] border border-red-500/30 hover:border-red-500/70 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:-translate-y-1 shadow-lg relative overflow-hidden items-center sm:items-start text-center sm:text-left">
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-red-600/10 blur-2xl rounded-full pointer-events-none" />
                  <div className="space-y-3 relative z-10 flex flex-col items-center sm:items-start w-full">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center font-bold shadow-sm">
                      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                          fill="#FF0000"
                        />
                        <path
                          d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-red-400 font-heading">
                        Apoiador Exclusivo no YouTube
                      </h4>
                    </div>
                    <p className="text-xs text-red-200/90 leading-relaxed font-sans space-y-1">
                      <span className="block font-semibold">Apoiadores exclusivo ou acima, tem acesso VIP ao site.</span>
                      <span className="block">Seja membro oficial do canal ALX Garage no YouTube para ser membro VIP.</span>
                    </p>
                  </div>
                  <div className="pt-5 relative z-10 w-full">
                    <a
                      href={brand.links?.youtube ? `${brand.links.youtube}/join` : 'https://www.youtube.com/@alx-garage/join'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/25 cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                          fill="#FFFFFF"
                        />
                        <path
                          d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                          fill="#DC2626"
                        />
                      </svg>
                      <span>APOIADOR NO YOUTUBE ↗</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Nota Legal & Transparência: Doação Voluntária */}
              <div className="pt-2 pb-1 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFDD00]" />
                  <span>Adesão sob forma de <strong>doação voluntária</strong> (sem vínculo de associado/direitos e sem prestação de serviços). Irregularidades acarretam exclusão imediata sem aviso e sem devolução.</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage({ type: 'termos' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[#FFDD00] hover:underline font-bold cursor-pointer"
                >
                  Consultar Termos de Uso completos →
                </button>
              </div>
            </div>

            {/* SEÇÃO DE ASSINATURA & PLANOS INCORPORADA ABAIXO DAS 3 OPÇÕES DE ALX VIP */}
            <VipPlansSection onOpenLoginModal={onOpenAuthModal} />
          </div>
        ) : (
          /* ================= MEMBER DASHBOARD ================= */
          <div className="space-y-8">
            
            {/* VIP Member Top Bar (Apenas o card contendo o nome, email e data de vencimento da assinatura) */}
            <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl text-center sm:text-left items-center sm:items-start">
              <div className="flex flex-col items-center sm:items-start space-y-1.5 w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap w-full">
                  <h3 className="text-xl sm:text-2xl font-black text-white font-heading text-center sm:text-left">
                    Olá, {currentVipMember?.name || demoVipUser.name}
                  </h3>
                  <span 
                    style={{ backgroundColor: vipThemeHex, color: '#000000' }}
                    className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                  >
                    {currentVipMember?.planType || demoVipUser.tier}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs font-mono text-neutral-400 mt-1 w-full">
                  <span>{currentVipMember?.email || demoVipUser.email}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-neutral-300 font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto">
                    <span className="text-neutral-400">Vencimento da Assinatura:</span>
                    <span className="text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      {formatExpiryDate(currentVipMember?.expirationDate || (currentVipMember as any)?.expiryDate || 'Vitalício')}
                    </span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Membro Ativo
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={onLogout || logoutVip}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#181820] hover:bg-red-500/20 text-neutral-300 hover:text-red-400 text-xs font-semibold border border-white/[0.06] hover:border-red-500/30 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </div>

            {/* Notification alert on download trigger */}
            {downloadSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center sm:justify-start gap-2 animate-in fade-in text-center sm:text-left">
                <Check className="w-4 h-4 shrink-0" />
                <span>{downloadSuccessMsg}</span>
              </div>
            )}

            {/* ================= SEÇÃO SUPERIOR: MURAL DE AVISOS + CONVITE GRUPO WHATSAPP VIP ================= */}
            <div className={`grid grid-cols-1 ${brand.vipNoticeActive !== false ? 'lg:grid-cols-2' : 'max-w-xl'} gap-5 items-stretch`}>
              {/* 1. Mural de Avisos & Comunicados VIP (Design com Leve Tom Vermelho Estilo IPTV) */}
              {brand.vipNoticeActive !== false && (
                <div 
                  className="bg-gradient-to-br from-red-950/40 via-[#161012] to-red-950/20 border border-red-500/40 hover:border-red-500/70 hover:from-red-900/50 hover:to-red-950/40 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300 rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between space-y-4 group backdrop-blur-xl items-center sm:items-start text-center sm:text-left"
                >
                  {/* Laser Top Accent Vermelho Brilhante */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80 group-hover:opacity-100 group-hover:via-red-400 transition-opacity duration-300"
                  />

                  {/* Fundo com brilho e brilho vermelho sutil e constante */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 group-hover:bg-red-600/35 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/15 group-hover:bg-red-600/25 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

                  <div className="space-y-3 relative z-10 flex flex-col items-center sm:items-start w-full">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 border-b border-red-500/20 group-hover:border-red-500/40 pb-3 transition-colors w-full">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5">
                        <div 
                          className="w-10 h-10 rounded-xl border border-red-500/50 bg-red-500/20 group-hover:bg-red-500/30 group-hover:border-red-500/70 flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md transition-all"
                        >
                          <Megaphone className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                        </div>
                        <div className="flex flex-col items-center sm:items-start">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span 
                              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40"
                            >
                              Mural de Avisos
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-white font-heading mt-0.5 drop-shadow-sm text-center sm:text-left">
                            {brand.vipNoticeTitle || 'Mural de Avisos & Comunicados VIP'}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Caixa Interna com Legibilidade Cristalina e Tom Vermelho Suave */}
                    <div className="bg-red-950/30 border border-red-500/25 group-hover:border-red-500/45 rounded-2xl p-4 text-xs sm:text-sm text-neutral-100 group-hover:text-white font-medium leading-relaxed font-sans whitespace-pre-line shadow-inner backdrop-blur-md transition-all duration-300 text-center sm:text-left w-full">
                      {brand.vipNoticeMessage || 'Bem-vindo ao espaço exclusivo de membros! Fique atento às novas atualizações de APKs, firmwares e tutoriais disponibilizados periodicamente nesta área.'}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Card de Convite ao Grupo VIP no WhatsApp (Design com Leve Tom Verde Estilo IPTV) */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-[#101612] to-emerald-950/20 border border-[#25D366]/40 hover:border-[#25D366]/70 hover:from-emerald-900/50 hover:to-emerald-950/40 hover:shadow-2xl hover:shadow-[#25D366]/20 hover:-translate-y-0.5 transition-all duration-300 rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between space-y-4 group backdrop-blur-xl items-center sm:items-start text-center sm:text-left">
                {/* Laser Top Accent Verde WhatsApp */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#25D366] to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Brilho Verde Dinâmico e Constante no Fundo */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#25D366]/20 group-hover:bg-[#25D366]/35 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600/15 group-hover:bg-emerald-600/25 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

                <div className="space-y-3 relative z-10 flex flex-col items-center sm:items-start w-full">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 border-b border-[#25D366]/20 group-hover:border-[#25D366]/40 pb-3 transition-colors w-full">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl border border-[#25D366]/50 bg-[#25D366]/20 group-hover:bg-[#25D366]/30 group-hover:border-[#25D366]/70 flex items-center justify-center shrink-0 transition-all shadow-lg">
                        <SocialIcon platform="whatsapp" className="w-5 h-5 text-[#25D366]" />
                      </div>
                      <div className="flex flex-col items-center sm:items-start">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40">
                            Comunidade VIP
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                            Grupo Ativo
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white font-heading mt-0.5 text-center sm:text-left">
                          {brand.vipWhatsappGroupTitle || 'Grupo Alx⁺ VIP'}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans text-center sm:text-left">
                    {brand.vipWhatsappGroupDesc || 'Faça parte da comunidade exclusiva no WhatsApp! Conecte-se diretamente com outros membros VIP, tire dúvidas e receba avisos em primeira mão.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-mono text-neutral-200">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-[#25D366]/25 text-emerald-300 group-hover:border-[#25D366]/45 transition-colors">
                      ✓ Notificações Instantâneas
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-[#25D366]/25 text-emerald-300 group-hover:border-[#25D366]/45 transition-colors">
                      ✓ Troca de Experiências
                    </span>
                  </div>
                </div>

                {/* Botão de Entrada no Grupo */}
                <div className="pt-2 relative z-10 w-full">
                  <a
                    href={whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#25D366]/25 hover:shadow-[#25D366]/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <SocialIcon platform="whatsapp" className="w-4 h-4 fill-current shrink-0" />
                    <span>Grupo Alx⁺ VIP</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.5] ml-0.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Dashboard Category Tabs - Somente ícones coloridos sem texto e menores em uma única linha */}
            <div className="flex items-center justify-center flex-nowrap gap-3 xs:gap-5 sm:gap-8 py-2 pb-3 border-b border-white/[0.06] w-full max-w-md sm:max-w-none mx-auto px-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {[
                { 
                  id: 'all', 
                  label: 'Todos os Recursos', 
                  icon: Layers, 
                  color: 'text-amber-400',
                  activeColor: 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-110',
                  dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                },
                { 
                  id: 'app', 
                  label: 'Apps Exclusivos', 
                  icon: Smartphone, 
                  color: 'text-cyan-400',
                  activeColor: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] scale-110',
                  dotColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                },
                { 
                  id: 'video', 
                  label: 'Vídeos VIP', 
                  icon: Play, 
                  color: 'text-rose-500',
                  activeColor: 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.9)] scale-110',
                  dotColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                },
                { 
                  id: 'tutorial', 
                  label: 'Tutoriais VIP', 
                  icon: BookOpen, 
                  color: 'text-purple-400',
                  activeColor: 'text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,0.9)] scale-110',
                  dotColor: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]'
                },
                { 
                  id: 'news', 
                  label: 'Artigos VIP', 
                  icon: FileText, 
                  color: 'text-emerald-400',
                  activeColor: 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)] scale-110',
                  dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                },
                { 
                  id: 'wallpaper', 
                  label: 'Wallpapers VIP', 
                  icon: Sparkles, 
                  color: 'text-fuchsia-400',
                  activeColor: 'text-fuchsia-300 drop-shadow-[0_0_12px_rgba(232,121,249,0.9)] scale-110',
                  dotColor: 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.8)]'
                },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setVisibleCount(4);
                    }}
                    title={tab.label}
                    aria-label={tab.label}
                    className="group relative flex items-center justify-center p-2 sm:p-2.5 transition-all cursor-pointer shrink-0 focus:outline-none"
                  >
                    <div className={`transition-all duration-300 ${isActive ? tab.activeColor : `${tab.color} opacity-75 hover:opacity-100 hover:scale-110`}`}>
                      <TabIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                    </div>
                    {isActive && (
                      <span className={`absolute -bottom-1.5 w-4 sm:w-5 h-1 rounded-full transition-all duration-300 ${tab.dotColor}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* VIP Content Cards Grid: Centralizados no mobile, limite inicial de 4 por tela com botão de Carregar Mais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 justify-items-center sm:justify-items-stretch">
              {filteredItems.slice(0, visibleCount).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleActionClick(item)}
                  className="group bg-[#111115] border border-white/[0.08] hover:border-white/25 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-black/70 flex flex-col justify-between cursor-pointer w-full max-w-sm sm:max-w-none"
                >
                  <div>
                    {/* Top Preview Image Container: Foto limpa, NADA escrito na foto */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#16161D]">
                      <img
                        src={getMediaPreviewUrl(item.imageUrl) || (item.type === 'video' ? 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop' : '/imagens/apps/byd-cockpit.jpg')}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/imagens/apps/byd-cockpit.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/20 pointer-events-none" />
                    </div>

                    {/* Card Body Compacto */}
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-white font-heading line-clamp-2 group-hover:text-neutral-100 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action: Botão de Ver somente */}
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(item);
                      }}
                      style={{
                        backgroundColor: vipThemeHex,
                        color: '#000000',
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Ver</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão de Carregar Mais Conteúdos (Carrega +4 itens) */}
            {filteredItems.length > visibleCount && (
              <div className="flex justify-center pt-6 pb-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  style={{
                    borderColor: `${vipThemeHex}60`,
                  }}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#14141a] hover:bg-[#1c1c24] text-white font-extrabold text-xs uppercase tracking-wider border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-[#FFDD00] animate-pulse" />
                  <span>Carregar Mais Conteúdos ({filteredItems.length - visibleCount} restantes)</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Modal de Pedido de Adesão / Entre em Contato */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111116] border border-[#25D366]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 relative shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                setShowContactModal(false);
                setContactSubmitted(false);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 flex items-center justify-center shrink-0">
                <SocialIcon platform="whatsapp" className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Formulário de Apoio VIP</h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Envie seus dados para solicitação de apoio e adesão VIP (contribuição voluntária em forma de doação, sem prestação de serviços continuados nem vínculo de associado).
                </p>
              </div>
            </div>

            {contactSubmitted ? (
              <div className="p-6 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] space-y-4 text-center animate-in zoom-in-95 duration-200">
                <Check className="w-12 h-12 mx-auto text-[#25D366]" />
                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-white font-heading">Pedido Registrado com Sucesso!</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Sua solicitação foi enviada para análise e entraremos em contato em breve.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setContactSubmitted(false);
                    setShowContactModal(false);
                    setContactEmail('');
                    setContactName('');
                    setContactPhone('');
                    setContactMessage('');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer mt-2"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Seu E-mail *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#181820] border border-white/10 focus:border-[#25D366] text-white text-xs outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 rounded-xl bg-[#181820] border border-white/10 focus:border-[#25D366] text-white text-xs outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Seu WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 rounded-xl bg-[#181820] border border-white/10 focus:border-[#25D366] text-white text-xs outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Mensagem / Observação *</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Gostaria de me tornar um apoiador e solicitar minha adesão..."
                    className="w-full px-4 py-3 rounded-xl bg-[#181820] border border-white/10 focus:border-[#25D366] text-white text-xs outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#25D366]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'ENVIANDO...' : 'ENVIAR PEDIDO DE ADESÃO'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
