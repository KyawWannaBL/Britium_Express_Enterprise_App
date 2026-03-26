import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value) {
    throw new Error(`${name} is missing.`);
  }
  return value;
}

export function createServerClient() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL");
  const anonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
