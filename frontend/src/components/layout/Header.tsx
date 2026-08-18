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

const UTILITY_LINKS = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/predictions', label: 'Predict' },
  { href: '/videos', label: 'Videos' },
  { href: '/series', label: 'Series' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Login' },
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
    <div className="relative overflow-hidden bg-gradient-to-r from-nch-navy-800 via-nch-navy-900 to-nch-navy-800 px-4 py-2 text-sm shadow-inner-top">
      <div className="relative z-10 flex items-center gap-3">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-nch-600 to-nch-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-glow-red">
          <span className="live-dot bg-white" /> Breaking
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-12 whitespace-nowrap">
            {[...items, ...items].map((item, i) => (
              <Link
                key={`${item.slug}-${i}`}
                href={`/news/${item.slug}`}
                className="shrink-0 text-slate-300 transition-colors hover:text-white"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-nch-navy-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-nch-navy-900 to-transparent" />
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
      <div className="hidden border-b border-white/10 bg-nch-navy-900/95 sm:block">
        <div className="container-nch flex h-9 items-center justify-between text-xs">
          <p className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-nch-500/20 px-2 py-0.5 font-black text-nch-300">
              <span className="live-dot bg-nch-400" /> Live scores
            </span>
            All Nepal cricket, one place
          </p>
          <nav className="flex items-center gap-5" aria-label="Utility">
            {UTILITY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-semibold text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-b border-white/10 bg-nch-navy-900/85 shadow-lg backdrop-blur-xl">
        <div className="container-nch flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'bg-nch-500/15 text-white'
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
              className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <Link
              href="/live"
              className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-nch-600 to-nch-500 px-3.5 py-2 text-sm font-bold text-white shadow-glow-red transition-all duration-300 ease-premium hover:shadow-glow-red hover:brightness-110 sm:inline-flex"
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
              className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
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
            className="border-t border-white/10 bg-nch-navy-800/90 backdrop-blur-xl"
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
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-saffron-500/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-saffron-500/20"
              />
              <button type="submit" className="btn-primary shrink-0 !bg-gradient-to-r !from-saffron-500 !to-saffron-400 !text-nch-navy-900">
                Search
              </button>
            </div>
          </form>
        )}

        {menuOpen && (
          <nav className="border-t border-white/10 bg-nch-navy-800/95 backdrop-blur-xl lg:hidden" aria-label="Mobile">
            <div className="container-nch flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive(link.href)
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span className="text-slate-500">→</span>
                </Link>
              ))}
              <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-3">
                <Link href="/live" className="btn-primary flex-1">
                  <span className="live-dot bg-white" /> Watch Live
                </Link>
                <Link href="/search" className="btn-secondary flex-1 !border-white/15 !bg-white/5 !text-white hover:!bg-white/10">
                  Search
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>

      <BreakingTicker />
    </header>
  );
}
