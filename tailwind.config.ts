import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fff6e3',
        ink: '#1a1a2e',
        coral: '#ff5e5b',
        sunny: '#ffd23f',
        mint: '#4dd4ac',
        sky: '#4ea8de',
        grape: '#9b5de5',
        berry: '#ff7eb6',
        'paper-dark': '#f0e8d0',
      },
      fontFamily: {
        display: ['Fredoka One', 'cursive'],
        body: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        ink: '4px 4px 0 #1a1a2e',
        'ink-sm': '3px 3px 0 #1a1a2e',
        'ink-lg': '6px 6px 0 #1a1a2e',
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        fall: 'fall linear forwards',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fall: {
          from: { transform: 'translateY(-60px)' },
          to: { transform: 'translateY(440px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 94, 91, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255, 94, 91, 0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
