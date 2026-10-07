-- Company 360 Phase 3: company management, internal ownership and private KYC storage.

create table if not exists public.developer_company_internal_profiles (
  company_id uuid primary key references public.companies(id) on delete cascade,
  account_manager_user_id uuid null references auth.users(id) on delete set null,
  support_owner_user_id uuid null references auth.users(id) on delete set null,
  customer_segment text not null default 'standard',
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  risk_level text not null default 'low' check (risk_level in ('low','medium','high','critical')),
  tags text[] not null default '{}',
  revision integer not null default 1,
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.developer_company_internal_profiles enable row level security;
create index if not exists developer_company_internal_profiles_account_manager_idx
  on public.developer_company_internal_profiles(account_manager_user_id);
create index if not exists developer_company_internal_profiles_support_owner_idx
  on public.developer_company_internal_profiles(support_owner_user_id);

alter table public.developer_company_documents
  add column if not exists storage_bucket text null,
  add column if not exists storage_path text null,
  add column if not exists mime_type text null,
  add column if not exists file_size bigint null,
  add column if not exists uploaded_by uuid null;

create index if not exists developer_company_documents_company_status_idx
  on public.developer_company_documents(company_id, status, expiry_date);
create unique index if not exists developer_company_documents_storage_path_uidx
  on public.developer_company_documents(storage_bucket, storage_path)
  where storage_bucket is not null and storage_path is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-kyc-documents',
  'company-kyc-documents',
  false,
  15728640,
  array['application/pdf','image/jpeg','image/png','image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create unique index if not exists company_portal_sites_one_active_primary_idx
  on public.company_portal_sites(company_id)
  where is_primary = true and status = 'active';

create or replace function public.developer_company360_save_site(
  p_company_id uuid,
  p_site_id uuid,
  p_code text,
  p_name text,
  p_site_type text,
  p_address text,
  p_city text,
  p_state text,
  p_pincode text,
  p_is_primary boolean,
  p_status text
)
returns public.company_portal_sites
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_site public.company_portal_sites;
begin
  if not exists (select 1 from public.companies where id = p_company_id) then
    raise exception 'COMPANY_NOT_FOUND';
  end if;
  if nullif(trim(coalesce(p_code,'')), '') is null or nullif(trim(coalesce(p_name,'')), '') is null then
    raise exception 'SITE_CODE_AND_NAME_REQUIRED';
  end if;
  if coalesce(p_status, 'active') not in ('active','inactive','archived') then
    raise exception 'INVALID_SITE_STATUS';
  end if;

  if coalesce(p_is_primary,false) and coalesce(p_status,'active') = 'active' then
    update public.company_portal_sites
       set is_primary = false, updated_at = now()
     where company_id = p_company_id
       and is_primary = true
       and (p_site_id is null or id <> p_site_id);
  end if;

  if p_site_id is null then
    insert into public.company_portal_sites (
      company_id, code, name, site_type, address, city, state, pincode,
      is_primary, status, metadata, created_at, updated_at
    ) values (
      p_company_id, upper(trim(p_code)), trim(p_name), coalesce(nullif(trim(p_site_type),''),'Branch Office'),
      nullif(trim(p_address),''), nullif(trim(p_city),''), nullif(trim(p_state),''), nullif(trim(p_pincode),''),
      coalesce(p_is_primary,false), coalesce(p_status,'active'), '{}'::jsonb, now(), now()
    ) returning * into v_site;
  else
    update public.company_portal_sites
       set code = upper(trim(p_code)),
           name = trim(p_name),
           site_type = coalesce(nullif(trim(p_site_type),''),'Branch Office'),
           address = nullif(trim(p_address),''),
           city = nullif(trim(p_city),''),
           state = nullif(trim(p_state),''),
           pincode = nullif(trim(p_pincode),''),
           is_primary = coalesce(p_is_primary,false),
           status = coalesce(p_status,'active'),
           updated_at = now()
     where id = p_site_id and company_id = p_company_id
     returning * into v_site;
    if v_site.id is null then raise exception 'SITE_NOT_FOUND'; end if;
  end if;

  return v_site;
end;
$$;

revoke all on function public.developer_company360_save_site(uuid,uuid,text,text,text,text,text,text,text,boolean,text) from public, anon, authenticated;
grant execute on function public.developer_company360_save_site(uuid,uuid,text,text,text,text,text,text,text,boolean,text) to service_role;
