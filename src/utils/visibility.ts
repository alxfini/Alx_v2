export type ItemVisibility = 'public' | 'public_vip' | 'unlisted' | 'link_only' | 'members_and_link';

export interface VisibilityConfig {
  id: ItemVisibility;
  number: number;
  label: string;
  badgeLabel: string;
  shortDesc: string;
  fullDesc: string;
  color: 'emerald' | 'amber' | 'sky' | 'purple';
  bgColor: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
}

export const VISIBILITY_OPTIONS: Record<ItemVisibility, VisibilityConfig> = {
  public: {
    id: 'public',
    number: 1,
    label: '1 - Público normal pra todos',
    badgeLabel: 'Público',
    shortDesc: 'Visível em todo o site, acesso liberado para todos',
    fullDesc: 'Aparece normalmente em todo o site (catálogo, vitrine e buscas). Qualquer visitante (membro ou não) pode ler e baixar livremente.',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  public_vip: {
    id: 'public_vip',
    number: 2,
    label: '2 - Visível porém acesso somente VIP',
    badgeLabel: 'Visível • Acesso VIP',
    shortDesc: 'Visível no site, mas acesso exclusivo para Membros VIP',
    fullDesc: 'Aparece nas listagens públicas e buscas do site com badge VIP, porém o acesso completo e downloads são exclusivos para membros. Visitantes não-membros caem para logar/assinar VIP.',
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    dotColor: 'bg-amber-500',
  },
  unlisted: {
    id: 'unlisted',
    number: 3,
    label: '3 - Acesso direto somente com link, pra todos',
    badgeLabel: 'Link • Para Todos',
    shortDesc: 'Oculto no site, acesso liberado com link direto pra todos',
    fullDesc: 'Não aparece nas listas públicas nem nas buscas do site. Qualquer pessoa que tiver o link direto consegue acessar e baixar livremente, sem precisar ser membro.',
    color: 'sky',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-400',
    dotColor: 'bg-sky-400',
  },
  members_and_link: {
    id: 'members_and_link',
    number: 4,
    label: '4 - Acesso direto com link para membros (não-membro cai pra logar)',
    badgeLabel: 'Link • Somente Membros',
    shortDesc: 'Oculto no site. Com o link: membro libera, não-membro cai pra logar',
    fullDesc: 'Oculto de todas as listagens públicas do site. Visível para membros na Área VIP. Se acessado via link direto: quem for membro tem acesso liberado; quem não for membro é barrado e cai para logar.',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    dotColor: 'bg-purple-400',
  },
  link_only: {
    id: 'link_only',
    number: 3,
    label: '3 - Acesso direto somente com link, pra todos',
    badgeLabel: 'Link • Para Todos',
    shortDesc: 'Oculto no site, acesso liberado com link direto pra todos',
    fullDesc: 'Não aparece nas listas públicas nem nas buscas do site. Qualquer pessoa que tiver o link direto consegue acessar e baixar livremente.',
    color: 'sky',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-400',
    dotColor: 'bg-sky-400',
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
  // If item has isMembersOnly or isVipExclusive and no explicit visibility, it is public_vip
  if (item.isMembersOnly || item.isVipExclusive) {
    return 'public_vip';
  }
  return 'public';
}

/**
 * Checks if an item should appear in public website listings (AppsSection, TutorialsSection, public search)
 * - Option 1 ('public') and Option 2 ('public_vip') are VISIBLE on the site.
 * - Option 3 ('unlisted'/'link_only') and Option 4 ('members_and_link') are HIDDEN on the site.
 */
export function isItemVisibleOnSite(item: any): boolean {
  if (!item) return false;
  const visibility = getItemVisibility(item);
  if (visibility === 'unlisted' || visibility === 'link_only' || visibility === 'members_and_link') {
    return false;
  }
  return true;
}

/**
 * Checks if an item should appear in the Member/VIP area feed (VipSection dynamic apps & tutorials)
 * - Option 2 ('public_vip') and Option 4 ('members_and_link') are visible to members in the VIP section.
 * - Option 3 ('unlisted'/'link_only') is hidden from the VIP feed (link only).
 * - Option 1 ('public') is public for everyone.
 */
export function isItemVisibleInVipSection(item: any): boolean {
  if (!item) return false;
  const visibility = getItemVisibility(item);
  if (visibility === 'public_vip' || visibility === 'members_and_link') return true;
  if (visibility === 'unlisted' || visibility === 'link_only') return false;
  if (visibility === 'public') {
    return Boolean(item.isVipExclusive || item.isMembersOnly);
  }
  return false;
}

/**
 * Checks whether an item opened via direct link allows open/public access without requiring member authentication.
 * - Option 1 ('public') and Option 3 ('unlisted', 'link_only'): direct link allows anyone to view/download (open for all).
 * - Option 2 ('public_vip') and Option 4 ('members_and_link'): strictly requires member authentication. Non-members are barred (cai pra logar); members are allowed.
 */
export function doesLinkGrantDirectAccess(item: any): boolean {
  if (!item) return false;
  const visibility = getItemVisibility(item);
  if (visibility === 'public_vip' || visibility === 'members_and_link') {
    return false;
  }
  return true;
}
