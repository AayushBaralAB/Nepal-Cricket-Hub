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

    const dbPlayer = await db.collection('players').findOne({ slug });
    if (dbPlayer?.bio) profile.bio = String(dbPlayer.bio);

    const playerId = String(dbPlayer?._id ?? player.externalId);

    const stats = await db.collection('player_statistics').find({ playerId }).toArray();
    for (const s of stats) {
      profile.statistics[String(s.format)] = {
        matches: Number(s.matches), innings: Number(s.innings), runs: Number(s.runs),
        highScore: Number(s.highScore), average: Number(s.average), strikeRate: Number(s.strikeRate),
        hundreds: Number(s.hundreds), fifties: Number(s.fifties), fours: Number(s.fours),
        sixes: Number(s.sixes), wickets: Number(s.wickets), economy: Number(s.economy),
        bestBowling: `${Number(s.bestBowlingWickets)}/${Number(s.bestBowlingRuns)}`,
        catches: Number(s.catches), fiveWickets: Number(s.fiveWickets),
      };
    }

    const recent = await db.collection('player_recent_performances')
      .find({ playerId })
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    profile.recent = recent.map((r) => ({
      matchLabel: String(r.matchLabel ?? ''),
      date: r.date ? String(r.date) : undefined,
      runs: r.runs != null ? Number(r.runs) : null,
      balls: r.balls != null ? Number(r.balls) : null,
      wickets: r.wickets != null ? Number(r.wickets) : null,
      economy: r.economy != null ? Number(r.economy) : null,
      isNotOut: Boolean(r.isNotOut),
    }));

    return profile;
  }

  async topRunScorers(limit = 10, format = 'T20') {
    if (!db.isConfigured) return [];
    const rows = await db.collection('player_statistics')
      .find({ format })
      .sort({ runs: -1 })
      .limit(limit)
      .toArray();
    return rows.map((s) => ({
      player: String(s.playerName ?? ''),
      slug: String(s.playerSlug ?? ''),
      country: String(s.playerCountry ?? ''),
      role: String(s.playerRole ?? ''),
      matches: Number(s.matches), innings: Number(s.innings), runs: Number(s.runs),
      average: Number(s.average), strikeRate: Number(s.strikeRate),
      hundreds: Number(s.hundreds), fifties: Number(s.fifties),
    }));
  }

  async topWicketTakers(limit = 10, format = 'T20') {
    if (!db.isConfigured) return [];
    const rows = await db.collection('player_statistics')
      .find({ format })
      .sort({ wickets: -1 })
      .limit(limit)
      .toArray();
    return rows.map((s) => ({
      player: String(s.playerName ?? ''),
      slug: String(s.playerSlug ?? ''),
      country: String(s.playerCountry ?? ''),
      role: String(s.playerRole ?? ''),
      matches: Number(s.matches), wickets: Number(s.wickets),
      economy: Number(s.economy), bestBowling: `${Number(s.bestBowlingWickets)}/${Number(s.bestBowlingRuns)}`,
      average: Number(s.averageBowling),
    }));
  }
}

export const playerService = new PlayerService();
