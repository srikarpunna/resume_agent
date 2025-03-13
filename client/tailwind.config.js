/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#4da6ff",
          main: "#0080ff",
          dark: "#0059b3",
        },
        secondary: {
          light: "#ff8533",
          main: "#ff6600",
          dark: "#cc5200",
        },
      },
    },
  },
  plugins: [],
  important: true,
  corePlugins: {
    preflight: false,
  },
};
