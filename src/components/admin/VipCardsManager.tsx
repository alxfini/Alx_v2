import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Save, 
  X, 
  Sparkles, 
  Megaphone, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Copy,
  Layers,
  HelpCircle
} from 'lucide-react';
import { SiteBrandConfig, VipInfoCard } from '../../types';
import { SocialIcon } from '../common/SocialIcon';

interface VipCardsManagerProps {
  brand: SiteBrandConfig;
  updateBrand: (data: Partial<SiteBrandConfig>) => void;
  onTriggerSuccess?: (msg: string) => void;
}

const PRESET_COLORS = [
  { label: 'Vermelho (Mural)', hex: '#ef4444' },
  { label: 'Verde (WhatsApp)', hex: '#25D366' },
  { label: 'Dourado / Alx (VIP)', hex: '#ebbf01' },
  { label: 'Azul (Informativo)', hex: '#3b82f6' },
  { label: 'Roxo (Exclusivo)', hex: '#8b5cf6' },
  { label: 'Ciano (Tecnologia)', hex: '#06b6d4' },
  { label: 'Rosa (Destaque)', hex: '#ec4899' },
  { label: 'Laranja (Alerta)', hex: '#f97316' },
];

const AVAILABLE_ICONS = [
  { id: 'megaphone', label: 'Megafone (Aviso)' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'star', label: 'Estrela (Destaque)' },
  { id: 'bell', label: 'Sino (Notificação)' },
  { id: 'shield', label: 'Escudo (Segurança / Oficial)' },
  { id: 'sparkles', label: 'Brilho (Novidade)' },
  { id: 'info', label: 'Informação' },
  { id: 'link', label: 'Link Externo' },
];

