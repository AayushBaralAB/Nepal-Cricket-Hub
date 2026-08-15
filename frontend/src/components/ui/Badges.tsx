export function LiveBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`chip gap-1.5 bg-nch-600 text-white ${small ? 'text-[10px]' : ''}`}
      role="status"
      aria-label="Live"
    >
      <span className="live-dot bg-white" />
      Live
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    live: 'bg-nch-600 text-white',
    upcoming: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
    abandoned: 'bg-slate-200 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-800',
  };
  const label: Record<string, string> = {
    live: 'Live',
    upcoming: 'Upcoming',
    completed: 'Result',
    abandoned: 'Abandoned',
    cancelled: 'Cancelled',
  };
  return (
    <span className={`chip ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {label[status] ?? status}
    </span>
  );
}

export function CategoryChip({ category }: { category: string }) {
  const colors: Record<string, string> = {
    'Breaking News': 'bg-nch-600 text-white',
    'Nepal Cricket': 'bg-nch-navy-700 text-white',
    'NPL': 'bg-saffron-500 text-white',
    'International Cricket': 'bg-blue-600 text-white',
    'Women\'s Cricket': 'bg-pink-600 text-white',
    'U19 Cricket': 'bg-amber-500 text-white',
    'Domestic Cricket': 'bg-emerald-600 text-white',
    'Player News': 'bg-violet-600 text-white',
    'ICC': 'bg-slate-800 text-white',
    'Cricket Updates': 'bg-sky-600 text-white',
  };
  return (
    <span className={`chip ${colors[category] ?? 'bg-slate-600 text-white'}`}>
      {category}
    </span>
  );
}
