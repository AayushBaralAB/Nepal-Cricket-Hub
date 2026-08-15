import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safeFetch, getSeriesBySlug, SITE_URL } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PointsTable } from '@/components/PointsTable';
import { MatchCard } from '@/components/match/MatchCard';
import { AdSlot } from '@/components/ui/AdSlot';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await safeFetch(getSeriesBySlug(slug));
  if (!series) return { title: 'Series not found' };
  return {
    title: `${series.name} — Fixtures, Results & Points Table`,
    description: `${series.name} — fixtures, live scores, results and points table for Nepal cricket fans.`,
    openGraph: {
      type: 'website',
      title: series.name,
      description: `${series.name} — fixtures, results and points table.`,
      url: `${SITE_URL}/series/${series.slug}`,
    },
  };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await safeFetch(getSeriesBySlug(slug));
  if (!series) notFound();

  const { matches = [], pointsTable = [] } = series;

  const upcoming = matches.filter((m) => m.status === 'upcoming');
  const live = matches.filter((m) => m.status === 'live');
  const completed = matches.filter((m) => m.status === 'completed' || m.status === 'abandoned' || m.status === 'cancelled');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: series.name,
    startDate: series.startDate,
    endDate: series.endDate,
    eventStatus: series.status === 'completed' ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventScheduled',
  };

  return (
    <div className="container-nch space-y-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: 'Series', href: '/series' }, { label: series.name }]} />

      <header className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="chip bg-nch-navy-700 text-white">{series.type}</span>
              {series.category && <span className="chip bg-slate-100 text-slate-600">{series.category}</span>}
              <span className="chip bg-slate-100 text-slate-600">{series.season ?? 'Nepal Cricket'}</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-black text-slate-900 sm:text-3xl">{series.name}</h1>
          </div>
          {(series.startDate || series.endDate) && (
            <p className="text-sm text-slate-500">
              {formatDate(series.startDate)}
              {series.endDate && ` – ${formatDate(series.endDate)}`}
            </p>
          )}
        </div>
        {series.status === 'live' && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-nch-600 px-3 py-1 text-xs font-black text-white">
            <span className="live-dot bg-white" /> Series in progress
          </p>
        )}
      </header>

      <AdSlot slot="series_inline" />

      {series.pointsTableAvailable !== false && pointsTable.length > 0 && (
        <section aria-label="Points table">
          <h2 className="section-title">Points Table</h2>
          <PointsTable rows={pointsTable} />
        </section>
      )}

      {live.length > 0 && (
        <section aria-label="Live matches">
          <h2 className="section-title">Live</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((m) => <MatchCard key={m.externalId} match={m} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-label="Upcoming fixtures">
          <h2 className="section-title">Fixtures</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => <MatchCard key={m.externalId} match={m} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section aria-label="Completed matches">
          <h2 className="section-title">Results</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((m) => <MatchCard key={m.externalId} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
