import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Sparkles, Smartphone, Download, Radio, ShieldCheck, X, ChevronRight, ExternalLink, Trash2 } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { AppNotification } from '../types';
import { requestNotificationPermission, sendBrowserNotification } from '../services/notificationService';
import { usePwaInstall } from '../hooks/usePwaInstall';

export const NotificationBell: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, setActivePage } = useSiteData();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });
  const { isInstallable, isInstalled, triggerInstall } = usePwaInstall();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    if (granted) {
      sendBrowserNotification('Notificações Ativadas!', {
        body: 'Você receberá alertas automáticos quando novos APKs e atualizações OTA forem lançados.',
      });
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    setIsOpen(false);

    if (notif.linkType === 'app') {
      setActivePage({ type: 'app', idOrSlug: notif.linkTarget || '' });
    } else if (notif.linkType === 'radar-ota') {
      setActivePage({ type: 'radar-ota' });
    } else if (notif.linkType === 'tutoriais') {
      setActivePage({ type: 'tutoriais' });
    } else if (notif.linkType === 'noticias') {
      setActivePage({ type: 'noticias' });
    } else if (notif.linkType === 'vip') {
      setActivePage({ type: 'vip' });
    } else if (notif.linkType === 'produtos') {
      setActivePage({ type: 'produtos' });
    } else if (notif.linkType === 'home') {
      setActivePage({ type: 'home' });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-[#16161B] hover:bg-[#1F1F26] border border-white/[0.08] text-neutral-300 hover:text-white transition-all cursor-pointer group"
        aria-label="Notificações e Atualizações"
        title="Central de Atualizações"
      >
        <Bell className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-black text-[10px] font-mono rounded-full flex items-center justify-center animate-pulse shadow-md shadow-red-600/50 border-2 border-[#09090C]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:-right-8 top-12 w-[340px] sm:w-[400px] max-w-[92vw] bg-[#0E0E13]/98 border border-white/[0.14] rounded-3xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#13131A]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 flex items-center justify-center text-[#FFDD00]">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Central de Atualizações
                </h4>
                <p className="text-[10px] text-neutral-400">
                  {unreadCount} {unreadCount === 1 ? 'não lida' : 'não lidas'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[10px] text-[#FFDD00] hover:underline font-bold cursor-pointer"
              >
                Marcar lidas
              </button>
            )}
          </div>

          {/* Quick Actions (Android Notifications + PWA Install) */}
          <div className="p-2.5 bg-[#171722] border-b border-white/[0.06] space-y-1.5">
            {!hasPermission && (
              <button
                onClick={handleEnableNotifications}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FFDD00]/10 hover:bg-[#FFDD00]/20 border border-[#FFDD00]/30 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#FFDD00] animate-pulse" />
                  <span className="text-[11px] font-bold text-white group-hover:text-[#FFDD00]">
                    Ativar Notificações no Celular
                  </span>
                </div>
                <span className="text-[10px] font-extrabold bg-[#FFDD00] text-black px-2 py-0.5 rounded-md uppercase">
                  Ativar
                </span>
              </button>
            )}

            {isInstallable && !isInstalled && (
              <button
                onClick={triggerInstall}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-neutral-300 group-hover:text-white" />
                  <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white">
                    Instalar Site como App (PWA / APK)
                  </span>
                </div>
                <Download className="w-3.5 h-3.5 text-[#FFDD00]" />
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-neutral-500 mx-auto" />
                <p className="text-xs text-neutral-400">Nenhuma notificação no momento.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    !notif.isRead ? 'bg-[#151520]/80' : ''
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {notif.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FFDD00] text-black uppercase font-mono">
                          {notif.badge}
                        </span>
                      )}
                      <h5 className={`text-xs font-bold leading-tight ${!notif.isRead ? 'text-white' : 'text-neutral-300'}`}>
                        {notif.title}
                      </h5>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-neutral-400 font-mono">
                      <span>{notif.date}</span>
                      {notif.version && <span>• {notif.version}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 shrink-0">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#FFDD00] ring-4 ring-[#FFDD00]/20" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="text-neutral-400 hover:text-red-400 p-1 rounded transition-colors"
                      title="Excluir notificação"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#111117] border-t border-white/[0.06] text-center text-[10px] text-neutral-400 flex items-center justify-between">
            <span>ALX Notification System</span>
            <span className="text-[10px] font-mono text-[#FFDD00]">PWA Ready</span>
          </div>

        </div>
      )}
    </div>
  );
};
