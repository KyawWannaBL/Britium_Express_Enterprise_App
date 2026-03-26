begin;
select plan(4);

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
  uid uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
begin
  insert into auth.users (
    id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    uid, 'authenticated', 'authenticated', 'merchant@test.local', '{}'::jsonb, '{}'::jsonb, now(), now()
  )
  on conflict (id) do nothing;

  insert into public.users(id, firebase_uid, email, full_name, role)
  values (uid, 'fb_merchant_test', 'merchant@test.local', 'Merchant Test', 'MERCHANT')
  on conflict (id) do nothing;

  insert into public.merchants(
    id, user_id, merchant_code, business_name, contact_person, phone, email, address, city, state
  ) values (
    'aaaaaaaa-0000-0000-0000-000000000001',
    uid,
    'MRC-TST',
    'Merchant Test Biz',
    'Owner',
    '091111111',
    'merchant@test.local',
    'Addr',
    'Yangon',
    'YG'
  )
  on conflict do nothing;
end $$;

select lives_ok($t$
  set local role authenticated;
  select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  select set_config('request.jwt.claim.email', 'merchant@test.local', true);
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'email','merchant@test.local',
      'app_role','MERCHANT'
    )::text,
    true
  );

  insert into public.shipments(
    way_id, merchant_id,
    sender_name, sender_phone, sender_address, sender_city, sender_state,
    receiver_name, receiver_phone, receiver_address, receiver_city, receiver_state,
    delivery_fee, total_amount, status
  )
  values (
    'WAY-TEST-001',
    (select id from public.merchants where email = 'merchant@test.local' limit 1),
    'S', '090', 'A', 'C', 'S',
    'R', '099', 'B', 'D', 'T',
    1000, 1000, 'CREATED'
  );
$t$, 'MERCHANT can create shipment');

select ok(
  exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'shipments'
      and t.tgname like 'tr_audit_%'
  ),
  'audit trigger attached to shipments'
);

select * from finish();
rollback;
