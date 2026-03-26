# Supabase Auth + Branch RBAC + Bulk XLSX Upload

## What changed
- Replaced the bootstrap cookie access model with real Supabase Auth.
- Added `operator_profiles` mapped to `auth.users.id`.
- Added `operator_branch_memberships` for branch-scoped authorization.
- Added a private Storage bucket `bulk-imports`.
- Added `bulk_upload_job_rows` so parser workers can persist per-row validation results.
- Added a parser worker function: `supabase/functions/bulk-pickup-parser`.

## Required production setup
1. Create operator accounts in Supabase Auth.
2. Run migrations.
3. Insert operator profiles and branch memberships.
4. Deploy the Edge Function:
   ```bash
   supabase functions deploy bulk-pickup-parser
   ```
5. Set admin web env vars:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPABASE_AUTH_REDIRECT_URL=https://your-admin-domain/auth/callback
   NEXT_PUBLIC_MAPBOX_TOKEN=...
   ```
6. Disable the bypass:
   ```bash
   BRITIUM_DISABLE_AUTH=0
   ```

## Example operator bootstrap SQL
```sql
insert into public.operator_profiles (auth_user_id, role, full_name, preferred_language, primary_branch_id, primary_branch_code)
select
  'REPLACE_WITH_AUTH_USER_UUID',
  'admin',
  'Britium Operations Admin',
  'en',
  b.id,
  b.code
from public.branches b
where b.code = 'YGN';

insert into public.operator_branch_memberships (profile_id, branch_id, branch_code, role, is_primary)
select
  op.id,
  b.id,
  b.code,
  'admin',
  true
from public.operator_profiles op
join public.branches b on b.code = 'YGN'
where op.auth_user_id = 'REPLACE_WITH_AUTH_USER_UUID';
```

## Bulk upload flow
1. Operator signs in with Supabase Auth.
2. Create Delivery screen uploads XLSX/CSV to `bulk-imports`.
3. Upload route inserts a queued `bulk_upload_jobs` record.
4. Parser worker downloads the file, validates rows, and writes into `bulk_upload_job_rows`.
5. Ops can inspect accepted/rejected rows before creating pickup requests in bulk.
