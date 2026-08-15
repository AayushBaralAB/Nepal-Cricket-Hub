import { CricketMatch, CricketPlayer, CricketSeries, CricketTeam, PointsRow } from '../types/cricket';

/**
 * A cricket data provider. Providers are interchangeable so the upstream API
 * can be swapped without touching the frontend or the rest of the backend.
 */
export interface CricketProvider {
  readonly name: string;
  isConfigured(): boolean;
  getLiveMatches(): Promise<CricketMatch[]>;
  getMatch(matchId: string): Promise<CricketMatch | null>;
  getUpcomingMatches(): Promise<CricketMatch[]>;
  getCompletedMatches(limit?: number): Promise<CricketMatch[]>;
  getMatchesByDate(date: string): Promise<CricketMatch[]>;
  getSeries(): Promise<CricketSeries[]>;
  getPointsTable(seriesId: string): Promise<PointsRow[]>;
  getPlayers(): Promise<CricketPlayer[]>;
  getTeams(): Promise<CricketTeam[]>;
}
