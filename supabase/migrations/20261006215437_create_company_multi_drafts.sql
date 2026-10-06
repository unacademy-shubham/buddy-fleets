create table if not exists public.developer_company_drafts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  draft_name text not null default 'Untitled company',
  current_step integer not null default 0 check (current_step between 0 and 4),
  max_reached integer not null default 0 check (max_reached between 0 and 4),
  form_data jsonb not null default '{}'::jsonb,
  workflow_state jsonb not null default '{}'::jsonb,
  owner_photo_path text null,
  owner_photo_name text null,
  owner_photo_mime text null,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.developer_company_drafts enable row level security;

revoke all on table public.developer_company_drafts from public, anon, authenticated;
grant select, insert, update, delete on table public.developer_company_drafts to service_role;

create index if not exists developer_company_drafts_creator_updated_idx
  on public.developer_company_drafts (created_by, updated_at desc);

create index if not exists developer_company_drafts_updated_idx
  on public.developer_company_drafts (updated_at desc);
