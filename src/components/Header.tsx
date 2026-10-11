import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Crown, 
  Search, 
  ChevronDown, 
  ExternalLink, 
  Globe, 
  HelpCircle, 
  Send, 
  Zap, 
  Smartphone, 
  ShieldCheck, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Layers,
  KeyRound,
  Tv
} from 'lucide-react';
import { Logo } from './Logo';
import { useSiteData } from '../context/SiteDataContext';
import { NotificationBell } from './NotificationBell';
import { HeaderMenuItemConfig } from '../types';
import { getResolvedHeaderMenu } from '../utils/headerMenu';

interface HeaderProps {
  onOpenVipModal: () => void;
  onOpenSearchModal: () => void;
  isVipLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenVipModal, onOpenSearchModal, isVipLoggedIn }) => {
  const { brand, activePage, setActivePage, customPageLinks } = useSiteData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPagesDropdownOpen(false);
      }
    };
    if (pagesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pagesDropdownOpen]);

  const { mainNavItems, dropdownItems } = getResolvedHeaderMenu(brand, customPageLinks);

  // Transborda itens para o menu "Mais" estritamente UM POR UM à medida que a largura da tela diminui
  const getMaxMainItems = (width: number) => {
    if (width >= 1480) return 9;
    if (width >= 1380) return 8;
    if (width >= 1280) return 7;
    if (width >= 1180) return 6;
    if (width >= 1080) return 5;
    if (width >= 980)  return 4;
    if (width >= 880)  return 3;
    return 2;
  };

  const maxMain = getMaxMainItems(windowWidth);
  const visibleMainNavItems = mainNavItems.slice(0, maxMain);
  const overflowMainNavItems = mainNavItems.slice(maxMain);
  const combinedDropdownItems = [...overflowMainNavItems, ...dropdownItems];

  const handleItemClick = (e: React.MouseEvent, item: HeaderMenuItemConfig) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    if (item.url.startsWith('http://') || item.url.startsWith('https://')) {
      return; // Permite o comportamento padrão do navegador
    }

    e.preventDefault();
    setMobileMenuOpen(false);
    setPagesDropdownOpen(false);

    const cleanUrl = item.url.replace(/^[#/]+/, '').toLowerCase();
    if (['calculadora', 'radar-ota', 'ota', 'tutoriais', 'desbloqueio', 'apps', 'wallpapers', 'iptv', 'youtube', 'noticias', 'vip', 'produtos', 'shop', 'home', 'gerador-imei', 'imei', 'sobre', 'termos', 'privacidade'].includes(cleanUrl)) {
      if (cleanUrl === 'imei' || cleanUrl === 'gerador-imei') {
        setActivePage({ type: 'gerador-imei' });
      } else if (cleanUrl === 'ota' || cleanUrl === 'radar-ota') {
        setActivePage({ type: 'ota' });
      } else if (cleanUrl === 'home' || cleanUrl === '') {
        setActivePage({ type: 'home' });
      } else {
        setActivePage({ type: cleanUrl as any });
      }
    } else if (item.url.startsWith('/')) {
      window.history.pushState(null, '', item.url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      window.location.href = item.url;
    }
  };

  const isItemActive = (item: HeaderMenuItemConfig) => {
    if (item.pageType) {
      if ((item.pageType === 'radar-ota' || item.pageType === 'ota') && (activePage.type === 'ota' || activePage.type === 'radar-ota')) return true;
      if ((item.pageType === 'gerador-imei' || item.pageType === 'imei') && (activePage.type === 'gerador-imei' || activePage.type === 'imei')) return true;
      return activePage.type === item.pageType;
    }
    const cleanUrl = item.url.replace(/^[#/]+/, '').toLowerCase();
    return activePage.type === cleanUrl;
  };

  // Renderizador de Ícones
  const renderLinkIcon = (iconName?: string, sizeClass = 'w-4 h-4') => {
    const cls = `${sizeClass} text-[#FFDD00]`;
    switch (iconName?.toLowerCase()) {
      case 'keyround':
      case 'key':
      case 'imei':
      case 'unlock':
        return <KeyRound className={cls} />;
      case 'helpcircle':
      case 'help':
      case 'faq':
        return <HelpCircle className={cls} />;
      case 'send':
      case 'telegram':
        return <Send className={cls} />;
      case 'zap':
      case 'calculator':
      case 'ferramenta':
        return <Zap className={cls} />;
      case 'smartphone':
      case 'apk':
      case 'app':
        return <Smartphone className={cls} />;
      case 'shieldcheck':
      case 'shield':
      case 'security':
        return <ShieldCheck className={cls} />;
      case 'bookopen':
      case 'guide':
      case 'book':
        return <BookOpen className={cls} />;
      case 'filetext':
      case 'doc':
        return <FileText className={cls} />;
      case 'sparkles':
        return <Sparkles className={cls} />;
      case 'tv':
      case 'iptv':
      case 'monitor':
        return <Tv className={cls} />;
      case 'globe':
      default:
        return <Globe className={cls} />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 transition-all duration-300 pointer-events-none">
      <div className="w-full max-w-[98%] sm:max-w-[92%] lg:w-[88%] lg:max-w-[1280px] xl:max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Floating Glassmorphism Main Navbar */}
        <div
          className={`w-full pointer-events-auto rounded-full transition-all duration-300 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between shadow-2xl ${
            isScrolled
              ? 'bg-[#09090C]/95 border border-white/[0.12] backdrop-blur-2xl shadow-black/80'
              : 'bg-[#0D0D11]/90 border border-white/[0.08] backdrop-blur-xl'
          }`}
        >
          {/* Logo ALX - Takes to Home */}
          <a
            href="/"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                e.preventDefault();
                setActivePage({ type: 'home' });
                window.history.pushState(null, '', '/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none shrink-0 text-left transition-transform active:scale-95"
            aria-label="ALX Início"
          >
            <Logo size="md" />
          </a>

          {/* Desktop Navigation Links (Adaptativo por largura de tela, transborda para 'Mais') */}
          <nav className="hidden lg:flex items-center space-x-1">
            {visibleMainNavItems.map((item) => {
              const active = isItemActive(item);
              return (
                <a
                  key={item.id}
                  href={item.url}
                  onClick={(e) => handleItemClick(e, item)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[var(--color-brand)] text-black font-bold shadow-sm shadow-[var(--color-brand)]/20'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            {/* "Mais" Dropdown Menu (Recebe itens que transbordam da barra principal) */}
            {combinedDropdownItems && combinedDropdownItems.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                    pagesDropdownOpen || combinedDropdownItems.some((i) => isItemActive(i))
                      ? 'bg-[var(--color-brand)] text-black font-bold shadow-sm shadow-[var(--color-brand)]/20'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  aria-expanded={pagesDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Mais</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    pagesDropdownOpen || combinedDropdownItems.some((i) => isItemActive(i)) ? 'text-black' : 'text-[#FFDD00]'
                  } ${pagesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Floating Dropdown Card */}
                {pagesDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-72 bg-[#0E0E14]/98 border border-white/[0.12] rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="space-y-1 max-h-80 overflow-y-auto pr-0.5">
                      {combinedDropdownItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                          <a
                            key={item.id}
                            href={item.url}
                            target={item.url.startsWith('http') ? '_blank' : '_self'}
                            rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                            onClick={(e) => handleItemClick(e, item)}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 group cursor-pointer block ${
                              active
                                ? 'bg-[#1C1C28] border border-[var(--color-brand)]/50'
                                : 'hover:bg-white/[0.08]'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-[#16161F] border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all ${
                              active ? 'border-[var(--color-brand)] text-[var(--color-brand)]' : 'border-white/[0.08] text-[#FFDD00]'
                            }`}>
                              {renderLinkIcon(item.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-bold truncate ${
                                active ? 'text-[var(--color-brand)] font-extrabold' : 'text-white group-hover:text-white'
                              }`}>
                                {item.label}
                              </div>
                            </div>
                            {item.url.startsWith('http') && (
                              <ExternalLink className="w-3.5 h-3.5 text-[#FFDD00] shrink-0" />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. Search Trigger */}
            <button
              onClick={onOpenSearchModal}
              className="p-2 rounded-full bg-[#16161B] hover:bg-[#1F1F26] border border-white/[0.08] text-white transition-all group cursor-pointer flex items-center justify-center"
              title="Pesquisar (Ctrl+K)"
              aria-label="Abrir pesquisa"
            >
              <Search className="w-4 h-4 text-white group-hover:scale-110 transition-all" />
            </button>

            {/* 2. Notification Bell with Dropdown */}
            <NotificationBell />

            {/* 4. VIP CTA Button (Fundo Amarelo + Ícone Preto) */}
            <a
              href="/vip"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  onOpenVipModal();
                }
              }}
              className="p-2 rounded-full transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center group bg-[#FFDD00] hover:brightness-110 active:scale-95 text-black border border-[#FFDD00] shadow-[#FFDD00]/20"
              title={isVipLoggedIn ? 'Painel VIP' : 'Área VIP'}
              aria-label="Área VIP"
            >
              <Crown className="w-4 h-4 text-black fill-black group-hover:scale-110 transition-transform" />
            </a>

            {/* 5. Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-[#16161B] border border-white/[0.08] text-[#FFDD00] hover:bg-[#1F1F26] cursor-pointer"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-[#FFDD00]" /> : <Menu className="w-4 h-4 text-[#FFDD00]" />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto max-w-7xl mx-auto mt-2 p-4 sm:p-5 bg-[#0D0D11]/98 border border-white/[0.12] rounded-3xl backdrop-blur-2xl shadow-2xl space-y-3 lg:hidden animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          
          <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white font-mono">
              Menu de Navegação
            </span>
          </div>

          {/* Grouped Mobile Navigation Links (Todos os botões agrupados juntos sem divisão "Mais") */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[...mainNavItems, ...dropdownItems].map((item) => {
              const active = isItemActive(item);
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.url.startsWith('http') ? '_blank' : '_self'}
                  rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleItemClick(e, item)}
                  className={`p-3 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    active
                      ? 'bg-[var(--color-brand)] text-black border-[var(--color-brand)] font-black shadow-md'
                      : 'bg-[#141419] border-white/[0.08] text-white hover:bg-[#1A1A22]'
                  }`}
                >
                  {item.icon && (
                    <span className={`w-4 h-4 shrink-0 flex items-center justify-center ${active ? 'text-black' : 'text-[#FFDD00]'}`}>
                      {renderLinkIcon(item.icon)}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </a>
              );
            })}
          </div>

        </div>
      )}
    </header>
  );
};
