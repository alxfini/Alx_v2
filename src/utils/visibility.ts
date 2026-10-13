export type ItemVisibility = 'public' | 'unlisted' | 'link_only' | 'members_and_link';

export interface VisibilityConfig {
  id: ItemVisibility;
  label: string;
  badgeLabel: string;
  shortDesc: string;
  fullDesc: string;
  color: 'emerald' | 'sky' | 'purple' | 'amber';
  bgColor: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
}

export const VISIBILITY_OPTIONS: Record<ItemVisibility, VisibilityConfig> = {
  public: {
    id: 'public',
    label: 'Público no Site (Normal)',
    badgeLabel: 'Público',
    shortDesc: 'Visível em todo o site para todos os visitantes',
    fullDesc: 'Aparece nas listagens públicas do site, na vitrine e na busca geral.',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  unlisted: {
    id: 'unlisted',
    label: 'Oculto no Site • Visível por Link',
    badgeLabel: 'Oculto no Site (Link)',
    shortDesc: 'Oculto no site, visível para quem tiver o link',
    fullDesc: 'Não aparece nas listas públicas do site nem na busca. Apenas quem tiver o link direto pode acessar.',
    color: 'sky',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-400',
    dotColor: 'bg-sky-400',
  },
  link_only: {
    id: 'link_only',
    label: 'Oculto no Site e Membros • Apenas Link',
    badgeLabel: 'Oculto Site + Membros',
    shortDesc: 'Oculto no site e para membros, acesso apenas com link direto',
    fullDesc: 'Totalmente oculto do catálogo público e também da Área VIP dos membros. Acesso 100% exclusivo para quem tiver o link direto.',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    dotColor: 'bg-purple-400',
  },
  members_and_link: {
    id: 'members_and_link',
    label: 'Oculto no Site • Membros e Link',
    badgeLabel: 'Membros + Link',
    shortDesc: 'Oculto no site, visível para membros e quem tiver o link',
    fullDesc: 'Oculto das listagens públicas do site. Visível para membros na Área VIP e acessível por quem tiver o link direto.',
    color: 'amber',
    bgColor: 'bg-[#ebbf01]/10',
    borderColor: 'border-[#ebbf01]/40',
    textColor: 'text-[#ebbf01]',
    dotColor: 'bg-[#ebbf01]',
  },
};

/**
 * Normalizes item visibility, defaulting to 'public' if not set.
 */
export function getItemVisibility(item: any): ItemVisibility {
  if (!item || typeof item !== 'object') return 'public';
  if (item.visibility && VISIBILITY_OPTIONS[item.visibility as ItemVisibility]) {
    return item.visibility as ItemVisibility;
  }
  return 'public';
}

/**
 * Checks if an item should appear in public website listings (AppsSection, TutorialsSection, public search)
 */
export function isItemVisibleOnSite(item: any): boolean {
  if (!item) return false;
  const visibility = getItemVisibility(item);
  // 'unlisted', 'link_only', and 'members_and_link' are all hidden from public website listings
  if (visibility === 'unlisted' || visibility === 'link_only' || visibility === 'members_and_link') {
    return false;
  }
  return true;
}

/**
 * Checks if an item should appear in the Member/VIP area feed (VipSection dynamic apps & tutorials)
 */
export function isItemVisibleInVipSection(item: any): boolean {
  if (!item) return false;
  const visibility = getItemVisibility(item);
  // 'link_only' is explicitly hidden from members too!
  if (visibility === 'link_only') return false;
  // 'members_and_link' is explicitly visible to members!
  if (visibility === 'members_and_link') return true;
  // 'unlisted' is hidden from both public site and members feed unless marked members_and_link
  if (visibility === 'unlisted') return false;
  // 'public': visible to members if it is VIP/members-only
  return Boolean(item.isVipExclusive || item.isMembersOnly);
}

/**
 * Checks whether an item opened via direct link allows access without member lock.
 * If visibility is 'link_only', 'unlisted', or 'members_and_link', having the direct link grants access.
 */
export function doesLinkGrantDirectAccess(item: any): boolean {
  if (!item) return false;
  const visibility = getItemVisibility(item);
  return visibility === 'link_only' || visibility === 'unlisted' || visibility === 'members_and_link';
}
