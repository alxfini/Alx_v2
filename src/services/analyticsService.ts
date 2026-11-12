// ALX Tech - Analytics Service (MySQL Hostinger + Node.js + Espelho Local em Tempo Real)

export interface AnalyticsEventPayload {
  action?: 'event' | 'stats' | 'clear';
  type: 'pageview' | 'download';
  path?: string;
  pageTitle?: string;
  itemId?: string;
  itemTitle?: string;
  itemCategory?: string;
  downloadUrl?: string;
  referrer?: string;
  source?: string;
  device?: string;
  language?: string;
  dateKey?: string;
}

export interface AnalyticsStats {
  totalPageViews: number;
  totalDownloads: number;
  sources: Record<string, number>;
  devices: Record<string, number>;
  countries: Record<string, number>;
  pages: Record<string, number>;
  downloads: Record<string, { title: string; category: string; count: number; lastDownloadedAt: string }>;
  recentEvents: Array<{
    id: string;
    type: 'pageview' | 'download';
    name: string;
    source: string;
    country: string;
    device: string;
    timestamp: string;
  }>;
  dailyHistory: Record<string, { pageViews: number; downloads: number }>;
  lastUpdated: string;
  resetAt?: string | null;
}

const LOCAL_MIRROR_KEY = 'alx_analytics_mirror_v2';
const SESSION_SOURCE_KEY = 'alx_session_traffic_source';
const BROADCAST_CHANNEL_NAME = 'alx_analytics_sync';
const ADMIN_IGNORE_KEY = 'alx_ignore_admin_analytics';

/**
 * Ativa por padrão o bloqueio de contagem para este navegador assim que o Admin faz login ou abre o painel
 */
export function initAdminAnalyticsIgnoreDefault(): void {
  try {
    if (typeof window === 'undefined') return;
    const current = localStorage.getItem(ADMIN_IGNORE_KEY);
    // Se nunca foi configurado neste navegador, ativa automaticamente para o dono do site
    if (current === null) {
      localStorage.setItem(ADMIN_IGNORE_KEY, 'true');
    }
  } catch {}
}

/**
 * Verifica se este navegador pertence ao Administrador e está com bloqueio de auto-contagem ativo
 */
export function isAdminAnalyticsIgnored(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(ADMIN_IGNORE_KEY);
    // Se o admin desativou explicitamente para fazer um teste ('false'), permite contabilizar
    if (saved === 'false') return false;
    // Se está marcado no localStorage (persiste mesmo após fechar o navegador) ou logado na sessão atual
    if (saved === 'true' || sessionStorage.getItem('alx_admin_authed') === 'true') {
      return true;
    }
  } catch {}
  return false;
}

/**
 * Permite ao Administrador ativar/desativar a proteção contra auto-contagem no navegador dele
 */
export function setAdminAnalyticsIgnored(ignore: boolean): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ADMIN_IGNORE_KEY, ignore ? 'true' : 'false');
  } catch {}
}

/**
 * Retorna a data atual no fuso horário do Brasil (YYYY-MM-DD) para consistência total entre cliente e servidor
 */
export function getLocalDateKey(): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {}
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createEmptyAnalyticsStats(): AnalyticsStats {
  return {
    totalPageViews: 0,
    totalDownloads: 0,
    sources: {},
    devices: {},
    countries: {},
    pages: {},
    downloads: {},
    recentEvents: [],
    dailyHistory: {},
    lastUpdated: new Date().toISOString(),
    resetAt: null,
  };
}

function normalizeStatsObject(raw: any): AnalyticsStats {
  if (!raw || typeof raw !== 'object') {
    return createEmptyAnalyticsStats();
  }
  return {
    totalPageViews: typeof raw.totalPageViews === 'number' ? raw.totalPageViews : Number(raw.totalPageViews) || 0,
    totalDownloads: typeof raw.totalDownloads === 'number' ? raw.totalDownloads : Number(raw.totalDownloads) || 0,
    sources: raw.sources && typeof raw.sources === 'object' && !Array.isArray(raw.sources) ? raw.sources : {},
    devices: raw.devices && typeof raw.devices === 'object' && !Array.isArray(raw.devices) ? raw.devices : {},
    countries: raw.countries && typeof raw.countries === 'object' && !Array.isArray(raw.countries) ? raw.countries : {},
    pages: raw.pages && typeof raw.pages === 'object' && !Array.isArray(raw.pages) ? raw.pages : {},
    downloads: raw.downloads && typeof raw.downloads === 'object' && !Array.isArray(raw.downloads) ? raw.downloads : {},
    recentEvents: Array.isArray(raw.recentEvents) ? raw.recentEvents : [],
    dailyHistory: raw.dailyHistory && typeof raw.dailyHistory === 'object' && !Array.isArray(raw.dailyHistory) ? raw.dailyHistory : {},
    lastUpdated: raw.lastUpdated || new Date().toISOString(),
    resetAt: raw.resetAt || null,
  };
}

