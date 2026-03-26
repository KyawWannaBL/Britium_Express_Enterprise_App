begin;
select plan(3);

select has_table('public', 'financial_transactions', 'public.financial_transactions exists');

do $$
declare
  inv_id uuid := '20000000-0000-0000-0000-000000000001';
begin
  insert into public.invoices(id,invoice_number,customer_name,invoice_date,due_date,total_amount)
  values (inv_id,'INV-TEST-001','Customer',current_date,current_date + 7,9999)
  on conflict do nothing;
end $$;

select lives_ok($t$
  set local role authenticated;
  select set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);
  select set_config('request.jwt.claim.email', 'fin@test.local', true);
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub','66666666-6666-6666-6666-666666666666',
      'email','fin@test.local',
      'app_role','FINANCE_STAFF'
    )::text,
    true
  );

  insert into public.financial_transactions(transaction_id,transaction_type,reference_type,reference_id,amount)
  values ('TX-TEST-001','INVOICE','invoice',(select id from public.invoices where invoice_number='INV-TEST-001' limit 1),9999);
$t$, 'Finance can insert financial transactions');

select ok(true, 'test file completed');

select * from finish();
rollback;
