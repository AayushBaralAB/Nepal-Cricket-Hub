import { config } from '../config';
import { db } from '../db';
import { logger } from '../utils/logger';
import { slugify, nowIso } from '../utils/helpers';
import { CricketProvider } from './CricketService';
import { SampleCricketProvider } from './providers/SampleCricketProvider';
import { HttpCricketProvider } from './providers/HttpCricketProvider';
import { CricApiProvider } from './providers/CricApiProvider';
import { CricbuzzProvider } from './providers/CricbuzzProvider';
import {
  CricketMatch, CricketPlayer, CricketSeries, CricketTeam, PointsRow,
} from '../types/cricket';

export type MatchFilter = {
  status?: 'live' | 'upcoming' | 'completed' | string;
  type?: string;
  team?: string;
  series?: string;
  women?: boolean;
  u19?: boolean;
  nepal?: boolean;
  date?: string;
  limit?: number;
};

/**
 * Facade over cricket providers.
 *
 * Responsibilities:
 *  - pick the active provider from config
 *  - sync upstream data into MongoDB (durable store)
 *  - serve reads from an in-memory cache (the last-known-good snapshot)
 *  - never crash the API when the upstream provider fails — fall back to cache
 */
export class CricketDataService {
  private provider: CricketProvider;

  private cacheMatches: CricketMatch[] = [];
  private cacheTeams: CricketTeam[] = [];
  private cacheSeries: CricketSeries[] = [];
  private cachePlayers: CricketPlayer[] = [];
  private cachePoints = new Map<string, PointsRow[]>();

  lastSyncSuccessAt: Date | null = null;
  lastSyncAttemptAt: Date | null = null;
  lastSyncError: string | null = null;

  constructor() {
    this.provider =
      config.cricket.provider === 'http' ? new HttpCricketProvider()
      : config.cricket.provider === 'cricapi' ? new CricApiProvider()
      : config.cricket.provider === 'cricbuzz' ? new CricbuzzProvider()
      : new SampleCricketProvider();
    if (!this.provider.isConfigured()) {
      logger.warn('cricket', `Provider "${this.provider.name}" is not configured. Falling back to sample provider.`);
      this.provider = new SampleCricketProvider();
    }
    logger.info('cricket', `Active cricket provider: ${this.provider.name}`);
  }

  get activeProvider(): CricketProvider {
    return this.provider;
  }

  /* ---------------------------------------------------------------- reads */

  getMatches(filter: MatchFilter = {}): CricketMatch[] {
    let list = [...this.cacheMatches];

    if (filter.status) {
      if (filter.status === 'live') list = list.filter((m) => m.status === 'live');
      else if (filter.status === 'upcoming') list = list.filter((m) => m.status === 'upcoming');
      else if (filter.status === 'completed') list = list.filter((m) => m.status === 'completed');
    }
    if (filter.type) list = list.filter((m) => m.matchType === filter.type);
    if (filter.team) list = list.filter((m) => m.homeTeam === filter.team || m.awayTeam === filter.team);
    if (filter.series) list = list.filter((m) => m.seriesId === filter.series);
    if (filter.women) list = list.filter((m) => m.isWomen);
    if (filter.u19) list = list.filter((m) => m.isU19);
    if (filter.nepal) {
      list = list.filter((m) => m.homeTeam.toLowerCase() === 'nepal' || m.awayTeam.toLowerCase() === 'nepal' ||
        m.homeTeam.includes('Nepal') || m.awayTeam.includes('Nepal'));
    }
    if (filter.date) {
      const day = filter.date.slice(0, 10);
      list = list.filter((m) => (m.startTime ?? '').slice(0, 10) === day);
    }

    list.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    if (filter.limit && filter.limit > 0) list = list.slice(0, filter.limit);
    return list;
  }

  getMatchById(id: string): CricketMatch | null {
    return this.cacheMatches.find((m) => m.externalId === id) ?? null;
  }

  getMatchBySlug(slug: string): CricketMatch | null {
    return this.cacheMatches.find((m) => m.slug === slug) ?? null;
  }

  /** Insert a match (e.g. fetched on-demand) into the in-memory cache. */
  seedMatch(match: CricketMatch): void {
    this.upsertMatchIntoCache(match);
  }

  getTeams(): CricketTeam[] {
    return this.cacheTeams;
  }

  getTeamBySlug(slug: string): CricketTeam | null {
    return this.cacheTeams.find((t) => t.slug === slug) ?? null;
  }

