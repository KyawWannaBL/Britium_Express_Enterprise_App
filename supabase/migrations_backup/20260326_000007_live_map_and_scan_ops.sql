create extension if not exists pgcrypto;

alter table public.branches
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.vehicles
  add column if not exists driver_name text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists last_seen_at timestamptz;

create table if not exists public.vehicle_locations (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision,
  speed_kph double precision,
  source text not null default 'operator',
  recorded_at timestamptz not null default now()
);

create index if not exists vehicle_locations_vehicle_recorded_idx on public.vehicle_locations(vehicle_id, recorded_at desc);

create table if not exists public.scan_event_attachments (
  id uuid primary key default gen_random_uuid(),
  scan_event_id uuid not null references public.scan_events(id) on delete cascade,
  object_path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

alter table public.scan_events
  add column if not exists actor_user_id uuid references auth.users(id) on delete set null,
  add column if not exists branch_id uuid references public.branches(id) on delete set null,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists cod_amount_mmks bigint not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create or replace view public.live_vehicle_positions as
select distinct on (v.id)
  v.id,
  v.plate_number,
  coalesce(v.driver_name, v.plate_number) as driver_name,
  v.vehicle_type,
  v.status,
  v.assigned_branch_id,
  b.code as branch_code,
  coalesce(vl.latitude, v.latitude, b.latitude) as latitude,
  coalesce(vl.longitude, v.longitude, b.longitude) as longitude,
  coalesce(vl.recorded_at, v.last_seen_at, v.created_at) as last_seen_at,
  coalesce(vl.speed_kph, 0) as speed_kph,
  coalesce(vl.heading, 0) as heading
from public.vehicles v
left join public.vehicle_locations vl on vl.vehicle_id = v.id
left join public.branches b on b.id = v.assigned_branch_id
order by v.id, vl.recorded_at desc nulls last;

insert into storage.buckets (id, name, public)
values ('scan-evidence', 'scan-evidence', false)
on conflict (id) do nothing;

-- Backfill approximate coordinates for launch cities
update public.branches set latitude = coalesce(latitude, 16.8409), longitude = coalesce(longitude, 96.1735) where upper(code) = 'YGN';
update public.branches set latitude = coalesce(latitude, 21.9588), longitude = coalesce(longitude, 96.0891) where upper(code) = 'MDY';
update public.branches set latitude = coalesce(latitude, 19.7633), longitude = coalesce(longitude, 96.0785) where upper(code) = 'NPT';

update public.vehicles
set latitude = coalesce(latitude, case
  when assigned_branch_id in (select id from public.branches where upper(code)='YGN') then 16.8480
  when assigned_branch_id in (select id from public.branches where upper(code)='MDY') then 21.9700
  when assigned_branch_id in (select id from public.branches where upper(code)='NPT') then 19.7700
  else latitude end),
    longitude = coalesce(longitude, case
  when assigned_branch_id in (select id from public.branches where upper(code)='YGN') then 96.1800
  when assigned_branch_id in (select id from public.branches where upper(code)='MDY') then 96.0950
  when assigned_branch_id in (select id from public.branches where upper(code)='NPT') then 96.0820
  else longitude end),
    last_seen_at = coalesce(last_seen_at, now()),
    driver_name = coalesce(driver_name, concat('Driver ', right(plate_number, 4)));

alter publication supabase_realtime add table public.vehicle_locations;
alter publication supabase_realtime add table public.scan_events;
