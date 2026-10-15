import { SiteBrandConfig, CustomPageLink, HeaderMenuItemConfig } from '../types';

export const DEFAULT_HEADER_ITEMS: HeaderMenuItemConfig[] = [
  {
    id: 'calculadora',
    label: 'Calculadora',
    pageType: 'calculadora',
    url: '/calculadora',
    location: 'main',
    visible: true,
    icon: 'zap',
  },
  {
    id: 'ota',
    label: 'OTA',
    pageType: 'radar-ota',
    url: '/ota',
    location: 'main',
    visible: true,
    icon: 'sparkles',
  },
  {
    id: 'tutoriais',
    label: 'Tutoriais',
    pageType: 'tutoriais',
    url: '/tutoriais',
    location: 'main',
    visible: true,
    icon: 'bookopen',
  },
  {
    id: 'desbloqueio',
    label: 'Desbloqueio',
    pageType: 'desbloqueio',
    url: '/desbloqueio',
    location: 'main',
    visible: true,
    icon: 'shieldcheck',
  },
  {
    id: 'apps',
    label: 'Apps',
    pageType: 'apps',
    url: '/apps',
    location: 'main',
    visible: true,
    icon: 'smartphone',
  },
  {
    id: 'wallpapers',
    label: 'Wallpapers',
    pageType: 'wallpapers',
    url: '/wallpapers',
    location: 'dropdown',
    visible: true,
    icon: 'layers',
  },
  {
    id: 'parceiros',
    label: 'Parceiros',
    pageType: 'parceiros',
    url: '/parceiros',
    location: 'main',
    visible: true,
    icon: 'handshake',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    pageType: 'youtube',
    url: '/youtube',
    location: 'main',
    visible: true,
    icon: 'send',
  },
  {
    id: 'noticias',
    label: 'Notícias',
    pageType: 'noticias',
    url: '/noticias',
    location: 'main',
    visible: true,
    icon: 'filetext',
  },
  {
    id: 'vip',
    label: 'Área VIP',
    pageType: 'vip',
    url: '/vip',
    location: 'main',
    visible: true,
    icon: 'sparkles',
  },
  {
    id: 'shop',
    label: 'Shop',
    pageType: 'shop',
    url: '/shop',
    location: 'main',
    visible: true,
    icon: 'globe',
  },
  {
    id: 'imei',
    label: 'Senha IMEI',
    pageType: 'gerador-imei',
    url: '/imei',
    location: 'dropdown',
    visible: true,
    icon: 'smartphone',
  },
  {
    id: 'sobre',
    label: 'Sobre Nós',
    pageType: 'sobre',
    url: '/sobre',
    location: 'dropdown',
    visible: true,
    icon: 'helpcircle',
  },
  {
    id: 'termos',
    label: 'Termos de Uso',
    pageType: 'termos',
    url: '/termos',
    location: 'dropdown',
    visible: true,
    icon: 'filetext',
  },
  {
    id: 'privacidade',
    label: 'Privacidade',
    pageType: 'privacidade',
    url: '/privacidade',
    location: 'dropdown',
    visible: true,
    icon: 'shieldcheck',
  },
  {
    id: 'contato',
    label: 'Contato',
    pageType: 'contato',
    url: '/contato',
    location: 'dropdown',
    visible: true,
    icon: 'send',
  },
];

export function getResolvedHeaderMenu(
  brand: SiteBrandConfig,
  customLinks: CustomPageLink[] = []
): {
  allSortedItems: HeaderMenuItemConfig[];
  mainNavItems: HeaderMenuItemConfig[];
  dropdownItems: HeaderMenuItemConfig[];
} {
  // Converte customLinks em objetos HeaderMenuItemConfig
  const customItems: HeaderMenuItemConfig[] = (customLinks || []).map((c) => ({
    id: c.id,
    label: c.title,
    url: c.url,
    location: 'dropdown',
    visible: true,
    icon: c.icon || 'globe',
    badge: c.badge,
    isCustom: true,
  }));

  // Mescla itens padrão com links customizados que não duplicam IDs
  const combinedDefaults: HeaderMenuItemConfig[] = [...DEFAULT_HEADER_ITEMS];
  customItems.forEach((c) => {
    if (!combinedDefaults.some((d) => d.id === c.id || d.url === c.url)) {
      combinedDefaults.push(c);
    }
  });

  const savedList = brand?.headerMenuItems;
  let finalItems: HeaderMenuItemConfig[] = [];

  if (savedList && savedList.length > 0) {
    // Usa a ordem e configurações salvas
    finalItems = savedList.map((saved) => {
      const def = combinedDefaults.find((d) => d.id === saved.id);
      return {
        ...def,
        ...saved,
      };
    });

    // Anexa novos itens que ainda não constavam no savedList
    combinedDefaults.forEach((def) => {
      if (!finalItems.some((f) => f.id === def.id)) {
        finalItems.push(def);
      }
    });
  } else {
    finalItems = combinedDefaults;
  }

  // Ensure comunidade and iptv are excluded even if present in legacy savedList
  finalItems = finalItems.filter(
    (i) =>
      i.id !== 'comunidade' &&
      i.url !== '/comunidade' &&
      (i as any).pageType !== 'comunidade' &&
      i.id !== 'iptv' &&
      i.url !== '/iptv' &&
      (i as any).pageType !== 'iptv'
  );

  const mainNavItems = finalItems.filter((i) => i.location === 'main' && i.visible !== false);
  const dropdownItems = finalItems.filter((i) => i.location === 'dropdown' && i.visible !== false);

  return {
    allSortedItems: finalItems,
    mainNavItems,
    dropdownItems,
  };
}
