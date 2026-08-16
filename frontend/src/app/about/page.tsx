import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About CricketHub',
  description: 'CricketHub — Nepal\'s home for live cricket scores, news and statistics.',
};

export default function AboutPage() {
  return (
    <div className="container-nch mx-auto max-w-3xl space-y-6 py-8">
      <Breadcrumbs items={[{ label: 'About' }]} />
      <div className="card space-y-5 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-black text-slate-900">About CricketHub</h1>
        <div className="space-y-4 text-sm leading-relaxed text-slate-600">
          <p>
            CricketHub (NCH) is a fan-run, non-commercial resource dedicated to Nepal&apos;s
            national cricket team, the Nepal Premier League (NPL), women&apos;s cricket, U19 teams and
            domestic cricket.
          </p>
          <p>
            We aggregate live scores, fixtures, results, points tables, player statistics and news
            headlines into one place so Nepali cricket fans — at home and abroad — can follow the
            game easily on any device.
          </p>
          <p>
            All match data is sourced from official cricket data providers. News headlines are
            aggregated from established, legal news sources with links back to the original
            publications. We do not publish paywalled content, betting odds or unofficial
            broadcast streams.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">Our focus</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Nepal Men&apos;s and Women&apos;s national teams</li>
            <li>Nepal Premier League (NPL)</li>
            <li>U19 and age-group cricket</li>
            <li>Nepal&apos;s international tours and tri-series</li>
            <li>Domestic and provincial cricket</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
