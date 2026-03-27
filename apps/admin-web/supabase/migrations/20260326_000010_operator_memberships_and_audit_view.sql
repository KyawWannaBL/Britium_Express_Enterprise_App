
begin;

alter table if exists public.operator_admin_actions
  add column if not exists channel text,
  add column if not exists subject text;

create index if not exists idx_operator_admin_actions_created_at
  on public.operator_admin_actions(created_at desc);

create or replace view public.operator_admin_audit_view as
select
  actions.id,
  actions.created_at,
  actions.action,
  actions.channel,
  actions.subject,
  actions.metadata,
  actions.actor_profile_id,
  actor.full_name as actor_name,
  actions.target_profile_id,
  target.full_name as target_name
from public.operator_admin_actions actions
left join public.operator_profiles actor on actor.id = actions.actor_profile_id
left join public.operator_profiles target on target.id = actions.target_profile_id;

commit;
