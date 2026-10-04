/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0d14',
          panel: '#111726',
          border: '#1f2a3e',
          neonCyan: '#00f3ff',
          neonYellow: '#ffe600',
          neonPink: '#ff0055',
          neonGreen: '#05ffa1',
        },
      },
    },
  },
  plugins: [],
};
