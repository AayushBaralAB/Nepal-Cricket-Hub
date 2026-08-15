import type { Metadata } from 'next';
import Link from 'next/link';
import {
  safeFetch,
  getLiveMatches,
  getUpcomingMatches,
  getResults,
  getNews,
  getBreakingNews,
  getSeries,
  getPointsTable,
  getTeams,
  getPlayers,
  getTopRunScorers,
  getTopWicketTakers,
  getVideos,
} from '@/lib/api';
import type { NewsItem, PointsRow } from '@/lib/types';
import { formatDateTime, formatDate } from '@/lib/format';
import { LiveStrip } from '@/components/match/LiveStrip';
import { MatchCard } from '@/components/match/MatchCard';
import { NewsCard } from '@/components/news/NewsCard';
import { PointsTable } from '@/components/PointsTable';
import { PlayerCard } from '@/components/players/PlayerCard';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AdSlot } from '@/components/ui/AdSlot';
import { LiveBadge } from '@/components/ui/Badges';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Nepal Cricket Hub — Live Scores, News & Stats',
  description:
    'Live scores, fixtures, results, automatic Nepal cricket news, NPL coverage, player statistics and points tables — all Nepal cricket in one hub.',
  openGraph: {
    type: 'website',
    url: '/',
  },
};

const NEPAL_SERIES_SLUG = 'nepal-premier-league-2025';

