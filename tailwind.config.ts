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
        mahjong: {
          green: "#0a5c36",
          felt: "#1a7d4e",
          tile: "#f5f0e6",
          "tile-back": "#2d5a3d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
