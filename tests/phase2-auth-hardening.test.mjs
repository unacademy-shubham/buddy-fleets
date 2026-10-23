import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  resolveSupabaseUserClientKey,
  isHttpSessionExpired,
  portalTypeForHost,
} from '../server/auth/userClientSecurity.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = (path) => readFileSync(join(root, path), 'utf8');
const mfa = source('api/auth/mfa.js');
const core = source('server/auth/portalSessionCore.js');

const serviceRoleJwt = [
  Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url'),
  Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url'),
  'placeholder-signature',
].join('.');

test('anon key is selected for user auth without exposing the service key', () => {
  assert.equal(resolveSupabaseUserClientKey({
    SUPABASE_ANON_KEY: 'safe-anon-key', SUPABASE_SERVICE_ROLE_KEY: 'private-key',
  }), 'safe-anon-key');
});

test('new publishable key is supported', () => {
  assert.equal(resolveSupabaseUserClientKey({ SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' }), 'sb_publishable_test');
});

test('Vercel public client key is supported', () => {
  assert.equal(resolveSupabaseUserClientKey({ VITE_SUPABASE_ANON_KEY: 'public-anon' }), 'public-anon');
});

test('Supabase publishable-keys JSON accepts named or default entries', () => {
  assert.equal(resolveSupabaseUserClientKey({
    SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: 'sb_publishable_default' }),
  }), 'sb_publishable_default');
  assert.equal(resolveSupabaseUserClientKey({
    SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ key1: 'sb_publishable_named' }),
  }), 'sb_publishable_named');
});

test('missing client key fails closed instead of falling back to service_role', () => {
  assert.equal(resolveSupabaseUserClientKey({ SUPABASE_SERVICE_ROLE_KEY: 'private-key' }), null);
});

test('same key as service-role is rejected', () => {
  assert.throws(() => resolveSupabaseUserClientKey({
    SUPABASE_ANON_KEY: 'private-key', SUPABASE_SERVICE_ROLE_KEY: 'private-key',
  }), /service-role/);
});

test('legacy service_role JWT is rejected even if not equal to configured key', () => {
  assert.throws(() => resolveSupabaseUserClientKey({
    SUPABASE_ANON_KEY: serviceRoleJwt, SUPABASE_SERVICE_ROLE_KEY: 'another-key',
  }), /service-role/);
});

test('Supabase secret API key is rejected', () => {
  assert.throws(() => resolveSupabaseUserClientKey({
    SUPABASE_PUBLISHABLE_KEY: 'sb_secret_not_publishable',
  }), /secret key/);
});

test('MFA accepts only future session expiry timestamps', () => {
  const now = Date.parse('2026-10-24T05:30:00.000Z');
  assert.equal(isHttpSessionExpired('2026-10-24T05:29:59.000Z', now), true);
  assert.equal(isHttpSessionExpired('2026-10-24T05:30:00.000Z', now), true);
  assert.equal(isHttpSessionExpired('2026-10-24T05:30:01.000Z', now), false);
});

test('MFA fails closed for missing/null/invalid expiry (no NaN bypass)', () => {
  for (const value of [undefined, null, '', 'not-a-timestamp', 0]) {
    assert.equal(isHttpSessionExpired(value), true);
  }
});

test('host-to-portal binding covers all three existing Buddy Fleets portals', () => {
  assert.equal(portalTypeForHost('developer.buddyfleets.in'), 'developer');
  assert.equal(portalTypeForHost('team.buddyfleets.in'), 'team');
  assert.equal(portalTypeForHost('portal.buddyfleets.in'), 'company');
  assert.equal(portalTypeForHost('unknown.example.com'), null);
});

test('shared session core uses only the configured non-privileged client key', () => {
  assert.match(core, /resolveSupabaseUserClientKey\(process\.env\)/);
  assert.doesNotMatch(core, /getJsonEnvironmentKey\(/);
  assert.doesNotMatch(core, /\|\|\s*SUPABASE_SERVICE_ROLE_KEY\s*;/);
});

test('shared session expiry keeps fail-closed validation', () => {
  assert.match(core, /isHttpSessionExpired\(securitySession\?\.http_session_expires_at, now\)/);
});

test('MFA uses public client key and enforces expiry and maximum cookie length', () => {
  assert.match(mfa, /resolveSupabaseUserClientKey\(process\.env\)/);
  assert.match(mfa, /isHttpSessionExpired\(session\.http_session_expires_at\)/);
  assert.match(mfa, /token\.length > 200/);
  assert.doesNotMatch(mfa, /\|\|\s*SERVICE_KEY\s*;/);
});

test('MFA enforces both origin/fetch site and portal-specific token binding', () => {
  assert.match(mfa, /\['same-origin', 'none'\]/);
  assert.match(mfa, /CROSS_SITE_REQUEST_BLOCKED/);
  assert.match(mfa, /\.eq\('portal_type', portalTypeForHost\(host\)\)/);
});

test('MFA refuses to persist credentials for a revoked or concurrently expired session', () => {
  assert.match(mfa, /\.gt\('http_session_expires_at', new Date\(\)\.toISOString\(\)\)/);
  assert.match(mfa, /\.select\('id'\)\s*\.maybeSingle\(\)/);
  assert.match(mfa, /if \(!persisted\?\.id\) throw new Error\('AUTH_SESSION_REVOKED_OR_EXPIRED'\)/);
});

test('MFA verifies the Supabase user and binds the JWT session to Buddy session', () => {
  assert.match(mfa, /auth_session_id,portal_type/);
  assert.match(mfa, /decodeSupabaseJwt\(accessToken\)/);
  assert.match(mfa, /claims\.session_id !== applicationSession\.auth_session_id/);
  assert.match(mfa, /client\.auth\.getUser\(\)/);
  assert.match(mfa, /assertSessionTokenBinding\(data\.session\.access_token, session\)/);
});
