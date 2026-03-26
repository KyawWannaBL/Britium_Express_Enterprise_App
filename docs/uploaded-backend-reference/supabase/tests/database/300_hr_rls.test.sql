begin;
select plan(3);

select has_table('public', 'employees', 'public.employees exists');

select lives_ok($t$
  set local role authenticated;
  select set_config('request.jwt.claim.sub', '88888888-8888-8888-8888-888888888888', true);
  select set_config('request.jwt.claim.email', 'hr@test.local', true);
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub','88888888-8888-8888-8888-888888888888',
      'email','hr@test.local',
      'app_role','HR_ADMIN'
    )::text,
    true
  );

  insert into public.employees(employee_code,first_name,last_name,job_title,hire_date)
  values ('EMP-TEST-001','A','B','HR',current_date);
$t$, 'HR can insert employees');

select ok(true, 'test file completed');

select * from finish();
rollback;
