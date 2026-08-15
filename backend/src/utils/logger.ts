export interface LogEntry {
  source: string;
  level: 'info' | 'warn' | 'error';
  endpoint?: string;
  statusCode?: number;
  message: string;
  payload?: unknown;
}

import { db } from '../db';

export function log(entry: LogEntry) {
  const line = `[${entry.level.toUpperCase()}] [${entry.source}] ${entry.message}`;
  if (entry.level === 'error') console.error(line);
  else if (entry.level === 'warn') console.warn(line);
  else console.log(line);

  if (!db.isConfigured) return;
  db.admin
    .from('api_logs')
    .insert({
      source: entry.source,
      level: entry.level,
      endpoint: entry.endpoint ?? null,
      status_code: entry.statusCode ?? null,
      message: entry.message,
      payload: entry.payload ?? null,
    })
    .then(
      () => undefined,
      (err: unknown) => console.error('[logger] failed to persist log entry', err),
    );
}

export const logger = {
  info: (source: string, message: string, payload?: unknown) =>
    log({ source, level: 'info', message, payload }),
  warn: (source: string, message: string, payload?: unknown) =>
    log({ source, level: 'warn', message, payload }),
  error: (source: string, message: string, payload?: unknown) =>
    log({ source, level: 'error', message, payload }),
};
