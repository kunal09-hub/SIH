/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Enterprise Design System
        navy: {
          950: '#0f1724',
          900: '#1a2332',
          800: '#1e2a3a',
          700: '#263545',
          600: '#334d66',
          500: '#3d6b8e',
        },
        enterprise: {
          bg: '#f0f2f5',
          card: '#ffffff',
          border: '#e5e7eb',
          'border-dark': '#d1d5db',
          text: '#1e2a3a',
          'text-secondary': '#6b7280',
          'text-muted': '#9ca3af',
        },
        mgBlue: {
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          100: '#dbeafe',
          50: '#eff6ff',
        },
        mgGreen: {
          600: '#16a34a',
          500: '#22c55e',
          100: '#dcfce7',
          50: '#f0fdf4',
        },
        mgAmber: {
          600: '#d97706',
          500: '#f59e0b',
          100: '#fef3c7',
          50: '#fffbeb',
        },
        mgRed: {
          600: '#dc2626',
          500: '#ef4444',
          100: '#fee2e2',
          50: '#fef2f2',
        },
        // Keep legacy colors for backward compat
        coal: {
          950: '#0b0f19',
          900: '#111827',
          850: '#151f32',
          800: '#1f293d',
          700: '#334155',
          600: '#475569',
        },
        hazard: {
          yellow: '#f59e0b',
          orange: '#f97316',
          red: '#ef4444',
          green: '#10b981',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'nav': '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
