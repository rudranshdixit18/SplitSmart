/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/styles/**/*.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        background: '#000000',
        card: '#0a0a0a',
        'card-hover': '#111111',
        primary: '#FF4F00',
        'primary-light': '#FF7A3D',
        accent: '#8b5cf6',
        text: '#ffffff',
        'text-muted': '#888888',
        border: '#1f1f1f',
        danger: '#ff3333',
        success: '#00cc66'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
