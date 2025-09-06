import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MultiVendor - Multi-Vendor E-Commerce Platform',
  description: 'Shop from thousands of verified vendors across India. Find amazing products at great prices.',
  keywords: 'ecommerce, multi-vendor, online shopping, India, verified vendors',
  authors: [{ name: 'MultiVendor Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}