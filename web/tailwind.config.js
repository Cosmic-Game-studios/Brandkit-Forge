/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0f766e',
          orange: '#f97316',
        }
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'progress': 'progress 2s ease-in-out infinite',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%', marginLeft: '0%' },
          '50%': { width: '70%', marginLeft: '0%' },
          '100%': { width: '100%', marginLeft: '100%' },
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
