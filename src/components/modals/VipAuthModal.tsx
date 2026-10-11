import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { 
  Crown, 
  Check, 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
  Search
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { VipMember } from '../../types';

interface VipAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const VipAuthModal: React.FC<VipAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { brand, updateVipMember, addContactMessage, vipMembers, setIsVipLoggedIn, setActivePage } = useSiteData();
  
  const [tab, setTab] = useState<'login' | 'reset'>('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Password Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'new_password' | 'success'>('request');
  const [foundResetMember, setFoundResetMember] = useState<VipMember | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Handle Login for approved members
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setFeedback('Informe seu e-mail cadastrado.');
      return;
    }

    // Check if member exists in VIP list
    const found = vipMembers.find(
      (m) => m.email.toLowerCase().trim() === loginEmail.toLowerCase().trim()
    );

    if (found) {
      if (found.status === 'Aguardando Aprovação') {
        setFeedback('Seu pedido de adesão está Aguardando Aprovação (prazo de até 24h). Assim que aprovado, seu acesso será liberado!');
        return;
      }
      if (found.status === 'Expirado' || found.status === 'Inativo') {
        setFeedback('Sua assinatura VIP está expirada ou inativa. Renove para continuar com acesso total!');
        return;
      }

      // Exige obrigatoriamente a senha para todos os membros
      if (!loginPassword.trim()) {
        setFeedback('Por favor, digite sua senha de membro VIP.');
        return;
      }

      if (found.password && found.password.trim().length > 0) {
        if (loginPassword.trim() !== found.password.trim()) {
          setFeedback('Senha incorreta! Não lembra sua senha? Clique em "Clique aqui para redefinir" logo abaixo.');
          return;
        }
      } else {
        // Se o membro ainda não definiu uma senha, exige que ele utilize a redefinição de senha
        setFeedback('Sua conta ainda não possui uma senha cadastrada. Clique em "Clique aqui para redefinir" para criar sua senha.');
        return;
      }
    } else {
      setFeedback('E-mail não encontrado na base de membros VIP. Verifique a digitação ou cadastre-se na aba "Quero ser VIP".');
      return;
    }

    setFeedback('Autenticando credenciais do membro VIP...');
    setIsVipLoggedIn(true, found);
    setTimeout(() => {
      setFeedback(null);
      onLoginSuccess();
      onClose();
    }, 600);
  };

  // Iniciar fluxo de redefinição de senha
  const handleStartReset = () => {
    setTab('reset');
    setResetEmail(loginEmail.trim());
    setResetFeedback(null);
    setResetSuccessMessage(null);
    setResetStep('request');
    setFoundResetMember(null);
    setResetNewPassword('');
    setResetConfirmPassword('');
  };

  // Passo 1: Localizar membro pelo e-mail
  const handleVerifyResetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetFeedback('Informe seu e-mail cadastrado.');
      return;
    }

    const clean = resetEmail.trim().toLowerCase();
    const found = vipMembers.find((m) => m.email.toLowerCase().trim() === clean);

    if (!found) {
      setResetFeedback('E-mail não localizado na base de membros VIP. Verifique se digitou corretamente ou solicite adesão na aba Planos.');
      return;
    }

    if (found.status === 'Aguardando Aprovação') {
      setResetFeedback(`Olá, ${found.name}! Seu cadastro VIP ainda está "Aguardando Aprovação" (prazo até 24h). Assim que aprovado pelo administrador, você poderá redefinir sua senha.`);
      return;
    }

    if (found.status === 'Expirado' || found.status === 'Inativo') {
      setResetFeedback(`Olá, ${found.name}! Sua assinatura VIP consta como expirada ou inativa. Renove seu plano para reativar o acesso total.`);
      return;
    }

    setFoundResetMember(found);
    setResetStep('new_password');
    setResetFeedback(null);
  };

  // Passo 2: Gravar nova senha
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundResetMember) return;

    if (!resetNewPassword.trim() || resetNewPassword.trim().length < 4) {
      setResetFeedback('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (resetNewPassword.trim() !== resetConfirmPassword.trim()) {
      setResetFeedback('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    setIsResetSubmitting(true);
    try {
      updateVipMember(foundResetMember.id, {
        password: resetNewPassword.trim()
      });

      try {
        addContactMessage({
          name: foundResetMember.name,
          email: foundResetMember.email,
          phone: foundResetMember.phone || '',
          subject: `[Segurança VIP] Senha Redefinida por ${foundResetMember.name}`,
          message: `O membro ${foundResetMember.name} (${foundResetMember.email}) redefiniu sua senha de acesso VIP no site em ${new Date().toLocaleString('pt-BR')}.`,
        });
      } catch (logErr) {
        console.warn('Erro ao salvar log de redefinição:', logErr);
      }

      setResetStep('success');
      setResetSuccessMessage(`Senha de ${foundResetMember.name} redefinida com sucesso! Você já pode entrar com a nova senha.`);
      setLoginEmail(foundResetMember.email);
      setLoginPassword(resetNewPassword.trim());
    } catch (err) {
      setResetFeedback('Ocorreu um erro ao atualizar a senha. Tente novamente.');
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleResetModal = () => {
    setResetFeedback(null);
    setResetSuccessMessage(null);
    setFoundResetMember(null);
    setResetNewPassword('');
    setResetConfirmPassword('');
    setFeedback(null);
    setTab('login');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetModal} title="Login no Site • Área VIP" maxWidth="max-w-md">
      <div className="space-y-6">
        
        {/* Header Badge & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFDD00] to-[#f5cc14] text-black flex items-center justify-center mx-auto shadow-lg shadow-[#FFDD00]/20">
            <Crown className="w-6 h-6 fill-black" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            {tab === 'reset' ? 'Redefinir Senha VIP' : 'Login de Membro VIP'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-sm mx-auto">
            {tab === 'reset'
              ? 'Recupere seu acesso informando seu e-mail cadastrado para criar uma nova senha.'
              : 'Insira seu e-mail cadastrado e sua senha para acessar a Área VIP.'}
          </p>
        </div>

        {/* Tab Switcher - Apenas exibido ao redefinir senha para voltar ao login */}
        {tab === 'reset' && (
          <div className="flex items-center justify-between p-2 bg-[#121217] rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setResetFeedback(null);
              }}
              className="px-3 py-1.5 text-xs font-bold text-neutral-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Login VIP</span>
            </button>
            <span className="text-[11px] font-mono font-bold text-[#FFDD00] px-2.5 py-1 rounded-lg bg-[#FFDD00]/10 border border-[#FFDD00]/20">
              Recuperação de Senha
            </span>
          </div>
        )}

        {/* TAB DE LOGIN DO MEMBRO */}
        {tab === 'login' && (
          <div className="space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">E-mail Cadastrado</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-3 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                  />
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300">Senha de Acesso</label>
                  <button
                    type="button"
                    onClick={handleStartReset}
                    className="text-[11px] text-[#FFDD00] hover:underline font-bold cursor-pointer"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha de membro"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-3 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                  />
                  <Key className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {feedback && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-medium leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FFDD00] shrink-0 mt-0.5" />
                  <span>{feedback}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#FFDD00] hover:bg-[#ffe633] text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-[#FFDD00]/20 mt-2 cursor-pointer active:scale-98"
              >
                <span>ENTRAR NO PAINEL VIP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center text-xs text-neutral-400">
                <span>Não lembra sua senha? </span>
                <button
                  type="button"
                  onClick={handleStartReset}
                  className="text-[#FFDD00] hover:underline font-bold cursor-pointer"
                >
                  Clique aqui para redefinir
                </button>
              </div>
            </form>

            {/* SEJA MEMBRO (Redirecionamento para a página VIP) */}
            <div className="pt-4 border-t border-white/10 space-y-3 text-center">
              <span className="text-xs text-neutral-400 block font-medium">
                Ainda não é assinante ou deseja se tornar membro?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActivePage({ type: 'vip' });
                  setTimeout(() => {
                    const el = document.getElementById('planos-vip');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 150);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#FFDD00]/50 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer group active:scale-98"
              >
                <Crown className="w-4 h-4 text-[#FFDD00] fill-[#FFDD00] group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-[#FFDD00] transition-colors">SEJA MEMBRO • VER PLANOS VIP</span>
                <ArrowRight className="w-4 h-4 text-[#FFDD00]" />
              </button>

              <p className="text-[10px] text-neutral-400 font-mono leading-tight px-2">
                Adesão em formato de doação voluntária, sem vínculo de associado. Irregularidades acarretam exclusão imediata sem aviso e sem devolução.
              </p>
            </div>
          </div>
        )}






        {/* TAB 3: RESET DE SENHA */}
        {tab === 'reset' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* STEP 1: SOLICITAR / LOCALIZAR CONTA */}
            {resetStep === 'request' && (
              <form onSubmit={handleVerifyResetEmail} className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
                  <Key className="w-5 h-5 text-[#FFDD00] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-heading mb-0.5 text-sm">Recuperação de Acesso VIP</strong>
                    <p className="text-neutral-300">
                      Informe o e-mail cadastrado na sua assinatura ou adesão VIP. Vamos localizar sua conta para você criar uma nova senha.
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Seu E-mail Cadastrado</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                    />
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  </div>
                </div>

                {resetFeedback && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{resetFeedback}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#FFDD00] text-black font-extrabold text-xs tracking-wider uppercase hover:bg-[#ffe633] transition-all shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>LOCALIZAR CONTA E AVANÇAR</span>
                </button>
              </form>
            )}

            {/* STEP 2: DEFINIR NOVA SENHA */}
            {resetStep === 'new_password' && foundResetMember && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                {/* Membro Identificado */}
                <div className="p-4 rounded-2xl bg-[#14141e] border border-emerald-500/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Membro VIP Localizado
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      {foundResetMember.status}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-sm font-heading">{foundResetMember.name}</h4>
                  <p className="text-neutral-400 font-mono text-[11px]">{foundResetMember.email}</p>
                  {foundResetMember.phone && (
                    <p className="text-neutral-500 text-[11px]">WhatsApp: {foundResetMember.phone}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">Nova Senha (mínimo 4 caracteres)</label>
                    <div className="relative">
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        minLength={4}
                        placeholder="Digite a nova senha"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                      />
                      <Key className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title={showResetPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">Confirme a Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        minLength={4}
                        placeholder="Repita a nova senha"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                      />
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                {resetFeedback && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{resetFeedback}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#FFDD00] text-black font-extrabold text-xs tracking-wider uppercase hover:bg-[#ffe633] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isResetSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SALVANDO SENHA...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SALVAR NOVA SENHA E ENTRAR</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: SUCESSO */}
            {resetStep === 'success' && (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-base font-heading">Senha Redefinida com Sucesso!</h4>
                  <p className="text-neutral-300 text-xs leading-relaxed max-w-md mx-auto">
                    {resetSuccessMessage || 'Sua nova senha foi atualizada. Você já pode acessar a Área VIP agora mesmo.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (foundResetMember) {
                      setIsVipLoggedIn(true, foundResetMember);
                    }
                    onLoginSuccess();
                    onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
                >
                  <Crown className="w-4 h-4 fill-black" />
                  <span>ACESSAR O PAINEL VIP AGORA</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};
