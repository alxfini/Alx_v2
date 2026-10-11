import React, { useState, useEffect } from 'react';
import { useSiteData } from '../context/SiteDataContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = false 
}) => {
  const { brand } = useSiteData();
  const [hasError, setHasError] = useState(false);
  const currentLogoSrc = brand?.logoUrl || '/logo_alx_garage.png';

  useEffect(() => {
    setHasError(false);
  }, [currentLogoSrc]);

  const sizeMap = {
    sm: { box: 'w-8 h-8', img: 'w-7 h-7', text: 'text-lg' },
    md: { box: 'w-9 h-9 sm:w-10 sm:h-10', img: 'w-8 h-8 sm:w-9 sm:h-9', text: 'text-xl' },
    lg: { box: 'w-12 h-12', img: 'w-11 h-11', text: 'text-2xl' },
    xl: { box: 'w-16 h-16', img: 'w-14 h-14', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size];

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      {/* Container do Logo com borda sutil e fundo escuro */}
      <div className={`${currentSize.box} relative flex items-center justify-center rounded-xl bg-[#0D0D12] border border-white/[0.12] p-1 shadow-lg shadow-black/80 group-hover:scale-105 group-hover:border-white/30 transition-all duration-300 overflow-hidden shrink-0`}>
        {!hasError ? (
          <img
            src={currentLogoSrc}
            alt={`${brand?.brandName || 'Alx⁺'} Logo`}
            onError={handleImageError}
            className={`${currentSize.img} object-contain transition-transform group-hover:scale-105`}
          />
        ) : (
          <svg 
            viewBox="0 0 1000 1000" 
            className="w-full h-full drop-shadow" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M500 100 L760 720 H610 L500 450 L390 720 H240 L500 100 Z" 
              fill="#FFFFFF" 
            />
            <polygon 
              points="500,320 560,470 440,470" 
              fill="#0D0D12" 
            />
            <polygon 
              points="630,770 850,770 930,940 710,940" 
              fill="var(--color-brand, #ebbf01)" 
            />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex items-baseline font-black tracking-tight font-heading">
          <span className={`${currentSize.text} text-white`}>{brand?.brandName || 'Alx⁺'}</span>
        </div>
      )}
    </div>
  );
};

