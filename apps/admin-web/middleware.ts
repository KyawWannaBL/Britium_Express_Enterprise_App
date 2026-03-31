import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // 🛡️ THE EMERGENCY LOCKDOWN
  const isResetPage = pathname === '/auth/must-change-password'
  const isAuthPath = pathname.startsWith('/auth')
  const isPublicFile = pathname.includes('.')

  // 1. If we are on the Reset Page, STOP EVERYTHING. 
  // Do not redirect to the dashboard even if the user is "logged in".
  if (isResetPage) {
    return response
  }

  // 2. If no user and trying to reach a private page, go to Sign-In
  if (!user && !isAuthPath && !isPublicFile) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // 3. If user is logged in and tries to go to Sign-In, go to Dashboard
  // (But the Reset Page check above will prevent this from breaking our flow)
  if (user && pathname === '/auth/sign-in') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}