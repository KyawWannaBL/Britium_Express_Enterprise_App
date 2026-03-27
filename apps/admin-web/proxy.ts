import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// All core logistics modules
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

  // 1. CRITICAL BYPASS: Allows Turbopack, Locales, and Static Chunks to load without Auth
  if (
    process.env.BRITIUM_DISABLE_AUTH === "1" ||
    pathname.startsWith("/_next") ||      // Fixes: Resource preload warnings
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/auth") ||         // Prevents: Infinite redirect loops
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/locales") ||
    pathname.includes(".")                  // Allows: Images, CSS, JS files
  ) {
    return NextResponse.next();
  }

  // 2. Fail-Safe Variable Check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Critical: Supabase variables are missing in current environment.");
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  // 3. Initialize Supabase SSR Client
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

  // 4. Identity Check
  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = protectedPrefixes.some((prefix) => 
    pathname === prefix || pathname.startsWith(prefix)
  );

  // 5. Unauthenticated Access Control
  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    // Redirect back to original path after login
    if (pathname !== "/") {
        redirectUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 6. Post-Login Auto-Navigation
  if (user && (pathname === "/" || pathname === "/auth/sign-in")) {
    return NextResponse.redirect(new URL("/create-delivery", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};