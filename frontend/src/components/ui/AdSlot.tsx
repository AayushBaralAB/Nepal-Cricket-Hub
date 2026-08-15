'use client';

import { useEffect, useState } from 'react';
import { getAds } from '@/lib/api';
import type { Advertisement } from '@/lib/types';

const SLOT_SIZES: Record<string, string> = {
  home_top: 'h-[90px]',
  home_middle: 'h-[120px]',
  home_bottom: 'h-[90px]',
  sidebar: 'min-h-[250px]',
  live_top: 'h-[90px]',
  news_inline: 'h-[100px]',
  match_top: 'h-[90px]',
  npl_top: 'h-[90px]',
  footer: 'h-[60px]',
};

export function AdSlot({
  slot,
  className = '',
}: {
  slot: string;
  className?: string;
}) {
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    let active = true;
    getAds(slot)
      .then((data) => {
        if (active) setAds(data ?? []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slot]);

  const ad = ads[0];
  if (!ad) return null;

  return (
    <div
      className={`flex w-full items-center justify-center ${SLOT_SIZES[slot] ?? 'h-[90px]'} ${className}`}
      aria-label="Advertisement"
    >
      {ad.type === 'html' && ad.html ? (
        <div dangerouslySetInnerHTML={{ __html: ad.html }} />
      ) : ad.imageUrl ? (
        <a href={ad.linkUrl ?? '#'} target="_blank" rel="noreferrer noopener">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.imageUrl}
            alt={ad.name}
            className="max-h-full max-w-full rounded-lg object-contain"
            loading="lazy"
          />
        </a>
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Advertisement — {ad.name}
        </div>
      )}
    </div>
  );
}
