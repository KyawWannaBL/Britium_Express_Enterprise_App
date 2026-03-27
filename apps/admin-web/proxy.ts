import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// All routes including root "/" are now protected to force redirect to sign-in
const protectedPrefixes = [
  "/",                     // ADDED: Force authentication on the landing page
  "/create-delivery", 
  "/way-management", 
  "/financial-reports", 
  "/operator-management", 
  "/print/waybill"
];

const mustChangeAllowedPrefixes = ["/auth/must-change-password", "/auth/callback"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static files နှင့် Auth pages Bypass logic
  if (
    process.env.BRITIUM_DISABLE_AUTH === "1" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/auth") // auth pages ကို redirect loop မဖြစ်စေရန် bypass လုပ်ရပါမည်
  ) {
    return NextResponse.next();
  }

  // 2. Environment Variables Validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
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
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 4. Get Current Authenticated User
  const { data: { user } } = await supabase.auth.getUser();

  // 5. Logic to determine if current path needs protection
  const isProtected = protectedPrefixes.some((prefix) => 
    pathname === prefix || pathname.startsWith(prefix)
  );

  // 6. Unauthenticated User logic: Force Redirect to Sign-In
  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    // root page မဟုတ်လျှင် 'next' parameter ထည့်ပေးမည်
    if (pathname !== "/") {
      redirectUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 7. Authenticated User Logic (Password Change & Auto-redirect from login)
  if (user) {
    // API Check for password change status
    const profileResponse = await fetch(new URL("/api/auth/state", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (profileResponse.ok) {
      const state = await profileResponse.json();
      const needsPasswordChange = state?.mustChangePassword;
      const onRestrictedRoute = !mustChangeAllowedPrefixes.some((p) => pathname.startsWith(p));

      if (needsPasswordChange && onRestrictedRoute) {
        return NextResponse.redirect(new URL("/auth/must-change-password", request.url));
      }
    }

    // Login page သို့ ပြန်သွားပါက Dashboard သို့ ပြန်ပို့ပေးရန်
    if (pathname === "/auth/sign-in" || pathname === "/") {
      return NextResponse.redirect(new URL("/create-delivery", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};