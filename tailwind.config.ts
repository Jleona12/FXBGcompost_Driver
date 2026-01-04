import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FXBG Brand Colors (from logo)
        'fxbg-brown': '#754C29',              // Brown from "FXBG" text
        'fxbg-dark-brown': '#5C3D21',         // Darker brown for headers
        'fxbg-green': '#1B5E20',              // Dark green from "compost" text
        'fxbg-dark-green': '#0D3D0D',         // Super dark green for buttons
        'fxbg-accent-green': '#7CB342',       // Accent green from leaves
        'fxbg-light-green': '#9CCC65',        // Light green from leaves
        'fxbg-cream': '#FBF8F3',              // Warm cream background
        'fxbg-beige': '#F5F1E8',              // Subtle beige

        // System Colors
        'ios-bg-primary': '#FFFFFF',
        'ios-bg-secondary': '#FBF8F3',        // Warm cream instead of gray
        'ios-bg-tertiary': '#F5F1E8',
        'ios-separator': 'rgba(92, 61, 33, 0.2)',  // Brown-tinted separator
        'ios-separator-opaque': '#D4C4B0',

        // Interactive
        'ios-blue': '#007AFF',
        'ios-red': '#FF3B30',
        'ios-orange': '#FF9500',

        // Labels (brown-tinted)
        'ios-label': '#2C1810',
        'ios-label-secondary': '#754C29',
        'ios-label-tertiary': 'rgba(92, 61, 33, 0.6)',
        'ios-label-quaternary': 'rgba(92, 61, 33, 0.18)',
      },
      fontSize: {
        'ios-large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
        'ios-title-1': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'ios-title-2': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'ios-title-3': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'ios-headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'ios-body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'ios-callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'ios-subheadline': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'ios-footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'ios-caption-1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'ios-caption-2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },
      boxShadow: {
        'ios-sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'ios': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'ios-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'ios-lg': '0 8px 24px rgba(0, 0, 0, 0.10)',
        'ios-xl': '0 12px 32px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '10px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      letterSpacing: {
        'tighter': '-0.5px',
        'tight': '-0.4px',
        'normal': '0',
        'wide': '0.4px',
        'wider': '0.5px',
      },
    },
  },
  plugins: [],
}
export default config
