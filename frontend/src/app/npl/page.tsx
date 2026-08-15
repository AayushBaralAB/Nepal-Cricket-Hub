import type { Metadata } from 'next';
import { safeFetch, getSeriesBySlug, getPointsTable, getTeams, getTopRunScorers, getTopWicketTakers, getNews } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PointsTable } from '@/components/PointsTable';
import { MatchCard } from '@/components/match/MatchCard';
import { NewsCard } from '@/components/news/NewsCard';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AdSlot } from '@/components/ui/AdSlot';
import { formatDate } from '@/lib/format';
import type { CricketMatch } from '@/lib/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Nepal Premier League (NPL)',
  description: 'Nepal Premier League — NPL fixtures, results, live scores, points table and team news.',
};

const NPL_SERIES_SLUG = 'nepal-premier-league-2025';

export default async function NplPage() {
  const [series, points, teams, topRuns, topWickets, news] = await Promise.all([
    safeFetch(getSeriesBySlug(NPL_SERIES_SLUG)),
    safeFetch(getPointsTable(NPL_SERIES_SLUG)),
    safeFetch(getTeams()),
    safeFetch(getTopRunScorers(5)),
    safeFetch(getTopWicketTakers(5)),
    safeFetch(getNews({ category: 'NPL', limit: 4 })),
  ]);

  const nplSeries = series;
  const nplTeams = (teams ?? []).filter((t) => t.teamType === 'NPL');
  const matches: CricketMatch[] = nplSeries?.matches ?? [];
  const live = matches.filter((m) => m.status === 'live');
  const upcoming = matches.filter((m) => m.status === 'upcoming').slice(0, 8);
  const completed = matches.filter((m) => m.status === 'completed').slice(0, 8);

  const featuredMatch = live[0] ?? upcoming[0];

  return (
    <div className="container-nch space-y-10 py-8">
      <Breadcrumbs items={[{ label: 'NPL' }]} />

      <header className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-nch-navy-800 via-nch-700 to-nch-saffron-500 opacity-95" />
        <div className="relative p-6 sm:p-8">
          <span className="chip bg-white/20 text-white">{nplSeries?.season ?? 'NPL'}</span>
          <h1 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
            Nepal Premier League
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            {nplSeries?.name ?? 'The Nepal Premier League'} — fixtures, live scores, results, points
            standings and team news.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/90">
            {nplSeries?.startDate && <span>Starts {formatDate(nplSeries.startDate)}</span>}
            {nplSeries?.endDate && <span>Ends {formatDate(nplSeries.endDate)}</span>}
          </div>
        </div>
      </header>

      <AdSlot slot="npl_top" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section aria-label="NPL teams">
            <SectionHeader title="Teams" href="/teams" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {nplTeams.map((team) => (
                <a
                  key={team.externalId}
                  href={`/teams/${team.slug}`}
                  className="card card-hover flex flex-col items-center gap-2 p-4 text-center"
                >
                  <TeamAvatar name={team.name} logoUrl={team.logoUrl} size={48} />
                  <span className="text-xs font-bold text-slate-800">{team.name}</span>
                </a>
              ))}
            </div>
          </section>

          {featuredMatch && (
            <section aria-label="Featured NPL match">
              <SectionHeader title="Latest Match" href={`/matches/${featuredMatch.externalId}`} linkLabel="Open match →" />
              <MatchCard match={featuredMatch} />
            </section>
          )}

          {upcoming.length > 0 && (
            <section aria-label="Upcoming NPL fixtures">
              <SectionHeader title="Fixtures" href="/matches?series=nepal-premier-league-2025" />
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.map((m) => <MatchCard key={m.externalId} match={m} />)}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section aria-label="NPL results">
              <SectionHeader title="Results" href="/matches?status=completed&series=nepal-premier-league-2025" />
              <div className="grid gap-4 sm:grid-cols-2">
                {completed.map((m) => <MatchCard key={m.externalId} match={m} />)}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section aria-label="NPL points table">
            <SectionHeader title="Points Table" href="/points-table?series=nepal-premier-league-2025" />
            <PointsTable rows={points ?? []} />
          </section>

          <section aria-label="NPL news">
            <SectionHeader title="NPL News" href="/news?category=npl" />
            <div className="space-y-4">
              {(news ?? []).slice(0, 3).map((item) => <NewsCard key={item.slug} item={item} />)}
            </div>
          </section>

          <section aria-label="NPL statistics" id="stats">
            <SectionHeader title="Top Run Scorers" />
            <StatRows rows={(topRuns ?? []).map((r) => ({ name: r.player, value: String(r.runs), sub: `SR ${r.strikeRate}` }))} accent="runs" />
          </section>
          <section aria-label="NPL wicket takers">
            <SectionHeader title="Top Wicket Takers" />
            <StatRows rows={(topWickets ?? []).map((w) => ({ name: w.player, value: String(w.wickets), sub: `Econ ${w.economy}` }))} accent="wickets" />
          </section>
        </div>
      </div>
    </div>
  );
}

function StatRows({
  rows,
  accent,
}: {
  rows: Array<{ name: string; value: string; sub: string }>;
  accent: 'runs' | 'wickets';
}) {
  if (!rows.length) return null;
  return (
    <div className="card divide-y divide-slate-100 overflow-hidden">
      {rows.map((row, i) => (
        <div key={row.name} className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-black text-slate-600">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{row.name}</p>
            <p className="truncate text-xs text-slate-500">{row.sub}</p>
          </div>
          <span className={`text-lg font-black tabular-nums ${accent === 'runs' ? 'text-nch-600' : 'text-emerald-700'}`}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
