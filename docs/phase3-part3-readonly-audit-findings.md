# Buddy Fleets — Phase 3 Part 3 live schema review

Audited on 2026-10-24 against Supabase project `exygxszkqmefhhzfiqsn` with read-only catalog queries and database advisors. Source scan used the previously uploaded Buddy Fleets source plus Phase 1, 2 and 3 patches available in this conversation. Re-run on the current local `main` branch for confirmation of any subsequent code changes.

## Established findings

| Check | Verified result | Interpretation |
| --- | --- | --- |
| Public tables with RLS | 75/75 | RLS protection is enabled; policy details still determine visibility. |
| Static runtime `.from()` names | 65/65 exist | No missing relation/view by literal name. |
| Static runtime `.rpc()` names | 31/31 exist | No missing RPC by name; overload signatures and input/output contracts NOT checked. |
| Public tables without RLS policies | 62 | Many may intentionally be server-only; don't add permissive policies to clear a warning. |
| No-policy tables with anon/authenticated table grants | 12 | RLS still denies row access; assess unused grants before removing them. |
| No-policy tables without those grants | 50 | Consistent with service-only access pattern. |
| Source API auth triggers | `on_auth_user_created`, `on_auth_email_confirmed`, user-security trigger present | These are active and should not be confused with the retired `handle_new_signup()` function. |
| Removed legacy functions | 3 absent | Phase 3 Part 2 cleanup confirmed. |
| `set_updated_at()` | Present | Preserve; referenced by 27 triggers at prior check. |
| Developer plan pricing | All four plans use 1/6/12-month prices | Pricing checker aligned in Part 1. |
| Exposed public developer health view | No client SELECT grant | Current view is service-only despite not being `security_invoker`. |

## Current advisor findings to triage

- Security: 3 functions with mutable `search_path`: `purge_old_audit_logs()`, `set_updated_at()`, `bf_normalize_subdomain_slug(text)`. No schema changes applied. Setting an explicit search path may be a low-risk separate migration but requires dependency and behavior review.
- Security: 6 authenticated-callable `SECURITY DEFINER` functions. These are existing permission/RLS helpers. Do **not** blanket-revoke EXECUTE: Phase 1 deliberately preserved helper access.
- Security: Supabase leaked-password protection warning; check Auth dashboard features and plan availability.
- Security info: 62 RLS/no-policy tables; intentional service-only design is plausible for the majority.
- Performance: 62 foreign keys without covering indexes; prioritize by query plans, table size and traffic. Avoid bulk creation of 62 indexes without cost assessment.
- Performance: 2 policy `auth_rls_initplan` advisories (`profiles.profile_self_read`, `company_memberships.membership_self_read`). Later optimize with exact semantics preserved.
- Performance: 9 multiple-permissive-policy notices; these may be necessary for member vs superadmin access. Do not collapse them blindly.
- Performance info: 53 unused-index findings; a low-usage database or recently reset statistics can produce false positives. Do not mass-drop indexes.

## Known limitation and safety

The source scanner sees only literal `.from('name')` and `.rpc('name')` calls, not dynamically constructed names, RPC argument compatibility, custom SQL strings or individual columns. The live queries access metadata and aggregate counts only; no user records were retrieved.

The Phase 2 temporary Vercel Preview origin may still be present in `LOGIN_ALLOWED_ORIGINS`. That Edge Function environment variable is not read back as plaintext by the tools used here. Do **not** overwrite the value until all existing legitimate origins are accounted for. To remove the Preview origin, preserve every existing production origin, then re-test the production origin (204) and Preview origin (403) using OPTIONS preflight. Leave service-role keys and login-function code unchanged.

No production schema, role, environment secret or data was modified during this audit.

## Local usage

1. Copy the new `scripts`, `tests` and `docs` files to the corresponding repository folders.
2. Run `node --test tests/phase3-part3-schema-contract.test.mjs`.
3. Run `node scripts/phase3-part3-source-schema-contract.mjs --sql | Set-Clipboard` and paste that generated SELECT into Supabase SQL Editor.
4. Paste `scripts/phase3-part3-live-readonly-audit.sql` into Supabase SQL Editor (read-only) to re-check grants, triggers and price invariants.
5. Do not create or execute a database migration based on advisory warnings alone.
