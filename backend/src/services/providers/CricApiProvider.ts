import axios from 'axios';
import {
  CricketMatch, CricketPlayer, CricketSeries, CricketTeam, PointsRow, InningsData,
} from '../../types/cricket';
import { CricketProvider } from '../CricketService';
import { slugify, safeInt, safeNum } from '../../utils/helpers';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const PAGE_SIZE = 25;

interface CricScore {
  r?: number;
  w?: number;
  o?: number;
  inning?: string;
}

interface CricRawMatch extends Record<string, unknown> {
  id?: string;
  name?: string;
  matchType?: string;
  status?: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  teamInfo?: Array<{ name?: string; shortname?: string; img?: string }>;
  score?: CricScore[];
  tossWinner?: string;
  tossChoice?: string;
  matchWinner?: string;
  matchStarted?: boolean;
  matchEnded?: boolean;
  series_id?: string;
  fantasyEnabled?: boolean;
}

interface CricRawSeries extends Record<string, unknown> {
  id?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  odi?: number;
  t20?: number;
  test?: number;
  squads?: number;
  matches?: number;
}

interface CricRawPlayer extends Record<string, unknown> {
  id?: string;
  name?: string;
  country?: string;
}

/**
 * CricAPI v1 adapter (https://api.cricapi.com).
 *
 * Auth is via the `apikey` query parameter. Pagination is offset-based with a
 * fixed page size of 25. `series_info` / `match_info` responses return a single
 * object in `data`; list endpoints return an array. CricAPI has no dedicated
 * points-table endpoint, so getPointsTable returns an empty list.
 */
export class CricApiProvider implements CricketProvider {
  readonly name = 'cricapi';

  private readonly baseUrl = config.cricket.apiBaseUrl || 'https://api.cricapi.com/v1';
  private readonly apiKey = config.cricket.apiKey;

  private seriesNameCache = new Map<string, string>();

  private client = axios.create({ baseURL: this.baseUrl, timeout: 20000 });

