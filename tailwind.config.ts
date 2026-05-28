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
          DEFAULT: '#FFB6B8',   // Soft Pink
          light: '#FFC78B',     // Warm Peach
        },
        secondary: {
          DEFAULT: '#BEC5FF',   // Soft Periwinkle
          light: '#A0E7FF',     // Sky Blue
        },
        accent: {
          DEFAULT: '#C7A8FF',   // Soft Lilac
          light: '#D7BEFF',
        },
        success: '#7EE6A2',
        warning: '#FFC78B',
        info: '#A0E7FF',
        dark: {
          900: '#071B2F',
          800: '#0A2742',
          700: '#0D3555',
          600: '#1F5E85',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.06)',
          medium: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.12)',
          highlight: 'rgba(255, 255, 255, 0.2)',
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '36px',
      },
      backdropBlur: {
        'glass': '30px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
        'glow': '0 0 20px rgba(255, 125, 143, 0.4)',
        'glow-cyan': '0 0 20px rgba(100, 216, 255, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 125, 143, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 125, 143, 0.5)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
};

export default config;
