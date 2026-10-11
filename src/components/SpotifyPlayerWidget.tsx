import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Shuffle, 
  Heart, 
  Disc3, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

export const SpotifyPlayerWidget: React.FC = () => {
  const { brand, isSpotifyPlayerOpen, setIsSpotifyPlayerOpen } = useSiteData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);

  const playlistUrl = brand?.links?.spotify || 'https://open.spotify.com/playlist/4fbVvzPirRvxWqkz8m9OTp?si=1f579b7208214433';

  // Helper to convert regular Spotify URL to embed URL
  const getEmbedUrl = (rawUrl: string): string => {
    try {
      let clean = rawUrl.trim();
      if (!clean) return 'https://open.spotify.com/embed/playlist/4fbVvzPirRvxWqkz8m9OTp?utm_source=generator&theme=0';
      
      let base = clean;
      const match = clean.match(/spotify\.com\/(playlist|track|album|artist|episode)\/([a-zA-Z0-9]+)/i);
      if (match) {
        const type = match[1];
        const id = match[2];
        base = `https://open.spotify.com/embed/${type}/${id}`;
      } else if (!clean.includes('/embed/')) {
        base = 'https://open.spotify.com/embed/playlist/4fbVvzPirRvxWqkz8m9OTp';
      }

      const params = new URLSearchParams();
      params.set('utm_source', 'generator');
      params.set('theme', '0');

      return `${base}?${params.toString()}`;
    } catch {
      return 'https://open.spotify.com/embed/playlist/4fbVvzPirRvxWqkz8m9OTp?utm_source=generator&theme=0';
    }
  };

  const embedUrl = getEmbedUrl(playlistUrl);
  const [showFullSongTip, setShowFullSongTip] = useState(false);

  // If player is closed completely, do not render
  if (!isSpotifyPlayerOpen) {
    return null;
  }

  return (
    <>
      {/* 1. Discrete Minimized Floating Icon Button (Compact Spotify Icon Only) */}
      {isMinimized && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in duration-200">
          <button
            onClick={() => setIsMinimized(false)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#121217] hover:bg-[#1c1c24] border border-[#1DB954] text-[#1DB954] shadow-lg backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
            aria-label="Abrir Player Spotify"
            title="Abrir Player Spotify"
          >
            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </button>
        </div>
      )}

      {/* 2. Floating Mini Player Widget Card (Always kept in DOM so audio NEVER stops when minimized) */}
      <div
        className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ${
          isMinimized
            ? 'opacity-0 pointer-events-none translate-y-8 scale-90 -z-50'
            : 'w-[92vw] sm:w-[380px] max-w-[420px] opacity-100 pointer-events-auto translate-y-0 scale-100'
        }`}
      >
        <div className="bg-[#0B0B10]/95 border border-white/[0.14] rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden p-3.5 space-y-3">
          
          {/* Widget Top Header Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Playlist Oficial</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 rounded-full">
                  Spotify
                </span>
              </div>
            </div>

            {/* Action Buttons: Expand, Minimize to Bubble, Close */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition-all cursor-pointer"
                title={isExpanded ? 'Modo Compacto' : 'Expandir Playlist Completa'}
                aria-label={isExpanded ? 'Modo Compacto' : 'Expandir Playlist'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-[#1DB954] transition-all cursor-pointer"
                title="Minimizar para bolinha flutuante"
                aria-label="Minimizar"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsSpotifyPlayerOpen(false);
                  setIsMinimized(false);
                }}
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-neutral-300 hover:text-red-400 transition-all cursor-pointer"
                title="Fechar Player"
                aria-label="Fechar Player"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Toolbar: Random (Aleatório), Seguir Playlist & Abrir no App */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 px-1 py-1 border-y border-white/[0.06] text-xs">
            {/* Random Toggle Button */}
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                isShuffle 
                  ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] font-bold shadow-xs' 
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:text-white hover:border-white/[0.16]'
              }`}
              title="Modo aleatório"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffle ? 'text-[#1DB954]' : 'text-neutral-400'}`} />
              <span>{isShuffle ? 'Aleatório' : 'Ordem normal'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              {/* Follow Playlist Button */}
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsFollowed(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  isFollowed
                    ? 'bg-[#1DB954] text-black border-[#1DB954]'
                    : 'bg-[#1DB954]/15 hover:bg-[#1DB954] text-[#1DB954] hover:text-black border-[#1DB954]/40 hover:border-[#1DB954]'
                }`}
                title="Salvar esta playlist na sua biblioteca do Spotify"
              >
                <Heart className={`w-3.5 h-3.5 ${isFollowed ? 'fill-black' : 'fill-current'}`} />
                <span>{isFollowed ? 'Salva' : 'Salvar'}</span>
              </a>

              {/* Open in Spotify App / Web for 100% Full Song Playback */}
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#1DB954] text-neutral-200 hover:text-black border border-white/[0.1] hover:border-[#1DB954] text-[11px] font-bold transition-all cursor-pointer"
                title="Abrir no Spotify Oficial"
              >
                <span>Ouvir Completa</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>



          {/* Spotify Official Embed Frame */}
          <div className="rounded-2xl overflow-hidden bg-black/60 border border-white/[0.08] transition-all duration-300">
            <iframe
              key={embedUrl}
              title="Spotify Web Player ALX"
              src={embedUrl}
              width="100%"
              height={isExpanded ? '352' : '152'}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="w-full rounded-2xl block transition-all duration-300"
            />
          </div>

        </div>
      </div>
    </>
  );
};
