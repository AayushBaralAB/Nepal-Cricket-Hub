'use client';

import { useEffect, useState } from 'react';
import { getMatch } from '@/lib/api';
import type { CricketMatch } from '@/lib/types';
import { formatDateTime } from '@/lib/format';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { LiveBadge, StatusPill } from '@/components/ui/Badges';
import { Scorecard } from '@/components/match/Scorecard';
import { AdSlot } from '@/components/ui/AdSlot';
import { MatchReminderButton } from '@/components/match/MatchReminderButton';
import { PredictionCard } from '@/components/match/PredictionCard';

export function MatchCentreClient({ initial, matchId }: { initial: CricketMatch; matchId: string }) {
  const [match, setMatch] = useState<CricketMatch>(initial);
  const [error, setError] = useState(false);

  const isLive = match.status === 'live';

  useEffect(() => {
    if (!isLive) return;
    let active = true;
    const load = async () => {
      const data = await getMatch(matchId).catch(() => null);
      if (!active) return;
      if (data) {
        setMatch(data);
        setError(false);
      } else {
        setError(true);
      }
    };
    load();
    const t = setInterval(load, 15_000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [isLive, matchId]);

  const innings = match.innings?.filter((i) => i.runs > 0 || i.wickets > 0 || i.isCompleted) ?? [];

  return (
    <div className="space-y-6">
      {/* ---------------- header ---------------- */}
      <div className="card relative overflow-hidden">
        {isLive && (
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-nch-600 via-nch-500 to-nch-600" />
        )}
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {isLive ? <LiveBadge /> : <StatusPill status={match.status} />}
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {match.seriesName ?? match.matchType}
            </span>
            <span className="text-xs text-slate-400">{match.matchType}</span>
          </div>
          <h1 className="mt-2 font-display text-xl font-black text-slate-900 sm:text-2xl">
            {match.name}
          </h1>
          {error && (
            <p className="mt-2 rounded-md bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              Live data temporarily unavailable. Showing the latest available information.
            </p>
          )}
        </div>

        <div className="grid gap-4 px-5 py-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="flex items-center gap-3">
            <TeamAvatar name={match.homeTeam} size={56} />
            <div>
              <p className="font-display text-lg font-black text-slate-900">{match.homeTeam}</p>
              <p className="font-display text-2xl font-black tabular-nums text-slate-900">
                {match.homeScore?.split(' (')[0] ?? '—'}
              </p>
              {match.homeScore?.includes('(') && (
                <p className="text-xs font-semibold text-slate-500">
                  {match.homeScore.split('(')[1]?.replace(')', '')} overs
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">vs</span>
            {match.tossWinner && (
              <p className="max-w-[140px] text-center text-[11px] text-slate-500">
                {match.tossWinner} won the toss & chose to {match.tossDecision}
              </p>
            )}
          </div>
          <div className="flex items-center justify-start gap-3 sm:justify-end sm:text-right">
            <div className="sm:order-last">
              <TeamAvatar name={match.awayTeam} size={56} />
            </div>
            <div>
              <p className="font-display text-lg font-black text-slate-900">{match.awayTeam}</p>
              <p className="font-display text-2xl font-black tabular-nums text-slate-900">
                {match.awayScore?.split(' (')[0] ?? '—'}
              </p>
              {match.awayScore?.includes('(') && (
                <p className="text-xs font-semibold text-slate-500">
                  {match.awayScore.split('(')[1]?.replace(')', '')} overs
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <p className={`text-sm font-bold ${match.status === 'completed' ? 'text-emerald-700' : 'text-nch-700'}`}>
            {match.result ?? match.matchState ?? 'Match starting soon'}
          </p>
          <div className="text-right text-xs text-slate-500">
            <p className="flex items-center justify-end gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {match.venue}
            </p>
            <p>{formatDateTime(match.startTime)}</p>
          </div>
        </div>
      </div>

      {/* ---------------- summary / current partnership ---------------- */}
      {isLive && (
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-slate-500">Match Summary</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {innings.slice(-1).map((inn) => {
              const active = inn.batting?.filter((b) => !b.isOut && b.runs >= 0).slice(0, 2) ?? [];
              const bowler = inn.bowling?.find((b) => b.overs > 0 && b.overs % 1 !== 0) ?? inn.bowling?.[0];
              return (
                <div key={inn.inningsNumber} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {inn.battingTeam} — {inn.runs}/{inn.wickets} ({inn.overs} ov)
                  </p>
                  {active.length > 0 && (
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-bold text-slate-900">Batting:</span>{' '}
                      {active.map((b) => `${b.name} ${b.runs}(${b.balls})`).join(', ')}
                    </p>
                  )}
                  {bowler && (
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-bold text-slate-900">Bowling:</span>{' '}
                      {bowler.name} {bowler.overs}-{bowler.maidens}-{bowler.runs}-{bowler.wickets}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">CRR {inn.runRate.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AdSlot slot="match_top" />

      {/* ---------------- reminder + prediction ---------------- */}
      {(match.status === 'upcoming' || match.status === 'live') && (
        <div className="grid gap-4 sm:grid-cols-2">
          {match.status === 'upcoming' && (
            <MatchReminderButton matchId={matchId} matchTitle={match.name} />
          )}
          <PredictionCard match={match} />
        </div>
      )}

      {/* ---------------- scorecards ---------------- */}
      <section aria-label="Scorecards">
        <h2 className="section-title">Scorecards</h2>
        {innings.length ? (
          <div className="space-y-5">
            {innings.map((inn) => (
              <Scorecard key={inn.inningsNumber} innings={inn} />
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center text-sm text-slate-500">
            {match.status === 'upcoming'
              ? 'Scorecard will appear once the match begins.'
              : 'Full scorecard not yet available.'}
          </div>
        )}
      </section>

      {/* ---------------- commentary ---------------- */}
      <section aria-label="Ball-by-ball commentary">
        <h2 className="section-title">Ball by Ball Commentary</h2>
        {(match.commentary?.length ?? 0) > 0 ? (
          <div className="card max-h-[480px] overflow-y-auto">
            <ul className="divide-y divide-slate-100">
              {match.commentary?.slice().reverse().map((c, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                  <span
                    className={`mt-0.5 w-14 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[10px] font-black ${
                      c.isWicket ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.over}.{c.ballInOver}
                  </span>
                  <p className={`text-sm ${c.isWicket ? 'font-bold text-rose-700' : 'text-slate-700'}`}>
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="card p-10 text-center text-sm text-slate-500">
            {match.status === 'live' ? 'Commentary will appear here as the match progresses.' : 'No commentary available for this match.'}
          </div>
        )}
      </section>

      {/* ---------------- match info ---------------- */}
      <section aria-label="Match information">
        <h2 className="section-title">Match Information</h2>
        <div className="card grid gap-4 p-5 sm:grid-cols-2">
          <InfoRow label="Series" value={match.seriesName ?? '—'} />
          <InfoRow label="Match" value={match.name} />
          <InfoRow label="Toss" value={match.tossWinner ? `${match.tossWinner} chose to ${match.tossDecision}` : 'Pending'} />
          <InfoRow label="Venue" value={`${match.venue}${match.city ? `, ${match.city}` : ''}`} />
          <InfoRow label="Start time" value={formatDateTime(match.startTime)} />
          <InfoRow label="Status" value={match.result ?? match.matchState ?? match.status} />
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
