import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPrefixes = ["/create-delivery", "/way-management", "/financial-reports", "/operator-management", "/print/waybill"];
const authPrefixes = ["/auth/sign-in", "/auth/callback", "/auth/must-change-password"];
const mustChangeAllowedPrefixes = ["/auth/must-change-password", "/auth/callback"];

// Next.js 16 convention အရ "proxy" အမည်ဖြင့် export လုပ်ပါ
export async function proxy(request: NextRequest) {
  if (process.env.BRITIUM_DISABLE_AUTH === "1") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = authPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    // Auth State Check logic
    const profileResponse = await fetch(new URL("/api/auth/state", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" }
    });

    if (profileResponse.ok) {
      const state = await profileResponse.json();
      if (state?.mustChangePassword && !mustChangeAllowedPrefixes.some((p) => pathname.startsWith(p))) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/auth/must-change-password";
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (pathname === "/auth/sign-in") {
      return NextResponse.redirect(new URL("/create-delivery", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};