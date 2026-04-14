/** @type { import('tailwindcss').Config } */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      letterSpacing: {
        'billboard': '-2.05px',
      },
      fontSize: {
        'display-hero': ['82px', { lineHeight: '1.0', letterSpacing: '-2.05px', fontWeight: '400' }],
        'section-heading': ['56px', { lineHeight: '0.95', fontWeight: '400' }],
        'subheading-large': ['48px', { lineHeight: '0.95', fontWeight: '400' }],
        'subheading': ['32px', { lineHeight: '1.15', fontWeight: '400' }],
        'card-title': ['30px', { lineHeight: '1.20', fontWeight: '400' }],
        'feature-title': ['24px', { lineHeight: '1.33', fontWeight: '400' }],
      },
      boxShadow: {
        'golden-hour': 'rgba(127, 99, 21, 0.12) -8px 16px 39px, rgba(127, 99, 21, 0.1) -33px 64px 72px, rgba(127, 99, 21, 0.06) -73px 144px 97px',
      },
    },
  },
  plugins: [],
}
