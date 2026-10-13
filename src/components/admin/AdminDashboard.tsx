import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings,
  Database, 
  Image as ImageIcon, 
  AppWindow, 
  Newspaper, 
  ShoppingBag, 
  Car, 
  RefreshCw, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Eye, 
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Info,
  Save,
  Sliders,
  Layers,
  FileJson,
  HardDrive,
  Youtube,
  Play,
  Lock,
  Crown,
  KeyRound,
  Tv,
  Handshake,
  Globe,
  BookOpen,
  Bell,
  Send,
  Smartphone,
  Radio,
  Megaphone,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Share2,
  Printer,
  Bold,
  List,
  ListOrdered,
  AlertTriangle,
  MessageSquare,
  Mail,
  Inbox,
  CheckCircle2,
  Clock,
  User,
  Users,
  FileSpreadsheet,
  Loader2,
  Link as LinkIcon,
  Search,
  QrCode,
  CreditCard,
  Palette
} from 'lucide-react';
import { TutorialDocumentView } from '../tutorials/TutorialDocumentView';
import { useSiteData } from '../../context/SiteDataContext';
import { ImageUploadField } from './ImageUploadField';
import { FileUploadField } from './FileUploadField';
import { AnimatedWallpaperUpload } from './AnimatedWallpaperUpload';
import { CategorySelect } from './CategorySelect';
import { VisibilitySelector, VisibilityBadge } from './VisibilitySelector';
import { GitHubStorageTab } from './GitHubStorageTab';
import { DatabaseTab } from './DatabaseTab';
import { PartnersTab } from './PartnersTab';
import { getMediaPreviewUrl } from '../../utils/mediaUrl';
import { EDITABLE_PAGES, getPageThemeHex, DEFAULT_PAGE_COLORS } from '../../utils/pageColors';
import { ALXApp, NewsArticle, ProductItem, EVModel, OTAUpdate, Tutorial, YouTubeVideo, CustomPageLink, UnlockServiceItem, WallpaperItem, CustomSocialLink, ContactCardItem, VipMember, IptvAppItem, IptvSimpleLink } from '../../types';
import { SocialIcon } from '../common/SocialIcon';
import { getResolvedFooterIcons } from '../../utils/footerIcons';
import { getResolvedHeaderMenu } from '../../utils/headerMenu';
import { requestNotificationPermission, sendBrowserNotification } from '../../services/notificationService';
import { generatePixPayload, getPixQrCodeUrl } from '../../utils/pix';

const EXISTING_SITE_PAGES = [
  {
    title: 'Início / Home',
    url: '/',
    description: 'Página inicial do portal ALX com visão geral.',
    icon: 'globe',
    category: 'Geral',
  },
  {
    title: 'Calculadora de Bateria & Autonomia',
    url: '/calculadora',
    description: 'Simulação de autonomia, consumo kWh e custos de recarga.',
    icon: 'zap',
    category: 'Ferramentas',
  },
  {
    title: 'Versões OTA & Firmware BYD',
    url: '/ota',
    description: 'Radar de atualizações de firmware e versões oficiais BYD.',
    icon: 'sparkles',
    category: 'Atualizações',
  },
  {
    title: 'Central de Tutoriais & Guias',
    url: '/tutoriais',
    description: 'Guias passo a passo para instalação de APKs e sistemas.',
    icon: 'bookopen',
    category: 'Guias',
  },
  {
    title: 'Serviços de Desbloqueio',
    url: '/desbloqueio',
    description: 'Serviços especializados de desbloqueio DiLink e instalação.',
    icon: 'shieldcheck',
    category: 'Serviços',
  },
  {
    title: 'Loja de Aplicativos ALX Store',
    url: '/apps',
    description: 'Catálogo de aplicativos testados e otimizados para multimídia.',
    icon: 'smartphone',
    category: 'Aplicativos',
  },
  {
    title: 'Parceiros Homologados',
    url: '/parceiros',
    description: 'Rede de parceiros credenciados em oficinas, estética e acessórios.',
    icon: 'handshake',
    category: 'Parcerias',
  },
  {
    title: 'Cinema YouTube & Vídeos',
    url: '/youtube',
    description: 'Análises, comparativos e tutoriais em vídeo.',
    icon: 'send',
    category: 'Mídia',
  },
  {
    title: 'Notícias & Tendências EV',
    url: '/noticias',
    description: 'Notícias e lançamentos de veículos elétricos e tecnologia.',
    icon: 'filetext',
    category: 'Notícias',
  },
  {
    title: 'Comunidade WhatsApp VIP',
    url: '/comunidade',
    description: 'Grupo oficial de proprietários e entusiastas no WhatsApp.',
    icon: 'send',
    category: 'Comunidade',
  },
  {
    title: 'Área Exclusiva VIP de Membros',
    url: '/vip',
    description: 'Downloads prioritários e suporte exclusivo para membros VIP.',
    icon: 'sparkles',
    category: 'Membros',
  },
  {
    title: 'ALX Shop • Loja Oficial',
    url: '/shop',
    description: 'Acessórios homologados e adaptadores para o seu carro.',
    icon: 'globe',
    category: 'Loja',
  },
  {
    title: 'Gerador Senha IMEI BYD',
    url: '/imei',
    description: 'Ferramenta de geração de senha de engenharia DiLink.',
    icon: 'smartphone',
    category: 'Ferramentas',
  },
  {
    title: 'Sobre a Plataforma',
    url: '/sobre',
    description: 'Informações institucionais e história do portal ALX.',
    icon: 'helpcircle',
    category: 'Institucional',
  },
  {
    title: 'Termos de Uso',
    url: '/termos',
    description: 'Termos, diretrizes e condições gerais do serviço.',
    icon: 'filetext',
    category: 'Institucional',
  },
  {
    title: 'Política de Privacidade',
    url: '/privacidade',
    description: 'Política de privacidade e proteção de dados LGPD.',
    icon: 'shieldcheck',
    category: 'Institucional',
  },
  {
    title: 'Fale Conosco',
    url: '/contato',
    description: 'Página de contato, e-mail, WhatsApp e envio de mensagem.',
    icon: 'send',
    category: 'Atendimento',
  },
];

