# Buddy Fleets — Phase 4 single release: performance, reliability and monitoring

Status: **patch ready, NOT deployed**. No SQL migration, Supabase secrets, database permissions or authentication checks changed.

## Verified starting point (read-only)

- 2026-10-24 live Supabase: 75 public tables with RLS on; final Phase 3 migration `20261024000001` applied.
- Performance advisor: 62 missing-FK-index INFO notices, 53 unused-index INFO notices and 9 multiple permissive policy WARN notices. Session-related tables were small (roughly 13 estimated rows in security sessions and auth handoffs); avoid bulk index creation without production workload query plans.
- Existing developer health endpoint counted entire tables and fetched unbounded fleet packs/module catalog. It returned `ok:true` even when some DB probes failed. Existing developer service page already renders `status`/`checks`.
- Public pricing endpoint already has CDN cache headers; untouched. Existing Vite route-level code splitting remains untouched.

## Changes in one Git PR

1. `/api/health`: PUBLIC liveness endpoint, GET/HEAD only, no credentials, no database query; never infer DB health from a 200 here.
2. `server/developerApi/health.js` and `server/developerApi/healthProbe.js`: retains `requireDeveloperSession` and `no-store` security headers; replaces full-table count/fetch probes with an 11-dependency 1-row reachability check, 6-second abort per query. Empty tables count as healthy; partial failures are marked `degraded` and `ok:false`; all failures yield HTTP 503. Raw database error messages and data are never returned.
3. `src/services/developerHealthApi.js`: 12-second browser timeout and errors represented as `REQUEST_TIMEOUT` or `NETWORK_ERROR`, sanitized result shape; preserves existing component API.
4. `.github/workflows/phase4-uptime.yml`: runs every ~30 minutes and manually; checks public liveness with no secret. GitHub scheduled workflows may start late, be disabled on inactive repos, or not emit alerts unless repository notification settings are configured. Check the Actions tab and enable notifications for workflow failures separately. This does not monitor Supabase DB health or authenticate to the developer portal.
5. `scripts/phase4-build-budget.mjs`: post-build gzip asset size report; warnings at 350 KiB largest JS and 200 KiB HTML. Advisory limits are not site-speed scores; do not delete working chunks to meet them.
6. `scripts/phase4-live-readonly-audit.sql`: DBA review of stats, indexes and sizes; no migration.

## One-branch preparation (Windows PowerShell)

```powershell
git switch main
git pull --ff-only origin main
git switch -c fix/phase4-one-release
# Extract ZIP: copy only modified/new files using original folder paths.
node --test tests/phase4-reliability.test.mjs
node --test tests/phase1-security.test.mjs tests/phase2-auth-hardening.test.mjs tests/phase3-alignment.test.mjs tests/phase3-part2-legacy-functions.test.mjs tests/phase3-part3-schema-contract.test.mjs tests/phase3-final-hardening.test.mjs
npm run check:session
npm run build
node scripts/phase4-build-budget.mjs
git diff --check
git status
```

Review EXACTLY the files supplied in the ZIP. If tests or build fail, don't push.

```powershell
git add api/health.js server/developerApi/health.js src/services/developerHealthApi.js .github/workflows/phase4-uptime.yml scripts/phase4-build-budget.mjs scripts/phase4-live-readonly-audit.sql tests/phase4-reliability.test.mjs docs/phase4-single-release-rollout.md server/developerApi/healthProbe.js
git diff --cached --check
git diff --cached --stat
git commit -m "feat: phase4 reliability and production uptime monitoring"
git push -u origin fix/phase4-one-release
```

Open a PR against `main`, review 9 files, checks and GitHub Actions permission. Merge; Vercel deploy should be Ready. There is **no `supabase db push`** in Phase 4. Rollback: revert only this merge/commit and redeploy Vercel; no DB rollback required.

## Post-deploy smoke tests (no real user data changes)

```powershell
# PowerShell built-in response check; use status and JSON result, not website HTML.
Invoke-RestMethod -Uri 'https://buddyfleets.in/api/health' -Method Get
# Expect ok=True, status=up, service=buddy-fleets.
```

- Login to `https://developer.buddyfleets.in` with normal authorized developer account and open Service Health, click Refresh. Healthy checks should show 11/11 or expose any broken dependency; check no credentials or data leaked to the browser.
- Check existing fleet/portal dashboards, public pricing, login, refresh, logout.
- In GitHub Actions: `Buddy Fleets Production Liveness` → `Run workflow`. It must pass. Check repository notification preferences; scheduled execution depends on GitHub runner availability.
- Run read-only SQL from `scripts/phase4-live-readonly-audit.sql` only if further DBA index review is planned.

## Known limitations and pending housekeeping

- Public liveness does NOT confirm Supabase availability; developer health remains authenticated. For incident paging, configure an external uptime provider or separate credential-protected monitoring workflow; this patch does not send SMS/email.
- No mass FK indexes. Re-evaluate index priorities when production data and query plans justify them.
- The temporary Preview origin in Supabase `LOGIN_ALLOWED_ORIGINS` is still pending trusted full-value review. Do **not** blindly overwrite the secret. Keep valid production origins.
- This phase intentionally makes no auth/session changes. Phase 4 is complete after PR, production checks, and first GitHub Actions monitor run succeed.
