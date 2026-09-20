-- Buddy Fleets Developer CPanel — SaaS management foundation
-- Phase 2: Companies + Plans & Entitlements
-- Safe additive migration. Does not alter existing auth/session tables.

create extension if not exists pgcrypto;

create table if not exists public.developer_plans (
  id uuid primary key default gen_random_uuid(),
  plan_key text not null unique,
  name text not null,
  tagline text not null default '',
  badge text not null default '',
  status text not null default 'active' check (status in ('active','inactive','archived')),
  currency text not null default 'INR',
  display_order integer not null default 0,
  prices jsonb not null default '{}'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  entitlements jsonb not null default '[]'::jsonb,
  revision integer not null default 1 check (revision > 0),
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.developer_company_overrides (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique,
  enabled boolean not null default true,
  plan_key text null,
  limits_override jsonb not null default '{}'::jsonb,
  entitlements_override jsonb not null default '[]'::jsonb,
  notes text not null default '',
  revision integer not null default 1 check (revision > 0),
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.developer_renewal_policy (
  policy_key text primary key,
  grace_days integer not null default 3 check (grace_days between 0 and 365),
  reminder_days jsonb not null default '[30,15,7,3,1]'::jsonb,
  expiry_behavior text not null default 'mark_expired' check (expiry_behavior in ('mark_expired','suspend_company','manual_review')),
  post_expiry_access text not null default 'restricted' check (post_expiry_access in ('restricted','read_only','blocked')),
  auto_suspend boolean not null default false,
  notes text not null default '',
  revision integer not null default 1 check (revision > 0),
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.developer_saas_history (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  entity_id text not null,
  action text not null,
  before_payload jsonb null,
  after_payload jsonb null,
  actor_user_id uuid null,
  created_at timestamptz not null default now()
);

create index if not exists developer_plans_status_order_idx
  on public.developer_plans(status, display_order);

create index if not exists developer_company_overrides_company_idx
  on public.developer_company_overrides(company_id);

create index if not exists developer_saas_history_lookup_idx
  on public.developer_saas_history(domain, entity_id, created_at desc);

alter table public.developer_plans enable row level security;
alter table public.developer_company_overrides enable row level security;
alter table public.developer_renewal_policy enable row level security;
alter table public.developer_saas_history enable row level security;

-- Service-role APIs are authoritative. Browser clients receive no direct table policy.
revoke all on public.developer_plans from anon, authenticated;
revoke all on public.developer_company_overrides from anon, authenticated;
revoke all on public.developer_renewal_policy from anon, authenticated;
revoke all on public.developer_saas_history from anon, authenticated;

insert into public.developer_plans (
  plan_key, name, tagline, badge, status, currency, display_order, prices, limits, entitlements
)
values
  (
    'launch',
    'Launch',
    'Essential fleet control for getting started.',
    '',
    'active',
    'INR',
    10,
    '{"1":7000,"3":19500,"6":36000,"12":66000}'::jsonb,
    '{"vehicles_min":1,"vehicles_max":10,"users":2,"sites":1}'::jsonb,
    '["Vehicle & Driver Records","Vehicle & Driver Documents","Document Expiry Alerts","Expenses & Fuel Records","Maintenance Records","Dashboard & Reports"]'::jsonb
  ),
  (
    'accelerate',
    'Accelerate',
    'Smarter operations for growing fleets.',
    '',
    'active',
    'INR',
    20,
    '{"1":13000,"3":37500,"6":72000,"12":132000}'::jsonb,
    '{"vehicles_min":11,"vehicles_max":50,"users":5,"sites":2}'::jsonb,
    '["Everything in Launch","Expenses & Earnings","Driver Advances & Payments","Workshop & Maintenance","Duty & Dispatch Allocation","Dashboard & Reports"]'::jsonb
  ),
  (
    'scale',
    'Scale',
    'Connected control for larger fleet operations.',
    'MOST POPULAR',
    'active',
    'INR',
    30,
    '{"1":22000,"3":63000,"6":120000,"12":216000}'::jsonb,
    '{"vehicles_min":51,"vehicles_max":200,"users":10,"sites":3}'::jsonb,
    '["Everything in Accelerate","LR / Bilty / Consignment Records","ePOD & Delivery Records","Invoices & Settlements","Party Records & Ledgers","Role & Site Access"]'::jsonb
  ),
  (
    'apex',
    'Apex',
    'Complete operational coverage for large fleets.',
    '',
    'active',
    'INR',
    40,
    '{"1":30000,"3":87000,"6":168000,"12":324000}'::jsonb,
    '{"vehicles_min":201,"vehicles_max":null,"users":20,"sites":4}'::jsonb,
    '["Everything in Scale","Trip & Route Planning","Challan Records","Tyre Management","Spare Parts Management","Document & Compliance Alerts"]'::jsonb
  )
on conflict (plan_key) do nothing;

insert into public.developer_renewal_policy (
  policy_key,
  grace_days,
  reminder_days,
  expiry_behavior,
  post_expiry_access,
  auto_suspend,
  notes
)
values (
  'global',
  3,
  '[30,15,7,3,1]'::jsonb,
  'mark_expired',
  'restricted',
  false,
  ''
)
on conflict (policy_key) do nothing;
