-- Buddy Fleets Phase 3 final | read-only post-deployment verifier.
SELECT
  (SELECT proconfig=ARRAY['search_path=pg_catalog']::text[] FROM pg_proc
   WHERE oid=to_regprocedure('public.set_updated_at()')) AS update_fn_hardened,
  (SELECT proconfig=ARRAY['search_path=pg_catalog']::text[] FROM pg_proc
   WHERE oid=to_regprocedure('public.bf_normalize_subdomain_slug(text)')) AS normalize_fn_hardened,
  (SELECT proconfig=ARRAY['search_path=pg_catalog, public, pg_temp']::text[] FROM pg_proc
   WHERE oid=to_regprocedure('public.purge_old_audit_logs()')) AS purge_fn_hardened,
  (SELECT qual ILIKE '%SELECT auth.uid()%' FROM pg_policies
   WHERE schemaname='public' AND tablename='profiles' AND policyname='profile_self_read') AS profiles_policy_optimized,
  (SELECT qual ILIKE '%SELECT auth.uid()%' FROM pg_policies
   WHERE schemaname='public' AND tablename='company_memberships' AND policyname='membership_self_read') AS memberships_policy_optimized,
  (SELECT count(*) FROM pg_trigger WHERE tgfoid=to_regprocedure('public.set_updated_at()') AND NOT tgisinternal) AS preserved_update_triggers,
  to_regprocedure('public.assign_company_code(uuid)') IS NULL AS retired_company_code_absent,
  to_regprocedure('public.handle_new_signup()') IS NULL AS retired_signup_absent,
  to_regprocedure('public.handle_site_code_cascade()') IS NULL AS retired_site_cascade_absent;