function getLocalMirrorStats(): AnalyticsStats {
  try {
    if (typeof window === 'undefined') return createEmptyAnalyticsStats();
    const saved = localStorage.getItem(LOCAL_MIRROR_KEY);
    if (saved) {
      return normalizeStatsObject(JSON.parse(saved));
    }
  } catch {}
  return createEmptyAnalyticsStats();
}

function saveLocalMirrorStats(stats: AnalyticsStats) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_MIRROR_KEY, JSON.stringify(stats));
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: 'ANALYTICS_UPDATED', stats });
      bc.close();
    }
  } catch {}
}

function detectClientCountry(langStr?: string): string {
  const lang = (langStr || (typeof navigator !== 'undefined' ? navigator.language : '') || 'pt-BR').toLowerCase();
  if (lang.includes('pt-br') || lang.includes('pt_br')) return 'Brasil 🇧🇷';
  if (lang.includes('pt-pt') || lang.includes('pt_pt')) return 'Portugal 🇵🇹';
  if (lang.includes('en-us') || lang.includes('en_us')) return 'Estados Unidos 🇺🇸';
  if (lang.includes('es')) return 'Espanha / Latam 🇪🇸';
  return 'Brasil 🇧🇷';
}

/**
 * Detecta se a conexão vem do APK (Carro/Celular), Redes Sociais, Google, etc.
 */
