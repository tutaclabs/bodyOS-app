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
        accent: {
          DEFAULT: '#FF4F41',
          dark: '#E03D30',
          50: '#FF4F4110',
          100: '#FF4F4120',
          500: '#FF4F41',
          600: '#E03D30',
        },
        dark: {
          bg: '#FFFFFF',
          card: '#FFFFFF',
          border: 'rgba(0, 0, 0, 0.1)',
          text: '#1E293B',
          muted: '#64748B',
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
        background: '#FFFFFF',
      },
      backgroundImage: {
        'gradient-nuraform': 'linear-gradient(to right, #FF4F41, #E289D9, #7D52FF)',
        'gradient-nuraform-hover': 'linear-gradient(to right, #FF4F41, #E289D9, #7D52FF)',
      },
      borderRadius: {
        'card': '20px',
        'card-lg': '24px',
        'button': '10px',
        'button-pill': '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'glass': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'coral-glow': '0 4px 12px rgba(255, 79, 65, 0.3)',
        'coral-glow-lg': '0 8px 24px rgba(255, 79, 65, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
        'inner-glow-gold': 'inset 0 0 20px rgba(212, 175, 55, 0.1)',
      },
      backdropBlur: {
        'glass': '10px',
        'glass-lg': '20px',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.7)',
      },
      borderColor: {
        'glass': 'rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: []
};
