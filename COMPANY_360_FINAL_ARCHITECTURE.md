# Buddy Fleets — Company 360° Final Architecture

This package preserves the existing Developer CPanel layout/theme and adds the Company 360° control architecture.

## Company list
- Existing All Companies card UI remains in place.
- Adds `View More` to open `/saas-platform/companies/:companyId`.
- Company code is generated server-side (`BUDDYxxxx`).
- New company creation requires an owner email/password and creates the owner auth account + company membership.

## Company 360 tabs
Overview, Company Profile, Subscription, Billing & Payments, Invoices, Employees & Access, Documents/KYC, Usage & Limits, Modules & Features, Overrides, Portal Configuration, Communications, Security, Activity Log, Support & Notes.

Horizontal navigation wraps to additional lines; it does not use horizontal scrolling.

## Header actions
- Print full Company 360 report
- Export Company 360 workbook (.xlsx)
- Send company announcement
- Record payment
- Add employee

## Employees & access
- Create employee with role and password
- Block/unblock access
- Reset password
- Existing secure HTTP-only portal session architecture remains authoritative
- Company portal session validation now checks Company 360 employee block state when a Company 360 employee record exists

## Billing foundation
- Invoices + invoice line items
- Payments + payment proof URL/reference
- Payment verification/receipt tables
- Invoice snapshots preserve historical company/plan details

## Module/entitlement foundation
Authoritative resolution order:
Module Registry → Plan → lifecycle policy (trial/expired/suspended) → Company Override → Company Portal configuration.

`GET /api/company/entitlements` exposes the resolved company access to the authenticated company portal without exposing service-role credentials.

## Communications
Developer Company 360 can publish announcements to active company employees. The company portal polls `/api/company/announcements` and displays announcements as a popup with optional acknowledgement.

## Data export
Excel export currently contains Company 360 datasets: profile, subscription, limits, employees, invoices, payments, documents, module access, announcements and notes. Transport operational datasets (vehicles/trips/LR/etc.) should be appended to the exporter when those module schemas are finalized/connected.

## Apply
1. Extract into the existing Buddy Fleets repository and replace matching files.
2. `npx supabase db push`
3. `npm run build`
4. `git status`
5. Confirm `.env.local` is not staged.
6. Commit/push.

## New migration
`supabase/migrations/20260921010000_company_360_architecture.sql`

## Security
- Passwords are never stored in Company 360 tables.
- Full Aadhaar is not stored; existing last-4 reference is retained.
- Developer APIs use `requireDeveloperSession`.
- Company notification/entitlement APIs validate the existing `__Host-bf_session` company session, company membership and Company 360 employee access state.
