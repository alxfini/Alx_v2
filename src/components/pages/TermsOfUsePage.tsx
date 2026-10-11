import React, { useState } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Copy, 
  Check, 
  Printer, 
  Mail, 
  AlertTriangle, 
  Car, 
  Cpu, 
  ExternalLink, 
  Sparkles,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

export const TermsOfUsePage: React.FC = () => {
  const { brand, setActivePage } = useSiteData();
  const [copiedLink, setCopiedLink] = useState(false);

  const brandName = brand.brandName || 'Alx⁺';
  const effectiveDate = '08 de Outubro de 2026';
  const version = '2.3 (Isenção e Segurança)';

  const handleBack = () => {
    setActivePage({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/termos');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

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
            title="Copiar link direto dos Termos de Uso"
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Header Hero */}
        <div className="space-y-4 pb-8 border-b border-white/[0.08] relative z-10 print:border-black/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#FFDD00] text-xs font-mono font-bold tracking-wide">
            <FileText className="w-3.5 h-3.5" />
            <span>TERMOS DE USO & ISENÇÃO DE RESPONSABILIDADE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight print:text-black">
            Termos e Condições de Uso
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-3xl print:text-neutral-700">
            Bem-vindo à plataforma <strong className="text-white print:text-black font-semibold">{brandName}</strong>. Estes Termos de Uso regulam o acesso aos tutoriais, utilitários, instaladores e arquivos informativos disponibilizados. Ao utilizar qualquer ferramenta deste portal, você declara estar de acordo com as diretrizes e isenções aqui estabelecidas.
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

        {/* 4 Cards de Destaque / Disclaimers Vitais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          
          <div className="p-5 rounded-2xl bg-[#14141e] border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#FFDD00] flex items-center justify-center">
              <Car className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm font-heading">Sem Vínculo Montadoras</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Iniciativa independente. Não possuímos vínculo, afiliação ou representação com montadoras automotivas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141e] border border-[#FFDD00]/30 hover:border-[#FFDD00]/60 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-[#FFDD00] flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm font-heading">Adesão VIP é Doação</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Toda adesão é doação voluntária para custeio de servidores. Não gera vínculo de associado nem prestação de serviços.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141e] border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm font-heading">Verificação com Antivírus</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Todos os APKs e pacotes passam por checagem antivírus prévia para certificar a ausência de ameaças conhecidas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141e] border border-red-500/20 hover:border-red-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm font-heading">Isenção por Erros de Instalação</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Procedimentos técnicos executados por conta e risco do usuário. Não respondemos por falhas de manuseio.
            </p>
          </div>

        </div>

        {/* Seções Detalhadas dos Termos */}
        <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
          
          {/* Seção 1 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">1</span>
              <h2>Natureza Independente da Plataforma</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-2 leading-relaxed">
              <p>
                A plataforma <strong>{brandName}</strong> é uma iniciativa técnica comunitária e independente, criada com o objetivo de compartilhar estudos, tutoriais de customização, calculadoras automotivas e pacotes informativos voltados para entusiastas e proprietários de veículos elétricos e híbridos.
              </p>
              <p>
                O portal não comercializa veículos, não presta assistência técnica autorizada e não possui relação societária com fabricantes da indústria automobilística.
              </p>
            </div>
          </section>

          {/* Seção 2: Ausência de Vínculo com Montadoras (BYD, etc.) */}
          <section className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-3">
            <div className="flex items-center gap-2.5 text-[#FFDD00] font-heading font-bold text-base sm:text-lg">
              <Car className="w-5 h-5 shrink-0" />
              <h2>2. Ausência Total de Vínculo com Montadoras Automotivas</h2>
            </div>
            <div className="text-neutral-300 text-xs sm:text-sm space-y-2.5 leading-relaxed">
              <p>
                Declaramos expressamente para todos os fins de direito que a plataforma <strong>{brandName}</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-300 pl-2">
                <li>
                  <strong>NÃO possui vínculo comercial, institucional, societário ou contratual</strong> com a <em>BYD Company Ltd.</em>, <em>BYD Auto Brasil</em>, ou com qualquer outra montadora de automóveis nacional ou internacional.
                </li>
                <li>
                  <strong>NÃO atua como representante oficial, concessionária, distribuidora ou prestadora de serviços credenciada</strong> de nenhuma montadora.
                </li>
                <li>
                  Todas as marcas, logotipos, nomes de modelos (Dolphin, Song Plus, Yuan, Seal, Han, etc.) e termos técnicos mencionados em nossos tutoriais pertencem aos seus respectivos titulares de direitos e são utilizados unicamente para <strong>identificação descritiva e compatibilidade técnica</strong>, conforme facultado pela legislação aplicável.
                </li>
              </ul>
            </div>
          </section>

          {/* Seção 3: Aplicativos de Terceiros e Varredura Antivírus */}
          <section className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400 font-heading font-bold text-base sm:text-lg">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h2>3. Softwares de Terceiros e Verificação Antivírus</h2>
            </div>
            <div className="text-neutral-300 text-xs sm:text-sm space-y-2.5 leading-relaxed">
              <p>
                Os aplicativos Android (arquivos APK) mencionados, catalogados ou disponibilizados para download na plataforma são desenvolvidos e publicados por terceiros e desenvolvedores independentes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 space-y-1.5">
                  <h4 className="text-emerald-400 font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compromisso de Varredura Antivírus:
                  </h4>
                  <p className="text-xs text-neutral-300">
                    Todos os pacotes de instalação passam por verificação prévia de segurança com ferramentas antivírus consagradas (como motores VirusTotal e scanners de integridade) antes da inclusão no catálogo, buscando certificar a inexistência de malwares conhecidos.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20 space-y-1.5">
                  <h4 className="text-amber-400 font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Ausência de Vínculo com Distribuição:
                  </h4>
                  <p className="text-xs text-neutral-300">
                    A plataforma <strong>{brandName}</strong> não é proprietária, mantenedora nem distribuidora oficial desses aplicativos. Não temos controle sobre o código-fonte interno, atualizações futuras, compatibilidade com versões de firmware ou políticas de terceiros.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 4: Isenção de Responsabilidade por Erros de Instalação */}
          <section className="p-6 rounded-2xl bg-red-500/5 border border-red-500/25 space-y-3">
            <div className="flex items-center gap-2.5 text-red-400 font-heading font-bold text-base sm:text-lg">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2>4. Isenção de Responsabilidade por Falhas ou Erros de Instalação</h2>
            </div>
            <div className="text-neutral-300 text-xs sm:text-sm space-y-2.5 leading-relaxed">
              <p>
                A aplicação de tutoriais, modificações, desbloqueios ou instalação de pacotes APK em sistemas multimídia automotivos envolve procedimentos técnicos que devem ser executados com cautela e atenção pelo próprio proprietário do veículo:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-300 pl-2">
                <li>
                  <strong>Execução por Conta e Risco:</strong> O usuário é integralmente responsável por seguir as etapas recomendadas, verificar a versão do seu sistema e certificar-se das condições do seu veículo antes de qualquer alteração.
                </li>
                <li>
                  <strong>Erros de Procedimento e Mau Uso:</strong> A plataforma <strong>{brandName}</strong> e seus administradores <strong>NÃO se responsabilizam</strong> por falhas decorrentes de instalações erradas, incompatibilidade de hardware, interrupções abruptas de energia durante processos, arquivos corrompidos por pendrives defeituosos ou perda de garantia de fábrica decorrente de intervenções do usuário.
                </li>
                <li>
                  <strong>Garantia de Funcionamento:</strong> Embora os procedimentos sejam testados exaustivamente na comunidade, atualizações automáticas de montadoras (OTA) ou versões de firmware específicas podem alterar o comportamento do sistema sem aviso prévio.
                </li>
              </ul>
            </div>
          </section>

          {/* Seção 5: Adesão à Área VIP - Natureza de Doação Voluntária, Ausência de Vínculo e Exclusão por Irregularidades */}
          <section className="p-6 rounded-2xl bg-[#141422] border border-[#FFDD00]/30 space-y-4">
            <div className="flex items-center gap-2.5 text-[#FFDD00] font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-[#FFDD00]/20 text-[#FFDD00] border border-[#FFDD00]/30 flex items-center justify-center text-xs font-mono font-bold">5</span>
              <h2>5. Adesão à Área VIP: Doação Voluntária, Ausência de Vínculo e Exclusão por Irregularidades</h2>
            </div>
            <div className="text-neutral-300 text-xs sm:text-sm space-y-3 leading-relaxed">
              <p>
                O acesso à <strong>Área VIP</strong> e aos seus benefícios (downloads diretos, tutoriais fechados, firmwares e materiais de pesquisa) segue regras estritas de apoio comunitário e conformidade:
              </p>
              
              <div className="space-y-2.5 pl-2">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <strong className="text-white font-bold block text-xs uppercase tracking-wide text-[#FFDD00]">
                    5.1. Natureza Exclusiva de Doação Voluntária (Sem Prestação Comercial de Serviços)
                  </strong>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    Toda e qualquer adesão, contribuição financeira ou plano (seja mensal recorrente via Mercado Pago, avulso via Pix ou apoio ao canal no YouTube) possui <strong>caráter estritamente voluntário sob a modalidade de doação espontânea</strong>. O valor destina-se exclusivamente a cobrir os custos operacionais de hospedagem, servidores de alta velocidade, tráfego de dados e pesquisa técnica independente do portal. <strong>Não se trata de compra de produto nem de contratação de prestação de serviços continuados.</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <strong className="text-white font-bold text-xs uppercase tracking-wide text-[#FFDD00] block">
                    5.2. Inexistência de Vínculo de Associado ou Direitos Societários
                  </strong>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    A participação na Área VIP e a denominação "membro" ou "apoiador" possuem sentido unicamente comunitário de reconhecimento e cortesia. <strong>NÃO geram qualquer vínculo de associado estatutário, societário, corporativo, trabalhista ou consumerista</strong>, nem conferem qualquer direito de governança, copropriedade ou exigência de disponibilidade contínua de conteúdos específicos.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-red-500/20 space-y-1">
                  <strong className="text-white font-bold text-xs uppercase tracking-wide text-red-400 block">
                    5.3. Regras de Conduta, Irregularidades e Exclusão Sumária Sem Devolução
                  </strong>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    O acesso aos arquivos é individual e intransferível. São expressamente proibidas condutas irregulares, incluindo, mas não se limitando a: rateio ou compartilhamento público de credenciais, redistribuição ou revenda não autorizada de arquivos obtidos no portal, engenharia reversa com fins maliciosos, ofensas à administração ou outros membros, ou qualquer tentativa de fraude.
                  </p>
                  <p className="text-amber-200 font-semibold text-xs leading-relaxed pt-1">
                    Havendo constatação de qualquer irregularidade ou desrespeito às regras, o membro poderá ser <strong>excluído e ter seu acesso cancelado imediatamente, sem necessidade de aviso prévio e sem qualquer devolução, estorno ou reembolso de valores</strong>, uma vez que a contribuição financeira teve caráter de doação voluntária consumada.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 6 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">6</span>
              <h2>6. Propriedade Intelectual e Uso do Conteúdo</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-2 leading-relaxed">
              <p>
                Os manuais explicativos, identidade visual do portal, calculadoras interativas e a curadoria dos guias foram produzidos pela equipe <strong>{brandName}</strong> e estão protegidos pelas normas de direito autoral.
              </p>
              <p>
                É autorizado o uso pessoal e não comercial. É proibida a cópia integral ou redistribuição paga dos guias sem autorização expressa prévia.
              </p>
            </div>
          </section>

          {/* Seção 7 */}
          <section className="p-6 rounded-2xl bg-[#13131c] border border-white/[0.06] space-y-3 print:bg-transparent print:border-b print:border-black/10 print:p-0">
            <div className="flex items-center gap-2.5 text-white font-heading font-bold text-base sm:text-lg">
              <span className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-mono font-bold">7</span>
              <h2>7. Alterações e Atualização dos Termos</h2>
            </div>
            <div className="text-neutral-400 text-xs sm:text-sm space-y-2 leading-relaxed">
              <p>
                A plataforma reserva-se o direito de atualizar, revisar ou complementar estes Termos de Uso periodicamente, refletindo novas funcionalidades, evolução técnica ou alterações legislativas.
              </p>
              <p>
                A versão mais recente estará sempre disponível nesta página com a respectiva data de atualização informada.
              </p>
            </div>
          </section>

          {/* Seção 8: Suporte e Contato */}
          <section className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#14141f] via-[#12121a] to-[#14141f] border border-[#FFDD00]/30 space-y-4 print:border-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-[#FFDD00] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#FFDD00] font-bold uppercase tracking-wider block">Dúvidas sobre os Termos</span>
                <h2 className="text-white font-heading font-bold text-lg">8. Canal de Comunicação</h2>
              </div>
            </div>

            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Caso você tenha dúvidas sobre os presentes termos, isenções ou deseje reportar algum conteúdo ou aplicativo, entre em contato através da página Fale Conosco:
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setActivePage({ type: 'contato' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFDD00] hover:bg-[#ffe633] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FFDD00]/20 cursor-pointer active:scale-98"
              >
                <span>Fale Conosco</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </section>

          {/* Aditivo Personalizado da Administração (se houver texto configurado no Admin) */}
          {brand.termsText && brand.termsText.trim().length > 0 && (
            <section className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-[#FFDD00] font-heading font-bold text-sm sm:text-base">
                <Sparkles className="w-4 h-4" />
                <h3>Notas Especiais da Administração</h3>
              </div>
              {renderCustomParagraphs(brand.termsText)}
            </section>
          )}

        </div>

        {/* Rodapé Interno da Página */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-400 print:text-neutral-600">
          <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActivePage({ type: 'privacidade' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Política de Privacidade
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