interface AdminDashboardProps {
  initialTab?: 'brand' | 'messages' | 'apps' | 'news' | 'products' | 'evModels' | 'ota' | 'tutorials' | 'unlock' | 'wallpapers' | 'iptv' | 'parceiros' | 'youtube' | 'notifications' | 'pages' | 'backup' | 'storage' | 'database' | 'vipMembers';
  onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  initialTab = 'brand',
  onClose 
}) => {
  const {
    brand,
    updateBrand,
    logoutAdmin,
    contactMessages,
    addContactMessage,
    deleteContactMessage,
    markContactMessageRead,
    markContactMessageUnread,
    markAllContactMessagesRead,
    clearContactMessages,
    apps,
    updateApp,
    addApp,
    deleteApp,
    duplicateApp,
    moveApp,
    news,
    updateNews,
    addNews,
    deleteNews,
    duplicateNews,
    isSyncingNews,
    syncNewsArticles,
    products,
    updateProduct,
    addProduct,
    deleteProduct,
    moveProduct,
    duplicateProduct,
    isSyncingShop,
    syncShopProducts,
    evModels,
    updateEvModel,
    addEvModel,
    deleteEvModel,
    moveEvModel,
    duplicateEvModel,
    otaUpdates,
    updateOtaUpdate,
    addOtaUpdate,
    deleteOtaUpdate,
    duplicateOtaUpdate,
    tutorials,
    updateTutorial,
    addTutorial,
    deleteTutorial,
    duplicateTutorial,
    unlockServices,
    updateUnlockService,
    addUnlockService,
    deleteUnlockService,
    duplicateUnlockService,
    reorderUnlockService,
    wallpapers,
    updateWallpaper,
    addWallpaper,
    deleteWallpaper,
    duplicateWallpaper,
    iptvConfig,
    updateIptvConfig,
    addIptvApp,
    updateIptvApp,
    deleteIptvApp,
    duplicateIptvApp,
    addIptvLink,
    updateIptvLink,
    deleteIptvLink,
    videos,
    isSyncingYouTube,
    syncYouTubeChannel,
    updateVideo,
    addVideo,
    deleteVideo,
    duplicateVideo,
    notifications,
    addNotification,
    deleteNotification,
    customPageLinks,
    addCustomPageLink,
    updateCustomPageLink,
    deleteCustomPageLink,
    duplicateCustomPageLink,
    vipMembers,
    addVipMember,
    updateVipMember,
    deleteVipMember,
    approveVipMember,
    importVipMembers,
    partners,
    resetToDefaults,
    exportDataJson,
    importDataJson,
    publishOnline,
    setActivePage,
  } = useSiteData();

  const [activeTab, setActiveTab] = useState<'brand' | 'messages' | 'apps' | 'news' | 'products' | 'evModels' | 'ota' | 'tutorials' | 'unlock' | 'wallpapers' | 'iptv' | 'parceiros' | 'youtube' | 'notifications' | 'pages' | 'backup' | 'vipMembers' | 'storage' | 'database'>(initialTab);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Wallpaper editing state
  const [editingWallpaper, setEditingWallpaper] = useState<WallpaperItem | null>(null);
  const [isCreatingWallpaper, setIsCreatingWallpaper] = useState(false);

  // IPTV editing state
  const [editingIptvApp, setEditingIptvApp] = useState<IptvAppItem | null>(null);
  const [isCreatingIptvApp, setIsCreatingIptvApp] = useState(false);
  const [editingIptvLink, setEditingIptvLink] = useState<IptvSimpleLink | null>(null);
  const [isCreatingIptvLink, setIsCreatingIptvLink] = useState(false);
  const [iptvTitleInput, setIptvTitleInput] = useState<string>(iptvConfig?.title || '');
  const [iptvSummaryInput, setIptvSummaryInput] = useState<string>(iptvConfig?.summary || '');
  const [iptvGuideContentInput, setIptvGuideContentInput] = useState<string>(iptvConfig?.guideContent || '');
  const [iptvYoutubeUrlInput, setIptvYoutubeUrlInput] = useState<string>(iptvConfig?.youtubeUrl || '');

  // IPTV app selection filters
  const [iptvStoreAppSearch, setIptvStoreAppSearch] = useState('');
  const [iptvStoreAppFilter, setIptvStoreAppFilter] = useState<'all' | 'selected' | 'unselected'>('all');
  const [iptvStoreCategoryFilter, setIptvStoreCategoryFilter] = useState<string>('all');
  const [iptvDirectAppSearch, setIptvDirectAppSearch] = useState('');

  // New notification broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'app' | 'ota' | 'news' | 'product' | 'system'>('ota');
  const [broadcastLink, setBroadcastLink] = useState('');

  // YouTube Channel Sync input states
  const [channelInput, setChannelInput] = useState<string>(brand.youtubeChannelId || brand.links.youtube || '');
  const [apiKeyInput, setApiKeyInput] = useState<string>(brand.youtubeApiKey || '');
  const [syncFeedback, setSyncFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Video editing state
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);

  // Editing modals/drawers state
  const [editingApp, setEditingApp] = useState<ALXApp | null>(null);
  const [isCreatingApp, setIsCreatingApp] = useState(false);
  const [adminAppSearchTerm, setAdminAppSearchTerm] = useState('');
  const [adminAppCategoryFilter, setAdminAppCategoryFilter] = useState('all');
  const [adminAppStatusFilter, setAdminAppStatusFilter] = useState<'all' | 'free' | 'vip' | 'iptv' | 'hidden'>('all');

  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [isCreatingNews, setIsCreatingNews] = useState(false);

  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const [editingModel, setEditingModel] = useState<EVModel | null>(null);
  const [isCreatingModel, setIsCreatingModel] = useState(false);

  const [editingOta, setEditingOta] = useState<OTAUpdate | null>(null);
  const [isCreatingOta, setIsCreatingOta] = useState(false);
  const [customOtaCarInput, setCustomOtaCarInput] = useState('');
  const [extraOtaCarOptions, setExtraOtaCarOptions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alx_extra_ota_cars');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [deletedCarOptions, setDeletedCarOptions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alx_deleted_ota_cars');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [editingCarName, setEditingCarName] = useState<string | null>(null);
  const [editingCarNameInput, setEditingCarNameInput] = useState<string>('');

  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [isCreatingTutorial, setIsCreatingTutorial] = useState(false);
  const [tutorialEditorTab, setTutorialEditorTab] = useState<'editor' | 'preview'>('editor');
  const [newAttachedImgUrl, setNewAttachedImgUrl] = useState('');
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [inlineImgUrl, setInlineImgUrl] = useState('');
  const [inlineImgCaption, setInlineImgCaption] = useState('');

  const [editingUnlockService, setEditingUnlockService] = useState<UnlockServiceItem | null>(null);
  const [isCreatingUnlockService, setIsCreatingUnlockService] = useState(false);

  const [editingSocialLink, setEditingSocialLink] = useState<CustomSocialLink | null>(null);
  const [isAddingSocialLink, setIsAddingSocialLink] = useState(false);

  const [editingPageLink, setEditingPageLink] = useState<CustomPageLink | null>(null);
  const [isCreatingPageLink, setIsCreatingPageLink] = useState(false);

  const [editingContactCard, setEditingContactCard] = useState<ContactCardItem | null>(null);
  const [isCreatingContactCard, setIsCreatingContactCard] = useState(false);

  const [backupJsonInput, setBackupJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Admin password change state
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState('');
  const [confirmAdminPasswordInput, setConfirmAdminPasswordInput] = useState('');
  const [passwordChangeFeedback, setPasswordChangeFeedback] = useState<string | null>(null);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPasswordInput.trim()) {
      setPasswordChangeFeedback('A senha não pode estar em branco.');
      return;
    }
    if (newAdminPasswordInput !== confirmAdminPasswordInput) {
      setPasswordChangeFeedback('As senhas digitadas não coincidem.');
      return;
    }
    updateBrand({ adminPassword: newAdminPasswordInput });
    setNewAdminPasswordInput('');
    setConfirmAdminPasswordInput('');
    setPasswordChangeFeedback(null);
    triggerSuccess('Senha do painel de administração atualizada com sucesso!');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // ================= VIP MEMBERS MANAGEMENT STATES & HELPERS =================
  const [vipSearchQuery, setVipSearchQuery] = useState('');
  const [vipStatusFilter, setVipStatusFilter] = useState<'all' | 'Aguardando Aprovação' | 'Ativo' | 'Expirando em Breve' | 'Expirado' | 'Inativo'>('all');

  // VIP Payment & Gateway Settings State
  const [showVipPaymentSettings, setShowVipPaymentSettings] = useState(true);
  const [pixKeyInput, setPixKeyInput] = useState<string>(brand.vipPayment?.pixKey || brand.links?.email || 'contact@7f.com.br');
  const [pixKeyTypeInput, setPixKeyTypeInput] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>(brand.vipPayment?.pixKeyType || 'email');
  const [pixReceiverNameInput, setPixReceiverNameInput] = useState<string>(brand.vipPayment?.pixReceiverName || brand.brandName || 'ALX GARAGE');
  const [pixReceiverCityInput, setPixReceiverCityInput] = useState<string>(brand.vipPayment?.pixReceiverCity || 'SAO PAULO');
  const [mercadoPagoSubUrlInput, setMercadoPagoSubUrlInput] = useState<string>(brand.vipPayment?.mercadoPagoSubUrl || 'https://www.mercadopago.com.br/subscriptions/checkout');
  const [monthlySubPriceInput, setMonthlySubPriceInput] = useState<string>(brand.vipPayment?.monthlySubPrice || '14,90');
  const [pixSinglePriceInput, setPixSinglePriceInput] = useState<string>(brand.vipPayment?.pixSinglePrice || '14,90');
  const [approvalNoticeTextInput, setApprovalNoticeTextInput] = useState<string>(brand.vipPayment?.approvalNoticeText || 'A aprovação e liberação do seu acesso VIP pode demorar até 24 horas.');
  const [notificationEmailInput, setNotificationEmailInput] = useState<string>(brand.vipPayment?.notificationEmail || brand.links?.email || 'contact@7f.com.br');

  // Sincroniza campos de PIX e Mercado Pago quando dados do banco/servidor são carregados
  useEffect(() => {
    if (brand.vipPayment) {
      if (brand.vipPayment.pixKey) setPixKeyInput(brand.vipPayment.pixKey);
      if (brand.vipPayment.pixKeyType) setPixKeyTypeInput(brand.vipPayment.pixKeyType);
      if (brand.vipPayment.pixReceiverName) setPixReceiverNameInput(brand.vipPayment.pixReceiverName);
      if (brand.vipPayment.pixReceiverCity) setPixReceiverCityInput(brand.vipPayment.pixReceiverCity);
      if (brand.vipPayment.mercadoPagoSubUrl) setMercadoPagoSubUrlInput(brand.vipPayment.mercadoPagoSubUrl);
      if (brand.vipPayment.monthlySubPrice) setMonthlySubPriceInput(brand.vipPayment.monthlySubPrice);
      if (brand.vipPayment.pixSinglePrice) setPixSinglePriceInput(brand.vipPayment.pixSinglePrice);
      if (brand.vipPayment.approvalNoticeText) setApprovalNoticeTextInput(brand.vipPayment.approvalNoticeText);
      if (brand.vipPayment.notificationEmail) setNotificationEmailInput(brand.vipPayment.notificationEmail);
    }
  }, [brand.vipPayment]);


  const handleSaveVipPaymentConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBrand({
      vipPayment: {
        pixKey: pixKeyInput.trim() || 'contact@7f.com.br',
        pixKeyType: pixKeyTypeInput,
        pixReceiverName: pixReceiverNameInput.trim() || 'ALX GARAGE',
        pixReceiverCity: pixReceiverCityInput.trim() || 'SAO PAULO',
        mercadoPagoSubUrl: mercadoPagoSubUrlInput.trim() || 'https://www.mercadopago.com.br/subscriptions/checkout',
        monthlySubPrice: monthlySubPriceInput.trim() || '14,90',
        pixSinglePrice: pixSinglePriceInput.trim() || '14,90',
        approvalNoticeText: approvalNoticeTextInput.trim() || 'A aprovação e liberação do seu acesso VIP pode demorar até 24 horas.',
        notificationEmail: notificationEmailInput.trim() || 'contact@7f.com.br',
      },
    });
    triggerSuccess('Configurações de Pagamento e Chave PIX salvas com sucesso!');
  };

  // VIP Notice / Mural de Comunicados State
  const [vipNoticeTitleInput, setVipNoticeTitleInput] = useState<string>(brand.vipNoticeTitle || 'Mural de Avisos & Comunicados VIP');
  const [vipNoticeMessageInput, setVipNoticeMessageInput] = useState<string>(brand.vipNoticeMessage || 'Bem-vindo ao espaço exclusivo de membros! Fique atento às novas atualizações de APKs, firmwares e tutoriais disponibilizados periodicamente nesta área.');
  const [vipNoticeActiveInput, setVipNoticeActiveInput] = useState<boolean>(brand.vipNoticeActive !== false);

  const handleSaveVipNotice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBrand({
      vipNoticeTitle: vipNoticeTitleInput.trim() || 'Mural de Avisos & Comunicados VIP',
      vipNoticeMessage: vipNoticeMessageInput.trim(),
      vipNoticeDate: new Date().toLocaleDateString('pt-BR'),
      vipNoticeActive: vipNoticeActiveInput,
    });
    triggerSuccess('Comunicado da Área VIP atualizado com sucesso!');
  };

  // VIP WhatsApp Group State
  const [vipWhatsappGroupUrlInput, setVipWhatsappGroupUrlInput] = useState<string>(brand.vipWhatsappGroupUrl || '');
  const [vipWhatsappGroupTitleInput, setVipWhatsappGroupTitleInput] = useState<string>(brand.vipWhatsappGroupTitle || 'Grupo VIP no WhatsApp');
  const [vipWhatsappGroupDescInput, setVipWhatsappGroupDescInput] = useState<string>(brand.vipWhatsappGroupDesc || 'Faça parte da comunidade exclusiva no WhatsApp! Conecte-se diretamente com outros membros VIP, tire dúvidas e receba avisos em primeira mão.');

  const handleSaveVipWhatsappGroup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBrand({
      vipWhatsappGroupUrl: vipWhatsappGroupUrlInput.trim(),
      vipWhatsappGroupTitle: vipWhatsappGroupTitleInput.trim() || 'Grupo VIP no WhatsApp',
      vipWhatsappGroupDesc: vipWhatsappGroupDescInput.trim(),
    });
    triggerSuccess('Configurações do Grupo VIP do WhatsApp atualizadas com sucesso!');
  };

  useEffect(() => {
    if (brand.vipNoticeTitle !== undefined) setVipNoticeTitleInput(brand.vipNoticeTitle || 'Mural de Avisos & Comunicados VIP');
    if (brand.vipNoticeMessage !== undefined) setVipNoticeMessageInput(brand.vipNoticeMessage || '');
    if (brand.vipNoticeActive !== undefined) setVipNoticeActiveInput(brand.vipNoticeActive !== false);
    if (brand.vipWhatsappGroupUrl !== undefined) setVipWhatsappGroupUrlInput(brand.vipWhatsappGroupUrl || '');
    if (brand.vipWhatsappGroupTitle !== undefined) setVipWhatsappGroupTitleInput(brand.vipWhatsappGroupTitle || 'Grupo VIP no WhatsApp');
    if (brand.vipWhatsappGroupDesc !== undefined) setVipWhatsappGroupDescInput(brand.vipWhatsappGroupDesc || '');
  }, [brand.vipNoticeTitle, brand.vipNoticeMessage, brand.vipNoticeActive, brand.vipWhatsappGroupUrl, brand.vipWhatsappGroupTitle, brand.vipWhatsappGroupDesc]);

  // Add/Edit Member Modal
  const [showVipMemberModal, setShowVipMemberModal] = useState(false);
  const [editingVipMember, setEditingVipMember] = useState<VipMember | null>(null);
  const [vipFormName, setVipFormName] = useState('');
  const [vipFormEmail, setVipFormEmail] = useState('');
  const [vipFormPhone, setVipFormPhone] = useState('');
  const [vipFormPlanType, setVipFormPlanType] = useState<string>('Assinante VIP');
  const [vipFormPeriod, setVipFormPeriod] = useState<string>('Anual');
  const [vipFormStartDate, setVipFormStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [vipFormExpirationDate, setVipFormExpirationDate] = useState<string>('');
  const [vipFormStatus, setVipFormStatus] = useState<'Ativo' | 'Expirando em Breve' | 'Expirado' | 'Inativo'>('Ativo');
  const [vipFormPassword, setVipFormPassword] = useState('');
  const [vipFormNotes, setVipFormNotes] = useState('');

  // CSV Import Modal
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvInputText, setCsvInputText] = useState('');
  const [parsedCsvMembers, setParsedCsvMembers] = useState<Omit<VipMember, 'id' | 'createdAt'>[]>([]);

  // Reactivation Email Modal
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [targetReactivationMember, setTargetReactivationMember] = useState<VipMember | null>(null);
  const [reactivationSubject, setReactivationSubject] = useState('');
  const [reactivationMessage, setReactivationMessage] = useState('');

  // Calculate Active Time (Tempo Ativo)
  const calculateActiveDuration = (startDateStr: string): string => {
    if (!startDateStr) return 'N/I';
    const start = new Date(startDateStr);
    const now = new Date();
    if (isNaN(start.getTime())) return 'N/I';

    const diffMs = now.getTime() - start.getTime();
    if (diffMs < 0) return 'Recente';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} ${days === 1 ? 'dia' : 'dias'}`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`;

    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (remMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remMonths} ${remMonths === 1 ? 'mês' : 'meses'}`;
  };

  // Handle Open Add Member Modal
  const handleOpenAddVipMember = () => {
    setEditingVipMember(null);
    setVipFormName('');
    setVipFormEmail('');
    setVipFormPhone('');
    setVipFormPlanType('Assinante VIP');
    setVipFormPeriod('Anual');
    const today = new Date().toISOString().slice(0, 10);
    setVipFormStartDate(today);

    // Default 1 year ahead
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setVipFormExpirationDate(nextYear.toISOString().slice(0, 10));
    setVipFormStatus('Ativo');
    setVipFormPassword('');
    setVipFormNotes('');
    setShowVipMemberModal(true);
  };

  // Handle Open Edit Member Modal
  const handleOpenEditVipMember = (member: VipMember) => {
    setEditingVipMember(member);
    setVipFormName(member.name);
    setVipFormEmail(member.email);
    setVipFormPhone(member.phone || '');
    setVipFormPassword(member.password || '');
    setVipFormPlanType(member.planType);
    setVipFormPeriod(member.period);
    setVipFormStartDate(member.startDate || new Date().toISOString().slice(0, 10));
    setVipFormExpirationDate(member.expirationDate || '');
    setVipFormStatus(member.status);
    setVipFormNotes(member.notes || '');
    setShowVipMemberModal(true);
  };

  // Handle Save VIP Member (Add or Edit)
  const handleSaveVipMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipFormName.trim() || !vipFormEmail.trim()) {
      alert('Por favor, informe Nome e E-mail do membro.');
      return;
    }

    if (editingVipMember) {
      updateVipMember(editingVipMember.id, {
        name: vipFormName,
        email: vipFormEmail,
        phone: vipFormPhone,
        password: vipFormPassword.trim() || undefined,
        planType: vipFormPlanType,
        period: vipFormPeriod,
        startDate: vipFormStartDate,
        expirationDate: vipFormExpirationDate,
        status: vipFormStatus,
        notes: vipFormNotes,
      });
      triggerSuccess(`Membro "${vipFormName}" atualizado com sucesso!`);
    } else {
      addVipMember({
        name: vipFormName,
        email: vipFormEmail,
        phone: vipFormPhone,
        password: vipFormPassword.trim() || undefined,
        planType: vipFormPlanType,
        period: vipFormPeriod,
        startDate: vipFormStartDate,
        expirationDate: vipFormExpirationDate,
        status: vipFormStatus,
        notes: vipFormNotes,
      });
      triggerSuccess(`Novo membro "${vipFormName}" adicionado com sucesso!`);
    }

    setShowVipMemberModal(false);
  };

  // Open Reactivation / Reminder Modal
  const [isSendingReactivationEmail, setIsSendingReactivationEmail] = useState(false);
  const [reactivationFeedback, setReactivationFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleOpenReactivationModal = (member: VipMember) => {
    setTargetReactivationMember(member);
    setReactivationFeedback(null);
    setReactivationSubject(`[Alx⁺] Lembrete de Reativação da Assinatura VIP - ${member.name}`);
    setReactivationMessage(
      `Olá, ${member.name}!\n\nSeu plano VIP (${member.planType} - ${member.period}) no Portal Alx⁺ possui validade até ${member.expirationDate}.\n\nPara continuar com acesso aos APKs, atualizações de firmware e suporte exclusivo sem interrupções, renove sua adesão diretamente no site ou entre em contato conosco.\n\nAtenciosamente,\nEquipe Alx⁺ VIP`
    );
    setShowReactivationModal(true);
  };

  const handleSendReactivationEmail = async () => {
    if (!targetReactivationMember || !targetReactivationMember.email) {
      alert('E-mail do membro não encontrado.');
      return;
    }
    setIsSendingReactivationEmail(true);
    setReactivationFeedback(null);

    const recipientEmail = targetReactivationMember.email;
    const web3Key = brand.links?.web3formsKey?.trim();
    let sentSuccess = false;

    try {
      if (web3Key) {
        try {
          const w3Res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              access_key: web3Key,
              name: 'Portal Alx⁺ VIP',
              email: recipientEmail,
              replyto: brand.links?.email || 'contact@7f.com.br',
              subject: reactivationSubject,
              message: reactivationMessage,
            }),
          });
          if (w3Res.ok) sentSuccess = true;
        } catch (err) {
          console.warn('Web3Forms reactivation error:', err);
        }
      }

      if (!sentSuccess) {
        try {
          const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              Membro: targetReactivationMember.name,
              Email: recipientEmail,
              Mensagem: reactivationMessage,
              _replyto: brand.links?.email || 'contact@7f.com.br',
              _subject: reactivationSubject,
              _template: 'box',
              _captcha: 'false',
            }),
          });
          if (res.ok) sentSuccess = true;
        } catch (err) {
          console.warn('FormSubmit reactivation error:', err);
        }
      }

      if (sentSuccess) {
        setReactivationFeedback({
          success: true,
          message: `E-mail de reativação enviado com sucesso para ${recipientEmail}!`,
        });
        triggerSuccess(`E-mail de reativação enviado para ${recipientEmail}!`);
      } else {
        const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(reactivationSubject)}&body=${encodeURIComponent(reactivationMessage)}`;
        window.open(mailtoUrl, '_blank');
        setReactivationFeedback({
          success: true,
          message: `Cliente de e-mail aberto para ${recipientEmail}.`,
        });
        triggerSuccess('Cliente de e-mail aberto com a mensagem!');
      }
    } catch (err: any) {
      const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(reactivationSubject)}&body=${encodeURIComponent(reactivationMessage)}`;
      window.open(mailtoUrl, '_blank');
      setReactivationFeedback({
        success: true,
        message: `Cliente de e-mail aberto para ${recipientEmail}.`,
      });
    } finally {
      setIsSendingReactivationEmail(false);
    }
  };

  const handleCsvFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        handleParseCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  // Parse CSV Input
  const handleParseCsvText = (text: string) => {
    setCsvInputText(text);
    if (!text.trim()) {
      setParsedCsvMembers([]);
      return;
    }

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setParsedCsvMembers([]);
      return;
    }

    // Skip header line if detected
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('nome') || firstLine.includes('email') || firstLine.includes('plano');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const list: Omit<VipMember, 'id' | 'createdAt'>[] = [];

    dataLines.forEach((line) => {
      // Split by comma or semicolon
      const cols = line.split(/[,;]/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2 && cols[0] && cols[1].includes('@')) {
        const name = cols[0];
        const email = cols[1];
        const phone = cols[2] || '';
        const planType = cols[3] || 'Assinante VIP';
        const period = cols[4] || 'Anual';
        const startDate = cols[5] || new Date().toISOString().slice(0, 10);
        const expirationDate = cols[6] || '2027-01-01';
        const statusRaw = cols[7] || 'Ativo';
        const status = ['Ativo', 'Expirando em Breve', 'Expirado', 'Inativo'].includes(statusRaw)
          ? (statusRaw as any)
          : 'Ativo';
        const notes = cols[8] || 'Importado via Planilha CSV';

        list.push({
          name,
          email,
          phone,
          planType,
          period,
          startDate,
          expirationDate,
          status,
          notes,
        });
      }
    });

    setParsedCsvMembers(list);
  };

  // Confirm Import
  const handleConfirmCsvImport = () => {
    if (parsedCsvMembers.length === 0) return;
    const count = importVipMembers(parsedCsvMembers);
    triggerSuccess(`${count} membros VIP importados com sucesso!`);
    setShowCsvImportModal(false);
    setCsvInputText('');
    setParsedCsvMembers([]);
  };

  // Download Sample CSV Model
  const handleDownloadCsvModel = () => {
    const csvContent =
      'nome,email,telefone,tipoAssinatura,plano,dataInicio,dataExpiracao,status,observacoes\n' +
      'Carlos Silva,carlos@exemplo.com,(11) 98765-4321,Assinante VIP,Anual,2026-01-15,2027-01-15,Ativo,Membro Anual\n' +
      'Mariana Costa,mariana@exemplo.com,(21) 99887-1122,Apoiador WhatsApp,Mensal,2026-09-01,2026-10-05,Expirando em Breve,Grupo WhatsApp\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-importacao-membros-vip.csv';
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess('Modelo CSV baixado com sucesso!');
  };

  // Download JSON Backup
  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alx-site-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerSuccess('Backup baixado com sucesso!');
  };

  // Export Contact Messages as CSV
  const handleExportContactMessagesCsv = () => {
    if (!contactMessages || contactMessages.length === 0) {
      alert('Nenhuma mensagem ou contato na caixa de entrada para exportar.');
      return;
    }
    const headers = ['ID', 'Nome', 'E-mail', 'Assunto', 'Mensagem', 'Data', 'Status'];
    const rows = contactMessages.map((m) => [
      m.id,
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `"${(m.email || '').replace(/"/g, '""')}"`,
      `"${(m.subject || '').replace(/"/g, '""')}"`,
      `"${(m.message || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
      `"${m.date || ''}"`,
      `"${m.read ? 'Lida' : 'Não Lida'}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos-mensagens-alx-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess(`${contactMessages.length} contatos e mensagens exportados com sucesso em CSV!`);
  };

  // Export Contact Messages as JSON
  const handleExportContactMessagesJson = () => {
    if (!contactMessages || contactMessages.length === 0) {
      alert('Nenhuma mensagem ou contato para exportar.');
      return;
    }
    const blob = new Blob([JSON.stringify(contactMessages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos-mensagens-alx-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess('Arquivo JSON de contatos e mensagens baixado!');
  };

  // Copy Contact Emails
  const handleCopyContactEmails = () => {
    if (!contactMessages || contactMessages.length === 0) {
      alert('Nenhum e-mail para copiar.');
      return;
    }
    const uniqueEmails = Array.from(new Set(contactMessages.map((m) => m.email?.trim()).filter(Boolean)));
    navigator.clipboard.writeText(uniqueEmails.join(', '));
    triggerSuccess(`${uniqueEmails.length} e-mails copiados para a área de transferência!`);
  };

  // Export VIP Members as CSV
  const handleExportVipMembersCsv = () => {
    if (!vipMembers || vipMembers.length === 0) {
      alert('Nenhum membro VIP para exportar.');
      return;
    }
    const headers = ['ID', 'Nome', 'E-mail', 'WhatsApp_Telefone', 'Plano', 'Periodo', 'Data_Inicio', 'Data_Expiracao', 'Status', 'Observacoes', 'Cadastrado_Em'];
    const rows = vipMembers.map((m) => [
      m.id,
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `"${(m.email || '').replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${(m.planType || '').replace(/"/g, '""')}"`,
      `"${(m.period || '').replace(/"/g, '""')}"`,
      `"${m.startDate || ''}"`,
      `"${m.expirationDate || ''}"`,
      `"${m.status || ''}"`,
      `"${(m.notes || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
      `"${m.createdAt || ''}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membros-vip-alx-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess(`${vipMembers.length} membros VIP exportados em CSV!`);
  };

  // Copy VIP Member Emails
  const handleCopyVipEmails = () => {
    if (!vipMembers || vipMembers.length === 0) {
      alert('Nenhum membro VIP para copiar.');
      return;
    }
    const uniqueEmails = Array.from(new Set(vipMembers.map((m) => m.email?.trim()).filter(Boolean)));
    navigator.clipboard.writeText(uniqueEmails.join(', '));
    triggerSuccess(`${uniqueEmails.length} e-mails de membros VIP copiados!`);
  };

  // Import JSON Backup
  const handleImportBackup = () => {
    if (!backupJsonInput.trim()) return;
    const res = importDataJson(backupJsonInput);
    setImportStatus(res);
    if (res.success) {
      triggerSuccess(res.message);
      setBackupJsonInput('');
    }
  };

  // Contact Messages Inbox state & handlers
  const [messagesFilter, setMessagesFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [messagesSearch, setMessagesSearch] = useState<string>('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{
    success: boolean;
    isActivationNotice?: boolean;
    message: string;
  } | null>(null);
  const [destinationEmailInput, setDestinationEmailInput] = useState<string>(brand.links?.email || 'contact@7f.com.br');
  const [web3KeyInput, setWeb3KeyInput] = useState<string>(brand.links?.web3formsKey || '');
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>(brand.links?.customWebhookUrl || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const unreadMessagesCount = (contactMessages || []).filter((m) => !m.read).length;

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailFeedback(null);
    const targetEmail = destinationEmailInput.trim() || brand.links?.email || 'contact@7f.com.br';
    const web3Key = web3KeyInput.trim() || brand.links?.web3formsKey?.trim();
    const webhookUrl = webhookUrlInput.trim() || brand.links?.customWebhookUrl?.trim();
    let web3Success = false;
    let webhookSuccess = false;
    let formsubmitSuccess = false;

    try {
      // 1. Test Webhook if configured
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🧪 **[Teste de Conexão] Painel Administrativo Alx +**\nStatus: Conexão Webhook ativa!\nDestino: ${targetEmail}\nData: ${new Date().toLocaleString('pt-BR')}`,
              name: 'Painel Administrativo',
              email: targetEmail,
              subject: 'Teste de Conexão',
              message: 'Teste de recebimento via Webhook',
            }),
          });
          webhookSuccess = true;
        } catch (e) {
          console.warn('Webhook test error:', e);
        }
      }

      // 2. Test Web3Forms if configured
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
              name: 'Painel Administrativo Alx + (Teste Web3Forms)',
              email: targetEmail,
              replyto: targetEmail,
              subject: `[Teste Web3Forms ⚡] Painel Administrativo`,
              message: `Teste de disparo ultra-rápido via Web3Forms para ${targetEmail}.\nData/Hora: ${new Date().toLocaleString('pt-BR')}`,
            }),
          });
          const w3Data = await w3Res.json().catch(() => null);
          if (w3Data?.success || w3Res.ok) {
            web3Success = true;
          }
        } catch (e) {
          console.warn('Web3Forms test error:', e);
        }
      }

      // 3. Test FormSubmit (apenas se Web3Forms não estiver configurado ou tiver falhado)
      if (!web3Success) {
        try {
          const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              Nome: 'Painel Administrativo Alx + (Teste de Conexão)',
              Email: targetEmail,
              Mensagem: `Olá! Este é um e-mail de teste disparado pelo Painel Administrativo para confirmar que o formulário do site está operando e entregando mensagens no endereço ${targetEmail}.\n\nData e hora: ${new Date().toLocaleString('pt-BR')}`,
              _replyto: targetEmail,
              _subject: `[Teste de Verificação] Painel Administrativo Alx +`,
              _template: 'box',
              _captcha: 'false',
            }),
          });

          let formSubmitMsg = '';
          try {
            const data = await res.json().catch(() => null);
            if (data) {
              formSubmitMsg = data.message || '';
              if (data.success === 'true' || data.success === true || res.ok) {
                formsubmitSuccess = true;
              }
            }
          } catch {
            if (res.ok) formsubmitSuccess = true;
          }

          // Check if FormSubmit returned an activation requirement message
          if (formSubmitMsg && (formSubmitMsg.toLowerCase().includes('activate') || formSubmitMsg.toLowerCase().includes('confirm') || formSubmitMsg.toLowerCase().includes('activation'))) {
            setTestEmailFeedback({
              success: false,
              isActivationNotice: true,
              message: `O FormSubmit informou: "${formSubmitMsg}". Para começar a receber nesta caixa postal, acesse o webmail de ${targetEmail} (ex: mail.hostinger.com) e procure na Caixa de Entrada e na pasta SPAM pelo e-mail "Action Required: Activate FormSubmit" e clique em "Activate Form".`,
            });
            setIsSendingTestEmail(false);
            return;
          }
        } catch (e: any) {
          console.warn('FormSubmit test error:', e);
        }
      }

      if (web3Success || webhookSuccess || formsubmitSuccess) {
        const details = [
          web3Success ? 'Web3Forms (⚡ Ultra Rápido)' : null,
          webhookSuccess ? 'Webhook Instantâneo' : null,
          formsubmitSuccess ? 'FormSubmit' : null,
        ].filter(Boolean).join(', ');

        setTestEmailFeedback({
          success: true,
          message: `E-mail de teste disparado com sucesso via ${details}! Verifique a caixa de entrada (e a pasta Spam/Lixo Eletrônico) em ${targetEmail}.`,
        });
        triggerSuccess(`E-mail de teste entregue!`);
      } else {
        setTestEmailFeedback({
          success: false,
          message: `Não foi possível confirmar o recebimento em ${targetEmail}. Verifique se a caixa postal está ativa, se há bloqueio de spam no provedor (Hostinger) ou configure uma chave gratuita em web3forms.com.`,
        });
      }
    } catch (err: any) {
      setTestEmailFeedback({
        success: false,
        message: 'Falha de conexão com os serviços de e-mail: ' + (err?.message || 'Erro de rede'),
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSaveDestinationEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedEmail = destinationEmailInput.trim() || 'contact@7f.com.br';
    const updatedWeb3 = web3KeyInput.trim();
    const updatedWebhook = webhookUrlInput.trim();

    updateBrand({
      links: {
        ...brand.links,
        email: updatedEmail,
        web3formsKey: updatedWeb3,
        customWebhookUrl: updatedWebhook,
      },
    });
    triggerSuccess(`Configurações de e-mail e gateways salvas com sucesso!`);
  };

  // Drag & drop tab ordering
  const defaultTabIds = [
    'brand',
    'messages',
    'notifications',
    'youtube',
    'apps',
    'storage',
    'database',
    'news',
    'products',
    'evModels',
    'ota',
    'tutorials',
    'unlock',
    'wallpapers',
    'iptv',
    'parceiros',
    'pages',
    'vipMembers',
    'backup',
  ];

  const [tabOrder, setTabOrder] = useState<string[]>(() => {
    if (brand?.adminTabOrder && Array.isArray(brand.adminTabOrder) && brand.adminTabOrder.length > 0) {
      const merged = [...brand.adminTabOrder];
      defaultTabIds.forEach((id) => {
        if (!merged.includes(id)) merged.push(id);
      });
      return merged;
    }
    try {
      const saved = localStorage.getItem('alx_admin_tabs_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          defaultTabIds.forEach((id) => {
            if (!merged.includes(id)) merged.push(id);
          });
          return merged;
        }
      }
    } catch {}
    return defaultTabIds;
  });

  // Sincroniza ordem dos ícones quando chega do Banco MySQL / Servidor
  useEffect(() => {
    if (brand?.adminTabOrder && Array.isArray(brand.adminTabOrder) && brand.adminTabOrder.length > 0) {
      const merged = [...brand.adminTabOrder];
      defaultTabIds.forEach((id) => {
        if (!merged.includes(id)) merged.push(id);
      });
      setTabOrder(merged);
    }
  }, [brand?.adminTabOrder]);

  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);

  const saveNewTabOrder = (newList: string[], msg?: string) => {
    setTabOrder(newList);
    try {
      localStorage.setItem('alx_admin_tabs_order', JSON.stringify(newList));
    } catch {}
    // Grava imediatamente no MySQL e servidor através do updateBrand
    updateBrand({ adminTabOrder: newList });
    triggerSuccess(msg || 'Ordem dos ícones salva no Banco de Dados MySQL!');
  };

  const moveTab = (id: string, direction: 'left' | 'right') => {
    const currentList = [...tabOrder];
    const currentIndex = currentList.indexOf(id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const item = currentList[currentIndex];
    currentList.splice(currentIndex, 1);
    currentList.splice(targetIndex, 0, item);
    saveNewTabOrder(currentList, 'Posição salva no Banco de Dados MySQL!');
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTabId(id);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', id);
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = 'move';
    } catch {}
    if (dragOverTabId !== id) {
      setDragOverTabId(id);
    }
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverTabId !== id) {
      setDragOverTabId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTabId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTabId(null);
    if (!draggedTabId || draggedTabId === targetId) {
      setDraggedTabId(null);
      return;
    }
    const currentList = [...tabOrder];
    const sourceIndex = currentList.indexOf(draggedTabId);
    const targetIndex = currentList.indexOf(targetId);
    if (sourceIndex !== -1 && targetIndex !== -1) {
      currentList.splice(sourceIndex, 1);
      currentList.splice(targetIndex, 0, draggedTabId);
      saveNewTabOrder(currentList, 'Nova ordem dos ícones salva no Banco de Dados MySQL!');
    }
    setDraggedTabId(null);
  };

  const resetTabOrder = () => {
    saveNewTabOrder(defaultTabIds, 'Ordem padrão restaurada e salva no MySQL!');
    try {
      localStorage.removeItem('alx_admin_tabs_order');
    } catch {}
  };

  const navTabs = [
    { id: 'brand', label: 'Imagens', icon: ImageIcon, count: null },
    { id: 'messages', label: 'Mensagens & Contatos (Caixa de Entrada)', icon: Mail, count: unreadMessagesCount },
    { id: 'notifications', label: 'Notificações & Sininho', icon: Bell, count: notifications.length },
    { id: 'youtube', label: 'Vídeos YouTube', icon: Youtube, count: videos.length },
    { id: 'apps', label: 'Aplicativos', icon: AppWindow, count: apps.length },
    { id: 'storage', label: 'Armazenamento & GitHub', icon: HardDrive, count: null },
    { id: 'database', label: 'Banco de Dados MySQL', icon: Database, count: null },
    { id: 'news', label: 'Notícias & Artigos', icon: Newspaper, count: news.length },
    { id: 'products', label: 'Produtos & Loja', icon: ShoppingBag, count: products.length },
    { id: 'evModels', label: 'Modelos EV', icon: Car, count: evModels.length },
    { id: 'ota', label: 'OTA', icon: RefreshCw, count: otaUpdates.length },
    { id: 'tutorials', label: 'Tutoriais', icon: BookOpen, count: tutorials.length },
    { id: 'unlock', label: 'Desbloqueios & Serviços', icon: KeyRound, count: (unlockServices || []).length },
    { id: 'wallpapers', label: 'Wallpapers & Wallpapers Animados', icon: Layers, count: (wallpapers || []).length },
    { id: 'iptv', label: 'IPTV & Streaming', icon: Tv, count: (iptvConfig?.apps || []).length },
    { id: 'parceiros', label: 'Parceiros & Parcerias', icon: Handshake, count: (partners || []).length },
    { id: 'pages', label: 'Páginas & Links do Menu', icon: Globe, count: customPageLinks.length },
    { id: 'vipMembers', label: 'Gestão de Membros VIP', icon: Users, count: (vipMembers || []).length },
    { id: 'backup', label: 'Backup & Dados', icon: FileJson, count: null },
  ] as const;

  const orderedNavTabs = useMemo(() => {
    return [...navTabs].sort((a, b) => {
      const idxA = tabOrder.indexOf(a.id);
      const idxB = tabOrder.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [navTabs, tabOrder]);

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#121217] pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white text-neutral-900 border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (onClose) onClose();
                else setActivePage({ type: 'home' });
              }}
              className="p-2.5 rounded-2xl bg-neutral-100 border border-neutral-300 text-neutral-900 hover:bg-neutral-200 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shrink-0 shadow-xs"
              title="Voltar ao site principal"
            >
              <ArrowLeft className="w-4 h-4 text-[#ebbf01]" />
              <span className="hidden sm:inline">Voltar ao Site</span>
            </button>

            {/* Logo & Favicon Branding Badge */}
            <div className="flex items-center gap-3">
              <div className="relative p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                <img
                  src={brand.logoUrl || '/imagens/logo.png'}
                  alt="Logo ALX"
                  className="h-8 sm:h-9 w-auto max-w-[120px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/alx-logo.svg';
                  }}
                />
                {/* Favicon icon badge overlay */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#ebbf01] p-0.5 flex items-center justify-center shadow-xs" title="Favicon do Navegador">
                  <img
                    src={brand.faviconUrl || '/favicon.svg'}
                    alt="Favicon"
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/alx-logo.svg';
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-neutral-900 tracking-wider">
                    Painel
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              disabled={isPublishing}
              onClick={async () => {
                setIsPublishing(true);
                try {
                  const res = await publishOnline();
                  if (res.success) {
                    triggerSuccess(res.message || '✅ Alterações salvas com sucesso no banco de dados MySQL e servidor!');
                  } else {
                    triggerSuccess(`Aviso: ${res.message}`);
                  }
                } catch (err: any) {
                  triggerSuccess('Erro ao salvar no servidor.');
                } finally {
                  setIsPublishing(false);
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-[#ebbf01] text-xs font-extrabold uppercase transition-all shadow-md cursor-pointer border border-[#ebbf01]/30 disabled:opacity-60"
              title="Salva as alterações no banco de dados MySQL e servidor"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-[#ebbf01] animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar no Servidor</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase transition-all shadow-md cursor-pointer border ${
                activeTab === 'database'
                  ? 'bg-[#ebbf01] text-black border-[#ebbf01] ring-2 ring-black'
                  : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Configurar credenciais do Banco de Dados MySQL da Hostinger"
            >
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>Banco MySQL</span>
            </button>
            <button
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-900 hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Baixar backup de todas as fotos e configurações"
            >
              <Download className="w-3.5 h-3.5 text-[#ebbf01]" />
              <span className="hidden md:inline">Exportar Backup</span>
            </button>

            <button
              onClick={() => setActivePage({ type: 'home' })}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ver Site</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Encerrar sessão de administrador"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {successMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-neutral-300 text-neutral-900 text-xs font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <div className="w-6 h-6 rounded-full bg-[#ebbf01] text-black flex items-center justify-center font-bold">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs - SOMENTE ÍCONES & ARRASTÁVEL / SETAS DE MOVIMENTO */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1 pb-2.5 border-b border-neutral-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">
                Menus de Gestão
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Arraste os ícones ou use as setinhas ◀ ▶ para mover (salva automaticamente no MySQL)
              </span>
            </div>
            <button
              type="button"
              onClick={resetTabOrder}
              className="text-[11px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
              title="Restaurar a ordem original dos ícones"
            >
              Restaurar Ordem Padrão
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            {orderedNavTabs.map((tab, tabIdx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDragging = draggedTabId === tab.id;
              const isOver = dragOverTabId === tab.id;
              const canMoveLeft = tabIdx > 0;
              const canMoveRight = tabIdx < orderedNavTabs.length - 1;

              return (
                <div
                  key={tab.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, tab.id)}
                  onDragOver={(e) => handleDragOver(e, tab.id)}
                  onDragEnter={(e) => handleDragEnter(e, tab.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, tab.id)}
                  onDragEnd={() => {
                    setDraggedTabId(null);
                    setDragOverTabId(null);
                  }}
                  onClick={() => setActiveTab(tab.id as any)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTab(tab.id as any);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  title={`${tab.label} (Arraste ou use as setas para mover)`}
                  aria-label={tab.label}
                  className={`relative p-3.5 rounded-2xl transition-all duration-150 cursor-grab active:cursor-grabbing group flex items-center justify-center select-none outline-none ${
                    isActive
                      ? 'bg-black text-[#ebbf01] shadow-md shadow-black/20 ring-2 ring-black scale-105 z-10'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 hover:text-black border border-neutral-200 shadow-xs'
                  } ${isDragging ? 'opacity-30 scale-90 border-2 border-dashed border-[#ebbf01]' : ''} ${
                    isOver ? 'ring-2 ring-[#ebbf01] border-[#ebbf01] scale-110 bg-amber-50' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#ebbf01]' : 'text-neutral-900'}`} />

                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 text-[10px] font-mono font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center border shadow-xs pointer-events-none ${
                        isActive
                          ? 'bg-[#ebbf01] text-black border-black'
                          : 'bg-neutral-300 text-neutral-900 border-white'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}

                  {/* Setinhas para mover com 1 clique (compatível com 100% dos navegadores e mobile) */}
                  <div className="absolute -bottom-2 inset-x-0 flex items-center justify-between px-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20 pointer-events-auto">
                    {canMoveLeft ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveTab(tab.id, 'left');
                        }}
                        className="w-4 h-4 rounded-full bg-white text-neutral-800 hover:bg-[#ebbf01] hover:text-black shadow-md border border-neutral-300 flex items-center justify-center cursor-pointer transition-colors"
                        title="Mover para esquerda"
                      >
                        <ChevronLeft className="w-2.5 h-2.5" />
                      </button>
                    ) : <span className="w-4" />}

                    {canMoveRight ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveTab(tab.id, 'right');
                        }}
                        className="w-4 h-4 rounded-full bg-white text-neutral-800 hover:bg-[#ebbf01] hover:text-black shadow-md border border-neutral-300 flex items-center justify-center cursor-pointer transition-colors"
                        title="Mover para direita"
                      >
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    ) : <span className="w-4" />}
                  </div>

                  {/* Tooltip no hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-30">
                    {tab.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TAB 1: IMAGENS */}
        {activeTab === 'brand' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 font-heading">
                  Imagens
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-neutral-200">
                {/* Logo */}
                <div className="space-y-4">
                  <ImageUploadField
                    label="Logo"
                    value={brand.logoUrl}
                    onChange={(newUrl) => updateBrand({ logoUrl: newUrl })}
                    helperText="Recomendado: PNG transparente ou SVG"
                    aspectRatio="square"
                    presetOptions={[
                      { label: 'Logo Padrão PNG', url: '/imagens/logo.png' },
                      { label: 'Logo Padrão SVG', url: '/imagens/logo.svg' },
                      { label: 'ALX Vector Logo', url: '/alx-logo.svg' },
                    ]}
                  />
                </div>

                {/* Favicon */}
                <div className="space-y-4">
                  <ImageUploadField
                    label="Favicon"
                    value={brand.faviconUrl || '/favicon.svg'}
                    onChange={(newUrl) => updateBrand({ faviconUrl: newUrl })}
                    helperText="Ícone exibido na aba do navegador (PNG/SVG/ICO) - atualiza a aba instantaneamente"
                    aspectRatio="square"
                    presetOptions={[
                      { label: 'Favicon SVG Oficial', url: '/favicon.svg' },
                      { label: 'Favicon ICO Oficial', url: '/favicon.ico' },
                      { label: 'Logo ALX PNG', url: '/imagens/logo.png' },
                    ]}
                  />
                </div>

                {/* Youtube */}
                <div className="space-y-4">
                  <ImageUploadField
                    label="Youtube"
                    value={brand.youtubeSectionLogoUrl || '/logo_alx_garage.png'}
                    onChange={(newUrl) => updateBrand({ youtubeSectionLogoUrl: newUrl })}
                    helperText="PNG transparente ou SVG exibido na seção YouTube"
                    aspectRatio="wide"
                    presetOptions={[
                      { label: 'ALX Garage PNG', url: '/logo_alx_garage.png' },
                      { label: 'ALX Garage SVG', url: '/logo_alx_garage.svg' },
                    ]}
                  />
                </div>

                {/* Shop / Produtos */}
                <div className="space-y-4">
                  <ImageUploadField
                    label="Shop / Loja"
                    value={brand.shopSectionLogoUrl || '/logo_alx_garage.png'}
                    onChange={(newUrl) => updateBrand({ shopSectionLogoUrl: newUrl })}
                    helperText="PNG transparente ou SVG exibido no topo da página Shop"
                    aspectRatio="wide"
                    presetOptions={[
                      { label: 'ALX Garage PNG', url: '/logo_alx_garage.png' },
                      { label: 'ALX Garage SVG', url: '/logo_alx_garage.svg' },
                    ]}
                  />
                </div>

                {/* Imei */}
                <div className="space-y-4">
                  <ImageUploadField
                    label="Imei"
                    value={brand.imeiPageLogoUrl || brand.logoUrl || '/logo_alx_garage.png'}
                    onChange={(newUrl) => updateBrand({ imeiPageLogoUrl: newUrl })}
                    helperText="Logo exibido no topo da página do Gerador Senha IMEI"
                    aspectRatio="wide"
                    presetOptions={[
                      { label: 'ALX Garage YouTube', url: '/logo_alx_garage.png' },
                      { label: 'ALX Garage Logo', url: '/alx-logo.svg' },
                    ]}
                  />
                </div>

                {/* Compartilhamento / OpenGraph (WhatsApp & Telegram) */}
                <div className="space-y-4 sm:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-neutral-900 font-heading">
                      Prévia Oficial de Compartilhamento (WhatsApp, Telegram e Redes Sociais)
                    </span>
                  </div>
                  <ImageUploadField
                    label="Imagem Padrão de Compartilhamento (OpenGraph)"
                    value={brand.defaultShareImageUrl || '/imagens/og-padrao.jpg'}
                    onChange={(newUrl) => {
                      if (!newUrl || newUrl.trim() === '') {
                        const confirmFallback = window.confirm(
                          "Atenção: O site exige uma imagem genérica padrão para prévia no WhatsApp e redes sociais ao compartilhar links que não possuem foto própria.\n\n" +
                          "Ao remover a imagem customizada, o sistema irá redefinir automaticamente para a imagem padrão oficial do ALX⁺ (/imagens/og-padrao.jpg).\n\n" +
                          "Deseja confirmar a redefinição para a imagem padrão?"
                        );
                        if (confirmFallback) {
                          updateBrand({ defaultShareImageUrl: '/imagens/og-padrao.jpg' });
                        }
                      } else {
                        updateBrand({ defaultShareImageUrl: newUrl });
                      }
                    }}
                    helperText="Imagem oficial (1200x630 px) enviada no WhatsApp e Telegram ao compartilhar a Home ou páginas que não possuem uma foto própria específica. Impede que os mensageiros puxem imagens aleatórias do site."
                    aspectRatio="wide"
                    presetOptions={[
                      { label: 'ALX Padrão Oficial (1200x630)', url: '/imagens/og-padrao.jpg' },
                      { label: 'ALX Desbloqueio Oficial', url: '/imagens/og-desbloqueio.jpg' },
                      { label: 'ALX Tutoriais Oficial', url: '/imagens/og-tutoriais.jpg' },
                      { label: 'ALX VIP Oficial', url: '/imagens/og-vip.jpg' },
                      { label: 'ALX Fundo Hero / Recarga', url: '/imagens/fundo-calculadora.jpg' },
                    ]}
                  />
                </div>
              </div>

              {/* Gerenciador de Cores Temáticas por Página */}
              <div className="pt-6 border-t border-neutral-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 font-heading flex items-center gap-2">
                      <Palette className="w-4 h-4 text-neutral-800" />
                      <span>Cores Temáticas por Página</span>
                    </h4>
                    <p className="text-xs text-neutral-600 font-medium mt-0.5">
                      Cada seção possui sua própria cor temática exclusiva. Ao navegar pelo site, a cor muda automaticamente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateBrand({ pageColors: { ...DEFAULT_PAGE_COLORS } });
                      triggerSuccess('Cores originais de todas as páginas restauradas com sucesso!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-xs font-mono font-bold transition-all border border-neutral-300 cursor-pointer shrink-0"
                    title="Restaurar a paleta padrão de todas as páginas"
                  >
                    Restaurar Padrão
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {EDITABLE_PAGES.map((pageDef) => {
                    const currentColor = (brand.pageColors && brand.pageColors[pageDef.key]) 
                      ? brand.pageColors[pageDef.key] 
                      : pageDef.defaultHex;

                    return (
                      <div
                        key={pageDef.key}
                        className="p-3 bg-neutral-50 hover:bg-white rounded-xl border border-neutral-200 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Amostra visual da cor */}
                          <div 
                            className="w-8 h-8 rounded-lg border border-neutral-300 shrink-0 shadow-inner flex items-center justify-center font-bold text-[10px]"
                            style={{ 
                              backgroundColor: currentColor,
                              color: currentColor.toLowerCase() === '#ffffff' || currentColor.toLowerCase() === '#f6f6f6' ? '#000000' : '#000000'
                            }}
                          >
                            ●
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-neutral-900 truncate">
                              {pageDef.name}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono truncate">
                              {pageDef.description}
                            </div>
                          </div>
                        </div>

                        {/* Controles de Cor */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Color Picker nativo */}
                          <label className="relative cursor-pointer">
                            <input
                              type="color"
                              value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : pageDef.defaultHex}
                              onChange={(e) => {
                                const newHex = e.target.value.toUpperCase();
                                const updatedColors = { ...(brand.pageColors || DEFAULT_PAGE_COLORS), [pageDef.key]: newHex };
                                updateBrand({ pageColors: updatedColors });
                              }}
                              className="sr-only"
                            />
                            <div 
                              className="w-7 h-7 rounded-lg border-2 border-white shadow-xs cursor-pointer hover:scale-105 transition-transform"
                              style={{ backgroundColor: currentColor }}
                              title="Clique para abrir seletor visual de cor"
                            />
                          </label>

                          {/* Campo de Texto HEX */}
                          <input
                            type="text"
                            value={currentColor}
                            onChange={(e) => {
                              const inputVal = e.target.value.trim();
                              const updatedColors = { ...(brand.pageColors || DEFAULT_PAGE_COLORS), [pageDef.key]: inputVal };
                              updateBrand({ pageColors: updatedColors });
                            }}
                            className="w-20 px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold text-neutral-900 text-center uppercase focus:outline-none focus:border-black"
                            placeholder="#HEX"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informações de Texto da Marca */}
              <div className="pt-6 border-t border-neutral-200 space-y-4">
                <h4 className="text-sm font-bold text-neutral-900 font-heading">Textos da Marca</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold">Nome da Marca</label>
                    <input
                      type="text"
                      value={brand.brandName}
                      onChange={(e) => updateBrand({ brandName: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold">Slogan Principal (Tagline)</label>
                    <input
                      type="text"
                      value={brand.tagline}
                      onChange={(e) => updateBrand({ tagline: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold">Descrição / Sub-slogan</label>
                    <textarea
                      rows={2}
                      value={brand.subTagline}
                      onChange={(e) => updateBrand({ subTagline: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Links Sociais e de Comunidade */}
              <div className="pt-6 border-t border-neutral-200 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 font-heading">Links Principais de Canais & Redes</h4>
                  <p className="text-xs text-neutral-500 font-medium">Canais oficiais de conteúdo e contato do portal.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold flex items-center gap-1.5">
                      <SocialIcon platform="youtube" className="w-3.5 h-3.5 text-red-600" />
                      <span>Canal do YouTube</span>
                    </label>
                    <input
                      type="text"
                      value={brand.links.youtube}
                      onChange={(e) => updateBrand({ links: { ...brand.links, youtube: e.target.value } })}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold flex items-center gap-1.5">
                      <SocialIcon platform="telegram" className="w-3.5 h-3.5 text-sky-500" />
                      <span>Grupo / Canal do Telegram</span>
                    </label>
                    <input
                      type="text"
                      value={brand.links.telegram}
                      onChange={(e) => updateBrand({ links: { ...brand.links, telegram: e.target.value } })}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold flex items-center gap-1.5">
                      <SocialIcon platform="instagram" className="w-3.5 h-3.5 text-pink-500" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="text"
                      value={brand.links.instagram}
                      onChange={(e) => updateBrand({ links: { ...brand.links, instagram: e.target.value } })}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <SocialIcon platform="spotify" className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Playlist do Spotify</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">Mini Player</span>
                    </label>
                    <input
                      type="text"
                      value={brand.links.spotify || ''}
                      onChange={(e) => updateBrand({ links: { ...brand.links, spotify: e.target.value } })}
                      placeholder="https://open.spotify.com/playlist/..."
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs text-neutral-900 font-mono font-bold flex items-center gap-1.5">
                      <SocialIcon platform="email" className="w-3.5 h-3.5 text-amber-500" />
                      <span>E-mail de Contato</span>
                    </label>
                    <input
                      type="text"
                      value={brand.links.email}
                      onChange={(e) => updateBrand({ links: { ...brand.links, email: e.target.value } })}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>
                </div>

                {/* Subseção: Redes Sociais Adicionais (Exibidas como Ícones no Rodapé) */}
                <div className="pt-6 border-t border-neutral-200 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 font-heading flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-[#ebbf01]" />
                        <span>Redes Sociais Adicionais (Ícones no Rodapé)</span>
                      </h4>
                      <p className="text-xs text-neutral-500 font-medium">
                        Adicione qualquer rede social (WhatsApp, TikTok, Facebook, X, Threads, Discord, etc.). Elas aparecem no rodapé do site exclusivamente em forma de ícone.
                      </p>
                    </div>

                    {!editingSocialLink && !isAddingSocialLink && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSocialLink({
                            id: `soc-${Date.now()}`,
                            platform: 'whatsapp',
                            title: 'WhatsApp Oficial',
                            url: '',
                            active: true,
                          });
                          setIsAddingSocialLink(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-sm cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Adicionar Rede Social</span>
                      </button>
                    )}
                  </div>

                  {/* Form de Criação / Edição de Rede Social */}
                  {editingSocialLink && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-300 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                            <SocialIcon platform={editingSocialLink.platform} className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900">
                              {isAddingSocialLink ? 'Nova Rede Social' : 'Editar Rede Social'}
                            </span>
                            <span className="text-[10px] text-neutral-500 block">Será exibida como ícone no rodapé</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingSocialLink(null);
                            setIsAddingSocialLink(false);
                          }}
                          className="p-1 text-neutral-400 hover:text-black rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                            Plataforma / Rede
                          </label>
                          <select
                            value={editingSocialLink.platform}
                            onChange={(e) => {
                              const plat = e.target.value;
                              const platformNames: Record<string, string> = {
                                whatsapp: 'WhatsApp Oficial',
                                tiktok: 'TikTok',
                                facebook: 'Facebook',
                                x: 'X (Twitter)',
                                discord: 'Discord',
                                threads: 'Threads',
                                linkedin: 'LinkedIn',
                                github: 'GitHub',
                                twitch: 'Twitch',
                                bluesky: 'Bluesky',
                                kwai: 'Kwai',
                                custom: 'Site Oficial / Link'
                              };
                              setEditingSocialLink({
                                ...editingSocialLink,
                                platform: plat,
                                title: platformNames[plat] || editingSocialLink.title
                              });
                            }}
                            className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
                          >
                            <option value="whatsapp">💬 WhatsApp</option>
                            <option value="tiktok">🎵 TikTok</option>
                            <option value="facebook">📘 Facebook</option>
                            <option value="x">𝕏 X (antigo Twitter)</option>
                            <option value="discord">👾 Discord</option>
                            <option value="threads">🧵 Threads</option>
                            <option value="linkedin">💼 LinkedIn</option>
                            <option value="github">🐙 GitHub</option>
                            <option value="twitch">🟣 Twitch</option>
                            <option value="bluesky">🦋 Bluesky</option>
                            <option value="kwai">🟠 Kwai</option>
                            <option value="custom">🌐 Outro / Link Personalizado</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                            Nome de Exibição (Tooltip)
                          </label>
                          <input
                            type="text"
                            value={editingSocialLink.title}
                            onChange={(e) => setEditingSocialLink({ ...editingSocialLink, title: e.target.value })}
                            placeholder="Ex: WhatsApp Oficial"
                            className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                            Link / URL Completa *
                          </label>
                          <input
                            type="text"
                            value={editingSocialLink.url}
                            onChange={(e) => setEditingSocialLink({ ...editingSocialLink, url: e.target.value })}
                            placeholder={
                              editingSocialLink.platform === 'whatsapp' ? 'https://wa.me/5511...' :
                              editingSocialLink.platform === 'tiktok' ? 'https://tiktok.com/@...' :
                              editingSocialLink.platform === 'facebook' ? 'https://facebook.com/...' :
                              editingSocialLink.platform === 'x' ? 'https://x.com/...' :
                              'https://...'
                            }
                            className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                          <input
                            type="checkbox"
                            checked={editingSocialLink.active !== false}
                            onChange={(e) => setEditingSocialLink({ ...editingSocialLink, active: e.target.checked })}
                            className="rounded text-[#ebbf01] focus:ring-[#ebbf01]"
                          />
                          <span>Exibir ícone no rodapé</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSocialLink(null);
                              setIsAddingSocialLink(false);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!editingSocialLink.url.trim()) {
                                alert('Por favor, informe a URL da rede social.');
                                return;
                              }
                              const currentList = brand.customSocialLinks || [];
                              const exists = currentList.some((s) => s.id === editingSocialLink.id);
                              let updated: CustomSocialLink[];
                              if (exists) {
                                updated = currentList.map((s) => s.id === editingSocialLink.id ? editingSocialLink : s);
                              } else {
                                updated = [...currentList, editingSocialLink];
                              }
                              updateBrand({ customSocialLinks: updated });
                              triggerSuccess('Rede social salva com sucesso!');
                              setEditingSocialLink(null);
                              setIsAddingSocialLink(false);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-neutral-900 text-[#ebbf01] font-bold text-xs hover:bg-black transition-all cursor-pointer shadow-xs"
                          >
                            Salvar Rede Social
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista Única de Gerenciamento e Reordenação de Todos os Ícones do Rodapé */}
                  <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3 mt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-[#ebbf01]" />
                          <span>Ícones do Rodapé & Reordenação</span>
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                          Gerencie o status e use as setas prestas para reordenar a sequência exata de exibição no rodapé.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateBrand({ footerIconsOrder: undefined });
                          triggerSuccess('Ordem padrão restaurada!');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-mono transition-colors cursor-pointer shrink-0"
                      >
                        Restaurar Padrão
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      {getResolvedFooterIcons(brand).map((item, index, array) => {
                        const moveItem = (direction: 'up' | 'down') => {
                          const currentOrder = array.map((i) => i.id);
                          const targetIndex = direction === 'up' ? index - 1 : index + 1;
                          if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
                          const temp = currentOrder[index];
                          currentOrder[index] = currentOrder[targetIndex];
                          currentOrder[targetIndex] = temp;
                          updateBrand({ footerIconsOrder: currentOrder });
                        };

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                              item.active ? 'bg-[#16161D] border-white/10' : 'bg-neutral-950 border-neutral-800 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-[#0e0e14] border border-white/10 text-[#ebbf01] flex items-center justify-center shrink-0">
                                <SocialIcon platform={item.platform} className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                                  <span>{item.title}</span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#ebbf01] font-bold">
                                    #{index + 1}
                                  </span>
                                  {!item.active && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                      Oculto
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-neutral-400 font-mono truncate">
                                  {item.url || (item.id === 'spotify' ? 'Abre player Spotify' : item.id === 'admin' ? 'Abre Painel Admin' : 'Não configurado')}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Ações para Links Customizados */}
                              {item.isCustom && item.customItem && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentList = brand.customSocialLinks || [];
                                      const updated = currentList.map((s) => s.id === item.id ? { ...s, active: s.active === false ? true : false } : s);
                                      updateBrand({ customSocialLinks: updated });
                                    }}
                                    className={`p-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                                      item.active ? 'text-emerald-400 hover:bg-emerald-950/50' : 'text-neutral-500 hover:bg-neutral-800'
                                    }`}
                                    title={item.active ? 'Ativo (clique para ocultar)' : 'Oculto (clique para ativar)'}
                                  >
                                    {item.active ? <Check className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSocialLink(item.customItem!);
                                      setIsAddingSocialLink(false);
                                    }}
                                    className="p-1.5 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentList = brand.customSocialLinks || [];
                                      const updated = currentList.filter((s) => s.id !== item.id);
                                      updateBrand({ customSocialLinks: updated });
                                      triggerSuccess('Rede social removida!');
                                    }}
                                    className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-red-950/40 cursor-pointer mr-1"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {/* Botoes de Setas Pretas para Reordenar */}
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveItem('up')}
                                className="p-1.5 rounded-lg bg-white hover:bg-[#ebbf01] text-black transition-colors cursor-pointer shadow-xs disabled:opacity-20 disabled:hover:bg-white"
                                title="Mover para cima"
                              >
                                <ArrowUp className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                disabled={index === array.length - 1}
                                onClick={() => moveItem('down')}
                                className="p-1.5 rounded-lg bg-white hover:bg-[#ebbf01] text-black transition-colors cursor-pointer shadow-xs disabled:opacity-20 disabled:hover:bg-white"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => triggerSuccess('Configurações de marca salvas com sucesso!')}
                  className="px-6 py-2.5 bg-[#ebbf01] text-black font-extrabold text-xs uppercase rounded-xl hover:bg-[#f5cc14] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>

            </div>

            {/* Card de Segurança e Senha de Acesso */}
            <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
                <div className="p-2.5 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-900">
                  <KeyRound className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900 font-heading">
                    Segurança & Senha de Acesso ao Painel
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Altere a senha que protege este painel administrativo. Somente quem possui essa senha poderá acessar as configurações.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-neutral-900 uppercase">Nova Senha</label>
                    <input
                      type="password"
                      value={newAdminPasswordInput}
                      onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                      placeholder="Digite a nova senha..."
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-neutral-900 uppercase">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={confirmAdminPasswordInput}
                      onChange={(e) => setConfirmAdminPasswordInput(e.target.value)}
                      placeholder="Repita a nova senha..."
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>
                </div>

                {passwordChangeFeedback && (
                  <p className="text-xs font-bold text-red-900 bg-red-100 p-3 rounded-xl border border-red-300">
                    {passwordChangeFeedback}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-neutral-700 font-mono">
                    Senha atual configurada: <span className="text-black font-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">{brand.adminPassword || 'alx2026'}</span>
                  </p>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-[#ebbf01] font-extrabold text-xs uppercase rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Atualizar Senha</span>
                  </button>
                </div>
              </form>

              {/* DADOS DE PAGAMENTO VIP (CHAVE PIX & MERCADO PAGO) */}
              <div className="pt-6 border-t border-neutral-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 font-heading flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Configurações de Pagamento VIP (Chave PIX & Mercado Pago)</span>
                    </h4>
                    <p className="text-xs text-neutral-500 font-medium">
                      Configure a Chave PIX, o link de assinatura do Mercado Pago e os valores cobrados dos membros VIP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vipMembers')}
                    className="px-3.5 py-2 rounded-xl bg-black text-[#ebbf01] font-extrabold text-xs uppercase hover:bg-neutral-800 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Gestão de Membros</span>
                  </button>
                </div>

                <form onSubmit={handleSaveVipPaymentConfig} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-300 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800">Chave PIX Oficial *</label>
                      <input
                        type="text"
                        required
                        value={pixKeyInput}
                        onChange={(e) => setPixKeyInput(e.target.value)}
                        placeholder="ex: seu-email@gmail.com ou CPF/Celular"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800">Tipo da Chave PIX</label>
                      <select
                        value={pixKeyTypeInput}
                        onChange={(e) => setPixKeyTypeInput(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-xs cursor-pointer"
                      >
                        <option value="email">E-mail</option>
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="phone">Celular</option>
                        <option value="random">Chave Aleatória (EVP)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-neutral-800">Link de Assinatura Recorrente (Mercado Pago) *</label>
                      <input
                        type="url"
                        value={mercadoPagoSubUrlInput}
                        onChange={(e) => setMercadoPagoSubUrlInput(e.target.value)}
                        placeholder="https://www.mercadopago.com.br/subscriptions/checkout?..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800">Valor da Assinatura Mensal (R$)</label>
                      <input
                        type="text"
                        value={monthlySubPriceInput}
                        onChange={(e) => setMonthlySubPriceInput(e.target.value)}
                        placeholder="14,90"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800">Valor do PIX Avulso (R$)</label>
                      <input
                        type="text"
                        value={pixSinglePriceInput}
                        onChange={(e) => setPixSinglePriceInput(e.target.value)}
                        placeholder="14,90"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Chave PIX & Mercado Pago</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MENSAGENS & CONTATOS (CAIXA DE ENTRADA) */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Bar with Title and Stats */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-black text-[#ebbf01]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 font-heading">
                    Caixa de Entrada de Mensagens (Fale Conosco)
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium mt-1">
                  Todas as mensagens enviadas através da página de contato (<span className="font-mono text-black font-bold">/contato</span>) ficam salvas aqui e são despachadas para o e-mail de destino.
                </p>
              </div>

              {/* Counters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-mono font-bold text-neutral-800 shadow-xs">
                  Total: <span className="text-black font-black">{contactMessages.length}</span>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-xs flex items-center gap-1.5 ${
                  unreadMessagesCount > 0
                    ? 'bg-[#ebbf01]/20 border-[#ebbf01] text-neutral-900'
                    : 'bg-white border-neutral-200 text-neutral-600'
                }`}>
                  {unreadMessagesCount > 0 && <span className="w-2 h-2 rounded-full bg-[#ebbf01] animate-pulse" />}
                  Não lidas: <span className="text-black font-black">{unreadMessagesCount}</span>
                </div>
              </div>
            </div>

            {/* Email Diagnostics & Destination Settings Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm text-neutral-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#ebbf01]/10 border border-[#ebbf01]/20 text-neutral-900">
                    <Send className="w-5 h-5 text-neutral-900" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-900 font-heading">
                      Destino dos E-mails do Site
                    </h4>
                    <p className="text-xs text-neutral-600">
                      Endereço que recebe as mensagens enviadas pelos visitantes no formulário.
                    </p>
                  </div>
                </div>

                {/* Email, Web3Forms & Webhook update form */}
                <div className="space-y-3 w-full sm:w-auto">
                  <form onSubmit={handleSaveDestinationEmail} className="space-y-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={destinationEmailInput}
                        onChange={(e) => setDestinationEmailInput(e.target.value)}
                        placeholder="contact@7f.com.br"
                        className="w-full sm:w-64 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono font-bold focus:outline-none focus:border-black shadow-xs"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-[#ebbf01] font-bold text-xs whitespace-nowrap cursor-pointer shadow-xs transition-colors"
                      >
                        Salvar Todas
                      </button>
                    </div>

                    {/* Web3Forms Access Key Option */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-neutral-600 font-mono uppercase">
                        Chave Web3Forms (Opcional - Envio Direto em 2s):
                      </label>
                      <input
                        type="text"
                        value={web3KeyInput}
                        onChange={(e) => setWeb3KeyInput(e.target.value)}
                        placeholder="Cole sua Access Key do Web3Forms (ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
                        className="w-full sm:w-80 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs text-neutral-900 font-mono focus:outline-none focus:border-black shadow-xs"
                      />
                      <div className="text-[10px] text-neutral-500">
                        Crie uma chave grátis em <a href="https://web3forms.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">web3forms.com</a> em 30s.
                      </div>
                    </div>

                    {/* Webhook URL Option */}
                    <div className="space-y-1 pt-1">
                      <label className="block text-[10px] font-bold text-neutral-600 font-mono uppercase">
                        URL do Webhook (Notificação Push Instantânea - Zapier/Telegram/Discord):
                      </label>
                      <input
                        type="url"
                        value={webhookUrlInput}
                        onChange={(e) => setWebhookUrlInput(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/... ou https://hooks.zapier.com/..."
                        className="w-full sm:w-80 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs text-neutral-900 font-mono focus:outline-none focus:border-black shadow-xs"
                      />
                    </div>
                  </form>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono pt-1">
                    <span>Atalhos de E-mail:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationEmailInput('contact@7f.com.br');
                        updateBrand({ links: { ...brand.links, email: 'contact@7f.com.br' } });
                        triggerSuccess('E-mail alterado para contact@7f.com.br');
                      }}
                      className="text-neutral-700 hover:text-black font-bold underline cursor-pointer"
                    >
                      contact@7f.com.br
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationEmailInput('alxrdrgo@gmail.com');
                        updateBrand({ links: { ...brand.links, email: 'alxrdrgo@gmail.com' } });
                        triggerSuccess('E-mail alterado para alxrdrgo@gmail.com');
                      }}
                      className="text-neutral-700 hover:text-black font-bold underline cursor-pointer"
                    >
                      alxrdrgo@gmail.com
                    </button>
                  </div>
                </div>
              </div>

              {/* Explicações Claras de Entrega & Por Que o E-mail Pode Não Ter Chegado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Armazenamento Garantido no Painel</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    Toda mensagem enviada pelo formulário é <strong>registrada imediatamente aqui nesta tela</strong>. Você nunca perderá nenhuma solicitação, mesmo se houver instabilidade ou atraso no provedor de e-mail.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Como receber em contact@7f.com.br:</span>
                  </div>
                  <ul className="text-neutral-700 space-y-1 list-disc list-inside leading-relaxed text-[11px]">
                    <li>
                      <strong>Caixa Postal Hostinger:</strong> Acesse o Webmail em <a href="https://mail.hostinger.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold underline">mail.hostinger.com</a> com o login <strong>contact@7f.com.br</strong> e verifique a pasta <strong>Spam / Lixo Eletrônico</strong>.
                    </li>
                    <li>
                      <strong>Ativação FormSubmit:</strong> Abra a mensagem com assunto <em>"Action Required: Activate FormSubmit"</em> e clique em <em>"Activate Form"</em>.
                    </li>
                    <li>
                      <strong>Dica Prática:</strong> Você também pode alternar para o seu Gmail (<em>alxrdrgo@gmail.com</em>) acima para receber direto sem bloqueios, ou criar no Hostinger um Encaminhamento (Redirecionamento) de contact@7f.com.br para seu Gmail!
                    </li>
                  </ul>
                </div>
              </div>

              {/* Test Email Button & Live Feedback */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTestEmail}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-[#ebbf01] font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 transition-all"
                >
                  {isSendingTestEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#ebbf01]" />
                      <span>Disparando E-mail de Teste...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#ebbf01]" />
                      <span>Enviar E-mail de Teste para {destinationEmailInput}</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-neutral-500 font-mono">
                  Gateway: FormSubmit AJAX • Sem captura de senhas
                </span>
              </div>

              {/* Live Test Feedback Banner */}
              {testEmailFeedback && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  testEmailFeedback.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : testEmailFeedback.isActivationNotice
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  <div className="font-bold flex items-center gap-2 mb-1">
                    {testEmailFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : testEmailFeedback.isActivationNotice ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                    )}
                    <span>
                      {testEmailFeedback.success
                        ? 'E-mail de Teste Disparado com Sucesso!'
                        : testEmailFeedback.isActivationNotice
                        ? 'Atenção: E-mail de Ativação Pendente de Confirmação'
                        : 'Aviso do Servidor de E-mail'}
                    </span>
                  </div>
                  <p className="text-[12px]">{testEmailFeedback.message}</p>
                </div>
              )}
            </div>

            {/* Filters & Actions Bar */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={messagesSearch}
                  onChange={(e) => setMessagesSearch(e.target.value)}
                  placeholder="Buscar por nome, e-mail, assunto ou texto..."
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs font-medium"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMessagesFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    messagesFilter === 'all'
                      ? 'bg-black text-[#ebbf01] shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  Todas ({contactMessages.length})
                </button>

                <button
                  type="button"
                  onClick={() => setMessagesFilter('unread')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    messagesFilter === 'unread'
                      ? 'bg-black text-[#ebbf01] shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  Não Lidas ({unreadMessagesCount})
                </button>

                <button
                  type="button"
                  onClick={() => setMessagesFilter('read')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    messagesFilter === 'read'
                      ? 'bg-black text-[#ebbf01] shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  Lidas ({contactMessages.length - unreadMessagesCount})
                </button>

                {/* Export & Utility Actions */}
                <div className="flex items-center gap-1.5 flex-wrap ml-auto sm:ml-4">
                  <button
                    type="button"
                    onClick={handleExportContactMessagesCsv}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Exportar todas as mensagens e contatos para planilha Excel / CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportContactMessagesJson}
                    className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Baixar dados em formato JSON"
                  >
                    <span>JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyContactEmails}
                    className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copiar lista de todos os e-mails recebidos"
                  >
                    <Copy className="w-3.5 h-3.5 text-neutral-600" />
                    <span className="hidden lg:inline">Copiar E-mails</span>
                  </button>
                </div>

                {/* Bulk Actions */}
                {contactMessages.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-2">
                    {unreadMessagesCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          markAllContactMessagesRead?.();
                          triggerSuccess('Todas as mensagens foram marcadas como lidas.');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer transition-all border border-neutral-200"
                        title="Marcar todas as mensagens como lidas"
                      >
                        Marcar Todas Lidas
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        clearContactMessages();
                        triggerSuccess('Caixa de entrada limpa com sucesso.');
                      }}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      title="Limpar todas as mensagens"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages List */}
            {(() => {
              const filteredList = contactMessages.filter((msg) => {
                if (messagesFilter === 'unread' && msg.read) return false;
                if (messagesFilter === 'read' && !msg.read) return false;
                if (messagesSearch.trim()) {
                  const q = messagesSearch.toLowerCase();
                  return (
                    msg.name?.toLowerCase().includes(q) ||
                    msg.email?.toLowerCase().includes(q) ||
                    msg.subject?.toLowerCase().includes(q) ||
                    msg.message?.toLowerCase().includes(q)
                  );
                }
                return true;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                      <Inbox className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-neutral-900 font-heading">
                        {messagesSearch.trim() || messagesFilter !== 'all'
                          ? 'Nenhuma mensagem encontrada para o filtro atual'
                          : 'Nenhuma mensagem na caixa de entrada'}
                      </h4>
                      <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                        {messagesSearch.trim() || messagesFilter !== 'all'
                          ? 'Tente alterar os termos de busca ou selecione o filtro "Todas".'
                          : 'Quando um visitante preencher o formulário na página de Contato (/contato), a mensagem aparecerá automaticamente aqui.'}
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          addContactMessage({
                            name: 'Cliente Demonstração',
                            email: 'cliente@exemplo.com.br',
                            subject: 'Relatar um problema',
                            message: 'Olá, estou testando o recebimento de mensagens e gostaria de confirmar o suporte para a multimídia DiLink.',
                          });
                          triggerSuccess('Mensagem de demonstração inserida!');
                        }}
                        className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900 font-bold text-xs cursor-pointer transition-all shadow-xs"
                      >
                        + Inserir Mensagem de Exemplo
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredList.map((msg) => (
                    <div
                      key={msg.id}
                      className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all shadow-sm space-y-4 ${
                        !msg.read
                          ? 'border-[#ebbf01]/80 ring-2 ring-[#ebbf01]/20 bg-gradient-to-r from-amber-500/[0.04] via-transparent to-transparent'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {/* Top Row: Status badge, Subject badge, and Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!msg.read ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ebbf01] text-black text-[10px] font-black uppercase tracking-wider shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                              Nova Mensagem
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase border border-neutral-200 font-mono">
                              Lida
                            </span>
                          )}

                          <span className="px-2.5 py-0.5 rounded-lg bg-neutral-900 text-white font-mono text-[11px] font-bold shadow-xs">
                            {msg.subject || 'Dúvida Geral'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{msg.date}</span>
                        </div>
                      </div>

                      {/* Sender Info Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm font-black text-neutral-900">{msg.name}</span>
                          </div>

                          <div className="flex items-center gap-2 pl-6">
                            <a
                              href={`mailto:${msg.email}`}
                              className="text-xs text-neutral-600 hover:text-black font-mono underline cursor-pointer"
                              title="Clique para enviar um e-mail"
                            >
                              {msg.email}
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(msg.email);
                                setCopiedId(msg.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="p-1 text-neutral-400 hover:text-neutral-700 rounded cursor-pointer"
                              title="Copiar e-mail"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Action buttons on the right */}
                        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                          <a
                            href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: [${brand.brandName || 'Alx +'}] ${msg.subject}`)}&body=${encodeURIComponent(`Olá, ${msg.name}!\n\nEm resposta à sua mensagem:\n"${msg.message}"\n\n---\nAtenciosamente,\nEquipe ${brand.brandName || 'Alx +'}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-[#ebbf01] text-xs font-bold transition-all shadow-xs cursor-pointer"
                            title="Responder cliente via seu software de e-mail (Gmail/Outlook)"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Responder por E-mail</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              if (msg.read) {
                                markContactMessageUnread(msg.id);
                                triggerSuccess('Mensagem marcada como não lida.');
                              } else {
                                markContactMessageRead(msg.id);
                                triggerSuccess('Mensagem marcada como lida.');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
                            title={msg.read ? 'Marcar como não lida' : 'Marcar como lida'}
                          >
                            <Check className={`w-3.5 h-3.5 ${msg.read ? 'text-neutral-400' : 'text-emerald-600'}`} />
                            <span>{msg.read ? 'Não Lida' : 'Lida'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              deleteContactMessage(msg.id);
                              triggerSuccess('Mensagem removida com sucesso!');
                            }}
                            className="p-2 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                            title="Excluir mensagem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Message Content Box */}
                      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: APLICATIVOS */}
        {activeTab === 'apps' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  Catálogo de Aplicativos ALX Store
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Gerencie fotos de capa, capturas de tela, descrições, preços e links de download APK.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingApp({
                    id: '',
                    slug: '',
                    name: 'Novo Aplicativo ALX',
                    tagline: 'Descrição curta do app',
                    description: 'Descrição completa com detalhes de instalação e recursos.',
                    fullDescription: 'Descrição detalhada para a página do app.',
                    coverImage: '/imagens/apps/byd-cockpit.jpg',
                    screenshots: ['/imagens/apps/byd-cockpit.jpg'],
                    features: ['Recurso 1', 'Recurso 2'],
                    compatibility: ['BYD Dolphin', 'DiLink 3.0+'],
                    requirements: ['Android 9.0+'],
                    version: 'v1.0.0',
                    priceText: 'Gratuito',
                    isFree: true,
                    isVipExclusive: false,
                    badge: 'Novo',
                    downloadUrl: '#',
                    buyUrl: '#',
                  });
                  setIsCreatingApp(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Cadastrar Novo App</span>
              </button>
            </div>

            {/* Search and Filters Bar for Apps Catalog */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Text Search Input */}
                <div className="md:col-span-6 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nome, categoria, versão ou descrição..."
                    value={adminAppSearchTerm}
                    onChange={(e) => setAdminAppSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-16 py-2 bg-neutral-50 text-neutral-900 text-xs font-medium rounded-xl border border-neutral-200 focus:border-[#ebbf01] focus:bg-white focus:outline-none shadow-xs placeholder:text-neutral-400"
                  />
                  {adminAppSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setAdminAppSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-500 hover:text-black font-bold cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Status Quick Pills */}
                <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdminAppStatusFilter('all')}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                      adminAppStatusFilter === 'all'
                        ? 'bg-neutral-900 text-[#ebbf01] shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Todos ({apps.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAppStatusFilter('free')}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                      adminAppStatusFilter === 'free'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Gratuitos ({apps.filter(a => a.isFree || a.priceText === 'Gratuito').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAppStatusFilter('vip')}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                      adminAppStatusFilter === 'vip'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    VIP Exclusivos ({apps.filter(a => a.isVipExclusive || (a as any).isMembersOnly).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAppStatusFilter('iptv')}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                      adminAppStatusFilter === 'iptv'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    IPTV On ({apps.filter(a => !!a.showInIptv || a.category?.toLowerCase().includes('iptv')).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAppStatusFilter('hidden')}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                      adminAppStatusFilter === 'hidden'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Ocultos / Link ({apps.filter(a => a.visibility === 'unlisted' || a.visibility === 'link_only' || a.visibility === 'members_and_link').length})
                  </button>
                </div>
              </div>

              {/* Category Dropdown and Reset */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[11px] font-mono text-neutral-500 font-bold uppercase shrink-0">Filtrar por Categoria:</span>
                  <select
                    value={adminAppCategoryFilter}
                    onChange={(e) => setAdminAppCategoryFilter(e.target.value)}
                    className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-neutral-800 font-medium focus:outline-none focus:border-[#ebbf01] cursor-pointer"
                  >
                    <option value="all">Todas as Categorias</option>
                    {Array.from(new Set(apps.map(a => a.category).filter(Boolean))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {(adminAppSearchTerm || adminAppStatusFilter !== 'all' || adminAppCategoryFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminAppSearchTerm('');
                      setAdminAppStatusFilter('all');
                      setAdminAppCategoryFilter('all');
                    }}
                    className="text-xs font-mono text-neutral-600 hover:text-black hover:underline font-bold cursor-pointer"
                  >
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            </div>

            {/* List of Apps */}
            {(() => {
              const filteredCatalogApps = apps.filter((app) => {
                // Status Filter
                if (adminAppStatusFilter === 'free' && (!app.isFree && app.priceText !== 'Gratuito')) return false;
                if (adminAppStatusFilter === 'vip' && (!app.isVipExclusive && !(app as any).isMembersOnly && app.visibility !== 'public_vip' && app.visibility !== 'members_and_link')) return false;
                if (adminAppStatusFilter === 'iptv' && (!app.showInIptv && !app.category?.toLowerCase().includes('iptv'))) return false;
                if (adminAppStatusFilter === 'hidden' && (app.visibility !== 'unlisted' && app.visibility !== 'link_only' && app.visibility !== 'members_and_link')) return false;

                // Category Filter
                if (adminAppCategoryFilter !== 'all' && app.category !== adminAppCategoryFilter) return false;

                // Text Search Filter
                if (adminAppSearchTerm.trim()) {
                  const term = adminAppSearchTerm.toLowerCase();
                  return (
                    app.name.toLowerCase().includes(term) ||
                    (app.category && app.category.toLowerCase().includes(term)) ||
                    (app.version && app.version.toLowerCase().includes(term)) ||
                    (app.description && app.description.toLowerCase().includes(term)) ||
                    (app.fullDescription && app.fullDescription.toLowerCase().includes(term)) ||
                    (app.slug && app.slug.toLowerCase().includes(term))
                  );
                }

                return true;
              });

              if (filteredCatalogApps.length === 0) {
                return (
                  <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-neutral-200 space-y-3">
                    <p className="text-sm font-bold text-neutral-700">Nenhum aplicativo encontrado para os filtros selecionados.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminAppSearchTerm('');
                        setAdminAppStatusFilter('all');
                        setAdminAppCategoryFilter('all');
                      }}
                      className="px-4 py-2 bg-neutral-900 text-[#ebbf01] text-xs font-extrabold uppercase rounded-xl cursor-pointer"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalogApps.map((app, idx) => (
                <div
                  key={app.id}
                  className="bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 rounded-3xl overflow-hidden transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    {/* Cover Preview */}
                    <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
                      <img
                        src={getMediaPreviewUrl(app.coverImage)}
                        alt={app.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/imagens/apps/byd-cockpit.jpg';
                        }}
                      />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-[#ebbf01] border border-white/10 uppercase">
                            #{idx + 1}
                          </span>
                          {app.category && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-white border border-white/10 uppercase">
                              {app.category}
                            </span>
                          )}
                        </div>
                        <div className="pointer-events-auto">
                          <VisibilityBadge visibility={app.visibility} />
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-black text-neutral-900 font-heading">{app.name}</h4>
                        {app.version && (
                          <span className="text-xs font-mono font-normal text-neutral-600 shrink-0">
                            {app.version}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                        {app.fullDescription || app.description}
                      </p>
                    </div>
                  </div>

                  {/* Controls: Reorder & Duplicate & Action Buttons */}
                  <div className="p-4 pt-2 flex flex-col gap-2.5 border-t border-neutral-100 bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-neutral-500 font-bold">Ordem:</span>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            moveApp(idx, 'up');
                            triggerSuccess(`"${app.name}" movido para cima.`);
                          }}
                          className="p-1 rounded-md bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-200 cursor-pointer transition-colors"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === apps.length - 1}
                          onClick={() => {
                            moveApp(idx, 'down');
                            triggerSuccess(`"${app.name}" movido para baixo.`);
                          }}
                          className="p-1 rounded-md bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-200 cursor-pointer transition-colors"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Duplicate Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const cloned = duplicateApp(app.id);
                          if (cloned) {
                            triggerSuccess(`Aplicativo "${app.name}" duplicado com sucesso!`);
                          }
                        }}
                        className="px-2.5 py-1 rounded-md bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200 text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Duplicar este aplicativo"
                      >
                        <Copy className="w-3 h-3 text-neutral-600" />
                        <span>Duplicar App</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setActivePage({ type: 'app', idOrSlug: app.slug || app.id })}
                          className="text-xs text-neutral-600 font-bold hover:text-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Card</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const directUrl = `${window.location.origin}/apps/${app.slug || app.id}`;
                            navigator.clipboard.writeText(directUrl);
                            triggerSuccess('Link direto copiado!');
                          }}
                          className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                          title="Copiar link direto para compartilhar"
                        >
                          <LinkIcon className="w-3.5 h-3.5 text-sky-600" />
                          <span>Copiar Link</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingApp({ ...app });
                            setIsCreatingApp(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#ebbf01]" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteApp(app.id);
                            triggerSuccess('Aplicativo removido!');
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    )}

        {/* TAB: ARMAZENAMENTO & GITHUB RELEASES */}
        {activeTab === 'storage' && (
          <GitHubStorageTab />
        )}

        {/* TAB 3: NOTÍCIAS */}
        {activeTab === 'news' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  Notícias e Artigos
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Cadastre matérias, altere fotos de capa, resumos e tags informativas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const res = await syncNewsArticles();
                    if (res.success) {
                      triggerSuccess(res.count > 0 ? `${res.count} notícias sincronizadas com os portais!` : 'Portais sincronizados com sucesso!');
                    } else {
                      alert(res.error || 'Erro ao sincronizar portais');
                    }
                  }}
                  disabled={isSyncingNews}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-900 font-bold text-xs uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  title="Sincronizar feeds RSS de InsideEVs, Motor1, Autoesporte, Quatro Rodas, Canaltech e Auto+"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#ebbf01] ${isSyncingNews ? 'animate-spin' : ''}`} />
                  <span>{isSyncingNews ? 'Sincronizando...' : 'Sincronizar Portais'}</span>
                </button>

                <button
                  onClick={() => {
                    setEditingNews({
                      id: '',
                      slug: '',
                      title: 'Nova Matéria sobre Carros Elétricos',
                      summary: 'Resumo da notícia que aparece no card.',
                      content: 'Conteúdo completo da matéria detalhada...',
                      category: 'Carros Elétricos',
                      author: 'ALX Tech',
                      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
                      readTime: '3 min de leitura',
                      imageUrl: '/imagens/noticias/noticia-1.jpg',
                      tags: ['Carros Elétricos', 'Novidade', 'Bateria'],
                      isMembersOnly: false,
                      isVipExclusive: false,
                    });
                    setIsCreatingNews(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Publicar Nova Notícia</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 rounded-3xl overflow-hidden transition-all flex flex-col sm:flex-row justify-between shadow-sm"
                >
                  <div className="w-full sm:w-44 aspect-[16/10] sm:aspect-square bg-neutral-100 shrink-0 relative">
                    <img
                      src={getMediaPreviewUrl(item.imageUrl)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/imagens/noticias/noticia-1.jpg';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black text-[#ebbf01]">
                        {item.category}
                      </span>
                      {(item.isMembersOnly || item.isVipExclusive) && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#ebbf01] text-black flex items-center gap-1 shadow-sm">
                          <Crown className="w-2.5 h-2.5 fill-black" />
                          <span>Membros</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono text-neutral-500 font-bold">
                        {item.date} • {item.readTime}
                      </div>
                      <h4 className="text-sm font-black text-neutral-900 line-clamp-2 font-heading">
                        {item.title}
                      </h4>
                      <p className="text-xs text-neutral-600 font-medium line-clamp-2">
                        {item.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => setActivePage({ type: 'news', idOrSlug: item.slug || item.id })}
                        className="text-xs text-neutral-700 hover:text-black flex items-center gap-1 font-extrabold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Artigo</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const cloned = duplicateNews(item.id);
                            if (cloned) triggerSuccess(`Notícia "${item.title}" duplicada!`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Duplicar notícia"
                        >
                          <Copy className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Duplicar</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingNews({ ...item });
                            setIsCreatingNews(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#ebbf01]" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteNews(item.id);
                            triggerSuccess('Notícia excluída!');
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PRODUTOS & HARDWARE (SHOP) */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading flex items-center gap-2">
                  <span>ALX Shop • Produtos & Acessórios</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                    {products.length} itens
                  </span>
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Sincronize com a loja oficial (WooCommerce), configure preços, ordene e duplique produtos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Sync with WooCommerce Button */}
                <button
                  type="button"
                  disabled={isSyncingShop}
                  onClick={async () => {
                    const res = await syncShopProducts();
                    if (res.success) {
                      triggerSuccess(`${res.count} produtos sincronizados com sucesso da loja ALX Shop!`);
                    } else {
                      alert(`Aviso de sincronização: ${res.error || 'Não foi possível puxar os dados no momento.'}`);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 text-[#ebbf01] hover:bg-black font-extrabold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  title="Puxar produtos atualizados da loja alxshop.7f.com.br"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingShop ? 'animate-spin' : ''}`} />
                  <span>{isSyncingShop ? 'Sincronizando Loja...' : 'Sincronizar da Loja Online'}</span>
                </button>

                {/* Add Product Button */}
                <button
                  onClick={() => {
                    setEditingProduct({
                      id: '',
                      name: 'Novo Produto ALX',
                      category: 'Acessórios',
                      description: 'Descrição curta do produto e compatibilidade.',
                      fullDescription: 'Descrição completa com manual de uso e detalhes.',
                      price: 'R$ 199,00',
                      originalPrice: 'R$ 249,00',
                      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
                      buyUrl: 'https://alxshop.7f.com.br/categoria-produto/alx-garage/',
                      badge: 'Lançamento',
                      inStock: true,
                      specs: [{ label: 'Conexão', value: 'Bluetooth / USB' }],
                    });
                    setIsCreatingProduct(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Cadastrar Produto</span>
                </button>
              </div>
            </div>

            {/* Store Connection Info Banner */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                    <span>Loja Integrada WooCommerce</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono truncate">
                    {brand.shopUrl || 'https://alxshop.7f.com.br/categoria-produto/alx-garage/'}
                  </div>
                </div>
              </div>
              <a
                href={brand.shopUrl || 'https://alxshop.7f.com.br/categoria-produto/alx-garage/'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:text-black hover:border-neutral-300 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#ebbf01]" />
                <span>Abrir Loja Externa</span>
              </a>
            </div>

            {/* Product Cards Grid with Reorder and Duplicate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 rounded-3xl overflow-hidden transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="relative aspect-square bg-neutral-100">
                      <img
                        src={getMediaPreviewUrl(prod.imageUrl)}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/imagens/produtos/dongle-v2.jpg';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 text-[#ebbf01] backdrop-blur-xs border border-white/10">
                          #{idx + 1}
                        </span>
                        {prod.badge && (
                          <div className="text-[9px] font-bold px-2 py-0.5 rounded bg-black text-[#ebbf01]">
                            {prod.badge}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-[10px] font-mono text-neutral-500 font-bold uppercase">
                        {prod.category}
                      </div>
                      <h4 className="text-sm font-black text-neutral-900 line-clamp-2 font-heading" title={prod.name}>
                        {prod.name}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-neutral-900 font-mono">
                          {prod.price}
                        </span>
                        {prod.originalPrice && (
                          <span className="text-[11px] text-neutral-400 line-through font-mono">
                            {prod.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Controls: Reorder & Duplicate & Edit & Delete */}
                  <div className="p-4 pt-2 flex flex-col gap-2.5 border-t border-neutral-100 bg-neutral-50/50">
                    {/* Reorder and Duplicate Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-neutral-500 font-bold">Ordem:</span>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            moveProduct(idx, 'up');
                            triggerSuccess(`"${prod.name}" movido para cima.`);
                          }}
                          className="p-1 rounded-md bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-200 cursor-pointer transition-colors"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === products.length - 1}
                          onClick={() => {
                            moveProduct(idx, 'down');
                            triggerSuccess(`"${prod.name}" movido para baixo.`);
                          }}
                          className="p-1 rounded-md bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-200 cursor-pointer transition-colors"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Duplicate Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const cloned = duplicateProduct(prod.id);
                          if (cloned) {
                            triggerSuccess(`Produto "${prod.name}" duplicado com sucesso!`);
                          }
                        }}
                        className="px-2 py-1 rounded-md bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200 text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Duplicar este produto"
                      >
                        <Copy className="w-3 h-3 text-neutral-600" />
                        <span>Duplicar</span>
                      </button>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60">
                      <button
                        onClick={() => setActivePage({ type: 'product', id: prod.id })}
                        className="text-xs text-neutral-700 font-bold hover:text-black flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...prod });
                            setIsCreatingProduct(false);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#ebbf01]" />
                        </button>
                        <button
                          onClick={() => {
                            deleteProduct(prod.id);
                            triggerSuccess('Produto removido!');
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MODELOS EV */}
        {activeTab === 'evModels' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  Modelos de Carros Elétricos (Calculadora)
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Especificações técnicas de baterias e consumo utilizadas pelo simulador de autonomia.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingModel({
                    id: '',
                    name: 'Novo Modelo EV',
                    badge: 'Sedan / SUV',
                    batteryCapacityKwh: 60.0,
                    wltpRangeKm: 400,
                    inmetroRangeKm: 310,
                    maxDcChargingKw: 100,
                    acChargingKw: 7.0,
                    efficiencyKwh100km: 15.0,
                    imageUrl: '',
                    features: ['Bateria Blade', 'Recarga Rápida'],
                  });
                  setIsCreatingModel(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Adicionar Modelo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {evModels.map((model, idx) => (
                <div
                  key={model.id}
                  className="bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 rounded-3xl overflow-hidden transition-all flex flex-col justify-between shadow-sm p-5 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200 shrink-0">
                          #{idx + 1}
                        </span>
                        <h4 className="text-base font-black text-neutral-900 font-heading truncate" title={model.name}>{model.name}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black text-[#ebbf01] font-mono uppercase shrink-0">
                        {model.badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                        <div className="text-[10px] text-neutral-500 font-bold uppercase">Bateria</div>
                        <div className="font-extrabold text-neutral-900 font-mono mt-0.5">{model.batteryCapacityKwh} kWh</div>
                      </div>
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                        <div className="text-[10px] text-neutral-500 font-bold uppercase">Inmetro</div>
                        <div className="font-extrabold text-neutral-900 font-mono mt-0.5">{model.inmetroRangeKm} km</div>
                      </div>
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                        <div className="text-[10px] text-neutral-500 font-bold uppercase">Carga DC</div>
                        <div className="font-extrabold text-neutral-900 font-mono mt-0.5">{model.maxDcChargingKw} kW</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-2 border-t border-neutral-100">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-neutral-500 font-bold mr-1 hidden sm:inline">Ordem:</span>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          moveEvModel(idx, 'up');
                          triggerSuccess(`"${model.name}" movido para cima.`);
                        }}
                        className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-200 cursor-pointer transition-colors"
                        title="Mover para cima"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === evModels.length - 1}
                        onClick={() => {
                          moveEvModel(idx, 'down');
                          triggerSuccess(`"${model.name}" movido para baixo.`);
                        }}
                        className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-200 cursor-pointer transition-colors"
                        title="Mover para baixo"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Action buttons: Duplicate, Edit, Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cloned = duplicateEvModel(model.id);
                          if (cloned) {
                            triggerSuccess(`Modelo "${model.name}" duplicado com sucesso!`);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Duplicar este modelo"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="hidden md:inline">Duplicar</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingModel({ ...model });
                          setIsCreatingModel(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Editar modelo"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#ebbf01]" />
                        <span className="hidden md:inline">Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          deleteEvModel(model.id);
                          triggerSuccess('Modelo excluído!');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Excluir modelo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB YOUTUBE: AUTOMATIC YOUTUBE CHANNEL SYNC & MANAGEMENT */}
        {activeTab === 'youtube' && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {/* Logo do Canal / Seção YouTube */}
            <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-neutral-900 font-heading flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#ebbf01]" />
                  <span>Logotipo Oficial da Seção YouTube (Card da Página)</span>
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Faça upload de uma nova imagem PNG transparente ou cole uma URL para trocar o logotipo exibido no card do YouTube.
                </p>
              </div>

              <div className="pt-2">
                <ImageUploadField
                  label="Imagem do Logotipo (PNG / SVG / WebP / JPG)"
                  value={brand.youtubeSectionLogoUrl || '/logo_alx_garage.png'}
                  onChange={(newUrl) => updateBrand({ youtubeSectionLogoUrl: newUrl })}
                  helperText="Formatos aceitos: PNG transparente, SVG, JPG, WebP. Faça upload do seu computador ou informe a URL."
                  aspectRatio="wide"
                  presetOptions={[
                    { label: 'ALX Garage PNG Transparente', url: '/logo_alx_garage.png' },
                    { label: 'ALX Garage SVG Vector', url: '/logo_alx_garage.svg' },
                    { label: 'Logo Principal do Site', url: brand.logoUrl },
                  ]}
                />
              </div>
            </div>
            
            {/* Sync Configuration Card */}
            <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono font-black text-neutral-900 uppercase tracking-wider bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                    <Youtube className="w-3.5 h-3.5 text-red-600 fill-current" />
                    <span>Sincronização Automática</span>
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 font-heading">
                    Sincronizar Canal do YouTube
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium max-w-2xl">
                    Sincronize os vídeos publicados no seu canal automaticamente via Feed RSS do YouTube ou Chave de API Oficial.
                  </p>
                </div>

                {brand.youtubeLastSync && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-neutral-500 font-bold block">Última Sincronização</span>
                    <span className="text-xs font-mono font-black text-neutral-900">
                      {new Date(brand.youtubeLastSync).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-neutral-900 flex items-center justify-between">
                    <span>ID do Canal, Handle ou Link do YouTube</span>
                    <span className="text-[10px] text-neutral-500 font-bold">Ex: @alx-garage</span>
                  </label>
                  <input
                    type="text"
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    placeholder="https://www.youtube.com/@alx-garage"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-2xl px-4 py-3 text-xs text-neutral-900 font-medium placeholder-neutral-400 focus:outline-none focus:border-black font-mono shadow-xs"
                  />
                  <p className="text-[11px] text-neutral-600 font-medium">
                    Pode ser o handle do seu canal (ex: <code className="text-neutral-900 font-bold">@alx-garage</code>), o ID do canal ou o link completo.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-neutral-900 flex items-center justify-between">
                    <span>Chave de API do YouTube Data v3 (Opcional)</span>
                    <span className="text-[10px] text-neutral-500 font-bold">Opcional</span>
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-2xl px-4 py-3 text-xs text-neutral-900 font-medium placeholder-neutral-400 focus:outline-none focus:border-black font-mono shadow-xs"
                  />
                  <p className="text-[11px] text-neutral-600 font-medium">
                    Se não for informada, o sistema usará a integração via RSS público automaticamente.
                  </p>
                </div>
              </div>

              {syncFeedback && (
                <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-2.5 ${
                  syncFeedback.success 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  {syncFeedback.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />}
                  <span>{syncFeedback.message}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-100">
                <div className="text-xs text-neutral-600 flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4 text-[#ebbf01]" />
                  <span>{videos.length} vídeos exibidos no site.</span>
                </div>

                <button
                  type="button"
                  disabled={isSyncingYouTube}
                  onClick={async () => {
                    setSyncFeedback(null);
                    const res = await syncYouTubeChannel(channelInput, apiKeyInput);
                    if (res.success) {
                      setSyncFeedback({
                        success: true,
                        message: `Sucesso! ${res.count} vídeos importados ${res.channelTitle ? `do canal "${res.channelTitle}"` : ''}.`,
                      });
                      triggerSuccess('Vídeos sincronizados com sucesso!');
                    } else {
                      setSyncFeedback({
                        success: false,
                        message: res.error || 'Erro ao sincronizar. Verifique o link/ID do canal.',
                      });
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#ebbf01] text-black font-extrabold text-xs uppercase rounded-2xl hover:bg-[#f5cc14] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingYouTube ? 'animate-spin' : ''}`} />
                  <span>{isSyncingYouTube ? 'Buscando Vídeos...' : 'Sincronizar Canal Agora'}</span>
                </button>
              </div>
            </div>

            {/* Videos List Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-neutral-900 font-heading">
                    Vídeos Cadastrados ({videos.length})
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Você pode sincronizar via canal acima ou gerenciar categorias e detalhes dos vídeos individualmente.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingVideo({
                      id: '',
                      title: 'Novo Vídeo do Canal',
                      description: 'Descrição do vídeo...',
                      youtubeId: 'AERBcFtpJz8',
                      youtubeUrl: 'https://www.youtube.com/watch?v=AERBcFtpJz8',
                      duration: '10:00',
                      category: 'Multimídia & Som',
                      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                      views: '1.2k visualizações',
                    });
                    setIsCreatingVideo(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Adicionar Vídeo Manual</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((vid) => {
                  const thumb = vid.youtubeId
                    ? `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`
                    : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

                  return (
                    <div
                      key={vid.id}
                      className="bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 rounded-3xl overflow-hidden transition-all flex flex-col sm:flex-row justify-between shadow-sm"
                    >
                      <div className="w-full sm:w-48 aspect-video sm:aspect-auto bg-neutral-100 shrink-0 relative">
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black text-[#ebbf01]">
                            {vid.category}
                          </span>
                          {(vid.isMembersOnly || vid.isVipExclusive) && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#ebbf01] text-black flex items-center gap-0.5 shadow-sm">
                              <Crown className="w-2.5 h-2.5 fill-black" />
                              <span>VIP</span>
                            </span>
                          )}
                        </div>
                        {vid.duration && (
                          <div className="absolute bottom-2 right-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/90 text-white">
                            {vid.duration}
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-mono text-neutral-500 font-bold">
                            {vid.date} {vid.views ? `• ${vid.views}` : ''}
                          </div>
                          <h4 className="text-sm font-black text-neutral-900 line-clamp-2 font-heading">
                            {vid.title}
                          </h4>
                          <p className="text-xs text-neutral-600 font-medium line-clamp-2">
                            {vid.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                          <a
                            href={vid.youtubeUrl || `https://youtube.com/watch?v=${vid.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-neutral-800 font-extrabold hover:text-black flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir no YouTube</span>
                          </a>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const cloned = duplicateVideo(vid.id);
                                if (cloned) triggerSuccess(`Vídeo "${vid.title}" duplicado com sucesso!`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Duplicar vídeo"
                            >
                              <Copy className="w-3.5 h-3.5 text-neutral-600" />
                              <span>Duplicar</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingVideo({ ...vid });
                                setIsCreatingVideo(false);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#ebbf01]" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteVideo(vid.id);
                                triggerSuccess('Vídeo excluído!');
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: OTA */}
        {activeTab === 'ota' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  Pacotes OTA & Firmwares
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Cadastre fotos, carros compatíveis, versões, MCU, links para download e tutoriais.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingOta({
                    id: '',
                    version: 'v1.0.0',
                    mcu: 'MCU-1.0',
                    title: 'Atualização OTA DiLink',
                    releaseDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: 'Homologado',
                    size: '2.5 GB',
                    modelTarget: 'BYD Dolphin, Dolphin Mini',
                    applicableCars: 'BYD Dolphin, Dolphin Mini, Seal, Song Plus, Yuan Plus',
                    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
                    changelog: ['Melhoria na multimídia DiLink', 'Correção de bugs de áudio Bluetooth'],
                    installationGuide: 'Descompacte na raiz do pen drive formatado em FAT32...',
                    downloadUrl: 'https://alx.7f.com.br/downloads/ota-v1.0.0.zip',
                    tutorialUrl: 'https://alx.7f.com.br/tutoriais/como-instalar-ota',
                  });
                  setIsCreatingOta(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Cadastrar Pacote OTA</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otaUpdates.map((ota) => (
                <div key={ota.id} className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    {/* Image preview */}
                    <div className="aspect-video bg-neutral-100 relative overflow-hidden border-b border-neutral-200">
                      <img
                        src={getMediaPreviewUrl(ota.imageUrl) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop'}
                        alt={ota.title || ota.version}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="text-base font-black text-neutral-900 font-heading">
                        {ota.title || `Atualização ${ota.version}`}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                          <span className="text-[10px] text-neutral-500 font-bold block uppercase">FIRMWARE</span>
                          <span className="font-extrabold text-neutral-900">{ota.version}</span>
                        </div>
                        <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                          <span className="text-[10px] text-neutral-500 font-bold block uppercase">VERSÃO</span>
                          <span className="font-extrabold text-neutral-900">{ota.mcu || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs">
                        <span className="font-extrabold text-neutral-900 block font-mono">Carros Compatíveis:</span>
                        <p className="text-neutral-700 font-medium">
                          {ota.applicableCars || ota.modelTarget || 'Modelos BYD DiLink'}
                        </p>
                      </div>

                      {ota.downloadUrl && (
                        <div className="text-[11px] font-mono truncate text-neutral-600">
                          <strong className="text-neutral-900">Download:</strong> <span className="underline">{ota.downloadUrl}</span>
                        </div>
                      )}

                      {/* Link da Publicação OTA */}
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-mono">
                        <div className="flex items-center gap-1.5 truncate text-neutral-700">
                          <LinkIcon className="w-3.5 h-3.5 text-[#ebbf01] shrink-0" />
                          <span className="truncate">/ota/{ota.slug || ota.id}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const origin = typeof window !== 'undefined' ? window.location.origin : '';
                              navigator.clipboard.writeText(`${origin}/ota/${ota.slug || ota.id}`);
                              triggerSuccess('Link da publicação copiado!');
                            }}
                            className="px-2 py-1 rounded-md bg-white hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-[10px] font-bold cursor-pointer transition-colors"
                            title="Copiar Link da Publicação"
                          >
                            Copiar Link
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePage({ type: 'ota', idOrSlug: ota.slug || ota.id });
                            }}
                            className="px-2 py-1 rounded-md bg-black hover:bg-neutral-800 text-[#ebbf01] text-[10px] font-bold cursor-pointer transition-colors"
                            title="Abrir Publicação no Site"
                          >
                            Ver
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <span className="text-xs font-mono font-bold text-neutral-500">{ota.releaseDate}</span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const cloned = duplicateOtaUpdate(ota.id);
                          if (cloned) triggerSuccess(`Pacote OTA "${ota.version}" duplicado!`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Duplicar este pacote OTA"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Duplicar</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingOta({ ...ota });
                          setIsCreatingOta(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#ebbf01]" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          deleteOtaUpdate(ota.id);
                          triggerSuccess('Pacote OTA excluído!');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TUTORIAIS */}
        {activeTab === 'tutorials' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  Central de Tutoriais & Guias
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Cadastre tutoriais passo a passo para instalação OTA, configuração de multimídia e dicas práticas.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTutorial({
                    id: '',
                    title: 'Como Instalar Atualização OTA via Pen Drive',
                    category: 'Instalação OTA',
                    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
                    summary: 'Guia completo passo a passo para atualizar a central DiLink do seu veículo com segurança.',
                    content: 'Passo 1: Baixe o arquivo ZIP da versão desejada.\nPasso 2: Formate um pen drive de no mínimo 16GB no sistema FAT32.\nPasso 3: Descompacte o arquivo na raiz do pen drive.\nPasso 4: Ligue a multimídia e insira na porta USB1.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    slug: 'como-instalar-atualizacao-ota',
                    isMembersOnly: false,
                  });
                  setIsCreatingTutorial(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Cadastrar Novo Tutorial</span>
              </button>
            </div>

            {/* Configuração do Campo de Direitos Autorais dos Tutoriais */}
            <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1EFF00]" />
                  <h4 className="text-sm font-bold font-mono text-white">Campo Proteção de Direitos Autorais (Tutoriais)</h4>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#1EFF00]/20 text-[#1EFF00] uppercase font-bold font-mono">
                  {brand?.tutorialCopyrightBadge || 'Oficial'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-400 mb-1">Título do Campo</label>
                  <input
                    type="text"
                    value={brand?.tutorialCopyrightTitle ?? 'Proteção de Direitos Autorais'}
                    onChange={(e) => updateBrand({ tutorialCopyrightTitle: e.target.value })}
                    placeholder="Proteção de Direitos Autorais"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-mono focus:border-[#1EFF00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-400 mb-1">Selo / Badge (opcional)</label>
                  <input
                    type="text"
                    value={brand?.tutorialCopyrightBadge ?? 'Oficial'}
                    onChange={(e) => updateBrand({ tutorialCopyrightBadge: e.target.value })}
                    placeholder="Oficial"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-mono focus:border-[#1EFF00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-400 mb-1">Texto do Aviso de Direitos Autorais</label>
                <textarea
                  rows={2}
                  value={brand?.tutorialCopyrightText ?? 'Documento produzido por Alx⁺. Todos os direitos reservados. Proibida a cópia, reprodução integral ou distribuição não autorizada deste material. Compartilhe sempre usando o link oficial desta página.'}
                  onChange={(e) => updateBrand({ tutorialCopyrightText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-sans leading-relaxed focus:border-[#1EFF00] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tut) => (
                <div key={tut.id} className="bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/30 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300">
                  <div>
                    <div className="aspect-video bg-[#16161D] relative overflow-hidden border-b border-white/[0.08]">
                      <img
                        src={getMediaPreviewUrl(tut.imageUrl) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop'}
                        alt={tut.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5 pointer-events-none">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded bg-black/80 text-[#ebbf01] font-mono text-[10px] font-bold border border-white/10">
                            {tut.category}
                          </span>
                          {(tut.isMembersOnly || tut.isVipExclusive) && (
                            <span className="px-2 py-0.5 rounded bg-[#ebbf01] text-black font-mono text-[10px] font-black flex items-center gap-1 shadow-sm">
                              <Crown className="w-3 h-3 fill-black" />
                              <span>Membros</span>
                            </span>
                          )}
                        </div>
                        <div className="pointer-events-auto">
                          <VisibilityBadge visibility={tut.visibility} />
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <h4 className="text-base font-black text-white font-heading line-clamp-2">
                        {tut.title}
                      </h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 font-medium">
                        {tut.summary}
                      </p>
                      
                      {/* Direct Page Link */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-[#16161D] px-2.5 py-1.5 rounded-lg border border-white/[0.08]">
                        <span className="truncate text-[#ebbf01]">/tutoriais/{tut.slug || tut.id}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const directUrl = `${window.location.origin}/tutoriais/${tut.slug || tut.id}`;
                            navigator.clipboard.writeText(directUrl);
                            triggerSuccess('Link copiado!');
                          }}
                          className="text-neutral-200 hover:text-white font-bold underline cursor-pointer shrink-0 ml-2"
                        >
                          Copiar Link
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-end border-t border-white/[0.08] pt-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const cloned = duplicateTutorial(tut.id);
                          if (cloned) triggerSuccess(`Tutorial "${tut.title}" duplicado!`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#181820] text-neutral-200 hover:bg-[#20202b] border border-white/[0.08] text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Duplicar tutorial"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Duplicar</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingTutorial({ ...tut });
                          setIsCreatingTutorial(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#ebbf01] text-black hover:bg-[#f5cc14] text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          deleteTutorial(tut.id);
                          triggerSuccess('Tutorial excluído!');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: DESBLOQUEIOS & SERVIÇOS */}
        {activeTab === 'unlock' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#ebbf01]" />
                  <span>Desbloqueios & Serviços Especializados</span>
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Cadastre e gerencie serviços de desbloqueio, liberação de multimídias, suporte remoto e customizações para veículos elétricos.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingUnlockService({
                    id: '',
                    title: 'Desbloqueio de Multimídia BYD DiLink',
                    category: 'BYD DiLink',
                    price: 'Serviço Sob Consulta',
                    badge: 'Novo',
                    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
                    summary: 'Serviço de instalação e liberação de aplicativos sem restrições.',
                    content: '## Descrição do Serviço\nDescreva detalhadamente o que está incluso no serviço, benefícios e como o procedimento é realizado.\n\n### O que está incluso:\n- Instalação e configuração completa.\n- Suporte pós-venda.',
                    applicableCars: 'Dolphin, Seal, Song Plus, Yuan Plus, King',
                    tags: ['Desbloqueio', 'BYD', 'DiLink'],
                    whatsappContactMessage: 'Olá! Gostaria de informações sobre o serviço de desbloqueio.',
                    slug: `desbloqueio-servico-${Date.now()}`
                  });
                  setIsCreatingUnlockService(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Cadastrar Novo Serviço</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(unlockServices || []).map((service, idx) => (
                <div key={service.id} className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="aspect-video bg-neutral-100 relative overflow-hidden border-b border-neutral-200">
                      <img
                        src={getMediaPreviewUrl(service.imageUrl) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop'}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded bg-black text-[#ebbf01] font-mono text-[10px] font-bold">
                          {service.category}
                        </span>
                        {service.badge && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-mono text-[10px] font-black">
                            {service.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {service.price || 'Sob Consulta'}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-neutral-900 font-heading line-clamp-2">
                        {service.title}
                      </h4>
                      <p className="text-xs text-neutral-600 line-clamp-2 font-medium">
                        {service.summary}
                      </p>

                      {service.applicableCars && (
                        <div className="text-[10px] font-mono text-neutral-500 truncate">
                          <span className="font-bold text-neutral-700">Compatível:</span> {service.applicableCars}
                        </div>
                      )}

                      {/* Direct Page Link */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-200">
                        <span className="truncate">/desbloqueio/{service.slug || service.id}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const directUrl = `${window.location.origin}/desbloqueio/${service.slug || service.id}`;
                            navigator.clipboard.writeText(directUrl);
                            triggerSuccess('Link copiado!');
                          }}
                          className="text-neutral-500 hover:text-black ml-2 cursor-pointer"
                          title="Copiar Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => reorderUnlockService(service.id, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 cursor-pointer"
                        title="Mover para Cima"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reorderUnlockService(service.id, 'down')}
                        disabled={idx === (unlockServices || []).length - 1}
                        className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 cursor-pointer"
                        title="Mover para Baixo"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cloned = duplicateUnlockService(service.id);
                          if (cloned) triggerSuccess(`Serviço "${service.title}" duplicado!`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Duplicar este serviço"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Duplicar</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onClose) onClose();
                          setActivePage({ type: 'servico-desbloqueio', idOrSlug: service.slug || service.id });
                        }}
                        className="p-1.5 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                        title="Ver no site"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingUnlockService(service);
                          setIsCreatingUnlockService(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#ebbf01]" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          deleteUnlockService(service.id);
                          triggerSuccess('Serviço excluído!');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Excluir serviço"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: WALLPAPERS & VÍDEOS */}
        {activeTab === 'wallpapers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#ebbf01]" />
                  <span>Galeria de Wallpapers & Vídeos HD</span>
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Cadastre e gerencie papéis de parede estáticos (4K) e vídeos animados (MP4) para download e personalização de centrais multimídia.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingWallpaper({
                    id: '',
                    slug: `wallpaper-${Date.now()}`,
                    title: 'Novo Wallpaper 4K',
                    description: 'Wallpaper estilizado em alta definição para central multimídia.',
                    type: 'image',
                    category: 'BYD & Elétricos',
                    previewUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80',
                    downloadUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=3840&q=100',
                    resolution: '4K Ultra HD (3840x2160)',
                    aspectRatio: '16:9 / Multimídia',
                    badge: 'Novo',
                    tags: ['BYD', 'Multimídia', '4K'],
                    downloadCount: 0,
                    isMembersOnly: false,
                    isVipExclusive: false,
                    date: new Date().toISOString().split('T')[0]
                  });
                  setIsCreatingWallpaper(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Adicionar Wallpaper / Vídeo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(wallpapers || []).map((wp) => (
                <div key={wp.id} className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="aspect-video bg-neutral-900 relative overflow-hidden border-b border-neutral-200">
                      {(wp.type === 'video' || (wp.previewUrl && (wp.previewUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i) || wp.previewUrl.startsWith('data:video/')))) ? (
                        <video 
                          src={getMediaPreviewUrl(wp.videoUrl || wp.previewUrl)} 
                          poster={wp.previewUrl && !wp.previewUrl.startsWith('data:video/') ? getMediaPreviewUrl(wp.previewUrl) : undefined} 
                          muted 
                          loop 
                          playsInline 
                          autoPlay 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <img
                          src={getMediaPreviewUrl(wp.previewUrl || wp.videoUrl || wp.downloadUrl) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded bg-black text-[#ebbf01] font-mono text-[10px] font-bold uppercase">
                          {wp.type === 'video' ? 'Vídeo MP4' : 'Wallpaper'}
                        </span>
                        {(wp.isMembersOnly || (wp as any).isVipExclusive) && (
                          <span className="px-2 py-0.5 rounded bg-[#ebbf01] text-black font-mono text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                            <Crown className="w-3 h-3" />
                            Membros VIP
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-neutral-900 truncate" title={wp.title}>
                          {wp.title || 'Wallpaper'}
                        </h4>
                        {wp.resolution && (
                          <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded shrink-0">
                            {wp.resolution}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        {wp.category || 'Geral'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                    <button
                      onClick={() => duplicateWallpaper(wp.id)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      Duplicar
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingWallpaper(wp);
                          setIsCreatingWallpaper(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-black text-[#ebbf01] hover:bg-neutral-800 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          deleteWallpaper(wp.id);
                          triggerSuccess('Wallpaper excluído!');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Excluir wallpaper"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: IPTV & STREAMING */}
        {activeTab === 'iptv' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#ebbf01]" />
                  <span>Gerenciar Página de IPTV & Streaming</span>
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Edite os textos do tutorial, os aplicativos para download e os links/utilitários da página de IPTV.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIptvApp({
                      id: '',
                      name: '',
                      version: 'v1.0',
                      category: 'Player XTREAM / M3U',
                      description: '',
                      downloadUrl: '',
                      badge: 'Novo',
                      fileSize: '30 MB',
                    });
                    setIsCreatingIptvApp(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs font-mono uppercase tracking-wider shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo App IPTV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingIptvLink({
                      id: '',
                      title: '',
                      description: '',
                      url: '',
                      badge: 'Link',
                      isExternal: true,
                    });
                    setIsCreatingIptvLink(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#111116] hover:bg-[#1b1b22] text-white font-extrabold text-xs font-mono uppercase tracking-wider border border-white/10 shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#ebbf01]" />
                  <span>Novo Link Útil</span>
                </button>
              </div>
            </div>

            {/* Form 1: Textos da Página & Tutorial */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <BookOpen className="w-5 h-5 text-[#ebbf01]" />
                <h4 className="text-sm font-bold text-neutral-900 font-heading">
                  Textos do Cabeçalho & Tutorial da Página
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Título da Página</label>
                  <input
                    type="text"
                    value={iptvTitleInput !== '' ? iptvTitleInput : (iptvConfig?.title || '')}
                    onChange={(e) => setIptvTitleInput(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                    placeholder="Sistema IPTV para seu veiculo, celular, sua casa!!!"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Resumo do Cabeçalho</label>
                  <input
                    type="text"
                    value={iptvSummaryInput !== '' ? iptvSummaryInput : (iptvConfig?.summary || '')}
                    onChange={(e) => setIptvSummaryInput(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                    placeholder="Aprenda a configurar transmissão de TV ao vivo..."
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-neutral-700 font-mono">Link do Vídeo do YouTube (Opcional)</label>
                <input
                  type="text"
                  value={iptvYoutubeUrlInput !== '' ? iptvYoutubeUrlInput : (iptvConfig?.youtubeUrl || '')}
                  onChange={(e) => setIptvYoutubeUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                />
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-neutral-700 font-mono flex items-center justify-between">
                  <span>Conteúdo Completo do Tutorial (Suporta formatação com ### Títulos)</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Edite igual a um artigo ou guia técnico</span>
                </label>
                <textarea
                  rows={10}
                  value={iptvGuideContentInput !== '' ? iptvGuideContentInput : (iptvConfig?.guideContent || '')}
                  onChange={(e) => setIptvGuideContentInput(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#ebbf01] leading-relaxed"
                  placeholder="### Título do Passo&#10;Escreva o conteúdo explicativo aqui..."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateIptvConfig({
                      title: iptvTitleInput !== '' ? iptvTitleInput : (iptvConfig?.title || ''),
                      summary: iptvSummaryInput !== '' ? iptvSummaryInput : (iptvConfig?.summary || ''),
                      guideContent: iptvGuideContentInput !== '' ? iptvGuideContentInput : (iptvConfig?.guideContent || ''),
                      youtubeUrl: iptvYoutubeUrlInput !== '' ? iptvYoutubeUrlInput : (iptvConfig?.youtubeUrl || ''),
                    });
                    triggerSuccess('Textos, vídeo e guia do IPTV atualizados!');
                  }}
                  className="px-6 py-2.5 bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Guia IPTV</span>
                </button>
              </div>
            </div>

            {/* List 1.5: Selecionar Aplicativos da Loja Principal com Filtro Avançado */}
            <div className="bg-purple-50/60 border border-purple-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-purple-200/60 pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-purple-950 font-heading flex items-center gap-2">
                    <Tv className="w-5 h-5 text-purple-600" />
                    <span>Selecionar Apps da Loja ({apps.length} cadastrados)</span>
                  </h4>
                  <p className="text-xs text-purple-800">
                    Selecione quais aplicativos da Loja de Apps devem aparecer na página IPTV sem precisar cadastrar 2 vezes!
                  </p>
                </div>

                {/* Counter indicator */}
                <div className="text-[11px] font-mono text-purple-900 bg-purple-100/80 px-3 py-1.5 rounded-xl border border-purple-200 shrink-0">
                  {apps.filter(a => !!a.showInIptv || a.category?.toLowerCase().includes('iptv')).length} selecionados no IPTV
                </div>
              </div>

              {/* Filters Bar */}
              <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* Search Input */}
                  <div className="sm:col-span-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Filtrar por nome, categoria ou palavra-chave..."
                      value={iptvStoreAppSearch}
                      onChange={(e) => setIptvStoreAppSearch(e.target.value)}
                      className="w-full pl-8 pr-12 py-1.5 text-xs bg-purple-50/40 border border-purple-200 rounded-xl font-medium text-neutral-900 focus:outline-none focus:border-purple-500 placeholder:text-neutral-400"
                    />
                    {iptvStoreAppSearch && (
                      <button
                        type="button"
                        onClick={() => setIptvStoreAppSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-purple-600 font-bold hover:underline cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {/* Status Pills Filter */}
                  <div className="sm:col-span-6 flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIptvStoreAppFilter('all')}
                      className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        iptvStoreAppFilter === 'all'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-purple-100'
                      }`}
                    >
                      Todos ({apps.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIptvStoreAppFilter('selected')}
                      className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        iptvStoreAppFilter === 'selected'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-purple-100'
                      }`}
                    >
                      ✓ IPTV On ({apps.filter(a => !!a.showInIptv || a.category?.toLowerCase().includes('iptv')).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIptvStoreAppFilter('unselected')}
                      className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        iptvStoreAppFilter === 'unselected'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-purple-100'
                      }`}
                    >
                      Não Selecionados ({apps.filter(a => !a.showInIptv && !a.category?.toLowerCase().includes('iptv')).length})
                    </button>
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-purple-50">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] font-mono text-purple-900 font-bold uppercase shrink-0">Categoria:</span>
                    <select
                      value={iptvStoreCategoryFilter}
                      onChange={(e) => setIptvStoreCategoryFilter(e.target.value)}
                      className="text-xs bg-purple-50/60 border border-purple-200 rounded-lg px-2.5 py-1 text-purple-950 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="all">Todas as Categorias</option>
                      {Array.from(new Set(apps.map(a => a.category).filter(Boolean))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {(iptvStoreAppSearch || iptvStoreAppFilter !== 'all' || iptvStoreCategoryFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setIptvStoreAppSearch('');
                        setIptvStoreAppFilter('all');
                        setIptvStoreCategoryFilter('all');
                      }}
                      className="text-[11px] font-mono text-purple-700 hover:text-purple-950 underline font-bold cursor-pointer"
                    >
                      Resetar filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Render filtered apps */}
              {(() => {
                const filteredStoreApps = apps.filter((app) => {
                  const isSelected = !!app.showInIptv || app.category?.toLowerCase().includes('iptv');

                  if (iptvStoreAppFilter === 'selected' && !isSelected) return false;
                  if (iptvStoreAppFilter === 'unselected' && isSelected) return false;

                  if (iptvStoreCategoryFilter !== 'all' && app.category !== iptvStoreCategoryFilter) return false;

                  if (iptvStoreAppSearch.trim()) {
                    const term = iptvStoreAppSearch.toLowerCase();
                    const matchName = app.name.toLowerCase().includes(term);
                    const matchCat = app.category ? app.category.toLowerCase().includes(term) : false;
                    const matchDesc = app.description ? app.description.toLowerCase().includes(term) : false;
                    const matchTag = app.tagline ? app.tagline.toLowerCase().includes(term) : false;
                    return matchName || matchCat || matchDesc || matchTag;
                  }

                  return true;
                });

                if (apps.length === 0) {
                  return <p className="text-xs text-purple-700 italic">Nenhum aplicativo cadastrado na loja ainda.</p>;
                }

                if (filteredStoreApps.length === 0) {
                  return (
                    <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-purple-200 space-y-2">
                      <p className="text-xs text-neutral-600 font-medium">Nenhum aplicativo encontrado com os filtros aplicados.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIptvStoreAppSearch('');
                          setIptvStoreAppFilter('all');
                          setIptvStoreCategoryFilter('all');
                        }}
                        className="text-xs text-purple-700 font-bold hover:underline cursor-pointer"
                      >
                        Limpar busca e filtros
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredStoreApps.map((app) => {
                      const isSelected = !!app.showInIptv || app.category?.toLowerCase().includes('iptv');
                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            const nextState = !app.showInIptv;
                            updateApp(app.id, { showInIptv: nextState });
                            triggerSuccess(
                              nextState
                                ? `App "${app.name}" ativado na página IPTV!`
                                : `App "${app.name}" removido da página IPTV.`
                            );
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-[1.01]'
                              : 'bg-white text-neutral-800 border-neutral-200 hover:border-purple-300 hover:bg-purple-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
                              isSelected ? 'bg-purple-700 text-white' : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {app.iconUrl ? (
                                <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                              ) : (
                                <Smartphone className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{app.name}</p>
                              <p className={`text-[10px] font-mono truncate ${isSelected ? 'text-purple-200' : 'text-neutral-500'}`}>
                                {app.category || 'Geral'} • {app.version || 'v1.0'}
                              </p>
                            </div>
                          </div>

                          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase shrink-0 flex items-center gap-1 ${
                            isSelected
                              ? 'bg-white text-purple-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {isSelected ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>IPTV On</span>
                              </>
                            ) : (
                              <span>+ Selecionar</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* List 2: Aplicativos IPTV Directos Cadastrados */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h4 className="text-base font-extrabold text-neutral-900 font-heading flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#ebbf01]" />
                  <span>Aplicativos IPTV Cadastrados ({(iptvConfig?.apps || []).length})</span>
                </h4>

                {(iptvConfig?.apps || []).length > 2 && (
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Filtrar IPTV cadastrados..."
                      value={iptvDirectAppSearch}
                      onChange={(e) => setIptvDirectAppSearch(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                    />
                    {iptvDirectAppSearch && (
                      <button
                        type="button"
                        onClick={() => setIptvDirectAppSearch('')}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-[10px] text-neutral-500 hover:text-black font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              {(() => {
                const registeredIptvApps = (iptvConfig?.apps || []).filter((app) => {
                  if (!iptvDirectAppSearch.trim()) return true;
                  const term = iptvDirectAppSearch.toLowerCase();
                  return (
                    app.name.toLowerCase().includes(term) ||
                    (app.category && app.category.toLowerCase().includes(term)) ||
                    (app.description && app.description.toLowerCase().includes(term))
                  );
                });

                if (registeredIptvApps.length === 0) {
                  return (
                    <p className="text-xs text-neutral-500 italic bg-white p-4 rounded-xl border border-neutral-200">
                      {iptvDirectAppSearch ? 'Nenhum aplicativo encontrado para esta busca.' : 'Nenhum aplicativo IPTV cadastrado diretamente ainda.'}
                    </p>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {registeredIptvApps.map((app) => (
                      <div key={app.id} className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#ebbf01]/10 border border-[#ebbf01]/30 text-[#ebbf01] text-[10px] font-mono font-bold uppercase">
                              {app.badge || 'App'}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-400">{app.fileSize || '30 MB'}</span>
                          </div>

                          <h5 className="text-sm font-bold text-neutral-900 truncate">{app.name}</h5>
                          <p className="text-xs text-neutral-500 font-mono">{app.version} • {app.category}</p>
                          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{app.description}</p>
                        </div>

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                          <a 
                            href={app.downloadUrl}
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-neutral-500 hover:text-[#ebbf01] font-mono font-bold flex items-center gap-1 truncate"
                          >
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">APK Link</span>
                          </a>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const cloned = duplicateIptvApp(app.id);
                                if (cloned) triggerSuccess(`App IPTV "${app.name}" duplicado!`);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 cursor-pointer"
                              title="Duplicar aplicativo IPTV"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingIptvApp(app);
                                setIsCreatingIptvApp(false);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteIptvApp(app.id);
                                triggerSuccess('Aplicativo removido!');
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* List 3: Links Úteis */}
            <div className="space-y-4 pt-2">
              <h4 className="text-base font-extrabold text-neutral-900 font-heading flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#ebbf01]" />
                <span>Links Úteis Cadastrados ({(iptvConfig?.links || []).length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(iptvConfig?.links || []).map((link) => (
                  <div key={link.id} className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-neutral-900 truncate">{link.title}</h5>
                        {link.badge && (
                          <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 text-[10px] font-mono shrink-0">
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">{link.description}</p>
                      <p className="text-[11px] font-mono text-[#ebbf01] truncate">{link.url}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIptvLink(link);
                          setIsCreatingIptvLink(false);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteIptvLink(link.id);
                          triggerSuccess('Link removido!');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: PARCEIROS & PARCERIAS */}
        {activeTab === 'parceiros' && (
          <PartnersTab onTriggerSuccess={triggerSuccess} />
        )}

        {/* TAB: NOTIFICAÇÕES & SININHO */}
        {activeTab === 'notifications' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header & Quick Push Test */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#ebbf01]" />
                  <span>Central de Notificações & Sininho de Atualizações</span>
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Gerencie as notificações do sininho no site e envie notificações push automáticas para usuários com o aplicativo PWA instalado no celular.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const permission = await requestNotificationPermission();
                    if (permission) {
                      sendBrowserNotification('ALX AutoTech • Teste de Push', {
                        body: 'Notificação do sistema funcionando perfeitamente no seu dispositivo!',
                      });
                      triggerSuccess('Notificação de teste enviada para este dispositivo!');
                    } else {
                      alert('Permissão de notificações não foi concedida no navegador.');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-[#ebbf01]" />
                  <span>Testar Notificação Push no Celular</span>
                </button>
              </div>
            </div>

            {/* Broadcast Form Card */}
            <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-200">
                <Send className="w-4 h-4 text-[#ebbf01]" />
                <span>Disparar Nova Notificação para Todos os Usuários</span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
                    alert('Preencha o título e a mensagem da notificação.');
                    return;
                  }

                  addNotification({
                    title: broadcastTitle,
                    message: broadcastMessage,
                    type: broadcastType,
                    link: broadcastLink.trim() || undefined,
                  });

                  setBroadcastTitle('');
                  setBroadcastMessage('');
                  setBroadcastLink('');
                  triggerSuccess('Notificação disparada com sucesso para o sininho e push!');
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Título da Notificação</label>
                    <input
                      type="text"
                      placeholder="ex: Nova Atualização OTA 1.4.0 Disponível!"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Tipo / Ícone</label>
                    <select
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value as any)}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs"
                    >
                      <option value="ota">OTA / Firmware</option>
                      <option value="app">Aplicativo / APK</option>
                      <option value="news">Notícia & Artigo</option>
                      <option value="product">Produto / Loja</option>
                      <option value="system">Aviso do Sistema</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Mensagem Explicativa</label>
                    <textarea
                      rows={2}
                      placeholder="ex: Pacote de atualização de firmware disponível para download. Compatível com Seal, Dolphin e Song Plus."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Link de Destino (Opcional)</label>
                    <input
                      type="text"
                      placeholder="ex: #radar-ota ou #aplicativos"
                      value={broadcastLink}
                      onChange={(e) => setBroadcastLink(e.target.value)}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Disparar Notificação Agora</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Sent Notifications */}
            <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-neutral-900">Histórico de Notificações Enviadas</h4>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-mono font-bold">
                    {notifications.length}
                  </span>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  Nenhuma notificação registrada no momento.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="py-3 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 uppercase">
                            {notif.type}
                          </span>
                          <span className="text-xs font-bold text-neutral-900">{notif.title}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{notif.date}</span>
                        </div>
                        <p className="text-xs text-neutral-600">{notif.message}</p>
                        {notif.link && (
                          <span className="text-[10px] text-[#ebbf01] font-mono bg-neutral-900 px-2 py-0.5 rounded">
                            {notif.link}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          deleteNotification(notif.id);
                          triggerSuccess('Notificação removida!');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Excluir notificação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: BACKUP & RESTAURAÇÃO */}
        {activeTab === 'backup' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* MySQL Dedicated Box in Backup */}
            <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-[#ebbf01] flex items-center justify-center shrink-0 shadow-md">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-emerald-950 font-heading">
                    Banco de Dados MySQL Hostinger (Gravação Permanente)
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    Insira suas credenciais da Hostinger para salvar todos os dados permanentemente no banco.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('database')}
                className="px-5 py-3 bg-neutral-900 hover:bg-black text-[#ebbf01] font-extrabold text-xs uppercase rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Database className="w-4 h-4 text-[#ebbf01]" />
                <span>Configurar Banco MySQL</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Export Box */}
              <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-[#ebbf01] flex items-center justify-center border border-neutral-200">
                  <Download className="w-6 h-6 text-neutral-900" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-neutral-900 font-heading">Exportar Backup Completo</h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Gere um arquivo .json com todos os cadastros, imagens salvas em base64, textos e configurações atuais do site.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  className="w-full py-3 bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-black" />
                  <span>Baixar Arquivo JSON de Backup</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center border border-neutral-200">
                  <Upload className="w-6 h-6 text-neutral-900" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-neutral-900 font-heading">Importar ou Restaurar Backup</h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Cole o conteúdo do arquivo JSON de backup ou selecione o arquivo do seu computador.
                  </p>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Cole o código JSON do backup aqui..."
                    value={backupJsonInput}
                    onChange={(e) => setBackupJsonInput(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 font-medium font-mono placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                  {importStatus && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      importStatus.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-900 border border-red-300'
                    }`}>
                      <span>{importStatus.message}</span>
                    </div>
                  )}
                  <button
                    onClick={handleImportBackup}
                    disabled={!backupJsonInput.trim()}
                    className="w-full py-3 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Restaurar Dados do JSON
                  </button>
                </div>
              </div>

            </div>

            {/* Factory Reset Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Zona de Restauração de Fábrica</span>
                </div>
                <p className="text-xs text-neutral-600 max-w-xl">
                  Redefinir todas as imagens e cadastros de volta para os valores padrão originais da plataforma.
                </p>
              </div>

              <button
                onClick={() => {
                  resetToDefaults();
                  triggerSuccess('Site restaurado para as configurações padrão com sucesso!');
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Valores Padrão</span>
              </button>
            </div>

          </div>
        )}

        {/* ================= TAB: BANCO DE DADOS MYSQL ================= */}
        {activeTab === 'database' && (
          <DatabaseTab onTriggerSuccess={triggerSuccess} />
        )}

        {/* ================= TAB: PAGES & CUSTOM LINKS ================= */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#ebbf01]" />
                  <h3 className="text-lg font-black text-neutral-900 font-heading">
                    Páginas & Links do Menu
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 max-w-2xl">
                  Gerencie links para outras páginas e recursos externos exibidos no menu <strong>"Mais Páginas"</strong> do cabeçalho.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsCreatingPageLink(true);
                  setEditingPageLink({
                    id: '',
                    title: '',
                    description: '',
                    url: 'https://',
                    icon: 'globe',
                    badge: '',
                    isExternal: true,
                    openInNewTab: true,
                    category: 'Geral',
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Página / Link</span>
              </button>
            </div>

            {/* Seção de Reordenação e Localização do Menu Superior (Header) */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#ebbf01]" />
                    <span>Reordenar Menu Superior & Menu "Mais"</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Defina a ordem exata e escolha quais itens aparecem na <strong>Barra Principal (Acima)</strong> e quais vão no menu <strong>"Mais" (Dropdown)</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateBrand({ headerMenuItems: undefined });
                    triggerSuccess('Ordem padrão do menu superior restaurada!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer shrink-0"
                >
                  Restaurar Padrão
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {getResolvedHeaderMenu(brand, customPageLinks).allSortedItems.map((item, index, array) => {
                  const moveItem = (direction: 'up' | 'down') => {
                    const currentItems = array.map((i) => ({ ...i }));
                    const targetIndex = direction === 'up' ? index - 1 : index + 1;
                    if (targetIndex < 0 || targetIndex >= currentItems.length) return;
                    const temp = currentItems[index];
                    currentItems[index] = currentItems[targetIndex];
                    currentItems[targetIndex] = temp;
                    updateBrand({ headerMenuItems: currentItems });
                  };

                  const toggleLocation = () => {
                    const currentItems = array.map((i) => ({ ...i }));
                    currentItems[index].location = currentItems[index].location === 'main' ? 'dropdown' : 'main';
                    updateBrand({ headerMenuItems: currentItems });
                  };

                  const toggleVisible = () => {
                    const currentItems = array.map((i) => ({ ...i }));
                    currentItems[index].visible = !currentItems[index].visible;
                    updateBrand({ headerMenuItems: currentItems });
                  };

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                        item.visible !== false ? 'bg-[#16161D] border-white/10' : 'bg-neutral-950 border-neutral-800 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#0e0e14] border border-white/10 text-[#ebbf01] flex items-center justify-center shrink-0 font-bold text-xs font-mono">
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                            <span>{item.label}</span>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                item.location === 'main'
                                  ? 'bg-[#ebbf01]/20 text-[#ebbf01] border border-[#ebbf01]/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {item.location === 'main' ? 'Barra Principal (Acima)' : 'Menu "Mais" (Dropdown)'}
                            </span>
                            {!item.visible && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                Oculto
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono truncate">
                            {item.url}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Botão para alternar local: Barra Principal x Menu Mais */}
                        <button
                          type="button"
                          onClick={toggleLocation}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                            item.location === 'main'
                              ? 'bg-[#ebbf01] text-black hover:bg-[#f5cc14] shadow-xs'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                          }`}
                          title={item.location === 'main' ? 'Mover para o menu "Mais"' : 'Mover para a barra principal (Acima)'}
                        >
                          {item.location === 'main' ? (
                            <>
                              <span>Barra Principal</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Mover Acima</span>
                              <Sparkles className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        {/* Alternar Visibilidade */}
                        <button
                          type="button"
                          onClick={toggleVisible}
                          className={`p-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer ${
                            item.visible !== false ? 'text-emerald-400 hover:bg-emerald-950/50' : 'text-neutral-500 hover:bg-neutral-800'
                          }`}
                          title={item.visible !== false ? 'Visível (clique para ocultar)' : 'Oculto (clique para exibir)'}
                        >
                          {item.visible !== false ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        {/* Setas Pretas de Reordenação */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveItem('up')}
                          className="p-1.5 rounded-xl bg-white hover:bg-[#ebbf01] text-black transition-colors cursor-pointer shadow-xs disabled:opacity-20 disabled:hover:bg-white"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          disabled={index === array.length - 1}
                          onClick={() => moveItem('down')}
                          className="p-1.5 rounded-xl bg-white hover:bg-[#ebbf01] text-black transition-colors cursor-pointer shadow-xs disabled:opacity-20 disabled:hover:bg-white"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seção de Edição do Conteúdo das Páginas Institucionais (Sobre, Termos, Privacidade) */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-200">
                <FileText className="w-5 h-5 text-[#ebbf01]" />
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 font-heading">
                    Edição de Conteúdo das Páginas Institucionais
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Escreva e edite o texto das páginas <strong>Sobre</strong>, <strong>Termos</strong> e <strong>Privacidade</strong> que possuem links no rodapé.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {/* Campo: Sobre Nós */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-900 uppercase font-mono flex items-center justify-between">
                    <span>📄 Página: Sobre Nós (/sobre)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage({ type: 'sobre' });
                        if (onClose) onClose();
                      }}
                      className="text-[10px] text-neutral-700 hover:text-black font-bold underline font-mono cursor-pointer"
                    >
                      Abrir página no site ↗
                    </button>
                  </label>
                  <textarea
                    rows={4}
                    value={brand.aboutText || ''}
                    onChange={(e) => updateBrand({ aboutText: e.target.value })}
                    placeholder="Escreva o texto sobre a plataforma, objetivos, comunidade e serviços oferecidos..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-2xl p-3.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-sans leading-relaxed"
                  />
                </div>

                {/* Campo: Termos de Uso */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-900 uppercase font-mono flex items-center justify-between">
                    <span>📜 Página: Termos de Uso (/termos)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage({ type: 'termos' });
                        if (onClose) onClose();
                      }}
                      className="text-[10px] text-neutral-700 hover:text-black font-bold underline font-mono cursor-pointer"
                    >
                      Abrir página no site ↗
                    </button>
                  </label>
                  <textarea
                    rows={4}
                    value={brand.termsText || ''}
                    onChange={(e) => updateBrand({ termsText: e.target.value })}
                    placeholder="Escreva os termos de uso, condições gerais e responsabilidades..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-2xl p-3.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-sans leading-relaxed"
                  />
                </div>

                {/* Campo: Política de Privacidade */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-900 uppercase font-mono flex items-center justify-between">
                    <span>🛡️ Página: Política de Privacidade (/privacidade)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage({ type: 'privacidade' });
                        if (onClose) onClose();
                      }}
                      className="text-[10px] text-neutral-700 hover:text-black font-bold underline font-mono cursor-pointer"
                    >
                      Abrir página no site ↗
                    </button>
                  </label>
                  <textarea
                    rows={4}
                    value={brand.privacyText || ''}
                    onChange={(e) => updateBrand({ privacyText: e.target.value })}
                    placeholder="Escreva as diretrizes de privacidade, segurança de dados e armazenamento local..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-2xl p-3.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-sans leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Edição da Página de Contato (/contato) */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-[#ebbf01]" />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 font-heading">
                      Edição da Página de Contato (/contato)
                    </h4>
                    <p className="text-xs text-neutral-600">
                      Configure as informações de atendimento, e-mail, WhatsApp e textos exibidos na página oficial de contato.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage({ type: 'contato' });
                    if (onClose) onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-[#ebbf01] text-xs font-bold font-mono hover:bg-black transition-colors cursor-pointer shrink-0"
                >
                  Abrir Página de Contato ↗
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-900 uppercase font-mono">
                    Título da Página
                  </label>
                  <input
                    type="text"
                    value={brand.contactTitle || ''}
                    onChange={(e) => updateBrand({ contactTitle: e.target.value })}
                    placeholder="Ex: Fale Conosco & Atendimento Direct"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-900 uppercase font-mono">
                    WhatsApp de Atendimento
                  </label>
                  <input
                    type="text"
                    value={brand.contactWhatsapp || ''}
                    onChange={(e) => updateBrand({ contactWhatsapp: e.target.value })}
                    placeholder="Ex: 5511999999999"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-mono font-medium focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-900 uppercase font-mono">
                    E-mail Oficial de Contato & Notificações
                  </label>
                  <input
                    type="email"
                    value={brand.links?.email || 'contact@7f.com.br'}
                    onChange={(e) => updateBrand({ links: { ...brand.links, email: e.target.value } })}
                    placeholder="contact@7f.com.br"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-mono font-bold focus:outline-none focus:border-black"
                  />
                  <span className="text-[11px] text-neutral-500 block">
                    Endereço de e-mail oficial exibido no site e utilizado para receber as mensagens enviadas pelos visitantes e novos membros.
                  </span>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-900 uppercase font-mono">
                    Subtítulo / Descrição Inicial
                  </label>
                  <input
                    type="text"
                    value={brand.contactDescription || ''}
                    onChange={(e) => updateBrand({ contactDescription: e.target.value })}
                    placeholder="Ex: Entre em contato para dúvidas, suporte com APKs e sugestões..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Subseção: Cards de Contato da Página (E-mail, Telegram, WhatsApp, etc.) */}
              <div className="pt-6 border-t border-neutral-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 font-heading flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#ebbf01]" />
                      <span>Cards de Canais de Contato</span>
                    </h4>
                    <p className="text-xs text-neutral-500 font-medium">
                      Crie, edite e personalize a cor e os dados dos cards exibidos na página de contato (E-mail, WhatsApp, Telegram, etc.).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingContactCard({
                        id: `card-${Date.now()}`,
                        title: 'Novo Card de Contato',
                        subtitle: 'Atendimento',
                        description: 'Descrição do canal de atendimento...',
                        type: 'telegram',
                        value: 'https://t.me/...',
                        buttonText: 'Acessar ↗',
                        iconName: 'telegram',
                        colorScheme: 'brand',
                        active: true,
                      });
                      setIsCreatingContactCard(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Criar Card de Contato</span>
                  </button>
                </div>

                {/* Form de Edição/Criação do Card de Contato */}
                {editingContactCard && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-4 animate-in fade-in shadow-lg">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#ebbf01]/20 text-[#ebbf01] flex items-center justify-center font-bold">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">
                            {isCreatingContactCard ? 'Criar Novo Card de Contato' : 'Editar Card de Contato'}
                          </span>
                          <span className="text-[10px] text-neutral-400 block">Aparece na coluna esquerda da página /contato</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingContactCard(null);
                          setIsCreatingContactCard(false);
                        }}
                        className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-[#ebbf01] uppercase mb-1">
                          Título Principal *
                        </label>
                        <input
                          type="text"
                          value={editingContactCard.title}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, title: e.target.value })}
                          placeholder="Ex: Comunidade Telegram"
                          className="w-full bg-[#16161D] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#ebbf01]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-[#ebbf01] uppercase mb-1">
                          Subtítulo / Rótulo
                        </label>
                        <input
                          type="text"
                          value={editingContactCard.subtitle || ''}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, subtitle: e.target.value })}
                          placeholder="Ex: Grupo Oficial Telegram"
                          className="w-full bg-[#16161D] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#ebbf01]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-[#ebbf01] uppercase mb-1">
                          Tipo de Canal
                        </label>
                        <select
                          value={editingContactCard.type}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, type: e.target.value as any })}
                          className="w-full bg-[#16161D] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#ebbf01] cursor-pointer"
                        >
                          <option value="telegram">✈️ Telegram</option>
                          <option value="email">✉️ E-mail</option>
                          <option value="whatsapp">💬 WhatsApp</option>
                          <option value="phone">📞 Telefone</option>
                          <option value="address">📍 Endereço / Localização</option>
                          <option value="hours">🕒 Horário de Funcionamento</option>
                          <option value="link">🌐 Link Externo / Outro</option>
                          <option value="custom">✨ Personalizado</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-mono font-bold text-[#ebbf01] uppercase mb-1">
                          Valor / Contato / Link de Destino *
                        </label>
                        <input
                          type="text"
                          value={editingContactCard.value}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, value: e.target.value })}
                          placeholder="Ex: https://t.me/seugrupo ou suporte@empresa.com ou 5511999999999"
                          className="w-full bg-[#16161D] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#ebbf01] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-[#ebbf01] uppercase mb-1">
                          Texto do Botão (Ação)
                        </label>
                        <input
                          type="text"
                          value={editingContactCard.buttonText || ''}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, buttonText: e.target.value })}
                          placeholder="Ex: Entrar ↗ ou Enviar E-mail"
                          className="w-full bg-[#16161D] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#ebbf01]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-[#ebbf01] uppercase mb-1">
                          Cor do Card (Destaque)
                        </label>
                        <select
                          value={editingContactCard.colorScheme || 'brand'}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, colorScheme: e.target.value as any })}
                          className="w-full bg-[#16161D] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#ebbf01] cursor-pointer font-mono"
                        >
                          <option value="brand">🌟 Cor do Site ALX (Destaque Dourado #ebbf01)</option>
                          <option value="sky">🔵 Azul Telegram (Sky Blue)</option>
                          <option value="emerald">🟢 Verde WhatsApp (Emerald)</option>
                          <option value="amber">🟡 Amarelo Alerta (Amber)</option>
                          <option value="purple">🟣 Roxo (Purple)</option>
                          <option value="red">🔴 Vermelho (Red)</option>
                          <option value="indigo">🔵 Azul Escuro (Indigo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-[#ebbf01] uppercase mb-1">
                          Ícone
                        </label>
                        <select
                          value={editingContactCard.iconName || editingContactCard.type}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, iconName: e.target.value })}
                          className="w-full bg-[#16161D] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#ebbf01] cursor-pointer"
                        >
                          <option value="telegram">Telegram / Avião (Send)</option>
                          <option value="mail">E-mail (Mail)</option>
                          <option value="whatsapp">WhatsApp / Telefone (Phone)</option>
                          <option value="mappin">Localização (MapPin)</option>
                          <option value="clock">Relógio (Clock)</option>
                          <option value="globe">Globo / Link (Globe)</option>
                          <option value="sparkles">Estrelas / Destaque (Sparkles)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-mono font-bold text-[#ebbf01] uppercase mb-1">
                          Descrição Curta do Card
                        </label>
                        <input
                          type="text"
                          value={editingContactCard.description || ''}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, description: e.target.value })}
                          placeholder="Ex: Participe da comunidade com milhares de membros..."
                          className="w-full bg-[#16161D] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#ebbf01]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-300">
                        <input
                          type="checkbox"
                          checked={editingContactCard.active !== false}
                          onChange={(e) => setEditingContactCard({ ...editingContactCard, active: e.target.checked })}
                          className="rounded text-[#ebbf01] focus:ring-[#ebbf01]"
                        />
                        <span>Exibir card na página de contato</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingContactCard(null);
                            setIsCreatingContactCard(false);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingContactCard.title.trim()) {
                              alert('Por favor, informe o título do card.');
                              return;
                            }
                            const currentCards = brand.contactCards || [
                              {
                                id: 'card-email',
                                title: 'E-mail de Suporte',
                                subtitle: 'Atendimento Oficial',
                                description: 'Atendimento por e-mail para dúvidas sobre assinaturas VIP e parcerias.',
                                type: 'email',
                                value: brand.links?.email || 'contact@7f.com.br',
                                buttonText: 'Enviar E-mail',
                                iconName: 'mail',
                                colorScheme: 'brand',
                                active: true,
                              },
                              {
                                id: 'card-whatsapp',
                                title: 'WhatsApp / Telefone',
                                subtitle: 'Atendimento Direto',
                                description: 'Mensagens diretas de atendimento via WhatsApp.',
                                type: 'whatsapp',
                                value: brand.contactWhatsapp || '5511999999999',
                                buttonText: 'Chamar no WhatsApp 💬',
                                iconName: 'whatsapp',
                                colorScheme: 'brand',
                                active: true,
                              },
                              {
                                id: 'card-telegram',
                                title: 'Comunidade Telegram',
                                subtitle: 'Grupo Oficial Telegram',
                                description: 'Participe do grupo com milhares de proprietários.',
                                type: 'telegram',
                                value: brand.links?.telegram || 'https://t.me/ALX_Comunidade',
                                buttonText: 'Entrar ↗',
                                iconName: 'telegram',
                                colorScheme: 'brand',
                                active: true,
                              },
                            ];

                            const exists = currentCards.some(c => c.id === editingContactCard.id);
                            let updated: ContactCardItem[];
                            if (exists) {
                              updated = currentCards.map(c => c.id === editingContactCard.id ? editingContactCard : c);
                            } else {
                              updated = [...currentCards, editingContactCard];
                            }

                            updateBrand({ contactCards: updated });
                            triggerSuccess('Card de contato salvo com sucesso!');
                            setEditingContactCard(null);
                            setIsCreatingContactCard(false);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-[#ebbf01] text-black font-extrabold text-xs hover:bg-[#f5cc14] transition-all cursor-pointer shadow-xs"
                        >
                          Salvar Card
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista e Reordenação de Cards de Contato Existentes */}
                <div className="space-y-2 pt-2">
                  {(brand.contactCards || [
                    {
                      id: 'card-email',
                      title: 'E-mail de Suporte',
                      subtitle: 'Atendimento Oficial',
                      description: 'Atendimento por e-mail para dúvidas sobre assinaturas VIP e parcerias.',
                      type: 'email',
                      value: brand.links?.email || 'contact@7f.com.br',
                      buttonText: 'Enviar E-mail',
                      iconName: 'mail',
                      colorScheme: 'brand',
                      active: true,
                    },
                    {
                      id: 'card-whatsapp',
                      title: 'WhatsApp / Telefone',
                      subtitle: 'Atendimento Direto',
                      description: 'Mensagens diretas de atendimento via WhatsApp.',
                      type: 'whatsapp',
                      value: brand.contactWhatsapp || '5511999999999',
                      buttonText: 'Chamar no WhatsApp 💬',
                      iconName: 'whatsapp',
                      colorScheme: 'brand',
                      active: true,
                    },
                    {
                      id: 'card-telegram',
                      title: 'Comunidade Telegram',
                      subtitle: 'Grupo Oficial Telegram',
                      description: 'Participe do grupo com milhares de proprietários.',
                      type: 'telegram',
                      value: brand.links?.telegram || 'https://t.me/ALX_Comunidade',
                      buttonText: 'Entrar ↗',
                      iconName: 'telegram',
                      colorScheme: 'brand',
                      active: true,
                    },
                  ]).map((card, idx, arr) => {
                    const moveCard = (dir: 'up' | 'down') => {
                      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
                      if (targetIdx < 0 || targetIdx >= arr.length) return;
                      const newArr = [...arr];
                      const temp = newArr[idx];
                      newArr[idx] = newArr[targetIdx];
                      newArr[targetIdx] = temp;
                      updateBrand({ contactCards: newArr });
                    };

                    const toggleCardActive = () => {
                      const newArr = arr.map(c => c.id === card.id ? { ...c, active: c.active === false } : c);
                      updateBrand({ contactCards: newArr });
                    };

                    const deleteCard = () => {
                      const newArr = arr.filter(c => c.id !== card.id);
                      updateBrand({ contactCards: newArr });
                      triggerSuccess('Card de contato removido!');
                    };

                    return (
                      <div key={card.id} className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        card.active !== false ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-100 border-neutral-200 opacity-50'
                      }`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-[#ebbf01] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-neutral-900">{card.title}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800 font-bold uppercase">
                                {card.type}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                card.colorScheme === 'brand' || !card.colorScheme
                                  ? 'bg-[#ebbf01] text-black'
                                  : card.colorScheme === 'emerald'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : card.colorScheme === 'sky'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-neutral-200 text-neutral-800'
                              }`}>
                                {card.colorScheme === 'brand' || !card.colorScheme ? 'Cor do Site (#ebbf01)' : card.colorScheme}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-600 font-mono block truncate mt-0.5">
                              {card.value}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* Toggle Visível */}
                          <button
                            type="button"
                            onClick={toggleCardActive}
                            className={`p-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer ${
                              card.active !== false ? 'text-emerald-700 bg-emerald-100' : 'text-neutral-500 bg-neutral-200'
                            }`}
                            title={card.active !== false ? 'Card ativo (clique para ocultar)' : 'Card oculto (clique para exibir)'}
                          >
                            {card.active !== false ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>

                          {/* Move Up / Down */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveCard('up')}
                            className="p-1.5 rounded-xl bg-neutral-200 hover:bg-[#ebbf01] hover:text-black transition-colors cursor-pointer text-neutral-800 disabled:opacity-20"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => moveCard('down')}
                            className="p-1.5 rounded-xl bg-neutral-200 hover:bg-[#ebbf01] hover:text-black transition-colors cursor-pointer text-neutral-800 disabled:opacity-20"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingContactCard(false);
                              setEditingContactCard(card);
                            }}
                            className="p-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 transition-colors cursor-pointer"
                            title="Editar este card"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={deleteCard}
                            className="p-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 transition-colors cursor-pointer"
                            title="Excluir este card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* List of Custom Page Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customPageLinks.map((link) => (
                <div
                  key={link.id}
                  className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[#ebbf01]">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900">{link.title}</h4>
                          <span className="text-[10px] text-neutral-500 font-mono">{link.category || 'Geral'}</span>
                        </div>
                      </div>
                      {link.badge && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold">
                          {link.badge}
                        </span>
                      )}
                    </div>

                    {link.description && (
                      <p className="text-xs text-neutral-600 line-clamp-2">
                        {link.description}
                      </p>
                    )}

                    <div className="pt-1">
                      <div className="text-[11px] font-mono text-neutral-500 bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-200 truncate flex items-center gap-1.5">
                        <span className="text-[#ebbf01] font-bold">URL:</span>
                        <span className="truncate">{link.url}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5">
                      {link.isExternal && (
                        <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                          Externo
                        </span>
                      )}
                      {link.openInNewTab && (
                        <span className="text-[9px] font-mono bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200">
                          Nova Aba
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={link.url}
                        target={link.openInNewTab ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Abrir e Testar Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          const cloned = duplicateCustomPageLink(link.id);
                          if (cloned) triggerSuccess(`Link/Página "${link.title}" duplicado!`);
                        }}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Duplicar link/página"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsCreatingPageLink(false);
                          setEditingPageLink(link);
                        }}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Editar link"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          deleteCustomPageLink(link.id);
                          triggerSuccess('Página/link removido com sucesso!');
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Excluir link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: GESTÃO DE MEMBROS VIP ================= */}
        {activeTab === 'vipMembers' && (
          <div className="space-y-6">
            
            {/* Header & Quick Action Buttons */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-black text-[#ebbf01] flex items-center justify-center font-bold shadow-sm">
                    <Users className="w-5 h-5 text-[#ebbf01]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-900 font-heading">
                      Gestão Completa de Membros VIP
                    </h3>
                    <p className="text-xs text-neutral-600">
                      Controle planos, assinaturas, pagamentos via Pix e Mercado Pago, aprovações e importação por CSV.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowVipPaymentSettings(!showVipPaymentSettings)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-extrabold uppercase transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    showVipPaymentSettings
                      ? 'bg-black text-[#ebbf01] border-black shadow-md'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-neutral-300'
                  }`}
                  title="Configurar Chave PIX, Link do Mercado Pago e Preços dos Planos"
                >
                  <QrCode className="w-4 h-4 text-[#ebbf01]" />
                  <span>{showVipPaymentSettings ? 'Ocultar Config. PIX' : 'Configurar PIX & Pagamentos'}</span>
                </button>

                <button
                  onClick={handleExportVipMembersCsv}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  title="Exportar todos os membros VIP para planilha CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Membros (.CSV)</span>
                </button>

                <button
                  onClick={handleCopyVipEmails}
                  className="px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Copiar lista de todos os e-mails dos membros VIP"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Copiar E-mails</span>
                </button>

                <button
                  onClick={handleDownloadCsvModel}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900 font-bold text-xs uppercase transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  title="Baixar modelo de planilha CSV para preenchimento"
                >
                  <Download className="w-3.5 h-3.5 text-[#ebbf01]" />
                  <span>Modelo CSV</span>
                </button>

                <button
                  onClick={() => {
                    setCsvInputText('');
                    setParsedCsvMembers([]);
                    setShowCsvImportModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white font-extrabold text-xs uppercase hover:bg-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#ebbf01]" />
                  <span>Importar Planilha CSV</span>
                </button>

                <button
                  onClick={handleOpenAddVipMember}
                  className="px-5 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Membro</span>
                </button>
              </div>
            </div>

            {/* VIP PAYMENT & GATEWAY CONFIGURATION CARD (TOGGLEABLE) */}
            {showVipPaymentSettings && (
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black text-[#ebbf01] flex items-center justify-center font-bold shadow-xs">
                      <QrCode className="w-5 h-5 text-[#ebbf01]" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-neutral-900 font-heading">
                        Configurações de Pagamento da Área VIP (PIX & Mercado Pago)
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Defina a Chave PIX, os dados do recebedor, o link de assinatura recorrente e os valores cobrados.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVipPaymentSettings(false)}
                    className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveVipPaymentConfig} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* PIX SETTINGS */}
                    <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <div className="flex items-center gap-2 text-emerald-800 font-mono font-bold text-xs uppercase">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span>Dados do PIX Oficial (BR Code)</span>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-800">Chave PIX *</label>
                          <input
                            type="text"
                            required
                            value={pixKeyInput}
                            onChange={(e) => setPixKeyInput(e.target.value)}
                            placeholder="ex: seu-email@gmail.com ou CPF/Celular"
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-800">Tipo de Chave</label>
                            <select
                              value={pixKeyTypeInput}
                              onChange={(e) => setPixKeyTypeInput(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-xs cursor-pointer"
                            >
                              <option value="email">E-mail</option>
                              <option value="cpf">CPF</option>
                              <option value="cnpj">CNPJ</option>
                              <option value="phone">Celular</option>
                              <option value="random">Chave Aleatória (EVP)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-800">Valor do Pix Avulso (R$)</label>
                            <input
                              type="text"
                              value={pixSinglePriceInput}
                              onChange={(e) => setPixSinglePriceInput(e.target.value)}
                              placeholder="14,90"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-800">Nome do Titular</label>
                            <input
                              type="text"
                              value={pixReceiverNameInput}
                              onChange={(e) => setPixReceiverNameInput(e.target.value)}
                              placeholder="ex: ALX GARAGE"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-800">Cidade do Titular</label>
                            <input
                              type="text"
                              value={pixReceiverCityInput}
                              onChange={(e) => setPixReceiverCityInput(e.target.value)}
                              placeholder="ex: SAO PAULO"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MERCADO PAGO / RECURRENT SETTINGS */}
                    <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <div className="flex items-center gap-2 text-sky-800 font-mono font-bold text-xs uppercase">
                        <CreditCard className="w-4 h-4 text-sky-600" />
                        <span>Assinatura Mercado Pago / Recorrência</span>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-800">Link de Assinatura (Mercado Pago / Mercado Livre) *</label>
                          <input
                            type="url"
                            value={mercadoPagoSubUrlInput}
                            onChange={(e) => setMercadoPagoSubUrlInput(e.target.value)}
                            placeholder="https://www.mercadopago.com.br/subscriptions/checkout?..."
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-800">Valor da Assinatura Mensal (R$)</label>
                          <input
                            type="text"
                            value={monthlySubPriceInput}
                            onChange={(e) => setMonthlySubPriceInput(e.target.value)}
                            placeholder="14,90"
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-800">Texto de Aviso de Prazo de Aprovação</label>
                          <input
                            type="text"
                            value={approvalNoticeTextInput}
                            onChange={(e) => setApprovalNoticeTextInput(e.target.value)}
                            placeholder="A aprovação e liberação do seu acesso VIP pode demorar até 24 horas."
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-800">E-mail para Receber Alertas de Novos Cadastros VIP</label>
                          <input
                            type="email"
                            value={notificationEmailInput}
                            onChange={(e) => setNotificationEmailInput(e.target.value)}
                            placeholder="contact@7f.com.br"
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                          />
                          <span className="text-[11px] text-neutral-500">
                            Endereço que receberá o aviso sempre que um novo usuário solicitar adesão VIP.
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* LIVE SIMULATOR PREVIEW */}
                  <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getPixQrCodeUrl(
                          generatePixPayload({
                            key: pixKeyInput || 'contact@7f.com.br',
                            keyType: pixKeyTypeInput,
                            receiverName: pixReceiverNameInput || 'ALX GARAGE',
                            receiverCity: pixReceiverCityInput || 'SAO PAULO',
                            amount: pixSinglePriceInput || '14.90',
                          }),
                          120
                        )}
                        alt="Preview QR Code Pix"
                        className="w-20 h-20 bg-white p-1 rounded-xl shadow-xs shrink-0"
                      />
                      <div className="space-y-1 text-xs">
                        <span className="font-extrabold text-neutral-900 block font-heading">
                          Visualização do Pix Gerado em Tempo Real
                        </span>
                        <p className="text-neutral-600 text-[11px]">
                          Chave: <strong className="font-mono text-neutral-900">{pixKeyInput || 'N/I'}</strong> • Valor: <strong>R$ {pixSinglePriceInput || '14,90'}</strong>
                        </p>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          ✓ QR Code gerado de acordo com as normas do Banco Central (BR Code)
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Configurações</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* Metrics Overview Bar - 5 Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Card 1: Total Membros */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  Total de Membros VIP
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-neutral-900 font-heading">
                    {(vipMembers || []).length}
                  </span>
                  <Users className="w-5 h-5 text-neutral-400" />
                </div>
              </div>

              {/* Card 2: Aguardando Aprovação (NOVO) */}
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
                  Aguardando Aprovação
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-950 font-heading">
                    {(vipMembers || []).filter((m) => m.status === 'Aguardando Aprovação').length}
                  </span>
                  <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                </div>
              </div>

              {/* Card 3: Ativos */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                  Assinantes Ativos
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-950 font-heading">
                    {(vipMembers || []).filter((m) => m.status === 'Ativo').length}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              {/* Card 4: Expirando em Breve */}
              <div className="bg-orange-50 border border-orange-200 rounded-3xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold text-orange-700 uppercase tracking-wider block">
                  Expirando em Breve
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-orange-950 font-heading">
                    {(vipMembers || []).filter((m) => m.status === 'Expirando em Breve').length}
                  </span>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
              </div>

              {/* Card 5: Expirados / Inativos */}
              <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-700 uppercase tracking-wider block">
                  Expirados / Inativos
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-red-950 font-heading">
                    {(vipMembers || []).filter((m) => m.status === 'Expirado' || m.status === 'Inativo').length}
                  </span>
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vipSearchQuery}
                  onChange={(e) => setVipSearchQuery(e.target.value)}
                  placeholder="Buscar membro por Nome, E-mail ou WhatsApp..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'Aguardando Aprovação', 'Ativo', 'Expirando em Breve', 'Expirado', 'Inativo'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setVipStatusFilter(st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      vipStatusFilter === st
                        ? 'bg-neutral-900 text-white font-extrabold shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                    }`}
                  >
                    {st === 'all' ? 'Todos os Status' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* VIP Members Data Table */}
            <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-100/80 border-b border-neutral-200 text-neutral-700 font-mono font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 sm:px-6">Membro / Contato</th>
                      <th className="py-3.5 px-4">Plano / Assinatura</th>
                      <th className="py-3.5 px-4">Período & Validade</th>
                      <th className="py-3.5 px-4">Tempo Ativo</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Ações & Aprovação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-800">
                    {(() => {
                      const filtered = (vipMembers || []).filter((m) => {
                        const matchesSearch =
                          m.name.toLowerCase().includes(vipSearchQuery.toLowerCase()) ||
                          m.email.toLowerCase().includes(vipSearchQuery.toLowerCase()) ||
                          (m.phone || '').includes(vipSearchQuery);

                        const matchesStatus = vipStatusFilter === 'all' || m.status === vipStatusFilter;
                        return matchesSearch && matchesStatus;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-neutral-500">
                              <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                              <p className="font-bold text-sm text-neutral-800">Nenhum membro VIP encontrado</p>
                              <p className="text-xs text-neutral-500">Tente alterar os termos da busca ou adicionar um novo membro.</p>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((m) => (
                        <tr 
                          key={m.id} 
                          className={`transition-colors ${
                            m.status === 'Aguardando Aprovação' 
                              ? 'bg-amber-50/60 hover:bg-amber-50/90' 
                              : 'hover:bg-neutral-50/80'
                          }`}
                        >
                          <td className="py-4 px-4 sm:px-6">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-neutral-900 text-sm block">{m.name}</span>
                              <span className="text-neutral-500 font-mono text-[11px] block">{m.email}</span>
                              {m.phone && (
                                <span className="text-emerald-700 font-mono text-[11px] font-bold block">{m.phone}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-black text-[#ebbf01] font-mono text-[10px] font-extrabold uppercase">
                                {m.planType}
                              </span>
                              <span className="text-neutral-600 block text-[11px] font-semibold">
                                Plano: {m.period}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono text-[11px]">
                            <div className="space-y-0.5">
                              <div><span className="text-neutral-500">Início:</span> <strong>{m.startDate || 'N/I'}</strong></div>
                              <div><span className="text-neutral-500">Validade:</span> <strong className="text-neutral-900">{m.expirationDate || 'N/I'}</strong></div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-900 font-mono text-xs font-bold border border-neutral-200">
                              ⏱ {m.status === 'Aguardando Aprovação' ? 'Pendente' : calculateActiveDuration(m.startDate)}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {m.status === 'Aguardando Aprovação' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] animate-pulse shadow-xs">
                                <Clock className="w-3 h-3 text-amber-700" />
                                Aguardando Aprovação
                              </span>
                            ) : m.status === 'Ativo' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                Ativo
                              </span>
                            ) : m.status === 'Expirando em Breve' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-bold text-[11px] animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-orange-700" />
                                Expirando em Breve
                              </span>
                            ) : m.status === 'Expirado' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold text-[11px]">
                                <Clock className="w-3 h-3 text-red-700" />
                                Expirado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-300 font-bold text-[11px]">
                                Inativo
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* 1-CLICK APPROVE BUTTON FOR PENDING MEMBERS */}
                              {m.status === 'Aguardando Aprovação' && (
                                <button
                                  onClick={() => {
                                    approveVipMember(m.id);
                                    triggerSuccess(`Membro "${m.name}" aprovado e ativado por 30 dias!`);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20 cursor-pointer"
                                  title="Aprovar pagamento e ativar membro VIP no sistema por +30 dias"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Aprovar VIP</span>
                                </button>
                              )}

                              {/* Botão de Enviar E-mail de Reativação */}
                              <button
                                onClick={() => handleOpenReactivationModal(m)}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                                  m.status === 'Expirando em Breve' || m.status === 'Expirado'
                                    ? 'bg-[#ebbf01] hover:bg-[#f5cc14] text-black ring-2 ring-black/10'
                                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                                }`}
                                title="Enviar e-mail de reativação / lembrete de renovação"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">E-mail</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditVipMember(m)}
                                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer"
                                title="Editar membro"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  deleteVipMember(m.id);
                                  triggerSuccess(`Membro "${m.name}" removido com sucesso!`);
                                }}
                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                title="Excluir membro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= SEÇÃO: MURAL DE AVISOS & COMUNICADOS VIP ================= */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono font-black text-red-700 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                    <Megaphone className="w-3.5 h-3.5 text-red-600" />
                    <span>Card Vermelho Oficial • Área VIP</span>
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 font-heading">
                    Mural de Comunicados da Área VIP
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Escreva avisos, novidades ou alertas importantes. O card é exibido em destaque em vermelho na Área VIP e só pode ser editado aqui pelo administrador.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-2 cursor-pointer">
                    <span>Exibir no site:</span>
                    <input
                      type="checkbox"
                      checked={vipNoticeActiveInput}
                      onChange={(e) => setVipNoticeActiveInput(e.target.checked)}
                      className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <form onSubmit={handleSaveVipNotice} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                    Título do Comunicado *
                  </label>
                  <input
                    type="text"
                    required
                    value={vipNoticeTitleInput}
                    onChange={(e) => setVipNoticeTitleInput(e.target.value)}
                    placeholder="Ex: Atualização Importante de Firmwares & APKs"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                    Mensagem / Texto do Comunicado aos Membros *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={vipNoticeMessageInput}
                    onChange={(e) => setVipNoticeMessageInput(e.target.value)}
                    placeholder="Digite o texto explicativo ou avisos que os membros verão..."
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-neutral-500">
                    Data registrada: {brand.vipNoticeDate || 'Hoje'}
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Comunicado</span>
                  </button>
                </div>
              </form>
            </div>

            {/* ================= SEÇÃO: GRUPO VIP DO WHATSAPP ================= */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono font-black text-[#25D366] uppercase tracking-wider bg-[#25D366]/10 px-2.5 py-1 rounded-full border border-[#25D366]/20">
                    <SocialIcon platform="whatsapp" className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Comunidade Exclusiva</span>
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 font-heading">
                    Card de Convite para o Grupo de WhatsApp VIP
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Configure o link de convite, título e mensagem exibidos no card ao lado do mural de avisos na Área VIP.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveVipWhatsappGroup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                    Link de Convite do Grupo WhatsApp (ou link wa.me) *
                  </label>
                  <input
                    type="text"
                    value={vipWhatsappGroupUrlInput}
                    onChange={(e) => setVipWhatsappGroupUrlInput(e.target.value)}
                    placeholder="https://chat.whatsapp.com/ExemploDeConvite"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Cole o link de convite oficial do grupo (ex: https://chat.whatsapp.com/...). Se vazio, utilizará o WhatsApp padrão de atendimento.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                    Título do Card *
                  </label>
                  <input
                    type="text"
                    value={vipWhatsappGroupTitleInput}
                    onChange={(e) => setVipWhatsappGroupTitleInput(e.target.value)}
                    placeholder="Grupo VIP no WhatsApp"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                    Mensagem de Convite / Descrição *
                  </label>
                  <textarea
                    rows={3}
                    value={vipWhatsappGroupDescInput}
                    onChange={(e) => setVipWhatsappGroupDescInput(e.target.value)}
                    placeholder="Faça parte da comunidade exclusiva no WhatsApp!..."
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#25D366] text-black font-extrabold text-xs uppercase hover:bg-[#20ba59] transition-all flex items-center gap-2 shadow-md shadow-[#25D366]/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Grupo WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>

            {/* ================= SEÇÃO: CONTEÚDOS EXCLUSIVOS EXIBIDOS NA ÁREA VIP ================= */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-1 pb-4 border-b border-neutral-100">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono font-black text-neutral-900 uppercase tracking-wider bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                  <Crown className="w-3.5 h-3.5 text-[#ebbf01]" />
                  <span>Conteúdos & Cards Exclusivos</span>
                </div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  Como Gerenciar os Cards que Aparecem na Área VIP
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Todos os aplicativos, tutoriais, vídeos e wallpapers marcados como <strong className="text-neutral-900">"Exclusivo VIP"</strong> aparecem automaticamente na Área VIP com suas fotos de capa, títulos e botão de visualização.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Apps VIP */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-black text-[#FFDD00] flex items-center justify-center font-bold">
                        <Smartphone className="w-4 h-4 text-[#FFDD00]" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {apps.filter((a) => a.isVipExclusive || (a as any).isMembersOnly).length} VIP
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-neutral-900 font-heading">Aplicativos & APKs VIP</h4>
                    <p className="text-xs text-neutral-600">
                      Na aba <strong>Aplicativos</strong>, marque qualquer app como "Exclusivo VIP" para liberá-lo nesta área.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('apps')}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-900 transition-all text-center cursor-pointer"
                  >
                    Gerenciar Aplicativos →
                  </button>
                </div>

                {/* Tutoriais VIP */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-black text-[#FFDD00] flex items-center justify-center font-bold">
                        <BookOpen className="w-4 h-4 text-[#FFDD00]" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {tutorials.filter((t) => t.isMembersOnly || (t as any).isVipExclusive).length} VIP
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-neutral-900 font-heading">Tutoriais & Guias VIP</h4>
                    <p className="text-xs text-neutral-600">
                      Na aba <strong>Tutoriais</strong>, ative a opção "Exclusivo para Membros VIP" em qualquer guia técnico.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tutorials')}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-900 transition-all text-center cursor-pointer"
                  >
                    Gerenciar Tutoriais →
                  </button>
                </div>

                {/* Vídeos VIP */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-black text-[#ebbf01] flex items-center justify-center font-bold">
                        <Youtube className="w-4 h-4 text-red-500 fill-current" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {videos.filter((v) => (v as any).isMembersOnly || (v as any).isVipExclusive).length} VIP
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-neutral-900 font-heading">Vídeos & Aulas VIP</h4>
                    <p className="text-xs text-neutral-600">
                      Na aba <strong>Canal YouTube</strong>, edite ou crie vídeos e marque a opção "Conteúdo Exclusivo Área VIP".
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('youtube')}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-900 transition-all text-center cursor-pointer"
                  >
                    Gerenciar Vídeos →
                  </button>
                </div>

                {/* Wallpapers VIP */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-black text-[#ebbf01] flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4 text-[#ebbf01]" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {wallpapers.filter((w) => w.isMembersOnly || (w as any).isVipExclusive).length} VIP
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-neutral-900 font-heading">Wallpapers VIP</h4>
                    <p className="text-xs text-neutral-600">
                      Na aba <strong>Wallpapers</strong>, ative a opção "Exclusivo para Membros VIP" em qualquer wallpaper.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('wallpapers')}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-900 transition-all text-center cursor-pointer"
                  >
                    Gerenciar Wallpapers →
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ================= MODAL: EDIT/CREATE APP ================= */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-black text-neutral-900 font-heading">
                {isCreatingApp ? 'Novo Aplicativo ALX' : `Editar • ${editingApp.name}`}
              </h3>
              <button
                onClick={() => setEditingApp(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Cover Image Upload */}
              <ImageUploadField
                label="Foto de Capa do Aplicativo"
                value={editingApp.coverImage}
                onChange={(val) => setEditingApp({ ...editingApp, coverImage: val })}
                aspectRatio="video"
                presetOptions={[
                  { label: 'Cockpit BYD', url: '/imagens/apps/byd-cockpit.jpg' },
                  { label: 'Car Launcher', url: '/imagens/apps/car-launcher.jpg' },
                  { label: 'Media Player', url: '/imagens/apps/media-player.jpg' },
                ]}
              />

              {/* Main Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Custom URL Slug Field */}
                <div className="sm:col-span-2 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#ebbf01]" />
                      <span>Endereço URL Personalizado do App (/apps/slug)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const directUrl = `${window.location.origin}/apps/${editingApp.slug || editingApp.id}`;
                        navigator.clipboard.writeText(directUrl);
                        triggerSuccess('Link do app copiado para a área de transferência!');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-800 hover:text-black hover:underline cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#ebbf01]" />
                      <span>Copiar Link Completo</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono shadow-xs">
                    <span className="text-neutral-500 shrink-0 select-none">alx.7f.com.br/apps/</span>
                    <input
                      type="text"
                      value={editingApp.slug || ''}
                      onChange={(e) => {
                        const cleanSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                        setEditingApp({ ...editingApp, slug: cleanSlug });
                      }}
                      placeholder="nome-do-app-slug"
                      className="flex-1 font-bold text-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Visibilidade e Acesso do App */}
                <div className="sm:col-span-2">
                  <VisibilitySelector
                    value={editingApp.visibility}
                    onChange={(val) => {
                      setEditingApp({
                        ...editingApp,
                        visibility: val,
                        ...(val === 'public' ? { isVipExclusive: false, isMembersOnly: false, isFree: true } : {}),
                        ...(val === 'public_vip' ? { isVipExclusive: true, isMembersOnly: true, isFree: false, priceText: 'Exclusivo VIP' } : {}),
                        ...(val === 'unlisted' || val === 'link_only' ? { isVipExclusive: false, isMembersOnly: false } : {}),
                        ...(val === 'members_and_link' ? { isVipExclusive: true, isMembersOnly: true, isFree: false, priceText: 'Exclusivo VIP' } : {}),
                      });
                    }}
                    directUrl={`${window.location.origin}/apps/${editingApp.slug || editingApp.id}`}
                    itemTypeLabel="aplicativo"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Nome do Aplicativo</label>
                  <input
                    type="text"
                    value={editingApp.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const autoSlug = newName
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                      setEditingApp({
                        ...editingApp,
                        name: newName,
                        slug: isCreatingApp || !editingApp.slug ? autoSlug : editingApp.slug,
                      });
                    }}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Versão (ex: v2.4.1)</label>
                  <input
                    type="text"
                    value={editingApp.version}
                    onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <CategorySelect
                  label="Categoria"
                  value={editingApp.category || ''}
                  onChange={(val) => setEditingApp({ ...editingApp, category: val })}
                  existingCategories={Array.from(new Set(apps.map(a => a.category).filter(Boolean)))}
                  placeholder="Selecione ou crie uma categoria de app..."
                  helperText="Escolha uma categoria existente ou crie uma nova."
                />

                {/* Classificação, Opções e Texto de Preço / Licença */}
                <div className="sm:col-span-2 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#ebbf01]" />
                      <span>Classificação & Texto de Preço / Licença</span>
                    </label>
                    <span className="text-[11px] font-mono font-bold text-red-600">
                      * OBRIGATÓRIO (NÃO PODE FICAR EM BRANCO)
                    </span>
                  </div>

                  {/* Opções Clicáveis acima do Campo de Texto */}
                  <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingApp({
                          ...editingApp,
                          isFree: true,
                          isVipExclusive: false,
                          priceText: 'Gratuito',
                        });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        editingApp.isFree && !editingApp.isVipExclusive && editingApp.priceText === 'Gratuito'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aplicativo Gratuito ("Gratuito")</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingApp({
                          ...editingApp,
                          isVipExclusive: true,
                          isFree: false,
                          priceText: 'Exclusivo VIP',
                        });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        editingApp.isVipExclusive && editingApp.priceText === 'Exclusivo VIP'
                          ? 'bg-[#ebbf01] text-black font-extrabold shadow-md'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Exclusivo VIP ("Exclusivo VIP")</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingApp({
                          ...editingApp,
                          showInIptv: !editingApp.showInIptv,
                        });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        editingApp.showInIptv
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>{editingApp.showInIptv ? '✓ Exibindo na Página IPTV' : '+ Exibir na Página IPTV'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (editingApp.priceText === 'Gratuito' || editingApp.priceText === 'Exclusivo VIP') {
                          setEditingApp({
                            ...editingApp,
                            priceText: '',
                          });
                        }
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:text-black hover:bg-neutral-200/60 transition-colors cursor-pointer"
                    >
                      <span>Personalizado / Digitar Valor</span>
                    </button>
                  </div>

                  {/* Campo de Texto do Preço */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-neutral-800 font-mono font-bold uppercase tracking-wider block">
                      Texto Exibido no Card e na Página do App
                    </label>
                    <input
                      type="text"
                      value={editingApp.priceText || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingApp({
                          ...editingApp,
                          priceText: val,
                          isFree: val.toLowerCase().includes('gratuito'),
                          isVipExclusive: val.toLowerCase().includes('vip') || val.toLowerCase().includes('exclusivo'),
                        });
                      }}
                      placeholder="Digite 'Gratuito', 'Exclusivo VIP', 'R$ 29,90' ou licença..."
                      className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-bold focus:outline-none shadow-xs ${
                        !editingApp.priceText || !editingApp.priceText.trim()
                          ? 'border-red-500 bg-red-50/40 focus:border-red-600'
                          : 'border-neutral-300 focus:border-black'
                      }`}
                    />

                    {(!editingApp.priceText || !editingApp.priceText.trim()) && (
                      <div className="text-[11px] text-red-600 font-bold flex items-center gap-1.5 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Atenção: O texto de preço/licença não pode ser deixado em branco! Clique nas opções acima para preencher automaticamente ou digite o valor.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <FileUploadField
                    label="Download do Aplicativo (GitHub Releases até 2GB, Servidor ou Link Externo)"
                    value={editingApp.downloadUrl || ''}
                    currentAssetId={editingApp.githubAssetId}
                    currentStorageType={editingApp.storageType}
                    onChange={(newValue, meta) => {
                      setEditingApp({
                        ...editingApp,
                        downloadUrl: newValue,
                        storageType: meta?.storageType || editingApp.storageType,
                        githubAssetId: meta?.assetId !== undefined ? meta.assetId : editingApp.githubAssetId,
                      });
                    }}
                    helperText="Escolha entre fazer upload para o GitHub Releases (até 2GB por arquivo), Servidor Local ou colar link externo."
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Descrição Completa</label>
                  <textarea
                    rows={4}
                    value={editingApp.fullDescription || editingApp.description}
                    onChange={(e) => setEditingApp({ ...editingApp, fullDescription: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const appToSave: ALXApp = {
                    ...editingApp,
                    name: editingApp.name?.trim() || 'Novo Aplicativo',
                    priceText: editingApp.priceText?.trim() || 'Grátis',
                  };
                  if (isCreatingApp) {
                    addApp(appToSave);
                    triggerSuccess('Aplicativo cadastrado com sucesso!');
                  } else {
                    updateApp(editingApp.id, appToSave);
                    triggerSuccess('Aplicativo atualizado com sucesso!');
                  }
                  setEditingApp(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Aplicativo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE NEWS ================= */}
      {editingNews && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-black text-neutral-900 font-heading">
                {isCreatingNews ? 'Publicar Notícia' : `Editar • ${editingNews.title}`}
              </h3>
              <button
                onClick={() => setEditingNews(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Image Upload */}
              <ImageUploadField
                label="Imagem Principal da Matéria"
                value={editingNews.imageUrl}
                onChange={(val) => setEditingNews({ ...editingNews, imageUrl: val })}
                aspectRatio="video"
                presetOptions={[
                  { label: 'Notícia 1 (Baterias)', url: '/imagens/noticias/noticia-1.jpg' },
                  { label: 'Notícia 2 (Multimídia)', url: '/imagens/noticias/noticia-2.jpg' },
                  { label: 'Notícia 3 (Eletropostos)', url: '/imagens/noticias/noticia-3.jpg' },
                  { label: 'Notícia 4 (Telemetria)', url: '/imagens/noticias/noticia-4.jpg' },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Título da Notícia</label>
                  <input
                    type="text"
                    value={editingNews.title}
                    onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Categoria</label>
                  <select
                    value={editingNews.category}
                    onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value as any })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs"
                  >
                    <option value="Carros Elétricos">Carros Elétricos</option>
                    <option value="Multimídia">Multimídia</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Atualizações">Atualizações</option>
                    <option value="Dicas">Dicas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Autor</label>
                  <input
                    type="text"
                    value={editingNews.author}
                    onChange={(e) => setEditingNews({ ...editingNews, author: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                {/* Exclusivo para Membros VIP */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#ebbf01]" />
                      <span className="text-xs font-mono font-bold text-neutral-900 uppercase">
                        Exclusivo para Membros VIP
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-medium">
                      Quando ativado, apenas membros com login ativo na Área VIP poderão acessar e ler este artigo completo.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(editingNews.isMembersOnly || editingNews.isVipExclusive)}
                      onChange={(e) => setEditingNews({
                        ...editingNews,
                        isMembersOnly: e.target.checked,
                        isVipExclusive: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebbf01]"></div>
                  </label>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Resumo (Card Inicial)</label>
                  <textarea
                    rows={2}
                    value={editingNews.summary}
                    onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Conteúdo Completo do Artigo</label>
                  <textarea
                    rows={6}
                    value={editingNews.content}
                    onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingNews(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isCreatingNews) {
                    addNews(editingNews);
                    triggerSuccess('Notícia publicada com sucesso!');
                  } else {
                    updateNews(editingNews.id, editingNews);
                    triggerSuccess('Notícia atualizada com sucesso!');
                  }
                  setEditingNews(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Notícia</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE PRODUCT ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-black text-neutral-900 font-heading">
                {isCreatingProduct ? 'Novo Produto' : `Editar • ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Product Photo Upload */}
              <ImageUploadField
                label="Foto do Produto"
                value={editingProduct.imageUrl}
                onChange={(val) => setEditingProduct({ ...editingProduct, imageUrl: val })}
                aspectRatio="square"
                presetOptions={[
                  { label: 'Dongle Sem Fio', url: '/imagens/produtos/dongle-v2.jpg' },
                  { label: 'Scanner OBD2', url: '/imagens/produtos/modulo-autonomo.jpg' },
                  { label: 'Suporte Magnético', url: '/imagens/produtos/painel-lcd.jpg' },
                  { label: 'Cabo Splitter', url: '/imagens/produtos/kit-ferramentas.jpg' },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Nome do Produto</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Preço Atual (ex: R$ 199,00)</label>
                  <input
                    type="text"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Preço De / Original (opcional)</label>
                  <input
                    type="text"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <CategorySelect
                  label="Categoria"
                  value={editingProduct.category || ''}
                  onChange={(val) => setEditingProduct({ ...editingProduct, category: val })}
                  existingCategories={Array.from(new Set(products.map(p => p.category).filter(Boolean)))}
                  placeholder="Selecione ou crie uma categoria..."
                  helperText="Escolha uma categoria existente ou crie uma nova."
                />

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Badge (ex: Mais Vendido)</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Link de Compra / Checkout</label>
                  <input
                    type="text"
                    value={editingProduct.buyUrl}
                    onChange={(e) => setEditingProduct({ ...editingProduct, buyUrl: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Descrição Resumida</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Descrição Detalhada</label>
                  <textarea
                    rows={4}
                    value={editingProduct.fullDescription}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isCreatingProduct) {
                    addProduct(editingProduct);
                    triggerSuccess('Produto cadastrado com sucesso!');
                  } else {
                    updateProduct(editingProduct.id, editingProduct);
                    triggerSuccess('Produto atualizado com sucesso!');
                  }
                  setEditingProduct(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Produto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE EV MODEL ================= */}
      {editingModel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  {isCreatingModel ? 'Novo Modelo EV' : `Editar • ${editingModel.name}`}
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Parâmetros técnicos para o cálculo de autonomia e recarga
                </p>
              </div>
              <button
                onClick={() => setEditingModel(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Nome do Carro</label>
                  <input
                    type="text"
                    value={editingModel.name}
                    onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Badge / Versão</label>
                  <input
                    type="text"
                    value={editingModel.badge}
                    onChange={(e) => setEditingModel({ ...editingModel, badge: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Capacidade da Bateria (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingModel.batteryCapacityKwh}
                    onChange={(e) => setEditingModel({ ...editingModel, batteryCapacityKwh: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Autonomia Inmetro (km)</label>
                  <input
                    type="number"
                    value={editingModel.inmetroRangeKm}
                    onChange={(e) => setEditingModel({ ...editingModel, inmetroRangeKm: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Carga Rápida DC Máxima (kW)</label>
                  <input
                    type="number"
                    value={editingModel.maxDcChargingKw}
                    onChange={(e) => setEditingModel({ ...editingModel, maxDcChargingKw: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Consumo Base (kWh/100km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingModel.efficiencyKwh100km}
                    onChange={(e) => setEditingModel({ ...editingModel, efficiencyKwh100km: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingModel(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isCreatingModel) {
                    addEvModel(editingModel);
                    triggerSuccess('Modelo cadastrado com sucesso!');
                  } else {
                    updateEvModel(editingModel.id, editingModel);
                    triggerSuccess('Modelo atualizado com sucesso!');
                  }
                  setEditingModel(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Modelo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE YOUTUBE VIDEO ================= */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-black text-neutral-900 font-heading">
                {isCreatingVideo ? 'Adicionar Vídeo Manual' : `Editar Vídeo • ${editingVideo.title}`}
              </h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Título do Vídeo</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">ID do Vídeo no YouTube (ou Link)</label>
                  <input
                    type="text"
                    value={editingVideo.youtubeId}
                    onChange={(e) => {
                      const val = e.target.value;
                      let id = val;
                      if (val.includes('v=')) {
                        id = val.split('v=')[1]?.split('&')[0] || val;
                      } else if (val.includes('youtu.be/')) {
                        id = val.split('youtu.be/')[1]?.split('?')[0] || val;
                      }
                      setEditingVideo({
                        ...editingVideo,
                        youtubeId: id,
                        youtubeUrl: `https://youtube.com/watch?v=${id}`,
                      });
                    }}
                    placeholder="dQw4w9WgXcQ"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black font-mono shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Categoria</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs"
                  >
                    <option value="Multimídia & Som">Multimídia & Som</option>
                    <option value="Atualizações & OTA">Atualizações & OTA</option>
                    <option value="Análise & Teste">Análise & Teste</option>
                    <option value="Tutoriais">Tutoriais</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Duração (ex: 12:45)</label>
                  <input
                    type="text"
                    value={editingVideo.duration}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Data de Publicação</label>
                  <input
                    type="text"
                    value={editingVideo.date}
                    onChange={(e) => setEditingVideo({ ...editingVideo, date: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Descrição do Vídeo</label>
                <textarea
                  rows={3}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                />
              </div>

              {/* Opção Exclusivo VIP */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#ebbf01]" />
                    <span className="text-xs font-black text-neutral-900 font-heading">Conteúdo Exclusivo Área VIP</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Marque esta opção para disponibilizar este vídeo como aula ou conteúdo exclusivo para membros na Área VIP.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(editingVideo.isMembersOnly || editingVideo.isVipExclusive)}
                    onChange={(e) => setEditingVideo({
                      ...editingVideo,
                      isMembersOnly: e.target.checked,
                      isVipExclusive: e.target.checked,
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebbf01]"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isCreatingVideo) {
                    addVideo(editingVideo);
                    triggerSuccess('Vídeo adicionado com sucesso!');
                  } else {
                    updateVideo(editingVideo.id, editingVideo);
                    triggerSuccess('Vídeo atualizado com sucesso!');
                  }
                  setEditingVideo(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Vídeo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE OTA ================= */}
      {editingOta && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-black text-neutral-900 font-heading">
                {isCreatingOta ? 'Cadastrar Novo Pacote OTA' : `Editar OTA • ${editingOta.version}`}
              </h3>
              <button
                onClick={() => setEditingOta(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* OTA Cover Image Upload */}
              <ImageUploadField
                label="Foto de Capa do Arquivo OTA"
                value={editingOta.imageUrl || ''}
                onChange={(val) => setEditingOta({ ...editingOta, imageUrl: val })}
                aspectRatio="video"
                presetOptions={[
                  { label: 'Multimídia DiLink', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop' },
                  { label: 'Cockpit Digital', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop' },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Título da Atualização</label>
                  <input
                    type="text"
                    value={editingOta.title || ''}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setEditingOta(prev => {
                        if (!prev) return null;
                        const shouldUpdateSlug = isCreatingOta && (!prev.slug || prev.slug.startsWith('ota-nova-versao'));
                        const autoSlug = shouldUpdateSlug
                          ? newTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                          : prev.slug;
                        return { ...prev, title: newTitle, slug: autoSlug };
                      });
                    }}
                    placeholder="ex: Atualização Oficial DiLink OTA 32"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                {/* Slug / Link da Publicação Editável e Automático */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-[#ebbf01]" />
                      <span>Link da Publicação (Slug Automático e Editável)</span>
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Link individual para abrir e compartilhar esta OTA
                    </span>
                  </div>
                  <div className="flex items-center rounded-xl bg-neutral-50 border border-neutral-300 focus-within:border-black focus-within:bg-white overflow-hidden shadow-xs">
                    <span className="px-3 py-2 text-xs font-mono text-neutral-500 bg-neutral-100 border-r border-neutral-300 select-none">
                      /ota/
                    </span>
                    <input
                      type="text"
                      value={editingOta.slug || ''}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                        setEditingOta({ ...editingOta, slug: val });
                      }}
                      placeholder="ex: ota-32 ou atualizacao-byd-ota-32"
                      className="flex-1 bg-transparent px-3 py-2.5 text-xs text-neutral-900 font-mono font-bold placeholder:text-neutral-400 focus:outline-none"
                    />
                    {editingOta.slug && (
                      <button
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== 'undefined' ? window.location.origin : '';
                          navigator.clipboard.writeText(`${origin}/ota/${editingOta.slug}`);
                          triggerSuccess('Link copiado!');
                        }}
                        className="px-3 py-1.5 mr-2 rounded-lg bg-white hover:bg-neutral-200 border border-neutral-300 text-[10px] font-mono font-bold text-neutral-800 transition-colors cursor-pointer"
                      >
                        Copiar Link
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Ao salvar, o link <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800 font-bold">/ota/{editingOta.slug || (editingOta.version ? editingOta.version.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'slug')}</code> abrirá diretamente esta publicação para os visitantes.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Versão do Software (ex: OTA 31, OTA 32)</label>
                  <input
                    type="text"
                    value={editingOta.version}
                    onChange={(e) => setEditingOta({ ...editingOta, version: e.target.value })}
                    placeholder="ex: OTA 31 ou OTA 32"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Versão do MCU (ex: MCU-2.1.0)</label>
                  <input
                    type="text"
                    value={editingOta.mcu || ''}
                    onChange={(e) => setEditingOta({ ...editingOta, mcu: e.target.value })}
                    placeholder="MCU-1.0.0"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                {/* Seleção e Adição de Veículos */}
                <div className="sm:col-span-2 space-y-2.5">
                  {(() => {
                    const getNormModelKey = (name: string) => name.toLowerCase().replace(/^byd\s+/i, '').trim();

                    const currentList = (editingOta.applicableCars || editingOta.modelTarget || '')
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);

                    // Build deduplicated car models map, giving absolute priority to currentList names (e.g. "Tan", "Han")
                    const carMap = new Map<string, string>();

                    // 1. Current list cars first (exact names as saved in this OTA, e.g. "Tan", "Han")
                    currentList.forEach(c => {
                      const k = getNormModelKey(c);
                      if (k && !carMap.has(k)) {
                        carMap.set(k, c);
                      }
                    });

                    // 2. Additional candidate cars
                    const candidateCars = [
                      ...extraOtaCarOptions,
                      ...otaUpdates.flatMap(o => (o.applicableCars || o.modelTarget || '').split(/[,;/]+/).map(s => s.trim()).filter(Boolean)),
                      'Dolphin GS',
                      'Dolphin Plus',
                      'Dolphin Mini',
                      'Seal',
                      'Song Plus',
                      'Yuan Plus',
                      'Tan',
                      'Han',
                      'King',
                      'Shark',
                      ...evModels.map(m => m.name.trim())
                    ];

                    candidateCars.forEach(c => {
                      const k = getNormModelKey(c);
                      if (!k) return;
                      // Skip generic catch-all strings
                      if (k.includes('todos os modelo') || k.includes('todos os veiculo')) return;
                      // Skip if deleted, UNLESS it is currently in currentList
                      const isInCurrentList = currentList.some(cl => getNormModelKey(cl) === k);
                      if (!isInCurrentList && deletedCarOptions.some(dc => getNormModelKey(dc) === k || dc.toLowerCase() === c.toLowerCase())) {
                        return;
                      }
                      if (!carMap.has(k)) {
                        carMap.set(k, c);
                      }
                    });

                    const allCars = Array.from(carMap.values());

                    return (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-neutral-700" />
                            <span>Carros que usarão o arquivo</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-neutral-500">
                              {currentList.length} selecionado(s)
                            </span>
                            <span className="text-neutral-300">·</span>
                            <button
                              type="button"
                              onClick={() => {
                                const joined = allCars.join(', ');
                                setEditingOta({ ...editingOta, applicableCars: joined, modelTarget: joined });
                              }}
                              className="text-[11px] font-bold text-neutral-800 hover:text-black hover:underline cursor-pointer transition-colors"
                            >
                              Marcar todos
                            </button>
                            <span className="text-neutral-300">·</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOta({ ...editingOta, applicableCars: '', modelTarget: '' });
                              }}
                              className="text-[11px] font-medium text-neutral-500 hover:text-red-600 hover:underline cursor-pointer transition-colors"
                            >
                              Desmarcar todos
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                          <p className="text-[11px] text-neutral-500 font-medium">
                            Clique nos veículos para marcar ou desmarcar para este pacote OTA:
                          </p>

                          {/* Chips selecionáveis com opção de editar e excluir */}
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                            {allCars.map((car) => {
                              const isSelected = currentList.some(c => c.toLowerCase() === car.toLowerCase() || getNormModelKey(c) === getNormModelKey(car));
                              const isEditingThisCar = editingCarName === car;

                          if (isEditingThisCar) {
                            return (
                              <div key={car} className="inline-flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-xl px-2 py-1 shadow-xs">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingCarNameInput}
                                  onChange={(e) => setEditingCarNameInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const newName = editingCarNameInput.trim();
                                      if (newName && newName !== car) {
                                        setExtraOtaCarOptions(prev => {
                                          const updated = prev.map(c => c.toLowerCase() === car.toLowerCase() ? newName : c);
                                          if (!updated.includes(newName)) updated.push(newName);
                                          localStorage.setItem('alx_extra_ota_cars', JSON.stringify(updated));
                                          return updated;
                                        });
                                        setDeletedCarOptions(prev => {
                                          const updated = [...prev, car];
                                          localStorage.setItem('alx_deleted_ota_cars', JSON.stringify(updated));
                                          return updated;
                                        });
                                        const updatedList = currentList.map(c => c.toLowerCase() === car.toLowerCase() ? newName : c);
                                        const joined = updatedList.join(', ');
                                        setEditingOta({ ...editingOta, applicableCars: joined, modelTarget: joined });
                                      }
                                      setEditingCarName(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCarName(null);
                                    }
                                  }}
                                  className="w-28 text-xs font-semibold bg-white border border-neutral-300 rounded px-1.5 py-0.5 text-neutral-900 focus:outline-none focus:border-black"
                                />
                                <button
                                  type="button"
                                  title="Salvar nome"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newName = editingCarNameInput.trim();
                                    if (newName && newName !== car) {
                                      setExtraOtaCarOptions(prev => {
                                        const updated = prev.map(c => c.toLowerCase() === car.toLowerCase() ? newName : c);
                                        if (!updated.includes(newName)) updated.push(newName);
                                        localStorage.setItem('alx_extra_ota_cars', JSON.stringify(updated));
                                        return updated;
                                      });
                                      setDeletedCarOptions(prev => {
                                        const updated = [...prev, car];
                                        localStorage.setItem('alx_deleted_ota_cars', JSON.stringify(updated));
                                        return updated;
                                      });
                                      const updatedList = currentList.map(c => c.toLowerCase() === car.toLowerCase() ? newName : c);
                                      const joined = updatedList.join(', ');
                                      setEditingOta({ ...editingOta, applicableCars: joined, modelTarget: joined });
                                    }
                                    setEditingCarName(null);
                                  }}
                                  className="p-1 hover:bg-emerald-100 text-emerald-700 rounded cursor-pointer"
                                >
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                </button>
                                <button
                                  type="button"
                                  title="Cancelar"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCarName(null);
                                  }}
                                  className="p-1 hover:bg-neutral-200 text-neutral-500 rounded cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={car}
                              className={`group/chip inline-flex items-center rounded-xl text-xs font-semibold transition-all border ${
                                isSelected
                                  ? 'bg-neutral-900 text-[#ebbf01] border-neutral-900 shadow-xs'
                                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  let updatedList: string[];
                                  if (isSelected) {
                                    updatedList = currentList.filter(c => c.toLowerCase() !== car.toLowerCase() && getNormModelKey(c) !== getNormModelKey(car));
                                  } else {
                                    updatedList = [...currentList, car];
                                  }
                                  const joined = updatedList.join(', ');
                                  setEditingOta({ ...editingOta, applicableCars: joined, modelTarget: joined });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                              >
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                                  isSelected ? 'bg-[#ebbf01] text-black font-extrabold' : 'border border-neutral-400'
                                }`}>
                                  {isSelected ? '✓' : ''}
                                </span>
                                <span>{car}</span>
                              </button>

                              {/* Ações de Editar e Excluir Veículo */}
                              <div className="flex items-center pr-1.5 gap-0.5 opacity-80 group-hover/chip:opacity-100">
                                <button
                                  type="button"
                                  title={`Editar nome de "${car}"`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCarName(car);
                                    setEditingCarNameInput(car);
                                  }}
                                  className={`p-1 rounded hover:bg-white/20 transition-colors cursor-pointer ${
                                    isSelected ? 'text-[#ebbf01] hover:text-white' : 'text-neutral-500 hover:text-black'
                                  }`}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  title={`Excluir "${car}" da lista`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const normC = getNormModelKey(car);
                                    setDeletedCarOptions(prev => {
                                      const updated = [...prev.filter(c => getNormModelKey(c) !== normC), car];
                                      localStorage.setItem('alx_deleted_ota_cars', JSON.stringify(updated));
                                      return updated;
                                    });
                                    setExtraOtaCarOptions(prev => {
                                      const updated = prev.filter(c => getNormModelKey(c) !== normC && c.toLowerCase() !== car.toLowerCase());
                                      localStorage.setItem('alx_extra_ota_cars', JSON.stringify(updated));
                                      return updated;
                                    });
                                    // Remove from current editing draft
                                    const updatedList = currentList.filter(c => getNormModelKey(c) !== normC && c.toLowerCase() !== car.toLowerCase());
                                    const joined = updatedList.join(', ');
                                    setEditingOta({ ...editingOta, applicableCars: joined, modelTarget: joined });

                                    // Strip from all existing saved OTA updates
                                    otaUpdates.forEach(o => {
                                      const cars = (o.applicableCars || o.modelTarget || '').split(/[,;/]+/).map(s => s.trim()).filter(Boolean);
                                      if (cars.some(c => getNormModelKey(c) === normC || c.toLowerCase() === car.toLowerCase())) {
                                        const newCarsStr = cars.filter(c => getNormModelKey(c) !== normC && c.toLowerCase() !== car.toLowerCase()).join(', ');
                                        updateOtaUpdate(o.id, { applicableCars: newCarsStr, modelTarget: newCarsStr });
                                      }
                                    });

                                    triggerSuccess(`Veículo "${car}" removido das opções com sucesso!`);
                                  }}
                                  className={`p-1 rounded hover:bg-red-500/20 transition-colors cursor-pointer ${
                                    isSelected ? 'text-red-400 hover:text-red-300' : 'text-neutral-400 hover:text-red-600'
                                  }`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Campo para acrescentar novo veículo */}
                    <div className="pt-2.5 border-t border-neutral-200 flex items-center gap-2">
                      <input
                        type="text"
                        value={customOtaCarInput}
                        onChange={(e) => setCustomOtaCarInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = customOtaCarInput.trim();
                            if (!trimmed) return;
                            setDeletedCarOptions(prev => {
                              const updated = prev.filter(c => c.toLowerCase() !== trimmed.toLowerCase());
                              localStorage.setItem('alx_deleted_ota_cars', JSON.stringify(updated));
                              return updated;
                            });
                            if (!extraOtaCarOptions.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
                              setExtraOtaCarOptions(prev => {
                                const updated = [...prev, trimmed];
                                localStorage.setItem('alx_extra_ota_cars', JSON.stringify(updated));
                                return updated;
                              });
                            }
                            const current = (editingOta.applicableCars || editingOta.modelTarget || '')
                              .split(',')
                              .map(s => s.trim())
                              .filter(Boolean);
                            if (!current.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
                              const updated = [...current, trimmed];
                              const joined = updated.join(', ');
                              setEditingOta({ ...editingOta, applicableCars: joined, modelTarget: joined });
                            }
                            setCustomOtaCarInput('');
                          }
                        }}
                        placeholder="Acrescentar outro veículo (ex: BYD King, GWM Ora 03)..."
                        className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = customOtaCarInput.trim();
                          if (!trimmed) return;
                          setDeletedCarOptions(prev => {
                            const updated = prev.filter(c => c.toLowerCase() !== trimmed.toLowerCase());
                            localStorage.setItem('alx_deleted_ota_cars', JSON.stringify(updated));
                            return updated;
                          });
                          if (!extraOtaCarOptions.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
                            setExtraOtaCarOptions(prev => {
                              const updated = [...prev, trimmed];
                              localStorage.setItem('alx_extra_ota_cars', JSON.stringify(updated));
                              return updated;
                            });
                          }
                          const current = (editingOta.applicableCars || editingOta.modelTarget || '')
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean);
                          if (!current.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
                            const updated = [...current, trimmed];
                            const joined = updated.join(', ');
                            setEditingOta({ ...editingOta, applicableCars: joined, modelTarget: joined });
                          }
                          setCustomOtaCarInput('');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#ebbf01] rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Acrescentar</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-500 font-mono">Texto final salvo nos detalhes do pacote:</label>
                    <input
                      type="text"
                      value={editingOta.applicableCars || editingOta.modelTarget || ''}
                      onChange={(e) => setEditingOta({ ...editingOta, applicableCars: e.target.value, modelTarget: e.target.value })}
                      placeholder="ex: BYD Dolphin, Dolphin Mini, Seal, Song Plus, Yuan Plus"
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>
                </>
              );
            })()}
          </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Link para Download do Arquivo</label>
                  <input
                    type="text"
                    value={editingOta.downloadUrl || ''}
                    onChange={(e) => setEditingOta({ ...editingOta, downloadUrl: e.target.value })}
                    placeholder="https://servidor.com/ota-update.zip"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black font-mono shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Link para Tutorial / Instrução</label>
                  <input
                    type="text"
                    value={editingOta.tutorialUrl || ''}
                    onChange={(e) => setEditingOta({ ...editingOta, tutorialUrl: e.target.value })}
                    placeholder="https://alx.7f.com.br/tutoriais/instalar-ota"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black font-mono shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Tamanho do Arquivo (ex: 2.8 GB)</label>
                  <input
                    type="text"
                    value={editingOta.size || ''}
                    onChange={(e) => setEditingOta({ ...editingOta, size: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Changelog & Melhorias (uma por linha)</label>
                  <textarea
                    rows={4}
                    value={Array.isArray(editingOta.changelog) ? editingOta.changelog.join('\n') : (editingOta.changelog || '')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      setEditingOta({ ...editingOta, changelog: lines });
                    }}
                    placeholder="Estabilidade aprimorada em conexões Bluetooth e Android Auto&#10;Desbloqueio de fontes de áudio de terceiros&#10;Menu rápido de controle de rotação de tela reformulado"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black font-sans shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingOta(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const rawSlug = editingOta.slug?.trim() || editingOta.version?.trim() || editingOta.title?.trim() || `ota-${Date.now()}`;
                  const cleanSlug = rawSlug
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                  const hasTutorialUrl = Boolean(editingOta.tutorialUrl && editingOta.tutorialUrl.trim() !== '');

                  const otaToSave: OTAUpdate = {
                    ...editingOta,
                    slug: cleanSlug || `ota-${Date.now()}`,
                    tutorialUrl: hasTutorialUrl ? editingOta.tutorialUrl.trim() : '',
                    tutorialId: hasTutorialUrl ? (editingOta.tutorialId || '') : '',
                  };

                  if (isCreatingOta) {
                    addOtaUpdate(otaToSave);
                    triggerSuccess('Pacote OTA cadastrado com sucesso!');
                  } else {
                    updateOtaUpdate(editingOta.id, otaToSave);
                    triggerSuccess('Pacote OTA atualizado com sucesso!');
                  }
                  setEditingOta(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar OTA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE TUTORIAL (ESTILO PDF) ================= */}
      {editingTutorial && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div>
                <h3 className="text-xl font-black text-neutral-900 font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#ebbf01]" />
                  <span>{isCreatingTutorial ? 'Cadastrar Novo Tutorial' : `Editar Tutorial • ${editingTutorial.title}`}</span>
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Crie tutoriais em formato de manual técnico / PDF com textos, imagens e passos explicativos.
                </p>
              </div>

              {/* Mode Switcher: Editor vs PDF Preview */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => setTutorialEditorTab('editor')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      tutorialEditorTab === 'editor'
                        ? 'bg-neutral-900 text-[#ebbf01] shadow-xs'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Editor & Imagens
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorialEditorTab('preview')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      tutorialEditorTab === 'preview'
                        ? 'bg-neutral-900 text-[#ebbf01] shadow-xs'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar Estilo PDF</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingTutorial(null);
                    setTutorialEditorTab('editor');
                  }}
                  className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PREVIEW TAB: Visualizar Estilo PDF */}
            {tutorialEditorTab === 'preview' ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-mono text-amber-900">
                  <span>Pré-visualização fiel do documento como seus usuários verão no portal e ao imprimir/salvar PDF:</span>
                  <button
                    type="button"
                    onClick={() => setTutorialEditorTab('editor')}
                    className="font-bold underline cursor-pointer text-amber-950"
                  >
                    Voltar para Edição
                  </button>
                </div>
                <div className="border border-neutral-300 rounded-3xl overflow-hidden shadow-inner p-1 sm:p-3 bg-[#070709]">
                  <TutorialDocumentView
                    tutorial={editingTutorial}
                    onBack={() => setTutorialEditorTab('editor')}
                  />
                </div>
              </div>
            ) : (
              /* EDITOR TAB */
              <div className="space-y-6">
                
                {/* 1. Direct Page Link & Slug Box */}
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#ebbf01]" />
                      <span>Link Próprio da Página deste Tutorial</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const directUrl = `${window.location.origin}/tutoriais/${editingTutorial.slug || editingTutorial.id}`;
                        navigator.clipboard.writeText(directUrl);
                        triggerSuccess('Link direto copiado para a área de transferência!');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-800 hover:text-black hover:underline cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#ebbf01]" />
                      <span>Copiar Link Completo</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono shadow-xs">
                    <span className="text-neutral-500 shrink-0 select-none">alx.7f.com.br/tutoriais/</span>
                    <input
                      type="text"
                      value={editingTutorial.slug || ''}
                      onChange={(e) => {
                        const cleanSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                        setEditingTutorial({ ...editingTutorial, slug: cleanSlug });
                      }}
                      placeholder="slug-do-tutorial"
                      className="flex-1 font-bold text-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Foto de Capa do Tutorial */}
                <ImageUploadField
                  label="Foto de Capa do Tutorial (Banner Principal)"
                  value={editingTutorial.imageUrl || ''}
                  onChange={(val) => setEditingTutorial({ ...editingTutorial, imageUrl: val })}
                  aspectRatio="video"
                  presetOptions={[
                    { label: 'Passo a Passo OTA', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop' },
                    { label: 'Pen Drive USB', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop' },
                    { label: 'Central DiLink', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop' },
                    { label: 'Aplicativos & Android', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop' },
                  ]}
                />

                {/* 3. Form Grid: Título, Categoria, Veículos, etc. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Título do Tutorial</label>
                    <input
                      type="text"
                      value={editingTutorial.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const autoSlug = newTitle
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '');
                        setEditingTutorial({
                          ...editingTutorial,
                          title: newTitle,
                          slug: isCreatingTutorial || !editingTutorial.slug ? autoSlug : editingTutorial.slug
                        });
                      }}
                      placeholder="ex: Como Instalar a Atualização OTA no BYD Dolphin"
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <CategorySelect
                      label="Categoria do Tutorial"
                      value={editingTutorial.category || ''}
                      onChange={(val) => setEditingTutorial({ ...editingTutorial, category: val })}
                      existingCategories={[
                        'Instalação OTA',
                        'Multimídia & Apps',
                        'Segurança & Dicas',
                        'Desbloqueio & Engenharia',
                        'Geral',
                        ...Array.from(new Set(tutorials.map(t => t.category).filter(Boolean)))
                      ]}
                      placeholder="Selecione ou crie uma categoria..."
                      helperText="Escolha uma categoria existente ou crie uma nova."
                    />
                  </div>

                  {/* Visibilidade e Controle de Acesso do Tutorial */}
                  <div className="sm:col-span-2">
                    <VisibilitySelector
                      value={editingTutorial.visibility}
                      onChange={(val) => {
                        setEditingTutorial({
                          ...editingTutorial,
                          visibility: val,
                          ...(val === 'public' ? { isMembersOnly: false, isVipExclusive: false } : {}),
                          ...(val === 'public_vip' ? { isMembersOnly: true, isVipExclusive: true } : {}),
                          ...(val === 'unlisted' || val === 'link_only' ? { isMembersOnly: false, isVipExclusive: false } : {}),
                          ...(val === 'members_and_link' ? { isMembersOnly: true, isVipExclusive: true } : {}),
                        });
                      }}
                      directUrl={`${window.location.origin}/tutoriais/${editingTutorial.slug || editingTutorial.id}`}
                      itemTypeLabel="tutorial"
                    />
                  </div>

                  {/* Exclusivo para Membros VIP Toggle (quando público no site) */}
                  {(!editingTutorial.visibility || editingTutorial.visibility === 'public') && (
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-900 uppercase">
                          <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                          <span>Exclusivo para Membros (Área VIP)</span>
                        </div>
                        <p className="text-xs text-neutral-600 font-medium">
                          Quando ativado, apenas membros com login ativo na Área VIP poderão acessar este tutorial completo.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={Boolean(editingTutorial.isMembersOnly || editingTutorial.isVipExclusive)}
                          onChange={(e) => setEditingTutorial({
                            ...editingTutorial,
                            isMembersOnly: e.target.checked,
                            isVipExclusive: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebbf01]"></div>
                      </label>
                    </div>
                  )}

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">Resumo / Subtítulo do Manual</label>
                    <textarea
                      rows={2}
                      value={editingTutorial.summary}
                      onChange={(e) => setEditingTutorial({ ...editingTutorial, summary: e.target.value })}
                      placeholder="Breve descrição do que este guia aborda..."
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  {/* 4. Rich Content Writer Toolbar & Textarea */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Conteúdo Passo a Passo (Estilo PDF & Manual)</span>
                      </label>
                      <span className="text-[11px] font-mono text-neutral-500">
                        Suporta Títulos, Passos 1. 2., Avisos e Imagens
                      </span>
                    </div>

                    {/* Toolbar de Formatação Rápida */}
                    <div className="p-2 bg-neutral-100 border border-neutral-300 rounded-xl flex flex-wrap items-center gap-1.5 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingTutorial.content || '';
                          setEditingTutorial({ ...editingTutorial, content: `${current}\n\n## Novo Título de Seção\n` });
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-neutral-200 border border-neutral-300 font-bold text-neutral-800 cursor-pointer shadow-2xs"
                        title="Adicionar Título de Seção (H2)"
                      >
                        + Título H2
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const current = editingTutorial.content || '';
                          setEditingTutorial({ ...editingTutorial, content: `${current}\n\n### Subtítulo\n` });
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-neutral-200 border border-neutral-300 font-bold text-neutral-800 cursor-pointer shadow-2xs"
                        title="Adicionar Subtítulo (H3)"
                      >
                        + Subtítulo
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const current = editingTutorial.content || '';
                          setEditingTutorial({ ...editingTutorial, content: `${current}\n1. Primeiro passo da instrução...\n2. Segundo passo...\n` });
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-neutral-200 border border-neutral-300 font-bold text-neutral-800 cursor-pointer shadow-2xs"
                        title="Adicionar Lista Numerada de Passos"
                      >
                        1. 2. Passos
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const current = editingTutorial.content || '';
                          setEditingTutorial({ ...editingTutorial, content: `${current}\n- Item com marcador\n- Outro item\n` });
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-neutral-200 border border-neutral-300 font-bold text-neutral-800 cursor-pointer shadow-2xs"
                        title="Adicionar Lista com Marcadores"
                      >
                        • Marcadores
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const current = editingTutorial.content || '';
                          setEditingTutorial({ ...editingTutorial, content: `${current}\n\n> **Atenção:** Não desligue o carro durante a atualização.\n` });
                        }}
                        className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-bold cursor-pointer shadow-2xs"
                        title="Adicionar Caixa de Alerta / Aviso"
                      >
                        ⚠️ Caixa Aviso
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const current = editingTutorial.content || '';
                          setEditingTutorial({ ...editingTutorial, content: `${current}\n\n> **Dica:** Utilize um pendrive formatado em FAT32.\n` });
                        }}
                        className="px-2.5 py-1 rounded bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 font-bold cursor-pointer shadow-2xs"
                        title="Adicionar Caixa de Dica Técnica"
                      >
                        💡 Caixa Dica
                      </button>

                      {/* Botão Inserir Foto no Texto */}
                      <button
                        type="button"
                        onClick={() => setShowImagePrompt(!showImagePrompt)}
                        className="px-3 py-1 rounded bg-neutral-900 hover:bg-black text-[#ebbf01] font-bold cursor-pointer shadow-2xs flex items-center gap-1 ml-auto"
                        title="Inserir Foto ou Imagem com Legenda no Texto"
                      >
                        <ImageIcon className="w-3 h-3 text-[#ebbf01]" />
                        <span>📷 Inserir Foto no Texto</span>
                      </button>
                    </div>

                    {/* Popover / Form para Inserir Foto com Legenda */}
                    {showImagePrompt && (
                      <div className="p-3.5 bg-neutral-900 text-white rounded-2xl border border-white/10 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#ebbf01]">Inserir Imagem / Foto no Tutorial:</span>
                          <button
                            type="button"
                            onClick={() => setShowImagePrompt(false)}
                            className="text-neutral-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            value={inlineImgUrl}
                            onChange={(e) => setInlineImgUrl(e.target.value)}
                            placeholder="URL da Imagem (ex: https://...)"
                            className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ebbf01]"
                          />
                          <input
                            type="text"
                            value={inlineImgCaption}
                            onChange={(e) => setInlineImgCaption(e.target.value)}
                            placeholder="Legenda da foto (ex: Tela de confirmação no DiLink)"
                            className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ebbf01]"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!inlineImgUrl.trim()) return;
                              const current = editingTutorial.content || '';
                              const caption = inlineImgCaption.trim() || 'Foto explicativa do tutorial';
                              const tag = `\n\n![${caption}](${inlineImgUrl.trim()})\n\n`;
                              setEditingTutorial({ ...editingTutorial, content: `${current}${tag}` });
                              setInlineImgUrl('');
                              setInlineImgCaption('');
                              setShowImagePrompt(false);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs font-mono cursor-pointer hover:bg-[#f5cc14]"
                          >
                            Inserir no Texto
                          </button>
                        </div>
                      </div>
                    )}

                    <textarea
                      rows={10}
                      value={editingTutorial.content}
                      onChange={(e) => setEditingTutorial({ ...editingTutorial, content: e.target.value })}
                      placeholder={`Escreva as instruções completas do tutorial aqui...\n\nUse:\n## Título da Seção\n1. Passo um\n2. Passo dois\n![Legenda da Foto](https://url-da-imagem.jpg)\n> **Atenção:** Aviso importante`}
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3.5 text-xs text-neutral-900 font-mono leading-relaxed placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  {/* 5. Galeria de Fotos Anexadas ao Guia */}
                  <div className="sm:col-span-2 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Galeria de Imagens & Figuras do Documento</span>
                      </label>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {(editingTutorial.images || []).length} imagem(ns) anexada(s)
                      </span>
                    </div>

                    {/* Lista de Imagens Anexadas com Botão Inserir no Texto */}
                    {editingTutorial.images && editingTutorial.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        {editingTutorial.images.map((img, idx) => (
                          <div key={idx} className="group relative rounded-xl overflow-hidden border border-neutral-300 bg-white shadow-xs">
                            <div className="aspect-video bg-neutral-100 overflow-hidden">
                              <img src={img} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-1.5 flex items-center justify-between gap-1 bg-white border-t border-neutral-200">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = editingTutorial.content || '';
                                  const tag = `\n\n![Figura ${idx + 1}: Imagem do procedimento](${img})\n\n`;
                                  setEditingTutorial({ ...editingTutorial, content: `${current}${tag}` });
                                  triggerSuccess(`Foto #${idx + 1} inserida no texto!`);
                                }}
                                className="text-[10px] font-mono font-bold text-neutral-800 hover:text-black hover:underline cursor-pointer truncate"
                                title="Inserir esta imagem no texto do tutorial"
                              >
                                + Inserir no Texto
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingTutorial.images || []).filter((_, i) => i !== idx);
                                  setEditingTutorial({ ...editingTutorial, images: updated });
                                }}
                                className="text-neutral-400 hover:text-red-600 p-0.5"
                                title="Excluir da galeria"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Campo para anexar nova imagem à galeria */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newAttachedImgUrl}
                        onChange={(e) => setNewAttachedImgUrl(e.target.value)}
                        placeholder="Adicionar URL de imagem à galeria (ex: https://...)"
                        className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newAttachedImgUrl.trim();
                          if (!trimmed) return;
                          const currentImages = editingTutorial.images || [];
                          if (!currentImages.includes(trimmed)) {
                            setEditingTutorial({
                              ...editingTutorial,
                              images: [...currentImages, trimmed]
                            });
                          }
                          setNewAttachedImgUrl('');
                        }}
                        className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#ebbf01] rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                      >
                        + Anexar Foto
                      </button>
                    </div>
                  </div>

                  {/* 6. Link do Vídeo no YouTube (opcional) */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-red-600" />
                      <span>Link do Vídeo no YouTube (opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={editingTutorial.videoUrl || ''}
                      onChange={(e) => setEditingTutorial({ ...editingTutorial, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black font-mono shadow-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTutorialEditorTab(tutorialEditorTab === 'editor' ? 'preview' : 'editor')}
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#ebbf01]" />
                  <span>{tutorialEditorTab === 'editor' ? 'Ver em Estilo PDF' : 'Voltar ao Editor'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTutorial(null);
                    setTutorialEditorTab('editor');
                  }}
                  className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isCreatingTutorial) {
                      addTutorial(editingTutorial);
                      triggerSuccess('Tutorial cadastrado com sucesso!');
                    } else {
                      updateTutorial(editingTutorial.id, editingTutorial);
                      triggerSuccess('Tutorial atualizado com sucesso!');
                    }
                    setEditingTutorial(null);
                    setTutorialEditorTab('editor');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Tutorial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE UNLOCK SERVICE ================= */}
      {editingUnlockService && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ebbf01]/10 text-[#ebbf01] flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5 text-[#ebbf01]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 font-heading">
                    {isCreatingUnlockService ? 'Cadastrar Novo Serviço de Desbloqueio' : `Editar Serviço • ${editingUnlockService.title}`}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Preencha os detalhes do serviço prestado e configure os valores e canais de contratação.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUnlockService(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Título do Serviço *
                  </label>
                  <input
                    type="text"
                    value={editingUnlockService.title}
                    onChange={(e) => setEditingUnlockService({ ...editingUnlockService, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                    placeholder="Ex: Desbloqueio de Multimídia BYD DiLink"
                  />
                </div>

                <div>
                  <CategorySelect
                    label="Categoria do Serviço"
                    value={editingUnlockService.category || ''}
                    onChange={(val) => setEditingUnlockService({ ...editingUnlockService, category: val })}
                    existingCategories={Array.from(new Set(unlockServices.map(s => s.category).filter(Boolean)))}
                    placeholder="Selecione ou crie uma categoria..."
                    helperText="Escolha uma categoria existente ou crie uma nova."
                    required
                  />
                </div>
              </div>

              {/* Price & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Preço / Cobrança
                  </label>
                  <input
                    type="text"
                    value={editingUnlockService.price || ''}
                    onChange={(e) => setEditingUnlockService({ ...editingUnlockService, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                    placeholder="Ex: R$ 250,00 ou Sob Consulta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Destaque / Badge
                  </label>
                  <input
                    type="text"
                    value={editingUnlockService.badge || ''}
                    onChange={(e) => setEditingUnlockService({ ...editingUnlockService, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                    placeholder="Ex: Mais Solicitado, Exclusivo"
                  />
                </div>
              </div>

              {/* Badge Color Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Cor do Badge / Destaque
                </label>
                <div className="flex flex-wrap items-center gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingUnlockService.badgeColor || '#10B981'}
                      onChange={(e) => setEditingUnlockService({ ...editingUnlockService, badgeColor: e.target.value })}
                      className="w-10 h-10 p-1 rounded-xl border border-neutral-300 cursor-pointer bg-white"
                      title="Escolher cor personalizada"
                    />
                    <input
                      type="text"
                      value={editingUnlockService.badgeColor || '#10B981'}
                      onChange={(e) => setEditingUnlockService({ ...editingUnlockService, badgeColor: e.target.value })}
                      className="w-28 px-3 py-2 rounded-xl border border-neutral-300 focus:border-[#ebbf01] text-xs font-mono font-bold text-neutral-900 bg-white"
                      placeholder="#10B981"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-200">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase mr-1">Paleta:</span>
                    {[
                      { name: 'Verde Esmeralda', hex: '#10B981' },
                      { name: 'Dourado ALX', hex: '#EAB308' },
                      { name: 'Vermelho Destaque', hex: '#EF4444' },
                      { name: 'Azul Elétrico', hex: '#3B82F6' },
                      { name: 'Roxo VIP', hex: '#8B5CF6' },
                      { name: 'Laranja Vivo', hex: '#F97316' },
                      { name: 'Preto Grafite', hex: '#111827' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setEditingUnlockService({ ...editingUnlockService, badgeColor: c.hex })}
                        className={`w-7 h-7 rounded-full border border-black/20 transition-all cursor-pointer ${
                          (editingUnlockService.badgeColor || '#10B981').toUpperCase() === c.hex.toUpperCase()
                            ? 'scale-110 ring-2 ring-[#ebbf01] shadow-md'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name} (${c.hex})`}
                      />
                    ))}
                  </div>

                  {/* Visual Preview */}
                  {editingUnlockService.badge && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">Prévia:</span>
                      <span
                        className="text-[10px] font-black px-2.5 py-1 rounded-lg font-mono uppercase text-black shadow-sm"
                        style={{ backgroundColor: editingUnlockService.badgeColor || '#10B981' }}
                      >
                        {editingUnlockService.badge}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Applicable Cars & Custom Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Veículos Compatíveis
                  </label>
                  <input
                    type="text"
                    value={editingUnlockService.applicableCars || ''}
                    onChange={(e) => setEditingUnlockService({ ...editingUnlockService, applicableCars: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                    placeholder="Ex: Dolphin, Dolphin Mini, Seal, Song Plus, Yuan Plus"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Slug da URL (ex: desbloqueio-byd-dilink)
                  </label>
                  <input
                    type="text"
                    value={editingUnlockService.slug || ''}
                    onChange={(e) => setEditingUnlockService({ ...editingUnlockService, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-mono text-neutral-900 focus:outline-none"
                    placeholder="desbloqueio-byd-dilink"
                  />
                </div>
              </div>

              {/* Image Upload / Field */}
              <ImageUploadField
                label="Imagem Ilustrativa do Serviço"
                value={editingUnlockService.imageUrl || ''}
                onChange={(url) => setEditingUnlockService({ ...editingUnlockService, imageUrl: url })}
                previewAspect="video"
              />

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Resumo Curto (Exibido no Card da Listagem) *
                </label>
                <textarea
                  rows={2}
                  value={editingUnlockService.summary}
                  onChange={(e) => setEditingUnlockService({ ...editingUnlockService, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                  placeholder="Breve descrição dos benefícios e escopo do serviço."
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Conteúdo Completo & Detalhamento Técnico *
                </label>
                <textarea
                  rows={6}
                  value={editingUnlockService.content}
                  onChange={(e) => setEditingUnlockService({ ...editingUnlockService, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-mono text-neutral-900 focus:outline-none"
                  placeholder="Instruções completas, tópicos, garantias e diferenciais do seu atendimento."
                />
              </div>

              {/* WhatsApp Contact Message */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Mensagem Automática para Contratação no WhatsApp
                </label>
                <input
                  type="text"
                  value={editingUnlockService.whatsappContactMessage || ''}
                  onChange={(e) => setEditingUnlockService({ ...editingUnlockService, whatsappContactMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none"
                  placeholder="Ex: Olá! Gostaria de informações sobre o serviço de Desbloqueio DiLink."
                />
              </div>

              {/* Garantia & Execução de Serviços */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#ebbf01]" />
                  <span>Garantia & Execução de Serviços (Aviso no Card)</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Título do Card de Garantia
                  </label>
                  <input
                    type="text"
                    value={editingUnlockService.warrantyTitle !== undefined ? editingUnlockService.warrantyTitle : 'Garantia & Execução de Serviços'}
                    onChange={(e) => setEditingUnlockService({ ...editingUnlockService, warrantyTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none bg-white"
                    placeholder="Garantia & Execução de Serviços"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Descrição / Texto da Garantia
                  </label>
                  <textarea
                    rows={2}
                    value={editingUnlockService.warrantyText !== undefined ? editingUnlockService.warrantyText : 'Todos os serviços são executados com ferramentas de nível profissional, garantindo integridade dos sistemas originais do veículo.'}
                    onChange={(e) => setEditingUnlockService({ ...editingUnlockService, warrantyText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-medium text-neutral-900 focus:outline-none bg-white"
                    placeholder="Todos os serviços são executados com ferramentas de nível profissional, garantindo integridade dos sistemas originais do veículo."
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingUnlockService(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = editingUnlockService.title?.trim() || 'Serviço de Desbloqueio';
                  const summary = editingUnlockService.summary?.trim() || 'Desbloqueio de central multimídia e conectividade.';
                  const serviceToSave: UnlockServiceItem = {
                    ...editingUnlockService,
                    title,
                    summary,
                  };
                  if (isCreatingUnlockService) {
                    addUnlockService(serviceToSave);
                    triggerSuccess('Serviço de desbloqueio cadastrado com sucesso!');
                  } else {
                    updateUnlockService(editingUnlockService.id, serviceToSave);
                    triggerSuccess('Serviço de desbloqueio atualizado com sucesso!');
                  }
                  setEditingUnlockService(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Serviço</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE WALLPAPER ================= */}
      {editingWallpaper && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ebbf01]/10 text-[#ebbf01] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  {isCreatingWallpaper ? 'Adicionar Wallpaper / Vídeo' : 'Editar Wallpaper / Vídeo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingWallpaper(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* 1. Tipo de Mídia */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-900 uppercase mb-1.5">
                  Tipo de Mídia
                </label>
                <select
                  value={editingWallpaper.type}
                  onChange={(e) => {
                    const newType = e.target.value as 'image' | 'video';
                    setEditingWallpaper({ ...editingWallpaper, type: newType });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#ebbf01] focus:ring-1 focus:ring-[#ebbf01] text-xs font-bold text-neutral-900 focus:outline-none bg-neutral-50"
                >
                  <option value="image">Wallpaper Estático</option>
                  <option value="video">Wallpaper Animado (Vídeo MP4 / WebM)</option>
                </select>
              </div>

              {/* 2. Upload de Mídia para Wallpaper Estático ou Animado */}
              {editingWallpaper.type === 'video' ? (
                <AnimatedWallpaperUpload
                  previewUrl={editingWallpaper.previewUrl || ''}
                  downloadUrl={editingWallpaper.downloadUrl || editingWallpaper.videoUrl || ''}
                  videoUrl={editingWallpaper.videoUrl}
                  onChangePreview={(newPreview) => {
                    setEditingWallpaper({ 
                      ...editingWallpaper, 
                      previewUrl: newPreview,
                      downloadUrl: editingWallpaper.downloadUrl || newPreview,
                      videoUrl: editingWallpaper.videoUrl || newPreview
                    });
                  }}
                  onChangeDownload={(newDownload, meta) => {
                    setEditingWallpaper({ 
                      ...editingWallpaper, 
                      downloadUrl: newDownload,
                      videoUrl: newDownload,
                      previewUrl: meta?.previewUrl || editingWallpaper.previewUrl || newDownload
                    });
                  }}
                />
              ) : (
                <div>
                  <ImageUploadField
                    label="Upload da Foto do Wallpaper (Compactada em formato JPG)"
                    value={editingWallpaper.previewUrl || editingWallpaper.downloadUrl || ''}
                    onChange={(url) => setEditingWallpaper({ ...editingWallpaper, previewUrl: url, downloadUrl: url, videoUrl: '' })}
                    helperText="Faça upload da imagem do wallpaper. Ela será compactada e otimizada automaticamente em formato JPG."
                    aspectRatio="video"
                    compressAsJpg={true}
                  />
                </div>
              )}

              {/* Opção Exclusivo para Membros VIP */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#ebbf01]" />
                    <span className="text-xs font-bold text-neutral-900">
                      Exclusivo para Membros VIP
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Disponibilize este wallpaper exclusivamente para membros e apoiadores na Área VIP.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(editingWallpaper.isMembersOnly || (editingWallpaper as any).isVipExclusive)}
                    onChange={(e) => setEditingWallpaper({
                      ...editingWallpaper,
                      isMembersOnly: e.target.checked,
                      isVipExclusive: e.target.checked,
                    } as any)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebbf01]"></div>
                </label>
              </div>

            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingWallpaper(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const mediaUrl = editingWallpaper.type === 'video' ? (editingWallpaper.downloadUrl || editingWallpaper.videoUrl || editingWallpaper.previewUrl) : (editingWallpaper.previewUrl || editingWallpaper.downloadUrl);
                  if (!mediaUrl) {
                    alert('Por favor, faça o upload ou cole o link da mídia (wallpaper ou vídeo).');
                    return;
                  }
                  const finalItem = {
                    ...editingWallpaper,
                    title: 'Wallpaper',
                    category: 'Geral',
                    resolution: '4K Ultra HD',
                    previewUrl: editingWallpaper.type === 'video' ? (editingWallpaper.previewUrl || mediaUrl) : (editingWallpaper.previewUrl || mediaUrl),
                    downloadUrl: editingWallpaper.type === 'video' ? (editingWallpaper.downloadUrl || editingWallpaper.videoUrl || editingWallpaper.previewUrl) : (editingWallpaper.downloadUrl || mediaUrl || editingWallpaper.previewUrl),
                    videoUrl: editingWallpaper.type === 'video' ? (editingWallpaper.downloadUrl || editingWallpaper.videoUrl || editingWallpaper.previewUrl) : '',
                    isMembersOnly: Boolean(editingWallpaper.isMembersOnly || (editingWallpaper as any).isVipExclusive),
                    isVipExclusive: Boolean(editingWallpaper.isMembersOnly || (editingWallpaper as any).isVipExclusive),
                  };
                  if (isCreatingWallpaper) {
                    addWallpaper(finalItem);
                    triggerSuccess('Wallpaper salvo com sucesso!');
                  } else {
                    updateWallpaper(finalItem.id, finalItem);
                    triggerSuccess('Wallpaper atualizado!');
                  }
                  setEditingWallpaper(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Wallpaper</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE CUSTOM PAGE LINK ================= */}
      {editingPageLink && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ebbf01]/10 text-[#ebbf01] flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  {isCreatingPageLink ? 'Adicionar Nova Página / Link' : `Editar Link • ${editingPageLink.title}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingPageLink(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Seletor Rápido de Páginas Existentes do Próprio Site */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#ebbf01] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ebbf01]" />
                      <span>Selecionar Página Existente do Site</span>
                    </label>
                    <span className="text-[10px] text-neutral-400 font-mono">Auto-preenche campos</span>
                  </div>

                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const selected = EXISTING_SITE_PAGES.find((p) => p.url === val);
                      if (selected) {
                        setEditingPageLink({
                          ...editingPageLink,
                          title: selected.title,
                          url: selected.url,
                          description: selected.description,
                          icon: selected.icon,
                          category: selected.category || 'Geral',
                          isExternal: false,
                          openInNewTab: false,
                        });
                      }
                    }}
                    defaultValue=""
                    className="w-full bg-[#16161D] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#ebbf01] cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#16161D] text-neutral-400">
                      -- Clique aqui para escolher uma página do site --
                    </option>
                    {EXISTING_SITE_PAGES.map((page) => (
                      <option key={page.url} value={page.url} className="bg-[#16161D] text-white">
                        📍 {page.title} ({page.url})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Título do Item no Menu
                  </label>
                  <input
                    type="text"
                    value={editingPageLink.title}
                    onChange={(e) => setEditingPageLink({ ...editingPageLink, title: e.target.value })}
                    placeholder="ex: FAQ & Dúvidas Frequentes"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    URL de Destino
                  </label>
                  <input
                    type="text"
                    value={editingPageLink.url}
                    onChange={(e) => setEditingPageLink({ ...editingPageLink, url: e.target.value })}
                    placeholder="ex: https://t.me/seugrupo ou #radar-ota ou https://seusite.com/pagina"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black font-mono shadow-xs"
                  />
                  <p className="text-[10px] text-neutral-500">
                    Use URLs completas (https://...) para links externos ou âncoras (#apps, #calculadora, #ota) para navegação interna.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Ícone
                  </label>
                  <select
                    value={editingPageLink.icon || 'globe'}
                    onChange={(e) => setEditingPageLink({ ...editingPageLink, icon: e.target.value })}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs"
                  >
                    <option value="globe">Globo (Padrão)</option>
                    <option value="helpcircle">Ajuda / FAQ (Interrogação)</option>
                    <option value="send">Telegram / Mensagem (Avião)</option>
                    <option value="zap">Ferramenta / Energia (Raio)</option>
                    <option value="smartphone">App / Smartphone</option>
                    <option value="shieldcheck">Segurança / Garantia</option>
                    <option value="bookopen">Guia / Livro</option>
                    <option value="filetext">Documento / Texto</option>
                    <option value="sparkles">Destaque (Estrela)</option>
                  </select>
                </div>

                <CategorySelect
                  label="Categoria (Menu / Agrupamento)"
                  value={editingPageLink.category || ''}
                  onChange={(val) => setEditingPageLink({ ...editingPageLink, category: val })}
                  existingCategories={Array.from(new Set(customPageLinks.map(l => l.category).filter(Boolean)))}
                  placeholder="Selecione ou crie uma categoria..."
                  helperText="Agrupa este link/página no menu correspondente."
                />

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Badge de Destaque (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingPageLink.badge || ''}
                    onChange={(e) => setEditingPageLink({ ...editingPageLink, badge: e.target.value })}
                    placeholder="ex: Novo, Suporte, Oficial, Grátis"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Descrição Curta
                  </label>
                  <textarea
                    rows={2}
                    value={editingPageLink.description || ''}
                    onChange={(e) => setEditingPageLink({ ...editingPageLink, description: e.target.value })}
                    placeholder="Breve resumo da página para exibir no menu dropdown..."
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-neutral-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-900">
                  <input
                    type="checkbox"
                    checked={editingPageLink.isExternal}
                    onChange={(e) => setEditingPageLink({ ...editingPageLink, isExternal: e.target.checked })}
                    className="rounded border-neutral-300 text-[#ebbf01] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Link Externo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-900">
                  <input
                    type="checkbox"
                    checked={editingPageLink.openInNewTab}
                    onChange={(e) => setEditingPageLink({ ...editingPageLink, openInNewTab: e.target.checked })}
                    className="rounded border-neutral-300 text-[#ebbf01] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Abrir em Nova Aba (_blank)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingPageLink(null)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = editingPageLink.title?.trim() || 'Nova Página / Link';
                  const linkToSave: CustomPageLink = {
                    ...editingPageLink,
                    title,
                  };
                  if (isCreatingPageLink) {
                    addCustomPageLink(linkToSave);
                    triggerSuccess('Nova página/link cadastrada com sucesso!');
                  } else {
                    updateCustomPageLink(editingPageLink.id, linkToSave);
                    triggerSuccess('Página/link atualizada com sucesso!');
                  }
                  setEditingPageLink(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CADASTRAR / EDITAR MEMBRO VIP ================= */}
      {showVipMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-[#ebbf01] flex items-center justify-center font-bold">
                  <User className="w-5 h-5 text-[#ebbf01]" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  {editingVipMember ? `Editar Membro • ${editingVipMember.name}` : 'Cadastrar Novo Membro VIP'}
                </h3>
              </div>
              <button
                onClick={() => setShowVipMemberModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVipMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={vipFormName}
                    onChange={(e) => setVipFormName(e.target.value)}
                    placeholder="ex: João Silva"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={vipFormEmail}
                    onChange={(e) => setVipFormEmail(e.target.value)}
                    placeholder="ex: joao@email.com"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    value={vipFormPhone}
                    onChange={(e) => setVipFormPhone(e.target.value)}
                    placeholder="ex: (11) 99999-8888"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Senha de Acesso VIP</span>
                    <span className="text-[10px] text-neutral-500 font-normal lowercase">(opcional / redefinir)</span>
                  </label>
                  <input
                    type="text"
                    value={vipFormPassword}
                    onChange={(e) => setVipFormPassword(e.target.value)}
                    placeholder="Defina ou altere a senha do membro"
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Tipo de Assinatura
                  </label>
                  <select
                    value={vipFormPlanType}
                    onChange={(e) => setVipFormPlanType(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs cursor-pointer"
                  >
                    <option value="Assinante VIP">Assinante VIP</option>
                    <option value="Apoiador WhatsApp">Apoiador WhatsApp</option>
                    <option value="Membro YouTube">Membro YouTube</option>
                    <option value="Apoiador Canal">Apoiador Canal</option>
                    <option value="Vitalício">Membro Vitalício</option>
                    <option value="Outro">Outro Plano Especial</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Período do Plano
                  </label>
                  <select
                    value={vipFormPeriod}
                    onChange={(e) => setVipFormPeriod(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs cursor-pointer"
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                    <option value="Vitalício">Vitalício</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Status Atual
                  </label>
                  <select
                    value={vipFormStatus}
                    onChange={(e) => setVipFormStatus(e.target.value as any)}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs cursor-pointer"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Expirando em Breve">Expirando em Breve</option>
                    <option value="Expirado">Expirado</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={vipFormStartDate}
                    onChange={(e) => setVipFormStartDate(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Data de Validade / Expiração
                  </label>
                  <input
                    type="date"
                    value={vipFormExpirationDate}
                    onChange={(e) => setVipFormExpirationDate(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                    Observações & Notas Internas
                  </label>
                  <textarea
                    rows={2}
                    value={vipFormNotes}
                    onChange={(e) => setVipFormNotes(e.target.value)}
                    placeholder="Anotações sobre pagamento, chave Pix ou observações do membro..."
                    className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowVipMemberModal(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingVipMember ? 'Salvar Alterações' : 'Cadastrar Membro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMPORTAR PLANILHA CSV ================= */}
      {showCsvImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-[#ebbf01] flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5 text-[#ebbf01]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 font-heading">
                    Importar Membros via Planilha CSV
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Faça upload do arquivo .csv ou cole os dados da planilha diretamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCsvImportModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload file or Download sample */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-[#ebbf01]" />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Arquivo de Planilha (.csv)</span>
                    <span className="text-[11px] text-neutral-500 block">Selecione o arquivo do computador</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#ebbf01]" />
                    <span>Escolher Arquivo</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCsvFileUpload(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleDownloadCsvModel}
                    className="px-3.5 py-2 rounded-xl bg-neutral-200 text-neutral-800 font-bold text-xs hover:bg-neutral-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Modelo Exemplo</span>
                  </button>
                </div>
              </div>

              {/* Textarea Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                  Ou Cole o Conteúdo da Planilha CSV Abaixo:
                </label>
                <textarea
                  rows={5}
                  value={csvInputText}
                  onChange={(e) => handleParseCsvText(e.target.value)}
                  placeholder="nome,email,telefone,tipoAssinatura,plano,dataInicio,dataExpiracao,status,observacoes&#10;Carlos Silva,carlos@exemplo.com,(11) 98765-4321,Assinante VIP,Anual,2026-01-15,2027-01-15,Ativo,Membro Anual"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-2xl p-3.5 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                />
              </div>

              {/* Parsed Members Preview */}
              {parsedCsvMembers.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {parsedCsvMembers.length} membros identificados e prontos para importação:
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-2xl bg-neutral-50/50">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-100 text-neutral-700 font-mono font-bold border-b border-neutral-200 text-[10px] uppercase">
                          <th className="py-2 px-3">Nome</th>
                          <th className="py-2 px-3">E-mail</th>
                          <th className="py-2 px-3">WhatsApp</th>
                          <th className="py-2 px-3">Plano</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-[11px] font-medium text-neutral-800">
                        {parsedCsvMembers.slice(0, 10).map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-bold">{m.name}</td>
                            <td className="py-2 px-3 font-mono">{m.email}</td>
                            <td className="py-2 px-3 font-mono">{m.phone || '-'}</td>
                            <td className="py-2 px-3">{m.planType} ({m.period})</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {parsedCsvMembers.length > 10 && (
                          <tr>
                            <td colSpan={5} className="py-2 px-3 text-center text-neutral-500 font-bold text-[10px]">
                              ... e mais {parsedCsvMembers.length - 10} membros
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setShowCsvImportModal(false)}
                className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={parsedCsvMembers.length === 0}
                onClick={handleConfirmCsvImport}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                  parsedCsvMembers.length > 0
                    ? 'bg-[#ebbf01] text-black hover:bg-[#f5cc14] shadow-[#ebbf01]/20'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Confirmar Importação ({parsedCsvMembers.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ENVIAR E-MAIL REATIVAÇÃO ================= */}
      {showReactivationModal && targetReactivationMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-[#ebbf01] flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5 text-[#ebbf01]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 font-heading">
                    Enviar E-mail de Reativação / Renovação
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Notifique o membro VIP sobre a validade da assinatura e instruções de renovação.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReactivationModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Member Summary Box */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-extrabold text-neutral-900 text-sm block">{targetReactivationMember.name}</span>
                  <span className="text-neutral-600 font-mono text-xs block">{targetReactivationMember.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black text-[#ebbf01] font-mono text-[10px] font-extrabold uppercase">
                    {targetReactivationMember.planType} ({targetReactivationMember.period})
                  </span>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    targetReactivationMember.status === 'Ativo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : targetReactivationMember.status === 'Expirando em Breve'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {targetReactivationMember.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-600 pt-2 border-t border-neutral-200">
                <div><span>Validade:</span> <strong className="text-neutral-900">{targetReactivationMember.expirationDate || 'N/I'}</strong></div>
                <div><span>Tempo Ativo:</span> <strong className="text-neutral-900">{calculateActiveDuration(targetReactivationMember.startDate)}</strong></div>
              </div>
            </div>

            {reactivationFeedback && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                reactivationFeedback.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reactivationFeedback.message}</span>
              </div>
            )}

            {/* Email Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                  Assunto do E-mail
                </label>
                <input
                  type="text"
                  value={reactivationSubject}
                  onChange={(e) => setReactivationSubject(e.target.value)}
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-black shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider">
                  Mensagem / Corpo do E-mail
                </label>
                <textarea
                  rows={7}
                  value={reactivationMessage}
                  onChange={(e) => setReactivationMessage(e.target.value)}
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-2xl p-3.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-black shadow-xs"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Assunto: ${reactivationSubject}\n\n${reactivationMessage}`);
                  triggerSuccess('Mensagem copiada para a área de transferência!');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-[#ebbf01]" />
                <span>Copiar Mensagem</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowReactivationModal(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-colors"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  disabled={isSendingReactivationEmail}
                  onClick={handleSendReactivationEmail}
                  className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  {isSendingReactivationEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar E-mail Agora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE IPTV APP ================= */}
      {editingIptvApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ebbf01]/10 text-[#ebbf01] flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  {isCreatingIptvApp ? 'Cadastrar Novo App IPTV' : `Editar App • ${editingIptvApp.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingIptvApp(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Nome do Aplicativo</label>
                  <input
                    type="text"
                    value={editingIptvApp.name}
                    onChange={(e) => setEditingIptvApp({ ...editingIptvApp, name: e.target.value })}
                    placeholder="ex: XCIPTV Player HD"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Versão</label>
                  <input
                    type="text"
                    value={editingIptvApp.version || ''}
                    onChange={(e) => setEditingIptvApp({ ...editingIptvApp, version: e.target.value })}
                    placeholder="ex: v6.0.2"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Tamanho do Arquivo</label>
                  <input
                    type="text"
                    value={editingIptvApp.fileSize || ''}
                    onChange={(e) => setEditingIptvApp({ ...editingIptvApp, fileSize: e.target.value })}
                    placeholder="ex: 45 MB"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Categoria / Tipo</label>
                  <input
                    type="text"
                    value={editingIptvApp.category || ''}
                    onChange={(e) => setEditingIptvApp({ ...editingIptvApp, category: e.target.value })}
                    placeholder="ex: Player XTREAM / M3U"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Selo / Badge</label>
                  <input
                    type="text"
                    value={editingIptvApp.badge || ''}
                    onChange={(e) => setEditingIptvApp({ ...editingIptvApp, badge: e.target.value })}
                    placeholder="ex: Recomendado BYD"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Link Direto de Download (APK)</label>
                  <input
                    type="text"
                    value={editingIptvApp.downloadUrl}
                    onChange={(e) => setEditingIptvApp({ ...editingIptvApp, downloadUrl: e.target.value })}
                    placeholder="https://alx.com.br/downloads/app.apk"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-neutral-700 font-mono">Descrição do Aplicativo</label>
                  <textarea
                    rows={3}
                    value={editingIptvApp.description}
                    onChange={(e) => setEditingIptvApp({ ...editingIptvApp, description: e.target.value })}
                    placeholder="Descrição técnica e recursos do aplicativo..."
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingIptvApp(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-extrabold text-xs uppercase hover:bg-neutral-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const appToSave: IptvAppItem = {
                    ...editingIptvApp,
                    name: editingIptvApp.name?.trim() || 'Novo App IPTV',
                    downloadUrl: editingIptvApp.downloadUrl?.trim() || '#',
                  };
                  if (isCreatingIptvApp) {
                    addIptvApp(appToSave);
                    triggerSuccess('App IPTV cadastrado com sucesso!');
                  } else {
                    updateIptvApp(editingIptvApp.id, appToSave);
                    triggerSuccess('App IPTV atualizado!');
                  }
                  setEditingIptvApp(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar App IPTV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT/CREATE IPTV LINK ================= */}
      {editingIptvLink && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ebbf01]/10 text-[#ebbf01] flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 font-heading">
                  {isCreatingIptvLink ? 'Cadastrar Novo Link Útil' : `Editar Link • ${editingIptvLink.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingIptvLink(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 font-mono">Título do Link</label>
                <input
                  type="text"
                  value={editingIptvLink.title}
                  onChange={(e) => setEditingIptvLink({ ...editingIptvLink, title: e.target.value })}
                  placeholder="ex: Web Player IPTV Online"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 font-mono">URL / Link de Destino</label>
                <input
                  type="text"
                  value={editingIptvLink.url}
                  onChange={(e) => setEditingIptvLink({ ...editingIptvLink, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 font-mono">Selo / Badge</label>
                <input
                  type="text"
                  value={editingIptvLink.badge || ''}
                  onChange={(e) => setEditingIptvLink({ ...editingIptvLink, badge: e.target.value })}
                  placeholder="ex: Sem Instalação"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 font-mono">Descrição do Link</label>
                <textarea
                  rows={2}
                  value={editingIptvLink.description || ''}
                  onChange={(e) => setEditingIptvLink({ ...editingIptvLink, description: e.target.value })}
                  placeholder="Breve explicação sobre o utilitário ou atalho..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#ebbf01]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingIptvLink(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-extrabold text-xs uppercase hover:bg-neutral-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingIptvLink.title || !editingIptvLink.url) {
                    alert('Preencha pelo menos o Título e a URL.');
                    return;
                  }
                  if (isCreatingIptvLink) {
                    addIptvLink(editingIptvLink);
                    triggerSuccess('Link útil cadastrado com sucesso!');
                  } else {
                    updateIptvLink(editingIptvLink.id, editingIptvLink);
                    triggerSuccess('Link útil atualizado!');
                  }
                  setEditingIptvLink(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Link Útil</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
