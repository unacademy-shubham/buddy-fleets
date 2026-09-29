import { createHash, webcrypto } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const COOKIE_NAME = '__Host-bf_session';
const ALLOWED_HOSTS = new Set([
  'developer.buddyfleets.in',
  'team.buddyfleets.in',
  'portal.buddyfleets.in',
]);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLIENT_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || SERVICE_KEY;
const AUTH_FLOW_ENCRYPTION_KEY = process.env.AUTH_FLOW_ENCRYPTION_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !CLIENT_KEY || !AUTH_FLOW_ENCRYPTION_KEY) {
  throw new Error('MFA API environment variables are missing.');
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  return res.status(status).json(payload);
}

function normalizeHost(value) {
  return String(value || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');
}

function requestHost(req) {
  return normalizeHost(req.headers['x-forwarded-host'] || req.headers.host);
}

function sameOrigin(req, host) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' && normalizeHost(url.hostname) === host;
  } catch {
    return false;
  }
}

function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function base64ToBytes(value) {
  return new Uint8Array(Buffer.from(value, 'base64'));
}

async function getEncryptionKey() {
  const raw = base64ToBytes(AUTH_FLOW_ENCRYPTION_KEY);
  if (raw.length !== 32) throw new Error('AUTH_FLOW_ENCRYPTION_KEY must decode to 32 bytes.');
  return webcrypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
}

async function decryptSecret(encrypted, iv, key) {
  const result = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(iv) },
    key,
    base64ToBytes(encrypted)
  );
  return new TextDecoder().decode(result);
}

async function loadApplicationSession(req) {
  const host = requestHost(req);
  if (!ALLOWED_HOSTS.has(host) || !sameOrigin(req, host)) {
    return { ok: false, status: 403, code: 'ORIGIN_NOT_ALLOWED' };
  }

  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token || token.length < 20) return { ok: false, status: 401, code: 'SESSION_REQUIRED' };

  const { data: session, error } = await admin
    .from('security_sessions')
    .select(`
      id,user_id,portal_type,company_id,status,http_session_expires_at,
      encrypted_access_token,access_token_iv,encrypted_refresh_token,refresh_token_iv
    `)
    .eq('portal_session_token_hash', sha256Hex(token))
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  if (!session) return { ok: false, status: 401, code: 'SESSION_INVALID' };
  if (Date.parse(session.http_session_expires_at) <= Date.now()) {
    return { ok: false, status: 401, code: 'SESSION_EXPIRED' };
  }
  if (
    !session.encrypted_access_token ||
    !session.access_token_iv ||
    !session.encrypted_refresh_token ||
    !session.refresh_token_iv
  ) {
    return { ok: false, status: 401, code: 'SESSION_INVALID' };
  }

  return { ok: true, host, session };
}

async function createUserAuthClient(session) {
  const key = await getEncryptionKey();
  const [accessToken, refreshToken] = await Promise.all([
    decryptSecret(session.encrypted_access_token, session.access_token_iv, key),
    decryptSecret(session.encrypted_refresh_token, session.refresh_token_iv, key),
  ]);

  const client = createClient(SUPABASE_URL, CLIENT_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data?.session || data.user?.id !== session.user_id) {
    throw new Error('AUTH_SESSION_INVALID');
  }

  return client;
}

async function revokeBuddySessions(userId, reason) {
  const now = new Date().toISOString();
  const { error } = await admin
    .from('security_sessions')
    .update({
      status: 'revoked',
      revoked_at: now,
      revoke_reason: reason,
      portal_session_token_hash: null,
      encrypted_access_token: null,
      access_token_iv: null,
      encrypted_refresh_token: null,
      refresh_token_iv: null,
    })
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) throw error;
}

async function securityEvent(session, eventType, metadata = {}) {
  const { error } = await admin.from('security_events').insert({
    user_id: session.user_id,
    company_id: session.company_id || null,
    event_type: eventType,
    portal_type: session.portal_type,
    metadata,
  });
  if (error) console.error('MFA security event failed:', error.message);
}

