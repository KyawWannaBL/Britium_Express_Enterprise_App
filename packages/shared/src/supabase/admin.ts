import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Fail-Safe getEnv: Never throw an error, always return a string
function getEnvSafe(name: string, fallback?: string) {
  return process.env[name] || (fallback ? process.env[fallback] : "") || "";
}

export function createServerClient() {
  const url = getEnvSafe("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL") || 'https://dltavabvjwocknkyvwgz.supabase.co';
  const anonKey = getEnvSafe("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY") || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTMxOTQsImV4cCI6MjA4NjY4OTE5NH0.7-9BK6L9dpCYIB-pp1WOeQxCI1DVxnSykoTRXNUHYIo';

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}