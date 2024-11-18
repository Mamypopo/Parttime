export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans Thai", "Nunito"],
      },
      colors: {
        'custom-yellow': '#CDE45F',
        'custom-purple': '#C5B4E3',
        'custom-textgray': '#3A3A49',
      },
    },
  },
  plugins: [],
};
