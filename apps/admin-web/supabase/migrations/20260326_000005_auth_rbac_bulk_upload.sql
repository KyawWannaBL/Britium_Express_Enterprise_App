create extension if not exists pgcrypto;

alter table if exists public.profiles
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade,
  drop constraint if exists profiles_role_check;

alter table if exists public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'courier', 'dispatcher', 'finance', 'admin', 'ops', 'branch_manager'));

create table if not exists public.operator_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  role text not null check (role in ('admin', 'dispatcher', 'ops', 'finance', 'branch_manager')),
  full_name text not null,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'my')),
  primary_branch_id uuid references public.branches(id) on delete set null,
  primary_branch_code text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.operator_branch_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.operator_profiles(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  branch_code text not null,
  role text not null check (role in ('admin', 'dispatcher', 'ops', 'finance', 'branch_manager')),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique(profile_id, branch_id)
);

create index if not exists idx_operator_branch_memberships_profile on public.operator_branch_memberships(profile_id);
create index if not exists idx_operator_branch_memberships_branch on public.operator_branch_memberships(branch_code);

alter table if exists public.bulk_upload_jobs
  add column if not exists parser_status text not null default 'queued' check (parser_status in ('queued', 'processing', 'processed', 'failed')),
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.bulk_upload_job_rows (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.bulk_upload_jobs(id) on delete cascade,
  row_number integer not null,
  raw_data jsonb not null default '{}'::jsonb,
  validation_status text not null check (validation_status in ('accepted', 'rejected')),
  validation_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(job_id, row_number)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bulk-imports',
  'bulk-imports',
  false,
  10485760,
  array[
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]
)
on conflict (id) do nothing;

alter table if exists public.operator_profiles enable row level security;
alter table if exists public.operator_branch_memberships enable row level security;
alter table if exists public.bulk_upload_job_rows enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='operator_profiles' and policyname='service_role_manage_operator_profiles'
  ) then
    create policy service_role_manage_operator_profiles
      on public.operator_profiles
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='operator_branch_memberships' and policyname='service_role_manage_operator_branch_memberships'
  ) then
    create policy service_role_manage_operator_branch_memberships
      on public.operator_branch_memberships
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='bulk_upload_job_rows' and policyname='service_role_manage_bulk_upload_job_rows'
  ) then
    create policy service_role_manage_bulk_upload_job_rows
      on public.bulk_upload_job_rows
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='service_role_manage_bulk_import_objects'
  ) then
    create policy service_role_manage_bulk_import_objects
      on storage.objects
      for all
      using (bucket_id = 'bulk-imports' and auth.role() = 'service_role')
      with check (bucket_id = 'bulk-imports' and auth.role() = 'service_role');
  end if;
end $$;
