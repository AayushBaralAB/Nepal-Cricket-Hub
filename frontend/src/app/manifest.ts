import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CricketHub',
    short_name: 'NCH',
    description: 'All Nepal cricket in one hub — live scores, news, NPL and statistics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06221f',
    theme_color: '#06221f',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
