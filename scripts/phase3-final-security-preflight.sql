-- Buddy Fleets Phase 3 final | read-only, safe for Supabase SQL Editor.
-- Result set A: expected three functions, unpinned search paths and old ACLs.
SELECT p.oid::regprocedure::text AS function_signature,
       p.prosecdef AS security_definer,
       p.proconfig AS function_config,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute
FROM pg_proc p
WHERE p.pronamespace='public'::regnamespace
  AND p.proname IN ('set_updated_at','purge_old_audit_logs','bf_normalize_subdomain_slug')
ORDER BY 1;

-- Result set B: existing user/self SELECT policies.
SELECT schemaname,tablename,policyname,cmd,permissive,roles,qual,with_check
FROM pg_policies
WHERE schemaname='public' AND (
  (tablename='profiles' AND policyname='profile_self_read') OR
  (tablename='company_memberships' AND policyname='membership_self_read'))
ORDER BY tablename;

-- Result set C: trigger and schema-invariant snapshot.
SELECT (SELECT count(*) FROM pg_trigger
        WHERE tgfoid=to_regprocedure('public.set_updated_at()') AND NOT tgisinternal) AS update_trigger_count,
       to_regclass('public.audit_logs') IS NOT NULL AS audit_logs_present,
       NOT has_schema_privilege('anon','public','CREATE') AS anon_cannot_create_public,
       NOT has_schema_privilege('authenticated','public','CREATE') AS authenticated_cannot_create_public,
       to_regprocedure('public.assign_company_code(uuid)') IS NULL AS retired_company_code_absent,
       to_regprocedure('public.handle_new_signup()') IS NULL AS retired_signup_absent,
       to_regprocedure('public.handle_site_code_cascade()') IS NULL AS retired_site_cascade_absent;
