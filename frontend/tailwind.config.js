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
        ledger: 'inset 3px 0 0 0 var(--tw-shadow-color)',
      },
    },
  },
  plugins: [],
};
