import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Globe, 
  Smartphone, 
  Tv, 
  Laptop, 
  Car,
  AppWindow,
  Cpu,
  Layers,
  RefreshCw, 
  Trash2, 
  Clock, 
  Share2,
  Check,
  Copy,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { 
  fetchAnalyticsStats, 
  clearAnalyticsStats, 
  subscribeToAnalyticsUpdates,
  getLocalDateKey,
  createEmptyAnalyticsStats,
  initAdminAnalyticsIgnoreDefault,
  isAdminAnalyticsIgnored,
  setAdminAnalyticsIgnored,
  AnalyticsStats 
} from '../../services/analyticsService';
import { useSiteData } from '../../context/SiteDataContext';

type ChartPeriodMode = '7d' | '30d' | 'months' | 'years';

export const AnalyticsDashboard: React.FC = () => {
  const { apps, otaUpdates, wallpapers } = useSiteData();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriodMode>('7d');
  const [ignoreMyAccess, setIgnoreMyAccess] = useState<boolean>(() => {
    initAdminAnalyticsIgnoreDefault();
    return isAdminAnalyticsIgnored();
  });

  const handleToggleIgnoreAdmin = () => {
    const nextValue = !ignoreMyAccess;
    setAdminAnalyticsIgnored(nextValue);
    setIgnoreMyAccess(nextValue);
    setFeedbackMsg(
      nextValue
        ? 'Proteção ativa: Seus próprios acessos neste navegador NÃO serão contabilizados!'
        : 'Modo Teste ativado: Seus acessos neste navegador passarão a ser contabilizados.'
    );
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    const data = await fetchAnalyticsStats();
    if (data) {
      setStats(data);
    }
    if (!silent) setIsLoading(false);
  };

  const handleManualRefresh = async () => {
    setIsLoading(true);
    const data = await fetchAnalyticsStats();
    if (data) {
      setStats(data);
      setFeedbackMsg('Estatísticas sincronizadas com o Banco de Dados em tempo real!');
    } else {
      setFeedbackMsg('Não foi possível obter dados novos do servidor.');
    }
    setIsLoading(false);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  useEffect(() => {
    initAdminAnalyticsIgnoreDefault();
    setIgnoreMyAccess(isAdminAnalyticsIgnored());
    loadData();
    const unsubscribe = subscribeToAnalyticsUpdates((updated) => {
      setStats(updated);
    });
    const timer = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  const handleClear = async () => {
    const success = await clearAnalyticsStats();
    if (success) {
      setStats(createEmptyAnalyticsStats());
      setFeedbackMsg('Histórico de estatísticas resetado com sucesso!');
      loadData(true);
    } else {
      setFeedbackMsg('Erro ao resetar estatísticas.');
    }
    setShowClearConfirm(false);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleCopyDeviceLink = (param: 'carro' | 'celular') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
    const url = `${origin}/?source=${param}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedTag(param);
      setTimeout(() => setCopiedTag(null), 2500);
    }
  };

  const totalPageViews = stats?.totalPageViews || 0;
  const totalDownloads = stats?.totalDownloads || 0;
  const todayStr = getLocalDateKey();
  const utcTodayStr = new Date().toISOString().split('T')[0];
  const todayStats = stats?.dailyHistory?.[todayStr] || stats?.dailyHistory?.[utcTodayStr] || { pageViews: 0, downloads: 0 };

  // Processamento de Histórico por Dia, Semana, Mês e Ano
  const timeSeriesData = useMemo(() => {
    const rawHistory = stats?.dailyHistory || {};
    const normalizedHistory: Record<string, { pageViews: number; downloads: number }> = { ...rawHistory };

    // Garante que a chave de hoje reflita os dados do dia atual
    if (!normalizedHistory[todayStr] && (todayStats.pageViews > 0 || todayStats.downloads > 0)) {
      normalizedHistory[todayStr] = {
        pageViews: todayStats.pageViews,
        downloads: todayStats.downloads,
      };
    }

    const [todayY, todayM, todayD] = todayStr.split('-').map(Number);
    const baseDate = new Date(todayY || new Date().getFullYear(), (todayM || 1) - 1, todayD || 1);

    const formatDateKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const shortWeekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const fullMonths = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // 1. Últimos 7 dias
    const last7Days: Array<{ key: string; shortLabel: string; fullLabel: string; pageViews: number; downloads: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const key = formatDateKey(d);
      const entry = normalizedHistory[key] || { pageViews: 0, downloads: 0 };
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const weekDay = shortWeekdays[d.getDay()];
      last7Days.push({
        key,
        shortLabel: `${dayNum}/${monthNum}`,
        fullLabel: `${weekDay}, ${dayNum}/${monthNum}/${d.getFullYear()}${i === 0 ? ' (Hoje)' : ''}`,
        pageViews: entry.pageViews || 0,
        downloads: entry.downloads || 0,
      });
    }

    // 2. Últimos 30 dias
    const last30Days: Array<{ key: string; shortLabel: string; fullLabel: string; pageViews: number; downloads: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const key = formatDateKey(d);
      const entry = normalizedHistory[key] || { pageViews: 0, downloads: 0 };
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const weekDay = shortWeekdays[d.getDay()];
      last30Days.push({
        key,
        shortLabel: `${dayNum}/${monthNum}`,
        fullLabel: `${weekDay}, ${dayNum}/${monthNum}/${d.getFullYear()}${i === 0 ? ' (Hoje)' : ''}`,
        pageViews: entry.pageViews || 0,
        downloads: entry.downloads || 0,
      });
    }

    // 3. Últimos 12 Meses (Por Mês)
    const monthTotalsMap: Record<string, { pageViews: number; downloads: number }> = {};
    Object.entries(normalizedHistory).forEach(([dateKey, val]) => {
      if (/^\d{4}-\d{2}/.test(dateKey)) {
        const ym = dateKey.slice(0, 7);
        if (!monthTotalsMap[ym]) monthTotalsMap[ym] = { pageViews: 0, downloads: 0 };
        monthTotalsMap[ym].pageViews += val.pageViews || 0;
        monthTotalsMap[ym].downloads += val.downloads || 0;
      }
    });

    const last12Months: Array<{ key: string; shortLabel: string; fullLabel: string; pageViews: number; downloads: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const y = d.getFullYear();
      const mIdx = d.getMonth();
      const ym = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
      const entry = monthTotalsMap[ym] || { pageViews: 0, downloads: 0 };
      last12Months.push({
        key: ym,
        shortLabel: `${shortMonths[mIdx]}/${String(y).slice(-2)}`,
        fullLabel: `${fullMonths[mIdx]} de ${y}${i === 0 ? ' (Mês Atual)' : ''}`,
        pageViews: entry.pageViews,
        downloads: entry.downloads,
      });
    }

    // 4. Por Ano (Últimos 3 anos)
    const yearTotalsMap: Record<string, { pageViews: number; downloads: number }> = {};
    Object.entries(normalizedHistory).forEach(([dateKey, val]) => {
      if (/^\d{4}/.test(dateKey)) {
        const yStr = dateKey.slice(0, 4);
        if (!yearTotalsMap[yStr]) yearTotalsMap[yStr] = { pageViews: 0, downloads: 0 };
        yearTotalsMap[yStr].pageViews += val.pageViews || 0;
        yearTotalsMap[yStr].downloads += val.downloads || 0;
      }
    });

    const currentYear = baseDate.getFullYear();
    const yearsList: Array<{ key: string; shortLabel: string; fullLabel: string; pageViews: number; downloads: number }> = [];
    for (let y = currentYear - 2; y <= currentYear; y++) {
      const yStr = String(y);
      const entry = yearTotalsMap[yStr] || { pageViews: 0, downloads: 0 };
      yearsList.push({
        key: yStr,
        shortLabel: yStr,
        fullLabel: `Ano de ${yStr}${y === currentYear ? ' (Ano Atual)' : ''}`,
        pageViews: entry.pageViews,
        downloads: entry.downloads,
      });
    }

    // Totais rápidos por período
    const weekViews = last7Days.reduce((acc, d) => acc + d.pageViews, 0);
    const weekDownloads = last7Days.reduce((acc, d) => acc + d.downloads, 0);

    const currentMonthKey = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
    const monthViews = monthTotalsMap[currentMonthKey]?.pageViews || todayStats.pageViews || 0;
    const monthDownloads = monthTotalsMap[currentMonthKey]?.downloads || todayStats.downloads || 0;

    const currentYearKey = String(baseDate.getFullYear());
    const yearViews = Math.max(yearTotalsMap[currentYearKey]?.pageViews || 0, monthViews);
    const yearDownloads = Math.max(yearTotalsMap[currentYearKey]?.downloads || 0, monthDownloads);

    return {
      last7Days,
      last30Days,
      last12Months,
      yearsList,
      summary: {
        today: { pageViews: todayStats.pageViews, downloads: todayStats.downloads },
        week: { pageViews: weekViews, downloads: weekDownloads },
        month: { pageViews: monthViews, downloads: monthDownloads },
        year: { pageViews: yearViews, downloads: yearDownloads },
      },
    };
  }, [stats?.dailyHistory, todayStr, todayStats.pageViews, todayStats.downloads]);

  if (isLoading && !stats) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-3xl border border-neutral-200">
        <RefreshCw className="w-8 h-8 text-[#ebbf01] animate-spin mx-auto" />
        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider font-mono">
          Carregando estatísticas em tempo real...
        </p>
      </div>
    );
  }

  // Helper para porcentagens
  const getPercentage = (count: number, total: number) => {
    if (!total || total === 0) return '0%';
    return `${Math.min(100, Math.round((count / total) * 100))}%`;
  };

  // Cálculo consolidado de Dispositivos: Carro (Multimídia) vs Celular vs Computador
  const rawDevices = stats?.devices || {};
  const rawSources = stats?.sources || {};

  let carDeviceCount = 0;
  let mobileDeviceCount = 0;
  let pcDeviceCount = 0;

  (Object.entries(rawDevices) as [string, number][]).forEach(([key, val]) => {
    const k = key.toLowerCase();
    const num = Number(val) || 0;
    if (k.includes('carro') || k.includes('multimídia') || k.includes('multimidia') || k.includes('dilink')) {
      carDeviceCount += num;
    } else if (k.includes('celular') || k.includes('mobile') || k.includes('smartphone')) {
      mobileDeviceCount += num;
    } else {
      pcDeviceCount += num;
    }
  });

  // Fallback caso haja registros antigos apenas em sources
  const carSourceCount =
    (rawSources['🚗 Multimídia (Carro)'] || 0) +
    (rawSources['🚗 APK Multimídia (Carro)'] || 0);
  const mobileSourceCount =
    (rawSources['📱 Acesso Mobile (Celular)'] || 0) +
    (rawSources['📱 APK Mobile (Celular)'] || 0);

  const finalCarCount = Math.max(carDeviceCount, carSourceCount);
  const finalMobileCount = Math.max(mobileDeviceCount, mobileSourceCount);
  const finalPcCount = pcDeviceCount;
  const totalDeviceAccesses = Math.max(finalCarCount + finalMobileCount + finalPcCount, totalPageViews);

  // Ordena fontes, países e páginas por contagem
  const sortedSources = (Object.entries(stats?.sources || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const sortedCountries = (Object.entries(stats?.countries || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const sortedPages = (Object.entries(stats?.pages || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);

  type DownloadStat = { title: string; category: string; count: number; lastDownloadedAt: string };
  const rawDownloadsEntries = Object.entries(stats?.downloads || {}) as [string, DownloadStat][];

  // Separa os downloads em tempo real entre Aplicativos, Atualizações OTA e Wallpapers
  const appRealtimeMap = new Map<string, DownloadStat>();
  const otaRealtimeMap = new Map<string, DownloadStat>();
  const wallpaperRealtimeMap = new Map<string, DownloadStat>();

  rawDownloadsEntries.forEach(([itemId, d]) => {
    const catLower = (d.category || '').toLowerCase();
    const idLower = itemId.toLowerCase();

    const isWallpaper =
      catLower.includes('wallpaper') ||
      catLower.includes('papel de parede') ||
      idLower.startsWith('wp-') ||
      (wallpapers || []).some((w) => w.id === itemId || w.slug === itemId || w.title === d.title);

    const isOta =
      !isWallpaper &&
      (catLower.includes('ota') ||
        catLower.includes('firmware') ||
        idLower.startsWith('ota-') ||
        otaUpdates.some((o) => o.id === itemId || o.slug === itemId || o.title === d.title));

    if (isWallpaper) {
      wallpaperRealtimeMap.set(itemId, d);
    } else if (isOta) {
      otaRealtimeMap.set(itemId, d);
    } else if (
      catLower.includes('aplicativo') ||
      catLower.includes('app') ||
      apps.some((a) => a.id === itemId || a.slug === itemId || a.name === d.title)
    ) {
      appRealtimeMap.set(itemId, d);
    }
  });

  // 1. Monta lista unificada de Estatísticas de Downloads de Aplicativos
  const appDownloadStatsList = (() => {
    const map = new Map<
      string,
      {
        id: string;
        title: string;
        subtitle: string;
        realtimeCount: number;
        catalogCount: number;
        lastDownloadedAt?: string;
      }
    >();

    appRealtimeMap.forEach((d, itemId) => {
      const matchedApp = apps.find(
        (a) => a.id === itemId || a.slug === itemId || a.name.toLowerCase() === (d.title || '').toLowerCase()
      );
      const key = matchedApp ? matchedApp.id : itemId;
      const existing = map.get(key);
      map.set(key, {
        id: key,
        title: matchedApp?.name || d.title || itemId,
        subtitle: matchedApp ? `${matchedApp.category || 'App'} • ${matchedApp.version || 'v1.0'}` : d.category || 'Aplicativo',
        realtimeCount: (existing?.realtimeCount || 0) + (d.count || 0),
        catalogCount: matchedApp?.downloadsCount || d.count || 0,
        lastDownloadedAt: d.lastDownloadedAt || existing?.lastDownloadedAt,
      });
    });

    apps.forEach((app) => {
      if (!map.has(app.id)) {
        map.set(app.id, {
          id: app.id,
          title: app.name,
          subtitle: `${app.category || 'Aplicativo'} • ${app.version || 'v1.0'}`,
          realtimeCount: 0,
          catalogCount: app.downloadsCount || 0,
          lastDownloadedAt: undefined,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.realtimeCount !== a.realtimeCount) return b.realtimeCount - a.realtimeCount;
      return b.catalogCount - a.catalogCount;
    });
  })();

  // 2. Monta lista unificada de Estatísticas de Downloads de Atualizações OTA
  const otaDownloadStatsList = (() => {
    const map = new Map<
      string,
      {
        id: string;
        title: string;
        subtitle: string;
        realtimeCount: number;
        catalogCount: number;
        lastDownloadedAt?: string;
      }
    >();

    otaRealtimeMap.forEach((d, itemId) => {
      const matchedOta = otaUpdates.find(
        (o) => o.id === itemId || o.slug === itemId || (o.title || '').toLowerCase() === (d.title || '').toLowerCase()
      );
      const key = matchedOta ? matchedOta.id : itemId;
      const existing = map.get(key);
      map.set(key, {
        id: key,
        title: matchedOta?.title || d.title || `Pacote OTA ${itemId}`,
        subtitle: matchedOta
          ? `${matchedOta.version || 'OTA'} • ${matchedOta.applicableCars || matchedOta.modelTarget || 'BYD DiLink'}`
          : d.category || 'Atualização OTA',
        realtimeCount: (existing?.realtimeCount || 0) + (d.count || 0),
        catalogCount: matchedOta?.downloadsCount || d.count || 0,
        lastDownloadedAt: d.lastDownloadedAt || existing?.lastDownloadedAt,
      });
    });

    otaUpdates.forEach((ota) => {
      if (!map.has(ota.id)) {
        map.set(ota.id, {
          id: ota.id,
          title: ota.title || `Atualização ${ota.version}`,
          subtitle: `${ota.version || 'OTA'} • ${ota.applicableCars || ota.modelTarget || 'BYD DiLink'}`,
          realtimeCount: 0,
          catalogCount: ota.downloadsCount || 0,
          lastDownloadedAt: undefined,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.realtimeCount !== a.realtimeCount) return b.realtimeCount - a.realtimeCount;
      return b.catalogCount - a.catalogCount;
    });
  })();

  // 3. Monta lista unificada de Estatísticas de Downloads de Wallpapers
  const wallpaperDownloadStatsList = (() => {
    const map = new Map<
      string,
      {
        id: string;
        title: string;
        subtitle: string;
        realtimeCount: number;
        catalogCount: number;
        lastDownloadedAt?: string;
      }
    >();

    wallpaperRealtimeMap.forEach((d, itemId) => {
      const matchedWp = (wallpapers || []).find(
        (w) => w.id === itemId || w.slug === itemId || (w.title || '').toLowerCase() === (d.title || '').toLowerCase()
      );
      const key = matchedWp ? matchedWp.id : itemId;
      const existing = map.get(key);
      map.set(key, {
        id: key,
        title: matchedWp?.title || d.title || `Wallpaper ${itemId}`,
        subtitle: matchedWp
          ? `${matchedWp.type === 'video' ? 'Animado (Vídeo)' : 'Estático'} • ${matchedWp.resolution || matchedWp.category || '4K'}`
          : d.category || 'Wallpaper',
        realtimeCount: (existing?.realtimeCount || 0) + (d.count || 0),
        catalogCount: matchedWp?.downloadCount || d.count || 0,
        lastDownloadedAt: d.lastDownloadedAt || existing?.lastDownloadedAt,
      });
    });

    (wallpapers || []).forEach((wp) => {
      if (!map.has(wp.id)) {
        map.set(wp.id, {
          id: wp.id,
          title: wp.title,
          subtitle: `${wp.type === 'video' ? 'Animado (Vídeo)' : 'Estático'} • ${wp.resolution || wp.category || '4K'}`,
          realtimeCount: 0,
          catalogCount: wp.downloadCount || 0,
          lastDownloadedAt: undefined,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.realtimeCount !== a.realtimeCount) return b.realtimeCount - a.realtimeCount;
      return b.catalogCount - a.catalogCount;
    });
  })();

  const totalAppDownloadsRealtime = appDownloadStatsList.reduce((acc, item) => acc + item.realtimeCount, 0);
  const totalOtaDownloadsRealtime = otaDownloadStatsList.reduce((acc, item) => acc + item.realtimeCount, 0);
  const totalWallpaperDownloadsRealtime = wallpaperDownloadStatsList.reduce((acc, item) => acc + item.realtimeCount, 0);

  // Dados ativos do gráfico conforme o filtro selecionado
  const activeChartSeries =
    chartPeriod === '7d'
      ? timeSeriesData.last7Days
      : chartPeriod === '30d'
      ? timeSeriesData.last30Days
      : chartPeriod === 'months'
      ? timeSeriesData.last12Months
      : timeSeriesData.yearsList;

  const maxChartValue = Math.max(
    1,
    ...activeChartSeries.map((item) => Math.max(item.pageViews, item.downloads))
  );

  // Lista detalhada na ordem mais recente primeiro para leitura rápida
  const activeTableSeries = [...activeChartSeries].reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-neutral-900">
      
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h3 className="text-xl font-black text-neutral-900 font-heading flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#ebbf01]" />
            <span>Estatísticas</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleIgnoreAdmin}
            title={ignoreMyAccess ? 'Clique caso queira testar a contagem neste navegador' : 'Clique para voltar a ocultar seus próprios acessos'}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer border ${
              ignoreMyAccess
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {ignoreMyAccess ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ignorar Meu Acesso: ATIVO</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Modo Teste: Contabilizando</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-[#ebbf01] text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Agora</span>
          </button>
        </div>
      </div>

      {/* Faixa Sintética: Totais do Dia vs Acumulado Geral desde que Zerou */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-black p-4 rounded-2xl border border-neutral-800 text-white shadow-md flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-neutral-300">
            Métricas de Hoje vs Acumulado Geral (Desde que Zerou)
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-neutral-800/90 px-3 py-1.5 rounded-xl border border-neutral-700">
            <span className="text-neutral-400">Visualizações:</span>
            <span className="text-amber-400 font-extrabold">+{todayStats.pageViews} hoje</span>
            <span className="text-neutral-500">|</span>
            <span className="text-white font-black">{totalPageViews} total geral</span>
          </div>

          <div className="flex items-center gap-2 bg-neutral-800/90 px-3 py-1.5 rounded-xl border border-neutral-700">
            <span className="text-neutral-400">Downloads:</span>
            <span className="text-cyan-400 font-extrabold">+{todayStats.downloads} hoje</span>
            <span className="text-neutral-500">|</span>
            <span className="text-white font-black">{totalDownloads} total geral</span>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Zerar */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-black text-neutral-900">Zerar todas as estatísticas?</h4>
              <p className="text-xs text-neutral-600">
                Essa ação irá resetar os contadores de visitas, origem de tráfego, países e estatísticas de downloads.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white cursor-pointer"
              >
                Confirmar e Zerar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 CARDS DE DESTAQUE TOP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total de Visualizações */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 font-heading">
              Visualizações Totais
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-heading text-neutral-900">{totalPageViews}</div>
            <div className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              +{todayStats.pageViews} hoje
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">Acumulado geral de visualizações de páginas</p>
        </div>

        {/* Card 2: Total de Downloads (Apps + OTA + Wallpapers) */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              Downloads Totais
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-heading text-neutral-900">{totalDownloads}</div>
            <div className="text-[11px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
              +{todayStats.downloads} hoje
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            Apps: <strong className="text-neutral-800">{totalAppDownloadsRealtime}</strong> • OTA: <strong className="text-neutral-800">{totalOtaDownloadsRealtime}</strong> • Wallpapers: <strong className="text-neutral-800">{totalWallpaperDownloadsRealtime}</strong>
          </p>
        </div>

        {/* Card 3: Acessos no Carro (Multimídia) */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-lime-800">
              Usuário no Carro (Multimídia)
            </span>
            <div className="w-8 h-8 rounded-xl bg-lime-500/15 text-lime-700 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-heading text-neutral-900">
              {finalCarCount}
            </div>
            <div className="text-[11px] font-mono font-bold text-lime-800 bg-lime-50 px-2 py-0.5 rounded-md border border-lime-200">
              {getPercentage(finalCarCount, totalDeviceAccesses)}
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">Acessos pela Central Multimídia (DiLink / Carro)</p>
        </div>

        {/* Card 4: Acessos no Celular (Smartphone) */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-800">
              Usuário no Celular
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-heading text-neutral-900">
              {finalMobileCount}
            </div>
            <div className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              {getPercentage(finalMobileCount, totalDeviceAccesses)}
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">Acessos realizados pelo Smartphone (Android / iOS)</p>
        </div>

      </div>

      {/* GRÁFICO E HISTÓRICO DE VISITAS E DOWNLOADS POR DIA, MÊS E ANO */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ebbf01]" />
              <span>Evolução de Visitas e Downloads (Dia, Mês e Ano)</span>
            </h4>
            <p className="text-xs text-neutral-500">
              Acompanhe o desempenho diário, semanal, mensal e anual do portal.
            </p>
          </div>

          {/* Botões de Período do Gráfico */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <button
              type="button"
              onClick={() => setChartPeriod('7d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                chartPeriod === '7d'
                  ? 'bg-black text-[#ebbf01] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              7 Dias
            </button>
            <button
              type="button"
              onClick={() => setChartPeriod('30d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                chartPeriod === '30d'
                  ? 'bg-black text-[#ebbf01] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={() => setChartPeriod('months')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                chartPeriod === 'months'
                  ? 'bg-black text-[#ebbf01] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Por Mês (12m)
            </button>
            <button
              type="button"
              onClick={() => setChartPeriod('years')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                chartPeriod === 'years'
                  ? 'bg-black text-[#ebbf01] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Por Ano
            </button>
          </div>
        </div>

        {/* 4 Mini Cards de Resumo Temporal: Hoje | Últimos 7 Dias | Este Mês | Este Ano */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Hoje ({todayStr.split('-').reverse().slice(0, 2).join('/')})</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-neutral-900">{timeSeriesData.summary.today.pageViews} <small className="text-[10px] font-normal text-neutral-500">visitas</small></span>
              <span className="text-xs font-bold text-cyan-700">{timeSeriesData.summary.today.downloads} dl</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Últimos 7 Dias</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-neutral-900">{timeSeriesData.summary.week.pageViews} <small className="text-[10px] font-normal text-neutral-500">visitas</small></span>
              <span className="text-xs font-bold text-cyan-700">{timeSeriesData.summary.week.downloads} dl</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Neste Mês</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-neutral-900">{timeSeriesData.summary.month.pageViews} <small className="text-[10px] font-normal text-neutral-500">visitas</small></span>
              <span className="text-xs font-bold text-cyan-700">{timeSeriesData.summary.month.downloads} dl</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Neste Ano</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-neutral-900">{timeSeriesData.summary.year.pageViews} <small className="text-[10px] font-normal text-neutral-500">visitas</small></span>
              <span className="text-xs font-bold text-cyan-700">{timeSeriesData.summary.year.downloads} dl</span>
            </div>
          </div>
        </div>

        {/* Gráfico Visual de Colunas (Visitas em Amarelo Ouro vs Downloads em Azul Ciano) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 text-white border border-neutral-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-neutral-400 font-bold uppercase">
              {chartPeriod === '7d' && 'Gráfico Diário • Últimos 7 Dias'}
              {chartPeriod === '30d' && 'Gráfico Diário • Últimos 30 Dias'}
              {chartPeriod === 'months' && 'Gráfico Mensal • Últimos 12 Meses'}
              {chartPeriod === 'years' && 'Gráfico Anual • Histórico por Ano'}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                <span className="w-3 h-3 rounded-xs bg-[#ebbf01] inline-block" />
                <span>Visitas</span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                <span className="w-3 h-3 rounded-xs bg-cyan-400 inline-block" />
                <span>Downloads</span>
              </span>
            </div>
          </div>

          {/* Área das Colunas */}
          <div className="overflow-x-auto pb-2">
            <div
              className="flex items-end justify-between gap-2 sm:gap-3 h-48 pt-6 px-2 border-b border-neutral-800"
              style={{ minWidth: chartPeriod === '30d' ? '780px' : chartPeriod === 'months' ? '560px' : '100%' }}
            >
              {activeChartSeries.map((point) => {
                const viewsHeightPct = point.pageViews > 0 ? Math.max(8, Math.round((point.pageViews / maxChartValue) * 100)) : 2;
                const dlHeightPct = point.downloads > 0 ? Math.max(8, Math.round((point.downloads / maxChartValue) * 100)) : 2;

                return (
                  <div
                    key={point.key}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    title={`${point.fullLabel}\nVisitas: ${point.pageViews}\nDownloads: ${point.downloads}`}
                  >
                    {/* Valores no topo da coluna */}
                    <div className="mb-1 flex items-center gap-1 text-[9px] font-mono font-bold opacity-85 group-hover:opacity-100 transition-opacity">
                      {point.pageViews > 0 && <span className="text-[#ebbf01]">{point.pageViews}</span>}
                      {point.pageViews > 0 && point.downloads > 0 && <span className="text-neutral-600">/</span>}
                      {point.downloads > 0 && <span className="text-cyan-400">{point.downloads}</span>}
                    </div>

                    {/* Par de Barras */}
                    <div className="w-full max-w-[38px] flex items-end justify-center gap-1 h-32">
                      <div
                        className={`flex-1 rounded-t-md transition-all duration-500 ${
                          point.pageViews > 0
                            ? 'bg-gradient-to-t from-amber-500 to-[#ebbf01] group-hover:brightness-110'
                            : 'bg-neutral-800/70'
                        }`}
                        style={{ height: `${viewsHeightPct}%` }}
                      />
                      <div
                        className={`flex-1 rounded-t-md transition-all duration-500 ${
                          point.downloads > 0
                            ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:brightness-110'
                            : 'bg-neutral-800/50'
                        }`}
                        style={{ height: `${dlHeightPct}%` }}
                      />
                    </div>

                    {/* Rótulo X */}
                    <span className="mt-2 text-[10px] font-mono text-neutral-400 group-hover:text-white truncate max-w-full">
                      {point.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabela Detalhada de Visitas e Downloads por Dia / Mês / Ano */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-500 px-1">
            <span>DETALHAMENTO DO PERÍODO SELECIONADO</span>
            <span>VISITAS / DOWNLOADS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {activeTableSeries.map((row) => (
              <div
                key={row.key}
                className="p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 flex items-center justify-between gap-2 text-xs transition-colors"
              >
                <span className="font-bold text-neutral-800 truncate">{row.fullLabel}</span>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-extrabold">
                    {row.pageViews} vis.
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 font-extrabold">
                    {row.downloads} dl
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS DE DOWNLOADS: APLICATIVOS vs ATUALIZAÇÕES OTA vs WALLPAPERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bloco 1: Estatísticas de Downloads de Aplicativos (APKs) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 gap-2">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <AppWindow className="w-4 h-4 text-cyan-600 shrink-0" />
              <span className="truncate">Downloads de Aplicativos</span>
            </h4>
            <span className="text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 shrink-0">
              {totalAppDownloadsRealtime} dl
            </span>
          </div>

          {appDownloadStatsList.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">Nenhum aplicativo cadastrado ou baixado ainda.</p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {appDownloadStatsList.map((item, idx) => {
                const dateStr = item.lastDownloadedAt
                  ? new Date(item.lastDownloadedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Sem registro recente';

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl border border-neutral-200 space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-600 text-white shrink-0">
                          #{idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-neutral-900 truncate font-heading">{item.title}</h5>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                          {item.realtimeCount}
                        </span>
                        {item.catalogCount > 0 && (
                          <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white px-2 py-0.5 rounded-md border border-neutral-200" title="Contador acumulado no card do aplicativo">
                            Total: {item.catalogCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-0.5 gap-2">
                      <span className="truncate max-w-[60%] text-neutral-600 font-semibold">{item.subtitle}</span>
                      <span className="shrink-0">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bloco 2: Estatísticas de Downloads de Atualizações OTA */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 gap-2">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#ebbf01] shrink-0" />
              <span className="truncate">Downloads de OTA</span>
            </h4>
            <span className="text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
              {totalOtaDownloadsRealtime} dl
            </span>
          </div>

          {otaDownloadStatsList.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">Nenhuma atualização OTA cadastrada ou baixada ainda.</p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {otaDownloadStatsList.map((item, idx) => {
                const dateStr = item.lastDownloadedAt
                  ? new Date(item.lastDownloadedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Sem registro recente';

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl border border-neutral-200 space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black text-[#ebbf01] shrink-0">
                          #{idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-neutral-900 truncate font-heading">{item.title}</h5>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {item.realtimeCount}
                        </span>
                        {item.catalogCount > 0 && (
                          <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white px-2 py-0.5 rounded-md border border-neutral-200" title="Contador acumulado no pacote OTA">
                            Total: {item.catalogCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-0.5 gap-2">
                      <span className="truncate max-w-[60%] text-neutral-600 font-semibold">{item.subtitle}</span>
                      <span className="shrink-0">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bloco 3: Estatísticas de Downloads de Wallpapers */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 gap-2">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="truncate">Downloads de Wallpapers</span>
            </h4>
            <span className="text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 shrink-0">
              {totalWallpaperDownloadsRealtime} dl
            </span>
          </div>

          {wallpaperDownloadStatsList.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">Nenhum wallpaper cadastrado ou baixado ainda.</p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {wallpaperDownloadStatsList.map((item, idx) => {
                const dateStr = item.lastDownloadedAt
                  ? new Date(item.lastDownloadedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Sem registro recente';

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl border border-neutral-200 space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white shrink-0">
                          #{idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-neutral-900 truncate font-heading">{item.title}</h5>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {item.realtimeCount}
                        </span>
                        {item.catalogCount > 0 && (
                          <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white px-2 py-0.5 rounded-md border border-neutral-200" title="Contador acumulado no Wallpaper">
                            Total: {item.catalogCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-0.5 gap-2">
                      <span className="truncate max-w-[60%] text-neutral-600 font-semibold">{item.subtitle}</span>
                      <span className="shrink-0">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* BLOCOS DE DISPOSITIVOS (CARRO VS CELULAR VS COMPUTADOR) & ORIGEM DO TRÁFEGO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bloco: Como saber se o usuário está no Carro ou Celular */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <Car className="w-4 h-4 text-lime-600" />
              <span>Dispositivo do Usuário: Carro vs Celular vs PC</span>
            </h4>
            <span className="text-[11px] font-mono font-bold text-neutral-500">
              Detecção Automática Ativa
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Carro / Multimídia */}
            <div className="p-4 bg-lime-50/60 rounded-2xl border border-lime-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-lime-950 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-lime-700 shrink-0" />
                  <span>No Carro</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-lime-800 bg-white px-1.5 py-0.5 rounded border border-lime-200">
                  {getPercentage(finalCarCount, totalDeviceAccesses)}
                </span>
              </div>
              <div className="text-2xl font-black text-neutral-900 font-mono">{finalCarCount}</div>
              <div className="w-full h-1.5 bg-lime-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime-600 rounded-full transition-all duration-500"
                  style={{ width: getPercentage(finalCarCount, totalDeviceAccesses) }}
                />
              </div>
              <p className="text-[10px] text-neutral-600 leading-tight">
                Central Multimídia BYD DiLink / Tela horizontal automotiva
              </p>
            </div>

            {/* 2. Celular / Smartphone */}
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>No Celular</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-800 bg-white px-1.5 py-0.5 rounded border border-purple-200">
                  {getPercentage(finalMobileCount, totalDeviceAccesses)}
                </span>
              </div>
              <div className="text-2xl font-black text-neutral-900 font-mono">{finalMobileCount}</div>
              <div className="w-full h-1.5 bg-purple-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: getPercentage(finalMobileCount, totalDeviceAccesses) }}
                />
              </div>
              <p className="text-[10px] text-neutral-600 leading-tight">
                Smartphones Android e iPhone em tela vertical
              </p>
            </div>

            {/* 3. Computador / Notebook */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-neutral-600 shrink-0" />
                  <span>Computador</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                  {getPercentage(finalPcCount, totalDeviceAccesses)}
                </span>
              </div>
              <div className="text-2xl font-black text-neutral-900 font-mono">{finalPcCount}</div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-700 rounded-full transition-all duration-500"
                  style={{ width: getPercentage(finalPcCount, totalDeviceAccesses) }}
                />
              </div>
              <p className="text-[10px] text-neutral-600 leading-tight">
                Acesso via Windows, Mac ou Desktop sem touch
              </p>
            </div>
          </div>

          {/* Explicação + Links de Identificação Direta para APKs */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5 text-xs">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-[11px] text-neutral-600 leading-relaxed">
                <p className="font-bold text-neutral-900">
                  Como o sistema sabe se o usuário está no Carro ou no Celular?
                </p>
                <p>
                  <strong>1. Automático pelo Navegador:</strong> O site analisa automaticamente o sistema da central multimídia (<em>DiLink, BYD, QCM6125, Android Automotivo sem flag Mobile ou Linux ARM Touch em tela horizontal</em>) e separa de celulares comuns (<em>Android/iPhone em tela vertical</em>).
                </p>
                <p>
                  <strong>2. Links para colocar dentro de APKs ou Favoritos (Opcional):</strong> Se você tiver um WebView/atalho no APK do carro ou do celular, também pode usar os links abaixo para forçar a identificação:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopyDeviceLink('carro')}
                className="px-3 py-1.5 rounded-xl bg-lime-100 hover:bg-lime-200 text-lime-900 border border-lime-300 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedTag === 'carro' ? <Check className="w-3.5 h-3.5 text-lime-700" /> : <Copy className="w-3.5 h-3.5 text-lime-700" />}
                <span>{copiedTag === 'carro' ? 'Copiado (?source=carro)' : 'Copiar Link Carro (?source=carro)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyDeviceLink('celular')}
                className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedTag === 'celular' ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5 text-purple-700" />}
                <span>{copiedTag === 'celular' ? 'Copiado (?source=celular)' : 'Copiar Link Celular (?source=celular)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bloco: Origem do Tráfego & Países */}
        <div className="space-y-6">
          {/* Bloco: Origem do Tráfego (Google, YouTube, APKs, Telegram, etc) */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#ebbf01]" />
                <span>Origem do Tráfego (Canais de Entrada)</span>
              </h4>
              <span className="text-[11px] font-mono font-bold text-neutral-500">
                {sortedSources.length} origens registradas
              </span>
            </div>

            {sortedSources.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Nenhum dado de origem registrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {sortedSources.map(([sourceName, count]) => {
                  const pctNumber = totalPageViews > 0 ? Math.min(100, Math.round((count / totalPageViews) * 100)) : 0;
                  return (
                    <div key={sourceName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-neutral-800 font-medium truncate">{sourceName}</span>
                        <div className="flex items-center gap-2 font-mono shrink-0">
                          <span className="text-neutral-900 font-extrabold">{count}</span>
                          <span className="text-neutral-400 text-[10px]">({pctNumber}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-[#ebbf01] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pctNumber, 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Localização Geográfica (Países) */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Localização Geográfica (Países)</span>
              </h4>
              <span className="text-[11px] font-mono font-bold text-neutral-500">
                {sortedCountries.length} países
              </span>
            </div>

            {sortedCountries.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Nenhum acesso registrado ainda.</p>
            ) : (
              <div className="space-y-2.5">
                {sortedCountries.map(([countryName, count]) => {
                  const pctNumber = totalPageViews > 0 ? Math.min(100, Math.round((count / totalPageViews) * 100)) : 0;
                  return (
                    <div key={countryName} className="flex items-center justify-between text-xs p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                      <span className="font-bold text-neutral-800">{countryName}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-extrabold text-neutral-900">{count} acessos</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {pctNumber}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PÁGINAS MAIS VISITADAS & FEED DE EVENTOS RECENTES (COM IDENTIFICAÇÃO CARRO/CELULAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabela de Páginas Mais Acessadas */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#ebbf01]" />
              <span>Páginas Mais Acessadas</span>
            </h4>
          </div>

          {sortedPages.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">Nenhuma visualização acumulada.</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {sortedPages.slice(0, 12).map(([pathUrl, count], idx) => (
                <div key={pathUrl} className="flex items-center justify-between text-xs p-2.5 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl border border-neutral-200 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black text-[#ebbf01] shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-neutral-800 font-medium truncate">{pathUrl}</span>
                  </div>
                  <div className="font-mono font-extrabold text-neutral-900 shrink-0 ml-2">
                    {count} <span className="text-[10px] text-neutral-500 font-normal">visitas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FEED DE EVENTOS RECENTES (MOSTRANDO SE O USUÁRIO ESTÁ NO CARRO OU CELULAR) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Atividades Recentes (Carro / Celular / PC)</span>
            </h4>
            <span className="text-[11px] font-mono text-neutral-500">
              Ao vivo (Últimos 50)
            </span>
          </div>

          {!stats?.recentEvents || stats.recentEvents.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">Nenhum evento recente.</p>
          ) : (
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-1">
              {stats.recentEvents.map((evt) => {
                const timeFormatted = new Date(evt.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const isDl = evt.type === 'download';
                const devLower = (evt.device || '').toLowerCase();
                const isCar = devLower.includes('carro') || devLower.includes('multimídia') || devLower.includes('multimidia');
                const isMobile = devLower.includes('celular') || devLower.includes('mobile');

                return (
                  <div key={evt.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shrink-0 ${
                        isDl ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isDl ? 'Download' : 'Acesso'}
                      </span>

                      {/* Etiqueta explícita indicando Carro vs Celular vs PC */}
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shrink-0 border ${
                        isCar
                          ? 'bg-lime-100 text-lime-900 border-lime-300'
                          : isMobile
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                      }`}>
                        {isCar ? '🚗 No Carro' : isMobile ? '📱 Celular' : '💻 PC'}
                      </span>

                      <span className="font-medium text-neutral-800 truncate">{evt.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-neutral-500">
                      <span className="hidden xl:inline text-neutral-600">{evt.source}</span>
                      <span>{evt.country}</span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-700 font-bold">{timeFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* SEÇÃO NO FINAL DA PÁGINA: GERENCIAMENTO E LIMPEZA DE ESTATÍSTICAS */}
      <div className="bg-red-50/60 p-6 rounded-3xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-red-900 font-heading flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Zerar Estatísticas do Site</span>
          </h4>
          <p className="text-xs text-neutral-600 font-medium">
            Resetar os contadores de visitas, origem de tráfego, acessos por país e ranking de downloads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          <span>Zerar Estatísticas</span>
        </button>
      </div>

    </div>
  );
};
