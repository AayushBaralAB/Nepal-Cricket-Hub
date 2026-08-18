'use client';

import { useState, useEffect, useCallback } from 'react';

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('crickethub_user_id');
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('crickethub_user_id', id);
  }
  return id;
}

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [count, setCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const showToastMessage = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }, []);

  const requestPermission = async () => {
    if (!supported) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      showToastMessage('Notifications enabled! You\'ll receive match updates.');

      try {
        const userId = getUserId();
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIdentifier: userId,
            endpoint: 'browser-notification',
            type: 'browser',
          }),
        });
      } catch {
        // ignore
      }

      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw-placeholder.js').catch(() => {
            // placeholder sw not found, that's fine
          });
        } catch {
          // ignore
        }
      }
    } else {
      showToastMessage('Notifications blocked. You can enable them in browser settings.');
    }
  };

  const showExampleNotification = () => {
    if (permission !== 'granted') return;

    new Notification('CricketHub', {
      body: 'Nepal vs India match starts in 1 hour! 🏏',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });

    setCount((c) => c + 1);
  };

  return (
    <>
      <div className="relative inline-flex items-center gap-3">
        <button
          type="button"
          onClick={permission === 'granted' ? showExampleNotification : requestPermission}
          className={`btn-secondary !px-4 !py-2 text-sm ${
            permission === 'granted' ? '!border-nch-300 !text-nch-700' : ''
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {permission === 'granted'
            ? 'Send Notification'
            : permission === 'denied'
              ? 'Notifications Blocked'
              : 'Enable Notifications'}
        </button>

        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-saffron-500 px-1 text-[10px] font-black text-white shadow-glow-saffron">
            {count}
          </span>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm animate-fade-in-up rounded-xl border border-slate-200 bg-white p-4 shadow-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nch-50">
              <svg className="h-4 w-4 text-nch-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">CricketHub</p>
              <p className="mt-0.5 text-xs text-slate-600">{toastMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
