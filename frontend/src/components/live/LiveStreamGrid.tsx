'use client';

import type { LiveStream } from '@/lib/types';

/**
 * Embedded YouTube live stream card. Plays inline via iframe —
 * never links out to YouTube. No channel branding shown.
 */
function StreamCard({ stream }: { stream: LiveStream }) {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video w-full bg-black">
        <iframe
          src={stream.embedUrl}
          title={stream.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="live-dot bg-red-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-red-600">Live</span>
        <span className="text-xs font-semibold text-slate-600">{stream.title}</span>
      </div>
    </div>
  );
}

/**
 * Renders a grid of embedded YouTube live streams.
 * Videos play inline — no links to YouTube, no channel branding.
 */
export function LiveStreamGrid({ streams }: { streams: LiveStream[] }) {
  if (!streams.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="chip gap-1.5 bg-red-600 text-white text-sm px-3 py-1">
          <span className="live-dot bg-white" /> Live Now
        </span>
        <h2 className="font-display text-xl font-black text-slate-900">{streams[0]?.title}</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {streams.map((stream) => (
          <StreamCard key={stream.videoId} stream={stream} />
        ))}
      </div>
    </section>
  );
}
