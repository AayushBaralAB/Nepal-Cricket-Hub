import Link from 'next/link';

export function SectionHeader({
  title,
  href,
  linkLabel = 'View all',
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="section-title !mb-0">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-nch-600 hover:text-nch-700"
        >
          {linkLabel}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
