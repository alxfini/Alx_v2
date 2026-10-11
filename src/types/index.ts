export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: 'Carros Elétricos' | 'Tecnologia' | 'Multimídia' | 'Atualizações' | 'Dicas';
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  sourceUrl?: string;
  tags: string[];
  isMembersOnly?: boolean;
  isVipExclusive?: boolean;
}

export interface YouTubeVideo {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  views?: string;
  isFeatured?: boolean;
  videoUrl?: string;
  category: string;
  thumbnailUrl?: string;
  isMembersOnly?: boolean;
  isVipExclusive?: boolean;
}

export interface ALXApp {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;
  iconName?: string;
  iconUrl?: string;
  coverImage: string;
  screenshots: string[];
  features: string[];
  compatibility: string[];
  requirements: string[];
  version: string;
  priceText: string;
  isFree: boolean;
  buyUrl?: string;
  downloadUrl?: string;
  storageType?: 'server' | 'github' | 'external';
  githubAssetId?: number;
  githubReleaseTag?: string;
  previousDownloadUrl?: string;
  previousAssetId?: number;
  badge?: string;
  badgeColor?: string;
  isVipExclusive?: boolean;
  isMembersOnly?: boolean;
  showInIptv?: boolean;
  category?: string;
  downloadsCount?: number;
  isUpdated?: boolean;
  isNew?: boolean;
  updatedAt?: string;
  changelog?: { version: string; date: string; changes: string[] }[];
}

export interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  category: string;
  description: string;
  fullDescription: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  images?: string[];
  buyUrl: string;
  badge?: string;
  inStock: boolean;
  specs?: { label: string; value: string }[];
  rating?: number;
  featured?: boolean;
}

export interface VipBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface VipPaymentConfig {
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixReceiverName: string;
  pixReceiverCity: string;
  mercadoPagoSubUrl: string;
  monthlySubPrice: string;
  pixSinglePrice: string;
  approvalNoticeText?: string;
  notificationEmail?: string;
}

export interface VipMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  planType: 'Assinatura Mensal (Mercado Pago)' | 'Pagamento Avulso (Pix)' | 'Assinante VIP' | 'Apoiador WhatsApp' | 'Membro YouTube' | 'Apoiador Canal' | 'Vitalício' | 'Outro' | string;
  period: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual' | 'Vitalício' | '30 dias' | string;
  startDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD or 'Vitalício'
  status: 'Ativo' | 'Aguardando Aprovação' | 'Expirando em Breve' | 'Expirado' | 'Inativo';
  notes?: string;
  createdAt: string;
}

export interface VipContentItem {
  id: string;
  title: string;
  type: 'app' | 'video' | 'download' | 'tutorial' | 'news' | 'wallpaper';
  category: string;
  description: string;
  imageUrl?: string;
  downloadSize?: string;
  downloadUrl?: string;
  videoUrl?: string;
  releaseDate: string;
  isNew?: boolean;
  version?: string;
}

export interface CustomSocialLink {
  id: string;
  platform: string; // e.g. 'whatsapp' | 'tiktok' | 'facebook' | 'x' | 'discord' | 'threads' | 'linkedin' | 'github' | 'twitch' | 'bluesky' | 'kwai' | 'custom';
  title: string;
  url: string;
  active?: boolean;
}

export interface HeaderMenuItemConfig {
  id: string;
  label: string;
  pageType?: string;
  url: string;
  location: 'main' | 'dropdown';
  visible: boolean;
  icon?: string;
  badge?: string;
  isCustom?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read?: boolean;
}

export interface ContactCardItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: 'email' | 'whatsapp' | 'telegram' | 'phone' | 'address' | 'hours' | 'link' | 'custom';
  value: string;
  buttonText?: string;
  iconName?: string;
  colorScheme?: 'brand' | 'emerald' | 'sky' | 'amber' | 'purple' | 'red' | 'indigo' | 'white';
  active: boolean;
}

export interface GitHubStorageConfig {
  enabled?: boolean;
  token?: string; // GitHub Personal Access Token (PAT)
  owner?: string; // Usuário ou organização (ex: alxrdrgo)
  repo?: string; // Nome do repositório (ex: storage-apks)
  defaultReleaseTag?: string; // ex: "v1.0" ou "apks"
  lastTestedAt?: string;
}

export interface SiteBrandConfig {
  brandName: string;
  tagline: string;
  subTagline: string;
  logoUrl: string;
  defaultShareImageUrl?: string; // Imagem padrão de compartilhamento para WhatsApp, Telegram e redes sociais (OpenGraph)
  youtubeSectionLogoUrl?: string;
  shopSectionLogoUrl?: string;
  imeiPageLogoUrl?: string;
  imeiPageBgUrl?: string;
  faviconUrl?: string;
  adminPassword?: string;
  logoSvgCode?: string;
  heroBackgroundUrl: string;
  links: {
    youtube: string;
    telegram: string;
    instagram: string;
    spotify?: string;
    vipStore: string;
    email: string;
    web3formsKey?: string;
    customWebhookUrl?: string;
  };
  customSocialLinks?: CustomSocialLink[];
  footerIconsOrder?: string[];
  adminTabOrder?: string[];
  aboutText?: string;
  termsText?: string;
  privacyText?: string;
  contactTitle?: string;
  contactDescription?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactAddress?: string;
  contactHours?: string;
  contactCustomText?: string;
  contactCards?: ContactCardItem[];
  headerMenuItems?: HeaderMenuItemConfig[];
  youtubeChannelId?: string;
  youtubeApiKey?: string;
  youtubeAutoSync?: boolean;
  youtubeLastSync?: string;
  shopUrl?: string;
  shopLastSync?: string;
  shopAutoSync?: boolean;
  vipPayment?: VipPaymentConfig;
  themeHue?: number;
  themeHex?: string;
  pageColors?: Record<string, string>;
  tutorialCopyrightTitle?: string;
  tutorialCopyrightBadge?: string;
  tutorialCopyrightText?: string;
  vipNoticeTitle?: string;
  vipNoticeMessage?: string;
  vipNoticeDate?: string;
  vipNoticeActive?: boolean;
  vipWhatsappGroupUrl?: string;
  vipWhatsappGroupTitle?: string;
  vipWhatsappGroupDesc?: string;
  githubStorage?: GitHubStorageConfig;
}

