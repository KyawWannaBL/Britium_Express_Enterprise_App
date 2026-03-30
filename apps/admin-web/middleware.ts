import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 1. Refresh session (Crucial for SSR)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl

  // 2. DEFINE EXEMPTIONS: Paths that NEVER redirect to Login
  const isAuthPage = pathname.startsWith('/auth')
  const isCallback = pathname === '/auth/callback'
  const hasRecoveryCode = searchParams.has('code') || searchParams.has('token_hash')
  const isPublicFile = pathname.includes('.') // Static assets

  // 3. LOGIC: If user is at the root or a protected page and not logged in
  if (!user && !isAuthPage && !hasRecoveryCode && !isPublicFile) {
    const loginUrl = new URL('/auth/sign-in', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 4. LOGIC: If user IS logged in but tries to access Sign-In
  if (user && pathname === '/auth/sign-in') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
