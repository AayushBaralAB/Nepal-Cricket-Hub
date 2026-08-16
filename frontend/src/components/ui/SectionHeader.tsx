import Link from 'next/link';

export function SectionHeader({
  title,
  overline,
  href,
  linkLabel = 'View all',
}: {
  title: string;
  overline?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {overline && <p className="overline-label">{overline}</p>}
        <h2 className="section-title !mb-0">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 shadow-card transition-all duration-300 ease-premium hover:border-nch-600/30 hover:text-nch-700 hover:shadow-soft"
        >
          {linkLabel}
          <svg
            className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
