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

async function newsSync() {
  const started = Date.now();
  logger.info('jobs', 'news_sync starting');
  const result = await newsService.fetchAndStore();
  logger.info('jobs', `news_sync finished in ${Date.now() - started}ms — added ${result.added}`);
}

async function cleanup() {
  if (!db.isConfigured) return;
  try {
    const cutoff = new Date(Date.now() - config.retention.apiLogDays * 24 * 60 * 60 * 1000).toISOString();
    await db.admin.from('api_logs').delete().lt('created_at', cutoff);
    logger.info('jobs', `Cleanup finished. Trimmed api_logs older than ${config.retention.apiLogDays} days.`);
  } catch (err) {
    logger.error('jobs', 'Cleanup failed', err);
  }
}

export function startScheduler() {
  if (config.cricket.provider === 'http' && !config.cricket.apiBaseUrl) {
    logger.warn('jobs', 'Cricket provider is "http" but CRICKET_API_BASE_URL is missing — sync will use the sample provider.');
  }

  const cricketTask = cron.schedule(config.cron.cricket, () => {
    cricketSync().catch((err) => logger.error('jobs', 'cricket_sync threw', err));
  });
  const newsTask = cron.schedule(config.cron.news, () => {
    newsSync().catch((err) => logger.error('jobs', 'news_sync threw', err));
  });
  const cleanupTask = cron.schedule(config.cron.cleanup, () => {
    cleanup().catch((err) => logger.error('jobs', 'cleanup threw', err));
  });

  // Fire the first sync immediately on startup so data is fresh right away.
  setTimeout(() => {
    cricketSync().catch(() => undefined);
    newsSync().catch(() => undefined);
  }, 2000);

  logger.info('jobs', `Scheduler started. cricket=[${config.cron.cricket}] news=[${config.cron.news}] cleanup=[${config.cron.cleanup}]`);

  return { cricketTask, newsTask, cleanupTask, syncNow: cricketSync, newsNow: newsSync };
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
