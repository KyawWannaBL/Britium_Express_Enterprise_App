begin;
select plan(6);

select has_table('public', 'shipments', 'public.shipments exists');

select ok(
  (select c.relrowsecurity
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'shipments'),
  'RLS enabled on shipments'
);

do $$
declare
  u1 uuid := '10000000-0000-0000-0000-000000000001';
  u2 uuid := '10000000-0000-0000-0000-000000000002';
  m_user1 uuid := '10000000-0000-0000-0000-000000000003';
  m_user2 uuid := '10000000-0000-0000-0000-000000000004';
  m1 uuid := '10000000-0000-0000-0000-000000000005';
  m2 uuid := '10000000-0000-0000-0000-000000000006';
  s1 uuid := '10000000-0000-0000-0000-000000000007';
  s2 uuid := '10000000-0000-0000-0000-000000000008';
begin
  insert into auth.users(id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
    (m_user1, 'authenticated', 'authenticated', 'merchant1@test.local', '{}'::jsonb, '{}'::jsonb, now(), now()),
    (m_user2, 'authenticated', 'authenticated', 'merchant2@test.local', '{}'::jsonb, '{}'::jsonb, now(), now()),
    (u1, 'authenticated', 'authenticated', 'rider1@test.local', '{}'::jsonb, '{}'::jsonb, now(), now()),
    (u2, 'authenticated', 'authenticated', 'rider2@test.local', '{}'::jsonb, '{}'::jsonb, now(), now())
  on conflict (id) do nothing;

  insert into public.users(id,firebase_uid,email,full_name,role) values
    (m_user1,'fb_m1','merchant1@test.local','Merchant One','MERCHANT'),
    (m_user2,'fb_m2','merchant2@test.local','Merchant Two','MERCHANT'),
    (u1,'fb_r1','rider1@test.local','Rider One','RIDER'),
    (u2,'fb_r2','rider2@test.local','Rider Two','RIDER')
  on conflict (id) do nothing;

  insert into public.merchants(id,user_id,merchant_code,business_name,contact_person,phone,email,address,city,state)
  values
    (m1,m_user1,'MRC-001','Biz One','Owner One','091111111','merchant1@test.local','Addr1','Yangon','YG'),
    (m2,m_user2,'MRC-002','Biz Two','Owner Two','092222222','merchant2@test.local','Addr2','Mandalay','MD')
  on conflict do nothing;

  insert into public.shipments(
    id, way_id, merchant_id,
    sender_name,sender_phone,sender_address,sender_city,sender_state,
    receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
    delivery_fee,total_amount,assigned_rider_id
  ) values
    (s1,'WAY-TEST-001',m1,'S1','0900','SA','YC','YS','R1','0999','RA','RC','RS',2000,2000,u1),
    (s2,'WAY-TEST-002',m2,'S2','0901','SB','MC','MS','R2','0888','RB','RC2','RS2',3000,3000,u2)
  on conflict do nothing;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select set_config('request.jwt.claim.email', 'merchant1@test.local', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub','10000000-0000-0000-0000-000000000003',
    'email','merchant1@test.local',
    'app_role','MERCHANT'
  )::text,
  true
);

select is((select count(*)::text from public.shipments where way_id='WAY-TEST-001'), '1', 'MERCHANT1 sees own shipment');
select is((select count(*)::text from public.shipments where way_id='WAY-TEST-002'), '0', 'MERCHANT1 cannot see other merchant shipment');

select lives_ok($t$
  insert into public.shipments(
    way_id, merchant_id,
    sender_name,sender_phone,sender_address,sender_city,sender_state,
    receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
    delivery_fee,total_amount
  ) values (
    'WAY-TEST-003',
    (select id from public.merchants where email='merchant1@test.local' limit 1),
    'S','090','A','C','S',
    'R','099','A','C','S',
    1000,1000
  );
$t$, 'MERCHANT can insert shipment for own merchant');

select throws_ok($t$
  insert into public.shipments(
    way_id, merchant_id,
    sender_name,sender_phone,sender_address,sender_city,sender_state,
    receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
    delivery_fee,total_amount
  ) values (
    'WAY-TEST-004',
    (select id from public.merchants where email='merchant2@test.local' limit 1),
    'S','090','A','C','S',
    'R','099','A','C','S',
    1000,1000
  );
$t$, '42501', 'new row violates row-level security policy for table "shipments"', 'MERCHANT cannot insert shipment for other merchant');

select * from finish();
rollback;
