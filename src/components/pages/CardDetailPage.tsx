import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  ShoppingBag, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  Cpu, 
  Layers, 
  Smartphone, 
  ChevronRight,
  ExternalLink,
  Check,
  Star,
  Zap,
  Eye,
  Info,
  X,
  Loader2,
  Lock,
  Crown
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { ALXApp, NewsArticle, ProductItem } from '../../types';
import { newsArticles as defaultNewsArticles } from '../../data/news';
import { getPageThemeHex } from '../../utils/pageColors';
import { getMediaPreviewUrl } from '../../utils/mediaUrl';
import { isItemVip } from '../../utils/vip';
import { doesLinkGrantDirectAccess } from '../../utils/visibility';

interface CardDetailPageProps {
  type: 'app' | 'news' | 'product';
  idOrSlug: string;
  onOpenVipModal?: () => void;
}

export const CardDetailPage: React.FC<CardDetailPageProps> = ({ 
  type, 
  idOrSlug,
  onOpenVipModal 
}) => {
  const { apps, news, products, customColors, setActivePage, openAdminTab, openDownloadGateway, updateNews, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [scrapedContent, setScrapedContent] = useState<string>('');
  const [isLoadingScraped, setIsLoadingScraped] = useState<boolean>(false);

  useEffect(() => {
    if (type !== 'app') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [type, idOrSlug]);

  useEffect(() => {
    if (type !== 'news' || !idOrSlug) {
      setScrapedContent('');
      setIsLoadingScraped(false);
      return;
    }

    const targetSlug = decodeURIComponent(idOrSlug).toLowerCase();
    const article: NewsArticle | undefined = news.find(
      (n) => n.slug === idOrSlug || n.id === idOrSlug ||
             n.id.toLowerCase() === targetSlug ||
             (n.slug && n.slug.toLowerCase() === targetSlug)
    ) || news[0];

    if (!article) return;

    if (isItemVip(article) && !isUserAuthenticated) {
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
  }, [type, idOrSlug, news]);

  const handleShare = async () => {
    let cleanPath = '';
    let itemTitle = 'Alx⁺';
    if (type === 'news') {
      cleanPath = `/noticias/${idOrSlug}`;
      const found = news.find(n => n.slug === idOrSlug || n.id === idOrSlug);
      if (found) itemTitle = found.title;
    } else if (type === 'app') {
      cleanPath = `/apps/${idOrSlug}`;
      const found = apps.find(a => a.slug === idOrSlug || a.id === idOrSlug);
      if (found) itemTitle = found.name;
    } else if (type === 'product') {
      cleanPath = `/produtos/${idOrSlug}`;
      const found = products.find(p => p.slug === idOrSlug || p.id === idOrSlug);
      if (found) itemTitle = found.name;
    }

    const shareUrl = `${window.location.origin}${cleanPath}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: itemTitle,
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

  const handleDownloadApp = (app: ALXApp) => {
    const isVIP = isItemVip(app);
    const allowsLink = doesLinkGrantDirectAccess(app);
    if (!allowsLink && isVIP && !isUserAuthenticated) {
      if (onOpenVipModal) onOpenVipModal();
      return;
    }
    openDownloadGateway({
      id: app.id,
      title: app.name,
      category: 'app',
      version: app.version,
      rawDownloadUrl: app.downloadUrl || 'https://drive.google.com',
      applicableCars: app.compatibility?.join(', '),
      slug: app.slug,
      isMembersOnly: isVIP,
      isVipExclusive: isVIP,
    });
  };

  // 1. APP DETAIL OVERLAY MODAL CARD
  if (type === 'app') {
    const targetSlug = decodeURIComponent(idOrSlug).toLowerCase();
    const app: ALXApp | undefined = apps.find(
      (a) => a.slug === idOrSlug || a.id === idOrSlug ||
             a.id.toLowerCase() === targetSlug ||
             (a.slug && a.slug.toLowerCase() === targetSlug)
    );

    if (!app) {
      return (
        <div className="bg-[#070709] text-white pt-24 pb-16 px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold font-heading">Aplicativo não encontrado</h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            O aplicativo solicitado não está disponível ou o link está incorreto.
          </p>
          <button
            onClick={() => setActivePage({ type: 'apps' })}
            className="px-6 py-2.5 bg-[#ebbf01] text-black font-extrabold rounded-xl text-sm cursor-pointer"
          >
            Ver Todos os Aplicativos
          </button>
        </div>
      );
    }

    const appThemeColor = getPageThemeHex('apps', customColors);

    return (
      <div className="bg-[#070709] text-white pt-[72px] sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* Hero Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Col: Main Single Image (Com a mesma altura exata do card ao lado) */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <div className="relative w-full h-full flex-1 min-h-[280px] rounded-3xl overflow-hidden bg-[#121217] border border-white/[0.08] hover:border-white/20 shadow-2xl group transition-all duration-300">
                <img
                  src={getMediaPreviewUrl(app.coverImage)}
                  alt={app.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/30 pointer-events-none" />
              </div>
            </div>

            {/* Right Col: App Info & Main Action (Com fundo degradê do card igual aos outros) */}
            <div className="lg:col-span-5 bg-[#111116] border border-white/[0.08] hover:border-white/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl transition-all duration-300 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
                    {app.name}
                  </h1>
                  {isItemVip(app) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#ebbf01] text-black font-mono uppercase shadow-md">
                      <Crown className="w-3 h-3 fill-black" />
                      <span>Membros VIP</span>
                    </span>
                  )}
                  {/* Bolinha vermelha piscando indicando novo / atualizado */}
                  {(app.isUpdated || app.isNew) && (
                    <span className="flex items-center shrink-0" title="Aplicativo Atualizado / Novo">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-xs shadow-red-500/80" />
                    </span>
                  )}
                </div>
              </div>

              {/* Price / Status Row */}
              <div className="p-4 rounded-2xl bg-[#141419] border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Status da Licença</div>
                  <div className="text-xl font-black text-[#ebbf01] font-mono">
                    {isItemVip(app) ? 'VIP Membros' : app.isFree ? 'Gratuito / APK' : app.priceText}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-neutral-400 font-mono">Versão</div>
                  <div className="text-xs font-mono text-white/90 font-normal">{app.version}</div>
                </div>
              </div>

              {/* Main Action Button */}
              <div>
                {!doesLinkGrantDirectAccess(app) && isItemVip(app) && !isUserAuthenticated ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-[#ebbf01]/30 flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-[#ebbf01] shrink-0" />
                      <p className="text-[11px] text-neutral-300 leading-tight">
                        Este aplicativo é restrito para membros. Faça login na Área VIP para liberar o download do APK.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (onOpenVipModal) onOpenVipModal();
                        else openVipModal();
                      }}
                      className="w-full py-4 rounded-2xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-xl shadow-[#ebbf01]/20 flex items-center justify-center gap-2 tracking-wide cursor-pointer active:scale-95"
                    >
                      <Crown className="w-4 h-4 fill-black" />
                      <span>Acessar via Área de Membros VIP</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownloadApp(app)}
                    className="w-full py-4 rounded-2xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-xl shadow-[#ebbf01]/20 flex items-center justify-center gap-2 tracking-wide cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Baixar Aplicativo / APK Seguro</span>
                  </button>
                )}
              </div>

              {/* Security info */}
              <div className="flex items-center gap-2.5 text-[11px] text-neutral-400 pt-2 border-t border-white/[0.04]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Aplicativo verificado e assinado digitalmente contra vírus ou malwares.</span>
              </div>
            </div>
          </div>

          {/* About App Section - Accent bar line in page color */}
          <div
            className="bg-[#111116] rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl relative overflow-hidden transition-all duration-300"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: `${appThemeColor}66`
            }}
          >
            {/* Subtle top accent bar in page color */}
            <div
              className="absolute top-0 left-0 right-0 h-1 opacity-90"
              style={{
                background: `linear-gradient(90deg, transparent, ${appThemeColor}, transparent)`
              }}
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" style={{ color: appThemeColor }} />
                <h3
                  className="text-xs sm:text-sm font-extrabold font-heading tracking-wider uppercase"
                  style={{ color: appThemeColor }}
                >
                  Sobre o Aplicativo
                </h3>
              </div>

              {/* Ícone de Compartilhar dentro do Sobre */}
              <button
                onClick={handleShare}
                title={copiedLink ? "Link Copiado!" : "Compartilhar Aplicativo"}
                className="p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${appThemeColor}1a`,
                  borderColor: `${appThemeColor}4d`,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: appThemeColor
                }}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400 font-bold" /> : <Share2 className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-normal">
              {app.fullDescription || app.description}
            </p>
          </div>

        </div>
      </div>
    );
  }

  // 2. NEWS ARTICLE DETAIL PAGE
  if (type === 'news') {
    const targetSlug = decodeURIComponent(idOrSlug).toLowerCase();
    const article: NewsArticle | undefined = news.find(
      (n) => n.slug === idOrSlug || n.id === idOrSlug ||
             n.id.toLowerCase() === targetSlug ||
             (n.slug && n.slug.toLowerCase() === targetSlug)
    );

    if (!article) {
      return (
        <div className="bg-[#070709] text-white pt-24 pb-16 px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold font-heading">Matéria não encontrada</h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            A matéria solicitada não existe, foi removida ou o link está incorreto.
          </p>
          <button
            onClick={() => setActivePage({ type: 'noticias' })}
            className="px-6 py-2.5 bg-[#ebbf01] text-black font-extrabold rounded-xl text-sm cursor-pointer"
          >
            Ver Todas as Notícias
          </button>
        </div>
      );
    }

    const isArticleVIP = isItemVip(article);
    const isArticleLocked = isArticleVIP && !isUserAuthenticated;
    const relatedNews = news.filter((n) => n.id !== article.id).slice(0, 3);

    return (
      <div className="bg-[#070709] text-white pt-[72px] sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto space-y-8 animate-in fade-in duration-300">

          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#ebbf01] bg-[#ebbf01]/10 px-3 py-1 rounded-lg border border-[#ebbf01]/20">
                <Tag className="w-3 h-3" />
                <span>{article.category}</span>
              </div>
              {isArticleVIP && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#ebbf01] text-black shadow-sm">
                  <Crown className="w-3.5 h-3.5 fill-black" />
                  <span>{isUserAuthenticated ? 'Acesso Membro VIP' : 'Exclusivo para Membros'}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight font-heading">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#ebbf01]" />
                {article.date}
              </span>
              <span>•</span>
              <span className="bg-[#181820] text-neutral-300 px-2.5 py-1 rounded-md border border-white/[0.08] font-bold">
                Fonte: {article.author}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-[#121217] border border-white/[0.08] shadow-2xl">
            <img
              src={getMediaPreviewUrl(article.imageUrl)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content or VIP Lock Screen */}
          {isArticleLocked ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#181824] to-[#101017] border border-[#ebbf01]/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-[#ebbf01] text-black flex items-center justify-center mx-auto shadow-xl shadow-[#ebbf01]/20">
                <Lock className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#ebbf01] uppercase tracking-wider bg-black/60 px-3 py-1 rounded-full border border-white/10">
                  <Crown className="w-3.5 h-3.5 fill-[#ebbf01]" />
                  <span>Conteúdo Restrito • Área VIP</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                  Este artigo é exclusivo para Membros Oficiais
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {article.summary}
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  As análises completas, investigações e relatórios técnicos desta matéria estão disponíveis apenas para usuários autenticados da Área VIP ALX Garage.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenVipModal) onOpenVipModal();
                    else openVipModal();
                  }}
                  className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs uppercase font-mono tracking-wider shadow-lg shadow-[#ebbf01]/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Crown className="w-4 h-4 fill-black" />
                  <span>Entrar na Área VIP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage({ type: 'noticias' })}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-[#1e1e28] hover:bg-[#282836] text-neutral-300 hover:text-white border border-white/10 font-bold text-xs font-mono transition-all cursor-pointer"
                >
                  Voltar para Notícias
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F0F13] border border-white/[0.08] rounded-3xl p-6 sm:p-10 space-y-6 leading-relaxed text-sm sm:text-base text-neutral-300">
              {/* Full Article Content */}
              {isLoadingScraped ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <Loader2 className="w-8 h-8 text-[#ebbf01] animate-spin" />
                  <p className="text-sm text-neutral-400 font-medium">Buscando matéria completa diretamente de {article.author || 'fonte oficial'}...</p>
                </div>
              ) : (() => {
                const textToRender = scrapedContent || article.content || article.summary || 'Carregando conteúdo completo da matéria...';

                return (
                  <div className="space-y-4 pt-2 text-neutral-300 text-sm sm:text-base leading-relaxed">
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
            </div>
          )}

          {/* Related Articles */}
          {relatedNews.length > 0 && (
            <div className="pt-10 border-t border-white/[0.06] space-y-6">
              <h3 className="text-xl font-bold text-white font-heading">
                Outras Notícias Recentes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedNews.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => setActivePage({ type: 'news', idOrSlug: rel.slug || rel.id })}
                    className="group bg-[#0F0F13] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
                  >
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[#16161D] mb-3">
                      <img src={getMediaPreviewUrl(rel.imageUrl)} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 mb-1">{rel.date}</div>
                    <h4 className="text-xs sm:text-sm font-bold text-white font-heading line-clamp-2 leading-snug">{rel.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // 3. PRODUCT DETAIL PAGE
  if (type === 'product') {
    const product: ProductItem | undefined = products.find(
      (p) => p.slug === idOrSlug || p.id === idOrSlug
    );

    if (product?.buyUrl) {
      window.location.replace(product.buyUrl);
      return null;
    }

    setActivePage({ type: 'shop' });
    return null;
  }

  return null;
};
