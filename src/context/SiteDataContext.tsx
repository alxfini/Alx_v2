import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  ALXApp, 
  NewsArticle, 
  ProductItem, 
  EVModel, 
  OTAUpdate, 
  Tutorial,
  YouTubeVideo, 
  SiteBrandConfig, 
  ActivePageView,
  AppNotification,
  DownloadItem,
  CustomPageLink,
  UnlockServiceItem,
  ContactMessage,
  VipMember,
  WallpaperItem,
  IptvPageConfig,
  IptvAppItem,
  IptvSimpleLink,
  PartnerItem
} from '../types';
import { alxApps as initialApps } from '../data/apps';
import { newsArticles as initialNews } from '../data/news';
import { productsList as initialProducts } from '../data/products';
import { evModels as initialEvModels, otaUpdatesList as initialOtaUpdates } from '../data/evModels';
import { initialTutorials } from '../data/tutorials';
import { initialUnlockServices } from '../data/unlockServices';
import { initialWallpapers } from '../data/wallpapers';
import { initialIptvConfig } from '../data/iptv';
import { initialPartners } from '../data/partners';
import { youtubeVideos as initialVideos } from '../data/videos';
import { initialCustomPageLinks } from '../data/customPages';
import { initialVipMembers } from '../data/vip';
import { siteConfig as initialSiteConfig } from '../data/siteConfig';
import { syncYouTubeVideosFromChannel } from '../services/youtubeService';
import { initialNotifications, sendBrowserNotification } from '../services/notificationService';
import { syncAllAutomotiveNews } from '../services/newsService';
import { syncShopProductsFromStore } from '../services/shopService';
import { applyPageThemeHex, getPageThemeHex, DEFAULT_PAGE_COLORS } from '../utils/pageColors';
import { isItemVip } from '../utils/vip';
import { normalizeWallpapersList } from '../utils/wallpaperUrl';

export interface FullSiteDataPayload {
  brand?: SiteBrandConfig;
  apps?: ALXApp[];
  news?: NewsArticle[];
  products?: ProductItem[];
  evModels?: EVModel[];
  otaUpdates?: OTAUpdate[];
  videos?: YouTubeVideo[];
  tutorials?: Tutorial[];
  wallpapers?: WallpaperItem[];
  iptvConfig?: IptvPageConfig;
  partners?: PartnerItem[];
  notifications?: AppNotification[];
  customPageLinks?: CustomPageLink[];
  unlockServices?: UnlockServiceItem[];
  vipMembers?: VipMember[];
  contactMessages?: ContactMessage[];
  adminTabOrder?: string[];
  deletedNewsIds?: string[];
  deletedAppIds?: string[];
  lastSaved?: string;
}

const STORAGE_KEY = 'alx_site_data_store_v2';

export const initialBrandConfig: SiteBrandConfig = {
  brandName: initialSiteConfig.brandName || 'Alx⁺',
  tagline: initialSiteConfig.tagline || 'Tecnologia que vai além do seu carro.',
  subTagline: initialSiteConfig.subTagline || 'Notícias, vídeos, aplicativos, produtos e conteúdos exclusivos reunidos em um único lugar.',
  logoUrl: '/logo_alx_garage.png',
  defaultShareImageUrl: '/imagens/og-padrao.jpg',
  youtubeSectionLogoUrl: '/logo_alx_garage.png',
  shopSectionLogoUrl: '/logo_alx_garage.png',
  faviconUrl: '/favicon.svg?v=2026',
  adminPassword: 'alx2026',
  heroBackgroundUrl: '/imagens/fundo-calculadora.jpg',
  youtubeChannelId: 'https://www.youtube.com/@alx-garage',
  pageColors: { ...DEFAULT_PAGE_COLORS },
  contactTitle: 'Fale Conosco',
  contactDescription: 'Entre em contato com nossa equipe técnica para dúvidas, sugestões e parcerias.',
  contactWhatsapp: '',
  contactHours: '',
  contactAddress: '',
  contactCustomText: '',
  links: {
    youtube: initialSiteConfig.links?.youtube || 'https://www.youtube.com/@alx-garage',
    telegram: initialSiteConfig.links?.telegram || 'https://t.me/ALX_Comunidade',
    instagram: initialSiteConfig.links?.instagram || 'https://instagram.com/alx.autotech',
    spotify: (initialSiteConfig.links as any)?.spotify || 'https://open.spotify.com/playlist/4fbVvzPirRvxWqkz8m9OTp?si=1f579b7208214433',
    vipStore: initialSiteConfig.links?.vipStore || '#vip',
    email: 'contact@7f.com.br',
  },
  customSocialLinks: [],
  contactCards: [
    {
      id: 'card-email',
      title: 'E-mail de Suporte',
      subtitle: 'Atendimento Oficial',
      description: 'Atendimento por e-mail para dúvidas sobre assinaturas VIP, parcerias e contato comercial.',
      type: 'email',
      value: 'contact@7f.com.br',
      buttonText: 'Enviar E-mail',
      iconName: 'mail',
      colorScheme: 'amber',
      active: true,
    },
    {
      id: 'card-whatsapp',
      title: 'WhatsApp / Telefone',
      subtitle: 'Atendimento Direto',
      description: 'Mensagens diretas de atendimento via WhatsApp.',
      type: 'whatsapp',
      value: '5511999999999',
      buttonText: 'Chamar no WhatsApp 💬',
      iconName: 'whatsapp',
      colorScheme: 'emerald',
      active: true,
    },
    {
      id: 'card-telegram',
      title: 'Comunidade Telegram',
      subtitle: 'Grupo Oficial Telegram',
      description: 'Participe do grupo com milhares de proprietários para suporte rápido em tempo real.',
      type: 'telegram',
      value: 'https://t.me/ALX_Comunidade',
      buttonText: 'Entrar ↗',
      iconName: 'telegram',
      colorScheme: 'sky',
      active: true,
    },
  ],
  vipPayment: {
    pixKey: 'contact@7f.com.br',
    pixKeyType: 'email',
    pixReceiverName: 'ALX GARAGE',
    pixReceiverCity: 'SAO PAULO',
    mercadoPagoSubUrl: 'https://www.mercadopago.com.br/subscriptions/checkout',
    monthlySubPrice: '14,90',
    pixSinglePrice: '14,90',
    approvalNoticeText: 'A aprovação e liberação do seu acesso VIP pode demorar até 24 horas.',
    notificationEmail: 'contact@7f.com.br',
  },
  vipNoticeTitle: 'Mural de Avisos & Comunicados VIP',
  vipNoticeMessage: 'Bem-vindo ao espaço exclusivo de membros! Fique atento às novas atualizações de APKs, firmwares e tutoriais disponibilizados periodicamente nesta área.',
  vipNoticeDate: 'Atualizado recentemente',
  vipNoticeActive: true,
  vipWhatsappGroupUrl: '',
  vipWhatsappGroupTitle: 'Grupo VIP no WhatsApp',
  vipWhatsappGroupDesc: 'Participe do nosso grupo oficial exclusivo no WhatsApp! Troque experiências com outros membros, receba alertas imediatos de novidades e tenha acesso prioritário.',
  githubStorage: {
    enabled: false,
    token: '',
    owner: '',
    repo: '',
    defaultReleaseTag: 'v1.0',
  },
};

interface SiteDataContextType {
  brand: SiteBrandConfig;
  apps: ALXApp[];
  news: NewsArticle[];
  products: ProductItem[];
  evModels: EVModel[];
  otaUpdates: OTAUpdate[];
  tutorials: Tutorial[];
  unlockServices: UnlockServiceItem[];
  wallpapers: WallpaperItem[];
  iptvConfig: IptvPageConfig;
  partners: PartnerItem[];
  videos: YouTubeVideo[];
  notifications: AppNotification[];
  customPageLinks: CustomPageLink[];

  // Partners CRUD
  addPartner: (partner: Omit<PartnerItem, 'id'> | PartnerItem) => PartnerItem;
  updatePartner: (id: string, data: Partial<PartnerItem>) => void;
  deletePartner: (id: string) => void;
  duplicatePartner: (id: string) => PartnerItem | null;
  reorderPartners: (partnerIds: string[]) => void;

  // IPTV CRUD
  updateIptvConfig: (data: Partial<IptvPageConfig>) => void;
  addIptvApp: (app: Omit<IptvAppItem, 'id'>) => IptvAppItem;
  updateIptvApp: (id: string, data: Partial<IptvAppItem>) => void;
  deleteIptvApp: (id: string) => void;
  duplicateIptvApp: (id: string) => IptvAppItem | null;
  addIptvLink: (link: Omit<IptvSimpleLink, 'id'>) => IptvSimpleLink;
  updateIptvLink: (id: string, data: Partial<IptvSimpleLink>) => void;
  deleteIptvLink: (id: string) => void;

  // Wallpapers CRUD
  updateWallpaper: (id: string, data: Partial<WallpaperItem>) => void;
  addWallpaper: (item: Omit<WallpaperItem, 'id'>) => WallpaperItem;
  deleteWallpaper: (id: string) => void;
  duplicateWallpaper: (id: string) => WallpaperItem | null;
  reorderWallpapers: (wallpapers: WallpaperItem[]) => void;
  
  // Brand updates
  updateBrand: (data: Partial<SiteBrandConfig>) => void;

  // Custom Page Links CRUD
  addCustomPageLink: (link: Omit<CustomPageLink, 'id'>) => CustomPageLink;
  updateCustomPageLink: (id: string, data: Partial<CustomPageLink>) => void;
  deleteCustomPageLink: (id: string) => void;
  duplicateCustomPageLink: (id: string) => CustomPageLink | null;

  // Spotify Player State
  isSpotifyPlayerOpen: boolean;
  setIsSpotifyPlayerOpen: (open: boolean) => void;
  toggleSpotifyPlayer: () => void;

  // Apps CRUD
  updateApp: (id: string, data: Partial<ALXApp>) => void;
  addApp: (app: Omit<ALXApp, 'id'>) => ALXApp;
  deleteApp: (id: string) => void;
  duplicateApp: (id: string) => ALXApp | null;
  moveApp: (index: number, direction: 'up' | 'down') => void;

  // News CRUD
  updateNews: (id: string, data: Partial<NewsArticle>) => void;
  addNews: (article: Omit<NewsArticle, 'id'>) => NewsArticle;
  deleteNews: (id: string) => void;
  duplicateNews: (id: string) => NewsArticle | null;
  deletedNewsIds: string[];
  isSyncingNews: boolean;
  lastNewsSync: number;
  syncNewsArticles: () => Promise<{ success: boolean; count: number; error?: string }>;

