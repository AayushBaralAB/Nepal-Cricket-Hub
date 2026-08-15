import type { InningsData } from '@/lib/types';

function BattingTable({ innings }: { innings: InningsData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="table-th">Batter</th>
            <th className="table-th text-right">R</th>
            <th className="table-th text-right">B</th>
            <th className="table-th text-right">4s</th>
            <th className="table-th text-right">6s</th>
            <th className="table-th text-right">SR</th>
          </tr>
        </thead>
        <tbody>
          {innings.batting?.map((b) => (
            <tr key={`${b.name}-${b.runs}`} className="border-b border-slate-100">
              <td className="table-td">
                <span className={b.isNotOut ? 'font-bold text-slate-900' : 'text-slate-700'}>
                  {b.name}
                </span>
                {b.isNotOut && <span className="ml-1 text-xs font-bold text-emerald-600">not out</span>}
                <p className="text-[11px] text-slate-400">{b.dismissal}</p>
              </td>
              <td className="table-td text-right font-bold tabular-nums">{b.runs}</td>
              <td className="table-td text-right tabular-nums">{b.balls}</td>
              <td className="table-td text-right tabular-nums text-slate-500">{b.fours}</td>
              <td className="table-td text-right tabular-nums text-slate-500">{b.sixes}</td>
              <td className="table-td text-right tabular-nums">{b.strikeRate.toFixed(2)}</td>
            </tr>
          ))}
          {(!innings.batting || innings.batting.length === 0) && (
            <tr>
              <td colSpan={6} className="table-td text-center text-slate-400">
                {innings.isCompleted ? 'Yet to bat' : 'Waiting for innings to begin'}
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td className="table-td font-bold text-slate-900">
              Total
            </td>
            <td className="table-td text-right font-black text-slate-900 tabular-nums">
              {innings.runs}/{innings.wickets}
            </td>
            <td className="table-td text-right font-semibold tabular-nums">
              ({innings.overs} ov)
            </td>
            <td colSpan={2} className="table-td text-right text-slate-500">
              RR {innings.runRate.toFixed(2)}
            </td>
            {innings.extras != null && innings.extras > 0 && (
              <td className="table-td text-right text-slate-500">Extras {innings.extras}</td>
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function BowlingTable({ innings }: { innings: InningsData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="table-th">Bowler</th>
            <th className="table-th text-right">O</th>
            <th className="table-th text-right">M</th>
            <th className="table-th text-right">R</th>
            <th className="table-th text-right">W</th>
            <th className="table-th text-right">Econ</th>
          </tr>
        </thead>
        <tbody>
          {innings.bowling?.map((b) => (
            <tr key={b.name} className="border-b border-slate-100">
              <td className="table-td font-semibold text-slate-800">{b.name}</td>
              <td className="table-td text-right tabular-nums">{b.overs}</td>
              <td className="table-td text-right tabular-nums text-slate-500">{b.maidens}</td>
              <td className="table-td text-right tabular-nums">{b.runs}</td>
              <td className="table-td text-right font-bold tabular-nums">{b.wickets}</td>
              <td className="table-td text-right tabular-nums">{b.economy.toFixed(2)}</td>
            </tr>
          ))}
          {(!innings.bowling || innings.bowling.length === 0) && (
            <tr>
              <td colSpan={6} className="table-td text-center text-slate-400">Bowling not started</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Scorecard({ innings }: { innings: InningsData }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="font-display text-sm font-bold text-slate-900">
          {innings.battingTeam}
          {innings.target ? (
            <span className="ml-2 text-xs font-semibold text-slate-500">
              (target {innings.target})
            </span>
          ) : null}
        </h3>
        <p className="text-xs font-semibold text-slate-500">
          {innings.runs}/{innings.wickets} · {innings.overs} ov · RR {innings.runRate.toFixed(2)}
        </p>
      </div>

      <div className="grid divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <BattingTable innings={innings} />
        <BowlingTable innings={innings} />
      </div>

      {(innings.fallOfWickets?.length ?? 0) > 0 && (
        <div className="border-t border-slate-200 px-4 py-3">
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Fall of Wickets
          </h4>
          <p className="text-xs text-slate-600">
            {innings.fallOfWickets?.map((f) => `${f.runs}/${f.wicketNumber}`).join(' · ')}
          </p>
        </div>
      )}

      {(innings.partnerships?.length ?? 0) > 0 && (
        <div className="border-t border-slate-200 px-4 py-3">
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Partnerships
          </h4>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            {innings.partnerships?.map((p, i) => (
              <span key={i} className="rounded bg-slate-100 px-2 py-1">
                {p.playerA} & {p.playerB}: <b>{p.runs}</b> ({p.balls})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
