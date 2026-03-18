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
          DEFAULT: '#b22222',
          light: '#d34343',
          dark: '#8b1b1b',
        },
        secondary: {
          DEFAULT: '#1f1f1f',
          light: '#2a2a2a',
          dark: '#141414',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
