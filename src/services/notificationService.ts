// Web Notifications & Push Service for ALX
import { AppNotification } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações web.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendBrowserNotification = (title: string, options?: { body?: string; icon?: string; url?: string }) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body: options?.body || '',
          icon: options?.icon || '/alx-logo.svg',
          badge: '/alx-logo.svg',
          vibrate: [200, 100, 200],
          data: { url: options?.url || '/' },
        } as NotificationOptions);
      });
    } else {
      new Notification(title, {
        body: options?.body || '',
        icon: options?.icon || '/alx-logo.svg',
      });
    }
  } catch (err) {
    console.warn('Falha ao disparar notificação no navegador:', err);
  }
};

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Bem-vindo ao Portal ALX!',
    message: 'Acesse aplicativos homologados, simulador de autonomia e atualizações OTA.',
    category: 'system',
    date: 'Hoje',
    linkType: 'home',
    isRead: false,
    badge: 'Novo'
  },
  {
    id: 'notif-ota-update',
    title: 'Novo Pacote OTA Disponível',
    message: 'Versão de Firmware 24.1.2 liberada para BYD Dolphin, Seal e Song Plus.',
    category: 'ota',
    date: 'Hoje',
    linkType: 'radar-ota',
    version: 'v24.1.2',
    isRead: false,
    badge: 'OTA'
  },
  {
    id: 'notif-app-cockpit',
    title: 'Novo App: BYD Cockpit Pro v2.4.0',
    message: 'Telemetria em tempo real, painel de consumo esportivo e widgets personalizados.',
    category: 'app',
    date: 'Ontem',
    linkType: 'app',
    linkTarget: 'byd-cockpit-pro',
    version: 'v2.4.0',
    isRead: false,
    badge: 'App'
  }
];
