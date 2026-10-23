import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('developer requests are dispatched by the shared API router', () => {
  const router = read('api/developer.js');
  for (const route of ['platform-registry', 'finalization', 'health']) {
    assert.match(router, new RegExp(`(?:['"]?${route}['"]?)\\s*:`));
    assert.match(router, new RegExp(`server/developerApi/${route}\\.js`));
  }
});

test('pricing UI uses only 1, 6, 12 month options', () => {
  assert.match(read('src/pages/Developer/Entitlements/PricingManagementPage.jsx'), /const PERIODS\s*=\s*\['1', '6', '12'\]/);
});

test('commercial migration removes the retired 3-month price', () => {
  assert.match(read('supabase/migrations/20261006010000_create_company_phase45_commercial.sql'), /prices\s*=\s*coalesce\(prices,\s*'\{\}'::jsonb\)\s*-\s*'3'/);
});

test('database verification only accepts 1,6,12 month keys and rejects 3', () => {
  const sql = read('scripts/buddy-final-db-verification.sql');
  assert.match(sql, /1_6_12_month_keys/);
  assert.match(sql, /\?& array\['1','6','12'\]/);
  assert.match(sql, /not coalesce\(prices, '\{\}'::jsonb\) \? '3'/);
  assert.doesNotMatch(sql, /1_3_6_12_month_keys/);
});

test('integration check uses 30-minute authoritative policy and current API paths', () => {
  const check = read('scripts/buddy-final-check.mjs');
  assert.match(check, /server\/auth\/sessionPolicy\.js/);
  assert.match(check, /SESSION_IDLE_TIMEOUT_MINUTES/);
  assert.match(check, /server\/developerApi\/finalization\.js/);
  assert.match(check, /server\/developerApi\/health\.js/);
  assert.match(check, /api\/developer\.js/);
  assert.doesNotMatch(check, /'api\/developer\/finalization\.js'/);
});
