"use client";

import { createBrowserClient } from "@supabase/ssr";

function readEnv(name: string, fallback?: string) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined);
}

export function createBrowserSupabaseClient() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL");
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error("Supabase browser environment variables are missing.");
  }

  return createBrowserClient(url, anonKey);
}
