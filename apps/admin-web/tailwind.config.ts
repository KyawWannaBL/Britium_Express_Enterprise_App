import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // If you have a shared UI package in your monorepo, include it here:
    "../../packages/ui/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        // Enforce the dual font strategy globally
        sans: ['var(--font-en)', 'var(--font-my)', '"Pyidaungsu"', '"Noto Sans Myanmar"', 'sans-serif'],
        myanmar: ['var(--font-my)', '"Pyidaungsu"', '"Noto Sans Myanmar"', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0d2c54',
          gold: '#ffd700',
          blue: '#1f5bd8',
        }
      },
      boxShadow: {
        // Custom premium shadows used in the dashboard
        'soft': '0 4px 40px rgba(13, 44, 84, 0.04)',
        'glow': '0 8px 30px rgba(245, 158, 11, 0.25)',
        'float': '0 20px 60px rgba(13, 44, 84, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
