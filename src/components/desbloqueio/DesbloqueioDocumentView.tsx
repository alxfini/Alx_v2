import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  Copy, 
  ExternalLink, 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Eye, 
  Sparkles, 
  X, 
  RotateCcw, 
  Film, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { UnlockServiceItem } from '../../types';
import { getMediaPreviewUrl, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../../utils/mediaUrl';
import { SocialIcon } from '../common/SocialIcon';

interface DesbloqueioDocumentViewProps {
  service: UnlockServiceItem;
  onBack?: () => void;
  isStandalone?: boolean;
}

export const DesbloqueioDocumentView: React.FC<DesbloqueioDocumentViewProps> = ({ 
  service, 
  onBack,
  isStandalone = false 
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
  const directUrl = `${currentOrigin}/desbloqueio/${service.slug || service.id}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const CALLOUT_COLOR_MAP: Record<string, string> = {
    vermelho: '#ef4444',
    red: '#ef4444',
    laranja: '#f97316',
    orange: '#f97316',
    amarelo: '#eab308',
    yellow: '#eab308',
    ouro: '#ebbf01',
    gold: '#ebbf01',
    verde: '#10b981',
    green: '#10b981',
    neon: '#1EFF00',
    azul: '#3b82f6',
    blue: '#3b82f6',
    roxo: '#8b5cf6',
    purple: '#8b5cf6',
    violeta: '#a855f7',
    rosa: '#ec4899',
    pink: '#ec4899',
    ciano: '#06b6d4',
    cyan: '#06b6d4',
    turquesa: '#14b8a6',
    cinza: '#64748b',
    gray: '#64748b',
    branco: '#e2e8f0',
    white: '#e2e8f0',
  };

  const resolveColorHex = (colorStr?: string): string => {
    if (!colorStr) return '#3b82f6';
    const clean = colorStr.trim().toLowerCase();
    if (clean.startsWith('#')) {
      if (/^#[0-9a-f]{3,8}$/i.test(clean)) {
        return clean;
      }
    }
    if (CALLOUT_COLOR_MAP[clean]) {
      return CALLOUT_COLOR_MAP[clean];
    }
    return '#3b82f6';
  };

  const hexToRgba = (hex: string, alpha: number): string => {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length >= 6) {
      const r = parseInt(clean.substring(0, 2), 16) || 0;
      const g = parseInt(clean.substring(2, 4), 16) || 0;
      const b = parseInt(clean.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(59, 130, 246, ${alpha})`;
  };

  // Parse markdown content com suporte a imagens, títulos, caixas coloridas, passos e vídeos com loop
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`space-${i}`} className="h-3" />);
        continue;
      }

      // Tag de vídeo: [video: url | caption | loop/noloop]
      const tagVideoMatch = trimmed.match(/^\[(?:video|vídeo):\s*([^\]]+)\]$/i);
      const mdVideoMatch = trimmed.match(/^!\[(?:video|vídeo)(?::\s*|\s+)?(.*?)\]\((.*?)\)$/i);

      // Markdown de imagem: ![caption](url) ou [imagem: url | caption]
      const mdImgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      const tagImgMatch = trimmed.match(/^\[imagem:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]$/i);

      let detectedVideoUrl: string | null = null;
      let detectedVideoCaption = '';
      let isVideoLoop = true;

      if (tagVideoMatch) {
        const parts = tagVideoMatch[1].split('|').map(p => p.trim());
        detectedVideoUrl = parts[0];
        detectedVideoCaption = parts[1] || '';
        if (parts[2]) {
          const l = parts[2].toLowerCase();
          if (l === 'noloop' || l === 'no-loop' || l === 'sem-loop' || l === 'false' || l === 'nao' || l === 'não') {
            isVideoLoop = false;
          } else if (l === 'loop' || l === 'true' || l === 'sim') {
            isVideoLoop = true;
          }
        }
      } else if (mdVideoMatch) {
        detectedVideoUrl = mdVideoMatch[2].trim();
        detectedVideoCaption = (mdVideoMatch[1] || '').trim();
      } else if (mdImgMatch) {
        const potentialUrl = mdImgMatch[2].trim();
        const isVideoExtension = /\.(mp4|webm|mov|ogg|m4v|mkv)($|\?)/i.test(potentialUrl);
        const isYouTubeLink = /(?:youtu\.be\/|youtube\.com)/i.test(potentialUrl);
        if (isVideoExtension || isYouTubeLink) {
          detectedVideoUrl = potentialUrl;
          detectedVideoCaption = mdImgMatch[1].trim();
        }
      }

      // Renderiza Vídeo
      if (detectedVideoUrl) {
        const cleanVideoCaption = (detectedVideoCaption || '').replace(/^(?:vídeo|video)\s*\d+\s*:\s*/i, '').trim();
        const ytEmbed = getYouTubeEmbedUrl(detectedVideoUrl, { loop: isVideoLoop });

        elements.push(
          <figure key={`vid-${i}`} className="my-6 rounded-2xl overflow-hidden border border-white/[0.1] bg-[#121217] shadow-xl">
            <div className="relative aspect-video max-h-[460px] bg-black overflow-hidden flex items-center justify-center">
              {ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  title={cleanVideoCaption || 'Demonstração em vídeo'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <video
                  src={detectedVideoUrl}
                  controls
                  loop={isVideoLoop}
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black"
                >
                  Seu navegador não suporta a tag de vídeo.
                </video>
              )}
            </div>
            {cleanVideoCaption && (
              <figcaption className="px-4 py-2.5 bg-[#181820] border-t border-white/[0.08] text-xs font-mono text-neutral-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Film className="w-3.5 h-3.5 text-[#ebbf01] shrink-0" />
                  <span className="truncate">{cleanVideoCaption}</span>
                </div>
                {isVideoLoop ? (
                  <span 
                    className="px-2 py-0.5 rounded-md bg-[#1EFF00]/15 text-[#1EFF00] border border-[#1EFF00]/30 text-[10px] font-mono shrink-0 flex items-center gap-1 shadow-2xs"
                    title="Este vídeo está configurado para repetir continuamente (Loop)"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Loop Contínuo</span>
                  </span>
                ) : (
                  <span 
                    className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-white/10 text-[10px] font-mono shrink-0 flex items-center gap-1"
                    title="Reprodução padrão (não repete ao terminar)"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>Reprodução Única</span>
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        );
        continue;
      }

      // Renderiza Imagem
      if (mdImgMatch || tagImgMatch) {
        const url = (mdImgMatch ? mdImgMatch[2] : tagImgMatch![1]).trim();
        const rawCaption = (mdImgMatch ? mdImgMatch[1] : tagImgMatch![2] || '').trim();
        const cleanImgCaption = rawCaption.replace(/^(?:figura|imagem)\s*\d+\s*:\s*/i, '').trim();

        elements.push(
          <figure key={`img-${i}`} className="my-6 rounded-2xl overflow-hidden border border-white/[0.1] bg-[#121217] shadow-xl">
            <div 
              className="relative aspect-video sm:aspect-[21/9] max-h-[420px] bg-black/40 overflow-hidden cursor-pointer group"
              onClick={() => setEnlargedImage(url)}
            >
              <img 
                src={url} 
                alt={cleanImgCaption || 'Imagem do serviço'} 
                className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#ebbf01]" />
                <span>Clique para ampliar</span>
              </div>
            </div>
            {cleanImgCaption && (
              <figcaption className="px-4 py-2.5 bg-[#181820] border-t border-white/[0.08] text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span>{cleanImgCaption}</span>
              </figcaption>
            )}
          </figure>
        );
        continue;
      }

      // Heading 1 (# ...)
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-white font-heading mt-6 mb-3 flex items-center gap-2 pb-2 border-b border-white/[0.1]">
            <span className="w-2 h-6 bg-[#ebbf01] rounded-sm shrink-0" />
            <span>{trimmed.replace(/^#\s+/, '')}</span>
          </h2>
        );
        continue;
      }

      // Heading 2 (## ...)
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${i}`} className="text-lg sm:text-xl font-extrabold text-white font-heading mt-6 mb-2 flex items-center gap-2 pb-1.5 border-b border-white/[0.06]">
            <span className="w-1.5 h-4 bg-[#ebbf01] rounded-full shrink-0" />
            <span>{trimmed.replace(/^##\s+/, '')}</span>
          </h3>
        );
        continue;
      }

      // Heading 3 (### ...)
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${i}`} className="text-base font-bold text-[#ebbf01] font-heading mt-4 mb-1">
            {trimmed.replace(/^###\s+/, '')}
          </h4>
        );
        continue;
      }

      // Caixas de Destaque / Callout Block (> ...) ou [caixa: ...]
      const tagCaixaMatch = trimmed.match(/^\[(?:caixa|box):\s*([^\|\]]+)(?:\|\s*([^\]]+))?\]$/i);

      if (trimmed.startsWith('> ') || tagCaixaMatch) {
        let calloutText = '';
        let explicitColor: string | undefined = undefined;

        if (tagCaixaMatch) {
          explicitColor = tagCaixaMatch[1].trim();
          calloutText = (tagCaixaMatch[2] || '').trim();
        } else {
          const raw = trimmed.replace(/^>\s+/, '').trim();
          const colorTagMatch = raw.match(/^\[(?:cor|color):\s*([^\|\]]+)(?:\|\s*([^\]]+))?\]\s*(.*)$/i);
          if (colorTagMatch) {
            explicitColor = colorTagMatch[1].trim();
            const inlineTitle = colorTagMatch[2] ? `**${colorTagMatch[2].trim()}:** ` : '';
            calloutText = inlineTitle + (colorTagMatch[3] || '').trim();
          } else {
            calloutText = raw;
          }
        }

        let resolvedColor = '#3b82f6';
        if (explicitColor) {
          resolvedColor = resolveColorHex(explicitColor);
        } else {
          const lower = calloutText.toLowerCase();
          const isDanger = lower.includes('observação') || lower.includes('observacao') || lower.includes('perigo') || lower.includes('urgente') || lower.includes('crítico') || lower.includes('critico');
          const isWarning = !isDanger && (lower.includes('atenção') || lower.includes('atencao') || lower.includes('cuidado') || lower.includes('aviso'));
          const isTip = !isDanger && (lower.includes('dica') || lower.includes('nota'));

          if (isDanger) resolvedColor = '#ef4444';
          else if (isWarning) resolvedColor = '#f59e0b';
          else if (isTip) resolvedColor = '#3b82f6';
          else resolvedColor = '#10b981';
        }

        const lowerText = calloutText.toLowerCase();
        const isDangerIcon = resolvedColor === '#ef4444' || lowerText.includes('observação') || lowerText.includes('perigo');
        const isWarningIcon = resolvedColor === '#f59e0b' || resolvedColor === '#eab308' || resolvedColor === '#f97316' || lowerText.includes('atenção') || lowerText.includes('cuidado');
        const isTipIcon = resolvedColor === '#3b82f6' || lowerText.includes('dica');

        elements.push(
          <div 
            key={`callout-${i}`} 
            style={{
              backgroundColor: hexToRgba(resolvedColor, 0.12),
              borderColor: hexToRgba(resolvedColor, 0.35),
              borderLeftColor: resolvedColor,
              borderLeftWidth: '4px',
              boxShadow: `0 4px 20px -2px ${hexToRgba(resolvedColor, 0.2)}`
            }}
            className="my-4 p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-lg backdrop-blur-xs transition-all"
          >
            <div style={{ color: resolvedColor }} className="shrink-0 mt-0.5">
              {isDangerIcon ? (
                <AlertCircle className="w-5 h-5" />
              ) : isWarningIcon ? (
                <AlertTriangle className="w-5 h-5" />
              ) : isTipIcon ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>
            <div className="text-xs sm:text-sm leading-relaxed font-sans text-neutral-100 flex-1">
              {renderInlineStyles(calloutText)}
            </div>
          </div>
        );
        continue;
      }

      // Passos Numerados (1. ...)
      const stepMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (stepMatch) {
        const stepNumber = stepMatch[1];
        const stepContent = stepMatch[2];
        elements.push(
          <div key={`step-${i}`} className="my-2.5 flex items-start gap-3 bg-[#15151c]/60 border border-white/[0.05] p-3 sm:p-4 rounded-xl">
            <span className="w-6 h-6 rounded-lg bg-[#ebbf01] text-black font-extrabold text-xs flex items-center justify-center shrink-0 font-mono shadow-xs">
              {stepNumber}
            </span>
            <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans pt-0.5">
              {renderInlineStyles(stepContent)}
            </div>
          </div>
        );
        continue;
      }

      // Marcadores (- ... ou * ...)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletContent = trimmed.replace(/^[-*]\s+/, '');
        elements.push(
          <div key={`bullet-${i}`} className="my-1.5 flex items-start gap-2.5 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ebbf01] mt-2 shrink-0" />
            <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
              {renderInlineStyles(bulletContent)}
            </div>
          </div>
        );
        continue;
      }

      // Parágrafo Padrão
      elements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
          {renderInlineStyles(trimmed)}
        </p>
      );
    }

    return elements;
  };

  // Helper para negrito e código inline
  const renderInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 bg-black/40 border border-white/10 rounded font-mono text-[11px] text-[#ebbf01]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const whatsappHref = service.whatsappContactMessage 
    ? `https://api.whatsapp.com/send?phone=5511999999999&text=${encodeURIComponent(service.whatsappContactMessage)}`
    : 'https://alx.short.gy/desbloqueio_alx';

  return (
    <div className="space-y-6">
      {/* Botão Voltar (se fornecido) */}
      {onBack && (
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#ebbf01]" />
            <span>Voltar aos Serviços</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-[#ebbf01]/40 transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1EFF00]" />
                <span className="text-[#1EFF00]">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#ebbf01]" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* DOCUMENTO PRINCIPAL (Estilo Manual & Especificação) */}
      <article className="w-full bg-[#111115] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl relative text-neutral-100 p-6 sm:p-10 lg:p-12 space-y-8">
        
        {/* Cabeçalho */}
        <header className="space-y-4 pb-6 border-b border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-lg bg-[#ebbf01]/10 border border-[#ebbf01]/30 text-[#ebbf01] text-xs font-mono font-bold uppercase">
              {service.category}
            </span>
            {service.badge && (
              <span
                className="px-3 py-1 rounded-lg text-black text-xs font-mono font-bold uppercase shadow-md"
                style={{ backgroundColor: service.badgeColor || '#10B981' }}
              >
                {service.badge}
              </span>
            )}
            {service.price && (
              <span className="px-3 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-neutral-200 text-xs font-mono font-bold">
                {service.price}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading leading-tight">
            {service.title}
          </h1>

          {service.summary && (
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-sans">
              {service.summary}
            </p>
          )}
        </header>

        {/* Imagem de Capa do Serviço */}
        {service.imageUrl && (
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-[#16161D] border border-white/[0.08] hover:border-[#ebbf01]/40 shadow-2xl group transition-all duration-300">
            <img
              src={getMediaPreviewUrl(service.imageUrl)}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e13] via-transparent to-black/30 pointer-events-none" />
          </div>
        )}

        {/* Conteúdo Passo a Passo & Formatação Rica */}
        <div className="space-y-4 pt-2">
          {renderFormattedContent(service.content)}
        </div>

        {/* Veículos Compatíveis */}
        {service.applicableCars && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#14141c] border border-white/[0.08] space-y-1.5">
            <div className="text-xs font-mono text-[#ebbf01] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#ebbf01]" />
              <span>Veículos Compatíveis:</span>
            </div>
            <div className="text-sm font-bold text-white">
              {service.applicableCars}
            </div>
          </div>
        )}

        {/* Garantia & Execução de Serviços */}
        {((service.warrantyTitle === undefined && service.warrantyText === undefined) ||
          (service.warrantyTitle && service.warrantyTitle.trim() !== '') ||
          (service.warrantyText && service.warrantyText.trim() !== '')) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#14141c] border border-amber-500/20 flex items-start gap-3.5 text-xs font-mono text-neutral-300">
            <ShieldCheck className="w-5 h-5 text-[#ebbf01] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-white font-bold flex items-center gap-2">
                <span>{service.warrantyTitle !== undefined && service.warrantyTitle.trim() !== '' ? service.warrantyTitle : 'Garantia & Execução de Serviços'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-[#ebbf01] uppercase font-bold">Oficial</span>
              </div>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                {service.warrantyText !== undefined && service.warrantyText.trim() !== '' ? service.warrantyText : 'Todos os serviços são executados com ferramentas de nível profissional, garantindo integridade dos sistemas originais do veículo.'}
              </p>
            </div>
          </div>
        )}

        {/* Banner de Contratação & WhatsApp */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#14141c] border border-[#25D366]/30 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-white font-bold text-base">Gostaria de contratar este serviço?</h4>
            <p className="text-xs text-neutral-400">
              Fale diretamente via WhatsApp para agendamento presencial ou atendimento remoto.
            </p>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 shrink-0 cursor-pointer"
          >
            <SocialIcon platform="whatsapp" className="w-4 h-4 text-white" />
            <span>Solicitar Orçamento</span>
          </a>
        </div>
      </article>

      {/* Modal de Imagem Ampliada */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20">
            <img 
              src={enlargedImage} 
              alt="Ampliada" 
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => setEnlargedImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
