import type { Metadata } from 'next';
import { safeFetch, getVideos } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AdSlot } from '@/components/ui/AdSlot';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Cricket Videos',
  description: 'Curated Nepal cricket video highlights from official channels.',
};

const CATEGORIES = ['All', 'Highlights', 'Interviews', 'Press Conference', 'NPL', 'Documentary'];

export default async function VideosPage() {
  const videos = (await safeFetch(getVideos())) ?? [];

  return (
    <div className="container-nch space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Videos' }]} />
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Cricket Videos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Highlights and official video content. Always watch through official broadcasters and
          channels.
        </p>
      </div>

      <AdSlot slot="videos_inline" />

      {videos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.videoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="card card-hover group block overflow-hidden"
            >
              <div className="relative aspect-video bg-slate-100">
                {video.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900">
                    <span className="text-4xl text-white/30">▶</span>
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-nch-600/90 text-white shadow-lg transition-transform group-hover:scale-110">
                    <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-nch-600">{video.category}</p>
                <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold text-slate-900 group-hover:text-nch-600">
                  {video.title}
                </h3>
                {video.source && <p className="mt-1.5 text-xs text-slate-400">{video.source}</p>}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-sm text-slate-500">
          Video content will appear soon. We link official sources only.
        </div>
      )}
    </div>
  );
}
