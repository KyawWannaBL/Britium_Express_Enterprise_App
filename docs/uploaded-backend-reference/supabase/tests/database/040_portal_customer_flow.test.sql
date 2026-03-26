begin;
select plan(2);

select has_table('public', 'shipment_tracking', 'public.shipment_tracking exists');

select has_table('public', 'shipments', 'public.shipments exists');

select * from finish();
rollback;
