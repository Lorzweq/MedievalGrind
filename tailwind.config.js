/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(26 21 18 / <alpha-value>)",
        parchment: "rgb(246 239 225 / <alpha-value>)",
        'parchment-dark': "rgb(212 196 168 / <alpha-value>)",
        dusk: "rgb(59 47 42 / <alpha-value>)",
        ember: "rgb(210 125 45 / <alpha-value>)",
        moss: "rgb(109 139 116 / <alpha-value>)",
        steel: "rgb(139 158 168 / <alpha-value>)",
        royal: "rgb(107 91 149 / <alpha-value>)",
        white: "rgb(255 255 255 / <alpha-value>)",
        transparent: "transparent"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(27, 26, 23, 0.35)",
        pixel: "0 0 0 2px #1b1a17"
      }
    }
  }
}
