// DELETE the getEnv function entirely, and replace the client initialization with this:

function createRequestSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }));
        },
        setAll() {
          // Leave empty: API routes should only read cookies, the middleware handles setting them.
        }
      }
    }
  );
}