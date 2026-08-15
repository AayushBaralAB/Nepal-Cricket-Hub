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
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                <tr key={row.teamId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="table-td">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-black ${
                        qualified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.position}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <TeamAvatar name={row.teamName} logoUrl={row.logoUrl} size={28} />
                      {row.teamName}
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
