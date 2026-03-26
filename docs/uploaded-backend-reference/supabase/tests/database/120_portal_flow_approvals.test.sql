begin;
select plan(2);

select has_table('public', 'approvals', 'public.approvals exists');

do $$
declare
  merchant_uid uuid := '12000000-0000-0000-0000-000000000001';
  merchant_id uuid := '12000000-0000-0000-0000-000000000002';
  shipment_id uuid := '12000000-0000-0000-0000-000000000003';
begin
  insert into auth.users(id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (merchant_uid, 'authenticated', 'authenticated', 'merchant_ap@test.local', '{}'::jsonb, '{}'::jsonb, now(), now())
  on conflict (id) do nothing;

  insert into public.users(id,firebase_uid,email,full_name,role)
  values (merchant_uid,'fb_m_ap','merchant_ap@test.local','Merchant AP','MERCHANT')
  on conflict (id) do nothing;

  insert into public.merchants(id,user_id,merchant_code,business_name,contact_person,phone,email,address,city,state)
  values (merchant_id,merchant_uid,'MRC-AP','Biz AP','Owner','094444444','merchant_ap@test.local','Addr','Yangon','YG')
  on conflict do nothing;

  insert into public.shipments(
    id, way_id, merchant_id,
    sender_name,sender_phone,sender_address,sender_city,sender_state,
    receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
    delivery_fee,total_amount
  ) values
    (shipment_id,'WAY-AP-001',merchant_id,'S','090','A','C','S','R','0966666','A','C','S',1200,1200)
  on conflict do nothing;

  insert into public.approvals(entity_id,status)
  values (shipment_id,'PENDING')
  on conflict do nothing;
end $$;

select ok((select count(*) from public.approvals) >= 1, 'approval row seeded');

select * from finish();
rollback;
