'use client';

import { useEffect, useState } from 'react';

export function MatchCountdown({ startTime, label }: { startTime: string; label?: string }) {
  const target = new Date(startTime).getTime();

  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    return { d, h, m, s, done: diff <= 0 };
  };

  const [t, setT] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  if (t.done) return null;

  const cells = [
    { v: String(t.d).padStart(2, '0'), l: 'Days' },
    { v: String(t.h).padStart(2, '0'), l: 'Hrs' },
    { v: String(t.m).padStart(2, '0'), l: 'Min' },
    { v: String(t.s).padStart(2, '0'), l: 'Sec' },
  ];

  return (
    <div>
      {label && (
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          {label}
        </p>
      )}
      <div className="flex items-stretch gap-2">
        {cells.map((c, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="flex h-16 w-14 items-center justify-center rounded-xl border border-white/15 bg-white/5 font-display text-2xl font-black tabular-nums text-white shadow-inner-top backdrop-blur-md sm:h-20 sm:w-16 sm:text-3xl">
              {c.v}
            </div>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-white/50">
              {c.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}