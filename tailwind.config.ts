import type { Config } from "tailwindcss";

/**
 * Theme tokens point to CSS variables defined in app/globals.css.
 * Single source of truth for colours — pick CSS-vars in inline styles or
 * Tailwind utility classes interchangeably without drift.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        "card-border": "var(--card-border)",
        cyan: "var(--cyan)",
        purple: "var(--purple)",
        green: "var(--green)",
        amber: "var(--amber)",
        red: "var(--red)",
      },
      borderRadius: {
        card: "12px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
