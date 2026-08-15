'use client';

import { useEffect, useState } from 'react';
import { getLiveMatches } from '@/lib/api';
import type { CricketMatch } from '@/lib/types';
import { LiveScoreCard } from '@/components/match/LiveScoreCard';
import { CardSkeleton } from '@/components/ui/Skeleton';

export function LivePageClient({ initial }: { initial: CricketMatch[] }) {
  const [matches, setMatches] = useState<CricketMatch[]>(initial);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
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
      setLastUpdated(new Date());
    };
    load();
    const t = setInterval(load, 15_000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          {matches.length > 0 ? `${matches.length} match${matches.length > 1 ? 'es' : ''} in progress` : 'No live matches'}
        </p>
        <p className="text-xs text-slate-400" suppressHydrationWarning>
          Auto-refresh · updated {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {error && matches.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
          Live data temporarily unavailable. Showing the latest available information.
        </div>
      )}

      {matches.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
          <span className="text-4xl">🏏</span>
          <p className="font-display text-lg font-bold text-slate-800">No live matches right now</p>
          <p className="text-sm text-slate-500">
            Check upcoming fixtures for the next Nepal Cricket Hub match.
          </p>
          <a href="/matches?status=upcoming" className="btn-primary">View Upcoming</a>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {matches.map((match) => (
            <LiveScoreCard key={match.externalId} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LiveLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
