import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { brand, authenticateAdmin } = useSiteData();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = authenticateAdmin(password);
    if (result.success) {
      setPassword('');
      onSuccess();
    } else {
      setErrorMsg(result.error || 'Senha incorreta. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121217] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 text-white">
        
        {/* Glow accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebbf01] via-amber-400 to-[#ebbf01]" />

        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <img
              src={brand.logoUrl || '/imagens/logo.png'}
              alt={brand.brandName}
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/alx-logo.svg';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebbf01]/10 border border-[#ebbf01]/30 text-[#ebbf01] text-[11px] font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>Acesso Restrito ao Administrador</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
            Autenticação do Painel
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Digite sua senha para acessar as configurações de mídias, logotipo, notícias e produtos.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#ebbf01]" />
              <span>Senha de Acesso</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                autoFocus
                className="w-full bg-[#1A1A22] border border-white/[0.12] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar Senha' : 'Mostrar Senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-in shake duration-200 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-[#1A1A22] border border-white/[0.08] hover:bg-[#22222E] text-neutral-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ebbf01]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar no Painel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
