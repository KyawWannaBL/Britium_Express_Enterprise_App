import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: ResponseCookie[]) { 
          cookiesToSet.forEach(({ name, value, ...options }) => 
            cookieStore.set(name, value, options)) 
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  // Redirect to the signed APK URL in Supabase Storage
  const apkUrl = "https://your-project.supabase.co/storage/v1/object/public/builds/britium-enterprise.apk";
  return NextResponse.redirect(apkUrl);
}