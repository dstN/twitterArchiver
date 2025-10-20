/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode via class
  theme: {
    fontFamily: {
      sans: ["Radio Canada", "sans-serif"],
      display: ["Silkscreen", "display"],
    },
    extend: {},
  },
  plugins: [],
};
