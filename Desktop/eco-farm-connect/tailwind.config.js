/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',  // Primary Green
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#fdf8f0',
          100: '#f5e6d0',
          200: '#e8cba0',
          300: '#d4a96a',
          400: '#c08a3e',
          500: '#a06e2e',
          600: '#8B5E3C',  // Soft Earth Brown
          700: '#6d4a2e',
          800: '#543820',
          900: '#3d2817',
        },
        lime: {
          400: '#a3e635',
          500: '#84cc16',  // Fresh Lime Accent
          600: '#65a30d',
        },
        warning: {
          light: '#fef9c3',
          DEFAULT: '#eab308',  // Warm Yellow
          dark: '#a16207',
        },
        danger: {
          light: '#fecaca',
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f8fafc',
          card: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'title': ['22px', '28px'],
        'body': ['16px', '24px'],
        'caption': ['14px', '20px'],
      },
      spacing: {
        'btn': '48px',
      }
    },
  },
  plugins: [],
}
