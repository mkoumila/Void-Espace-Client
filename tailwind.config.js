/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void': {
          DEFAULT: '#000000', // Ajustez selon votre charte graphique
          light: '#1a1a1a', // Ajout d'une nuance plus claire pour le dégradé
        }
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

