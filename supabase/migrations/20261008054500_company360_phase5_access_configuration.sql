-- Buddy Fleets — Company 360 Phase 5: Access & Configuration
-- Synchronizes developer employee records with company portal runtime access,
-- adds optimistic revisions to company module overrides, and provides
-- transaction-safe service-role RPCs for Company 360 access/configuration edits.

begin;

alter table if exists public.developer_company_module_overrides
  add column if not exists revision integer not null default 1;

do $$
begin
  if to_regclass('public.developer_company_module_overrides') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'developer_company_module_overrides_revision_check'
         and conrelid = 'public.developer_company_module_overrides'::regclass
     ) then
    alter table public.developer_company_module_overrides
      add constraint developer_company_module_overrides_revision_check
      check (revision > 0);
  end if;
end $$;

-- Backfill legacy developer employee records into the normalized runtime tables.
-- Existing runtime rows are preserved; this only creates missing compatibility rows.
insert into public.company_memberships (
  company_id, user_id, status, access_scope, joined_at
)
select
  e.company_id,
  e.user_id,
  case when e.status = 'active' then 'active' else 'disabled' end,
  case when e.role_key in ('owner','company_admin','admin') then 'company_wide' else 'selected_sites' end,
  coalesce(e.created_at, now())
from public.developer_company_employees e
on conflict (company_id, user_id) do nothing;

insert into public.company_portal_user_profiles (
  company_id, user_id, employee_code, full_name, designation, department, mobile, email, created_at, updated_at
)
select
  e.company_id,
  e.user_id,
  nullif(e.employee_code,''),
  nullif(e.full_name,''),
  nullif(e.designation,''),
  null,
  nullif(e.mobile,''),
  nullif(e.email,''),
  coalesce(e.created_at, now()),
  coalesce(e.updated_at, now())
from public.developer_company_employees e
on conflict (company_id, user_id) do nothing;

insert into public.company_portal_user_access (
  company_id, user_id, role_id, role_name, primary_site_id, site_ids, all_sites,
  module_overrides, permission_overrides, preferences, force_password_change, created_at, updated_at
)
select
  e.company_id,
  e.user_id,
  r.id,
  coalesce(r.name, e.role_key, 'Viewer'),
  ps.id,
  case when e.role_key in ('owner','company_admin','admin') or ps.id is null then '{}'::uuid[] else array[ps.id]::uuid[] end,
  e.role_key in ('owner','company_admin','admin'),
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  coalesce(e.force_password_change,false),
  coalesce(e.created_at, now()),
  coalesce(e.updated_at, now())
from public.developer_company_employees e
left join public.company_portal_roles r
  on r.company_id = e.company_id
 and r.role_key = e.role_key
left join lateral (
  select s.id
  from public.company_portal_sites s
  where s.company_id = e.company_id
    and s.status = 'active'
  order by s.is_primary desc, s.created_at asc
  limit 1
) ps on true
on conflict (company_id, user_id) do nothing;

