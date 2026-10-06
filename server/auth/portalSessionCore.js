import {
  createHash,
  webcrypto,
} from 'node:crypto';

import {
  createClient,
} from '@supabase/supabase-js';

import {
  AUTH_REFRESH_SKEW_SECONDS,
  PORTAL_SESSION_COOKIE,
  SESSION_IDLE_TIMEOUT_MINUTES,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_IDLE_TIMEOUT_SECONDS,
} from './sessionPolicy.js';

export {
  PORTAL_SESSION_COOKIE,
  SESSION_IDLE_TIMEOUT_MINUTES,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_IDLE_TIMEOUT_SECONDS,
} from './sessionPolicy.js';

/* ============================================================
   BUDDY FLEETS
   SHARED SERVER-SIDE PORTAL SESSION CORE

   This module is the single server-side authority for:
   - application-session lookup/invalidation
   - 30-minute idle-expiry policy
   - Supabase access-token verification
   - transparent refresh-token rotation
   - encrypted credential persistence
   - request context observations (IP / UA are signals, not kill-switches)

   It never returns raw auth tokens to browser code.
============================================================ */

function getJsonEnvironmentKey(name) {
  const raw = process.env[name];

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed?.default === 'string') {
      return parsed.default;
    }

    const firstValue = Object.values(parsed).find(
      (value) => typeof value === 'string'
    );

    return typeof firstValue === 'string'
      ? firstValue
      : null;
  } catch {
    return null;
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_CLIENT_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  getJsonEnvironmentKey('SUPABASE_PUBLISHABLE_KEYS') ||
  SUPABASE_SERVICE_ROLE_KEY;
const AUTH_FLOW_ENCRYPTION_KEY = process.env.AUTH_FLOW_ENCRYPTION_KEY;

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !SUPABASE_CLIENT_KEY ||
  !AUTH_FLOW_ENCRYPTION_KEY
) {
  throw new Error(
    'Required shared portal-session environment variables are missing.'
  );
}

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

