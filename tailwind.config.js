/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./src/popup/index.html",
    "./src/options/index.html",
    "./src/ui/preview.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Indigo primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          accent: '#8b5cf6', // Violet secondary
        },
        surface: {
          dark: '#090d16',
          darkCard: '#111827',
          darkHover: '#1f293d',
          darkBorder: 'rgba(255, 255, 255, 0.08)',
          light: '#f8fafc',
          lightCard: '#ffffff',
          lightHover: '#f1f5f9',
          lightBorder: 'rgba(0, 0, 0, 0.08)',
        },
      },
      boxShadow: {
        glow: '0 0 20px -5px rgba(99, 102, 241, 0.35)',
        subtle: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
