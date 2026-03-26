begin;

alter table if exists public.shipment_approvals enable row level security;

drop policy if exists hard_shipment_approvals_select on public.shipment_approvals;
create policy hard_shipment_approvals_select
on public.shipment_approvals
for select
to authenticated
using (
  public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR'])
  or exists (
    select 1
    from public.shipments s
    where s.id = shipment_approvals.shipment_id
      and public.has_role('MERCHANT')
      and s.merchant_id = public.current_merchant_id()
  )
);

drop policy if exists hard_shipment_approvals_insert on public.shipment_approvals;
create policy hard_shipment_approvals_insert
on public.shipment_approvals
for insert
to authenticated
with check (
  public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR'])
  or exists (
    select 1
    from public.shipments s
    where s.id = shipment_approvals.shipment_id
      and public.has_role('MERCHANT')
      and s.merchant_id = public.current_merchant_id()
  )
);

drop policy if exists hard_shipment_approvals_update on public.shipment_approvals;
create policy hard_shipment_approvals_update
on public.shipment_approvals
for update
to authenticated
using (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR']))
with check (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR']));

commit;
