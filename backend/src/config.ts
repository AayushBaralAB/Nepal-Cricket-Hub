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

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: int('PORT', 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    anonKey: process.env.SUPABASE_ANON_KEY ?? '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY ?? '',
  },
  cricket: {
    provider: (process.env.CRICKET_PROVIDER ?? 'sample') as 'sample' | 'http',
    apiBaseUrl: process.env.CRICKET_API_BASE_URL ?? '',
    apiKey: process.env.CRICKET_API_KEY ?? '',
  },
  news: {
    rssFeeds: list('NEWS_RSS_FEEDS'),
  },
  cron: {
    cricket: process.env.CRON_CRICKET ?? '*/2 * * * *',
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
  if (!config.supabase.url) missing.push('SUPABASE_URL');
  if (!config.supabase.serviceKey) missing.push('SUPABASE_SERVICE_KEY');
  if (config.cricket.provider === 'http' && !config.cricket.apiBaseUrl) {
    missing.push('CRICKET_API_BASE_URL');
  }
  if (missing.length) {
    // We still allow the app to boot for the frontend-only parts, but log loudly.
    console.warn(
      `[config] Missing environment variables: ${missing.join(', ')}. ` +
        `Cricket/news sync will be disabled until these are set.`
    );
  }
}
