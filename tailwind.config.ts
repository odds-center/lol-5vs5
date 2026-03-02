import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lol: {
          bg: '#0a0e17',
          'bg-card': '#0d1220',
          card: '#121829',
          border: '#1e2d4a',
          gold: '#c8aa6e',
          'gold-dim': '#9b8b5e',
          'gold-bright': '#e8d5a3',
          blue: '#0a1428',
          'blue-border': '#0e2842',
          red: '#2c1810',
          'red-border': '#4a2820',
          muted: '#7b8fa3',
        },
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        spiegel: ['var(--font-spiegel)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
