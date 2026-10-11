import React from 'react';
import { 
  Youtube, 
  Send, 
  Settings, 
  Instagram, 
  Mail,
  MessageSquare
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SocialIcon } from './common/SocialIcon';
import { getResolvedFooterIcons } from '../utils/footerIcons';

export const Footer: React.FC = () => {
  const { brand, openAdminTab, setActivePage, isSpotifyPlayerOpen, setIsSpotifyPlayerOpen } = useSiteData();

  const handleSpotifyClick = (e: React.MouseEvent) => {
    if (!e.metaKey && !e.ctrlKey && e.button === 0) {
      e.preventDefault();
      setIsSpotifyPlayerOpen(!isSpotifyPlayerOpen);
    }
  };

  const resolvedIcons = getResolvedFooterIcons(brand);

  return (
    <footer className="bg-[#050507] border-t border-white/[0.08] text-neutral-500 text-xs relative">
      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 py-6 space-y-5 text-center">
        
        {/* Main Footer Row: Redes Sociais & Utilidades na ordem personalizada */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {resolvedIcons
            .filter((item) => item.active)
            .map((item) => {
              if (item.id === 'youtube') {
                return (
                  <a
                    key="youtube"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#121217] border border-white/[0.06] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] flex items-center justify-center text-neutral-300 transition-colors"
                    aria-label="YouTube ALX"
                    title="YouTube ALX"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                );
              }

              if (item.id === 'telegram') {
                return (
                  <a
                    key="telegram"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#121217] border border-white/[0.06] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] flex items-center justify-center text-neutral-300 transition-colors"
                    aria-label="Telegram ALX"
                    title="Telegram ALX"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                );
              }

              if (item.id === 'instagram') {
                return (
                  <a
                    key="instagram"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#121217] border border-white/[0.06] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] flex items-center justify-center text-neutral-300 transition-colors"
                    aria-label="Instagram ALX"
                    title="Instagram ALX"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                );
              }

              if (item.id === 'spotify') {
                return (
                  <button
                    key="spotify"
                    type="button"
                    onClick={handleSpotifyClick}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer group ${
                      isSpotifyPlayerOpen 
                        ? 'bg-[#1DB954] text-black border-[#1DB954] shadow-lg shadow-[#1DB954]/20' 
                        : 'bg-[#121217] border-white/[0.08] hover:border-[#1DB954] text-neutral-300 hover:text-[#1DB954]'
                    }`}
                    aria-label="Tocar Playlist Spotify"
                    title="Tocar Playlist Spotify"
                  >
                    <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </button>
                );
              }

              if (item.id === 'email' || item.id === 'contato') {
                return (
                  <a
                    key="contato"
                    href="/contato"
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                        e.preventDefault();
                        setActivePage({ type: 'contato' });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="w-9 h-9 rounded-xl bg-[#121217] border border-white/[0.06] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] flex items-center justify-center text-neutral-300 transition-colors cursor-pointer"
                    aria-label="Fale Conosco & Contato"
                    title="Fale Conosco & Contato"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                );
              }

              if (item.id === 'admin') {
                return (
                  <button
                    key="admin"
                    type="button"
                    onClick={() => openAdminTab('brand')}
                    className="w-9 h-9 rounded-xl bg-[#121217] border border-white/[0.06] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] flex items-center justify-center text-neutral-300 transition-colors cursor-pointer group"
                    aria-label="Painel Administrativo"
                    title="Acessar Painel Administrativo"
                  >
                    <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  </button>
                );
              }

              // Custom links
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#121217] border border-white/[0.06] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] flex items-center justify-center text-neutral-300 transition-colors"
                  aria-label={item.title}
                  title={item.title}
                >
                  <SocialIcon platform={item.platform} className="w-4 h-4" />
                </a>
              );
            })}
        </div>

        {/* Linha Inferior de Copyright & Links Institucionais (Centralizada) */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-[11px] text-neutral-500 text-center">
          <p className="m-0 leading-none">© 2026 Alx⁺. Todos os direitos reservados.</p>
          
          <div className="flex items-center gap-4 text-neutral-500 font-normal">
            <a
              href="/sobre"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  setActivePage({ type: 'sobre' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Sobre
            </a>
            <a
              href="/termos"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  setActivePage({ type: 'termos' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Termos
            </a>
            <a
              href="/privacidade"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  setActivePage({ type: 'privacidade' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Privacidade
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
