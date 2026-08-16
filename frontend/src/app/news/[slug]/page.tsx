import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safeFetch, getNewsBySlug, getNews, SITE_URL } from '@/lib/api';
import { formatDateTime, timeAgo } from '@/lib/format';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryChip } from '@/components/ui/Badges';
import { NewsCard } from '@/components/news/NewsCard';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await safeFetch(getNewsBySlug(slug));
  if (!item) return { title: 'Article not found' };
  return {
    title: item.title,
    description: item.summary ?? item.title,
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.summary ?? item.title,
      url: `${SITE_URL}/news/${item.slug}`,
      images: item.imageUrl ? [{ url: item.imageUrl }] : undefined,
      publishedTime: item.publishedAt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, related] = await Promise.all([
    safeFetch(getNewsBySlug(slug)),
    safeFetch(getNews({ category: undefined, limit: 4 })),
  ]);
  if (!item) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    datePublished: item.publishedAt,
    description: item.summary,
    image: item.imageUrl ? [item.imageUrl] : undefined,
    author: { '@type': 'Organization', name: item.sourceName ?? 'CricketHub' },
    publisher: { '@type': 'Organization', name: 'CricketHub', url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/news/${item.slug}`,
  };

  const relatedItems = (related ?? []).filter((r) => r.slug !== item.slug).slice(0, 3);

  return (
    <div className="container-nch mx-auto max-w-4xl space-y-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: 'News', href: '/news' },
          { label: item.category, href: `/news?category=${encodeURIComponent(item.category)}` },
          { label: item.title },
        ]}
      />

      <article className="card overflow-hidden">
        {item.imageUrl && (
          <div className="aspect-[16/8] w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="mb-3 flex items-center gap-2">
            <CategoryChip category={item.category} />
            {item.isBreaking && (
              <span className="chip bg-nch-600 text-white">
                <span className="live-dot bg-white" /> Breaking
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            {item.title}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Published {formatDateTime(item.publishedAt)} · {timeAgo(item.publishedAt)}
          </p>

          {item.summary && (
            <div className="mt-6 border-l-4 border-nch-600 bg-slate-50 p-4 text-base leading-relaxed text-slate-700">
              {item.summary}
            </div>
          )}

          <p className="mt-6 text-sm leading-relaxed text-slate-600">
            This story is aggregated by CricketHub for news coverage. The summary above is a
            permitted excerpt; for the full story, visit the original publication.
          </p>

          {item.sourceUrl && item.sourceName && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Original source</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">{item.sourceName}</p>
              </div>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer noopener nofollow"
                className="btn-primary"
              >
                Read original article →
              </a>
            </div>
          )}

          {item.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="chip bg-slate-100 text-slate-600 normal-case">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>

      <AdSlot slot="news_inline" />

      {relatedItems.length > 0 && (
        <section aria-label="Related news">
          <h2 className="section-title">More Cricket News</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedItems.map((r) => <NewsCard key={r.slug} item={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
