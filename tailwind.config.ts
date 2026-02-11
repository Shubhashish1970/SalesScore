import type { Config } from "tailwindcss";

const config: Config = {
  safelist: [
    "bg-emerald-500",
    "bg-lime-600",
    "bg-amber-500",
    "bg-red-500",
    "bg-slate-500",
    "bg-emerald-500 text-white",
    "bg-lime-600 text-white",
    "bg-amber-500 text-slate-900",
    "bg-red-500 text-white",
    "bg-slate-500 text-white",
  ],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/types/**/*.{js,ts}",
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
