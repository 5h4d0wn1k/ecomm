import { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { VendorLayout } from '@/components/layout/vendor-layout'

interface VendorLayoutProps {
  children: ReactNode
}

export default function Layout({ children }: VendorLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={['vendor']}>
      <VendorLayout>
        {children}
      </VendorLayout>
    </ProtectedRoute>
  )
}