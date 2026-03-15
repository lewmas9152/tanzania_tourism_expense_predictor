/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        savanna: {
          50: '#fdf8ee',
          100: '#f9edcc',
          200: '#f2d794',
          300: '#eabc56',
          400: '#e4a22e',
          500: '#d4841a',
          600: '#b96314',
          700: '#974514',
          800: '#7b3617',
          900: '#672e16',
        },
        earth: {
          50: '#f7f3ef',
          100: '#ede4d8',
          200: '#dcc9b2',
          300: '#c8a882',
          400: '#b4875a',
          500: '#a37043',
          600: '#8e5b37',
          700: '#73462d',
          800: '#5f3a28',
          900: '#4f3124',
        },
        dusk: {
          50: '#f0f4f8',
          100: '#d9e6f0',
          200: '#b4cde2',
          300: '#84abcc',
          400: '#5588b4',
          500: '#376a9b',
          600: '#2a5282',
          700: '#23426a',
          800: '#1e3758',
          900: '#1c2f4a',
        },
        copper: '#c17f3e',
        bone: '#f5ede0',
        charcoal: '#1a1612',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
