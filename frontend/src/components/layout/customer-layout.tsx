'use client'

import { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { useAuthStore, useUser } from '@/lib/stores/auth-store'

interface CustomerLayoutProps {
  children: ReactNode
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const user = useUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}