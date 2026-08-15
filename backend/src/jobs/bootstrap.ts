import { cricketData } from '../services/CricketDataService';
import { newsService } from '../services/NewsService';
import { logger } from '../utils/logger';

/** Prime the in-memory cache from the database, then run one full sync cycle. */
export async function bootstrap() {
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
