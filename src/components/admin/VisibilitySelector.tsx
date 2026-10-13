import React, { useState } from 'react';
import { Globe, Link as LinkIcon, Lock, Crown, Copy, Check, EyeOff, ShieldAlert } from 'lucide-react';
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
            <span>Visibilidade e Controle de Acesso</span>
          </label>
          <p className="text-[11px] text-neutral-500 font-medium">
            Selecione uma das 4 opções de publicação para este {itemTypeLabel}:
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

      {/* Grid of the 4 requested options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. Publico normal pra todos */}
        <button
          type="button"
          onClick={() => onChange('public')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            currentVisibility === 'public'
              ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-xs ${
              currentVisibility === 'public'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            1
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-900">Público normal pra todos</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                Aberto
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Visível no catálogo e buscas. Acesso e download 100% liberados para qualquer pessoa.
            </p>
          </div>
        </button>

        {/* 2. Visivel porem acesso somente VIP */}
        <button
          type="button"
          onClick={() => onChange('public_vip')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            currentVisibility === 'public_vip'
              ? 'bg-amber-50/90 border-amber-500 shadow-sm ring-1 ring-amber-500/40'
              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-xs ${
              currentVisibility === 'public_vip'
                ? 'bg-amber-500 text-black'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            2
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-900">Visível no site • Acesso somente VIP</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold uppercase">
                VIP
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Aparece no site com selo VIP. Membro liberado; quem não for membro cai para logar.
            </p>
          </div>
        </button>

        {/* 3. Acesso direto somente com link, pra todos */}
        <button
          type="button"
          onClick={() => onChange('unlisted')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            currentVisibility === 'unlisted' || currentVisibility === 'link_only'
              ? 'bg-sky-50/90 border-sky-500 shadow-sm ring-1 ring-sky-500/40'
              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-xs ${
              currentVisibility === 'unlisted' || currentVisibility === 'link_only'
                ? 'bg-sky-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            3
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-900">Acesso com link • Pra todos</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold uppercase">
                Link Livre
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Oculto no site. Quem tiver o link direto acessa livremente, sem precisar ser membro.
            </p>
          </div>
        </button>

        {/* 4. Acesso direto com link para quem for membro, qm não for membro cai pra logar */}
        <button
          type="button"
          onClick={() => onChange('members_and_link')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            currentVisibility === 'members_and_link'
              ? 'bg-purple-50/90 border-purple-500 shadow-sm ring-1 ring-purple-500/40'
              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-xs ${
              currentVisibility === 'members_and_link'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            4
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-neutral-900">Acesso com link • Só Membros</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-bold uppercase">
                Link VIP
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Oculto no site público. Com link direto: se for membro libera, quem não for cai pra logar.
            </p>
          </div>
        </button>
      </div>

      {/* Explanatory Box of active selection */}
      <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-800 font-bold">
          <EyeOff className="w-4 h-4 text-[#ebbf01] shrink-0" />
          <span>Comportamento prático da Opção {VISIBILITY_OPTIONS[currentVisibility].number}:</span>
        </div>
        <p className="text-neutral-600 leading-relaxed text-[11px]">
          {VISIBILITY_OPTIONS[currentVisibility].fullDesc}
        </p>
        {directUrl && (
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-500">Link direto deste {itemTypeLabel}:</span>
            <code className="text-[11px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-900 border border-neutral-200 truncate select-all">
              {directUrl}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export const VisibilityBadge: React.FC<{ visibility?: ItemVisibility; className?: string }> = ({
  visibility,
  className = '',
}) => {
  const current = getItemVisibility({ visibility });

  if (current === 'public') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 ${className}`}
        title="1 - Público normal pra todos"
      >
        <Globe className="w-2.5 h-2.5" />
        <span>1. Público</span>
      </span>
    );
  }

  if (current === 'public_vip') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-900/60 text-[#ebbf01] border border-amber-500/40 ${className}`}
        title="2 - Visível porém acesso somente VIP"
      >
        <Crown className="w-2.5 h-2.5 fill-current" />
        <span>2. Visível VIP</span>
      </span>
    );
  }

  if (current === 'unlisted' || current === 'link_only') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-900/60 text-sky-300 border border-sky-500/30 ${className}`}
        title="3 - Acesso direto somente com link, pra todos"
      >
        <LinkIcon className="w-2.5 h-2.5" />
        <span>3. Link (Todos)</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-900/60 text-purple-300 border border-purple-500/40 ${className}`}
      title="4 - Acesso direto somente com link para quem for membro"
    >
      <Lock className="w-2.5 h-2.5" />
      <span>4. Link (Membros)</span>
    </span>
  );
};
