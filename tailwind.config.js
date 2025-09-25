/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      colors: {
        pink: {
          400: '#f472b6',
        },
        red: {
          400: '#f87171',
        },
        yellow: {
          300: '#fde047',
        }
      }
    },
  },
  plugins: [],
  corePlugins: {
    backgroundClip: true,
  }
};