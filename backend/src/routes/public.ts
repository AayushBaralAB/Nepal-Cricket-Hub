import { Router } from 'express';
import { cricketData } from '../services/CricketDataService';
import { matchService } from '../services/MatchService';
import { teamService } from '../services/TeamService';
import { seriesService } from '../services/SeriesService';
import { playerService } from '../services/PlayerService';
import { pointsTableService } from '../services/PointsTableService';
import { statsService } from '../services/StatsService';
import { newsService } from '../services/NewsService';
import { db } from '../db';
import { analytics, detectDevice } from '../services/AnalyticsService';

const router = Router();

function wrap(handler: (req: import('express').Request, res: import('express').Response) => unknown) {
  return (req: import('express').Request, res: import('express').Response) => {
    try {
      const result = handler(req, res) as unknown;
      if (result && typeof (result as Promise<unknown>).catch === 'function') {
        (result as Promise<void>).catch((err) => {
          console.error('[api] route error', err);
          res.status(500).json({ success: false, error: 'Internal server error' });
        });
      }
    } catch (err) {
      console.error('[api] route error', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };
}

const json = (res: import('express').Response, body: unknown, status = 200) =>
  res.status(status).json({ success: true, data: body });

/* ------------------------------------------------------------------ health */

router.get('/health', wrap((_req, res) => {
  json(res, { status: 'ok', cricket: cricketData.getHealth(), news: newsService.getHealth(), db: db.isConfigured });
}));

/* -------------------------------------------------------------- matches */

router.get('/matches', wrap((req, res) => {
  const q = req.query;
  const matches = cricketData.getMatches({
    status: q.status ? String(q.status) : undefined,
    type: q.type ? String(q.type) : undefined,
    team: q.team ? String(q.team) : undefined,
    series: q.series ? String(q.series) : undefined,
    women: q.women === 'true',
    u19: q.u19 === 'true',
    nepal: q.nepal === 'true',
    date: q.date ? String(q.date) : undefined,
    limit: q.limit ? Number(q.limit) : undefined,
  });
  json(res, matches);
}));

router.get('/matches/live', wrap((_req, res) => {
  json(res, cricketData.getMatches({ status: 'live' }));
}));

router.get('/matches/upcoming', wrap((req, res) => {
  json(res, cricketData.getMatches({ status: 'upcoming', limit: req.query.limit ? Number(req.query.limit) : 20 }));
}));

router.get('/matches/results', wrap((req, res) => {
  json(res, cricketData.getMatches({ status: 'completed', limit: req.query.limit ? Number(req.query.limit) : 20 }));
}));

router.get('/matches/:id', wrap(async (req, res) => {
  const match = await matchService.getDetailed(req.params.id);
  if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
  json(res, match);
}));

/* --------------------------------------------------------------- series */

router.get('/series', wrap((_req, res) => {
  json(res, seriesService.list());
}));

router.get('/series/:slug', wrap((req, res) => {
  const series = seriesService.getBySlug(req.params.slug);
  if (!series) return res.status(404).json({ success: false, error: 'Series not found' });
  json(res, {
    ...series,
    matches: seriesService.matchesForSeries(series.externalId),
    pointsTable: pointsTableService.getForSeries(series.externalId),
  });
}));

/* --------------------------------------------------------------- teams */

router.get('/teams', wrap((req, res) => {
  const type = req.query.type ? String(req.query.type) : undefined;
  json(res, type ? teamService.listForType(type) : teamService.list());
}));

router.get('/teams/:slug', wrap((req, res) => {
  const team = teamService.getBySlug(req.params.slug);
  if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
  json(res, {
    ...team,
    squad: teamService.squadByTeamSlug(req.params.slug),
    matches: cricketData.getMatches({ team: team.name, limit: 12 }),
  });
}));

/* ------------------------------------------------------------- players */

router.get('/players', wrap((req, res) => {
  json(res, playerService.list());
}));

router.get('/players/:slug', wrap(async (req, res) => {
  const profile = await playerService.getProfile(req.params.slug);
  if (!profile) return res.status(404).json({ success: false, error: 'Player not found' });
  json(res, profile);
}));

/* ------------------------------------------------------- points tables */

router.get('/points-table', wrap((req, res) => {
  const slug = req.query.series ? String(req.query.series) : undefined;
  json(res, slug ? pointsTableService.getBySeriesSlug(slug) : pointsTableService.listAvailable());
}));

/* ---------------------------------------------------------------- news */

router.get('/news', wrap((req, res) => {
  json(res, newsService.getNews({
    category: req.query.category ? String(req.query.category) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : 30,
    breaking: req.query.breaking === 'true',
  }));
}));

router.get('/news/breaking', wrap((_req, res) => {
  json(res, newsService.getBreaking());
}));

router.get('/news/categories', wrap((_req, res) => {
  json(res, newsService.getCategories());
}));

router.get('/news/:slug', wrap((req, res) => {
  const item = newsService.getNewsBySlug(req.params.slug);
  if (!item) return res.status(404).json({ success: false, error: 'Article not found' });
  json(res, item);
}));

/* --------------------------------------------------------------- stats */

router.get('/stats/top-run-scorers', wrap(async (req, res) => {
  json(res, await statsService.topRunScorers(req.query.limit ? Number(req.query.limit) : 10));
}));

router.get('/stats/top-wicket-takers', wrap(async (req, res) => {
  json(res, await statsService.topWicketTakers(req.query.limit ? Number(req.query.limit) : 10));
}));

router.get('/stats/tournament', wrap(async (req, res) => {
  json(res, await statsService.tournamentStats(String(req.query.name ?? 'Nepal Premier League')));
}));

/* -------------------------------------------------------------- videos */

router.get('/videos', wrap(async (_req, res) => {
  if (!db.isConfigured) return json(res, []);
  const rows = await db.collection('videos').find().sort({ publishedAt: -1 }).limit(20).toArray();
  json(res, rows.map((v) => ({
    id: String(v._id),
    title: String(v.title ?? ''),
    slug: String(v.slug ?? ''),
    description: v.description ? String(v.description) : undefined,
    videoUrl: String(v.videoUrl ?? ''),
    thumbnail: v.thumbnail ? String(v.thumbnail) : undefined,
    source: String(v.source ?? 'YouTube'),
    category: String(v.category ?? 'Highlights'),
    publishedAt: v.publishedAt ? String(v.publishedAt) : undefined,
    isFeatured: Boolean(v.isFeatured),
  })));
}));

/* ------------------------------------------------------------------ ads */

router.get('/ads/:slot', wrap(async (req, res) => {
  if (!db.isConfigured) return json(res, null);
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db.collection('advertisements')
    .find({ slot: req.params.slot, enabled: true })
    .toArray();
  const live = rows.filter((ad) => {
    if (ad.startDate && ad.startDate > today) return false;
    if (ad.endDate && ad.endDate < today) return false;
    return true;
  }).slice(0, 5);
  json(res, live.map((ad) => ({
    id: String(ad._id),
    name: String(ad.name ?? ''),
    slot: String(ad.slot ?? req.params.slot),
    format: String(ad.format ?? 'banner'),
    type: String(ad.type ?? 'image'),
    imageUrl: ad.imageUrl ? String(ad.imageUrl) : undefined,
    html: ad.html ? String(ad.html) : undefined,
    adClient: ad.adClient ? String(ad.adClient) : undefined,
    linkUrl: ad.linkUrl ? String(ad.linkUrl) : undefined,
  })));
}));

/* --------------------------------------------------------- search */

router.get('/search', wrap((req, res) => {
  const q = (req.query.q ? String(req.query.q) : '').toLowerCase().trim();
  if (!q) return json(res, { query: q, news: [], players: [], teams: [], matches: [], series: [] });

  const news = newsService.getNews({ limit: 10 }).filter((n) => n.title.toLowerCase().includes(q));
  const players = playerService.list().filter((p) => p.name.toLowerCase().includes(q));
  const teams = teamService.list().filter((t) => t.name.toLowerCase().includes(q));
  const matches = cricketData.getMatches().filter((m) => m.name.toLowerCase().includes(q));
  const series = seriesService.list().filter((s) => s.name.toLowerCase().includes(q));

  json(res, { query: q, news, players, teams, matches, series });
}));

/* -------------------------------------------------- live streams */

router.get('/live-streams', wrap(async (_req, res) => {
  if (!db.isConfigured) return json(res, []);
  const rows = await db.collection('live_streams')
    .find({ enabled: true })
    .sort({ order: 1 })
    .toArray();
  json(res, rows.map((r) => ({
    id: String(r._id),
    title: String(r.title ?? ''),
    videoId: String(r.videoId ?? ''),
    embedUrl: String(r.embedUrl ?? ''),
    platform: String(r.platform ?? 'youtube'),
    order: Number(r.order ?? 0),
  })));
}));

/* ------------------------------------------------------------ analytics */

router.post('/analytics/page-view', wrap((req, res) => {
  const ua = (req.headers['user-agent'] as string) ?? '';
  analytics.record({
    path: typeof req.body?.path === 'string' ? req.body.path : '/',
    at: new Date(),
    referer: typeof req.headers.referer === 'string' ? req.headers.referer : undefined,
    device: detectDevice(ua),
  });
  res.status(204).end();
}));

/* --------------------------------------------------- site settings */

router.get('/site', wrap(async (_req, res) => {
  if (!db.isConfigured) {
    return json(res, {
      name: 'CricketHub',
      tagline: 'All Nepal Cricket. One Hub.',
      domain: 'crickethub.com',
    });
  }
  const row = await db.collection('site_settings').findOne({ key: 'site' });
  json(res, (row?.value as Record<string, unknown>) ?? {});
}));

export default router;
