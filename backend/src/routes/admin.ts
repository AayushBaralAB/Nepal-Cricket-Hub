import { Router } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from '../db';
import { config } from '../config';
import { cricketData } from '../services/CricketDataService';
import { newsService } from '../services/NewsService';
import { logger } from '../utils/logger';

const router = Router();

function requireAdmin(req: import('express').Request, res: import('express').Response, next: () => void) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (!db.isConfigured) {
    return res.status(503).json({ success: false, error: 'Database not configured — admin endpoints unavailable' });
  }

  const authClient = createClient(config.supabase.url, config.supabase.anonKey);
  authClient.auth.getUser(token).then(({ data, error }) => {
    if (error || !data.user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    db.admin
      .from('users')
      .select('role')
      .eq('email', data.user.email ?? '')
      .maybeSingle()
      .then(
        ({ data: userRow }) => {
          if (userRow?.role !== 'admin') {
            res.status(403).json({ success: false, error: 'Admin access required' });
            return;
          }
          next();
        },
        () => res.status(500).json({ success: false, error: 'Admin check failed' }),
      );
  }, () => res.status(500).json({ success: false, error: 'Auth check failed' }));
}

router.use('/:section', (req, res, next) => {
  const publicSections = ['health', 'stats'];
  const section = req.params.section;
  if (publicSections.includes(section)) return next();
  return requireAdmin(req, res, next);
});

const json = (res: import('express').Response, body: unknown, status = 200) =>
  res.status(status).json({ success: true, data: body });

/* ------------------------------------------------------------- health */

router.get('/health', (_req, res) => {
  json(res, {
    cricket: cricketData.getHealth(),
    news: newsService.getHealth(),
    db: db.isConfigured,
  });
});

/* ------------------------------------------------------------- stats */

router.get('/stats', async (_req, res) => {
  const fromCache = {
    news: newsService.getNews().length,
    liveMatches: cricketData.getMatches({ status: 'live' }).length,
    upcomingMatches: cricketData.getMatches({ status: 'upcoming' }).length,
    completedMatches: cricketData.getMatches({ status: 'completed' }).length,
    players: cricketData.getPlayers().length,
    teams: cricketData.getTeams().length,
    series: cricketData.getSeries().length,
  };

  if (!db.isConfigured) {
    return json(res, {
      ...fromCache,
      dbConnected: false,
      apiErrors: [],
      lastCricketUpdate: cricketData.lastSyncSuccessAt,
      lastNewsUpdate: newsService.lastFetchSuccessAt,
    });
  }

  const [
    newsCount, liveCount, upcomingCount, completedCount, playersCount, teamsCount,
    apiErrors, syncStatus,
  ] = await Promise.all([
    db.admin.from('news').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    db.admin.from('matches').select('id', { count: 'exact', head: true }).eq('is_live', true),
    db.admin.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
    db.admin.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    db.admin.from('players').select('id', { count: 'exact', head: true }),
    db.admin.from('teams').select('id', { count: 'exact', head: true }),
    db.admin.from('api_logs').select('*').eq('level', 'error').order('created_at', { ascending: false }).limit(20),
    db.admin.from('sync_status').select('*'),
  ]);

  json(res, {
    ...fromCache,
    dbConnected: true,
    news: newsCount.count ?? fromCache.news,
    liveMatches: liveCount.count ?? fromCache.liveMatches,
    upcomingMatches: upcomingCount.count ?? fromCache.upcomingMatches,
    completedMatches: completedCount.count ?? fromCache.completedMatches,
    players: playersCount.count ?? fromCache.players,
    teams: teamsCount.count ?? fromCache.teams,
    apiErrors: apiErrors.data ?? [],
    syncStatus: syncStatus.data ?? [],
    lastCricketUpdate: cricketData.lastSyncSuccessAt,
    lastNewsUpdate: newsService.lastFetchSuccessAt,
  });
});

/* ------------------------------------------------------------- sync */

router.post('/sync/cricket', async (_req, res) => {
  const result = await cricketData.syncAll();
  json(res, result);
});

router.post('/sync/news', async (_req, res) => {
  const result = await newsService.fetchAndStore();
  json(res, result);
});

/* ------------------------------------------------------- news sources */

router.get('/news-sources', async (_req, res) => {
  const { data } = await db.admin.from('news_sources').select('*').order('name');
  json(res, data ?? []);
});

