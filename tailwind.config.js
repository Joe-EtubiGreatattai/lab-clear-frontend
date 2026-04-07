/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eefffa',
          100: '#ccfff0',
          200: '#99ffe0',
          300: '#5effcf',
          400: '#00f5b8', // Refined Mint/Emerald
          500: '#00d6a2',
          600: '#00b085',
          700: '#008c6b',
          800: '#006b53',
          900: '#005241',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Rich Slate Navy
        },
      },
      boxShadow: {
        card:  '0 2px 20px -2px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
        hover: '0 20px 40px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)',
        glow:  '0 0 20px rgba(0,245,184,0.15)',
        modal: '0 40px 80px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08)',
        input: '0 0 0 2px rgba(0,245,184,0.1)',
        'glow-red': '0 0 16px rgba(239,68,68,0.25)',
        'glow-amber': '0 0 16px rgba(245,158,11,0.20)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        scanline: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        fadeIn:    'fadeIn 0.35s ease-out forwards',
        slideIn:   'slideIn 0.28s ease-out forwards',
        shimmer:   'shimmer 1.6s linear infinite',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        pulse2:    'pulse2 1.4s ease-in-out infinite',
        scanline:  'scanline 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
