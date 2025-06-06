/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--secondary-foreground) / <alpha-value>)',
        destructive: 'rgb(var(--destructive) / <alpha-value>)',
        'destructive-foreground': 'rgb(var(--destructive-foreground) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        'success-foreground': 'rgb(var(--success-foreground) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        'warning-foreground': 'rgb(var(--warning-foreground) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        'info-foreground': 'rgb(var(--info-foreground) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
