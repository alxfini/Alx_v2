import React, { useState, useEffect, useRef } from 'react';
import { 
  Megaphone, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Star, 
  Bell, 
  Shield, 
  Sparkles, 
  Info, 
  Link as LinkIcon,
  MessageSquare
} from 'lucide-react';
import { VipInfoCard } from '../../types';
import { SocialIcon } from '../common/SocialIcon';

interface VipCardsCarouselProps {
  cards?: VipInfoCard[];
  defaultWhatsappUrl?: string;
  defaultMuralTitle?: string;
  defaultMuralMessage?: string;
}

export const VipCardsCarousel: React.FC<VipCardsCarouselProps> = ({
  cards,
  defaultWhatsappUrl,
  defaultMuralTitle,
  defaultMuralMessage,
}) => {
  // Constrói lista de cards padrão caso não haja cards configurados
  const resolvedCards: VipInfoCard[] = React.useMemo(() => {
    if (cards && cards.length > 0) {
      return cards;
    }

    return [
      {
        id: 'default-mural',
        title: defaultMuralTitle || 'Mural de Avisos & Comunicados VIP',
        badge: 'Mural de Avisos',
        description: defaultMuralMessage || 'Bem-vindo ao espaço exclusivo de membros! Fique atento às novas atualizações de APKs, firmwares e tutoriais disponibilizados periodicamente nesta área.',
        color: '#ef4444',
        icon: 'megaphone',
        active: true,
        order: 1,
      },
      {
        id: 'default-whatsapp',
        title: 'Grupo Alx⁺ VIP',
        badge: 'Comunidade VIP',
        description: 'Faça parte da comunidade exclusiva no WhatsApp! Conecte-se diretamente com outros membros VIP, tire dúvidas e receba avisos em primeira mão.',
        color: '#25D366',
        icon: 'whatsapp',
        buttonText: 'Grupo Alx⁺ VIP',
        buttonUrl: defaultWhatsappUrl || 'https://chat.whatsapp.com',
        active: true,
        order: 2,
      },
    ];
  }, [cards, defaultMuralTitle, defaultMuralMessage, defaultWhatsappUrl]);

  // Filtra apenas os cards ativos / visíveis
  const visibleCards = React.useMemo(() => {
    return resolvedCards
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [resolvedCards]);

  // Estado do carrossel para quando tiver 3 ou mais cards
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalCards = visibleCards.length;

  // Rotação automática por 20 segundos para 3 ou mais cards
  useEffect(() => {
    if (totalCards < 3 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalCards);
    }, 20000); // 20s como solicitado pelo usuário

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalCards, isHovered]);

  if (totalCards === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  // Renderizador de ícone dinâmico
  const renderCardIcon = (iconName?: string, colorHex: string = '#ebbf01') => {
    const norm = (iconName || '').toLowerCase().trim();
    if (norm === 'whatsapp') {
      return <SocialIcon platform="whatsapp" className="w-5 h-5 text-inherit" />;
    }
    if (norm === 'bell') {
      return <Bell className="w-5 h-5 text-inherit" />;
    }
    if (norm === 'star') {
      return <Star className="w-5 h-5 text-inherit" />;
    }
    if (norm === 'shield') {
      return <Shield className="w-5 h-5 text-inherit" />;
    }
    if (norm === 'sparkles') {
      return <Sparkles className="w-5 h-5 text-inherit" />;
    }
    if (norm === 'info') {
      return <Info className="w-5 h-5 text-inherit" />;
    }
    if (norm === 'link') {
      return <LinkIcon className="w-5 h-5 text-inherit" />;
    }
    if (norm === 'message' || norm === 'messagesquare') {
      return <MessageSquare className="w-5 h-5 text-inherit" />;
    }
    return <Megaphone className="w-5 h-5 text-inherit" />;
  };

  // Renderizador de um Card individual com personalização de cor, texto e botão
  const renderSingleCard = (card: VipInfoCard, isSingleWidth = false) => {
    const cardColor = card.color || '#ebbf01';
    const isWhatsapp = card.icon === 'whatsapp' || card.buttonUrl?.includes('wa.me') || card.buttonUrl?.includes('chat.whatsapp.com');

    return (
      <div
        key={card.id}
        style={{
          borderColor: `${cardColor}40`,
          background: `linear-gradient(135deg, ${cardColor}18 0%, #111116 55%, ${cardColor}0c 100%)`,
        }}
        className={`border hover:border-[${cardColor}] rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between space-y-4 group backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 text-center sm:text-left ${
          isSingleWidth ? 'w-full' : 'w-full'
        }`}
      >
        {/* Laser Top Accent */}
        <div
          style={{
            background: `linear-gradient(to right, transparent, ${cardColor}, transparent)`,
          }}
          className="absolute top-0 left-0 right-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* Brilhos coloridos de fundo */}
        <div
          style={{ backgroundColor: `${cardColor}25` }}
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-2xl transition-all duration-500 pointer-events-none"
        />
        <div
          style={{ backgroundColor: `${cardColor}15` }}
          className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full blur-2xl transition-all duration-500 pointer-events-none"
        />

        <div className="space-y-3 relative z-10 flex flex-col items-center sm:items-start w-full">
          
          {/* Header do Card */}
          <div 
            style={{ borderColor: `${cardColor}25` }}
            className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 border-b pb-3 transition-colors w-full"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5">
              <div
                style={{
                  backgroundColor: `${cardColor}25`,
                  borderColor: `${cardColor}60`,
                  color: cardColor,
                }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md transition-all"
              >
                {renderCardIcon(card.icon, cardColor)}
              </div>

              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span
                    style={{
                      backgroundColor: `${cardColor}20`,
                      borderColor: `${cardColor}40`,
                      color: cardColor,
                    }}
                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                  >
                    {card.badge || 'Destaque VIP'}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white font-heading mt-0.5 drop-shadow-sm text-center sm:text-left">
                  {card.title}
                </h4>
              </div>
            </div>
          </div>

          {/* Descrição / Conteúdo */}
          <div 
            style={{
              backgroundColor: `${cardColor}10`,
              borderColor: `${cardColor}30`,
            }}
            className="border rounded-2xl p-4 text-xs sm:text-sm text-neutral-100 group-hover:text-white font-medium leading-relaxed font-sans whitespace-pre-line shadow-inner backdrop-blur-md transition-all duration-300 text-center sm:text-left w-full"
          >
            {card.description}
          </div>
        </div>

        {/* Botão Opcional de Ação */}
        {card.buttonText && card.buttonUrl && (
          <div className="pt-2 relative z-10 w-full">
            <a
              href={card.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: cardColor,
                color: '#000000',
                boxShadow: `0 8px 20px ${cardColor}30`,
              }}
              className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md"
            >
              {isWhatsapp ? (
                <SocialIcon platform="whatsapp" className="w-4 h-4 fill-current shrink-0 text-black" />
              ) : (
                <ExternalLink className="w-4 h-4 stroke-[2.5] shrink-0" />
              )}
              <span>{card.buttonText}</span>
            </a>
          </div>
        )}
      </div>
    );
  };

  // CASO 1: Apenas 1 card visível -> Largura Total
  if (totalCards === 1) {
    return (
      <div className="w-full">
        {renderSingleCard(visibleCards[0], true)}
      </div>
    );
  }

  // CASO 2: Exatamente 2 cards -> Estáticos lado a lado (como hoje)
  if (totalCards === 2) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {renderSingleCard(visibleCards[0])}
        {renderSingleCard(visibleCards[1])}
      </div>
    );
  }

  // CASO 3: 3 ou mais cards -> Carrossel automático por 20 segundos com setas para frente e para trás
  const firstCard = visibleCards[currentIndex];
  const secondCard = visibleCards[(currentIndex + 1) % totalCards];

  return (
    <div 
      className="space-y-3 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Controles e Indicador do Carrossel no Topo */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-neutral-400">
            Destaques VIP ({currentIndex + 1} de {totalCards})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl bg-[#14141a] hover:bg-white/10 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Card anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-8 h-8 rounded-xl bg-[#14141a] hover:bg-white/10 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Próximo card"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid do Carrossel: Mostra 2 cards lado a lado no desktop (ou 1 no mobile) que giram a cada 20s */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch animate-in fade-in duration-300">
        <div className="w-full">
          {renderSingleCard(firstCard)}
        </div>
        <div className="hidden lg:block w-full">
          {renderSingleCard(secondCard)}
        </div>
      </div>

      {/* Pontos Indicadores no Rodapé */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {visibleCards.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex
                ? 'w-6 bg-[#ebbf01] shadow-[0_0_8px_rgba(235,191,1,0.8)]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            title={`Ir para card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
