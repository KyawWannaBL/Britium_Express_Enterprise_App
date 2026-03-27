
create extension if not exists pgcrypto;

create table if not exists public.dispatch_assignments (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  assigned_operator_profile_id uuid references public.operator_profiles(id) on delete set null,
  assigned_vehicle_id uuid references public.vehicles(id) on delete set null,
  assignment_type text not null default 'delivery' check (assignment_type in ('pickup', 'delivery', 'transfer')),
  assignment_status text not null default 'assigned' check (assignment_status in ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
  route_code text,
  notes jsonb not null default '{}'::jsonb,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dispatch_assignments_shipment on public.dispatch_assignments(shipment_id);
create index if not exists idx_dispatch_assignments_branch on public.dispatch_assignments(branch_id);
create index if not exists idx_dispatch_assignments_operator on public.dispatch_assignments(assigned_operator_profile_id);

create table if not exists public.manifests (
  id uuid primary key default gen_random_uuid(),
  manifest_number text not null unique,
  branch_id uuid references public.branches(id) on delete set null,
  destination_branch_id uuid references public.branches(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  bag_code text,
  seal_code text,
  status text not null default 'draft' check (status in ('draft', 'sealed', 'dispatched', 'received', 'cancelled')),
  total_shipments integer not null default 0,
  total_cod_mmks bigint not null default 0,
  created_by_profile_id uuid references public.operator_profiles(id) on delete set null,
  dispatched_at timestamptz,
  received_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manifest_items (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.manifests(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique(manifest_id, shipment_id)
);

create index if not exists idx_manifest_items_manifest on public.manifest_items(manifest_id);
create index if not exists idx_manifest_items_shipment on public.manifest_items(shipment_id);

create table if not exists public.branch_transfers (
  id uuid primary key default gen_random_uuid(),
  transfer_number text not null unique,
  from_branch_id uuid references public.branches(id) on delete set null,
  to_branch_id uuid references public.branches(id) on delete set null,
  manifest_id uuid references public.manifests(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  transfer_status text not null default 'prepared' check (transfer_status in ('prepared', 'in_transit', 'received', 'cancelled')),
  bag_code text,
  seal_code text,
  shipment_count integer not null default 0,
  cod_total_mmks bigint not null default 0,
  created_by_profile_id uuid references public.operator_profiles(id) on delete set null,
  departed_at timestamptz,
  arrived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  created_by_profile_id uuid references public.operator_profiles(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  job_type text not null default 'waybill' check (job_type in ('waybill')),
  format_code text not null,
  shipment_ids jsonb not null default '[]'::jsonb,
  copies integer not null default 1,
  status text not null default 'queued' check (status in ('queued', 'rendered', 'printed', 'failed')),
  render_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_print_jobs_profile on public.print_jobs(created_by_profile_id);
create index if not exists idx_print_jobs_branch on public.print_jobs(branch_id);

create or replace view public.branch_way_management_summary as
select
  b.id as branch_id,
  b.code as branch_code,
  b.name_en,
  b.name_my,
  count(distinct case when s.status not in ('delivered', 'cancelled') then s.id end)::int as active_shipments,
  count(distinct da.id)::int as active_assignments,
  count(distinct case when m.status in ('draft', 'sealed', 'dispatched') then m.id end)::int as open_manifests,
  count(distinct case when bt.transfer_status in ('prepared', 'in_transit') then bt.id end)::int as active_transfers
from public.branches b
left join public.shipments s on s.branch_id = b.id
left join public.dispatch_assignments da on da.branch_id = b.id and da.assignment_status in ('assigned', 'accepted', 'in_progress')
left join public.manifests m on m.branch_id = b.id
left join public.branch_transfers bt on bt.from_branch_id = b.id
group by b.id, b.code, b.name_en, b.name_my;

insert into public.manifests (manifest_number, branch_id, destination_branch_id, vehicle_id, bag_code, seal_code, status, total_shipments, total_cod_mmks, metadata)
select
  'MNF-' || to_char(now(), 'YYYYMMDD') || '-001',
  b.id,
  db.id,
  v.id,
  'BAG-YGN-001',
  'SEAL-001',
  'sealed',
  2,
  65000,
  jsonb_build_object('seeded', true)
from public.branches b
left join public.branches db on db.code <> b.code
left join public.vehicles v on v.assigned_branch_id = b.id
where b.code = 'YGN'
  and not exists (select 1 from public.manifests where manifest_number = 'MNF-' || to_char(now(), 'YYYYMMDD') || '-001')
limit 1;

insert into public.branch_transfers (transfer_number, from_branch_id, to_branch_id, manifest_id, vehicle_id, transfer_status, bag_code, seal_code, shipment_count, cod_total_mmks, metadata)
select
  'TRF-' || to_char(now(), 'YYYYMMDD') || '-001',
  m.branch_id,
  m.destination_branch_id,
  m.id,
  m.vehicle_id,
  'in_transit',
  m.bag_code,
  m.seal_code,
  m.total_shipments,
  m.total_cod_mmks,
  jsonb_build_object('seeded', true)
from public.manifests m
where not exists (select 1 from public.branch_transfers where transfer_number = 'TRF-' || to_char(now(), 'YYYYMMDD') || '-001')
limit 1;
