import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#08101F",
        surface: "#0C1826",
        "surface-2": "#112236",
        cyan: "#00D4FF",
        purple: "#7C3AED",
        green: "#22C55E",
        amber: "#F59E0B",
        red: "#EF4444",
        "text-1": "#E8F4FD",
        "text-2": "#7E9BB5",
        "text-3": "#4A6580",
      },
      borderRadius: {
        card: "12px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
