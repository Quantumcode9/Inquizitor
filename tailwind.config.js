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
        primary: "var(--primary-color)",
        background: "var(--background)",
        cardBackground: "var(--card-background)",
        text: "var(--text-color)",
        secondaryText: "var(--secondary-text-color)",
        accent: "var(--accent-color)",
        error: "var(--error-color)",
        darkPrimary: '#01949A', 
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};