import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111318",
        smoke: "#f4f2ee",
        navy: "#111d31",
        line: "#dfddd8",
        gold: "#a98952"
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "system-ui", "sans-serif"],
        serif: ["Georgia", "Yu Mincho", "serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17,19,24,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
