create extension if not exists pgcrypto;

create table if not exists public.hubs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete set null,
  code text unique,
  name text not null,
  city text,
  township text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  plate_number text unique not null,
  vehicle_type text not null default 'van',
  status text not null default 'ACTIVE',
  fuel_level integer,
  current_location jsonb not null default '{}'::jsonb,
  assigned_branch_id uuid references public.branches(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  priority text not null default 'MEDIUM',
  status text not null default 'PENDING',
  branch_id uuid references public.branches(id) on delete set null,
  assignee_profile_id uuid references public.profiles(id) on delete set null,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.shipments
  add column if not exists branch_id uuid references public.branches(id) on delete set null,
  add column if not exists pieces integer not null default 1,
  add column if not exists weight numeric(10,2),
  add column if not exists sender_phone text,
  add column if not exists recipient_address text,
  add column if not exists remarks text,
  add column if not exists tracking_no text generated always as (tracking_number) stored;

create or replace view public.way_management_summary_2026 as
select
  b.code as name,
  count(s.id)::int as load,
  case
    when count(s.id) >= 25 then 'Busy'
    when count(s.id) >= 10 then 'Normal'
    else 'Light'
  end as status
from public.branches b
left join public.shipments s on s.branch_id = b.id
group by b.code;

alter table public.branches enable row level security;
alter table public.hubs enable row level security;
alter table public.vehicles enable row level security;
alter table public.tasks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'branches' and policyname = 'authenticated read branches'
  ) then
    create policy "authenticated read branches"
    on public.branches for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'hubs' and policyname = 'authenticated read hubs'
  ) then
    create policy "authenticated read hubs"
    on public.hubs for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'vehicles' and policyname = 'authenticated read vehicles'
  ) then
    create policy "authenticated read vehicles"
    on public.vehicles for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'authenticated read tasks'
  ) then
    create policy "authenticated read tasks"
    on public.tasks for select to authenticated using (true);
  end if;
end $$;
