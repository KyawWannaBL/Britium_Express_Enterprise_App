# Backend Review and Safe Merge

This repo merges the uploaded Supabase backend bundle into the Britium Express monorepo without breaking the existing Vercel + Expo app structure.

## What was wrong in the uploaded ZIP
- It did not include the full app layer.
- `supabase/config.toml` expected `seed.sql`, but the upload only had `seed.ts`.
- `seed.ts` imported a missing file path and referenced tables that were not guaranteed to exist.
- `.temp/` local Supabase metadata was present and should not be shared.
- Some edge functions referenced tables and views not clearly created by the active migrations.

## What was fixed here
- Kept the existing full app structure intact.
- Added a clean `supabase/config.toml`.
- Added a working `supabase/seed.sql` for local reset.
- Added `20260326_000002_enterprise_compat.sql` to create compatibility tables:
  - `hubs`
  - `vehicles`
  - `tasks`
  - `way_management_summary_2026`
- Rewrote `enterprise-admin`, `shipping-calculator`, and `shipment-notifications` functions to match the current schema.
- Preserved the uploaded backend under `docs/uploaded-backend-reference/` for audit and later selective adoption.
- Excluded `.temp/` from the merged repo.

## Recommended next cleanup
- Decide which uploaded migrations should become active instead of reference-only.
- Add pgTAP test execution to CI if the database tests from the uploaded bundle will be used.
- Normalize role names across `profiles`, Auth metadata, and admin UI.
- Wire the print routes and bulk intake UI to these Supabase functions and tables.
