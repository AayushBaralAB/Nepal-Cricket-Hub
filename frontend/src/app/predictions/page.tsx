import type { Metadata } from 'next';
import { safeFetch, getUpcomingMatches } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PredictionCard } from '@/components/match/PredictionCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Match Predictions | CricketHub',
  description:
    'Predict Nepal cricket match outcomes — vote for winners and share your predicted scores on CricketHub.',
};

export default async function PredictionsPage() {
  const matches = await safeFetch(getUpcomingMatches(12));

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Predictions' }]} />

      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Predict Nepal Matches</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
          Think Nepal will win? Picked the right score? Vote for who you think will win each upcoming
          match and track how the community is predicting.
        </p>
      </div>

      {matches && matches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <PredictionCard key={match.externalId} match={match} />
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-sm text-slate-500">
          No upcoming matches to predict right now. Check back soon for new fixtures.
        </div>
      )}
    </div>
  );
}
