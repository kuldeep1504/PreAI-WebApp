/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(224, 71%, 4%)',
        foreground: 'hsl(213, 31%, 91%)',
        card: 'hsl(222, 47%, 7%)',
        border: 'hsl(217, 32%, 14%)',
        primary: {
          DEFAULT: 'hsl(250, 89%, 65%)',
          hover: 'hsl(250, 89%, 60%)',
          glow: 'rgba(99, 102, 241, 0.15)'
        },
        secondary: {
          DEFAULT: 'hsl(190, 95%, 45%)',
          hover: 'hsl(190, 95%, 40%)',
          glow: 'rgba(6, 182, 212, 0.15)'
        },
        accent: 'hsl(280, 85%, 60%)',
        success: 'hsl(142, 72%, 29%)',
        danger: 'hsl(0, 72%, 51%)'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-indigo': '0 0 15px rgba(99, 102, 241, 0.4)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
        'neon-border': 'inset 0 0 0 1px rgba(99, 102, 241, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
