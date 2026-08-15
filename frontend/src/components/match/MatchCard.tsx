import Link from 'next/link';
import type { CricketMatch } from '@/lib/types';
import { formatDateTime } from '@/lib/format';
import { TeamAvatar } from '../ui/TeamAvatar';
import { LiveBadge, StatusPill } from '../ui/Badges';

function TeamRow({
  name,
  short,
  logoUrl,
  score,
  align = 'left',
  won,
}: {
  name: string;
  short: string;
  logoUrl?: string;
  score?: string;
  align?: 'left' | 'right';
  won?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}
    >
      <TeamAvatar name={name} logoUrl={logoUrl} size={38} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${won ? 'text-emerald-700' : 'text-slate-800'}`}>
          {name}
        </p>
        <p className="text-xs text-slate-500">{short}</p>
      </div>
      {score && (
        <span className={`text-sm font-bold tabular-nums ${won ? 'text-emerald-700' : 'text-slate-900'}`}>
          {score}
        </span>
      )}
    </div>
  );
}

export function MatchCard({ match }: { match: CricketMatch }) {
  const status = match.status;
  const winnerName = match.result?.split(' won')[0]?.split(' vs')[0];
  const homeWon = match.result?.includes(match.homeTeam);

  return (
    <Link
      href={`/matches/${match.externalId}`}
      className="card card-hover block p-4"
      aria-label={`${match.name} — ${match.status}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        {status === 'live' ? <LiveBadge small /> : <StatusPill status={status} />}
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {match.seriesName ?? 'Cricket'}
        </p>
      </div>

      <div className="space-y-2.5">
        <TeamRow
          name={match.homeTeam}
          short={match.homeTeamShort}
          logoUrl={undefined}
          score={match.homeScore}
          won={homeWon}
        />
        <TeamRow
          name={match.awayTeam}
          short={match.awayTeamShort}
          logoUrl={undefined}
          score={match.awayScore}
          align="right"
          won={!homeWon && status === 'completed'}
        />
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className={`text-xs font-semibold ${status === 'completed' ? 'text-emerald-700' : 'text-slate-600'}`}>
          {match.result ?? match.matchState ?? formatDateTime(match.startTime)}
        </p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-slate-400">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {match.venue}
          {match.city ? `, ${match.city}` : ''}
        </p>
      </div>
    </Link>
  );
}
