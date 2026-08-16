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
        // Top-level saffron palette — used by gradient stops, chips and accents.
        saffron: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-archivo)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'live-pulse': 'livePulse 1.5s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 1.8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'livePulse 2.5s ease-in-out infinite',
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
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      container: {
        center: true,
        padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
        screens: { '2xl': '1280px' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)',
        'card-hover': '0 2px 6px rgba(15,23,42,0.08), 0 18px 44px -14px rgba(13,27,56,0.22)',
        soft: '0 8px 30px -12px rgba(13,27,56,0.18)',
        'glow-red': '0 6px 22px -8px rgba(220,46,39,0.55)',
        'glow-saffron': '0 6px 22px -8px rgba(245,158,11,0.5)',
        'glow-navy': '0 12px 44px -12px rgba(0,0,0,0.55)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #dc2e27 0%, #a11e19 55%, #0d1b38 100%)',
        'saffron-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'navy-gradient': 'linear-gradient(135deg, #132852 0%, #0d1b38 100%)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
