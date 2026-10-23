-- Buddy Fleets Phase 3 / Part 2 — emergency function-only restoration.
-- Execute ONLY if the corresponding cleanup has been applied and a verified
-- compatibility requirement needs these legacy signatures restored.
-- Restores function bodies from 24-Oct-2026 catalog review. Their original
-- referenced columns/tables are still obsolete: this is NOT a functional fix.
-- Role grants are intentionally safer than the original public grant on
-- handle_site_code_cascade; only service_role receives EXECUTE.
BEGIN;

CREATE OR REPLACE FUNCTION public.assign_company_code(user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER
AS $function$
DECLARE
  allocated_code text;
  existing_code text;
BEGIN
  SELECT company_code INTO existing_code FROM public.profiles WHERE id = user_id;
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  allocated_code := 'Buddy' || lpad(nextval('company_code_seq')::text, 3, '0');
  UPDATE public.profiles SET company_code = allocated_code, is_verified = TRUE WHERE id = user_id;
  RETURN allocated_code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, company_name, full_name, email, mobile_number, plan_type, trial_ends_at
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'mobile_number',
    '5_day_free_demo',
    (NEW.raw_user_meta_data->>'trial_ends_at')::timestamptz
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_site_code_cascade()
RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.code IS DISTINCT FROM NEW.code THEN
    UPDATE public.vehicles SET assigned_site = NEW.code WHERE assigned_site = OLD.code;
    UPDATE public.app_users
    SET assigned_plants = (
      SELECT jsonb_agg(
        CASE WHEN elem::text = to_jsonb(OLD.code)::text THEN to_jsonb(NEW.code) ELSE elem END
      )
      FROM jsonb_array_elements(assigned_plants) AS elem
    )
    WHERE assigned_plants @> to_jsonb(OLD.code);
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.assign_company_code(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_signup() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_site_code_cascade() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_company_code(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_signup() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_site_code_cascade() TO service_role;
COMMIT;
