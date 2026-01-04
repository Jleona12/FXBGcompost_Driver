import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'
import OfflineIndicator from '@/components/OfflineIndicator'

export const metadata: Metadata = {
  title: 'FXBG Compost Driver',
  description: 'Driver application for FXBG Compost pickup routes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FXBG Compost Driver',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D3D0D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        <OfflineIndicator />
        <Header />
        {children}
      </body>
    </html>
  )
}
