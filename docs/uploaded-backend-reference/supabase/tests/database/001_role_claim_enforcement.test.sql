begin;
select plan(2);

do $$
declare
  uid uuid := '11111111-1111-1111-1111-111111111111';
begin
  insert into auth.users (
    id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    uid, 'authenticated', 'authenticated', 't@t.com', '{}'::jsonb, '{}'::jsonb, now(), now()
  )
  on conflict (id) do nothing;

  if to_regclass('public.profiles') is null then
    execute 'create table public.profiles(id uuid primary key references auth.users(id) on delete cascade, role text)';
  end if;

  delete from public.profiles where id = uid;
  insert into public.profiles(id, role) values (uid, 'MERCHANT');
end $$;

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.email', 't@t.com', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub','11111111-1111-1111-1111-111111111111',
    'email','t@t.com',
    'app_role','SUPERVISOR'
  )::text,
  true
);
select ok(public.effective_role() is null, 'JWT app_role mismatch vs DB role => effective_role() is NULL');

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub','11111111-1111-1111-1111-111111111111',
    'email','t@t.com',
    'app_role','MERCHANT'
  )::text,
  true
);
select ok(public.effective_role() = 'MERCHANT', 'JWT app_role matches DB role => effective_role() is MERCHANT');

select * from finish();
rollback;
