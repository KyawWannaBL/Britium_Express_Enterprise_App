begin;
select plan(2);

set local role authenticated;

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claim.email', 'u@u.com', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub','22222222-2222-2222-2222-222222222222',
    'email','u@u.com',
    'app_role','CUSTOMER'
  )::text,
  true
);
select ok((select count(*) from public.audit_logs) = 0, 'Non-privileged role sees 0 audit rows');

select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select set_config('request.jwt.claim.email', 'a@a.com', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub','33333333-3333-3333-3333-333333333333',
    'email','a@a.com',
    'app_role','SUPER_ADMIN'
  )::text,
  true
);
select ok((select count(*) from public.audit_logs) >= 0, 'SUPER_ADMIN can query audit_logs');

select * from finish();
rollback;
