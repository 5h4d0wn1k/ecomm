import { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CustomerLayout } from '@/components/layout/customer-layout'

interface CustomerLayoutProps {
  children: ReactNode
}

export default function Layout({ children }: CustomerLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={['customer']}>
      <CustomerLayout>
        {children}
      </CustomerLayout>
    </ProtectedRoute>
  )
}