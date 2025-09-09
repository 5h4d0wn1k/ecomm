import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { PublicLayout } from '@/components/layout/public-layout'
import { ZustandProvider } from '@/components/providers/zustand-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3003'),
  title: 'DAV Creations - Premium Multi-Vendor E-Commerce Platform',
  description: 'Shop from thousands of verified vendors across India. Find amazing products at great prices.',
  keywords: 'ecommerce, multi-vendor, online shopping, India, verified vendors',
  authors: [{ name: 'DAV Creations Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DAV Creations',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'DAV Creations',
    title: 'DAV Creations - Premium Multi-Vendor E-Commerce Platform',
    description: 'Shop from thousands of verified vendors across India. Find amazing products at great prices.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DAV Creations - Premium Multi-Vendor E-Commerce Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DAV Creations - Premium Multi-Vendor E-Commerce Platform',
    description: 'Shop from thousands of verified vendors across India. Find amazing products at great prices.',
    images: ['/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ec4899',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/logos/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/logos/favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DAV Creations" />
      </head>
      <body className={inter.className}>
        <ZustandProvider>
          <PublicLayout>
            {children}
          </PublicLayout>
        </ZustandProvider>
      </body>
    </html>
  )
}