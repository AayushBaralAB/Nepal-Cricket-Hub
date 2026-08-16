import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, assertConfig } from './config';
import { db } from './db';
import { logger } from './utils/logger';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import { bootstrap } from './jobs/bootstrap';
import { startScheduler } from './jobs/scheduler';

assertConfig();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigin.split(',') }));
app.use(express.json({ limit: '2mb' }));

app.use(
  '/api',
  rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }),
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'nepal-cricket-hub-backend', time: new Date().toISOString() });
});

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('api', 'Unhandled error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const server = app.listen(config.port, () => {
  logger.info('api', `Nepal Cricket Hub API listening on http://localhost:${config.port} (${config.env})`);
  logger.info('api', `Database configured: ${db.isConfigured}${db.isConfigured ? ` (connected: ${db.isConnected})` : ''}`);
  if (config.cricket.provider === 'http' && !config.cricket.apiBaseUrl) {
    logger.warn('api', 'CRICKET_API_BASE_URL is empty — using sample cricket provider.');
  }
});

const graceful = () => {
  logger.info('api', 'Shutting down gracefully...');
  server.close(() => {
    db.close().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGINT', graceful);
process.on('SIGTERM', graceful);

async function main() {
  await bootstrap();
  startScheduler();
}

main().catch((err) => {
  logger.error('api', 'Startup failed', err);
});
