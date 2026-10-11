import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { SiteDataProvider, useSiteData } from './context/SiteDataContext';
import { Header } from './components/Header';
import { CalculatorSection } from './components/CalculatorSection';
import { OtaSection } from './components/OtaSection';
import { TutorialsSection } from './components/TutorialsSection';
import { DesbloqueioSection } from './components/DesbloqueioSection';
import { AppsSection } from './components/AppsSection';
import { WallpapersSection } from './components/WallpapersSection';
import { IptvSection } from './components/IptvSection';
import { YouTubeSection } from './components/YouTubeSection';
import { NewsSection } from './components/NewsSection';
import { VipSection } from './components/VipSection';
import { ProductsSection } from './components/ProductsSection';
import { ShopSection } from './components/ShopSection';
import { TelegramSection } from './components/TelegramSection';
import { Footer } from './components/Footer';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPasswordModal } from './components/admin/AdminPasswordModal';
import { CardDetailPage } from './components/pages/CardDetailPage';
import { SectionPageWrapper } from './components/pages/SectionPageWrapper';
import { ImeiGeneratorPage } from './components/pages/ImeiGeneratorPage';
import { InstitutionalPages } from './components/pages/InstitutionalPages';
import { ContactPage } from './components/pages/ContactPage';

import { ArticleModal } from './components/modals/ArticleModal';
import { AppModal } from './components/modals/AppModal';
import { VideoModal } from './components/modals/VideoModal';
import { ProductModal } from './components/modals/ProductModal';
import { VipAuthModal } from './components/modals/VipAuthModal';
import { SearchModal } from './components/modals/SearchModal';
import { DownloadGatewayModal } from './components/modals/DownloadGatewayModal';
import { SpotifyPlayerWidget } from './components/SpotifyPlayerWidget';
import { SEOHead } from './components/common/SEOHead';

import { NewsArticle, ALXApp, YouTubeVideo, ProductItem } from './types';
import { getRoutePath, getPageFromUrl, updateDocumentTitle } from './utils/router';

