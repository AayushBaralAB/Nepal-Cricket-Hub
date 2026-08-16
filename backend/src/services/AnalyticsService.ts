import { logger } from '../utils/logger';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';

export interface PageView {
  path: string;
  at: Date;
  referer?: string;
  device: DeviceType;
}

interface PageCount {
  path: string;
  views: number;
}

interface ReferrerCount {
  ref: string;
  views: number;
}

interface DeviceCount {
  device: DeviceType;
  views: number;
}

/**
 * Lightweight in-memory page-view analytics.
 *
 * Records page views from a frontend beacon and aggregates rolling summaries for
 * the admin dashboard. Data lives in memory only — it resets on backend restart.
 */
export class AnalyticsService {
  private views: PageView[] = [];

  private readonly maxViews = 20_000;

  record(entry: PageView) {
    const path = entry.path?.slice(0, 200) || '/';
    this.views.push({ ...entry, path });
    if (this.views.length > this.maxViews) {
      this.views.splice(0, this.views.length - this.maxViews);
    }
  }

  private dayKey(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  summary() {
    const now = new Date();
    const today = this.dayKey(now);
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    const dayBuckets: Array<{ date: string; views: number }> = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayBuckets.push({ date: this.dayKey(d), views: 0 });
    }
    const dayMap = new Map(dayBuckets.map((b) => [b.date, b]));

    const pages: Record<string, number> = {};
    const referrers: Record<string, number> = {};
    const devices: Record<string, number> = {};
    let total = 0;
    let todayCount = 0;
    let weekCount = 0;

    for (const v of this.views) {
      const key = this.dayKey(v.at);
      total += 1;
      if (key === today) todayCount += 1;
      if (v.at.getTime() >= weekAgo) weekCount += 1;
      const bucket = dayMap.get(key);
      if (bucket) bucket.views += 1;

      pages[v.path] = (pages[v.path] ?? 0) + 1;

      let ref = '(direct)';
      if (v.referer) {
        try {
          ref = new URL(v.referer).hostname;
        } catch {
          ref = v.referer;
        }
      }
      referrers[ref] = (referrers[ref] ?? 0) + 1;

      devices[v.device] = (devices[v.device] ?? 0) + 1;
    }

    const topPages: PageCount[] = Object.entries(pages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([path, views]) => ({ path, views }));

    const topReferrers: ReferrerCount[] = Object.entries(referrers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([ref, views]) => ({ ref, views }));

    const deviceBreakdown: DeviceCount[] = Object.entries(devices)
      .map(([device, views]) => ({ device: device as DeviceType, views }))
      .sort((a, b) => b.views - a.views);

    return {
      totalViews: total,
      viewsToday: todayCount,
      viewsThisWeek: weekCount,
      viewsPerDay: dayBuckets,
      topPages,
      topReferrers,
      deviceBreakdown,
    };
  }

  getHealth() {
    return { totalViews: this.views.length };
  }

  warn(msg: string, err?: unknown) {
    logger.warn('analytics', msg, err);
  }
}

export const analytics = new AnalyticsService();

export function detectDevice(userAgent: string): DeviceType {
  const s = userAgent.toLowerCase();
  if (/bot|crawler|spider|curl|wget|headless|facebookexternalhit|googlebot|bingbot|slurp|duckduckbot|ahrefs|semrush|petalbot|python-requests/i.test(s)) {
    return 'bot';
  }
  if (/android|iphone|ipod|mobile|opera mini|windows phone|blackberry/i.test(s)) return 'mobile';
  if (/ipad|tablet|kindle|silk|playbook/i.test(s)) return 'tablet';
  return 'desktop';
}
