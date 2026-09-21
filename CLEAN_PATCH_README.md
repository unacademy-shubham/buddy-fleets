# Buddy Fleets — Clean Company 360° Patch

This patch is intentionally scoped to the Company 360° architecture only.

## Base assumption
Apply this on the Buddy Fleets project after the existing Developer Control Plane + Phase 2 SaaS backend are already present.

## Included
- Live All Companies data and View More → Company 360 route
- Automatic server-side `BUDDYxxxx` company code generation
- Company creation with account-owner email/password
- Suspend + restore lifecycle handling
- Full Company 360 page with wrapped horizontal tabs
- Company profile, subscription, billing/payments, invoices, employee access, KYC index, limits, modules, overrides, portal configuration, communications, security, activity foundation and support notes
- Employee creation, role assignment, password reset, block/unblock
- Invoice/payment/receipt persistence foundation
- Print Company 360 report
- Excel Company 360 export
- Company-wide employee announcement popup + acknowledgement
- Company entitlement resolver and company-facing entitlement API
- Additive Supabase migrations required by Company 360

## Explicitly NOT included / NOT overwritten
- `src/pages/Website/Home.jsx`
- `src/pages/Website/Features.jsx`
- `src/pages/Website/Pricing.jsx`
- `src/pages/Website/AboutUs.jsx`
- `src/pages/Website/ContactUs.jsx`
- `src/layouts/WebsiteLayout.jsx`
- Website Studio / CMS files
- public website images/assets
- Vite/Vercel/package configuration

The public Buddy Fleets website visual files are therefore untouched by this patch.

## Apply
Extract this ZIP into the project root and replace only matching files, then run:

```powershell
npx supabase db push
npm run build
git status
git diff --check
```

Do not commit `.env.local`.
