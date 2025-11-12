/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary palette: deep black and rich metallic gold
        primary: {
          black: '#0a0a0a',
          'black-soft': '#1a1a1a',
          gold: '#d4af37',
          'gold-light': '#f4e4a6',
          'gold-dark': '#b8941f',
        },
        // Light mode variants
        light: {
          bg: '#fafafa',
          'bg-soft': '#f5f5f5',
          charcoal: '#2d2d2d',
          'charcoal-soft': '#404040',
        },
        // Glass and overlay colors
        glass: {
          dark: 'rgba(0, 0, 0, 0.4)',
          'dark-heavy': 'rgba(0, 0, 0, 0.7)',
          light: 'rgba(255, 255, 255, 0.1)',
          'light-heavy': 'rgba(255, 255, 255, 0.2)',
        },
        // Amber gradients
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Modular typography scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        // Consistent spacing tokens
        'gutter-mobile': '1rem',    // 16px
        'gutter-tablet': '1.5rem',  // 24px
        'gutter-desktop': '3rem',   // 48px
        'card-mobile': '1rem',      // 16px
        'card-tablet': '1.25rem',   // 20px
        'card-desktop': '1.75rem',  // 28px
        'card-desktop-lg': '2rem',  // 32px
      },
      maxWidth: {
        'container': '75rem', // 1200px
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        'spotlight': 'spotlight 8s ease-in-out infinite',
        'particle-float': 'particle-float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
      },
      keyframes: {
        spotlight: {
          '0%, 100%': { 
            transform: 'translateX(-50%) translateY(-50%) rotate(0deg)',
            opacity: '0.3'
          },
          '50%': { 
            transform: 'translateX(-50%) translateY(-50%) rotate(180deg)',
            opacity: '0.8'
          },
        },
        'particle-float': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px)',
            opacity: '0.4'
          },
          '33%': { 
            transform: 'translateY(-20px) translateX(10px)',
            opacity: '0.8'
          },
          '66%': { 
            transform: 'translateY(-10px) translateX(-5px)',
            opacity: '0.6'
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%': { 
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
            transform: 'scale(1)'
          },
          '100%': { 
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)',
            transform: 'scale(1.02)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'scale-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)',
        'gradient-amber': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        'spotlight': 'radial-gradient(ellipse 800px 600px at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
