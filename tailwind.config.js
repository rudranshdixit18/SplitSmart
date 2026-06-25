/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1e1e2e',
        card: '#242436',
        'card-hover': '#2a2a3f',
        primary: '#6c5ce7',
        'primary-light': '#a29bfe',
        text: '#f8f8f2',
        'text-muted': '#a0a0b0',
        border: '#36364a',
        danger: '#ff5252',
        success: '#4caf50'
      }
    },
  },
  plugins: [],
}
