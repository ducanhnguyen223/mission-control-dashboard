import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#070b14',
        panel: '#0f1628',
        panelMuted: '#161f35',
        borderSubtle: '#25324f',
        accent: '#4f8cff',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#f43f5e'
      },
      boxShadow: {
        soft: '0 0 0 1px rgba(79, 140, 255, 0.15), 0 14px 32px rgba(10, 16, 30, 0.45)'
      }
    }
  },
  plugins: []
};

export default config;
