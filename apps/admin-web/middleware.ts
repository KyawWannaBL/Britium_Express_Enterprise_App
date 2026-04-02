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

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 1. Public Routes (No Auth Required)
  if (pathname.startsWith('/auth') || pathname.startsWith('/customer/portal') || pathname === '/') {
    return response
  }

  // 2. Redirect unauthenticated users to login
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 3. RBAC (Role-Based Access Control) Enforcement
  // Fetch user role from a custom claim or profile table 
  // (Assuming you store the role in localStorage on the client, but for true security, 
  // you would verify against the DB or JWT claims here. For this demo, we ensure they are logged in.)

  // Example Strict Protection: Only FIN and SYS can access financial reports
  // If you implement custom JWT claims in Supabase, you can check: user.app_metadata.role
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
