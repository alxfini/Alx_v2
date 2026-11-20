import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  KeyRound,
  ShieldCheck,
  HelpCircle,
  X,
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

const GENERATOR_URL = 'https://ahmada3mar.github.io/BYD/';

export const ImeiGeneratorPage: React.FC = () => {
  const { brand } = useSiteData();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

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

        {/* Passo 2: Abrir Gerador Oficial */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161622] border border-white/10 space-y-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-brand)] uppercase">
            <span className="w-5 h-5 rounded-full bg-[var(--color-brand)]/20 border border-[var(--color-brand)]/40 flex items-center justify-center text-[11px] text-[var(--color-brand)]">
              2
            </span>
            <span>Passo 2 • Gerar Senha com os 6 Dígitos do IMEI</span>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            A tela do carro abrirá uma janela mostrando o <strong>IMEI</strong>{' '}
            e um campo de senha. <strong>Deixe essa janela aberta</strong>,
            clique no botão abaixo e digite os <strong>últimos 6 dígitos</strong>{' '}
            do IMEI para gerar os códigos de liberação:
          </p>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full p-4 bg-[var(--color-brand)] hover:brightness-110 active:scale-[0.98] text-black font-extrabold rounded-xl text-base sm:text-lg uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-brand)]/20 font-heading"
          >
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <span>Gerar Senha</span>
          </button>
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

      {/* Modal Dark Mode Alx⁺ com Botão Amarelo (#FFEA00) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#12121a] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topo do Modal */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#161622] border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <KeyRound className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  Gerador de Senha • Últimos 6 dígitos do IMEI
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aviso Rápido */}
            <div className="px-4 py-2 bg-[var(--color-brand)]/10 border-b border-[var(--color-brand)]/20 text-[11px] text-neutral-200 text-center">
              Digite os <strong>6 últimos dígitos do IMEI</strong> abaixo,
              clique em <strong>Submit</strong> e insira o código gerado no
              carro.
            </div>

            {/* Iframe com fundo escuro e rotação de matiz para amarelo #FFEA00 */}
            <div
              style={{ height: '440px', backgroundColor: '#141414' }}
              className="w-full"
            >
              <iframe
                src={GENERATOR_URL}
                title="Gerador de Senha BYD IMEI"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  filter: 'invert(0.92) hue-rotate(32deg) brightness(1.08)',
                }}
                loading="eager"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};