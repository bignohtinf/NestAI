import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'notion-black': 'rgba(0, 0, 0, 0.95)',
        'notion-blue': '#0075de',
        'notion-blue-active': '#005bab',
        'notion-blue-focus': '#097fe8',
        'warm-white': '#f6f5f4',
        'warm-dark': '#31302e',
        'warm-gray-500': '#615d59',
        'warm-gray-300': '#a39e98',
        'teal': '#2a9d99',
        'safe-green': '#1aae39',
        'caution-orange': '#dd5b00',
        'pink': '#ff64c8',
        'purple': '#391c57',
        'brown': '#523410',
        'badge-blue-bg': '#f2f9ff',
        'badge-blue-text': '#097fe8',
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
        'pill': '9999px',
      },
      boxShadow: {
        'card': 'rgba(0, 0, 0, 0.04) 0px 4px 18px, rgba(0, 0, 0, 0.027) 0px 2.025px 7.84688px, rgba(0, 0, 0, 0.02) 0px 0.8px 2.925px, rgba(0, 0, 0, 0.01) 0px 0.175px 1.04062px',
        'deep': 'rgba(0, 0, 0, 0.01) 0px 1px 3px, rgba(0, 0, 0, 0.02) 0px 3px 7px, rgba(0, 0, 0, 0.02) 0px 7px 15px, rgba(0, 0, 0, 0.04) 0px 14px 28px, rgba(0, 0, 0, 0.05) 0px 23px 52px',
      },
      spacing: {
        'base': '8px',
      },
    },
  },
  plugins: [],
};

export default config;
