import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { db } from '../db';
import { config } from '../config';
import { logger } from '../utils/logger';
import { slugify, nowIso } from '../utils/helpers';

export interface NewsItem {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  sourceName: string;
  sourceUrl?: string;
  originalGuid?: string;
  isBreaking: boolean;
  publishedAt?: string;
}

export interface NewsSourceConfig {
  id?: string;
  name: string;
  url: string;
  type: 'rss' | 'api';
  category: string;
  enabled: boolean;
}

const NEPAL_KEYWORDS = [
  'nepal cricket', 'nepal cricket team', 'nepal cricket players', 'cricket association of nepal',
  'can nepal', 'nepal premier league', 'npl', 'nepal women', 'nepal u19', 'nepal u16',
  'nepal domestic cricket', 'rohit paudel', 'sandeep lamichhane', 'kushal bhurtel', 'karan kc',
  'sompal kami', 'aasif sheikh', 'dipendra singh airee', 'nepali cricketer', 'nepal t20',
  'nepal odi', 'janakpur bolts', 'biratnagar kings', 'karnali yaks', 'pokhara avengers',
  'chitwan rhinos', 'lumbini lions', 'sudurpaschim royals', 'kathmandu gurkhas',
  'tribhuvan university cricket', 'kirtipur', 'nepal squad',
];

const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: 'Breaking News', keywords: ['breaking', 'just in', 'announced', 'confirmed', 'retires', 'resign'] },
  { category: 'NPL', keywords: ['npl', 'nepal premier league', 'janakpur', 'biratnagar', 'karnali', 'pokhara', 'chitwan', 'lumbini', 'sudurpaschim', 'kathmandu gurkhas'] },
  { category: 'Nepal Cricket', keywords: ['nepal', 'nepali', 'can', 'kirtipur'] },
  { category: 'International Cricket', keywords: ['india', 'pakistan', 'england', 'australia', 'south africa', 'new zealand', 'west indies', 'sri lanka', 'bangladesh', 'afghanistan', 'icc'] },
  { category: 'Women\'s Cricket', keywords: ['women', 'womens', 'female'] },
  { category: 'U19 Cricket', keywords: ['u19', 'under-19', 'junior', 'youth'] },
  { category: 'Domestic Cricket', keywords: ['domestic', 'provincial', 'franchise', 'league'] },
  { category: 'Player News', keywords: ['player', 'signing', 'contract', 'injury', 'retirement', 'captain', 'coach'] },
  { category: 'ICC', keywords: ['icc', 'world cup', 't20 world cup', 'odi world cup', 'champions trophy'] },
];

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 120);
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(html?: string): string | undefined {
  if (!html) return undefined;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!m) return undefined;
  const url = m[1];
  if (/^data:|^blob:/i.test(url)) return undefined;
  return url;
}

export class NewsService {
  private cache: NewsItem[] = [];
  lastFetchAttemptAt: Date | null = null;
  lastFetchSuccessAt: Date | null = null;
  lastFetchError: string | null = null;
  lastFetchedCount = 0;

  async getSources(): Promise<NewsSourceConfig[]> {
    if (db.isConfigured) {
      const { data } = await db.admin.from('news_sources').select('*').eq('enabled', true);
      if (data && data.length) {
        return data.map((s) => ({
          id: String(s.id), name: String(s.name), url: String(s.url),
          type: s.type as 'rss' | 'api', category: String(s.category), enabled: Boolean(s.enabled),
        }));
      }
    }
    return config.news.rssFeeds.map((url) => ({
      name: url, url, type: 'rss' as const, category: 'Nepal Cricket', enabled: true,
    }));
  }

