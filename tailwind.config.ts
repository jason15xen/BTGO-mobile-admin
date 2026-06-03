import type { Config } from "tailwindcss";

const emerald = {
  50: "#ecfdf5",
  100: "#d1fae5",
  200: "#a7f3d0",
  300: "#6ee7b7",
  400: "#34d399",
  500: "#10b981",
  600: "#059669",
  700: "#047857",
  800: "#065f46",
  900: "#064e3b",
  950: "#022c22",
};

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Primary accent — emerald (legacy aliases collapse onto it)
        forest: emerald,
        brand: emerald,
        aqua: emerald,
        ocean: emerald,
        berry: emerald,
        // Secondary highlight — lime
        lime: { 50: "#f7fee7", 100: "#ecfccb", 300: "#bef264", 400: "#a3e635", 500: "#84cc16", 600: "#65a30d" },
        // Teal for richness/variety
        teal: { 50: "#f0fdfa", 100: "#ccfbf1", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e" },
        gold: { 50: "#fffbeb", 100: "#fef3c7", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
        coral: { 50: "#fff1f2", 100: "#ffe4e6", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17,24,28,0.04), 0 8px 24px rgba(17,24,28,0.07)",
        glow: "0 10px 28px rgba(5,150,105,0.30)",
      },
      borderRadius: { "2xl": "1.1rem", "3xl": "1.5rem" },
    },
  },
  plugins: [],
};

export default config;
