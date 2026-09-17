import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lol: {
          bg: '#0a0e17',
          'bg-card': '#0d1220',
          card: '#121829',
          border: '#1e2d4a',
          'border-light': '#2a3d5c',
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
      backgroundImage: {
        // 소환사의 협곡 / 클라이언트 느낌 배경
        rift: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(20, 45, 70, 0.4), transparent 55%), radial-gradient(ellipse 80% 40% at 50% 100%, rgba(15, 25, 40, 0.35), transparent 50%), linear-gradient(180deg, #060a10 0%, #0a0e17 30%, #0a0e17 100%)',
      },
      boxShadow: {
        // 중앙 패널: 리그 오브 레전드 클라이언트 스타일 프레임
        panel:
          'inset 0 0 0 1px rgba(0, 0, 0, 0.4), 0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 #2a3d5c, 0 -1px 0 rgba(200, 170, 110, 0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
