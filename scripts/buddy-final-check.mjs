import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'api/auth/callback.js',
  'api/auth/session.js',
  'api/auth/mfa.js',
  'api/company/entitlements.js',
  'api/developer.js',
  'server/developerApi/platform-registry.js',
  'server/developerApi/finalization.js',
  'server/developerApi/health.js',
  'src/pages/Developer/Entitlements/PricingManagementPage.jsx',
  'src/pages/Developer/FeatureFlags.jsx',
  'src/pages/Developer/Infrastructure/ServiceHealthPage.jsx',
  'src/services/developerFinalizationApi.js',
  'src/services/developerHealthApi.js',
  'server/auth/sessionPolicy.js',
  'supabase/functions/secure-login/index.ts',
  'supabase/functions/secure-mfa/index.ts',
  'supabase/migrations/20260929073000_runtime_access_alignment.sql',
  'supabase/migrations/20260929143000_platform_addons_advanced_modules.sql',
  'supabase/migrations/20261006010000_create_company_phase45_commercial.sql',
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
const policy = read('server/auth/sessionPolicy.js');
const session = read('api/auth/session.js');
const router = read('api/developer.js');
const platformTools = read('src/pages/Developer/FeatureFlags.jsx');
const pricing = read('src/pages/Developer/Entitlements/PricingManagementPage.jsx');
const pricingMigration = read('supabase/migrations/20261006010000_create_company_phase45_commercial.sql');
const finalization = read('server/developerApi/finalization.js');

if (callback && !callback.includes('SESSION_IDLE_TIMEOUT_SECONDS')) failures.push('Auth callback must use shared session idle timeout policy.');
if (policy && !/SESSION_IDLE_TIMEOUT_MINUTES\s*=\s*30\s*;/.test(policy)) failures.push('Session policy must remain 30 minutes.');
if (session && !(session.includes('http_session_expires_at') && session.includes('last_seen_at'))) failures.push('Auth session API expiry/activity markers missing.');
for (const route of ['platform-registry', 'finalization', 'health']) {
  if (router && !new RegExp(`(?:['\"]?${route}['\"]?)\\s*:`).test(router)) failures.push(`Developer API router missing route: ${route}`);
}
if (platformTools && !platformTools.includes('searchDeveloperPlatform')) failures.push('Developer global search is not wired to backend search API.');
if (pricing && !/const PERIODS\s*=\s*\[\s*['"]1['"]\s*,\s*['"]6['"]\s*,\s*['"]12['"]\s*\]/.test(pricing)) failures.push('Live pricing periods must be 1, 6 and 12 months.');
if (pricingMigration && !/prices\s*=\s*coalesce\(prices,\s*'\{\}'::jsonb\)\s*-\s*'3'/.test(pricingMigration)) failures.push('Pricing migration must retire the 3-month price key.');
if (finalization && !finalization.includes('bf_resolve_company_portal_bootstrap')) failures.push('Read-only company preview must use central runtime bootstrap resolver.');

const sensitive = ['.env', '.env.local', 'service-role-key.txt', 'supabase-service-role.txt'];
for (const name of sensitive) {
  if (fs.existsSync(path.join(root, name))) warnings.push(`Sensitive local file exists in project root; do not include it in deployment archives: ${name}`);
}
console.log('\nBuddy Fleets final integration check');
console.log('====================================');
console.log(`Required files checked: ${required.length}`);
for (const warning of warnings) console.log(`WARN  ${warning}`);
for (const failure of failures) console.log(`FAIL  ${failure}`);
if (!failures.length) console.log('PASS  Current developer API routes, 30-minute session policy and 1/6/12-month pricing are aligned.');
console.log('');
process.exitCode = failures.length ? 1 : 0;
