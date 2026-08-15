import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MatchesExplorer } from './MatchesExplorer';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Matches — Live, Upcoming & Results',
  description: 'Live cricket scores, upcoming fixtures, and results for Nepal cricket, NPL, women\'s cricket, U19 and international cricket.',
};

export default function MatchesPage() {
  return (
    <div className="container-nch space-y-6 py-8">
      <Breadcrumbs items={[{ label: 'Matches' }]} />
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Matches</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live scores, upcoming fixtures and recent results — filter by team type, tournament and date.
        </p>
      </div>
      <Suspense fallback={<MatchesLoading />}>
        <MatchesExplorer />
      </Suspense>
    </div>
  );
}

function MatchesLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card h-48 animate-pulse" />
      ))}
    </div>
  );
}
