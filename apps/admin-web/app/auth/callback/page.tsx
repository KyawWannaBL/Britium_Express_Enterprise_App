"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const next = searchParams.get("next") || "/auth/must-change-password";

    // 1. Catch expired or broken links immediately
    if (window.location.hash.includes("error_code")) {
      window.location.href = "/auth/sign-in?error=expired";
      return;
    }

    // 2. The browser automatically parses the hidden #access_token and sets the Cookie!
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = next; // Hard navigation to bypass cache
      }
    });

    // 3. Backup listener just in case it takes a millisecond longer
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        window.location.href = next;
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0b427a', color: '#fff', fontFamily: 'sans-serif' }}>
      <h2>Verifying secure link...</h2>
    </div>
  );
}

// Next.js requires Client Components using 'useSearchParams' to be wrapped in a Suspense boundary
export default function CallbackPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0b427a', color: '#fff' }}><h2>Loading...</h2></div>}>
      <CallbackHandler />
    </Suspense>
  );
}