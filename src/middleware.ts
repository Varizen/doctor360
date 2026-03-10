import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100')
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000') // 1 minute

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/appointments',
  '/patients',
  '/doctors',
  '/emr',
  '/prescriptions',
  '/payments',
  '/settings',
  '/api/appointments',
  '/api/patients',
  '/api/doctors',
  '/api/emr',
  '/api/prescriptions',
  '/api/payments',
  '/api/upload',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // Get client IP from headers (NextRequest doesn't have .ip property)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const key = `${ip}:${pathname}`
    const now = Date.now()

    const limit = rateLimit.get(key)
    if (limit) {
      if (now > limit.resetTime) {
        rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
      } else if (limit.count >= RATE_LIMIT_MAX) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil((limit.resetTime - now) / 1000)),
            },
          }
        )
      } else {
        limit.count++
      }
    } else {
      rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    }
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('doctor360_session')

    if (!sessionCookie) {
      // Redirect to login for page routes
      if (!pathname.startsWith('/api/')) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Return 401 for API routes
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Add security headers
  const response = NextResponse.next()

  // CSP Header (adjust based on your needs)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.cloudinary.com https://*.supabase.co https://*.upstash.io",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
