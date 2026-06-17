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
        bg: '#FFFFFF',
        surface: '#F9FAFB',
        'surface-2': '#F3F4F6',
        border: '#E5E7EB',
        'text-1': '#111827',
        'text-2': '#6B7280',
        'text-3': '#9CA3AF',
        accent: '#0D9488',
        'accent-bg': '#CCFBF1',
        'accent-text': '#0F766E',
        danger: '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        grotesk: ['var(--font-grotesk)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.5', letterSpacing: '0.06em', fontWeight: '500' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.5' }],
        md: ['15px', { lineHeight: '1.5', fontWeight: '600' }],
        lg: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        xl: ['24px', { lineHeight: '1.2', fontWeight: '600' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
      },
      borderWidth: {
        DEFAULT: '0.5px',
      },
    },
  },
  plugins: [],
}

export default config
