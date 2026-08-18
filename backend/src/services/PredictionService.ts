import { ObjectId } from 'mongodb';
import { db } from '../db';
import { logger } from '../utils/logger';
import { nowIso } from '../utils/helpers';

export interface Prediction {
  _id?: ObjectId;
  matchId: string;
  userIdentifier: string;
  predictedWinner: string;
  predictedScore?: number;
  predictedManOfMatch?: string;
  points: number;
  settled: boolean;
  createdAt: string;
}

export interface MatchStats {
  totalVotes: number;
  winnerVotes: Array<{ team: string; count: number; percentage: number }>;
  avgPredictedScore: number;
}

export class PredictionService {
  async addPrediction(data: {
    matchId: string;
    userIdentifier: string;
    predictedWinner: string;
    predictedScore?: number;
    predictedManOfMatch?: string;
  }): Promise<{ id: string }> {
    if (!db.isConfigured) throw new Error('Database not configured');

    const existing = await db.collection<Prediction>('predictions').findOne({
      matchId: data.matchId,
      userIdentifier: data.userIdentifier,
    });
    if (existing) {
      await db.collection<Prediction>('predictions').updateOne(
        { _id: existing._id },
        {
          $set: {
            predictedWinner: data.predictedWinner,
            predictedScore: data.predictedScore,
            predictedManOfMatch: data.predictedManOfMatch,
            createdAt: nowIso(),
          },
        },
      );
      return { id: String(existing._id) };
    }

    const result = await db.collection<Prediction>('predictions').insertOne({
      matchId: data.matchId,
      userIdentifier: data.userIdentifier,
      predictedWinner: data.predictedWinner,
      predictedScore: data.predictedScore,
      predictedManOfMatch: data.predictedManOfMatch,
      points: 0,
      settled: false,
      createdAt: nowIso(),
    });
    logger.info('predictions', `Prediction added for match: ${data.matchId}`, { user: data.userIdentifier });
    return { id: String(result.insertedId) };
  }

  async getPredictionsForMatch(matchId: string): Promise<Prediction[]> {
    if (!db.isConfigured) return [];
    return db.collection<Prediction>('predictions')
      .find({ matchId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getMatchStats(matchId: string): Promise<MatchStats> {
    if (!db.isConfigured) return { totalVotes: 0, winnerVotes: [], avgPredictedScore: 0 };
    const predictions = await this.getPredictionsForMatch(matchId);
    const totalVotes = predictions.length;

    if (totalVotes === 0) return { totalVotes: 0, winnerVotes: [], avgPredictedScore: 0 };

    const voteCounts: Record<string, number> = {};
    let totalScore = 0;
    let scoreCount = 0;

    for (const p of predictions) {
      voteCounts[p.predictedWinner] = (voteCounts[p.predictedWinner] || 0) + 1;
      if (p.predictedScore) {
        totalScore += p.predictedScore;
        scoreCount++;
      }
    }

    const winnerVotes = Object.entries(voteCounts)
      .map(([team, count]) => ({
        team,
        count,
        percentage: Math.round((count / totalVotes) * 10000) / 100,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalVotes,
      winnerVotes,
      avgPredictedScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
    };
  }

  async getUserPredictions(userIdentifier: string): Promise<Prediction[]> {
    if (!db.isConfigured) return [];
    return db.collection<Prediction>('predictions')
      .find({ userIdentifier })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async settlePredictions(matchId: string, actualWinner: string): Promise<{ settled: number; pointsAwarded: number }> {
    if (!db.isConfigured) throw new Error('Database not configured');
    const predictions = await db.collection<Prediction>('predictions')
      .find({ matchId, settled: false })
      .toArray();

    let settled = 0;
    let pointsAwarded = 0;

    for (const p of predictions) {
      const points = p.predictedWinner === actualWinner ? 10 : 0;
      await db.collection<Prediction>('predictions').updateOne(
        { _id: p._id },
        { $set: { settled: true, points } },
      );
      settled++;
      pointsAwarded += points;
    }

    logger.info('predictions', `Settled ${settled} predictions for match: ${matchId}`, { actualWinner, pointsAwarded });
    return { settled, pointsAwarded };
  }
}

export const predictionService = new PredictionService();
