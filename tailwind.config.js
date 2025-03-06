/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        forestGreen: '#396F04',
        appleGreen: '#7DBD07',
        darkOliveGreen: '#589507',
        veryDarkGreen: '#0A2004',
        limeGreen: '#B7DB25',
        goldenYellow: '#FFCD29',
        offWhite: '#F7F9FB',
        black: '#000000'
      }
    },
  },
  plugins: [],
}