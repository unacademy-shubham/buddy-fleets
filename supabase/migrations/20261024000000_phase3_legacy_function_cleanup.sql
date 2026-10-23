-- Buddy Fleets Phase 3 / Part 2 — GUARDED PROPOSAL, NOT YET A MIGRATION.
-- Do NOT execute on production until the preflight, dependency review,
-- application/Edge Function callers and rollback have been approved.
-- When approved, create a new migration using `supabase migration new` and
-- place this entire SQL in that generated migration file.
-- No tables/rows/sequences are changed. No CASCADE is used.
BEGIN;

DO $phase3_guard$
DECLARE
  candidate RECORD;
  target_oid OID;
  target_body TEXT;
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'Phase 3 stopped: profiles table is missing';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name IN ('company_code', 'is_verified', 'company_name', 'mobile_number', 'plan_type', 'trial_ends_at')
  ) THEN
    RAISE EXCEPTION 'Phase 3 stopped: retired profile columns now exist; re-audit';
  END IF;
  IF to_regclass('public.vehicles') IS NOT NULL
     OR to_regclass('public.app_users') IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 3 stopped: legacy tables exist; re-audit callers';
  END IF;

  FOR candidate IN
    SELECT * FROM (VALUES
      ('public.assign_company_code(uuid)', 'assign_company_code', 'is_verified'),
      ('public.handle_new_signup()', 'handle_new_signup', 'mobile_number'),
      ('public.handle_site_code_cascade()', 'handle_site_code_cascade', 'assigned_plants')
    ) AS c(signature, function_name, legacy_marker)
  LOOP
    target_oid := to_regprocedure(candidate.signature)::oid;
    IF target_oid IS NULL THEN
      RAISE EXCEPTION 'Phase 3 stopped: expected legacy function missing: %', candidate.signature;
    END IF;

    SELECT p.prosrc INTO target_body FROM pg_proc p WHERE p.oid = target_oid;
    IF target_body NOT ILIKE '%' || candidate.legacy_marker || '%' THEN
      RAISE EXCEPTION 'Phase 3 stopped: function body changed: %', candidate.signature;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_trigger tr WHERE tr.tgfoid = target_oid)
       OR EXISTS (SELECT 1 FROM pg_depend d WHERE d.refobjid = target_oid AND d.deptype IN ('n','a','i'))
       OR EXISTS (SELECT 1 FROM pg_proc other
                  WHERE other.oid <> target_oid
                    AND other.prosrc ILIKE '%' || candidate.function_name || '%') THEN
      RAISE EXCEPTION 'Phase 3 stopped: dependency detected: %', candidate.signature;
    END IF;
  END LOOP;
END;
$phase3_guard$;

-- Exact legacy signatures only. RESTRICT fails atomically if dependencies exist.
DROP FUNCTION public.assign_company_code(uuid) RESTRICT;
DROP FUNCTION public.handle_new_signup() RESTRICT;
DROP FUNCTION public.handle_site_code_cascade() RESTRICT;

DO $phase3_verify$
BEGIN
  IF to_regprocedure('public.assign_company_code(uuid)') IS NOT NULL
     OR to_regprocedure('public.handle_new_signup()') IS NOT NULL
     OR to_regprocedure('public.handle_site_code_cascade()') IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 3 postcondition failed: legacy function remains';
  END IF;
  IF to_regprocedure('public.set_updated_at()') IS NULL THEN
    RAISE EXCEPTION 'Phase 3 postcondition failed: active trigger helper missing';
  END IF;
END;
$phase3_verify$;

COMMIT;
