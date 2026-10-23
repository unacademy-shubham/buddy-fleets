import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const preflight = read('scripts/phase3-part2-legacy-function-preflight.sql');
const cleanup = read('scripts/phase3-part2-legacy-function-cleanup.sql');
const restore = read('scripts/phase3-part2-legacy-function-restore.sql');
const targets = [
  'public.assign_company_code(uuid)',
  'public.handle_new_signup()',
  'public.handle_site_code_cascade()',
];

test('preflight is read-only and reports dependency blockers', () => {
  assert.match(preflight, /FROM pg_trigger/i);
  assert.match(preflight, /FROM pg_depend/i);
  assert.match(preflight, /FROM pg_proc/i);
  assert.match(preflight, /STOP_DEPENDENCIES_PRESENT/);
  assert.doesNotMatch(preflight, /\b(?:DROP|ALTER|CREATE|TRUNCATE|DELETE|UPDATE|INSERT)\s+(?:TABLE|FUNCTION|FROM|INTO|public\.)/i);
});

test('all three exact legacy signatures are tracked through preflight and cleanup', () => {
  for (const fn of targets) {
    assert.ok(preflight.includes(fn), `${fn} missing from preflight`);
    assert.ok(cleanup.includes(fn), `${fn} missing from cleanup`);
  }
});

test('cleanup refuses unreviewed schema drift and active dependencies', () => {
  for (const marker of ['pg_trigger', 'pg_depend', 'pg_proc', 'legacy_marker', 'to_regclass', 'RAISE EXCEPTION']) {
    assert.ok(cleanup.includes(marker), `${marker} guard missing`);
  }
  assert.match(cleanup, /BEGIN\s*;/i);
  assert.match(cleanup, /COMMIT\s*;/i);
  assert.match(cleanup, /DROP FUNCTION public\.assign_company_code\(uuid\) RESTRICT;/i);
  assert.match(cleanup, /DROP FUNCTION public\.handle_new_signup\(\) RESTRICT;/i);
  assert.match(cleanup, /DROP FUNCTION public\.handle_site_code_cascade\(\) RESTRICT;/i);
  assert.doesNotMatch(cleanup, /\bCASCADE\s*;/i);
  assert.doesNotMatch(cleanup, /\b(?:DELETE FROM|TRUNCATE|DROP TABLE|ALTER TABLE)\b/i);
});

test('live application continues to use developer company-code generator', () => {
  const current = read('server/developerApi/saas-management.js');
  assert.match(current, /rpc\('developer_generate_company_code'/);
  assert.doesNotMatch(current, /rpc\(['"]assign_company_code['"]/);
});

test('active update trigger function is preserved', () => {
  assert.match(cleanup, /to_regprocedure\('public\.set_updated_at\(\)'\)/);
  assert.doesNotMatch(cleanup, /DROP FUNCTION public\.set_updated_at\(/i);
});

test('recovery restores targeted functions while keeping public access revoked', () => {
  for (const fn of targets) {
    assert.ok(restore.includes(fn), `${fn} missing from recovery ACL`);
  }
  assert.match(restore, /REVOKE ALL ON FUNCTION public\.assign_company_code\(uuid\) FROM PUBLIC, anon, authenticated;/i);
  assert.match(restore, /GRANT EXECUTE ON FUNCTION public\.handle_site_code_cascade\(\) TO service_role;/i);
  assert.doesNotMatch(restore, /GRANT EXECUTE .* TO (?:PUBLIC|anon|authenticated)/i);
});
