export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos del bufete - Oro y Negro elegante
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4af37', // Oro corporativo principal
          600: '#b8941f',
          700: '#9c7a19',
          800: '#7c6115',
          900: '#654e11',
        },
        dark: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          500: '#1a1a1a', // Negro corporativo
          600: '#0f0f0f',
          700: '#0a0a0a',
          900: '#000000',
        },
        accent: {
          50: '#faf5ff',
          500: '#d4af37', // Oro brillante
          600: '#b8941f',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.5s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