function getSourceAndDeviceFromContext() {
  if (typeof window === 'undefined') {
    return { source: '🌐 Acesso Direto', device: '💻 Computador' };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const rawSource = (searchParams.get('source') || searchParams.get('ref') || searchParams.get('utm_source') || '').toLowerCase();
  const ua = (navigator.userAgent || '').toLowerCase();
  const referrer = (document.referrer || '').toLowerCase();

  let source = '';
  let device = '';

  // 1. Detecção do APK de Multimídia Automotiva / Carro
  if (
    rawSource.includes('apk_car') ||
    rawSource.includes('apk_carro') ||
    rawSource.includes('dilink') ||
    rawSource.includes('byd') ||
    ua.includes('dilink') ||
    ua.includes('carmultimedia') ||
    ua.includes('alx-car-app')
  ) {
    source = '🚗 APK Multimídia (Carro)';
    device = '🚗 Multimídia Carro';
  }
  // 2. Detecção do APK do Celular Android
  else if (
    rawSource.includes('apk_celular') ||
    rawSource.includes('apk_mobile') ||
    rawSource.includes('alx_apk') ||
    ua.includes('alx-mobile-app')
  ) {
    source = '📱 APK Mobile (Celular)';
    device = '📱 Celular';
  }
  // 3. Fontes de Tráfego Web via URL ou Referrer externo
  else if (rawSource.includes('google') || referrer.includes('google.')) {
    source = '🔍 Google (Busca)';
  } else if (rawSource.includes('youtube') || referrer.includes('youtube.') || referrer.includes('youtu.be')) {
    source = '▶️ YouTube';
  } else if (rawSource.includes('telegram') || referrer.includes('t.me') || referrer.includes('telegram')) {
    source = '✈️ Telegram';
  } else if (rawSource.includes('instagram') || referrer.includes('instagram.')) {
    source = '📸 Instagram';
  } else if (rawSource.includes('whatsapp') || referrer.includes('wa.me') || referrer.includes('whatsapp')) {
    source = '💬 WhatsApp';
  } else if (referrer) {
    try {
      const refUrl = new URL(referrer);
      const currentHost = window.location.hostname.replace('www.', '').toLowerCase();
      const refHost = refUrl.hostname.replace('www.', '').toLowerCase();
      // Ignora auto-referência do próprio domínio
      if (refHost && refHost !== currentHost && !refHost.includes('run.app') && !refHost.includes('localhost')) {
        source = `🔗 ${refHost}`;
      }
    } catch {}
  }

  // Preserva a fonte de entrada da sessão para navegações internas
  if (source) {
    try {
      sessionStorage.setItem(SESSION_SOURCE_KEY, source);
    } catch {}
  } else {
    try {
      const cachedSource = sessionStorage.getItem(SESSION_SOURCE_KEY);
      if (cachedSource) {
        source = cachedSource;
      }
    } catch {}
  }

  if (!source) {
    source = '🌐 Acesso Direto';
  }

  // Se o dispositivo ainda não tiver sido classificado como Multimídia
  if (!device) {
    const isMobile = window.innerWidth < 768 || /android|iphone|ipad|ipod|mobile/i.test(ua);
    device = isMobile ? '📱 Celular' : '💻 Computador';
  }

  return { source, device };
}

/**
 * Registra o evento no espelho local imediatamente para atualização instantânea (0ms)
 */
function recordEventInLocalMirror(payload: AnalyticsEventPayload) {
  try {
    const stats = getLocalMirrorStats();
    const today = payload.dateKey || getLocalDateKey();
    const source = payload.source || '🌐 Acesso Direto';
    const device = payload.device || '💻 Computador';
    const country = detectClientCountry(payload.language);

    if (!stats.dailyHistory[today]) {
      stats.dailyHistory[today] = { pageViews: 0, downloads: 0 };
    }

    stats.sources[source] = (stats.sources[source] || 0) + 1;
    stats.devices[device] = (stats.devices[device] || 0) + 1;
    stats.countries[country] = (stats.countries[country] || 0) + 1;

    let eventName = '';

    if (payload.type === 'download') {
      stats.totalDownloads = (stats.totalDownloads || 0) + 1;
      stats.dailyHistory[today].downloads = (stats.dailyHistory[today].downloads || 0) + 1;

      const itemId = payload.itemId || 'item-geral';
      const title = payload.itemTitle || 'Arquivo de Download';
      const category = payload.itemCategory || 'Geral';
      const prevCount = stats.downloads[itemId]?.count || 0;

      stats.downloads[itemId] = {
        title,
        category,
        count: prevCount + 1,
        lastDownloadedAt: new Date().toISOString(),
      };
      eventName = `Download: ${title}`;
    } else {
      stats.totalPageViews = (stats.totalPageViews || 0) + 1;
      stats.dailyHistory[today].pageViews = (stats.dailyHistory[today].pageViews || 0) + 1;

      const path = payload.path || '/';
      stats.pages[path] = (stats.pages[path] || 0) + 1;
      eventName = `Página: ${payload.pageTitle || path}`;
    }

    stats.recentEvents.unshift({
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: payload.type,
      name: eventName,
      source,
      country,
      device,
      timestamp: new Date().toISOString(),
    });

    if (stats.recentEvents.length > 50) {
      stats.recentEvents = stats.recentEvents.slice(0, 50);
    }

    stats.lastUpdated = new Date().toISOString();
    saveLocalMirrorStats(stats);
  } catch {}
}

/**
 * Envia o evento para o servidor PHP/MySQL (/api/metrics.php) de forma não-bloqueante
 */
function dispatchEventToServer(payload: AnalyticsEventPayload) {
  const bodyStr = JSON.stringify({ ...payload, action: 'event' });

  fetch('/api/metrics.php?action=event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: bodyStr,
    keepalive: true,
  }).catch(() => {
    fetch('/api/site-metrics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
      keepalive: true,
    }).catch(() => {});
  });
}

