import React, { useState, useEffect, useRef } from 'react';
import { Download, ShieldCheck, CheckCircle2, X, Copy, Check, Lock, Crown, Youtube } from 'lucide-react';
import { DownloadItem } from '../../types';
import { useSiteData } from '../../context/SiteDataContext';
import { isItemVip } from '../../utils/vip';
import { getMediaDownloadUrl } from '../../utils/mediaUrl';

interface DownloadGatewayModalProps {
  item: DownloadItem | null;
  onClose: () => void;
  onOpenVipModal?: () => void;
}

export const DownloadGatewayModal: React.FC<DownloadGatewayModalProps> = ({ item, onClose, onOpenVipModal }) => {
  const { registerDownload, isVipLoggedIn, isAdminAuthenticated, setActivePage } = useSiteData();
  
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const isVipRestricted = isItemVip(item);
  const isLocked = isVipRestricted && !isUserAuthenticated;

  const [subStep, setSubStep] = useState<'step1' | 'step2' | 'step3'>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (isUserAuthenticated || localStorage.getItem('alx_youtube_unlocked') === 'true') {
          return 'step3';
        }
      } catch (e) {
        return 'step1';
      }
    }
    return 'step1';
  });

  const [countdown, setCountdown] = useState<number>(10);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>('');

  const timerStartTimeRef = useRef<number | null>(null);
  const hasRegisteredRef = useRef<boolean>(false);

  // Inicializa a sessão segura e o token temporário
  useEffect(() => {
    if (!item || isLocked) {
      setCountdown(10);
      setProgressPercent(0);
      setIsDownloading(false);
      setDownloadStarted(false);
      setCopiedLink(false);
      setSessionToken('');
      hasRegisteredRef.current = false;
      return;
    }

    const randToken = `ALX-SEC-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    setSessionToken(randToken);
    hasRegisteredRef.current = false;
    setDownloadStarted(false);

    // Se usuário já for VIP/Admin ou já estiver desbloqueado
    if (isUserAuthenticated || (typeof window !== 'undefined' && localStorage.getItem('alx_youtube_unlocked') === 'true')) {
      setSubStep('step3');
    } else {
      setSubStep('step1');
      setCountdown(10);
      setProgressPercent(0);
    }
  }, [item, isLocked, isUserAuthenticated]);

  // Temporizador de 10 segundos da verificação do YouTube (Passo 2)
  // Ao término, NÃO inicia download automaticamente: apenas libera o botão para o usuário clicar
  useEffect(() => {
    if (subStep !== 'step2') return;

    if (!timerStartTimeRef.current) {
      timerStartTimeRef.current = Date.now();
    }

    const checkTimer = () => {
      const elapsedMs = Date.now() - (timerStartTimeRef.current || Date.now());
      const elapsedSec = elapsedMs / 1000;
      const remainingSec = Math.max(0, 10 - Math.floor(elapsedSec));
      const pct = Math.min(100, (elapsedSec / 10) * 100);

      setCountdown(remainingSec);
      setProgressPercent(pct);

      if (elapsedSec >= 10) {
        setSubStep('step3');
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('alx_youtube_unlocked', 'true');
          } catch (e) {
            console.warn('LocalStorage error:', e);
          }
        }
        // NÃO dispara download automaticamente! Usuário deve clicar no botão.
      }
    };

    const interval = setInterval(checkTimer, 100);

    const handleWindowFocus = () => {
      checkTimer();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [subStep]);

  if (!item) return null;

  // Dispara o download seguro quando o usuário clica no botão
  const triggerRealDownload = async () => {
    if (isLocked || isDownloading) return;
    setIsDownloading(true);
    setDownloadStarted(true);

    if (item && item.id && !hasRegisteredRef.current) {
      hasRegisteredRef.current = true;
      registerDownload(item.id, item.category);
    }

    const rawUrl = item.rawDownloadUrl || '';
    if (!rawUrl) {
      setIsDownloading(false);
      return;
    }

    const isVideo = Boolean(
      rawUrl.match(/\.(mp4|webm|mov|mkv|avi)(\?.*)?$/i) || 
      item.fileSize?.toLowerCase().includes('vídeo') ||
      item.fileSize?.toLowerCase().includes('video')
    );

    const isApk = item.category === 'app' || rawUrl.toLowerCase().endsWith('.apk');
    const defaultExt = isApk ? 'apk' : item.category === 'wallpaper' ? (isVideo ? 'mp4' : 'jpg') : 'bin';
    
    let cleanBaseName = (item.title || 'download').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    if (!cleanBaseName.endsWith(`.${defaultExt}`)) {
      cleanBaseName = `${cleanBaseName}.${defaultExt}`;
    }

    // Passa a URL pelo proxy seguro para evitar 404 em repositórios privados do GitHub
    const finalDownloadUrl = getMediaDownloadUrl(rawUrl, cleanBaseName);

    let handledViaBlob = false;
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(finalDownloadUrl, { method: 'GET' });
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = cleanBaseName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);
          handledViaBlob = true;
        }
      } catch (fetchErr) {
        console.warn('Download direto via Blob falhou, utilizando clique de âncora:', fetchErr);
      }
    }

    if (!handledViaBlob) {
      const link = document.createElement('a');
      link.href = finalDownloadUrl;
      link.download = cleanBaseName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const handleStartSubscriptionStep = () => {
    try {
      window.open('https://www.youtube.com/@alx-garage?sub_confirmation=1', '_blank');
    } catch (e) {
      console.warn('Erro ao abrir nova aba do YouTube:', e);
    }
    timerStartTimeRef.current = Date.now();
    setCountdown(10);
    setProgressPercent(0);
    setSubStep('step2');
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

  const versionText = item.version 
    ? (item.version.toLowerCase().startsWith('v') ? item.version : `v ${item.version}`)
    : 'v 1.0.0';

  const typeText = item.category === 'app' 
    ? 'APK ANDROID' 
    : item.category === 'ota' 
    ? 'FIRMWARE OTA' 
    : 'ARQUIVO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0F0F14] border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />

        {/* Header - Conforme Imagem Oficial */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            {/* Ícone de Download Verde com Borda */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <Download className="w-6 h-6 stroke-[2]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/25">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>DOWNLOAD SEGURO ALX</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white font-heading mt-1">
                {item.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matriz de Detalhes do Arquivo (VERSÃO | TIPO | ACESSO) */}
        {item.category !== 'wallpaper' && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#16161D] p-3.5 rounded-2xl border border-white/[0.06] relative z-10 font-mono">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-400 font-sans block uppercase font-medium">VERSÃO</span>
              <span className="text-white font-bold">{versionText}</span>
            </div>
            <div className="space-y-0.5 border-x border-white/[0.08]">
              <span className="text-[10px] text-neutral-400 font-sans block uppercase font-medium">TIPO</span>
              <span className="text-emerald-400 font-bold uppercase">{typeText}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-400 font-sans block uppercase font-medium">ACESSO</span>
              <span className={isLocked ? "text-amber-400 font-bold flex items-center justify-center gap-1" : "text-emerald-400 font-bold flex items-center justify-center gap-1"}>
                {isLocked ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                <span>{isLocked ? 'Restrito VIP' : 'Verificado'}</span>
              </span>
            </div>
          </div>
        )}

        {/* Linha da Sessão de Download Segura com Token Temporário */}
        {sessionToken && (
          <div className="bg-[#121218] border border-white/[0.08] p-3 rounded-xl flex items-center justify-between text-xs font-mono text-neutral-400 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[11px] text-neutral-400 font-mono uppercase">SESSÃO DE DOWNLOAD SEGURA:</span>
            </div>
            <strong className="text-emerald-400 font-bold text-xs sm:text-sm font-mono tracking-wider">
              {sessionToken}
            </strong>
            <span className="text-emerald-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
              TOKEN TEMPORÁRIO ATIVO
            </span>
          </div>
        )}

        {/* Conteúdo Central */}
        {isLocked ? (
          /* Bloqueio Exclusivo VIP */
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
        ) : subStep === 'step1' ? (
          /* PASSO 1: Inscrição no YouTube */
          <div className="bg-gradient-to-b from-[#1C1113] via-[#140D0F] to-[#0A0A0D] border border-[#F91010]/40 rounded-2xl p-5 text-center space-y-4 relative z-10 shadow-2xl">
            <div className="w-13 h-13 rounded-2xl bg-[#F91010]/20 text-[#F91010] border border-[#F91010]/40 flex items-center justify-center mx-auto shadow-lg shadow-red-600/20">
              <Youtube className="w-7 h-7 fill-current" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider bg-black/60 px-3 py-0.5 rounded-full border border-red-500/30">
                <span>Passo 1 • Inscrição no Canal</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white font-heading">
                Inscreva-se no Canal para Liberar
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Para liberar o download, inscreva-se no canal oficial da <strong>ALX Garage</strong> no YouTube. É rápido, gratuito e apoia novas atualizações!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleStartSubscriptionStep}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F91010] hover:bg-[#d80c0c] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
              >
                <Youtube className="w-4 h-4 fill-white shrink-0" />
                <span>INSCREVER-SE NO CANAL @ALX-GARAGE</span>
              </button>
              <p className="text-[11px] text-neutral-400">
                O canal abrirá numa nova aba. Após a inscrição, a verificação de 10s começará sozinha.
              </p>
            </div>
          </div>
        ) : subStep === 'step2' ? (
          /* PASSO 2: Verificando Inscrição (10 segundos) */
          <div className="bg-[#0b0c10] border border-red-500/30 rounded-2xl p-6 text-center space-y-4 relative z-10 shadow-lg">
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-600/20 blur-md animate-pulse" />
              <div
                className="absolute inset-0 rounded-full border-[3px] border-red-500/20 border-t-red-500 border-r-red-500 animate-spin"
                style={{ animationDuration: '1.2s' }}
              />
              <div className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg shadow-red-600/20">
                <div className="w-7 h-5 bg-[#FF0000] rounded-md flex items-center justify-center shadow-sm">
                  <div className="w-0 h-0 border-y-[3.5px] border-y-transparent border-l-[6px] border-l-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black text-white font-heading">
                Confirmando inscrição...
              </h4>
              <p className="text-xs text-neutral-400">
                Aguarde a liberação do seu link de download seguro.
              </p>
            </div>

            <div className="w-full bg-white/[0.08] h-2.5 rounded-full overflow-hidden border border-white/[0.08] relative">
              <div
                className="bg-red-600 h-full transition-all duration-150 ease-linear rounded-full shadow-[0_0_12px_rgba(255,0,0,0.7)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs font-semibold text-neutral-300">
              Quase lá... ({countdown}s)
            </p>
          </div>
        ) : (
          /* PASSO 3: Link Liberado com Sucesso - CONFORME A IMAGEM OFICIAL ENVIADA */
          <div className="bg-[#0b0c10] border border-emerald-500/25 rounded-2xl p-6 text-center space-y-4 relative z-10 shadow-xl shadow-emerald-500/5">
            {/* Badge Verde Central */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/25">
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>Link liberado com sucesso!</span>
            </div>

            {/* Texto explicativo */}
            <p className="text-xs sm:text-sm text-neutral-300 font-medium">
              {downloadStarted
                ? 'O download seguro foi disparado para o seu navegador.'
                : 'Clique no botão abaixo para iniciar o download seguro do arquivo.'}
            </p>

            {/* Botão Verde Neon Gigante (Não inicia automaticamente, apenas ao clicar) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={triggerRealDownload}
                disabled={isDownloading}
                className="w-full py-4 px-6 rounded-2xl bg-[#00E575] hover:bg-[#00f780] active:scale-[0.99] text-black font-black text-sm uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2.5 shadow-xl shadow-[#00E575]/25 cursor-pointer"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>{downloadStarted ? 'BAIXAR NOVAMENTE' : 'BAIXAR AGORA'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Rodapé: Compartilhar o portal oficial com botão Copiar Link (Conforme Imagem) */}
        <div className="flex items-center justify-between gap-3 pt-2 text-xs text-neutral-400 border-t border-white/[0.06] relative z-10">
          <span className="text-[11px] sm:text-xs">Compartilhe o portal oficial para novas versões:</span>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161620] hover:bg-[#20202e] text-white border border-white/[0.08] text-xs font-bold transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
