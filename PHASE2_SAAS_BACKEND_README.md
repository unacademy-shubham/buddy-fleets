# Buddy Fleets — Phase 2 SaaS Backend

This package adds real Companies + Plans & Entitlements backend controls while preserving the existing Developer CPanel page layout, theme, headings, descriptions and three-card workspace.

## What changes visibly

The existing page layout does not change. On the six Phase 2 pages:

- `Configuration -> Configure` continues to open the existing generic control-plane configuration modal.
- `Overview -> Configure` and `Operational Controls -> Configure` open the new secure domain manager modal.

## Pages connected

- `/saas-platform/companies/companies`
- `/saas-platform/companies/trials-renewals`
- `/saas-platform/companies/company-overrides`
- `/saas-platform/plans-entitlements/plans`
- `/saas-platform/plans-entitlements/limits-access`
- `/saas-platform/plans-entitlements/renewal-policy`

## Backend capabilities

### Companies
- Read existing `companies` and `subscriptions` records using the server-side Supabase service role.
- Activate, suspend and restore existing companies.
- Review subscription status and current subscription plan ID.

### Trials & Renewals
- Review trial-active / trial-expired companies.
- Update existing subscription trial start/end dates.
- Mark a trial active or expired.
- Company and subscription trial status are updated together.

### Company Overrides
- Per-company plan-key override.
- Vehicle/user/site limit overrides.
- Entitlement/module override list.
- Internal notes.
- Revision conflict protection.
- Clear override to return to defaults.

### Plans
- Seed current Buddy Fleets Launch / Accelerate / Scale / Apex commercial plans.
- Create new plans.
- Edit duration pricing (1/3/6/12 months), plan labels, badge, status and display order.
- Archive plans without destructive deletion.
- Revision conflict protection.

### Limits & Access
- Edit plan vehicle limits, users, sites and entitlement/module lists.

### Renewal Policy
- Grace days.
- Reminder days.
- Expiry behavior.
- Post-expiry access mode.
- Auto-suspend policy flag.
- Revision conflict protection.

## Security architecture

- Browser never receives Supabase service-role credentials.
- All writes pass through `/api/developer/saas-management`.
- Every API request uses the existing locked `requireDeveloperSession` guard.
- RLS is enabled on all new Phase 2 tables and no browser policies are granted.
- Domain changes are written to `developer_saas_history` and best-effort existing `audit_logs`.
- Existing auth/session tables and authentication architecture are not changed by the migration.

## Database migration

Run from the project root after extracting the patch:

```powershell
npx supabase db push
```

New migration:

`supabase/migrations/20260920230000_developer_saas_management.sql`

New tables:

- `developer_plans`
- `developer_company_overrides`
- `developer_renewal_policy`
- `developer_saas_history`

## Verification

```powershell
npm run build
git status
git diff --stat
git diff --check
```

Then commit/push after reviewing the diff.

## Live smoke test order

1. Plans -> Overview -> Configure: verify Launch/Accelerate/Scale/Apex load.
2. Limits & Access -> Overview -> Configure: edit one harmless limit and save, then reload.
3. Renewal Policy -> Overview -> Configure: save notes or reminder days, then reload.
4. Company Overrides -> Overview -> Configure: create an override for a test company, then reload.
5. Trials & Renewals -> Overview -> Configure: only edit a test/trial company.
6. Company Management -> Operational Controls -> Configure: use Suspend/Restore only on a test company.

Do not use a production customer for the first lifecycle/trial tests.

## Intentional scope boundary

This phase does not create new authenticated companies from the Developer CPanel because tenant creation requires the existing signup/auth/membership workflow. It manages existing tenants safely. It also does not mutate the hard-coded public Pricing page yet; the website CMS/theme project will later read published plan data when that integration is intentionally enabled.
