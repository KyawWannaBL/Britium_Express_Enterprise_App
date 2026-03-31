import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // FORCE the destination to the reset screen for recovery flows
  const next = '/auth/must-change-password'

  if (code) {
    const cookieStore = cookies()
    
    // 🛡️ CRITICAL GUARD: Check for Env Vars to prevent 500 Crash
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("CRITICAL: Supabase Environment Variables are missing in Vercel!")
      return NextResponse.redirect(`${origin}/auth/sign-in?error=Configuration_Missing`)
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }) } catch (e) {
              // Ignore cookie errors during redirect
            }
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }) } catch (e) {
              // Ignore cookie errors during redirect
            }
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Handshake successful -> Move to the next room
        return NextResponse.redirect(new URL(next, origin))
      }
      console.error("Auth Exchange Error:", error.message)
    } catch (err) {
      console.error("Fatal Handshake Error:", err)
    }
  }

  // Fallback if everything fails
  return NextResponse.redirect(new URL('/auth/sign-in?error=Handshake_Failed', origin))
}
