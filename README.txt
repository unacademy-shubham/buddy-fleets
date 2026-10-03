Buddy Fleets — MFA + Universal Session Control

Run all commands from D:\buddy-fleets.

1) Apply MFA current-session token fix + challengeId fix:
   powershell -ExecutionPolicy Bypass -File .\patch-mfa-session.ps1

2) Apply universal inactivity session control:
   powershell -ExecutionPolicy Bypass -File .\patch-session-system.ps1

3) Build:
   npm run build

4) If build succeeds, inspect:
   git status

5) Then commit/push the modified project files.

Behavior:
- MFA enable/disable keeps the current session alive.
- Enable/disable uses in-app UI; no browser prompt.
- MFA enable refreshes/persists the current AAL2 Supabase session.
- MFA disable refreshes/persists the current AAL1 session.
- Default inactivity timeout is 30 minutes.
- User activity resets the visible countdown.
- Activity is throttled before server touch to avoid excessive requests.
- Session timer opens 30 / 60 / 90 minute extension choices.
- Selected extension becomes the current inactivity window.
- Extension shows a confirmation toast.
- Inactivity shows a full-screen expired-session lock with Login again.
- Manual logout behavior remains unchanged.
- Existing server files are preserved; scripts create backups before modifying them.
