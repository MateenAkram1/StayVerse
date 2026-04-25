/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0c1118", 50: "#f5f4f0", 100: "#e8e6df", 200: "#d4d0c5", 800: "#1a1f2a", 900: "#090c12" },
        pine: { DEFAULT: "#2f4d46", 400: "#3d5f57", 600: "#1f3a35" },
        ember: "#b84a2e",
        paper: "#f0ebe3",
        night: "#06090d",
        accent: { DEFAULT: "#c45c3c", glow: "rgba(196, 92, 60, 0.35)" },
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "shine-line":
          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
      },
      backgroundSize: {
        grid: "44px 44px",
      },
      fontFamily: {
        display: ['"Syne"', '"DM Sans"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "0 18px 50px -18px rgba(0,0,0,0.45)",
        card: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 32px -12px rgba(0,0,0,0.55)",
        glow: "0 0 40px -8px var(--glow, rgba(184, 74, 46, 0.35))",
        "glow-pine": "0 0 48px -10px rgba(61, 95, 87, 0.45)",
      },
      keyframes: {
        drift: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        "aurora-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(4%, 3%) scale(1.04)" },
          "66%": { transform: "translate(-3%, 5%) scale(0.97)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(1deg)" },
        },
      },
      animation: {
        drift: "drift 6s ease-in-out infinite",
        "aurora-drift": "aurora-drift 20s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
