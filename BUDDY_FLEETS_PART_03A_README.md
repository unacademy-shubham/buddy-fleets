# Buddy Fleets — Final Part 03A

## Scope
Client Portal runtime/backend foundation, tenant-safe permissions, live operational persistence and the shared dynamic portal shell/configuration used by all seven Fleet Packs.

Extract this archive into the **same parent folder** used for Parts 01 and 02. The archive root is `buddy-fleets/...`; allow Windows to merge/replace matching files.

## Prerequisite
Merge **Part 01** and **Part 02** first.

## Implemented in Part 03A

### Runtime access authority
- Client Portal bootstrap uses the central Supabase access/navigation resolvers from Part 01.
- Company lifecycle, effective plan, Fleet Pack, role, user override, site scope and action permissions remain server authoritative.
- `fleet_pack_selection_status = pending` is treated as **no real Fleet Pack selected**. The compatibility `travels` database default cannot leak into the runtime as a fake Travels company.
- Read-only lifecycle access is preserved server-side; UI hiding is not treated as security.

### Client Portal API
- `/api/company/entitlements` now supports the live portal bootstrap and authenticated demo bootstrap/action paths.
- All writes go through the company session and server/service-role layer.
- Browser clients never receive service-role authority.

### Operational persistence for all Fleet Packs
New server-controlled tables are introduced through:

`supabase/migrations/20260929093000_client_operational_runtime.sql`

- `company_portal_operational_records`
- `company_portal_demo_workspaces`

The operational record surface is intentionally generic for newer modules whose deep workflow/table design will be expanded later. It provides real tenant/site/module-scoped persistence today instead of dead or browser-only pages.

### Server actions
The Client Portal service supports backend actions for:
- Sites / branches
- Vehicles
- Drivers
- Parties / customers
- Expenses
- Travels bookings
- Bagged Cement placement and dispatch
- Generic module operational records (create/edit/archive)
- Company portal preferences
- Personal profile
- Company users and module/action/site access
- User block/unblock/disable/session revoke
- Admin password reset
- User password change
- Other-session revoke
- Allowed profile/driver photo upload
- GST lookup integration hook

### Seven Fleet Packs
Canonical packs remain:
- `travels`
- `bagged_cement`
- `general_transport`
- `container`
- `cement_bulker`
- `staff_transport`
- `school_transport`

### Operational module schemas
Part 03A provides form/status definitions for shared modules plus Travels, Bagged Cement, General Goods, Container, Cement Bulker, Staff Transport and School Transport modules. These feed the generic live operational workspace in Part 03B.

### Common Client shell
- Developer-style multi-level sidebar behaviour
- DB/runtime navigation support with richer local hierarchy fallback until Navigation Builder data contains deeper submenu/level-3 nodes
- Light + Dark theme
- Theme customization
- Global module search
- Site selector
- Session timer aligned to the 60-minute authenticated session
- Profile / Subscription / Company Settings links
- Read-only lifecycle banner
- Responsive mobile sidebar/header behaviour

## Security
- New runtime tables have RLS enabled.
- `PUBLIC`, `anon`, and `authenticated` table grants are revoked.
- `service_role` is the server-side authority.
- Site scope and action permission are checked again on server mutations.
- Company tenant ID comes from the authenticated HttpOnly session, never from an arbitrary browser-supplied tenant ID.

## Database step
After all parts are merged, run the new Part 03A migration in Supabase SQL Editor (or your normal migration process) **once** before testing live Client/Demo operational writes.

## Validation performed
- TypeScript compiler parse validation passed for the Part 03A/03B JS/JSX source set using JSX-preserve syntax checking.
- Relative imports in the Client Portal source set were checked and no missing local import was found.
- Canonical Fleet Pack recommended modules were checked against the Client module catalog; all seven packs resolve without missing module keys.
- The local extracted dependency install does not contain the Vite executable, so a real production `vite build` is intentionally deferred until all parts are merged on the normal project install.

## Next archive
Merge **Part 03B** immediately after this archive. Part 03B contains the actual Client/Demo pages, all seven Fleet Pack workspaces and persisted demo UI.