export interface EVModel {
  id: string;
  name: string;
  badge: string;
  batteryCapacityKwh: number;
  wltpRangeKm: number;
  inmetroRangeKm: number;
  maxDcChargingKw: number;
  acChargingKw: number;
  efficiencyKwh100km: number;
  imageUrl: string;
  features: string[];
}

export interface OTAUpdate {
  id: string;
  slug?: string; // Link direto automático e editável
  title?: string;
  imageUrl?: string;
  applicableCars: string; // Carros que usarão o arquivo
  version: string; // Versão
  mcu: string; // MCU
  downloadUrl: string; // Link para download
  tutorialUrl?: string; // Link para tutorial externo ou página de instruções
  tutorialId?: string; // ID de tutorial cadastrado internamente
  releaseDate?: string;
  downloadsCount?: number;
  status?: string;
  size?: string;
  changelog?: string[];
  installationGuide?: string;
  modelTarget?: string; // Alias de retrocompatibilidade
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  author?: string;
  date: string;
  readTime?: string;
  applicableCars?: string;
  tags?: string[];
  docNumber?: string;
  isMembersOnly?: boolean;
  isVipExclusive?: boolean;
}

export interface VipUser {
  name: string;
  email: string;
  tier: string;
  memberSince: string;
}

export interface WallpaperItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  category: string;
  previewUrl: string;
  videoUrl?: string;
  downloadUrl: string;
  resolution?: string;
  aspectRatio?: string;
  tags?: string[];
  badge?: string;
  downloadCount?: number;
  isMembersOnly?: boolean;
  isVipExclusive?: boolean;
  date?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'app' | 'ota' | 'news' | 'system' | 'broadcast' | 'tutorial' | 'product';
  type?: 'app' | 'ota' | 'news' | 'system' | 'broadcast' | 'tutorial' | 'product';
  date: string;
  link?: string;
  linkType?: 'home' | 'app' | 'radar-ota' | 'tutoriais' | 'noticias' | 'produtos' | 'vip' | 'wallpapers' | 'external';
  linkTarget?: string;
  targetId?: string;
  isRead?: boolean;
  version?: string;
  badge?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  category: 'app' | 'ota';
  version?: string;
  size?: string;
  rawDownloadUrl: string;
  applicableCars?: string;
  instructions?: string;
  slug?: string;
}

export interface CustomPageLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
  badge?: string;
  category?: string;
  isExternal?: boolean;
  openInNewTab?: boolean;
  order?: number;
}

export interface UnlockServiceItem {
  id: string;
  slug?: string;
  docNumber?: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  price?: string;
  originalPrice?: string;
  badge?: string;
  badgeColor?: string;
  author?: string;
  date?: string;
  applicableCars?: string;
  tags?: string[];
  whatsappContactMessage?: string;
  warrantyTitle?: string;
  warrantyText?: string;
}

export interface IptvAppItem {
  id: string;
  name: string;
  version?: string;
  category?: string;
  description: string;
  iconUrl?: string;
  downloadUrl: string;
  badge?: string;
  isVipExclusive?: boolean;
  fileSize?: string;
}

export interface IptvSimpleLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  badge?: string;
  isExternal?: boolean;
}

export interface IptvPageConfig {
  title: string;
  summary: string;
  guideContent: string;
  youtubeUrl?: string;
  apps: IptvAppItem[];
  links: IptvSimpleLink[];
}

export type ActivePageView =
  | { type: 'home' }
  | { type: 'calculadora' }
  | { type: 'radar-ota' }
  | { type: 'ota'; idOrSlug?: string }
  | { type: 'tutoriais' }
  | { type: 'tutorial'; idOrSlug?: string }
  | { type: 'desbloqueio' }
  | { type: 'servico-desbloqueio'; idOrSlug?: string }
  | { type: 'apps' }
  | { type: 'wallpapers' }
  | { type: 'wallpaper'; idOrSlug?: string }
  | { type: 'iptv' }
  | { type: 'youtube' }
  | { type: 'noticias' }
  | { type: 'comunidade' }
  | { type: 'vip' }
  | { type: 'produtos' }
  | { type: 'shop' }
  | { type: 'gerador-imei' }
  | { type: 'imei' }
  | { type: 'sobre' }
  | { type: 'termos' }
  | { type: 'privacidade' }
  | { type: 'contato' }
  | { type: 'app'; idOrSlug: string }
  | { type: 'news'; idOrSlug: string }
  | { type: 'product'; idOrSlug: string }
  | { type: 'admin'; initialTab?: 'brand' | 'messages' | 'apps' | 'news' | 'products' | 'evModels' | 'ota' | 'tutorials' | 'unlock' | 'wallpapers' | 'iptv' | 'youtube' | 'notifications' | 'pages' | 'backup' | 'vipMembers'; activeTab?: string };


