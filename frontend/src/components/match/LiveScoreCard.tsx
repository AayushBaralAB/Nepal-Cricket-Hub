import Link from 'next/link';
import type { CricketMatch } from '@/lib/types';
import { TeamAvatar } from '../ui/TeamAvatar';
import { LiveBadge } from '../ui/Badges';
import { timeAgo } from '@/lib/format';

/**
 * Large, mobile-first live score block. Shows teams, score, overs,
 * current run rate and match status in an unmissable layout.
 */
export function LiveScoreCard({ match }: { match: CricketMatch }) {
  const innings = match.innings?.filter((i) => i.runs > 0 || i.wickets > 0) ?? [];

  return (
    <Link
      href={`/matches/${match.externalId}`}
      className="card card-hover relative overflow-hidden"
      aria-label={`${match.name} live score`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-nch-600 via-nch-500 to-nch-600" />

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
        <LiveBadge />
        <span className="text-xs font-semibold text-slate-500">
          {match.seriesName ?? 'Live Match'}
        </span>
        {match.startTime && (
          <span className="text-[11px] text-slate-400">updated {timeAgo(new Date().toISOString())}</span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <TeamAvatar name={match.homeTeam} size={54} />
          <p className="mt-1 text-sm font-bold text-slate-900">{match.homeTeam}</p>
          <p className="font-display text-lg font-black tabular-nums text-slate-900">
            {match.homeScore?.split(' (')[0] ?? '—'}
          </p>
          {match.homeScore?.includes('(') && (
            <p className="text-[11px] font-semibold text-slate-500">
              {match.homeScore.split('(')[1]?.replace(')', '')} ov
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 px-1">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">vs</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {match.matchType}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <TeamAvatar name={match.awayTeam} size={54} />
          <p className="mt-1 text-sm font-bold text-slate-900">{match.awayTeam}</p>
          <p className="font-display text-lg font-black tabular-nums text-slate-900">
            {match.awayScore?.split(' (')[0] ?? '—'}
          </p>
          {match.awayScore?.includes('(') && (
            <p className="text-[11px] font-semibold text-slate-500">
              {match.awayScore.split('(')[1]?.replace(')', '')} ov
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2.5">
        <p className="text-xs font-semibold text-nch-700">{match.matchState}</p>
        <span className="text-[11px] text-slate-500">{match.venue}</span>
      </div>

      {innings.length > 0 && (
        <div className="grid gap-2 border-t border-slate-100 px-4 py-3 sm:grid-cols-2">
          {innings.slice(-2).map((inn) => (
            <div key={inn.inningsNumber} className="rounded-lg bg-slate-50 p-2 text-xs">
              <p className="font-bold text-slate-700">
                {inn.battingTeam}: {inn.runs}/{inn.wickets}
                <span className="ml-1 font-semibold text-slate-500">
                  ({inn.overs} ov, RR {inn.runRate.toFixed(2)})
                </span>
              </p>
              {inn.batting?.filter((b) => !b.isOut && b.runs > 0).slice(0, 2).map((b) => (
                <p key={b.name} className="mt-0.5 text-slate-500">
                  {b.name} {b.runs}({b.balls})
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
