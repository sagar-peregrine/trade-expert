/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#0f0f1a",
          card: "#13131f",
          elevated: "#1a1a2e",
        },
        accent: {
          cyan: "#00d4ff",
          green: "#00ff9d",
          red: "#ff3366",
          yellow: "#ffd700",
          purple: "#7b5ea7",
        },
        border: {
          subtle: "#1e1e30",
          default: "#252540",
          bright: "#3a3a5c",
        },
        text: {
          primary: "#e8e8f0",
          secondary: "#8888aa",
          muted: "#555570",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        glow: "glow 2s ease-in-out infinite",
        ticker: "ticker 20s linear infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0, 212, 255, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.6)" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
        "cyan-glow":
          "radial-gradient(ellipse at top, rgba(0,212,255,0.08) 0%, transparent 60%)",
      },
    },
  },
  plugins: [],
};
