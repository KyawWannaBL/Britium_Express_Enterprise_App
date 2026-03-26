# Operator Memberships, Invite/Reset Actions, and Audit Viewer

This package adds the final operator-access management layer for Britium Express Delivery:

- branch membership editor for multi-branch access
- invite email action via Supabase Auth admin APIs
- reset email action via Supabase Auth recovery link generation
- audit log viewer for operator admin events

## New API routes

- `GET /api/admin/operators/audit`
- `GET /api/admin/operators/:operatorId/memberships`
- `PUT /api/admin/operators/:operatorId/memberships`
- `POST /api/admin/operators/:operatorId/email-actions`

## Notes

- Invite email uses `supabase.auth.admin.inviteUserByEmail(...)`
- Reset action uses `supabase.auth.admin.generateLink({ type: "recovery" ... })`
- These actions require `SUPABASE_SERVICE_ROLE_KEY`
- The reset route returns generated link data so the UI can surface the result even before a custom mail provider is wired
- All actions are logged into `operator_admin_actions`

## Recommended env

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

