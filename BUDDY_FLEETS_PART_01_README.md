# Buddy Fleets Final Build — Part 01 of 05

## Scope
Core runtime/backend alignment only. This part is intentionally merge-safe with the remaining four parts.

Included changes:
- Company login now uses the central DB access/bootstrap resolver.
- MFA verification revalidates company access before issuing a portal handoff.
- Legacy `consume-handoff` company authorization is aligned with the same resolver.
- Server callback and session reconstruction use the normalized subscription / fleet-pack / lifecycle context.
- Authenticated portal session lifetime is 60 minutes; short login-flow/handoff lifetimes remain unchanged.
- Company API entitlement response can resolve user-specific access/navigation.
- Company portal server session guard checks central bootstrap and supports explicit activity-touch via `X-BF-User-Activity: 1`.
- New `/api/auth/mfa` backend supports authenticator status, enrollment, enrollment verification and secure disable with forced re-login.
- Public pricing endpoint exposes live 1/3/6/12-month price options from `developer_plans.prices`.
- Runtime DB alignment migration added for `subscriptions.plan_key`, Fleet Pack selection state and resolver grants.

## Existing live DB prerequisite
The 2026-09-29 Buddy Fleets database foundation/resolver functions were already installed in Supabase SQL Editor. Run the included migration only as an idempotent alignment/verification migration.

## Merge instructions
Extract this ZIP in the directory that already contains the `buddy-fleets` folder and allow matching files to be replaced/merged.

Do not delete unrelated project files. Parts 02-05 will add/replace the remaining frontend/control-plane/client/website files.

## Deploy later (after all 5 parts are merged)
- Supabase Edge Functions: `secure-login`, `secure-mfa`, `consume-handoff`
- Vercel app/API deployment
- SQL migration: `supabase/migrations/20260929073000_runtime_access_alignment.sql`

## Required environment names
No secrets are included in this package. Existing values remain in your deployment environment.

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- AUTH_FLOW_ENCRYPTION_KEY
- SUPABASE_ANON_KEY (optional server-side; MFA API can fall back to service role for client initialization)

