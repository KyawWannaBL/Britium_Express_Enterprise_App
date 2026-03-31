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

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname, searchParams } = request.nextUrl

  // --- 🛡️ THE LOOP-BREAKER LOGIC ---
  
  // 1. Detect any kind of Auth Token (code, token, or token_hash)
  const hasAuthToken = searchParams.has('code') || 
                       searchParams.has('token') || 
                       searchParams.has('token_hash');

  // 2. Define Auth-related paths that should never be blocked
  const isAuthPath = pathname.startsWith('/auth')
  const isPublicFile = pathname.includes('.')

  // 3. LOGIC: If no user and NOT an auth path/token, force Login
  // We added !hasAuthToken here to ensure the recovery link can "pass through"
  if (!user && !isAuthPath && !hasAuthToken && !isPublicFile) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // 4. LOGIC: If logged in and tries to go to Sign-In, go to Dashboard
  // BUT: Allow them to stay on /auth/must-change-password even if "logged in"
  if (user && pathname === '/auth/sign-in') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}