// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6a2c70',
          light: '#8d3a95',
          dark: '#471e4b',
        },
        secondary: {
          DEFAULT: '#FEACC6',
          light: '#ffdee9',
        }
      }
    }
  },
  plugins: [],
}