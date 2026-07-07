/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-highest": "#2d3449",
        "on-surface": "#dae2fd",
        "primary-fixed": "#dde1ff",
        "on-tertiary-fixed": "#2a1700",
        "tertiary-fixed": "#ffddb8",
        "on-primary-container": "#dfe3ff",
        "primary": "#b7c4ff",
        "on-error-container": "#ffdad6",
        "inverse-primary": "#004ced",
        "error-container": "#93000a",
        "on-secondary": "#003915",
        "primary-fixed-dim": "#b7c4ff",
        "inverse-on-surface": "#283044",
        "outline": "#8d90a2",
        "on-primary": "#002682",
        "secondary": "#4ae176",
        "on-tertiary-container": "#ffdfbe",
        "outline-variant": "#434656",
        "surface": "#0b1326",
        "on-tertiary-fixed-variant": "#653e00",
        "surface-variant": "#2d3449",
        "secondary-container": "#00b954",
        "surface-container-high": "#222a3d",
        "tertiary-fixed-dim": "#ffb95f",
        "inverse-surface": "#dae2fd",
        "tertiary": "#ffb95f",
        "surface-dim": "#0b1326",
        "on-secondary-fixed-variant": "#005321",
        "tertiary-container": "#905a00",
        "surface-bright": "#31394d",
        "error": "#ffb4ab",
        "primary-container": "#0052ff",
        "on-primary-fixed": "#001452",
        "on-background": "#dae2fd",
        "surface-tint": "#b7c4ff",
        "background": "#0b1326",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "secondary-fixed": "#6bff8f",
        "surface-container-lowest": "#060e20",
        "on-error": "#690005",
        "on-primary-fixed-variant": "#0038b6",
        "on-surface-variant": "#c3c5d9"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "9999px"
      },
      spacing: {
        "unit": "4px",
        "gutter-desktop": "24px",
        "margin-mobile": "16px",
        "gutter-mobile": "16px",
        "margin-desktop": "48px",
        "container-max": "1440px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