  getNews(filter?: { category?: string; limit?: number; breaking?: boolean }): NewsItem[] {
    let list = [...this.cache].sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    });
    if (filter?.category) list = list.filter((n) => n.category === filter.category);
    if (filter?.breaking) list = list.filter((n) => n.isBreaking);
    if (filter?.limit) list = list.slice(0, filter.limit);
    return list;
  }

  getBreaking(): NewsItem[] {
    return this.getNews({ breaking: true, limit: 10 });
  }

  getNewsBySlug(slug: string): NewsItem | null {
    return this.cache.find((n) => n.slug === slug) ?? null;
  }

  getCategories(): string[] {
    return ['Breaking News', 'Nepal Cricket', 'NPL', 'International Cricket', 'Women\'s Cricket', 'U19 Cricket', 'Domestic Cricket', 'Player News', 'ICC', 'Cricket Updates'];
  }

  isRelevant(title: string, summary: string): { relevant: boolean; score: number } {
    const haystack = `${title} ${summary}`.toLowerCase();
    let score = 0;
    for (const kw of NEPAL_KEYWORDS) {
      if (haystack.includes(kw)) score += 1;
    }
    return { relevant: score > 0, score };
  }

  categorize(title: string, summary: string, defaultCategory: string): string {
    const haystack = `${title} ${summary}`.toLowerCase();
    for (const rule of CATEGORY_RULES) {
      if (rule.keywords.some((k) => haystack.includes(k))) return rule.category;
    }
    return defaultCategory || 'Cricket Updates';
  }

  isBreaking(title: string): boolean {
    return /breaking|just in|confirmed|announced|breaking news/i.test(title);
  }

  async fetchAndStore(): Promise<{ added: number; total: number }> {
    this.lastFetchAttemptAt = new Date();
    const sources = await this.getSources();
    let added = 0;

    for (const source of sources) {
      try {
        const items = await this.fetchSource(source);
        for (const item of items) {
          const saved = await this.storeIfNew(item, source);
          if (saved) added += 1;
        }
        await this.updateSourceStatus(source, true);
      } catch (err) {
        await this.updateSourceStatus(source, false);
        logger.warn('news', `Failed to fetch source ${source.url}`, err);
      }
    }

    this.lastFetchSuccessAt = new Date();
    this.lastFetchError = null;
    this.lastFetchedCount = added;
    logger.info('news', `News sync complete. Added ${added} new articles. Total cached: ${this.cache.length}`);
    await this.setSyncStatus(added);
    return { added, total: this.cache.length };
  }

  private async setSyncStatus(added: number) {
    if (!db.isConfigured) return;
    await db.admin.from('sync_status').upsert(
      {
        job: 'news_sync', status: 'success', last_run_at: nowIso(),
        last_success_at: nowIso(), last_error: null,
        last_message: `Added ${added} new articles. Total: ${this.cache.length}`,
        updated_at: nowIso(),
      },
      { onConflict: 'job' },
    );
  }

  private async updateSourceStatus(source: NewsSourceConfig, ok: boolean) {
    if (!db.isConfigured || !source.id) return;
    await db.admin
      .from('news_sources')
      .update({ last_fetched: nowIso(), last_status: ok ? 'ok' : 'error' })
      .eq('id', source.id);
  }

  private async fetchSource(source: NewsSourceConfig): Promise<NewsItem[]> {
    const res = await axios.get(source.url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NepalCricketHub/1.0; +https://nepalcrickethub.com)' },
    });

    if (source.type === 'api' && !/^https?:\/\/.*\.xml/i.test(source.url)) {
      return this.mapJsonFeed(res.data, source);
    }
    return this.mapRss(res.data, source);
  }

  private mapJsonFeed(data: unknown, source: NewsSourceConfig): NewsItem[] {
    const items = Array.isArray(data) ? data : (data as Record<string, unknown>)?.['articles'] ?? [];
    if (!Array.isArray(items)) return [];
    return items.slice(0, 50).map((it) => {
      const article = it as Record<string, unknown>;
      const title = stripHtml(String(article.title ?? ''));
      const link = String(article.url ?? article.link ?? '');
      const summary = stripHtml(String(article.summary ?? article.description ?? article.content ?? '')).slice(0, 400);
      const published = String(article.publishedAt ?? article.published_at ?? article.pubDate ?? '');
      return {
        title,
        slug: slugify(title),
        summary,
        category: source.category,
        tags: ['Nepal Cricket'],
        imageUrl: article.imageUrl ? String(article.imageUrl) : extractImage(String(article.image ?? '')),
        sourceName: source.name,
        sourceUrl: link,
        originalGuid: String(article.id ?? link),
        isBreaking: this.isBreaking(title),
        publishedAt: published || new Date().toISOString(),
      };
    });
  }

  private mapRss(xml: string, source: NewsSourceConfig): NewsItem[] {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel ?? parsed?.feed ?? parsed;
    const items = Array.isArray(channel?.item)
      ? channel.item
      : Array.isArray(channel?.entry)
        ? channel.entry
        : [];

    const out: NewsItem[] = [];
    for (const raw of items.slice(0, 60)) {
      const it = raw as Record<string, unknown>;
      const title = stripHtml(String(it.title ?? ''));
      if (!title) continue;

      const link = String((it.link as Record<string, unknown> | undefined)?.['@_href'] ?? it.link ?? it.guid ?? '');
      const contentEncoded = String(it['content:encoded'] ?? (it['media:content'] as Record<string, unknown> | undefined)?.url ?? '');
      const description = stripHtml(String(it.description ?? '')).slice(0, 400);
      const pubDate = String(it.pubDate ?? it.published ?? it.updated ?? '');
      const image = extractImage(String(it['content:encoded'] ?? it.content ?? '')) ??
        (String((it['media:content'] as Record<string, unknown> | undefined)?.['@_url'] ?? '') || undefined);

      out.push({
        title,
        slug: slugify(title),
        summary: description,
        category: source.category,
        tags: ['Nepal Cricket'],
        imageUrl: image || contentEncoded || undefined,
        sourceName: source.name,
        sourceUrl: link,
        originalGuid: String((it.guid as Record<string, unknown> | undefined)?.['@_isPermaLink'] === 'false' ? it.guid : it.guid ?? it.id ?? link),
        isBreaking: this.isBreaking(title),
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
    return out;
  }

  private async storeIfNew(item: NewsItem, source: NewsSourceConfig): Promise<boolean> {
    const { relevant } = this.isRelevant(item.title, item.summary ?? '');
    if (!relevant) return false;

    const category = this.categorize(item.title, item.summary ?? '', source.category);
    const finalItem: NewsItem = { ...item, category, tags: ['Nepal Cricket', category] };

    const normalized = normalizeTitle(finalItem.title);
    const existing = this.cache.find((n) => normalizeTitle(n.title) === normalized);
    if (existing) return false;

    this.cache.push(finalItem);
    if (this.cache.length > 500) this.cache = this.cache.slice(-500);

    if (!db.isConfigured) return true;

    // Dedupe against the database too.
    const { data: dup } = await db.admin
      .from('news')
      .select('id')
      .or(`original_guid.eq.${finalItem.originalGuid ?? '__none__'}`)
      .limit(1);
    if (dup && dup.length) return false;

    const row = {
      title: finalItem.title,
      slug: finalItem.slug,
      summary: finalItem.summary ?? null,
      category: finalItem.category,
      tags: finalItem.tags,
      image_url: finalItem.imageUrl ?? null,
      source_name: finalItem.sourceName,
      source_url: finalItem.sourceUrl ?? null,
      original_guid: finalItem.originalGuid ?? null,
      is_breaking: finalItem.isBreaking,
      is_featured: false,
      published_at: finalItem.publishedAt ?? null,
      status: 'published',
    };

    const { error } = await db.admin.from('news').upsert(row, { onConflict: 'original_guid', ignoreDuplicates: true });
    if (error && !String(error.message).includes('duplicate')) {
      logger.warn('news', `Failed to store news "${finalItem.title}"`, error);
      return false;
    }
    return true;
  }

  getHealth() {
    return {
      lastFetchAttemptAt: this.lastFetchAttemptAt,
      lastFetchSuccessAt: this.lastFetchSuccessAt,
      lastFetchError: this.lastFetchError,
      lastFetchedCount: this.lastFetchedCount,
      totalCached: this.cache.length,
    };
  }
}

export const newsService = new NewsService();
