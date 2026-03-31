import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 1. Sanitize the "next" parameter to prevent doubled URLs
  let next = searchParams.get('next') || '/dashboard'
  if (next.includes('http')) {
    try {
      const nextUrl = new URL(next);
      next = nextUrl.pathname + nextUrl.search;
    } catch (e) {
      next = '/dashboard';
    }
  }

  if (code) {
    const cookieStore = cookies()
    
    // 2. Guard: Prevent 500 crash if Env Vars are missing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("CRITICAL: Supabase Environment Variables missing in Vercel");
      return NextResponse.redirect(`${origin}/auth/sign-in?error=Configuration_Error`)
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }) } catch (e) {}
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }) } catch (e) {}
          },
        },
      }
    )

    // 3. The Handshake
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Handshake successful -> Move to the next room
        return NextResponse.redirect(`${origin}${next}`)
      }
      console.error("Auth Error:", error.message);
    } catch (err) {
      console.error("Fatal Server Error during Auth Handshake:", err);
    }
  }

  // Fallback if everything fails
  return NextResponse.redirect(`${origin}/auth/sign-in?error=Session_Handshake_Failed`)
}
