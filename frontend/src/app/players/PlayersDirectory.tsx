'use client';

import { useMemo, useState } from 'react';
import type { CricketPlayer } from '@/lib/types';
import { PlayerCard } from '@/components/players/PlayerCard';

const ROLES = ['All', 'Batter', 'Bowler', 'All-rounder', 'Wicketkeeper'];

export function PlayersDirectory({ players }: { players: CricketPlayer[] }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter((p) => {
      if (role !== 'All' && p.role !== role) return false;
      if (!q) return true;
      return [p.name, p.fullName, p.country, p.teamName].filter(Boolean).some((v) =>
        String(v).toLowerCase().includes(q),
      );
    });
  }, [players, query, role]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players, teams…"
            aria-label="Search players"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-nch-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                role === r
                  ? 'bg-nch-navy-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((p) => <PlayerCard key={p.externalId} player={p} />)}
        </div>
      ) : (
        <div className="card p-10 text-center text-sm text-slate-500">
          No players match your search.
        </div>
      )}
    </div>
  );
}
