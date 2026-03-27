import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // HARDCODE the fallback directly into the client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dltavabvjwocknkyvwgz.supabase.co';
  
  // Replace the string below with your ACTUAL long Anon Key starting with eyJ...
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTMxOTQsImV4cCI6MjA4NjY4OTE5NH0.7-9BK6L9dpCYIB-pp1WOeQxCI1DVxnSykoTRXNUHYIo';

  return createBrowserClient(supabaseUrl, supabaseKey);
}