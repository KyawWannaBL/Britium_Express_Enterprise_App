import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPrefixes = [
  "/create-delivery", 
  "/way-management", 
  "/financial-reports", 
  "/operator-management", 
  "/print/waybill"
];

const authPrefixes = [
  "/auth/sign-in", 
  "/auth/callback", 
  "/auth/must-change-password"
];

const mustChangeAllowedPrefixes = ["/auth/must-change-password", "/auth/callback"];

/**
 * Next.js 16 Proxy Convention
 * This function handles authentication redirection and session management.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static files နှင့် Auth bypass logic
  if (
    process.env.BRITIUM_DISABLE_AUTH === "1" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // 2. Environment Variables Validation (Preventing Runtime Crash)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Critical Error: Missing Supabase Credentials in environment variables.");
    return NextResponse.next(); // Or return an error page
  }

  let response = NextResponse.next({ request });

  // 3. Initialize Supabase Server Client
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 4. Get Current Authenticated User
  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = authPrefixes.some((prefix) => pathname.startsWith(prefix));

  // 5. Unauthenticated User trying to access protected routes
  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 6. Authenticated User Logic
  if (user) {
    // Auth State Check (Role validation & Password Change status)
    const profileResponse = await fetch(new URL("/api/auth/state", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (profileResponse.ok) {
      const state = await profileResponse.json();
      
      // Force password change if required
      const needsPasswordChange = state?.mustChangePassword;
      const onRestrictedRoute = !mustChangeAllowedPrefixes.some((p) => pathname.startsWith(p));

      if (needsPasswordChange && onRestrictedRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/auth/must-change-password";
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Redirect away from login if already authenticated
    if (pathname === "/auth/sign-in") {
      return NextResponse.redirect(new URL("/create-delivery", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};