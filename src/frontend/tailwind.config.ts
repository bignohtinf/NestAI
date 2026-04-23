import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Legacy colors kept for compatibility */
        'notion-black': 'rgba(0, 0, 0, 0.95)',
        'notion-blue': '#0075de',
        'notion-blue-active': '#005bab',
        'notion-blue-focus': '#097fe8',
        'warm-white': '#fdf8f5',
        'warm-dark': '#3d2c28',
        'warm-gray-500': '#6b4f4a',
        'warm-gray-300': '#9a8380',
        'teal': '#2a9d99',
        'safe-green': '#4f9678',
        'caution-orange': '#dd5b00',
        'pink': '#e8608a',
        'purple': '#7c4daa',
        'brown': '#523410',
        'badge-blue-bg': '#f2f9ff',
        'badge-blue-text': '#097fe8',

        /* Warm family palette */
        'warm-coral': '#c8564a',
        'warm-coral-light': '#f7ebe9',
        'warm-sage': '#4f9678',
        'warm-sage-light': '#e8f5ef',
        'warm-amber': '#d4874a',
        'warm-amber-light': '#fef3e8',
        'warm-lavender': '#7c4daa',
        'warm-lavender-light': '#f2ebf8',
        'warm-cream': '#fdf8f5',
        'warm-peach': '#fff2ee',
        'warm-rose': '#e8608a',
        'warm-rose-light': '#fce8ef',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'system-ui',
          'Segoe UI',
          'Helvetica',
          'Apple Color Emoji',
          'Arial',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
        ],
      },
      fontSize: {
        'display-hero': ['4rem', { lineHeight: '1', letterSpacing: '-2.125px' }],
        'display-secondary': ['3.375rem', { lineHeight: '1.04', letterSpacing: '-1.875px' }],
        'section-heading': ['3rem', { lineHeight: '1', letterSpacing: '-1.5px' }],
        'subheading-large': ['2.5rem', { lineHeight: '1.5' }],
        'subheading': ['1.625rem', { lineHeight: '1.23', letterSpacing: '-0.625px' }],
        'card-title': ['1.375rem', { lineHeight: '1.27', letterSpacing: '-0.25px' }],
        'body-large': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.125px' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'nav-button': ['0.9375rem', { lineHeight: '1.33' }],
        'caption': ['0.875rem', { lineHeight: '1.43' }],
        'badge': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0.125px' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        'micro': '4px',
        'subtle': '5px',
        'standard': '8px',
        'comfortable': '12px',
        'large': '16px',
        'xl2': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(180, 100, 80, 0.06), 0 1px 3px rgba(180, 100, 80, 0.04)',
        'card-hover': '0 8px 24px rgba(180, 100, 80, 0.12), 0 2px 8px rgba(180, 100, 80, 0.06)',
        'deep': '0 4px 16px rgba(180, 100, 80, 0.1), 0 8px 32px rgba(180, 100, 80, 0.08)',
        'warm': '0 4px 20px rgba(200, 86, 74, 0.15)',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #c8564a, #d46458)',
        'gradient-warm-soft': 'linear-gradient(135deg, #fce8e5, #fff5f2)',
        'gradient-sage': 'linear-gradient(135deg, #4f9678, #5aab89)',
        'gradient-purple': 'linear-gradient(135deg, #7c4daa, #8f5ec0)',
        'gradient-amber': 'linear-gradient(135deg, #d4874a, #e09558)',
        'gradient-hero': 'linear-gradient(135deg, #c8564a 0%, #d46458 50%, #e07870 100%)',
      },
      spacing: {
        'base': '8px',
      },
    },
  },
  plugins: [],
};

export default config;