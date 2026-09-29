# Buddy Fleets — Final QA Checklist

## Public website / responsiveness
- Home, Features, Pricing, About, Contact and CMS-rendered pages render correctly at mobile, tablet, 1366, 1440, 1920, 2560 and ultrawide widths.
- Existing visual theme is preserved; content is fluid instead of looking like a tiny fixed centered canvas on high-resolution displays.
- Pricing displays the Developer Dashboard published 1/3/6/12 month values.

## Auth / security
- Login works for Developer and Company portals using the existing server cookie flow.
- Company/Fleet Pack pending account does not get a fake Travels dashboard.
- MFA: enroll → verify → login challenge → recovery/disable path works.
- Password reset flow still works.
- New login invalidates the previous Buddy Fleets session where the existing single-session policy requires it.
- Authenticated portal session target is 60 minutes; short login-flow/handoff expiries remain short.

## Developer Dashboard
- Light/Dark and existing theme customization work.
- Session countdown/header/profile menu are functional.
- Global Search finds companies/modules/Fleet Packs/plans and navigates correctly.
- Company 360 shows provisioning health, Fleet Pack assignment, modules and employee/security controls.
- Live Pricing saves and republishes 1/3/6/12 month values.
- Platform Tools supports feature flags, maintenance policy, widget presets, export queue and read-only View-as-Company/Access Simulator.
- Service Health returns live server probes.

## Client / Demo
- Each configured company uses its authoritative selected Fleet Pack.
- Seven Fleet Pack dashboard families are available through the normalized registry.
- Sidebar/navigation respects Plan → Fleet → Company Override → Role → User Override → Site Scope.
- Read-only lifecycle disables mutation actions while keeping allowed view/print/export behavior.
- Demo requires login and is not exposed as a direct bypass.

## Backend / database
- Run `scripts/buddy-final-db-verification.sql`.
- RLS remains enabled on control-plane tables.
- `anon` / `authenticated` cannot execute server-only bootstrap resolver.
- No `fleet_pack_key` compatibility column was reintroduced.
- Advanced Part 05 modules remain beta/blocked until deliberately promoted.

## Release hygiene
- `.env.local` and secrets are not committed/uploaded.
- No dead button should claim success without a backend action.
- Any foundation-only module should stay beta/inactive/blocked instead of appearing as a fake complete workflow.
