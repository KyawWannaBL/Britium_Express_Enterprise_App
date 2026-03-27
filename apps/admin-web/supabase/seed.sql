-- Britium Express seed data for local development.
-- This file replaces the broken uploaded seed.ts reference.
-- Safe to run repeatedly because it uses ON CONFLICT where possible.

insert into public.branches (code, name_en, name_my, city, township)
values
  ('YGN-HQ', 'Yangon HQ', 'ရန်ကုန် ရုံးချုပ်', 'Yangon', 'Kamayut'),
  ('MDY-HUB', 'Mandalay Hub', 'မန္တလေး Hub', 'Mandalay', 'Chanayethazan')
on conflict (code) do update set
  name_en = excluded.name_en,
  name_my = excluded.name_my,
  city = excluded.city,
  township = excluded.township;

insert into public.profiles (id, role, full_name, phone_e164, preferred_language)
values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Britium Admin', '+959000000001', 'en'),
  ('00000000-0000-0000-0000-000000000002', 'dispatcher', 'Yangon Dispatcher', '+959000000002', 'my')
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  phone_e164 = excluded.phone_e164,
  preferred_language = excluded.preferred_language;

insert into public.shipments (
  id, tracking_number, sender_name, recipient_name, recipient_phone_e164,
  origin_city, destination_city, service_type, status, cod_amount_mmks, quoted_fee_mmks
)
values
  ('10000000-0000-0000-0000-000000000001', 'YGN119874YGN', 'Mee Lay', 'Demo Recipient', '+959792970776',
   'Yangon', 'Yangon', 'standard', 'booked', 25000, 5000)
on conflict (tracking_number) do update set
  status = excluded.status,
  cod_amount_mmks = excluded.cod_amount_mmks,
  quoted_fee_mmks = excluded.quoted_fee_mmks;

insert into public.waybills (shipment_id, waybill_number, qr_payload, printed_count)
values
  ('10000000-0000-0000-0000-000000000001', 'WB-YGN119874YGN', 'britium:YGN119874YGN', 1)
on conflict (waybill_number) do update set
  qr_payload = excluded.qr_payload,
  printed_count = excluded.printed_count;


insert into public.customers (
  id, customer_code, customer_type, full_name, company_name, phone_e164, preferred_language
)
values
  ('20000000-0000-0000-0000-000000000001', 'CUS-BRITIUM1', 'merchant', 'Golden Lotus Store', 'Golden Lotus Store', '+959400000001', 'en'),
  ('20000000-0000-0000-0000-000000000002', 'CUS-BRITIUM2', 'individual', 'မောင်ထက်အောင်', null, '+959400000002', 'my')
on conflict (customer_code) do update set
  full_name = excluded.full_name,
  company_name = excluded.company_name,
  phone_e164 = excluded.phone_e164,
  preferred_language = excluded.preferred_language;

insert into public.addresses (
  id, customer_id, address_type, label, contact_name, phone_e164, address_line_1, township, city, state_region, landmark, validation_status
)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'pickup', 'Merchant Warehouse', 'Golden Lotus Store', '+959400000001', 'No. 18, Hledan Road', 'Kamayut', 'Yangon', 'Yangon Region', 'Near Hledan Center', 'verified'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'dropoff', 'Home Delivery', 'မောင်ထက်အောင်', '+959400000002', 'No. 22, 78th Street', 'Chanayethazan', 'Mandalay', 'Mandalay Region', 'Near Zegyo', 'verified')
on conflict do nothing;

insert into public.quote_requests (
  id, customer_id, sender_address_id, recipient_address_id, service_type, parcel_weight_kg, parcel_type, pieces,
  cod_amount_mmks, declared_value_mmks, fragile, fee_mmks, fuel_surcharge_mmks, insurance_fee_mmks, subtotal_mmks, route_code
)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000002', 'next_day', 2.5, 'parcel', 1, 15000, 200000, false, 6000, 500, 1000, 7500, 'YGN-MDY')
on conflict do nothing;

insert into public.pickup_requests (
  id, pickup_number, customer_id, sender_address_id, branch_id, preferred_pickup_date, preferred_time_slot, requested_service_type, status, special_instructions, source, created_by_profile_id
)
select
  '50000000-0000-0000-0000-000000000001',
  'PU-BRITIUM1',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  b.id,
  current_date,
  '09:00-12:00',
  'next_day',
  'scheduled',
  'Call before arrival',
  'admin',
  '00000000-0000-0000-0000-000000000002'
from public.branches b
where b.code = 'YGN-HQ'
on conflict (pickup_number) do nothing;

update public.shipments
set
  customer_id = '20000000-0000-0000-0000-000000000001',
  sender_address_id = '30000000-0000-0000-0000-000000000001',
  recipient_address_id = '30000000-0000-0000-0000-000000000002',
  quote_request_id = '40000000-0000-0000-0000-000000000001',
  pickup_request_id = '50000000-0000-0000-0000-000000000001',
  sender_phone = '+959400000001',
  recipient_address = 'No. 22, 78th Street, Chanayethazan, Mandalay',
  pieces = 1,
  weight = 2.5,
  parcel_type = 'parcel',
  declared_value_mmks = 200000,
  booking_source = 'admin'
where id = '10000000-0000-0000-0000-000000000001';

insert into public.bulk_upload_jobs (
  id, job_number, uploaded_by_profile_id, customer_id, filename, status, total_rows, accepted_rows, rejected_rows
)
values
  ('60000000-0000-0000-0000-000000000001', 'BULK-BRITIUM1', '00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'march-pickups.xlsx', 'accepted', 20, 20, 0)
on conflict (job_number) do nothing;

-- api idempotency intentionally left empty for runtime use
