/** @type {import('tailwindcss').Config} */
module.exports = {
   darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
     require('flowbite/plugin'),
  ],
  daisyui: {
    themes: [
      "light", "dark", "cupcake", "bumblebee", "emerald",
      "corporate", "synthwave", "retro", "cyberpunk",
      "valentine", "halloween", "garden", "forest",
      "aqua", "lofi", "pastel", "fantasy", "wireframe",
      "black", "luxury", "dracula", "cmyk"
    ],
  },
}

