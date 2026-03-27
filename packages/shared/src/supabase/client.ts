import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const createClient = () => {
  // Hardcoded bypass for Vercel Monorepo environment bug
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dltavabvjwocknkyvwgz.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_LONG_ANON_KEY_HERE';

  if (!url || !anonKey) {
     console.warn("⚠️ Legacy Supabase environment variables missing. Using fallbacks.");
  }

  return createSupabaseClient(url, anonKey);
};