  // Products CRUD & Shop Sync
  updateProduct: (id: string, data: Partial<ProductItem>) => void;
  addProduct: (product: Omit<ProductItem, 'id'>) => ProductItem;
  deleteProduct: (id: string) => void;
  moveProduct: (index: number, direction: 'up' | 'down') => void;
  duplicateProduct: (id: string) => ProductItem | null;
  reorderProducts: (newProducts: ProductItem[]) => void;
  isSyncingShop: boolean;
  lastShopSync: number;
  syncShopProducts: () => Promise<{ success: boolean; count: number; error?: string }>;

  // EV Models CRUD
  updateEvModel: (id: string, data: Partial<EVModel>) => void;
  addEvModel: (model: Omit<EVModel, 'id'>) => EVModel;
  deleteEvModel: (id: string) => void;
  moveEvModel: (index: number, direction: 'up' | 'down') => void;
  duplicateEvModel: (id: string) => EVModel | null;
  reorderEvModels: (newModels: EVModel[]) => void;

  // OTA Updates CRUD
  updateOtaUpdate: (id: string, data: Partial<OTAUpdate>) => void;
  addOtaUpdate: (ota: Omit<OTAUpdate, 'id'>) => OTAUpdate;
  deleteOtaUpdate: (id: string) => void;
  duplicateOtaUpdate: (id: string) => OTAUpdate | null;

  // Tutorials CRUD
  updateTutorial: (id: string, data: Partial<Tutorial>) => void;
  addTutorial: (tutorial: Omit<Tutorial, 'id'>) => Tutorial;
  deleteTutorial: (id: string) => void;
  duplicateTutorial: (id: string) => Tutorial | null;

  // Unlock Services CRUD
  updateUnlockService: (id: string, data: Partial<UnlockServiceItem>) => void;
  addUnlockService: (service: Omit<UnlockServiceItem, 'id'>) => UnlockServiceItem;
  deleteUnlockService: (id: string) => void;
  duplicateUnlockService: (id: string) => UnlockServiceItem | null;
  reorderUnlockService: (id: string, direction: 'up' | 'down') => void;

