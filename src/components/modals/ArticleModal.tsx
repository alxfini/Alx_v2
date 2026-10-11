import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { NewsArticle } from '../../types';
import { newsArticles as defaultNewsArticles } from '../../data/news';
import { Calendar, Clock, User, Share2, Tag, ArrowLeft, Check, ExternalLink, Loader2, Crown, Lock } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { getMediaPreviewUrl } from '../../utils/mediaUrl';
import { isItemVip } from '../../utils/vip';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { updateNews, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<string>('');
  const [isLoadingScraped, setIsLoadingScraped] = useState<boolean>(false);

  const isArticleVIP = isItemVip(article);
  const isLocked = Boolean(article && isArticleVIP && !isUserAuthenticated);

  useEffect(() => {
    if (!article || isLocked) {
      setScrapedContent('');
      setIsLoadingScraped(false);
      return;
    }

    const matchedDefault = defaultNewsArticles.find(d => d.id === article.id || d.slug === article.slug || d.title.toLowerCase().trim() === article.title.toLowerCase().trim());
    if (matchedDefault) {
      setScrapedContent(matchedDefault.content);
      setIsLoadingScraped(false);
      return;
    }

    if (article.content && article.content.length > 500 && !article.content.includes('Reportagem completa') && !article.content.includes('Confira todos os detalhes completos')) {
      setScrapedContent(article.content);
      setIsLoadingScraped(false);
      return;
    }

    if (!article.sourceUrl || article.sourceUrl === '#' || article.sourceUrl.startsWith('feed')) {
      setScrapedContent(article.content || article.summary || '');
      setIsLoadingScraped(false);
      return;
    }

    let isMounted = true;
    setIsLoadingScraped(true);
    setScrapedContent('');

    const fetchFullArticleText = async () => {
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(article.sourceUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(article.sourceUrl)}`
      ];

      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl);
          if (!response.ok) continue;
          const htmlText = await response.text();
          if (!htmlText) continue;

          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');

          doc.querySelectorAll('script, style, iframe, form, footer, header, nav, noscript, .comments, #comments, .comment, .footer, .header, .nav, .menu, .sidebar, .ads, .advertisement').forEach(el => el.remove());

          const bodySelectors = [
            'article',
            '.article-body',
            '.c-content-body',
            '.mc-body',
            '.entry-content',
            '.post-content',
            '.materia-conteudo',
            '.conteudo-materia',
            '.news-content',
            '.text-content',
            'main'
          ];

          let articleElement: Element | null = null;
          for (const sel of bodySelectors) {
            const found = doc.querySelector(sel);
            if (found && found.querySelectorAll('p').length >= 3) {
              articleElement = found;
              break;
            }
          }

          const containerToUse = articleElement || doc.body;
          const paragraphElements = Array.from(containerToUse.querySelectorAll('p'));

          const cleanParagraphs = paragraphElements
            .map(p => p.textContent?.trim() || '')
            .filter(text => {
              if (text.length < 35) return false;
              const lower = text.toLowerCase();
              if (lower.includes('cookie') || 
                  lower.includes('privacidade') || 
                  lower.includes('compartilhe') || 
                  lower.includes('inscreva-se') || 
                  lower.includes('newsletter') || 
                  lower.includes('receba as notícias') ||
                  lower.includes('todos os direitos') ||
                  lower.includes('proibida a reprodução') ||
                  lower.includes('leia mais:') ||
                  lower.includes('leia também:') ||
                  lower.startsWith('foto:') ||
                  lower.startsWith('imagem:')) {
                return false;
              }
              return true;
            });

          if (cleanParagraphs.length >= 2) {
            const joinedText = cleanParagraphs.join('\n\n');
            if (isMounted) {
              setScrapedContent(joinedText);
              setIsLoadingScraped(false);
              updateNews(article.id, { content: joinedText });
              return;
            }
          }
        } catch (e) {
          console.warn('Scraping error with proxy:', proxyUrl, e);
        }
      }

      if (isMounted) {
        setScrapedContent(article.content || article.summary || '');
        setIsLoadingScraped(false);
      }
    };

    fetchFullArticleText();

    return () => {
      isMounted = false;
    };
  }, [article]);

  if (!article) return null;

  const handleShare = async () => {
    const slug = article.slug || article.id;
    const shareUrl = `${window.location.origin}/noticias/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <Modal isOpen={!!article} onClose={onClose} title="Notícia • ALX AutoTech" maxWidth="max-w-4xl">
      <div className="space-y-6">
        
        {/* Cover Image */}
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#161616]">
          <img
            src={getMediaPreviewUrl(article.imageUrl)}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#888888] pb-4 border-b border-[#222222]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#ebbf01]" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {article.date}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading leading-tight">
          {article.title}
        </h2>

        {/* Full Content or VIP Lock Screen */}
        {isLocked ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-[#181824] to-[#101017] border border-[#ebbf01]/40 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#ebbf01] text-black flex items-center justify-center mx-auto shadow-xl shadow-[#ebbf01]/20">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#ebbf01] uppercase tracking-wider bg-black/60 px-3 py-1 rounded-full border border-white/10">
                <Crown className="w-3.5 h-3.5 fill-[#ebbf01]" />
                <span>Conteúdo Restrito • Área VIP</span>
              </div>
              <h3 className="text-xl font-black text-white font-heading">
                Esta matéria é exclusiva para Membros Oficiais
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {article.summary}
              </p>
              <p className="text-xs text-neutral-400">
                O conteúdo analítico e técnico completo deste artigo está disponível apenas para membros com login ativo na Área VIP ALX Garage.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openVipModal();
                }}
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs uppercase font-mono tracking-wider shadow-lg shadow-[#ebbf01]/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Crown className="w-4 h-4 fill-black" />
                <span>Entrar na Área VIP</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#1e1e28] hover:bg-[#282836] text-neutral-300 hover:text-white border border-white/10 font-bold text-xs font-mono transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : isLoadingScraped ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <Loader2 className="w-8 h-8 text-[#ebbf01] animate-spin" />
            <p className="text-sm text-neutral-400 font-medium">Buscando matéria completa diretamente de {article.author || 'fonte oficial'}...</p>
          </div>
        ) : (() => {
          const textToRender = scrapedContent || article.content || article.summary || 'Carregando conteúdo completo da matéria...';

          return (
            <div className="text-sm sm:text-base text-neutral-300 leading-relaxed space-y-4 pt-2">
              {textToRender.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-base sm:text-lg font-bold text-[#ebbf01] font-heading pt-2 pb-1">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                return (
                  <p key={idx} className="leading-relaxed whitespace-pre-line">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          );
        })()}

        {/* Actions Row: Smaller buttons aligned to the right */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2.5">
          <a
            href={article.sourceUrl || '#'}
            target={article.sourceUrl ? '_blank' : '_self'}
            rel={article.sourceUrl ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
              if (!article.sourceUrl || article.sourceUrl === '#') e.preventDefault();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181820] hover:bg-[#22222e] text-[#ebbf01] border border-[#ebbf01]/30 font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span>Fonte: {article.author || 'Quatro Rodas'}</span>
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs uppercase font-mono tracking-wider transition-all shadow-xs shadow-[#ebbf01]/20 cursor-pointer active:scale-95 shrink-0"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-950 font-black" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex justify-start">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181820] text-neutral-300 hover:text-white border border-white/10 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para notícias</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
