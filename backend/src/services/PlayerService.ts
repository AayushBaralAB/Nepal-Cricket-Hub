import { cricketData } from './CricketDataService';
import { db } from '../db';

export interface PlayerProfile {
  id: string;
  name: string;
  slug: string;
  fullName?: string;
  photoUrl?: string;
  country: string;
  role: string;
  battingStyle?: string;
  bowlingStyle?: string;
  bio?: string;
  teamId?: string;
  teamName?: string;
  statistics: Record<string, Record<string, number | string>>;
  recent: Array<Record<string, unknown>>;
}

export class PlayerService {
  list() {
    return cricketData.getPlayers();
  }

  getBySlug(slug: string) {
    return cricketData.getPlayerBySlug(slug);
  }

  async getProfile(slug: string): Promise<PlayerProfile | null> {
    const player = cricketData.getPlayerBySlug(slug);
    if (!player) return null;

    const profile: PlayerProfile = {
      id: player.externalId,
      name: player.name,
      slug: player.slug,
      fullName: player.fullName,
      photoUrl: player.photoUrl,
      country: player.country ?? 'Nepal',
      role: player.role ?? 'Batter',
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      teamId: player.teamId,
      teamName: player.teamId
        ? cricketData.getTeams().find((t) => t.externalId === player.teamId)?.name
        : undefined,
      statistics: {},
      recent: [],
    };

    if (!db.isConfigured) return profile;

    const { data: dbPlayer } = await db.admin
      .from('players').select('id, bio').eq('slug', slug).maybeSingle();
    if (dbPlayer?.bio) profile.bio = String(dbPlayer.bio);

    if (dbPlayer?.id) {
      const { data: stats } = await db.admin
        .from('player_statistics').select('*').eq('player_id', dbPlayer.id);
      for (const s of stats ?? []) {
        profile.statistics[String(s.format)] = {
          matches: Number(s.matches), innings: Number(s.innings), runs: Number(s.runs),
          highScore: Number(s.high_score), average: Number(s.average), strikeRate: Number(s.strike_rate),
          hundreds: Number(s.hundreds), fifties: Number(s.fifties), fours: Number(s.fours),
          sixes: Number(s.sixes), wickets: Number(s.wickets), economy: Number(s.economy),
          bestBowling: `${Number(s.best_bowling_wickets)}/${Number(s.best_bowling_runs)}`,
          catches: Number(s.catches), fiveWickets: Number(s.five_wickets),
        };
      }

      const { data: recent } = await db.admin
        .from('player_recent_performances').select('*').eq('player_id', dbPlayer.id).order('date', { ascending: false }).limit(10);
      profile.recent = (recent ?? []).map((r) => ({
        matchLabel: String(r.match_label ?? ''),
        date: r.date ? String(r.date) : undefined,
        runs: r.runs != null ? Number(r.runs) : null,
        balls: r.balls != null ? Number(r.balls) : null,
        wickets: r.wickets != null ? Number(r.wickets) : null,
        economy: r.economy != null ? Number(r.economy) : null,
        isNotOut: Boolean(r.is_not_out),
      }));
    }

    return profile;
  }

  async topRunScorers(limit = 10, format = 'T20') {
    if (!db.isConfigured) return [];
    const { data } = await db.admin
      .from('player_statistics')
      .select('*, players(name, slug, country, role)')
      .eq('format', format)
      .order('runs', { ascending: false })
      .limit(limit);
    return (data ?? []).map((s) => ({
      player: String((s.players as Record<string, unknown>)?.name ?? ''),
      slug: String((s.players as Record<string, unknown>)?.slug ?? ''),
      country: String((s.players as Record<string, unknown>)?.country ?? ''),
      role: String((s.players as Record<string, unknown>)?.role ?? ''),
      matches: Number(s.matches), innings: Number(s.innings), runs: Number(s.runs),
      average: Number(s.average), strikeRate: Number(s.strike_rate),
      hundreds: Number(s.hundreds), fifties: Number(s.fifties),
    }));
  }

  async topWicketTakers(limit = 10, format = 'T20') {
    if (!db.isConfigured) return [];
    const { data } = await db.admin
      .from('player_statistics')
      .select('*, players(name, slug, country, role)')
      .eq('format', format)
      .order('wickets', { ascending: false })
      .limit(limit);
    return (data ?? []).map((s) => ({
      player: String((s.players as Record<string, unknown>)?.name ?? ''),
      slug: String((s.players as Record<string, unknown>)?.slug ?? ''),
      country: String((s.players as Record<string, unknown>)?.country ?? ''),
      role: String((s.players as Record<string, unknown>)?.role ?? ''),
      matches: Number(s.matches), wickets: Number(s.wickets),
      economy: Number(s.economy), bestBowling: `${Number(s.best_bowling_wickets)}/${Number(s.best_bowling_runs)}`,
      average: Number(s.average_bowling),
    }));
  }
}

export const playerService = new PlayerService();
