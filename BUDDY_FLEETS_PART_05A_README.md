# Buddy Fleets — Final Part 05A of 05

## Scope
Part 05A completes the **Developer platform add-ons/control-plane foundation** without changing the locked Buddy Fleets auth/cookie/tenant architecture.

### Implemented
- Backend-powered Developer **Global Search** for companies, modules, Fleet Packs and plans.
- **Platform Tools & Add-ons** workspace inside the existing Feature Flags route.
- Live Feature Flag controls.
- Maintenance / read-only policy configuration foundation.
- Fleet-wise **Dashboard Widget Manager**.
- Central **Export Center queue** foundation.
- Audited **Read-only View as Company**.
- User-level **Access Simulator** using the central `bf_resolve_company_portal_bootstrap(...)` resolver.
- Recent Developer Activity view.
- Advanced transport module registry foundation for control tower, route library, geofences, exception/delay management, receivables/payables, profitability, service schedules, compliance, vendor management, import/export and integration center.
- New server-only control-plane tables with RLS and service-role authority.

## Important safety behavior
- View-as-Company **does not impersonate an authenticated user session**. It resolves and displays access context only and writes an audit row.
- Advanced modules are seeded as **BETA** and Plan × Fleet access is **blocked** by default. They are foundations for later workflow completion, not silently enabled features.
- Usage/entry limits are still intentionally not enforced until the final commercial limits decision.
- No `.env`, service-role key, cookie token or Supabase auth token is included in this archive.

## Supabase
After merging all project parts, run this migration in Supabase SQL Editor:

`supabase/migrations/20260929143000_platform_addons_advanced_modules.sql`

The migration is additive/idempotent and is designed for the normalized Buddy Fleets database foundation already created in this project.

## Merge
Extract into the **same parent folder** used for Parts 01–04 and choose Merge/Replace when asked. The archive root is `buddy-fleets/...`.
