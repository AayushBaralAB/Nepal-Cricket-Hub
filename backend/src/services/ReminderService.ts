import { ObjectId } from 'mongodb';
import { db } from '../db';
import { logger } from '../utils/logger';
import { nowIso } from '../utils/helpers';

export interface MatchReminder {
  _id?: ObjectId;
  matchId: string;
  matchTitle: string;
  userIdentifier: string;
  remindBeforeMinutes: number;
  notified: boolean;
  createdAt: string;
}

export class ReminderService {
  async addReminder(data: {
    matchId: string;
    matchTitle: string;
    userIdentifier: string;
    remindBeforeMinutes?: number;
  }): Promise<{ id: string }> {
    if (!db.isConfigured) throw new Error('Database not configured');

    const existing = await db.collection<MatchReminder>('match_reminders').findOne({
      matchId: data.matchId,
      userIdentifier: data.userIdentifier,
      notified: false,
    });
    if (existing) {
      return { id: String(existing._id) };
    }

    const result = await db.collection<MatchReminder>('match_reminders').insertOne({
      matchId: data.matchId,
      matchTitle: data.matchTitle,
      userIdentifier: data.userIdentifier,
      remindBeforeMinutes: data.remindBeforeMinutes ?? 30,
      notified: false,
      createdAt: nowIso(),
    });
    logger.info('reminders', `Reminder added for match: ${data.matchTitle}`, { matchId: data.matchId });
    return { id: String(result.insertedId) };
  }

  async getRemindersForMatch(matchId: string): Promise<MatchReminder[]> {
    if (!db.isConfigured) return [];
    return db.collection<MatchReminder>('match_reminders')
      .find({ matchId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getUpcomingReminders(): Promise<MatchReminder[]> {
    if (!db.isConfigured) return [];
    return db.collection<MatchReminder>('match_reminders')
      .find({ notified: false })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async markNotified(id: string): Promise<boolean> {
    if (!db.isConfigured) throw new Error('Database not configured');
    const result = await db.collection<MatchReminder>('match_reminders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { notified: true } },
    );
    return result.modifiedCount > 0;
  }

  async removeReminder(id: string): Promise<boolean> {
    if (!db.isConfigured) throw new Error('Database not configured');
    const result = await db.collection<MatchReminder>('match_reminders').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount > 0) {
      logger.info('reminders', `Reminder removed`, { id });
      return true;
    }
    return false;
  }

  async processUpcomingReminders(): Promise<{ notified: number }> {
    if (!db.isConfigured) return { notified: 0 };
    const reminders = await this.getUpcomingReminders();
    let notified = 0;

    for (const reminder of reminders) {
      await this.markNotified(String(reminder._id));
      notified++;
      logger.info('reminders', `Reminder triggered for: ${reminder.matchTitle}`, { matchId: reminder.matchId });
    }

    return { notified };
  }
}

export const reminderService = new ReminderService();
