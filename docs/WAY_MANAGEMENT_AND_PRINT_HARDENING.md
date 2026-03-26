
# Way Management + Waybill Print Hardening

This package continues the production path after Supabase Auth, branch-scoped RBAC, and bulk upload workers.

## What changed

### Way Management
- Added protected board API: `GET /api/way-management/board`
- Added protected dispatch action: `POST /api/way-management/dispatch/assign`
- Added protected manifest creation: `POST /api/way-management/manifests/create`
- Added protected transfer preparation: `POST /api/way-management/transfers/create`
- Rebuilt `apps/admin-web/app/way-management` into a real client console that:
  - loads branch-scoped data from protected APIs
  - assigns vehicles
  - selects shipments
  - creates manifests
  - prepares branch transfers
  - surfaces scan chain-of-custody rows

### Waybill Print
- Upgraded `POST /api/waybills/print` to:
  - respect branch eligibility for shipment IDs
  - write a `print_jobs` audit record
  - preserve idempotent behavior
  - return a stable preview URL

## New schema
Migration:
- `supabase/migrations/20260326_000006_way_management_and_print_jobs.sql`

Adds:
- `dispatch_assignments`
- `manifests`
- `manifest_items`
- `branch_transfers`
- `print_jobs`
- `branch_way_management_summary` view

## Notes
- The page and APIs are now aligned to signed-in operator profiles and branch memberships.
- The server still expects your Supabase project to have:
  - operators in Auth
  - matching rows in `operator_profiles`
  - memberships in `operator_branch_memberships`
- Mapbox is still token-ready rather than fully embedded to keep the package stable for Vercel deployment.
