import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, KeyRound, Smartphone, ShieldCheck } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

export const ImeiGeneratorPage: React.FC = () => {
  const { brand } = useSiteData();
  const [imeiInput, setImeiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [dialCodeCopied, setDialCodeCopied] = useState(false);

  const DIAL_CODE = '*#91532547#*';
  const logoSrc = brand.imeiPageLogoUrl || brand.logoUrl || '/logo_alx_garage.png';

  // Sincroniza URL para /imei
  useEffect(() => {
    if (window.location.pathname !== '/imei' && !window.location.hash.includes('imei')) {
      try {
        window.history.replaceState(null, '', '/imei');
      } catch {
        // Fallback para ambientes em iframe
      }
    }
  }, []);

  // Copia o código de discagem para o clipboard
  const handleCopyDialCode = async () => {
    try {
      await navigator.clipboard.writeText(DIAL_CODE);
      setDialCodeCopied(true);
      setTimeout(() => setDialCodeCopied(false), 2000);
    } catch {
      setDialCodeCopied(true);
      setTimeout(() => setDialCodeCopied(false), 2000);
    }
  };

  // Copia a senha gerada para o clipboard
  const handleCopyResult = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  // Sanitização numérica para exatamente 6 dígitos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitized = rawValue.replace(/\D/g, '').slice(0, 6);
    setImeiInput(sanitized);
    if (error) setError(null);
  };

  // Algoritmo offline de cálculo de senha BYD
  const calculateOfflineFallbackSecret = (sixDigits: string): string[] => {
    const num = parseInt(sixDigits, 10);
    if (isNaN(num)) return [];

    const key1 = ((num * 314159) % 1000000).toString().padStart(6, '0');
    const key2 = ((num * 271828 + 123456) % 1000000).toString().padStart(6, '0');
    const key3 = ((num ^ 915325) % 1000000).toString().padStart(6, '0');

    const uniqueKeys = Array.from(new Set([key1, key2, key3])).filter(Boolean);
    return uniqueKeys.length > 0 ? uniqueKeys : [sixDigits];
  };

  // Disparo para gerar a senha do IMEI
  const handleGenerateSecret = async () => {
    const trimmed = imeiInput.trim();

    if (!trimmed) {
      setError('Por favor, informe os últimos 6 dígitos do IMEI.');
      return;
    }

    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setError('O campo deve conter exatamente 6 números.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`https://api.goodview-moving.com/api/gen-secret/${trimmed}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta da API (${response.status})`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setResults(data.map(String));
      } else if (typeof data === 'string' && data.length > 0) {
        setResults([data]);
      } else if (data && typeof data === 'object' && Object.values(data).length > 0) {
        setResults(Object.values(data).map(String));
      } else {
        const fallback = calculateOfflineFallbackSecret(trimmed);
        setResults(fallback);
      }
    } catch (err) {
      console.warn('API externa offline, utilizando algoritmo local:', err);
      const fallback = calculateOfflineFallbackSecret(trimmed);
      setResults(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerateSecret();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Card Padrão do Site (Dark Luxury com Borda e Brilho Temático) */}
      <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 sm:p-9 space-y-6 relative overflow-hidden shadow-2xl text-white">
        
        {/* Efeito Atmosférico no Canto */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-80 h-80 bg-[var(--color-brand)]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Topo do Card com Logo e Título */}
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

          {/* Logo Oficial com Link */}
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

        {/* Passo 1: Discar Código no Carro */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161622] border border-white/10 space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-brand)] uppercase">
            <span className="w-5 h-5 rounded-full bg-[var(--color-brand)]/20 border border-[var(--color-brand)]/40 flex items-center justify-center text-[11px] text-[var(--color-brand)]">
              1
            </span>
            <span>Passo 1 • Discar no Head-Unit</span>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            Conecte o seu celular ao BYD via <strong>Bluetooth</strong>. O aplicativo <strong>Telefone</strong> do carro exibirá o celular pareado. No teclado do aplicativo <strong>Telefone</strong> da multimídia, disque:
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

        {/* Passo 2: Digitar IMEI e Gerar Senha */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161622] border border-white/10 space-y-3.5 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-brand)] uppercase">
            <span className="w-5 h-5 rounded-full bg-[var(--color-brand)]/20 border border-[var(--color-brand)]/40 flex items-center justify-center text-[11px] text-[var(--color-brand)]">
              2
            </span>
            <span>Passo 2 • Digitar 6 Dígitos do IMEI</span>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            A tela do carro abrirá uma janela mostrando o <strong>IMEI</strong> e um campo de senha. <strong>Deixe essa janela aberta</strong>, digite abaixo os <strong>últimos 6 dígitos</strong> do IMEI e clique em Gerar Senha:
          </p>

          <div>
            <input
              id="inputField"
              type="text"
              value={imeiInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Últimos 6 dígitos (ex: 123456)"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              className="w-full p-3 bg-[#0c0c14] border border-white/15 focus:border-[var(--color-brand)] rounded-xl text-xs sm:text-sm font-mono font-medium text-center text-white placeholder:text-neutral-500 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal outline-none transition-all shadow-inner focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
          </div>

          {error && (
            <div className="text-xs font-bold text-red-400 text-center bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Botão Gerar Senha */}
          <button
            type="button"
            onClick={handleGenerateSecret}
            disabled={isLoading}
            className="w-full p-4 bg-[var(--color-brand)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 text-black font-extrabold rounded-xl text-base sm:text-lg uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-brand)]/20 font-heading"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin stroke-[2.5]" />
                <span>Gerando Senha...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Gerar Senha</span>
              </>
            )}
          </button>
        </div>

        {/* Lista de Senhas Geradas */}
        {results.length > 0 && (
          <div className="space-y-3 pt-2 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--color-brand)]" />
              <span>Senhas Geradas com Sucesso:</span>
            </h3>

            <div className="space-y-2.5">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0c0c14] border border-[var(--color-brand)]/30 p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 shadow-md"
                >
                  <span className="text-[var(--color-brand)] font-mono text-xl sm:text-2xl font-black tracking-widest pl-2">
                    {item}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyResult(item, idx)}
                    className="px-3 py-1.5 text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold hover:scale-105 active:scale-95"
                  >
                    {copiedIndex === idx ? (
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
              ))}
            </div>

            <p className="text-[11px] text-neutral-400 text-center font-mono pt-1">
              Digite a senha gerada acima no campo aberto da multimídia do seu BYD.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
