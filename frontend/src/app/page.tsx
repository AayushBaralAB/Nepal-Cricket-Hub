import type { Metadata } from 'next';
import Link from 'next/link';
import {
  safeFetch,
  getLiveMatches,
  getUpcomingMatches,
  getResults,
  getNews,
  getSeries,
  getPointsTable,
  getTeams,
  getPlayers,
  getTopRunScorers,
  getTopWicketTakers,
  getVideos,
} from '@/lib/api';
import type { CricketMatch } from '@/lib/types';
import { formatDateTime, formatDate, formatTime } from '@/lib/format';
import { LiveStrip } from '@/components/match/LiveStrip';
import { MatchCard } from '@/components/match/MatchCard';
import { NewsCard } from '@/components/news/NewsCard';
import { PointsTable } from '@/components/PointsTable';
import { PlayerCard } from '@/components/players/PlayerCard';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AdSlot } from '@/components/ui/AdSlot';
import { LiveBadge } from '@/components/ui/Badges';
import { SocialFeed } from '@/components/social/SocialFeed';
import { NotificationManager } from '@/components/notifications/NotificationManager';
import { MatchCountdown } from '@/components/home/MatchCountdown';
import { CricwavesScoreBox, CricwavesStrip } from '@/components/live/LiveScoresWidget';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CricketHub — Live Scores, News & Stats for Nepal Cricket',
  description:
    'Live cricket scores, fixtures, results, automatic Nepal cricket news, NPL coverage, player statistics and points tables — all Nepal cricket in one hub.',
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
      safeFetch(getUpcomingMatches(10)),
      safeFetch(getResults(6)),
      safeFetch(getNews({ limit: 4 })),
      safeFetch(getNews({ limit: 8 })),
      safeFetch(getSeries()),
      safeFetch(getPointsTable(NEPAL_SERIES_SLUG)),
      safeFetch(getTeams()),
      safeFetch(getPlayers()),
      safeFetch(getTopRunScorers(5)),
      safeFetch(getTopWicketTakers(5)),
      safeFetch(getVideos()),
    ]);

  const featured = (featuredNews ?? []).slice(0, 4);
  const latest = (latestNews ?? []).slice(0, 8);
  const nplSeries = series?.find((s) => s.slug === NEPAL_SERIES_SLUG);
  const nepalTeams = (teams ?? []).filter(
    (t) => t.name.toLowerCase().includes('nepal') || t.country?.toLowerCase() === 'nepal',
  );
  const nplTeams = (teams ?? []).filter((t) => t.teamType === 'NPL');
  const schedule = (upcoming ?? []).slice(0, 6);
  const nepalUpcoming = (upcoming ?? []).filter(
    (m) => m.homeTeam?.toLowerCase() === 'nepal' || m.awayTeam?.toLowerCase() === 'nepal',
  );
  const next = (upcoming ?? []).find(
    (m) => m.homeTeam?.toLowerCase() === 'nepal' || m.awayTeam?.toLowerCase() === 'nepal',
  );
  const nepalPlayers = (players ?? []).filter((p) => p.country === 'Nepal').slice(0, 8);
  const displayVideos = videos ?? [];
  const hasLive = (live ?? []).length > 0;

  return (
    <div>
      {/* ───────────── LIVE SCORE TICKER (top) ───────────── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="container-nch py-2">
          <CricwavesStrip />
        </div>
      </div>

      {/* ───────────── HERO ───────────── */}
      <section aria-label="Welcome" className="bg-navy-gradient relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-nch-600/20 blur-2xl" />
          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-saffron-500/10 blur-2xl" />
          <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="container-nch relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
          <div className="animate-fade-in-up">
            <span className="overline-label !text-nch-300">
              <span className="bg-white/10 px-2 py-0.5">Welcome to CricketHub</span>
            </span>
            <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Live Scores.
              <span className="text-gradient-brand block pb-1">All Nepal Cricket.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Ball-by-ball international scores, Nepal fixtures, NPL coverage and
              player statistics — every ball, every boundary, all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/live" className="btn-primary !px-6 !py-3 !text-base">
                <span className="live-dot bg-white" /> {hasLive ? 'Watch Live' : 'Live Centre'}
              </Link>
              <Link href="/matches" className="btn-secondary !px-6 !py-3 !text-base">
                All Matches
              </Link>
            </div>
          </div>

          {next && (
            <div className="animate-fade-in-up [animation-delay:120ms]">
              <NextMatchTicket match={next} />
            </div>
          )}
        </div>
      </section>

      <div className="container-nch space-y-14 py-10 sm:py-12">
        {/* ───────────── LIVE SCORES HUB ───────────── */}
        <section aria-label="Live scores" className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="card overflow-hidden p-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="section-title !mb-0 text-sm">
                <LiveBadge /> Live Cricket Scores
              </h2>
            </div>
            <div className="flex justify-center overflow-hidden rounded-xl">
              <CricwavesScoreBox />
            </div>
            <p className="mt-2 px-1 text-[10px] leading-snug text-slate-400">
              Live scores provided by Cricwaves. Auto-refreshes during matches.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 id="live-nepal" className="section-title !mb-0">
                  <LiveBadge /> Nepal Live
                </h2>
                <Link href="/live" className="text-sm font-semibold text-nch-600 hover:text-nch-700">
                  Live centre →
                </Link>
              </div>
              <LiveStrip initial={live ?? []} />
            </div>

            {nepalUpcoming.length > 0 && (
              <div>
                <SectionHeader overline="Nepal" title="Upcoming Nepal Matches" href="/matches?nepal=true" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {nepalUpcoming.slice(0, 4).map((m) => <MatchCard key={m.externalId} match={m} />)}
                </div>
              </div>
            )}

            <div>
              <SectionHeader overline="Results" title="Recent Results" href="/matches?status=completed" />
              {results?.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.slice(0, 6).map((m) => <MatchCard key={m.externalId} match={m} />)}
                </div>
              ) : (
                <div className="card p-6 text-center text-sm text-slate-500">No recent results yet.</div>
              )}
            </div>
          </div>
        </section>

        {/* ───────────── FEATURED NEWS ───────────── */}
        {featured.length > 0 && (
          <section aria-label="Featured news">
            <SectionHeader overline="News" title="Top Stories" href="/news" />
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <NewsCard item={featured[0]} featured />
              </div>
              <div className="grid gap-5">
                {featured.slice(1, 3).map((item) => (
                  <NewsCard key={item.slug} item={item} featured />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ───────────── AD ───────────── */}
        <AdSlot slot="home_top" />

        {/* ───────────── SCHEDULE + SIDEBAR ───────────── */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section aria-label="Upcoming matches">
              <SectionHeader overline="Fixtures" title="Upcoming Matches" href="/matches?status=upcoming" />
              {schedule.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {schedule.map((m) => <MatchCard key={m.externalId} match={m} />)}
                </div>
              ) : (
                <div className="card p-6 text-center text-sm text-slate-500">No upcoming matches found.</div>
              )}
            </section>

            <section aria-label="Nepal cricket schedule">
              <SectionHeader title="Nepal & Upcoming" href="/matches?nepal=true" />
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

        {/* ───────────── NPL ───────────── */}
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

        {/* ───────────── LATEST NEWS ───────────── */}
        <section aria-label="Latest Nepal cricket news">
          <SectionHeader overline="Latest" title="Latest Nepal Cricket News" href="/news" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((item) => <NewsCard key={item.slug} item={item} />)}
          </div>
        </section>

        {/* ───────────── PLAYERS ───────────── */}
        <section aria-label="Player highlights">
          <SectionHeader overline="Players" title="Player Highlights" href="/players" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {nepalPlayers.map((player) => (
              <PlayerCard key={player.externalId} player={player} />
            ))}
          </div>
        </section>

        {/* ───────────── STATS ───────────── */}
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

        {/* ───────────── VIDEOS ───────────── */}
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

        {/* ───────────── SOCIAL FEED ───────────── */}
        <section aria-label="Social media">
          <SectionHeader title="Follow Nepal Cricket" />
          <SocialFeed />
        </section>

        {/* ───────────── NOTIFICATIONS ───────────── */}
        <section aria-label="Notifications" className="card p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-slate-900">Never Miss a Nepal Match</h3>
              <p className="mt-1 text-sm text-slate-600">
                Enable notifications to get live score alerts and match reminders for Nepal cricket.
              </p>
            </div>
            <NotificationManager />
          </div>
        </section>
      </div>
    </div>
  );
}

function NextMatchTicket({ match }: { match: CricketMatch }) {
  const day = new Date(match.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="animate-float relative mx-auto w-full max-w-md">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-nch-500/60 via-emerald-400/30 to-saffron-500/40 blur-xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between">
          <span className="chip bg-nch-600 text-white shadow-glow-red">
            <span className="live-dot bg-white" /> Next Match
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">
            {match.matchType ?? 'International'}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2">
            <TeamAvatar name={match.homeTeam ?? 'Home'} size={64} />
            <span className="text-xs font-black text-white">{match.homeTeamShort ?? match.homeTeam}</span>
          </div>
          <div className="text-center">
            <p className="font-display text-xs font-black uppercase tracking-widest text-saffron-400">vs</p>
            <p className="mt-1 text-xs font-bold text-white/70">{day}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TeamAvatar name={match.awayTeam ?? 'Away'} size={64} />
            <span className="text-xs font-black text-white">{match.awayTeamShort ?? match.awayTeam}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2.5">
            <p className="truncate text-sm font-black text-white">{match.homeTeamShort ?? match.homeTeam}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Home</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2.5">
            <p className="truncate text-sm font-black text-white">{match.awayTeamShort ?? match.awayTeam}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Away</p>
          </div>
        </div>

        <div className="my-6 border-t border-dashed border-white/15" />

        <MatchCountdown startTime={match.startTime} label="Starts in" />

        <div className="mt-5 flex items-center justify-between text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {[match.venue, match.city].filter(Boolean).join(' · ')}
          </span>
          <span className="font-semibold text-white/80">{formatTime(match.startTime)}</span>
        </div>

        <Link href={`/matches/${match.externalId}`} className="btn-primary mt-6 w-full justify-center">
          Match Centre →
        </Link>
      </div>
    </div>
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