router.post('/news-sources', async (req, res) => {
  const { name, url, type, category, enabled } = req.body ?? {};
  if (!name || !url) return res.status(400).json({ success: false, error: 'name and url are required' });
  const { data, error } = await db.admin
    .from('news_sources').insert({ name, url, type: type ?? 'rss', category: category ?? 'Nepal Cricket', enabled: enabled !== false })
    .select().maybeSingle();
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, data, 201);
});

router.patch('/news-sources/:id', async (req, res) => {
  const { data, error } = await db.admin
    .from('news_sources').update(req.body ?? {}).eq('id', req.params.id).select().maybeSingle();
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, data);
});

router.delete('/news-sources/:id', async (req, res) => {
  const { error } = await db.admin.from('news_sources').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, { deleted: true });
});

/* ------------------------------------------------------- advertisements */

router.get('/advertisements', async (_req, res) => {
  const { data } = await db.admin.from('advertisements').select('*').order('name');
  json(res, data ?? []);
});

router.post('/advertisements', async (req, res) => {
  const { data, error } = await db.admin.from('advertisements').insert(req.body ?? {}).select().maybeSingle();
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, data, 201);
});

router.patch('/advertisements/:id', async (req, res) => {
  const { data, error } = await db.admin
    .from('advertisements').update(req.body ?? {}).eq('id', req.params.id).select().maybeSingle();
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, data);
});

router.delete('/advertisements/:id', async (req, res) => {
  const { error } = await db.admin.from('advertisements').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, { deleted: true });
});

/* ------------------------------------------------------ site settings */

router.get('/settings', async (_req, res) => {
  const { data } = await db.admin.from('site_settings').select('*');
  json(res, data ?? []);
});

router.put('/settings/:key', async (req, res) => {
  const { data, error } = await db.admin
    .from('site_settings').upsert({ key: req.params.key, value: req.body ?? {} }, { onConflict: 'key' })
    .select().maybeSingle();
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, data);
});

/* ------------------------------------------------------------- news */

router.get('/news', async (req, res) => {
  const { data } = await db.admin
    .from('news').select('*')
    .order('published_at', { ascending: false })
    .range(0, 99);
  json(res, data ?? []);
});

router.post('/news', async (req, res) => {
  const { data, error } = await db.admin.from('news').insert(req.body ?? {}).select().maybeSingle();
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, data, 201);
});

router.patch('/news/:id', async (req, res) => {
  const { data, error } = await db.admin
    .from('news').update(req.body ?? {}).eq('id', req.params.id).select().maybeSingle();
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, data);
});

router.delete('/news/:id', async (req, res) => {
  const { error } = await db.admin.from('news').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ success: false, error: error.message });
  json(res, { deleted: true });
});

/* ----------------------------------------------------------- matches */

router.get('/matches', async (_req, res) => {
  json(res, cricketData.getMatches({ limit: 200 }));
});

router.patch('/matches/:id', async (req, res) => {
  // Manual overrides are only allowed as exceptions; scheduled sync wins on the next run.
  if (!db.isConfigured) return res.status(503).json({ success: false, error: 'DB not configured' });
  const { data } = await db.admin
    .from('matches').update(req.body ?? {}).eq('external_id', req.params.id).select().maybeSingle();
  if (!data) {
    const { data: byUuid } = await db.admin
      .from('matches').update(req.body ?? {}).eq('id', req.params.id).select().maybeSingle();
    return json(res, byUuid);
  }
  json(res, data);
});

/* ---------------------------------------------------------- api logs */

router.get('/api-logs', async (req, res) => {
  const { data } = await db.admin
    .from('api_logs').select('*')
    .order('created_at', { ascending: false })
    .range(0, 99);
  json(res, data ?? []);
});

/* ---------------------------------------------------- admin bootstrap */

router.post('/bootstrap', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'email and password required' });
  }
  if (config.env === 'production') {
    return res.status(403).json({ success: false, error: 'Bootstrap endpoint disabled in production' });
  }
  try {
    const { data: existing } = await db.admin.from('users').select('id').eq('email', email).maybeSingle();
    if (!existing) {
      await db.admin.from('users').insert({ email, full_name: 'Administrator', role: 'admin', is_active: true });
    } else {
      await db.admin.from('users').update({ role: 'admin' }).eq('id', existing.id);
    }
    logger.info('admin', `Admin bootstrap: ${email}`);
    json(res, { ok: true, message: 'Admin user ensured. Sign in through Supabase Auth to obtain a session.' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
