update public.security_sessions
set
  status = 'expired',
  revoked_at = coalesce(revoked_at, now()),
  revoke_reason = 'HTTP_SESSION_EXPIRED',
  portal_session_token_hash = null,
  encrypted_access_token = null,
  access_token_iv = null,
  encrypted_refresh_token = null,
  refresh_token_iv = null,
  http_session_expires_at = null
where status = 'active'
  and http_session_expires_at is not null
  and http_session_expires_at <= now();

drop index if exists public.security_sessions_one_active_user_idx;

create unique index if not exists security_sessions_one_active_device_portal_idx
  on public.security_sessions (user_id, portal_type, device_id_hash)
  where status = 'active'
    and device_id_hash is not null;

create unique index if not exists security_sessions_one_active_unknown_device_portal_idx
  on public.security_sessions (user_id, portal_type)
  where status = 'active'
    and device_id_hash is null;

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
  if p_portal_type not in ('website','developer','team','company') then
    raise exception 'Invalid portal type.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  select is_locked
  into v_locked
  from public.user_security
  where user_id = p_user_id;

  if coalesce(v_locked, false) then
    raise exception 'Account security locked.';
  end if;

  update public.security_sessions
  set
    status = 'expired',
    revoked_at = now(),
    revoke_reason = 'HTTP_SESSION_EXPIRED',
    portal_session_token_hash = null,
    encrypted_access_token = null,
    access_token_iv = null,
    encrypted_refresh_token = null,
    refresh_token_iv = null,
    http_session_expires_at = null
  where user_id = p_user_id
    and status = 'active'
    and http_session_expires_at is not null
    and http_session_expires_at <= now();

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
      (p_device_id_hash is not null and device_id_hash = p_device_id_hash)
      or
      (p_device_id_hash is null and device_id_hash is null)
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
  returning id into v_security_session_id;

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
      'session_policy', 'same_device_same_portal_replacement_v2'
    )
  );

  return v_security_session_id;
end;
$function$;

revoke all on function public.bf_start_security_session(
  uuid, uuid, text, uuid, text, inet, text
) from public, anon, authenticated;

grant execute on function public.bf_start_security_session(
  uuid, uuid, text, uuid, text, inet, text
) to service_role;
