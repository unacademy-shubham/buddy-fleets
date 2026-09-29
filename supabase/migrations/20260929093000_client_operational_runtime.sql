-- Buddy Fleets — Client/Demo operational runtime foundation
-- Part 03 of 05 — 2026-09-29
-- Purpose:
--   1) provide one safe persisted operational record surface for fleet-pack modules
--      whose deep domain workflows will be expanded later;
--   2) persist authenticated demo workspaces instead of keeping demo mutations only
--      in browser memory;
--   3) keep all runtime tables server/service-role controlled.

begin;

create extension if not exists pgcrypto;

create table if not exists public.company_portal_operational_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  site_id uuid null references public.company_portal_sites(id) on delete set null,
  pack_key text not null references public.developer_fleet_packs(pack_key) on update cascade on delete restrict,
  module_key text not null references public.developer_module_catalog(module_key) on update cascade on delete restrict,
  record_type text not null default 'record',
  reference_no text null,
  title text null,
  party_name text null,
  vehicle_number text null,
  driver_name text null,
  origin text null,
  destination text null,
  scheduled_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  status text not null default 'active',
  quantity numeric null,
  quantity_unit text null,
  amount numeric null,
  currency text not null default 'INR',
  notes text null,
  data jsonb not null default '{}'::jsonb,
  is_archived boolean not null default false,
  created_by uuid null references auth.users(id) on delete set null,
  updated_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists company_portal_operational_reference_uniq
  on public.company_portal_operational_records(company_id, module_key, reference_no)
  where reference_no is not null and reference_no <> '' and is_archived = false;

create index if not exists company_portal_operational_company_module_idx
  on public.company_portal_operational_records(company_id, module_key, created_at desc);

create index if not exists company_portal_operational_company_pack_idx
  on public.company_portal_operational_records(company_id, pack_key, created_at desc);

create index if not exists company_portal_operational_company_site_idx
  on public.company_portal_operational_records(company_id, site_id, created_at desc);

create index if not exists company_portal_operational_status_idx
  on public.company_portal_operational_records(company_id, module_key, status)
  where is_archived = false;

create table if not exists public.company_portal_demo_workspaces (
  company_id uuid not null references public.companies(id) on delete cascade,
  pack_key text not null references public.developer_fleet_packs(pack_key) on update cascade on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  seeded_at timestamptz not null default now(),
  reset_at timestamptz null,
  updated_by uuid null references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key(company_id, pack_key)
);

create index if not exists company_portal_demo_workspaces_company_idx
  on public.company_portal_demo_workspaces(company_id, updated_at desc);

alter table public.company_portal_operational_records enable row level security;
alter table public.company_portal_demo_workspaces enable row level security;

revoke all on table public.company_portal_operational_records from public, anon, authenticated;
revoke all on table public.company_portal_demo_workspaces from public, anon, authenticated;

grant select, insert, update, delete on table public.company_portal_operational_records to service_role;
grant select, insert, update, delete on table public.company_portal_demo_workspaces to service_role;

-- Reuse the existing Buddy Fleets updated_at trigger function when available.
do $$
begin
  if to_regprocedure('public.set_updated_at()') is not null then
    drop trigger if exists trg_company_portal_operational_records_updated_at on public.company_portal_operational_records;
    create trigger trg_company_portal_operational_records_updated_at
      before update on public.company_portal_operational_records
      for each row execute function public.set_updated_at();

    drop trigger if exists trg_company_portal_demo_workspaces_updated_at on public.company_portal_demo_workspaces;
    create trigger trg_company_portal_demo_workspaces_updated_at
      before update on public.company_portal_demo_workspaces
      for each row execute function public.set_updated_at();
  end if;
end $$;

commit;

-- Verification
select
  to_regclass('public.company_portal_operational_records') is not null as operational_records_ready,
  to_regclass('public.company_portal_demo_workspaces') is not null as demo_workspaces_ready,
  (select relrowsecurity from pg_class where oid='public.company_portal_operational_records'::regclass) as operational_rls,
  (select relrowsecurity from pg_class where oid='public.company_portal_demo_workspaces'::regclass) as demo_rls;