  getSeries(): CricketSeries[] {
    return this.cacheSeries;
  }

  getSeriesBySlug(slug: string): CricketSeries | null {
    return this.cacheSeries.find((s) => s.slug === slug) ?? null;
  }

  getPlayers(): CricketPlayer[] {
    return this.cachePlayers;
  }

  getPlayerBySlug(slug: string): CricketPlayer | null {
    return this.cachePlayers.find((p) => p.slug === slug) ?? null;
  }

  getPointsTable(seriesId: string): PointsRow[] {
    return this.cachePoints.get(seriesId) ?? [];
  }

  getHealth() {
    return {
      provider: this.provider.name,
      isConfigured: this.provider.isConfigured(),
      lastSyncAttemptAt: this.lastSyncAttemptAt,
      lastSyncSuccessAt: this.lastSyncSuccessAt,
      lastSyncError: this.lastSyncError,
      liveMatches: this.getMatches({ status: 'live' }).length,
      upcomingMatches: this.getMatches({ status: 'upcoming' }).length,
      completedMatches: this.getMatches({ status: 'completed' }).length,
    };
  }

  /* ---------------------------------------------------------------- sync */

  async syncAll(): Promise<{ ok: boolean; message: string }> {
    this.lastSyncAttemptAt = new Date();
    try {
      await this.syncTeams();
      await this.syncSeries();
      await this.syncPlayers();
      await this.syncLiveMatches();
      await this.syncFixturesAndResults();
      await this.syncPointsTables();

      this.lastSyncSuccessAt = new Date();
      this.lastSyncError = null;
      await this.setSyncStatus('success', `Synced ${this.cacheMatches.length} matches, ${this.cacheTeams.length} teams, ${this.cachePlayers.length} players`);
      logger.info('cricket', 'Full sync completed successfully');
      return { ok: true, message: 'Sync completed successfully' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      this.lastSyncError = message;
      await this.setSyncStatus('error', message);
      logger.error('cricket', `Sync failed: ${message}`, err);
      return { ok: false, message: `Sync failed: ${message}. Showing the latest available information.` };
    }
  }

  private async setSyncStatus(status: 'success' | 'error', message: string) {
    if (!db.isConfigured) return;
    await db.collection('sync_status').updateOne(
      { job: 'cricket_sync' },
      {
        $set: {
          status,
          lastRunAt: nowIso(),
          lastSuccessAt: status === 'success' ? nowIso() : null,
          lastError: status === 'error' ? message : null,
          lastMessage: message,
          updatedAt: nowIso(),
        },
      },
      { upsert: true },
    );
  }

  private async syncTeams() {
    const teams = await this.provider.getTeams();
    this.cacheTeams = teams;
    if (!db.isConfigured) return;
    const ops = teams.map((t) => ({
      updateOne: {
        filter: { externalId: t.externalId },
        update: {
          $set: {
            name: t.name, shortName: t.shortName, slug: t.slug || slugify(t.name),
            logoUrl: t.logoUrl ?? null, country: t.country ?? 'Nepal',
            teamType: t.teamType ?? 'Other', isNational: Boolean(t.isNational),
            updatedAt: nowIso(),
          },
        },
        upsert: true,
      },
    }));
    await db.collection('teams').bulkWrite(ops, { ordered: false });
  }

  private async syncSeries() {
    const series = await this.provider.getSeries();
    this.cacheSeries = series;
    if (!db.isConfigured) return;
    const ops = series.map((s) => ({
      updateOne: {
        filter: { externalId: s.externalId },
        update: {
          $set: {
            name: s.name, slug: s.slug || slugify(s.name), type: s.type, category: s.category,
            startDate: s.startDate ?? null, endDate: s.endDate ?? null, season: s.season ?? null,
            status: s.status ?? 'upcoming', pointsTableAvailable: Boolean(s.pointsTableAvailable),
            updatedAt: nowIso(),
          },
        },
        upsert: true,
      },
    }));
    await db.collection('series').bulkWrite(ops, { ordered: false });
  }

  private async syncPlayers() {
    const players = await this.provider.getPlayers();
    this.cachePlayers = players;
    if (!db.isConfigured) return;
    const ops = players.map((p) => ({
      updateOne: {
        filter: { externalId: p.externalId },
        update: {
          $set: {
            name: p.name, slug: p.slug || slugify(p.name), fullName: p.fullName ?? null,
            photoUrl: p.photoUrl ?? null, country: p.country ?? 'Nepal', role: p.role ?? 'Batter',
            battingStyle: p.battingStyle ?? null, bowlingStyle: p.bowlingStyle ?? null,
            teamId: p.teamId ?? null, isNepal: true, updatedAt: nowIso(),
          },
        },
        upsert: true,
      },
    }));
    await db.collection('players').bulkWrite(ops, { ordered: false });
  }

  private async syncLiveMatches() {
    let live: CricketMatch[] = [];
    try {
      live = await this.provider.getLiveMatches();
    } catch (err) {
      logger.warn('cricket', 'Failed to fetch live matches from provider', err);
    }
    for (const match of live) {
      this.upsertMatchIntoCache(match);
      await this.persistMatch(match);
    }
  }

  /** Cheap live-score refresh (1-2 API hits) — safe to run frequently. */
  async refreshLive(): Promise<{ ok: boolean; message: string }> {
    this.lastSyncAttemptAt = new Date();
    try {
      await this.syncLiveMatches();
      this.lastSyncSuccessAt = new Date();
      this.lastSyncError = null;
      return { ok: true, message: 'Live refresh completed' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      this.lastSyncError = message;
      logger.error('cricket', `Live refresh failed: ${message}`, err);
      return { ok: false, message: 'Live refresh failed' };
    }
  }

  private async syncFixturesAndResults() {
    const [upcoming, completed] = await Promise.all([
      this.provider.getUpcomingMatches().catch(() => []),
      this.provider.getCompletedMatches().catch(() => []),
    ]);
    for (const match of [...upcoming, ...completed]) {
      this.upsertMatchIntoCache(match);
      await this.persistMatch(match);
    }
  }

  private async syncPointsTables() {
    const tables: Array<[string, PointsRow[]]> = [];
    for (const s of this.cacheSeries) {
      if (!s.pointsTableAvailable) continue;
      const rows = await this.provider.getPointsTable(s.externalId).catch(() => []);
      if (rows.length) tables.push([s.externalId, rows]);
    }
    for (const [seriesId, rows] of tables) {
      this.cachePoints.set(seriesId, rows);
      if (!db.isConfigured) continue;
      const ops = rows.map((row) => ({
        updateOne: {
          filter: { seriesId, teamId: row.teamId },
          update: {
            $set: {
              teamName: row.teamName, shortName: row.shortName, slug: row.slug,
              logoUrl: row.logoUrl ?? null, matches: row.matches, wins: row.wins,
              losses: row.losses, noResult: row.noResult, ties: row.ties,
              points: row.points, netRunRate: row.netRunRate, position: row.position,
              updatedAt: nowIso(),
            },
          },
          upsert: true,
        },
      }));
      await db.collection('points_table').bulkWrite(ops, { ordered: false });
    }
  }

  private upsertMatchIntoCache(match: CricketMatch) {
    const idx = this.cacheMatches.findIndex((m) => m.externalId === match.externalId);
    if (idx >= 0) this.cacheMatches[idx] = match;
    else this.cacheMatches.push(match);
  }

  private async persistMatch(match: CricketMatch) {
    if (!db.isConfigured) return;

    const set: Record<string, unknown> = {
      name: match.name,
      slug: match.slug || slugify(match.name),
      seriesId: match.seriesId ?? null,
      seriesName: match.seriesName ?? null,
      seriesSlug: match.seriesSlug ?? null,
      matchType: match.matchType,
      homeTeamId: match.homeTeamId,
      homeTeam: match.homeTeam,
      homeTeamShort: match.homeTeamShort,
      homeTeamSlug: match.homeTeamSlug,
      awayTeamId: match.awayTeamId,
      awayTeam: match.awayTeam,
      awayTeamShort: match.awayTeamShort,
      awayTeamSlug: match.awayTeamSlug,
      venue: match.venue ?? null,
      city: match.city ?? null,
      startTime: match.startTime,
      status: match.status,
      matchState: match.matchState ?? null,
      result: match.result ?? null,
      tossWinner: match.tossWinner ?? null,
      tossDecision: match.tossDecision ?? null,
      currentInnings: match.currentInnings ?? 0,
      homeScore: match.homeScore ?? null,
      awayScore: match.awayScore ?? null,
      isLive: match.status === 'live',
      isWomen: Boolean(match.isWomen),
      isU19: Boolean(match.isU19),
      lastSyncedAt: nowIso(),
      updatedAt: nowIso(),
    };

    // Only overwrite scorecard data when the provider actually carries it.
    if (match.innings?.length) set.innings = match.innings;
    if (match.commentary?.length) set.commentary = match.commentary;

    try {
      await db.collection('matches').updateOne(
        { externalId: match.externalId },
        { $set: set, $setOnInsert: { createdAt: nowIso() } },
        { upsert: true },
      );
    } catch (err) {
      logger.warn('cricket', `Failed to persist match ${match.externalId}`, err);
    }
  }

  async primeFromDatabase() {
    // Load the last-known-good snapshot from MongoDB on startup so the cache
    // is warm even before the first scheduled sync completes.
    if (!db.isConfigured || !db.isConnected) return;
    try {
      const matches = await db.collection('matches').find().sort({ startTime: 1 }).limit(200).toArray();
      for (const row of matches) {
        this.upsertMatchIntoCache(this.matchFromDoc(row));
      }
      const teams = await db.collection('teams').find().toArray();
      this.cacheTeams = teams.map((t) => ({
        externalId: String(t.externalId ?? t._id),
        name: String(t.name ?? ''),
        shortName: String(t.shortName ?? ''),
        slug: String(t.slug ?? ''),
        logoUrl: t.logoUrl ? String(t.logoUrl) : undefined,
        country: t.country ? String(t.country) : undefined,
        teamType: t.teamType ? String(t.teamType) : undefined,
        isNational: Boolean(t.isNational),
      }));
      const series = await db.collection('series').find().toArray();
      this.cacheSeries = series.map((s) => ({
        externalId: String(s.externalId ?? s._id),
        name: String(s.name ?? ''),
        slug: String(s.slug ?? ''),
        type: String(s.type ?? ''),
        category: String(s.category ?? ''),
        startDate: s.startDate ? String(s.startDate) : undefined,
        endDate: s.endDate ? String(s.endDate) : undefined,
        season: s.season ? String(s.season) : undefined,
        status: s.status ? String(s.status) : undefined,
        pointsTableAvailable: Boolean(s.pointsTableAvailable),
      }));
      logger.info('cricket', `Cache primed from database (${this.cacheMatches.length} matches)`);
    } catch (err) {
      logger.warn('cricket', 'Failed to prime cache from database', err);
    }
  }

  private matchFromDoc(doc: Record<string, unknown>): CricketMatch {
    const innings = Array.isArray(doc.innings)
      ? (doc.innings as CricketMatch['innings'])
      : [];
    const commentary = Array.isArray(doc.commentary)
      ? (doc.commentary as CricketMatch['commentary'])
      : [];
    return {
      externalId: String(doc.externalId ?? doc._id ?? ''),
      name: String(doc.name ?? ''),
      slug: String(doc.slug ?? ''),
      seriesId: doc.seriesId ? String(doc.seriesId) : undefined,
      seriesName: doc.seriesName ? String(doc.seriesName) : undefined,
      seriesSlug: doc.seriesSlug ? String(doc.seriesSlug) : undefined,
      matchType: (doc.matchType as CricketMatch['matchType']) ?? 'T20',
      homeTeamId: String(doc.homeTeamId ?? ''),
      homeTeam: String(doc.homeTeam ?? 'Home'),
      homeTeamShort: String(doc.homeTeamShort ?? ''),
      homeTeamSlug: String(doc.homeTeamSlug ?? ''),
      awayTeamId: String(doc.awayTeamId ?? ''),
      awayTeam: String(doc.awayTeam ?? 'Away'),
      awayTeamShort: String(doc.awayTeamShort ?? ''),
      awayTeamSlug: String(doc.awayTeamSlug ?? ''),
      venue: doc.venue ? String(doc.venue) : '',
      city: doc.city ? String(doc.city) : undefined,
      startTime: String(doc.startTime ?? new Date().toISOString()),
      status: (doc.status as CricketMatch['status']) ?? 'upcoming',
      matchState: doc.matchState ? String(doc.matchState) : undefined,
      result: doc.result ? String(doc.result) : undefined,
      tossWinner: doc.tossWinner ? String(doc.tossWinner) : undefined,
      tossDecision: doc.tossDecision as 'bat' | 'bowl' | undefined,
      currentInnings: Number(doc.currentInnings ?? 0),
      homeScore: doc.homeScore ? String(doc.homeScore) : undefined,
      awayScore: doc.awayScore ? String(doc.awayScore) : undefined,
      innings,
      commentary,
      isWomen: Boolean(doc.isWomen),
      isU19: Boolean(doc.isU19),
    };
  }
}

export const cricketData = new CricketDataService();
