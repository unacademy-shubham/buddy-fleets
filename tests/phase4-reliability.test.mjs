import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import publicHandler from '../api/health.js';
import { HEALTH_DEPENDENCIES, HEALTH_PROBE_TIMEOUT_MS, probeDatabaseDependency } from '../server/developerApi/healthProbe.js';
import { getDeveloperServiceHealth } from '../src/services/developerHealthApi.js';
import { collectBuildStats, evaluateBudgets } from '../scripts/phase4-build-budget.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');

function responseMock() {
  return {
    headers: {},
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { this.ended = true; return this; },
  };
}

test('public liveness GET exposes no database secrets and disables caching', () => {
  const res = responseMock();
  publicHandler({ method: 'GET', headers: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(Object.keys(res.body).sort(), ['checkedAt', 'ok', 'service', 'status']);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.status, 'up');
  assert.equal(res.headers['cache-control'].includes('no-store'), true);
  const source = read('api/health.js');
  for (const risk of ['SUPABASE_SERVICE_ROLE_KEY', 'createClient(', '.from(', 'process.env.']) assert.equal(source.includes(risk), false);
});

test('public liveness HEAD returns no body; methods other than GET/HEAD are rejected', () => {
  const head = responseMock();
  publicHandler({ method: 'HEAD', headers: {} }, head);
  assert.equal(head.statusCode, 200);
  assert.equal(head.ended, true);
  assert.equal(head.body, undefined);
  const post = responseMock();
  publicHandler({ method: 'POST', headers: {} }, post);
  assert.equal(post.statusCode, 405);
  assert.equal(post.body.code, 'METHOD_NOT_ALLOWED');
  assert.equal(post.headers.allow, 'GET, HEAD');
});

function makeFakeDb(result) {
  const captures = [];
  const db = { from(table) {
    const capture = { table };
    captures.push(capture);
    const builder = {
      select(column) { capture.column = column; return this; },
      limit(n) { capture.limit = n; return this; },
      abortSignal(signal) { capture.signal = signal; return this; },
      then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
    };
    return builder;
  } };
  return { db, captures };
}

test('all 11 developer dependencies probe known distinct tables', () => {
  assert.equal(HEALTH_DEPENDENCIES.length, 11);
  assert.equal(new Set(HEALTH_DEPENDENCIES.map((entry) => entry.table)).size, 11);
  assert(HEALTH_DEPENDENCIES.some((x) => x.table === 'security_sessions'));
  assert(HEALTH_DEPENDENCIES.some((x) => x.table === 'developer_preview_audit'));
  assert.equal(HEALTH_PROBE_TIMEOUT_MS, 6000);
});

test('empty tables are healthy and probes request at most one row', async () => {
  const { db, captures } = makeFakeDb({ data: [], error: null });
  const status = await probeDatabaseDependency(db, HEALTH_DEPENDENCIES[0]);
  assert.equal(status.ok, true);
  assert.equal(status.details, undefined);
  assert.equal(captures.length, 1);
  assert.equal(captures[0].limit, 1);
  assert.equal(captures[0].column, 'id');
  assert.equal(captures[0].signal instanceof AbortSignal, true);
});

test('failed dependency returns safe diagnostic without raw SQL error', async () => {
  const { db } = makeFakeDb({ error: { code: 'PGRST301', message: 'private SQL and credentials' } });
  const warn = console.warn;
  console.warn = () => {};
  try {
    const status = await probeDatabaseDependency(db, HEALTH_DEPENDENCIES[1]);
    assert.equal(status.ok, false);
    assert.equal(status.code, 'PGRST301');
    assert.equal(status.message, 'Backend dependency is unavailable.');
    assert.equal(JSON.stringify(status).includes('credentials'), false);
  } finally { console.warn = warn; }
});

test('authenticated developer health retains session protection and returns meaningful status', () => {
  const code = read('server/developerApi/health.js');
  assert.match(code, /await requireDeveloperSession\(req\)/);
  assert.match(code, /setDeveloperApiHeaders\(res\)/);
  assert.match(code, /ok: failed === 0/);
  assert.match(code, /status = failed === 0 \? 'healthy'/);
  assert.match(code, /failed === checks.length \? 503 : 200/);
  assert.doesNotMatch(code, /count:\s*'exact'/);
  assert.doesNotMatch(code, /select\('\*'\)/);
});

test('browser developer health uses credentials, no-store and abortable fetch', async () => {
  const old = globalThis.fetch;
  let received;
  globalThis.fetch = async (url, init) => {
    received = { url, init };
    return { ok: true, status: 200, text: async () => JSON.stringify({ ok: true, status: 'healthy', checks: [{ name: 'A', ok: true }] }) };
  };
  try {
    const value = await getDeveloperServiceHealth();
    assert.equal(value.ok, true);
    assert.equal(received.init.credentials, 'include');
    assert.equal(received.init.cache, 'no-store');
    assert.equal(received.init.signal instanceof AbortSignal, true);
  } finally { globalThis.fetch = old; }
});

test('browser developer health fails closed on invalid JSON and network errors', async () => {
  const old = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => 'invalid{' });
    const invalid = await getDeveloperServiceHealth();
    assert.equal(invalid.ok, false);
    assert.equal(invalid.status, 'down');
    globalThis.fetch = async () => { throw new Error('private fetch failure'); };
    const network = await getDeveloperServiceHealth();
    assert.equal(network.ok, false);
    assert.equal(network.code, 'NETWORK_ERROR');
    assert.equal(JSON.stringify(network).includes('private'), false);
  } finally { globalThis.fetch = old; }
});

test('GitHub Actions monitor is restricted to production public liveness, no secrets', () => {
  const content = read('.github/workflows/phase4-uptime.yml');
  assert.match(content, /workflow_dispatch:/);
  assert.match(content, /schedule:/);
  assert.match(content, /contents: read/);
  assert.match(content, /https:\/\/buddyfleets\.in\/api\/health/);
  assert.doesNotMatch(content, /secrets\.|service_role|\/api\/developer/i);
});

test('build budget reports advisory warnings without depending on project build', () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'bf-phase4-'));
  try {
    mkdirSync(path.join(folder, 'assets'));
    writeFileSync(path.join(folder, 'index.html'), '<html>hello</html>');
    writeFileSync(path.join(folder, 'assets', 'app.js'), 'console.log(1);');
    const stats = collectBuildStats(folder);
    assert.equal(stats.length, 2);
    assert.equal(evaluateBudgets(stats).warnings.length, 0);
    assert.equal(evaluateBudgets([{ file: 'assets/huge.js', gzipBytes: 400 * 1024, bytes: 500 * 1024 }]).warnings.length, 1);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

test('live performance audit is read only, has no DDL or data mutation', () => {
  const sql = read('scripts/phase4-live-readonly-audit.sql').replace(/--[^\n]*/g, '');
  assert.match(sql, /pg_stat_user_tables/);
  assert.match(sql, /pg_indexes/);
  assert.doesNotMatch(sql, /\b(?:DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER|CREATE|GRANT|REVOKE)\b/i);
});
