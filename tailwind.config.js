/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'Noto Sans JP', 'sans-serif'],
        serif: ['Playfair Display', 'Noto Serif JP', 'Georgia', 'serif'],
      },
      colors: {
        blueberry: {
          50: '#f3f5f7', 100: '#e2e7ec', 200: '#c6d0d9', 300: '#a1b0bf',
          400: '#8291a3', 500: '#6B7A8F', 600: '#556377', 700: '#455060',
          800: '#3a4351', 900: '#333a45',
        },
        apricot: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#F7882F', 600: '#e5731a', 700: '#bd5915',
          800: '#964718', 900: '#7a3d17',
        },
        citrus: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#facc15', 500: '#F7C331', 600: '#d9a615', 700: '#b48210',
          800: '#916612', 900: '#785413',
        },
        appleCore: {
          50: '#faf7f2', 100: '#f4ede1', 200: '#e8d9bf', 300: '#DCC7AA',
          400: '#c9ac86', 500: '#b8956a', 600: '#a37f56', 700: '#856548',
          800: '#6d533e', 900: '#5a4535',
        },
      },
      boxShadow: {
        soft:   '0 2px 8px rgba(107, 122, 143, 0.08)',
        medium: '0 4px 16px rgba(107, 122, 143, 0.12)',
        strong: '0 8px 24px rgba(107, 122, 143, 0.16)',
      },
    },
  },
  plugins: [],
}
