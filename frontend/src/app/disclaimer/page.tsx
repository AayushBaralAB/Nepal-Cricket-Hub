import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'CricketHub disclaimer — accuracy of scores, news attribution and broadcast rights.',
};

export default function DisclaimerPage() {
  return (
    <div className="container-nch mx-auto max-w-3xl space-y-6 py-8">
      <Breadcrumbs items={[{ label: 'Disclaimer' }]} />
      <article className="card space-y-6 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-black text-slate-900">Disclaimer</h1>
        <div className="space-y-4 text-sm leading-relaxed text-slate-600">
          <p>
            CricketHub is an independent, fan-run website and is not affiliated with, or
            endorsed by, the Cricket Association of Nepal (CAN), the International Cricket Council
            (ICC), any national governing body, broadcaster or the Nepal Premier League (NPL)
            franchises.
          </p>
          <p>
            <strong className="text-slate-800">Scores and statistics.</strong> Match data is
            aggregated from third-party providers and may be delayed, incomplete or contain errors.
            Always confirm critical information with official sources.
          </p>
          <p>
            <strong className="text-slate-800">News.</strong> Headlines and summaries are
            aggregated from external news sources. All stories link to the original publication,
            which retains editorial ownership. The inclusion of a story is not an endorsement.
          </p>
          <p>
            <strong className="text-slate-800">Broadcasts.</strong> We do not host or stream
            broadcasts and do not provide links to unofficial streams. Please watch through
            official broadcasters.
          </p>
          <p>
            <strong className="text-slate-800">Advertising.</strong> Advertisements are served by
            third-party networks and are not a recommendation of any product or service. We do not
            accept gambling-related advertising.
          </p>
          <p>
            Trademarks and logos appearing on this site remain the property of their respective
            owners and are used for identification and commentary purposes only.
          </p>
        </div>
      </article>
    </div>
  );
}
