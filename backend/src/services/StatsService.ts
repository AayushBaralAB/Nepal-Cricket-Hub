import { playerService } from './PlayerService';

/**
 * Aggregated statistics endpoints (top run scorers, top wicket takers, etc.).
 * Falls back to curated sample numbers when the database is empty.
 */
export class StatsService {
  async topRunScorers(limit = 10, format = 'T20') {
    const fromDb = await playerService.topRunScorers(limit, format);
    if (fromDb.length) return fromDb;

    return [
      { player: 'Rohit Paudel', slug: 'rohit-paudel', country: 'Nepal', role: 'Batter', matches: 45, innings: 42, runs: 1120, average: 29.3, strikeRate: 124.5, hundreds: 0, fifties: 7 },
      { player: 'Kushal Bhurtel', slug: 'kushal-bhurtel', country: 'Nepal', role: 'All-rounder', matches: 48, innings: 46, runs: 1180, average: 27.8, strikeRate: 121.6, hundreds: 1, fifties: 6 },
      { player: 'Aasif Sheikh', slug: 'aasif-sheikh', country: 'Nepal', role: 'Wicketkeeper-Batter', matches: 44, innings: 40, runs: 980, average: 26.1, strikeRate: 138.7, hundreds: 0, fifties: 5 },
      { player: 'Dipendra Singh Airee', slug: 'dipendra-singh-airee', country: 'Nepal', role: 'All-rounder', matches: 46, innings: 38, runs: 940, average: 29.5, strikeRate: 151.2, hundreds: 0, fifties: 5 },
      { player: 'Kushal Malla', slug: 'kushal-malla', country: 'Nepal', role: 'All-rounder', matches: 32, innings: 28, runs: 780, average: 30.1, strikeRate: 148.9, hundreds: 0, fifties: 5 },
      { player: 'Aarif Sheikh', slug: 'aarif-sheikh', country: 'Nepal', role: 'All-rounder', matches: 50, innings: 44, runs: 1050, average: 27.1, strikeRate: 118.4, hundreds: 0, fifties: 6 },
      { player: 'Gulsan Jha', slug: 'gulsan-jha', country: 'Nepal', role: 'All-rounder', matches: 35, innings: 30, runs: 620, average: 24.8, strikeRate: 128.9, hundreds: 0, fifties: 3 },
      { player: 'Lokesh Bam', slug: 'lokesh-bam', country: 'Nepal', role: 'Batter', matches: 20, innings: 18, runs: 540, average: 33.7, strikeRate: 142.1, hundreds: 0, fifties: 4 },
    ].slice(0, limit);
  }

  async topWicketTakers(limit = 10, format = 'T20') {
    const fromDb = await playerService.topWicketTakers(limit, format);
    if (fromDb.length) return fromDb;

    return [
      { player: 'Sandeep Lamichhane', slug: 'sandeep-lamichhane', country: 'Nepal', role: 'Bowler', matches: 48, wickets: 96, economy: 6.3, bestBowling: '5/9', average: 19.8 },
      { player: 'Sompal Kami', slug: 'sompal-kami', country: 'Nepal', role: 'All-rounder', matches: 40, wickets: 38, economy: 8.4, bestBowling: '3/19', average: 27.6 },
      { player: 'Karan KC', slug: 'karan-kc', country: 'Nepal', role: 'Bowler', matches: 42, wickets: 62, economy: 8.1, bestBowling: '4/18', average: 22.4 },
      { player: 'Abinash Bohara', slug: 'abinash-bohara', country: 'Nepal', role: 'Bowler', matches: 30, wickets: 44, economy: 7.4, bestBowling: '4/22', average: 21.3 },
      { player: 'Pratis GC', slug: 'pratis-gc', country: 'Nepal', role: 'Bowler', matches: 22, wickets: 30, economy: 8.9, bestBowling: '3/28', average: 25.1 },
      { player: 'Lalit Rajbanshi', slug: 'lalit-rajbanshi', country: 'Nepal', role: 'Bowler', matches: 34, wickets: 40, economy: 7.1, bestBowling: '4/16', average: 20.9 },
    ].slice(0, limit);
  }

  async tournamentStats(tournament: string) {
    return {
      tournament,
      topRunScorers: await this.topRunScorers(10),
      topWicketTakers: await this.topWicketTakers(10),
    };
  }
}

export const statsService = new StatsService();
