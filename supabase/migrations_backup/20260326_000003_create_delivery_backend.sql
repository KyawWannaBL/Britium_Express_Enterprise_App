
create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  customer_code text unique not null default ('CUS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_type text not null default 'individual' check (customer_type in ('individual', 'merchant', 'business')),
  full_name text not null,
  company_name text,
  phone_e164 text not null,
  alternate_phone text,
  email text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'my')),
  default_branch_id uuid references public.branches(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_phone_e164_idx on public.customers (phone_e164);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  address_type text not null default 'other' check (address_type in ('sender', 'recipient', 'pickup', 'dropoff', 'billing', 'other')),
  label text,
  contact_name text not null,
  phone_e164 text not null,
  address_line_1 text not null,
  address_line_2 text,
  ward text,
  township text not null,
  city text not null,
  state_region text not null default 'Myanmar',
  postal_code text,
  landmark text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  formatted_label_en text generated always as (
    concat_ws(', ', contact_name, address_line_1, township, city)
  ) stored,
  formatted_label_my text,
  serviceable boolean not null default true,
  validation_status text not null default 'unverified' check (validation_status in ('unverified', 'verified', 'needs_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  sender_address_id uuid references public.addresses(id) on delete set null,
  recipient_address_id uuid references public.addresses(id) on delete set null,
  service_type text not null check (service_type in ('same_day', 'next_day', 'standard')),
  parcel_weight_kg numeric(10,2) not null default 0,
  parcel_type text not null default 'parcel',
  pieces integer not null default 1,
  cod_amount_mmks bigint not null default 0,
  declared_value_mmks bigint not null default 0,
  fragile boolean not null default false,
  fee_mmks bigint not null,
  fuel_surcharge_mmks bigint not null default 0,
  insurance_fee_mmks bigint not null default 0,
  subtotal_mmks bigint not null,
  quote_currency text not null default 'MMK',
  route_code text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pickup_requests (
  id uuid primary key default gen_random_uuid(),
  pickup_number text unique not null default ('PU-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id uuid references public.customers(id) on delete restrict,
  sender_address_id uuid references public.addresses(id) on delete restrict,
  branch_id uuid references public.branches(id) on delete set null,
  preferred_pickup_date date,
  preferred_time_slot text,
  requested_service_type text not null check (requested_service_type in ('same_day', 'next_day', 'standard')),
  status text not null default 'requested' check (status in ('requested', 'scheduled', 'assigned', 'picked_up', 'cancelled')),
  special_instructions text,
  source text not null default 'admin' check (source in ('admin', 'customer_app', 'merchant_portal', 'bulk_upload')),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bulk_upload_jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text unique not null default ('BULK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  uploaded_by_profile_id uuid references public.profiles(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  filename text not null,
  storage_object_path text,
  status text not null default 'uploaded' check (status in ('uploaded', 'parsing', 'validated', 'accepted', 'partially_accepted', 'rejected', 'imported')),
  total_rows integer not null default 0,
  accepted_rows integer not null default 0,
  rejected_rows integer not null default 0,
  error_summary jsonb not null default '[]'::jsonb,
  template_version text not null default '2026.03',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shipments
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists sender_address_id uuid references public.addresses(id) on delete set null,
  add column if not exists recipient_address_id uuid references public.addresses(id) on delete set null,
  add column if not exists quote_request_id uuid references public.quote_requests(id) on delete set null,
  add column if not exists pickup_request_id uuid references public.pickup_requests(id) on delete set null,
  add column if not exists declared_value_mmks bigint not null default 0,
  add column if not exists parcel_type text not null default 'parcel',
  add column if not exists dimensions_json jsonb not null default '{}'::jsonb,
  add column if not exists recipient_phone_secondary text,
  add column if not exists booking_source text not null default 'admin';

create index if not exists shipments_customer_id_idx on public.shipments (customer_id);
create index if not exists shipments_pickup_request_id_idx on public.shipments (pickup_request_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

drop trigger if exists trg_pickup_requests_updated_at on public.pickup_requests;
create trigger trg_pickup_requests_updated_at
before update on public.pickup_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_bulk_upload_jobs_updated_at on public.bulk_upload_jobs;
create trigger trg_bulk_upload_jobs_updated_at
before update on public.bulk_upload_jobs
for each row execute function public.set_updated_at();

create or replace view public.create_delivery_bookings as
select
  s.id,
  s.tracking_number,
  s.status,
  s.service_type,
  s.quoted_fee_mmks,
  s.cod_amount_mmks,
  s.created_at,
  c.full_name as customer_name,
  c.phone_e164 as customer_phone,
  sa.formatted_label_en as sender_address_label,
  ra.formatted_label_en as recipient_address_label,
  w.waybill_number,
  w.printed_count
from public.shipments s
left join public.customers c on c.id = s.customer_id
left join public.addresses sa on sa.id = s.sender_address_id
left join public.addresses ra on ra.id = s.recipient_address_id
left join public.waybills w on w.shipment_id = s.id;

alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.quote_requests enable row level security;
alter table public.pickup_requests enable row level security;
alter table public.bulk_upload_jobs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'customers' and policyname = 'service_role_customers_all') then
    create policy service_role_customers_all on public.customers
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'addresses' and policyname = 'service_role_addresses_all') then
    create policy service_role_addresses_all on public.addresses
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'quote_requests' and policyname = 'service_role_quote_requests_all') then
    create policy service_role_quote_requests_all on public.quote_requests
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'pickup_requests' and policyname = 'service_role_pickup_requests_all') then
    create policy service_role_pickup_requests_all on public.pickup_requests
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'bulk_upload_jobs' and policyname = 'service_role_bulk_upload_jobs_all') then
    create policy service_role_bulk_upload_jobs_all on public.bulk_upload_jobs
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;
