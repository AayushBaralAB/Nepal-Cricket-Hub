import { config } from '../config';
import { db } from '../db';
import { logger } from '../utils/logger';
import { slugify, nowIso } from '../utils/helpers';
import { CricketProvider } from './CricketService';
import { SampleCricketProvider } from './providers/SampleCricketProvider';
import { HttpCricketProvider } from './providers/HttpCricketProvider';
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
 *  - sync upstream data into Supabase (durable store)
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
      config.cricket.provider === 'http' ? new HttpCricketProvider() : new SampleCricketProvider();
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
    await db.admin.from('sync_status').upsert(
      {
        job: 'cricket_sync',
        status,
        last_run_at: nowIso(),
        last_success_at: status === 'success' ? nowIso() : undefined,
        last_error: status === 'error' ? message : null,
        last_message: message,
        updated_at: nowIso(),
      },
      { onConflict: 'job' },
    );
  }

  private async syncTeams() {
    const teams = await this.provider.getTeams();
    this.cacheTeams = teams;
    if (!db.isConfigured) return;
    const rows = teams.map((t) => ({
      name: t.name, short_name: t.shortName, slug: t.slug || slugify(t.name),
      country: t.country ?? 'Nepal', team_type: t.teamType ?? 'Other', is_national: Boolean(t.isNational),
      logo_url: t.logoUrl ?? null, external_id: t.externalId, updated_at: nowIso(),
    }));
    for (const row of rows) {
      await db.admin.from('teams').upsert(row, { onConflict: 'external_id' });
    }
  }

  private async syncSeries() {
    const series = await this.provider.getSeries();
    this.cacheSeries = series;
    if (!db.isConfigured) return;
    for (const s of series) {
      await db.admin.from('series').upsert(
        {
          name: s.name, slug: s.slug || slugify(s.name), type: s.type, category: s.category,
          start_date: s.startDate ?? null, end_date: s.endDate ?? null, season: s.season ?? null,
          status: s.status ?? 'upcoming', points_table_available: Boolean(s.pointsTableAvailable),
          external_id: s.externalId, updated_at: nowIso(),
        },
        { onConflict: 'external_id' },
      );
    }
  }

  private async syncPlayers() {
    const players = await this.provider.getPlayers();
    this.cachePlayers = players;
    if (!db.isConfigured) return;
    for (const p of players) {
      await db.admin.from('players').upsert(
        {
          name: p.name, slug: p.slug || slugify(p.name), full_name: p.fullName ?? null,
          photo_url: p.photoUrl ?? null, country: p.country ?? 'Nepal', role: p.role ?? 'Batter',
          batting_style: p.battingStyle ?? null, bowling_style: p.bowlingStyle ?? null,
          is_nepal: true, external_id: p.externalId, updated_at: nowIso(),
        },
        { onConflict: 'external_id' },
      );
    }
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
      for (const row of rows) {
        await db.admin.from('points_table').upsert(
          {
            series_id: seriesId, team_id: row.teamId,
            matches: row.matches, wins: row.wins, losses: row.losses,
            no_result: row.noResult, ties: row.ties, points: row.points,
            net_run_rate: row.netRunRate, position: row.position, updated_at: nowIso(),
          },
          { onConflict: 'series_id,team_id' },
        );
      }
    }
  }

  private upsertMatchIntoCache(match: CricketMatch) {
    const idx = this.cacheMatches.findIndex((m) => m.externalId === match.externalId);
    if (idx >= 0) this.cacheMatches[idx] = match;
    else this.cacheMatches.push(match);
  }

  private async persistMatch(match: CricketMatch) {
    if (!db.isConfigured) return;
    const teamIdByExternal = new Map(this.cacheTeams.map((t) => [t.externalId, t]));

    const { data: existing, error: lookupError } = await db.admin
      .from('matches')
      .select('id')
      .eq('external_id', match.externalId)
      .maybeSingle();

    if (lookupError) {
      logger.warn('cricket', `Could not look up match ${match.externalId}`, lookupError);
    }

    const seriesRow = match.seriesId ? await this.seriesIdToUuid(match.seriesId) : null;
    const home = teamIdByExternal.get(match.homeTeamId);
    const away = teamIdByExternal.get(match.awayTeamId);

    const payload = {
      external_id: match.externalId,
      series_id: seriesRow,
      home_team_id: home ? await this.teamIdToUuid(home.externalId) : null,
      away_team_id: away ? await this.teamIdToUuid(away.externalId) : null,
      name: match.name,
      slug: match.slug || slugify(match.name),
      match_type: match.matchType,
      venue: match.venue ?? null,
      city: match.city ?? null,
      start_time: match.startTime,
      status: match.status,
      match_state: match.matchState ?? null,
      result: match.result ?? null,
      toss_winner: match.tossWinner ?? null,
      toss_decision: match.tossDecision ?? null,
      current_innings: match.currentInnings ?? 0,
      is_live: match.status === 'live',
      is_women: Boolean(match.isWomen),
      is_u19: Boolean(match.isU19),
      home_score: match.homeScore ?? null,
      away_score: match.awayScore ?? null,
      last_synced_at: nowIso(),
      updated_at: nowIso(),
    };

    let matchRowId = existing?.id as string | undefined;
    if (!matchRowId) {
      const { data, error } = await db.admin.from('matches').insert(payload).select('id').maybeSingle();
      if (error) {
        if (!String(error.message).includes('duplicate')) {
          logger.warn('cricket', `Failed to insert match ${match.externalId}`, error);
        }
        const again = await db.admin.from('matches').select('id').eq('external_id', match.externalId).maybeSingle();
        matchRowId = again.data?.id as string | undefined;
      } else {
        matchRowId = data?.id as string | undefined;
      }
    } else {
      await db.admin.from('matches').update(payload).eq('id', matchRowId);
    }

    if (!matchRowId) return;

    // Persist innings + ball-by-ball for live/complete matches that carry them.
    for (const inn of match.innings ?? []) {
      await db.admin.from('innings').upsert(
        {
          match_id: matchRowId, innings_number: inn.inningsNumber,
          team_id: null, batting_team: inn.battingTeam,
          runs: inn.runs, wickets: inn.wickets, overs: inn.overs,
          run_rate: inn.runRate, declared: Boolean(inn.declared), extra: inn.extras ?? 0,
        },
        { onConflict: 'match_id,innings_number' },
      );
      const { data: innRow } = await db.admin
        .from('innings').select('id').eq('match_id', matchRowId).eq('innings_number', inn.inningsNumber).maybeSingle();
      if (innRow?.id) {
        await db.admin.from('batting_cards').delete().eq('innings_id', innRow.id as string);
        await db.admin.from('bowling_cards').delete().eq('innings_id', innRow.id as string);
        await db.admin.from('fall_of_wickets').delete().eq('innings_id', innRow.id as string);
        for (const b of inn.batting ?? []) {
          await db.admin.from('batting_cards').insert({
            innings_id: innRow.id, player_name: b.name, runs: b.runs, balls: b.balls,
            fours: b.fours, sixes: b.sixes, strike_rate: b.strikeRate,
            dismissal: b.dismissal ?? null, is_not_out: b.isNotOut, is_out: b.isOut,
          });
        }
        for (const bw of inn.bowling ?? []) {
          await db.admin.from('bowling_cards').insert({
            innings_id: innRow.id, player_name: bw.name, overs: bw.overs,
            maidens: bw.maidens, runs: bw.runs, wickets: bw.wickets, economy: bw.economy,
          });
        }
        for (const fow of inn.fallOfWickets ?? []) {
          await db.admin.from('fall_of_wickets').insert({
            innings_id: innRow.id, wicket_number: fow.wicketNumber, runs: fow.runs,
            over: fow.over, player_name: fow.playerName ?? null,
          });
        }
      }
    }
  }

  private async seriesIdToUuid(externalId: string): Promise<string | null> {
    const { data } = await db.admin.from('series').select('id').eq('external_id', externalId).maybeSingle();
    return (data?.id as string) ?? null;
  }

  private async teamIdToUuid(externalId: string): Promise<string | null> {
    const { data } = await db.admin.from('teams').select('id').eq('external_id', externalId).maybeSingle();
    return (data?.id as string) ?? null;
  }

  async primeFromDatabase() {
    // Load the last-known-good snapshot from Supabase on startup so the cache
    // is warm even before the first scheduled sync completes.
    if (!db.isConfigured) return;
    try {
      const { data: matches } = await db.admin
        .from('matches').select('*').order('start_time', { ascending: true }).limit(200);
      for (const row of matches ?? []) {
        this.upsertMatchIntoCache(this.dbMatchToDomain(row));
      }
      const { data: teams } = await db.admin.from('teams').select('*');
      this.cacheTeams = (teams ?? []).map((t) => ({
        externalId: t.external_id ?? t.id, name: t.name, shortName: t.short_name,
        slug: t.slug, logoUrl: t.logo_url, country: t.country,
        teamType: t.team_type, isNational: Boolean(t.is_national),
      }));
      const { data: series } = await db.admin.from('series').select('*');
      this.cacheSeries = (series ?? []).map((s) => ({
        externalId: s.external_id ?? s.id, name: s.name, slug: s.slug, type: s.type,
        category: s.category, startDate: s.start_date, endDate: s.end_date,
        season: s.season, status: s.status, pointsTableAvailable: Boolean(s.points_table_available),
      }));
      logger.info('cricket', `Cache primed from database (${this.cacheMatches.length} matches)`);
    } catch (err) {
      logger.warn('cricket', 'Failed to prime cache from database', err);
    }
  }

  private dbMatchToDomain(row: Record<string, unknown>): CricketMatch {
    return {
      externalId: String(row.external_id ?? row.id),
      name: String(row.name ?? ''),
      slug: String(row.slug ?? ''),
      seriesId: row.series_id ? String(row.series_id) : undefined,
      matchType: (row.match_type as CricketMatch['matchType']) ?? 'T20',
      homeTeamId: String(row.home_team_id ?? ''),
      homeTeam: 'Home', homeTeamShort: '', homeTeamSlug: '',
      awayTeamId: String(row.away_team_id ?? ''),
      awayTeam: 'Away', awayTeamShort: '', awayTeamSlug: '',
      venue: row.venue ? String(row.venue) : '',
      city: row.city ? String(row.city) : undefined,
      startTime: String(row.start_time ?? new Date().toISOString()),
      status: (row.status as CricketMatch['status']) ?? 'upcoming',
      matchState: row.match_state ? String(row.match_state) : undefined,
      result: row.result ? String(row.result) : undefined,
      tossWinner: row.toss_winner ? String(row.toss_winner) : undefined,
      tossDecision: row.toss_decision as 'bat' | 'bowl' | undefined,
      currentInnings: Number(row.current_innings ?? 0),
      homeScore: row.home_score ? String(row.home_score) : undefined,
      awayScore: row.away_score ? String(row.away_score) : undefined,
      innings: [], commentary: [],
      isWomen: Boolean(row.is_women), isU19: Boolean(row.is_u19),
    };
  }
}

export const cricketData = new CricketDataService();
