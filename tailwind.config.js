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
        onBlue: "var(--on-blue)",
      },
   
      fontSize: {
        sm: '0.8rem',
        md: '1.1rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.563rem',
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};