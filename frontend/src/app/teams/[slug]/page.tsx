import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safeFetch, getTeamBySlug, SITE_URL } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { PlayerCard } from '@/components/players/PlayerCard';
import { MatchCard } from '@/components/match/MatchCard';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await safeFetch(getTeamBySlug(slug));
  if (!team) return { title: 'Team not found' };
  return {
    title: `${team.name} — Team Profile`,
    description: `${team.name} cricket team profile — squad, recent matches and results.`,
    openGraph: {
      type: 'website',
      title: `${team.name} — Team Profile`,
      description: `${team.name} squad and recent matches.`,
      url: `${SITE_URL}/teams/${team.slug}`,
      images: team.logoUrl ? [{ url: team.logoUrl }] : undefined,
    },
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await safeFetch(getTeamBySlug(slug));
  if (!team) notFound();

  const { squad = [], matches = [] } = team;

  const recent = [...matches]
    .filter((m) => m.status === 'completed')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 6);
  const upcoming = matches.filter((m) => m.status === 'upcoming').slice(0, 6);

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Teams', href: '/teams' }, { label: team.name }]} />

      <header className="card flex flex-wrap items-center gap-5 p-6">
        <TeamAvatar name={team.name} logoUrl={team.logoUrl} size={88} />
        <div>
          <div className="flex flex-wrap gap-2">
            {team.isNational && <span className="chip bg-nch-navy-700 text-white">National</span>}
            {team.teamType && <span className="chip bg-slate-100 text-slate-600">{team.teamType}</span>}
            {team.country && <span className="chip bg-slate-100 text-slate-600">{team.country}</span>}
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900 sm:text-3xl">{team.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{squad.length} players in squad</p>
        </div>
      </header>

      <AdSlot slot="teams_inline" />

      {squad.length > 0 && (
        <section aria-label="Squad">
          <h2 className="section-title">Squad</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {squad.map((p) => <PlayerCard key={p.externalId} player={p} />)}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section aria-label="Recent results">
          <h2 className="section-title">Recent Results</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((m) => <MatchCard key={m.externalId} match={m} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-label="Upcoming fixtures">
          <h2 className="section-title">Upcoming Fixtures</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => <MatchCard key={m.externalId} match={m} />)}
          </div>
        </section>
      )}

      {matches.length === 0 && squad.length === 0 && (
        <div className="card p-10 text-center text-sm text-slate-500">
          Squad and match data will appear soon.
        </div>
      )}
    </div>
  );
}
