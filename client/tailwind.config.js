/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#020617", 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 800: "#1e293b", 900: "#0f172a" },
        pine: { DEFAULT: "#0f172a", 400: "#1e293b", 600: "#0f172a" },
        ember: "#06b6d4",
        paper: "#0f172a",
        night: "#020617",
        accent: { 
          DEFAULT: "#22d3ee", 
          glow: "rgba(34, 211, 238, 0.35)",
          purple: "#8b5cf6",
          indigo: "#6366f1",
          cyan: "#06b6d4"
        },
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
        lift: "0 18px 50px -18px rgba(0,0,0,0.7)",
        card: "0 0 0 1px rgba(34, 211, 238, 0.1), 0 12px 32px -12px rgba(0,0,0,0.7)",
        glow: "0 0 40px -8px var(--glow, rgba(34, 211, 238, 0.35))",
        "glow-pine": "0 0 48px -10px rgba(34, 211, 238, 0.25)",
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
