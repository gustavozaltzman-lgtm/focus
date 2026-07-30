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
      },
      colors: {
        ink: {
          950: '#0A0A0B',
          900: '#111113',
          800: '#1C1C1F',
          700: '#28282C',
          600: '#3A3A3F',
        },
        mist: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D1D1D6',
          400: '#9C9CA3',
          500: '#6D6D75',
        },
        accent: {
          DEFAULT: '#5B6CFF',
          soft: '#EEF0FF',
        },
        urgent: '#FF5B5B',
        warn: '#FFB020',
        calm: '#2FC98E',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 15, 20, 0.04), 0 8px 24px rgba(15, 15, 20, 0.06)',
      },
    },
  },
  plugins: [],
};
