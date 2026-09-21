-- Buddy Fleets Company 360° architecture
-- Additive migration. Existing auth/session/company tables are preserved.

create sequence if not exists public.buddy_company_code_seq start 1001;

create or replace function public.developer_generate_company_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := 'BUDDY' || nextval('public.buddy_company_code_seq')::text;
    exit when not exists (select 1 from public.companies where company_code = candidate);
  end loop;
  return candidate;
end;
$$;
revoke all on function public.developer_generate_company_code() from public, anon, authenticated;

create table if not exists public.developer_company_employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  employee_code text not null default '',
  full_name text not null default '',
  email text not null default '',
  mobile text not null default '',
  designation text not null default '',
  branch text not null default '',
  role_key text not null default 'viewer',
  status text not null default 'active' check (status in ('invited','active','blocked','disabled','revoked')),
  force_password_change boolean not null default false,
  notes text not null default '',
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, user_id)
);
create index if not exists developer_company_employees_company_idx on public.developer_company_employees(company_id, status);

create table if not exists public.developer_company_roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  role_key text not null,
  role_name text not null,
  permissions jsonb not null default '{}'::jsonb,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, role_key)
);

create table if not exists public.developer_company_invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  invoice_number text not null unique,
  invoice_type text not null default 'subscription',
  invoice_date date not null default current_date,
  due_date date null,
  currency text not null default 'INR',
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  taxable_amount numeric(14,2) not null default 0,
  cgst numeric(14,2) not null default 0,
  sgst numeric(14,2) not null default 0,
  igst numeric(14,2) not null default 0,
  round_off numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','issued','partially_paid','paid','overdue','cancelled','void')),
  billing_period_start date null,
  billing_period_end date null,
  place_of_supply text not null default '',
  notes text not null default '',
  terms text not null default '',
  company_snapshot jsonb not null default '{}'::jsonb,
  plan_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists developer_company_invoices_company_idx on public.developer_company_invoices(company_id, invoice_date desc);

create sequence if not exists public.buddy_invoice_seq start 1;
create sequence if not exists public.buddy_receipt_seq start 1;

create or replace function public.developer_next_invoice_number()
returns text language sql security definer set search_path = public as $$
  select 'BF/' || to_char(current_date, 'YY') || '-' || to_char(current_date + interval '1 year', 'YY') || '/' || lpad(nextval('public.buddy_invoice_seq')::text, 6, '0');
$$;
revoke all on function public.developer_next_invoice_number() from public, anon, authenticated;

create table if not exists public.developer_company_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.developer_company_invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  rate numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  tax_rate numeric(6,2) not null default 0,
  hsn_sac text not null default '',
  amount numeric(14,2) not null default 0,
  sort_order integer not null default 0
);

create table if not exists public.developer_company_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  invoice_id uuid null references public.developer_company_invoices(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0),
  payment_date date not null default current_date,
  payment_mode text not null default 'bank_transfer',
  transaction_reference text not null default '',
  proof_url text not null default '',
  status text not null default 'submitted' check (status in ('pending','submitted','verified','rejected','refunded')),
  verified_by uuid null,
  verified_at timestamptz null,
  remarks text not null default '',
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists developer_company_payments_company_idx on public.developer_company_payments(company_id, payment_date desc);

create table if not exists public.developer_company_receipts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  payment_id uuid not null references public.developer_company_payments(id) on delete restrict,
  receipt_number text not null unique,
  issued_at timestamptz not null default now(),
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid null
);

create table if not exists public.developer_company_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  document_type text not null,
  document_name text not null default '',
  file_url text not null default '',
  status text not null default 'pending' check (status in ('pending','verified','rejected','expired')),
  expiry_date date null,
  verified_by uuid null,
  verified_at timestamptz null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.developer_company_announcements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  message text not null,
  priority text not null default 'normal' check (priority in ('normal','important','critical')),
  audience_type text not null default 'all_employees' check (audience_type in ('all_employees','admins','selected_roles','selected_employees')),
  audience_filter jsonb not null default '{}'::jsonb,
  require_acknowledgement boolean not null default false,
  allow_dismiss boolean not null default true,
  starts_at timestamptz not null default now(),
  expires_at timestamptz null,
  status text not null default 'published' check (status in ('draft','scheduled','published','expired','cancelled')),
  created_by uuid null,
  created_at timestamptz not null default now()
);
create index if not exists developer_company_announcements_company_idx on public.developer_company_announcements(company_id, created_at desc);

create table if not exists public.developer_company_announcement_recipients (
  announcement_id uuid not null references public.developer_company_announcements(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  delivered_at timestamptz null,
  seen_at timestamptz null,
  acknowledged_at timestamptz null,
  primary key (announcement_id, user_id)
);

create table if not exists public.developer_company_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  note_type text not null default 'internal',
  title text not null default '',
  body text not null,
  follow_up_at timestamptz null,
  created_by uuid null,
  created_at timestamptz not null default now()
);

