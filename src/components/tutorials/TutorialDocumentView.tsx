import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Printer, 
  Calendar, 
  Clock, 
  Car, 
  FileText, 
  Check, 
  Copy, 
  ExternalLink, 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Eye, 
  Sparkles,
  MessageCircle,
  Send,
  X,
  Crown,
  Lock,
  Edit3,
  RotateCcw,
  Save
} from 'lucide-react';
import { Tutorial } from '../../types';
import { useSiteData } from '../../context/SiteDataContext';
import { isItemVip } from '../../utils/vip';
import { doesLinkGrantDirectAccess } from '../../utils/visibility';

interface TutorialDocumentViewProps {
  tutorial: Tutorial;
  onBack: () => void;
}

const DEFAULT_COPYRIGHT_TITLE = "Proteção de Direitos Autorais";
const DEFAULT_COPYRIGHT_BADGE = "Oficial";
const DEFAULT_COPYRIGHT_TEXT = "Documento produzido por Alx⁺. Todos os direitos reservados. Proibida a cópia, reprodução integral ou distribuição não autorizada deste material. Compartilhe sempre usando o link oficial desta página.";

export const TutorialDocumentView: React.FC<TutorialDocumentViewProps> = ({ tutorial, onBack }) => {
  const { isVipLoggedIn, isAdminAuthenticated, openVipModal, brand, updateBrand } = useSiteData();
  const [copiedLink, setCopiedLink] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Copyright notice state & editing
  const copyrightTitle = brand?.tutorialCopyrightTitle ?? DEFAULT_COPYRIGHT_TITLE;
  const copyrightBadge = brand?.tutorialCopyrightBadge ?? DEFAULT_COPYRIGHT_BADGE;
  const copyrightText = brand?.tutorialCopyrightText ?? DEFAULT_COPYRIGHT_TEXT;

  const [isEditingCopyrightModalOpen, setIsEditingCopyrightModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(copyrightTitle);
  const [editBadge, setEditBadge] = useState(copyrightBadge);
  const [editText, setEditText] = useState(copyrightText);

  const handleOpenEditCopyright = () => {
    setEditTitle(copyrightTitle);
    setEditBadge(copyrightBadge);
    setEditText(copyrightText);
    setIsEditingCopyrightModalOpen(true);
  };

  const handleSaveCopyright = () => {
    updateBrand({
      tutorialCopyrightTitle: editTitle.trim() || DEFAULT_COPYRIGHT_TITLE,
      tutorialCopyrightBadge: editBadge.trim() || DEFAULT_COPYRIGHT_BADGE,
      tutorialCopyrightText: editText.trim() || DEFAULT_COPYRIGHT_TEXT,
    });
    setIsEditingCopyrightModalOpen(false);
  };

  const handleResetCopyright = () => {
    updateBrand({
      tutorialCopyrightTitle: DEFAULT_COPYRIGHT_TITLE,
      tutorialCopyrightBadge: DEFAULT_COPYRIGHT_BADGE,
      tutorialCopyrightText: DEFAULT_COPYRIGHT_TEXT,
    });
    setEditTitle(DEFAULT_COPYRIGHT_TITLE);
    setEditBadge(DEFAULT_COPYRIGHT_BADGE);
    setEditText(DEFAULT_COPYRIGHT_TEXT);
    setIsEditingCopyrightModalOpen(false);
  };

  // VIP / Member restriction logic
  const isMember = isVipLoggedIn || isAdminAuthenticated;
  const isMembersOnly = isItemVip(tutorial);
  const allowsLinkAccess = doesLinkGrantDirectAccess(tutorial);
  const isLocked = !allowsLinkAccess && isMembersOnly && !isMember;

  // Compute direct permalink for this tutorial
  const tutorialSlug = tutorial.slug || tutorial.id;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
  const directUrl = `${currentOrigin}/tutoriais/${tutorialSlug}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tutorial.title,
          url: directUrl,
        });
        return;
      } catch (err) {
        // Fallback to modal or copy
      }
    }
    setShowShareModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to extract YouTube video ID for embedded player
  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(tutorial.videoUrl);

  // Parse markdown content with support for images, headings, callouts, steps
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let figureCount = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`space-${i}`} className="h-3" />);
        continue;
      }

      // Check for inline image markdown: ![caption](url) or [imagem: url | caption] or [imagem: url]
      const mdImgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      const tagImgMatch = trimmed.match(/^\[imagem:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]$/i);

      if (mdImgMatch || tagImgMatch) {
        const url = (mdImgMatch ? mdImgMatch[2] : tagImgMatch![1]).trim();
        const caption = (mdImgMatch ? mdImgMatch[1] : tagImgMatch![2] || '').trim();
        const figNum = figureCount++;

        elements.push(
          <figure key={`img-${i}`} className="my-6 rounded-2xl overflow-hidden border border-white/[0.1] bg-[#121217] shadow-xl">
            <div 
              className="relative aspect-video sm:aspect-[21/9] max-h-[420px] bg-black/40 overflow-hidden cursor-pointer group"
              onClick={() => setEnlargedImage(url)}
            >
              <img 
                src={url} 
                alt={caption || `Figura ${figNum}`} 
                className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#1EFF00]" />
                <span>Clique para ampliar</span>
              </div>
            </div>
            {caption && (
              <figcaption className="px-4 py-2.5 bg-[#181820] border-t border-white/[0.08] text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span><strong>Figura {figNum}:</strong> {caption}</span>
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
            <span className="w-2 h-6 bg-[#1EFF00] rounded-sm shrink-0" />
            <span>{trimmed.replace(/^#\s+/, '')}</span>
          </h2>
        );
        continue;
      }

      // Heading 2 (## ...)
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${i}`} className="text-lg sm:text-xl font-extrabold text-white font-heading mt-6 mb-2 flex items-center gap-2 pb-1.5 border-b border-white/[0.06]">
            <span className="w-1.5 h-4 bg-[#1EFF00] rounded-full shrink-0" />
            <span>{trimmed.replace(/^##\s+/, '')}</span>
          </h3>
        );
        continue;
      }

      // Heading 3 (### ...)
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${i}`} className="text-base font-bold text-[#1EFF00] font-heading mt-4 mb-1">
            {trimmed.replace(/^###\s+/, '')}
          </h4>
        );
        continue;
      }

      // Callout Block (> ...)
      if (trimmed.startsWith('> ')) {
        const calloutText = trimmed.replace(/^>\s+/, '');
        const isWarning = calloutText.toLowerCase().includes('atenção') || calloutText.toLowerCase().includes('cuidado');
        const isTip = calloutText.toLowerCase().includes('dica') || calloutText.toLowerCase().includes('nota');

        elements.push(
          <div 
            key={`callout-${i}`} 
            className={`my-4 p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
              isWarning 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                : isTip 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-200' 
                : 'bg-white/[0.04] border-white/[0.1] text-neutral-200'
            }`}
          >
            {isWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : isTip ? (
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-[#1EFF00] shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm leading-relaxed font-sans">
              {renderInlineStyles(calloutText)}
            </div>
          </div>
        );
        continue;
      }

      // Numbered Step List Item (1. ...)
      const stepMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (stepMatch) {
        const stepNumber = stepMatch[1];
        const stepContent = stepMatch[2];
        elements.push(
          <div key={`step-${i}`} className="my-2.5 flex items-start gap-3 bg-[#15151c]/60 border border-white/[0.05] p-3 sm:p-4 rounded-xl">
            <span className="w-6 h-6 rounded-lg bg-[#1EFF00] text-black font-extrabold text-xs flex items-center justify-center shrink-0 font-mono shadow-xs">
              {stepNumber}
            </span>
            <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans pt-0.5">
              {renderInlineStyles(stepContent)}
            </div>
          </div>
        );
        continue;
      }

      // Unordered Bullet List (- ... or * ...)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletContent = trimmed.replace(/^[-*]\s+/, '');
        elements.push(
          <div key={`bullet-${i}`} className="my-1.5 flex items-start gap-2.5 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1EFF00] mt-2 shrink-0" />
            <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
              {renderInlineStyles(bulletContent)}
            </div>
          </div>
        );
        continue;
      }

      // Standard Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
          {renderInlineStyles(trimmed)}
        </p>
      );
    }

    return elements;
  };

  // Helper for bold, code, links inline styling
  const renderInlineStyles = (text: string) => {
    // Process markdown bold **text** and code `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 bg-black/40 border border-white/10 rounded font-mono text-[11px] text-[#1EFF00]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ================= MAIN DOCUMENT "FOLHA DE MANUAL / ESTILO PDF" ================= */}
      <article className="bg-[#111115] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl relative text-neutral-100 print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Marca d'água de proteção contra cópia no PDF / Impressão */}
        <div className="hidden print:block fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
          <div className="w-full h-full flex flex-col justify-around items-center opacity-[0.07] rotate-[-35deg] scale-125">
            <div className="text-4xl sm:text-5xl font-black text-black tracking-widest uppercase font-mono">
              ALX⁺ • TODOS OS DIREITOS RESERVADOS
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-black tracking-widest uppercase font-mono">
              DOCUMENTO PRODUZIDO POR ALX⁺
            </div>
            <div className="text-4xl sm:text-5xl font-black text-black tracking-widest uppercase font-mono">
              ALX⁺ • TODOS OS DIREITOS RESERVADOS
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-black tracking-widest uppercase font-mono">
              PRODUZIDO POR ALX⁺ • PROIBIDA REPRODUÇÃO
            </div>
          </div>
        </div>

        {/* Marca d'água sutil de fundo na visualização digital */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.015] select-none overflow-hidden print:hidden">
          <span className="text-9xl font-black tracking-widest rotate-[-30deg] uppercase text-white font-mono">
            ALX⁺
          </span>
        </div>

        {/* Document Paper Container */}
        <div className="p-4 sm:p-8 lg:p-10 space-y-8 w-full mx-auto relative z-10">
          
          {/* Cabeçalho exclusivo para o modo PDF / Impressão */}
          <div className="hidden print:flex justify-between items-center pb-3 border-b border-neutral-300 text-[10px] font-mono text-neutral-600">
            <span className="font-bold uppercase tracking-wider">ALX⁺ • GUIA TÉCNICO OFICIAL</span>
            <span className="font-bold">DOCUMENTO PRODUZIDO POR ALX⁺ • TODOS OS DIREITOS RESERVADOS</span>
          </div>

          {/* Title & Metadata Header */}
          <header className="space-y-4 pb-6 border-b border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-lg bg-[#1EFF00]/10 border border-[#1EFF00]/30 text-[#1EFF00] text-xs font-mono font-extrabold uppercase tracking-wider">
                {tutorial.category}
              </span>
              {isMembersOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1EFF00] text-black text-xs font-mono font-extrabold uppercase tracking-wider shadow-md">
                  <Crown className="w-3.5 h-3.5 fill-black" />
                  <span>{isMember ? 'Acesso Membro VIP' : 'Exclusivo para Membros'}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-white leading-tight font-heading">
              {tutorial.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
              {tutorial.summary}
            </p>
          </header>

          {/* Member Lock Screen if Restricted */}
          {isLocked ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#181824] to-[#101017] border border-[#1EFF00]/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-[#1EFF00] text-black flex items-center justify-center mx-auto shadow-xl shadow-[#1EFF00]/20">
                <Lock className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#1EFF00] uppercase tracking-wider bg-black/60 px-3 py-1 rounded-full border border-white/10">
                  <Crown className="w-3.5 h-3.5 fill-[#1EFF00]" />
                  <span>Conteúdo Restrito • Área VIP</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                  Este tutorial é exclusivo para Membros Oficiais
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  As instruções completas, comandos de sistema, diagramas e procedimentos técnicos deste manual estão disponíveis apenas para usuários autenticados da Área VIP ALX Garage.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={openVipModal}
                  className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-[#1EFF00] hover:bg-[#1ceb00] text-black font-extrabold text-xs uppercase font-mono tracking-wider shadow-lg shadow-[#1EFF00]/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Crown className="w-4 h-4 fill-black" />
                  <span>Exclusivo para Membros</span>
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-[#1e1e28] hover:bg-[#282836] text-neutral-300 hover:text-white border border-white/10 font-bold text-xs font-mono transition-all cursor-pointer"
                >
                  Voltar aos Tutoriais
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Corpo do Documento com Texto e Imagens Injetadas */}
              <div className="space-y-4 pt-2">
                {renderFormattedContent(tutorial.content)}
              </div>

              {/* Galeria de Imagens Anexadas Adicionais (se existirem) */}
              {tutorial.images && tutorial.images.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1EFF00] uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Figuras & Diagramas Anexados ao Guia</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tutorial.images.map((imgUrl, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setEnlargedImage(imgUrl)}
                        className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#14141c] cursor-pointer group hover:border-[#1EFF00]/40 transition-colors"
                      >
                        <div className="aspect-video bg-black/40 overflow-hidden relative">
                          <img 
                            src={imgUrl} 
                            alt={`Anexo ${idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="p-2 text-[11px] font-mono text-neutral-400 truncate">
                          Anexo #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Video Embed Integrado no FINAL DO TUTORIAL */}
              {tutorial.videoUrl && (
                <section className="p-5 sm:p-6 rounded-2xl bg-[#14141c] border border-white/[0.08] space-y-4 pt-6 mt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1EFF00]">
                      <Play className="w-4 h-4 fill-[#1EFF00]" />
                      <span>VÍDEO EXPLICATIVO DO TUTORIAL (DEMONSTRAÇÃO EM VÍDEO)</span>
                    </div>
                    <a
                      href={tutorial.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-neutral-400 hover:text-white underline inline-flex items-center gap-1"
                    >
                      <span>Abrir no YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {youtubeEmbedUrl ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-lg">
                      <iframe
                        src={youtubeEmbedUrl}
                        title={tutorial.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <a
                      href={tutorial.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Assistir Demonstração no YouTube</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </section>
              )}
            </>
          )}

          {/* ================= DOCUMENT BOTTOM FOOTER (COM BOTÃO COMPARTILHAR) ================= */}
          <footer className="pt-8 border-t border-white/[0.08] space-y-6">
            
            {/* Aviso de Proteção de Direitos Autorais */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#16161D] border border-[#1EFF00]/30 flex items-start gap-3 text-xs font-mono text-neutral-300 relative group">
              <ShieldCheck className="w-4 h-4 text-[#1EFF00] shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <div className="text-white font-bold flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span>{copyrightTitle}</span>
                    {copyrightBadge && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1EFF00]/20 text-[#1EFF00] uppercase font-bold">
                        {copyrightBadge}
                      </span>
                    )}
                  </div>

                  {/* Botão para Editar Campo de Direitos Autorais (Apenas Admin) */}
                  {isAdminAuthenticated && (
                    <button
                      onClick={handleOpenEditCopyright}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1EFF00]/10 hover:bg-[#1EFF00]/20 text-[#1EFF00] hover:text-[#1EFF00] text-[11px] font-mono font-bold border border-[#1EFF00]/30 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Editar Proteção de Direitos Autorais"
                    >
                      <Edit3 className="w-3 h-3 text-[#1EFF00]" />
                      <span>Editar Campo</span>
                    </button>
                  )}
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px] whitespace-pre-line">
                  {copyrightText}
                </p>
              </div>
            </div>

            {/* Box Compartilhar & Link Único Permanente */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#16161D] border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#1EFF00]" />
                    <span>Compartilhar este Tutorial</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Envie o link oficial das instruções para amigos ou grupos de proprietários de carros elétricos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(directUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all cursor-pointer"
                    title="Compartilhar no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(directUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/30 transition-all cursor-pointer"
                    title="Compartilhar no Telegram"
                  >
                    <Send className="w-4 h-4" />
                  </a>

                  {/* Botão Copiar */}
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-[#1EFF00] hover:bg-[#1ceb00] text-black font-extrabold text-xs font-mono flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'COPIADO!' : 'COPIAR LINK'}</span>
                  </button>
                </div>
              </div>

              {/* Caixa com o link visível */}
              <div className="flex items-center gap-2 p-2.5 bg-black/40 border border-white/[0.06] rounded-xl text-xs font-mono">
                <span className="text-neutral-500 select-none">Link permanente:</span>
                <span className="text-[#1EFF00] truncate flex-1 select-all">{directUrl}</span>
              </div>
            </div>

            {/* Certificação Técnica & Botão de Retorno */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-neutral-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Documento produzido por Alx⁺. Todos os direitos reservados.</span>
              </div>

              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl bg-[#181820] hover:bg-[#20202B] text-neutral-200 border border-white/[0.08] text-xs font-mono font-bold cursor-pointer transition-all"
              >
                Voltar à Lista de Tutoriais
              </button>
            </div>
          </footer>
        </div>
      </article>

      {/* ================= MODAL: SHARE QUICK SHEET ================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141a] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
                <Share2 className="w-4 h-4 text-[#1EFF00]" />
                <span>Compartilhar Tutorial</span>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Compartilhe o link oficial do guia <strong className="text-white">"{tutorial.title}"</strong>:
            </p>

            {/* Aviso de direitos autorais no modal de compartilhamento */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1EFF00] shrink-0 mt-0.5" />
              <span><strong>Proteção Autoral:</strong> Documento produzido por Alx⁺. Todos os direitos reservados. Proibida reprodução não autorizada.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(directUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(directUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/30 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </a>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-mono uppercase text-neutral-400">Copiar Link do Tutorial</label>
              <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/10 rounded-xl">
                <input 
                  type="text" 
                  readOnly 
                  value={directUrl} 
                  className="bg-transparent text-xs font-mono text-[#1EFF00] flex-1 outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-[#1EFF00] hover:bg-[#1ceb00] text-black font-extrabold text-[11px] font-mono cursor-pointer shrink-0"
                >
                  {copiedLink ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX: IMAGE ENLARGEMENT ================= */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-12 right-0 p-2 text-neutral-400 hover:text-white rounded-xl bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={enlargedImage} 
              alt="Ampliação do Tutorial" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PROTEÇÃO DE DIREITOS AUTORAIS ================= */}
      {isEditingCopyrightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14141a] border border-[#1EFF00]/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
                <ShieldCheck className="w-5 h-5 text-[#1EFF00]" />
                <span>Editar Proteção de Direitos Autorais</span>
              </div>
              <button 
                onClick={() => setIsEditingCopyrightModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 mb-1.5">
                  Título do Campo
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="ex: Proteção de Direitos Autorais"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1c26] border border-white/10 text-white text-xs font-mono focus:border-[#1EFF00] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 mb-1.5">
                  Selo / Badge (opcional)
                </label>
                <input
                  type="text"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  placeholder="ex: Oficial"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1c26] border border-white/10 text-white text-xs font-mono focus:border-[#1EFF00] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 mb-1.5">
                  Texto dos Direitos Autorais
                </label>
                <textarea
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Digite a mensagem de proteção de direitos autorais..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1c26] border border-white/10 text-white text-xs font-sans leading-relaxed focus:border-[#1EFF00] focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleResetCopyright}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditingCopyrightModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono cursor-pointer border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCopyright}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#1EFF00] hover:bg-[#1ceb00] text-black font-extrabold text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
