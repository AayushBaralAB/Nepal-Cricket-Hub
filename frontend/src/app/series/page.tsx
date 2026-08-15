import type { Metadata } from 'next';
import Link from 'next/link';
import { safeFetch, getSeries } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StatusPill } from '@/components/ui/Badges';
import { formatDate } from '@/lib/format';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Cricket Series & Tournaments',
  description: 'Nepal cricket series, NPL, international tours, women\'s and U19 tournaments — schedules, results and points tables.',
};

export default async function SeriesPage() {
  const series = (await safeFetch(getSeries())) ?? [];

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Series' }]} />
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Series & Tournaments</h1>
        <p className="mt-1 text-sm text-slate-500">
          All series featuring Nepal — national team tours, NPL, women&apos;s and U19 cricket.
        </p>
      </div>

      <AdSlot slot="series_inline" />

      {series.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <Link key={s.externalId} href={`/series/${s.slug}`} className="card card-hover group flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-base font-bold text-slate-900 group-hover:text-nch-600">
                  {s.name}
                </h2>
                {s.status && <StatusPill status={s.status === 'completed' ? 'completed' : 'upcoming'} />}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="chip bg-nch-navy-700 text-white">{s.type}</span>
                {s.category && <span className="chip bg-slate-100 text-slate-600">{s.category}</span>}
              </div>
              {(s.startDate || s.endDate) && (
                <p className="mt-auto text-xs text-slate-500">
                  {formatDate(s.startDate)}
                  {s.endDate && ` – ${formatDate(s.endDate)}`}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-sm text-slate-500">
          Series data will appear soon.
        </div>
      )}
    </div>
  );
}
