# Uploaded db.zip, server.zip, and scripts.zip review

This package now includes the Create Delivery UI wired to the repo's Next.js API routes, while preserving the newly uploaded backend materials for reference.

## What the uploaded bundles contained

### db.zip
- reporting SQL templates
- report API/view patterns

### scripts.zip
- Supabase connection and deployment shell scripts
- SQL snippets for tracking, waybill, POD storage policies, courier locations, and supply chain operations
- one-off patch scripts for earlier app builds

### server.zip
- a large legacy/parallel server bundle
- admin API handlers for create delivery, merchants, branches, riders, way management, and reporting
- notify-receiver service including vendored node_modules and sample env files

## Safe merge decision
The uploaded bundles were treated as **reference inputs**, not copied wholesale into runtime paths, because:
- the current repo already uses Next.js App Router routes plus Supabase clients
- the uploaded server bundle includes legacy route structure and vendored dependencies
- direct overwrite would create avoidable TypeScript and deployment risk on Vercel

## What was implemented instead
- Create Delivery UI now calls:
  - `GET /api/customers`
  - `GET /api/addresses/lookup`
  - `POST /api/quotes`
  - `POST /api/deliveries`
  - `POST /api/waybills/print`
  - `POST /api/pickups/bulk`
- bulk template downloads are available under `apps/admin-web/public/templates/`
- the uploaded bundles are preserved under `docs/uploaded-runtime-reference/` for contractors to inspect and selectively merge later

## Next production step
- add authenticated role checks to all admin routes
- add storage-backed XLSX upload parsing
- add real QR rendering on print surfaces
- add idempotency keys on create-delivery transaction routes
- connect Mapbox geocoding/autocomplete into address lookup
