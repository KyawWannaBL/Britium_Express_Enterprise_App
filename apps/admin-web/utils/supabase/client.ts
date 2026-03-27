import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 1. Get the variables (allow them to be undefined without instantly crashing)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 2. Fail-Safe: Instead of throwing a fatal error that breaks the website, 
  // we log a warning and pass empty strings so the UI can still load.
  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Client-side Supabase keys are missing. Check Vercel Environment Variables or Monorepo Root Directory settings.");
  }

  // 3. Initialize the client safely
  return createBrowserClient(
    supabaseUrl || '', 
    supabaseKey || ''
  );
}