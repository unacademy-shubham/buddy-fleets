// Buddy Fleets Phase 1 authorization regression tests.
// Run from project root: node --test tests/phase1-security.test.mjs
// Pure mocks only: never contacts Supabase, writes production data, or installs deps.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const original = await readFile(new URL('../server/company/clientPortalService.js', import.meta.url), 'utf8');
// Evaluate the actual exported backend action in isolation without external
// modules. These three imports are irrelevant to the site-permission tests.
const testableSource = original
  .replace("import { createClient } from '@supabase/supabase-js';", 'const createClient = () => { throw new Error("Not used by these tests"); };')
  .replace("import { resolveCompanyAccess } from './resolveCompanyAccess.js';", 'const resolveCompanyAccess = () => { throw new Error("Not used by these tests"); };')
  .replace("import { getDemoCompany } from '../../src/clientPortal/data/demoData.js';", 'const getDemoCompany = () => { throw new Error("Not used by these tests"); };')
  + '\nexport { action, siteAllowed };\n';

assert.doesNotMatch(testableSource, /^import /m, 'all external imports must be mocked');
const { action, siteAllowed } = await import(`data:text/javascript;base64,${Buffer.from(testableSource).toString('base64')}`);

const COMPANY = '11111111-1111-4111-8111-111111111111';
const OTHER_COMPANY = '22222222-2222-4222-8222-222222222222';
const USER = '33333333-3333-4333-8333-333333333333';
const RECORD = '44444444-4444-4444-8444-444444444444';
const SITE_A = '55555555-5555-4555-8555-555555555555';
const SITE_B = '66666666-6666-4666-8666-666666666666';
const FOREIGN_SITE = '77777777-7777-4777-8777-777777777777';

function access(allowedSites = [SITE_A], allSites = false) {
  return {
    siteIds: allowedSites, allSites,
    modulePermissions: {
      trips: { view: true, create: true, edit: true, delete: true },
      vehicles: { view: true, create: true },
    },
  };
}

function makeDb(originalSite, { mutationBeforeUpdate = null } = {}) {
  const state = {
    operational: { id: RECORD, company_id: COMPANY, site_id: originalSite, module_key: 'trips', is_archived: false, title: 'Original trip' },
    writes: [], audits: [],
  };
  const from = (table) => {
    const query = {
      mode: null, patch: null, predicates: [],
      select() { if (!this.mode) this.mode = 'select'; return this; },
      update(patch) { this.mode = 'update'; this.patch = patch; return this; },
      eq(field, value) { this.predicates.push([field, value]); return this; },
      is(field, value) { this.predicates.push([field, value]); return this; },
      async maybeSingle() {
        if (table !== 'company_portal_operational_records') throw Error(`Unexpected query on ${table}`);
        if (this.mode === 'update' && mutationBeforeUpdate) mutationBeforeUpdate(state.operational);
        const found = this.predicates.every(([field, value]) => state.operational[field] === value);
        if (!found) return { data: null, error: null };
        if (this.mode === 'update') {
          state.writes.push({ ...this.patch });
          Object.assign(state.operational, this.patch);
        }
        return { data: { ...state.operational }, error: null };
      },
      async insert(row) {
        if (table === 'company_portal_audit') { state.audits.push(row); return { error: null }; }
        if (table === 'company_portal_vehicles') { state.writes.push(row); return { data: row, error: null }; }
        throw Error(`Unexpected insert into ${table}`);
      },
    };
    return query;
  };
  return { state, db: { from } };
}

function call(db, userAccess, actionName, payload) {
  return action({ db, companyId: COMPANY, userId: USER, currentUser: {}, userAccess, actionName, payload });
}

const recordInput = { module_key: 'trips', id: RECORD, title: 'Edited trip' };

test('refuses to move an original record from an unauthorized site', async () => {
  const { db, state } = makeDb(SITE_B);
  await assert.rejects(call(db, access([SITE_A]), 'update_operational_record', { ...recordInput, site_id: SITE_A }), e => e.status === 403 && e.code === 'SITE_ACCESS_DENIED');
  assert.equal(state.writes.length, 0);
});

test('refuses to move an authorized record to an unauthorized site', async () => {
  const { db, state } = makeDb(SITE_A);
  await assert.rejects(call(db, access([SITE_A]), 'update_operational_record', { ...recordInput, site_id: SITE_B }), e => e.status === 403 && e.code === 'SITE_ACCESS_DENIED');
  assert.equal(state.writes.length, 0);
});

