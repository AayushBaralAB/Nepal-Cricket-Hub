import dotenv from 'dotenv';

dotenv.config();

function int(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

function list(name: string): string[] {
  const v = process.env[name];
  if (!v) return [];
  return v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const provider = (process.env.CRICKET_PROVIDER ?? 'sample') as 'sample' | 'http' | 'cricapi';

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: int('PORT', 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  mongo: {
    url: process.env.MONGO_URL ?? '',
    dbName: process.env.MONGO_DB_NAME ?? 'nepal_cricket_hub',
  },
  admin: {
    apiToken: process.env.ADMIN_API_TOKEN ?? '',
  },
  cricket: {
    provider: (process.env.CRICKET_PROVIDER ?? 'sample') as 'sample' | 'http' | 'cricapi',
    apiBaseUrl: process.env.CRICKET_API_BASE_URL ?? '',
    apiKey: process.env.CRICKET_API_KEY ?? '',
  },
  news: {
    rssFeeds: list('NEWS_RSS_FEEDS'),
  },
  cron: {
    cricket: process.env.CRON_CRICKET ?? (provider === 'cricapi' ? '0 */6 * * *' : '*/2 * * * *'),
    liveRefresh: process.env.CRON_LIVE_REFRESH ?? (provider === 'cricapi' ? '30 */2 * * *' : ''),
    news: process.env.CRON_NEWS ?? '*/10 * * * *',
    cleanup: process.env.CRON_CLEANUP ?? '0 * * * *',
  },
  retention: {
    apiLogDays: int('API_LOG_RETENTION_DAYS', 14),
  },
};

export const isProduction = config.env === 'production';

export function assertConfig() {
  const missing: string[] = [];
  if (!config.mongo.url) missing.push('MONGO_URL');
  if (config.cricket.provider === 'http' && !config.cricket.apiBaseUrl) {
    missing.push('CRICKET_API_BASE_URL');
  }
  if (config.cricket.provider === 'cricapi' && !config.cricket.apiKey) {
    missing.push('CRICKET_API_KEY');
  }
  if (missing.length) {
    // We still allow the app to boot for the frontend-only parts, but log loudly.
    console.warn(
      `[config] Missing environment variables: ${missing.join(', ')}. ` +
        `Cricket/news sync will be disabled until these are set.`
    );
  }
}
