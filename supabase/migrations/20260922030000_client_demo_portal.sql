-- Buddy Fleets Client + Demo Portal foundation
-- Phase 1 priority: Small Travels + Bagged Cement
-- Storage policy: only employee/user photos and driver photos are stored.

create extension if not exists pgcrypto;

create table if not exists public.company_portal_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  fleet_pack text not null default 'travels',
  enabled_packs text[] not null default array['travels']::text[],
  enabled_modules text[] not null default '{}'::text[],
  company_display_name text,
  default_scope text not null default 'all' check (default_scope in ('all','primary')),
  date_format text not null default 'DD/MM/YYYY',
  time_format text not null default '12h' check (time_format in ('12h','24h')),
  terminology jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_portal_sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  site_type text not null default 'Branch Office',
  address text,
  city text,
  state text,
  pincode text,
  manager_user_id uuid,
  is_primary boolean not null default false,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, code)
);

create table if not exists public.company_portal_roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  role_key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  module_permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, role_key)
);

create table if not exists public.company_portal_user_access (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  role_id uuid references public.company_portal_roles(id) on delete set null,
  role_name text,
  primary_site_id uuid references public.company_portal_sites(id) on delete set null,
  site_ids uuid[] not null default '{}'::uuid[],
  all_sites boolean not null default false,
  module_overrides jsonb not null default '{}'::jsonb,
  permission_overrides jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  force_password_change boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(company_id, user_id)
);

create table if not exists public.company_portal_user_profiles (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  employee_code text,
  full_name text,
  designation text,
  department text,
  mobile text,
  alternate_mobile text,
  email text,
  address text,
  emergency_contact text,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(company_id, user_id)
);

create table if not exists public.company_portal_vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_number text not null,
  vehicle_code text,
  vehicle_type text,
  body_type text,
  ownership text not null default 'Own',
  home_site_id uuid references public.company_portal_sites(id) on delete set null,
  current_site_id uuid references public.company_portal_sites(id) on delete set null,
  status text not null default 'available',
  maker text,
  model text,
  variant text,
  manufacturing_year integer,
  chassis_number text,
  engine_number text,
  fuel_type text,
  gvw numeric,
  unladen_weight numeric,
  payload_mt numeric,
  seating_capacity integer,
  axle_count integer,
  tyre_count integer,
  fuel_tank_capacity numeric,
  rc_number text,
  registration_date date,
  rc_validity date,
  owner_name text,
  rto text,
  insurance_policy_no text,
  insurance_company text,
  insurance_expiry date,
  fitness_no text,
  fitness_expiry date,
  puc_no text,
  puc_expiry date,
  national_permit_no text,
  national_permit_expiry date,
  state_permit_no text,
  state_permit_expiry date,
  road_tax_expiry date,
  fastag_reference text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, vehicle_number)
);

create table if not exists public.company_portal_drivers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_code text,
  full_name text not null,
  father_name text,
  dob date,
  blood_group text,
  mobile text not null,
  alternate_mobile text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  emergency_contact text,
  driver_type text not null default 'Own Driver',
  joining_date date,
  primary_site_id uuid references public.company_portal_sites(id) on delete set null,
  status text not null default 'active',
  photo_path text,
  dl_number text,
  dl_class text,
  dl_issue_date date,
  dl_expiry date,
  issuing_rto text,
  badge_number text,
  badge_expiry date,
  medical_fitness_date date,
  police_verification_status text,
  payment_type text,
  per_trip_rate numeric,
  daily_allowance numeric,
  bank_account_last4 text,
  ifsc text,
  upi_id text,
  financial jsonb not null default '{}'::jsonb,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, driver_code)
);

create table if not exists public.company_portal_parties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  party_name text not null,
  party_type text not null default 'Customer',
  gstin text,
  legal_name text,
  trade_name text,
  gst_status text,
  gst_verified boolean not null default false,
  gst_verified_at timestamptz,
  pan text,
  address text,
  city text,
  state text,
  state_code text,
  pincode text,
  mobile text,
  email text,
  credit_days integer,
  status text not null default 'active',
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists company_portal_parties_gstin_uniq on public.company_portal_parties(company_id, gstin) where gstin is not null and gstin <> '';

create table if not exists public.company_portal_travel_bookings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  site_id uuid references public.company_portal_sites(id) on delete set null,
  booking_no text not null,
  customer text not null,
  party_id uuid references public.company_portal_parties(id) on delete set null,
  pickup text not null,
  drop_location text not null,
  pickup_at timestamptz,
  return_at timestamptz,
  trip_type text,
  vehicle_category text,
  vehicle_id uuid references public.company_portal_vehicles(id) on delete set null,
  vehicle_number text,
  driver_id uuid references public.company_portal_drivers(id) on delete set null,
  driver_name text,
  passenger_count integer,
  rate_type text,
  estimated_km numeric,
  amount numeric not null default 0,
  advance numeric not null default 0,
  payment_status text not null default 'pending',
  status text not null default 'confirmed',
  special_instructions text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, booking_no)
);

