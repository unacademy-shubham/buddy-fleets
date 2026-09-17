-- Buddy Fleets secure-login performance indexes
-- Safe additive migration: no auth/security policy is removed.
-- These indexes support the existing LOGIN_REQUEST rate-limit queries
-- and pending-flow/handoff cleanup performed during login.

create index if not exists bf_security_events_login_ip_created_idx
on public.security_events (ip_address, created_at desc)
where event_type = 'LOGIN_REQUEST';

create index if not exists bf_security_events_login_metadata_gin_idx
on public.security_events
using gin (metadata jsonb_path_ops)
where event_type = 'LOGIN_REQUEST';

create index if not exists bf_auth_login_flows_active_user_idx
on public.auth_login_flows (user_id, state)
where state in (
  'password_verified',
  'mfa_setup_required',
  'mfa_challenge_required',
  'mfa_verified',
  'handoff_ready'
);

create index if not exists bf_auth_portal_handoffs_pending_user_idx
on public.auth_portal_handoffs (user_id)
where status = 'pending';
