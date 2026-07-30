/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"IBM Plex Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#151515',
          900: '#1C1C1C',
          800: '#292929',
          700: '#3A3A3A',
          600: '#525252',
        },
        mist: {
          50: '#FAFAFA',
          100: '#F0F0EF',
          200: '#E2E1DE',
          300: '#CBC9C4',
          400: '#94918A',
          500: '#68655F',
        },
        paper: '#FAFAFA',
        signal: {
          DEFAULT: '#92400E',
          soft: '#F5ECDD',
          light: '#D9A441',
        },
        urgent: '#C4372F',
        warn: '#B5790A',
        calm: '#0F7A57',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(21, 21, 21, 0.04), 0 8px 24px rgba(21, 21, 21, 0.05)',
        lifted: '0 4px 10px rgba(21, 21, 21, 0.06), 0 20px 40px -8px rgba(21, 21, 21, 0.14)',
        glow: '0 0 0 1px rgba(146, 64, 14, 0.15), 0 8px 28px -6px rgba(146, 64, 14, 0.35)',
        ledger: 'inset 3px 0 0 0 var(--tw-shadow-color)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217, 164, 65, 0.35)' },
          '50%': { boxShadow: '0 0 0 6px rgba(217, 164, 65, 0)' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out both',
        'pulse-glow': 'pulse-glow 2.2s ease-in-out infinite',
        'pop': 'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
