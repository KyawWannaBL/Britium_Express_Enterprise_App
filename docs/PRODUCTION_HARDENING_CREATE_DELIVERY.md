
# Create Delivery Production Hardening

This pass upgrades the Create Delivery and Waybill print flow from transactional scaffold to a safer staging/production baseline.

## Added
- Operator access guard for protected pages and API routes
- Bootstrap access page at `/ops-access`
- Cookie/header based operator identity propagation
- `api_idempotency` table and route-level replay handling
- Real QR code generation for waybill print preview
- Live print preview URL generated from shipment IDs
- Protected `GET /api/deliveries` list endpoint

## Environment
Set in `apps/admin-web/.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
BRITIUM_DISABLE_AUTH=1  # dev only
```

## Operator identity
For pilot/staging, the UI reads:
- `britium_user`
- `britium_role`
- `britium_branch`

These can be set through `/ops-access`.

In production, replace the bootstrap cookies with Supabase Auth + branch-scoped RBAC.

## Idempotency
Supported routes:
- `POST /api/deliveries`
- `POST /api/waybills/print`
- `POST /api/pickups/bulk`

Pass `idempotency-key` in headers to prevent accidental duplicate submissions.

## Print preview
The print route now accepts:
- `/print/waybill?format=4x6_single&shipmentId=<uuid>`
- `/print/waybill?format=a4_batch&ids=<uuid>,<uuid>`

## Remaining production work
- Replace bootstrap access with Supabase Auth session middleware
- Push print jobs into a durable queue/provider
- Add storage-backed XLSX uploads and parser workers
- Add RLS-aware client flows for branch-scoped permissions
- Generate PDF output for office printing
