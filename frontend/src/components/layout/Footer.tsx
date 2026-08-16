'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './Logo';

const GROUPS: Array<{ label: string; links: Array<{ href: string; label: string }> }> = [
  {
    label: 'Scores',
    links: [
      { href: '/live', label: 'Live Scores' },
      { href: '/matches', label: 'All Matches' },
      { href: '/matches?status=upcoming', label: 'Upcoming' },
      { href: '/matches?status=completed', label: 'Results' },
      { href: '/points-table', label: 'Points Tables' },
    ],
  },
  {
    label: 'Nepal',
    links: [
      { href: '/news', label: 'Nepal Cricket News' },
      { href: '/npl', label: 'Nepal Premier League' },
      { href: '/teams/nepal', label: 'Nepal Men' },
      { href: '/teams/nepal-women', label: 'Nepal Women' },
      { href: '/teams/nepal-u19', label: 'Nepal U19' },
    ],
  },
  {
    label: 'More',
    links: [
      { href: '/news', label: 'News Categories' },
      { href: '/players', label: 'Players' },
      { href: '/teams', label: 'Teams' },
      { href: '/series/nepal-premier-league-2025', label: 'NPL 2025 Series' },
      { href: '/videos', label: 'Videos' },
      { href: '/admin', label: 'Admin' },
    ],
  },
];

const SOCIALS: Array<{ label: string; d: string }> = [
  {
    label: 'Facebook',
    d: 'M13.5 9H15V6.5h-1.5A2.5 2.5 0 0 0 11 9v1.5H9V13h2v6h2.5v-6h2l.5-2.5h-2.5V9a.5.5 0 0 1 .5-.5Z',
  },
  {
    label: 'X (Twitter)',
    d: 'M5 5l5.7 7.6L5.3 19h1.8l4.5-5.4L15.6 19H19l-6-8.1L17.8 5H16l-4.2 5-4.9-5H5Z',
  },
  {
    label: 'Instagram',
    d: 'M12 8.8A3.2 3.2 0 1 0 15.2 12 3.2 3.2 0 0 0 12 8.8Zm0 5.3A2.1 2.1 0 1 1 14.1 12 2.1 2.1 0 0 1 12 14.1Zm3.6-5.9a.7.7 0 1 1 .7-.7.7.7 0 0 1-.7.7ZM8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z',
  },
  {
    label: 'YouTube',
    d: 'M20 8.5a3 3 0 0 0-2.1-2.1C16.4 6 12 6 12 6s-4.4 0-5.9.4A3 3 0 0 0 4 8.5 31 31 0 0 0 3.7 12 31 31 0 0 0 4 15.5a3 3 0 0 0 2.1 2.1c1.5.4 5.9.4 5.9.4s4.4 0 5.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 20.3 12 31 31 0 0 0 20 8.5ZM10.5 14.5v-5l4.3 2.5Z',
  },
];

export function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 overflow-hidden bg-nch-navy-900 text-slate-300">
      <div className="h-1 bg-gradient-to-r from-saffron-500 via-nch-600 to-nch-navy-700" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(40rem 24rem at 90% 0%, rgba(220,46,39,0.12), transparent 60%), radial-gradient(36rem 24rem at 0% 100%, rgba(245,158,11,0.08), transparent 55%)',
        }}
      />

      <div className="container-nch relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <LogoMark size={40} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-black text-white">
                Nepal Cricket<span className="text-nch-500"> Hub</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                nepalcrickethub.com
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Live scores, fixtures, results, automatic Nepal cricket news, player
            statistics and full coverage of the Nepal Premier League — all updated
            automatically, all in one place.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-nch-500/50 hover:bg-nch-600 hover:text-white"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d={social.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {GROUPS.map((group) => (
          <nav key={group.label} aria-label={group.label}>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              <span className="h-px w-4 bg-gradient-to-r from-nch-500 to-transparent" />
              {group.label}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group inline-flex items-center gap-1.5 transition-colors hover:text-white ${
                      pathname === link.href ? 'text-nch-500' : 'text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] text-slate-600 transition-transform duration-200 ease-premium group-hover:translate-x-0.5 group-hover:text-nch-500">
                      ›
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-nch flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {year} Nepal Cricket Hub — nepalcrickethub.com. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <Link href="/news" className="transition-colors hover:text-slate-300">News</Link>
            <Link href="/matches" className="transition-colors hover:text-slate-300">Matches</Link>
            <Link href="/contact" className="transition-colors hover:text-slate-300">Contact</Link>
            <Link href="/privacy" className="transition-colors hover:text-slate-300">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-slate-300">Terms</Link>
            <Link href="/disclaimer" className="transition-colors hover:text-slate-300">Disclaimer</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
