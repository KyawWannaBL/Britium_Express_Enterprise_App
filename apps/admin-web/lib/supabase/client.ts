import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // createBrowserClient automatically creates a singleton instance 
  // so you don't get the "Multiple GoTrueClient instances" warning.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
