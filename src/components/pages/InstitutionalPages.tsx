import React from 'react';
import { ShieldCheck, FileText, Info, ArrowLeft, CheckCircle2, Car, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { PrivacyPolicyPage } from './PrivacyPolicyPage';
import { TermsOfUsePage } from './TermsOfUsePage';

interface InstitutionalPagesProps {
  type: 'sobre' | 'termos' | 'privacidade';
}

export const InstitutionalPages: React.FC<InstitutionalPagesProps> = ({ type }) => {
  const { brand, setActivePage } = useSiteData();

  const brandName = brand.brandName || 'Alx⁺';

  const handleBack = () => {
    setActivePage({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Renderizador de texto customizado com parágrafos
  const renderCustomContent = (text: string) => {
    const paragraphs = text.split('\n').filter((p) => p.trim().length > 0);
    return (
      <div className="space-y-4 text-sm text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="text-neutral-300 leading-relaxed text-sm">
            {p}
          </p>
        ))}
      </div>
    );
  };

  if (type === 'sobre') {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o Início</span>
        </button>

        <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6 text-neutral-300 leading-relaxed">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-3 rounded-2xl bg-[#FFDD00]/10 border border-[#FFDD00]/20 text-[#FFDD00]">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#FFDD00] uppercase tracking-wider block">Institucional</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">Sobre a Plataforma {brandName}</h1>
            </div>
          </div>

          {/* Aviso Explícito de Independência de Montadoras */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-xs text-neutral-200">
            <Car className="w-5 h-5 text-[#FFDD00] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white font-bold block">Declaração de Independência e Ausência de Vínculo com Montadoras:</strong>
              <p className="text-neutral-300 leading-relaxed">
                A <strong>{brandName}</strong> é uma iniciativa comunitária técnica totalmente independente. <strong>Não possuímos qualquer ligação, vínculo comercial, representação ou parceria oficial com a BYD Auto ou qualquer outra montadora de veículos.</strong> Os aplicativos disponibilizados passam por verificação prévia de antivírus e são de autoria de seus respectivos desenvolvedores.
              </p>
            </div>
          </div>

          {/* Declaração sobre a Área VIP: Natureza de Doação Voluntária e Ausência de Vínculo de Associado */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#161622] border border-amber-500/25 flex items-start gap-3.5 text-xs text-neutral-200">
            <ShieldCheck className="w-5 h-5 text-[#FFDD00] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white font-bold block">Apoio Comunitário & Área VIP (Doação Voluntária):</strong>
              <p className="text-neutral-300 leading-relaxed">
                Toda adesão ou colaboração destinada à <strong>Área VIP</strong> é realizada exclusivamente sob a forma de <strong>doação voluntária</strong> para suporte e custeio dos servidores, pesquisas e manutenção da infraestrutura independente da plataforma. Essa contribuição <strong>não constitui prestação de serviços continuados nem confere direitos de associado ou vínculo corporativo/societário</strong>. O acesso aos recursos é uma cortesia concedida aos colaboradores e apoiadores. Em caso de constatação de irregularidades, pirataria, repasse indevido ou descumprimento das diretrizes da comunidade, o usuário poderá ser <strong>excluído sem aviso prévio e sem devolução de valores doados</strong>, visto que se trata de uma forma de doação espontânea e não de prestação de serviços.
              </p>
            </div>
          </div>

          {brand.aboutText && brand.aboutText.trim().length > 0 ? (
            renderCustomContent(brand.aboutText)
          ) : (
            <>
              <p className="text-base text-neutral-200 leading-relaxed">
                A <strong>{brandName}</strong> é um ecossistema independente dedicado à tecnologia automotiva, focado na evolução dos veículos elétricos (EVs) e nos sistemas multimídia embarcados (com destaque para a linha BYD DiLink).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#181824] border border-white/5 space-y-2">
                  <CheckCircle2 className="w-5 h-5 text-[#FFDD00]" />
                  <h3 className="font-bold text-white text-sm">Tecnologia & Inovação</h3>
                  <p className="text-xs text-neutral-400">
                    Desenvolvemos e disponibilizamos ferramentas, calculadoras e instaladores seguros para a comunidade.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#181824] border border-white/5 space-y-2">
                  <CheckCircle2 className="w-5 h-5 text-[#FFDD00]" />
                  <h3 className="font-bold text-white text-sm">Comunidade Ativa</h3>
                  <p className="text-xs text-neutral-400">
                    Conectamos milhares de proprietários e entusiastas em discussões técnicas, testes e suporte colaborativo.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#181824] border border-white/5 space-y-2">
                  <CheckCircle2 className="w-5 h-5 text-[#FFDD00]" />
                  <h3 className="font-bold text-white text-sm">Conteúdo Homologado</h3>
                  <p className="text-xs text-neutral-400">
                    Tutoriais passo a passo e aplicativos rigorosamente testados para garantir estabilidade e desempenho.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-neutral-400 font-mono">
                <p>• Plataforma técnica independente sem vínculo direto com montadoras automotivas.</p>
              </div>
            </>
          )}

          {/* Canal de Atendimento / Contato */}
          <section className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#14141f] via-[#12121a] to-[#14141f] border border-[#FFDD00]/30 space-y-4 print:border-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-[#FFDD00] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#FFDD00] font-bold uppercase tracking-wider block">Dúvidas ou Sugestões</span>
                <h2 className="text-white font-heading font-bold text-lg">Canal de Comunicação</h2>
              </div>
            </div>

            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Caso você tenha dúvidas sobre a plataforma, sugestões ou deseje reportar algum conteúdo ou aplicativo, entre em contato através da página Fale Conosco:
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

          {/* Rodapé Interno da Página */}
          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-400 print:text-neutral-600">
            <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setActivePage({ type: 'termos' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Termos de Uso
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setActivePage({ type: 'privacidade' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Política de Privacidade
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setActivePage({ type: 'contato' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Fale Conosco
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'termos') {
    return <TermsOfUsePage />;
  }

  // Privacidade
  return <PrivacyPolicyPage />;
};

