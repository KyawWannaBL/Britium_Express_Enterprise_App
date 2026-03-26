begin;
select plan(3);

select has_table('public', 'shipment_tracking', 'public.shipment_tracking exists');

do $$
declare
  rider_uid uuid := '11000000-0000-0000-0000-000000000001';
  merchant_uid uuid := '11000000-0000-0000-0000-000000000002';
  merchant_id uuid := '11000000-0000-0000-0000-000000000003';
  shipment_id uuid := '11000000-0000-0000-0000-000000000004';
begin
  insert into auth.users(id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
    (merchant_uid, 'authenticated', 'authenticated', 'merchant_tracking@test.local', '{}'::jsonb, '{}'::jsonb, now(), now()),
    (rider_uid, 'authenticated', 'authenticated', 'rider_tracking@test.local', '{}'::jsonb, '{}'::jsonb, now(), now())
  on conflict (id) do nothing;

  insert into public.users(id,firebase_uid,email,full_name,role) values
    (merchant_uid,'fb_m1b','merchant_tracking@test.local','Merchant Track','MERCHANT'),
    (rider_uid,'fb_r1b','rider_tracking@test.local','Rider Track','RIDER')
  on conflict (id) do nothing;

  insert into public.merchants(id,user_id,merchant_code,business_name,contact_person,phone,email,address,city,state)
  values (merchant_id,merchant_uid,'MRC-T','Biz T','Owner T','093333333','merchant_tracking@test.local','Addr','Yangon','YG')
  on conflict do nothing;

  insert into public.shipments(
    id, way_id, merchant_id,
    sender_name,sender_phone,sender_address,sender_city,sender_state,
    receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
    delivery_fee,total_amount,assigned_rider_id
  ) values
    (shipment_id,'WAY-TRACK-001',merchant_id,'S','090','A','C','S','R','0977777','A','C','S',1500,1500,rider_uid)
  on conflict do nothing;

  insert into public.shipment_tracking(shipment_id,status,notes,is_customer_visible,handled_by)
  values (shipment_id,'PENDING','Created',true,rider_uid)
  on conflict do nothing;
end $$;

select lives_ok($t$
  set local role authenticated;
  select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);
  select set_config('request.jwt.claim.email', 'rider_tracking@test.local', true);
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub','11000000-0000-0000-0000-000000000001',
      'email','rider_tracking@test.local',
      'app_role','RIDER'
    )::text,
    true
  );

  insert into public.shipment_tracking(shipment_id,status,notes,is_customer_visible)
  values (
    (select id from public.shipments where way_id='WAY-TRACK-001' limit 1),
    'PENDING',
    'Scan update',
    true
  );
$t$, 'RIDER can add tracking on assigned shipment');

set local role authenticated;
select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.email', 'merchant_tracking@test.local', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub','11000000-0000-0000-0000-000000000002',
    'email','merchant_tracking@test.local',
    'app_role','MERCHANT'
  )::text,
  true
);
select ok((select count(*) from public.shipment_tracking) >= 1, 'MERCHANT can read tracking for own shipment');

select * from finish();
rollback;
