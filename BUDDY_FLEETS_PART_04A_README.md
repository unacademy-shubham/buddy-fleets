# Buddy Fleets — Final Part 04A of 05

## Scope
Public Website + Website Studio CMS runtime + live pricing alignment.

Merge after Part 03B. Extract into the same parent directory; the archive uses the same `buddy-fleets/...` root.

## Implemented

### Website Studio existing-page migration fix
- Added the missing `/api/developer/website/migrate-existing` handler that the existing Page Builder already expected.
- System pages with an empty draft can now be populated from `server/website/defaultPageContent.js` without manually recreating the page content.
- Existing non-empty drafts are never overwritten by this migration helper.

### Draft → Preview → Publish runtime
- Page Builder keeps the existing working Preview behavior.
- Added **Publish live** for a saved draft.
- Added server-side publish/rollback/history support to the existing Website draft API.
- Added a transactional Supabase migration with `publish_website_page(...)` and `rollback_website_page(...)` RPCs.
- Published content remains service-role/server controlled; browser roles do not receive direct CMS table authority.

### Public CMS delivery
- Added `/api/public/website-page` as a public-safe read endpoint for published versions only.
- Existing system routes can render the published CMS version when one exists and automatically fall back to the handcrafted page when no published CMS version exists.
- New Website Studio pages can be served on their published custom URL instead of the old wildcard redirect.
- Unpublished/unknown custom URLs receive a controlled Buddy Fleets 404 state.

### Live pricing in CMS
- CMS Pricing blocks load the same `/api/public/pricing-plans` source used by the live Pricing page.
- 1 / 3 / 6 / 12 month values therefore remain controlled by Developer Dashboard pricing rather than copied CMS numbers.
- CMS text/features remain a resilient fallback if the pricing service is temporarily unavailable.

### CMS Contact block
- Published CMS Contact sections keep a real enquiry form.
- Enquiries continue through the existing `contact-enquiry` Edge Function.
- Contact-person cards continue to read the existing `contact_people` database source.

## Database step
Run after all ZIP parts are merged:

`supabase/migrations/20260929101500_website_cms_publish_runtime.sql`

This migration does not recreate the existing Website CMS tables. It only adds the publish/rollback RPC layer around the deployed `website_pages`, `website_page_versions`, and `website_releases` schema.

## Validation
- Node syntax validation passed for the new/changed Vercel JavaScript handlers.
- JSX parse validation passed through TypeScript's JSX-preserve parser for the Part 04A React files.
- No environment secrets are included.

## Next
Merge **Part 04B** immediately after this archive. Part 04B contains Company/Fleet Type signup handoff and the global Website/Auth high-resolution responsive pass.
