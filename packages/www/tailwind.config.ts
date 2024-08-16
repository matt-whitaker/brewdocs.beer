import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./**/*.{html}",
  ],
  theme: {
  },
  plugins: [
    daisyui,
  ],
};
export default config;
