# Buddy Fleets — Final Part 04B of 05

## Scope
Auth pages + signup Fleet Pack handoff + full public/auth responsive scaling while preserving the existing visual theme.

Merge after **Part 04A** into the same `buddy-fleets` folder.

## Implemented

### Signup Company / Fleet Type
The public 5-day trial signup now supports the seven canonical Fleet Packs:
- Small Travels / Transport
- Bagged Cement Transport
- General Goods Transport
- Container Transport
- Cement Bulker
- Staff Transport
- School Transport

The selector deliberately also contains **Not sure yet — choose later**.

This preserves the locked requirement:
- trial signup/activation does not fail just because Fleet Type is not selected;
- unselected companies remain `fleet_pack_selection_status = pending`;
- pending companies are never silently treated as a real Travels company.

### Backend-connected signup selection
- Selected Fleet Pack is written into secure Supabase Auth signup metadata.
- On the first normal secure company login, `secure-login` checks owner signup metadata.
- If the company is still pending and the metadata contains one of the seven allowed canonical pack keys, it calls the authoritative `bf_set_company_fleet_packs(...)` server-side function.
- The central company bootstrap is immediately re-resolved after assignment.
- Existing accounts without metadata remain pending and can still be assigned from Developer CPanel.

### Global responsive system
The existing Buddy Fleets theme is preserved. This part changes layout behavior, not the visual identity.

Applied across Website + Auth routes:
- fluid 1536 / 1920 / 2560+ content widths;
- expanded high-resolution website canvas;
- high-resolution auth grid/form sizing;
- safer mobile overflow behavior;
- image/video/canvas containment;
- existing dark/light theme, gradients, cards and animations preserved.

This specifically addresses the previous behavior where the Website/Auth UI looked like a small fixed centered canvas on high-resolution laptops/monitors.

### Auth pages covered by the shared responsive shell
- Login
- Signup
- Forgot Password / ID flow
- Confirmation
- Reset Password

No short-lived login/MFA/handoff expiry was changed to 60 minutes. The 60-minute authenticated portal session remains the Part 01/02 policy.

## Edge Function deployment
After all parts are merged, redeploy:
- `secure-login`

The other Part 01 Edge Function deployment requirements remain unchanged.

## Validation
- Signup/App/Layout JSX syntax parse passed.
- `secure-login` TypeScript has no new syntax errors; local TypeScript reports only expected Deno/npm import type-resolution errors outside the Supabase runtime.
- No credentials or `.env` files are included.

## Next
Part 05 is the final shared-shell/add-ons/advanced-module/final-integration/QA package and will contain the final deployment checklist.
