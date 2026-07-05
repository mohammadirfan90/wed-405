/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDFCF9',
        charcoal: '#1A1A1A',
        taupe: '#8B7D6B',
        gold: '#D4AF37',
        brand: {
          DEFAULT: '#D4AF37',
          50: '#FBF6E7',
          100: '#F4E7BD',
          200: '#EAD58A',
          300: '#DCC56B',
          400: '#D4AF37',
          500: '#D4AF37',
          600: '#B8952D',
          700: '#947622',
          800: '#6B5419',
          900: '#3F300E',
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
        // Portfolio SPA tokens — "darkroom" editorial palette
        paper: {
          DEFAULT: '#F2EBE0',   // warm parchment
          50: '#FAF6EF',
          100: '#F5EFE4',
          200: '#EDE3D2',
          300: '#DCCCB0',
        },
        carbon: {
          DEFAULT: '#0E0D0B',   // near-black ink
          50: '#1B1916',
          100: '#15130F',
          200: '#0E0D0B',
          300: '#080705',
        },
        sepia: {
          DEFAULT: '#A8541A',   // warm accent
          50: '#FBF1E8',
          100: '#F0D9BE',
          200: '#D89A5C',
          300: '#A8541A',
          400: '#7A3C12',
        },
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'sans-serif'],
        body: ['"Satoshi"', 'sans-serif'],
        sans: ['"Satoshi"', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
        // Portfolio SPA fonts
        editorial: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans2: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono2: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(31, 27, 32, 0.15)',
        film: '0 30px 60px -20px rgba(14, 13, 11, 0.45)',
        sepia: '0 20px 40px -20px rgba(168, 84, 26, 0.5)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        reveal: {
          '0%': { opacity: 0, transform: 'translateY(28px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-2%,-1%)' },
          '30%': { transform: 'translate(2%,1%)' },
          '50%': { transform: 'translate(-1%,2%)' },
          '70%': { transform: 'translate(1%,-2%)' },
          '90%': { transform: 'translate(-2%,1%)' },
        },
        blink: {
          '0%, 92%, 100%': { opacity: 1 },
          '95%': { opacity: 0.2 },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        reveal: 'reveal 0.9s cubic-bezier(.2,.7,.1,1) both',
        grain: 'grain 8s steps(6) infinite',
        blink: 'blink 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
