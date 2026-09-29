BUDDY FLEETS - VERCEL HOBBY 12-FUNCTION FIX

What this patch does:
- Consolidates 8 top-level Developer APIs into one /api/developer.js router.
- Keeps Website Studio API files unchanged.
- Moves original Developer handler logic to server/developerApi/ so behavior is preserved.
- Updates Developer frontend service URLs to the consolidated router.
- Adds backward-compatible Vercel rewrites for the old Developer API URLs.
- Reduces physical Vercel API function files from 19 to exactly 12.

How to apply:
1. Keep your existing project backup.
2. Extract this ZIP INTO your Buddy Fleets project root and allow Merge/Replace.
3. Open PowerShell in the project root.
4. Run:
   powershell -ExecutionPolicy Bypass -File .\APPLY_FIX.ps1
5. Run:
   npm run build
6. If build passes:
   git add .
   git commit -m "Consolidate developer APIs for Vercel Hobby limit"
   git push origin main
7. Vercel should redeploy automatically.

DO NOT change Supabase migrations, Edge Functions, or .env.local for this fix.
