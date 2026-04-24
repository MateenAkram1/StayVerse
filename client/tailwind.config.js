/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0c1118", 50: "#f5f4f0", 100: "#e8e6df", 200: "#d4d0c5", 800: "#1a1f2a" },
        pine: { DEFAULT: "#2f4d46", 400: "#3d5f57", 600: "#1f3a35" },
        ember: "#b84a2e",
        paper: "#f0ebe3",
        night: "#06090d",
      },
      fontFamily: {
        display: ['"DM Sans"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "0 18px 50px -18px rgba(0,0,0,0.45)",
        card: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 32px -12px rgba(0,0,0,0.55)",
      },
      keyframes: {
        drift: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
      },
      animation: { drift: "drift 6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
