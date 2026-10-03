-- Buddy Fleets — legacy company-owner login repair (2026-10-03)
--
-- Context:
-- Public company signups created before the normalized Client Portal runtime
-- can have a valid Supabase Auth identity and legacy company_memberships row,
-- but be missing the newer company_portal_* provisioning rows required by
-- bf_resolve_company_portal_bootstrap(). That makes a correct password appear
-- as "Invalid company code, email, or password" after password verification.
--
-- This migration is additive/idempotent. It preserves existing access rows,
-- never reactivates an explicitly non-active membership, and backfills only
-- missing foundation data for authoritative company owners.

begin;

-- 1) Recover account_owner_user_id only for old public-trial signups that are
-- already active legacy members of that company. Never infer ownership from a
-- company code alone.
with owner_candidates as (
  select
    c.id as company_id,
    m.user_id,
    count(*) over (partition by c.id) as candidate_count
  from public.companies c
  join public.company_memberships m
    on m.company_id = c.id
   and m.status = 'active'
  join auth.users u
    on u.id = m.user_id
  where c.account_owner_user_id is null
    and lower(coalesce(u.raw_user_meta_data->>'signup_type', '')) = 'company_trial'
)
update public.companies c
set account_owner_user_id = candidate.user_id
from owner_candidates candidate
where c.id = candidate.company_id
  and candidate.candidate_count = 1
  and c.account_owner_user_id is null;

-- 2) Legacy membership remains the authorization anchor. This migration does
-- not recreate a missing/deleted membership because deletion may represent an
-- intentional access revocation. Only owners with an existing active legacy
-- membership are backfilled into the newer runtime tables below.

-- 3) Company 360 owner employee row.
insert into public.developer_company_employees (
  company_id,
  user_id,
  full_name,
  email,
  mobile,
  designation,
  role_key,
  status
)
select
  c.id,
  c.account_owner_user_id,
  coalesce(
    nullif(p.owner_name, ''),
    nullif(u.raw_user_meta_data->>'full_name', ''),
    c.company_name,
    'Company Owner'
  ),
  lower(coalesce(nullif(p.owner_email, ''), u.email, '')),
  coalesce(nullif(p.owner_mobile, ''), u.raw_user_meta_data->>'mobile', ''),
  'Company Owner',
  'owner',
  'active'
from public.companies c
left join public.developer_company_profiles p
  on p.company_id = c.id
left join auth.users u
  on u.id = c.account_owner_user_id
where c.account_owner_user_id is not null
  and exists (
    select 1 from public.company_memberships m
    where m.company_id = c.id
      and m.user_id = c.account_owner_user_id
      and m.status = 'active'
  )
on conflict (company_id, user_id) do nothing;

-- 4) Portal settings. Preserve explicit existing settings. For an old public
-- signup with Fleet Pack metadata, make that original selection authoritative.
insert into public.company_portal_settings (
  company_id,
  fleet_pack,
  enabled_packs,
  fleet_pack_selection_status,
  fleet_pack_selected_at,
  company_display_name
)
select
  c.id,
  case
    when lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type', '')) in (
      'travels','bagged_cement','general_transport','container','cement_bulker','staff_transport','school_transport'
    )
      then lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type'))
    else 'travels'
  end,
  case
    when lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type', '')) in (
      'travels','bagged_cement','general_transport','container','cement_bulker','staff_transport','school_transport'
    )
      then array[lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type'))]::text[]
    else array['travels']::text[]
  end,
  case
    when lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type', '')) in (
      'travels','bagged_cement','general_transport','container','cement_bulker','staff_transport','school_transport'
    ) then 'selected'
    else 'pending'
  end,
  case
    when lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type', '')) in (
      'travels','bagged_cement','general_transport','container','cement_bulker','staff_transport','school_transport'
    ) then now()
    else null
  end,
  c.company_name
from public.companies c
left join auth.users u
  on u.id = c.account_owner_user_id
where c.account_owner_user_id is not null
  and exists (
    select 1 from public.company_memberships m
    where m.company_id = c.id
      and m.user_id = c.account_owner_user_id
      and m.status = 'active'
  )
on conflict (company_id) do nothing;

-- Existing pending settings from old signups may already have been created
-- with the historical default "travels". Promote the original signup Fleet
-- Pack only when no explicit selection has been made yet.
update public.company_portal_settings s
set
  fleet_pack = lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type')),
  enabled_packs = array[lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type'))]::text[],
  fleet_pack_selection_status = 'selected',
  fleet_pack_selected_at = coalesce(s.fleet_pack_selected_at, now()),
  updated_at = now()
from public.companies c
join auth.users u
  on u.id = c.account_owner_user_id
where s.company_id = c.id
  and exists (
    select 1 from public.company_memberships m
    where m.company_id = c.id
      and m.user_id = c.account_owner_user_id
      and m.status = 'active'
  )
  and s.fleet_pack_selection_status <> 'selected'
  and lower(coalesce(u.raw_user_meta_data->>'fleet_pack', u.raw_user_meta_data->>'company_type', '')) in (
    'travels','bagged_cement','general_transport','container','cement_bulker','staff_transport','school_transport'
  );

-- 5) Default company portal config used by the normalized runtime.
insert into public.developer_company_portal_config (
  company_id,
  dashboard_widgets,
  sidebar_overrides,
  branding,
  landing_path
)
select
  c.id,
  '[]'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  '/dashboard'
