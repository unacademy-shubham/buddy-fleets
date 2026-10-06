-- Buddy Fleets Phase 2 — server-authoritative session engine hardening
-- 1) Expired application sessions cannot remain authorization-eligible.
-- 2) New login replaces only the same browser-device + portal session.
-- 3) Different devices/portals may keep independent sessions.

begin;

-- Clean rows that are already beyond their authoritative HTTP idle expiry.
update public.security_sessions
set
  status = 'expired',
  revoked_at = coalesce(revoked_at, now()),
  revoke_reason = coalesce(revoke_reason, 'HTTP_SESSION_EXPIRED'),
  portal_session_token_hash = null,
  encrypted_access_token = null,
  access_token_iv = null,
  encrypted_refresh_token = null,
  refresh_token_iv = null,
  http_session_expires_at = null
where status = 'active'
  and http_session_expires_at is not null
  and http_session_expires_at <= now();

create index if not exists security_sessions_active_device_portal_idx
  on public.security_sessions (user_id, portal_type, device_id_hash)
  where status = 'active';

create or replace function public.bf_start_security_session(
  p_user_id uuid,
  p_auth_session_id uuid,
  p_portal_type text,
  p_company_id uuid default null::uuid,
  p_device_id_hash text default null::text,
  p_ip_address inet default null::inet,
  p_user_agent text default null::text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_security_session_id uuid;
  v_locked boolean;
begin
  if p_portal_type not in (
    'website',
    'developer',
    'team',
    'company'
  ) then
    raise exception 'Invalid portal type.';
  end if;

  select is_locked
  into v_locked
  from public.user_security
  where user_id = p_user_id;

  if coalesce(v_locked, false) then
    raise exception 'Account security locked.';
  end if;

  /*
    Professional multi-device policy:
    - same user + same portal + same stable browser device => replace old session
    - another device or another portal => keep its independent session
    - when no stable device hash is available, fall back to one active session
      per user + portal to avoid accumulating ambiguous sessions.
  */
  update public.security_sessions
  set
    status = 'revoked',
    revoked_at = now(),
    revoke_reason = 'NEW_LOGIN',
    last_seen_at = now(),
    portal_session_token_hash = null,
    encrypted_access_token = null,
    access_token_iv = null,
    encrypted_refresh_token = null,
    refresh_token_iv = null,
    http_session_expires_at = null
  where user_id = p_user_id
    and portal_type = p_portal_type
    and status = 'active'
    and (
      (
        p_device_id_hash is not null
        and device_id_hash = p_device_id_hash
      )
      or
      (
        p_device_id_hash is null
      )
    );

  insert into public.security_sessions (
    user_id,
    auth_session_id,
    portal_type,
    company_id,
    device_id_hash,
    ip_address,
    user_agent
  )
  values (
    p_user_id,
    p_auth_session_id,
    p_portal_type,
    p_company_id,
    p_device_id_hash,
    p_ip_address,
    left(coalesce(p_user_agent, ''), 1000)
  )
  returning id
  into v_security_session_id;

  insert into public.security_events (
    user_id,
    company_id,
    event_type,
    portal_type,
    ip_address,
    user_agent,
    metadata
  )
  values (
    p_user_id,
    p_company_id,
    'SECURITY_SESSION_STARTED',
    p_portal_type,
    p_ip_address,
    left(coalesce(p_user_agent, ''), 1000),
    jsonb_build_object(
      'auth_session_id', p_auth_session_id,
      'session_policy', 'same_device_same_portal_replacement'
    )
  );

  return v_security_session_id;
end;
$function$;

create or replace function public.bf_current_session_allowed()
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1
    from public.user_security us
    join public.security_sessions ss
      on ss.user_id = us.user_id
    where us.user_id = auth.uid()
      and us.is_locked = false
      and ss.status = 'active'
      and ss.auth_session_id::text = (auth.jwt() ->> 'session_id')
      and ss.portal_session_token_hash is not null
      and ss.http_session_expires_at is not null
      and ss.http_session_expires_at > now()
  );
$function$;


-- These SECURITY DEFINER functions are APIs, so keep execution grants narrow.
revoke execute on function public.bf_start_security_session(
  uuid, uuid, text, uuid, text, inet, text
) from public, anon, authenticated;
grant execute on function public.bf_start_security_session(
  uuid, uuid, text, uuid, text, inet, text
) to service_role;

revoke execute on function public.bf_current_session_allowed()
  from public, anon;
grant execute on function public.bf_current_session_allowed()
  to authenticated, service_role;

commit;
