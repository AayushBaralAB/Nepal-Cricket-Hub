import type { MetadataRoute } from 'next';
import { SITE_URL, safeFetch, getNews, getPlayers, getSeries } from '@/lib/api';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'always', priority: 1 },
    { url: `${SITE_URL}/live`, lastModified: now, changeFrequency: 'always', priority: 0.9 },
    { url: `${SITE_URL}/matches`, lastModified: now, changeFrequency: 'always', priority: 0.9 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${SITE_URL}/npl`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/points-table`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/series`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/teams`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/players`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/videos`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [news, players, series] = await Promise.all([
    safeFetch(getNews({ limit: 200 })),
    safeFetch(getPlayers()),
    safeFetch(getSeries()),
  ]);

  const newsRoutes: MetadataRoute.Sitemap = (news ?? []).map((item) => ({
    url: `${SITE_URL}/news/${item.slug}`,
    lastModified: item.publishedAt ? new Date(item.publishedAt) : now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const playerRoutes: MetadataRoute.Sitemap = (players ?? []).map((p) => ({
    url: `${SITE_URL}/players/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = (series ?? []).map((s) => ({
    url: `${SITE_URL}/series/${s.slug}`,
    lastModified: s.startDate ? new Date(s.startDate) : now,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...newsRoutes,
    ...playerRoutes,
    ...seriesRoutes,
  ];
}