const MainAppContent: React.FC = () => {
  const {
    brand,
    activePage,
    setActivePage,
    apps,
    news,
    products,
    otaUpdates,
    tutorials,
    unlockServices,
    wallpapers,
    isAdminAuthenticated,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    downloadModalItem,
    closeDownloadGateway,
    isVipLoggedIn,
    setIsVipLoggedIn,
    isVipAuthModalOpen,
    setIsVipAuthModalOpen,
    logoutVip,
  } = useSiteData();

  // Active Modals State
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedApp, setSelectedApp] = useState<ALXApp | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global image protection (block context menu and drag-to-save on all images)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  // 1. Listen to URL changes (Popstate / Direct page load) and sync activePage
  useEffect(() => {
    const handleUrlRoute = () => {
      const pageFromUrl = getPageFromUrl();
      // Compare if different to avoid redundant state triggers
      setActivePage((prev) => {
        if (
          prev.type === pageFromUrl.type &&
          (prev as any).idOrSlug === (pageFromUrl as any).idOrSlug
        ) {
          return prev;
        }
        return pageFromUrl;
      });
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [setActivePage]);

  // 2. Synchronize Browser Address Bar & Document Title when activePage changes
  useEffect(() => {
    const expectedPath = getRoutePath(activePage);
    const currentPath = window.location.pathname;

    if (currentPath !== expectedPath) {
      try {
        window.history.pushState(null, '', expectedPath);
      } catch (err) {
        // Fallback for sandboxed iframe environments
        if (window.location.hash !== `#${expectedPath.replace(/^\//, '')}`) {
          window.location.hash = expectedPath === '/' ? '' : expectedPath;
        }
      }
    }

    // Dynamic Title & SEO Metadata update
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

  // Scroll to top on page transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  const handleOpenVipArea = () => {
    setActivePage({ type: 'vip' });
    if (!isVipLoggedIn) {
      setIsVipAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-[var(--color-brand)] selection:text-black font-sans antialiased">
      <SEOHead />
      
      {/* Modern Floating Glass Header */}
      <Header
        onOpenVipModal={handleOpenVipArea}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        isVipLoggedIn={isVipLoggedIn}
      />

      {/* Main Content Area based on activePage state */}
      <main className="flex-1">
        {activePage.type === 'admin' && (
          <AdminDashboard initialTab={(activePage as any).activeTab || (activePage as any).initialTab} />
        )}

        {(activePage.type === 'app' || activePage.type === 'news' || activePage.type === 'product') && (
          <CardDetailPage
            type={activePage.type}
            idOrSlug={activePage.idOrSlug}
            onOpenVipModal={handleOpenVipArea}
          />
        )}

        {/* 1. Dedicated Page: Calculadora */}
        {activePage.type === 'calculadora' && (
          <SectionPageWrapper
            title="Calculadora & Simulador de Autonomia"
            badge="Simulação em Tempo Real"
          >
            <CalculatorSection isStandalone={true} />
          </SectionPageWrapper>
        )}

        {/* 2. Dedicated Page: OTA Single Publication or Catalog */}
        {activePage.type === 'ota' && activePage.idOrSlug ? (
          <div className="pt-[72px] sm:pt-20 pb-6 sm:pb-8 bg-[#070709]">
            <OtaSection isStandalone={true} />
          </div>
        ) : (activePage.type === 'radar-ota' || activePage.type === 'ota') ? (
          <SectionPageWrapper
            title="Versões OTA & Firmware"
            badge="Atualizações Oficiais"
            description="Acompanhe o histórico de lançamentos, changelog oficial de melhorias, compatibilidade por modelo e orientações de instalação segura."
          >
            <OtaSection isStandalone={true} />
          </SectionPageWrapper>
        ) : null}

        {/* 2b. Dedicated Page: Single Tutorial Document */}
        {activePage.type === 'tutorial' && (
          <div className="pt-[72px] sm:pt-20 pb-6 sm:pb-8 bg-[#070709]">
            <TutorialsSection isStandalone={true} />
          </div>
        )}

        {/* 2c. Dedicated Page: Tutoriais Catalog */}
        {activePage.type === 'tutoriais' && (
          <SectionPageWrapper
            title="Central de Tutoriais & Guias"
            badge="Guias Práticos"
            description="Aprenda como atualizar o sistema, instalar aplicativos na multimídia e configurar seu veículo elétrico passo a passo."
          >
            <TutorialsSection isStandalone={true} />
          </SectionPageWrapper>
        )}

        {/* 2d. Dedicated Page: Desbloqueio & Serviços Especializados */}
        {(activePage.type === 'desbloqueio' || activePage.type === 'servico-desbloqueio') && (
          <SectionPageWrapper
            title="Desbloqueio & Serviços Especializados"
            badge="Atendimento & Serviços"
            description="Soluções de desbloqueio de multimídia, instalação de APKs, suporte remoto e customizações com atendimento profissional."
          >
            <DesbloqueioSection isStandalone={true} />
          </SectionPageWrapper>
        )}

        {/* 3. Dedicated Page: Apps Catalog */}
        {activePage.type === 'apps' && (
          <SectionPageWrapper
            title="Loja de Aplicativos ALX Store"
            badge="Homologados"
            description="Catálogo de aplicativos testados e otimizados para centrais multimídia automotivas (DiLink, Android Auto e sistemas embarcados)."
          >
            <AppsSection
              onSelectApp={(app) => setActivePage({ type: 'app', idOrSlug: app.slug || app.id })}
              onOpenVipModal={handleOpenVipArea}
              isStandalone={true}
            />
          </SectionPageWrapper>
        )}

        {/* 3b. Dedicated Page: Wallpapers Catalog */}
        {(activePage.type === 'wallpapers' || activePage.type === 'wallpaper') && (
          <SectionPageWrapper
            title="Galeria de Wallpapers & Wallpapers Animados"
            badge="Personalização"
            description="Baixe papéis de parede estáticos em 4K e wallpapers animados para personalizar a central multimídia do seu veículo elétrico."
          >
            <WallpapersSection isStandalone={true} />
          </SectionPageWrapper>
        )}

        {/* 3c. Dedicated Page: IPTV Guide & Apps */}
        {activePage.type === 'iptv' && (
          <SectionPageWrapper
            title="Guia & Aplicativos IPTV Automotivo"
            badge="Streaming"
            description="Confira tutoriais passo a passo e faça download de aplicativos IPTV homologados e testados para multimídia automotiva."
          >
            <IptvSection isStandalone={true} />
          </SectionPageWrapper>
        )}

        {/* 4. Dedicated Page: YouTube */}
        {activePage.type === 'youtube' && (
          <SectionPageWrapper
            title="Cinema YouTube & Tutoriais"
            badge="Canal Oficial"
            description="Assista a análises técnicas completas, comparativos de autonomia, tutoriais de instalação e novidades em vídeo."
          >
            <YouTubeSection
              onPlayVideo={(video) => setSelectedVideo(video)}
              isStandalone={true}
            />
          </SectionPageWrapper>
        )}

        {/* 5. Dedicated Page: Notícias */}
        {activePage.type === 'noticias' && (
          <SectionPageWrapper
            title="Notícias & Tendências EV"
            badge="Radar de Notícias"
            description="Cobertura das principais inovações em mobilidade elétrica, novidades das montadoras, infraestrutura de recarga e tecnologia automotiva."
          >
            <NewsSection
              onSelectArticle={(article) => setSelectedArticle(article)}
              isStandalone={true}
            />
          </SectionPageWrapper>
        )}

        {/* 6. Dedicated Page: Área VIP */}
        {activePage.type === 'vip' && (
          <SectionPageWrapper
            title="Área Exclusiva VIP"
            badge="Acesso Restrito"
            description="Acesso prioritário a firmwares beta, suporte técnico especializado, ferramentas exclusivas e comunidade fechada de membros."
          >
            <VipSection
              isLoggedIn={isVipLoggedIn}
              onLogout={logoutVip}
              onOpenAuthModal={() => setIsVipAuthModalOpen(true)}
              isStandalone={true}
            />
          </SectionPageWrapper>
        )}

        {/* 8. Dedicated Page: Shop (Loja ALX Garage) */}
        {(activePage.type === 'shop' || activePage.type === 'produtos') && (
          <SectionPageWrapper
            title="ALX Shop • Produtos & Acessórios"
            badge="Loja Oficial"
            description="Equipamentos, adaptadores streaming, cabos de recarga e softwares homologados diretamente da loja ALX Garage."
          >
            <ShopSection isStandalone={true} />
          </SectionPageWrapper>
        )}

        {/* 9. Dedicated Page: Gerador Senha IMEI */}
        {(activePage.type === 'gerador-imei' || activePage.type === 'imei') && (
          <div className="pt-[72px] sm:pt-20 pb-6 sm:pb-8">
            <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4">
              <ImeiGeneratorPage />
            </div>
          </div>
        )}

        {/* 10. Institutional Pages: Sobre, Termos, Privacidade */}
        {(activePage.type === 'sobre' || activePage.type === 'termos' || activePage.type === 'privacidade') && (
          <div className="pt-[72px] sm:pt-20 pb-6 sm:pb-8">
            <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4">
              <InstitutionalPages type={activePage.type} />
            </div>
          </div>
        )}

        {/* 11. Contact Page: Fale Conosco (/contato) */}
        {activePage.type === 'contato' && (
          <div className="pt-[72px] sm:pt-20 pb-6 sm:pb-8">
            <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4">
              <ContactPage />
            </div>
          </div>
        )}

        {/* Home Page: Blank for now */}
        {activePage.type === 'home' && (
          <div className="pt-[72px] sm:pt-20 pb-4" />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Global Search Modal (Cmd+K) */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectApp={(app) => setSelectedApp(app)}
        onSelectVideo={(video) => setSelectedVideo(video)}
        onSelectArticle={(art) => setSelectedArticle(art)}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
        onOpenVip={handleOpenVipArea}
      />

      {/* Detail & Action Modals */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <AppModal
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onOpenVipModal={handleOpenVipArea}
      />

      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <VipAuthModal
        isOpen={isVipAuthModalOpen}
        onClose={() => setIsVipAuthModalOpen(false)}
        onLoginSuccess={() => setIsVipLoggedIn(true)}
      />

      <DownloadGatewayModal
        item={downloadModalItem}
        onClose={closeDownloadGateway}
        onOpenVipModal={handleOpenVipArea}
      />

      {/* Spotify Floating Mini Player */}
      <SpotifyPlayerWidget />

      <AdminPasswordModal
        isOpen={isPasswordModalOpen || (activePage.type === 'admin' && !isAdminAuthenticated)}
        onClose={() => {
          setIsPasswordModalOpen(false);
          if (activePage.type === 'admin' && !isAdminAuthenticated) {
            setActivePage({ type: 'home' });
          }
        }}
        onSuccess={() => {
          setIsPasswordModalOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <SiteDataProvider>
      <MainAppContent />
    </SiteDataProvider>
  );
}