function createUserAuthClient() {
  return createClient(
    SUPABASE_URL,
    SUPABASE_CLIENT_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export function normalizePortalHost(value) {
  return String(value || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');
}

export function getPortalRequestHost(req) {
  return normalizePortalHost(
    req.headers['x-forwarded-host'] ||
      req.headers.host
  );
}

export function getPortalClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];

  if (forwarded) {
    return String(forwarded)
      .split(',')[0]
      .trim() || null;
  }

  const realIp = req.headers['x-real-ip'];

  return realIp
    ? String(realIp).trim() || null
    : null;
}

export function getPortalUserAgent(req) {
  return String(
    req.headers['user-agent'] || ''
  ).slice(0, 1000);
}

export function parsePortalCookies(cookieHeader) {
  const result = {};

  String(cookieHeader || '')
    .split(';')
    .forEach((part) => {
      const separator = part.indexOf('=');

      if (separator <= 0) {
        return;
      }

      const name = part
        .slice(0, separator)
        .trim();
      const value = part
        .slice(separator + 1)
        .trim();

      try {
        result[name] = decodeURIComponent(value);
      } catch {
        result[name] = value;
      }
    });

  return result;
}

export function sha256PortalToken(value) {
  return createHash('sha256')
    .update(String(value))
    .digest('hex');
}

export function buildPortalSessionCookie(token) {
  return [
    `${PORTAL_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${SESSION_IDLE_TIMEOUT_SECONDS}`,
  ].join('; ');
}

export function buildClearedPortalSessionCookie() {
  return [
    `${PORTAL_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].join('; ');
}

function base64ToBytes(value) {
  return new Uint8Array(
    Buffer.from(value, 'base64')
  );
}

let encryptionKeyPromise = null;

async function getEncryptionKey() {
  if (encryptionKeyPromise) {
    return encryptionKeyPromise;
  }

  const rawKey = base64ToBytes(
    AUTH_FLOW_ENCRYPTION_KEY
  );

  if (rawKey.length !== 32) {
    throw new Error(
      'AUTH_FLOW_ENCRYPTION_KEY must decode to exactly 32 bytes.'
    );
  }

  encryptionKeyPromise = webcrypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  return encryptionKeyPromise;
}

async function decryptSecret({
  encrypted,
  iv,
  encryptionKey,
}) {
  const decrypted = await webcrypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToBytes(iv),
    },
    encryptionKey,
    base64ToBytes(encrypted)
  );

  return new TextDecoder().decode(decrypted);
}

async function encryptSecret(
  secret,
  encryptionKey
) {
  const iv = webcrypto.getRandomValues(
    new Uint8Array(12)
  );

  const encrypted = await webcrypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    encryptionKey,
    new TextEncoder().encode(secret)
  );

  return {
    encrypted: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  };
}

export function decodeSupabaseJwt(token) {
  const parts = String(token || '').split('.');

  if (parts.length !== 3) {
    throw new Error('SERVER_AUTH_TOKEN_INVALID');
  }

  let normalized = parts[1]
    .replaceAll('-', '+')
    .replaceAll('_', '/');

  while (normalized.length % 4 !== 0) {
    normalized += '=';
  }

  try {
    return JSON.parse(
      Buffer.from(normalized, 'base64').toString('utf8')
    );
  } catch {
    throw new Error('SERVER_AUTH_TOKEN_INVALID');
  }
}

function assertAuthContext({
  securitySession,
  accessToken,
  mfaEnabled,
}) {
  const jwt = decodeSupabaseJwt(accessToken);
  const aal = String(jwt.aal || '')
    .trim()
    .toLowerCase();

  if (
    jwt.sub !== securitySession.user_id ||
    jwt.session_id !== securitySession.auth_session_id ||
    !['aal1', 'aal2'].includes(aal)
  ) {
    throw new Error('SERVER_AUTH_CONTEXT_INVALID');
  }

  if (mfaEnabled && aal !== 'aal2') {
    const error = new Error('MFA_AAL2_REQUIRED');
    error.code = 'MFA_AAL2_REQUIRED';
    throw error;
  }

  return {
    jwt,
    aal,
  };
}

async function loadLatestSessionCredentials(securitySession) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from('security_sessions')
    .select(`
      id,
      user_id,
      auth_session_id,
      status,
      encrypted_access_token,
      access_token_iv,
      encrypted_refresh_token,
      refresh_token_iv
    `)
    .eq('id', securitySession.id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (
    !data ||
    data.user_id !== securitySession.user_id ||
    data.auth_session_id !== securitySession.auth_session_id
  ) {
    return null;
  }

  return data;
}

function applyLatestCredentialsToSnapshot(
  securitySession,
  latest
) {
  securitySession.encrypted_access_token = latest.encrypted_access_token;
  securitySession.access_token_iv = latest.access_token_iv;
  securitySession.encrypted_refresh_token = latest.encrypted_refresh_token;
  securitySession.refresh_token_iv = latest.refresh_token_iv;
}

async function recoverFromConcurrentRefresh({
  securitySession,
  expectedEncryptedRefreshToken,
  expectedRefreshTokenIv,
  mfaEnabled,
}) {
  /*
    Vercel can execute multiple protected requests for the same browser at
    the same time. Around JWT expiry, two requests can therefore attempt to
    rotate the same Supabase refresh token concurrently.

    One request wins the DB compare-and-swap below. A loser must reload the
    winner's freshly encrypted credentials instead of falsely expiring the
    Buddy Fleets session.
  */
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const latest = await loadLatestSessionCredentials(
      securitySession
    );

    if (!latest) {
      return null;
    }

    const rotatedByAnotherRequest =
      latest.encrypted_refresh_token !== expectedEncryptedRefreshToken ||
      latest.refresh_token_iv !== expectedRefreshTokenIv;

    if (!rotatedByAnotherRequest) {
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 40));
        continue;
      }

      return null;
    }

    if (
      !latest.encrypted_access_token ||
      !latest.access_token_iv
    ) {
      return null;
    }

    const encryptionKey = await getEncryptionKey();
    const latestAccessToken = await decryptSecret({
      encrypted: latest.encrypted_access_token,
      iv: latest.access_token_iv,
      encryptionKey,
    });

    const authContext = assertAuthContext({
      securitySession,
      accessToken: latestAccessToken,
      mfaEnabled,
    });

    const {
      data: userResult,
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      latestAccessToken
    );

    if (
      !userError &&
      userResult?.user?.id === securitySession.user_id
    ) {
      applyLatestCredentialsToSnapshot(
        securitySession,
        latest
      );

      return {
        authUser: userResult.user,
        authSession: null,
        jwt: authContext.jwt,
        aal: authContext.aal,
        refreshed: true,
        concurrentRefreshRecovered: true,
      };
    }

    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }

  return null;
}

async function persistRotatedSupabaseTokens({
  securitySession,
  authSession,
  expectedEncryptedRefreshToken,
  expectedRefreshTokenIv,
}) {
  if (
    !authSession?.access_token ||
    !authSession?.refresh_token
  ) {
    throw new Error('AUTH_SESSION_REFRESH_FAILED');
  }

  const encryptionKey = await getEncryptionKey();
  const [access, refresh] = await Promise.all([
    encryptSecret(
      authSession.access_token,
      encryptionKey
    ),
    encryptSecret(
      authSession.refresh_token,
      encryptionKey
    ),
  ]);

  const {
    data,
    error,
  } = await supabaseAdmin
    .from('security_sessions')
    .update({
      encrypted_access_token: access.encrypted,
      access_token_iv: access.iv,
      encrypted_refresh_token: refresh.encrypted,
      refresh_token_iv: refresh.iv,
    })
    .eq('id', securitySession.id)
    .eq('status', 'active')
    .eq('auth_session_id', securitySession.auth_session_id)
    .eq('encrypted_refresh_token', expectedEncryptedRefreshToken)
    .eq('refresh_token_iv', expectedRefreshTokenIv)
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    persisted: Boolean(data?.id),
    access,
    refresh,
  };
}

async function refreshSupabaseSession({
  securitySession,
  refreshToken,
  mfaEnabled,
}) {
  const expectedEncryptedRefreshToken =
    securitySession.encrypted_refresh_token;
  const expectedRefreshTokenIv =
    securitySession.refresh_token_iv;

  const userClient = createUserAuthClient();

  const {
    data,
    error,
  } = await userClient.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (
    error ||
    !data?.session ||
    !data?.user ||
    data.user.id !== securitySession.user_id
  ) {
    const concurrentRecovery =
      await recoverFromConcurrentRefresh({
        securitySession,
        expectedEncryptedRefreshToken,
        expectedRefreshTokenIv,
        mfaEnabled,
      });

    if (concurrentRecovery) {
      return concurrentRecovery;
    }

    const refreshError = new Error(
      'AUTH_SESSION_REFRESH_FAILED'
    );
    refreshError.cause = error || null;
    throw refreshError;
  }

  const authContext = assertAuthContext({
    securitySession,
    accessToken: data.session.access_token,
    mfaEnabled,
  });

  const persistedTokens =
    await persistRotatedSupabaseTokens({
      securitySession,
      authSession: data.session,
      expectedEncryptedRefreshToken,
      expectedRefreshTokenIv,
    });

  if (!persistedTokens.persisted) {
    const concurrentRecovery =
      await recoverFromConcurrentRefresh({
        securitySession,
        expectedEncryptedRefreshToken,
        expectedRefreshTokenIv,
        mfaEnabled,
      });

    if (concurrentRecovery) {
      return concurrentRecovery;
    }

    throw new Error(
      'APPLICATION_SESSION_REVOKED_DURING_REFRESH'
    );
  }

  /* Keep the caller's in-memory session snapshot current so later work in
     the same request cannot accidentally reuse stale encrypted credentials. */
  securitySession.encrypted_access_token = persistedTokens.access.encrypted;
  securitySession.access_token_iv = persistedTokens.access.iv;
  securitySession.encrypted_refresh_token = persistedTokens.refresh.encrypted;
  securitySession.refresh_token_iv = persistedTokens.refresh.iv;

  return {
    authUser: data.user,
    authSession: data.session,
    jwt: authContext.jwt,
    aal: authContext.aal,
    refreshed: true,
    concurrentRefreshRecovered: false,
  };
}

export async function verifyAndRefreshSupabaseSession({
  securitySession,
  mfaEnabled = false,
}) {
  if (
    !securitySession?.encrypted_access_token ||
    !securitySession?.access_token_iv ||
    !securitySession?.encrypted_refresh_token ||
    !securitySession?.refresh_token_iv
  ) {
    throw new Error('SERVER_AUTH_TOKEN_MISSING');
  }

  const encryptionKey = await getEncryptionKey();
  const [accessToken, refreshToken] = await Promise.all([
    decryptSecret({
      encrypted: securitySession.encrypted_access_token,
      iv: securitySession.access_token_iv,
      encryptionKey,
    }),
    decryptSecret({
      encrypted: securitySession.encrypted_refresh_token,
      iv: securitySession.refresh_token_iv,
      encryptionKey,
    }),
  ]);

  const currentContext = assertAuthContext({
    securitySession,
    accessToken,
    mfaEnabled,
  });

  const jwtExpiryMs =
    Number(currentContext.jwt.exp) * 1000;
  const shouldRefresh =
    !Number.isFinite(jwtExpiryMs) ||
    jwtExpiryMs <=
      Date.now() + AUTH_REFRESH_SKEW_SECONDS * 1000;

  if (shouldRefresh) {
    return refreshSupabaseSession({
      securitySession,
      refreshToken,
      mfaEnabled,
    });
  }

  const {
    data: userResult,
    error: userError,
  } = await supabaseAdmin.auth.getUser(
    accessToken
  );

  if (
    !userError &&
    userResult?.user?.id === securitySession.user_id
  ) {
    return {
      authUser: userResult.user,
      authSession: null,
      jwt: currentContext.jwt,
      aal: currentContext.aal,
      refreshed: false,
    };
  }

  /* A short-lived access-token validation failure is not enough to kill the
     Buddy Fleets session while a valid refresh token still exists. Try the
     refresh flow once before declaring the underlying auth session invalid. */
  return refreshSupabaseSession({
    securitySession,
    refreshToken,
    mfaEnabled,
  });
}

export async function loadPortalSecuritySession(
  sessionToken,
  { portalType = null } = {}
) {
  const tokenHash = sha256PortalToken(
    sessionToken
  );

  let query = supabaseAdmin
    .from('security_sessions')
    .select(`
      id,
      user_id,
      auth_session_id,
      portal_type,
      company_id,
      device_id_hash,
      ip_address,
      user_agent,
      status,
      created_at,
      last_seen_at,
      http_session_created_at,
      http_session_expires_at,
      encrypted_access_token,
      access_token_iv,
      encrypted_refresh_token,
      refresh_token_iv
    `)
    .eq('portal_session_token_hash', tokenHash)
    .eq('status', 'active');

  if (portalType) {
    query = query.eq('portal_type', portalType);
  }

  const {
    data,
    error,
  } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function isApplicationSessionExpired(
  securitySession,
  now = Date.now()
) {
  const expiresAt = Date.parse(
    securitySession?.http_session_expires_at || ''
  );

  return (
    !Number.isFinite(expiresAt) ||
    expiresAt <= now
  );
}


async function requestSupabaseLocalLogout(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/logout?scope=local`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_CLIENT_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

export async function revokeSupabaseAuthSessionBestEffort(
  securitySession
) {
  if (
    !securitySession?.user_id ||
    !securitySession?.auth_session_id ||
    !securitySession?.encrypted_access_token ||
    !securitySession?.access_token_iv
  ) {
    return false;
  }

  try {
    const encryptionKey = await getEncryptionKey();
    const accessToken = await decryptSecret({
      encrypted: securitySession.encrypted_access_token,
      iv: securitySession.access_token_iv,
      encryptionKey,
    });

    assertAuthContext({
      securitySession,
      accessToken,
      mfaEnabled: false,
    });

    if (await requestSupabaseLocalLogout(accessToken)) {
      return true;
    }

    if (
      !securitySession.encrypted_refresh_token ||
      !securitySession.refresh_token_iv
    ) {
      return false;
    }

    const refreshToken = await decryptSecret({
      encrypted: securitySession.encrypted_refresh_token,
      iv: securitySession.refresh_token_iv,
      encryptionKey,
    });

    const userClient = createUserAuthClient();
    const { data, error } = await userClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (
      error ||
      !data?.session?.access_token ||
      !data?.user ||
      data.user.id !== securitySession.user_id
    ) {
      return false;
    }

    assertAuthContext({
      securitySession,
      accessToken: data.session.access_token,
      mfaEnabled: false,
    });

    return await requestSupabaseLocalLogout(
      data.session.access_token
    );
  } catch (error) {
    console.error(
      'Best-effort upstream Supabase session revocation failed:',
      error?.message
    );
    return false;
  }
}

async function loadSessionForInvalidation(sessionId) {
  if (!sessionId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('security_sessions')
    .select(`
      id,
      user_id,
      auth_session_id,
      status,
      encrypted_access_token,
      access_token_iv,
      encrypted_refresh_token,
      refresh_token_iv
    `)
    .eq('id', sessionId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function invalidatePortalSecuritySession({
  sessionId,
  reason,
  expired = false,
}) {
  if (!sessionId) {
    return;
  }

  const now = new Date().toISOString();
  let sessionSnapshot = null;

  try {
    sessionSnapshot = await loadSessionForInvalidation(
      sessionId
    );
  } catch (error) {
    console.error(
      'Session invalidation credential snapshot failed:',
      error?.message
    );
  }

  /*
    Buddy Fleets is the primary session authority. Mark the application
    session inactive first so no concurrent protected request can continue
    while upstream Auth cleanup is attempted.

    Credentials are scrubbed in the same authoritative update. The in-memory
    snapshot above is used only for best-effort exact-session Supabase logout.
  */
  const {
    error,
  } = await supabaseAdmin
    .from('security_sessions')
    .update({
      status: expired ? 'expired' : 'revoked',
      revoked_at: now,
      revoke_reason: reason,
      portal_session_token_hash: null,
      encrypted_access_token: null,
      access_token_iv: null,
      encrypted_refresh_token: null,
      refresh_token_iv: null,
      http_session_expires_at: null,
    })
    .eq('id', sessionId)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  if (sessionSnapshot) {
    await revokeSupabaseAuthSessionBestEffort(
      sessionSnapshot
    );
  }
}

export async function renewPortalIdleWindow({
  sessionId,
  ipAddress = null,
  userAgent = '',
}) {
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SESSION_IDLE_TIMEOUT_MS
  ).toISOString();

  const patch = {
    last_seen_at: now.toISOString(),
    http_session_expires_at: expiresAt,
  };

  if (ipAddress) {
    patch.ip_address = ipAddress;
  }

  if (userAgent) {
    patch.user_agent = userAgent;
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from('security_sessions')
    .update(patch)
    .eq('id', sessionId)
    .eq('status', 'active')
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw new Error('APPLICATION_SESSION_NOT_ACTIVE');
  }

  return {
    lastSeenAt: now.toISOString(),
    expiresAt,
    serverTime: now.toISOString(),
    timeoutMinutes: SESSION_IDLE_TIMEOUT_MINUTES,
    idleTimeoutSeconds: SESSION_IDLE_TIMEOUT_SECONDS,
  };
}

export function getSessionContextChanges({
  securitySession,
  currentIp,
  currentUserAgent,
}) {
  return {
    ipChanged:
      Boolean(
        securitySession?.ip_address &&
          currentIp &&
          String(securitySession.ip_address) !==
            String(currentIp)
      ),
    browserChanged:
      Boolean(
        securitySession?.user_agent &&
          currentUserAgent &&
          securitySession.user_agent !==
            currentUserAgent
      ),
  };
}

export async function writePortalSecurityEvent({
  userId = null,
  companyId = null,
  eventType,
  portalType = null,
  ipAddress = null,
  userAgent = '',
  metadata = {},
}) {
  const {
    error,
  } = await supabaseAdmin
    .from('security_events')
    .insert({
      user_id: userId,
      company_id: companyId,
      event_type: eventType,
      portal_type: portalType,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata,
    });

  if (error) {
    console.error(
      'Portal security event write failed:',
      error.message
    );
  }
}
