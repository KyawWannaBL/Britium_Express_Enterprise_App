# Next Step Wiring

This pass moves the admin web from static showcase pages toward production wiring.

## What changed
- Added `apps/admin-web/lib/server-supabase.ts`
- Added `apps/admin-web/lib/data.ts`
- Upgraded these pages to async server components:
  - `app/create-delivery/page.tsx`
  - `app/way-management/page.tsx`
  - `app/financial-reports/page.tsx`

## Data sources
The admin app now attempts to read from these Supabase tables:
- `shipments`
- `waybills`
- `scan_events`
- `branches`
- `vehicles`
- `tasks`

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing, the pages fall back to curated mock data.

## Current finance starter logic
The financial dashboard currently treats shipments with status `delivered` as settled value.
This keeps the screen useful until dedicated COD remittance and settlement tables are introduced.

## Recommended next implementation slice
1. Add a real `customers` table and customer search RPC.
2. Add `addresses` and serviceability lookup.
3. Add `manifests`, `bags`, and `branch_transfers` tables.
4. Add server-side PDF / label generation for exact waybill printing.
