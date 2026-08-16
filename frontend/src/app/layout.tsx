import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import AnalyticsPing from '@/components/AnalyticsPing';
import { SITE_URL } from '@/lib/api';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const archivo = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nepal Cricket Hub — Live Scores, News & Stats',
    template: '%s | Nepal Cricket Hub',
  },
  description:
    'All Nepal cricket in one hub — live scores, fixtures, results, automatic Nepal cricket news, NPL coverage, player statistics and points tables.',
  keywords: [
    'Nepal cricket', 'Nepal cricket team', 'NPL', 'Nepal Premier League',
    'Nepal cricket live scores', 'Nepal cricket news', 'Rohit Paudel',
    'Sandeep Lamichhane', 'CAN Nepal', 'Nepal women cricket', 'Nepal U19',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Nepal Cricket Hub',
    title: 'Nepal Cricket Hub',
    description:
      'All Nepal cricket in one hub — live scores, fixtures, results, automatic Nepal cricket news, NPL coverage, player statistics and points tables.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nepal Cricket Hub',
    description:
      'All Nepal cricket in one hub — live scores, fixtures, results, automatic Nepal cricket news and NPL coverage.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06221f',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
      <body className="pb-16 lg:pb-0">
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileBottomNav />
        <AnalyticsPing />
      </body>
    </html>
  );
}
