/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#005c97",
        accent: "#ff7846",
        success: "#0d9f6e",
        danger: "#e23d4b",
        warning: "#f59e0b",
        info: "#3b82f6",
        muted: "#667892",
        light: "#f4f7fb",
        dark: "#122033",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 30px rgba(14, 35, 62, 0.07)",
        hover: "0 12px 20px rgba(0,0,0,0.1)",
        sm: "0 2px 8px rgba(14, 35, 62, 0.05)",
        md: "0 4px 16px rgba(14, 35, 62, 0.07)",
        lg: "0 8px 30px rgba(14, 35, 62, 0.07)",
      },
      borderRadius: {
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideUp: "slideUp 0.3s ease-out",
        "pulse-soft": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
    },
  },
  plugins: [],
};
