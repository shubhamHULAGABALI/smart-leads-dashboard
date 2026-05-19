import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Dark surfaces
        'ink': {
          950: '#070B14',
          900: '#0B1020',
          800: '#111827',
          700: '#1A2236',
          600: '#1F2A40',
        },
        // Border
        'wire': {
          DEFAULT: '#1E2A3D',
          light: '#2A3A54',
        },
        // Accent violet
        'violet': {
          950: '#2E1065',
          900: '#4C1D95',
          800: '#5B21B6',
          700: '#6D28D9',
          600: '#7C3AED',
          500: '#8B5CF6',
          400: '#A78BFA',
          300: '#C4B5FD',
          200: '#DDD6FE',
          100: '#EDE9FE',
          50:  '#F5F3FF',
        },
        // Status
        'status': {
          'new':        '#3B82F6',
          'contacted':  '#F59E0B',
          'qualified':  '#10B981',
          'lost':       '#EF4444',
        },
      },
      backgroundImage: {
        'grid-ink': "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 32 L32 32 L32 0' fill='none' stroke='%231E2A3D' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 1.8s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-violet': '0 0 0 1px rgba(124,58,237,0.4), 0 4px 24px rgba(124,58,237,0.12)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
