-- Buddy Fleets | Phase 1: restrict execution of privileged PostgreSQL RPCs.
-- Additive, permission-only migration; no table changes, row changes, or API renames.
-- IMPORTANT: Apply after deploying the backend site-authorization patch and
-- verifying that Vercel/Edge Function RPC calls use the service-role client.
-- This migration is intentionally NOT auto-applied by the patch ZIP.
--
-- The current application uses service-role clients on the server. RLS helper
-- functions are deliberately kept callable by authenticated users because
-- existing company RLS policies depend on them. Anon callers do not need
-- those helpers. PUBLIC must be revoked, not just anon/authenticated, or the
-- default PostgreSQL grant would re-expose execution via role inheritance.

begin;

-- Back-end/trigger/maintenance functions: no public RPC surface.
-- Names and argument types match the audited live PostgreSQL 17 schema.
do $phase1$
declare
  fn_name text;
  fn_oid regprocedure;
begin
  foreach fn_name in array array[
    'public.assign_company_code(uuid)',
    'public.bf_company_access_context(uuid)',
    'public.bf_company_portal_autoprovision()',
    'public.bf_create_user_security_row()',
    'public.bf_effective_company_status(uuid)',
    'public.bf_effective_subscription_status(uuid)',
    'public.bf_generate_unique_company_slug(text)',
    'public.bf_refresh_all_company_lifecycle()',
    'public.bf_refresh_company_lifecycle(uuid)',
    'public.bf_repair_company_provisioning()',
    'public.bf_set_company_subdomain_slug()',
    'public.bf_sync_trial_statuses()',
    'public.handle_new_signup()',
    'public.rls_auto_enable()'
  ]
  loop
    fn_oid := to_regprocedure(fn_name);
    if fn_oid is null then
      raise exception 'Phase 1 dependency missing: %', fn_name;
    end if;

    execute format(
      'revoke execute on function %s from public, anon, authenticated',
      fn_oid
    );
    execute format('grant execute on function %s to service_role', fn_oid);
  end loop;
end;
$phase1$;

-- Minimal per-user authorization helpers used by authenticated RLS policies.
-- These helpers check auth.uid() in their definitions; do NOT remove
-- authenticated EXECUTE unless the corresponding policies are refactored.
do $phase1$
declare
  fn_name text;
  fn_oid regprocedure;
begin
  foreach fn_name in array array[
    'public.can_access_site(uuid)',
    'public.has_operational_access(uuid)',
    'public.is_company_member(uuid)',
    'public.is_own_membership(uuid)',
    'public.is_platform_admin()',
    'public.bf_current_session_allowed()'
  ]
  loop
    fn_oid := to_regprocedure(fn_name);
    if fn_oid is null then
      raise exception 'Phase 1 RLS helper missing: %', fn_name;
    end if;

    execute format(
      'revoke execute on function %s from public, anon, authenticated',
      fn_oid
    );
    execute format('grant execute on function %s to authenticated, service_role', fn_oid);
  end loop;
end;
$phase1$;

-- Fail the migration atomically if a public role still inherits execute
-- access to one of the backend-only functions (for example from another role).
do $verify$
declare
  fn_name text;
  fn_oid regprocedure;
begin
  foreach fn_name in array array[
    'public.assign_company_code(uuid)',
    'public.bf_company_access_context(uuid)',
    'public.bf_company_portal_autoprovision()',
    'public.bf_create_user_security_row()',
    'public.bf_effective_company_status(uuid)',
    'public.bf_effective_subscription_status(uuid)',
    'public.bf_generate_unique_company_slug(text)',
    'public.bf_refresh_all_company_lifecycle()',
    'public.bf_refresh_company_lifecycle(uuid)',
    'public.bf_repair_company_provisioning()',
    'public.bf_set_company_subdomain_slug()',
    'public.bf_sync_trial_statuses()',
    'public.handle_new_signup()',
    'public.rls_auto_enable()'
  ]
  loop
    fn_oid := to_regprocedure(fn_name);
    if has_function_privilege('anon', fn_oid, 'EXECUTE')
       or has_function_privilege('authenticated', fn_oid, 'EXECUTE') then
      raise exception 'Phase 1 function still publicly executable: %', fn_name;
    end if;
    if not has_function_privilege('service_role', fn_oid, 'EXECUTE') then
      raise exception 'Phase 1 service_role access missing: %', fn_name;
    end if;
  end loop;
end;
$verify$;

commit;
