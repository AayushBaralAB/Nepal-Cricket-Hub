'use client';

import { useState, useEffect, useRef } from 'react';

type FeedTab = 'twitter' | 'facebook';

export function SocialFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('twitter');
  const twitterRef = useRef<HTMLDivElement>(null);
  const [twitterLoaded, setTwitterLoaded] = useState(false);

  useEffect(() => {
    if (activeTab !== 'twitter' || twitterLoaded || !twitterRef.current) return;

    const container = twitterRef.current;
    container.innerHTML = '';

    const timeline = document.createElement('a');
    timeline.setAttribute('class', 'twitter-timeline');
    timeline.setAttribute('data-theme', 'light');
    timeline.setAttribute('data-chrome', 'noheader nofooter noborders transparent');
    timeline.setAttribute('data-tweet-limit', '5');
    timeline.setAttribute('href', 'https://twitter.com/CricNepal');
    timeline.textContent = 'Loading tweets...';
    container.appendChild(timeline);

    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      document.body.appendChild(script);
    } else if (window.twttr?.widgets) {
      window.twttr.widgets.load(container);
    }

    setTwitterLoaded(true);
  }, [activeTab, twitterLoaded]);

  return (
    <div className="card overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button
          type="button"
          onClick={() => setActiveTab('twitter')}
          className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === 'twitter'
              ? 'text-nch-700 border-b-2 border-nch-500 bg-nch-50/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter / X
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('facebook')}
          className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === 'facebook'
              ? 'text-nch-700 border-b-2 border-nch-500 bg-nch-50/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </span>
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'twitter' ? (
          <div
            ref={twitterRef}
            className="min-h-[400px] [&_.twitter-timeline]:!min-h-[400px]"
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <svg className="mx-auto h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <h3 className="mt-3 text-sm font-bold text-slate-800">
                Cricket Association of Nepal
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Follow CAN on Facebook for official updates
              </p>
              <a
                href="https://www.facebook.com/CricketAssociationofNepalCAN"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Follow on Facebook
              </a>
            </div>
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FCricketAssociationofNepalCAN&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&lazy=true"
              className="w-full rounded-xl border-0"
              style={{ height: '500px' }}
              allowFullScreen
              loading="lazy"
              title="CAN Facebook Page"
            />
          </div>
        )}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}
