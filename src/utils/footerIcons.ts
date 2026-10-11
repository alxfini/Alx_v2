import { SiteBrandConfig, CustomSocialLink } from '../types';

export interface FooterItemResolved {
  id: string;
  title: string;
  platform: string;
  url?: string;
  active: boolean;
  isCustom?: boolean;
  customItem?: CustomSocialLink;
}

export function getResolvedFooterIcons(brand: SiteBrandConfig): FooterItemResolved[] {
  const baseItems: FooterItemResolved[] = [
    {
      id: 'youtube',
      title: 'YouTube',
      platform: 'youtube',
      url: brand?.links?.youtube,
      active: Boolean(brand?.links?.youtube && brand.links.youtube.trim().length > 0),
    },
    {
      id: 'telegram',
      title: 'Telegram',
      platform: 'telegram',
      url: brand?.links?.telegram,
      active: Boolean(brand?.links?.telegram && brand.links.telegram.trim().length > 0),
    },
    {
      id: 'instagram',
      title: 'Instagram',
      platform: 'instagram',
      url: brand?.links?.instagram,
      active: Boolean(brand?.links?.instagram && brand.links.instagram.trim().length > 0),
    },
    {
      id: 'spotify',
      title: 'Playlist Spotify',
      platform: 'spotify',
      active: true,
    },
    {
      id: 'contato',
      title: 'Contato',
      platform: 'contato',
      url: '/contato',
      active: true,
    },
    ...(brand?.customSocialLinks || []).map((c) => ({
      id: c.id,
      title: c.title || c.platform,
      platform: c.platform,
      url: c.url,
      active: c.active !== false && Boolean(c.url && c.url.trim().length > 0),
      isCustom: true,
      customItem: c,
    })),
    {
      id: 'admin',
      title: 'Painel Admin',
      platform: 'settings',
      active: true,
    },
  ];

  const order = brand?.footerIconsOrder;
  if (!order || order.length === 0) {
    return baseItems;
  }

  // Ordena os itens base com base no array de ordem salvo
  return [...baseItems].sort((a, b) => {
    let indexA = order.indexOf(a.id);
    let indexB = order.indexOf(b.id);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });
}
