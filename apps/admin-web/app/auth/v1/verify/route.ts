import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Supabase sends the code as 'token' in this specific path
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  
  // Route 'recovery' types to your Emerald Reset screen
  // Route others (like signup) to the Dashboard
  const next = type === 'recovery' ? '/auth/must-change-password' : '/dashboard'

  if (token) {
    // Bridge this request to your existing /auth/callback logic
    const callbackUrl = new URL('/auth/callback', origin)
    callbackUrl.searchParams.set('code', token)
    callbackUrl.searchParams.set('next', next)
    return NextResponse.redirect(callbackUrl)
  }

  return NextResponse.redirect(`${origin}/auth/sign-in?error=invalid_verification_link`)
}
