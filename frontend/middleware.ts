import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/vendor-register',
  '/products',
  '/categories',
]

// Role-based route patterns
const roleRoutes = {
  admin: ['/admin', '/(admin)'],
  vendor: ['/vendor', '/(vendor)'],
  customer: ['/customer', '/(customer)', '/cart', '/checkout', '/orders', '/profile', '/wishlist', '/compare'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token from cookies or Authorization header
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    // Redirect to login for protected routes
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload || !payload.userId || !payload.role) {
      throw new Error('Invalid token payload')
    }

    // Check role-based access
    const userRole = payload.role as string
    const hasAccess = checkRoleAccess(pathname, userRole)

    if (!hasAccess) {
      // Redirect to appropriate dashboard or show unauthorized
      const redirectUrl = getRoleRedirect(userRole, request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Add user info to headers for use in components
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-email', payload.email as string || '')

    return response

  } catch (error) {
    console.error('Auth middleware error:', error)

    // Token is invalid, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)

    // Clear invalid token
    response.cookies.delete('auth-token')

    return response
  }
}

function checkRoleAccess(pathname: string, userRole: string): boolean {
  // Admin has access to everything
  if (userRole === 'admin' || userRole === 'super_admin') {
    return true
  }

  // Check vendor routes
  if (userRole === 'vendor') {
    return roleRoutes.vendor.some(route =>
      pathname.startsWith(route) || pathname.includes(route)
    ) || roleRoutes.customer.some(route =>
      pathname.startsWith(route) || pathname.includes(route)
    )
  }

  // Check customer routes
  if (userRole === 'customer') {
    return roleRoutes.customer.some(route =>
      pathname.startsWith(route) || pathname.includes(route)
    )
  }

  return false
}

function getRoleRedirect(userRole: string, baseUrl: string): URL {
  const base = new URL(baseUrl)

  switch (userRole) {
    case 'admin':
    case 'super_admin':
      return new URL('/admin/dashboard', base)
    case 'vendor':
      return new URL('/vendor/vendor-dashboard', base)
    case 'customer':
      return new URL('/', base)
    default:
      return new URL('/login', base)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}