import { db } from '../db';
import { cricketData } from '../services/CricketDataService';
import { newsService } from '../services/NewsService';
import { logger } from '../utils/logger';

/** Connect to MongoDB, prime the in-memory cache, then run one full sync cycle. */
export async function bootstrap() {
  if (db.isConfigured) {
    try {
      await db.connect();
      logger.info('bootstrap', 'Connected to MongoDB');
    } catch (err) {
      logger.error('bootstrap', 'MongoDB connection failed — continuing with cache-only data', err);
    }
  } else {
    logger.warn('bootstrap', 'MONGO_URL is not set — database operations will be unavailable.');
  }

  await cricketData.primeFromDatabase();

  if (cricketData.getMatches().length === 0) {
    logger.info('bootstrap', 'Cache empty — running initial cricket sync');
    await cricketData.syncAll();
  } else {
    logger.info('bootstrap', 'Cache primed, skipping initial cricket sync');
  }

  if (newsService.getNews().length === 0) {
    logger.info('bootstrap', 'News cache empty — running initial news sync');
    await newsService.fetchAndStore();
  } else {
    logger.info('bootstrap', 'News primed, skipping initial news sync');
  }
}
