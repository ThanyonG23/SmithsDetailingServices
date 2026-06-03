import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFE600",
          green: "#2bff7a",
          ink: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        glowY: "0 0 0 1px rgba(255,230,0,.18), 0 0 26px rgba(255,230,0,.22)",
        glowG: "0 0 0 1px rgba(43,255,122,.16), 0 0 26px rgba(43,255,122,.20)",
      },
    },
  },
  plugins: [],
};

export default config;
