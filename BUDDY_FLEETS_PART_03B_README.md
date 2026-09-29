# Buddy Fleets — Final Part 03B

## Scope
Client + Demo Portal UI, seven Fleet Pack dashboards/workspaces, live backend-driven pages, persisted authenticated demo experience and Client Portal responsive/theme refinements.

Extract this archive after **Part 03A** into the same parent folder. The archive root is `buddy-fleets/...`.

## Implemented in Part 03B

### Real Client Portal
- Client Dashboard loads from `/api/company/entitlements?resource=bootstrap` instead of relying on static dashboard data.
- Fleet Pack pending companies are routed to a controlled setup-required state instead of seeing a fake Travels dashboard.
- Module visibility is driven by resolved user access.
- CRUD-capable operational pages call the server API and refresh from Supabase after mutation.

### Seven Fleet Pack dashboards
Dashboard/workspace support is present for:
- Small Travels / Transport
- Bagged Cement Transport
- General Goods Transport
- Container Transport
- Cement Bulker
- Staff Transport
- School Transport

The common shell is shared; Fleet-specific modules, KPIs, routes, labels, forms and tables change by Fleet Pack.

### Fleet-specific backend workspaces
A common live workspace supports the newer operational modules using the Part 03A persisted operational table, including examples such as:
- General Goods: consignments, load planning, delivery/POD, freight
- Container: movement, port/ICD/CFS, gate, empty return, detention
- Cement Bulker: placement, queue, loading, weighbridge, unloading, TAT
- Staff Transport: routes, shifts, rosters, vehicle/driver allocation, attendance, contracts
- School Transport: routes/stops, students, assignments, pickup/drop, attendance, attendants
- Shared modules such as trips, route planning, dispatch, ePOD, fuel, maintenance, compliance, tyres, spare parts, challans and approvals can also use the persisted operational workspace when enabled by the plan/company/user authority.

### Existing deeper workflows retained
- Travels bookings keep their dedicated backend table/action flow.
- Bagged Cement placement and dispatch keep their dedicated backend table/action flow.
- Existing vehicle, driver, party, site, expense and user management tables/actions are retained.

### Client account/security UI
- Profile editing is backend connected.
- Password change and other-session revoke are backend connected.
- Authenticator MFA status/enrollment/verification/disable uses the Part 01 `/api/auth/mfa` backend.
- Session history is loaded from the backend.

### Subscription & reports
- Subscription page consumes the live runtime subscription/plan/billing snapshot.
- Existing invoice/payment/receipt tables are read when available.
- Invoice download/print fallback is provided without inventing document storage.
- Reports use current backend portal data and respect selected-site scope.
- Excel export remains available for live report rows.

### Company Settings
- Client users cannot silently change the company Fleet Pack.
- Fleet Pack assignment remains a Developer Control Plane responsibility.
- Client settings handle display/preferences only.

### Authenticated Demo
- `/demo` is no longer a public shortcut.
- Demo requires the normal Buddy Fleets authenticated company session and a dedicated company tenant using slug `demo`.
- All seven Fleet Pack demos are selectable after login.
- Each Fleet Pack demo stores its own persisted backend snapshot in `company_portal_demo_workspaces`.
- Demo mutations survive page refresh and can be reset to the original seed.
- Risky auth/storage operations are simulated in the demo workspace instead of changing production account credentials/files.

### Responsive/theme behaviour
- Existing Buddy Fleets Client visual theme is preserved.
- Light + Dark mode supported.
- Sidebar/header/theme drawer/mobile navigation remain shared across Client and Demo.
- New operational forms/tables use the existing responsive Client Portal layout system.

## Important demo tenant requirement
The dedicated demo company must use `subdomain_slug = 'demo'`, have the demo account as its `account_owner_user_id`, and have a lifecycle that resolves to usable access. The final deployment checklist in Part 05 will include the exact demo-tenant verification steps; this archive does not hard-code credentials into source files.

## Validation performed
- JS/JSX syntax parse validation passed for the full Part 03 source set.
- Relative Client Portal imports were checked with no missing local imports.
- Demo seed generation was checked for all seven Fleet Packs.
- Recommended Fleet Pack modules were checked against the module catalog with no missing keys.

## Next
Part 04 will complete the Public Website + Auth pages, live pricing rendering/CMS alignment and the global high-resolution responsive pass while preserving the existing visual theme.
