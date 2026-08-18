import axios from 'axios';
import {
  CricketMatch, CricketPlayer, CricketSeries, CricketTeam, PointsRow,
} from '../../types/cricket';
import { CricketProvider } from '../CricketService';
import { slugify, safeInt, nowIso } from '../../utils/helpers';
import { logger } from '../../utils/logger';

const NEPAL_KEYWORDS = ['nepal', 'nep', 'npl', 'can'];

function isNepalMatch(m: CricketMatch): boolean {
  const haystack = `${m.homeTeam} ${m.awayTeam} ${m.seriesName ?? ''} ${m.name}`.toLowerCase();
  return NEPAL_KEYWORDS.some((k) => haystack.includes(k));
}

/**
 * Cricbuzz data provider.
 *
 * Fetches live scores, fixtures and results from Cricbuzz's public API
 * endpoints. The response is mapped to our domain types. If any upstream
 * call fails the caller falls back to cached data.
 */
export class CricbuzzProvider implements CricketProvider {
  readonly name = 'cricbuzz';

  private client = axios.create({
    baseURL: 'https://www.cricbuzz.com/api',
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, text/html, */*',
      Referer: 'https://www.cricbuzz.com/',
    },
  });

  isConfigured(): boolean {
    return true; // Cricbuzz is always available (no API key needed)
  }

  /* ------------------------------------------------------------------ */

  async getLiveMatches(): Promise<CricketMatch[]> {
    try {
      const data = await this.fetchHomepage();
      return data.filter((m) => m.status === 'live');
    } catch (err) {
      logger.warn('cricbuzz', 'Failed to fetch live matches', err);
      return [];
    }
  }

  async getMatch(matchId: string): Promise<CricketMatch | null> {
    try {
      const res = await this.client.get(`/cricket-match/commentary/${matchId}`);
      return this.parseCommentary(res.data, matchId);
    } catch {
      return null;
    }
  }

  async getUpcomingMatches(): Promise<CricketMatch[]> {
    try {
      const data = await this.fetchHomepage();
      return data.filter((m) => m.status === 'upcoming');
    } catch (err) {
      logger.warn('cricbuzz', 'Failed to fetch upcoming matches', err);
      return [];
    }
  }

  async getCompletedMatches(limit = 12): Promise<CricketMatch[]> {
    try {
      const data = await this.fetchHomepage();
      return data.filter((m) => m.status === 'completed').slice(0, limit);
    } catch (err) {
      logger.warn('cricbuzz', 'Failed to fetch completed matches', err);
      return [];
    }
  }

  async getMatchesByDate(date: string): Promise<CricketMatch[]> {
    try {
      const data = await this.fetchHomepage();
      const day = date.slice(0, 10);
      return data.filter((m) => m.startTime?.slice(0, 10) === day);
    } catch {
      return [];
    }
  }

  async getSeries(): Promise<CricketSeries[]> {
    try {
      const data = await this.fetchHomepage();
      const seriesMap = new Map<string, CricketSeries>();
      for (const m of data) {
        if (m.seriesId && !seriesMap.has(m.seriesId)) {
          seriesMap.set(m.seriesId, {
            externalId: m.seriesId,
            name: m.seriesName ?? 'Unknown Series',
            slug: slugify(m.seriesName ?? 'unknown'),
            type: 'League',
            category: 'International',
            status: m.status === 'completed' ? 'completed' : 'live',
            pointsTableAvailable: false,
          });
        }
      }
      return Array.from(seriesMap.values());
    } catch (err) {
      logger.warn('cricbuzz', 'Failed to fetch series', err);
      return [];
    }
  }

  async getPointsTable(_seriesId: string): Promise<PointsRow[]> {
    return [];
  }

  async getPlayers(): Promise<CricketPlayer[]> {
    return [];
  }

  async getTeams(): Promise<CricketTeam[]> {
    return [];
  }

  /** Get matches specifically involving Nepal. */
  async getNepalMatches(): Promise<CricketMatch[]> {
    try {
      // First try the Nepal-specific schedule endpoint
      const scheduleMatches = await this.fetchNepalSchedule().catch(() => []);
      if (scheduleMatches.length) return scheduleMatches;

      // Fallback to homepage filtering
      const data = await this.fetchHomepage();
      return data.filter(isNepalMatch);
    } catch (err) {
      logger.warn('cricbuzz', 'Failed to fetch Nepal matches', err);
      return [];
    }
  }

  /**
   * Fetch Nepal's schedule from Cricbuzz's team schedule endpoint.
   * Nepal team ID on Cricbuzz is 72.
   */
  private async fetchNepalSchedule(): Promise<CricketMatch[]> {
    try {
      const res = await this.client.get('/html/schedule/nepal-72/schedule');
      const body = res.data;

      if (typeof body === 'string') {
        return this.parseHtmlMatches(body);
      }
      return this.parseJsonHomepage(body);
    } catch (err) {
      logger.warn('cricbuzz', 'Failed to fetch Nepal schedule', err);
      return [];
    }
  }

  /* ------------------------------------------------------------------ internal */

  /**
   * Fetch the Cricbuzz homepage-scag endpoint which returns a JSON array of
   * match-type groups, each containing series with match objects.
   */
  private async fetchHomepage(): Promise<CricketMatch[]> {
    const res = await this.client.get('/html/homepage-scag');
    const body = res.data;

    // The endpoint may return HTML or JSON depending on Accept header
    if (typeof body === 'string') {
      return this.parseHtmlMatches(body);
    }
    return this.parseJsonHomepage(body);
  }

  /** Parse the JSON format returned when Accept: application/json is sent. */
  private parseJsonHomepage(body: unknown): CricketMatch[] {
    const matches: CricketMatch[] = [];
    const typeMatches = Array.isArray((body as Record<string, unknown>)?.typeMatches)
      ? (body as Record<string, unknown>).typeMatches as Record<string, unknown>[]
      : [];

    for (const typeGroup of typeMatches) {
      const seriesMatches = Array.isArray(typeGroup.seriesMatches)
        ? typeGroup.seriesMatches as Record<string, unknown>[]
        : [];

      for (const seriesMatch of seriesMatches) {
        const series = (seriesMatch.series ?? {}) as Record<string, unknown>;
        const seriesId = String(series.seriesId ?? '');
        const seriesName = String(series.seriesName ?? '');

        const matchArr = Array.isArray(seriesMatch.matches)
          ? seriesMatch.matches as Record<string, unknown>[]
          : [];

        for (const raw of matchArr) {
          const info = (raw.matchInfo ?? raw) as Record<string, unknown>;
          const match = this.mapCricbuzzMatch(info, seriesId, seriesName);
          if (match) matches.push(match);
        }
      }
    }
    return matches;
  }

  /** Fallback: scrape match links from the HTML response. */
  private parseHtmlMatches(html: string): CricketMatch[] {
    const matches: CricketMatch[] = [];
    // Match links like /cricket-match/live-scores/india-vs-australia-1st-t20i-2026-12345
    const regex = /href="\/cricket-match\/[^"]*?(\d{5,})"[^>]*>/g;
    const seenIds = new Set<string>();
    let m: RegExpExecArray | null;

    while ((m = regex.exec(html)) !== null) {
      const matchId = m[1];
      if (seenIds.has(matchId)) continue;
      seenIds.add(matchId);

      // Try to extract surrounding text for team names
      const context = html.slice(Math.max(0, m.index - 200), m.index + 200);
      const teamMatch = context.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s*(?:vs?\.?|v)\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);

      const home = teamMatch ? teamMatch[1] : 'Home';
      const away = teamMatch ? teamMatch[2] : 'Away';

      matches.push({
        externalId: `cb-${matchId}`,
        name: `${home} vs ${away}`,
        slug: slugify(`${home} vs ${away}`),
        matchType: 'T20',
        homeTeamId: '',
        homeTeam: home,
        homeTeamShort: home.slice(0, 3).toUpperCase(),
        homeTeamSlug: slugify(home),
        awayTeamId: '',
        awayTeam: away,
        awayTeamShort: away.slice(0, 3).toUpperCase(),
        awayTeamSlug: slugify(away),
        venue: '',
        startTime: new Date().toISOString(),
        status: 'upcoming',
        innings: [],
        commentary: [],
      });
    }
    return matches;
  }

