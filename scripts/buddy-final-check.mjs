import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'api/auth/callback.js',
  'api/auth/session.js',
  'api/auth/mfa.js',
  'api/company/entitlements.js',
  'api/developer/platform-registry.js',
  'api/developer/finalization.js',
  'api/developer/health.js',
  'src/pages/Developer/Entitlements/PricingManagementPage.jsx',
  'src/pages/Developer/FeatureFlags.jsx',
  'src/pages/Developer/Infrastructure/ServiceHealthPage.jsx',
  'src/services/developerFinalizationApi.js',
  'src/services/developerHealthApi.js',
  'supabase/functions/secure-login/index.ts',
  'supabase/functions/secure-mfa/index.ts',
  'supabase/migrations/20260929073000_runtime_access_alignment.sql',
  'supabase/migrations/20260929143000_platform_addons_advanced_modules.sql',
];

const failures = [];
const warnings = [];

function read(rel) {
  try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return ''; }
}

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`);
}

const callback = read('api/auth/callback.js');
const session = read('api/auth/session.js');
const platformTools = read('src/pages/Developer/FeatureFlags.jsx');
const pricing = read('src/pages/Developer/Entitlements/PricingManagementPage.jsx');
const finalization = read('api/developer/finalization.js');

if (callback && !/(60\s*\*\s*60|3600)/i.test(callback)) warnings.push('Auth callback: could not detect the 60-minute authenticated session marker.');
if (session && !(session.includes('http_session_expires_at') && session.includes('last_seen_at'))) warnings.push('Auth session API: expiry/activity authority markers were not detected.');
if (platformTools && !platformTools.includes('searchDeveloperPlatform')) failures.push('Developer global search is not wired to the backend search API.');
if (pricing && !['1','3','6','12'].every((p) => pricing.includes(`'${p}'`) || pricing.includes(`\"${p}\"`))) warnings.push('Live Pricing page: could not detect all 1/3/6/12 month period keys.');
if (finalization && !finalization.includes('bf_resolve_company_portal_bootstrap')) failures.push('Read-only company preview is not using the central runtime bootstrap resolver.');

const sensitive = ['.env', '.env.local', 'service-role-key.txt', 'supabase-service-role.txt'];
for (const name of sensitive) {
  if (fs.existsSync(path.join(root, name))) warnings.push(`Sensitive local file exists in project root; do not include it in deployment archives: ${name}`);
}

console.log('\nBuddy Fleets final integration check');
console.log('====================================');
console.log(`Required files checked: ${required.length}`);
for (const warning of warnings) console.log(`WARN  ${warning}`);
for (const failure of failures) console.log(`FAIL  ${failure}`);
if (!failures.length) console.log('PASS  Critical Part 01–05 integration markers are present.');
console.log('');

process.exitCode = failures.length ? 1 : 0;
