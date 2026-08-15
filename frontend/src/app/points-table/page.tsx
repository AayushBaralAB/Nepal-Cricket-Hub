import type { Metadata } from 'next';
import { safeFetch, getPointsTable, getSeries } from '@/lib/api';
import { PointsTable } from '@/components/PointsTable';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Points Tables',
  description: 'Cricket points tables for Nepal cricket — NPL, tri-series and international tournaments.',
};

const DEFAULT_SERIES_SLUG = 'nepal-premier-league-2025';

export default async function PointsTablePage({
  searchParams,
}: {
  searchParams: Promise<{ series?: string }>;
}) {
  const { series: seriesSlug } = await searchParams;
  const [series, points] = await Promise.all([
    safeFetch(getSeries()),
    safeFetch(getPointsTable(seriesSlug ?? DEFAULT_SERIES_SLUG)),
  ]);

  const seriesList = series ?? [];
  const activeSlug = seriesSlug ?? DEFAULT_SERIES_SLUG;
  const active = seriesList.find((s) => s.slug === activeSlug);

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Points Table' }]} />
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Points Tables</h1>
        <p className="mt-1 text-sm text-slate-500">
          {active?.name ?? 'Current standings'} — Nepal cricket.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {seriesList.map((s) => (
          <a
            key={s.externalId}
            href={`/points-table?series=${s.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              activeSlug === s.slug
                ? 'bg-nch-navy-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {s.name}
          </a>
        ))}
      </div>

      <AdSlot slot="points_table_inline" />

      <PointsTable rows={points ?? []} />
    </div>
  );
}
