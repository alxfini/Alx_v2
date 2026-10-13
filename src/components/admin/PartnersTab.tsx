import React, { useState } from 'react';
import { 
  Handshake, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Save, 
  X, 
  Sparkles, 
  Smartphone, 
  Play, 
  MessageSquare, 
  Building2, 
  ExternalLink, 
  Image as ImageIcon, 
  Check, 
  CheckCircle2, 
  Search,
  Link as LinkIcon
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { PartnerItem, ALXApp } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { getMediaPreviewUrl } from '../../utils/mediaUrl';
import { PartnerBannerModal } from '../modals/PartnerBannerModal';

interface PartnersTabProps {
  onTriggerSuccess?: (msg: string) => void;
}

export const PartnersTab: React.FC<PartnersTabProps> = ({ onTriggerSuccess }) => {
  const { 
    partners, 
    addPartner, 
    updatePartner, 
    deletePartner, 
    duplicatePartner, 
    reorderPartners, 
    apps 
  } = useSiteData();

  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewPartner, setPreviewPartner] = useState<PartnerItem | null>(null);
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [newAdditionalImageUrl, setNewAdditionalImageUrl] = useState('');

  const triggerSuccess = (msg: string) => {
    if (onTriggerSuccess) {
      onTriggerSuccess(msg);
    }
  };

  const handleStartCreate = () => {
    const newEmptyPartner: PartnerItem = {
      id: '',
      slug: `parceiro-${Date.now()}`,
      name: '',
      badge: 'Parceiro Oficial',
      tagline: '',
      imageUrl: '/imagens/modelos/seal-awd.jpg',
      shortDescription: '',
      order: (partners?.length || 0) + 1,
      active: true,
      bannerHeaderTitle: '',
      bannerHeaderSubtitle: '',
      bannerImageUrl: '/imagens/modelos/seal-awd.jpg',
      content: `### Sobre a Parceria

Descreva aqui os detalhes da parceria, vantagens para os clientes da Alx⁺ e diferenciais técnicos.

#### Vantagens & Benefícios:
- Atendimento especializado para veículos elétricos e híbridos.
- Condições e descontos especiais para membros.
- Garantia de serviço e suporte técnico dedicado.`,
      additionalImages: [],
      youtubeUrl: '',
      linkedAppIds: [],
      contactTitle: 'Atendimento & Contato',
      contactSubtitle: 'Entre em contato diretamente para agendamentos, orçamentos e informações.',
      contactButtonText: 'Entrar em Contato',
      contactUrl: '',
      contactType: 'link',
    };
    setEditingPartner(newEmptyPartner);
    setIsCreating(true);
    setAppSearchQuery('');
  };

  const handleStartEdit = (partner: PartnerItem) => {
    setEditingPartner({
      ...partner,
      additionalImages: partner.additionalImages ? [...partner.additionalImages] : [],
      linkedAppIds: partner.linkedAppIds ? [...partner.linkedAppIds] : [],
    });
    setIsCreating(false);
    setAppSearchQuery('');
  };

  const handleSave = () => {
    if (!editingPartner) return;
    if (!editingPartner.name.trim()) {
      alert('Por favor, informe o Nome do Parceiro.');
      return;
    }

    if (isCreating) {
      addPartner(editingPartner);
      triggerSuccess('Parceiro cadastrado com sucesso!');
    } else {
      updatePartner(editingPartner.id, editingPartner);
      triggerSuccess('Parceiro atualizado com sucesso!');
    }

    setEditingPartner(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o parceiro "${name}"?`)) {
      deletePartner(id);
      triggerSuccess('Parceiro removido com sucesso!');
    }
  };

  const handleDuplicate = (id: string) => {
    duplicatePartner(id);
    triggerSuccess('Parceiro duplicado com sucesso!');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= partners.length) return;

    const listCopy = [...partners];
    const [moved] = listCopy.splice(index, 1);
    listCopy.splice(targetIndex, 0, moved);

    reorderPartners(listCopy.map((p) => p.id));
    triggerSuccess('Ordem dos parceiros atualizada!');
  };

  // Toggle app vinculado
  const handleToggleLinkedApp = (appId: string) => {
    if (!editingPartner) return;
    const currentList = editingPartner.linkedAppIds || [];
    const exists = currentList.includes(appId);
    const updated = exists 
      ? currentList.filter((id) => id !== appId)
      : [...currentList, appId];
    
    setEditingPartner({
      ...editingPartner,
      linkedAppIds: updated,
    });
  };

  // Adicionar foto extra
  const handleAddAdditionalImage = () => {
    if (!editingPartner || !newAdditionalImageUrl.trim()) return;
    const currentList = editingPartner.additionalImages || [];
    setEditingPartner({
      ...editingPartner,
      additionalImages: [...currentList, newAdditionalImageUrl.trim()],
    });
    setNewAdditionalImageUrl('');
  };

  // Remover foto extra
  const handleRemoveAdditionalImage = (index: number) => {
    if (!editingPartner) return;
    const currentList = editingPartner.additionalImages || [];
    const updated = currentList.filter((_, idx) => idx !== index);
    setEditingPartner({
      ...editingPartner,
      additionalImages: updated,
    });
  };

  // Filtro de apps para vinculação
  const filteredApps = (apps || []).filter((a) => {
    if (!appSearchQuery.trim()) return true;
    const q = appSearchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || (a.category && a.category.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <h3 className="text-xl font-black text-neutral-900 font-heading flex items-center gap-2.5">
            <Handshake className="w-6 h-6 text-[#ebbf01]" />
            <span>Gestão da Página de Parceiros</span>
          </h3>
          <p className="text-xs text-neutral-600 font-medium mt-1">
            Cadastre parceiros oficiais. Na página, cada parceiro terá um card da largura da tela com foto, resumo e botão que abre o banner com cabeçalho, texto, fotos, vídeo do YouTube, apps vinculados e link de contato.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="px-4 py-2.5 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs font-mono uppercase tracking-wider shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Parceiro</span>
        </button>
      </div>

      {/* Lista de Parceiros Cadastrados */}
      <div className="space-y-4">
        {partners && partners.length > 0 ? (
          partners.map((partner, index) => {
            const hasVideo = Boolean(partner.youtubeUrl);
            const linkedCount = partner.linkedAppIds?.length || 0;
            const extraPhotosCount = partner.additionalImages?.length || 0;

            return (
              <div
                key={partner.id}
                className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-[#ebbf01]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Lado Esquerdo: Imagem + Detalhes */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="w-24 sm:w-32 aspect-video rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 relative">
                    <img
                      src={getMediaPreviewUrl(partner.imageUrl) || '/imagens/modelos/seal-awd.jpg'}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                    {partner.active === false && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded bg-red-600 font-mono uppercase">
                          Inativo
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-mono font-bold uppercase">
                        #{index + 1}
                      </span>
                      {partner.badge && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#ebbf01]/15 border border-[#ebbf01]/40 text-neutral-900 text-[10px] font-mono font-black uppercase">
                          {partner.badge}
                        </span>
                      )}
                      {partner.active !== false ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                          Ativo no Site
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-red-100 border border-red-300 text-red-800 text-[10px] font-mono font-bold uppercase">
                          Oculto
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-neutral-900 truncate font-heading">
                      {partner.name}
                    </h4>

                    <p className="text-xs text-neutral-500 line-clamp-1">
                      {partner.shortDescription}
                    </p>

                    {/* Metadados / Indicadores */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-neutral-500">
                      {hasVideo && (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <Play className="w-3 h-3 fill-red-600" />
                          <span>Vídeo YouTube</span>
                        </span>
                      )}
                      {linkedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-cyan-700 font-bold">
                          <Smartphone className="w-3 h-3" />
                          <span>{linkedCount} {linkedCount === 1 ? 'App' : 'Apps'}</span>
                        </span>
                      )}
                      {extraPhotosCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                          <ImageIcon className="w-3 h-3" />
                          <span>{extraPhotosCount} {extraPhotosCount === 1 ? 'Foto Extra' : 'Fotos Extras'}</span>
                        </span>
                      )}
                      {partner.contactUrl && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <MessageSquare className="w-3 h-3" />
                          <span>{partner.contactButtonText || 'Contato'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Ações */}
                <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center shrink-0">
                  {/* Mover Ordem */}
                  <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 mr-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-600 hover:bg-neutral-200 cursor-pointer transition-colors"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === partners.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-600 hover:bg-neutral-200 cursor-pointer transition-colors"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Copiar Link Direto */}
                  <button
                    type="button"
                    onClick={() => {
                      const slug = partner.slug || partner.id;
                      const url = `${window.location.origin}/parceiros/${encodeURIComponent(slug)}`;
                      navigator.clipboard.writeText(url);
                      triggerSuccess(`Link copiado: ${url}`);
                    }}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Copiar link direto para este parceiro"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-[#ebbf01]" />
                    <span className="hidden sm:inline">Copiar Link</span>
                  </button>

                  {/* Preview do Banner */}
                  <button
                    type="button"
                    onClick={() => setPreviewPartner(partner)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Ver como o banner/modal abre para o visitante"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-700" />
                    <span className="hidden sm:inline">Ver Banner</span>
                  </button>

                  {/* Editar */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(partner)}
                    className="p-2 rounded-xl bg-[#ebbf01]/15 hover:bg-[#ebbf01]/30 text-neutral-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-[#ebbf01]/30"
                    title="Editar informações do parceiro"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-neutral-900" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>

                  {/* Duplicar */}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(partner.id)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs transition-all cursor-pointer"
                    title="Duplicar este parceiro"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Excluir */}
                  <button
                    type="button"
                    onClick={() => handleDelete(partner.id, partner.name)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-all cursor-pointer border border-red-200"
                    title="Excluir parceiro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center text-neutral-500 space-y-4">
            <Building2 className="w-12 h-12 mx-auto text-neutral-400" />
            <h4 className="text-base font-bold text-neutral-800">Nenhum parceiro cadastrado</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Clique no botão "Novo Parceiro" acima para cadastrar a primeira parceria oficial da Alx⁺.
            </p>
            <button
              type="button"
              onClick={handleStartCreate}
              className="px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-bold text-xs uppercase cursor-pointer"
            >
              Cadastrar Primeiro Parceiro
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: EDITAR / CRIAR PARCEIRO ================= */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in zoom-in-95">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl text-neutral-900">
            
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ebbf01]/10 text-[#ebbf01] flex items-center justify-center font-bold">
                  <Handshake className="w-5 h-5 text-[#ebbf01]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-neutral-900 font-heading">
                    {isCreating ? 'Cadastrar Novo Parceiro' : `Editar Parceiro • ${editingPartner.name}`}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Configure os dados do card na página e todas as seções internas do banner.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* SEÇÃO 1: DADOS DO CARD DA PÁGINA */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2.5">
                  <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ebbf01]" />
                    <span>1. Card da Página (Visão Geral)</span>
                  </h4>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                    <input
                      type="checkbox"
                      checked={editingPartner.active !== false}
                      onChange={(e) => setEditingPartner({ ...editingPartner, active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#ebbf01] focus:ring-[#ebbf01]"
                    />
                    <span>Ativo na Página</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Nome do Parceiro *
                    </label>
                    <input
                      type="text"
                      value={editingPartner.name}
                      onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                      placeholder="Ex: EV Garage Custom & Performance"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Badge / Selo (Dizeres de Destaque)
                    </label>
                    <input
                      type="text"
                      value={editingPartner.badge || ''}
                      onChange={(e) => setEditingPartner({ ...editingPartner, badge: e.target.value })}
                      placeholder="Ex: Oficina Homologada, Películas Cerâmicas"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Link Direto do Parceiro (Slug da URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono">/parceiros/</span>
                    <input
                      type="text"
                      value={editingPartner.slug || ''}
                      onChange={(e) => setEditingPartner({ ...editingPartner, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') })}
                      placeholder="nome-do-parceiro"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Slogan / Tagline Curta
                  </label>
                  <input
                    type="text"
                    value={editingPartner.tagline || ''}
                    onChange={(e) => setEditingPartner({ ...editingPartner, tagline: e.target.value })}
                    placeholder="Ex: Especialistas em desbloqueio, iluminação ambiente e proteção cerâmica"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <ImageUploadField
                    label="Foto Principal do Card (Largura da Página) *"
                    value={editingPartner.imageUrl}
                    onChange={(url) => setEditingPartner({ ...editingPartner, imageUrl: url })}
                    folder="parceiros"
                    aspectRatio="video"
                    description="Imagem que aparecerá no topo do card com a largura da página."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Breve Resumo (Dizeres Abaixo da Foto no Card) *
                  </label>
                  <textarea
                    rows={3}
                    value={editingPartner.shortDescription}
                    onChange={(e) => setEditingPartner({ ...editingPartner, shortDescription: e.target.value })}
                    placeholder="Escreva um breve resumo convidativo sobre a parceria..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* SEÇÃO 2: CABEÇALHO DO BANNER (MODAL) */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="border-b border-neutral-200/80 pb-2.5">
                  <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ebbf01]" />
                    <span>2. Cabeçalho do Banner / Modal (Ao Clicar em Saiba Mais)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Título do Cabeçalho do Banner
                    </label>
                    <input
                      type="text"
                      value={editingPartner.bannerHeaderTitle || ''}
                      onChange={(e) => setEditingPartner({ ...editingPartner, bannerHeaderTitle: e.target.value })}
                      placeholder="Ex: Parceria Oficial • EV Garage Custom (se vazio, usa o nome)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Subtítulo do Cabeçalho do Banner
                    </label>
                    <input
                      type="text"
                      value={editingPartner.bannerHeaderSubtitle || ''}
                      onChange={(e) => setEditingPartner({ ...editingPartner, bannerHeaderSubtitle: e.target.value })}
                      placeholder="Ex: Excelência técnica, garantia de fábrica preservada e suporte Alx⁺"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <ImageUploadField
                    label="Foto do Banner no Modal (Opcional - se vazio, usa a foto principal)"
                    value={editingPartner.bannerImageUrl || ''}
                    onChange={(url) => setEditingPartner({ ...editingPartner, bannerImageUrl: url })}
                    folder="parceiros"
                    aspectRatio="video"
                    description="Imagem que ilustrará o topo do banner ao abrir."
                  />
                </div>
              </div>

              {/* SEÇÃO 3: MEIO - TEXTO EDITÁVEL & FOTOS */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="border-b border-neutral-200/80 pb-2.5">
                  <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#ebbf01]" />
                    <span>3. Meio do Banner: Texto Editável & Fotos da Parceria</span>
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Use <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">### Título</code> e <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">#### Subtítulo</code> para seções e quebras de linha duplas para criar caixas destacadas.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Conteúdo Textual Completo (Editável)
                  </label>
                  <textarea
                    rows={8}
                    value={editingPartner.content || ''}
                    onChange={(e) => setEditingPartner({ ...editingPartner, content: e.target.value })}
                    placeholder="Digite todas as informações da parceria, procedimentos, regras e descontos..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-mono text-neutral-900 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Galeria de Fotos Adicionais no Meio do Banner */}
                <div className="pt-2 border-t border-neutral-200 space-y-3">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Fotos Extras / Galeria de Fotos no Meio do Texto
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAdditionalImageUrl}
                      onChange={(e) => setNewAdditionalImageUrl(e.target.value)}
                      placeholder="Cole a URL de uma foto ou faça upload abaixo..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddAdditionalImage}
                      className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase cursor-pointer shrink-0"
                    >
                      Adicionar Foto
                    </button>
                  </div>

                  <ImageUploadField
                    label="Ou selecione um arquivo do computador:"
                    value=""
                    onChange={(url) => {
                      if (url) {
                        const current = editingPartner.additionalImages || [];
                        setEditingPartner({
                          ...editingPartner,
                          additionalImages: [...current, url],
                        });
                        triggerSuccess('Foto adicionada à galeria!');
                      }
                    }}
                    folder="parceiros"
                    description="Upload direto de foto adicional para a galeria da parceria."
                  />

                  {editingPartner.additionalImages && editingPartner.additionalImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {editingPartner.additionalImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group">
                          <img src={getMediaPreviewUrl(img)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-md"
                            title="Remover foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SEÇÃO 4: ABAIXO - VÍDEO DO YOUTUBE */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="border-b border-neutral-200/80 pb-2.5">
                  <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                    <Play className="w-4 h-4 text-red-600 fill-red-600" />
                    <span>4. Abaixo do Texto: Link com Vídeo do YouTube</span>
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Insira o link de um vídeo do canal ou do parceiro para exibir o player responsivo embutido no banner.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Link do Vídeo do YouTube
                  </label>
                  <input
                    type="text"
                    value={editingPartner.youtubeUrl || ''}
                    onChange={(e) => setEditingPartner({ ...editingPartner, youtubeUrl: e.target.value })}
                    placeholder="Ex: https://www.youtube.com/watch?v=5qap5aO4i9A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* SEÇÃO 5: MAIS ABAIXO - VINCULAR APLICATIVOS DO SITE */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/80 pb-2.5">
                  <div>
                    <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#ebbf01]" />
                      <span>5. Mais Abaixo: Vincular Aplicativos Já Cadastrados no Site</span>
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Marque quais aplicativos do catálogo da ALX Store serão exibidos dentro do banner deste parceiro.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-neutral-700">
                    {(editingPartner.linkedAppIds || []).length} selecionado(s)
                  </span>
                </div>

                {/* Busca rápida de aplicativo */}
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    placeholder="Filtrar aplicativos por nome ou categoria..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none"
                  />
                </div>

                {/* Lista de Seleção de Apps */}
                <div className="max-h-56 overflow-y-auto space-y-2 border border-neutral-200 rounded-xl p-2 bg-white">
                  {filteredApps.length > 0 ? (
                    filteredApps.map((app) => {
                      const isSelected = (editingPartner.linkedAppIds || []).includes(app.id);

                      return (
                        <div
                          key={app.id}
                          onClick={() => handleToggleLinkedApp(app.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-[#ebbf01]/10 border-[#ebbf01] text-neutral-900' 
                              : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // tratado no wrapper
                              className="w-4 h-4 rounded text-[#ebbf01] focus:ring-[#ebbf01] pointer-events-none"
                            />
                            <div className="truncate">
                              <span className="text-xs font-bold block truncate">{app.name}</span>
                              <span className="text-[10px] text-neutral-500 block truncate">
                                {app.category || 'Geral'} • {app.version || 'v1.0'}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-200 shrink-0">
                            {app.isVipExclusive ? 'VIP' : 'Público'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-neutral-500 p-4 text-center">Nenhum aplicativo encontrado.</p>
                  )}
                </div>
              </div>

              {/* SEÇÃO 6: NO FINAL - BANNER DE ATENDIMENTO / CONTATO (AZUL CIANO) */}
              <div className="bg-cyan-50/60 border-2 border-cyan-400/40 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-200/80 pb-2.5">
                  <h4 className="text-xs font-black text-cyan-900 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-600" />
                    <span>6. No Final do Banner: Atendimento & Contato (Banner Azul Ciano)</span>
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                    Exibição em Azul Ciano no Site
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Título do Atendimento / Bloco
                    </label>
                    <input
                      type="text"
                      value={editingPartner.contactTitle || ''}
                      onChange={(e) => setEditingPartner({ ...editingPartner, contactTitle: e.target.value })}
                      placeholder="Ex: Atendimento & Contato ou Fale Conosco"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={editingPartner.contactButtonText || ''}
                      onChange={(e) => setEditingPartner({ ...editingPartner, contactButtonText: e.target.value })}
                      placeholder="Ex: Entrar em Contato ou Falar no WhatsApp ou Ver Site"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                    Descrição / Subtítulo do Atendimento
                  </label>
                  <input
                    type="text"
                    value={editingPartner.contactSubtitle || ''}
                    onChange={(e) => setEditingPartner({ ...editingPartner, contactSubtitle: e.target.value })}
                    placeholder="Ex: Entre em contato diretamente para tirar dúvidas, consultar serviços e solicitar agendamento."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Tipo de Canal
                    </label>
                    <select
                      value={editingPartner.contactType || 'link'}
                      onChange={(e) => setEditingPartner({ ...editingPartner, contactType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-900 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="link">Link Personalizado / Site</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="external">Site Oficial / Externo</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Link de Destino / URL de Contato *
                    </label>
                    <input
                      type="text"
                      value={editingPartner.contactUrl || ''}
                      onChange={(e) => setEditingPartner({ ...editingPartner, contactUrl: e.target.value })}
                      placeholder="Ex: https://wa.me/5511999999999 ou https://siteparceiro.com.br ou instagram.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Rodapé com Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs uppercase shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Parceiro</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Preview para o Administrador */}
      {previewPartner && (
        <PartnerBannerModal
          partner={previewPartner}
          isOpen={Boolean(previewPartner)}
          onClose={() => setPreviewPartner(null)}
        />
      )}

    </div>
  );
};
