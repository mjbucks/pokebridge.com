/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3cdff',
          300: '#82aaff',
          400: '#5080ff',
          500: '#2f5cf0',
          600: '#2043c4',
          700: '#1a339a',
          800: '#18297a',
          900: '#172460',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
