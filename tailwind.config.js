/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-light': '#818CF8',
        'primary-dark': '#3730A3',
        'primary-bg': '#EEF2FF',
        secondary: '#3B82F6',
        'accent-urgent': '#F59E0B',
        success: '#10B981',
        danger: '#EF4444',
        'bg-page': '#F8FAFC',
        'bg-card': '#FFFFFF',
        'bg-sidebar': '#1E1B4B',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-muted': '#94A3B8',
        border: '#E2E8F0',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
