# Operator Management

This package adds a production-oriented Operator Management module for Britium Express Delivery.

## What is included
- `/operator-management` admin screen
- Super Admin / App Owner / Operations Admin / HR Admin protected APIs
- Create operator account flow backed by Supabase Auth admin API
- Branch-scoped membership bootstrap
- Must-change-password enforcement carried into new operator creation
- Force password reset, suspend/activate, and role change controls
- Audit log table: `operator_admin_actions`

## Routes
- `GET /api/admin/operators`
- `POST /api/admin/operators`
- `PATCH /api/admin/operators/:operatorId`

## Required environment
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Notes
- Auth user creation requires the service role key on the server only.
- The current UI keeps actions conservative to reduce accidental destructive changes.
- For production, the next pass should add:
  - dedicated branch membership editor
  - invite email / recovery email actions
  - audit-log viewer
  - operator filters by app role and branch