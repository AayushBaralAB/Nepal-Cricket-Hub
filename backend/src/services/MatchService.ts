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
    let match = cricketData.getMatchById(id);
    if (!match) {
      // Cache miss — fetch the single match from the live provider (1 API hit).
      match = await cricketData.activeProvider.getMatch(id).catch(() => null);
      if (match && !cricketData.getMatchById(id)) cricketData.seedMatch(match);
    }
    if (!match || !db.isConfigured) return match;

    // MongoDB stores the scorecard (innings + commentary) embedded in the match
    // document, so a single read returns everything.
    const doc = await db.collection('matches').findOne({ externalId: id });
    if (!doc) return match;

    const { _id, lastSyncedAt, createdAt, updatedAt, ...rest } = doc;
    void _id; void lastSyncedAt; void createdAt; void updatedAt;

    const innings = Array.isArray(rest.innings) ? rest.innings : [];
    if (!innings.length) return match;

    return {
      ...match,
      ...rest,
      innings,
      commentary: Array.isArray(rest.commentary) ? rest.commentary : match.commentary,
    };
  }
}

export const matchService = new MatchService();
