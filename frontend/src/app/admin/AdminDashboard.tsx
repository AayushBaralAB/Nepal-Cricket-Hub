'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, clearAdminToken, getAdminToken, setAdminToken } from '@/lib/admin-api';
import { timeAgo, formatDateTime } from '@/lib/format';
import type { AdminHealth, AdminStats } from '@/lib/types';

type LoadState<T> = { data: T | null; error: string | null; loading: boolean };

const emptyStats: AdminStats = {
  news: 0,
  liveMatches: 0,
  upcomingMatches: 0,
  completedMatches: 0,
  players: 0,
  teams: 0,
  series: 0,
  dbConnected: false,
  apiErrors: [],
  lastCricketUpdate: null,
  lastNewsUpdate: null,
};

function StatCard({
  label,
  value,
  accent = 'text-slate-900',
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="card flex flex-col gap-1 p-4">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className={`font-display text-3xl font-black tabular-nums ${accent}`}>{value}</span>
    </div>
  );
}

function StatusRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`inline-flex items-center gap-1.5 font-semibold ${good === false ? 'text-rose-600' : 'text-slate-800'}`}>
        {good !== undefined && (
          <span className={`h-2 w-2 rounded-full ${good ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        )}
        {value || '—'}
      </span>
    </div>
  );
}

export function AdminDashboard() {
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [stats, setStats] = useState<LoadState<AdminStats>>({ data: null, error: null, loading: true });
  const [health, setHealth] = useState<LoadState<AdminHealth>>({ data: null, error: null, loading: true });
  const [syncing, setSyncing] = useState<null | 'cricket' | 'news'>(null);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setToken(getAdminToken());
    setHasToken(Boolean(getAdminToken()));
  }, []);

  const load = useCallback(async (t?: string) => {
    setStats((s) => ({ ...s, loading: true, error: null }));
    setHealth((h) => ({ ...h, loading: true, error: null }));
    const [statsRes, healthRes] = await Promise.all([
      adminApi.getStats(t).catch((e: Error) => null),
      adminApi.getHealth(t).catch((e: Error) => null),
    ]);
    if (statsRes === null) {
      setStats((s) => ({ ...s, data: emptyStats, loading: false, error: 'Could not reach admin API' }));
    } else {
      setStats({ data: statsRes, loading: false, error: null });
    }
    setHealth({ data: healthRes, loading: false, error: null });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveToken = () => {
    if (!token.trim()) {
      clearAdminToken();
      setHasToken(false);
    } else {
      setAdminToken(token);
      setHasToken(true);
    }
    load(token.trim());
  };

  const runSync = async (kind: 'cricket' | 'news') => {
    setSyncing(kind);
    setSyncResult(null);
    try {
      const result =
        kind === 'cricket' ? await adminApi.syncCricket() : await adminApi.syncNews();
      setSyncResult({ ok: result.ok, message: result.message });
    } catch (e) {
      setSyncResult({ ok: false, message: e instanceof Error ? e.message : 'Sync failed' });
    } finally {
      setSyncing(null);
      load();
    }
  };

  const dbConnected = stats.data?.dbConnected ?? false;
  const apiErrors = stats.data?.apiErrors ?? [];

  return (
    <div className="container-nch space-y-8 py-8">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="font-semibold text-nch-600 hover:text-nch-700">Home</Link>
        <span className="mx-2">/</span>
        <span>Admin Dashboard</span>
      </nav>

      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          System health, live stats and content sync for Nepal Cricket Hub.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label htmlFor="admin-token" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Supabase session token (optional)
            </label>
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your admin JWT to unlock protected endpoints"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-nch-600 focus:outline-none focus:ring-2 focus:ring-nch-600/20"
            />
          </div>
          <button onClick={saveToken} className="btn-primary shrink-0">
            {hasToken ? 'Update token' : 'Save token'}
          </button>
        </div>
        {hasToken && (
          <button
            onClick={() => {
              clearAdminToken();
              setToken('');
              setHasToken(false);
              load();
            }}
            className="btn-ghost mt-2 text-xs"
          >
            Clear token
          </button>
        )}
      </div>

      {!dbConnected && stats.data && (
        <div className="card border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">Database not configured</p>
          <p className="mt-1 text-sm text-amber-700">
            Supabase environment variables are missing on the backend. Only cache-backed stats and health
            are shown; protected data endpoints and sync are unavailable until the DB is configured.
          </p>
        </div>
      )}

      {stats.error && !stats.data && (
        <div className="card border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{stats.error}</div>
      )}

      <section>
        <h2 className="section-title">Overview</h2>
        {stats.loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="card h-20 animate-pulse p-4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <StatCard label="Live matches" value={stats.data?.liveMatches ?? 0} accent="text-nch-600" />
            <StatCard label="Upcoming" value={stats.data?.upcomingMatches ?? 0} />
            <StatCard label="Results" value={stats.data?.completedMatches ?? 0} />
            <StatCard label="News" value={stats.data?.news ?? 0} />
            <StatCard label="Players" value={stats.data?.players ?? 0} />
            <StatCard label="Teams" value={stats.data?.teams ?? 0} />
            <StatCard label="Series" value={stats.data?.series ?? 0} />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="section-title !mb-3">System status</h2>
          {health.loading ? (
            <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <div className="divide-y divide-slate-100">
              <StatusRow
                label="Cricket provider"
                value={health.data?.cricket.provider ?? '—'}
              />
              <StatusRow
                label="Provider configured"
                value={health.data?.cricket.isConfigured ? 'Yes' : 'No'}
                good={health.data?.cricket.isConfigured}
              />
              <StatusRow
                label="Database"
                value={dbConnected ? 'Connected' : 'Not configured'}
                good={dbConnected}
              />
              <StatusRow
                label="Last cricket sync"
                value={health.data?.cricket.lastSyncSuccessAt
                  ? timeAgo(health.data.cricket.lastSyncSuccessAt)
                  : 'Never'}
              />
              <StatusRow
                label="Last news fetch"
                value={health.data?.news.lastFetchSuccessAt
                  ? timeAgo(health.data.news.lastFetchSuccessAt)
                  : 'Never'}
              />
              <StatusRow
                label="Cached news"
                value={String(health.data?.news.totalCached ?? '—')}
              />
              {health.data?.cricket.lastSyncError && (
                <StatusRow label="Last sync error" value={health.data.cricket.lastSyncError} good={false} />
              )}
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="section-title !mb-3">Manual sync</h2>
          <p className="mb-4 text-sm text-slate-500">
            Trigger an on-demand refresh. Requires an authenticated admin token and a configured database.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => runSync('cricket')} disabled={syncing !== null || !dbConnected} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              {syncing === 'cricket' ? 'Syncing…' : 'Sync cricket data'}
            </button>
            <button onClick={() => runSync('news')} disabled={syncing !== null || !dbConnected} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
              {syncing === 'news' ? 'Syncing…' : 'Sync news'}
            </button>
          </div>
          {syncResult && (
            <p className={`mt-3 text-sm font-semibold ${syncResult.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
              {syncResult.message}
            </p>
          )}
        </section>
      </div>

      <section className="card p-5">
        <h2 className="section-title !mb-3">Recent API errors</h2>
        {apiErrors.length === 0 ? (
          <p className="text-sm text-slate-500">
            {stats.loading ? 'Loading…' : dbConnected ? 'No recent errors recorded.' : 'API log requires a configured database.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {apiErrors.slice(0, 10).map((err, i) => (
              <li key={err.id ?? i} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-slate-700">
                  {String(err.endpoint ?? err.message ?? 'Unknown')}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {err.created_at ? formatDateTime(String(err.created_at)) : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
