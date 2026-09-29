-- BUDDY FLEETS — Runtime Access Alignment (2026-09-29)
-- Safe/idempotent companion migration for the foundation installed from the Supabase SQL Editor.
-- It does NOT recreate the full control-plane foundation; it aligns columns/grants required by app runtime.

begin;

alter table if exists public.subscriptions
  add column if not exists plan_key text null;

create index if not exists subscriptions_plan_key_idx
  on public.subscriptions(plan_key);

do $$
begin
  if to_regclass('public.developer_plans') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'subscriptions_plan_key_fkey'
         and conrelid = 'public.subscriptions'::regclass
     ) then
    alter table public.subscriptions
      add constraint subscriptions_plan_key_fkey
      foreign key (plan_key)
      references public.developer_plans(plan_key)
      on update cascade
      on delete set null;
  end if;
end $$;

alter table if exists public.company_portal_settings
  add column if not exists fleet_pack_selection_status text not null default 'pending';

alter table if exists public.company_portal_settings
  add column if not exists fleet_pack_selected_at timestamptz null;

do $$
begin
  if to_regclass('public.company_portal_settings') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'company_portal_settings_fleet_pack_selection_status_check'
         and conrelid = 'public.company_portal_settings'::regclass
     ) then
    alter table public.company_portal_settings
      add constraint company_portal_settings_fleet_pack_selection_status_check
      check (fleet_pack_selection_status in ('pending','selected'));
  end if;
end $$;

-- Resolver functions are intentionally server-only.
do $$
declare
  sig text;
begin
  foreach sig in array array[
    'public.bf_resolve_subscription_context(uuid)',
    'public.bf_resolve_user_access(uuid,uuid)',
    'public.bf_navigation_children(text,jsonb,text[])',
    'public.bf_resolve_user_navigation(uuid,uuid)',
    'public.bf_resolve_company_portal_bootstrap(uuid,uuid)',
    'public.bf_set_company_fleet_packs(uuid,text,text[])'
  ] loop
    if to_regprocedure(sig) is not null then
      execute format('revoke all on function %s from public', sig);
      execute format('revoke all on function %s from anon', sig);
      execute format('revoke all on function %s from authenticated', sig);
      execute format('grant execute on function %s to service_role', sig);
    end if;
  end loop;
end $$;

commit;

-- Verification: all rows should be present/clean on the current Buddy Fleets database.
select
  to_regprocedure('public.bf_resolve_subscription_context(uuid)') is not null as subscription_resolver,
  to_regprocedure('public.bf_resolve_user_access(uuid,uuid)') is not null as user_access_resolver,
  to_regprocedure('public.bf_resolve_user_navigation(uuid,uuid)') is not null as navigation_resolver,
  to_regprocedure('public.bf_resolve_company_portal_bootstrap(uuid,uuid)') is not null as bootstrap_resolver,
  to_regprocedure('public.bf_set_company_fleet_packs(uuid,text,text[])') is not null as fleet_pack_setter;
