import React from 'react';
import { 
  Tv, 
  Download, 
  ExternalLink, 
  BookOpen, 
  Smartphone, 
  PlayCircle, 
  Zap, 
  Send,
  Globe,
  ArrowRight,
  Crown,
  Lock
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { getMediaPreviewUrl } from '../utils/mediaUrl';
import { isItemVip } from '../utils/vip';

interface IptvSectionProps {
  isStandalone?: boolean;
}

interface UsefulLink {
  id: string;
  title: string;
  description: string;
  url: string;
  badge?: string;
  icon: 'globe' | 'play' | 'zap' | 'send' | 'help';
  isExternal?: boolean;
}

export const IptvSection: React.FC<IptvSectionProps> = ({ isStandalone = false }) => {
  const { apps: storeApps, iptvConfig, setActivePage, openDownloadGateway, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;

  // Apps selecionados na Loja Principal de Aplicativos para a página de IPTV
  const mainIptvApps = (storeApps || []).filter(
    (app) => app.showInIptv || app.category?.toLowerCase().includes('iptv')
  );

  // Compatibilidade com apps cadastrados exclusivamente na guia de IPTV
  const legacyApps = (iptvConfig?.apps || []).filter(
    (legacy) => !mainIptvApps.some((m) => m.id === legacy.id || m.name.toLowerCase() === legacy.name.toLowerCase())
  );

  const appsList = mainIptvApps.length > 0 ? [...mainIptvApps, ...legacyApps] : (iptvConfig?.apps || []);
  const linksList = iptvConfig?.links || [];

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

  const youtubeEmbedUrl = getYouTubeEmbedUrl(iptvConfig?.youtubeUrl || 'https://www.youtube.com/watch?v=5qap5aO4i9A');

  const handleOpenApp = (app: any) => {
    setActivePage({ type: 'app', idOrSlug: app.slug || app.id || app.name });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderLinkIcon = (icon: UsefulLink['icon']) => {
    switch (icon) {
      case 'globe':
        return <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />;
      case 'zap':
        return <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />;
      case 'play':
        return <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />;
      case 'send':
        return <Send className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />;
      default:
        return <Tv className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />;
    }
  };

  return (
    <section id="iptv" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative`}>
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ebbf01]/4 blur-[160px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-10">
        
        {/* Page Header Banner */}
        <div className="bg-[#111116] border border-white/[0.08] p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center sm:text-left space-y-4">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#ebbf01]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#ebbf01]/10 border border-[#ebbf01]/30 text-[#ebbf01] mx-auto sm:mx-0">
            <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-[#ebbf01] shrink-0" />
            <h1 className="text-sm sm:text-base md:text-lg font-mono font-extrabold uppercase tracking-wider">
              {iptvConfig?.title || 'Sistema IPTV para seu veiculo, celular, sua casa!!!'}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
            {iptvConfig?.summary || 'Aprenda a configurar transmissão de TV ao vivo, esportes e canais na sua central multimídia automotiva, celular e smart TV.'}
          </p>
        </div>

        {/* Written Tutorial Guide Box */}
        <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
            <div className="p-2.5 rounded-xl bg-[#ebbf01]/10 border border-[#ebbf01]/20 text-[#ebbf01]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Guia & Tutorial</h2>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 space-y-3 leading-relaxed">
            {iptvConfig?.guideContent ? (
              iptvConfig.guideContent.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-base sm:text-lg font-bold text-[#ebbf01] pt-2">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('#### ')) {
                  return (
                    <h4 key={idx} className="text-sm sm:text-base font-bold text-white pt-1">
                      {paragraph.replace('#### ', '')}
                    </h4>
                  );
                }
                return (
                  <div key={idx} className="bg-[#16161D] border border-white/[0.06] p-4 rounded-2xl whitespace-pre-line">
                    {paragraph}
                  </div>
                );
              })
            ) : (
              <p>Confira os passos e aplicativos abaixo para começar.</p>
            )}
          </div>

          {/* YouTube Video Player Embed - Posicionado ABAIXO do texto */}
          {youtubeEmbedUrl && (
            <div className="pt-2">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-black">
                <iframe
                  src={youtubeEmbedUrl}
                  title="Vídeo Tutorial IPTV"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; webshare"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* Section: Recommended Applications */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div>
              <h2 className="text-xl font-extrabold text-white font-heading flex items-center justify-center sm:justify-start gap-2">
                <Smartphone className="w-5 h-5 text-[#ebbf01]" />
                <span>Aplicativos</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appsList.map((app: any) => {
              const coverImage = app.coverImage || app.iconUrl;
              const isAppVIP = isItemVip(app);
              return (
                <div 
                  key={app.id || app.name} 
                  onClick={() => handleOpenApp(app)}
                  className="group bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Preview Image Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#16161D]">
                      {coverImage ? (
                        <img
                          src={getMediaPreviewUrl(coverImage)}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/imagens/apps/byd-cockpit.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#181822] text-[#ebbf01]">
                          <Tv className="w-12 h-12" />
                        </div>
                      )}
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

                      {app.badge && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-[10px] font-mono text-neutral-300 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                          <span className="text-[#ebbf01] font-bold uppercase">{app.badge}</span>
                        </div>
                      )}
                    </div>

                    {/* App Details */}
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
                        {app.fullDescription || app.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenApp(app);
                      }}
                      className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                    >
                      {isAppVIP && !isUserAuthenticated ? (
                        <span className="flex items-center gap-1.5 text-black whitespace-nowrap truncate font-mono font-black">
                          <Lock className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                          <span className="truncate">ÁREA DE MEMBROS</span>
                        </span>
                      ) : (
                        <span>DOWNLOAD</span>
                      )}
                      <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Useful Links & Direct Access Section */}
        <div className="space-y-6 pt-4">
          <div>
            <h2 className="text-xl font-extrabold text-white font-heading flex items-center justify-center sm:justify-start gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400">Links</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linksList.map((link) => (
              <div 
                key={link.id}
                className="group bg-[#0d131f] border border-cyan-500/35 hover:border-cyan-400/90 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Ambient Glow background */}
                <div className="absolute -right-12 -top-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* Top Row: Badge only */}
                  {link.badge && (
                    <div className="flex items-center justify-end">
                      <span className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
                        {link.badge}
                      </span>
                    </div>
                  )}

                  {/* Title & Description */}
                  <div className="space-y-2 text-left">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading group-hover:text-cyan-300 transition-colors">
                      {link.title}
                    </h3>
                    {link.description && (
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Big Prominent Action Button */}
                <div className="pt-5 relative z-10">
                  <a
                    href={link.url}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 group/btn cursor-pointer"
                  >
                    <span>Acessar Link</span>
                    <ExternalLink className="w-4 h-4 text-black stroke-[2.5] group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
