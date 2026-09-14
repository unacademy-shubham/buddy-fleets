import {
  createHash,
  webcrypto,
} from 'node:crypto';

import {
  createClient,
} from '@supabase/supabase-js';


/* ============================================================
   BUDDY FLEETS
   DEVELOPER PORTAL API AUTHORIZATION

   Purpose:
   - Protect /api/developer/* endpoints
   - Reuse existing __Host-bf_session architecture
   - Developer portal only
   - Active platform admin only
   - Never trusts frontend role flags
   - Never exposes stored authentication credentials
============================================================ */


const COOKIE_NAME =
  '__Host-bf_session';

const DEVELOPER_HOST =
  'developer.buddyfleets.in';


/* ============================================================
   ENVIRONMENT
============================================================ */

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const AUTH_FLOW_ENCRYPTION_KEY =
  process.env.AUTH_FLOW_ENCRYPTION_KEY;


if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !AUTH_FLOW_ENCRYPTION_KEY
) {
  throw new Error(
    'Required Developer API environment variables are missing.'
  );
}


/* ============================================================
   ADMIN CLIENT
============================================================ */

const supabaseAdmin =
  createClient(
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


/* ============================================================
   HOST
============================================================ */

function normalizeHost(value) {
  return String(value || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');
}


function getRequestHost(req) {
  return normalizeHost(
    req.headers['x-forwarded-host'] ||
    req.headers.host
  );
}


/* ============================================================
   SAME ORIGIN
============================================================ */

function originMatchesHost(
  req,
  requestHost
) {
  const origin =
    req.headers.origin;

  /*
    GET requests do not always contain Origin.
  */

  if (!origin) {
    return true;
  }

  try {
    const url =
      new URL(origin);

    return (
      url.protocol === 'https:' &&
      normalizeHost(url.hostname) ===
        requestHost
    );
  } catch {
    return false;
  }
}


/* ============================================================
   REQUEST METADATA
============================================================ */

function getClientIp(req) {
  const forwarded =
    req.headers['x-forwarded-for'];

  if (forwarded) {
    return String(forwarded)
      .split(',')[0]
      .trim();
  }

  const realIp =
    req.headers['x-real-ip'];

  if (realIp) {
    return String(realIp).trim();
  }

  return null;
}


function getUserAgent(req) {
  return String(
    req.headers['user-agent'] ||
    ''
  ).slice(
    0,
    1000
  );
}


/* ============================================================
   COOKIE
============================================================ */

function parseCookies(
  cookieHeader
) {
  const result = {};

  if (!cookieHeader) {
    return result;
  }

  String(cookieHeader)
    .split(';')
    .forEach((part) => {
      const separator =
        part.indexOf('=');

      if (separator <= 0) {
        return;
      }

      const name =
        part
          .slice(
            0,
            separator
          )
          .trim();

      const value =
        part
          .slice(
            separator + 1
          )
          .trim();

      try {
        result[name] =
          decodeURIComponent(
            value
          );
      } catch {
        result[name] =
          value;
      }
    });

  return result;
}


export function clearDeveloperSessionCookie(
  res
) {
  res.setHeader(
    'Set-Cookie',
    [
      `${COOKIE_NAME}=`,
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Max-Age=0',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ].join('; ')
  );
}


/* ============================================================
   RESPONSE HEADERS
============================================================ */

export function setDeveloperApiHeaders(
  res
) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate'
  );

  res.setHeader(
    'Pragma',
    'no-cache'
  );

  res.setHeader(
    'Expires',
    '0'
  );

  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  res.setHeader(
    'Referrer-Policy',
    'no-referrer'
  );

  res.setHeader(
    'X-Frame-Options',
    'DENY'
  );
}


/* ============================================================
   HASH
============================================================ */

function sha256Hex(
  value
) {
  return createHash(
    'sha256'
  )
    .update(value)
    .digest('hex');
}


/* ============================================================
   AES-GCM
============================================================ */

function base64ToBytes(
  value
) {
  return new Uint8Array(
    Buffer.from(
      value,
      'base64'
    )
  );
}


async function getEncryptionKey() {
  const rawKey =
    base64ToBytes(
      AUTH_FLOW_ENCRYPTION_KEY
    );

  if (
    rawKey.length !==
    32
  ) {
    throw new Error(
      'AUTH_FLOW_ENCRYPTION_KEY must decode to exactly 32 bytes.'
    );
  }

  return await webcrypto
    .subtle
    .importKey(
      'raw',
      rawKey,
      {
        name: 'AES-GCM',
      },
      false,
      [
        'decrypt',
      ]
    );
}


async function decryptSecret({
  encrypted,
  iv,
  encryptionKey,
}) {
  const result =
    await webcrypto
      .subtle
      .decrypt(
        {
          name: 'AES-GCM',

          iv:
            base64ToBytes(
              iv
            ),
        },

        encryptionKey,

        base64ToBytes(
          encrypted
        )
      );

  return new TextDecoder()
    .decode(result);
}


/* ============================================================
   JWT
============================================================ */

function decodeJwtPayload(
  token
) {
  const parts =
    String(token || '')
      .split('.');

  if (
    parts.length !==
    3
  ) {
    throw new Error(
      'INVALID_JWT'
    );
  }

  const normalized =
    parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const padded =
    normalized.padEnd(
      Math.ceil(
        normalized.length / 4
      ) * 4,
      '='
    );

  return JSON.parse(
    Buffer
      .from(
        padded,
        'base64'
      )
      .toString(
        'utf8'
      )
  );
}


/* ============================================================
   SESSION INVALIDATION
============================================================ */

async function invalidateSecuritySession({
  sessionId,
  reason,
  expired = false,
}) {
  if (!sessionId) {
    return;
  }

  await supabaseAdmin
    .from(
      'security_sessions'
    )
    .update({
      status:
        expired
          ? 'expired'
          : 'revoked',

      revoked_at:
        new Date()
          .toISOString(),

      revoke_reason:
        reason,

      portal_session_token_hash:
        null,

      encrypted_access_token:
        null,

      access_token_iv:
        null,

      encrypted_refresh_token:
        null,

      refresh_token_iv:
        null,
    })
    .eq(
      'id',
      sessionId
    )
    .eq(
      'status',
      'active'
    );
}


/* ============================================================
   SESSION LOOKUP
============================================================ */

async function loadSecuritySession(
  sessionToken
) {
  const tokenHash =
    sha256Hex(
      sessionToken
    );

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        'security_sessions'
      )
      .select(`
        id,
        user_id,
        auth_session_id,
        portal_type,
        company_id,
        ip_address,
        user_agent,
        status,
        last_seen_at,
        http_session_expires_at,
        encrypted_access_token,
        access_token_iv
      `)
      .eq(
        'portal_session_token_hash',
        tokenHash
      )
      .eq(
        'status',
        'active'
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


/* ============================================================
   MAIN AUTHORIZATION
============================================================ */

export async function requireDeveloperSession(
  req
) {
  const requestHost =
    getRequestHost(req);

  if (
    requestHost !==
    DEVELOPER_HOST
  ) {
    return {
      ok: false,
      status: 403,
      code: 'DEVELOPER_HOST_REQUIRED',
      clearCookie: true,
    };
  }


  if (
    !originMatchesHost(
      req,
      requestHost
    )
  ) {
    return {
      ok: false,
      status: 403,
      code: 'ORIGIN_NOT_ALLOWED',
    };
  }


  const secFetchSite =
    String(
      req.headers[
        'sec-fetch-site'
      ] || ''
    ).toLowerCase();


  if (
    secFetchSite &&
    ![
      'same-origin',
      'none',
    ].includes(
      secFetchSite
    )
  ) {
    return {
      ok: false,
      status: 403,
      code:
        'CROSS_SITE_REQUEST_BLOCKED',
    };
  }


  const cookies =
    parseCookies(
      req.headers.cookie
    );

  const sessionToken =
    cookies[
      COOKIE_NAME
    ];


  if (
    !sessionToken ||
    sessionToken.length < 20 ||
    sessionToken.length > 200
  ) {
    return {
      ok: false,
      status: 401,
      code: 'SESSION_REQUIRED',
      clearCookie: true,
    };
  }


  let securitySession;

  try {
    securitySession =
      await loadSecuritySession(
        sessionToken
      );
  } catch (error) {
    console.error(
      'Developer API session lookup failed:',
      error?.message
    );

    return {
      ok: false,
      status: 503,
      code:
        'SECURITY_SERVICE_UNAVAILABLE',
    };
  }


  if (
    !securitySession ||
    securitySession.portal_type !==
      'developer'
  ) {
    return {
      ok: false,
      status: 401,
      code: 'SESSION_INVALID',
      clearCookie: true,
    };
  }


  /* ==========================================================
     HTTP SESSION EXPIRY
  ========================================================== */

  const expiry =
    new Date(
      securitySession
        .http_session_expires_at
    ).getTime();


  if (
    !Number.isFinite(
      expiry
    ) ||
    expiry <=
      Date.now()
  ) {
    await invalidateSecuritySession({
      sessionId:
        securitySession.id,

      reason:
        'HTTP_SESSION_EXPIRED',

      expired:
        true,
    }).catch(() => {});

    return {
      ok: false,
      status: 401,
      code: 'SESSION_EXPIRED',
      clearCookie: true,
    };
  }


  /* ==========================================================
     IP / USER AGENT BINDING
  ========================================================== */

  const currentIp =
    getClientIp(req);

  const currentUserAgent =
    getUserAgent(req);


  if (
    securitySession.ip_address &&
    (
      !currentIp ||
      String(currentIp) !==
        String(
          securitySession
            .ip_address
        )
    )
  ) {
    await invalidateSecuritySession({
      sessionId:
        securitySession.id,

      reason:
        'IP_CHANGED',
    }).catch(() => {});

    return {
      ok: false,
      status: 401,
      code:
        'SECURITY_CONTEXT_CHANGED',
      clearCookie: true,
    };
  }


  if (
    securitySession.user_agent &&
    currentUserAgent !==
      securitySession.user_agent
  ) {
    await invalidateSecuritySession({
      sessionId:
        securitySession.id,

      reason:
        'BROWSER_CHANGED',
    }).catch(() => {});

    return {
      ok: false,
      status: 401,
      code:
        'SECURITY_CONTEXT_CHANGED',
      clearCookie: true,
    };
  }


  /* ==========================================================
     ACCOUNT SECURITY
  ========================================================== */

  const {
    data:
      accountSecurity,

    error:
      securityError,
  } =
    await supabaseAdmin
      .from(
        'user_security'
      )
      .select(`
        user_id,
        is_locked,
        mfa_enabled
      `)
      .eq(
        'user_id',
        securitySession.user_id
      )
      .maybeSingle();


  if (securityError) {
    console.error(
      'Developer account security lookup failed:',
      securityError.message
    );

    return {
      ok: false,
      status: 503,
      code:
        'SECURITY_SERVICE_UNAVAILABLE',
    };
  }


  if (
    !accountSecurity ||
    accountSecurity.is_locked
  ) {
    await invalidateSecuritySession({
      sessionId:
        securitySession.id,

      reason:
        'ACCOUNT_SECURITY_LOCK',
    }).catch(() => {});

    return {
      ok: false,
      status: 423,
      code: 'ACCOUNT_LOCKED',
      clearCookie: true,
    };
  }


  /* ==========================================================
     ACTIVE PLATFORM ADMIN
  ========================================================== */

  const {
    data:
      platformAdmin,

    error:
      platformAdminError,
  } =
    await supabaseAdmin
      .from(
        'platform_admins'
      )
      .select(`
        user_id,
        is_active
      `)
      .eq(
        'user_id',
        securitySession.user_id
      )
      .eq(
        'is_active',
        true
      )
      .maybeSingle();


  if (platformAdminError) {
    console.error(
      'Platform admin lookup failed:',
      platformAdminError.message
    );

    return {
      ok: false,
      status: 503,
      code:
        'SECURITY_SERVICE_UNAVAILABLE',
    };
  }


  if (
    !platformAdmin
  ) {
    await invalidateSecuritySession({
      sessionId:
        securitySession.id,

      reason:
        'DEVELOPER_ACCESS_REVOKED',
    }).catch(() => {});

    return {
      ok: false,
      status: 403,
      code:
        'DEVELOPER_ACCESS_REVOKED',
      clearCookie: true,
    };
  }


  /* ==========================================================
     STORED SUPABASE AUTH SESSION
  ========================================================== */

  if (
    !securitySession
      .encrypted_access_token ||
    !securitySession
      .access_token_iv
  ) {
    await invalidateSecuritySession({
      sessionId:
        securitySession.id,

      reason:
        'SERVER_AUTH_TOKEN_MISSING',
    }).catch(() => {});

    return {
      ok: false,
      status: 401,
      code: 'SESSION_INVALID',
      clearCookie: true,
    };
  }


  try {
    const encryptionKey =
      await getEncryptionKey();


    const accessToken =
      await decryptSecret({
        encrypted:
          securitySession
            .encrypted_access_token,

        iv:
          securitySession
            .access_token_iv,

        encryptionKey,
      });


    const jwt =
      decodeJwtPayload(
        accessToken
      );


    const jwtAal =
      String(
        jwt.aal || ''
      )
        .trim()
        .toLowerCase();


    if (
      jwt.sub !==
        securitySession.user_id ||
      jwt.session_id !==
        securitySession
          .auth_session_id ||
      ![
        'aal1',
        'aal2',
      ].includes(
        jwtAal
      )
    ) {
      throw new Error(
        'SERVER_AUTH_CONTEXT_INVALID'
      );
    }


    if (
      accountSecurity
        .mfa_enabled === true &&
      jwtAal !==
        'aal2'
    ) {
      throw new Error(
        'MFA_AAL2_REQUIRED'
      );
    }


    const {
      data:
        authResult,

      error:
        authError,
    } =
      await supabaseAdmin
        .auth
        .getUser(
          accessToken
        );


    if (
      authError ||
      !authResult?.user ||
      authResult.user.id !==
        securitySession.user_id
    ) {
      throw new Error(
        'SERVER_AUTH_USER_INVALID'
      );
    }


    /*
      Touch session activity.
    */

    await supabaseAdmin
      .from(
        'security_sessions'
      )
      .update({
        last_seen_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'id',
        securitySession.id
      )
      .eq(
        'status',
        'active'
      );


    return {
      ok: true,

      supabaseAdmin,

      user: {
        id:
          authResult.user.id,

        email:
          authResult.user.email ||
          null,

        role:
          'SUPER_ADMIN',

        portalType:
          'developer',

        isPlatformAdmin:
          true,

        mfaEnabled:
          accountSecurity
            .mfa_enabled ===
          true,

        aal:
          jwtAal,
      },

      securitySession: {
        id:
          securitySession.id,

        userId:
          securitySession.user_id,

        portalType:
          'developer',

        expiresAt:
          securitySession
            .http_session_expires_at,
      },
    };
  } catch (error) {
    console.error(
      'Developer API Supabase session verification failed:',
      error?.message
    );


    await invalidateSecuritySession({
      sessionId:
        securitySession.id,

      reason:
        error?.message ===
          'MFA_AAL2_REQUIRED'
          ? 'MFA_AAL2_REQUIRED'
          : 'SUPABASE_SESSION_INVALID',
    }).catch(() => {});


    return {
      ok: false,
      status: 401,
      code:
        error?.message ===
          'MFA_AAL2_REQUIRED'
          ? 'MFA_AAL2_REQUIRED'
          : 'SESSION_INVALID',

      clearCookie: true,
    };
  }
}