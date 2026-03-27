
create table if not exists api_idempotency (
  route_key text not null,
  idempotency_key text not null,
  request_hash text not null,
  status_code integer not null,
  response_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (route_key, idempotency_key)
);

alter table if exists api_idempotency enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'api_idempotency'
      and policyname = 'service_role_manage_api_idempotency'
  ) then
    create policy service_role_manage_api_idempotency
      on api_idempotency
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;

create index if not exists idx_api_idempotency_created_at on api_idempotency (created_at desc);
