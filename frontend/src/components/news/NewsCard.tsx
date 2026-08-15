import Link from 'next/link';
import type { NewsItem } from '@/lib/types';
import { timeAgo } from '@/lib/format';
import { CategoryChip } from '../ui/Badges';

export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  if (featured) {
    return (
      <Link href={`/news/${item.slug}`} className="card card-hover group overflow-hidden block">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nch-navy-800 to-nch-navy-900">
              <span className="font-display text-4xl font-black text-white/20">NCH</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
            <CategoryChip category={item.category} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 font-display text-lg font-bold text-slate-900 transition-colors group-hover:text-nch-600">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.summary}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{item.sourceName ?? 'Nepal Cricket Hub'}</span>
            <span>·</span>
            <span>{timeAgo(item.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/news/${item.slug}`} className="card card-hover group block p-4">
      {item.imageUrl && (
        <div className="mb-3 aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="mb-2 flex items-center justify-between gap-2">
        <CategoryChip category={item.category} />
        <span className="text-[11px] text-slate-400">{timeAgo(item.publishedAt)}</span>
      </div>
      <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-nch-600">
        {item.title}
      </h3>
      {item.summary && (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{item.summary}</p>
      )}
      <p className="mt-2.5 text-[11px] font-semibold text-slate-400">{item.sourceName}</p>
    </Link>
  );
}
