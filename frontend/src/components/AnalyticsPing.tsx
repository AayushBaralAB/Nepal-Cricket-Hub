'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE } from '@/lib/api';

export default function AnalyticsPing() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastSent.current) return;
    lastSent.current = pathname;

    const t = setTimeout(() => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      fetch(`${API_BASE}/analytics/page-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
        signal: controller.signal,
      }).catch(() => undefined).finally(() => clearTimeout(timeout));
    }, 800);

    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
