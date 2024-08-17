import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        beer: {
          1: "#F3F993", // Pale Straw
          3: "#F5F75C", // Straw
          6: "#F6F513", // Pale Gold
          9: "#EAE615", // Deep Gold
          12: "#E0D01B", // Light Amber
          15: "#D5BC26", // Amber
          18: "#CDAA37", // Deep Amber
          20: "#C1963C", // Copper
          24: "#BE823A", // Deep Copper
          30: "#C17A37", // Brown
          35: "#BC6733", // Ruby Brown
          40: "#8D4A43", // Deep Brown
          50: "#5D3B2E" // Black (fallback value),
        }
      }
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: ["nord", "coffee"]
  }
};
export default config;
