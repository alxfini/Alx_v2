/**
 * Utility function to check if any item (Article, App, Tutorial, OTA, Unlock, Wallpaper, etc.)
 * is restricted to VIP / official members.
 */
export const isItemVip = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;

  if (item.isMembersOnly || item.isVipExclusive || item.isVipOnly || item.isVipRestricted || item.isVip) return true;

  if (typeof item.category === 'string') {
    const cat = item.category.toLowerCase();
    if (cat.includes('vip') || cat.includes('membro') || cat.includes('exclusiv')) return true;
  }

  if (typeof item.badge === 'string') {
    const bd = item.badge.toLowerCase();
    if (bd.includes('vip') || bd.includes('membro') || bd.includes('exclusiv')) return true;
  }

  if (typeof item.priceText === 'string' && item.priceText.toLowerCase().includes('vip')) {
    return true;
  }

  if (Array.isArray(item.tags) && item.tags.some((t: string) => {
    if (typeof t !== 'string') return false;
    const tag = t.toLowerCase();
    return tag.includes('vip') || tag.includes('membro') || tag.includes('exclusiv');
  })) {
    return true;
  }

  if (typeof item.title === 'string') {
    const ttl = item.title.toLowerCase();
    if (
      ttl.includes('[vip]') || 
      ttl.includes('(vip)') || 
      ttl.includes('[membro') || 
      ttl.includes('(membro') || 
      ttl.includes('[exclusiv') || 
      ttl.includes('(exclusiv')
    ) {
      return true;
    }
  }

  if (typeof item.name === 'string') {
    const nm = item.name.toLowerCase();
    if (
      nm.includes('[vip]') || 
      nm.includes('(vip)') || 
      nm.includes('[membro') || 
      nm.includes('(membro') || 
      nm.includes('[exclusiv') || 
      nm.includes('(exclusiv')
    ) {
      return true;
    }
  }

  return false;
};
