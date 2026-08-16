import type { PointsRow } from '@/lib/types';
import { TeamAvatar } from '@/components/ui/TeamAvatar';

export function PointsTable({ rows }: { rows: PointsRow[] }) {
  if (!rows.length) {
    return (
      <div className="card p-6 text-center text-sm text-slate-500">
        Points table not available yet.
      </div>
    );
  }

  const sorted = [...rows].sort((a, b) => (a.position || 99) - (b.position || 99));

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
              <th className="table-th">#</th>
              <th className="table-th">Team</th>
              <th className="table-th text-center">M</th>
              <th className="table-th text-center">W</th>
              <th className="table-th text-center">L</th>
              <th className="table-th text-center">NR</th>
              <th className="table-th text-right">NRR</th>
              <th className="table-th text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const qualified = row.position <= 4;
              return (
                <tr
                  key={row.teamId}
                  className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 ${
                    row.position === 1 ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <td className="table-td">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                        qualified
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.position}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <TeamAvatar name={row.teamName} logoUrl={row.logoUrl} size={28} />
                      {row.teamName}
                      {row.position === 1 && (
                        <svg
                          className="h-3.5 w-3.5 text-saffron-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-label="Table leaders"
                        >
                          <path d="M2.8 7.2 7 10.6l4.6-5.9a1.2 1.2 0 0 1 1.8 0L18 10.6l4.2-3.4-1.8 11a1 1 0 0 1-1 .8H4.6a1 1 0 0 1-1-.8Z" />
                        </svg>
                      )}
                    </span>
                  </td>
                  <td className="table-td text-center tabular-nums">{row.matches}</td>
                  <td className="table-td text-center tabular-nums text-emerald-700">{row.wins}</td>
                  <td className="table-td text-center tabular-nums text-rose-700">{row.losses}</td>
                  <td className="table-td text-center tabular-nums text-slate-500">{row.noResult}</td>
                  <td className="table-td text-right tabular-nums">
                    <span className={row.netRunRate >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {row.netRunRate >= 0 ? '+' : ''}{row.netRunRate.toFixed(3)}
                    </span>
                  </td>
                  <td className="table-td text-right font-black tabular-nums">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
