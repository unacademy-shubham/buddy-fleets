-- Buddy Fleets Developer CPanel control-plane persistence
-- Safe additive migration. Does not alter existing auth/session/CMS tables.

create extension if not exists pgcrypto;

create table if not exists public.developer_control_plane_state (
  id uuid primary key default gen_random_uuid(),
  workspace_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  revision integer not null default 1 check (revision > 0),
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint developer_control_plane_key_format
    check (workspace_key ~ '^[a-z0-9][a-z0-9._:/-]{1,159}$'),
  constraint developer_control_plane_payload_object
    check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.developer_control_plane_history (
  id uuid primary key default gen_random_uuid(),
  workspace_key text not null,
  revision integer not null check (revision > 0),
  payload jsonb not null,
  action text not null default 'save' check (action in ('save','rollback','reset')),
  actor_user_id uuid null,
  created_at timestamptz not null default now(),
  constraint developer_control_plane_history_payload_object
    check (jsonb_typeof(payload) = 'object')
);

create index if not exists developer_control_plane_history_key_created_idx
  on public.developer_control_plane_history (workspace_key, created_at desc);

alter table public.developer_control_plane_state enable row level security;
alter table public.developer_control_plane_history enable row level security;

revoke all on table public.developer_control_plane_state from anon, authenticated;
revoke all on table public.developer_control_plane_history from anon, authenticated;

grant all on table public.developer_control_plane_state to service_role;
grant all on table public.developer_control_plane_history to service_role;
