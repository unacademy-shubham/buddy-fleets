# Buddy Fleets — Phase 5 / Single-release frontend performance optimization

## Scope

A single safe release containing **9 files** (6 modified source files, 2 new checks, this rollout document). No changes to API entrypoints, `vercel.json`, database migrations, authentication, session authority, RLS, pricing, or dependencies.

Changes:
1. **Cacheable global CSS**: production stylesheet is no longer duplicated inside every HTML response. Vite emits a fingerprinted linked stylesheet; `cssCodeSplit: false` keeps the current one-stylesheet cascade. Tiny first-paint background/theme fallback prevents a white flash before CSS loads.
2. **Actual portal route lazy loading**: the Company and Demo portals import each module screen only when navigated to. Access checks and routing conditions are preserved; an in-shell fallback appears while each chunk downloads.
3. **On-demand Excel export**: Reports and Audit Activity load `xlsx` only when the user clicks the export action (the Developer Company360 on-demand XLSX path is untouched). Existing column mappings, sheet names, file names, and permission-driven data filters are preserved.
4. **Post-build performance gate**: checks actual `dist/index.html` bytes, linked production stylesheet, presence of emitted CSS assets, absence of the old whole-CSS inline payload, and reports JS gzip size. The HTML/CSS gate fails closed; large JS warnings are advisory.

## Baseline captured before Phase 5

From the user's previous *Phase 4 production build* output:

| Asset / metric | Prior baseline |
| --- | ---: |
| `dist/index.html` raw | 275,354 bytes |
| `dist/index.html` gzip from Vite | about 37.9 kB |
| generated global CSS | 271,489 bytes |
| largest JS chunk (`ComingSoonPage`) raw | 855,593 bytes |
| largest JS chunk gzip | 208,034 bytes (independent gzip report) |
| Excel library chunk raw | 492,090 bytes |
| Vercel API function count | 12 |

**Important:** Large `ComingSoonPage` chunk's label was assigned by the bundler; the page source itself is under 1 kB, so interpreting 855 kB as its source size is incorrect. Lazy loading reduces what a visitor needs to download for a single portal route; total distributable JS or any particular chunk name/size can vary. Measure real build output and network waterfall before drawing conclusions about savings. `xlsx` still exists as a downloadable chunk for users who export/import files, but is no longer a dependency for normal report viewing.

## Local preparation (PowerShell in `D:\buddy-fleets`)

```powershell
cd D:\buddy-fleets
git switch main
git pull --ff-only origin main
git status
git switch -c perf/phase5-one-release
```

Extract the delivered ZIP to the project root, preserving directory names. **Do not delete or replace other files.** Then:

```powershell
node --test tests/*.test.mjs
npm run check:session
npm run build
node scripts/phase5-build-verify.mjs
(Get-ChildItem api -Recurse -Filter '*.js' -File).Count
git diff --check
git status
```

Expected: **76/76 Node tests PASS** (assuming exactly the prior 68 tests plus these 8); session checks PASS; Vite build PASS; Phase 5 build verify reports `errors: []` and PASS; `api` JS count **12**. If the HTML/CSS build gate fails, **stop** — no deploy. Existing Vite chunk size warnings are separate from the strict HTML/CSS gate.

A CSS request will now happen on a fresh visit: this is intentional and enables browser caching. Visually check dark/light themes and FOUC.

## Commit + PR

```powershell
git add vite.config.js index.html src/clientPortal/ClientPortalApp.jsx src/clientPortal/DemoPortalApp.jsx src/clientPortal/pages/ReportsPage.jsx src/clientPortal/pages/AuditActivityPage.jsx scripts/phase5-build-verify.mjs tests/phase5-performance.test.mjs docs/phase5-one-release-rollout.md
git diff --cached --check
git diff --cached --stat
git commit -m "perf: phase5 cacheable CSS and portal route splitting"
git push -u origin perf/phase5-one-release
```

Review exactly **9 files** in the PR; do not merge if the build gate or routes fail. Merge to main, then verify Vercel Production **Ready** on the merged commit.

## Production smoke checks

1. Open `https://buddyfleets.in/` in a fresh/incognito session and verify styling, hero, navbar, navigation, and dark/light theme switching (including reload with theme saved).
2. Check browser DevTools Network: `index.html` loads a distinct `assets/*.css` file; CSS request is HTTP 200; fresh and repeat navigations preserve appearance without a white flash. Inspect `dist/index.html` locally: must be below 32 KiB.
3. Login/logout on production as done in Phases 2–4. Company portal: dashboard -> Reports -> Export Excel, Audit Activity -> Export Excel (with populated rows); verify original column formatting and downloads. Demo portal dashboard and additional modules also work.
4. Developer portal Dashboard/Company360 import/export flow and Service Health remain functional. Observe Network: XLSX should not load when merely opening Reports or Audit Activity; should load when clicking Export. If Company360 is visited, it may load XLSX as designed.
5. Confirm `https://buddyfleets.in/api/health` has `ok=true`; public `/api/public/pricing-plans` is HTTP 200; Vercel Hobby function deployment count remains <= 12; the existing GitHub uptime check remains green.

## Rollback

This release has **no database/schema changes**. If a broken route, missing CSS, theme flash, Excel export, or authentication regression is observed:

1. In GitHub, **Revert** the Phase 5 PR merge commit, create the revert PR, merge it into `main`.
2. Wait for Vercel Production to show **Ready** for the revert deployment.
3. Recheck home styling, login/logout, report export, company portal, `/api/health` and pricing.

For immediate mitigation, Vercel **Redeploy** a prior known-good production deployment if your Vercel plan/environment supports that and configuration remains unchanged; follow with the Git revert for source of truth. No `supabase db push`, rollback SQL, secret changes, or API function deployment is necessary.

## Deferred optimization work (not hidden inside this PR)

Any remaining 200+ KiB compressed JS chunks, Excel library import delays, or live Core Web Vitals bottlenecks should be evaluated using route-specific Chrome Network/Lighthouse measurements after this change. Do not attempt risky manual chunk assignments without profiling and tested rollbacks. This release does not claim particular Lighthouse scores until measured on a deployed site.
