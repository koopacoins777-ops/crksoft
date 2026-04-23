import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        light: "rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        breathGlow: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
        retentionPulse: {
          "0%, 100%": {
            boxShadow: "0 0 40px 10px rgba(99, 102, 241, 0.3)",
          },
          "50%": { boxShadow: "0 0 80px 30px rgba(99, 102, 241, 0.6)" },
        },
        recoveryGlow: {
          "0%, 100%": {
            boxShadow: "0 0 50px 15px rgba(251, 191, 36, 0.3)",
          },
          "50%": { boxShadow: "0 0 90px 35px rgba(251, 191, 36, 0.55)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "breath-glow": "breathGlow 3s ease-in-out infinite",
        "retention-pulse": "retentionPulse 4s ease-in-out infinite",
        "recovery-glow": "recoveryGlow 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
      },
      transitionDuration: {
        "2000": "2000ms",
        "2500": "2500ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
