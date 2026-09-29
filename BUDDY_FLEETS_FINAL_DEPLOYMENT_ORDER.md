# Buddy Fleets — Final Deployment Order

Buddy Fleets uses the existing locked server-side auth architecture. Deploy in this order so database authority exists before frontend/runtime begins calling it.

1. **Merge archives locally** in order: Part 01 → Part 02 → Part 03 → Part 04 → Part 05A → Part 05B.
2. Keep your existing local environment file/secrets. Do **not** copy secrets into the ZIPs or repository.
3. In **Supabase SQL Editor**, apply any supplied migrations that are not already installed, in filename/timestamp order. The important final add-on migration is `20260929143000_platform_addons_advanced_modules.sql`.
4. Run `scripts/buddy-final-db-verification.sql` and resolve any `FAIL` before production rollout. `REVIEW` means a business/configuration decision may still be intentionally pending.
5. In **Supabase Dashboard → Edge Functions**, update/deploy the functions supplied by Part 01 (notably `secure-login`, `secure-mfa`, and `consume-handoff`). Keep existing required environment secrets.
6. Build the merged app locally: `npm install` (if dependencies are not already installed) and `npm run build`.
7. Run `node scripts/buddy-final-check.mjs` from the project root.
8. Push/deploy the merged project to the existing Vercel/Git workflow.
9. Verify public website + auth first, then Developer portal, then a real Company portal account, then Demo.
10. From Developer Dashboard, open **Security & System → Infrastructure → Service Health**. All core probes should be healthy; if only the Part 05 add-on probe fails, the Part 05A SQL migration has not been applied.
11. Verify Live Pricing 1/3/6/12 month values from Developer Dashboard and confirm the public Pricing page reads the same published values.
12. Test MFA enrollment/verification/disable, password recovery, 60-minute authenticated session behavior, Fleet Pack pending/selected behavior and dynamic navigation.
13. Only after smoke tests pass, enable optional beta feature flags/modules deliberately.

## Do not change
- `__Host-bf_session` security properties.
- `company_id` tenant authority.
- Host-only portal separation.
- Browser prohibition on service-role access.
- Trial effective plan = Apex decision (usage limits remain a later commercial decision).
