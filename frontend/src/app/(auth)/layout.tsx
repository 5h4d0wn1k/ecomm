import { ReactNode } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'

interface AuthLayoutProps {
  children: ReactNode
}

export default function Layout({ children }: AuthLayoutProps) {
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  )
}