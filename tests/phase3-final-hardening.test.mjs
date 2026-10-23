import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(path.join(root, p), 'utf8');
const migration = read('scripts/phase3-final-security-hardening.sql');
const preflight = read('scripts/phase3-final-security-preflight.sql');
const rollback = read('scripts/phase3-final-security-rollback.sql');
const verify = read('scripts/phase3-final-security-verify.sql');
const setup = read('scripts/phase3-final-prepare.ps1');
const withoutComments = x => x.replace(/--[^\n]*/g, '');

test('migration uses one transaction, guards and fail-closed drift checks', () => {
  assert.match(migration, /^BEGIN;/m);
  assert.match(migration, /^COMMIT;/m);
  assert.match(migration, /RAISE EXCEPTION 'Phase 3 final aborted:/);
  assert.match(migration, /pg_policies/);
  assert.match(migration, /current_path IS NOT NULL/);
  assert.match(migration, /has_schema_privilege\('anon', 'public', 'CREATE'\)/);
});

test('pins exactly three reviewed function search paths, never replaces bodies or ACLs', () => {
  const sql = withoutComments(migration);
  assert.match(sql, /ALTER FUNCTION public\.set_updated_at\(\) SET search_path = pg_catalog;/);
  assert.match(sql, /ALTER FUNCTION public\.purge_old_audit_logs\(\) SET search_path = pg_catalog, public, pg_temp;/);
  assert.match(sql, /ALTER FUNCTION public\.bf_normalize_subdomain_slug\(text\) SET search_path = pg_catalog;/);
  assert.equal((sql.match(/ALTER FUNCTION/g) ?? []).length, 3);
  assert.doesNotMatch(sql, /(?:CREATE OR REPLACE FUNCTION|DROP FUNCTION|REVOKE|GRANT)\b/i);
});

test('optimizes only two exact SELECT policies; preserves superadmin and write policies', () => {
  const sql = withoutComments(migration);
  assert.match(sql, /ALTER POLICY profile_self_read ON public\.profiles\s+USING \(id = \(SELECT auth\.uid\(\)\)\);/);
  assert.match(sql, /ALTER POLICY membership_self_read ON public\.company_memberships\s+USING \(user_id = \(SELECT auth\.uid\(\)\)\);/);
  assert.equal((sql.match(/ALTER POLICY/g) ?? []).length, 2);
  assert.doesNotMatch(sql, /(?:DROP POLICY|CREATE POLICY|ALTER TABLE|WITH CHECK\s*\()/i);
});

test('metadata preflight is strictly read-only', () => {
  const sql = withoutComments(preflight);
  assert.match(sql, /SELECT/);
  assert.doesNotMatch(sql, /\b(?:ALTER|DROP|CREATE|UPDATE|INSERT|DELETE|TRUNCATE|GRANT|REVOKE)\s+(?:FUNCTION|TABLE|POLICY|INTO|FROM|ON)\b/i);
});

test('rollback restores previous policy expressions and function settings', () => {
  assert.match(rollback, /^BEGIN;/m);
  assert.match(rollback, /^COMMIT;/m);
  assert.match(rollback, /ALTER FUNCTION public\.set_updated_at\(\) RESET search_path;/);
  assert.match(rollback, /ALTER FUNCTION public\.purge_old_audit_logs\(\) RESET search_path;/);
  assert.match(rollback, /ALTER FUNCTION public\.bf_normalize_subdomain_slug\(text\) RESET search_path;/);
  assert.match(rollback, /USING \(id = auth\.uid\(\)\);/);
  assert.match(rollback, /USING \(user_id = auth\.uid\(\)\);/);
});

test('verification covers all five changes and preserves retired functions', () => {
  for (const name of ['update_fn_hardened', 'normalize_fn_hardened', 'purge_fn_hardened', 'profiles_policy_optimized', 'memberships_policy_optimized', 'retired_company_code_absent', 'retired_signup_absent', 'retired_site_cascade_absent']) {
    assert.ok(verify.includes(name), name);
  }
  assert.match(verify, /preserved_update_triggers/);
});

test('installer generates versioned migration via CLI and limits itself to dry-run', () => {
  assert.match(setup, /npx supabase migration new phase3_final_security_hardening/);
  assert.match(setup, /npx supabase db push --dry-run/);
  const pushCommands = [...setup.matchAll(/^& npx supabase db push[^\r\n]*$/gm)].map(m => m[0]);
  assert.deepEqual(pushCommands, ['& npx supabase db push --dry-run']);
  assert.match(setup, /Get-FileHash/);
  assert.match(setup, /main/);
});
