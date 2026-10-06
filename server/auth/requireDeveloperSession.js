import {
  createHash,
} from 'node:crypto';

import {
  createClient,
} from '@supabase/supabase-js';

import {
  verifyAndRefreshSupabaseSession,
} from './portalSessionCore.js';

import { PORTAL_SESSION_COOKIE } from './sessionPolicy.js';


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
  PORTAL_SESSION_COOKIE;

const DEVELOPER_HOST =
  'developer.buddyfleets.in';


/* ============================================================
   ENVIRONMENT
============================================================ */

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;


if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY
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
        access_token_iv,
        encrypted_refresh_token,
        refresh_token_iv
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
     REQUEST CONTEXT

     IP / User-Agent are intentionally NOT hard authorization gates.
     The HttpOnly session token + server-side session registry remain
     authoritative; context changes are audited by /api/auth/session.
  ========================================================== */

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

     Transparent refresh prevents the one-hour Supabase access-token
     boundary from terminating an otherwise-active Buddy Fleets session.
  ========================================================== */

  try {
    const verifiedAuth =
      await verifyAndRefreshSupabaseSession({
        securitySession,
        mfaEnabled:
          accountSecurity.mfa_enabled === true,
      });


    return {
      ok: true,

      supabaseAdmin,

      user: {
        id:
          verifiedAuth.authUser.id,

        email:
          verifiedAuth.authUser.email ||
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
          verifiedAuth.aal,
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

        authRefreshed:
          verifiedAuth.refreshed === true,
      },
    };
  } catch (error) {
    const errorCode =
      error?.code ||
      error?.message ||
      'SESSION_INVALID';


    console.error(
      'Developer API Supabase session verification failed:',
      errorCode
    );


    await invalidateSecuritySession({
      sessionId:
        securitySession.id,

      reason:
        errorCode ===
          'MFA_AAL2_REQUIRED'
          ? 'MFA_AAL2_REQUIRED'
          : 'SUPABASE_SESSION_INVALID',
    }).catch(() => {});


    return {
      ok: false,
      status: 401,
      code:
        errorCode ===
          'MFA_AAL2_REQUIRED'
          ? 'MFA_AAL2_REQUIRED'
          : 'SESSION_INVALID',

      clearCookie: true,
    };
  }
}
