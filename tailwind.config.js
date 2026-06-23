/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0891B2',
        'primary-light': '#06B6D4',
        'primary-dark': '#0E7490',
        'primary-bg': '#ECFEFF',
        secondary: '#06B6D4',
        'accent-urgent': '#F97316',
        'accent-bg': '#FFF7ED',
        success: '#10B981',
        danger: '#EF4444',
        'bg-page': '#F8FAFC',
        'bg-card': '#FFFFFF',
        'bg-sidebar-start': '#0F172A',
        'bg-sidebar-end': '#164E63',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-muted': '#94A3B8',
        border: '#E2E8F0',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
