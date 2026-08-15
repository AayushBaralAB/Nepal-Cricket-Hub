import { cricketData } from './CricketDataService';
import { db } from '../db';
import { CricketMatch } from '../types/cricket';

export class MatchService {
  list(filter: Parameters<typeof cricketData.getMatches>[0]): CricketMatch[] {
    return cricketData.getMatches(filter);
  }

  getById(id: string): CricketMatch | null {
    return cricketData.getMatchById(id);
  }

  getBySlug(slug: string): CricketMatch | null {
    return cricketData.getMatchBySlug(slug);
  }

  /** Enrich match with a full scorecard from the database when available. */
  async getDetailed(id: string): Promise<CricketMatch | null> {
    const match = cricketData.getMatchById(id);
    if (!match || !db.isConfigured) return match;

    const { data: dbMatch } = await db.admin
      .from('matches').select('*').eq('external_id', id).maybeSingle();
    if (!dbMatch) return match;

    const { data: innings } = await db.admin
      .from('innings').select('*').eq('match_id', dbMatch.id).order('innings_number');
    if (!innings || !innings.length) return match;

    const detailed: CricketMatch = { ...match, innings: [] };
    for (const inn of innings) {
      const innId = inn.id as string;
      const [batting, bowling, fow, partnerships] = await Promise.all([
        db.admin.from('batting_cards').select('*').eq('innings_id', innId),
        db.admin.from('bowling_cards').select('*').eq('innings_id', innId),
        db.admin.from('fall_of_wickets').select('*').eq('innings_id', innId).order('wicket_number'),
        db.admin.from('partnerships').select('*').eq('innings_id', innId),
      ]);

      detailed.innings.push({
        inningsNumber: inn.innings_number as number,
        battingTeamId: inn.team_id ? String(inn.team_id) : undefined,
        battingTeam: String(inn.batting_team ?? ''),
        runs: Number(inn.runs ?? 0),
        wickets: Number(inn.wickets ?? 0),
        overs: Number(inn.overs ?? 0),
        runRate: Number(inn.run_rate ?? 0),
        declared: Boolean(inn.declared),
        extras: Number(inn.extra ?? 0),
        isCompleted: Number(inn.wickets ?? 0) >= 10 || Number(inn.overs ?? 0) >= 50,
        batting: (batting.data ?? []).map((b) => ({
          name: String(b.player_name), runs: Number(b.runs), balls: Number(b.balls),
          fours: Number(b.fours), sixes: Number(b.sixes), strikeRate: Number(b.strike_rate),
          dismissal: b.dismissal ? String(b.dismissal) : undefined,
          isNotOut: Boolean(b.is_not_out), isOut: Boolean(b.is_out),
        })),
        bowling: (bowling.data ?? []).map((b) => ({
          name: String(b.player_name), overs: Number(b.overs), maidens: Number(b.maidens),
          runs: Number(b.runs), wickets: Number(b.wickets), economy: Number(b.economy),
        })),
        fallOfWickets: (fow.data ?? []).map((f) => ({
          wicketNumber: Number(f.wicket_number), runs: Number(f.runs),
          over: Number(f.over), playerName: f.player_name ? String(f.player_name) : undefined,
        })),
        partnerships: (partnerships.data ?? []).map((p) => ({
          playerA: p.player_a ? String(p.player_a) : undefined,
          playerB: p.player_b ? String(p.player_b) : undefined,
          runs: Number(p.runs), balls: Number(p.balls),
        })),
      });
    }

    const { data: bbb } = await db.admin
      .from('ball_by_ball').select('*').eq('match_id', dbMatch.id).order('over').order('ball_in_over').limit(120);
    detailed.commentary = (bbb ?? []).map((b) => ({
      over: Number(b.over), ballInOver: Number(b.ball_in_over),
      runs: Number(b.runs), isWicket: Boolean(b.is_wicket),
      batsman: b.batsman ? String(b.batsman) : undefined,
      bowler: b.bowler ? String(b.bowler) : undefined,
      text: String(b.commentary ?? ''),
    }));

    return detailed;
  }
}

export const matchService = new MatchService();
