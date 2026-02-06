/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './lib/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aa-dark-blue': '#0A1F44',
        'aa-orange': '#FF6B00',
        'aa-light-bg': '#F4F7FC',
        'aa-white': '#FFFFFF',
        'aa-text-dark': '#0F172A',
        'aa-gray': '#64748B',
      },
    },
  },
  plugins: [],
}

export default config