export const VipCardsManager: React.FC<VipCardsManagerProps> = ({
  brand,
  updateBrand,
  onTriggerSuccess,
}) => {
  // Inicializa a lista de cards com base em brand.vipCards ou nos padrões existentes
  const currentCards: VipInfoCard[] = React.useMemo(() => {
    if (brand.vipCards && brand.vipCards.length > 0) {
      return brand.vipCards;
    }

    const defaultWa = brand.links?.whatsapp || 'https://wa.me/5551999999999';
    const whatsappUrl = brand.vipWhatsappGroupUrl?.trim() || defaultWa;

    return [
      {
        id: 'card-mural',
        title: brand.vipNoticeTitle || 'Mural de Avisos & Comunicados VIP',
        badge: 'Mural de Avisos',
        description: brand.vipNoticeMessage || 'Bem-vindo ao espaço exclusivo de membros! Fique atento às novas atualizações de APKs, firmwares e tutoriais disponibilizados periodicamente nesta área.',
        color: '#ef4444',
        icon: 'megaphone',
        active: brand.vipNoticeActive !== false,
        order: 1,
      },
      {
        id: 'card-whatsapp',
        title: brand.vipWhatsappGroupTitle || 'Grupo Alx⁺ VIP',
        badge: 'Comunidade VIP',
        description: brand.vipWhatsappGroupDesc || 'Faça parte da comunidade exclusiva no WhatsApp! Conecte-se diretamente com outros membros VIP, tire dúvidas e receba avisos em primeira mão.',
        color: '#25D366',
        icon: 'whatsapp',
        buttonText: 'Grupo Alx⁺ VIP',
        buttonUrl: whatsappUrl,
        active: true,
        order: 2,
      },
    ];
  }, [brand.vipCards, brand.vipNoticeTitle, brand.vipNoticeMessage, brand.vipNoticeActive, brand.vipWhatsappGroupTitle, brand.vipWhatsappGroupDesc, brand.vipWhatsappGroupUrl, brand.links?.whatsapp]);

  const [cardsList, setCardsList] = useState<VipInfoCard[]>(currentCards);
  const [editingCard, setEditingCard] = useState<VipInfoCard | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [includeButton, setIncludeButton] = useState(false);

  // Sincroniza se o brand mudar externamente
  React.useEffect(() => {
    setCardsList(currentCards);
  }, [currentCards]);

  const saveCards = (newCards: VipInfoCard[], msg?: string) => {
    setCardsList(newCards);
    updateBrand({ vipCards: newCards });
    if (onTriggerSuccess && msg) {
      onTriggerSuccess(msg);
    }
  };

  const [modalError, setModalError] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleStartCreate = () => {
    setModalError(null);
    const newCard: VipInfoCard = {
      id: `vip-c-${Date.now()}`,
      title: '',
      badge: 'Destaque VIP',
      description: '',
      color: '#ebbf01',
      icon: 'sparkles',
      buttonText: '',
      buttonUrl: '',
      active: true,
      order: cardsList.length + 1,
    };
    setEditingCard(newCard);
    setIsCreating(true);
    setIncludeButton(false);
  };

  const handleStartEdit = (card: VipInfoCard) => {
    setModalError(null);
    setEditingCard({ ...card });
    setIsCreating(false);
    setIncludeButton(Boolean(card.buttonText && card.buttonUrl));
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    if (!editingCard.title.trim()) {
      setModalError('Informe o título do card.');
      return;
    }

    if (!editingCard.description.trim()) {
      setModalError('Informe o conteúdo/descrição do card.');
      return;
    }

    const cleanedCard: VipInfoCard = {
      ...editingCard,
      title: editingCard.title.trim(),
      badge: editingCard.badge?.trim() || 'Destaque VIP',
      description: editingCard.description.trim(),
      buttonText: includeButton ? editingCard.buttonText?.trim() : undefined,
      buttonUrl: includeButton ? editingCard.buttonUrl?.trim() : undefined,
    };

    let updated: VipInfoCard[];
    if (isCreating) {
      updated = [...cardsList, cleanedCard];
    } else {
      updated = cardsList.map((c) => (c.id === cleanedCard.id ? cleanedCard : c));
    }

    saveCards(updated, isCreating ? 'Card adicionado com sucesso!' : 'Card atualizado com sucesso!');
    setEditingCard(null);
    setModalError(null);
  };

  const handleConfirmDelete = () => {
    if (!cardToDelete) return;
    const updated = cardsList.filter((c) => c.id !== cardToDelete.id);
    saveCards(updated, 'Card removido com sucesso!');
    setCardToDelete(null);
  };

  const handleDelete = (id: string, title: string) => {
    setCardToDelete({ id, title });
  };

  const handleDuplicate = (card: VipInfoCard) => {
    const duplicated: VipInfoCard = {
      ...card,
      id: `vip-c-${Date.now()}`,
      title: `${card.title} (Cópia)`,
      order: cardsList.length + 1,
    };
    const updated = [...cardsList, duplicated];
    saveCards(updated, 'Card duplicado com sucesso!');
  };

  const handleToggleActive = (id: string) => {
    const updated = cardsList.map((c) => {
      if (c.id === id) {
        return { ...c, active: !c.active };
      }
      return c;
    });
    saveCards(updated, 'Visibilidade do card alterada!');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cardsList.length) return;

    const copy = [...cardsList];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Atualiza order
    const reordered = copy.map((c, idx) => ({ ...c, order: idx + 1 }));
    saveCards(reordered, 'Ordem dos cards atualizada!');
  };

  const activeCardsCount = cardsList.filter((c) => c.active !== false).length;

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono font-black text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Fila de Destaques da Área VIP</span>
          </div>
          <h3 className="text-xl font-black text-neutral-900 font-heading">
            Cards & Carrossel da Área VIP
          </h3>
          <p className="text-xs text-neutral-600 font-medium max-w-2xl">
            Crie e personalize os cards informativos (Mural, WhatsApp, Avisos, Promoções). Se houver 1 card ativo ele ocupa largura total; se houver 2 ficam estáticos lado a lado; e com 3 ou mais eles rodam automaticamente como carrossel a cada 20s.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Card</span>
        </button>
      </div>

      {/* Regra Visual Explicativa */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600 font-mono">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Status Atual da Fila:</span>
          <span className="font-bold text-neutral-900 px-2 py-0.5 rounded bg-white border border-neutral-200">
            {activeCardsCount} card(s) visível(is) no site
          </span>
        </div>
        <div className="text-[11px] text-neutral-500">
          {activeCardsCount === 1 && '▶ Exibição: 1 Card em Largura Total (100%)'}
          {activeCardsCount === 2 && '▶ Exibição: 2 Cards Estáticos lado a lado (50% cada)'}
          {activeCardsCount >= 3 && '▶ Exibição: Carrossel com Rotação Automática de 20s + Setas'}
          {activeCardsCount === 0 && '▶ Nenhum card ativo: a seção não aparecerá no site'}
        </div>
      </div>

      {/* Lista de Cards Cadastrados */}
      <div className="space-y-3">
        {cardsList.map((card, index) => {
          const isFirst = index === 0;
          const isLast = index === cardsList.length - 1;
          const cardColor = card.color || '#ebbf01';

          return (
            <div
              key={card.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                card.active !== false
                  ? 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                  : 'bg-neutral-50 border-neutral-200 opacity-60'
              }`}
            >
              {/* Lado Esquerdo: Swatch de Cor + Ícone + Título + Descrição */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                {/* Posição */}
                <span className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0 border border-neutral-200">
                  {index + 1}º
                </span>

                {/* Swatch com Cor do Card */}
                <div
                  style={{
                    backgroundColor: `${cardColor}25`,
                    borderColor: `${cardColor}60`,
                    color: cardColor,
                  }}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs"
                >
                  {card.icon === 'whatsapp' ? (
                    <SocialIcon platform="whatsapp" className="w-4 h-4 text-inherit" />
                  ) : (
                    <Megaphone className="w-4 h-4 text-inherit" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{
                        backgroundColor: `${cardColor}15`,
                        borderColor: `${cardColor}40`,
                        color: cardColor,
                      }}
                      className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border"
                    >
                      {card.badge || 'Destaque'}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 truncate">
                      {card.title}
                    </h4>
                    {card.active === false && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-600">
                        Oculto no site
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-1 max-w-xl">
                    {card.description}
                  </p>
                  {card.buttonText && (
                    <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                      <span>Botão:</span>
                      <strong className="text-neutral-700">"{card.buttonText}"</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Lado Direito: Ações (Toggle Ativo, Mover, Editar, Excluir) */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Toggle de Visibilidade */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(card.id)}
                  title={card.active !== false ? 'Ocultar card no site' : 'Exibir card no site'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    card.active !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-neutral-100 text-neutral-500 border-neutral-300 hover:bg-neutral-200'
                  }`}
                >
                  {card.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{card.active !== false ? 'Ativo' : 'Oculto'}</span>
                </button>

                {/* Subir */}
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMove(index, 'up')}
                  title="Mover para cima"
                  className="w-8 h-8 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Descer */}
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMove(index, 'down')}
                  title="Mover para baixo"
                  className="w-8 h-8 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Duplicar */}
                <button
                  type="button"
                  onClick={() => handleDuplicate(card)}
                  title="Duplicar este card"
                  className="w-8 h-8 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Editar */}
                <button
                  type="button"
                  onClick={() => handleStartEdit(card)}
                  title="Editar card"
                  className="w-8 h-8 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Excluir */}
                <button
                  type="button"
                  onClick={() => handleDelete(card.id, card.title)}
                  title="Excluir card"
                  className="w-8 h-8 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação / Edição do Card */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setEditingCard(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
              <div 
                style={{ backgroundColor: `${editingCard.color || '#ebbf01'}25`, color: editingCard.color || '#ebbf01' }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
              >
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900 font-heading">
                  {isCreating ? 'Novo Card para a Área VIP' : 'Editar Card da Área VIP'}
                </h3>
                <p className="text-xs text-neutral-500">
                  Personalize o título, cores, ícones e botões deste card
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{modalError}</span>
                </div>
              )}
              
              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                  Título do Card *
                </label>
                <input
                  type="text"
                  required
                  value={editingCard.title}
                  onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  placeholder="Ex: Mural de Avisos, Grupo VIP, Novidades..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-medium"
                />
              </div>

              {/* Badge / Etiqueta */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                  Badge / Etiqueta Superior
                </label>
                <input
                  type="text"
                  value={editingCard.badge || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, badge: e.target.value })}
                  placeholder="Ex: Comunidade VIP, Mural de Avisos, Novidade..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-medium"
                />
              </div>

              {/* Descrição / Conteúdo */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                  Texto / Conteúdo do Card *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingCard.description}
                  onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                  placeholder="Digite a mensagem, instrução ou descrição que os membros lerão neste card..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-medium resize-none"
                />
              </div>

              {/* Seletor de Cores */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                  Cor de Destaque do Card
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setEditingCard({ ...editingCard, color: c.hex })}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        editingCard.color === c.hex ? 'scale-110 border-black shadow-md' : 'border-white opacity-80 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-[11px] text-neutral-500 font-mono">Hex:</span>
                    <input
                      type="text"
                      value={editingCard.color || '#ebbf01'}
                      onChange={(e) => setEditingCard({ ...editingCard, color: e.target.value })}
                      className="w-24 px-2 py-1 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Ícone */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                  Ícone do Card
                </label>
                <select
                  value={editingCard.icon || 'megaphone'}
                  onChange={(e) => setEditingCard({ ...editingCard, icon: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-medium cursor-pointer"
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic.id} value={ic.id}>
                      {ic.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão Opcional */}
              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeButton}
                    onChange={(e) => setIncludeButton(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
                  />
                  <span className="text-xs font-bold text-neutral-800">
                    Incluir botão de link / ação neste card
                  </span>
                </label>

                {includeButton && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-600">
                        Texto do Botão
                      </label>
                      <input
                        type="text"
                        value={editingCard.buttonText || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, buttonText: e.target.value })}
                        placeholder="Ex: Entrar no Grupo, Ver Manual..."
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-600">
                        Link / URL de Destino
                      </label>
                      <input
                        type="text"
                        value={editingCard.buttonUrl || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, buttonUrl: e.target.value })}
                        placeholder="https://chat.whatsapp.com/..."
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Visibilidade */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCard.active !== false}
                    onChange={(e) => setEditingCard({ ...editingCard, active: e.target.checked })}
                    className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
                  />
                  <span className="text-xs font-bold text-neutral-800">
                    Card visível na Área VIP
                  </span>
                </label>
              </div>

              {/* Botões do Modal */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Card</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {cardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-neutral-900">Excluir Card</h4>
              <p className="text-xs text-neutral-500">
                Tem certeza que deseja remover o card <strong>"{cardToDelete.title}"</strong> da Área VIP?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
