begin;
select plan(3);

select has_table('public', 'shipment_approvals', 'public.shipment_approvals exists');

select ok(
  (select c.relrowsecurity
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'shipment_approvals'),
  'RLS enabled on shipment_approvals'
);

do $$
declare
  sup_uid uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  merchant_uid uuid := 'bbbbbbbb-0000-0000-0000-000000000001';
  merchant_id uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  shipment_id uuid := 'bbbbbbbb-0000-0000-0000-000000000003';
begin
  insert into auth.users(id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
    (sup_uid, 'authenticated', 'authenticated', 'supervisor@test.local', '{}'::jsonb, '{}'::jsonb, now(), now()),
    (merchant_uid, 'authenticated', 'authenticated', 'merchant_sup@test.local', '{}'::jsonb, '{}'::jsonb, now(), now())
  on conflict (id) do nothing;

  insert into public.users(id, firebase_uid, email, full_name, role) values
    (sup_uid, 'fb_sup', 'supervisor@test.local', 'Supervisor', 'SUPERVISOR'),
    (merchant_uid, 'fb_merch_sup', 'merchant_sup@test.local', 'Merchant Sup', 'MERCHANT')
  on conflict (id) do nothing;

  insert into public.merchants(id, user_id, merchant_code, business_name, contact_person, phone, email, address, city, state)
  values (merchant_id, merchant_uid, 'MRC-SUP', 'Biz Sup', 'Owner', '092222222', 'merchant_sup@test.local', 'Addr', 'Yangon', 'YG')
  on conflict do nothing;

  insert into public.shipments(
    id, way_id, merchant_id,
    sender_name, sender_phone, sender_address, sender_city, sender_state,
    receiver_name, receiver_phone, receiver_address, receiver_city, receiver_state,
    delivery_fee, total_amount
  ) values (
    shipment_id, 'WAY-SUP-001', merchant_id,
    'S', '090', 'A', 'C', 'S',
    'R', '099', 'A', 'C', 'S',
    1000, 1000
  )
  on conflict do nothing;

  insert into public.shipment_approvals(shipment_id, status, requested_by)
  values (shipment_id, 'PENDING', merchant_uid)
  on conflict do nothing;
end $$;

select lives_ok($t$
  set local role authenticated;
  select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true);
  select set_config('request.jwt.claim.email', 'supervisor@test.local', true);
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'email','supervisor@test.local',
      'app_role','SUPERVISOR'
    )::text,
    true
  );

  update public.shipment_approvals
  set status = 'APPROVED', reviewed_at = now()
  where shipment_id = 'bbbbbbbb-0000-0000-0000-000000000003'::uuid;
$t$, 'SUPERVISOR can update shipment approval');

select * from finish();
rollback;