test('allows an authorized same-site edit', async () => {
  const { db, state } = makeDb(SITE_A);
  const response = await call(db, access([SITE_A]), 'update_operational_record', { ...recordInput, site_id: SITE_A });
  assert.equal(response.record.title, 'Edited trip');
  assert.equal(state.writes.length, 1);
  assert.equal(state.audits.length, 1);
});

test('allows a site transfer when authorized for both sites', async () => {
  const { db, state } = makeDb(SITE_B);
  await call(db, access([SITE_A, SITE_B]), 'update_operational_record', { ...recordInput, site_id: SITE_A });
  assert.equal(state.operational.site_id, SITE_A);
});

test('keeps original site when site_id is omitted', async () => {
  const { db, state } = makeDb(SITE_A);
  await call(db, access([SITE_A]), 'update_operational_record', recordInput);
  assert.equal(state.operational.site_id, SITE_A);
});

test('blocks update if site changes concurrently after the authorization read', async () => {
  const { db, state } = makeDb(SITE_A, { mutationBeforeUpdate: row => { row.site_id = SITE_B; } });
  await assert.rejects(call(db, access([SITE_A]), 'update_operational_record', { ...recordInput, site_id: SITE_A }), e => e.status === 409 && e.code === 'RECORD_CHANGED_RETRY');
  assert.equal(state.writes.length, 0);
});

test('site-restricted employee cannot move a record into company-wide scope', async () => {
  const { db, state } = makeDb(SITE_A);
  await assert.rejects(call(db, access([SITE_A]), 'update_operational_record', { ...recordInput, site_id: '' }), e => e.status === 403);
  assert.equal(state.writes.length, 0);
});

test('site-restricted employee cannot edit a company-wide record', async () => {
  const { db, state } = makeDb(null);
  await assert.rejects(call(db, access([SITE_A]), 'update_operational_record', { ...recordInput, site_id: SITE_A }), e => e.status === 403);
  assert.equal(state.writes.length, 0);
});

test('all-sites admin can still edit company-wide operational records', async () => {
  const { db, state } = makeDb(null);
  await call(db, access([SITE_A, SITE_B], true), 'update_operational_record', { ...recordInput, site_id: '' });
  assert.equal(state.writes.length, 1);
  assert.equal(state.operational.site_id, null);
});

test('cannot archive a restricted original record', async () => {
  const { db, state } = makeDb(SITE_B);
  await assert.rejects(call(db, access([SITE_A]), 'archive_operational_record', { module_key: 'trips', id: RECORD }), e => e.status === 403);
  assert.equal(state.writes.length, 0);
});

test('can archive a record from an assigned site', async () => {
  const { db, state } = makeDb(SITE_A);
  await call(db, access([SITE_A]), 'archive_operational_record', { module_key: 'trips', id: RECORD });
  assert.equal(state.operational.is_archived, true);
  assert.equal(state.audits.length, 1);
});

test('cannot archive a record after it is moved concurrently to a forbidden site', async () => {
  const { db, state } = makeDb(SITE_A, { mutationBeforeUpdate: row => { row.site_id = SITE_B; } });
  await assert.rejects(call(db, access([SITE_A]), 'archive_operational_record', { module_key: 'trips', id: RECORD }), e => e.status === 409);
  assert.equal(state.writes.length, 0);
});

test('all-sites permission only covers site IDs from the current company', () => {
  assert.equal(siteAllowed(access([SITE_A, SITE_B], true), SITE_A), true);
  assert.equal(siteAllowed(access([SITE_A, SITE_B], true), FOREIGN_SITE), false);
});

test('blocks creating a vehicle with foreign-company current_site_id', async () => {
  const { db, state } = makeDb(SITE_A);
  await assert.rejects(call(db, access([SITE_A], true), 'create_vehicle', {
    vehicle_number: 'GJ01AA0001', home_site_id: SITE_A, current_site_id: FOREIGN_SITE,
  }), e => e.status === 403 && e.code === 'SITE_ACCESS_DENIED');
  assert.equal(state.writes.length, 0);
});

test('RPC migration never revokes ALL functions indiscriminately and keeps RLS helpers', async () => {
  const sql = await readFile(new URL('../supabase/migrations/20261023234500_phase1_rpc_execution_hardening.sql', import.meta.url), 'utf8');
  assert.match(sql, /revoke execute on function %s from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function %s to authenticated, service_role/i);
  assert.doesNotMatch(sql, /revoke execute on all functions in schema public/i);
  assert.match(sql, /public\.bf_repair_company_provisioning\(\)/);
  assert.match(sql, /public\.bf_company_access_context\(uuid\)/);
});
