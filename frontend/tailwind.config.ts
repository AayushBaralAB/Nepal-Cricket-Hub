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
        // CricketHub brand palette — emerald match-day green + forest ink
        nch: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          navy: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            500: '#115e59',
            700: '#0f3d3a',
            800: '#0d2f2c',
            900: '#06221f',
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
        card: '0 1px 2px rgba(6,34,31,0.04), 0 8px 24px rgba(6,34,31,0.07)',
        'card-hover': '0 4px 12px rgba(6,34,31,0.08), 0 20px 40px -16px rgba(5,150,105,0.28)',
        soft: '0 10px 30px -12px rgba(5,150,105,0.22)',
        'glow-red': '0 8px 24px -8px rgba(16,185,129,0.5)',
        'glow-saffron': '0 6px 22px -8px rgba(245,158,11,0.5)',
        'glow-navy': '0 14px 44px -12px rgba(0,0,0,0.5)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 55%, #06221f 100%)',
        'saffron-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0d2f2c 0%, #06221f 100%)',
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
