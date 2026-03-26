begin;
select plan(3);

select has_table('public', 'support_tickets', 'public.support_tickets exists');

select lives_ok($t$
  set local role authenticated;
  select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  select set_config('request.jwt.claim.email', 'cs@test.local', true);
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'email','cs@test.local',
      'app_role','CUSTOMER_SERVICE'
    )::text,
    true
  );

  insert into public.support_tickets(ticket_number,customer_name,customer_email,subject,description)
  values ('TCK-TEST-001','Cust','cust@test.local','Help','Need help');
$t$, 'Support can insert ticket');

select ok(true, 'test file completed');

select * from finish();
rollback;
