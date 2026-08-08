/** @type {import('tailwindcss').Config} */
function themedColor(name) {
  return `rgb(var(--c-${name}) / <alpha-value>)`;
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
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
        // Tokens below read from CSS custom properties (see index.css) so
        // every existing bg-x/text-x/border-x class repaints automatically
        // for the `.dark` theme, without touching each component.
        ink: {
          950: themedColor('ink-950'),
          // 900-600 are unused in the app today; kept static since they
          // never needed a dark-mode value.
          900: '#34495E',
          800: '#3E5871',
          700: '#4B6584',
          600: '#64798E',
        },
        mist: {
          50: themedColor('mist-50'),
          100: themedColor('mist-100'),
          200: themedColor('mist-200'),
          300: themedColor('mist-300'),
          400: themedColor('mist-400'),
          500: themedColor('mist-500'),
        },
        paper: themedColor('paper'),
        surface: themedColor('surface'),
        // Always-dark, theme-independent: modal backdrops and the "press to
        // near-black" button hover — never meant to invert in dark mode.
        scrim: '#1E2833',
        signal: {
          DEFAULT: themedColor('signal'),
          soft: themedColor('signal-soft'),
          light: themedColor('signal-light'),
        },
        sun: {
          DEFAULT: themedColor('sun'),
          dark: themedColor('sun-dark'),
        },
        urgent: themedColor('urgent'),
        warn: themedColor('warn'),
        calm: themedColor('calm'),
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(21, 21, 21, 0.04), 0 8px 24px rgba(21, 21, 21, 0.05)',
        lifted: '0 4px 10px rgba(21, 21, 21, 0.06), 0 20px 40px -8px rgba(21, 21, 21, 0.14)',
        glow: '0 0 0 1px rgba(255, 107, 107, 0.2), 0 8px 28px -6px rgba(255, 107, 107, 0.45)',
        ledger: 'inset 3px 0 0 0 var(--tw-shadow-color)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 209, 102, 0.55)' },
          '50%': { boxShadow: '0 0 0 6px rgba(255, 209, 102, 0)' },
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