create table if not exists public.company_portal_cement_placements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  site_id uuid not null references public.company_portal_sites(id) on delete cascade,
  placement_no text not null,
  requirement_date date not null,
  required_vehicles integer not null default 0,
  assigned_vehicles integer not null default 0,
  reported_vehicles integer not null default 0,
  loaded_vehicles integer not null default 0,
  status text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, placement_no)
);

create table if not exists public.company_portal_cement_dispatches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  site_id uuid not null references public.company_portal_sites(id) on delete cascade,
  dispatch_no text not null,
  vehicle_id uuid references public.company_portal_vehicles(id) on delete set null,
  vehicle_number text not null,
  driver_id uuid references public.company_portal_drivers(id) on delete set null,
  driver_name text,
  dealer text,
  party_id uuid references public.company_portal_parties(id) on delete set null,
  destination text,
  material text not null default 'Bagged Cement',
  bags integer,
  gross_weight_mt numeric,
  tare_weight_mt numeric,
  net_weight_mt numeric,
  loading_slip_no text,
  weighbridge_slip_no text,
  reported_at timestamptz,
  loading_started_at timestamptz,
  dispatched_at timestamptz,
  reached_at timestamptz,
  delivered_at timestamptz,
  received_by text,
  receiver_mobile text,
  pod_number text,
  pod_status text not null default 'pending',
  shortage_bags integer not null default 0,
  damage_bags integer not null default 0,
  turnaround_hours numeric,
  detention_hours numeric,
  status text not null default 'at_plant',
  remarks text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, dispatch_no)
);

create table if not exists public.company_portal_expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  site_id uuid references public.company_portal_sites(id) on delete set null,
  expense_date date not null default current_date,
  category text not null,
  amount numeric not null check (amount >= 0),
  gst_amount numeric not null default 0,
  vehicle_id uuid references public.company_portal_vehicles(id) on delete set null,
  vehicle_number text,
  driver_id uuid references public.company_portal_drivers(id) on delete set null,
  driver_name text,
  vendor text,
  party_id uuid references public.company_portal_parties(id) on delete set null,
  payment_mode text,
  reference_no text,
  bill_no text,
  bill_date date,
  remarks text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_portal_audit (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid,
  site_id uuid references public.company_portal_sites(id) on delete set null,
  module_key text,
  action_type text not null,
  entity_type text,
  entity_id text,
  description text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cps_company_idx on public.company_portal_sites(company_id);
create index if not exists cpv_company_site_idx on public.company_portal_vehicles(company_id, home_site_id);
create index if not exists cpd_company_site_idx on public.company_portal_drivers(company_id, primary_site_id);
create index if not exists cpb_company_site_idx on public.company_portal_travel_bookings(company_id, site_id, pickup_at);
create index if not exists cpcd_company_site_idx on public.company_portal_cement_dispatches(company_id, site_id, created_at desc);
create index if not exists cpe_company_site_idx on public.company_portal_expenses(company_id, site_id, expense_date desc);

-- Private photo storage. No document bucket is created intentionally.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('company-profile-photos','company-profile-photos',false,1048576,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false, file_size_limit=1048576, allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- Server-side service-role access is authoritative for the portal APIs.
alter table public.company_portal_settings enable row level security;
alter table public.company_portal_sites enable row level security;
alter table public.company_portal_roles enable row level security;
alter table public.company_portal_user_access enable row level security;
alter table public.company_portal_user_profiles enable row level security;
alter table public.company_portal_vehicles enable row level security;
alter table public.company_portal_drivers enable row level security;
alter table public.company_portal_parties enable row level security;
alter table public.company_portal_travel_bookings enable row level security;
alter table public.company_portal_cement_placements enable row level security;
alter table public.company_portal_cement_dispatches enable row level security;
alter table public.company_portal_expenses enable row level security;
alter table public.company_portal_audit enable row level security;

revoke all on public.company_portal_settings from anon, authenticated;
revoke all on public.company_portal_sites from anon, authenticated;
revoke all on public.company_portal_roles from anon, authenticated;
revoke all on public.company_portal_user_access from anon, authenticated;
revoke all on public.company_portal_user_profiles from anon, authenticated;
revoke all on public.company_portal_vehicles from anon, authenticated;
revoke all on public.company_portal_drivers from anon, authenticated;
revoke all on public.company_portal_parties from anon, authenticated;
revoke all on public.company_portal_travel_bookings from anon, authenticated;
revoke all on public.company_portal_cement_placements from anon, authenticated;
revoke all on public.company_portal_cement_dispatches from anon, authenticated;
revoke all on public.company_portal_expenses from anon, authenticated;
revoke all on public.company_portal_audit from anon, authenticated;
