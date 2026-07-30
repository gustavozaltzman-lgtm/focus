/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#15151A',
          900: '#1D1D24',
          800: '#2A2A33',
          700: '#3A3A45',
          600: '#51515D',
        },
        mist: {
          50: '#FBFAF7',
          100: '#F3F1EC',
          200: '#E5E2D9',
          300: '#D2CDC0',
          400: '#98938A',
          500: '#6E6A63',
        },
        paper: '#FBFAF7',
        signal: {
          DEFAULT: '#4338CA',
          soft: '#ECEBFB',
        },
        urgent: '#C4372F',
        warn: '#B5790A',
        calm: '#0F7A57',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(21, 21, 26, 0.04), 0 8px 24px rgba(21, 21, 26, 0.05)',
        ledger: 'inset 3px 0 0 0 var(--tw-shadow-color)',
      },
    },
  },
  plugins: [],
};
