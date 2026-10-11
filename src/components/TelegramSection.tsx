import React from 'react';
import { Send, Users, Sparkles, MessageCircle, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

interface TelegramSectionProps {
  isStandalone?: boolean;
}

export const TelegramSection: React.FC<TelegramSectionProps> = ({ isStandalone = false }) => {
  return (
    <section id="telegram" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#09090C] border-t border-white/[0.06] relative`}>
      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10">
        
        {/* Modern Bento Community Card */}
        <div className="bg-gradient-to-b from-[#15151B] to-[#0E0E12] border border-white/[0.08] hover:border-[var(--color-brand)]/40 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl transition-all duration-300 group">
          
          {/* Ambient Glow suave mantido na esquerda */}
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-[var(--color-brand)]/6 blur-[120px] pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0088cc] uppercase tracking-wider bg-[#1A1A22] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
                <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                <span>Comunidade Oficial ALX • Telegram & Atendimento</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading leading-tight">
                Junte-se a milhares de donos de carros elétricos.
              </h2>

              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-xl">
                Receba em primeira mão alertas de novas atualizações OTA, links diretos de APKs, avisos de novos vídeos e tire dúvidas com a comunidade mais ativa no Telegram.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href={siteConfig.links.telegram || 'https://t.me/alxgarage'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#0088cc] hover:bg-[#0077b3] text-white font-extrabold text-xs tracking-wider uppercase hover:shadow-xl hover:shadow-[#0088cc]/25 transition-all duration-200 shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>ENTRAR NO CANAL TELEGRAM</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>
              </div>
            </div>

            {/* Right Live Channel Radar Box */}
            <div className="lg:col-span-5 bg-[#0A0A0E] border border-white/[0.06] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ebbf01] animate-ping" />
                  <span className="text-xs font-mono font-bold text-white uppercase">Radar do Canal</span>
                </div>
                <span className="text-[10px] font-mono text-[#ebbf01] bg-[#ebbf01]/10 px-2 py-0.5 rounded border border-[#ebbf01]/20">
                  +10.000 membros
                </span>
              </div>

              {/* Feed items */}
              <div className="space-y-2.5">
                {[
                  { tag: 'APK LANÇADO', msg: 'Nova versão do ALX Telemetria v2.1 liberada no canal!', time: 'há 10 min' },
                  { tag: 'DICA DILINK', msg: 'Como fixar o Waze em tela cheia na nova build 2026.', time: 'há 1h' },
                  { tag: 'DISCUSSÃO', msg: 'Testes de consumo na Rodovia Imigrantes com BYD Seal.', time: 'há 3h' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#121217] p-3 rounded-xl border border-white/[0.04] space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-[#ebbf01]">{item.tag}</span>
                      <span className="text-neutral-500">{item.time}</span>
                    </div>
                    <p className="text-xs text-neutral-300">{item.msg}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-center text-neutral-500">
                Canal moderado e 100% livre de spam
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