create table if not exists public.developer_module_catalog (
  id uuid primary key default gen_random_uuid(),
  module_key text not null unique,
  module_name text not null,
  category text not null default 'general',
  description text not null default '',
  icon_key text not null default '',
  status text not null default 'active' check (status in ('active','disabled','beta')),
  unavailable_behavior text not null default 'locked' check (unavailable_behavior in ('hidden','locked','preview')),
  trial_access text not null default 'full' check (trial_access in ('none','preview','limited','full')),
  expired_access text not null default 'read_only' check (expired_access in ('hidden','read_only','blocked')),
  dependencies text[] not null default '{}',
  show_in_sidebar boolean not null default true,
  show_on_dashboard boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.developer_plan_module_entitlements (
  plan_key text not null,
  module_key text not null references public.developer_module_catalog(module_key) on delete cascade,
  access_level text not null default 'full' check (access_level in ('none','preview','limited','read_only','full')),
  limits jsonb not null default '{}'::jsonb,
  primary key(plan_key, module_key)
);

create table if not exists public.developer_company_portal_config (
  company_id uuid primary key references public.companies(id) on delete cascade,
  dashboard_widgets jsonb not null default '[]'::jsonb,
  sidebar_overrides jsonb not null default '{}'::jsonb,
  branding jsonb not null default '{}'::jsonb,
  landing_path text not null default '/dashboard',
  revision integer not null default 1,
  updated_by uuid null,
  updated_at timestamptz not null default now()
);

create table if not exists public.developer_lifecycle_access_policy (
  policy_key text primary key,
  config jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  updated_by uuid null,
  updated_at timestamptz not null default now()
);

insert into public.developer_lifecycle_access_policy(policy_key, config)
values
('trial', '{"duration_days":5,"vehicle_limit":10,"employee_limit":3,"branch_limit":1,"default_access":"full"}'::jsonb),
('expired', '{"grace_days":7,"during_grace":"read_only","after_grace":"read_only","show_renewal_banner":true}'::jsonb),
('suspended', '{"access":"blocked"}'::jsonb)
on conflict (policy_key) do nothing;

insert into public.developer_module_catalog(module_key,module_name,category,description,sort_order)
values
('vehicles','Vehicle Management','operations','Vehicles, documents and fleet records',10),
('drivers','Driver Management','operations','Drivers and driver records',20),
('trips','Trips & Dispatch','operations','Trips, duties and dispatch allocation',30),
('lr_builty','LR / Builty','documents','LR, Builty and consignment notes',40),
('epod','ePOD','documents','Electronic proof of delivery',50),
('toll','Toll Tracking','finance','Toll expenses and automated tracking',60),
('expenses','Expenses','finance','Fleet expenses and earnings',70),
('driver_payments','Driver Payments','finance','Driver payable and payment tracking',80),
('maintenance','Maintenance','fleet','Vehicle maintenance and service alerts',90),
('gps','GPS Tracking','tracking','Vehicle location and tracking',100),
('advanced_reports','Advanced Reports','analytics','Advanced analytics and reporting',110)
on conflict (module_key) do nothing;

-- Service-role only tables.
do $$ declare t text; begin
  foreach t in array array[
    'developer_company_employees','developer_company_roles','developer_company_invoices',
    'developer_company_invoice_items','developer_company_payments','developer_company_receipts',
    'developer_company_documents','developer_company_announcements','developer_company_announcement_recipients',
    'developer_company_notes','developer_module_catalog','developer_plan_module_entitlements',
    'developer_company_portal_config','developer_lifecycle_access_policy'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

create or replace function public.developer_next_receipt_number()
returns text language sql security definer set search_path = public as $$
  select 'BFR/' || to_char(current_date, 'YY') || '-' || to_char(current_date + interval '1 year', 'YY') || '/' || lpad(nextval('public.buddy_receipt_seq')::text, 6, '0');
$$;
revoke all on function public.developer_next_receipt_number() from public, anon, authenticated;
grant execute on function public.developer_generate_company_code() to service_role;
grant execute on function public.developer_next_invoice_number() to service_role;
grant execute on function public.developer_next_receipt_number() to service_role;

-- Backfill existing account owners into Company 360 employee access without changing auth identities.
insert into public.developer_company_employees(
  company_id,user_id,full_name,email,mobile,designation,role_key,status
)
select
  c.id,
  c.account_owner_user_id,
  coalesce(nullif(p.owner_name,''), c.company_name),
  coalesce(p.owner_email,''),
  coalesce(p.owner_mobile,''),
  'Company Owner',
  'owner',
  'active'
from public.companies c
left join public.developer_company_profiles p on p.company_id=c.id
where c.account_owner_user_id is not null
on conflict (company_id,user_id) do nothing;
