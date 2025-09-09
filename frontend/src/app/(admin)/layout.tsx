import { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/admin-layout'

interface AdminLayoutProps {
  children: ReactNode
}

export default function Layout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  )
}