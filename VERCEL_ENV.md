# Vercel environment variables

Set these in **Vercel Project Settings → Environment Variables** for Preview and Production.

## Required for Next.js admin app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_MAPBOX_PUBLIC_TOKEN
NEXT_PUBLIC_SITE_URL=https://YOUR_PRODUCTION_DOMAIN
NEXT_PUBLIC_ENABLE_ROUTE_MESSAGING=true

## Required server-only
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

## Optional
NODE_ENV=production

## Local development note
For local Next.js development, place these in:
- `apps/admin-web/.env.local`

Do **not** use `VITE_*` names in the Next.js app. Use `NEXT_PUBLIC_*` instead.