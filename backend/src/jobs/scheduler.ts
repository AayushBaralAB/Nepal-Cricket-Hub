import cron from 'node-cron';
import { config } from '../config';
import { db } from '../db';
import { logger } from '../utils/logger';
import { cricketData } from '../services/CricketDataService';
import { newsService } from '../services/NewsService';
import { nowIso } from '../utils/helpers';

async function cricketSync() {
  const started = Date.now();
  logger.info('jobs', 'cricket_sync starting');
  const result = await cricketData.syncAll();
  logger.info('jobs', `cricket_sync finished in ${Date.now() - started}ms (ok=${result.ok})`);
}

async function liveRefresh() {
  const started = Date.now();
  logger.info('jobs', 'cricket_live_refresh starting');
  const result = await cricketData.refreshLive();
  logger.info('jobs', `cricket_live_refresh finished in ${Date.now() - started}ms (ok=${result.ok})`);
}

async function newsSync() {
  const started = Date.now();
  logger.info('jobs', 'news_sync starting');
  const result = await newsService.fetchAndStore();
  logger.info('jobs', `news_sync finished in ${Date.now() - started}ms — added ${result.added}`);
}

async function processReminders() {
  if (!db.isConfigured) return;
  try {
    const upcoming = await db.collection('match_reminders')
      .find({ notified: false })
      .toArray();
    const now = Date.now();
    let notified = 0;
    for (const r of upcoming) {
      const matchTime = new Date(String(r.matchTime ?? '')).getTime();
      if (!matchTime || isNaN(matchTime)) continue;
      const diffMs = matchTime - now;
      const diffMin = diffMs / 60000;
      if (diffMin <= Number(r.remindBeforeMinutes ?? 60) && diffMin > -60) {
        await db.collection('match_reminders').updateOne(
          { _id: r._id },
          { $set: { notified: true, notifiedAt: nowIso() } },
        );
        notified++;
      }
    }
    if (notified > 0) logger.info('jobs', `Reminders: notified ${notified} users`);
  } catch (err) {
    logger.error('jobs', 'processReminders failed', err);
  }
}

async function cleanup() {
  if (!db.isConfigured) return;
  try {
    const cutoff = new Date(Date.now() - config.retention.apiLogDays * 24 * 60 * 60 * 1000);
    const { deletedCount } = await db.collection('api_logs').deleteMany({ createdAt: { $lt: cutoff } });
    logger.info('jobs', `Cleanup finished. Trimmed ${deletedCount} api_logs older than ${config.retention.apiLogDays} days.`);
  } catch (err) {
    logger.error('jobs', 'Cleanup failed', err);
  }
}

export function startScheduler() {
  if (config.cricket.provider === 'http' && !config.cricket.apiBaseUrl) {
    logger.warn('jobs', 'Cricket provider is "http" but CRICKET_API_BASE_URL is missing — sync will use the sample provider.');
  }
  if (config.cricket.provider === 'cricapi' && !config.cricket.apiKey) {
    logger.warn('jobs', 'Cricket provider is "cricapi" but CRICKET_API_KEY is missing — sync will use the sample provider.');
  }

  const cricketTask = cron.schedule(config.cron.cricket, () => {
    cricketSync().catch((err) => logger.error('jobs', 'cricket_sync threw', err));
  });
  let liveTask: ReturnType<typeof cron.schedule> | null = null;
  if (config.cron.liveRefresh) {
    liveTask = cron.schedule(config.cron.liveRefresh, () => {
      liveRefresh().catch((err) => logger.error('jobs', 'cricket_live_refresh threw', err));
    });
  }
  const newsTask = cron.schedule(config.cron.news, () => {
    newsSync().catch((err) => logger.error('jobs', 'news_sync threw', err));
  });
  const cleanupTask = cron.schedule(config.cron.cleanup, () => {
    cleanup().catch((err) => logger.error('jobs', 'cleanup threw', err));
  });
  const reminderTask = cron.schedule('* * * * *', () => {
    processReminders().catch((err) => logger.error('jobs', 'processReminders threw', err));
  });

  // Fire the first sync immediately on startup so data is fresh right away.
  setTimeout(() => {
    cricketSync().catch(() => undefined);
    newsSync().catch(() => undefined);
  }, 2000);

  logger.info(
    'jobs',
    `Scheduler started. cricket=[${config.cron.cricket}] liveRefresh=[${config.cron.liveRefresh || 'off'}] news=[${config.cron.news}] cleanup=[${config.cron.cleanup}] reminders=[every minute]`,
  );

  return { cricketTask, liveTask, newsTask, cleanupTask, reminderTask, syncNow: cricketSync, newsNow: newsSync };
}

export async function manualSyncCricket() {
  return cricketData.syncAll();
}

export async function manualSyncNews() {
  return newsService.fetchAndStore();
}

export function touchSyncStatus() {
  void nowIso;
}
