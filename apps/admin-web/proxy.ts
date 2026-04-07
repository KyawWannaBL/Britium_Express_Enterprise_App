import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy-based middleware logic for Britium Express Enterprise.
 * Updated for ESM compatibility and to resolve Restriction blocks.
 */
export async function proxy(request: NextRequest) {
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
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Critical: Refresh session to ensure latest roles/permissions are available
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. If user is logged in and tries to access /auth routes, send them to dashboard
  if (user && pathname.startsWith('/auth') && !pathname.includes('must-change-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. Allow Public Routes (No Auth Required)
  if (pathname.startsWith('/auth') || pathname.startsWith('/customer/portal') || pathname === '/') {
    return response
  }

  // 3. Protect all other routes - Redirect unauthenticated users to login
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 4. Bypass Restrictions for Super Admins
  // This logic prevents the "Access Restricted" screen seen in screenshots image_fa92df.png
  // for high-level admin accounts during the transition phase.
  const isSuperAdmin = user.app_metadata?.role === 'SUPER_ADMIN' || user.email?.includes('admin');
  
  if (isSuperAdmin) {
    return response;
  }

  return response
}

// Ensure the default export is present for Next.js to recognize the proxy module
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}