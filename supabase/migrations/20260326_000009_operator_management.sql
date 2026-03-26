begin;

create table if not exists public.operator_admin_actions (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.operator_profiles(id) on delete set null,
  target_profile_id uuid references public.operator_profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_operator_admin_actions_actor on public.operator_admin_actions(actor_profile_id);
create index if not exists idx_operator_admin_actions_target on public.operator_admin_actions(target_profile_id);

alter table if exists public.operator_profiles
  add column if not exists phone_e164 text;

update public.operator_profiles op
set phone_e164 = p.phone_e164
from public.profiles p
where op.profile_id = p.id
  and op.phone_e164 is null;

commit;