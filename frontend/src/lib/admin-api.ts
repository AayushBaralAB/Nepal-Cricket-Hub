import { API_BASE } from './api';
import type { AdminAnalytics, AdminHealth, AdminStats, AdminSyncResult } from './types';

export const ADMIN_API = `${API_BASE}/admin`;
const TOKEN_KEY = 'nch_admin_token';

export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function adminRequest<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const authToken = token ?? getAdminToken();
  const res = await fetch(`${ADMIN_API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (body as { error?: string } | null)?.error ??
      `Request failed with status ${res.status}`;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (body as { success: boolean; data: T }).data;
}

export const adminApi = {
  getStats: (token?: string) => adminRequest<AdminStats>('/stats', undefined, token),
  getHealth: (token?: string) => adminRequest<AdminHealth>('/health', undefined, token),
  syncCricket: (token?: string) =>
    adminRequest<AdminSyncResult>('/sync/cricket', { method: 'POST' }, token),
  syncNews: (token?: string) =>
    adminRequest<AdminSyncResult>('/sync/news', { method: 'POST' }, token),
  getNewsSources: (token?: string) =>
    adminRequest<Array<Record<string, unknown>>>('/news-sources', undefined, token),
  getAdvertisements: (token?: string) =>
    adminRequest<Array<Record<string, unknown>>>('/advertisements', undefined, token),
  getSettings: (token?: string) =>
    adminRequest<Array<Record<string, unknown>>>('/settings', undefined, token),
  getNews: (token?: string) =>
    adminRequest<Array<Record<string, unknown>>>('/news', undefined, token),
  getMatches: (token?: string) =>
    adminRequest<Array<Record<string, unknown>>>('/matches', undefined, token),
  getApiLogs: (token?: string) =>
    adminRequest<Array<Record<string, unknown>>>('/api-logs', undefined, token),
  getAnalytics: (token?: string) =>
    adminRequest<AdminAnalytics>('/analytics', undefined, token),
};
