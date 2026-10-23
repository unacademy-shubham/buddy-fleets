-- Buddy Fleets Phase 3 final | EMERGENCY metadata-only rollback (manual review first).
-- Restores the pre-migration function search_path and RLS SELECT expressions.
-- If executed manually after a recorded migration, migration history will no
-- longer reflect function/policy state: reconcile with a new forward migration.
BEGIN;
DO $rollback_guard$
BEGIN
  IF to_regprocedure('public.set_updated_at()') IS NULL OR
     to_regprocedure('public.purge_old_audit_logs()') IS NULL OR
     to_regprocedure('public.bf_normalize_subdomain_slug(text)') IS NULL THEN
    RAISE EXCEPTION 'Rollback halted: required function missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public'
                 AND tablename='profiles' AND policyname='profile_self_read')
     OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public'
                 AND tablename='company_memberships' AND policyname='membership_self_read') THEN
    RAISE EXCEPTION 'Rollback halted: expected policies missing';
  END IF;
END;
$rollback_guard$;
ALTER FUNCTION public.set_updated_at() RESET search_path;
ALTER FUNCTION public.purge_old_audit_logs() RESET search_path;
ALTER FUNCTION public.bf_normalize_subdomain_slug(text) RESET search_path;
ALTER POLICY profile_self_read ON public.profiles USING (id = auth.uid());
ALTER POLICY membership_self_read ON public.company_memberships USING (user_id = auth.uid());
COMMIT;
