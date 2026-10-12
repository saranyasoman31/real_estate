/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff4fa',
          100: '#dfeaf5',
          200: '#bdd5eb',
          300: '#8eb7dc',
          400: '#5591c7',
          500: '#2b6ea9',
          600: '#1a5288',
          700: '#133d67',
          800: '#0e2c4b',
          900: '#0b1b38',
          950: '#061022',
        },
        gold: {
          50: '#fcf9ef',
          100: '#f7f0d8',
          200: '#ede0af',
          300: '#e1cc7f',
          400: '#d4b752',
          500: '#c59d29',
          600: '#aa821c',
          700: '#876417',
          800: '#6f5019',
          900: '#5c4219',
          950: '#362409',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
