'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const PRIMARY = [
  { href: '/', label: 'Home', icon: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9' },
  { href: '/live', label: 'Live', icon: 'M4.5 12a7.5 7.5 0 0 1 15 0M8 12a4 4 0 0 1 8 0M12 12h.01' },
  { href: '/matches', label: 'Matches', icon: 'M3 6h18M3 12h18M3 18h12M7 6v0M12 12v0' },
  { href: '/news', label: 'News', icon: 'M4 5h16v14H4zM4 9h16M8 13h6' },
];

const MORE = [
  { href: '/npl', label: 'Nepal Premier League' },
  { href: '/teams', label: 'Teams' },
  { href: '/players', label: 'Players' },
  { href: '/points-table', label: 'Points Table' },
  { href: '/series/nepal-premier-league-2025', label: 'NPL 2025' },
  { href: '/news', label: 'News Categories' },
  { href: '/videos', label: 'Videos' },
  { href: '/admin', label: 'Admin' },
];

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5">
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
                isActive(item.href) ? 'text-nch-600' : 'text-slate-500'
              }`}
            >
              <Icon d={item.icon} />
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-slate-500"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <circle cx="19" cy="5" r="1" />
              <circle cx="5" cy="19" r="1" />
            </svg>
            More
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-5 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
            <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-slate-500">More</h2>
            <div className="grid grid-cols-2 gap-2">
              {MORE.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
