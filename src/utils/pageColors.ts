/**
 * Utilitário central de gerenciamento de cores temáticas por página.
 * Define a cor padrão de cada seção do portal e gerencia a transição dinâmica.
 */

export const DEFAULT_PAGE_COLORS: Record<string, string> = {
  home: '#ffffff',
  desbloqueio: '#D4F906',
  'servico-desbloqueio': '#D4F906',
  apps: '#06F980',
  app: '#06F980',
  'radar-ota': '#06E8F9',
  ota: '#06E8F9',
  youtube: '#F91010',
  tutoriais: '#1EFF00',
  tutorial: '#1EFF00',
  noticias: '#a4fcff',
  news: '#a4fcff',
  shop: '#f6f6f6',
  produtos: '#f6f6f6',
  product: '#f6f6f6',
  vip: '#c6f50b',
  calculadora: '#D4F906',
  iptv: '#c6f50b',
  parceiros: '#FFDD00',
  wallpapers: '#FFDD00',
  wallpaper: '#FFDD00',
  imei: '#FFDD00',
  'gerador-imei': '#FFDD00',
  contato: '#06F980',
  sobre: '#d2d2d2',
  termos: '#d2d2d2',
  privacidade: '#d2d2d2',
  admin: '#FFDD00',
};

export interface PageColorDefinition {
  key: string;
  name: string;
  description: string;
  defaultHex: string;
}

export const EDITABLE_PAGES: PageColorDefinition[] = [
  { key: 'home', name: 'Página Principal (Home)', description: 'Página inicial do portal ALX', defaultHex: '#ffffff' },
  { key: 'desbloqueio', name: 'Desbloqueio Multimídia', description: 'Serviços e soluções de multimídia', defaultHex: '#D4F906' },
  { key: 'apps', name: 'Apps Automotivos', description: 'Catálogo de APKs e instaladores', defaultHex: '#06F980' },
  { key: 'radar-ota', name: 'Radar OTA (Atualizações)', description: 'Atualizações de sistema BYD/GWM', defaultHex: '#06E8F9' },
  { key: 'youtube', name: 'Canal YouTube', description: 'Vídeos e tutoriais da garagem', defaultHex: '#F91010' },
  { key: 'tutoriais', name: 'Tutoriais & Guias', description: 'Passo a passo técnico ilustrado', defaultHex: '#1EFF00' },
  { key: 'noticias', name: 'Notícias Automotivas', description: 'Feed de notícias do setor automotivo', defaultHex: '#a4fcff' },
  { key: 'shop', name: 'Loja / ALX Shop', description: 'Acessórios e produtos à venda', defaultHex: '#f6f6f6' },
  { key: 'vip', name: 'Área VIP (Membros)', description: 'Planos exclusivos e comunidade fechada', defaultHex: '#c6f50b' },
  { key: 'calculadora', name: 'Calculadora & Simulador EV', description: 'Estimador de recarga e custo', defaultHex: '#D4F906' },
  { key: 'iptv', name: 'IPTV & Streaming', description: 'Canais e listas de streaming', defaultHex: '#c6f50b' },
  { key: 'parceiros', name: 'Parceiros Homologados', description: 'Rede credenciada de parceiros e oficinas', defaultHex: '#FFDD00' },
  { key: 'wallpapers', name: 'Wallpapers / Capas', description: 'Galeria de fotos para telas veiculares', defaultHex: '#FFDD00' },
  { key: 'imei', name: 'Senha IMEI / Gerador', description: 'Gerador de senha para centrais multimídia', defaultHex: '#FFDD00' },
  { key: 'contato', name: 'Contato & Suporte', description: 'Canais de atendimento e contato oficial', defaultHex: '#06F980' },
];

/**
 * Converte código Hexadecimal para RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) {
    return { r: 255, g: 255, b: 255 };
  }
  const r = parseInt(clean.substring(0, 2), 16) || 255;
  const g = parseInt(clean.substring(2, 4), 16) || 255;
  const b = parseInt(clean.substring(4, 6), 16) || 255;
  return { r, g, b };
}

/**
 * Retorna uma versão ligeiramente mais clara/vibrante para estados de hover
 */
