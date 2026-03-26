# Must Change Password + Role Matrix

This package adds:
- `app_role` support on `operator_profiles`
- `must_change_password` flags on `operator_profiles` and compatibility fields on `profiles`
- `/auth/must-change-password` screen
- middleware redirect until password change is completed
- `scripts/seed_users.js` for server-side auth seeding with `must_change_password=true`

## Required env
For Next.js:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

For local seeding:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Run
```bash
npm install @supabase/supabase-js dotenv
node scripts/seed_users.js
```

## Password flow
1. Operator signs in with starter password.
2. Middleware checks `/api/auth/state`.
3. If `must_change_password=true`, operator is redirected to `/auth/must-change-password`.
4. The screen updates the Supabase Auth password, then POSTs to `/api/auth/complete-password-change`.
5. The flag is cleared and the operator is sent back to the requested screen.
