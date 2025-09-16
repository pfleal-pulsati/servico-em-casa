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
        'brand': {
          'turquoise': '#66B2B2',
          'mint': '#A8D8B9',
          'gray': '#F0F0F0',
          'yellow': '#FFD700',
          'peach': '#FFAB91',
        },
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