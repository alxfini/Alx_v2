import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  EyeOff, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Copy, 
  Check, 
  Printer, 
  Trash2, 
  HardDrive, 
  RefreshCw, 
  UserCheck, 
  Cookie, 
  Key,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { brand, setActivePage } = useSiteData();
  const [copiedLink, setCopiedLink] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const brandName = brand.brandName || 'Alx⁺';
  const effectiveDate = '08 de Outubro de 2026';
  const version = '2.4 (Revisão LGPD)';

  const handleBack = () => {
    setActivePage({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/privacidade');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearLocalData = () => {
    try {
      // Clears non-critical preferences from localStorage
      const keysToClear = [
        'alx_theme_preference',
        'alx_recent_searches',
        'alx_filter_state',
        'alx_music_volume'
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
      setClearSuccess(true);
      setIsConfirmingClear(false);
      setTimeout(() => setClearSuccess(false), 3000);
    } catch (e) {
      console.error('Erro ao limpar preferências locais', e);
    }
  };

  // Renderizador de parágrafos customizados caso o admin adicione notas
  const renderCustomParagraphs = (text: string) => {
    const paragraphs = text.split('\n').filter((p) => p.trim().length > 0);
    return (
      <div className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121217] hover:bg-[#1c1c24] border border-white/[0.08] hover:border-white/[0.18] text-neutral-300 hover:text-white text-xs font-mono transition-all cursor-pointer group shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar para o Início</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121217] hover:bg-[#1c1c24] border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm"
            title="Copiar link direto da Política de Privacidade"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121217] hover:bg-[#1c1c24] border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#101017] border border-white/[0.1] rounded-3xl p-6 sm:p-10 lg:p-12 space-y-10 shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Glow de fundo sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1DB954]/5 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Header Hero */}
        <div className="space-y-4 pb-8 border-b border-white/[0.08] relative z-10 print:border-black/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PROTEÇÃO DE DADOS & LGPD (LEI Nº 13.709/2018)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight print:text-black">
            Política de Privacidade
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-3xl print:text-neutral-700">
            A plataforma <strong className="text-white print:text-black font-semibold">{brandName}</strong> valoriza e prioriza a proteção da sua privacidade digital. Este documento esclarece com total clareza e transparência como seus dados são geridos, nossas políticas contra rastreamento invasivo e como você exerce controle total sobre suas informações.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-mono text-neutral-400 print:text-neutral-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Última atualização: <strong className="text-neutral-300 print:text-black">{effectiveDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Versão do documento: <strong className="text-neutral-300 print:text-black">{version}</strong></span>
            </div>
          </div>
        </div>

        {/* 4 Cards de Princípios / Resumo Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <div className="p-5 rounded-2xl bg-[#14141e] border border-white/[0.06] hover:border-emerald-500/30 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <EyeOff className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm font-heading">Zero Rastreamento Invasivo</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Não instalamos rastreadores de terceiros ou pixels publicitários para espionar seu comportamento fora do site.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141e] border border-white/[0.06] hover:border-[#FFDD00]/30 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFDD00]/10 border border-[#FFDD00]/20 text-[#FFDD00] flex items-center justify-center">
              <HardDrive className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm font-heading">Armazenamento no Aparelho</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Suas preferências de tema, favoritos e volume ficam salvas no <code className="text-[#FFDD00]">LocalStorage</code> do seu navegador.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141e] border border-white/[0.06] hover:border-blue-500/30 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm font-heading">Nunca Vendemos Dados</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Não comercializamos, alugamos nem cedemos dados de contato ou cadastros de membros a empresas de marketing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141e] border border-white/[0.06] hover:border-purple-500/30 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm font-heading">Controle Total do Usuário</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Você tem total autonomia para solicitar exclusão, alteração ou limpar seus dados locais a qualquer instante.
            </p>
          </div>
        </div>

        {/* Seções Detalhadas da Política */}
        <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
          
          {/* Seção 1 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">1</span>
              <h2>Identificação da Plataforma e Controlador</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-2 leading-relaxed">
              <p>
                A plataforma <strong>{brandName}</strong> atua como ecossistema independente especializado em soluções de multimídia veicular, personalização, tutoriais técnicos e aplicativos embarcados para veículos elétricos e híbridos (com ênfase na linha BYD DiLink).
              </p>
              <p className="text-neutral-300">
                <strong>Ausência de Vínculo:</strong> Declaramos que não temos nenhuma ligação societária, afiliação comercial ou representação oficial com a montadora <em>BYD Auto</em> ou qualquer outra marca automotiva. Da mesma forma, os aplicativos APK catalogados são criados por desenvolvedores independentes e passam por varreduras antivírus prévias, não havendo responsabilidade da plataforma por sua distribuição externa ou erros de instalação do usuário.
              </p>
              <p>
                Para os efeitos da Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD), a equipe responsável pela administração da plataforma atua na condição de <strong>Controladora</strong> no que tange aos dados estritamente necessários para a operação do portal e suporte aos usuários.
              </p>
            </div>
          </section>

          {/* Seção 2 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">2</span>
              <h2>Quais Dados Tratamos e Quais NÃO Coletamos</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-3 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-black/30 border border-white/[0.04] space-y-2">
                  <h4 className="text-white font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    O que podemos processar:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
                    <li>Preferências salvas no navegador (tema de cores, itens favoritos).</li>
                    <li>Dados de contato voluntários (e-mail, WhatsApp ou mensagens enviadas para suporte).</li>
                    <li>Credenciais de acesso à Área de Membros / VIP (quando contratado).</li>
                    <li>Registros técnicos básicos essenciais para segurança contra ataques DDoS.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-white/[0.04] space-y-2">
                  <h4 className="text-white font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    O que NÃO coletamos:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
                    <li>Não rastreamos geolocalização GPS em tempo real.</li>
                    <li>Não armazenamos dados sensíveis como biometria, religião ou saúde.</li>
                    <li>Não guardamos números de cartão de crédito no nosso servidor.</li>
                    <li>Não utilizamos pixels invasivos de corretores de dados (data brokers).</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Diretriz Específica: Membros VIP, Natureza de Doação Voluntária e Rescisão por Irregularidades */}
          <section className="p-6 rounded-2xl bg-[#141422] border border-[#FFDD00]/30 space-y-3">
            <div className="flex items-center gap-2.5 text-[#FFDD00] font-heading font-bold text-base sm:text-lg">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h2>Adesão à Área VIP: Doação Voluntária, Ausência de Vínculo e Exclusão por Irregularidades</h2>
            </div>
            <div className="text-neutral-300 text-xs sm:text-sm space-y-2.5 leading-relaxed">
              <p>
                No que concerne aos dados de cadastro e privilégios concedidos aos apoiadores da <strong>Área VIP</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-neutral-300 pl-2">
                <li>
                  <strong>Natureza Exclusiva de Doação Voluntária:</strong> Toda e qualquer adesão financeira ou assinatura (Mercado Pago, Pix ou canais parceiros) possui caráter estritamente voluntário sob forma de doação espontânea para cobrir custos de servidores, downloads de alta velocidade e pesquisas independentes da plataforma. <strong>Não constitui contratação de prestação de serviços nem relação de consumo comercial.</strong>
                </li>
                <li>
                  <strong>Inexistência de Vínculo de Associado ou Direitos Societários:</strong> A participação do membro é de cortesia comunitária. <strong>Não gera qualquer vínculo de associado, societário, corporativo, trabalhista ou estatutário</strong>, nem confere direitos de governança ou disponibilidade permanente de conteúdos específicos.
                </li>
                <li>
                  <strong>Exclusão Sumária por Irregularidades Sem Devolução:</strong> Havendo qualquer irregularidade (tais como rateio ou repasse público de credenciais, redistribuição ou revenda indevida de arquivos restritos, conduta ofensiva ou tentativa de invasão), o usuário poderá ter sua <strong>conta e acesso cancelados imediatamente, sem necessidade de aviso prévio e sem devolução ou reembolso de valores</strong>, dada a natureza consumada da doação voluntária.
                </li>
              </ul>
            </div>
          </section>

          {/* Seção 3 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">3</span>
              <h2>Finalidade e Bases Legais do Tratamento</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-2 leading-relaxed">
              <p>O tratamento de dados restringe-se a finalidades legítimas e transparentes:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs text-neutral-300">
                <li className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  • <strong>Execução de Serviço:</strong> Atender solicitações de suporte, fornecimento de APKs homologados e tutoriais.
                </li>
                <li className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  • <strong>Consentimento:</strong> Mensagens voluntárias enviadas por formulário de contato ou canais oficiais.
                </li>
                <li className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  • <strong>Legítimo Interesse:</strong> Aprimoramento da performance técnica da interface e prevenção contra fraudes.
                </li>
                <li className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  • <strong>Cumprimento Legal:</strong> Registro de acessos conforme exigido pelo Marco Civil da Internet (Lei 12.965/2014).
                </li>
              </ul>
            </div>
          </section>

          {/* Seção 4 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">4</span>
              <h2>Armazenamento Local (LocalStorage) e Cookies</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-2 leading-relaxed">
              <p>
                Diferente de portais que espalham dezenas de cookies invasivos, nossa aplicação utiliza principalmente o <strong>LocalStorage</strong> direto do seu dispositivo para:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300 pl-2">
                <li>Lembrar se você prefere o modo expandido ou compacto nos tutoriais e player;</li>
                <li>Salvar sua cor de destaque preferida configurada para as seções;</li>
                <li>Manter sua sessão de autenticação ativa (caso você seja administrador ou membro VIP).</li>
              </ul>
              <p className="text-xs text-neutral-400 pt-1">
                Esses dados permanecem unicamente gravados no seu próprio navegador e não são transmitidos para redes de publicidade.
              </p>
            </div>
          </section>

          {/* Seção 5 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">5</span>
              <h2>Serviços de Terceiros e Links Externos</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-3 leading-relaxed">
              <p>
                Para enriquecer a experiência, o portal disponibiliza integrações e botões para serviços externos consagrados:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                  <strong className="text-white block font-heading mb-1">Spotify & YouTube</strong>
                  <p className="text-neutral-400">
                    Os reprodutores embutidos podem operar sob as políticas de privacidade da Spotify AB e Google LLC.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                  <strong className="text-white block font-heading mb-1">WhatsApp & Telegram</strong>
                  <p className="text-neutral-400">
                    O suporte e grupos comunitários operam com criptografia de ponta a ponta gerida pelas respectivas plataformas.
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-400">
                Recomendamos consultar as políticas de privacidade desses provedores ao utilizar seus serviços dedicados.
              </p>
            </div>
          </section>

          {/* Seção 6 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">6</span>
              <h2>Seus Direitos como Titular (Artigo 18 da LGPD)</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-2 leading-relaxed">
              <p>Em total respeito à legislação brasileira, você possui os seguintes direitos garantidos:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <strong className="text-white block mb-0.5">1. Confirmação & Acesso</strong>
                  <span>Saber se tratamos algum dado seu e obter cópia das informações.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <strong className="text-white block mb-0.5">2. Correção</strong>
                  <span>Corrigir dados cadastrais incompletos, inexatos ou desatualizados.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <strong className="text-white block mb-0.5">3. Anonimização / Eliminação</strong>
                  <span>Solicitar a exclusão definitiva de seus dados de contato dos nossos canais.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <strong className="text-white block mb-0.5">4. Portabilidade</strong>
                  <span>Receber seus dados em formato estruturado e interoperável.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <strong className="text-white block mb-0.5">5. Revogação de Consentimento</strong>
                  <span>Retirar autorizações concedidas anteriormente de forma simples e gratuita.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <strong className="text-white block mb-0.5">6. Informação sobre Compartilhamento</strong>
                  <span>Transparência de que nenhuma informação é vendida a terceiros.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 7 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">7</span>
              <h2>Segurança da Informação e Criptografia</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-2 leading-relaxed">
              <p>
                Adotamos medidas técnicas e administrativas compatíveis com os padrões da indústria para proteger a plataforma contra acessos não autorizados:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300 pl-2">
                <li>Tráfego 100% criptografado através de certificado SSL/TLS (HTTPS de ponta a ponta);</li>
                <li>Proteção contra injeção de scripts (XSS) e cabeçalhos de segurança HTTP modernos;</li>
                <li>Isolamento de credenciais administrativas com autenticação rigorosa;</li>
                <li>Backups periódicos e monitoramento contínuo de integridade do sistema.</li>
              </ul>
            </div>
          </section>

          {/* Seção 8: Contato do Encarregado (DPO) */}
          <section className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#14141f] via-[#12121a] to-[#14141f] border border-emerald-500/30 space-y-4 print:border-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Canal Oficial de Privacidade</span>
                <h2 className="text-white font-heading font-bold text-lg">Encarregado de Proteção de Dados (DPO)</h2>
              </div>
            </div>

            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Para exercer qualquer um dos seus direitos da LGPD, solicitar exclusão de dados ou esclarecer dúvidas sobre esta política, entre em contato através da página Fale Conosco:
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActivePage({ type: 'contato' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-98"
              >
                <span>Fale Conosco</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </section>

          {/* Aditivo Personalizado da Administração (se houver texto configurado no Admin) */}
          {brand.privacyText && brand.privacyText.trim().length > 0 && (
            <section className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-[#ebbf01] font-heading font-bold text-sm sm:text-base">
                <Sparkles className="w-4 h-4" />
                <h3>Notas Especiais e Atualizações Adicionais</h3>
              </div>
              {renderCustomParagraphs(brand.privacyText)}
            </section>
          )}

        </div>

        {/* Ferramenta Interativa: Gerenciar Preferências do Navegador (LocalStorage) */}
        <div className="pt-6 border-t border-white/[0.08] space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0d0d12] border border-white/[0.06]">
            <div className="space-y-1">
              <h4 className="text-white font-bold text-sm font-heading flex items-center gap-2">
                <Database className="w-4 h-4 text-neutral-400" />
                Gerenciar Dados Locais deste Navegador
              </h4>
              <p className="text-neutral-400 text-xs">
                Quer resetar as preferências visuais, filtros e histórico temporário salvos no seu aparelho?
              </p>
            </div>

            <div>
              {clearSuccess ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono">
                  <Check className="w-4 h-4" />
                  <span>Dados Locais Limpos!</span>
                </div>
              ) : isConfirmingClear ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearLocalData}
                    className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs font-mono transition-all cursor-pointer"
                  >
                    Confirmar Limpeza
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-mono transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-red-500/20 border border-white/[0.08] hover:border-red-500/30 text-neutral-300 hover:text-red-400 text-xs font-mono transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Preferências do Navegador</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé Interno da Página */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-400 print:text-neutral-600">
          <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActivePage({ type: 'termos' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActivePage({ type: 'sobre' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sobre a Plataforma
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActivePage({ type: 'contato' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Fale Conosco
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
