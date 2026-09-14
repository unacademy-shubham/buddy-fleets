import {
  createHash,
  webcrypto,
} from 'node:crypto';

import { createClient } from '@supabase/supabase-js';


/* ============================================================
   BUDDY FLEETS
   SECURE PORTAL LOGOUT

   POST /api/auth/logout

   Portal architecture:
   - developer.buddyfleets.in
   - team.buddyfleets.in
   - portal.buddyfleets.in/{companySlug}/...

   SECURITY:
   - Same-origin portal request only
   - Host-only HttpOnly session cookie
   - Server-side session revocation
   - Stored auth credentials scrubbed
   - Best-effort Supabase Auth revocation
   - Cookie invalidated server-side
   - Logout is idempotent
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const COOKIE_NAME =
  '__Host-bf_session';


const DEVELOPER_HOST =
  'developer.buddyfleets.in';

const TEAM_HOST =
  'team.buddyfleets.in';

const COMPANY_PORTAL_HOST =
  'portal.buddyfleets.in';


/* ============================================================
   ENVIRONMENT
============================================================ */

const SUPABASE_URL =
  process.env
    .SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY;

const AUTH_FLOW_ENCRYPTION_KEY =
  process.env
    .AUTH_FLOW_ENCRYPTION_KEY;


if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !AUTH_FLOW_ENCRYPTION_KEY
) {
  throw new Error(
    'Required server authentication environment variables are missing.'
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
        persistSession:
          false,

        autoRefreshToken:
          false,

        detectSessionInUrl:
          false,
      },
    }
  );


/* ============================================================
   RESPONSE SECURITY
============================================================ */

