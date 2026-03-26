-- Usage:
--   replace the UUID/email/branch_id placeholders and run in Supabase SQL editor
--   after creating the auth user + profile/operator_profile row.

-- Example for operator_profiles schema:
insert into operator_branch_memberships (
  operator_id,
  branch_id,
  membership_role,
  is_primary,
  is_active
) values (
  'REPLACE_OPERATOR_UUID',
  'REPLACE_BRANCH_UUID',
  'SUPER_ADMIN',
  true,
  true
)
on conflict do nothing;

-- Optional: if your app uses branches with codes, lookup first:
-- select id, code, name_en from branches order by code;