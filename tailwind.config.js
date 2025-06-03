/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class', // Esto es crucial para el modo oscuro basado en clases
  theme: {
    extend: {},
  },
  plugins: [],
}

