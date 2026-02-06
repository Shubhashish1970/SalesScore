import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Mobile-first: min widths for breakpoints; 360px is baseline
      screens: {
        xs: "360px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
      },
    },
  },
  plugins: [],
};
export default config;
