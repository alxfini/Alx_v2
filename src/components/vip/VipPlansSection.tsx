import React, { useState, useMemo } from 'react';
import { 
  Crown, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  Copy, 
  ExternalLink, 
  Clock, 
  CreditCard, 
  Zap, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { generatePixPayload, getPixQrCodeUrl } from '../../utils/pix';
import { getPageThemeHex } from '../../utils/pageColors';

interface VipPlansSectionProps {
  onOpenLoginModal?: () => void;
}

export const VipPlansSection: React.FC<VipPlansSectionProps> = ({ onOpenLoginModal }) => {
  const { brand, addVipMember, addContactMessage } = useSiteData();
  const vipThemeHex = getPageThemeHex('vip', brand?.pageColors);

  const [selectedPlan, setSelectedPlan] = useState<'mercadopago' | 'pix'>('mercadopago');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Termo de Doação Voluntária & Aceite
  const [acceptedDonationTerms, setAcceptedDonationTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  // Payment configuration
  const paymentConfig = brand.vipPayment || {
    pixKey: brand.links?.email || 'contact@7f.com.br',
    pixKeyType: 'email' as const,
    pixReceiverName: brand.brandName || 'ALX GARAGE',
    pixReceiverCity: 'SAO PAULO',
    mercadoPagoSubUrl: 'https://www.mercadopago.com.br/subscriptions/checkout',
    monthlySubPrice: '14,90',
    pixSinglePrice: '14,90',
    approvalNoticeText: 'A aprovação e liberação do seu acesso VIP pode demorar até 24 horas.',
    notificationEmail: 'contact@7f.com.br',
  };

  const pixPrice = paymentConfig.pixSinglePrice || '14,90';
  const subPrice = paymentConfig.monthlySubPrice || '14,90';
  const noticeText = paymentConfig.approvalNoticeText || 'A aprovação e liberação do seu acesso VIP pode demorar até 24 horas.';

  // Generate PIX Copia e Cola payload
  const pixPayload = useMemo(() => {
    return generatePixPayload({
      key: paymentConfig.pixKey || brand.links?.email || 'contact@7f.com.br',
      keyType: paymentConfig.pixKeyType || 'email',
      receiverName: paymentConfig.pixReceiverName || brand.brandName || 'ALX GARAGE',
      receiverCity: paymentConfig.pixReceiverCity || 'SAO PAULO',
      amount: pixPrice,
      txId: `VIP${Date.now().toString().slice(-6)}`,
      description: `Adesao VIP ${name ? name.slice(0, 10) : 'ALX'}`
    });
  }, [paymentConfig, pixPrice, name, brand.brandName, brand.links?.email]);

  const pixQrCodeUrl = useMemo(() => {
    return getPixQrCodeUrl(pixPayload, 260);
  }, [pixPayload]);

  const handleCopyPix = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCopyPixKey = () => {
    const key = paymentConfig.pixKey || brand.links?.email || 'contact@7f.com.br';
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setTermsError('Por favor, preencha todos os campos obrigatórios: Nome, E-mail, WhatsApp e Senha de Acesso.');
      return;
    }

    if (password.trim().length < 4) {
      setTermsError('A senha de acesso deve ter no mínimo 4 caracteres.');
      return;
    }

    if (!acceptedDonationTerms) {
      setTermsError('Você precisa declarar que leu e concorda que a adesão é sob forma de doação voluntária (sem prestação de serviços nem vínculo de associado) para concluir o pedido.');
      return;
    }
    setTermsError(null);

    setIsSubmitting(true);

    const planLabel = selectedPlan === 'mercadopago' 
      ? 'Assinatura Mensal (Mercado Pago)' 
      : 'Pagamento Avulso (Pix)';

    const periodLabel = selectedPlan === 'mercadopago' ? 'Mensal' : '30 dias';

    // 1. Cadastra na lista de Membros VIP com status "Aguardando Aprovação"
    try {
      addVipMember({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        planType: planLabel,
        period: periodLabel,
        startDate: new Date().toISOString().slice(0, 10),
        expirationDate: 'Pendente',
        status: 'Aguardando Aprovação',
        notes: `Pedido realizado via site (${selectedPlan === 'mercadopago' ? 'Mercado Pago' : 'Pix'}). [Termo de adesão como doação voluntária e ausência de vínculo aceito]. ${notes || ''}`,
      });
    } catch (err) {
      console.warn('Erro ao salvar membro VIP:', err);
    }

    // 2. Grava no inbox administrativo do site
    const fullSubject = `[Novo Cadastro VIP] ${planLabel} - ${name}`;
    const fullMessage = `Novo pedido de adesão VIP realizado no portal!\n\nNome: ${name}\nE-mail: ${email}\nWhatsApp / Tel: ${phone}\nPlano: ${planLabel} (R$ ${selectedPlan === 'mercadopago' ? subPrice : pixPrice})\nData: ${new Date().toLocaleString('pt-BR')}\nStatus: Aguardando Aprovação (Prazo até 24h)\nTermo de Doação: Aceito e confirmado pelo usuário no ato do cadastro (caráter de doação voluntária, sem prestação de serviços continuados nem vínculo de associado, sujeito a exclusão sem aviso em caso de irregularidades).\n\nObservações do Membro:\n${notes || 'Sem observações adicionais.'}`;

    try {
      addContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: fullSubject,
        message: fullMessage,
      });
    } catch (err) {
      console.warn('Erro ao salvar no inbox:', err);
    }

    // 3. Disparo Multi-Gateway de Notificação ao Administrador (Webhook, Web3Forms e FormSubmit)
    try {
      const primaryTarget = brand.vipPayment?.notificationEmail?.trim() 
        || (brand.links?.email && brand.links.email !== 'contato@alxtech.com.br' ? brand.links.email : 'contact@7f.com.br');
      const web3Key = brand.links?.web3formsKey?.trim();
      const webhookUrl = brand.links?.customWebhookUrl?.trim();
      let sentSuccessfully = false;

      // Gateway A: Webhook Instantâneo (Zapier / Make / Telegram / Discord)
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `👑 **Novo Membro VIP Cadastrado!**\n**Nome:** ${name}\n**E-mail:** ${email}\n**WhatsApp:** ${phone}\n**Plano:** ${planLabel} (R$ ${selectedPlan === 'mercadopago' ? subPrice : pixPrice})\n**Status:** Aguardando Aprovação`,
            name,
            email,
            phone,
            plan: planLabel,
            price: selectedPlan === 'mercadopago' ? subPrice : pixPrice,
            status: 'Aguardando Aprovação',
            subject: fullSubject,
            message: fullMessage,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => null);
      }

      // Gateway B: Web3Forms
      if (web3Key) {
        try {
          const w3Res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              access_key: web3Key,
              name: `${name} (Novo Cadastro VIP)`,
              email: email,
              replyto: email,
              subject: fullSubject,
              message: fullMessage,
              from_name: `${brand.brandName || 'Alx⁺'} VIP System`,
            }),
          });
          const w3Data = await w3Res.json().catch(() => null);
          if (w3Data?.success || w3Res.ok) {
            sentSuccessfully = true;
          }
        } catch (e) {
          console.warn('Web3Forms dispatch failed:', e);
        }
      }

      // Gateway C: FormSubmit
      if (!sentSuccessfully) {
        try {
          await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(primaryTarget)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              Nome: name,
              Email: email,
              WhatsApp: phone,
              Plano: planLabel,
              Valor: `R$ ${selectedPlan === 'mercadopago' ? subPrice : pixPrice}`,
              Status: 'Aguardando Aprovação',
              Mensagem: fullMessage,
              _replyto: email,
              _subject: fullSubject,
              _template: 'box',
              _captcha: 'false',
            }),
          });
        } catch (err) {
          console.warn('FormSubmit dispatch failed:', err);
        }
      }
    } catch (e) {
      console.warn('Erro ao disparar e-mail de notificação:', e);
    }

    setIsSubmitting(false);
    setIsSubmittedSuccess(true);
  };

  const handleResetForm = () => {
    setIsSubmittedSuccess(false);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setNotes('');
    setAcceptedDonationTerms(false);
    setTermsError(null);
  };

  return (
    <div id="planos-vip" className="space-y-6 pt-4">
      {/* Header do Bloco de Planos */}
      <div 
        style={{ borderColor: `${vipThemeHex}40` }}
        className="bg-[#111116] border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Laser Accent Bar no topo dinâmico com a cor VIP */}
        <div 
          style={{ background: `linear-gradient(to right, transparent, ${vipThemeHex}, transparent)` }}
          className="absolute top-0 left-0 right-0 h-1 opacity-90" 
        />

        {/* Cabeçalho da Seção */}
        <div className="space-y-3 border-b border-white/[0.08] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 text-left">
              <div 
                style={{ color: vipThemeHex, borderColor: `${vipThemeHex}40`, backgroundColor: `${vipThemeHex}15` }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl border text-xs font-mono font-bold uppercase"
              >
                <Crown className="w-3.5 h-3.5" style={{ fill: vipThemeHex, color: vipThemeHex }} />
                <span>Assinatura & Planos de Acesso</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                Escolha sua Modalidade de Assinatura
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 font-sans max-w-2xl leading-relaxed">
                Tenha acesso ilimitado aos downloads diretos, atualizações antecipadas de APKs e firmwares, masterclasses e suporte especializado da comunidade.
              </p>
            </div>

            {onOpenLoginModal && (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-center shrink-0 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-neutral-400" />
                <span>Já é Membro? Fazer Login</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#FFDD00] whitespace-nowrap overflow-x-auto no-scrollbar pt-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Adesão voluntária em formato de doação (sem vínculo de associado e sem prestação continuada de serviços).</span>
          </div>
        </div>

        {isSubmittedSuccess ? (
          /* Estado de Sucesso ao Concluir Pedido */
          <div className="p-6 sm:p-10 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white font-heading">
                Pedido de Adesão VIP Registrado com Sucesso!
              </h4>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-sans max-w-lg mx-auto">
                Recebemos sua solicitação. Seus dados foram salvos no sistema e nossa equipe foi notificada para ativação do seu acesso.
              </p>
            </div>

            {/* Aviso de Prazo */}
            <div className="p-4 rounded-2xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-[#FFDD00] flex items-start gap-3 text-left max-w-xl mx-auto">
              <Clock className="w-5 h-5 text-[#FFDD00] shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="font-extrabold text-[#FFDD00] block">Prazo de Ativação:</span>
                <p className="leading-relaxed text-[#FFDD00]">
                  {noticeText}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  style={{ backgroundColor: vipThemeHex, color: '#000000' }}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:brightness-110 cursor-pointer"
                >
                  Fazer Login no Painel VIP
                </button>
              )}
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cadastrar Outro Membro
              </button>
            </div>
          </div>
        ) : (
          /* Seleção de Planos + Pagamento + Formulário */
          <form onSubmit={handleRegisterSubmit} className="space-y-8">
            
            {/* 1. Seleção dos 2 Planos */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block">
                1. Selecione a Modalidade de Pagamento:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* PLANO 1: ASSINATURA MENSAL (MERCADO PAGO) */}
                <div
                  onClick={() => setSelectedPlan('mercadopago')}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                    selectedPlan === 'mercadopago'
                      ? 'bg-gradient-to-br from-[#009EE3]/20 via-[#0a1b24]/90 to-[#050e13] border-[#009EE3] shadow-xl shadow-[#009EE3]/20 scale-[1.01]'
                      : 'bg-[#141419] border-white/10 hover:border-white/30 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg bg-[#009EE3]/20 text-[#009EE3] border border-[#009EE3]/40 text-[10px] font-mono font-black uppercase tracking-wider">
                        Mercado Pago Recorrente
                      </span>
                      <CreditCard className={`w-5 h-5 ${selectedPlan === 'mercadopago' ? 'text-[#009EE3]' : 'text-neutral-500'}`} />
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white font-heading">
                        ASSINATURA MENSAL
                      </h4>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-[#009EE3] font-heading">
                          R$ {subPrice}
                        </span>
                        <span className="text-xs text-neutral-400 font-semibold">/mês</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                      Ideal para quem busca comodidade e acesso contínuo sem precisar renovar manualmente todos os meses.
                    </p>

                    <ul className="space-y-2 text-xs text-neutral-200 font-medium pt-3 border-t border-white/10">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#009EE3] shrink-0 stroke-[3]" />
                        <span>Renovação automática mensal</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#009EE3] shrink-0 stroke-[3]" />
                        <span>Liberação automática do VIP</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#009EE3] shrink-0 stroke-[3]" />
                        <span>Cancele a qualquer momento sem taxas</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <div className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                      selectedPlan === 'mercadopago' 
                        ? 'bg-[#009EE3] text-white font-black shadow-md shadow-[#009EE3]/30' 
                        : 'bg-white/10 text-neutral-400'
                    }`}>
                      {selectedPlan === 'mercadopago' ? '✓ Modalidade Selecionada' : 'Selecionar Assinatura Mensal'}
                    </div>
                  </div>
                </div>

                {/* PLANO 2: PAGAMENTO AVULSO (PIX AUTOMÁTICO) */}
                <div
                  onClick={() => setSelectedPlan('pix')}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                    selectedPlan === 'pix'
                      ? 'bg-gradient-to-br from-[#25D366]/20 via-[#0a1e12]/90 to-[#051109] border-[#25D366] shadow-xl shadow-[#25D366]/20 scale-[1.01]'
                      : 'bg-[#141419] border-white/10 hover:border-white/30 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 text-[10px] font-mono font-black uppercase tracking-wider">
                        Pix Automático
                      </span>
                      <QrCode className={`w-5 h-5 ${selectedPlan === 'pix' ? 'text-[#25D366]' : 'text-neutral-500'}`} />
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white font-heading">
                        PAGAMENTO AVULSO PIX
                      </h4>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-[#25D366] font-heading">
                          R$ {pixPrice}
                        </span>
                        <span className="text-xs text-neutral-400 font-semibold">/30 dias</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                      Pague via Pix sem recorrência bancária. Acesso total liberado por 30 dias corridos.
                    </p>

                    <ul className="space-y-2 text-xs text-neutral-200 font-medium pt-3 border-t border-white/10">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0 stroke-[3]" />
                        <span>Acesso integral por 30 dias corridos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0 stroke-[3]" />
                        <span>QR Code dinâmico Copia e Cola</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0 stroke-[3]" />
                        <span>Sem vínculos de cartão de crédito</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <div className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                      selectedPlan === 'pix' 
                        ? 'bg-[#25D366] text-black font-black shadow-md shadow-[#25D366]/30' 
                        : 'bg-white/10 text-neutral-400'
                    }`}>
                      {selectedPlan === 'pix' ? '✓ Modalidade Selecionada' : 'Selecionar Pagamento Pix'}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Ação de Pagamento correspondente */}
            {selectedPlan === 'pix' ? (
              /* BOX DO PIX COM QR CODE E COPIA-COLA */
              <div className="p-6 rounded-3xl bg-[#141419] border border-[#25D366]/30 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-[#25D366] font-mono font-bold text-xs uppercase tracking-wider">
                  <QrCode className="w-4 h-4" />
                  <span>2. Pague via Pix (R$ {pixPrice}):</span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Code */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 flex items-center justify-center">
                    <img
                      src={pixQrCodeUrl}
                      alt="QR Code Pix"
                      className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg"
                    />
                  </div>

                  {/* Instruções e Botões de Cópia */}
                  <div className="flex-1 space-y-3.5 w-full text-left">
                    <span className="text-xs text-neutral-300 font-medium block leading-relaxed">
                      Abra o aplicativo do seu banco, escolha a opção <strong>Pagar com Pix</strong> e aponte a câmera para o QR Code ao lado ou use o código Copia e Cola abaixo:
                    </span>

                    {/* Copiar Pix Copia e Cola */}
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-black border border-white/20 text-white font-mono text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-sm"
                    >
                      <span className="truncate max-w-[280px] sm:max-w-md text-neutral-400 text-xs">
                        {pixPayload ? `${pixPayload.slice(0, 32)}...` : 'Gerando código Pix...'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#25D366] font-sans font-extrabold shrink-0 group-hover:scale-105 transition-transform">
                        {copiedPix ? <Check className="w-4 h-4 text-[#25D366]" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedPix ? 'Copiado!' : 'Copiar Código Pix'}</span>
                      </span>
                    </button>

                    {/* Copiar Chave Pix direta */}
                    <button
                      type="button"
                      onClick={handleCopyPixKey}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 font-mono text-xs transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">Chave Pix: <strong>{paymentConfig.pixKey}</strong></span>
                      <span className="text-xs text-emerald-400 font-sans font-bold">
                        {copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* BOX DO MERCADO PAGO COM BOTÃO DIRETO */
              <div className="p-6 rounded-3xl bg-[#141419] border border-[#009EE3]/30 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-[#009EE3] font-mono font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>2. Assine no Mercado Pago (R$ {subPrice} /mês):</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans max-w-xl">
                    Clique no botão oficial ao lado para abrir a página de assinatura segura do Mercado Pago. Após confirmar a assinatura, preencha os dados abaixo para ativarmos seu cadastro no portal:
                  </p>

                  <a
                    href={paymentConfig.mercadoPagoSubUrl || 'https://www.mercadopago.com.br/subscriptions/checkout'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#009EE3] hover:bg-[#0087c2] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#009EE3]/25 cursor-pointer shrink-0"
                  >
                    <span>Abrir Assinatura no Mercado Pago</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* 3. Formulário de Dados Cadastrais */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block">
                3. Informe seus Dados para Ativação do Acesso VIP:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Seu Nome Completo *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carlos Silva"
                      className="w-full pl-9 pr-3.5 py-3 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
                    />
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Seu E-mail para Login *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-9 pr-3.5 py-3 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
                    />
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">WhatsApp / Telefone com DDD *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-8888"
                      className="w-full pl-9 pr-3.5 py-3 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
                    />
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Definir Senha de Acesso *</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crie uma senha de acesso"
                      className="w-full pl-9 pr-3.5 py-3 rounded-xl bg-[#181820] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/40"
                    />
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Aviso de Prazo */}
              <div className="p-4 rounded-2xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-[#FFDD00] text-xs flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#FFDD00] shrink-0" />
                <span><strong className="font-bold text-[#FFDD00]">Atenção:</strong> {noticeText}</span>
              </div>

              {/* Termo de Adesão: Doação Voluntária, Ausência de Vínculo e Exclusão por Irregularidades */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#141422] border border-[#FFDD00]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#FFDD00] font-bold text-xs uppercase tracking-wider font-mono">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Termo Legal: Adesão por Doação Voluntária</span>
                </div>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  A adesão à Área VIP é realizada exclusivamente na forma de <strong>doação voluntária</strong> para cobrir custos de hospedagem, servidores e manutenção técnica do portal independente. <strong>Não constitui contratação de prestação de serviços</strong> nem confere direitos de <strong>associado ou vínculo societário</strong>.
                </p>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  Havendo qualquer irregularidade (como compartilhamento ou revenda indevida de acessos, pirataria de arquivos ou desrespeito às regras), o usuário poderá ser <strong>excluído imediatamente sem aviso prévio e sem devolução de valores</strong> doados.
                </p>
              </div>

              {/* Checkbox Obrigatório de Aceite dos Termos */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#181824] border border-white/10 hover:border-[#FFDD00]/40 transition-all cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedDonationTerms}
                    onChange={(e) => {
                      setAcceptedDonationTerms(e.target.checked);
                      if (e.target.checked) setTermsError(null);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#FFDD00] focus:ring-[#FFDD00] accent-[#FFDD00] cursor-pointer shrink-0"
                  />
                  <div className="text-xs text-neutral-200 leading-relaxed select-none">
                    <span className="font-semibold text-white">Li e concordo com os termos de adesão: </span>
                    <span>
                      Compreendo que a contribuição é uma doação voluntária (sem prestação de serviços continuados e sem vínculo de associado) e que qualquer conduta irregular resultará em exclusão imediata sem aviso e sem reembolso.{' '}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowTermsModal(true);
                      }}
                      className="text-[#FFDD00] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Ver termos completos</span>
                    </button>
                  </div>
                </label>

                {termsError && (
                  <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{termsError}</span>
                  </div>
                )}
              </div>

              {/* Botão de Conclusão */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: vipThemeHex, color: '#000000' }}
                className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>REGISTRANDO PEDIDO DE ADESÃO...</span>
                  </>
                ) : (
                  <>
                    <span>CONCLUIR PEDIDO DE ADESÃO VIP</span>
                    <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Modal de Termos Completos de Doação e Regras */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111116] border border-[#FFDD00]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FFDD00]/20 text-[#FFDD00] border border-[#FFDD00]/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-[#FFDD00]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Termos de Adesão & Conduta VIP</h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Regras de doação voluntária, ausência de vínculo e conduta
                </p>
              </div>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-xs text-neutral-300 leading-relaxed font-sans divide-y divide-white/[0.08]">
              <div className="space-y-1.5 pt-1">
                <h4 className="text-white font-bold text-sm text-[#FFDD00]">1. Natureza de Doação Voluntária</h4>
                <p>
                  O valor transferido para acesso aos planos VIP (mensal via Mercado Pago, avulso via Pix ou YouTube) constitui doação financeira espontânea para cobrir custos com servidores, tráfego e pesquisas do portal. Não se caracteriza como compra de produto nem contratação de prestação de serviços continuados.
                </p>
              </div>

              <div className="space-y-1.5 pt-3">
                <h4 className="text-white font-bold text-sm text-[#FFDD00]">2. Inexistência de Vínculo de Associado</h4>
                <p>
                  A condição de membro ou apoiador é estritamente comunitária e de cortesia. Não cria vínculo empregatício, societário, cooperativo ou de associado estatutário ("vínculo de associado"), não havendo direitos de voto, governança ou obrigações contratuais comerciais recíprocas.
                </p>
              </div>

              <div className="space-y-1.5 pt-3">
                <h4 className="text-white font-bold text-sm text-[#FFDD00]">3. Regras de Conduta e Proibições</h4>
                <p>
                  É estritamente proibido: compartilhar dados de login com terceiros, praticar rateio, redistribuir ou comercializar arquivos obtidos na Área VIP, desrespeitar membros ou tentar burlar os sistemas de segurança da plataforma.
                </p>
              </div>

              <div className="space-y-1.5 pt-3">
                <h4 className="text-white font-bold text-sm text-red-400">4. Exclusão Sem Aviso Prévio e Sem Devolução</h4>
                <p>
                  Na hipótese de constatação de qualquer irregularidade, fraude ou violação destas regras, o acesso do usuário será rescindido sumariamente pela administração <strong>sem necessidade de aviso prévio e sem devolução, reembolso ou estorno do valor doado</strong>, dada a natureza consumada e irrevogável da doação.
                </p>
              </div>
            </div>

            <div className="pt-2 shrink-0 flex items-center justify-end gap-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setAcceptedDonationTerms(true);
                  setTermsError(null);
                  setShowTermsModal(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#FFDD00] hover:bg-[#ffe633] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
              >
                Li, Compreendi e Concordo com os Termos
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
