import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safeFetch, getNews, getNewsCategories } from '@/lib/api';
import { NewsCard } from '@/components/news/NewsCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { slugToLabel } from '@/lib/format';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 60;

function slugifyCategory(name: string): string {
  return name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
}

function resolveCategory(slug: string, categories: string[]): string {
  const match = categories.find((c) => slugifyCategory(c) === slug);
  return match ?? slugToLabel(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await safeFetch(getNewsCategories());
  const label = resolveCategory(category, categories ?? []);
  return {
    title: `${label} News`,
    description: `Latest ${label} cricket news and updates for Nepal cricket fans.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const [news, categories] = await Promise.all([
    safeFetch(getNews({ category, limit: 60 })),
    safeFetch(getNewsCategories()),
  ]);

  const cats = categories ?? [];
  if (cats.length && !cats.some((c) => slugifyCategory(c) === category)) notFound();

  const label = resolveCategory(category, cats);
  const items = news ?? [];

  return (
    <div className="container-nch space-y-6 py-8">
      <Breadcrumbs items={[{ label: 'News', href: '/news' }, { label }]} />
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">{label}</h1>
        <p className="mt-1 text-sm text-slate-500">{items.length} articles</p>
      </div>

      <AdSlot slot="news_inline" />

      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <NewsCard key={item.slug} item={item} />)}
        </div>
      ) : (
        <div className="card p-10 text-center text-sm text-slate-500">
          No articles in this category yet. Check back soon.
        </div>
      )}
    </div>
  );
}
