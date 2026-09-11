'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getLiveMatches, getLiveStreams } from '@/lib/api';
import type { CricketMatch, LiveStream } from '@/lib/types';
import { LiveScoreCard } from '@/components/match/LiveScoreCard';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { LiveBadge } from '@/components/ui/Badges';
import { formatDateTime } from '@/lib/format';

interface StreamOption {
  match: CricketMatch;
  stream?: LiveStream;
}

/** Match a live match to a live stream by title keyword matching. */
function matchStream(match: CricketMatch, streams: LiveStream[]): LiveStream | undefined {
  if (!streams.length) return undefined;
  if (streams.length === 1) return streams[0];
  const keywords = `${match.name} ${match.homeTeam} ${match.awayTeam}`.toLowerCase();
  return streams.find((s) => {
    const t = `${s.title}`.toLowerCase();
    return t.split(' ').filter((w) => w.length > 3).filter((w) => keywords.includes(w)).length >= 2;
  }) ?? streams[0];
}

export function LiveStreamingPage({ initialMatches, initialStreams }: {
  initialMatches: CricketMatch[];
  initialStreams: LiveStream[];
}) {
  const [matches, setMatches] = useState<CricketMatch[]>(initialMatches);
  const [streams] = useState<LiveStream[]>(initialStreams);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState(false);

  const options: StreamOption[] = matches.map((match) => ({
    match,
    stream: matchStream(match, streams),
  }));
  const selected = options.find((o) => o.match.externalId === selectedId) ?? options[0];

  useEffect(() => {
    if (!selectedId && options.length > 0) {
      setSelectedId(options[0].match.externalId);
    }
  }, [selectedId, options]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await getLiveMatches().catch(() => null);
      if (!active) return;
      if (data) {
        setMatches(data);
        setError(false);
      } else setError(true);
    };
    load();
    const t = setInterval(load, 15_000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const refreshSelected = useCallback(async () => {
    if (!selected) return;
    const fresh = await getLiveMatches().catch(() => null);
    if (fresh) {
      const next = fresh.find((m) => m.externalId === selected.match.externalId);
      if (next) {
        setMatches((prev) => prev.map((m) => (m.externalId === next.externalId ? next : m)));
      }
    }
  }, [selected]);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* ------------------- SIDEBAR MENU ------------------- */}
      <aside className="card h-fit overflow-hidden lg:sticky lg:top-20">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-900 px-4 py-3">
          <span className="live-dot bg-red-500" />
          <h2 className="text-sm font-black uppercase tracking-wider text-white">Live Streams</h2>
          <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
            {options.length}
          </span>
        </div>
        <ul className="max-h-[600px] divide-y divide-slate-100 overflow-y-auto">
          {options.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-slate-500">
              No live matches right now.
            </li>
          )}
          {options.map(({ match, stream }) => {
            const active = selected?.match.externalId === match.externalId;
            return (
              <li key={match.externalId}>
                <button
                  type="button"
                  onClick={() => setSelectedId(match.externalId)}
                  className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${
                    active ? 'bg-nch-600/10 ring-1 ring-inset ring-nch-600/30' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative flex shrink-0 items-center">
                    <TeamAvatar name={match.homeTeam} size={34} />
                    <TeamAvatar name={match.awayTeam} size={34} className="-ml-2 ring-2 ring-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-bold ${active ? 'text-nch-700' : 'text-slate-800'}`}>
                      {match.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {stream ? '▶ Live stream available' : formatDateTime(match.startTime)}
                    </p>
                  </div>
                  {stream && <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-black text-red-700">LIVE</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <Link
          href="/matches?status=live"
          className="block border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-xs font-bold text-nch-600 hover:bg-slate-100"
        >
          All Live Matches →
        </Link>
      </aside>

      {/* ------------------- MAIN PLAYER ------------------- */}
      <div className="space-y-6">
        {selected ? (
          <>
            {error && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
                Live data temporarily unavailable. Showing the latest available information.
              </div>
            )}

            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="live-dot bg-red-500" />
                  <h2 className="font-display text-lg font-black text-slate-900 sm:text-xl">
                    {selected.match.name}
                  </h2>
                </div>
                <Link href={`/matches/${selected.match.externalId}`} className="btn-secondary !px-3 !py-1.5 !text-xs">
                  Match Centre →
                </Link>
              </div>

              {/* score header with large country logos */}
              <div className="flex items-center justify-between gap-3 px-4 py-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <TeamAvatar name={selected.match.homeTeam} size={64} />
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-black text-slate-900 sm:text-lg">
                      {selected.match.homeTeam}
                    </p>
                    <p className="font-display text-2xl font-black tabular-nums text-slate-900 sm:text-3xl">
                      {selected.match.homeScore?.split(' (')[0] ?? '—'}
                    </p>
                    {selected.match.homeScore?.includes('(') && (
                      <p className="text-xs font-semibold text-slate-500">
                        {selected.match.homeScore.split('(')[1]?.replace(')', '')} ov
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 px-2 text-center">
                  <span className="block text-xs font-black uppercase tracking-widest text-slate-400">vs</span>
                  <span className="mt-1 block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                    {selected.match.matchType}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                  <div className="min-w-0 text-right">
                    <p className="truncate font-display text-base font-black text-slate-900 sm:text-lg">
                      {selected.match.awayTeam}
                    </p>
                    <p className="font-display text-2xl font-black tabular-nums text-slate-900 sm:text-3xl">
                      {selected.match.awayScore?.split(' (')[0] ?? '—'}
                    </p>
                    {selected.match.awayScore?.includes('(') && (
                      <p className="text-xs font-semibold text-slate-500">
                        {selected.match.awayScore.split('(')[1]?.replace(')', '')} ov
                      </p>
                    )}
                  </div>
                  <TeamAvatar name={selected.match.awayTeam} size={64} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-nch-700">{selected.match.matchState}</p>
                <div className="text-right text-xs text-slate-500">
                  <p>{selected.match.venue}</p>
                  <p>{formatDateTime(selected.match.startTime)}</p>
                </div>
              </div>
            </div>

            {/* ------------------- VIDEO PLAYER ------------------- */}
            {selected.stream ? (
              <div className="card overflow-hidden bg-black">
                <div className="aspect-video w-full">
                  <iframe
                    src={selected.stream.embedUrl}
                    title={selected.stream.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    style={{ border: 0, pointerEvents: 'none' }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-900 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="live-dot bg-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">Live</span>
                    <span className="text-sm font-semibold text-slate-200">{selected.stream.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${selected.stream?.videoId}`, '_blank')}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                  >
                    Open on YouTube ↗
                  </button>
                </div>
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center gap-3 bg-slate-900 p-10 text-center">
                <span className="text-4xl">📺</span>
                <p className="font-display text-lg font-bold text-white">No stream linked for this match</p>
                <p className="text-sm text-slate-400">
                  When the broadcast goes live it will appear here.
                </p>
              </div>
            )}

            {/* other streams below */}
            {streams.length > 0 && (
              <div className="space-y-3">
                <h3 className="section-title !mb-0 text-base">All Live Channels</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {streams.map((s) => (
                    <div key={s.videoId} className="card overflow-hidden">
                      <div className="aspect-video bg-black">
                        <iframe
                          src={s.embedUrl}
                          title={s.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          sandbox="allow-scripts allow-same-origin allow-popups"
                          style={{ border: 0, pointerEvents: 'none' }}
                        />
                      </div>
                      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2">
                        <span className="live-dot bg-red-500" />
                        <span className="text-xs font-bold text-red-600">Live</span>
                        <span className="truncate text-xs font-semibold text-slate-600">{s.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* score cards for all matches */}
            <div>
              <h3 className="section-title !mb-0 text-base">Live Scores</h3>
              <div className="mt-4 grid gap-5 lg:grid-cols-2">
                {matches.map((match) => (
                  <LiveScoreCard key={match.externalId} match={match} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
            <span className="text-4xl">🏏</span>
            <p className="font-display text-lg font-bold text-slate-800">No live matches right now</p>
            <p className="text-sm text-slate-500">Check upcoming fixtures for the next CricketHub match.</p>
            <Link href="/matches?status=upcoming" className="btn-primary">View Upcoming</Link>
          </div>
        )}
      </div>
    </div>
  );
}