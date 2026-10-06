-- Buddy Fleets Phase 4/5 commercial alignment.
-- 1) Retire the 3-month billing period from the live plan source of truth.
-- 2) Persist the GST status captured by the Create Company verification flow.

alter table public.developer_company_profiles
  add column if not exists gst_status text not null default '';

update public.developer_plans
set
  prices = coalesce(prices, '{}'::jsonb) - '3',
  revision = revision + 1,
  updated_at = now()
where coalesce(prices, '{}'::jsonb) ? '3';
