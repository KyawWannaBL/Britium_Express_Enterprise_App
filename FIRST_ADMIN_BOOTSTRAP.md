# First-admin bootstrap

## 1. Create the auth user + profile
```bash
npm install @supabase/supabase-js dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
node scripts/seed_first_admin.js admin@britiumexpress.com 'TempPass123!' SUPER_ADMIN 'Britium Admin' en
```

## 2. Assign the operator to a branch
Use `scripts/seed_branch_membership.sql` in the Supabase SQL editor after replacing:
- `REPLACE_OPERATOR_UUID`
- `REPLACE_BRANCH_UUID`

## 3. Sign in
- Open `/auth/sign-in`
- Sign in with the temporary password
- The user should be redirected to `/auth/must-change-password`
- Set a new password
- Confirm the user lands on the admin area afterward

## 4. Verify RBAC
- Confirm the user can open `/operator-management`
- Confirm a lower-scope account cannot