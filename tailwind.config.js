/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4AF37',
          50: '#FAF8F3',
          100: '#F5F1E8',
          200: '#E8D5A3',
          300: '#E5C866',
          400: '#D4AF37',
          500: '#D4AF37',
          600: '#B8941F',
          700: '#9A7A1A',
          800: '#7C6015',
          900: '#5E4610',
        },
        luxury: {
          beige: '#F5F1E8',
          'beige-light': '#FAF8F3',
          'beige-dark': '#E8E0D4',
          gold: '#D4AF37',
          'gold-light': '#E8D5A3',
          'gold-dark': '#B8941F',
          'neutral-warm': '#F0EDE5',
          'neutral-cool': '#E8E5DD',
        },
        background: '#FAF8F3',
      },
      borderRadius: {
        'card': '20px',
        'card-lg': '24px',
        'button': '10px',
        'button-pill': '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'glass': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'glass': '10px',
      }
    }
  },
  plugins: []
};
