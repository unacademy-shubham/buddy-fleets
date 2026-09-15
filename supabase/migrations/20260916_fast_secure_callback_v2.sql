-- Buddy Fleets - Fast Secure Callback Context v2
-- Consolidates callback lookup/authorization reads into one PostgreSQL RPC.
-- Security decisions are not removed. The caller still performs:
--   - request-host / IP / User-Agent binding checks
--   - encrypted token decryption
--   - JWT identity/session/AAL checks
--   - authoritative Supabase Auth getUser(access_token)
--   - atomic bf_finalize_portal_http_session(...) finalization

begin;

create or replace function public.bf_get_portal_callback_context_v2(
  p_handoff_code_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handoff public.auth_portal_handoffs%rowtype;
  v_security public.user_security%rowtype;
  v_security_session public.security_sessions%rowtype;
  v_profile public.profiles%rowtype;

  v_company public.companies%rowtype;
  v_membership public.company_memberships%rowtype;
  v_subscription public.subscriptions%rowtype;

  v_authorized boolean := false;
  v_company_slug text := null;
  v_effective_company_status text := null;
  v_roles jsonb := '[]'::jsonb;
  v_role_details jsonb := '[]'::jsonb;
  v_authorization jsonb;
begin
  if p_handoff_code_hash is null or length(trim(p_handoff_code_hash)) < 16 then
    return null;
  end if;

  select h.*
  into v_handoff
  from public.auth_portal_handoffs h
  where h.handoff_code_hash = p_handoff_code_hash
  limit 1;

  if not found then
    return null;
  end if;

  -- Fetch the independent security/profile/session state locally inside Postgres,
  -- avoiding multiple network round-trips from the Vercel callback.
  select us.*
  into v_security
  from public.user_security us
  where us.user_id = v_handoff.user_id
  limit 1;

  select ss.*
  into v_security_session
  from public.security_sessions ss
  where ss.user_id = v_handoff.user_id
    and ss.auth_session_id = v_handoff.auth_session_id
    and ss.portal_type = v_handoff.portal_type
    and ss.status = 'active'
    and (
      (v_handoff.company_id is null and ss.company_id is null)
      or ss.company_id = v_handoff.company_id
    )
  limit 1;

  select p.*
  into v_profile
  from public.profiles p
  where p.id = v_handoff.user_id
  limit 1;

  -- Portal authorization: same policy as callback.js, evaluated in one DB call.
  if v_handoff.portal_type = 'developer' then
    v_authorized :=
      lower(regexp_replace(coalesce(v_handoff.target_host, ''), ':\\d+$', '')) = 'developer.buddyfleets.in'
      and exists (
        select 1
        from public.platform_admins pa
        where pa.user_id = v_handoff.user_id
          and pa.is_active = true
      );

    if v_authorized then
      v_roles := jsonb_build_array('SUPER_ADMIN');
    end if;

    v_authorization := jsonb_build_object(
      'authorized', v_authorized,
      'portalType', 'developer',
      'companySlug', null,
      'roles', v_roles,
      'roleDetails', v_role_details
    );

  elsif v_handoff.portal_type = 'team' then
    v_authorized :=
      lower(regexp_replace(coalesce(v_handoff.target_host, ''), ':\\d+$', '')) = 'team.buddyfleets.in'
      and exists (
        select 1
        from public.platform_team_members ptm
        where ptm.user_id = v_handoff.user_id
          and ptm.status = 'active'
      );

    if v_authorized then
      select
        coalesce(jsonb_agg(r.role_key order by r.role_key), '[]'::jsonb),
        coalesce(
          jsonb_agg(
            jsonb_build_object(
              'key', r.role_key,
              'name', r.role_name
            )
            order by r.role_key
          ),
          '[]'::jsonb
        )
      into v_roles, v_role_details
      from public.platform_team_member_roles a
      join public.platform_team_roles r
        on r.id = a.role_id
       and r.is_active = true
      where a.user_id = v_handoff.user_id;

      if jsonb_array_length(v_roles) = 0 then
        v_authorized := false;
      end if;
    end if;

    v_authorization := jsonb_build_object(
      'authorized', v_authorized,
      'portalType', 'team',
      'companySlug', null,
      'roles', v_roles,
      'roleDetails', v_role_details
    );

  elsif v_handoff.portal_type = 'company' then
    if v_handoff.company_id is not null
       and lower(regexp_replace(coalesce(v_handoff.target_host, ''), ':\\d+$', '')) = 'portal.buddyfleets.in' then

      select c.*
      into v_company
      from public.companies c
      where c.id = v_handoff.company_id
      limit 1;

      if found
         and v_company.subdomain_slug is not null
         and v_company.status in ('trial_active', 'trial_expired', 'active') then

        select cm.*
        into v_membership
        from public.company_memberships cm
        where cm.company_id = v_company.id
          and cm.user_id = v_handoff.user_id
        limit 1;

        select s.*
        into v_subscription
        from public.subscriptions s
        where s.company_id = v_company.id
        limit 1;

        v_authorized :=
          v_membership.id is not null
          and v_membership.status = 'active';

        if v_authorized then
          v_company_slug := v_company.subdomain_slug;
          v_effective_company_status := v_company.status;

          if v_company.status = 'trial_active'
             and v_subscription.trial_end_at is not null
             and v_subscription.trial_end_at <= now() then
            v_effective_company_status := 'trial_expired';
          end if;

          v_roles := jsonb_build_array('COMPANY_USER');
        end if;
      end if;
    end if;

    v_authorization := jsonb_build_object(
      'authorized', v_authorized,
      'portalType', 'company',
      'companySlug', v_company_slug,
      'company', case when v_company.id is null then null else to_jsonb(v_company) end,
      'membership', case when v_membership.id is null then null else to_jsonb(v_membership) end,
      'subscription', case when v_subscription.id is null then null else to_jsonb(v_subscription) end,
      'effectiveCompanyStatus', v_effective_company_status,
      'roles', v_roles,
      'roleDetails', v_role_details
    );

  else
    v_authorization := jsonb_build_object(
      'authorized', false,
      'portalType', v_handoff.portal_type,
      'companySlug', null,
      'roles', '[]'::jsonb,
      'roleDetails', '[]'::jsonb
    );
  end if;

  return jsonb_build_object(
    'handoff', to_jsonb(v_handoff),
    'security', case when v_security.user_id is null then null else to_jsonb(v_security) end,
    'security_session', case when v_security_session.id is null then null else to_jsonb(v_security_session) end,
    'profile', case when v_profile.id is null then null else to_jsonb(v_profile) end,
    'authorization', v_authorization
  );
end;
$$;

revoke all on function public.bf_get_portal_callback_context_v2(text) from public;
revoke all on function public.bf_get_portal_callback_context_v2(text) from anon;
revoke all on function public.bf_get_portal_callback_context_v2(text) from authenticated;
grant execute on function public.bf_get_portal_callback_context_v2(text) to service_role;

commit;
