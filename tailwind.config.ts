// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFB6B8', // Soft Pink/Peach
          light: '#FFC78B',   // Warm Peach
          dark: '#FFA0A3',
        },
        secondary: {
          DEFAULT: '#BEC5FF', // Soft Periwinkle
          light: '#A0E7FF',   // Sky Blue
          dark: '#A0B0FF',
        },
        accent: {
          DEFAULT: '#C7A8FF', // Soft Lilac
          light: '#D7BEFF',
          dark: '#B08EFF',
        },
        success: {
          DEFAULT: '#7EE6A2', // Mint Green
          light: '#A0F0B8',
        },
        warning: {
          DEFAULT: '#FFC78B', // Warm Peach
          dark: '#FFB06A',
        },
        info: {
          DEFAULT: '#A0E7FF', // Sky Blue
        },
        base: {
          800: '#1E293B', // Slate 800 for text
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.12)',
          medium: 'rgba(255, 255, 255, 0.25)',
          highlight: 'rgba(255, 255, 255, 0.2)',
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '36px',
      },
      backdropBlur: {
        'glass': '25px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.12)',
        'glass-hover': '0 12px 40px rgba(31, 38, 135, 0.25)',
        'glow': '0 0 30px rgba(255, 182, 184, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 182, 184, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(199, 168, 255, 0.4)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