export default async function HomePage() {
  const [live, upcoming, results, featuredNews, latestNews, series, points, teams, players, topRuns, topWickets, videos] =
    await Promise.all([
      safeFetch(getLiveMatches()),
      safeFetch(getUpcomingMatches(8)),
      safeFetch(getResults(6)),
      safeFetch(getNews({ limit: 3 })),
      safeFetch(getNews({ limit: 8 })),
      safeFetch(getSeries()),
      safeFetch(getPointsTable(NEPAL_SERIES_SLUG)),
      safeFetch(getTeams()),
      safeFetch(getPlayers()),
      safeFetch(getTopRunScorers(5)),
      safeFetch(getTopWicketTakers(5)),
      safeFetch(getVideos()),
    ]);

  const featured = (featuredNews ?? []).slice(0, 3);
  const latest = (latestNews ?? []).slice(0, 8);
  const nplSeries = series?.find((s) => s.slug === NEPAL_SERIES_SLUG);
  const nepalTeams = (teams ?? []).filter(
    (t) => t.name.toLowerCase().includes('nepal') || t.country?.toLowerCase() === 'nepal',
  );
  const nplTeams = (teams ?? []).filter((t) => t.teamType === 'NPL');
  const schedule = (upcoming ?? []).slice(0, 6);
  const nepalPlayers = (players ?? []).filter((p) => p.country === 'Nepal').slice(0, 8);
  const displayVideos = videos ?? [];

  return (
    <div className="container-nch space-y-12 py-8">
      {/* ----------------------- LIVE ----------------------- */}
      <section aria-labelledby="live-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="live-heading" className="section-title !mb-0">
            <LiveBadge /> Live Now
          </h2>
          <Link href="/live" className="text-sm font-semibold text-nch-600 hover:text-nch-700">
            All live →
          </Link>
        </div>
        <LiveStrip initial={live ?? []} />
      </section>

      {/* ----------------------- NEWS FEATURE ----------------------- */}
      {featured.length > 0 && (
        <section aria-label="Featured news">
          <SectionHeader title="Top Stories" href="/news" />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <NewsCard item={featured[0]} featured />
            </div>
            <div className="grid gap-5">
              {featured.slice(1).map((item) => (
                <NewsCard key={item.slug} item={item} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------- AD ----------------------- */}
      <AdSlot slot="home_top" />

      {/* ----------------------- SCHEDULE + UPCOMING + RESULTS ----------------------- */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section aria-label="Upcoming matches">
            <SectionHeader title="Upcoming Matches" href="/matches?status=upcoming" />
            {schedule.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {schedule.map((m) => <MatchCard key={m.externalId} match={m} />)}
              </div>
            ) : (
              <EmptyCard message="No upcoming matches found." />
            )}
          </section>

          <section aria-label="Recent results">
            <SectionHeader title="Recent Results" href="/matches?status=completed" />
            {results?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((m) => <MatchCard key={m.externalId} match={m} />)}
              </div>
            ) : (
              <EmptyCard message="No recent results yet." />
            )}
          </section>

          <section aria-label="Nepal cricket schedule">
            <SectionHeader title="Nepal Schedule" href="/matches?nepal=true" />
            <ScheduleTable matches={schedule} />
          </section>

          <AdSlot slot="home_middle" />
        </div>

        <div className="space-y-8">
          <section aria-label="Points table">
            <SectionHeader
              title={nplSeries?.name ?? 'Points Table'}
              href={`/points-table${nplSeries ? `?series=${nplSeries.slug}` : ''}`}
            />
            <PointsTable rows={points ?? []} />
          </section>

          <section aria-label="Nepal teams">
            <SectionHeader title="Nepal Teams" href="/teams" />
            <div className="grid grid-cols-1 gap-3">
              {nepalTeams.map((team) => (
                <Link
                  key={team.externalId}
                  href={`/teams/${team.slug}`}
                  className="card card-hover flex items-center gap-3 p-3"
                >
                  <TeamAvatar name={team.name} logoUrl={team.logoUrl} size={40} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{team.name}</p>
                    <p className="text-[11px] text-slate-500">{team.teamType}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-nch-600">View →</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ----------------------- NPL SECTION ----------------------- */}
      <section aria-label="Nepal Premier League">
        <SectionHeader title="Nepal Premier League" href="/npl" />
        <div className="card overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nch-600 to-nch-navy-800 font-display text-xl font-black text-white">
                  NPL
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900">{nplSeries?.name ?? 'Nepal Premier League'}</h3>
                  <p className="text-xs text-slate-500">T20 · Franchise cricket · Nepal</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/npl" className="btn-primary">NPL Home</Link>
                <Link href="/matches?series=nepal-premier-league-2025" className="btn-secondary">Fixtures & Results</Link>
                <Link href="/points-table?series=nepal-premier-league-2025" className="btn-secondary">Points Table</Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {nplTeams.slice(0, 8).map((team) => (
                  <Link
                    key={team.externalId}
                    href={`/teams/${team.slug}`}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <TeamAvatar name={team.name} size={22} />
                    {team.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-6">
              <h4 className="mb-3 text-sm font-black uppercase tracking-wider text-slate-500">Points Standings</h4>
              <PointsTable rows={(points ?? []).slice(0, 8)} />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------- LATEST NEWS ----------------------- */}
      <section aria-label="Latest Nepal cricket news">
        <SectionHeader title="Latest Nepal Cricket News" href="/news" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((item) => <NewsCard key={item.slug} item={item} />)}
        </div>
      </section>

      {/* ----------------------- PLAYERS ----------------------- */}
      <section aria-label="Player highlights">
        <SectionHeader title="Player Highlights" href="/players" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {nepalPlayers.map((player) => (
            <PlayerCard key={player.externalId} player={player} />
          ))}
        </div>
      </section>

      {/* ----------------------- STATS ----------------------- */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-label="Top run scorers">
          <SectionHeader title="Top Run Scorers" href="/npl#stats" />
          <StatsList rows={(topRuns ?? []).map((r) => ({ ...r, value: String(r.runs), sub: `${r.matches} matches · SR ${r.strikeRate}` }))} accent="runs" />
        </section>
        <section aria-label="Top wicket takers">
          <SectionHeader title="Top Wicket Takers" href="/npl#stats" />
          <StatsList rows={(topWickets ?? []).map((w) => ({ ...w, value: String(w.wickets), sub: `${w.matches} matches · Econ ${w.economy}` }))} accent="wickets" />
        </section>
      </div>

      <AdSlot slot="home_bottom" />

      {/* ----------------------- VIDEOS ----------------------- */}
      {displayVideos.length > 0 && (
        <section aria-label="Cricket videos">
          <SectionHeader title="Cricket Videos" href="/videos" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayVideos.slice(0, 3).map((video) => (
              <a
                key={video.id}
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="card card-hover group block overflow-hidden"
              >
                <div className="relative aspect-video bg-slate-100">
                  {video.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900">
                      <span className="text-4xl text-white/30">▶</span>
                    </div>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-nch-600/90 text-white shadow-lg transition-transform group-hover:scale-110">
                      <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-nch-600">{video.category}</p>
                  <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold text-slate-900 group-hover:text-nch-600">
                    {video.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="card p-6 text-center text-sm text-slate-500">{message}</div>
  );
}

function ScheduleTable({ matches }: { matches: Array<{ externalId: string; name: string; startTime: string; venue: string; status: string; matchState?: string }> }) {
  if (!matches.length) {
    return (
      <div className="card p-6 text-center text-sm text-slate-500">
        No upcoming fixtures scheduled yet.
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <ul className="divide-y divide-slate-100">
        {matches.map((m) => (
          <li key={m.externalId}>
            <Link href={`/matches/${m.externalId}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{m.name}</p>
                <p className="truncate text-xs text-slate-500">{m.venue}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-slate-700">{formatDateTime(m.startTime)}</p>
                <p className="text-[11px] text-slate-400">{m.matchState ?? formatDate(m.startTime)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatsList({
  rows,
  accent,
}: {
  rows: Array<{ player: string; slug?: string; value: string; sub: string; country?: string }>;
  accent: 'runs' | 'wickets';
}) {
  if (!rows.length) return null;
  return (
    <div className="card divide-y divide-slate-100 overflow-hidden">
      {rows.map((row, i) => (
        <Link key={`${row.player}-${i}`} href={`/players/${row.slug ?? ''}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-black text-slate-600">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{row.player}</p>
            <p className="truncate text-xs text-slate-500">{row.sub}</p>
          </div>
          <span className={`text-lg font-black tabular-nums ${accent === 'runs' ? 'text-nch-600' : 'text-emerald-700'}`}>
            {row.value}
          </span>
        </Link>
      ))}
    </div>
  );
}