/**
 * Registra um evento de visualização de página de forma não-bloqueante
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  try {
    if (typeof window === 'undefined') return;
    // Não contabiliza a própria tela interna do painel admin como visita pública
    if (
      pagePath === '/admin' ||
      pagePath.startsWith('/admin/') ||
      window.location.pathname === '/admin' ||
      window.location.pathname.startsWith('/admin/') ||
      window.location.hash.includes('admin')
    ) {
      initAdminAnalyticsIgnoreDefault();
      return;
    }

    // Não contabiliza os acessos do próprio Administrador no navegador dele
    if (isAdminAnalyticsIgnored()) return;

    const { source, device } = getSourceAndDeviceFromContext();
    const payload: AnalyticsEventPayload = {
      action: 'event',
      type: 'pageview',
      path: pagePath || '/',
      pageTitle: pageTitle || document.title || pagePath || '/',
      referrer: document.referrer || '',
      source,
      device,
      language: navigator.language || 'pt-BR',
      dateKey: getLocalDateKey(),
    };

    recordEventInLocalMirror(payload);
    dispatchEventToServer(payload);
  } catch {
    // Ignora erros de telemetria sem afetar o usuário
  }
}

/**
 * Registra um download de arquivo/APK de forma não-bloqueante
 */
export function trackDownload(itemId: string, itemTitle: string, itemCategory?: string, downloadUrl?: string) {
  try {
    if (typeof window === 'undefined') return;
    // Não contabiliza downloads de teste feitos pelo próprio Administrador (a menos que desative o bloqueio)
    if (isAdminAnalyticsIgnored()) return;

    const { source, device } = getSourceAndDeviceFromContext();
    const payload: AnalyticsEventPayload = {
      action: 'event',
      type: 'download',
      itemId: itemId || 'item-geral',
      itemTitle: itemTitle || itemId || 'Download',
      itemCategory: itemCategory || 'Download Geral',
      downloadUrl,
      source,
      device,
      language: navigator.language || 'pt-BR',
      dateKey: getLocalDateKey(),
    };

    recordEventInLocalMirror(payload);
    dispatchEventToServer(payload);
  } catch {
    // Silent catch
  }
}

/**
 * Busca o resumo completo de métricas para o Painel Admin (MySQL Hostinger + Node + Mirror Local)
 */
export async function fetchAnalyticsStats(): Promise<AnalyticsStats> {
  const localStats = getLocalMirrorStats();

  const endpoints = [
    `/api/metrics.php?action=stats&t=${Date.now()}`,
    `/api/site-metrics/stats?t=${Date.now()}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) continue;

      const text = await res.text();
      if (!text || text.trim().startsWith('<')) continue; // Protege contra HTML de fallback .htaccess

      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.totalPageViews !== undefined) {
        const serverStats = normalizeStatsObject(parsed);

        // Se o servidor foi resetado mais recentemente que o espelho local, respeita o reset do servidor
        if (
          serverStats.resetAt &&
          (!localStats.resetAt || new Date(serverStats.resetAt).getTime() > new Date(localStats.resetAt).getTime())
        ) {
          saveLocalMirrorStats(serverStats);
          return serverStats;
        }

        // Usa os dados do servidor caso estejam sincronizados ou superiores ao espelho local
        if (
          serverStats.totalPageViews >= localStats.totalPageViews &&
          serverStats.totalDownloads >= localStats.totalDownloads
        ) {
          saveLocalMirrorStats(serverStats);
          return serverStats;
        }

        // Caso o navegador local tenha acabado de disparar um evento ainda em trânsito, retorna o mais atualizado
        return localStats;
      }
    } catch {
      // Tenta próximo endpoint
    }
  }

  return localStats;
}

/**
 * Limpa todo o histórico de estatísticas no MySQL, no Servidor e no Espelho Local
 */
export async function clearAnalyticsStats(): Promise<boolean> {
  const empty = createEmptyAnalyticsStats();
  empty.resetAt = new Date().toISOString();
  saveLocalMirrorStats(empty);

  const endpoints = [
    '/api/metrics.php?action=clear',
    '/api/site-metrics/clear',
  ];

  let clearedOnServer = false;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.trim().startsWith('<')) {
          clearedOnServer = true;
          break;
        }
      }
    } catch {}
  }

  return clearedOnServer || true;
}

/**
 * Escuta atualizações instantâneas entre abas via BroadcastChannel
 */
export function subscribeToAnalyticsUpdates(callback: (stats: AnalyticsStats) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let bc: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === 'ANALYTICS_UPDATED' && event.data?.stats) {
          callback(normalizeStatsObject(event.data.stats));
        }
      };
    }
  } catch {}

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_MIRROR_KEY && e.newValue) {
      try {
        callback(normalizeStatsObject(JSON.parse(e.newValue)));
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (bc) bc.close();
  };
}
