import Link from 'next/link';
import type { CricketPlayer } from '@/lib/types';
import { initials } from '@/lib/format';

const ROLE_COLORS: Record<string, string> = {
  'Batter': 'bg-blue-100 text-blue-700',
  'Bowler': 'bg-rose-100 text-rose-700',
  'All-rounder': 'bg-violet-100 text-violet-700',
  'Wicketkeeper': 'bg-amber-100 text-amber-700',
  'Wicketkeeper-Batter': 'bg-amber-100 text-amber-700',
};

export function PlayerCard({ player }: { player: CricketPlayer }) {
  return (
    <Link href={`/players/${player.slug}`} className="card card-hover group block p-4 text-center">
      <div className="relative mx-auto h-20 w-20">
        {player.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photoUrl}
            alt={player.name}
            className="h-20 w-20 rounded-full border-2 border-slate-200 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-nch-600 to-nch-navy-800 font-display text-xl font-black text-white">
            {initials(player.name)}
          </div>
        )}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-nch-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
          {player.country ?? 'Nepal'}
        </span>
      </div>
      <h3 className="mt-3 truncate font-display text-sm font-bold text-slate-900 group-hover:text-nch-600">
        {player.name}
      </h3>
      <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_COLORS[player.role ?? 'Batter'] ?? 'bg-slate-100 text-slate-600'}`}>
        {player.role ?? 'Batter'}
      </p>
      {player.teamName && (
        <p className="mt-1.5 text-[11px] text-slate-400">{player.teamName}</p>
      )}
    </Link>
  );
}