  // CricAPI bills per hit, and several list endpoints overlap. Memoize
  // responses briefly so a single sync doesn't call the same endpoint twice.
  private requestCache = new Map<string, { at: number; value: unknown }>();
  private readonly cacheTtlMs = 90_000;

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).map(
        ([k, v]) => [k, String(v)] as [string, string],
      ),
    ).toString();
    const key = `${path}?${query}`;
    const hit = this.requestCache.get(key);
    if (hit && Date.now() - hit.at < this.cacheTtlMs) return hit.value as T;

    const res = await this.client.get<{ status?: string; data?: T; error?: string }>(path, {
      params: { apikey: this.apiKey, ...(params ?? {}) },
    });
    const body = res.data;
    if (body.status === 'failure') {
      throw new Error(body.error ?? 'CricAPI request failed');
    }
    this.requestCache.set(key, { at: Date.now(), value: body.data });
    return body.data as T;
  }

  /** Fetch list pages until fewer than a full page is returned or maxPages reached. */
  private async fetchList<T>(path: string, maxPages = 1): Promise<T[]> {
    const out: T[] = [];
    for (let page = 0; page < maxPages; page += 1) {
      const data = await this.get<T[]>(path, { offset: page * PAGE_SIZE });
      if (!Array.isArray(data)) break;
      out.push(...data);
      if (data.length < PAGE_SIZE) break;
    }
    return out;
  }

  /* ---------------------------------------------------------------- series */

  async getSeries(): Promise<CricketSeries[]> {
    const raw = await this.fetchList<CricRawSeries>('/series', 2);
    for (const s of raw) {
      if (s.id && s.name) this.seriesNameCache.set(String(s.id), String(s.name));
    }
    return raw.map((s) => ({
      externalId: String(s.id ?? ''),
      name: String(s.name ?? ''),
      slug: slugify(String(s.name ?? '')),
      type: 'International',
      category: 'International',
      startDate: s.startDate ? String(s.startDate).slice(0, 10) : undefined,
      endDate: s.endDate ? String(s.endDate).slice(0, 10) : undefined,
      status: 'upcoming',
      pointsTableAvailable: false,
    }));
  }

  /* ---------------------------------------------------------------- matches */

  async getLiveMatches(): Promise<CricketMatch[]> {
    const raw = await this.fetchList<CricRawMatch>('/currentMatches', 1);
    return raw.map((m) => this.mapMatch(m)).filter((m) => m.status === 'live');
  }

  async getUpcomingMatches(): Promise<CricketMatch[]> {
    const current = (await this.fetchList<CricRawMatch>('/currentMatches', 1))
      .map((m) => this.mapMatch(m))
      .filter((m) => m.status === 'upcoming');
    if (current.length >= 6) return current;
    const more = (await this.fetchList<CricRawMatch>('/matches', 3))
      .map((m) => this.mapMatch(m))
      .filter((m) => m.status === 'upcoming');
    return [...current, ...more];
  }

  async getCompletedMatches(limit = 12): Promise<CricketMatch[]> {
    const current = (await this.fetchList<CricRawMatch>('/currentMatches', 1))
      .map((m) => this.mapMatch(m))
      .filter((m) => m.status === 'completed');
    const more = (await this.fetchList<CricRawMatch>('/matches', 4))
      .map((m) => this.mapMatch(m))
      .filter((m) => m.status === 'completed');
    return [...current, ...more]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async getMatchesByDate(date: string): Promise<CricketMatch[]> {
    const day = date.slice(0, 10);
    const list = await this.fetchList<CricRawMatch>('/currentMatches', 2);
    return list.map((m) => this.mapMatch(m)).filter((m) => m.startTime.slice(0, 10) === day);
  }

  async getMatch(matchId: string): Promise<CricketMatch | null> {
    try {
      const data = await this.get<CricRawMatch>('/match_info', { id: matchId });
      if (!data?.id) return null;
      return this.mapMatch(data);
    } catch (err) {
      logger.warn('cricapi', `match_info failed for ${matchId}`, err);
      return null;
    }
  }

  /* ------------------------------------------------------------ players/teams */

  async getPlayers(): Promise<CricketPlayer[]> {
    const out: CricketPlayer[] = [];
    const seen = new Set<string>();
    let nepalCount = 0;
    for (let page = 0; page < 6; page += 1) {
      const data = await this.get<CricRawPlayer[]>('/players', { offset: page * PAGE_SIZE });
      if (!Array.isArray(data) || !data.length) break;
      for (const p of data) {
        if (!p.name || !p.id) continue;
        const key = String(p.id);
        if (seen.has(key)) continue;
        seen.add(key);
        const country = p.country ? String(p.country) : 'Nepal';
        out.push({
          externalId: key,
          name: String(p.name),
          slug: slugify(String(p.name)),
          country,
          role: 'Batter',
        });
        if (country === 'Nepal') nepalCount += 1;
      }
      if (data.length < PAGE_SIZE) break;
      // Stop early once we have a healthy Nepal roster (they sort deep alphabetically).
      if (nepalCount >= 20) break;
    }
    out.sort((a, b) => {
      const aNepal = a.country === 'Nepal' ? 0 : 1;
      const bNepal = b.country === 'Nepal' ? 0 : 1;
      return aNepal - bNepal || a.name.localeCompare(b.name);
    });
    return out;
  }

  async getTeams(): Promise<CricketTeam[]> {
    // CricAPI has no teams endpoint — derive the team catalogue from matches.
    const current = await this.fetchList<CricRawMatch>('/currentMatches', 1);
    const matches = await this.fetchList<CricRawMatch>('/matches', 4);
    const map = new Map<string, CricketTeam>();

    const add = (name?: string, shortname?: string, img?: string) => {
      if (!name) return;
      const key = name.toLowerCase();
      if (map.has(key)) return;
      const slug = slugify(name);
      map.set(key, {
        externalId: slug,
        name,
        shortName: shortname ?? name.slice(0, 3).toUpperCase(),
        slug,
        logoUrl: img || undefined,
        country: name.toLowerCase() === 'nepal' ? 'Nepal' : undefined,
        isNational: name.toLowerCase() === 'nepal',
      });
    };

    for (const m of [...current, ...matches]) {
      if (Array.isArray(m.teamInfo)) {
        for (const t of m.teamInfo) add(t.name, t.shortname, t.img);
      }
      if (Array.isArray(m.teams)) {
        for (const t of m.teams) add(t);
      }
    }
    return [...map.values()];
  }

  async getPointsTable(_seriesId: string): Promise<PointsRow[]> {
    // CricAPI v1 does not expose points tables.
    return [];
  }

  /* ------------------------------------------------------------------ mapping */

  private mapMatch(m: CricRawMatch): CricketMatch {
    const teams = Array.isArray(m.teams) ? m.teams : [];
    const teamInfo = Array.isArray(m.teamInfo) ? m.teamInfo : [];
    const homeName = String(teams[0] ?? teamInfo[0]?.name ?? 'Home');
    const awayName = String(teams[1] ?? teamInfo[1]?.name ?? 'Away');

    const infoByName = new Map(teamInfo.map((t) => [String(t.name), t]));
    const homeInfo = infoByName.get(homeName);
    const awayInfo = infoByName.get(awayName);
    const homeShort = String(homeInfo?.shortname ?? homeName.slice(0, 3).toUpperCase());
    const awayShort = String(awayInfo?.shortname ?? awayName.slice(0, 3).toUpperCase());

    const rawType = String(m.matchType ?? 't20').toLowerCase();
    const matchType: CricketMatch['matchType'] =
      rawType === 'test' ? 'Test' : rawType === 'odi' ? 'ODI' : rawType === 't10' ? 'T10' : 'T20';

    const status = this.classifyStatus(m);

    const seriesName = m.series_id ? this.seriesNameCache.get(String(m.series_id)) : undefined;
    const startTime = m.dateTimeGMT
      ? new Date(m.dateTimeGMT).toISOString()
      : m.date
        ? `${String(m.date).slice(0, 10)}T00:00:00.000Z`
        : new Date().toISOString();

    const scores = this.aggregateScores(m.score ?? [], homeName, awayName);
    const innings = this.buildInnings(m.score ?? []);
    const matchLabel = `${m.name ?? ''} ${homeName} ${awayName}`;
    const isWomen = /women|\bwom\b/i.test(matchLabel);
    const isU19 = /u-?19|under-?19/i.test(matchLabel);

    return {
      externalId: String(m.id ?? ''),
      name: m.name ? String(m.name) : `${homeName} vs ${awayName}`,
      slug: slugify(String(m.name ?? `${homeName} vs ${awayName}`)),
      seriesId: m.series_id ? String(m.series_id) : undefined,
      seriesName,
      matchType,
      homeTeamId: homeName,
      homeTeam: homeName,
      homeTeamShort: homeShort,
      homeTeamSlug: slugify(homeName),
      awayTeamId: awayName,
      awayTeam: awayName,
      awayTeamShort: awayShort,
      awayTeamSlug: slugify(awayName),
      venue: m.venue ? String(m.venue) : '',
      startTime,
      status,
      matchState: m.status ? String(m.status) : undefined,
      result: status === 'completed' && m.status ? String(m.status) : undefined,
      tossWinner: m.tossWinner ? String(m.tossWinner) : undefined,
      tossDecision: m.tossChoice === 'bat' || m.tossChoice === 'bowl' ? m.tossChoice : undefined,
      homeScore: scores.home,
      awayScore: scores.away,
      innings,
      commentary: [],
      isWomen,
      isU19,
    };
  }

  private classifyStatus(m: CricRawMatch): CricketMatch['status'] {
    if (m.matchEnded === true) {
      return /abandon/i.test(String(m.status ?? '')) ? 'abandoned' : 'completed';
    }
    if (m.matchStarted === true) return 'live';
    const s = String(m.status ?? '');
    if (/abandon/i.test(s)) return 'abandoned';
    if (/cancel/i.test(s)) return 'cancelled';
    if (/won by|winner|drawn|match tied|result|super over|won the match/i.test(s)) return 'completed';
    if (/\d/.test(s) && /need|inning|in progress|lunch|tea|dinner|stumps|batter|bowler|overs? to/i.test(s)) {
      return 'live';
    }
    return 'upcoming';
  }

  private aggregateScores(
    arr: CricScore[],
    homeName: string,
    awayName: string,
  ): { home?: string; away?: string } {
    const acc: Record<string, { r: number; w: number }> = {};
    for (const s of arr) {
      const team = String(s.inning ?? '').split(' Inning')[0]?.trim();
      if (!team) continue;
      const entry = acc[team] ?? { r: 0, w: 0 };
      entry.r += safeInt(s.r, 0);
      entry.w += Math.min(safeInt(s.w, 0), 10);
      acc[team] = entry;
    }
    const fmt = (t: string): string | undefined => {
      const e = acc[t];
      if (!e || !arr.length) return undefined;
      return `${e.r}/${e.w}`;
    };
    const home = fmt(homeName) ?? fmt(String(arr[0]?.inning ?? '').split(' Inning')[0]?.trim());
    const away = fmt(awayName) ?? fmt(String(arr[1]?.inning ?? '').split(' Inning')[1]?.trim());
    return { home, away };
  }

  private buildInnings(arr: CricScore[]): InningsData[] {
    return arr
      .map((s, i) => {
        const label = String(s.inning ?? `Inning ${i + 1}`);
        const battingTeam = label.split(' Inning')[0]?.trim() || 'Unknown';
        const runs = safeInt(s.r, 0);
        const overs = safeNum(s.o, 0);
        return {
          inningsNumber: i + 1,
          battingTeam,
          runs,
          wickets: Math.min(safeInt(s.w, 0), 10),
          overs,
          runRate: overs > 0 ? runs / overs : 0,
          isCompleted: safeInt(s.w, 0) >= 10 || runs === 0,
        };
      })
      .filter((i) => i.runs > 0 || i.wickets > 0);
  }
}
