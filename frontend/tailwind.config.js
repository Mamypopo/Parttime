/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'], // ตั้งเป็น default font
      },
      colors: {
        'custom-yellow': '#CDE45F',
        'custom-purple': '#C5B4E3',
        'custom-textgray': '#3A3A49'
      }
    },
  },
  plugins: [],
}

