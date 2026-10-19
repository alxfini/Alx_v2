import React, { useState, useEffect } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import { isItemVip } from '../../utils/vip';
import { OTAUpdate } from '../../types';
import { 
  Download, 
  ExternalLink, 
  Car, 
  Layers, 
  Cpu, 
  BookOpen, 
  Search, 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  HardDrive, 
  Clock, 
  ShieldCheck, 
  ChevronDown,
  Check,
  Share2,
  CheckCircle2
} from 'lucide-react';

// Helper to format OTA downloads count (multiplied by 51, e.g. 10 -> 510 downloads, without ⬇ symbol)
const formatOtaDownloads = (rawCount?: number): string => {
  if (!rawCount || rawCount <= 0) return '0 downloads';
  const val = rawCount * 51;
  if (val >= 1000000) {
    const formatted = (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1);
    return `${formatted}M downloads`;
  }
  if (val >= 1000) {
    const formatted = (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1);
    return `${formatted}k downloads`;
  }
  return `${val} downloads`;
};

export const OtaTracker: React.FC = () => {
  const { otaUpdates, evModels, activePage, setActivePage, tutorials, openDownloadGateway, isVipLoggedIn, isAdminAuthenticated, openVipModal } = useSiteData();
  const isUserAuthenticated = isVipLoggedIn || isAdminAuthenticated;
  const [activeOta, setActiveOta] = useState<OTAUpdate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState<string>('Todos');
  const [selectedVersion, setSelectedVersion] = useState<string>('Todas');

  // Pagination: 6 cards on desktop, 3 cards on mobile
  const [visibleCountDesktop, setVisibleCountDesktop] = useState<number>(6);
  const [visibleCountMobile, setVisibleCountMobile] = useState<number>(3);

  // Synchronize activeOta with URL / activePage
  useEffect(() => {
    if (activePage.type === 'ota' && activePage.idOrSlug) {
      const target = decodeURIComponent(activePage.idOrSlug).toLowerCase().trim();
      const found = (otaUpdates || []).find(o => 
        o.id === activePage.idOrSlug || 
        o.slug === activePage.idOrSlug ||
        o.id.toLowerCase() === target ||
        (o.slug && o.slug.toLowerCase() === target) ||
        (o.version && o.version.toLowerCase().replace(/[^a-z0-9]+/g, '-') === target)
      );
      if (found) {
        setActiveOta(found);
      } else if (otaUpdates && otaUpdates.length > 0) {
        setActiveOta(otaUpdates[0]);
      }
    } else if (activePage.type === 'radar-ota' || (activePage.type === 'ota' && !activePage.idOrSlug)) {
      setActiveOta(null);
    }
  }, [activePage, otaUpdates]);

  // Reset pagination whenever filters or search query change
  useEffect(() => {
    setVisibleCountDesktop(6);
    setVisibleCountMobile(3);
  }, [searchTerm, selectedCar, selectedVersion]);

  // Helper to normalize car names for exact comparison
  const normalizeCarKey = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^byd\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Build unique cars list dynamically for vehicle selector
  const availableCars: string[] = React.useMemo(() => {
    const carMap = new Map<string, string>();

    otaUpdates.forEach(ota => {
      const raw = ota.applicableCars || ota.modelTarget || '';
      if (!raw.trim()) return;

      const cars = raw.split(/[,;/]+/).map(c => c.trim()).filter(Boolean);
      cars.forEach(car => {
        const key = normalizeCarKey(car);
        if (!key) return;
        if (key.includes('todos os modelo') || key.includes('todos os veiculo')) {
          return;
        }

        if (!carMap.has(key)) {
          carMap.set(key, car);
        } else {
          const existing = carMap.get(key)!;
          if (existing.toLowerCase().startsWith('byd ') && !car.toLowerCase().startsWith('byd ')) {
            carMap.set(key, car);
          }
        }
      });
    });

    return Array.from(carMap.values()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [otaUpdates]);

  // Build unique versions list dynamically for the selector dropdown
  const availableVersions: string[] = Array.from(
    new Set<string>(
      otaUpdates
        .map(o => o.version?.trim())
        .filter((v): v is string => Boolean(v && v.length > 0))
    )
  ).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

  // Helper function to extract a comparable date/timestamp or numerical order for sorting (newest first)
  const getOtaSortTimestamp = (ota: OTAUpdate): number => {
    if (ota.releaseDate) {
      const dateParts = ota.releaseDate.split(' ');
      if (dateParts.length >= 2) {
        const monthNames: Record<string, number> = {
          'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
          'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
        };
        const month = monthNames[dateParts[0].toLowerCase()] ?? 0;
        const year = parseInt(dateParts[1], 10) || 2026;
        return new Date(year, month, 1).getTime();
      }
    }
    const versionMatch = ota.version.match(/\d+/);
    if (versionMatch) {
      return parseInt(versionMatch[0], 10) * 1000;
    }
    return 0;
  };

  const filteredUpdates = otaUpdates
    .filter(ota => {
      const otaCars = (ota.applicableCars || ota.modelTarget || '')
        .split(/[,;/]+/)
        .map(c => normalizeCarKey(c))
        .filter(Boolean);

      const targetCar = normalizeCarKey(selectedCar);
      const matchesCar = selectedCar === 'Todos' ||
        otaCars.some(car => car.includes(targetCar) || targetCar.includes(car));

      const matchesVersion = selectedVersion === 'Todas' ||
        (ota.version && ota.version.trim() === selectedVersion.trim());

      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search ||
        (ota.version || '').toLowerCase().includes(search) ||
        (ota.mcu || '').toLowerCase().includes(search) ||
        (ota.title || '').toLowerCase().includes(search) ||
        (ota.applicableCars || ota.modelTarget || '').toLowerCase().includes(search) ||
        (ota.changelog && ota.changelog.some(c => c.toLowerCase().includes(search)));

      return matchesCar && matchesVersion && matchesSearch;
    })
    .sort((a, b) => getOtaSortTimestamp(b) - getOtaSortTimestamp(a));

  const handleOpenTutorial = (ota: OTAUpdate) => {
    if (ota.tutorialId) {
      setActivePage({ type: 'tutorial', idOrSlug: ota.tutorialId });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ota.tutorialUrl) {
      if (ota.tutorialUrl.startsWith('http')) {
        window.open(ota.tutorialUrl, '_blank', 'noopener,noreferrer');
      } else {
        setActivePage({ type: 'tutoriais' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setActivePage({ type: 'tutoriais' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenOta = (ota: OTAUpdate) => {
    setActiveOta(ota);
    setActivePage({ type: 'ota', idOrSlug: ota.slug || ota.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveOta(null);
    setActivePage({ type: 'radar-ota' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareCard = (e: React.MouseEvent, ota: OTAUpdate) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const directUrl = `${origin}/ota/${ota.slug || ota.id}`;

    if (navigator.share) {
      navigator.share({
        title: ota.title || `Atualização DiLink ${ota.version}`,
        url: directUrl,
      }).catch(() => {});
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      setCopiedId(ota.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // =========================================================================
  // VIEW 1: DEDICATED INDIVIDUAL OTA PUBLICATION VIEW
  // =========================================================================
  if (activeOta) {
    const displayImage = activeOta.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop';
    const displayCars = activeOta.applicableCars || activeOta.modelTarget || 'Modelos BYD DiLink';

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Detailed Article Card (Full width of 70% container) */}
        <article className="w-full bg-[#111115] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl relative text-neutral-100 p-6 sm:p-10 space-y-6">
          {/* Header */}
          <header className="pb-4 border-b border-white/[0.08]">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-heading leading-tight">
              {activeOta.title || `Atualização Oficial DiLink ${activeOta.version}`}
            </h1>
          </header>

          {/* Photo with rounded corners */}
          <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-[#14141c] border border-white/[0.08] hover:border-[#ebbf01]/40 shadow-2xl group transition-all duration-300">
            <img
              src={displayImage}
              alt={activeOta.title || activeOta.version}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e13] via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Technical Specs Matrix */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 font-mono text-xs">
            <div className="p-2 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
              <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-sans block truncate">Firmware</span>
              <span className="font-extrabold text-white text-xs sm:text-sm block truncate">{activeOta.version}</span>
            </div>
            <div className="p-2 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
              <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-sans block truncate">Versão</span>
              <span className="font-extrabold text-cyan-400 text-xs sm:text-sm block truncate">{activeOta.mcu || 'Universal'}</span>
            </div>
            <div className="p-2 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
              <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-sans block truncate">Tamanho</span>
              <span className="font-extrabold text-white text-xs sm:text-sm block truncate">{activeOta.size || 'N/A'}</span>
            </div>
          </div>

          {/* Changelog / Informações Section */}
          {activeOta.changelog && (Array.isArray(activeOta.changelog) ? activeOta.changelog : String(activeOta.changelog).split('\n')).filter(i => i && i.trim().length > 0).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#ebbf01] flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Informações</span>
              </h3>
              <ul className="space-y-2">
                {(Array.isArray(activeOta.changelog) ? activeOta.changelog : String(activeOta.changelog).split('\n'))
                  .filter((item) => item && item.trim().length > 0)
                  .map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Carros Compatíveis */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#14141c] border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#ebbf01]">
              <Car className="w-4 h-4" />
              <span>Carros Compatíveis:</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 font-sans leading-relaxed pl-6">
              {displayCars}
            </p>
          </div>

          {/* Download Action Section with 10s Countdown */}
          <div className="pt-6 border-t border-white/[0.08] space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#14141e] to-[#0a0a0f] border border-[#ebbf01]/30 text-center space-y-4">
              <div>
                <h4 className="text-base sm:text-lg font-black text-white font-heading">
                  Download Oficial Homologado
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Ao clicar, será iniciada a contagem de segurança de 10 segundos antes do download.
                </p>
              </div>

              <button
                onClick={() => {
                  if (isItemVip(activeOta) && !isUserAuthenticated) { openVipModal(); return; }
                  openDownloadGateway({
                    id: activeOta.id,
                    slug: activeOta.slug,
                    title: activeOta.title || `Pacote OTA ${activeOta.version}`,
                    category: 'ota',
                    version: activeOta.version,
                    rawDownloadUrl: activeOta.downloadUrl || 'https://drive.google.com',
                    applicableCars: displayCars,
                  });
                }}
                className="w-full py-4 px-6 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-sm tracking-wider uppercase font-mono flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#ebbf01]/20 cursor-pointer active:scale-98"
              >
                <Download className="w-5 h-5" />
                <span>BAIXAR ARQUIVO OTA SEGURO</span>
              </button>
            </div>

            {/* Tutorial Button - Apresentar apenas se tutorialUrl ou tutorialId estiverem efetivamente preenchidos */}
            {Boolean((activeOta.tutorialUrl && activeOta.tutorialUrl.trim() !== '') || (activeOta.tutorialId && activeOta.tutorialId.trim() !== '')) && (
              <button
                onClick={() => handleOpenTutorial(activeOta)}
                className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-mono font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#ebbf01]" />
                  <span>Ver Passo a Passo Completo do Tutorial de Instalação</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </button>
            )}

            {/* Ações no Final da Página Alinhadas à Direita: Voltar e Compartilhar */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-sm hover:border-white/20 active:scale-98"
              >
                <ArrowLeft className="w-4 h-4 text-[#ebbf01]" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleShareCard(e, activeOta)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-mono text-xs font-extrabold uppercase transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer active:scale-98"
              >
                {copiedId === activeOta.id ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedId === activeOta.id ? 'Link Copiado!' : 'Compartilhar'}</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GENERAL CATALOG GRID VIEW
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between text-center lg:text-left gap-4">
        
        {/* Header Tag */}
        <div className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#ebbf01] uppercase tracking-wider bg-[#181820] px-3.5 py-2.5 rounded-2xl border border-white/[0.08] shrink-0 mx-auto lg:mx-0">
          <Layers className="w-4 h-4 text-[#ebbf01]" />
          <span>Versões OTA & Firmware</span>
        </div>

        {/* Right Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto">
          
          {/* 1. Campo Procurar */}
          <div className="relative w-full sm:w-56 h-8.5">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Procurar versão, MCU ou carro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8.5 pl-8 pr-3 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none placeholder:text-neutral-500 transition-all"
            />
          </div>

          {/* 2. Seleção por Veículo */}
          <div className="relative w-full sm:w-48 h-8.5">
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              className="w-full h-8.5 pl-3 pr-8 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none transition-all appearance-none cursor-pointer truncate"
            >
              <option value="Todos" className="bg-[#16161D] text-white">Todos os Veículos</option>
              {availableCars.map((car) => (
                <option key={car} value={car} className="bg-[#16161D] text-white">
                  {car}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400">
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>

          {/* 3. Seleção por Versão */}
          <div className="relative w-full sm:w-44 h-8.5">
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full h-8.5 pl-3 pr-8 bg-[#16161D] text-white text-xs font-mono rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="Todas" className="bg-[#16161D] text-white">Todas as Versões</option>
              {availableVersions.map((version) => (
                <option key={version} value={version} className="bg-[#16161D] text-white">
                  {version}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400">
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>

        </div>
      </div>

      {/* OTA Cards Grid */}
      {filteredUpdates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0a0a0e] border border-white/10 space-y-3">
          <HardDrive className="w-10 h-10 text-neutral-600 mx-auto" />
          <p className="text-neutral-300 font-mono text-sm">Nenhum arquivo OTA encontrado com os filtros selecionados.</p>
          {(searchTerm || selectedVersion !== 'Todas' || selectedCar !== 'Todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedVersion('Todas');
                setSelectedCar('Todos');
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-[#ebbf01] hover:underline cursor-pointer transition-colors"
            >
              Limpar filtros de busca
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {filteredUpdates.map((ota, index) => {
              const displayImage = ota.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop';
              const displayCars = ota.applicableCars || ota.modelTarget || 'Modelos BYD DiLink';

              // Visibility rules: Mobile (index < visibleCountMobile), Desktop (index < visibleCountDesktop)
              const showOnMobile = index < visibleCountMobile;
              const showOnDesktop = index < visibleCountDesktop;

              if (!showOnMobile && !showOnDesktop) return null;

              let visibilityClass = 'flex';
              if (showOnMobile && showOnDesktop) {
                visibilityClass = 'flex';
              } else if (!showOnMobile && showOnDesktop) {
                visibilityClass = 'hidden md:flex';
              } else if (showOnMobile && !showOnDesktop) {
                visibilityClass = 'flex md:hidden';
              }

              return (
                <div
                  key={ota.id}
                  className={`bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-2xl group ${visibilityClass}`}
                >
                  <div>
                    {/* Top Preview Image Container (Edge-to-edge 16/10 matching App cards) */}
                    <div 
                      onClick={() => handleOpenOta(ota)}
                      className="relative aspect-[16/10] overflow-hidden bg-[#16161D] cursor-pointer"
                    >
                      <img
                        src={displayImage}
                        alt={ota.title || `OTA ${ota.version}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/30" />
                    </div>

                    {/* Card Main Information */}
                    <div className="p-5 sm:p-6 space-y-3.5">
                      {/* Title */}
                      <div 
                        onClick={() => handleOpenOta(ota)}
                        className="cursor-pointer"
                      >
                        <h4 className="text-lg sm:text-xl font-extrabold text-white font-heading leading-tight line-clamp-2">
                          {ota.title || `Pacote OTA ${ota.version}`}
                        </h4>
                      </div>

                      {/* Versão & MCU Badges (Firmware & Versão) */}
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block">Firmware</span>
                          <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#ebbf01] shrink-0" />
                            <span className="truncate">{ota.version}</span>
                          </div>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block">Versão</span>
                          <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{ota.mcu || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Carros que usarão o arquivo */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-[#121218] border border-white/10 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ebbf01]">
                          <Car className="w-4 h-4 shrink-0" />
                          <span>Carros Compatíveis:</span>
                        </div>
                        <p className="text-xs text-neutral-200 font-sans leading-relaxed pl-6 line-clamp-2">
                          {displayCars}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-5 sm:p-6 pt-0">
                    {/* Botão Baixar que leva diretamente à página individual de cada OTA */}
                    <button
                      onClick={() => handleOpenOta(ota)}
                      className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#ebbf01]/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar Atualização</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carregar Mais - Versão Mobile */}
          {filteredUpdates.length > visibleCountMobile && (
            <div className="flex justify-center pt-2 md:hidden">
              <button
                onClick={() => setVisibleCountMobile(prev => prev + 3)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#111116] hover:bg-[#181822] border border-white/10 hover:border-[#ebbf01]/50 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer"
              >
                <span>Carregar mais</span>
                <ChevronDown className="w-4 h-4 text-[#ebbf01]" />
              </button>
            </div>
          )}

          {/* Carregar Mais - Versão Desktop */}
          {filteredUpdates.length > visibleCountDesktop && (
            <div className="hidden md:flex justify-center pt-4">
              <button
                onClick={() => setVisibleCountDesktop(prev => prev + 6)}
                className="py-3 px-8 rounded-2xl bg-[#111116] hover:bg-[#181822] border border-white/10 hover:border-[#ebbf01]/50 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer hover:shadow-[#ebbf01]/10"
              >
                <span>Carregar mais atualizações</span>
                <ChevronDown className="w-4 h-4 text-[#ebbf01]" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
