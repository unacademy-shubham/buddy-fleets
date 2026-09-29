/* ============================================================
   BUDDY FLEETS — PART 05A
   PLATFORM ADD-ONS + ADVANCED MODULE FOUNDATION
   2026-09-29

   Safe additive migration.
   - Keeps existing auth/session architecture untouched.
   - New control-plane tables remain server/service-role only.
   - Advanced operational modules are registered as BETA/inactive
     navigation foundations until their detailed workflows are built.
============================================================ */

create extension if not exists pgcrypto;

/* ------------------------------------------------------------
   FEATURE FLAGS
------------------------------------------------------------ */
create table if not exists public.developer_feature_flags (
  flag_key text primary key,
  name text not null,
  description text not null default '',
  enabled boolean not null default false,
  rollout_percent integer not null default 0 check (rollout_percent between 0 and 100),
  scope jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

/* ------------------------------------------------------------
   PLATFORM SETTINGS / MAINTENANCE / READ-ONLY MODE
------------------------------------------------------------ */
create table if not exists public.developer_platform_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  revision integer not null default 1 check (revision > 0),
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

/* ------------------------------------------------------------
   DASHBOARD WIDGET PRESETS
------------------------------------------------------------ */
create table if not exists public.developer_dashboard_widget_presets (
  preset_key text primary key,
  name text not null,
  fleet_pack text null,
  widgets jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint developer_dashboard_widget_presets_widgets_array check (jsonb_typeof(widgets) = 'array')
);

/* Optional FK only when the registry exists. */
do $$
begin
  if to_regclass('public.developer_fleet_packs') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'developer_dashboard_widget_presets_fleet_pack_fkey'
         and conrelid = 'public.developer_dashboard_widget_presets'::regclass
     ) then
    alter table public.developer_dashboard_widget_presets
      add constraint developer_dashboard_widget_presets_fleet_pack_fkey
      foreign key (fleet_pack)
      references public.developer_fleet_packs(pack_key)
      on update cascade on delete set null;
  end if;
end $$;

/* ------------------------------------------------------------
   EXPORT CENTER
------------------------------------------------------------ */
create table if not exists public.developer_export_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid null,
  company_id uuid null references public.companies(id) on delete cascade,
  export_type text not null,
  filters jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','cancelled')),
  output_path text null,
  error_message text null,
  requested_at timestamptz not null default now(),
  started_at timestamptz null,
  completed_at timestamptz null,
  expires_at timestamptz null
);
create index if not exists developer_export_jobs_requested_idx
  on public.developer_export_jobs(requested_at desc);
create index if not exists developer_export_jobs_company_idx
  on public.developer_export_jobs(company_id, requested_at desc);

