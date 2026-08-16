import { Router } from 'express';
import { timingSafeEqual } from 'crypto';
import { db } from '../db';
import { config } from '../config';
import { cricketData } from '../services/CricketDataService';
import { newsService } from '../services/NewsService';
import { analytics } from '../services/AnalyticsService';
import { logger } from '../utils/logger';
import { nowIso } from '../utils/helpers';
import { idFilter, toPlain, toPlainMany } from '../utils/mongo';

const router = Router();

/** Constant-time string comparison for the shared admin token. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function requireAdmin(req: import('express').Request, res: import('express').Response, next: () => void) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  if (!db.isConfigured) {
    return res.status(503).json({ success: false, error: 'Database not configured — admin endpoints unavailable' });
  }
  if (!config.admin.apiToken) {
    return res.status(503).json({ success: false, error: 'ADMIN_API_TOKEN is not configured on the backend.' });
  }
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (!safeEqual(token, config.admin.apiToken)) {
    return res.status(401).json({ success: false, error: 'Invalid admin token' });
  }
  next();
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
    db.collection('news').countDocuments({ status: 'published' }),
    db.collection('matches').countDocuments({ isLive: true }),
    db.collection('matches').countDocuments({ status: 'upcoming' }),
    db.collection('matches').countDocuments({ status: 'completed' }),
    db.collection('players').countDocuments({}),
    db.collection('teams').countDocuments({}),
    db.collection('api_logs').find({ level: 'error' }).sort({ createdAt: -1 }).limit(20).toArray(),
    db.collection('sync_status').find().toArray(),
  ]);

  json(res, {
    ...fromCache,
    dbConnected: true,
    news: newsCount ?? fromCache.news,
    liveMatches: liveCount ?? fromCache.liveMatches,
    upcomingMatches: upcomingCount ?? fromCache.upcomingMatches,
    completedMatches: completedCount ?? fromCache.completedMatches,
    players: playersCount ?? fromCache.players,
    teams: teamsCount ?? fromCache.teams,
    apiErrors: apiErrors.map((e) => ({
      id: String(e._id),
      level: e.level ?? null,
      endpoint: e.endpoint ?? null,
      message: e.message ?? null,
      created_at: e.createdAt ?? null,
    })),
    syncStatus: syncStatus.map((s) => ({ id: String(s._id), ...s, created_at: s.updatedAt ?? null })),
    lastCricketUpdate: cricketData.lastSyncSuccessAt,
    lastNewsUpdate: newsService.lastFetchSuccessAt,
  });
});

/* -------------------------------------------------------- analytics */

router.get('/analytics', (_req, res) => {
  json(res, analytics.summary());
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
  const rows = await db.collection('news_sources').find().sort({ name: 1 }).toArray();
  json(res, toPlainMany(rows));
});

router.post('/news-sources', async (req, res) => {
  const { name, url, type, category, enabled } = req.body ?? {};
  if (!name || !url) return res.status(400).json({ success: false, error: 'name and url are required' });
  try {
    const { insertedId } = await db.collection('news_sources').insertOne({
      name, url, type: type ?? 'rss', category: category ?? 'Nepal Cricket',
      enabled: enabled !== false, createdAt: nowIso(),
    });
    json(res, { id: String(insertedId), name, url, type: type ?? 'rss', category: category ?? 'Nepal Cricket', enabled: enabled !== false }, 201);
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Insert failed' });
  }
});

