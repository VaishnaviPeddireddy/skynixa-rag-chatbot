import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        skynixa: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffd",
          300: "#7cc5fc",
          400: "#36a7f8",
          500: "#0c8ce9",
          600: "#006fc7",
          700: "#0159a1",
          800: "#064b85",
          900: "#0b3f6e",
        },
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(12, 140, 233, 0.35)",
        "glow-sm": "0 0 20px -4px rgba(12, 140, 233, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
