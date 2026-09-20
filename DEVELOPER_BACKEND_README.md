# Buddy Fleets Developer CPanel — Backend Foundation

This package is intentionally **additive and security-preserving**.

## What it does

- Adds a secure Developer control-plane API guarded by the existing `requireDeveloperSession` cookie/session architecture.
- Adds persistent JSON configuration + optimistic revision control + history/rollback.
- Adds best-effort audit-log entries without changing the existing audit schema.
- Wires every dedicated scaffold leaf page under `src/pages/Developer/**/**Page.jsx` to the control-plane backend.
- Keeps the existing page titles, descriptions, card copy, layout classes, theme variables and route file paths unchanged.
- The existing Page Builder / Website Preview files are deliberately left untouched.
- Existing auth/session/company tables are deliberately left untouched.

## Important safety boundary

The new control-plane backend persists Developer CPanel configuration. It does **not** silently mutate high-risk production auth/tenant/security records merely because a conceptual page contains a button such as Suspend, Revoke, MFA, Deploy or Delete. Those operations require dedicated domain APIs with explicit validation/business rules. This avoids breaking the locked Buddy Fleets security architecture.

## Install

1. Run `supabase/developer_control_plane.sql` in Supabase SQL Editor.
2. Copy the package files into the repo, preserving paths.
3. Run:

```bash
npm run build
```

4. Deploy.

## Test

Open any dedicated Developer CPanel leaf page, e.g.:

- SaaS Platform → Companies → All Companies
- Plans & Entitlements → Plans
- Module Registry → Dependencies
- Developer Studio → Module Builder → Schemas & Fields
- Integrations → Webhooks
- Security → MFA & Locks
- System Settings → Notifications

Click **Configure**, save Status/Enabled/Internal notes, refresh the page. The saved configuration must persist.

## New backend files

- `api/developer/control-plane.js`
- `src/services/developerControlPlaneApi.js`
- `src/pages/Developer/shared/useDeveloperControlPlane.js`
- `src/pages/Developer/shared/BackendWorkspacePage.jsx`
- `supabase/developer_control_plane.sql`

`DEVELOPER_BACKEND_MANIFEST.json` lists all dedicated leaf pages wired to the backend.

## What is intentionally not changed

- `DeveloperLayout.jsx`
- Developer theme tokens / colors / typography
- `App.jsx` routing
- current auth/session architecture
- Website Page Builder backend
- public website files/content
- current sidebar structure

## Parent Developer workspace coverage

The existing `DeveloperWorkspace.jsx` is also connected without redesigning it:

- Generic **Configure** cards now persist route-scoped status/enabled/internal notes.
- Feature Flag toggles persist and survive refresh.
- Existing Page Builder backend remains unchanged.

High-risk buttons that imply production tenant/auth/session/deployment mutation are intentionally not auto-wired to generic JSON writes. They require dedicated domain validation and are left visually unchanged rather than being made deceptively destructive.
