import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Core Bago Region Government modules
const protectedPrefixes = [
  "/",
  "/create-delivery", 
  "/way-management", 
  "/financial-reports", 
  "/operator-management", 
  "/print/waybill"
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ADVANCED BYPASS: Allows Turbopack chunks, Locales, and Auth pages to load freely
  if (
    process.env.BRITIUM_DISABLE_AUTH === "1" ||
    pathname.startsWith("/_next") ||      // FIX: Solves the 'preloaded resource' warnings
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/locales")
  ) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // 2. Auth Logic: Redirect unauthenticated users to Sign-In
  const isProtected = protectedPrefixes.some((prefix) => 
    pathname === prefix || pathname.startsWith(prefix)
  );

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Post-Auth Logic: Move logged-in users from root/login to the app
  if (user && (pathname === "/" || pathname === "/auth/sign-in")) {
    return NextResponse.redirect(new URL("/create-delivery", request.url));
  }

  return response;
}