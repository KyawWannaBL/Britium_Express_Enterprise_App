import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getEnv(name: string, fallback?: string, optional = false) {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value && !optional) {
    throw new Error(`${name} is missing.`);
  }
  return value ?? "";
}

export function createAdminClient() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY", undefined, true);
  const anonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY", true);
  const key = serviceRoleKey || anonKey;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
