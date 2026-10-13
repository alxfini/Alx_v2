import React, { useState, useEffect, useRef } from 'react';
import { Download, ShieldCheck, CheckCircle2, AlertCircle, X, ExternalLink, Copy, Check, Sparkles, HardDrive, RefreshCw, Lock, Crown } from 'lucide-react';
import { DownloadItem } from '../../types';
import { useSiteData } from '../../context/SiteDataContext';
import { isItemVip } from '../../utils/vip';

interface DownloadGatewayModalProps {
  item: DownloadItem | null;
  onClose: () => void;
  onOpenVipModal?: () => void;
}

export const DownloadGatewayModal: React.FC<DownloadGatewayModalProps> = ({ item, onClose, onOpenVipModal }) => {
  const { registerDownload, isVipLoggedIn, isAdminAuthenticated, setActivePage } = useSiteData();
  const [countdown, setCountdown] = useState<number>(4);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const hasRegisteredRef = useRef<boolean>(false);

  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const isVipRestricted = isItemVip(item);
  const isLocked = isVipRestricted && !isUserAuthenticated;

  useEffect(() => {
    if (!item || isLocked) {
      setCountdown(4);
      setIsDownloading(false);
      setDownloadStarted(false);
      setCopiedLink(false);
      setSessionToken('');
      hasRegisteredRef.current = false;
      return;
    }

    // Generate unique temporary session token for this download
    const randToken = `ALX-SEC-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    setSessionToken(randToken);
    setCountdown(4);
    setIsDownloading(false);
    setDownloadStarted(false);
    hasRegisteredRef.current = false;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerRealDownload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [item, isLocked]);

  if (!item) return null;

  const triggerRealDownload = () => {
    if (isLocked) return;
    setIsDownloading(true);
    setDownloadStarted(true);

    if (item && item.id && !hasRegisteredRef.current) {
      hasRegisteredRef.current = true;
      registerDownload(item.id, item.category);
    }

    const rawUrl = item.rawDownloadUrl || '';
    if (rawUrl) {
      // Create a temporary hidden anchor to trigger download safely without showing raw url in status bar
      const link = document.createElement('a');
      link.href = rawUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      // If it is an APK or Wallpaper, suggest filename for direct downloads
      if (item.category === 'app') {
        if (!rawUrl.includes('github.com')) {
          link.download = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.apk`;
        }
      } else if (item.category === 'wallpaper') {
        const isVideo = item.rawDownloadUrl?.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i) || item.fileSize?.toLowerCase().includes('vídeo');
        // Para links do GitHub Releases, o header Content-Disposition cuida do nome e extensão originais
        if (!rawUrl.includes('github.com')) {
          link.download = isVideo ? `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp4` : `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
        }
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const handleCopyShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let shareUrl = `${origin}/ota`;
    if (item.category === 'ota') {
      shareUrl = `${origin}/ota/${item.slug || item.id}`;
    } else if (item.category === 'app') {
      shareUrl = `${origin}/apps/${item.slug || item.id}`;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0F0F14] border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-32 bg-[#ebbf01]/10 blur-[80px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ebbf01]/10 border border-[#ebbf01]/30 flex items-center justify-center text-[#ebbf01] shrink-0">
              <Download className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#ebbf01] bg-[#ebbf01]/10 px-2.5 py-0.5 rounded-md border border-[#ebbf01]/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Download Seguro ALX</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white font-heading mt-1">
                {item.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Details Matrix */}
        {item.category !== 'wallpaper' && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#16161D] p-3 rounded-2xl border border-white/[0.06] relative z-10 font-mono">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-400 font-sans block uppercase">Versão</span>
              <span className="text-white font-bold">{item.version || 'Última'}</span>
            </div>
            <div className="space-y-0.5 border-x border-white/[0.08]">
              <span className="text-[10px] text-neutral-400 font-sans block uppercase">Tipo</span>
              <span className="text-[#ebbf01] font-bold uppercase">{item.category === 'app' ? 'APK Android' : 'Firmware OTA'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-400 font-sans block uppercase">Acesso</span>
              <span className={isLocked ? "text-amber-400 font-bold flex items-center justify-center gap-1" : "text-emerald-400 font-bold flex items-center justify-center gap-1"}>
                {isLocked ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                <span>{isLocked ? 'Restrito VIP' : 'Verificado'}</span>
              </span>
            </div>
          </div>
        )}

        {/* Temporary Token / Lock Alert */}
        {isLocked ? (
          <div className="bg-gradient-to-b from-[#1C1620] to-[#110D15] border border-amber-500/40 rounded-2xl p-5 text-center space-y-4 relative z-10 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-black/60 px-3 py-0.5 rounded-full border border-amber-500/30">
                <Crown className="w-3 h-3 fill-amber-400" />
                <span>Download Exclusivo VIP</span>
              </div>
              <h4 className="text-base font-black text-white font-heading">
                Conecte-se para Baixar
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Este arquivo é exclusivo para membros do <strong>Portal Alx⁺ VIP</strong>. Por favor, faça login em sua conta para liberar o download do APK.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenVipModal) onOpenVipModal();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                <Crown className="w-4 h-4 fill-black" />
                <span>ENTRAR NA CONTA VIP</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  setActivePage({ type: 'vip' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-3 px-4 rounded-xl bg-[#1D1D28] hover:bg-[#252535] text-neutral-200 border border-white/10 font-bold text-xs uppercase transition-all cursor-pointer"
              >
                <span>ASSINAR VIP</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Temporary Token Status Badge */}
            {sessionToken && (
              <div className="bg-[#121218] border border-white/[0.08] p-2.5 rounded-xl flex items-center justify-between text-[10px] font-mono text-neutral-400 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SESSÃO DE DOWNLOAD SEGURA:</span>
                  <strong className="text-[#ebbf01] font-bold">{sessionToken}</strong>
                </div>
                <span className="text-emerald-400 font-bold uppercase">Token Temporário Ativo</span>
              </div>
            )}

            {/* Countdown / Download Action */}
            <div className="bg-gradient-to-b from-[#14141A] to-[#0A0A0D] border border-[#ebbf01]/30 rounded-2xl p-4 text-center space-y-3 relative z-10">
              {countdown > 0 && !downloadStarted ? (
                <div className="space-y-3 py-1">
                  <span className="text-xs text-neutral-300 font-medium block">
                    Preparando link seguro do arquivo... Liberação em:
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#ebbf01] font-mono tracking-tight animate-pulse">
                      {countdown}
                    </span>
                    <span className="text-lg font-bold text-neutral-400 font-mono">segundos</span>
                  </div>

                  {/* Barra de progresso de 4 segundos */}
                  <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden border border-white/[0.08]">
                    <div
                      className="bg-[#ebbf01] h-full transition-all duration-1000 ease-linear rounded-full shadow-[0_0_12px_rgba(235,191,1,0.5)]"
                      style={{ width: `${((4 - countdown) / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-1">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    <span>Link liberado com sucesso!</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    O download seguro foi disparado para o seu navegador.
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={triggerRealDownload}
                  disabled={countdown > 0 && !downloadStarted}
                  className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                    countdown > 0 && !downloadStarted
                      ? 'bg-neutral-800 text-neutral-400 border border-white/10 cursor-not-allowed opacity-80'
                      : 'bg-[#ebbf01] hover:bg-[#f5cc14] text-black shadow-[#ebbf01]/20 cursor-pointer active:scale-98'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloadStarted
                      ? 'Baixar Novamente'
                      : countdown > 0
                      ? `Aguarde a liberação (${countdown}s)`
                      : 'Iniciar Download Agora'}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Share Link Protection Reminder */}
        <div className="flex items-center justify-between gap-3 pt-2 text-xs text-neutral-400 border-t border-white/[0.06] relative z-10">
          <span className="text-[11px]">Compartilhe o portal oficial para novas versões:</span>
          <button
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181822] hover:bg-[#20202E] text-white border border-white/[0.08] text-[11px] font-bold transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#ebbf01]" />}
            <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
