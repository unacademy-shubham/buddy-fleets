-- Buddy Fleets | Phase 3 Part 3 | READ-ONLY database health checks.
-- Execute SELECT statements in Supabase SQL Editor. No data or schema changes.
-- Keep individual results; the editor may show several result grids.

-- 1) Public table / RLS / policy and grant posture.
WITH rels AS (
  SELECT c.oid, c.relrowsecurity,
    (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count,
    (has_table_privilege('anon', c.oid, 'SELECT') OR
     has_table_privilege('anon', c.oid, 'INSERT') OR
     has_table_privilege('authenticated', c.oid, 'SELECT') OR
     has_table_privilege('authenticated', c.oid, 'INSERT')) AS client_grant
  FROM pg_class c
  WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r','p')
)
SELECT count(*) AS public_tables,
       count(*) FILTER (WHERE relrowsecurity) AS rls_enabled,
       count(*) FILTER (WHERE policy_count = 0) AS no_policy,
       count(*) FILTER (WHERE policy_count = 0 AND client_grant) AS no_policy_with_client_grant,
       count(*) FILTER (WHERE policy_count = 0 AND NOT client_grant) AS no_policy_without_client_grant
FROM rels;

-- 2) Inspect no-policy tables with legacy client grants.
-- RLS with no policies still denies these roles; grants should be reviewed,
-- NOT stripped blindly when frontend / compatibility paths are unknown.
SELECT c.relname AS table_name,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
       has_table_privilege('authenticated', c.oid, 'SELECT') AS auth_select
FROM pg_class c
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind IN ('r','p') AND c.relrowsecurity
  AND NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid)
  AND (has_table_privilege('anon', c.oid, 'SELECT')
       OR has_table_privilege('authenticated', c.oid, 'SELECT'))
ORDER BY c.relname;

-- 3) Mutable search_path functions. These need careful review before an
-- ALTER FUNCTION because some have trigger dependencies.
SELECT p.oid::regprocedure::text AS function_signature, p.prosecdef AS security_definer,
       coalesce(p.proconfig::text, '') AS runtime_config
FROM pg_proc p
WHERE p.pronamespace = 'public'::regnamespace
  AND p.proname IN ('purge_old_audit_logs','set_updated_at','bf_normalize_subdomain_slug')
ORDER BY function_signature;

-- 4) Active auth-user triggers: preserve their real signup paths.
SELECT t.tgname AS trigger_name, p.oid::regprocedure::text AS handler,
       t.tgenabled AS enabled
FROM pg_trigger t JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgrelid = 'auth.users'::regclass AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 5) Ensure the cleanup stays applied and active update function survives.
SELECT to_regprocedure('public.assign_company_code(uuid)') IS NULL AS old_company_code_removed,
       to_regprocedure('public.handle_new_signup()') IS NULL AS old_signup_removed,
       to_regprocedure('public.handle_site_code_cascade()') IS NULL AS old_site_cascade_removed,
       to_regprocedure('public.set_updated_at()') IS NOT NULL AS update_trigger_preserved;

-- 6) Published developer plans: expected keys are 1, 6, 12, not 3.
SELECT count(*) AS total_plans,
       count(*) FILTER (WHERE jsonb_typeof(prices) = 'object'
                      AND prices ?& ARRAY['1','6','12'] AND NOT prices ? '3') AS aligned_plans
FROM public.developer_plans;

-- 7) Views reachable by client roles without security_invoker.
-- Flag to investigate; no output is expected for current Buddy Fleets setup.
SELECT c.relname AS view_name, c.reloptions,
       has_table_privilege('anon',c.oid,'SELECT') AS anon_select,
       has_table_privilege('authenticated',c.oid,'SELECT') AS auth_select
FROM pg_class c
WHERE c.relnamespace='public'::regnamespace AND c.relkind='v'
  AND (has_table_privilege('anon',c.oid,'SELECT')
       OR has_table_privilege('authenticated',c.oid,'SELECT'))
  AND NOT coalesce('security_invoker=true' = ANY(c.reloptions),false);
