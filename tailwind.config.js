module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Already included in default Tailwind
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}