/* ------------------------------------------------------------
   READ-ONLY VIEW-AS-COMPANY AUDIT
   This never creates an impersonated authenticated user session.
------------------------------------------------------------ */
create table if not exists public.developer_preview_audit (
  id uuid primary key default gen_random_uuid(),
  developer_user_id uuid null,
  company_id uuid not null references public.companies(id) on delete cascade,
  target_user_id uuid null,
  purpose text not null default 'support_preview',
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists developer_preview_audit_company_idx
  on public.developer_preview_audit(company_id, created_at desc);

/* ------------------------------------------------------------
   RLS / SERVER AUTHORITY
------------------------------------------------------------ */
alter table public.developer_feature_flags enable row level security;
alter table public.developer_platform_settings enable row level security;
alter table public.developer_dashboard_widget_presets enable row level security;
alter table public.developer_export_jobs enable row level security;
alter table public.developer_preview_audit enable row level security;

revoke all on table public.developer_feature_flags from anon, authenticated;
revoke all on table public.developer_platform_settings from anon, authenticated;
revoke all on table public.developer_dashboard_widget_presets from anon, authenticated;
revoke all on table public.developer_export_jobs from anon, authenticated;
revoke all on table public.developer_preview_audit from anon, authenticated;

grant select, insert, update, delete on table public.developer_feature_flags to service_role;
grant select, insert, update, delete on table public.developer_platform_settings to service_role;
grant select, insert, update, delete on table public.developer_dashboard_widget_presets to service_role;
grant select, insert, update, delete on table public.developer_export_jobs to service_role;
grant select, insert, update, delete on table public.developer_preview_audit to service_role;

/* Updated-at triggers, reusing the existing Buddy Fleets helper. */
do $$
declare
  t text;
begin
  if to_regprocedure('public.set_updated_at()') is not null then
    foreach t in array array[
      'developer_feature_flags',
      'developer_platform_settings',
      'developer_dashboard_widget_presets'
    ] loop
      execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
      execute format(
        'create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
        t, t
      );
    end loop;
  end if;
end $$;

/* ------------------------------------------------------------
   DEFAULT PLATFORM SETTINGS
------------------------------------------------------------ */
insert into public.developer_platform_settings(setting_key, setting_value)
values
  ('maintenance_mode', jsonb_build_object(
    'enabled', false,
    'read_only', false,
    'message', 'Buddy Fleets is operating normally.',
    'allow_developer_access', true,
    'allow_team_access', true
  )),
  ('export_center', jsonb_build_object(
    'default_retention_days', 7,
    'max_rows_per_export', 100000,
    'enabled', true
  )),
  ('global_search', jsonb_build_object(
    'enabled', true,
    'max_results', 20
  ))
on conflict (setting_key) do nothing;

insert into public.developer_feature_flags(flag_key, name, description, enabled, rollout_percent)
values
  ('advanced_operational_modules', 'Advanced operational modules', 'Enables beta foundations for additional transport workflows.', false, 0),
  ('view_as_company', 'Read-only View as Company', 'Allows audited developer preview of a company access context without impersonating the user session.', true, 100),
  ('dashboard_widget_manager', 'Dashboard widget manager', 'Enables fleet-wise dashboard widget configuration.', true, 100),
  ('export_center', 'Export Center', 'Central export job queue and downloadable report workflow.', true, 100),
  ('maintenance_mode_controls', 'Maintenance controls', 'Allows platform-wide maintenance/read-only controls.', true, 100)
on conflict (flag_key) do nothing;

/* ------------------------------------------------------------
   DEFAULT DASHBOARD WIDGET PRESETS
------------------------------------------------------------ */
insert into public.developer_dashboard_widget_presets(preset_key, name, fleet_pack, widgets, is_default)
values
  ('travels.default', 'Travels Default', 'travels', '["travel_bookings","travel_availability","travel_driver_duty","expenses","reports"]'::jsonb, true),
  ('bagged_cement.default', 'Bagged Cement Default', 'bagged_cement', '["cement_placement","cement_queue","cement_loading","cement_dispatch","cement_tat","expenses"]'::jsonb, true),
  ('general_transport.default', 'General Goods Default', 'general_transport', '["goods_consignment","goods_load_planning","goods_delivery","goods_freight","expenses"]'::jsonb, true),
  ('container.default', 'Container Default', 'container', '["container_movement","container_port_ops","container_gate","container_detention","expenses"]'::jsonb, true),
  ('cement_bulker.default', 'Cement Bulker Default', 'cement_bulker', '["bulker_placement","bulker_queue","bulker_loading","bulker_weighbridge","bulker_tat"]'::jsonb, true),
  ('staff_transport.default', 'Staff Transport Default', 'staff_transport', '["staff_routes","staff_shifts","staff_roster","staff_allocation","staff_attendance"]'::jsonb, true),
  ('school_transport.default', 'School Transport Default', 'school_transport', '["school_routes","school_students","school_assignments","school_pickup_drop","school_attendance"]'::jsonb, true)
on conflict (preset_key) do nothing;

/* ------------------------------------------------------------
   ADVANCED MODULE REGISTRY FOUNDATION
   BETA means registered/configurable but not exposed by the
   current runtime resolver until deliberately promoted to active.
------------------------------------------------------------ */
do $$
begin
  if to_regclass('public.developer_module_catalog') is null then
    return;
  end if;

  insert into public.developer_module_catalog(
    module_key, module_name, category, description, icon_key,
    status, unavailable_behavior, trial_access, expired_access,
    dependencies, show_in_sidebar, show_on_dashboard, sort_order
  ) values
    ('control_tower','Live Operations / Control Tower','operations','Unified operational control surface for trips, dispatch, exceptions and availability.','activity','beta','locked','full','read_only','{}',true,true,210),
    ('trip_timeline','Trip Timeline / History','operations','Chronological trip event and milestone history.','clock','beta','locked','full','read_only','{trips}',true,false,211),
    ('route_library','Route Library','operations','Reusable route templates, lanes and route metadata.','route','beta','locked','full','read_only','{}',true,false,212),
    ('geofence_events','Geofence / Location Events','operations','Foundation for GPS geofence arrival, departure and exception events.','map-pin','beta','locked','preview','read_only','{}',true,false,213),
    ('exception_management','Exception / Delay Management','operations','Operational exceptions, delays, reasons and escalation workflow.','triangle-alert','beta','locked','full','read_only','{}',true,true,214),
    ('vehicle_allocation','Vehicle Allocation','operations','Vehicle assignment and availability workflow.','truck','beta','locked','full','read_only','{vehicles}',true,false,215),
    ('driver_availability','Driver Duty / Availability','operations','Driver roster and availability foundation.','users','beta','locked','full','read_only','{drivers}',true,false,216),
    ('receivables','Receivables','finance','Customer receivable ledger foundation.','wallet','beta','locked','preview','read_only','{}',true,true,310),
    ('payables','Payables','finance','Vendor and driver payable ledger foundation.','receipt','beta','locked','preview','read_only','{}',true,true,311),
    ('bank_transactions','Cash / Bank Transactions','finance','Cash and bank transaction register foundation.','landmark','beta','locked','preview','read_only','{}',true,false,312),
    ('cost_centres','Cost Centre / Site-wise Cost','finance','Cost-center and site-wise financial allocation.','chart-pie','beta','locked','preview','read_only','{}',true,false,313),
    ('vehicle_profitability','Vehicle-wise Profitability','finance','Vehicle contribution, revenue, expense and margin analysis.','chart-no-axes-combined','beta','locked','preview','read_only','{vehicles}',true,true,314),
    ('customer_profitability','Customer-wise Profitability','finance','Party/customer profitability analysis.','badge-indian-rupee','beta','locked','preview','read_only','{parties}',true,true,315),
    ('outstanding_aging','Outstanding / Aging','finance','Receivable aging and overdue tracking.','calendar-clock','beta','locked','preview','read_only','{receivables}',true,true,316),
    ('freight_contracts','Rate / Freight Contracts','finance','Party-wise lane rates, freight contracts and validity rules.','file-signature','beta','locked','preview','read_only','{parties}',true,false,317),
    ('vehicle_availability','Vehicle Availability','management','Operational availability and status board.','circle-check','beta','locked','full','read_only','{vehicles}',true,true,410),
    ('service_schedule','Service Schedule','management','Preventive service calendar and maintenance scheduling.','calendar-cog','beta','locked','full','read_only','{maintenance}',true,true,411),
    ('breakdown_records','Breakdown Records','management','Vehicle breakdown, recovery and resolution records.','wrench','beta','locked','full','read_only','{vehicles}',true,false,412),
    ('document_expiry_center','Document Expiry Center','management','Central upcoming/expired compliance document view.','file-warning','beta','locked','full','read_only','{compliance}',true,true,413),
    ('driver_compliance','Driver Compliance','management','Driver licence/compliance validity and action center.','shield-check','beta','locked','full','read_only','{drivers}',true,false,414),
    ('vendors_workshops','Vendor / Workshop Management','management','Workshop and maintenance vendor master foundation.','warehouse','beta','locked','preview','read_only','{}',true,false,415),
    ('fuel_vendors','Fuel Vendor Management','management','Fuel vendor, station and contract master foundation.','fuel','beta','locked','preview','read_only','{fuel}',true,false,416),
    ('master_data','Master Data Management','administration','Central operational master-data configuration.','database','beta','locked','preview','read_only','{}',true,false,510),
    ('import_export_center','Import / Export Center','administration','Bulk import/export orchestration foundation.','arrow-left-right','beta','locked','preview','read_only','{}',true,false,511),
    ('notification_center','Notification Center','administration','Unified operational notification center foundation.','bell','beta','locked','full','read_only','{notifications}',true,true,512),
    ('integration_center','Integration Center','administration','Company-level GPS, messaging, accounting and provider integration configuration.','plug','beta','locked','preview','read_only','{}',true,false,513)
  on conflict (module_key) do update set
    module_name = excluded.module_name,
    category = excluded.category,
    description = excluded.description,
    icon_key = excluded.icon_key,
    updated_at = now();
end $$;

/* Foundation columns introduced by the normalized 2026-09-29 DB
   migration are updated only when they exist. */
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='developer_module_catalog' and column_name='is_core'
  ) then
    update public.developer_module_catalog
    set is_core = false
    where module_key in (
      'control_tower','trip_timeline','route_library','geofence_events','exception_management','vehicle_allocation','driver_availability',
      'receivables','payables','bank_transactions','cost_centres','vehicle_profitability','customer_profitability','outstanding_aging','freight_contracts',
      'vehicle_availability','service_schedule','breakdown_records','document_expiry_center','driver_compliance','vendors_workshops','fuel_vendors',
      'master_data','import_export_center','notification_center','integration_center'
    );
  end if;
