import type { Metadata } from 'next';
import { safeFetch, getLiveMatches, getLiveStreams } from '@/lib/api';
import { LivePageClient } from './LivePageClient';
import { LiveStreamGrid } from '@/components/live/LiveStreamGrid';
import { AdSlot } from '@/components/ui/AdSlot';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live Cricket Scores — CricketHub',
  description: 'Live cricket scores, ball-by-ball updates, run rates and match status for Nepal cricket, NPL and international matches.',
};

export default async function LivePage() {
  const [live, streams] = await Promise.all([
    safeFetch(getLiveMatches()),
    safeFetch(getLiveStreams()),
  ]);

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Live Scores' }]} />
      <div className="flex items-center gap-3">
        <span className="chip gap-1.5 bg-nch-600 text-white text-sm px-3 py-1">
          <span className="live-dot bg-white" /> Live
        </span>
        <h1 className="font-display text-2xl font-black text-slate-900">Live Cricket</h1>
      </div>
      <p className="text-sm text-slate-500">
        Scores refresh automatically. Showing the latest available data from the live feed.
      </p>

      <AdSlot slot="live_top" />

      {streams && streams.length > 0 && <LiveStreamGrid streams={streams} />}

      <LivePageClient initial={live ?? []} />

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Score updates are automated from external data sources and may be delayed.
        Check the CricketHub live centre for the most recent ball-by-ball coverage.
      </div>
    </div>
  );
}
