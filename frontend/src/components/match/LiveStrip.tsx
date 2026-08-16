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
    <div className="flex items-stretch gap-4 overflow-x-auto pb-2">
      {matches.map((m) => (
        <Link
          key={m.externalId}
          href={`/matches/${m.externalId}`}
          className="card card-hover relative flex min-w-[270px] max-w-[320px] shrink-0 flex-col overflow-hidden p-4"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-nch-600 via-nch-500 to-saffron-500" />
          <div className="mb-2 flex items-center justify-between">
            <span className="chip gap-1.5 bg-nch-600 text-white shadow-glow-red">
              <span className="live-dot bg-white" /> Live
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
              {m.matchType}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 font-bold text-slate-800">
                <TeamAvatar name={m.homeTeam} size={26} />
                <span className="truncate">{m.homeTeam}</span>
              </span>
              <span className="font-display text-base font-black tabular-nums text-slate-900">
                {m.homeScore?.split(' (')[0]}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 font-bold text-slate-800">
                <TeamAvatar name={m.awayTeam} size={26} />
                <span className="truncate">{m.awayTeam}</span>
              </span>
              <span className="font-display text-base font-black tabular-nums text-slate-900">
                {m.awayScore?.split(' (')[0]}
              </span>
            </div>
          </div>
          <p className="mt-3 truncate border-t border-slate-100 pt-2.5 text-[11px] font-bold text-nch-700">
            {m.matchState}
          </p>
        </Link>
      ))}
    </div>
  );
}
