import type { Metadata } from 'next'
import { Familjen_Grotesk } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from './providers'

const familjenGrotesk = Familjen_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
})

const geistMono = GeistMono

export const metadata: Metadata = {
  title: 'SETU — Bluecom CRM',
  description: 'B2B Sales CRM for Bluecom Group',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${familjenGrotesk.variable} ${geistMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