  private mapCricbuzzMatch(
    info: Record<string, unknown>,
    seriesId: string,
    seriesName: string,
  ): CricketMatch | null {
    const matchId = String(info.matchId ?? info.id ?? '');
    if (!matchId) return null;

    const team1 = (info.team1 ?? {}) as Record<string, unknown>;
    const team2 = (info.team2 ?? {}) as Record<string, unknown>;
    const homeName = String(team1.teamName ?? team1.name ?? team1.shortName ?? 'Home');
    const awayName = String(team2.teamName ?? team2.name ?? team2.shortName ?? 'Away');
    const homeShort = String(team1.shortName ?? homeName.slice(0, 3).toUpperCase());
    const awayShort = String(team2.shortName ?? awayName.slice(0, 3).toUpperCase());

    let status: CricketMatch['status'] = 'upcoming';
    const rawStatus = String(info.matchStatus ?? info.status ?? '').toLowerCase();
    if (rawStatus.includes('live') || rawStatus.includes('progress')) status = 'live';
    else if (rawStatus.includes('complete') || rawStatus.includes('finished') || rawStatus.includes('result')) status = 'completed';
    else if (rawStatus.includes('abandon')) status = 'abandoned';

    const score = (info.matchScore ?? {}) as Record<string, unknown>;
    const team1Score = (score.team1Score ?? {}) as Record<string, unknown>;
    const team2Score = (score.team2Score ?? {}) as Record<string, unknown>;
    const innings1 = (team1Score.inngs1 ?? {}) as Record<string, unknown>;
    const innings2 = (team2Score.inngs1 ?? {}) as Record<string, unknown>;

    const homeScore = innings1.totalScore
      ? `${innings1.totalScore}/${innings1.totalWicket ?? 0} (${innings1.overs ?? 0} ov)`
      : undefined;
    const awayScore = innings2.totalScore
      ? `${innings2.totalScore}/${innings2.totalWicket ?? 0} (${innings2.overs ?? 0} ov)`
      : undefined;

    const venue = String(info.venueName ?? info.venue ?? '');
    const matchDesc = String(info.matchDescription ?? '');
    const matchFormat = String(info.matchFormat ?? 'T20').toUpperCase();

    return {
      externalId: `cb-${matchId}`,
      name: matchDesc || `${homeName} vs ${awayName}`,
      slug: slugify(matchDesc || `${homeName} vs ${awayName}`),
      seriesId: seriesId ? `cb-${seriesId}` : undefined,
      seriesName: seriesName || undefined,
      matchType: (matchFormat as CricketMatch['matchType']) || 'T20',
      homeTeamId: String(team1.teamId ?? ''),
      homeTeam: homeName,
      homeTeamShort: homeShort,
      homeTeamSlug: slugify(homeName),
      awayTeamId: String(team2.teamId ?? ''),
      awayTeam: awayName,
      awayTeamShort: awayShort,
      awayTeamSlug: slugify(awayName),
      venue,
      startTime: String(info.matchStartTimestamp ?? info.startDate ?? new Date().toISOString()),
      status,
      matchState: String(info.statusNote ?? ''),
      result: info.result ? String(info.result) : undefined,
      tossWinner: info.tossWinner ? String(info.tossWinner) : undefined,
      tossDecision: info.tossDecision ? String(info.tossDecision) as 'bat' | 'bowl' : undefined,
      currentInnings: safeInt(info.currentInnings, 0) || undefined,
      homeScore,
      awayScore,
      innings: [],
      commentary: [],
    };
  }

  private parseCommentary(data: unknown, matchId: string): CricketMatch | null {
    const body = data as Record<string, unknown>;
    const matchInfo = (body.matchInfo ?? body) as Record<string, unknown>;
    return this.mapCricbuzzMatch(matchInfo, '', '');
  }
}
