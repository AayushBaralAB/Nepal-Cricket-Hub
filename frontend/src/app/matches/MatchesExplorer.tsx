'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMatches, getSeries } from '@/lib/api';
import type { CricketMatch, CricketSeries } from '@/lib/types';
import { MatchCard } from '@/components/match/MatchCard';
import { StatusPill } from '@/components/ui/Badges';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Results' },
];

const TEAM_FILTERS = [
  { value: '', label: 'All cricket' },
  { value: 'nepal', label: 'Nepal' },
  { value: 'women', label: 'Women\'s' },
  { value: 'u19', label: 'U19' },
];

export function MatchesExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [scope, setScope] = useState(searchParams.get('nepal') === 'true' ? 'nepal' : '');
  const [series, setSeries] = useState('');
  const [date, setDate] = useState(searchParams.get('date') ?? '');
  const [seriesList, setSeriesList] = useState<CricketSeries[]>([]);
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSeries()
      .then((s) => {
        const list = s ?? [];
        setSeriesList(list);
        const urlSeries = searchParams.get('series');
        if (urlSeries) {
          const hit = list.find((x) => x.externalId === urlSeries || x.slug === urlSeries);
          if (hit) setSeries(hit.externalId);
        }
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (scope) {
      if (scope === 'nepal') params.nepal = 'true';
      if (scope === 'women') params.women = 'true';
      if (scope === 'u19') params.u19 = 'true';
    }
    if (series) params.series = series;
    if (date) params.date = date;

    const data = await getMatches(params).catch(() => null);
    setMatches(data ?? []);
    setError(data === null);
    setLoading(false);
  }, [status, scope, series, date]);

  useEffect(() => {
    load();
  }, [load]);

  const syncUrl = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`/matches${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const filterClasses =
    'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 focus:border-nch-500 focus:outline-none';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Match status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => {
                setStatus(tab.value);
                syncUrl({ status: tab.value || null });
              }}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                status === tab.value
                  ? 'bg-nch-navy-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={scope}
            onChange={(e) => {
              setScope(e.target.value);
              syncUrl({ nepal: e.target.value === 'nepal' ? 'true' : null });
            }}
            className={filterClasses}
            aria-label="Filter by cricket type"
          >
            {TEAM_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={series}
            onChange={(e) => {
              setSeries(e.target.value);
              syncUrl({ series: e.target.value || null });
            }}
            className={filterClasses}
            aria-label="Filter by series"
          >
            <option value="">All tournaments</option>
            {seriesList.map((s) => (
              <option key={s.externalId} value={s.externalId}>{s.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              syncUrl({ date: e.target.value || null });
            }}
            className={filterClasses}
            aria-label="Filter by date"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
          Live data temporarily unavailable. Showing the latest available information.
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-48 animate-pulse" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-lg font-bold text-slate-800">No matches found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting the filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => <MatchCard key={match.externalId} match={match} />)}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
        <span>{matches.length} matches shown</span>
        <span className="flex items-center gap-2">
          <StatusPill status="live" /> Auto-updated from the live feed
        </span>
      </div>
    </div>
  );
}