end $$;

/* Map beta modules to all active fleet packs as disabled foundations. */
do $$
begin
  if to_regclass('public.developer_fleet_pack_modules') is not null
     and to_regclass('public.developer_fleet_packs') is not null then
    insert into public.developer_fleet_pack_modules(pack_key,module_key,default_enabled,is_core,sort_order,config)
    select fp.pack_key, m.module_key, false, false, m.sort_order, jsonb_build_object('foundation','part_05','beta',true)
    from public.developer_fleet_packs fp
    cross join public.developer_module_catalog m
    where fp.status='active'
      and m.module_key in (
        'control_tower','trip_timeline','route_library','geofence_events','exception_management','vehicle_allocation','driver_availability',
        'receivables','payables','bank_transactions','cost_centres','vehicle_profitability','customer_profitability','outstanding_aging','freight_contracts',
        'vehicle_availability','service_schedule','breakdown_records','document_expiry_center','driver_compliance','vendors_workshops','fuel_vendors',
        'master_data','import_export_center','notification_center','integration_center'
      )
    on conflict (pack_key,module_key) do nothing;
  end if;
end $$;

/* Plan-level foundations remain blocked until business limits/features
   are deliberately finalized later. */
do $$
begin
  if to_regclass('public.developer_plan_module_entitlements') is not null
     and to_regclass('public.developer_plans') is not null then
    insert into public.developer_plan_module_entitlements(plan_key,module_key,access_level,limits)
    select p.plan_key, m.module_key, 'none', '{}'::jsonb
    from public.developer_plans p
    cross join public.developer_module_catalog m
    where m.module_key in (
      'control_tower','trip_timeline','route_library','geofence_events','exception_management','vehicle_allocation','driver_availability',
      'receivables','payables','bank_transactions','cost_centres','vehicle_profitability','customer_profitability','outstanding_aging','freight_contracts',
      'vehicle_availability','service_schedule','breakdown_records','document_expiry_center','driver_compliance','vendors_workshops','fuel_vendors',
      'master_data','import_export_center','notification_center','integration_center'
    )
    on conflict (plan_key,module_key) do nothing;
  end if;
