#!/usr/bin/env bash
set -euo pipefail

echo "1) Verify env vars"
test -n "${NEXT_PUBLIC_SUPABASE_URL:-}" || { echo "Missing NEXT_PUBLIC_SUPABASE_URL"; exit 1; }
test -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" || { echo "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"; exit 1; }
test -n "${SUPABASE_SERVICE_ROLE_KEY:-}" || { echo "Missing SUPABASE_SERVICE_ROLE_KEY"; exit 1; }

echo "2) Link Supabase project"
supabase link --project-ref "${SUPABASE_PROJECT_REF:?Missing SUPABASE_PROJECT_REF}"

echo "3) Push DB migrations"
supabase db push

echo "4) Deploy Edge Functions"
supabase functions deploy bulk-pickup-parser
# add any others here:
# supabase functions deploy enterprise-admin
# supabase functions deploy shipping-calculator
# supabase functions deploy shipment-notifications

echo "5) Done. Deploy Next.js via Vercel separately."