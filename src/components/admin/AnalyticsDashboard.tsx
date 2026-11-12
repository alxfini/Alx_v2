import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Eye, 
  Globe, 
  Smartphone, 
  Tv, 
  Laptop, 
  RefreshCw, 
  Trash2, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  Search, 
  Share2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { fetchAnalyticsStats, clearAnalyticsStats, AnalyticsStats } from '../../services/analyticsService';

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

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
      setFeedbackMsg('Estatísticas atualizadas em tempo real!');
    } else {
      setFeedbackMsg('Não foi possível obter dados novos do servidor.');
    }
    setIsLoading(false);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleClear = async () => {
    const success = await clearAnalyticsStats();
    if (success) {
      setFeedbackMsg('Histórico de estatísticas resetado com sucesso!');
      loadData();
    } else {
      setFeedbackMsg('Erro ao resetar estatísticas.');
    }
    setShowClearConfirm(false);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

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

  const totalPageViews = stats?.totalPageViews || 0;
  const totalDownloads = stats?.totalDownloads || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStats = stats?.dailyHistory?.[todayStr] || { pageViews: 0, downloads: 0 };

  // Helper para porcentagens
  const getPercentage = (count: number, total: number) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  // Ordena fontes por contagem com tipagem estrita
  const sortedSources = (Object.entries(stats?.sources || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const sortedDevices = (Object.entries(stats?.devices || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const sortedCountries = (Object.entries(stats?.countries || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const sortedPages = (Object.entries(stats?.pages || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);
  type DownloadStat = { title: string; category: string; count: number; lastDownloadedAt: string };
  const sortedDownloads = (Object.entries(stats?.downloads || {}) as [string, DownloadStat][]).sort((a, b) => b[1].count - a[1].count);

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
            <span>Analytics & Estatísticas do Site em Tempo Real</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
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

        {/* Card 2: Total de Downloads */}
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
          <p className="text-[11px] text-neutral-500 font-medium">Acumulado geral de downloads de arquivos</p>
        </div>

        {/* Card 3: Acessos via APK Multimídia / Carro */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              APK Multimídia (Carro)
            </span>
            <div className="w-8 h-8 rounded-xl bg-lime-500/10 text-lime-700 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-heading text-neutral-900">
              {stats?.sources?.['🚗 APK Multimídia (Carro)'] || 0}
            </div>
            <div className="text-[11px] font-mono font-bold text-lime-800 bg-lime-50 px-2 py-0.5 rounded-md border border-lime-200">
              {getPercentage(stats?.sources?.['🚗 APK Multimídia (Carro)'] || 0, totalPageViews)}
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">Acessos diretos da tela do veículo (DiLink)</p>
        </div>

        {/* Card 4: Acessos via APK Mobile / Celular */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              APK Mobile (Celular)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-heading text-neutral-900">
              {stats?.sources?.['📱 APK Mobile (Celular)'] || 0}
            </div>
            <div className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              {getPercentage(stats?.sources?.['📱 APK Mobile (Celular)'] || 0, totalPageViews)}
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">Acessos realizados via app do celular</p>
        </div>

      </div>

      {/* BLOCOS DE ORIGEM DO TRÁFEGO & DISPOSITIVOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
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
            <p className="text-xs text-neutral-500 py-6 text-center">Nenhum dado de origem registrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {sortedSources.map(([sourceName, count]) => {
                const pctNumber = totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0;
                return (
                  <div key={sourceName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-neutral-800 font-medium truncate">{sourceName}</span>
                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <span className="text-neutral-900 font-extrabold">{count}</span>
                        <span className="text-neutral-400 text-[10px]">({pctNumber}%)</span>
                      </div>
                    </div>
                    {/* Barra de Progresso Visualmente Iluminada */}
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

        {/* Bloco: Dispositivos & Localização por País */}
        <div className="space-y-6">
          
          {/* Dispositivos (Carro vs Celular vs Computador) */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-600" />
                <span>Tipos de Dispositivo</span>
              </h4>
            </div>

            {sortedDevices.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Aguardando novos acessos...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sortedDevices.map(([deviceName, count]) => {
                  const pct = getPercentage(count, totalPageViews);
                  return (
                    <div key={deviceName} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                      <div className="text-xs font-bold text-neutral-700 truncate">{deviceName}</div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-lg font-black text-neutral-900 font-mono">{count}</span>
                        <span className="text-[10px] font-mono font-bold text-neutral-500">{pct}</span>
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
                  const pctNumber = totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0;
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

      {/* PÁGINAS MAIS VISITADAS & RANQUEAMENTO DE DOWNLOADS */}
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
            <div className="space-y-2.5">
              {sortedPages.slice(0, 10).map(([pathUrl, count], idx) => (
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

        {/* Ranqueamento Detalhado de Downloads por Arquivo */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-600" />
              <span>Ranqueamento de Downloads por Arquivo</span>
            </h4>
          </div>

          {sortedDownloads.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">Nenhum download registrado ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {sortedDownloads.slice(0, 10).map(([itemId, itemData], idx) => {
                const dateStr = itemData.lastDownloadedAt 
                  ? new Date(itemData.lastDownloadedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : 'Recente';

                return (
                  <div key={itemId} className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl border border-neutral-200 space-y-1 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-600 text-white shrink-0">
                          #{idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-neutral-900 truncate font-heading">{itemData.title}</h5>
                      </div>
                      <div className="text-xs font-mono font-black text-cyan-700 shrink-0">
                        {itemData.count} downloads
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-0.5">
                      <span className="uppercase text-neutral-600 font-semibold">{itemData.category}</span>
                      <span>Último: {dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* FEED DE EVENTOS RECENTES (ÚLTIMAS NAVEGAÇÕES & DOWNLOADS) */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Atividades Recentes do Site (Últimos 50 Eventos)</span>
          </h4>
          <span className="text-[11px] font-mono text-neutral-500">
            Atualizado ao vivo
          </span>
        </div>

        {!stats?.recentEvents || stats.recentEvents.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">Nenhum evento recente.</p>
        ) : (
          <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto pr-1">
            {stats.recentEvents.map((evt) => {
              const timeFormatted = new Date(evt.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const isDl = evt.type === 'download';

              return (
                <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shrink-0 ${
                      isDl ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isDl ? 'Download' : 'Acesso'}
                    </span>
                    <span className="font-medium text-neutral-800 truncate">{evt.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-neutral-500">
                    <span className="hidden sm:inline text-neutral-600">{evt.source}</span>
                    <span className="hidden md:inline text-neutral-400">•</span>
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
