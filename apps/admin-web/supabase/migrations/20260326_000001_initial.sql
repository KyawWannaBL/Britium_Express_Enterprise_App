create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('customer', 'courier', 'dispatcher', 'finance', 'admin')),
  full_name text not null,
  phone_e164 text unique not null,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'my')),
  created_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_en text not null,
  name_my text not null,
  city text not null,
  township text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text unique not null,
  sender_name text not null,
  recipient_name text not null,
  recipient_phone_e164 text not null,
  origin_city text not null,
  destination_city text not null,
  service_type text not null check (service_type in ('same_day', 'next_day', 'standard')),
  status text not null,
  cod_amount_mmks bigint not null default 0,
  quoted_fee_mmks bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.waybills (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  waybill_number text unique not null,
  qr_payload text unique not null,
  printed_count integer not null default 0,
  last_printed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.scan_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  waybill_id uuid not null references public.waybills(id) on delete cascade,
  scan_type text not null,
  scanner_type text not null,
  scanned_at timestamptz not null default now(),
  branch_code text,
  notes jsonb not null default '{}'::jsonb
);

create table if not exists public.proofs_of_delivery (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null unique references public.shipments(id) on delete cascade,
  proof_type text not null,
  recipient_name text,
  signature_svg text,
  photo_path text,
  captured_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.shipments enable row level security;

create policy "authenticated users can read shipments"
on public.shipments
for select
to authenticated
using (true);
