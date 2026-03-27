begin;

alter table if exists public.profiles
  add column if not exists email text,
  add column if not exists is_active boolean not null default true,
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_changed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.operator_profiles
  add column if not exists app_role text,
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_changed_at timestamptz;

update public.operator_profiles
set app_role = coalesce(app_role,
  case
    when role = 'admin' then 'SUPER_ADMIN'
    when role = 'dispatcher' then 'SUPERVISOR'
    when role = 'ops' then 'OPERATIONS_ADMIN'
    when role = 'finance' then 'FINANCE_USER'
    when role = 'branch_manager' then 'SUBSTATION_MANAGER'
    else 'STAFF'
  end
);

update public.profiles
set role = role;

create index if not exists idx_operator_profiles_app_role on public.operator_profiles(app_role);
create index if not exists idx_operator_profiles_must_change_password on public.operator_profiles(must_change_password);

commit;
