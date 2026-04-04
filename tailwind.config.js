/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#00e676',
          dim: 'rgba(0,230,118,0.12)',
          glow: 'rgba(0,230,118,0.06)',
        },
        surface: {
          DEFAULT: '#0d1019',
          2: '#131824',
          3: '#1a2030',
        },
        gold: {
          DEFAULT: '#fbbf24',
          dim: 'rgba(251,191,36,0.12)',
        },
        live: {
          DEFAULT: '#f43f5e',
          dim: 'rgba(244,63,94,0.12)',
        },
      },
      animation: {
        'pulse-badge': 'pulse-badge 1.2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.3s ease both',
      },
    },
  },
  plugins: [],
}
