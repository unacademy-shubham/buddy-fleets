-- Buddy Fleets Developer CPanel — Phase 2.1
-- Real company profile metadata + lifecycle restore support.
-- Additive only: existing companies/auth/session tables are not structurally changed.

create table if not exists public.developer_company_profiles (
  company_id uuid primary key references public.companies(id) on delete cascade,
  legal_name text not null default '',
  trade_name text not null default '',
  registration_type text not null default '',
  business_type text not null default '',
  gstin text not null default '',
  pan text not null default '',
  aadhaar_last4 text not null default '',
  cin text not null default '',
  contact_email text not null default '',
  contact_mobile text not null default '',
  alternate_mobile text not null default '',
  billing_email text not null default '',
  website text not null default '',
  owner_name text not null default '',
  owner_email text not null default '',
  owner_mobile text not null default '',
  address_line1 text not null default '',
  address_line2 text not null default '',
  city text not null default '',
  state text not null default '',
  postal_code text not null default '',
  country text not null default 'India',
  notes text not null default '',
  status_before_suspend text null,
  created_via text not null default 'developer_cpanel',
  revision integer not null default 1 check (revision > 0),
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists developer_company_profiles_gstin_idx
  on public.developer_company_profiles(gstin)
  where gstin <> '';

create index if not exists developer_company_profiles_pan_idx
  on public.developer_company_profiles(pan)
  where pan <> '';

alter table public.developer_company_profiles enable row level security;
revoke all on public.developer_company_profiles from anon, authenticated;

comment on column public.developer_company_profiles.aadhaar_last4 is
  'Security-safe Aadhaar reference. Full Aadhaar numbers are intentionally not stored.';