  // Notifications CRUD & Broadcast
  addNotification: (notif: Omit<AppNotification, 'id' | 'date'>) => AppNotification;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Contact Messages Inbox
  contactMessages: ContactMessage[];
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'date'>) => ContactMessage;
  deleteContactMessage: (id: string) => void;
  markContactMessageRead: (id: string) => void;
  markContactMessageUnread: (id: string) => void;
  markAllContactMessagesRead: () => void;
  clearContactMessages: () => void;

  // VIP Members Management CRUD & Batch Import
  vipMembers: VipMember[];
  addVipMember: (member: Omit<VipMember, 'id' | 'createdAt'>) => VipMember;
  updateVipMember: (id: string, data: Partial<VipMember>) => void;
  deleteVipMember: (id: string) => void;
  approveVipMember: (id: string) => void;
  importVipMembers: (membersList: Omit<VipMember, 'id' | 'createdAt'>[]) => number;

  // Download Gateway Modal Trigger
  downloadModalItem: DownloadItem | null;
  openDownloadGateway: (item: DownloadItem) => void;
  closeDownloadGateway: () => void;
  registerDownload: (id: string, category: string) => void;

  // Persistence & Management
  resetToDefaults: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => { success: boolean; message: string };
  currentDataSnapshot: () => any;
  publishOnline: () => Promise<{ success: boolean; message: string; savedInDb?: boolean }>;

  // YouTube Sync & CRUD
  isSyncingYouTube: boolean;
  syncYouTubeChannel: (channelInput?: string, apiKey?: string) => Promise<{ success: boolean; count: number; channelTitle?: string; error?: string }>;
  updateVideo: (id: string, data: Partial<YouTubeVideo>) => void;
  addVideo: (video: Omit<YouTubeVideo, 'id'>) => YouTubeVideo;
  deleteVideo: (id: string) => void;
  duplicateVideo: (id: string) => YouTubeVideo | null;

  // Global Page & Admin state
  activePage: ActivePageView;
  setActivePage: (page: ActivePageView) => void;
  isAdminMode: boolean;
  setIsAdminMode: (active: boolean) => void;
  openAdminTab: (tab: 'brand' | 'messages' | 'apps' | 'news' | 'products' | 'evModels' | 'ota' | 'tutorials' | 'unlock' | 'wallpapers' | 'iptv' | 'youtube' | 'notifications' | 'pages' | 'backup' | 'vipMembers' | 'storage' | 'database') => void;

  // Admin Password & Authentication
  isAdminAuthenticated: boolean;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
  authenticateAdmin: (passwordInput: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;

  // VIP Membership State & Modal
  isVipLoggedIn: boolean;
  setIsVipLoggedIn: (loggedIn: boolean, member?: VipMember) => void;
  currentVipMember: VipMember | null;
  isVipAuthModalOpen: boolean;
  setIsVipAuthModalOpen: (open: boolean) => void;
  openVipModal: () => void;
  logoutVip: () => void;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brand, setBrand] = useState<SiteBrandConfig>(initialBrandConfig);
  const [apps, setApps] = useState<ALXApp[]>(initialApps);
  const [news, setNews] = useState<NewsArticle[]>(initialNews);
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [evModels, setEvModels] = useState<EVModel[]>(initialEvModels);
  const [otaUpdates, setOtaUpdates] = useState<OTAUpdate[]>(initialOtaUpdates);
  const [tutorials, setTutorials] = useState<Tutorial[]>(initialTutorials);
  const [deletedNewsIds, setDeletedNewsIds] = useState<string[]>([]);
  const [deletedAppIds, setDeletedAppIds] = useState<string[]>([]);
  const [unlockServices, setUnlockServices] = useState<UnlockServiceItem[]>(initialUnlockServices);
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>(initialWallpapers);
  const [iptvConfig, setIptvConfig] = useState<IptvPageConfig>(initialIptvConfig);
  const [partners, setPartners] = useState<PartnerItem[]>(initialPartners);
  const [videos, setVideos] = useState<YouTubeVideo[]>(initialVideos);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [customPageLinks, setCustomPageLinks] = useState<CustomPageLink[]>(initialCustomPageLinks);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [vipMembers, setVipMembers] = useState<VipMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.vipMembers) && parsed.vipMembers.length > 0) {
          return parsed.vipMembers;
        }
      }
    } catch {}
    return initialVipMembers;
  });
  const [downloadModalItem, setDownloadModalItem] = useState<DownloadItem | null>(null);

  const [activePage, setActivePage] = useState<ActivePageView>({ type: 'home' });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isSpotifyPlayerOpen, setIsSpotifyPlayerOpen] = useState<boolean>(false);
  const hasCloudLoaded = useRef<boolean>(false);
  const isDataInitializedRef = useRef<boolean>(false);
  const lastSavedTimestampRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  const toggleSpotifyPlayer = () => {
    setIsSpotifyPlayerOpen((prev) => !prev);
  };

  // Admin Auth & Password states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('alx_admin_authed') === 'true';
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [pendingAdminTab, setPendingAdminTab] = useState<'brand' | 'messages' | 'apps' | 'news' | 'products' | 'evModels' | 'ota' | 'tutorials' | 'unlock' | 'wallpapers' | 'youtube' | 'notifications' | 'pages' | 'backup'>('brand');

  // VIP Auth & Membership states (com persistência robusta ao recarregar a página)
  const [currentVipMember, setCurrentVipMember] = useState<VipMember | null>(() => {
    try {
      const isAuth = localStorage.getItem('alx_vip_authenticated') === 'true';
      if (!isAuth) return null;
      const cached = localStorage.getItem('alx_vip_current_member');
      if (cached) {
        return JSON.parse(cached);
      }
      const storedEmail = localStorage.getItem('alx_vip_member_email');
      if (storedEmail) {
        return {
          id: 'vip-session',
          name: storedEmail.split('@')[0],
          email: storedEmail,
          plan: 'Membro VIP',
          joinedDate: '2025-01-01',
          expiryDate: '2099-12-31',
          status: 'Ativo',
          vehicleModel: 'Central Multimídia',
          whatsapp: ''
        };
      }
    } catch {
      return null;
    }
    return null;
  });
  const [isVipLoggedInState, setIsVipLoggedInState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alx_vip_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [isVipAuthModalOpen, setIsVipAuthModalOpen] = useState<boolean>(false);

  // Validate and sync current VIP member with active database sem derrubar a conexão no reload
  useEffect(() => {
    if (!isVipLoggedInState) {
      setCurrentVipMember(null);
      return;
    }

    const storedEmail = localStorage.getItem('alx_vip_member_email');
    if (storedEmail && vipMembers && vipMembers.length > 0) {
      const found = vipMembers.find(
        (m) => m.email?.toLowerCase().trim() === storedEmail.toLowerCase().trim()
      );
      if (found) {
        // Se o membro foi expressamente desativado pelo administrador
        if (found.status === 'Expirado' || found.status === 'Inativo' || found.status === 'Aguardando Aprovação') {
          setIsVipLoggedInState(false);
          setCurrentVipMember(null);
          localStorage.removeItem('alx_vip_authenticated');
          localStorage.removeItem('alx_vip_member_email');
          localStorage.removeItem('alx_vip_current_member');
          return;
        }
        setCurrentVipMember(found);
        localStorage.setItem('alx_vip_current_member', JSON.stringify(found));
      }
    }
  }, [isVipLoggedInState, vipMembers]);

  const setIsVipLoggedIn = (val: boolean, member?: VipMember) => {
    setIsVipLoggedInState(val);
    if (val) {
      localStorage.setItem('alx_vip_authenticated', 'true');
      if (member) {
        localStorage.setItem('alx_vip_member_email', member.email);
        localStorage.setItem('alx_vip_current_member', JSON.stringify(member));
        setCurrentVipMember(member);
      }
    } else {
      localStorage.removeItem('alx_vip_authenticated');
      localStorage.removeItem('alx_vip_member_email');
      localStorage.removeItem('alx_vip_current_member');
      setCurrentVipMember(null);
    }
  };

  const openVipModal = () => {
    setIsVipAuthModalOpen(true);
  };

  const logoutVip = () => {
    setIsVipLoggedIn(false);
  };

  // Dynamic Favicon Updater Effect: substituição instantânea e infalível no Chrome, Edge, Safari e Mobile
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const rawFavicon = (brand.faviconUrl && brand.faviconUrl.trim())
      ? brand.faviconUrl.trim()
      : '/favicon.svg';

    // 1. Identifica MIME type exato para evitar rejeição do navegador
    let mimeType = 'image/png';
    const cleanLower = rawFavicon.split('?')[0].toLowerCase();
    if (cleanLower.endsWith('.svg') || rawFavicon.startsWith('data:image/svg+xml')) {
      mimeType = 'image/svg+xml';
    } else if (cleanLower.endsWith('.ico') || rawFavicon.startsWith('data:image/x-icon') || rawFavicon.startsWith('data:image/vnd.microsoft.icon')) {
      mimeType = 'image/x-icon';
    } else if (cleanLower.endsWith('.png') || rawFavicon.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (cleanLower.endsWith('.jpg') || cleanLower.endsWith('.jpeg') || rawFavicon.startsWith('data:image/jpeg')) {
      mimeType = 'image/jpeg';
    } else if (cleanLower.endsWith('.gif') || rawFavicon.startsWith('data:image/gif')) {
      mimeType = 'image/gif';
    } else if (cleanLower.endsWith('.webp') || rawFavicon.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    }

    // 2. Cache-busting APENAS em URLs HTTP/relativas (NUNCA em data URLs base64 para não corromper bytes)
    let finalUrl = rawFavicon;
    if (!rawFavicon.startsWith('data:')) {
      const separator = rawFavicon.includes('?') ? '&' : '?';
      if (!rawFavicon.includes('t=') && !rawFavicon.includes('_t=')) {
        finalUrl = `${rawFavicon}${separator}t=${Date.now()}`;
      }
    }

    // 3. Remove TODOS os links de favicon existentes no <head>
    // Vital para o Chrome: forçar descarte de cache e remover tags conflitantes
    const oldIcons = document.querySelectorAll<HTMLLinkElement>(
      "link[rel*='icon'], link[rel='apple-touch-icon']"
    );
    oldIcons.forEach((el) => el.parentNode?.removeChild(el));

    // 4. Cria e anexa novo link rel="icon" primário com o MIME type exato
    const iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = mimeType;
    iconLink.href = finalUrl;
    document.head.appendChild(iconLink);

    // 5. Cria link shortcut icon para navegadores legados
    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = mimeType;
    shortcutLink.href = finalUrl;
    document.head.appendChild(shortcutLink);

    // 6. Atualiza apple-touch-icon com o ícone do usuário
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = finalUrl;
    document.head.appendChild(appleLink);
  }, [brand.faviconUrl]);

  const authenticateAdmin = (passwordInput: string) => {
    const currentPass = brand.adminPassword || 'alx2026';
    if (passwordInput === currentPass) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('alx_admin_authed', 'true');
      setIsPasswordModalOpen(false);
      setActivePage({ type: 'admin', activeTab: pendingAdminTab });
      return { success: true };
    }
    return { success: false, error: 'Senha incorreta. Tente novamente.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('alx_admin_authed');
    setActivePage({ type: 'home' });
  };

  const [lastNewsSync, setLastNewsSync] = useState<number>(() => {
    const saved = localStorage.getItem('alx_last_news_sync');
    return saved ? parseInt(saved, 10) : Date.now();
  });
  const [isSyncingNews, setIsSyncingNews] = useState<boolean>(false);

  const [lastShopSync, setLastShopSync] = useState<number>(() => {
    const saved = localStorage.getItem('alx_last_shop_sync');
    return saved ? parseInt(saved, 10) : Date.now();
  });
  const [isSyncingShop, setIsSyncingShop] = useState<boolean>(false);

  // Sync shop products from WooCommerce / REST API
  const syncShopProducts = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    setIsSyncingShop(true);
    try {
      const result = await syncShopProductsFromStore(brand.shopUrl, products);
      const now = Date.now();
      setLastShopSync(now);
      localStorage.setItem('alx_last_shop_sync', now.toString());

      if (result.success && result.products && result.products.length > 0) {
        setProducts(result.products);
        if (hasCloudLoaded.current) {
          // Background shop sync - only updates local state

        }
      }
      return { success: result.success, count: result.count, error: result.error };
    } catch (err: any) {
      console.warn('Shop sync error:', err);
      return { success: false, count: 0, error: err?.message || 'Erro ao sincronizar loja.' };
    } finally {
      setIsSyncingShop(false);
    }
  };

  // Sync news function from live automotive RSS feeds & portal sources
  const syncNewsArticles = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    setIsSyncingNews(true);
    try {
      const result = await syncAllAutomotiveNews(news, deletedNewsIds);
      const now = Date.now();
      setLastNewsSync(now);
      localStorage.setItem('alx_last_news_sync', now.toString());

      if (result.success && result.news) {
        const filteredNews = result.news.filter(n => 
          !deletedNewsIds.includes(n.id) && 
          (!n.slug || !deletedNewsIds.includes(n.slug)) && 
          (!n.title || !deletedNewsIds.includes(n.title.toLowerCase().trim()))
        );
        setNews(filteredNews);
        // Background news sync - only updates local state

      }
      return { success: result.success, count: result.updatedCount, error: result.error };
    } catch (err: any) {
      console.warn('News auto-sync error:', err);
      return { success: false, count: 0, error: err?.message || 'Erro ao sincronizar portais.' };
    } finally {
      setIsSyncingNews(false);
    }
  };

  // Automated 3-Hour Shop Auto-Sync Interval (10800000ms = 3 hours)
  useEffect(() => {
    if (!hasCloudLoaded.current) return;
    const THREE_HOURS = 10800000;
    const timeSinceLastShopSync = Date.now() - lastShopSync;

    // If more than 3 hours passed since last sync, sync immediately
    if (timeSinceLastShopSync >= THREE_HOURS) {
      syncShopProducts();
    }

    // Interval to check and trigger sync every 3 hours
    const timer = setInterval(() => {
      syncShopProducts();
    }, THREE_HOURS);

    return () => clearInterval(timer);
  }, [lastShopSync]);

  // Automated 2-Hour News Auto-Sync Interval (7200000ms = 2 hours)
  useEffect(() => {
    if (!hasCloudLoaded.current) return;
    const TWO_HOURS = 7200000;
    const timeSinceLastSync = Date.now() - lastNewsSync;

    // If more than 2 hours passed since last sync, sync immediately
    if (timeSinceLastSync >= TWO_HOURS) {
      syncNewsArticles();
    }

    // Interval to check and trigger sync every 2 hours
    const timer = setInterval(() => {
      syncNewsArticles();
    }, TWO_HOURS);

    return () => clearInterval(timer);
  }, [lastNewsSync]);

  // Load initial data from localStorage & auto-sync channel
  useEffect(() => {
    let savedData: any = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        savedData = JSON.parse(saved);
        if (savedData.brand) {
          // Permite qualquer nome de marca e dados customizados salvos pelo administrador
          if (savedData.brand.youtubeChannelId?.includes('ALX_AutoTech') || savedData.brand.links?.youtube?.includes('ALX_AutoTech')) {
            savedData.brand.youtubeChannelId = 'https://www.youtube.com/@alx-garage';
            savedData.brand.links = { ...(savedData.brand.links || {}), youtube: 'https://www.youtube.com/@alx-garage' };
          }
          setBrand(savedData.brand);
        }
        if (Array.isArray(savedData.apps)) {
          const mergedApps = savedData.apps.map((sa: any) => {
            const def = initialApps.find(da => da.id === sa.id || da.slug === sa.slug);
            let isMem: boolean;
            if (sa.visibility === 'public_vip' || sa.visibility === 'members_and_link') {
              isMem = true;
            } else if (sa.visibility === 'unlisted' || sa.visibility === 'link_only') {
              isMem = false;
            } else if (sa.visibility === 'public' && sa.isMembersOnly === false) {
              isMem = false;
            } else {
              isMem = Boolean(sa.isMembersOnly || sa.isVipExclusive || isItemVip(sa) || (def && isItemVip(def)));
            }
            return {
              ...sa,
              visibility: sa.visibility || (def as any)?.visibility || (isMem ? 'public_vip' : 'public'),
              isVipExclusive: isMem,
              isMembersOnly: isMem,
            };
          });
          setApps(mergedApps);
        }
        if (Array.isArray(savedData.news)) {
          const mergedNews = savedData.news.map((sn: any) => {
            const def = initialNews.find(dn => dn.id === sn.id || dn.slug === sn.slug);
            const isMem = Boolean(sn.isMembersOnly || sn.isVipExclusive || isItemVip(sn) || (def && isItemVip(def)));
            return {
              ...sn,
              isMembersOnly: isMem,
              isVipExclusive: isMem,
            };
          });
          setNews(mergedNews);
        }
        if (Array.isArray(savedData.products)) setProducts(savedData.products);
        if (Array.isArray(savedData.evModels)) setEvModels(savedData.evModels);
        if (Array.isArray(savedData.otaUpdates)) {
          const normalizedOtas: OTAUpdate[] = savedData.otaUpdates.map((o: any) => ({
            ...o,
            slug: o.slug || (o.version ? o.version.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : o.id),
          }));
          setOtaUpdates(normalizedOtas);
        }
        if (Array.isArray(savedData.tutorials)) {
          const mergedTutorials = savedData.tutorials.map((st: any) => {
            const def = initialTutorials.find(it => it.id === st.id || it.slug === st.slug);
            let isMem: boolean;
            if (st.visibility === 'public_vip' || st.visibility === 'members_and_link') {
              isMem = true;
            } else if (st.visibility === 'unlisted' || st.visibility === 'link_only') {
              isMem = false;
            } else if (st.visibility === 'public' && st.isMembersOnly === false) {
              isMem = false;
            } else {
              isMem = Boolean(st.isMembersOnly || st.isVipExclusive || isItemVip(st) || (def && isItemVip(def)));
            }
            return {
              ...st,
              visibility: st.visibility || (def as any)?.visibility || (isMem ? 'public_vip' : 'public'),
              isMembersOnly: isMem,
              isVipExclusive: isMem,
            };
          });
          setTutorials(mergedTutorials);
        }
        if (Array.isArray(savedData.unlockServices)) setUnlockServices(savedData.unlockServices);
        if (Array.isArray(savedData.wallpapers)) {
          const ghConf = savedData.brand?.githubStorage || initialBrandConfig.githubStorage;
          setWallpapers(normalizeWallpapersList(savedData.wallpapers, ghConf));
        }
        if (savedData.iptvConfig) setIptvConfig(savedData.iptvConfig);
        if (Array.isArray(savedData.partners)) setPartners(savedData.partners);
        if (Array.isArray(savedData.customPageLinks)) setCustomPageLinks(savedData.customPageLinks);
        if (Array.isArray(savedData.contactMessages)) setContactMessages(savedData.contactMessages);
        if (Array.isArray(savedData.vipMembers)) setVipMembers(savedData.vipMembers);
        if (Array.isArray(savedData.deletedNewsIds)) setDeletedNewsIds(savedData.deletedNewsIds);
        if (Array.isArray(savedData.videos)) {
          // Filter out stale placeholder videos with dQw4w9WgXcQ if present
          const validVideos = savedData.videos.filter((v: any) => v.youtubeId !== 'dQw4w9WgXcQ');
          if (validVideos.length > 0) {
            setVideos(validVideos);
          }
        }
        if (savedData.lastSaved) {
          const parsedTime = new Date(savedData.lastSaved).getTime();
          if (!isNaN(parsedTime) && parsedTime > 0) {
            lastSavedTimestampRef.current = Math.max(lastSavedTimestampRef.current, parsedTime);
          }
        }
        isDataInitializedRef.current = true;
      }
    } catch (e) {
      console.error('Failed to load saved site data from localStorage:', e);
    }

    // Processador seguro de dados remotos: impede que dados antigos sobrescrevam alterações recentes
    const processIncomingRemoteData = (remoteData: any, sourceName: string) => {
      if (!remoteData) return;
      if (remoteData.data && typeof remoteData.data === 'object') {
        remoteData = remoteData.data;
      }
      if (isSavingRef.current) {
        console.log();
        return;
      }

      const remoteTime = remoteData.lastSaved ? new Date(remoteData.lastSaved).getTime() : 0;
      const localTime = lastSavedTimestampRef.current || 0;

      // REGRA DE PROTEÇÃO DE DADOS: Se o estado local for mais recente ou igual ao do servidor, PRESERVA o estado local!
      if (localTime > 0 && remoteTime > 0 && remoteTime <= localTime) {
        console.log();
        return;
      }

      isDataInitializedRef.current = true;
      hasCloudLoaded.current = true;

      if (remoteTime > 0) {
        lastSavedTimestampRef.current = Math.max(lastSavedTimestampRef.current, remoteTime);
      }

      // 1. Aplicativos (Direct Replace do MySQL - Sem mesclagem de itens locais deletados)
      if (Array.isArray(remoteData.apps)) {
        setApps(remoteData.apps);
      }

      // 2. Notícias (respeita deletedNewsIds permanentemente)
      if (Array.isArray(remoteData.news)) {
        const currentDeleted = remoteData.deletedNewsIds || [];
        const filteredRemote = remoteData.news.filter((rn: NewsArticle) => 
          !currentDeleted.includes(rn.id) &&
          (!rn.slug || !currentDeleted.includes(rn.slug)) &&
          (!rn.title || !currentDeleted.includes(rn.title.toLowerCase().trim()))
        );
        setNews(filteredRemote);
      }

      // 3. Demais coleções diretamente do MySQL
      if (Array.isArray(remoteData.products)) setProducts(remoteData.products);
      if (Array.isArray(remoteData.evModels)) setEvModels(remoteData.evModels);
      if (Array.isArray(remoteData.otaUpdates)) {
        const normalizedRemoteOtas: OTAUpdate[] = remoteData.otaUpdates.map((o: any) => ({
          ...o,
          slug: o.slug || (o.version ? o.version.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : o.id),
        }));
        setOtaUpdates(normalizedRemoteOtas);
      }
      if (Array.isArray(remoteData.tutorials)) setTutorials(remoteData.tutorials);
      if (Array.isArray(remoteData.unlockServices)) setUnlockServices(remoteData.unlockServices);
      if (Array.isArray(remoteData.wallpapers)) {
        const ghConf = remoteData.brand?.githubStorage || brand.githubStorage;
        setWallpapers(normalizeWallpapersList(remoteData.wallpapers, ghConf));
      }
      if (remoteData.iptvConfig) setIptvConfig(remoteData.iptvConfig);
      if (Array.isArray(remoteData.partners)) setPartners(remoteData.partners);
      if (Array.isArray(remoteData.customPageLinks)) setCustomPageLinks(remoteData.customPageLinks);
      if (Array.isArray(remoteData.vipMembers)) setVipMembers(remoteData.vipMembers);
      if (Array.isArray(remoteData.contactMessages)) setContactMessages(remoteData.contactMessages);
      if (Array.isArray(remoteData.deletedNewsIds)) {
        setDeletedNewsIds(remoteData.deletedNewsIds);
      }
      if (Array.isArray(remoteData.videos)) {
        const validVideos = remoteData.videos.filter((v: any) => v.youtubeId !== 'dQw4w9WgXcQ');
        if (validVideos.length > 0) setVideos(validVideos);
      }
      if (Array.isArray(remoteData.notifications)) setNotifications(remoteData.notifications);

      // 4. Marca e configurações
      if (remoteData.brand && typeof remoteData.brand === 'object') {
        setBrand((prev) => ({
          ...prev,
          ...remoteData.brand,
          links: {
            ...(prev.links || {}),
            ...(remoteData.brand.links || {}),
          },
          adminPassword: (() => {
            const remotePass = remoteData.brand?.adminPassword;
            if (remotePass && remotePass.trim() !== '' && remotePass.trim() !== 'alx2026') return remotePass.trim();
            return prev.adminPassword || 'alx2026';
          })(),
        }));
      }

      // Atualiza o cache local do navegador para espelhar a resposta do banco
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
      } catch {}
    };

    // Auto-sync YouTube videos from @alx-garage if never synced or missing latest
    const channelToSync = savedData?.brand?.youtubeChannelId || 'https://www.youtube.com/@alx-garage';
    syncYouTubeVideosFromChannel({ channelInput: channelToSync })
      .then((res) => {
        if (res.success && res.videos.length > 0) {
          setVideos(res.videos);
          setBrand(prev => {
            const updated = {
              ...prev,
              youtubeChannelId: res.channelId || prev.youtubeChannelId || channelToSync,
              youtubeLastSync: new Date().toISOString(),
            };
            return updated;
          });
        }
      })
      .catch((err) => {
        console.warn('Initial YouTube auto-sync background check:', err);
      });

    // 2. Carrega do servidor Hostinger (/api/get.php) na inicialização
    fetch(`/api/get.php?t=${Date.now()}`)
      .then(res => res.ok ? res.json() : null)
      .then(hostingerData => {
        hasCloudLoaded.current = true;
        if (hostingerData && (hostingerData.brand || hostingerData.apps || hostingerData.products || hostingerData.tutorials)) {
          processIncomingRemoteData(hostingerData, 'Hostinger');
        }
      })
      .catch(() => {
        hasCloudLoaded.current = true;
      });

    // 3. Sincronização em tempo real instantânea entre abas via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('alx_site_data_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'DATA_UPDATED' && event.data?.payload) {
            processIncomingRemoteData(event.data.payload, 'BroadcastChannel (Tempo Real)');
          }
        };
      }
    } catch {}

    // 4. Listener de Storage Event (fallback instantâneo entre abas do mesmo navegador)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          processIncomingRemoteData(parsed, 'StorageEvent (Tempo Real)');
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 5. Polling em tempo real (a cada 7 segundos) para visitantes sem necessidade de refresh manual
    const pollRemoteData = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetch(`/api/get.php?t=${Date.now()}`)
        .then(res => res.ok ? res.json() : null)
        .then(remote => {
          if (remote && (remote.brand || remote.apps || remote.tutorials || remote.products)) {
            processIncomingRemoteData(remote, 'AutoSync Servidor');
          }
        })
        .catch(() => {});
    };

    const pollInterval = setInterval(pollRemoteData, 7000);

    // Sincroniza imediatamente quando a janela/aba volta a ter foco
    const handleFocusOrVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        pollRemoteData();
      }
    };
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('focus', handleFocusOrVisible);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('focus', handleFocusOrVisible);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  // Aplica dinamicamente a cor da página ativa (transição automática de cor por página)
  useEffect(() => {
    const pageHex = getPageThemeHex(activePage.type, brand?.pageColors);
    applyPageThemeHex(pageHex);
  }, [activePage.type, brand?.pageColors]);

  // Mantém uma referência sempre atualizada do estado global para evitar closures desatualizadas ao salvar
  const stateRef = useRef({
    brand,
    apps,
    news,
    products,
    evModels,
    otaUpdates,
    videos,
    tutorials,
    notifications,
    customPageLinks,
    unlockServices,
    contactMessages,
    vipMembers,
    wallpapers,
    iptvConfig,
  });

  useEffect(() => {
    stateRef.current = {
      brand,
      apps,
      news,
      products,
      evModels,
      otaUpdates,
      videos,
      tutorials,
      notifications,
      customPageLinks,
      unlockServices,
      contactMessages,
      vipMembers,
      wallpapers,
      iptvConfig,
      partners,
    };
  }, [
    brand,
    apps,
    news,
    products,
    evModels,
    otaUpdates,
    videos,
    tutorials,
    notifications,
    customPageLinks,
    unlockServices,
    contactMessages,
    vipMembers,
    wallpapers,
    iptvConfig,
    partners,
  ]);

  // Sync state to localStorage, Hostinger Server & Banco de Dados MySQL
  const saveToStorage = async (
    overridesOrBrand?: Partial<FullSiteDataPayload> | SiteBrandConfig,
    newApps?: ALXApp[],
    newNews?: NewsArticle[],
    newProducts?: ProductItem[],
    newEvModels?: EVModel[],
    newOta?: OTAUpdate[],
    newVideos?: YouTubeVideo[],
    newTutorials?: Tutorial[],
    newNotifications?: AppNotification[],
    newCustomPageLinks?: CustomPageLink[],
    newUnlockServices?: UnlockServiceItem[],
    newContactMessages?: ContactMessage[],
    newVipMembers?: VipMember[],
    newWallpapers?: WallpaperItem[],
    newIptvConfig?: IptvPageConfig
  ) => {
    try {
      isDataInitializedRef.current = true;
      hasCloudLoaded.current = true;
      isSavingRef.current = true;

      const now = Date.now();
      lastSavedTimestampRef.current = now;
      const nowIso = new Date(now).toISOString();

      const cur = stateRef.current;

      let overrides: Partial<FullSiteDataPayload> = {};

      if (overridesOrBrand && typeof overridesOrBrand === 'object') {
        if ('brandName' in overridesOrBrand) {
          // Positional brand argument
          overrides = {
            brand: overridesOrBrand as SiteBrandConfig,
            apps: newApps,
            news: newNews,
            products: newProducts,
            evModels: newEvModels,
            otaUpdates: newOta,
            videos: newVideos,
            tutorials: newTutorials,
            notifications: newNotifications,
            customPageLinks: newCustomPageLinks,
            unlockServices: newUnlockServices,
            contactMessages: newContactMessages,
            vipMembers: newVipMembers,
            wallpapers: newWallpapers,
            iptvConfig: newIptvConfig,
          };
        } else {
          // Overrides payload object like { brand: ..., apps: ... }
          overrides = overridesOrBrand as Partial<FullSiteDataPayload>;
        }
      }

      const rawBrand = overrides.brand
        ? { 
            ...cur.brand, 
            ...overrides.brand, 
            links: { ...(cur.brand?.links || {}), ...(overrides.brand.links || {}) },
            contactCards: overrides.brand.contactCards !== undefined ? overrides.brand.contactCards : (cur.brand?.contactCards || []),
          }
        : cur.brand;
      const finalBrand = { ...rawBrand };
      if ((finalBrand as any).brand) {
        delete (finalBrand as any).brand;
      }

      const payload: FullSiteDataPayload = {
        brand: finalBrand,
        apps: overrides.apps !== undefined ? overrides.apps : cur.apps,
        news: overrides.news !== undefined ? overrides.news : cur.news,
        products: overrides.products !== undefined ? overrides.products : cur.products,
        evModels: overrides.evModels !== undefined ? overrides.evModels : cur.evModels,
        otaUpdates: overrides.otaUpdates !== undefined ? overrides.otaUpdates : cur.otaUpdates,
        videos: overrides.videos !== undefined ? overrides.videos : cur.videos,
        tutorials: overrides.tutorials !== undefined ? overrides.tutorials : cur.tutorials,
        unlockServices: overrides.unlockServices !== undefined ? overrides.unlockServices : cur.unlockServices,
        wallpapers: overrides.wallpapers !== undefined ? overrides.wallpapers : cur.wallpapers,
        iptvConfig: overrides.iptvConfig !== undefined ? overrides.iptvConfig : cur.iptvConfig,
        partners: overrides.partners !== undefined ? overrides.partners : cur.partners,
        notifications: overrides.notifications !== undefined ? overrides.notifications : cur.notifications,
        customPageLinks: overrides.customPageLinks !== undefined ? overrides.customPageLinks : cur.customPageLinks,
        contactMessages: overrides.contactMessages !== undefined ? overrides.contactMessages : cur.contactMessages,
        vipMembers: overrides.vipMembers !== undefined ? overrides.vipMembers : cur.vipMembers,
        deletedNewsIds: overrides.deletedNewsIds !== undefined ? overrides.deletedNewsIds : (cur.deletedNewsIds || deletedNewsIds),
        deletedAppIds: overrides.deletedAppIds !== undefined ? overrides.deletedAppIds : (cur.deletedAppIds || deletedAppIds),
        lastSaved: nowIso,
      };

      stateRef.current = {
        ...cur,
        ...payload,
      };
      
      // 1. Salva sincronamente em localStorage local (garantia instantânea)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (storageErr) {
        console.warn('LocalStorage quota or save warning:', storageErr);
      }

      // 2. Salva no Banco de Dados MySQL e Servidor (/api/save.php) com mecanismo de retentativa
      let saveSuccess = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch('/api/save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: payload }),
          });
          if (res.ok) {
            saveSuccess = true;
            break;
          }
        } catch {
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 400 * attempt));
          }
        }
      }

      if (!saveSuccess) {
        console.warn('[Sync] Não foi possível confirmar no servidor após retentativas. Mantido localmente.');
      }

      // 3. Notifica instantaneamente todas as outras abas/janelas do navegador (Tempo Real)
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('alx_site_data_sync');
          bc.postMessage({ type: 'DATA_UPDATED', payload, timestamp: now });
          bc.close();
        }
      } catch {}
    } catch (e) {
      console.warn('Could not save data:', e);
    } finally {
      isSavingRef.current = false;
    }
  };

  // VIP Members Handlers
  const addVipMember = (memberData: Omit<VipMember, 'id' | 'createdAt'>): VipMember => {
    const newMember: VipMember = {
      ...memberData,
      id: `vip-m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newMember, ...vipMembers];
    setVipMembers(updated);
    saveToStorage({ vipMembers: updated });
    return newMember;
  };

  const updateVipMember = (id: string, data: Partial<VipMember>) => {
    const updated = vipMembers.map((m) => (m.id === id ? { ...m, ...data } : m));
    setVipMembers(updated);
    saveToStorage({ vipMembers: updated });
  };

  const deleteVipMember = (id: string) => {
    const updated = vipMembers.filter((m) => m.id !== id);
    setVipMembers(updated);
    saveToStorage({ vipMembers: updated });
  };

  const approveVipMember = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);
    const expStr = expDate.toISOString().slice(0, 10);

    const updated = vipMembers.map((m) => {
      if (m.id === id) {
        let finalExpiration = expStr;
        if (m.period === 'Anual') {
          const d = new Date();
          d.setFullYear(d.getFullYear() + 1);
          finalExpiration = d.toISOString().slice(0, 10);
        } else if (m.period === 'Vitalício') {
          finalExpiration = 'Vitalício';
        }
        return {
          ...m,
          status: 'Ativo' as const,
          startDate: today,
          expirationDate: finalExpiration,
        };
      }
      return m;
    });
    setVipMembers(updated);
    saveToStorage({ vipMembers: updated });
  };

  const importVipMembers = (membersList: Omit<VipMember, 'id' | 'createdAt'>[]): number => {
    const newMembers: VipMember[] = membersList.map((m, idx) => ({
      ...m,
      id: `vip-m-imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    }));
    const updated = [...newMembers, ...vipMembers];
    setVipMembers(updated);
    saveToStorage({ vipMembers: updated });
    return newMembers.length;
  };

  // IPTV Handlers
  const updateIptvConfig = (data: Partial<IptvPageConfig>) => {
    const updated = { ...iptvConfig, ...data };
    setIptvConfig(updated);
    saveToStorage({ iptvConfig: updated });
  };

  const addIptvApp = (appData: Omit<IptvAppItem, 'id'>): IptvAppItem => {
    const newApp: IptvAppItem = {
      ...appData,
      id: `iptv-app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updatedApps = [...(iptvConfig.apps || []), newApp];
    const updated = { ...iptvConfig, apps: updatedApps };
    setIptvConfig(updated);
    saveToStorage({ iptvConfig: updated });
    return newApp;
  };

  const updateIptvApp = (id: string, data: Partial<IptvAppItem>) => {
    const updatedApps = (iptvConfig.apps || []).map((a) => (a.id === id ? { ...a, ...data } : a));
    const updated = { ...iptvConfig, apps: updatedApps };
    setIptvConfig(updated);
    saveToStorage({ iptvConfig: updated });
  };

  const deleteIptvApp = (id: string) => {
    const updatedApps = (iptvConfig.apps || []).filter((a) => a.id !== id);
    const updated = { ...iptvConfig, apps: updatedApps };
    setIptvConfig(updated);
    saveToStorage({ iptvConfig: updated });
  };

  const duplicateIptvApp = (id: string): IptvAppItem | null => {
    const original = (iptvConfig.apps || []).find((a) => a.id === id);
    if (!original) return null;
    const newId = `iptv-app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const cloned: IptvAppItem = {
      ...original,
      id: newId,
      name: `${original.name} (Cópia)`,
    };
    const updatedApps = [cloned, ...(iptvConfig.apps || [])];
    const updated = { ...iptvConfig, apps: updatedApps };
    setIptvConfig(updated);
    saveToStorage({ iptvConfig: updated });
    return cloned;
  };

  const addIptvLink = (linkData: Omit<IptvSimpleLink, 'id'>): IptvSimpleLink => {
    const newLink: IptvSimpleLink = {
      ...linkData,
      id: `iptv-link-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updatedLinks = [...(iptvConfig.links || []), newLink];
    const updated = { ...iptvConfig, links: updatedLinks };
    setIptvConfig(updated);
    saveToStorage({ iptvConfig: updated });
    return newLink;
  };

  const updateIptvLink = (id: string, data: Partial<IptvSimpleLink>) => {
    const updatedLinks = (iptvConfig.links || []).map((l) => (l.id === id ? { ...l, ...data } : l));
    const updated = { ...iptvConfig, links: updatedLinks };
    setIptvConfig(updated);
    saveToStorage({ iptvConfig: updated });
  };

  const deleteIptvLink = (id: string) => {
    const updatedLinks = (iptvConfig.links || []).filter((l) => l.id !== id);
    const updated = { ...iptvConfig, links: updatedLinks };
    setIptvConfig(updated);
    saveToStorage({ iptvConfig: updated });
  };

  // Partners CRUD Handlers
  const addPartner = (data: Omit<PartnerItem, 'id'> | PartnerItem): PartnerItem => {
    const id = (data as any).id || `partner-${Date.now()}`;
    const newPartner: PartnerItem = {
      ...(data as any),
      id,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      active: data.active !== undefined ? data.active : true,
      order: data.order !== undefined ? data.order : (partners.length + 1),
    };
    const updated = [newPartner, ...partners];
    setPartners(updated);
    saveToStorage({ partners: updated });
    return newPartner;
  };

  const updatePartner = (id: string, data: Partial<PartnerItem>) => {
    const updated = partners.map((p) => (p.id === id ? { ...p, ...data } : p));
    setPartners(updated);
    saveToStorage({ partners: updated });
  };

  const deletePartner = (id: string) => {
    const updated = partners.filter((p) => p.id !== id);
    setPartners(updated);
    saveToStorage({ partners: updated });
  };

  const duplicatePartner = (id: string): PartnerItem | null => {
    const original = partners.find((p) => p.id === id);
    if (!original) return null;
    const cloned: PartnerItem = {
      ...original,
      id: `partner-${Date.now()}`,
      slug: `${original.slug || 'parceiro'}-copia-${Date.now().toString().slice(-4)}`,
      name: `${original.name} (Cópia)`,
      order: (original.order || 0) + 1,
    };
    const updated = [cloned, ...partners];
    setPartners(updated);
    saveToStorage({ partners: updated });
    return cloned;
  };

  const reorderPartners = (partnerIds: string[]) => {
    const map = new Map<string, PartnerItem>(partners.map((p) => [p.id, p]));
    const updated: PartnerItem[] = [];
    partnerIds.forEach((id, index) => {
      const p = map.get(id);
      if (p) {
        updated.push({ ...p, order: index + 1 });
        map.delete(id);
      }
    });
    map.forEach((p) => {
      if (p) updated.push(p);
    });
    setPartners(updated);
    saveToStorage({ partners: updated });
  };

  // Contact Messages Handlers
  const addContactMessage = (msgData: Omit<ContactMessage, 'id' | 'date'>): ContactMessage => {
    const newMsg: ContactMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      date: new Date().toLocaleString('pt-BR'),
      read: false,
    };
    const updated = [newMsg, ...contactMessages];
    setContactMessages(updated);
    saveToStorage({ contactMessages: updated });

    // Auto notify admin & bell
    addNotification({
      title: `Nova Mensagem: ${newMsg.name}`,
      message: `${newMsg.subject}: ${newMsg.message.slice(0, 75)}${newMsg.message.length > 75 ? '...' : ''}`,
      category: 'broadcast',
      linkType: 'home',
    });

    return newMsg;
  };

  const deleteContactMessage = (id: string) => {
    const updated = contactMessages.filter((m) => m.id !== id);
    setContactMessages(updated);
    saveToStorage({ contactMessages: updated });
  };

  const markContactMessageRead = (id: string) => {
    const updated = contactMessages.map((m) => (m.id === id ? { ...m, read: true } : m));
    setContactMessages(updated);
    saveToStorage({ contactMessages: updated });
  };

  const markContactMessageUnread = (id: string) => {
    const updated = contactMessages.map((m) => (m.id === id ? { ...m, read: false } : m));
    setContactMessages(updated);
    saveToStorage({ contactMessages: updated });
  };

  const markAllContactMessagesRead = () => {
    const updated = contactMessages.map((m) => ({ ...m, read: true }));
    setContactMessages(updated);
    saveToStorage({ contactMessages: updated });
  };

  const clearContactMessages = () => {
    setContactMessages([]);
    saveToStorage({ contactMessages: [] });
  };

  // Notifications Handlers
  const addNotification = (notifData: Omit<AppNotification, 'id' | 'date'>): AppNotification => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      date: 'Agora',
      isRead: false,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveToStorage({ notifications: updated });
    
    // Trigger real system push notification on mobile / browser
    sendBrowserNotification(newNotif.title, {
      body: newNotif.message,
    });

    return newNotif;
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    saveToStorage({ notifications: updated });
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    saveToStorage({ notifications: updated });
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveToStorage({ notifications: updated });
  };

  // Download Gateway Modal & Register Download Counter
  const openDownloadGateway = (item: DownloadItem) => {
    setDownloadModalItem(item);
  };

  const closeDownloadGateway = () => {
    setDownloadModalItem(null);
  };

  const registerDownload = (id: string, category: string) => {
    if (!id) return;
    if (category === 'app') {
      setApps((prevApps) => {
        const updated = prevApps.map((a) => {
          if (a.id === id || (a.slug && a.slug === id) || a.name === id) {
            const currentCount = a.downloadsCount ?? 0;
            return { ...a, downloadsCount: currentCount + 1 };
          }
          return a;
        });
        saveToStorage({ apps: updated });
        return updated;
      });
    } else if (category === 'ota') {
      setOtaUpdates((prevOta) => {
        const updated = prevOta.map((o) => {
          if (o.id === id || (o.slug && o.slug === id) || o.title === id) {
            const currentCount = o.downloadsCount ?? 0;
            return { ...o, downloadsCount: currentCount + 1 };
          }
          return o;
        });
        saveToStorage({ otaUpdates: updated });
        return updated;
      });
    } else if (category === 'wallpaper') {
      setWallpapers((prevWps) => {
        const updated = prevWps.map((w) => {
          if (w.id === id || (w.slug && w.slug === id) || w.title === id) {
            const currentCount = w.downloadCount ?? 0;
            return { ...w, downloadCount: currentCount + 1 };
          }
          return w;
        });
        saveToStorage({ wallpapers: updated });
        return updated;
      });
    }
  };

  // Sync URL Hash on load
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setActivePage({ type: 'admin' });
      } else if (hash === '#noticias') {
        setActivePage({ type: 'noticias' });
      } else if (hash === '#apps') {
        setActivePage({ type: 'apps' });
      } else if (hash === '#radar-ota' || hash === '#ota') {
        setActivePage({ type: 'radar-ota' });
      } else if (hash === '#tutoriais') {
        setActivePage({ type: 'tutoriais' });
      } else if (hash === '#youtube') {
        setActivePage({ type: 'youtube' });
      } else if (hash === '#calculadora') {
        setActivePage({ type: 'calculadora' });
      } else if (hash === '#comunidade') {
        setActivePage({ type: 'comunidade' });
      } else if (hash === '#vip') {
        setActivePage({ type: 'vip' });
      } else if (hash === '#produtos') {
        setActivePage({ type: 'produtos' });
      } else if (hash === '#shop') {
        setActivePage({ type: 'shop' });
      } else if (hash.startsWith('#app/')) {
        const slug = hash.replace('#app/', '');
        if (slug) setActivePage({ type: 'app', idOrSlug: slug });
      } else if (hash.startsWith('#noticia/')) {
        const slug = hash.replace('#noticia/', '');
        if (slug) setActivePage({ type: 'news', idOrSlug: slug });
      } else if (hash.startsWith('#produto/')) {
        const slug = hash.replace('#produto/', '');
        if (slug) setActivePage({ type: 'product', id: slug });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Update Brand
  const updateBrand = (data: Partial<SiteBrandConfig>) => {
    const updated = {
      ...brand,
      ...data,
      links: { ...brand.links, ...(data.links || {}) },
    };
    setBrand(updated);
    saveToStorage({ brand: updated });
  };

  // Apps CRUD
  const updateApp = (id: string, data: Partial<ALXApp>) => {
    const updated = apps.map(app => (app.id === id ? { ...app, ...data } : app));
    setApps(updated);
    saveToStorage({ apps: updated });
  };

  const addApp = (newAppData: Omit<ALXApp, 'id'>): ALXApp => {
    const newApp: ALXApp = {
      ...newAppData,
      id: `app-${Date.now()}`,
      slug: newAppData.slug || `app-${Date.now()}`,
    };
    const updated = [newApp, ...apps];
    setApps(updated);
    saveToStorage({ apps: updated });

    // Auto notify users & mobile devices
    addNotification({
      title: `Novo App: ${newApp.name}`,
      message: `Versão ${newApp.version} disponível para download seguro no ecossistema ALX.`,
      category: 'app',
      linkType: 'app',
      linkTarget: newApp.slug || newApp.id,
      link: `#app/${newApp.slug || newApp.id}`,
    });

    return newApp;
  };

  const deleteApp = (id: string) => {
    const updated = apps.filter(app => app.id !== id);
    setApps(updated);
    saveToStorage({ apps: updated });
  };

  const duplicateApp = (id: string): ALXApp | null => {
    const target = apps.find((a) => a.id === id);
    if (!target) return null;

    const newId = `app-${Date.now()}`;
    const newSlug = `${target.slug || 'app'}-copia-${Math.floor(Math.random() * 1000)}`;

    const cloned: ALXApp = {
      ...target,
      id: newId,
      slug: newSlug,
      name: `${target.name} (Cópia)`,
      downloadsCount: 0,
      isNew: true,
      isUpdated: true,
    };

    // Prepend to top of apps array so it appears as most recent
    const updated = [cloned, ...apps];

    setApps(updated);
    saveToStorage({ apps: updated });
    return cloned;
  };

  const moveApp = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= apps.length) return;
    const newApps = [...apps];
    const temp = newApps[index];
    newApps[index] = newApps[targetIndex];
    newApps[targetIndex] = temp;
    setApps(newApps);
    saveToStorage({ apps: newApps });
  };

  // News CRUD
  const updateNews = (id: string, data: Partial<NewsArticle>) => {
    const updated = news.map(item => (item.id === id ? { ...item, ...data } : item));
    setNews(updated);
    saveToStorage({ news: updated });
  };

  const addNews = (articleData: Omit<NewsArticle, 'id'>): NewsArticle => {
    const newArticle: NewsArticle = {
      ...articleData,
      id: `news-${Date.now()}`,
      slug: articleData.slug || `noticia-${Date.now()}`,
    };
    const updated = [newArticle, ...news];
    setNews(updated);
    saveToStorage({ news: updated });

    // Auto notify users
    addNotification({
      title: `Nova Notícia: ${newArticle.title}`,
      message: newArticle.summary || 'Confira a matéria completa na íntegra.',
      category: 'news',
      linkType: 'noticias',
      linkTarget: newArticle.slug || newArticle.id,
      link: `#noticia/${newArticle.slug || newArticle.id}`,
    });

    return newArticle;
  };

  const deleteNews = (id: string) => {
    const targetItem = news.find(item => item.id === id);
    const updatedNews = news.filter(item => item.id !== id);
    const updatedDeletedIds = Array.from(new Set([
      ...deletedNewsIds,
      id,
      ...(targetItem?.slug ? [targetItem.slug] : []),
      ...(targetItem?.title ? [targetItem.title.toLowerCase().trim()] : [])
    ]));
    setDeletedNewsIds(updatedDeletedIds);
    setNews(updatedNews);
    saveToStorage({ news: updatedNews, deletedNewsIds: updatedDeletedIds });
  };

  const duplicateNews = (id: string): NewsArticle | null => {
    const original = news.find(item => item.id === id);
    if (!original) return null;
    const newId = `news-${Date.now()}`;
    const cloned: NewsArticle = {
      ...original,
      id: newId,
      slug: `${original.slug || 'noticia'}-copia-${Math.floor(Math.random() * 1000)}`,
      title: `${original.title} (Cópia)`,
      publishedAt: new Date().toISOString().split('T')[0],
      date: 'Agora',
    };
    const updated = [cloned, ...news];
    setNews(updated);
    saveToStorage({ news: updated });
    return cloned;
  };

  // Products CRUD
  const updateProduct = (id: string, data: Partial<ProductItem>) => {
    const updated = products.map(item => (item.id === id ? { ...item, ...data } : item));
    setProducts(updated);
    saveToStorage({ products: updated });
  };

  const addProduct = (prodData: Omit<ProductItem, 'id'>): ProductItem => {
    const newProduct: ProductItem = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveToStorage({ products: updated });

    // Auto notify users
    addNotification({
      title: `Novo Produto: ${newProduct.name}`,
      message: `${newProduct.price} • ${newProduct.badge || 'Disponível na loja'}`,
      category: 'product',
      linkType: 'produtos',
      linkTarget: newProduct.id,
      link: `#produto/${newProduct.id}`,
    });

    return newProduct;
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(item => item.id !== id);
    setProducts(updated);
    saveToStorage({ products: updated });
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;
    const newProducts = [...products];
    const [moved] = newProducts.splice(index, 1);
    newProducts.splice(targetIndex, 0, moved);
    setProducts(newProducts);
    saveToStorage({ products: newProducts });
  };

  const duplicateProduct = (id: string): ProductItem | null => {
    const original = products.find(p => p.id === id);
    if (!original) return null;
    const dup: ProductItem = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Cópia)`,
    };
    const updated = [dup, ...products];
    setProducts(updated);
    saveToStorage({ products: updated });
    return dup;
  };

  const reorderProducts = (newProducts: ProductItem[]) => {
    setProducts(newProducts);
    saveToStorage({ products: newProducts });
  };

  // EV Models CRUD
  const updateEvModel = (id: string, data: Partial<EVModel>) => {
    const updated = evModels.map(m => (m.id === id ? { ...m, ...data } : m));
    setEvModels(updated);
    saveToStorage({ evModels: updated });
  };

  const addEvModel = (modelData: Omit<EVModel, 'id'>): EVModel => {
    const newModel: EVModel = {
      ...modelData,
      id: `ev-${Date.now()}`,
    };
    const updated = [...evModels, newModel];
    setEvModels(updated);
    saveToStorage({ evModels: updated });
    return newModel;
  };

  const deleteEvModel = (id: string) => {
    const updated = evModels.filter(m => m.id !== id);
    setEvModels(updated);
    saveToStorage({ evModels: updated });
  };

  const moveEvModel = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index >= evModels.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...evModels];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setEvModels(updated);
    saveToStorage({ evModels: updated });
  };

  const duplicateEvModel = (id: string): EVModel | null => {
    const modelToDup = evModels.find(m => m.id === id);
    if (!modelToDup) return null;
    const index = evModels.findIndex(m => m.id === id);
    const newModel: EVModel = {
      ...modelToDup,
      id: `ev-${Date.now()}`,
      name: `${modelToDup.name} (Cópia)`,
    };
    const updated = [...evModels];
    updated.splice(index + 1, 0, newModel);
    setEvModels(updated);
    saveToStorage({ evModels: updated });
    return newModel;
  };

  const reorderEvModels = (newModels: EVModel[]) => {
    setEvModels(newModels);
    saveToStorage({ evModels: newModels });
  };

  // OTA Updates CRUD
  const updateOtaUpdate = (id: string, data: Partial<OTAUpdate>) => {
    const updated = otaUpdates.map(o => {
      if (o.id !== id) return o;
      let finalSlug = data.slug !== undefined ? data.slug?.trim() : o.slug;
      if (!finalSlug) {
        const raw = data.version || o.version || data.title || o.title || id;
        finalSlug = raw
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      } else {
        finalSlug = finalSlug
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9-_]/g, '')
          .replace(/^-+|-+$/g, '');
      }
      return { ...o, ...data, slug: finalSlug || o.slug || id };
    });
    setOtaUpdates(updated);
    saveToStorage({ otaUpdates: updated });
  };

  const addOtaUpdate = (otaData: Omit<OTAUpdate, 'id'>): OTAUpdate => {
    const rawSlug = otaData.slug?.trim() || otaData.version?.trim() || otaData.title?.trim() || `ota-${Date.now()}`;
    const cleanSlug = rawSlug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newOta: OTAUpdate = {
      ...otaData,
      id: `ota-${Date.now()}`,
      slug: cleanSlug || `ota-${Date.now()}`,
    };
    const updated = [newOta, ...otaUpdates];
    setOtaUpdates(updated);
    saveToStorage({ otaUpdates: updated });

    // Auto notify users & mobile devices
    addNotification({
      title: `Novo Arquivo OTA: Versão ${newOta.version}`,
      message: `Compatível com ${newOta.applicableCars || newOta.modelTarget || 'veículos homologados'}. Baixe para pen drive.`,
      category: 'ota',
      linkType: 'radar-ota',
      targetId: newOta.slug || newOta.id,
      link: `/ota/${newOta.slug || newOta.id}`,
    });

    return newOta;
  };

  const deleteOtaUpdate = (id: string) => {
    const updated = otaUpdates.filter(o => o.id !== id);
    setOtaUpdates(updated);
    saveToStorage({ otaUpdates: updated });
  };

  const duplicateOtaUpdate = (id: string): OTAUpdate | null => {
    const original = otaUpdates.find(o => o.id === id);
    if (!original) return null;
    const newId = `ota-${Date.now()}`;
    const cloned: OTAUpdate = {
      ...original,
      id: newId,
      slug: `${original.slug || 'ota'}-copia-${Math.floor(Math.random() * 1000)}`,
      version: `${original.version} (Cópia)`,
    };
    const updated = [cloned, ...otaUpdates];
    setOtaUpdates(updated);
    saveToStorage({ otaUpdates: updated });
    return cloned;
  };

  // Tutorials CRUD
  const updateTutorial = (id: string, data: Partial<Tutorial>) => {
    const updated = tutorials.map(t => (t.id === id ? { ...t, ...data } : t));
    setTutorials(updated);
    saveToStorage({ tutorials: updated });
  };

  const addTutorial = (tutData: Omit<Tutorial, 'id'>): Tutorial => {
    const newTut: Tutorial = {
      ...tutData,
      id: `tut-${Date.now()}`,
      slug: tutData.slug || `tutorial-${Date.now()}`
    };
    const updated = [newTut, ...tutorials];
    setTutorials(updated);
    saveToStorage({ tutorials: updated });
    return newTut;
  };

  const deleteTutorial = (id: string) => {
    const updated = tutorials.filter(t => t.id !== id);
    setTutorials(updated);
    saveToStorage({ tutorials: updated });
  };

  const duplicateTutorial = (id: string): Tutorial | null => {
    const original = tutorials.find(t => t.id === id);
    if (!original) return null;
    const newId = `tut-${Date.now()}`;
    const cloned: Tutorial = {
      ...original,
      id: newId,
      slug: `${original.slug || 'tutorial'}-copia-${Math.floor(Math.random() * 1000)}`,
      title: `${original.title} (Cópia)`,
    };
    const updated = [cloned, ...tutorials];
    setTutorials(updated);
    saveToStorage({ tutorials: updated });
    return cloned;
  };

  // Unlock Services CRUD
  const updateUnlockService = (id: string, data: Partial<UnlockServiceItem>) => {
    const updated = unlockServices.map(s => (s.id === id ? { ...s, ...data } : s));
    setUnlockServices(updated);
    saveToStorage({ unlockServices: updated });
  };

  const addUnlockService = (serviceData: Omit<UnlockServiceItem, 'id'>): UnlockServiceItem => {
    const newId = `srv-${Date.now()}`;
    const newService: UnlockServiceItem = {
      ...serviceData,
      id: newId,
      slug: serviceData.slug || serviceData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `servico-${Date.now()}`
    };
    const updated = [newService, ...unlockServices];
    setUnlockServices(updated);
    saveToStorage({ unlockServices: updated });
    return newService;
  };

  const deleteUnlockService = (id: string) => {
    const updated = unlockServices.filter(s => s.id !== id);
    setUnlockServices(updated);
    saveToStorage({ unlockServices: updated });
  };

  const duplicateUnlockService = (id: string): UnlockServiceItem | null => {
    const original = unlockServices.find(s => s.id === id);
    if (!original) return null;
    const newId = `srv-${Date.now()}`;
    const cloned: UnlockServiceItem = {
      ...original,
      id: newId,
      slug: `${original.slug || 'servico'}-copia-${Math.floor(Math.random() * 1000)}`,
      title: `${original.title} (Cópia)`,
    };
    const updated = [cloned, ...unlockServices];
    setUnlockServices(updated);
    saveToStorage({ unlockServices: updated });
    return cloned;
  };

  const reorderUnlockService = (id: string, direction: 'up' | 'down') => {
    const index = unlockServices.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index >= unlockServices.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...unlockServices];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setUnlockServices(reordered);
    saveToStorage({ unlockServices: reordered });
  };

  // Wallpapers CRUD
  const updateWallpaper = (id: string, data: Partial<WallpaperItem>) => {
    const updated = wallpapers.map(w => (w.id === id ? { ...w, ...data } : w));
    setWallpapers(updated);
    saveToStorage({ wallpapers: updated });
  };

  const addWallpaper = (wpData: Omit<WallpaperItem, 'id'>): WallpaperItem => {
    const newWp: WallpaperItem = {
      ...wpData,
      id: `wp-${Date.now()}`,
      slug: wpData.slug || `wallpaper-${Date.now()}`,
      downloadCount: wpData.downloadCount || 0
    };
    const updated = [newWp, ...wallpapers];
    setWallpapers(updated);
    saveToStorage({ wallpapers: updated });

    addNotification({
      title: `Novo Wallpaper: ${newWp.title}`,
      message: `${newWp.resolution || 'Alta Resolução'} • ${newWp.category}`,
      category: 'system',
      linkType: 'wallpapers',
      linkTarget: newWp.slug || newWp.id,
      link: `#wallpaper/${newWp.slug || newWp.id}`,
    });

    return newWp;
  };

  const deleteWallpaper = (id: string) => {
    const updated = wallpapers.filter(w => w.id !== id);
    setWallpapers(updated);
    saveToStorage({ wallpapers: updated });
  };

  const duplicateWallpaper = (id: string): WallpaperItem | null => {
    const target = wallpapers.find(w => w.id === id);
    if (!target) return null;
    const cloned: WallpaperItem = {
      ...target,
      id: `wp-${Date.now()}`,
      slug: `${target.slug || 'wallpaper'}-copia-${Math.floor(Math.random() * 1000)}`,
      title: `${target.title} (Cópia)`,
    };
    const updated = [cloned, ...wallpapers];
    setWallpapers(updated);
    saveToStorage({ wallpapers: updated });
    return cloned;
  };

  const reorderWallpapers = (newWps: WallpaperItem[]) => {
    setWallpapers(newWps);
    saveToStorage({ wallpapers: newWps });
  };

  // Custom Page Links CRUD
  const addCustomPageLink = (linkData: Omit<CustomPageLink, 'id'>): CustomPageLink => {
    const newLink: CustomPageLink = {
      ...linkData,
      id: `link-${Date.now()}`,
    };
    const updated = [...customPageLinks, newLink];
    setCustomPageLinks(updated);
    saveToStorage({ customPageLinks: updated });
    return newLink;
  };

  const updateCustomPageLink = (id: string, data: Partial<CustomPageLink>) => {
    const updated = customPageLinks.map(l => (l.id === id ? { ...l, ...data } : l));
    setCustomPageLinks(updated);
    saveToStorage({ customPageLinks: updated });
  };

  const deleteCustomPageLink = (id: string) => {
    const updated = customPageLinks.filter(l => l.id !== id);
    setCustomPageLinks(updated);
    saveToStorage({ customPageLinks: updated });
  };

  const duplicateCustomPageLink = (id: string): CustomPageLink | null => {
    const original = customPageLinks.find(l => l.id === id);
    if (!original) return null;
    const newId = `link-${Date.now()}`;
    const cloned: CustomPageLink = {
      ...original,
      id: newId,
      title: `${original.title} (Cópia)`,
      url: `${original.url}-copia`,
    };
    const updated = [...customPageLinks, cloned];
    setCustomPageLinks(updated);
    saveToStorage({ customPageLinks: updated });
    return cloned;
  };

  // Reset to Defaults
  const resetToDefaults = () => {
    setBrand(initialBrandConfig);
    setApps(initialApps);
    setNews(initialNews);
    setProducts(initialProducts);
    setEvModels(initialEvModels);
    setOtaUpdates(initialOtaUpdates);
    setTutorials(initialTutorials);
    setUnlockServices(initialUnlockServices);
    setVideos(initialVideos);
    setWallpapers(initialWallpapers);
    setCustomPageLinks(initialCustomPageLinks);
    setIptvConfig(initialIptvConfig);
    setPartners(initialPartners);

    saveToStorage({
      brand: initialBrandConfig,
      apps: initialApps,
      news: initialNews,
      products: initialProducts,
      evModels: initialEvModels,
      otaUpdates: initialOtaUpdates,
      tutorials: initialTutorials,
      unlockServices: initialUnlockServices,
      videos: initialVideos,
      wallpapers: initialWallpapers,
      customPageLinks: initialCustomPageLinks,
      iptvConfig: initialIptvConfig,
      partners: initialPartners,
    });
  };

  // Export JSON
  const exportDataJson = (): string => {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      brand,
      apps,
      news,
      products,
      evModels,
      otaUpdates,
      tutorials,
      unlockServices,
      wallpapers,
      iptvConfig,
      partners,
      videos,
      customPageLinks,
      vipMembers,
      contactMessages,
    };
    return JSON.stringify(payload, null, 2);
  };

  // Import JSON
  const importDataJson = (jsonStr: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.brand) setBrand(parsed.brand);
      if (Array.isArray(parsed.apps)) setApps(parsed.apps);
      if (Array.isArray(parsed.news)) setNews(parsed.news);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (Array.isArray(parsed.evModels)) setEvModels(parsed.evModels);
      if (Array.isArray(parsed.otaUpdates)) setOtaUpdates(parsed.otaUpdates);
      if (Array.isArray(parsed.tutorials)) setTutorials(parsed.tutorials);
      if (Array.isArray(parsed.unlockServices)) setUnlockServices(parsed.unlockServices);
      if (Array.isArray(parsed.wallpapers)) setWallpapers(parsed.wallpapers);
      if (parsed.iptvConfig) setIptvConfig(parsed.iptvConfig);
      if (Array.isArray(parsed.partners)) setPartners(parsed.partners);
      if (Array.isArray(parsed.videos)) setVideos(parsed.videos);
      if (Array.isArray(parsed.customPageLinks)) setCustomPageLinks(parsed.customPageLinks);
      if (Array.isArray(parsed.vipMembers)) setVipMembers(parsed.vipMembers);
      if (Array.isArray(parsed.contactMessages)) setContactMessages(parsed.contactMessages);

      saveToStorage({
        brand: parsed.brand || brand,
        apps: parsed.apps || apps,
        news: parsed.news || news,
        products: parsed.products || products,
        evModels: parsed.evModels || evModels,
        otaUpdates: parsed.otaUpdates || otaUpdates,
        tutorials: parsed.tutorials || tutorials,
        unlockServices: parsed.unlockServices || unlockServices,
        wallpapers: parsed.wallpapers || wallpapers,
        iptvConfig: parsed.iptvConfig || iptvConfig,
        partners: parsed.partners || partners,
        videos: parsed.videos || videos,
        customPageLinks: parsed.customPageLinks || customPageLinks,
        vipMembers: parsed.vipMembers || vipMembers,
        contactMessages: parsed.contactMessages || contactMessages,
      });

      return { success: true, message: 'Dados e imagens importados com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Erro ao importar JSON: ${err?.message || 'Arquivo inválido'}` };
    }
  };

  // Captura snapshot completo e atualizado de todos os dados do site
  const currentDataSnapshot = () => {
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    return {
      brand,
      apps,
      news,
      products,
      evModels,
      otaUpdates,
      videos,
      tutorials,
      unlockServices,
      notifications,
      customPageLinks,
      contactMessages,
      vipMembers,
      wallpapers,
      iptvConfig,
      lastSaved: nowIso,
    };
  };

  // Publica explicitamente todos os dados atuais no servidor Hostinger e no Banco de Dados MySQL
  const publishOnline = async (): Promise<{ success: boolean; message: string; savedInDb?: boolean }> => {
    try {
      isDataInitializedRef.current = true;
      hasCloudLoaded.current = true;
      isSavingRef.current = true;
      const now = Date.now();
      lastSavedTimestampRef.current = now;
      const payload = currentDataSnapshot();

      // 1. Salva em localStorage local
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {}

      // 1.1 Dispara atualização em tempo real para todas as abas abertas
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('alx_site_data_sync');
          bc.postMessage({ type: 'DATA_UPDATED', payload, timestamp: now });
          bc.close();
        }
      } catch {}

      // 2. Salva no Banco de Dados MySQL e no Servidor Hostinger (/api/save.php)
      let hostingerOk = false;
      let savedInDb = false;
      let apiMessage = '';
      try {
        const hRes = await fetch('/api/save.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });
        if (hRes.ok) {
          hostingerOk = true;
          const hData = await hRes.json();
          savedInDb = Boolean(hData?.savedInDb);
          if (hData?.message) apiMessage = hData.message;
        } else {
          try {
            const errData = await hRes.json();
            if (errData?.error) apiMessage = errData.error;
          } catch {}
        }
      } catch (err: any) {
        console.warn('Erro ao conectar com /api/save.php:', err);
      }

      return { 
        success: true, 
        message: apiMessage || (savedInDb 
          ? 'Dados gravados com sucesso permanente no Banco de Dados MySQL da Hostinger!' 
          : hostingerOk 
            ? 'Dados gravados com sucesso no Servidor Hostinger!' 
            : 'Salvo com sucesso no armazenamento local!'),
        savedInDb
      };
    } catch (e: any) {
      return { success: false, message: `Erro ao salvar localmente: ${e?.message || 'Falha ao processar'}` };
    } finally {
      isSavingRef.current = false;
    }
  };

  const [isSyncingYouTube, setIsSyncingYouTube] = useState<boolean>(false);

  // Videos CRUD
  const updateVideo = (id: string, data: Partial<YouTubeVideo>) => {
    const updated = videos.map(v => (v.id === id ? { ...v, ...data } : v));
    setVideos(updated);
    saveToStorage({ videos: updated });
  };

  const addVideo = (vidData: Omit<YouTubeVideo, 'id'>): YouTubeVideo => {
    const newVideo: YouTubeVideo = {
      ...vidData,
      id: `vid-${Date.now()}`,
    };
    const updated = [newVideo, ...videos];
    setVideos(updated);
    saveToStorage({ videos: updated });
    return newVideo;
  };

  const deleteVideo = (id: string) => {
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    saveToStorage({ videos: updated });
  };

  const duplicateVideo = (id: string): YouTubeVideo | null => {
    const original = videos.find(v => v.id === id);
    if (!original) return null;
    const newId = `vid-${Date.now()}`;
    const cloned: YouTubeVideo = {
      ...original,
      id: newId,
      title: `${original.title} (Cópia)`,
    };
    const updated = [cloned, ...videos];
    setVideos(updated);
    saveToStorage({ videos: updated });
    return cloned;
  };

  // Sync YouTube Channel
  const syncYouTubeChannel = async (
    channelInput?: string,
    apiKey?: string
  ): Promise<{ success: boolean; count: number; channelTitle?: string; error?: string }> => {
    setIsSyncingYouTube(true);
    const targetChannel = channelInput || brand.youtubeChannelId || brand.links.youtube;
    const targetKey = apiKey !== undefined ? apiKey : brand.youtubeApiKey;

    try {
      const result = await syncYouTubeVideosFromChannel({
        channelInput: targetChannel,
        apiKey: targetKey,
      });

      if (result.success && result.videos.length > 0) {
        setVideos(result.videos);
        const updatedBrand: SiteBrandConfig = {
          ...brand,
          youtubeChannelId: result.channelId || brand.youtubeChannelId,
          youtubeApiKey: targetKey,
          youtubeLastSync: new Date().toISOString(),
        };
        setBrand(updatedBrand);
        saveToStorage({ brand: updatedBrand, videos: result.videos });
        setIsSyncingYouTube(false);
        return {
          success: true,
          count: result.videos.length,
          channelTitle: result.channelTitle,
        };
      } else {
        setIsSyncingYouTube(false);
        return {
          success: false,
          count: 0,
          error: result.error || 'Não foi possível encontrar vídeos para este canal.',
        };
      }
    } catch (err: any) {
      setIsSyncingYouTube(false);
      return {
        success: false,
        count: 0,
        error: err?.message || 'Erro desconhecido ao sincronizar com o YouTube.',
      };
    }
  };

  const openAdminTab = (tab: 'brand' | 'messages' | 'apps' | 'news' | 'products' | 'evModels' | 'ota' | 'tutorials' | 'unlock' | 'wallpapers' | 'iptv' | 'youtube' | 'notifications' | 'pages' | 'backup' | 'vipMembers' | 'storage' | 'database') => {
    setPendingAdminTab(tab);
    if (isAdminAuthenticated) {
      setActivePage({ type: 'admin', activeTab: tab });
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  return (
    <SiteDataContext.Provider
      value={{
        brand,
        apps,
        news,
        products,
        evModels,
        otaUpdates,
        tutorials,
        unlockServices,
        videos,
        notifications,
        customPageLinks,
        updateBrand,
        addCustomPageLink,
        updateCustomPageLink,
        deleteCustomPageLink,
        duplicateCustomPageLink,
        updateApp,
        addApp,
        deleteApp,
        duplicateApp,
        moveApp,
        updateNews,
        addNews,
        deleteNews,
        duplicateNews,
        deletedNewsIds,
        isSyncingNews,
        lastNewsSync,
        syncNewsArticles,
        updateProduct,
        addProduct,
        deleteProduct,
        moveProduct,
        duplicateProduct,
        reorderProducts,
        isSyncingShop,
        lastShopSync,
        syncShopProducts,
        updateEvModel,
        addEvModel,
        deleteEvModel,
        moveEvModel,
        duplicateEvModel,
        reorderEvModels,
        updateOtaUpdate,
        addOtaUpdate,
        deleteOtaUpdate,
        duplicateOtaUpdate,
        updateTutorial,
        addTutorial,
        deleteTutorial,
        duplicateTutorial,
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
        reorderWallpapers,
        iptvConfig,
        updateIptvConfig,
        addIptvApp,
        updateIptvApp,
        deleteIptvApp,
        duplicateIptvApp,
        addIptvLink,
        updateIptvLink,
        deleteIptvLink,
        partners,
        addPartner,
        updatePartner,
        deletePartner,
        duplicatePartner,
        reorderPartners,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        contactMessages,
        addContactMessage,
        deleteContactMessage,
        markContactMessageRead,
        markContactMessageUnread,
        markAllContactMessagesRead,
        clearContactMessages,
        vipMembers,
        addVipMember,
        updateVipMember,
        deleteVipMember,
        approveVipMember,
        importVipMembers,
        downloadModalItem,
        openDownloadGateway,
        closeDownloadGateway,
        registerDownload,
        isSyncingYouTube,
        syncYouTubeChannel,
        updateVideo,
        addVideo,
        deleteVideo,
        duplicateVideo,
        resetToDefaults,
        exportDataJson,
        importDataJson,
        currentDataSnapshot,
        publishOnline,
        activePage,
        setActivePage,
        isAdminMode,
        setIsAdminMode,
        openAdminTab,
        isSpotifyPlayerOpen,
        setIsSpotifyPlayerOpen,
        toggleSpotifyPlayer,
        isAdminAuthenticated,
        isPasswordModalOpen,
        setIsPasswordModalOpen,
        authenticateAdmin,
        logoutAdmin,
        isVipLoggedIn: isVipLoggedInState,
        setIsVipLoggedIn,
        currentVipMember,
        isVipAuthModalOpen,
        setIsVipAuthModalOpen,
        openVipModal,
        logoutVip,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
};

export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
};