function setSecurityHeaders(
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


function sendJson(
  res,
  status,
  payload
) {
  setSecurityHeaders(
    res
  );

  return res
    .status(status)
    .json(payload);
}


/* ============================================================
   COOKIE
============================================================ */

function parseCookies(
  cookieHeader
) {
  const cookies = {};


  if (!cookieHeader) {
    return cookies;
  }


  String(
    cookieHeader
  )
    .split(';')
    .forEach(
      (part) => {
        const separator =
          part.indexOf('=');


        if (
          separator <= 0
        ) {
          return;
        }


        const name =
          part
            .slice(
              0,
              separator
            )
            .trim();


        const rawValue =
          part
            .slice(
              separator + 1
            )
            .trim();


        try {
          cookies[name] =
            decodeURIComponent(
              rawValue
            );
        } catch {
          cookies[name] =
            rawValue;
        }
      }
    );


  return cookies;
}


function clearSessionCookie(
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
   SHA-256
============================================================ */

function sha256Hex(
  value
) {
  return createHash(
    'sha256'
  )
    .update(
      value
    )
    .digest(
      'hex'
    );
}


/* ============================================================
   HOST
============================================================ */

function normalizeHost(
  value
) {
  return String(
    value || ''
  )
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(
      /:\d+$/,
      ''
    );
}


function getRequestHost(
  req
) {
  return normalizeHost(
    req.headers[
      'x-forwarded-host'
    ] ||
    req.headers.host
  );
}


function isPortalHost(
  host
) {
  return [
    DEVELOPER_HOST,
    TEAM_HOST,
    COMPANY_PORTAL_HOST,
  ].includes(
    normalizeHost(
      host
    )
  );
}


/* ============================================================
   ORIGIN
============================================================ */

function originMatchesHost(
  req,
  requestHost
) {
  const origin =
    req.headers.origin;


  if (!origin) {
    return false;
  }


  try {
    const url =
      new URL(
        origin
      );


    return (
      url.protocol ===
        'https:' &&
      normalizeHost(
        url.hostname
      ) ===
        requestHost
    );
  } catch {
    return false;
  }
}


/* ============================================================
   NETWORK
============================================================ */

function getClientIp(
  req
) {
  const forwarded =
    req.headers[
      'x-forwarded-for'
    ];


  if (forwarded) {
    return String(
      forwarded
    )
      .split(',')[0]
      .trim();
  }


  const realIp =
    req.headers[
      'x-real-ip'
    ];


  if (realIp) {
    return String(
      realIp
    ).trim();
  }


  return null;
}


function getUserAgent(
  req
) {
  return String(
    req.headers[
      'user-agent'
    ] || ''
  ).slice(
    0,
    1000
  );
}


/* ============================================================
   AES-GCM DECRYPTION
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
        name:
          'AES-GCM',
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
  const decrypted =
    await webcrypto
      .subtle
      .decrypt(
        {
          name:
            'AES-GCM',

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
    .decode(
      decrypted
    );
}


/* ============================================================
   SECURITY EVENT
============================================================ */

async function writeSecurityEvent({
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
  } =
    await supabaseAdmin
      .from(
        'security_events'
      )
      .insert({
        user_id:
          userId,

        company_id:
          companyId,

        event_type:
          eventType,

        portal_type:
          portalType,

        ip_address:
          ipAddress,

        user_agent:
          userAgent,

        metadata,
      });


  if (error) {
    console.error(
      'Security event write failed:',
      error.message
    );
  }
}


/* ============================================================
   SESSION LOOKUP
============================================================ */

async function getSecuritySession(
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
        status,
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
   EXPECTED HOST
============================================================ */

async function getExpectedHost(
  securitySession
) {
  if (
    securitySession.portal_type ===
    'developer'
  ) {
    return DEVELOPER_HOST;
  }


  if (
    securitySession.portal_type ===
    'team'
  ) {
    return TEAM_HOST;
  }


  if (
    securitySession.portal_type ===
      'company' &&
    securitySession.company_id
  ) {
    const {
      data:
        company,
      error,
    } =
      await supabaseAdmin
        .from(
          'companies'
        )
        .select(`
          id,
          status,
          subdomain_slug
        `)
        .eq(
          'id',
          securitySession
            .company_id
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    if (
      !company ||
      !company.subdomain_slug ||
      ![
        'trial_active',
        'trial_expired',
        'active',
      ].includes(
        company.status
      )
    ) {
      return null;
    }


    return COMPANY_PORTAL_HOST;
  }


  return null;
}


/* ============================================================
   REVOKE APPLICATION SESSION
============================================================ */

async function revokeSecuritySession(
  sessionId
) {
  const {
    error,
  } =
    await supabaseAdmin
      .from(
        'security_sessions'
      )
      .update({
        status:
          'revoked',

        revoked_at:
          new Date()
            .toISOString(),

        revoke_reason:
          'USER_LOGOUT',

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

        http_session_expires_at:
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


  if (error) {
    throw error;
  }
}


/* ============================================================
   BEST-EFFORT SUPABASE AUTH REVOCATION

   App session revocation above remains authoritative even if
   upstream Auth logout is temporarily unavailable.
============================================================ */

async function revokeSupabaseAuthSession(
  securitySession
) {
  if (
    !securitySession
      ?.encrypted_access_token ||
    !securitySession
      ?.access_token_iv
  ) {
    return;
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


    /*
      Revoke the authenticated Supabase session.

      Failure here must never prevent Buddy Fleets'
      own server-side session from being revoked.
    */

    await fetch(
      `${SUPABASE_URL}/auth/v1/logout?scope=global`,
      {
        method:
          'POST',

        headers: {
          apikey:
            SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            `Bearer ${accessToken}`,

          'Content-Type':
            'application/json',
        },
      }
    );
  } catch (
    error
  ) {
    console.error(
      'Best-effort Supabase logout failed:',
      error?.message
    );
  }
}


/* ============================================================
   MAIN
============================================================ */

export default async function handler(
  req,
  res
) {
  setSecurityHeaders(
    res
  );


  /* ========================================================
     POST ONLY
  ======================================================== */

  if (
    req.method !==
      'POST'
  ) {
    return sendJson(
      res,
      405,
      {
        ok:
          false,

        code:
          'METHOD_NOT_ALLOWED',
      }
    );
  }


  /* ========================================================
     PORTAL HOST
  ======================================================== */

  const requestHost =
    getRequestHost(
      req
    );


  if (
    !requestHost ||
    !isPortalHost(
      requestHost
    )
  ) {
    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      403,
      {
        ok:
          false,

        code:
          'PORTAL_NOT_ALLOWED',
      }
    );
  }


  /* ========================================================
     STRICT SAME-ORIGIN LOGOUT

     POST must originate from this exact portal.
  ======================================================== */

  if (
    !originMatchesHost(
      req,
      requestHost
    )
  ) {
    return sendJson(
      res,
      403,
      {
        ok:
          false,

        code:
          'ORIGIN_NOT_ALLOWED',
      }
    );
  }


  /* ========================================================
     FETCH METADATA
  ======================================================== */

  const secFetchSite =
    String(
      req.headers[
        'sec-fetch-site'
      ] || ''
    ).toLowerCase();


  if (
    secFetchSite &&
    secFetchSite !==
      'same-origin'
  ) {
    return sendJson(
      res,
      403,
      {
        ok:
          false,

        code:
          'CROSS_SITE_REQUEST_BLOCKED',
      }
    );
  }


  /* ========================================================
     COOKIE
  ======================================================== */

  const cookies =
    parseCookies(
      req.headers.cookie
    );


  const sessionToken =
    cookies[
      COOKIE_NAME
    ];


  /*
    Logout is intentionally idempotent.

    Missing/expired cookie still results in a clean logged-out
    browser state.
  */

  if (
    !sessionToken ||
    sessionToken.length <
      20 ||
    sessionToken.length >
      200
  ) {
    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      200,
      {
        ok:
          true,
      }
    );
  }


  /* ========================================================
     LOOKUP ACTIVE SESSION
  ======================================================== */

  let securitySession;


  try {
    securitySession =
      await getSecuritySession(
        sessionToken
      );
  } catch (
    error
  ) {
    console.error(
      'Logout session lookup failed:',
      error?.message
    );


    /*
      Still clear browser cookie.
    */

    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      503,
      {
        ok:
          false,

        code:
          'SECURITY_SERVICE_UNAVAILABLE',
      }
    );
  }


  if (
    !securitySession
  ) {
    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      200,
      {
        ok:
          true,
      }
    );
  }


  /* ========================================================
     SESSION MUST BELONG TO CURRENT PORTAL
  ======================================================== */

  let expectedHost;


  try {
    expectedHost =
      await getExpectedHost(
        securitySession
      );
  } catch (
    error
  ) {
    console.error(
      'Logout portal verification failed:',
      error?.message
    );


    return sendJson(
      res,
      503,
      {
        ok:
          false,

        code:
          'SECURITY_SERVICE_UNAVAILABLE',
      }
    );
  }


  if (
    !expectedHost ||
    normalizeHost(
      expectedHost
    ) !==
      requestHost
  ) {
    /*
      Host mismatch is suspicious.
      Revoke the session rather than preserving it.
    */

    await revokeSecuritySession(
      securitySession.id
    ).catch(
      () => {}
    );


    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      403,
      {
        ok:
          false,

        code:
          'PORTAL_MISMATCH',
      }
    );
  }


  /* ========================================================
     KEEP AUTH TOKEN IN MEMORY BEFORE DB SCRUB
  ======================================================== */

  const authSessionSnapshot = {
    encrypted_access_token:
      securitySession
        .encrypted_access_token,

    access_token_iv:
      securitySession
        .access_token_iv,
  };


  /* ========================================================
     AUTHORITATIVE BUDDY FLEETS SESSION REVOCATION
  ======================================================== */

  try {
    await revokeSecuritySession(
      securitySession.id
    );
  } catch (
    error
  ) {
    console.error(
      'Security session logout failed:',
      error?.message
    );


    return sendJson(
      res,
      503,
      {
        ok:
          false,

        code:
          'SECURITY_SERVICE_UNAVAILABLE',
      }
    );
  }


  /* ========================================================
     CLEAR COOKIE IMMEDIATELY
  ======================================================== */

  clearSessionCookie(
    res
  );


  /* ========================================================
     BEST-EFFORT SUPABASE AUTH REVOCATION
  ======================================================== */

  await revokeSupabaseAuthSession(
    authSessionSnapshot
  );


  /* ========================================================
     AUDIT
  ======================================================== */

  await writeSecurityEvent({
    userId:
      securitySession
        .user_id,

    companyId:
      securitySession
        .company_id,

    eventType:
      'PORTAL_LOGOUT',

    portalType:
      securitySession
        .portal_type,

    ipAddress:
      getClientIp(
        req
      ),

    userAgent:
      getUserAgent(
        req
      ),

    metadata: {
      host:
        requestHost,

      security_session_id:
        securitySession.id,
    },
  });


  /* ========================================================
     SUCCESS
  ======================================================== */

  return sendJson(
    res,
    200,
    {
      ok:
        true,
    }
  );
}