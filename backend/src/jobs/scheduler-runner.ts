import { startScheduler } from './scheduler';
import { config } from '../config';
import { assertConfig } from '../config';

assertConfig();

console.log(`[jobs] Nepal Cricket Hub scheduler running in ${config.env} mode`);
console.log(`[jobs] Cricket provider: ${config.cricket.provider}`);

startScheduler();

// Keep the process alive.
const keepAlive = setInterval(() => undefined, 60 * 60 * 1000);
process.on('SIGINT', () => {
  clearInterval(keepAlive);
  console.log('[jobs] Shutting down scheduler');
  process.exit(0);
});
process.on('SIGTERM', () => {
  clearInterval(keepAlive);
  console.log('[jobs] Shutting down scheduler');
  process.exit(0);
});
