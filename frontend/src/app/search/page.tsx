import type { Metadata } from 'next';
import Link from 'next/link';
import { safeFetch, searchAll } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NewsCard } from '@/components/news/NewsCard';
import { PlayerCard } from '@/components/players/PlayerCard';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { MatchCard } from '@/components/match/MatchCard';
import { AdSlot } from '@/components/ui/AdSlot';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : 'Search',
    description: `Search results for "${q ?? ''}" — Nepal cricket news, players, teams and matches.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const [results] = await Promise.all([
    query ? safeFetch(searchAll(query)) : Promise.resolve(null),
  ]);

  const news = results?.news ?? [];
  const players = results?.players ?? [];
  const teams = results?.teams ?? [];
  const matches = results?.matches ?? [];
  const series = results?.series ?? [];

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Search' }]} />
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">
          {query ? <>Results for “{query}”</> : 'Search'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {query
            ? `${news.length + players.length + teams.length + matches.length + series.length} results found`
            : 'Type a search term to find news, players, teams and matches.'}
        </p>
      </div>

      {!query && (
        <div className="card p-10 text-center text-sm text-slate-500">
          Try searching for a player, team, tournament or news topic.
        </div>
      )}

      {query && (
        <>
          <AdSlot slot="search_inline" />

          {players.length > 0 && (
            <section aria-label="Players">
              <h2 className="section-title">Players</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {players.map((p) => <PlayerCard key={p.externalId} player={p} />)}
              </div>
            </section>
          )}

          {teams.length > 0 && (
            <section aria-label="Teams">
              <h2 className="section-title">Teams</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {teams.map((t) => (
                  <Link key={t.externalId} href={`/teams/${t.slug}`} className="card card-hover flex items-center gap-3 p-4">
                    <TeamAvatar name={t.name} logoUrl={t.logoUrl} size={40} />
                    <span className="text-sm font-bold text-slate-800">{t.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {matches.length > 0 && (
            <section aria-label="Matches">
              <h2 className="section-title">Matches</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => <MatchCard key={m.externalId} match={m} />)}
              </div>
            </section>
          )}

          {series.length > 0 && (
            <section aria-label="Series">
              <h2 className="section-title">Series</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {series.map((s) => (
                  <Link key={s.externalId} href={`/series/${s.slug}`} className="card card-hover flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.type} · {s.category}</p>
                    </div>
                    <span className="text-xs font-semibold text-nch-600">View →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {news.length > 0 && (
            <section aria-label="News articles">
              <h2 className="section-title">News</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {news.map((n) => <NewsCard key={n.slug} item={n} />)}
              </div>
            </section>
          )}

          {news.length + players.length + teams.length + matches.length + series.length === 0 && (
            <div className="card p-10 text-center text-sm text-slate-500">
              No results found for “{query}”. Try a different search term.
            </div>
          )}
        </>
      )}
    </div>
  );
}
