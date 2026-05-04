/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./services.html",
    "./blog.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}