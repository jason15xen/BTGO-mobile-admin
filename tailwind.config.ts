import type { Config } from "tailwindcss";

// Main brand green — centered on rgb(43,135,31) = #2b871f at 600.
const emerald = {
  50: "#eef9ec",
  100: "#d6f1cf",
  200: "#aee2a2",
  300: "#7fce70",
  400: "#54bb44",
  500: "#37a626",
  600: "#2b871f",
  700: "#236d1a",
  800: "#1d5717",
  900: "#194815",
  950: "#0a2708",
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
        // Resting card: lit top edge + contact shadow + soft ambient cast
        soft: "inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 2px rgba(16,28,22,0.05), 0 12px 26px -12px rgba(16,28,22,0.22)",
        // Elevated element (CTAs, floating cards)
        raised: "inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 5px rgba(16,28,22,0.10), 0 22px 42px -16px rgba(16,28,22,0.34)",
        // Carved / recessed (progress tracks, wells)
        inset: "inset 0 1.5px 3px rgba(16,28,22,0.20), inset 0 -1px 0 rgba(255,255,255,0.5)",
        // Coloured glow for the primary accent
        glow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 26px -6px rgba(5,150,105,0.45)",
        // Header → content separation
        hairline: "0 1px 0 rgba(16,28,22,0.06), 0 6px 14px -8px rgba(16,28,22,0.18)",
      },
      borderRadius: { "2xl": "1.1rem", "3xl": "1.5rem" },
    },
  },
  plugins: [],
};

export default config;
