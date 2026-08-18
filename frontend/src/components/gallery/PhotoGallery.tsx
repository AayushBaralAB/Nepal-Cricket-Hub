'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Photo } from '@/lib/types';

const TAGS = ['All', 'Match Photos', 'Training', 'Celebrations'];

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/photos');
      if (res.ok) {
        const body = await res.json();
        if (body.data) setPhotos(body.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useEffect(() => {
    if (!selectedPhoto) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedPhoto(null);
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [selectedPhoto]);

  const filtered = activeTag === 'All'
    ? photos
    : photos.filter((p) => p.tags.includes(activeTag));

  return (
    <div className="space-y-6">
      {/* Filter tags */}
      <div className="flex flex-wrap gap-2" role="navigation" aria-label="Photo filters">
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
              activeTag === tag
                ? 'bg-nch-navy-800 text-white shadow-soft'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-nch-300 hover:text-nch-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">
          No photos found. Check back soon for new uploads.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((photo) => (
            <button
              key={photo._id ?? photo.url}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <img
                src={photo.thumbnailUrl ?? photo.url}
                alt={photo.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="w-full p-3">
                  <p className="text-sm font-bold text-white">{photo.title}</p>
                  {photo.photographer && (
                    <p className="mt-0.5 text-[11px] text-white/70">by {photo.photographer}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-card transition-colors hover:bg-slate-100"
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-h-[80vh] rounded-2xl object-contain shadow-glow-navy"
            />
            <div className="mt-3 text-center">
              <p className="text-sm font-bold text-white">{selectedPhoto.title}</p>
              {selectedPhoto.caption && (
                <p className="mt-1 text-xs text-white/60">{selectedPhoto.caption}</p>
              )}
              {selectedPhoto.photographer && (
                <p className="mt-1 text-[11px] text-white/40">Photo: {selectedPhoto.photographer}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