router.patch('/news-sources/:id', async (req, res) => {
  try {
    const { matchedCount } = await db.collection('news_sources').updateOne(
      idFilter(req.params.id),
      { $set: { ...(req.body ?? {}), updatedAt: nowIso() } },
    );
    if (!matchedCount) return res.status(404).json({ success: false, error: 'Source not found' });
    json(res, { ok: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Update failed' });
  }
});

router.delete('/news-sources/:id', async (req, res) => {
  try {
    const { deletedCount } = await db.collection('news_sources').deleteOne(idFilter(req.params.id));
    if (!deletedCount) return res.status(404).json({ success: false, error: 'Source not found' });
    json(res, { deleted: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Delete failed' });
  }
});

/* ------------------------------------------------------- advertisements */

router.get('/advertisements', async (_req, res) => {
  const rows = await db.collection('advertisements').find().sort({ name: 1 }).toArray();
  json(res, toPlainMany(rows));
});

router.post('/advertisements', async (req, res) => {
  try {
    const body = req.body ?? {};
    const { insertedId } = await db.collection('advertisements').insertOne({
      ...body,
      enabled: body.enabled !== false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    json(res, { id: String(insertedId), ...body, enabled: body.enabled !== false }, 201);
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Insert failed' });
  }
});

router.patch('/advertisements/:id', async (req, res) => {
  try {
    const { matchedCount } = await db.collection('advertisements').updateOne(
      idFilter(req.params.id),
      { $set: { ...(req.body ?? {}), updatedAt: nowIso() } },
    );
    if (!matchedCount) return res.status(404).json({ success: false, error: 'Advertisement not found' });
    json(res, { ok: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Update failed' });
  }
});

router.delete('/advertisements/:id', async (req, res) => {
  try {
    const { deletedCount } = await db.collection('advertisements').deleteOne(idFilter(req.params.id));
    if (!deletedCount) return res.status(404).json({ success: false, error: 'Advertisement not found' });
    json(res, { deleted: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Delete failed' });
  }
});

/* ------------------------------------------------------ site settings */

router.get('/settings', async (_req, res) => {
  const rows = await db.collection('site_settings').find().toArray();
  json(res, rows.map((s) => ({ key: s.key, value: s.value })));
});

router.put('/settings/:key', async (req, res) => {
  const { value } = req.body ?? {};
  await db.collection('site_settings').updateOne(
    { key: req.params.key },
    { $set: { value: value ?? req.body ?? {}, updatedAt: nowIso() } },
    { upsert: true },
  );
  json(res, { key: req.params.key, value: value ?? req.body ?? {} });
});

/* ------------------------------------------------------------- news */

router.get('/news', async (_req, res) => {
  const rows = await db.collection('news')
    .find()
    .sort({ publishedAt: -1 })
    .limit(100)
    .toArray();
  json(res, toPlainMany(rows));
});

router.post('/news', async (req, res) => {
  const body = req.body ?? {};
  try {
    const { insertedId } = await db.collection('news').insertOne({
      ...body,
      isFeatured: Boolean(body.isFeatured),
      status: body.status ?? 'published',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    json(res, { id: String(insertedId), ...body }, 201);
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Insert failed' });
  }
});

router.patch('/news/:id', async (req, res) => {
  try {
    const { matchedCount } = await db.collection('news').updateOne(
      idFilter(req.params.id),
      { $set: { ...(req.body ?? {}), updatedAt: nowIso() } },
    );
    if (!matchedCount) return res.status(404).json({ success: false, error: 'Article not found' });
    json(res, { ok: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Update failed' });
  }
});

router.delete('/news/:id', async (req, res) => {
  try {
    const { deletedCount } = await db.collection('news').deleteOne(idFilter(req.params.id));
    if (!deletedCount) return res.status(404).json({ success: false, error: 'Article not found' });
    json(res, { deleted: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Delete failed' });
  }
});

/* ----------------------------------------------------------- matches */

router.get('/matches', async (_req, res) => {
  json(res, cricketData.getMatches({ limit: 200 }));
});

router.patch('/matches/:id', async (req, res) => {
  // Manual overrides are only allowed as exceptions; scheduled sync wins on the next run.
  if (!db.isConfigured) return res.status(503).json({ success: false, error: 'DB not configured' });
  const { matchedCount } = await db.collection('matches').updateOne(
    { externalId: req.params.id },
    { $set: { ...(req.body ?? {}), updatedAt: nowIso() } },
  );
  if (matchedCount) return json(res, { ok: true });

  // Fall back to the Mongo document id.
  try {
    const { matchedCount: byId } = await db.collection('matches').updateOne(
      idFilter(req.params.id),
      { $set: { ...(req.body ?? {}), updatedAt: nowIso() } },
    );
    return json(res, { ok: Boolean(byId) });
  } catch {
    return res.status(404).json({ success: false, error: 'Match not found' });
  }
});

/* ---------------------------------------------------------- api logs */

router.get('/api-logs', async (_req, res) => {
  const rows = await db.collection('api_logs')
    .find()
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  json(res, rows.map((e) => toPlain(e)));
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
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      await db.collection('users').updateOne(
        { _id: existing._id },
        { $set: { role: 'admin', isActive: true, updatedAt: nowIso() } },
      );
    } else {
      await db.collection('users').insertOne({
        email, fullName: 'Administrator', role: 'admin', isActive: true,
        createdAt: nowIso(), updatedAt: nowIso(),
      });
    }
    logger.info('admin', `Admin bootstrap: ${email}`);
    json(res, { ok: true, message: 'Admin user ensured. Use the ADMIN_API_TOKEN from the backend .env to authenticate.' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
