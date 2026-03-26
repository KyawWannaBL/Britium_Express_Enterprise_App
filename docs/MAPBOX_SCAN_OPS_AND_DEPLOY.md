# Mapbox Live Ops + Scan Events + Deploy Notes

## Added in this phase
- Real Mapbox GL JS route panel in `apps/admin-web/app/way-management/WayOpsMap.tsx`
- Live driver markers fed from `public.live_vehicle_positions`
- Realtime refresh on `public.vehicle_locations`
- Protected scan-event creation route:
  - `POST /api/way-management/scan-events/create`
- Protected live marker update route:
  - `POST /api/way-management/live-location/upsert`
- Migration:
  - `supabase/migrations/20260326_000007_live_map_and_scan_ops.sql`

## Required environment variables
For Next.js on Vercel, set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

Browser code also tolerates `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_MAPBOX_TOKEN`, but Vercel production should use the `NEXT_PUBLIC_*` names.

## Can this deploy?
Yes, as a staging/production candidate, after:
1. Run all Supabase migrations.
2. Deploy the Supabase Edge Functions.
3. Create operator accounts in Supabase Auth.
4. Insert operator profiles and branch memberships.
5. Set the Vercel environment variables.
6. Remove `BRITIUM_DISABLE_AUTH` in production.
7. Verify Storage buckets exist: `bulk-imports`, `scan-evidence`.

## Remaining go-live checks
- Real driver GPS feed from courier app or telematics provider
- Final RLS review on every operational table
- Waybill print QA on target printers (4x6, 4x3 two-up, A4, A5)
- Backup / restore test
- Error reporting and alerting
- Smoke test on branch-scoped roles
