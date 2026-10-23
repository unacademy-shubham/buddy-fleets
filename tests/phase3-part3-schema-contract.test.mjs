import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { inspectSource, sqlForInventory } from '../scripts/phase3-part3-source-schema-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventory = inspectSource();

test('source scanner covers all major runtime roots', () => {
  assert.ok(inventory.scannedFiles >= 100);
  assert.ok(inventory.tablesOrViews.length >= 50);
  assert.ok(inventory.rpcNames.length >= 25);
});

test('key existing runtime resources are indexed without dynamic guesses', () => {
  for (const table of ['profiles','companies','company_portal_operational_records','security_sessions','developer_plans']) {
    assert.ok(inventory.tablesOrViews.includes(table), table);
  }
  for (const rpc of ['bf_resolve_company_portal_bootstrap','bf_finalize_portal_http_session','developer_generate_company_code']) {
    assert.ok(inventory.rpcNames.includes(rpc), rpc);
  }
});

test('retired legacy functions are not called by the runtime', () => {
  for (const retired of ['assign_company_code','handle_new_signup','handle_site_code_cascade']) {
    assert.ok(!inventory.rpcNames.includes(retired));
  }
});

test('generated contract is SELECT-only and checks live object existence', () => {
  const sql = sqlForInventory(inventory);
  assert.match(sql, /to_regclass\(/);
  assert.match(sql, /FROM pg_proc/);
  assert.match(sql, /WITH source_refs AS \(/);
  assert.match(sql, /FROM source_refs/);
  assert.doesNotMatch(sql, /WITH references AS \(/i); // REFERENCES is a PostgreSQL keyword
  assert.match(sql, /SELECT object_type/);
  assert.doesNotMatch(sql, /\b(?:DROP|ALTER|CREATE|INSERT|UPDATE|DELETE|TRUNCATE|GRANT|REVOKE)\s+(?:TABLE|FUNCTION|VIEW|POLICY|SCHEMA|INTO|FROM|ON)\b/i);
});

test('standalone live preflight SQL has no write statements', () => {
  const sqlPath = path.join(root, 'scripts/phase3-part3-live-readonly-audit.sql');
  assert.ok(existsSync(sqlPath));
  const sql = readFileSync(sqlPath, 'utf8').replace(/--[^\n]*/g, '');
  assert.doesNotMatch(sql, /\b(?:DROP|ALTER|CREATE|INSERT|UPDATE|DELETE|TRUNCATE|GRANT|REVOKE)\b\s+(?:TABLE|FUNCTION|VIEW|POLICY|SCHEMA|INTO|FROM|ON)\b/i);
  assert.match(sql, /SELECT/);
});

test('prior schema cleanup migration remains included in source', () => {
  const f = path.join(root, 'supabase/migrations/20261024000000_phase3_legacy_function_cleanup.sql');
  assert.ok(existsSync(f));
  const sql = readFileSync(f, 'utf8');
  assert.match(sql, /DROP\s+FUNCTION/i);
  assert.match(sql, /RESTRICT/i);
});
