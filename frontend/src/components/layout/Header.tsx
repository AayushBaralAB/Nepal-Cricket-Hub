'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { getBreakingNews } from '@/lib/api';
import type { NewsItem } from '@/lib/types';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/live', label: 'Live' },
  { href: '/matches', label: 'Matches' },
  { href: '/news', label: 'News' },
  { href: '/npl', label: 'NPL' },
  { href: '/teams', label: 'Teams' },
  { href: '/players', label: 'Players' },
  { href: '/points-table', label: 'Points Table' },
];

function BreakingTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await getBreakingNews().catch(() => null);
      if (active && data?.length) setItems(data);
    };
    load();
    const t = setInterval(load, 10 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="flex items-center gap-3 overflow-hidden bg-nch-navy-900 px-4 py-2 text-sm">
      <span className="flex shrink-0 items-center gap-1.5 rounded bg-nch-600 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white">
        <span className="live-dot" /> Breaking
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
          {[...items, ...items].map((item, i) => (
            <Link
              key={`${item.slug}-${i}`}
              href={`/news/${item.slug}`}
              className="shrink-0 text-slate-200 transition-colors hover:text-white"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-nch-navy-900 shadow-lg">
        <div className="container-nch flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                setMenuOpen(false);
              }}
              aria-label="Search"
              className="rounded-md p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <Link
              href="/live"
              className="hidden items-center gap-1.5 rounded-lg bg-nch-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-nch-500 sm:inline-flex"
            >
              <span className="live-dot bg-white" /> Live
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v);
                setSearchOpen(false);
              }}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="rounded-md p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form
            className="border-t border-white/10 bg-nch-navy-800"
            action="/search"
            role="search"
          >
            <div className="container-nch flex items-center gap-2 py-3">
              <input
                ref={searchRef}
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news, players, teams, matches…"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-nch-500 focus:outline-none"
              />
              <button type="submit" className="btn-primary shrink-0">
                Search
              </button>
            </div>
          </form>
        )}

        {menuOpen && (
          <nav className="border-t border-white/10 bg-nch-navy-800 lg:hidden" aria-label="Mobile">
            <div className="container-nch flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                    isActive(link.href)
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>

      <BreakingTicker />
    </header>
  );
}
