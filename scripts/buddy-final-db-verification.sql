/* ============================================================
   BUDDY FLEETS — FINAL DATABASE VERIFICATION (READ ONLY)
   Run in Supabase SQL Editor after all supplied migrations.
============================================================ */

with checks as (
  select 'fleet_packs'::text as section,
         'exactly_7_active_packs'::text as item,
         case when (select count(*) from public.developer_fleet_packs where status='active') = 7 then 'PASS' else 'REVIEW' end as status,
         (select count(*)::text from public.developer_fleet_packs where status='active') as details

  union all
  select 'fleet_packs','canonical_keys',
         case when not exists (
           select expected.key from (values
             ('travels'),('bagged_cement'),('general_transport'),('container'),('cement_bulker'),('staff_transport'),('school_transport')
           ) expected(key)
           where not exists (select 1 from public.developer_fleet_packs fp where fp.pack_key=expected.key)
         ) then 'PASS' else 'FAIL' end,
         coalesce((select string_agg(pack_key, ', ' order by display_order) from public.developer_fleet_packs),'')

  union all
  select 'pricing','1_3_6_12_month_keys',
         case when not exists (
           select 1 from public.developer_plans
           where not (prices ? '1' and prices ? '3' and prices ? '6' and prices ? '12')
         ) then 'PASS' else 'REVIEW' end,
         (select count(*)::text || ' plans' from public.developer_plans)

  union all
  select 'runtime','subscription_resolver',
         case when to_regprocedure('public.bf_resolve_subscription_context(uuid)') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regprocedure('public.bf_resolve_subscription_context(uuid)')::text,'missing')

  union all
  select 'runtime','user_access_resolver',
         case when to_regprocedure('public.bf_resolve_user_access(uuid,uuid)') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regprocedure('public.bf_resolve_user_access(uuid,uuid)')::text,'missing')

  union all
  select 'runtime','navigation_resolver',
         case when to_regprocedure('public.bf_resolve_user_navigation(uuid,uuid)') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regprocedure('public.bf_resolve_user_navigation(uuid,uuid)')::text,'missing')

  union all
  select 'runtime','portal_bootstrap_resolver',
         case when to_regprocedure('public.bf_resolve_company_portal_bootstrap(uuid,uuid)') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regprocedure('public.bf_resolve_company_portal_bootstrap(uuid,uuid)')::text,'missing')

  union all
  select 'fleet_selection','selection_state_column',
         case when exists (
           select 1 from information_schema.columns
           where table_schema='public' and table_name='company_portal_settings' and column_name='fleet_pack_selection_status'
         ) then 'PASS' else 'FAIL' end,
         coalesce((select data_type from information_schema.columns where table_schema='public' and table_name='company_portal_settings' and column_name='fleet_pack_selection_status'),'missing')

  union all
  select 'legacy','no_fleet_pack_key_column',
         case when not exists (
           select 1 from information_schema.columns where table_schema='public' and column_name='fleet_pack_key'
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text from information_schema.columns where table_schema='public' and column_name='fleet_pack_key') || ' columns'

  union all
  select 'addons','developer_feature_flags',
         case when to_regclass('public.developer_feature_flags') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regclass('public.developer_feature_flags')::text,'missing')

  union all
  select 'addons','platform_settings',
         case when to_regclass('public.developer_platform_settings') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regclass('public.developer_platform_settings')::text,'missing')

  union all
  select 'addons','dashboard_widget_presets',
         case when to_regclass('public.developer_dashboard_widget_presets') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regclass('public.developer_dashboard_widget_presets')::text,'missing')

  union all
  select 'addons','export_jobs',
         case when to_regclass('public.developer_export_jobs') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regclass('public.developer_export_jobs')::text,'missing')

  union all
  select 'addons','preview_audit',
         case when to_regclass('public.developer_preview_audit') is not null then 'PASS' else 'FAIL' end,
         coalesce(to_regclass('public.developer_preview_audit')::text,'missing')

  union all
  select 'addons','beta_module_foundations',
         case when (select count(*) from public.developer_module_catalog where status='beta') >= 20 then 'PASS' else 'REVIEW' end,
         (select count(*)::text from public.developer_module_catalog where status='beta') || ' beta modules'

  union all
  select 'security','addon_tables_rls',
         case when not exists (
           select 1
           from (values
             ('developer_feature_flags'),('developer_platform_settings'),('developer_dashboard_widget_presets'),('developer_export_jobs'),('developer_preview_audit')
           ) x(table_name)
           left join pg_class c on c.relname=x.table_name
           left join pg_namespace n on n.oid=c.relnamespace and n.nspname='public'
           where c.oid is null or c.relrowsecurity is distinct from true
         ) then 'PASS' else 'FAIL' end,
         'all Part 05 control-plane tables'

  union all
  select 'security','browser_execute_bootstrap_blocked',
         case when
           not has_function_privilege('anon','public.bf_resolve_company_portal_bootstrap(uuid,uuid)','EXECUTE')
           and not has_function_privilege('authenticated','public.bf_resolve_company_portal_bootstrap(uuid,uuid)','EXECUTE')
         then 'PASS' else 'FAIL' end,
         'anon/authenticated execute must be false'
)
select section,item,status,details from checks order by section,item;

/* Operational snapshot */
select
  c.company_code,
  c.company_name,
  c.status as company_status,
  s.status as subscription_status,
  cps.fleet_pack_selection_status,
  case when cps.fleet_pack_selection_status='selected' then cps.fleet_pack else null end as authoritative_primary_pack,
  cps.enabled_packs,
  public.bf_resolve_subscription_context(c.id)->>'effective_plan_key' as effective_plan,
  public.bf_resolve_subscription_context(c.id)->>'lifecycle_access' as lifecycle_access
from public.companies c
left join public.subscriptions s on s.company_id=c.id
left join public.company_portal_settings cps on cps.company_id=c.id
order by c.company_name;
