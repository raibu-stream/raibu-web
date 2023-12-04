const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Cascadia Code"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        neutral: {
          100: "#fcf8f9",
          200: "rgba(255, 255, 255, 0.5)",
          300: "rgba(255, 255, 255, 0.1)",
          800: "#16080d",
          900: "rgb(8, 1, 2)"
        },
        primary: {
          200: "#f495b5",
          400: "#af4b6c"
        },
        secondary: {
          800: "#2d151d",
          700: "#3e1f28"
        }
      }
    },
  },
  plugins: [],
}

