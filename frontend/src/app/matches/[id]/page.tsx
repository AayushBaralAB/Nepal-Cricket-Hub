import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safeFetch, getMatch } from '@/lib/api';
import { MatchCentreClient } from './MatchCentreClient';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SITE_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await safeFetch(getMatch(id));
  if (!match) return { title: 'Match Centre' };

  const live = match.status === 'live' ? ' (Live)' : '';
  return {
    title: `${match.name}${live} — Match Centre`,
    description:
      `${match.name} — ${match.seriesName ?? 'Cricket'}. Score: ${match.homeScore ?? '—'} vs ${match.awayScore ?? '—'}. ` +
      `${match.result ?? match.matchState ?? ''} ${match.venue}`,
    openGraph: {
      type: 'article',
      title: `${match.name} — Match Centre`,
      description: `${match.homeTeam} vs ${match.awayTeam}. ${match.result ?? match.matchState ?? ''}`,
      url: `${SITE_URL}/matches/${match.externalId}`,
    },
  };
}

export default async function MatchCentrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await safeFetch(getMatch(id));
  if (!match) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: match.name,
    startDate: match.startTime,
    eventStatus:
      match.status === 'live'
        ? 'https://schema.org/EventScheduled'
        : match.status === 'completed'
          ? 'https://schema.org/EventScheduled'
          : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: match.venue,
      address: match.city,
    },
    description: match.result ?? match.matchState,
  };

  return (
    <div className="container-nch space-y-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Matches', href: '/matches' },
          { label: match.seriesName ?? 'Match', href: `/series/${match.seriesSlug ?? ''}` },
          { label: match.name },
        ]}
      />
      <MatchCentreClient initial={match} matchId={id} />
    </div>
  );
}
