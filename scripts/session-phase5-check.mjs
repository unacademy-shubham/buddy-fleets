import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const passes = [];

function read(rel) {
  try {
    return fs.readFileSync(path.join(root, rel), 'utf8');
  } catch {
    failures.push(`Missing required file: ${rel}`);
    return '';
  }
}

function expect(condition, message) {
  if (condition) passes.push(message);
  else failures.push(message);
}

const policy = read('server/auth/sessionPolicy.js');
const core = read('server/auth/portalSessionCore.js');
const sessionApi = read('api/auth/session.js');
const logoutApi = read('api/auth/logout.js');
const callback = read('api/auth/callback.js');
const app = read('src/App.jsx');
const control = read('src/components/SessionControl.jsx');
const runtime = read('src/services/sessionRuntime.js');
const secureLogin = read('supabase/functions/secure-login/index.ts');
const secureMfa = read('supabase/functions/secure-mfa/index.ts');
const supabaseConfig = read('supabase/config.toml');

const sessionPolicyRepair = read('supabase/migrations/20261007175928_repair_session_device_portal_uniqueness.sql');

expect(
  /SESSION_IDLE_TIMEOUT_MINUTES\s*=\s*30/.test(policy),
  'Authoritative idle timeout is exactly 30 minutes.'
);

expect(
  !/60\s*\*\s*60\s*\*\s*1000/.test(app),
  'App.jsx has no legacy 60-minute inactivity engine.'
);

expect(
  core.includes('recoverFromConcurrentRefresh') &&
    core.includes(".eq('encrypted_refresh_token', expectedEncryptedRefreshToken)") &&
    core.includes(".eq('refresh_token_iv', expectedRefreshTokenIv)"),
  'Supabase refresh-token rotation is concurrency-safe with compare-and-reload recovery.'
);

expect(
  logoutApi.includes("'x-bf-session-id'") &&
    logoutApi.includes('SESSION_GENERATION_MISMATCH') &&
    app.includes("'X-BF-Session-ID'") &&
    control.includes("'X-BF-Session-ID'"),
  'Logout is bound to the expected session generation across browser and server.'
);

expect(
  callback.includes("'bf_session_runtime_v3'") &&
    callback.includes("'bf_session_event_v3'") &&
    callback.includes("key.startsWith('bf_workflow_draft:')"),
  'Fresh callback scrubs stale runtime/events/local workflow cache before bootstrap.'
);

expect(
  runtime.includes('SESSION_EVENT_TTL_MS') &&
    runtime.includes('Date.now() - emittedAt > SESSION_EVENT_TTL_MS'),
  'Cross-tab session events have an age limit.'
);

expect(
  control.includes('Never let a stale/unknown tab event terminate a newer session') &&
    control.includes('TOUCH_RETRY_AFTER_FAILURE_MS'),
  'Frontend revalidates mismatched tab events and retries failed activity renewal quickly.'
);

expect(
  sessionApi.includes('verifyAndRefreshSupabaseSession') &&
    sessionApi.includes('renewPortalIdleWindow'),
  'Session API uses shared server auth refresh and idle-renewal authority.'
);

expect(
  !core.includes("revoke_reason: 'IP_CHANGED'") &&
    !core.includes("revoke_reason: 'BROWSER_CHANGED'"),
  'IP/browser changes are not hard session kill-switches in shared session core.'
);


expect(
  core.includes('revokeSupabaseAuthSessionBestEffort') &&
    core.includes('/auth/v1/logout?scope=local') &&
    core.includes('loadSessionForInvalidation'),
  'Buddy session invalidation also performs best-effort exact Supabase Auth session revocation.'
);

expect(
  sessionApi.includes('invalidatePortalSecuritySession') &&
    read('server/auth/requireDeveloperSession.js').includes('invalidatePortalSecuritySession') &&
    read('server/auth/requireCompanyPortalSession.js').includes('invalidatePortalSecuritySession'),
  'Developer, company, and central session invalidation converge on the shared server session core.'
);

expect(
  !/revoke_reason:\s*['"]IP_CHANGED['"]/.test(core) &&
    !/revoke_reason:\s*['"]BROWSER_CHANGED['"]/.test(core),
  'Network/browser changes remain audit signals, not session kill-switches.'
);
expect(
  secureLogin.includes('revokeReplacedAuthSessions') &&
    secureMfa.includes('revokeReplacedAuthSessions') &&
    secureLogin.includes('/auth/v1/logout?scope=local') &&
    secureMfa.includes('/auth/v1/logout?scope=local'),
  'Password and MFA login replace same-device Buddy sessions without leaving the prior Supabase Auth session intentionally alive.'
);

expect(
  supabaseConfig.includes('[functions.secure-login]') &&
    supabaseConfig.includes('[functions.secure-mfa]') &&
    supabaseConfig.includes('[functions.consume-handoff]') &&
    (supabaseConfig.match(/verify_jwt\s*=\s*false/g) || []).length >= 3,
  'Supabase auth gateway function JWT settings are pinned in config.toml for safe repeat deployments.'
);


expect(
  sessionPolicyRepair.includes('drop index if exists public.security_sessions_one_active_user_idx') &&
    sessionPolicyRepair.includes('security_sessions_one_active_device_portal_idx') &&
    sessionPolicyRepair.includes('security_sessions_one_active_unknown_device_portal_idx') &&
    sessionPolicyRepair.includes('pg_advisory_xact_lock') &&
    sessionPolicyRepair.includes("revoke_reason = 'HTTP_SESSION_EXPIRED'") &&
    sessionPolicyRepair.includes("same_device_same_portal_replacement_v2"),
  'Database migration removes the obsolete one-active-user constraint and enforces serialized same-device/same-portal replacement.'
);

console.log('\nBuddy Fleets Phase 6 final session acceptance check');
console.log('============================================');
for (const message of passes) console.log(`PASS  ${message}`);
for (const message of failures) console.log(`FAIL  ${message}`);
console.log('');

process.exitCode = failures.length ? 1 : 0;
