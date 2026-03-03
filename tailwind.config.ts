import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#030014',
        primary: '#9333ea', // Purple
        secondary: '#3b82f6', // Blue
        accent: '#eab308', // Yellow
        "light-text": '#f3f4f6',
        "dark-text": '#111827',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
       boxShadow: {
        'glow-purple': '0 0 15px 5px rgba(147, 51, 234, 0.4)',
        'glow-blue': '0 0 15px 5px rgba(59, 130, 246, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config