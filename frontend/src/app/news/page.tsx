import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { safeFetch, getNews, getNewsCategories } from '@/lib/api';
import { NewsCard } from '@/components/news/NewsCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Nepal Cricket News',
  description: 'Latest Nepal cricket news — Nepal men\'s team, Nepal women\'s cricket, NPL, U19 and domestic cricket, aggregated automatically.',
};

function slugifyCategory(name: string): string {
  return name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [allNews, categories] = await Promise.all([
    safeFetch(getNews({ limit: 48 })),
    safeFetch(getNewsCategories()),
  ]);

  const cats = categories ?? [];
  const activeSlug = category ? slugifyCategory(category) : category;
  const activeName = cats.find((c) => slugifyCategory(c) === activeSlug);
  const items = activeName
    ? (allNews ?? []).filter((n) => n.category === activeName)
    : (allNews ?? []);

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'News' }]} />
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Nepal Cricket News</h1>
        <p className="mt-1 text-sm text-slate-500">
          Automatically aggregated headlines from legal news sources — updated through the day.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="navigation" aria-label="News categories">
        <Link
          href="/news"
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${
            !activeSlug ? 'bg-nch-navy-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          All
        </Link>
        {cats.map((c) => (
          <Link
            key={c}
            href={`/news/category/${encodeURIComponent(c.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-'))}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              activeSlug === slugifyCategory(c) ? 'bg-nch-navy-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <AdSlot slot="news_inline" />

      <Suspense fallback={<div className="card h-40 animate-pulse" />}>
        {items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => <NewsCard key={item.slug} item={item} />)}
          </div>
        ) : (
          <div className="card p-10 text-center text-sm text-slate-500">
            No articles in this category yet. Check back soon.
          </div>
        )}
      </Suspense>
    </div>
  );
}
