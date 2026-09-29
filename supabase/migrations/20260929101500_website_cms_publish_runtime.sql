/* ============================================================
   BUDDY FLEETS — WEBSITE CMS PUBLISH / ROLLBACK RUNTIME
   2026-09-29
   ============================================================ */

BEGIN;

CREATE OR REPLACE FUNCTION public.publish_website_page(
  p_page_id uuid,
  p_actor_user_id uuid,
  p_expected_revision integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_page public.website_pages%ROWTYPE;
  v_version public.website_page_versions%ROWTYPE;
BEGIN
  SELECT * INTO v_page
  FROM public.website_pages
  WHERE id = p_page_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PAGE_NOT_FOUND';
  END IF;

  IF v_page.current_draft_version_id IS NULL THEN
    RAISE EXCEPTION 'DRAFT_NOT_FOUND';
  END IF;

  SELECT * INTO v_version
  FROM public.website_page_versions
  WHERE id = v_page.current_draft_version_id
    AND page_id = p_page_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DRAFT_NOT_FOUND';
  END IF;

  IF p_expected_revision IS NOT NULL
     AND v_version.revision <> p_expected_revision THEN
    RAISE EXCEPTION 'REVISION_CONFLICT';
  END IF;

  UPDATE public.website_page_versions
  SET state = 'published',
      published_at = now(),
      updated_at = now()
  WHERE id = v_version.id;

  UPDATE public.website_pages
  SET published_version_id = v_version.id,
      status = 'published',
      updated_by = p_actor_user_id,
      updated_at = now()
  WHERE id = p_page_id;

  INSERT INTO public.website_releases(
    page_id,
    version_id,
    action,
    actor_user_id,
    notes
  ) VALUES (
    p_page_id,
    v_version.id,
    'publish',
    p_actor_user_id,
    'Published from Buddy Fleets Website Studio'
  );

  RETURN jsonb_build_object(
    'ok', true,
    'page_id', p_page_id,
    'published_version_id', v_version.id,
    'revision', v_version.revision,
    'published_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.rollback_website_page(
  p_page_id uuid,
  p_version_id uuid,
  p_actor_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_version public.website_page_versions%ROWTYPE;
BEGIN
  PERFORM 1
  FROM public.website_pages
  WHERE id = p_page_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PAGE_NOT_FOUND';
  END IF;

  SELECT * INTO v_version
  FROM public.website_page_versions
  WHERE id = p_version_id
    AND page_id = p_page_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'VERSION_NOT_FOUND';
  END IF;

  UPDATE public.website_page_versions
  SET state = 'published',
      published_at = coalesce(published_at, now()),
      updated_at = now()
  WHERE id = p_version_id;

  UPDATE public.website_pages
  SET published_version_id = p_version_id,
      status = 'published',
      updated_by = p_actor_user_id,
      updated_at = now()
  WHERE id = p_page_id;

  INSERT INTO public.website_releases(
    page_id,
    version_id,
    action,
    actor_user_id,
    notes
  ) VALUES (
    p_page_id,
    p_version_id,
    'rollback',
    p_actor_user_id,
    'Rollback from Buddy Fleets Website Studio'
  );

  RETURN jsonb_build_object(
    'ok', true,
    'page_id', p_page_id,
    'published_version_id', p_version_id,
    'version_number', v_version.version_number,
    'rolled_back_at', now()
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.publish_website_page(uuid,uuid,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rollback_website_page(uuid,uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_website_page(uuid,uuid,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_website_page(uuid,uuid,uuid) TO service_role;

COMMIT;
