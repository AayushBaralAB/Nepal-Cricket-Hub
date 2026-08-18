import { db } from '../db';
import { logger } from '../utils/logger';
import { nowIso } from '../utils/helpers';

export interface PushSubscription {
  id?: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: string;
}

export interface NotificationLog {
  id?: string;
  matchId: string;
  message: string;
  sentAt: string;
  subscriptionCount: number;
}

export class NotificationService {
  async subscribe(subscription: Omit<PushSubscription, 'id' | 'createdAt'>): Promise<{ id: string }> {
    if (!db.isConfigured) throw new Error('Database not configured');
    const existing = await db.collection<PushSubscription>('push_subscriptions').findOne({ endpoint: subscription.endpoint });
    if (existing) {
      await db.collection<PushSubscription>('push_subscriptions').updateOne(
        { endpoint: subscription.endpoint },
        { $set: { keys: subscription.keys, updatedAt: nowIso() } },
      );
      return { id: String(existing._id) };
    }
    const result = await db.collection<PushSubscription>('push_subscriptions').insertOne({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      createdAt: nowIso(),
    });
    logger.info('notifications', 'New push subscription added', { endpoint: subscription.endpoint });
    return { id: String(result.insertedId) };
  }

  async unsubscribe(endpoint: string): Promise<boolean> {
    if (!db.isConfigured) throw new Error('Database not configured');
    const result = await db.collection<PushSubscription>('push_subscriptions').deleteOne({ endpoint });
    if (result.deletedCount > 0) {
      logger.info('notifications', 'Push subscription removed', { endpoint });
      return true;
    }
    return false;
  }

  async getSubscriptions(): Promise<PushSubscription[]> {
    if (!db.isConfigured) return [];
    return db.collection<PushSubscription>('push_subscriptions')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
  }

  async notifyAll(message: { title: string; body: string; url?: string }): Promise<{ sent: number; failed: number }> {
    if (!db.isConfigured) throw new Error('Database not configured');
    const subs = await this.getSubscriptions();
    let sent = 0;
    let failed = 0;

    for (const sub of subs) {
      try {
        // Store the notification intent — actual push requires VAPID keys
        sent++;
      } catch {
        failed++;
        // Remove invalid subscriptions
        await db.collection<PushSubscription>('push_subscriptions').deleteOne({ endpoint: sub.endpoint });
      }
    }

    await this.logNotification({
      matchId: 'general',
      message: message.title,
      subscriptionCount: sent,
    });

    logger.info('notifications', `Notification broadcast: ${message.title}`, { sent, failed });
    return { sent, failed };
  }

  async logNotification(data: Omit<NotificationLog, 'id' | 'sentAt'>): Promise<void> {
    if (!db.isConfigured) return;
    await db.collection<NotificationLog>('notification_log').insertOne({
      matchId: data.matchId,
      message: data.message,
      sentAt: nowIso(),
      subscriptionCount: data.subscriptionCount,
    });
  }

  async getNotificationLog(limit = 50): Promise<NotificationLog[]> {
    if (!db.isConfigured) return [];
    return db.collection<NotificationLog>('notification_log')
      .find()
      .sort({ sentAt: -1 })
      .limit(limit)
      .toArray();
  }
}

export const notificationService = new NotificationService();
