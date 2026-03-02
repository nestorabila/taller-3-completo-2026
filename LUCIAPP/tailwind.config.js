/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {},
  },
  plugins: [], // Asegúrate de esto está limpio por ahora
  corePlugins: {
    preflight: true, // por si se necesita
  }
}
