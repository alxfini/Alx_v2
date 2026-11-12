// ALX Tech - Analytics Service (Ultraleve e Não-Bloqueante)

export interface AnalyticsEventPayload {
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
}

/**
 * Detecta se a conexão vem do APK (Carro/Celular), Redes Sociais, Google, etc.
 */
function getSourceAndDeviceFromContext() {
  if (typeof window === 'undefined') {
    return { source: 'Acesso Direto', device: '💻 Computador' };
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
  // 3. Fontes de Tráfego Web
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
      const url = new URL(referrer);
      source = `🔗 ${url.hostname.replace('www.', '')}`;
    } catch {
      source = '🔗 Outra Origem';
    }
  } else {
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
 * Registra um evento de visualização de página de forma não-bloqueante
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  try {
    if (typeof window === 'undefined') return;

    const { source, device } = getSourceAndDeviceFromContext();
    const payload: AnalyticsEventPayload = {
      type: 'pageview',
      path: pagePath,
      pageTitle: pageTitle || document.title || pagePath,
      referrer: document.referrer || '',
      source,
      device,
      language: navigator.language || 'pt-BR',
    };

    // Disparo ultraleve não-bloqueante
    const bodyStr = JSON.stringify(payload);
    let sent = false;
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyStr], { type: 'application/json' });
        sent = navigator.sendBeacon('/api/site-metrics/event', blob);
      } catch {}
    }
    if (!sent) {
      fetch('/api/site-metrics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true,
      }).catch(() => {});
    }
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

    const { source, device } = getSourceAndDeviceFromContext();
    const payload: AnalyticsEventPayload = {
      type: 'download',
      itemId,
      itemTitle,
      itemCategory: itemCategory || 'Download Geral',
      downloadUrl,
      source,
      device,
      language: navigator.language || 'pt-BR',
    };

    const bodyStr = JSON.stringify(payload);
    let sent = false;
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyStr], { type: 'application/json' });
        sent = navigator.sendBeacon('/api/site-metrics/event', blob);
      } catch {}
    }
    if (!sent) {
      fetch('/api/site-metrics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silent catch
  }
}

/**
 * Busca o resumo completo de métricas para o Painel Admin
 */
export async function fetchAnalyticsStats(): Promise<AnalyticsStats | null> {
  try {
    const res = await fetch('/api/site-metrics/stats');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Limpa todo o histórico de estatísticas (apenas admin)
 */
export async function clearAnalyticsStats(): Promise<boolean> {
  try {
    const res = await fetch('/api/site-metrics/clear', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
