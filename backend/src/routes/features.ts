import { Router } from 'express';
import { notificationService } from '../services/NotificationService';
import { reminderService } from '../services/ReminderService';
import { predictionService } from '../services/PredictionService';
import { galleryService } from '../services/GalleryService';
import { db } from '../db';

const router = Router();

function wrap(handler: (req: import('express').Request, res: import('express').Response) => unknown) {
  return (req: import('express').Request, res: import('express').Response) => {
    try {
      const result = handler(req, res) as unknown;
      if (result && typeof (result as Promise<unknown>).catch === 'function') {
        (result as Promise<void>).catch((err) => {
          console.error('[features] route error', err);
          res.status(500).json({ success: false, error: 'Internal server error' });
        });
      }
    } catch (err) {
      console.error('[features] route error', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };
}

const json = (res: import('express').Response, body: unknown, status = 200) =>
  res.status(status).json({ success: true, data: body });

/* ------------------------------------------------------------ notifications */

router.post('/notifications/subscribe', wrap(async (req, res) => {
  if (!db.isConfigured) return res.status(503).json({ success: false, error: 'Database not configured' });
  const { endpoint, keys } = req.body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ success: false, error: 'Missing endpoint or keys' });
  }
  const result = await notificationService.subscribe({ endpoint, keys });
  json(res, result, 201);
}));

router.delete('/notifications/unsubscribe', wrap(async (req, res) => {
  if (!db.isConfigured) return res.status(503).json({ success: false, error: 'Database not configured' });
  const endpoint = req.query.endpoint as string | undefined;
  if (!endpoint) {
    return res.status(400).json({ success: false, error: 'Missing endpoint' });
  }
  const removed = await notificationService.unsubscribe(endpoint);
  json(res, { removed });
}));

/* -------------------------------------------------------------- reminders */

router.post('/reminders', wrap(async (req, res) => {
  if (!db.isConfigured) return res.status(503).json({ success: false, error: 'Database not configured' });
  const { matchId, matchTitle, userIdentifier, remindBeforeMinutes } = req.body ?? {};
  if (!matchId || !matchTitle || !userIdentifier) {
    return res.status(400).json({ success: false, error: 'Missing matchId, matchTitle, or userIdentifier' });
  }
  const result = await reminderService.addReminder({ matchId, matchTitle, userIdentifier, remindBeforeMinutes });
  json(res, result, 201);
}));

router.get('/reminders/:matchId', wrap(async (req, res) => {
  if (!db.isConfigured) return json(res, []);
  const reminders = await reminderService.getRemindersForMatch(req.params.matchId);
  json(res, reminders);
}));

router.delete('/reminders/:id', wrap(async (req, res) => {
  if (!db.isConfigured) return res.status(503).json({ success: false, error: 'Database not configured' });
  const removed = await reminderService.removeReminder(req.params.id);
  if (!removed) return res.status(404).json({ success: false, error: 'Reminder not found' });
  json(res, { removed: true });
}));

/* ------------------------------------------------------------- predictions */

router.post('/predictions', wrap(async (req, res) => {
  if (!db.isConfigured) return res.status(503).json({ success: false, error: 'Database not configured' });
  const { matchId, userIdentifier, predictedWinner, predictedScore, predictedManOfMatch } = req.body ?? {};
  if (!matchId || !userIdentifier || !predictedWinner) {
    return res.status(400).json({ success: false, error: 'Missing matchId, userIdentifier, or predictedWinner' });
  }
  const result = await predictionService.addPrediction({ matchId, userIdentifier, predictedWinner, predictedScore, predictedManOfMatch });
  json(res, result, 201);
}));

router.get('/predictions/:matchId/stats', wrap(async (req, res) => {
  if (!db.isConfigured) return json(res, { totalVotes: 0, winnerVotes: [], avgPredictedScore: 0 });
  const stats = await predictionService.getMatchStats(req.params.matchId);
  json(res, stats);
}));

router.get('/predictions/user/:userId', wrap(async (req, res) => {
  if (!db.isConfigured) return json(res, []);
  const predictions = await predictionService.getUserPredictions(req.params.userId);
  json(res, predictions);
}));

/* ----------------------------------------------------------------- photos */

router.get('/photos', wrap(async (req, res) => {
  if (!db.isConfigured) return json(res, []);
  await galleryService.seed();
  const tag = req.query.tag ? String(req.query.tag) : undefined;
  const matchId = req.query.matchId ? String(req.query.matchId) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const photos = await galleryService.getPhotos({ tag, matchId, limit });
  json(res, photos);
}));

router.get('/photos/:matchId', wrap(async (req, res) => {
  if (!db.isConfigured) return json(res, []);
  await galleryService.seed();
  const photos = await galleryService.getPhotosByMatch(req.params.matchId);
  json(res, photos);
}));

export default router;
