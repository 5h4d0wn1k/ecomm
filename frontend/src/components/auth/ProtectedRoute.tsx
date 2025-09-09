'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useIsAuthenticated } from '@/lib/stores/auth-store'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath)
        return
      }

      if (requiredRoles.length > 0 && user) {
        const hasRequiredRole = requiredRoles.includes(user.role)
        if (!hasRequiredRole) {
          // Redirect to appropriate dashboard or show error
          if (user.role === 'admin' || user.role === 'super_admin') {
            router.push('/admin/dashboard')
          } else if (user.role === 'vendor') {
            router.push('/vendor/dashboard')
          } else {
            router.push('/')
          }
          return
        }
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRoles, router, fallbackPath])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role)
    if (!hasRequiredRole) {
      return null // Will redirect
    }
  }

  return <>{children}</>
}

export default ProtectedRoute