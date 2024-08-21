import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: ["nord", "coffee", "autumn"]
  }
};
