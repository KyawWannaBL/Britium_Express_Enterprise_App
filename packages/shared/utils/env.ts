/**
 * FAIL-SAFE ENVIRONMENT CONFIGURATION
 * This file replaces strict validation to prevent Vercel monorepo crashes.
 * It uses direct fallbacks to ensure the UI always renders.
 */

export const env = {
  // 1. Supabase Core Connections
  NEXT_PUBLIC_SUPABASE_URL: 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL || 
    'https://dltavabvjwocknkyvwgz.supabase.co',

  NEXT_PUBLIC_SUPABASE_ANON_KEY: 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTMxOTQsImV4cCI6MjA4NjY4OTE5NH0.7-9BK6L9dpCYIB-pp1WOeQxCI1DVxnSykoTRXNUHYIo',

  // 2. Add other variables your app might request here (preventing undefined crashes)
  NEXT_PUBLIC_APP_URL: 
    process.env.NEXT_PUBLIC_APP_URL || 
    'https://britiumexpress.app',

  NODE_ENV: 
    process.env.NODE_ENV || 
    'development',
};

// If your app was using default exports, this ensures compatibility:
export default env;