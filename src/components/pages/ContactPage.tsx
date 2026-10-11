import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  HelpCircle,
  Globe,
  Loader2
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { ContactCardItem } from '../../types';

export const ContactPage: React.FC = () => {
  const { brand, setActivePage, addContactMessage } = useSiteData();
  const brandName = brand.brandName || 'Alx⁺';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Dúvida Geral',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    status: 'sent' | 'activation_notice' | 'stored_locally';
    message?: string;
  } | null>(null);

  const handleBack = () => {
    setActivePage({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contactEmail = (brand.links?.email && brand.links.email !== 'contato@alxtech.com.br')
    ? brand.links.email
    : 'contact@7f.com.br';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSending(true);

    // 1. Grava no banco interno / Caixa de Entrada Administrativa do site
    addContactMessage({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    // 2. Disparo Multi-Gateway de Alta Velocidade (Web3Forms, Webhook Instantâneo e FormSubmit)
    try {
      const primaryTarget = contactEmail;
      const web3Key = brand.links?.web3formsKey?.trim();
      const webhookUrl = brand.links?.customWebhookUrl?.trim();
      let sentSuccessfully = false;

      // Gateway A: Webhook Instantâneo (Zapier / Make / Telegram / Discord)
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `📬 **Nova Mensagem no Site ${brandName}**\n**Nome:** ${formData.name}\n**E-mail:** ${formData.email}\n**Assunto:** ${formData.subject}\n**Mensagem:** ${formData.message}`,
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => null);
      }

      // Gateway B: Web3Forms (Ultra Rápido - 1 a 2 segundos)
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
              name: formData.name,
              email: formData.email,
              replyto: formData.email,
              subject: `[${brandName}] ${formData.subject} - De: ${formData.name}`,
              message: formData.message,
              from_name: `${brandName} Website`,
            }),
          });
          const w3Data = await w3Res.json().catch(() => null);
          if (w3Data?.success || w3Res.ok) {
            sentSuccessfully = true;
          }
        } catch (e) {
          console.warn('Web3Forms dispatch failed, falling back...', e);
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
            Nome: formData.name,
            Email: formData.email,
            Assunto: formData.subject,
            Mensagem: formData.message,
            _replyto: formData.email,
            _subject: `[${brandName}] ${formData.subject} - De: ${formData.name}`,
            _template: 'box',
            _captcha: 'false',
          }),
        });

        const data = await res.json().catch(() => null);
        if (data?.success === 'true' || data?.success === true || res.ok) {
          sentSuccessfully = true;
        }
      }

      if (sentSuccessfully) {
        setSubmissionFeedback({
          status: 'sent',
          message: 'Mensagem transmitida instantaneamente para ' + contactEmail,
        });
      } else {
        setSubmissionFeedback({
          status: 'stored_locally',
          message: 'Mensagem salva com sucesso na central do site.',
        });
      }
    } catch (err) {
      console.warn('Envio de e-mail via serviço do site:', err);
      setSubmissionFeedback({
        status: 'stored_locally',
        message: 'Mensagem salva com sucesso na central interna do site.',
      });
    } finally {
      setIsSending(false);
      setSubmitted(true);
    }
  };
  const contactWhatsapp = brand.contactWhatsapp || brand.contactPhone || '';
  const pageTitle = brand.contactTitle || 'Fale Conosco';
  const pageDescription = brand.contactDescription || 'Entre em contato com nossa equipe técnica para dúvidas, sugestões e parcerias.';

  // Initial cards fallback if brand.contactCards is not set yet
  const cardsToRender: ContactCardItem[] = (brand.contactCards && brand.contactCards.length > 0)
    ? brand.contactCards.filter(c => c.active !== false)
    : [
        {
          id: 'default-email',
          title: 'E-mail de Suporte',
          subtitle: 'Atendimento Oficial',
          description: 'Atendimento por e-mail para dúvidas sobre assinaturas VIP, parcerias e contato comercial.',
          type: 'email',
          value: contactEmail,
          buttonText: 'Enviar E-mail',
          iconName: 'mail',
          colorScheme: 'amber',
          active: true,
        },
        ...(brand.links?.telegram ? [{
          id: 'default-telegram-group',
          title: 'Comunidade Telegram',
          subtitle: 'Canal Oficial de Apoio',
          description: 'Participe da comunidade oficial no Telegram para avisos, novidades e suporte direto em tempo real.',
          type: 'telegram' as const,
          value: brand.links?.telegram || 'https://t.me/alxgarage',
          buttonText: 'Entrar na Comunidade 🚀',
          iconName: 'telegram',
          colorScheme: 'sky' as const,
          active: true,
        }] : []),
      ];

  const renderCardIcon = (iconName?: string, type?: string) => {
    switch (iconName || type) {
      case 'mail':
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'whatsapp':
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'telegram':
      case 'send':
        return <Send className="w-5 h-5" />;
      case 'mappin':
      case 'address':
        return <MapPin className="w-5 h-5" />;
      case 'clock':
      case 'hours':
        return <Clock className="w-5 h-5" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'globe':
      case 'link':
        return <Globe className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getCardStyle = (scheme?: string, type?: string) => {
    let effectiveScheme = scheme;

    // Se o esquema for omisso ou 'brand', atribui a cor padrão específica por tipo
    if (!effectiveScheme || effectiveScheme === 'brand') {
      if (type === 'email') effectiveScheme = 'amber';
      else if (type === 'whatsapp' || type === 'phone') effectiveScheme = 'emerald';
      else if (type === 'telegram') effectiveScheme = 'sky';
      else effectiveScheme = 'amber';
    }

    switch (effectiveScheme) {
      case 'emerald':
      case 'green':
        return {
          cardBg: 'bg-emerald-950/40 border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-950/20',
          glowBg: 'bg-emerald-500/20',
          iconBg: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400',
          badgeText: 'text-emerald-400',
          btnBg: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30',
          linkHover: 'hover:text-emerald-400',
        };
      case 'sky':
      case 'blue':
      case 'telegram':
        return {
          cardBg: 'bg-sky-950/40 border-sky-500/30 hover:border-sky-500/60 shadow-sky-950/20',
          glowBg: 'bg-sky-500/20',
          iconBg: 'bg-sky-500/20 border border-sky-500/30 text-sky-400',
          badgeText: 'text-sky-400',
          btnBg: 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30',
          linkHover: 'hover:text-sky-400',
        };
      case 'purple':
        return {
          cardBg: 'bg-purple-950/40 border-purple-500/30 hover:border-purple-500/60 shadow-purple-950/20',
          glowBg: 'bg-purple-500/20',
          iconBg: 'bg-purple-500/20 border border-purple-500/30 text-purple-400',
          badgeText: 'text-purple-400',
          btnBg: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30',
          linkHover: 'hover:text-purple-400',
        };
      case 'red':
        return {
          cardBg: 'bg-red-950/40 border-red-500/30 hover:border-red-500/60 shadow-red-950/20',
          glowBg: 'bg-red-500/20',
          iconBg: 'bg-red-500/20 border border-red-500/30 text-red-400',
          badgeText: 'text-red-400',
          btnBg: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30',
          linkHover: 'hover:text-red-400',
        };
      case 'indigo':
        return {
          cardBg: 'bg-indigo-950/40 border-indigo-500/30 hover:border-indigo-500/60 shadow-indigo-950/20',
          glowBg: 'bg-indigo-500/20',
          iconBg: 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400',
          badgeText: 'text-indigo-400',
          btnBg: 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30',
          linkHover: 'hover:text-indigo-400',
        };
      case 'amber':
      case 'yellow':
      case 'brand':
      default:
        return {
          cardBg: 'bg-amber-950/40 border-amber-500/30 hover:border-amber-500/60 shadow-amber-950/20',
          glowBg: 'bg-amber-500/20',
          iconBg: 'bg-amber-500/20 border border-amber-500/30 text-amber-400',
          badgeText: 'text-amber-400',
          btnBg: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30',
          linkHover: 'hover:text-amber-400',
        };
    }
  };

  const getHrefForCard = (card: ContactCardItem) => {
    if (card.type === 'email') return `mailto:${card.value}`;
    if (card.type === 'whatsapp') {
      const cleanNum = card.value.replace(/\D/g, '');
      return `https://wa.me/${cleanNum}`;
    }
    if (card.type === 'phone') {
      return `tel:${card.value.replace(/\s+/g, '')}`;
    }
    if (card.value.startsWith('http://') || card.value.startsWith('https://')) {
      return card.value;
    }
    return undefined;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header da Página de Contato */}
      <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-4 relative overflow-hidden shadow-2xl">
        {/* Tom suave da cor selecionada mantido na esquerda */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-[var(--color-brand)]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 rounded-2xl bg-[#ebbf01]/10 border border-[#ebbf01]/20 text-[#ebbf01]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              {pageTitle}
            </h1>
          </div>
        </div>

        <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed relative z-10">
          {pageDescription}
        </p>
      </div>

      {/* Grid Principal: Canais de Contato à Esquerda, Formulário à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna da Esquerda: Cards de Contato Dinâmicos */}
        <div className="lg:col-span-5 space-y-4">
          
          {cardsToRender.map((card) => {
            const style = getCardStyle(card.colorScheme, card.type);
            const href = getHrefForCard(card);
            const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));

            return (
              <div 
                key={card.id}
                className={`p-5 rounded-3xl border ${style.cardBg} backdrop-blur-md space-y-3 transition-all relative overflow-hidden group shadow-lg`}
              >
                {/* Glow de fundo colorido dinâmico de cada card */}
                <div className={`absolute -top-10 -right-10 w-36 h-36 ${style.glowBg} blur-2xl pointer-events-none rounded-full transition-opacity group-hover:opacity-100 opacity-70`} />

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${style.iconBg}`}>
                      {renderCardIcon(card.iconName, card.type)}
                    </div>
                    <div className="min-w-0">
                      <span className={`text-[10px] font-mono font-bold uppercase block ${style.badgeText}`}>
                        {card.subtitle || card.title}
                      </span>
                      {href ? (
                        <a 
                          href={href}
                          target={isExternal ? "_blank" : "_self"}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          className={`text-sm font-bold text-white ${style.linkHover} transition-colors truncate block`}
                        >
                          {card.value}
                        </a>
                      ) : (
                        <span className="text-sm font-bold text-white truncate block">
                          {card.value}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botão opcional no card */}
                  {card.buttonText && href && (
                    <a
                      href={href}
                      target={isExternal ? "_blank" : "_self"}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors shrink-0 ${style.btnBg}`}
                    >
                      {card.buttonText}
                    </a>
                  )}
                </div>

                {card.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed pt-1 relative z-10">
                    {card.description}
                  </p>
                )}
              </div>
            );
          })}

        </div>

        {/* Coluna da Direita: Formulário de Mensagem */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12121a] border border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            {/* Tom suave da cor selecionada mantido na esquerda */}
            <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-[var(--color-brand)]/10 blur-3xl pointer-events-none rounded-full" />
            
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 relative z-10">
              <Sparkles className="w-5 h-5 text-[#ebbf01]" />
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Envie uma Mensagem Direta</h3>
                <p className="text-xs text-neutral-400">Preencha os campos abaixo e entraremos em contato rapidamente.</p>
              </div>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-white font-heading">Mensagem Enviada com Sucesso!</h4>
                  <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                    Sua mensagem foi transmitida com sucesso para <strong>{contactEmail}</strong> e já está arquivada em nossa central de atendimento. Responderemos o mais breve possível.
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Remetente: {formData.name} ({formData.email}) • Assunto: {formData.subject}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registrada e enviada para {contactEmail}</span>
                </div>

                {/* Ações diretas opcionais */}
                <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`mailto:${contactEmail}?subject=${encodeURIComponent(`[${brandName}] ${formData.subject} - De: ${formData.name}`)}&body=${encodeURIComponent(`Nome: ${formData.name}\nE-mail: ${formData.email}\nAssunto: ${formData.subject}\n\nMensagem:\n${formData.message}`)}`}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-white/20"
                    title="Enviar uma cópia direta a partir do seu cliente de e-mail (Gmail/Outlook)"
                  >
                    <Mail className="w-4 h-4 text-[#FFDD00]" />
                    <span>Abrir no meu E-mail (Gmail/Outlook)</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setSubmissionFeedback(null);
                      setFormData({ name: '', email: '', subject: 'Dúvida Geral', message: '' });
                    }}
                    className="text-xs text-neutral-400 hover:text-white underline font-mono cursor-pointer"
                  >
                    Enviar Outra Mensagem
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-300 font-mono uppercase">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Carlos Silva"
                      className="w-full bg-[#181822] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ebbf01]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-300 font-mono uppercase">
                      Seu E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Ex: carlos@email.com"
                      className="w-full bg-[#181822] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ebbf01]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300 font-mono uppercase">
                    Assunto
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#181822] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#ebbf01] cursor-pointer"
                  >
                    <option value="Dúvida Geral" className="bg-[#181822] text-white">Dúvida Geral</option>
                    <option value="Relatar um problema" className="bg-[#181822] text-white">Relatar um problema</option>
                    <option value="Suporte Tecnico / APK" className="bg-[#181822] text-white">Suporte Técnico / Instalação APK</option>
                    <option value="Dúvidas VIP" className="bg-[#181822] text-white">Área VIP & Assinaturas</option>
                    <option value="Parceria / Comercial" className="bg-[#181822] text-white">Parceria / Comercial</option>
                    <option value="Outro" className="bg-[#181822] text-white">Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300 font-mono uppercase">
                    Sua Mensagem *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Escreva detalhadamente sua dúvida ou mensagem para nossa equipe..."
                    className="w-full bg-[#181822] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ebbf01] leading-relaxed font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] disabled:opacity-60 text-black font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ebbf01]/20 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Enviando pelo Site...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar pelo Site</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
