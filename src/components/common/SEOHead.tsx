import React, { useEffect } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import { updateDocumentTitle } from '../../utils/router';

export const SEOHead: React.FC = () => {
  const { 
    activePage, 
    brand, 
    apps, 
    news, 
    products, 
    otaUpdates, 
    tutorials, 
    unlockServices, 
    wallpapers 
  } = useSiteData();

  useEffect(() => {
    updateDocumentTitle(
      activePage,
      brand.brandName || 'Alx⁺',
      brand.defaultShareImageUrl,
      { apps, news, products, otaUpdates, tutorials, unlockServices, wallpapers }
    );
  }, [
    activePage, 
    brand.brandName, 
    brand.defaultShareImageUrl, 
    apps, 
    news, 
    products, 
    otaUpdates, 
    tutorials, 
    unlockServices, 
    wallpapers
  ]);

  return null;
};