create or replace function public.developer_company360_sync_employee_runtime(
  p_company_id uuid,
  p_user_id uuid,
  p_actor uuid,
  p_full_name text,
  p_email text,
  p_mobile text,
  p_employee_code text,
  p_designation text,
  p_department text,
  p_branch text,
  p_role_key text,
  p_primary_site_id uuid,
  p_site_ids uuid[],
  p_all_sites boolean,
  p_force_password_change boolean,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company public.companies%rowtype;
  v_role public.company_portal_roles%rowtype;
  v_employee public.developer_company_employees%rowtype;
  v_access public.company_portal_user_access%rowtype;
  v_profile public.company_portal_user_profiles%rowtype;
  v_membership public.company_memberships%rowtype;
  v_sites uuid[] := coalesce(p_site_ids, '{}'::uuid[]);
  v_primary uuid := p_primary_site_id;
  v_all_sites boolean := coalesce(p_all_sites,false);
  v_role_key text := lower(trim(coalesce(p_role_key,'viewer')));
  v_now timestamptz := now();
  v_before jsonb;
begin
  select * into v_company from public.companies where id = p_company_id;
  if not found then return jsonb_build_object('ok',false,'code','COMPANY_NOT_FOUND'); end if;

  select * into v_role
  from public.company_portal_roles
  where company_id = p_company_id and role_key = v_role_key
  limit 1;
  if v_role.id is null then return jsonb_build_object('ok',false,'code','ROLE_NOT_FOUND'); end if;

  if v_role_key = 'owner' and p_user_id is distinct from v_company.account_owner_user_id then
    return jsonb_build_object('ok',false,'code','OWNER_ROLE_PROTECTED');
  end if;
  if p_user_id = v_company.account_owner_user_id and v_role_key <> 'owner' then
    return jsonb_build_object('ok',false,'code','OWNER_ROLE_PROTECTED');
  end if;
  if p_user_id = v_company.account_owner_user_id then
    v_all_sites := true;
    v_sites := '{}'::uuid[];
  end if;

  if v_primary is not null and not exists (
    select 1 from public.company_portal_sites s
    where s.id = v_primary and s.company_id = p_company_id and s.status <> 'archived'
  ) then
    return jsonb_build_object('ok',false,'code','INVALID_PRIMARY_SITE');
  end if;

  if exists (
    select 1 from unnest(v_sites) x(site_id)
    where not exists (
      select 1 from public.company_portal_sites s
      where s.id = x.site_id and s.company_id = p_company_id and s.status <> 'archived'
    )
  ) then
    return jsonb_build_object('ok',false,'code','INVALID_SITE_SCOPE');
  end if;

  if not v_all_sites then
    if v_primary is null then
      select s.id into v_primary
      from public.company_portal_sites s
      where s.company_id = p_company_id and s.status = 'active'
      order by s.is_primary desc, s.created_at asc
      limit 1;
    end if;
    if v_primary is not null and not (v_primary = any(v_sites)) then
      v_sites := array_append(v_sites, v_primary);
    end if;
  else
    v_sites := '{}'::uuid[];
  end if;

  select to_jsonb(e) into v_before
  from public.developer_company_employees e
  where e.company_id = p_company_id and e.user_id = p_user_id;

  insert into public.company_memberships (
    company_id,user_id,status,access_scope,joined_at,updated_at
  ) values (
    p_company_id,p_user_id,'active',case when v_all_sites then 'company_wide' else 'selected_sites' end,v_now,v_now
  )
  on conflict (company_id,user_id) do update set
    status='active',
    access_scope=excluded.access_scope,
    joined_at=coalesce(public.company_memberships.joined_at,excluded.joined_at),
    updated_at=v_now
  returning * into v_membership;

  insert into public.developer_company_employees (
    company_id,user_id,employee_code,full_name,email,mobile,designation,branch,role_key,status,
    force_password_change,notes,created_by,updated_by,created_at,updated_at
  ) values (
    p_company_id,p_user_id,coalesce(trim(p_employee_code),''),coalesce(trim(p_full_name),''),lower(coalesce(trim(p_email),'')),
    coalesce(trim(p_mobile),''),coalesce(trim(p_designation),''),coalesce(trim(p_branch),''),v_role_key,'active',
    coalesce(p_force_password_change,false),coalesce(trim(p_notes),''),p_actor,p_actor,v_now,v_now
  )
  on conflict (company_id,user_id) do update set
    employee_code=excluded.employee_code,
    full_name=excluded.full_name,
    email=excluded.email,
    mobile=excluded.mobile,
    designation=excluded.designation,
    branch=excluded.branch,
    role_key=excluded.role_key,
    force_password_change=excluded.force_password_change,
    notes=excluded.notes,
    updated_by=p_actor,
    updated_at=v_now
  returning * into v_employee;

  insert into public.company_portal_user_access (
    company_id,user_id,role_id,role_name,primary_site_id,site_ids,all_sites,
    module_overrides,permission_overrides,preferences,force_password_change,created_at,updated_at
  ) values (
    p_company_id,p_user_id,v_role.id,v_role.name,v_primary,v_sites,v_all_sites,
    '{}'::jsonb,'{}'::jsonb,'{}'::jsonb,coalesce(p_force_password_change,false),v_now,v_now
  )
  on conflict (company_id,user_id) do update set
    role_id=excluded.role_id,
    role_name=excluded.role_name,
    primary_site_id=excluded.primary_site_id,
    site_ids=excluded.site_ids,
    all_sites=excluded.all_sites,
    force_password_change=excluded.force_password_change,
    updated_at=v_now
  returning * into v_access;

  insert into public.company_portal_user_profiles (
    company_id,user_id,employee_code,full_name,designation,department,mobile,email,created_at,updated_at
  ) values (
    p_company_id,p_user_id,nullif(trim(p_employee_code),''),nullif(trim(p_full_name),''),nullif(trim(p_designation),''),
    nullif(trim(p_department),''),nullif(trim(p_mobile),''),nullif(lower(trim(p_email)),''),v_now,v_now
  )
  on conflict (company_id,user_id) do update set
    employee_code=excluded.employee_code,
    full_name=excluded.full_name,
    designation=excluded.designation,
    department=excluded.department,
    mobile=excluded.mobile,
    email=excluded.email,
    updated_at=v_now
  returning * into v_profile;

  insert into public.developer_saas_history(domain,entity_id,action,before_payload,after_payload,actor_user_id)
  values (
    'company_360',p_company_id::text,
    case when v_before is null then 'employee_create' else 'employee_update' end,
    v_before,
    jsonb_build_object('employee_id',v_employee.id,'user_id',p_user_id,'role_key',v_role_key,'all_sites',v_all_sites,'site_ids',to_jsonb(v_sites)),
    p_actor
  );

  return jsonb_build_object(
    'ok',true,
    'employee',to_jsonb(v_employee),
    'access',to_jsonb(v_access),
    'profile',to_jsonb(v_profile),
    'membership',to_jsonb(v_membership)
  );
end;
$$;

create or replace function public.developer_company360_set_employee_status(
  p_company_id uuid,
  p_user_id uuid,
  p_actor uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company public.companies%rowtype;
  v_employee public.developer_company_employees%rowtype;
  v_next text := lower(trim(coalesce(p_status,'')));
  v_now timestamptz := now();
begin
  if v_next not in ('active','blocked','disabled') then
    return jsonb_build_object('ok',false,'code','INVALID_EMPLOYEE_STATUS');
  end if;

  select * into v_company from public.companies where id=p_company_id;
  if not found then return jsonb_build_object('ok',false,'code','COMPANY_NOT_FOUND'); end if;

  select * into v_employee from public.developer_company_employees
  where company_id=p_company_id and user_id=p_user_id for update;
  if not found then return jsonb_build_object('ok',false,'code','EMPLOYEE_NOT_FOUND'); end if;

  if p_user_id = v_company.account_owner_user_id and v_next <> 'active' then
    return jsonb_build_object('ok',false,'code','OWNER_PROTECTED');
  end if;

  update public.developer_company_employees
  set status=v_next,updated_by=p_actor,updated_at=v_now
  where company_id=p_company_id and user_id=p_user_id
  returning * into v_employee;

  update public.company_memberships
  set status=case when v_next='active' then 'active' else 'disabled' end,updated_at=v_now
  where company_id=p_company_id and user_id=p_user_id;

  if v_next <> 'active' then
    update public.security_sessions
    set status='revoked',revoked_at=v_now,revoke_reason='COMPANY_EMPLOYEE_'||upper(v_next)
    where company_id=p_company_id and user_id=p_user_id and status='active';
  end if;

  insert into public.developer_saas_history(domain,entity_id,action,before_payload,after_payload,actor_user_id)
  values ('company_360',p_company_id::text,
    case when v_next='active' then 'unblock_employee' when v_next='blocked' then 'block_employee' else 'disable_employee' end,
    null,jsonb_build_object('employee_id',v_employee.id,'user_id',p_user_id,'status',v_next),p_actor);

  return jsonb_build_object('ok',true,'status',v_next,'employee',to_jsonb(v_employee));
end;
$$;

create or replace function public.developer_company360_sync_force_password(
  p_company_id uuid,
  p_user_id uuid,
  p_actor uuid,
  p_force_password_change boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_employee public.developer_company_employees%rowtype;
  v_now timestamptz := now();
begin
  update public.developer_company_employees
  set force_password_change=coalesce(p_force_password_change,false),updated_by=p_actor,updated_at=v_now
  where company_id=p_company_id and user_id=p_user_id
  returning * into v_employee;
  if v_employee.id is null then return jsonb_build_object('ok',false,'code','EMPLOYEE_NOT_FOUND'); end if;

  update public.company_portal_user_access
  set force_password_change=coalesce(p_force_password_change,false),updated_at=v_now
  where company_id=p_company_id and user_id=p_user_id;

  update public.security_sessions
  set status='revoked',revoked_at=v_now,revoke_reason='PASSWORD_RESET_BY_DEVELOPER'
  where company_id=p_company_id and user_id=p_user_id and status='active';

  insert into public.developer_saas_history(domain,entity_id,action,before_payload,after_payload,actor_user_id)
  values ('company_360',p_company_id::text,'employee_password_reset',null,
    jsonb_build_object('employee_id',v_employee.id,'user_id',p_user_id,'force_password_change',coalesce(p_force_password_change,false)),p_actor);

  return jsonb_build_object('ok',true,'employee',to_jsonb(v_employee));
end;
$$;

create or replace function public.developer_company360_save_module_override(
  p_company_id uuid,
  p_module_key text,
  p_access_level text,
  p_action_overrides jsonb,
  p_reason text,
  p_expected_revision integer,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current public.developer_company_module_overrides%rowtype;
  v_saved public.developer_company_module_overrides%rowtype;
  v_access text := lower(trim(coalesce(p_access_level,'')));
  v_reason text := trim(coalesce(p_reason,''));
  v_expected integer := greatest(coalesce(p_expected_revision,0),0);
  v_now timestamptz := now();
begin
  if v_access not in ('full','read_only','blocked') then return jsonb_build_object('ok',false,'code','INVALID_ACCESS_LEVEL'); end if;
  if length(v_reason) < 3 then return jsonb_build_object('ok',false,'code','OVERRIDE_REASON_REQUIRED'); end if;
  if not exists (select 1 from public.developer_module_catalog where module_key=p_module_key) then return jsonb_build_object('ok',false,'code','MODULE_NOT_FOUND'); end if;

  select * into v_current from public.developer_company_module_overrides
  where company_id=p_company_id and module_key=p_module_key for update;

  if v_current.module_key is not null and v_current.revision <> v_expected then
    return jsonb_build_object('ok',false,'code','REVISION_CONFLICT','current_revision',v_current.revision);
  end if;
  if v_current.module_key is null and v_expected <> 0 then
    return jsonb_build_object('ok',false,'code','REVISION_CONFLICT','current_revision',0);
  end if;

  insert into public.developer_company_module_overrides(
    company_id,module_key,enabled,access_level,action_overrides,reason,revision,created_by,updated_by,created_at,updated_at
  ) values (
    p_company_id,p_module_key,v_access<>'blocked',v_access,coalesce(p_action_overrides,'{}'::jsonb),v_reason,
    case when v_current.module_key is null then 1 else v_current.revision+1 end,p_actor,p_actor,v_now,v_now
  )
  on conflict (company_id,module_key) do update set
    enabled=excluded.enabled,
    access_level=excluded.access_level,
    action_overrides=excluded.action_overrides,
    reason=excluded.reason,
    revision=public.developer_company_module_overrides.revision+1,
    updated_by=p_actor,
    updated_at=v_now
  returning * into v_saved;

  insert into public.developer_saas_history(domain,entity_id,action,before_payload,after_payload,actor_user_id)
  values ('company_360',p_company_id::text,'module_override_save',case when v_current.module_key is null then null else to_jsonb(v_current) end,to_jsonb(v_saved),p_actor);

  return jsonb_build_object('ok',true,'override',to_jsonb(v_saved));
end;
$$;

create or replace function public.developer_company360_clear_module_override(
  p_company_id uuid,
  p_module_key text,
  p_expected_revision integer,
  p_reason text,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current public.developer_company_module_overrides%rowtype;
  v_reason text := trim(coalesce(p_reason,''));
begin
  if length(v_reason) < 3 then return jsonb_build_object('ok',false,'code','OVERRIDE_REASON_REQUIRED'); end if;
  select * into v_current from public.developer_company_module_overrides
  where company_id=p_company_id and module_key=p_module_key for update;
  if v_current.module_key is null then return jsonb_build_object('ok',true,'cleared',false,'idempotent',true); end if;
  if v_current.revision <> greatest(coalesce(p_expected_revision,0),0) then
    return jsonb_build_object('ok',false,'code','REVISION_CONFLICT','current_revision',v_current.revision);
  end if;

  delete from public.developer_company_module_overrides
  where company_id=p_company_id and module_key=p_module_key;

  insert into public.developer_saas_history(domain,entity_id,action,before_payload,after_payload,actor_user_id)
  values ('company_360',p_company_id::text,'module_override_clear',to_jsonb(v_current),jsonb_build_object('module_key',p_module_key,'reason',v_reason),p_actor);

  return jsonb_build_object('ok',true,'cleared',true);
end;
$$;

create or replace function public.developer_company360_save_portal_config(
  p_company_id uuid,
  p_dashboard_widgets jsonb,
  p_sidebar_overrides jsonb,
  p_branding jsonb,
  p_landing_path text,
  p_expected_revision integer,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current public.developer_company_portal_config%rowtype;
  v_saved public.developer_company_portal_config%rowtype;
  v_expected integer := greatest(coalesce(p_expected_revision,0),0);
  v_landing text := '/' || trim(both '/' from coalesce(nullif(trim(p_landing_path),''),'dashboard'));
  v_now timestamptz := now();
begin
  select * into v_current from public.developer_company_portal_config
  where company_id=p_company_id for update;

  if v_current.company_id is not null and v_current.revision <> v_expected then
    return jsonb_build_object('ok',false,'code','REVISION_CONFLICT','current_revision',v_current.revision);
  end if;
  if v_current.company_id is null and v_expected not in (0,1) then
    return jsonb_build_object('ok',false,'code','REVISION_CONFLICT','current_revision',0);
  end if;

  insert into public.developer_company_portal_config(
    company_id,dashboard_widgets,sidebar_overrides,branding,landing_path,revision,updated_by,updated_at
  ) values (
    p_company_id,coalesce(p_dashboard_widgets,'[]'::jsonb),coalesce(p_sidebar_overrides,'{}'::jsonb),coalesce(p_branding,'{}'::jsonb),v_landing,1,p_actor,v_now
  )
  on conflict (company_id) do update set
    dashboard_widgets=excluded.dashboard_widgets,
    sidebar_overrides=excluded.sidebar_overrides,
    branding=excluded.branding,
    landing_path=excluded.landing_path,
    revision=public.developer_company_portal_config.revision+1,
    updated_by=p_actor,
    updated_at=v_now
  returning * into v_saved;

  insert into public.developer_saas_history(domain,entity_id,action,before_payload,after_payload,actor_user_id)
  values ('company_360',p_company_id::text,'portal_config_save',case when v_current.company_id is null then null else to_jsonb(v_current) end,to_jsonb(v_saved),p_actor);

  return jsonb_build_object('ok',true,'portal_config',to_jsonb(v_saved));
end;
$$;

-- Service-role only: these RPCs are used by the authenticated Developer API.
do $$
declare
  sig text;
begin
  foreach sig in array array[
    'public.developer_company360_sync_employee_runtime(uuid,uuid,uuid,text,text,text,text,text,text,text,text,uuid,uuid[],boolean,boolean,text)',
    'public.developer_company360_set_employee_status(uuid,uuid,uuid,text)',
    'public.developer_company360_sync_force_password(uuid,uuid,uuid,boolean)',
    'public.developer_company360_save_module_override(uuid,text,text,jsonb,text,integer,uuid)',
    'public.developer_company360_clear_module_override(uuid,text,integer,text,uuid)',
    'public.developer_company360_save_portal_config(uuid,jsonb,jsonb,jsonb,text,integer,uuid)'
  ] loop
    execute format('revoke all on function %s from public', sig);
    execute format('revoke all on function %s from anon', sig);
    execute format('revoke all on function %s from authenticated', sig);
    execute format('grant execute on function %s to service_role', sig);
  end loop;
end $$;

commit;
