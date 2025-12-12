/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx,html,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      textColor: {
        primary: "var(--primary-text)",
        secondary: "var(--secondary-text)",
        disabled: "var(--disabled-text)",
        danger: "var(--danger-text)",
        success: "var(--success-text)",
        info: "var(--info-text)",
        link: "var(--link-text)",
      },
      backgroundColor: {
        elevated: "var(--elevated-fill)",
        fill: "var(--background-fill)",
        "brand-el": "var(--brand-el-fill)",
        "brand-el-hover": "var(--brand-el-hover-fill)",
        container: "var(--container-fill)",
        "container-hover": "var(--container-fill-hover)",
        overlay: "var(--overlay-fill)",
        sunk: "var(--sunk-fill)",
        "danger-container": "var(--danger-container-fill)",
        "success-container": "var(--success-container-fill)",
        "clickable-element": "var(--clickable-element-fill)",
      },
      borderColor: {
        default: "var(--border-default)",
        interactiveEl: "var(--border-interactive-el)",
        interactiveElHover: "var(--border-interactive-el-hover)",
        interactiveElSelected: "var(--border-interactive-el-selected)",
        canvasElementSelected: "var(--canvas-element-selected-border)",
      },
      spacing: {
        "3xs": "0.125rem",
        "2xs": "0.25rem",
        xs: "0.375rem",
        s: "0.5rem",
        m: "0.75rem",
        l: "1.125rem",
        xl: "1.5rem",
        "2xl": "2.25rem",
        "3xl": "3rem",
      },
      borderRadius: {
        xs: "2px",
      },
      outlineColor: {
        "canvas-selection": "#3B82F6",
      },
      boxShadow: {
        modal: "0px 4px 4px 0px rgba(0, 0, 0, 0.04)",
        md: "0 5px 12.1px 0 rgba(0 0 0 / 0.06), 0 1px 4.5px 0 rgba(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
