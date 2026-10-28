/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#101114",
        card: "#191B20",
        card2: "#20232A",
        accent: "#FF6B4A",
        accent2: "#4F9DDE",
        border: "#2B2E36",
        sub: "#8B909C",
      },
    },
  },
  plugins: [],
};
