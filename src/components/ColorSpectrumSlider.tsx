import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, RotateCcw, Check, X } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

export interface ColorPreset {
  name: string;
  hue: number;
  hex: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Branco Puro', hue: -1, hex: '#ffffff' },
  { name: 'Amarelo ALX', hue: 49, hex: '#ebbf01' },
  { name: 'Verde Elétrico', hue: 160, hex: '#00e599' },
  { name: 'Azul Cyan', hue: 198, hex: '#00a3ff' },
  { name: 'Laranja Sport', hue: 25, hex: '#ff6b00' },
  { name: 'Vermelho Turbo', hue: 0, hex: '#ff3b30' },
];

export function hueToHex(h: number): string {
  if (h === -1) return '#ffffff';
  const s = 95;
  const l = h >= 40 && h <= 65 ? 46 : 50;
  return hslToHex(h, s, l);
}

export function hslToHex(h: number, s: number, l: number): string {
  if (h === -1) return '#ffffff';
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.toLowerCase() === 'ffffff') {
    return { r: 255, g: 255, b: 255 };
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 235;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 191;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 1;
  return { r, g, b };
}

export function applyThemeColor(hue: number) {
  let hex: string;
  let hoverHex: string;
  let rgb: { r: number; g: number; b: number };

  if (hue === -1) {
    hex = '#ffffff';
    hoverHex = '#e6e6e6';
    rgb = { r: 255, g: 255, b: 255 };
  } else if (Math.abs(hue - 49) <= 2) {
    hex = '#ebbf01';
    hoverHex = '#f5cc14';
    rgb = { r: 235, g: 191, b: 1 };
  } else {
    hex = hueToHex(hue);
    hoverHex = hslToHex(hue, 95, 56);
    rgb = hexToRgb(hex);
  }

  document.documentElement.style.setProperty('--color-brand', hex);
  document.documentElement.style.setProperty('--color-brand-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  document.documentElement.style.setProperty('--color-brand-hover', hoverHex);

  document.documentElement.classList.remove('theme-white', 'theme-bw');
  document.body.classList.remove('theme-white', 'theme-bw');
  localStorage.removeItem('alx_theme_bw');
  localStorage.removeItem('alx_site_theme');

  localStorage.setItem('alx_theme_hue', hue.toString());
  localStorage.setItem('alx_theme_hex', hex);
}

interface ColorSpectrumSliderProps {
  className?: string;
  variant?: 'header' | 'inline';
}

export const ColorSpectrumSlider: React.FC<ColorSpectrumSliderProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { brand, updateBrand } = useSiteData();
  const [hue, setHue] = useState<number>(() => {
    if (brand?.themeHue !== undefined) return brand.themeHue;
    const savedHue = localStorage.getItem('alx_theme_hue');
    return savedHue !== null ? parseInt(savedHue, 10) : 49;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync from brand.themeHue whenever updated (loaded from Firestore or another tab)
  useEffect(() => {
    if (brand?.themeHue !== undefined) {
      setHue(brand.themeHue);
      applyThemeColor(brand.themeHue);
    } else {
      const savedHue = localStorage.getItem('alx_theme_hue');
      if (savedHue !== null) {
        const parsed = parseInt(savedHue, 10);
        if (!isNaN(parsed)) {
          setHue(parsed);
          applyThemeColor(parsed);
          return;
        }
      }
      applyThemeColor(49);
    }
  }, [brand?.themeHue]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate hue from vertical coordinate
  const updateHueFromY = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const percentage = relativeY / rect.height;
    const calculatedHue = Math.round(percentage * 360);
    setHue(calculatedHue);
    applyThemeColor(calculatedHue);
  }, []);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateHueFromY(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      updateHueFromY(e.touches[0].clientY);
    }
  };

  const handleColorSelect = (newHue: number, newHex?: string) => {
    const finalHex = newHex || (newHue === -1 ? '#ffffff' : newHue === 49 ? '#ebbf01' : hueToHex(newHue));
    setHue(newHue);
    applyThemeColor(newHue);
    updateBrand({ themeHue: newHue, themeHex: finalHex });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateHueFromY(e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        updateHueFromY(e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const finalHex = hue === -1 ? '#ffffff' : hue === 49 ? '#ebbf01' : hueToHex(hue);
        updateBrand({ themeHue: hue, themeHex: finalHex });
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, updateHueFromY, hue, updateBrand]);

  const currentHex = hue === -1 ? '#ffffff' : hue === 49 ? '#ebbf01' : hueToHex(hue);
  const knobPercentage = hue === -1 ? 0 : (hue / 360) * 100;

  // Inline mode (e.g. inside Admin panel)
  if (variant === 'inline') {
    return (
      <div className={`p-5 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-5 text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#ebbf01]" />
            <span className="text-xs font-bold text-white font-heading">
              Ajuste de Cor de Destaque
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleColorSelect(49, '#ebbf01')}
            className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar Padrão</span>
          </button>
        </div>

        <div className="flex gap-5 items-center">
          {/* Vertical Slider Track */}
          <div className="relative py-2 select-none flex justify-center">
            <div
              ref={trackRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="w-5 h-44 color-spectrum-vertical relative rounded-full cursor-ns-resize shadow-inner border border-white/20"
            >
              {/* Knob */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-black shadow-lg pointer-events-none transition-transform duration-75 flex items-center justify-center"
                style={{
                  top: `calc(${knobPercentage}% - 12px)`,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full block"
                  style={{ backgroundColor: currentHex }}
                />
              </div>
            </div>
          </div>

          {/* Details & Presets */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 bg-[#181820] px-3.5 py-2.5 rounded-xl border border-white/[0.06]">
              <span
                className="w-4 h-4 rounded-full border border-white/40 shrink-0 shadow"
                style={{ backgroundColor: currentHex }}
              />
              <span className="text-xs font-mono font-bold text-white">
                {currentHex.toUpperCase()}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono ml-auto">
                {hue === -1 ? 'Branco' : `${hue}°`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = (preset.hue === -1 && currentHex === '#ffffff') || (preset.hue !== -1 && Math.abs(hue - preset.hue) <= 4 && currentHex !== '#ffffff');

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleColorSelect(preset.hue, preset.hex)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-white/20 border-white text-white shadow-sm ring-1 ring-white/50'
                        : 'bg-[#181820] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center border border-black/30"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                    </span>
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Header Mode: Icon button in the site's brand color that opens vertical slider dropdown
  return (
    <div className={`relative flex items-center ${className}`} ref={containerRef}>
      {/* Palette Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center group cursor-pointer ${
          isOpen
            ? 'bg-[#1e1e26] border-[var(--color-brand)] shadow-lg shadow-[var(--color-brand)]/20'
            : 'bg-[#141419] hover:bg-[#1c1c24] border-white/[0.08] hover:border-white/[0.2]'
        }`}
        title="Alterar Cor de Destaque do Portal"
        aria-label="Abrir regulador de cores de destaque"
      >
        <Palette
          className="w-4 h-4 transition-transform group-hover:rotate-12 duration-200"
          style={{ color: currentHex }}
        />
      </button>

      {/* Vertical Popover Slider Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-[320px] max-w-[calc(100vw-32px)] p-4 bg-[#0d0d12]/98 border border-white/[0.14] rounded-3xl backdrop-blur-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5 origin-top-right text-white">
          
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center border border-white/30 shadow"
                style={{ backgroundColor: currentHex }}
              >
                <Palette className="w-3 h-3 text-black" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">
                  Cor de Destaque
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Personalização visual
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleColorSelect(49, '#ebbf01')}
                className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Restaurar padrão Amarelo ALX"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Padrão</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Vertical Slider + Preset Choices Layout */}
          <div className="flex gap-3.5 items-center justify-between pt-1">
            
            {/* Vertical Spectrum Slider Bar */}
            <div className="flex flex-col items-center gap-1.5 py-1 select-none">
              <div
                ref={trackRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="w-5 h-48 color-spectrum-vertical relative rounded-full cursor-ns-resize shadow-inner border border-white/20 touch-none flex justify-center"
                title="Arraste para cima ou para baixo para regular a cor"
              >
                {/* Visual Draggable Knob with Current Color Ring */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-black shadow-xl pointer-events-none transition-transform duration-75 flex items-center justify-center scale-105"
                  style={{
                    top: `calc(${knobPercentage}% - 12px)`,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full block"
                    style={{ backgroundColor: currentHex }}
                  />
                </div>
              </div>
              <span className="text-[9px] font-mono text-neutral-400">
                {hue === -1 ? 'Branco' : `${hue}°`}
              </span>
            </div>

            {/* Right Panel: Current Hex + Quick Color Presets */}
            <div className="flex-1 space-y-2.5">
              
              {/* Active Hex Display */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#14141a] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow"
                    style={{ backgroundColor: currentHex }}
                  />
                  <span className="text-xs font-mono font-bold text-white">
                    {currentHex.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                  Cores Rápidas:
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = (preset.hue === -1 && currentHex === '#ffffff') || (preset.hue !== -1 && Math.abs(hue - preset.hue) <= 4 && currentHex !== '#ffffff');

                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleColorSelect(preset.hue, preset.hex)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-[10px] font-bold transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-white/20 border-white text-white shadow-sm ring-1 ring-white/40'
                            : 'bg-[#14141a] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 flex items-center justify-center border border-black/30"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && <Check className="w-2 h-2 text-black stroke-[3]" />}
                        </span>
                        <span className="truncate">{preset.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Help Tip */}
          <div className="pt-2 border-t border-white/[0.04] text-center">
            <p className="text-[10px] text-neutral-400">
              Arraste a barra vertical ou selecione uma cor de destaque acima.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
