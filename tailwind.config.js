/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#070D19',
        surface: '#0F1E36',
        coral: '#FF6B4A',
        coralHover: '#FF8266',
        slate: '#8E9BAE',
      }
    },
  },
  plugins: [],
}
