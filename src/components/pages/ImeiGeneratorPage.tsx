import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  KeyRound,
  HelpCircle,
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

export const ImeiGeneratorPage: React.FC = () => {
  const { brand } = useSiteData();
  const [dialCodeCopied, setDialCodeCopied] = useState(false);

  const DIAL_CODE = '*#91532547#*';
  const logoSrc = brand?.logoUrl || '/logo_alx_garage.png';

  useEffect(() => {
    if (
      window.location.pathname !== '/imei' &&
      !window.location.hash.includes('imei')
    ) {
      try {
        window.history.replaceState(null, '', '/imei');
      } catch {
        // Ignora erro em ambiente iframe
      }
    }
  }, []);

  const handleCopyDialCode = async () => {
    try {
      await navigator.clipboard.writeText(DIAL_CODE);
    } catch {
      // Fallback visual
    }
    setDialCodeCopied(true);
    setTimeout(() => setDialCodeCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 sm:p-9 space-y-6 relative overflow-hidden shadow-2xl text-white">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-80 h-80 bg-[var(--color-brand)]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Cabeçalho */}
        <div className="flex flex-row items-center justify-between gap-2.5 sm:gap-4 border-b border-white/10 pb-5 sm:pb-6 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3.5 text-left min-w-0">
            <div className="p-2 sm:p-3.5 rounded-2xl bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/25 text-[var(--color-brand)] shrink-0 shadow-inner">
              <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm min-[360px]:text-base min-[410px]:text-lg sm:text-2xl md:text-3xl font-black text-white font-heading tracking-tight whitespace-nowrap">
                Gerador Senha IMEI
              </h1>
            </div>
          </div>

          <a
            href="https://www.youtube.com/@alx-garage?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105 shrink-0"
            title="ALX Garage no YouTube"
          >
            <img
              src={logoSrc}
              alt="ALX Garage"
              className="h-7 sm:h-10 md:h-12 w-auto max-w-[95px] sm:max-w-[160px] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo_alx_garage.png';
              }}
            />
          </a>
        </div>

        {/* Passo 1: Discar no Carro */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161622] border border-white/10 space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-brand)] uppercase">
            <span className="w-5 h-5 rounded-full bg-[var(--color-brand)]/20 border border-[var(--color-brand)]/40 flex items-center justify-center text-[11px] text-[var(--color-brand)]">
              1
            </span>
            <span>Passo 1 • Discar no Head-Unit do BYD</span>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            Conecte o seu celular ao BYD via <strong>Bluetooth</strong>. Abra o
            aplicativo <strong>Telefone</strong> na central multimídia do carro
            e disque o código de engenharia:
          </p>

          <div className="p-3 sm:p-3.5 bg-[#0c0c14] rounded-xl border border-white/10 flex items-center justify-between gap-3 shadow-inner">
            <code className="text-[var(--color-brand)] font-mono text-base sm:text-lg font-bold tracking-widest pl-1 overflow-x-auto whitespace-nowrap">
              {DIAL_CODE}
            </code>

            <button
              type="button"
              onClick={handleCopyDialCode}
              className="px-3 py-1.5 text-xs text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg font-sans font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95"
            >
              {dialCodeCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Passo 2: Gerador Integrado Direto na Página */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161622] border border-white/10 space-y-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-brand)] uppercase">
            <span className="w-5 h-5 rounded-full bg-[var(--color-brand)]/20 border border-[var(--color-brand)]/40 flex items-center justify-center text-[11px] text-[var(--color-brand)]">
              2
            </span>
            <span>Passo 2 • Digitar 6 Dígitos do IMEI</span>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            A tela do carro abrirá uma janela mostrando o <strong>IMEI</strong>{' '}
            e um campo de senha. <strong>Deixe essa janela aberta</strong>,
            digite abaixo os <strong>últimos 6 dígitos</strong> do IMEI e clique
            em <strong>Submit</strong>:
          </p>

          <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0b0f17]">
            <iframe
              src="/gerador-byd.html"
              title="Gerador Senha IMEI BYD"
              style={{
                width: '100%',
                height: '460px',
                border: 'none',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* Dica de Ajuda */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 relative z-10">
          <HelpCircle className="w-5 h-5 text-[var(--color-brand)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Dica Importante:</span>
            <p className="leading-relaxed text-neutral-400">
              Certifique-se de digitar exatamente os últimos 6 dígitos numéricos
              exibidos no IMEI do seu veículo. Serão geradas 5 senhas possíveis
              — teste a partir da terceira opção (horário atual) e, se
              necessário, tente as demais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};