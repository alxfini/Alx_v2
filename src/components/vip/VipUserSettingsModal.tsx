import React, { useState } from 'react';
import { X, Lock, Mail, Shield, User, Key, Check, Eye, EyeOff, Sparkles, CreditCard, Save } from 'lucide-react';
import { VipMember } from '../../types';
import { useSiteData } from '../../context/SiteDataContext';

interface VipUserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vipThemeHex?: string;
}

const PLAN_OPTIONS = [
  'Assinatura Mensal (Mercado Pago)',
  'Pagamento Avulso (Pix)',
  'Assinante VIP Mensal',
  'Assinante VIP Anual',
  'Membro Vitalício',
  'Apoiador WhatsApp',
  'Membro YouTube',
  'Apoiador Canal',
  'Outro',
];

export const VipUserSettingsModal: React.FC<VipUserSettingsModalProps> = ({
  isOpen,
  onClose,
  vipThemeHex = '#ebbf01',
}) => {
  const { currentVipMember, updateCurrentVipProfile } = useSiteData();

  const [name, setName] = useState(currentVipMember?.name || '');
  const [email, setEmail] = useState(currentVipMember?.email || '');
  const [phone, setPhone] = useState(currentVipMember?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [planType, setPlanType] = useState<string>(currentVipMember?.planType || 'Assinante VIP');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('O endereço de e-mail não pode ficar em branco.');
      return;
    }

    if (password && password.length < 4) {
      setErrorMsg('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setIsSaving(true);

    try {
      const payload: Partial<VipMember> = {
        name: name.trim() || currentVipMember?.name,
        email: email.trim(),
        phone: phone.trim(),
        planType: planType,
      };

      if (password) {
        payload.password = password;
      }

      updateCurrentVipProfile(payload);

      setSuccessMsg('Configurações atualizadas com sucesso!');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao atualizar dados da conta.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111116] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow de fundo */}
        <div 
          style={{ backgroundColor: `${vipThemeHex}15` }}
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3.5 border-b border-white/[0.08] pb-4">
          <div 
            style={{ backgroundColor: `${vipThemeHex}20`, borderColor: `${vipThemeHex}40`, color: vipThemeHex }}
            className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg"
          >
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white font-heading">
              Configurações da Conta VIP
            </h3>
            <p className="text-xs text-neutral-400">
              Gerencie seus dados de acesso, e-mail, senha e tipo de plano
            </p>
          </div>
        </div>

        {/* Mensagens de Sucesso / Erro */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <X className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>Nome do Membro</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-[#16161D] border border-white/[0.1] focus:border-[#ebbf01] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <span>E-mail de Acesso *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              className="w-full bg-[#16161D] border border-white/[0.1] focus:border-[#ebbf01] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition-all font-medium"
            />
            <p className="text-[10px] text-neutral-500 font-mono">
              Usado para fazer login e receber confirmações da Área VIP.
            </p>
          </div>

          {/* Telefone / WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <span>WhatsApp / Telefone</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-[#16161D] border border-white/[0.1] focus:border-[#ebbf01] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Plano */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
              <span>Tipo de Plano</span>
            </label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full bg-[#16161D] border border-white/[0.1] focus:border-[#ebbf01] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all font-medium cursor-pointer"
            >
              {PLAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#16161D] text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Alterar Senha */}
          <div className="pt-2 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#ebbf01]" />
                <span>Alterar Senha</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                (Deixe em branco para manter)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="w-full bg-[#16161D] border border-white/[0.1] focus:border-[#ebbf01] rounded-xl px-3.5 py-2.5 pr-9 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                  title={showPassword ? 'Ocultar' : 'Exibir'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar nova senha"
                  className="w-full bg-[#16161D] border border-white/[0.1] focus:border-[#ebbf01] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                backgroundColor: vipThemeHex,
                color: '#000000',
              }}
              className="px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
