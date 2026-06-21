/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#D429F3',
          50: '#FBE7FE',
          100: '#F6C7FC',
          200: '#EDA3F8',
          300: '#E47FF3',
          400: '#DC57EF',
          500: '#D429F3',
          600: '#AA21C2',
          700: '#801A92',
          800: '#561361',
          900: '#2C0B31',
        },
        lav: {
          DEFAULT: '#E6D9E8',
          50: '#F8F2F9',
          100: '#EFE5F1',
          200: '#E6D9E8',
          300: '#D2BBD6',
          400: '#B798BD',
          500: '#9B7AA1',
        },
        ink: {
          DEFAULT: '#1F1B20',
          muted: '#6B6573',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
        body: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(212, 41, 243, 0.25)',
      },
    },
  },
  plugins: [],
};
