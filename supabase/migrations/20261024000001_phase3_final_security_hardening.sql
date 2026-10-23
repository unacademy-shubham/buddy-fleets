-- Buddy Fleets | Phase 3 final database hardening | apply as ONE versioned migration.
-- Audited against project exygxszkqmefhhzfiqsn, 2026-10-24.
-- No table/data changes, no function replacement, no permission changes.
-- The ALTER POLICY updates only two SELECT predicates with equivalent auth.uid() caching.
BEGIN;

DO $phase3_final_preflight$
DECLARE
  item RECORD;
  target_oid OID;
  current_source TEXT;
  current_path TEXT[];
BEGIN
  -- Guard the EXACT existing function signatures and behavior markers.
  FOR item IN
    SELECT * FROM (VALUES
      ('public.set_updated_at()', 'NEW.updated_at = now()', false, false),
      ('public.purge_old_audit_logs()', 'DELETE FROM audit_logs', true, true),
      ('public.bf_normalize_subdomain_slug(text)', 'regexp_replace', true, true)
    ) AS f(signature, body_marker, anon_exec, authenticated_exec)
  LOOP
    target_oid := to_regprocedure(item.signature)::oid;
    IF target_oid IS NULL THEN
      RAISE EXCEPTION 'Phase 3 final aborted: missing function %', item.signature;
    END IF;
    SELECT p.prosrc, p.proconfig INTO current_source, current_path
      FROM pg_proc p WHERE p.oid = target_oid;
    IF current_path IS NOT NULL OR current_source NOT ILIKE '%' || item.body_marker || '%' THEN
      RAISE EXCEPTION 'Phase 3 final aborted: function drift %', item.signature;
    END IF;
    IF (SELECT p.prosecdef FROM pg_proc p WHERE p.oid = target_oid) THEN
      RAISE EXCEPTION 'Phase 3 final aborted: unexpected SECURITY DEFINER %', item.signature;
    END IF;
    IF has_function_privilege('anon', target_oid, 'EXECUTE') IS DISTINCT FROM item.anon_exec
       OR has_function_privilege('authenticated', target_oid, 'EXECUTE') IS DISTINCT FROM item.authenticated_exec THEN
      RAISE EXCEPTION 'Phase 3 final aborted: unexpected ACL drift %', item.signature;
    END IF;
  END LOOP;

  -- This function uses the bare name 'audit_logs': after pinning the search path,
  -- it must still resolve to the same existing public table, and untrusted roles
  -- must not be able to create shadow objects in public.
  IF to_regclass('public.audit_logs') IS NULL
     OR has_schema_privilege('anon', 'public', 'CREATE')
     OR has_schema_privilege('authenticated', 'public', 'CREATE') THEN
    RAISE EXCEPTION 'Phase 3 final aborted: audit_logs resolution or public schema grants changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='audit_logs' AND column_name='created_at') THEN
    RAISE EXCEPTION 'Phase 3 final aborted: audit log timestamp missing';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('public.purge_old_audit_logs()')
             AND prosrc NOT ILIKE '%INTERVAL ''7 days''%') THEN
    RAISE EXCEPTION 'Phase 3 final aborted: audit log retention drift';
  END IF;

  -- Preserve SELECT-only, authenticated, permissive policies with precisely
  -- the original expressions; do not modify admin policies or any WITH CHECK.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles'
      AND policyname='profile_self_read' AND cmd='SELECT'
      AND permissive='PERMISSIVE' AND roles=ARRAY['authenticated']::name[]
      AND qual='(id = auth.uid())' AND with_check IS NULL
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='company_memberships'
      AND policyname='membership_self_read' AND cmd='SELECT'
      AND permissive='PERMISSIVE' AND roles=ARRAY['authenticated']::name[]
      AND qual='(user_id = auth.uid())' AND with_check IS NULL
  ) THEN
    RAISE EXCEPTION 'Phase 3 final aborted: RLS policies drifted; re-audit';
  END IF;
END;
$phase3_final_preflight$;

-- Minimize name-resolution uncertainty without changing bodies, owners,
-- volatility, grants, function signatures, or trigger bindings.
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog;
ALTER FUNCTION public.bf_normalize_subdomain_slug(text) SET search_path = pg_catalog;
-- The audit function references public.audit_logs without qualification;
-- use a trusted fixed search_path, with pg_temp explicitly LAST.
ALTER FUNCTION public.purge_old_audit_logs() SET search_path = pg_catalog, public, pg_temp;

-- Cached value per statement rather than per row. SELECT policy semantics stay
-- identical, including the separate superadmin policy.
ALTER POLICY profile_self_read ON public.profiles
  USING (id = (SELECT auth.uid()));
ALTER POLICY membership_self_read ON public.company_memberships
  USING (user_id = (SELECT auth.uid()));

DO $phase3_final_postcheck$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc
                 WHERE oid=to_regprocedure('public.set_updated_at()')
                   AND proconfig=ARRAY['search_path=pg_catalog']::text[])
     OR NOT EXISTS (SELECT 1 FROM pg_proc
                 WHERE oid=to_regprocedure('public.bf_normalize_subdomain_slug(text)')
                   AND proconfig=ARRAY['search_path=pg_catalog']::text[])
     OR NOT EXISTS (SELECT 1 FROM pg_proc
                 WHERE oid=to_regprocedure('public.purge_old_audit_logs()')
                   AND proconfig=ARRAY['search_path=pg_catalog, public, pg_temp']::text[]) THEN
    RAISE EXCEPTION 'Phase 3 final aborted: function configuration postcheck failed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies
                 WHERE schemaname='public' AND tablename='profiles'
                 AND policyname='profile_self_read'
                 AND qual ILIKE '%SELECT auth.uid()%')
     OR NOT EXISTS (SELECT 1 FROM pg_policies
                 WHERE schemaname='public' AND tablename='company_memberships'
                 AND policyname='membership_self_read'
                 AND qual ILIKE '%SELECT auth.uid()%') THEN
    RAISE EXCEPTION 'Phase 3 final aborted: optimized policies not present';
  END IF;
  IF to_regprocedure('public.set_updated_at()') IS NULL THEN
    RAISE EXCEPTION 'Phase 3 final aborted: update trigger function missing';
  END IF;
END;
$phase3_final_postcheck$;

COMMIT;
