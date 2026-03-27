import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * FIXED: Explicitly typed 'cookiesToSet' to resolve Vercel "implicit any" error.
 * This ensures the production build succeeds for the Bago Region Government portal.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // Type definition added for cookiesToSet array
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component ထဲတွင် ခေါ်ယူပါက cookie set လုပ်၍မရသောကြောင့် ignore လုပ်ထားခြင်းဖြစ်သည်
          }
        },
      },
    }
  )
}