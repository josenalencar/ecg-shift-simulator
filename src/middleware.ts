import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Block vercel.app domains in production
  const host = request.headers.get('host') || ''
  if (process.env.NODE_ENV === 'production' && host.includes('vercel.app')) {
    const url = new URL(request.url)
    url.host = 'plantaoecg.com.br'
    url.port = ''
    return NextResponse.redirect(url, { status: 301 })
  }

  // IMPORTANT: Create response first, then pass to Supabase
  // This ensures cookies are properly set
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on request for server components
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // Create new response with updated request
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Set cookies on response for browser
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Always call getUser() to refresh session
  // This is what sets the cookies properly
  const { data: { user }, error } = await supabase.auth.getUser()

  // Debug logging
  const cookies = request.cookies.getAll()
  const authCookies = cookies.filter(c => c.name.startsWith('sb-'))
  console.log('[Middleware]', {
    path: request.nextUrl.pathname,
    hasAuthCookies: authCookies.length > 0,
    cookieNames: authCookies.map(c => c.name),
    userId: user?.id || null,
    error: error?.message || null,
  })

  // User is authenticated only if no error and user exists
  const isAuthenticated = !error && !!user

  const pathname = request.nextUrl.pathname

  // Public paths that don't require auth
  const publicPaths = ['/', '/pricing', '/termos', '/privacidade', '/preview']
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback']
  const protectedPaths = ['/dashboard', '/practice', '/admin', '/settings', '/plano']

  const isPublicPath = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthPath = authPaths.some(p => pathname === p || pathname.startsWith(p))
  const isProtectedPath = protectedPaths.some(p => pathname === p || pathname.startsWith(p))

  // Protected route without auth → redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth page with valid auth → redirect to dashboard
  // Exception: /reset-password needs auth (after recovery flow) so don't redirect
  if (isAuthPath && isAuthenticated && pathname !== '/auth/callback' && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin route → check role
  if (pathname.startsWith('/admin') && isAuthenticated && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // IMPORTANT: Always return response to persist cookies
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
