import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // Block access from vercel.app domains in production
  if (process.env.NODE_ENV === 'production' && host.includes('vercel.app')) {
    const url = new URL(request.url)
    url.host = 'plantaoecg.com.br'
    url.port = ''
    return NextResponse.redirect(url, { status: 301 })
  }

  // Create response early so we can modify cookies
  let response = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get user - this also refreshes the session if needed
  const { data: { user }, error } = await supabase.auth.getUser()

  // Determine if we have a valid authenticated user
  // Both error AND missing user should be treated as not authenticated
  const isAuthenticated = !error && user !== null

  const pathname = request.nextUrl.pathname

  // Define route types
  const protectedPaths = ['/dashboard', '/practice', '/admin', '/settings', '/plano']
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname === path)

  // CASE 1: Protected route + NOT authenticated → redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // CASE 2: Auth route + authenticated → redirect to dashboard
  if (isAuthPath && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // CASE 3: Admin route + authenticated → check admin role
  if (pathname.startsWith('/admin') && isAuthenticated) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