end $$;

/* Plan × Fleet matrix receives explicit blocked rows so the runtime
   resolver has a complete foundation without granting beta access. */
do $$
begin
  if to_regclass('public.developer_plan_fleet_entitlements') is not null
     and to_regclass('public.developer_fleet_pack_modules') is not null
     and to_regclass('public.developer_plans') is not null then
    insert into public.developer_plan_fleet_entitlements(plan_key,pack_key,module_key,access_level,limits)
    select p.plan_key, fpm.pack_key, fpm.module_key, 'blocked', '{}'::jsonb
    from public.developer_plans p
    join public.developer_fleet_pack_modules fpm on true
    where fpm.module_key in (
      'control_tower','trip_timeline','route_library','geofence_events','exception_management','vehicle_allocation','driver_availability',
      'receivables','payables','bank_transactions','cost_centres','vehicle_profitability','customer_profitability','outstanding_aging','freight_contracts',
      'vehicle_availability','service_schedule','breakdown_records','document_expiry_center','driver_compliance','vendors_workshops','fuel_vendors',
      'master_data','import_export_center','notification_center','integration_center'
    )
    on conflict (plan_key,pack_key,module_key) do nothing;
  end if;
end $$;

/* ------------------------------------------------------------
   VERIFICATION VIEW (non-security-sensitive developer support)
------------------------------------------------------------ */
create or replace view public.bf_developer_platform_addon_health as
select
  (select count(*) from public.developer_feature_flags) as feature_flags,
  (select count(*) from public.developer_dashboard_widget_presets) as widget_presets,
  (select count(*) from public.developer_export_jobs) as export_jobs,
  (select count(*) from public.developer_preview_audit) as preview_audits,
  (select count(*) from public.developer_module_catalog where status='beta') as beta_modules;

revoke all on public.bf_developer_platform_addon_health from anon, authenticated;
grant select on public.bf_developer_platform_addon_health to service_role;
