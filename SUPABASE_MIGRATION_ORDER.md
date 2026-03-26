# Supabase migration order

Apply migrations in filename order using the Supabase CLI. If your repo already contains these files, keep the order below.

Recommended order:
1. baseline schema and hardening migrations from your existing repo
2. `20260326_000002_enterprise_compat.sql`
3. `20260326_000003_create_delivery_backend.sql`
4. `20260326_000004_production_hardening.sql`
5. `20260326_000005_auth_rbac_bulk_upload.sql`
6. `20260326_000006_way_management_and_print_jobs.sql`
7. `20260326_000007_live_map_and_scan_ops.sql`
8. `20260326_000008_password_change_and_roles.sql`
9. `20260326_000009_operator_management.sql`
10. `20260326_000010_operator_memberships_and_audit_view.sql`

CLI commands:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

If you use migration files with dependencies outside the list above, keep strict filename order.