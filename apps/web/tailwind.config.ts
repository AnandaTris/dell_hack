import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f7f1",
          100: "#d8ead9",
          200: "#aecfb0",
          500: "#5d9464",
          600: "#4a7c50",
          700: "#3a6140",
          800: "#2c4a31",
        },
        accent: {
          50: "#fef7ed",
          100: "#fde8c4",
          400: "#e8a042",
          500: "#d4892e",
        },
        urgent: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
        },
        cream: {
          50: "#faf8f4",
          100: "#f4f0e8",
          200: "#e8e2d6",
        },
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.35s ease-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-6px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
