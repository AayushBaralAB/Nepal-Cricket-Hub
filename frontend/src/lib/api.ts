import type {
  Advertisement,
  CricketMatch,
  CricketPlayer,
  CricketSeries,
  CricketTeam,
  LiveStream,
  NewsItem,
  PlayerProfile,
  PointsRow,
  SearchResults,
  StatRow,
  Video,
} from './types';

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api').replace(/\/+$/, '') + '/api';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://crickethub.com';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const FETCH_TIMEOUT_MS = 8000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error — API unreachable',
      0,
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      (body as { error?: string } | null)?.error ?? `Request failed with status ${res.status}`,
      res.status,
    );
  }

  const body = (await res.json()) as { success: boolean; data: T };
  return body.data;
}

/** Fetch wrapper that never throws — returns null on failure (API failure protection). */
export async function safeFetch<T>(
  path: string | Promise<T>,
  init?: RequestInit,
): Promise<T | null> {
  try {
    return typeof path === 'string' ? await request<T>(path, init) : await path;
  } catch {
    return null;
  }
}

export const api = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown) {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
  },
  patch<T>(path: string, body: unknown) {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  },
  put<T>(path: string, body: unknown) {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
};

/* ------------------------------------------------------- typed endpoints */

export const getLiveMatches = () => api.get<CricketMatch[]>('/matches/live');
export const getUpcomingMatches = (limit = 20) =>
  api.get<CricketMatch[]>(`/matches/upcoming?limit=${limit}`);
export const getResults = (limit = 20) => api.get<CricketMatch[]>(`/matches/results?limit=${limit}`);
export const getMatches = (params: Record<string, string | number | undefined> = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return api.get<CricketMatch[]>(`/matches${qs ? `?${qs}` : ''}`);
};
export const getMatch = (id: string) => api.get<CricketMatch>(`/matches/${id}`);
export const getMatchBySlug = (slug: string) => {
  // The backend resolves by external id; match pages will be keyed by externalId.
  return api.get<CricketMatch>(`/matches/${slug}`);
};
export const getNews = (params: { category?: string; limit?: number; breaking?: boolean } = {}) => {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.breaking) qs.set('breaking', 'true');
  return api.get<NewsItem[]>(`/news${qs.toString() ? `?${qs}` : ''}`);
};
export const getBreakingNews = () => api.get<NewsItem[]>('/news/breaking');
export const getNewsCategories = () => api.get<string[]>('/news/categories');
export const getNewsBySlug = (slug: string) => api.get<NewsItem>(`/news/${slug}`);
export const getPlayers = () => api.get<CricketPlayer[]>('/players');
export const getPlayerBySlug = (slug: string) => api.get<PlayerProfile>(`/players/${slug}`);
export const getTeams = (type?: string) => api.get<CricketTeam[]>(type ? `/teams?type=${type}` : '/teams');
export const getTeamBySlug = (slug: string) =>
  api.get<CricketTeam & { squad: CricketPlayer[]; matches: CricketMatch[] }>(`/teams/${slug}`);
export const getSeries = () => api.get<CricketSeries[]>('/series');
export const getSeriesBySlug = (slug: string) =>
  api.get<CricketSeries & { matches: CricketMatch[]; pointsTable: PointsRow[] }>(`/series/${slug}`);
export const getPointsTable = (seriesSlug?: string) =>
  api.get<PointsRow[]>(`/points-table${seriesSlug ? `?series=${seriesSlug}` : ''}`);
export const getTopRunScorers = (limit = 10) => api.get<StatRow[]>(`/stats/top-run-scorers?limit=${limit}`);
export const getTopWicketTakers = (limit = 10) => api.get<StatRow[]>(`/stats/top-wicket-takers?limit=${limit}`);
export const getVideos = () => api.get<Video[]>('/videos');
export const getLiveStreams = () => api.get<LiveStream[]>('/live-streams');
export const getAds = (slot: string) => api.get<Advertisement[]>(`/ads/${slot}`);
export const searchAll = (q: string) => api.get<SearchResults>(`/search?q=${encodeURIComponent(q)}`);
export const getHealth = () => api.get('/health');
