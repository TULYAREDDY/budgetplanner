/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4dabf7',
        secondary: '#63e6be',
        background: '#f8f9fa',
        textPrimary: '#343a40',
        priority: {
          high: '#228be6',
          medium: '#ffa94d',
          low: '#ff6b6b'
        },
        success: '#51cf66',
        warning: '#ffd43b',
        danger: '#fa5252'
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)'
      },
      borderRadius: {
        'xl': '1rem'
      }
    },
  },
  plugins: [],
};