export function getHoverColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  if (r > 240 && g > 240 && b > 240) {
    return '#e5e5e5';
  }
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c * 1.15)));
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

/**
 * Retorna a cor exata configurada para a página ativa
 */
export function getPageThemeHex(pageType: string, customColors?: Record<string, string>): string {
  let hex: string | undefined;

  if (customColors) {
    if (pageType === 'imei' || pageType === 'gerador-imei') {
      hex = customColors['imei'] || customColors['gerador-imei'];
    } else {
      hex = customColors[pageType];
    }
  }

  if (!hex || !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim())) {
    // Mapeamentos específicos ou sinônimos
    if (pageType === 'ota') hex = customColors?.['radar-ota'] || customColors?.['ota'] || DEFAULT_PAGE_COLORS['radar-ota'];
    else if (pageType === 'tutorial') hex = customColors?.['tutoriais'] || customColors?.['tutorial'] || DEFAULT_PAGE_COLORS['tutoriais'];
    else if (pageType === 'servico-desbloqueio') hex = customColors?.['desbloqueio'] || customColors?.['servico-desbloqueio'] || DEFAULT_PAGE_COLORS['desbloqueio'];
    else if (pageType === 'produtos' || pageType === 'product') hex = customColors?.['shop'] || customColors?.['produtos'] || DEFAULT_PAGE_COLORS['shop'];
    else if (pageType === 'gerador-imei' || pageType === 'imei') hex = customColors?.['imei'] || customColors?.['gerador-imei'] || DEFAULT_PAGE_COLORS['imei'];
    else if (pageType === 'wallpaper') hex = customColors?.['wallpapers'] || customColors?.['wallpaper'] || DEFAULT_PAGE_COLORS['wallpapers'];
    else if (pageType === 'app') hex = customColors?.['apps'] || customColors?.['app'] || DEFAULT_PAGE_COLORS['apps'];
    else if (pageType === 'news') hex = customColors?.['noticias'] || customColors?.['news'] || DEFAULT_PAGE_COLORS['noticias'];
    else hex = DEFAULT_PAGE_COLORS[pageType] || '#E5AD06';
  }

  let finalHex = (hex || '#E5AD06').trim();

  // Se for a página IMEI/gerador-imei e estiver com o azul ciano antigo (#06E8F9), substitui pelo amarelo (#E5AD06)
  if ((pageType === 'imei' || pageType === 'gerador-imei') && finalHex.toUpperCase() === '#06E8F9') {
    finalHex = '#E5AD06';
  }

  // Se for a página Tutoriais e estiver com o cinza antigo (#D2D2D2) ou amarelo antigo, substitui pelo verde neon (#1EFF00)
  if ((pageType === 'tutoriais' || pageType === 'tutorial') && (finalHex.toUpperCase() === '#D2D2D2' || finalHex.toUpperCase() === '#E5AD06' || finalHex.toUpperCase() === '#EBBF01')) {
    finalHex = '#1EFF00';
  }

  // Se for a página YouTube e estiver com o amarelo antigo (#FFDD00 / #E5AD06 / #EBBF01), substitui pelo vermelho oficial #F91010
  if (pageType === 'youtube' && (finalHex.toUpperCase() === '#FFDD00' || finalHex.toUpperCase() === '#E5AD06' || finalHex.toUpperCase() === '#EBBF01')) {
    finalHex = '#F91010';
  }

  return finalHex;
}

/**
 * Aplica a cor da página diretamente no DOM do navegador em tempo real
 */
export function applyPageThemeHex(hex: string) {
  let cleanHex = hex.trim();
  if (!cleanHex.startsWith('#')) {
    cleanHex = `#${cleanHex}`;
  }
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleanHex)) {
    cleanHex = '#ffffff';
  }

  const rgb = hexToRgb(cleanHex);
  const hoverHex = getHoverColor(cleanHex);

  document.documentElement.style.setProperty('--color-brand', cleanHex);
  document.documentElement.style.setProperty('--color-brand-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  document.documentElement.style.setProperty('--color-brand-hover', hoverHex);

  // Armazena no cache local para carregamento instantâneo no próximo acesso
  try {
    localStorage.setItem('alx_theme_hex', cleanHex);
  } catch {}
}