async function getSecurityState(userId) {
  const { data, error } = await admin
    .from('user_security')
    .select('user_id,mfa_enabled,mfa_enabled_at,is_locked')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data || { user_id: userId, mfa_enabled: false, mfa_enabled_at: null, is_locked: false };
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const auth = await loadApplicationSession(req);
    if (!auth.ok) return send(res, auth.status, { ok: false, code: auth.code });

    const security = await getSecurityState(auth.session.user_id);
    if (security.is_locked) return send(res, 423, { ok: false, code: 'ACCOUNT_LOCKED' });

    const userClient = await createUserAuthClient(auth.session);
    const { data: factorsData, error: factorsError } = await userClient.auth.mfa.listFactors();
    if (factorsError) throw factorsError;

    const verifiedTotp = (factorsData?.totp || []).filter((factor) => factor.status === 'verified');
    const unverifiedTotp = (factorsData?.totp || []).filter((factor) => factor.status !== 'verified');

    if (req.method === 'GET') {
      return send(res, 200, {
        ok: true,
        mfaEnabled: security.mfa_enabled === true,
        mfaEnabledAt: security.mfa_enabled_at || null,
        verifiedFactors: verifiedTotp.map((factor) => ({
          id: factor.id,
          friendlyName: factor.friendly_name || 'Authenticator',
          status: factor.status,
          createdAt: factor.created_at || null,
          updatedAt: factor.updated_at || null,
        })),
        pendingFactorIds: unverifiedTotp.map((factor) => factor.id),
      });
    }

    const action = String(req.body?.action || '').trim().toUpperCase();

    if (action === 'BEGIN_ENROLLMENT') {
      if (verifiedTotp.length) {
        return send(res, 409, { ok: false, code: 'MFA_ALREADY_ENABLED' });
      }

      for (const factor of unverifiedTotp) {
        await userClient.auth.mfa.unenroll({ factorId: factor.id }).catch(() => {});
      }

      const { data: enrollment, error: enrollmentError } = await userClient.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Buddy Fleets Authenticator',
      });
      if (enrollmentError || !enrollment?.id || !enrollment?.totp) throw enrollmentError || new Error('MFA_ENROLLMENT_FAILED');

      const { data: challenge, error: challengeError } = await userClient.auth.mfa.challenge({ factorId: enrollment.id });
      if (challengeError || !challenge?.id) throw challengeError || new Error('MFA_CHALLENGE_FAILED');

      await securityEvent(auth.session, 'MFA_ENROLLMENT_STARTED', { factor_id: enrollment.id });

      return send(res, 200, {
        ok: true,
        factorId: enrollment.id,
        challengeId: challenge.id,
        qrCode: enrollment.totp.qr_code || null,
        secret: enrollment.totp.secret || null,
        uri: enrollment.totp.uri || null,
        issuer: 'Buddy Fleets',
      });
    }

    if (action === 'VERIFY_ENROLLMENT') {
      const factorId = String(req.body?.factorId || '').trim();
      const challengeId = String(req.body?.challengeId || '').trim();
      const code = String(req.body?.code || '').replace(/\D/g, '').slice(0, 6);
      if (!factorId || !challengeId || code.length !== 6) {
        return send(res, 400, { ok: false, code: 'INVALID_MFA_CODE' });
      }

      const { data: verified, error: verifyError } = await userClient.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });
      if (verifyError || !verified) return send(res, 401, { ok: false, code: 'MFA_FAILED' });

      const now = new Date().toISOString();
      const { error: stateError } = await admin
        .from('user_security')
        .upsert(
          { user_id: auth.session.user_id, mfa_enabled: true, mfa_enabled_at: now },
          { onConflict: 'user_id' }
        );
      if (stateError) throw stateError;

      await securityEvent(auth.session, 'MFA_ENABLED', { factor_id: factorId });
      await revokeBuddySessions(auth.session.user_id, 'MFA_ENABLED_REAUTH_REQUIRED');

      return send(res, 200, { ok: true, mfaEnabled: true, reauthRequired: true });
    }

    if (action === 'DISABLE') {
      const factorId = String(req.body?.factorId || verifiedTotp[0]?.id || '').trim();
      const code = String(req.body?.code || '').replace(/\D/g, '').slice(0, 6);
      if (!factorId || code.length !== 6) {
        return send(res, 400, { ok: false, code: 'INVALID_MFA_CODE' });
      }

      const { data: challenge, error: challengeError } = await userClient.auth.mfa.challenge({ factorId });
      if (challengeError || !challenge?.id) throw challengeError || new Error('MFA_CHALLENGE_FAILED');

      const { error: verifyError } = await userClient.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) return send(res, 401, { ok: false, code: 'MFA_FAILED' });

      const { error: unenrollError } = await userClient.auth.mfa.unenroll({ factorId });
      if (unenrollError) throw unenrollError;

      const { error: stateError } = await admin
        .from('user_security')
        .update({ mfa_enabled: false, mfa_enabled_at: null })
        .eq('user_id', auth.session.user_id);
      if (stateError) throw stateError;

      await securityEvent(auth.session, 'MFA_DISABLED', { factor_id: factorId });
      await revokeBuddySessions(auth.session.user_id, 'MFA_DISABLED_REAUTH_REQUIRED');

      return send(res, 200, { ok: true, mfaEnabled: false, reauthRequired: true });
    }

    return send(res, 400, { ok: false, code: 'INVALID_MFA_ACTION' });
  } catch (error) {
    console.error('MFA API failed:', error?.message || error);
    return send(res, 503, { ok: false, code: 'MFA_SERVICE_UNAVAILABLE' });
  }
}
