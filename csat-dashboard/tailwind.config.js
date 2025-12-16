/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        // BrightGauge-inspired palette
        slate: {
          50: '#f8f9fa',
          100: '#ecf0f1',
          200: '#dfe6e9',
          300: '#bdc3c7',
          400: '#95a5a6',
          500: '#7f8c8d',
          600: '#636e72',
          700: '#2c3e50',
          800: '#34495e',
          900: '#1a252f',
        },
        accent: {
          blue: '#3498db',
          green: '#27ae60',
          teal: '#16a085',
          orange: '#e67e22',
          red: '#e74c3c',
          purple: '#9b59b6',
          yellow: '#f1c40f',
        },
        chart: {
          blue: '#3498db',
          green: '#2ecc71',
          yellow: '#f39c12',
          red: '#e74c3c',
          purple: '#9b59b6',
          teal: '#1abc9c',
          orange: '#e67e22',
          pink: '#e84393',
        }
      },
      boxShadow: {
        'widget': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'widget-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'nav': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
