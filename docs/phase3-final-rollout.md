# Buddy Fleets — Phase 3 final hardening (single patch)

Status: **package prepared, NOT applied to production.** This patch was prepared against read-only live Supabase metadata observed 2026-10-24. It is intentionally not deployed from this document.

## Scope

- Pin `search_path` for three already existing **SECURITY INVOKER** functions: `public.set_updated_at()`, `public.purge_old_audit_logs()`, `public.bf_normalize_subdomain_slug(text)`; preserve their signatures, bodies, ownership, privileges, and trigger bindings. `purge_old_audit_logs()` uses `public.audit_logs` via a fixed `pg_catalog, public, pg_temp` path, with `public` CREATE denied to both client roles.
- Optimize only `profiles.profile_self_read` and `company_memberships.membership_self_read` with `(SELECT auth.uid())`. Other policies remain untouched.
- No changes to the six authenticated SECURITY DEFINER authorization helpers, server credentials, existing RLS-grant matrix, rows, indexes, triggers or table columns.

## Preconditions (checked from production read-only data)

- All 75 public tables have RLS; 65/65 literal table/view references and 31/31 RPC names exist.
- Current policies: `profiles.profile_self_read` → `(id = auth.uid())`; `company_memberships.membership_self_read` → `(user_id = auth.uid())`; both `SELECT`, permissive, authenticated, without `WITH CHECK`.
- The three function bodies, executable roles and lack of pinned search paths match the migration's fail-closed checks.
- `set_updated_at()` serves 27 triggers in earlier live snapshot, none are modified here.
- `anon` and `authenticated` cannot `CREATE` in schema `public`.
- Latest already applied migration was `20261024000000_phase3_legacy_function_cleanup`.

## One local preparation pass

1. On Windows PowerShell at `D:\buddy-fleets`, sync `main` and create `fix/phase3-final-hardening`.
2. Unzip this patch, copying **only these new files** to `scripts/`, `tests/`, `docs/`.
3. Run `powershell -ExecutionPolicy Bypass -File scripts/phase3-final-prepare.ps1`.
4. Script runs **all 56 tests**, makes a timestamped migration using `npx supabase migration new`, corrects ordering if the CLI's UTC timestamp is earlier than the last existing migration, checks exact SHA256 and displays `migration list` and `db push --dry-run`. It never pushes. If any command fails, stop.
5. Dry-run must show **only one** pending `*_phase3_final_security_hardening.sql` migration. Stage the seven patch files plus the one generated migration; `git diff --cached --check`, commit, push, PR, merge only after review/checks.

## Production rollout after PR is merged

From clean updated `main` on the user's linked project:

```powershell
npx supabase migration list
npx supabase db push --dry-run
# The dry-run must list exactly the single Phase 3 final migration.
npx supabase db push
npx supabase migration list
```

Then run `scripts/phase3-final-security-verify.sql` in the Supabase SQL Editor: all boolean columns must be `true`, `preserved_update_triggers` should equal the preflight count. Run `node --test tests/*.test.mjs`, `npm run check:session`, `npm run build`. Smoke-test public signup/confirmation if a safe disposable test account exists, production login, refresh, dashboard, logout, and site-restricted access. If any verification fails, stop and inspect; do not blindly rerun deployment. Emergency rollback SQL in `scripts/phase3-final-security-rollback.sql` requires human review and follow-up migration-history reconciliation.

## Auth origin housekeeping — cannot safely auto-apply

During Preview testing the `secure-login` Edge Function's `LOGIN_ALLOWED_ORIGINS` secret was temporarily extended. **Secrets cannot be safely read back as plaintext through current connector tools.** Open Supabase Dashboard → Edge Functions → Secrets (or your secret-management source of truth) and identify the **complete existing value**. Remove only the obsolete exact Preview origin; preserve every production/staging origin still used. **Never paste a secret to chat.** Save and verify a preflight `OPTIONS` to `https://exygxszkqmefhhzfiqsn.supabase.co/functions/v1/secure-login` with an Origin header of `https://buddyfleets.in` returns 204 and the matching `Access-Control-Allow-Origin`. A retired Preview origin should return 403. If no full trusted value is available, **leave the secret unchanged** and document it as pending, rather than risk locking out production. Confirm no other login/MFA function needs the same change before modifying it.

## Findings intentionally not auto-fixed

- Six authenticated-executable `SECURITY DEFINER` RLS helpers are intentionally retained. Revoking them could break authorization and create data-availability failures.
- 62 tables with no RLS policies and 12 of those with legacy client grants were reviewed as advisor findings; absence of policy still fails closed. No blanket policies or grants are added/revoked.
- 62 unindexed foreign keys, 53 unused-index notices and 9 multiple-permissive-policy notices require measured traffic/query plans; no mass index/policy edits.
- Supabase **Free** lacks leaked-password protection (Pro+). Leave advisor warning documented. Maintain strict password rules and the already hardened app-side MFA/session design.
- Static source scanner does not check dynamic names, RPC overloads, columns or runtime behavior. Thus Phase 3 means this **defined hardening scope** is done, not a claim of zero remaining technical debt.
