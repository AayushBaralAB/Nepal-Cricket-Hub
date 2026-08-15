import axios from 'axios';
import {
  CricketMatch, CricketPlayer, CricketSeries, CricketTeam, PointsRow,
} from '../../types/cricket';
import { CricketProvider } from '../CricketService';
import { slugify, safeInt, safeNum } from '../../utils/helpers';
import { config } from '../../config';
import { logger } from '../../utils/logger';

/**
 * Generic REST cricket API adapter.
 *
 * Designed to be pointed at a CricAPI-style REST API (apiKey auth) and mapped
 * to our domain types. Endpoint paths and field mapping can be tuned without
 * touching the frontend. If any upstream call fails we throw, and the caller
 * (CricketDataService) falls back to the last known-good data.
 */
export class HttpCricketProvider implements CricketProvider {
  readonly name = 'http';

  private client = axios.create({
    baseURL: config.cricket.apiBaseUrl,
    timeout: 15000,
    headers: config.cricket.apiKey
      ? { 'x-api-key': config.cricket.apiKey, Authorization: `Bearer ${config.cricket.apiKey}` }
      : {},
  });

  isConfigured(): boolean {
    return Boolean(config.cricket.apiBaseUrl);
  }

  private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const res = await this.client.get<T>(path, { params });
    return res.data;
  }

  private unwrapList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    const rec = data as Record<string, unknown>;
    for (const key of ['data', 'results', 'items', 'matches', 'series']) {
      const v = rec?.[key];
      if (Array.isArray(v)) return v as T[];
    }
    return [];
  }

  async getLiveMatches(): Promise<CricketMatch[]> {
    const raw = await this.get<unknown[]>('/matches/live');
    return this.unwrapList<Record<string, unknown>>(raw).map((m) => this.mapMatch(m));
  }

  async getMatch(matchId: string): Promise<CricketMatch | null> {
    try {
      const raw = await this.get<Record<string, unknown>>(`/matches/${matchId}`);
      return this.mapMatch(raw);
    } catch {
      return null;
    }
  }

  async getUpcomingMatches(): Promise<CricketMatch[]> {
    const raw = await this.get<unknown[]>('/matches/upcoming');
    return this.unwrapList<Record<string, unknown>>(raw).map((m) => this.mapMatch(m));
  }

  async getCompletedMatches(limit = 12): Promise<CricketMatch[]> {
    const raw = await this.get<unknown[]>('/matches/completed', { limit: String(limit) });
    return this.unwrapList<Record<string, unknown>>(raw).map((m) => this.mapMatch(m));
  }

  async getMatchesByDate(date: string): Promise<CricketMatch[]> {
    const raw = await this.get<unknown[]>('/matches', { date });
    return this.unwrapList<Record<string, unknown>>(raw).map((m) => this.mapMatch(m));
  }

  async getSeries(): Promise<CricketSeries[]> {
    const raw = await this.get<unknown[]>('/series');
    return this.unwrapList<Record<string, unknown>>(raw).map((s) => ({
      externalId: String(s.id ?? s.externalId ?? ''),
      name: String(s.name ?? ''),
      slug: String(s.slug ?? slugify(String(s.name ?? ''))),
      type: String(s.type ?? 'International'),
      category: String(s.category ?? 'International'),
      startDate: s.startDate ? String(s.startDate).slice(0, 10) : undefined,
      endDate: s.endDate ? String(s.endDate).slice(0, 10) : undefined,
      season: s.season ? String(s.season) : undefined,
      status: s.status ? String(s.status) : undefined,
      pointsTableAvailable: Boolean(s.pointsTableAvailable),
    }));
  }

  async getPointsTable(seriesId: string): Promise<PointsRow[]> {
    const raw = await this.get<unknown[]>(`/series/${seriesId}/points-table`);
    return this.unwrapList<Record<string, unknown>>(raw).map((r) => ({
      teamId: String(r.teamId ?? r.team_id ?? ''),
      teamName: String(r.teamName ?? r.team_name ?? ''),
      shortName: String(r.shortName ?? r.short_name ?? ''),
      slug: String(r.slug ?? slugify(String(r.teamName ?? ''))),
      logoUrl: r.logoUrl ? String(r.logoUrl) : undefined,
      matches: safeInt(r.matches ?? r.m, 0),
      wins: safeInt(r.wins ?? r.w, 0),
      losses: safeInt(r.losses ?? r.l, 0),
      noResult: safeInt(r.noResult ?? r.nr ?? r.no_result, 0),
      ties: safeInt(r.ties ?? r.t, 0),
      points: safeNum(r.points ?? r.pts ?? r.p, 0),
      netRunRate: safeNum(r.netRunRate ?? r.nrr ?? r.net_run_rate, 0),
      position: safeInt(r.position ?? r.pos, 0),
    }));
  }

  async getPlayers(): Promise<CricketPlayer[]> {
    const raw = await this.get<unknown[]>('/players');
    return this.unwrapList<Record<string, unknown>>(raw).map((p) => ({
      externalId: String(p.id ?? p.externalId ?? ''),
      name: String(p.name ?? p.fullName ?? ''),
      slug: String(p.slug ?? slugify(String(p.name ?? ''))),
      fullName: p.fullName ? String(p.fullName) : undefined,
      photoUrl: p.photoUrl ? String(p.photoUrl) : undefined,
      country: p.country ? String(p.country) : 'Nepal',
      role: p.role ? String(p.role) : 'Batter',
      battingStyle: p.battingStyle ? String(p.battingStyle) : undefined,
      bowlingStyle: p.bowlingStyle ? String(p.bowlingStyle) : undefined,
      teamId: p.teamId ? String(p.teamId) : undefined,
    }));
  }

  async getTeams(): Promise<CricketTeam[]> {
    const raw = await this.get<unknown[]>('/teams');
    return this.unwrapList<Record<string, unknown>>(raw).map((t) => ({
      externalId: String(t.id ?? t.externalId ?? ''),
      name: String(t.name ?? ''),
      shortName: String(t.shortName ?? t.short_name ?? ''),
      slug: String(t.slug ?? slugify(String(t.name ?? ''))),
      logoUrl: t.logoUrl ? String(t.logoUrl) : undefined,
      country: t.country ? String(t.country) : undefined,
      teamType: t.teamType ? String(t.teamType) : undefined,
      isNational: Boolean(t.isNational),
    }));
  }

  /** Best-effort mapping from common cricket API match schemas to our domain. */
  private mapMatch(m: Record<string, unknown>): CricketMatch {
    const teams = Array.isArray(m.teams) ? (m.teams as Record<string, unknown>[]) : [];
    const teamInfo = Array.isArray(m.teamInfo) ? (m.teamInfo as Record<string, unknown>[]) : [];
    const homeRaw = (m.homeTeam ?? teamInfo[0] ?? teams[0]) as Record<string, unknown> | undefined;
    const awayRaw = (m.awayTeam ?? teamInfo[1] ?? teams[1]) as Record<string, unknown> | undefined;
    const homeName = String(homeRaw?.name ?? homeRaw?.shortname ?? 'Home');
    const awayName = String(awayRaw?.name ?? awayRaw?.shortname ?? 'Away');
    const scoreArr = Array.isArray(m.score ?? m.scores) ? (m.score ?? m.scores) as Record<string, unknown>[] : [];
    const homeScoreRaw = scoreArr[0] ?? ((m.score ?? m.scores) as Record<string, unknown> | undefined);
    const awayScoreRaw = scoreArr[1] ?? undefined;

    let status: CricketMatch['status'] = 'upcoming';
    const rawStatus = String(m.status ?? m.state ?? '');
    if (/live|in progress/i.test(rawStatus)) status = 'live';
    else if (/complete|finished|done|result/i.test(rawStatus)) status = 'completed';
    else if (/abandon/i.test(rawStatus)) status = 'abandoned';
    else if (/cancel/i.test(rawStatus)) status = 'cancelled';

    return {
      externalId: String(m.id ?? m.matchId ?? ''),
      name: m.name ? String(m.name) : `${homeName} vs ${awayName}`,
      slug: m.slug ? String(m.slug) : slugify(`${homeName} vs ${awayName}`),
      seriesId: m.seriesId ? String(m.seriesId) : undefined,
      seriesName: m.seriesName ? String(m.seriesName) : undefined,
      seriesSlug: m.seriesSlug ? String(m.seriesSlug) : undefined,
      matchType: (String(m.matchType ?? m.matchtype ?? 'T20').toUpperCase() as CricketMatch['matchType']) || 'T20',
      homeTeamId: String(homeRaw?.id ?? ''),
      homeTeam: homeName,
      homeTeamShort: String(homeRaw?.shortname ?? homeName.slice(0, 3).toUpperCase()),
      homeTeamSlug: slugify(homeName),
      awayTeamId: String(awayRaw?.id ?? ''),
      awayTeam: awayName,
      awayTeamShort: String(awayRaw?.shortname ?? awayName.slice(0, 3).toUpperCase()),
      awayTeamSlug: slugify(awayName),
      venue: m.venue ? String(m.venue) : String((m.venueInfo as Record<string, unknown> | undefined)?.name ?? ''),
      city: m.city ? String(m.city) : undefined,
      startTime: String(m.startTime ?? m.matchTime ?? m.date ?? new Date().toISOString()),
      status,
      matchState: m.matchState ? String(m.matchState) : m.statusNote ? String(m.statusNote) : undefined,
      result: m.result ? String(m.result) : undefined,
      tossWinner: m.tossWinner ? String(m.tossWinner) : undefined,
      tossDecision: (m.tossDecision as 'bat' | 'bowl') ?? undefined,
      currentInnings: m.currentInnings ? safeInt(m.currentInnings, 0) : undefined,
      homeScore: homeScoreRaw ? `${safeInt(homeScoreRaw.runs ?? homeScoreRaw.r, 0)}/${safeInt(homeScoreRaw.wickets ?? homeScoreRaw.wkts, 0)}` : undefined,
      awayScore: awayScoreRaw ? `${safeInt(awayScoreRaw.runs ?? awayScoreRaw.r, 0)}/${safeInt(awayScoreRaw.wickets ?? awayScoreRaw.wkts, 0)}` : undefined,
      innings: [],
      commentary: [],
      isWomen: Boolean(m.isWomen ?? m.women),
      isU19: Boolean(m.isU19),
    };
  }
}
