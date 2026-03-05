/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A0E17',
          900: '#0F1629',
          800: '#111827',
          700: '#151E2D',
          600: '#1A2332',
          500: '#1E293B',
        },
        cyan: {
          glow: 'rgba(34,211,238,0.25)',
          dim: 'rgba(34,211,238,0.12)',
          DEFAULT: '#22D3EE',
        },
        amber: {
          dim: 'rgba(245,158,11,0.12)',
          DEFAULT: '#F59E0B',
        },
        emerald: {
          dim: 'rgba(16,185,129,0.12)',
          DEFAULT: '#10B981',
        },
        danger: {
          dim: 'rgba(239,68,68,0.12)',
          DEFAULT: '#EF4444',
        },
        gold: '#F5C542',
        muted: '#94A3B8',
        dim: '#64748B',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
