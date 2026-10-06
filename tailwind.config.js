/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: deep violet-indigo ("bridge at dusk"). Used for nav, primary CTAs, start.
        brand: {
          50: '#f2f0ff',
          100: '#e5e1ff',
          200: '#c9c0ff',
          300: '#a898ff',
          400: '#8468ff',
          500: '#6b3df0',
          600: '#5729d1',
          700: '#441fa8',
          800: '#361a82',
          900: '#271568',
        },
        // Accent: warm coral/amber. Used for target, highlights, score.
        accent: {
          50: '#fff4ed',
          100: '#ffe4d2',
          200: '#ffc7a3',
          300: '#ffa368',
          400: '#ff7e36',
          500: '#f85f13',
          600: '#e2460b',
          700: '#bb340c',
          800: '#952a11',
          900: '#7a2511',
        },
      },
      fontFamily: {
        display: ['"Fredoka"', '"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
