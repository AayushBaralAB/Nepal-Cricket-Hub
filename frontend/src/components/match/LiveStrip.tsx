'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLiveMatches } from '@/lib/api';
import type { CricketMatch } from '@/lib/types';
import { TeamAvatar } from '../ui/TeamAvatar';

export function LiveStrip({ initial = [] }: { initial?: CricketMatch[] }) {
  const [matches, setMatches] = useState<CricketMatch[]>(initial);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await getLiveMatches().catch(() => null);
      if (!active) return;
      if (data) {
        setMatches(data);
        setError(false);
      } else {
        setError(true);
      }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-800">
        Live data temporarily unavailable. Showing the latest available information.
      </div>
    );
  }

  if (!matches.length) return null;

  return (
    <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
      {matches.map((m) => (
        <Link
          key={m.externalId}
          href={`/matches/${m.externalId}`}
          className="card card-hover flex min-w-[260px] max-w-[320px] shrink-0 flex-col p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="chip gap-1.5 bg-nch-600 text-white">
              <span className="live-dot bg-white" /> Live
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-400">{m.matchType}</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-semibold text-slate-800">
                <TeamAvatar name={m.homeTeam} size={24} />
                {m.homeTeam}
              </span>
              <span className="font-bold tabular-nums text-slate-900">{m.homeScore?.split(' (')[0]}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-semibold text-slate-800">
                <TeamAvatar name={m.awayTeam} size={24} />
                {m.awayTeam}
              </span>
              <span className="font-bold tabular-nums text-slate-900">{m.awayScore?.split(' (')[0]}</span>
            </div>
          </div>
          <p className="mt-2 truncate text-[11px] font-semibold text-nch-700">{m.matchState}</p>
        </Link>
      ))}
    </div>
  );
}
