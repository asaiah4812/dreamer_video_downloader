/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0F0F1A',
        surface: '#12121D',
        'surface-dim': '#12121D',
        'surface-container-lowest': '#0D0D18',
        'surface-container-low': '#1B1A26',
        'surface-container': '#1F1E2A',
        'surface-container-high': '#292935',
        'surface-container-highest': '#343440',
        primary: '#DAB8FF',
        'primary-container': '#C38FFF',
        'inverse-primary': '#7745AF',
        secondary: '#9BCBFF',
        'secondary-container': '#3196E6',
        tertiary: '#F8ACFF',
        'on-surface': '#E3E0F1',
        'on-surface-variant': '#CDC3D3',
        outline: '#978D9D',
        'outline-variant': '#4B4451',
        error: '#FFB4AB',
        dreamer: {
          black: '#0F0F1A',
          surface: '#12121D',
          elevated: '#1F1E2A',
          card: 'rgba(255,255,255,0.05)',
          purple: '#DAB8FF',
          blue: '#3196E6',
          neon: '#9BCBFF',
          pink: '#F8ACFF',
          muted: '#978D9D',
          subtle: '#CDC3D3',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

