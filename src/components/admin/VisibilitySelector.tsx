import React, { useState } from 'react';
import { Globe, Link as LinkIcon, Lock, Crown, Copy, Check, Info, EyeOff } from 'lucide-react';
import { ItemVisibility, VISIBILITY_OPTIONS, getItemVisibility } from '../../utils/visibility';

interface VisibilitySelectorProps {
  value?: ItemVisibility;
  onChange: (val: ItemVisibility) => void;
  directUrl?: string;
  itemTypeLabel?: string;
}

export const VisibilitySelector: React.FC<VisibilitySelectorProps> = ({
  value,
  onChange,
  directUrl,
  itemTypeLabel = 'item',
}) => {
  const [copied, setCopied] = useState(false);
  const currentVisibility = getItemVisibility({ visibility: value });

  const handleCopyLink = () => {
    if (!directUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <label className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#ebbf01]" />
            <span>Visibilidade no Site e Acesso</span>
          </label>
          <p className="text-[11px] text-neutral-500 font-medium">
            Defina se este {itemTypeLabel} aparecerá nas páginas do site, na Área VIP ou apenas via link direto.
          </p>
        </div>

        {directUrl && (
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-800 hover:text-black hover:underline cursor-pointer shrink-0 self-start sm:self-auto bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#ebbf01]" />
                <span>Copiar Link Direto</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Grid of 4 options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. PUBLIC */}
        <button
          type="button"
          onClick={() => onChange('public')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            currentVisibility === 'public'
              ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              currentVisibility === 'public'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            <Globe className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-900">Público no Site</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                Normal
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Visível no catálogo geral, buscas e para todos os visitantes do site.
            </p>
          </div>
        </button>

        {/* 2. UNLISTED (Oculto no site, visível por link) */}
        <button
          type="button"
          onClick={() => onChange('unlisted')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            currentVisibility === 'unlisted'
              ? 'bg-sky-50/80 border-sky-500 shadow-sm ring-1 ring-sky-500/30'
              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              currentVisibility === 'unlisted'
                ? 'bg-sky-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-900">Oculto no Site</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold uppercase">
                Por Link
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Não aparece nas listas públicas do site. Acessível por quem tiver o link.
            </p>
          </div>
        </button>

        {/* 3. LINK_ONLY (Oculto no site e para membros) */}
        <button
          type="button"
          onClick={() => onChange('link_only')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            currentVisibility === 'link_only'
              ? 'bg-purple-50/80 border-purple-500 shadow-sm ring-1 ring-purple-500/30'
              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              currentVisibility === 'link_only'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-900">Oculto Site + Membros</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold uppercase">
                Apenas Link
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Oculto no catálogo público e também na Área VIP. Acesso 100% via link direto.
            </p>
          </div>
        </button>

        {/* 4. MEMBERS_AND_LINK (Oculto no site, visível para membros e link) */}
        <button
          type="button"
          onClick={() => onChange('members_and_link')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            currentVisibility === 'members_and_link'
              ? 'bg-amber-50/80 border-[#ebbf01] shadow-sm ring-1 ring-amber-500/30'
              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              currentVisibility === 'members_and_link'
                ? 'bg-[#ebbf01] text-black'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-900">Oculto no Site</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold uppercase">
                Membros + Link
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Oculto no site público, visível na Área VIP para membros e via link direto.
            </p>
          </div>
        </button>
      </div>

      {/* Explanatory Box when Hidden */}
      {currentVisibility !== 'public' && (
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-800 font-bold">
            <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Como este {itemTypeLabel} se comporta na prática:</span>
          </div>
          <p className="text-neutral-600 leading-relaxed text-[11px]">
            {VISIBILITY_OPTIONS[currentVisibility].fullDesc}
          </p>
          {directUrl && (
            <div className="pt-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-500">Link direto para enviar:</span>
              <code className="text-[11px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-900 border border-neutral-200 truncate select-all">
                {directUrl}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const VisibilityBadge: React.FC<{ visibility?: ItemVisibility; className?: string }> = ({
  visibility,
  className = '',
}) => {
  const current = getItemVisibility({ visibility });
  const opt = VISIBILITY_OPTIONS[current];

  if (current === 'public') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 ${className}`}
        title={opt.fullDesc}
      >
        <Globe className="w-2.5 h-2.5" />
        <span>Público</span>
      </span>
    );
  }

  if (current === 'unlisted') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-900/60 text-sky-300 border border-sky-500/30 ${className}`}
        title={opt.fullDesc}
      >
        <LinkIcon className="w-2.5 h-2.5" />
        <span>Oculto (Link)</span>
      </span>
    );
  }

  if (current === 'link_only') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-900/60 text-purple-300 border border-purple-500/30 ${className}`}
        title={opt.fullDesc}
      >
        <Lock className="w-2.5 h-2.5" />
        <span>Oculto Site + Membros</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-900/60 text-[#ebbf01] border border-amber-500/40 ${className}`}
      title={opt.fullDesc}
    >
      <Crown className="w-2.5 h-2.5 fill-current" />
      <span>Membros + Link</span>
    </span>
  );
};
