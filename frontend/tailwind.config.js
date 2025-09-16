/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'sans': ['Lato', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'turquoise': {
          '50': '#f0fdfa',
          '100': '#ccfbf1',
          '200': '#99f6e4',
          '300': '#5eead4',
          '400': '#2dd4bf',
          '500': '#14b8a6',
          '600': '#0d9488',
          '700': '#0f766e',
          '800': '#115e59',
          '900': '#134e4a',
          'DEFAULT': '#66B2B2',
        },
        'mint': {
          '50': '#f0fdf4',
          '100': '#dcfce7',
          '200': '#bbf7d0',
          '300': '#86efac',
          '400': '#4ade80',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
          '800': '#166534',
          '900': '#14532d',
          'DEFAULT': '#A8D8B9',
        },
        'primary': '#66B2B2',
        'secondary': '#A8D8B9',
        'accent': '#FFAB91',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#66B2B2",
          "secondary": "#A8D8B9",
          "accent": "#FFAB91",
          "neutral": "#374151",
          "base-100": "#ffffff",
          "base-200": "#F0F0F0",
          "base-300": "#e5e5e5",
          "info": "#66B2B2",
          "success": "#A8D8B9",
          "warning": "#FFD700",
          "error": "#ef4444",
        },
      },
      "dark",
    ],
    base: true,
    styled: true,
    utils: true,
  },
}