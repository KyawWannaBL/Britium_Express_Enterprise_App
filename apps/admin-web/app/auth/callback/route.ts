import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    
    // Guard: Prevent crash if Env Vars are missing in Vercel
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.redirect(`${origin}/auth/sign-in?error=Config_Missing`)
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

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Successful Handshake -> Send to Emerald Reset Screen
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error('Fatal Callback Error:', err)
    }
  }

  // Fallback: Send back to Gateway on failure
  return NextResponse.redirect(`${origin}/auth/sign-in?error=Auth_Session_Failed`)
}
