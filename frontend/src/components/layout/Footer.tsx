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

export function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-nch-navy-900 text-slate-300">
      <div className="container-nch grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
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
        </div>

        {GROUPS.map((group) => (
          <nav key={group.label} aria-label={group.label}>
            <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
              {group.label}
            </h3>
            <ul className="space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition-colors hover:text-white ${
                      pathname === link.href ? 'text-nch-500' : 'text-slate-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-nch flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {year} Nepal Cricket Hub — nepalcrickethub.com. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <Link href="/news" className="hover:text-slate-300">News</Link>
            <Link href="/matches" className="hover:text-slate-300">Matches</Link>
            <Link href="/contact" className="hover:text-slate-300">Contact</Link>
            <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
