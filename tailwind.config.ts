import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			'fxbg-brown': '#754C29',
  			'fxbg-dark-brown': '#5C3D21',
  			'fxbg-green': '#1B5E20',
  			'fxbg-dark-green': '#0D3D0D',
  			'fxbg-accent-green': '#7CB342',
  			'fxbg-light-green': '#9CCC65',
  			'fxbg-cream': '#FBF8F3',
  			'fxbg-beige': '#F5F1E8',
  			'ios-bg-primary': '#FFFFFF',
  			'ios-bg-secondary': '#FBF8F3',
  			'ios-bg-tertiary': '#F5F1E8',
  			'ios-separator': 'rgba(92, 61, 33, 0.2)',
  			'ios-separator-opaque': '#D4C4B0',
  			'ios-blue': '#007AFF',
  			'ios-red': '#FF3B30',
  			'ios-orange': '#FF9500',
  			'ios-label': '#2C1810',
  			'ios-label-secondary': '#754C29',
  			'ios-label-tertiary': 'rgba(92, 61, 33, 0.6)',
  			'ios-label-quaternary': 'rgba(92, 61, 33, 0.18)',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontSize: {
  			'ios-large-title': [
  				'34px',
  				{
  					lineHeight: '41px',
  					fontWeight: '700'
  				}
  			],
  			'ios-title-1': [
  				'28px',
  				{
  					lineHeight: '34px',
  					fontWeight: '700'
  				}
  			],
  			'ios-title-2': [
  				'22px',
  				{
  					lineHeight: '28px',
  					fontWeight: '600'
  				}
  			],
  			'ios-title-3': [
  				'20px',
  				{
  					lineHeight: '25px',
  					fontWeight: '600'
  				}
  			],
  			'ios-headline': [
  				'17px',
  				{
  					lineHeight: '22px',
  					fontWeight: '600'
  				}
  			],
  			'ios-body': [
  				'17px',
  				{
  					lineHeight: '22px',
  					fontWeight: '400'
  				}
  			],
  			'ios-callout': [
  				'16px',
  				{
  					lineHeight: '21px',
  					fontWeight: '400'
  				}
  			],
  			'ios-subheadline': [
  				'15px',
  				{
  					lineHeight: '20px',
  					fontWeight: '400'
  				}
  			],
  			'ios-footnote': [
  				'13px',
  				{
  					lineHeight: '18px',
  					fontWeight: '400'
  				}
  			],
  			'ios-caption-1': [
  				'12px',
  				{
  					lineHeight: '16px',
  					fontWeight: '400'
  				}
  			],
  			'ios-caption-2': [
  				'11px',
  				{
  					lineHeight: '13px',
  					fontWeight: '400'
  				}
  			]
  		},
  		boxShadow: {
  			'ios-sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
  			ios: '0 2px 8px rgba(0, 0, 0, 0.08)',
  			'ios-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
  			'ios-lg': '0 8px 24px rgba(0, 0, 0, 0.10)',
  			'ios-xl': '0 12px 32px rgba(0, 0, 0, 0.12)'
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			DEFAULT: '10px',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '20px',
  			'2xl': '24px'
  		},
  		letterSpacing: {
  			tighter: '-0.5px',
  			tight: '-0.4px',
  			normal: '0',
  			wide: '0.4px',
  			wider: '0.5px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
