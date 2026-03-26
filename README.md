
# Britium Express Delivery Platform

Monorepo starter for a Myanmar / English parcel and courier platform using:
- Next.js admin web for Vercel
- Expo mobile apps for customer and courier workflows
- Supabase for database, auth, storage, and edge functions

## Admin modules
- `/create-delivery` - booking cockpit, address lookup, customer lookup, quote engine, live waybill preview, QR print modal, bulk intake
- `/way-management` - route and way plan management
- `/financial-reports` - finance and settlement reporting

## Waybill print profiles
- 4 x 6 in single thermal label
- 2-up 4 x 3 in on 4 x 6 sheet
- A4 single or batch office print
- A5 single or batch office print

## Bulk upload templates
Templates are available under `apps/admin-web/public/templates/`.

## Git Bash quick start
```bash
git clone <your-repo-url> britium-express-platform
cd britium-express-platform

# workspace install
npm install

# run admin web
cd apps/admin-web
cp .env.example .env.local
npm install
npm run dev
```

## Suggested environment variables
Admin web:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

Customer / courier mobile:
```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

## Notes
- The create-delivery module includes print-oriented preview components that can be connected to server-side PDF generation later.
- Bulk upload should validate phone format, address completeness, service type, COD values, and print profile before booking creation.

## Latest enhancement
- `/way-management` now includes a premium dispatch board, Mapbox-inspired route planning panel, driver/rider visibility, scan chain-of-custody timeline, and manifest / bag / branch transfer controls based on the uploaded reference files.
- Uploaded references are preserved under `apps/admin-web/public/references/`.


## Latest enhancement 2
- `/create-delivery/print-studio` added for exact waybill print routing.
- `/print/waybill` added for production-size print surfaces across 4x6, 4x3 two-up, A4, and A5.
- Vercel server routes added:
  - `POST /api/quotes`
  - `POST /api/waybills/print`
  - `POST /api/pickups/bulk`

## Safe backend merge
This repo now includes a cleaned merge of the uploaded Supabase backend bundle.

Key files:
- `docs/BACKEND_REVIEW_AND_MERGE.md`
- `docs/uploaded-backend-reference/`
- `supabase/config.toml`
- `supabase/seed.sql`
- `supabase/migrations/20260326_000002_enterprise_compat.sql`

### Local Supabase workflow
```bash
cd supabase
supabase start
supabase db reset
supabase functions serve enterprise-admin --no-verify-jwt
supabase functions serve shipping-calculator --no-verify-jwt
```


## Create Delivery backend routes

- `GET /api/customers?q=...` customer lookup
- `GET /api/addresses/lookup?q=...&city=...` address lookup + serviceability hints
- `POST /api/quotes` persist quote request and return commercial breakdown
- `POST /api/deliveries` create customer, addresses, pickup request, shipment, waybill, and first scan event
- `POST /api/pickups/bulk` register bulk upload jobs
- `POST /api/waybills/print` increment print counters and return render job info

### Required environment for admin-web

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_MAPBOX_TOKEN=...
```


## Production hardening added
- Operator route protection with cookie/header-based guard and staging bootstrap page at `/ops-access`
- Idempotency persistence for delivery creation, bulk registration, and print queueing
- Real QR code rendering on `/print/waybill`
- Live print preview URLs backed by shipment IDs
- Environment toggle `BRITIUM_DISABLE_AUTH=1` for local development only


## Auth and bulk upload production wiring
- `/auth/sign-in` now uses Supabase Auth for operator sign-in.
- Branch-scoped access is resolved from `operator_profiles` and `operator_branch_memberships`.
- Bulk XLSX/CSV upload now targets Supabase Storage bucket `bulk-imports`.
- Parser worker scaffold lives in `supabase/functions/bulk-pickup-parser`.
- Setup guide: `docs/SUPABASE_AUTH_RBAC_AND_BULK_UPLOAD.md`
