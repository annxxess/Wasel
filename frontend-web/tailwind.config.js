/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wasel: {
          blue:   '#1e3a8a',
          orange: '#f97316',
          dark:   '#0f172a',
        }
      },
    },
  },
  plugins: [],
}