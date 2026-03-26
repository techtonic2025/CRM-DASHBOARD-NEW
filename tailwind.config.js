/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F4FFE6',
          100: '#E2FFBA',
          200: '#CFFF8E',
          300: '#B8FF2B',
          400: '#A3E825',
          500: '#8FCC1F',
          600: '#6B991A',
          700: '#476614',
          800: '#23330A',
          900: '#121A05',
        },
        surface: {
          base: '#0B0D0F',
          card: '#141619',
          elevated: '#1A1D21',
          border: '#1E2228',
          hover: '#22262D',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0px 4px 24px -4px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.2)',
        'neon': '0 0 20px rgba(184, 255, 43, 0.15), 0 0 60px rgba(184, 255, 43, 0.05)',
        'glow': '0 0 30px rgba(184, 255, 43, 0.2)',
      }
    }
  },
  plugins: [],
}
