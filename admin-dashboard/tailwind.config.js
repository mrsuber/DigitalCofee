/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#F7F3F0',
          100: '#E8DED6',
          200: '#D4C4B5',
          300: '#BFAA94',
          400: '#AA9073',
          500: '#8B7355',
          600: '#6B5742',
          700: '#4A3C2F',
          800: '#2A211B',
          900: '#1A1410',
        },
      },
    },
  },
  plugins: [],
}
