import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const protectedPrefixes = ["/create-delivery", "/way-management", "/financial-reports", "/operator-management", "/print/waybill"];
const authPrefixes = ["/auth/sign-in", "/auth/callback", "/auth/must-change-password"];
const mustChangeAllowedPrefixes = ["/auth/must-change-password", "/auth/callback"];

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value) throw new Error(`${name} is missing.`);
  return value;
}

export async function middleware(request: NextRequest) {
  if (process.env.BRITIUM_DISABLE_AUTH === "1") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }));
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: CookieOptions }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = authPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const profileResponse = await fetch(new URL("/api/auth/state", request.url), {
      headers: {
        cookie: request.headers.get("cookie") ?? ""
      }
    });

    if (profileResponse.ok) {
      const state = await profileResponse.json();
      if (state?.mustChangePassword && !mustChangeAllowedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/auth/must-change-password";
        redirectUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      if (!state?.mustChangePassword && pathname.startsWith("/auth/must-change-password")) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = state?.next ?? "/create-delivery";
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (pathname === "/auth/sign-in") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/create-delivery";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (!isProtected && !isAuthRoute) {
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
