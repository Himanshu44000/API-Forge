export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#050816',
          900: '#0b1120',
          800: '#111827',
          700: '#1f2937',
        },
        aqua: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        sun: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45, 212, 191, 0.2), 0 20px 60px rgba(5, 8, 22, 0.45)',
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at top left, rgba(20, 184, 166, 0.18), transparent 32%), radial-gradient(circle at top right, rgba(245, 158, 11, 0.16), transparent 28%), linear-gradient(180deg, #050816 0%, #0b1120 42%, #020617 100%)',
      },
    },
  },
  plugins: [],
}