from public.companies c
where c.account_owner_user_id is not null
  and exists (
    select 1 from public.company_memberships m
    where m.company_id = c.id
      and m.user_id = c.account_owner_user_id
      and m.status = 'active'
  )
on conflict (company_id) do nothing;

-- 6) Every owner company needs at least one site scope. Existing sites are
-- preserved; create HQ only when the company has no site at all.
insert into public.company_portal_sites (
  company_id,
  code,
  name,
  site_type,
  is_primary,
  status
)
select
  c.id,
  'HQ',
  left(coalesce(c.company_name, 'Company') || ' HQ', 150),
  'Head Office',
  true,
  'active'
from public.companies c
where c.account_owner_user_id is not null
  and exists (
    select 1 from public.company_memberships m
    where m.company_id = c.id
      and m.user_id = c.account_owner_user_id
      and m.status = 'active'
  )
  and not exists (
    select 1
    from public.company_portal_sites s
    where s.company_id = c.id
  );

-- If sites exist but none is primary, promote the oldest active site.
with first_active_site as (
  select distinct on (s.company_id)
    s.company_id,
    s.id
  from public.company_portal_sites s
  join public.companies c
    on c.id = s.company_id
   and c.account_owner_user_id is not null
  where s.status = 'active'
    and exists (
      select 1 from public.company_memberships m
      where m.company_id = c.id
        and m.user_id = c.account_owner_user_id
        and m.status = 'active'
    )
    and not exists (
      select 1
      from public.company_portal_sites p
      where p.company_id = s.company_id
        and p.status = 'active'
        and p.is_primary = true
    )
  order by s.company_id, s.created_at, s.id
)
update public.company_portal_sites s
set is_primary = true,
    updated_at = now()
from first_active_site f
where s.id = f.id;

-- 7) Minimum system-role foundation. Do not overwrite existing role policies.
insert into public.company_portal_roles (
  company_id,
  role_key,
  name,
  description,
  is_system
)
select
  c.id,
  role.role_key,
  role.name,
  role.description,
  true
from public.companies c
cross join (
  values
    ('owner', 'Company Owner', 'System account owner'),
    ('company_admin', 'Company Admin', 'Company administrator'),
    ('operations_manager', 'Operations Manager', 'Operations management'),
    ('fleet_manager', 'Fleet Manager', 'Fleet management'),
    ('dispatcher', 'Dispatcher', 'Dispatch operations'),
    ('accountant', 'Accountant', 'Accounts and finance'),
    ('driver_manager', 'Driver Manager', 'Driver operations'),
    ('viewer', 'Viewer', 'Read-only company user')
) as role(role_key, name, description)
where c.account_owner_user_id is not null
  and exists (
    select 1 from public.company_memberships m
    where m.company_id = c.id
      and m.user_id = c.account_owner_user_id
      and m.status = 'active'
  )
on conflict (company_id, role_key) do nothing;

-- 8) Owner runtime access. Existing access is preserved exactly.
insert into public.company_portal_user_access (
  company_id,
  user_id,
  role_id,
  role_name,
  primary_site_id,
  site_ids,
  all_sites,
  module_overrides,
  permission_overrides,
  force_password_change
)
select
  c.id,
  c.account_owner_user_id,
  r.id,
  r.name,
  primary_site.id,
  coalesce(site_scope.site_ids, '{}'::uuid[]),
  true,
  '{}'::jsonb,
  '{}'::jsonb,
  false
from public.companies c
join public.company_portal_roles r
  on r.company_id = c.id
 and r.role_key = 'owner'
left join lateral (
  select s.id
  from public.company_portal_sites s
  where s.company_id = c.id
    and s.status = 'active'
  order by s.is_primary desc, s.created_at, s.id
  limit 1
) primary_site on true
left join lateral (
  select array_agg(s.id order by s.is_primary desc, s.created_at, s.id)::uuid[] as site_ids
  from public.company_portal_sites s
  where s.company_id = c.id
    and s.status = 'active'
) site_scope on true
where c.account_owner_user_id is not null
  and exists (
    select 1
    from public.company_memberships m
    where m.company_id = c.id
      and m.user_id = c.account_owner_user_id
      and m.status = 'active'
  )
on conflict (company_id, user_id) do nothing;

-- 9) Owner profile used by the Client Portal header/profile pages.
insert into public.company_portal_user_profiles (
  company_id,
  user_id,
  full_name,
  designation,
  mobile,
  email
)
select
  c.id,
  c.account_owner_user_id,
  coalesce(
    nullif(p.owner_name, ''),
    nullif(u.raw_user_meta_data->>'full_name', ''),
    c.company_name,
    'Company Owner'
  ),
  'Company Owner',
  coalesce(nullif(p.owner_mobile, ''), u.raw_user_meta_data->>'mobile', ''),
  lower(coalesce(nullif(p.owner_email, ''), u.email, ''))
from public.companies c
left join public.developer_company_profiles p
  on p.company_id = c.id
left join auth.users u
  on u.id = c.account_owner_user_id
where c.account_owner_user_id is not null
  and exists (
    select 1 from public.company_memberships m
    where m.company_id = c.id
      and m.user_id = c.account_owner_user_id
      and m.status = 'active'
  )
on conflict (company_id, user_id) do nothing;

commit;

-- Verification is available from Developer > Company 360 > Provisioning Health.
