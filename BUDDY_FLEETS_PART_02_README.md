# Buddy Fleets — Final Part 02 of 05

## Scope
Developer Dashboard / Control Plane / Live Pricing / Company 360.

This archive is designed to be extracted into the same parent folder as Part 01. It uses the same `buddy-fleets/...` root, so Windows can merge/replace matching files directly.

## Prerequisite
Merge **Part 01** first. Part 02 depends on the server-side runtime access/MFA/session foundation and the Supabase resolver functions introduced/verified there.

## Implemented in Part 02

### Developer Control Plane
- Live Fleet Pack Registry for all seven canonical Fleet Packs.
- Fleet Pack ↔ Module mapping editor.
- Plan × Fleet Pack × Module entitlement matrix (`full`, `read_only`, `blocked`).
- Live Module Registry editor.
- Live Navigation Builder for Category → Menu → Submenu → Level-3 nodes.
- Company-specific module overrides.
- Company provisioning / Fleet Pack assignment controls.
- Server-only Developer APIs protected by the existing developer session architecture.

### Company Creation / Provisioning
- Company creation can now select the canonical Company / Fleet Type.
- Supports primary Fleet Pack plus enabled Fleet Packs.
- If Fleet Type is not known, it can remain unselected; the company remains `fleet_pack_selection_status = pending` instead of being treated as a real Travels company.
- Existing companies can explicitly assign/change their Fleet Pack through the authoritative `bf_set_company_fleet_packs(...)` flow.
- Commercial subscription `plan_key` is written during company creation when a plan is selected.

### Company 360
- Runtime subscription/access context from the central database resolver.
- Effective plan, lifecycle state and lifecycle access visibility.
- Fleet Pack selection status and enabled packs.
- Provisioning Health checks.
- Company-specific module access overrides.
- Owner resolved-access visibility.
- Fleet & Access tab for correcting/assigning company configuration.

### Live Pricing
- Dedicated Developer Dashboard page for **1 / 3 / 6 / 12 month** prices.
- Reads/writes the existing `developer_plans.prices` source of truth.
- `Save & Publish Live` updates the live backend value.
- Pricing Preview before publishing.
- Pricing History from `developer_saas_history`.
- The public pricing API from Part 01 reads the same database values. Public website rendering is connected during Part 04.

### Developer Account / Profile / Security
- Profile dropdown items are no longer dead buttons.
- My Profile.
- My Security.
- My Sessions.
- Notifications entry point.
- Preferences entry point.
- MFA enrollment/status/disable UI connected to the Part 01 `/api/auth/mfa` backend.
- Active session list and session revocation controls.

### Session UX
- Developer Dashboard header includes a live authenticated session countdown.
- Frontend inactivity timeout aligned to **60 minutes**.
- Short-lived login/MFA/handoff security windows are not changed to 60 minutes.

### Developer Sidebar
Added/connected entries for:
- Companies → Provisioning & Onboarding.
- Fleet Packs → Registry / Module Mapping / Navigation Builder.
- Plans & Entitlements → Plans / Live Pricing / Plan × Fleet Matrix / Limits & Access / Renewal Policy.

## Canonical Fleet Pack keys
- `travels`
- `bagged_cement`
- `general_transport`
- `container`
- `cement_bulker`
- `staff_transport`
- `school_transport`

## Security
- No `.env.local`, service-role secret, repository metadata or local deployment data is included in this part archive.
- Control-plane writes remain behind the existing Developer server session.
- Browser clients do not receive service-role authority.

## Validation performed
- Node syntax checks passed for the changed Developer APIs/services.
- JSX syntax/transpile validation passed for the modified/new Developer pages, layout and routes.
- Relative imports for the Part 02 React changes were checked for missing local files.
- A full Vite production build could not be executed in the packaging environment because the extracted dependency installation does not expose the local `vite` executable. This is not treated as a successful production build; run the normal project install/build after all five parts are merged.

## Deployment recommendation
Do **not** deploy after every part. Merge Parts 01 → 05 into the same project first, then run the final install/build/test/deployment checklist from Part 05.

## Next
Part 03 covers the Client + Demo Portal, all seven Fleet Packs, and deeper operational backend connection.
