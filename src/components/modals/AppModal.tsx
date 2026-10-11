import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ALXApp } from '../../types';
import { CheckCircle2, Download, ShoppingBag, ShieldCheck, Sparkles, Cpu, Layers, Smartphone, Share2, Check, Lock, Crown } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { getMediaPreviewUrl } from '../../utils/mediaUrl';
import { isItemVip } from '../../utils/vip';

interface AppModalProps {
  app: ALXApp | null;
  onClose: () => void;
  onOpenVipModal: () => void;
}

export const AppModal: React.FC<AppModalProps> = ({ app, onClose, onOpenVipModal }) => {
  const { openDownloadGateway, isVipLoggedIn, isAdminAuthenticated } = useSiteData();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;

  if (!app) return null;

  const isVIP = isItemVip(app);

  const handleShare = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/apps/${app.slug || app.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownload = () => {
    onClose();
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

  return (
    <Modal isOpen={!!app} onClose={onClose} title={`Aplicativo • ${app.name}`} maxWidth="max-w-4xl">
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#161616] border border-[#262626]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#ebbf01] text-black flex items-center justify-center font-black text-2xl font-heading shadow-lg shrink-0">
              {app.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-heading">{app.name}</h3>
                {app.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ebbf01]/20 text-[#ebbf01] border border-[#ebbf01]/30">
                    {app.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#888888] mt-0.5">{app.tagline}</p>
              <span className="text-[11px] font-mono text-[#AAAAAA]">{app.version}</span>
            </div>
          </div>

          <div className="text-right self-end sm:self-auto">
            <div className="text-xl font-black text-[#ebbf01] font-heading">{app.priceText}</div>
            <div className="text-[10px] text-[#666666]">Licença individual</div>
          </div>
        </div>

        {/* Screenshots Showcase */}
        {app.screenshots && app.screenshots.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#888888] uppercase tracking-wider">
              Capturas de Tela:
            </div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#161616] border border-white/[0.08] hover:border-[#ebbf01]/40 shadow-2xl group transition-all duration-300">
              <img
                src={getMediaPreviewUrl(app.screenshots[activeImageIdx] || app.coverImage)}
                alt={`${app.name} screenshot`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-black/30 pointer-events-none" />
            </div>
            {app.screenshots.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                {app.screenshots.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIdx === idx ? 'border-[#ebbf01]' : 'border-[#262626] opacity-60'
                    }`}
                  >
                    <img src={getMediaPreviewUrl(img)} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Full Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-[#888888] uppercase tracking-wider">
              Sobre o Aplicativo:
            </div>
            <button
              onClick={handleShare}
              title={copiedLink ? "Link Copiado!" : "Compartilhar Aplicativo"}
              className="p-1.5 rounded-lg bg-[#ebbf01]/10 hover:bg-[#ebbf01]/20 border border-[#ebbf01]/30 text-[#ebbf01] hover:text-[#f5cc14] transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-sm text-[#CCCCCC] leading-relaxed">
            {app.fullDescription || app.description}
          </p>
        </div>

        {/* Features Checklist */}
        <div className="space-y-3 p-4 rounded-xl bg-[#141414] border border-[#222222]">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ebbf01]" />
            <span>Recursos e Funcionalidades:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {app.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#DDDDDD]">
                <CheckCircle2 className="w-4 h-4 text-[#ebbf01] shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compatibility & Requirements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#ebbf01]" />
              <span>Compatibilidade:</span>
            </div>
            <ul className="space-y-1">
              {app.compatibility.map((comp, idx) => (
                <li key={idx} className="text-xs text-[#999999] list-disc list-inside">
                  {comp}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ebbf01]" />
              <span>Requisitos Mínimos:</span>
            </div>
            <ul className="space-y-1">
              {app.requirements.map((req, idx) => (
                <li key={idx} className="text-xs text-[#999999] list-disc list-inside">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white hover:bg-[#252525] text-xs font-semibold transition-colors"
          >
            Fechar
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 w-full">
            {isVIP && !isUserAuthenticated ? (
              <div className="w-full space-y-2">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-[#ebbf01]/30 flex items-center gap-2.5 text-xs text-neutral-300">
                  <Lock className="w-4 h-4 text-[#ebbf01] shrink-0" />
                  <span>Este aplicativo é exclusivo para membros VIP. Faça login na Área VIP para liberar o download.</span>
                </div>
                <button
                  onClick={() => {
                    onOpenVipModal();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs tracking-wider uppercase hover:bg-[#f5cc14] transition-all shadow-md cursor-pointer"
                >
                  <Crown className="w-4 h-4 fill-black" />
                  <span>DESBLOQUEAR NO ALX VIP</span>
                </button>
              </div>
            ) : isVIP && isUserAuthenticated ? (
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs tracking-wider uppercase hover:bg-[#f5cc14] transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>BAIXAR APK (MEMBRO VIP)</span>
              </button>
            ) : app.isFree ? (
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs tracking-wider uppercase hover:bg-[#f5cc14] transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>BAIXAR APK GRATUITO</span>
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs tracking-wider uppercase hover:bg-[#f5cc14] transition-all shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADQUIRIR AGORA ({app.priceText})</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
};
