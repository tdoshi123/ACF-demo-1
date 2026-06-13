import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // App backgrounds (warm near-black, matches PWC --color-bg / surface)
        bg: {
          DEFAULT: "#070708",
          secondary: "#0e0e10",
          card: "#15151a",
          elevated: "#1c1c22",
        },
        // Text (off-white + warm grey, matches PWC --color-fg)
        ink: {
          DEFAULT: "#f4f4f2",
          secondary: "#8a8a85",
          muted: "#4f4f55",
        },
        // Brand
        gold: {
          DEFAULT: "#d4af37",
          soft: "#b18f23", // darker hover variant, matches PWC --color-gold-soft
        },
        // Semantic (PWC palette)
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        // 50/30/20 buckets — kept for product semantics, retoned to match
        needs: "#8a8a85",
        wants: "#d4af37",
        savings: "#22c55e",
      },
      borderColor: {
        DEFAULT: "#23232a",
        subtle: "#23232a",
        strong: "#2f2f38",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -16px rgba(0,0,0,0.6)",
        gold: "0 0 0 1px rgba(212,175,55,0.25), 0 8px 24px -12px rgba(212,175,55,0.45)",
        glow: "0 0 0 1px rgba(212,175,55,0.35), 0 10px 28px -10px rgba(212,175,55,0.55)",
      },
      backgroundImage: {
        // Spotlight: gold radial top + soft green radial bottom-right over near-black
        "gradient-shell":
          "radial-gradient(1100px 600px at 50% -10%, rgba(212,175,55,0.08), transparent 60%), radial-gradient(800px 500px at 100% 100%, rgba(34,197,94,0.05), transparent 60%), #070708",
        "gradient-card":
          "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.00) 100%)",
        "gradient-gold":
          "linear-gradient(180deg, #d4af37 0%, #b18f23 100%)",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      letterSpacing: {
        widest: "0.22em",
      },
    },
  },
  plugins: [],
};

export default config;
