import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nepal Cricket Hub brand palette — crimson + deep blue with saffron accent
        nch: {
          50: '#fdf3f2',
          100: '#fbe3e1',
          200: '#f6c4c0',
          300: '#ef9a93',
          400: '#e66960',
          500: '#dc2e27',
          600: '#c2231d',
          700: '#a11e19',
          800: '#861c18',
          900: '#701b17',
          navy: {
            50: '#eef2ff',
            100: '#e0e8ff',
            500: '#1e3a8a',
            700: '#17306e',
            800: '#132852',
            900: '#0d1b38',
          },
          saffron: {
            400: '#fbbf24',
            500: '#f59e0b',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-archivo)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'live-pulse': 'livePulse 1.5s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
      },
      keyframes: {
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      container: {
        center: true,
        padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
        screens: { '2xl': '1280px' },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.08), 0 4px 16px rgba(15,23,42,0.06)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.1), 0 12px 32px rgba(15,23,42,0.12)',
        glow: '0 0 0 1px rgba(220,46,39,0.2), 0 0 24px rgba(220,46,39,0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
