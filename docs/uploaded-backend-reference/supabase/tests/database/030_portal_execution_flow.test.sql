begin;
select plan(3);

select has_table('public', 'shipments', 'public.shipments exists');

do $$
declare
  rider_uid uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  merchant_uid uuid := 'cccccccc-0000-0000-0000-000000000001';
  merchant_id uuid := 'cccccccc-0000-0000-0000-000000000002';
  shipment_id uuid := 'cccccccc-0000-0000-0000-000000000003';
begin
  insert into auth.users(id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
    (rider_uid, 'authenticated', 'authenticated', 'rider@test.local', '{}'::jsonb, '{}'::jsonb, now(), now()),
    (merchant_uid, 'authenticated', 'authenticated', 'merchant_exec@test.local', '{}'::jsonb, '{}'::jsonb, now(), now())
  on conflict (id) do nothing;

  insert into public.users(id, firebase_uid, email, full_name, role) values
    (rider_uid, 'fb_rider_exec', 'rider@test.local', 'Rider Exec', 'RIDER'),
    (merchant_uid, 'fb_merchant_exec', 'merchant_exec@test.local', 'Merchant Exec', 'MERCHANT')
  on conflict (id) do nothing;

  insert into public.merchants(id, user_id, merchant_code, business_name, contact_person, phone, email, address, city, state)
  values (merchant_id, merchant_uid, 'MRC-EXE', 'Biz Exec', 'Owner', '093333333', 'merchant_exec@test.local', 'Addr', 'Yangon', 'YG')
  on conflict do nothing;

  insert into public.shipments(
    id, way_id, merchant_id,
    sender_name, sender_phone, sender_address, sender_city, sender_state,
    receiver_name, receiver_phone, receiver_address, receiver_city, receiver_state,
    delivery_fee, total_amount, assigned_rider_id
  ) values (
    shipment_id, 'WAY-EXEC-001', merchant_id,
    'S', '090', 'A', 'C', 'S',
    'R', '099', 'A', 'C', 'S',
    1000, 1000, rider_uid
  )
  on conflict do nothing;
end $$;

select lives_ok($t$
  set local role authenticated;
  select set_config('request.jwt.claim.sub', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true);
  select set_config('request.jwt.claim.email', 'rider@test.local', true);
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub','cccccccc-cccc-cccc-cccc-cccccccccccc',
      'email','rider@test.local',
      'app_role','RIDER'
    )::text,
    true
  );

  update public.shipments
  set status = 'IN_TRANSIT'
  where way_id = 'WAY-EXEC-001';
$t$, 'RIDER role context can update assigned shipment');

select has_table('public', 'shipment_tracking', 'public.shipment_tracking exists');

select * from finish();
rollback;
