/**
 * Utility function to check if any item (Article, App, Tutorial, OTA, Unlock, Wallpaper, etc.)
 * is restricted to VIP / official members.
 */
export const isItemVip = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;

  if (item.isMembersOnly || item.isVipExclusive || item.isVipOnly) return true;

  if (typeof item.category === 'string' && item.category.toLowerCase().includes('vip')) {
    return true;
  }

  if (typeof item.badge === 'string' && item.badge.toLowerCase().includes('vip')) {
    return true;
  }

  if (typeof item.priceText === 'string' && item.priceText.toLowerCase().includes('vip')) {
    return true;
  }

  if (Array.isArray(item.tags) && item.tags.some((t: string) => typeof t === 'string' && t.toLowerCase().includes('vip'))) {
    return true;
  }

  if (typeof item.title === 'string' && item.title.toLowerCase().includes('[vip]')) {
    return true;
  }

  if (typeof item.name === 'string' && item.name.toLowerCase().includes('[vip]')) {
    return true;
  }

  return false;
};
