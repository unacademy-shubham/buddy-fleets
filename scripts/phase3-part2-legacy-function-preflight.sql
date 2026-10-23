-- Buddy Fleets Phase 3 / Part 2 — read-only preflight.
-- Run in Supabase SQL Editor. This makes NO database changes.
-- Check all three functions report REVIEW_READY before considering cleanup.
-- A clean catalog does not rule out dynamic external RPC/cron callers.
WITH targets(signature, function_name) AS (
  VALUES
    ('public.assign_company_code(uuid)', 'assign_company_code'),
    ('public.handle_new_signup()', 'handle_new_signup'),
    ('public.handle_site_code_cascade()', 'handle_site_code_cascade')
), inventory AS (
  SELECT t.signature, t.function_name, to_regprocedure(t.signature) AS function_oid
  FROM targets t
)
SELECT
  i.signature,
  CASE WHEN i.function_oid IS NULL THEN 'MISSING' ELSE 'PRESENT' END AS function_status,
  (SELECT count(*) FROM pg_trigger tr WHERE tr.tgfoid = i.function_oid) AS trigger_references,
  (SELECT count(*) FROM pg_depend d WHERE d.refobjid = i.function_oid AND d.deptype IN ('n','a','i')) AS catalog_dependents,
  (SELECT count(*) FROM pg_proc other
   WHERE other.oid <> i.function_oid AND other.prosrc ILIKE '%' || i.function_name || '%') AS other_function_source_mentions,
  CASE
    WHEN i.function_oid IS NULL THEN 'REVIEW_MISSING_FUNCTION'
    WHEN EXISTS (SELECT 1 FROM pg_trigger tr WHERE tr.tgfoid = i.function_oid)
      OR EXISTS (SELECT 1 FROM pg_depend d WHERE d.refobjid = i.function_oid AND d.deptype IN ('n','a','i'))
      OR EXISTS (SELECT 1 FROM pg_proc other WHERE other.oid <> i.function_oid AND other.prosrc ILIKE '%' || i.function_name || '%')
      THEN 'STOP_DEPENDENCIES_PRESENT'
    ELSE 'REVIEW_READY'
  END AS preflight_result
FROM inventory i
ORDER BY i.signature;

-- Source-compatibility references: these columns/tables have been removed
-- from the current application schema. This is for review, not a drop command.
SELECT
  to_regclass('public.profiles') IS NOT NULL AS profiles_exists,
  NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name IN ('company_code', 'is_verified', 'company_name', 'mobile_number', 'plan_type', 'trial_ends_at')
  ) AS retired_profile_columns_absent,
  to_regclass('public.vehicles') IS NULL AS retired_vehicles_table_absent,
  to_regclass('public.app_users') IS NULL AS retired_app_users_table_absent,
  to_regclass('public.buddy_company_code_seq') IS NOT NULL AS current_company_code_sequence_present;
