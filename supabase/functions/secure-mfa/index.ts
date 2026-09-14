import { createClient } from 'npm:@supabase/supabase-js@2';

/* ============================================================
   BUDDY FLEETS
   SECURE MFA GATEWAY

   Flow:

   secure-login
       ↓
   Password verified
       ↓
   auth_login_flows
       ↓
   BEGIN_ENROLLMENT
       OR
   VERIFY
       ↓
   TOTP MFA
       ↓
   AAL2 REQUIRED
       ↓
   Single active security session
       ↓
   One-time 60 second portal handoff

   IMPORTANT:
   - No password handled here
   - No Supabase tokens returned to browser
   - No service-role key exposed
   - MFA required for EVERY role

   Fixed portal architecture:
   - developer.buddyfleets.in
   - team.buddyfleets.in
   - portal.buddyfleets.in/{companySlug}/...

   IMPORTANT:
   Company slug is NOT a hostname anymore.
   Company tenant authority remains company_id.
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const MAX_BODY_BYTES =
  8 * 1024;

const HANDOFF_LIFETIME_MS =
  60 * 1000;

const MAX_MFA_CODE_LENGTH =
  6;


/*
  Fixed portal hosts.

  Old wildcard company hosts such as:
  {companySlug}.buddyfleets.in

  are intentionally NOT accepted anymore.
*/
const PORTAL_HOSTS = {
  developer:
    'developer.buddyfleets.in',

  team:
    'team.buddyfleets.in',

  company:
    'portal.buddyfleets.in',
} as const;


/* ============================================================
   PORTAL TARGET VALIDATION
============================================================ */

function getExpectedPortalHost(
  portalType: unknown
): string | null {
  if (
    portalType ===
    'developer'
  ) {
    return PORTAL_HOSTS
      .developer;
  }

  if (
    portalType ===
    'team'
  ) {
    return PORTAL_HOSTS
      .team;
  }

  if (
    portalType ===
    'company'
  ) {
    return PORTAL_HOSTS
      .company;
  }

  return null;
}


/* ============================================================
   ENVIRONMENT
============================================================ */

function getJsonEnvironmentKey(
  name: string
): string | null {
  const raw =
    Deno.env.get(name);

  if (!raw) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(raw);

    if (
      typeof parsed?.default ===
      'string'
    ) {
      return parsed.default;
    }

    const firstValue =
      Object.values(parsed).find(
        (value) =>
          typeof value ===
          'string'
      );

    return typeof firstValue ===
      'string'
      ? firstValue
      : null;
  } catch {
    return null;
  }
}


const SUPABASE_URL =
  Deno.env.get(
    'SUPABASE_URL'
  );


const SUPABASE_ANON_KEY =
  Deno.env.get(
    'SUPABASE_ANON_KEY'
  ) ||
  getJsonEnvironmentKey(
    'SUPABASE_PUBLISHABLE_KEYS'
  );


const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get(
    'SUPABASE_SERVICE_ROLE_KEY'
  ) ||
  getJsonEnvironmentKey(
    'SUPABASE_SECRET_KEYS'
  );


const AUTH_FLOW_ENCRYPTION_KEY =
  Deno.env.get(
    'AUTH_FLOW_ENCRYPTION_KEY'
  );


const ALLOWED_ORIGINS =
  (
    Deno.env.get(
      'LOGIN_ALLOWED_ORIGINS'
    ) ||
    'https://buddyfleets.in,https://www.buddyfleets.in'
  )
    .split(',')
    .map(
      (origin) =>
        origin.trim()
    )
    .filter(Boolean);


if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !AUTH_FLOW_ENCRYPTION_KEY
) {
  throw new Error(
    'Required secure-mfa environment variables are missing.'
  );
}


/* ============================================================
   ADMIN CLIENT
============================================================ */

const adminClient =
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
   RESPONSE HELPERS
============================================================ */

function getCorsHeaders(
  origin: string | null
) {
  const allowed =
    origin &&
    ALLOWED_ORIGINS.includes(
      origin
    );

  return {
    'Access-Control-Allow-Origin':
      allowed
        ? origin
        : 'null',

    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',

    'Access-Control-Allow-Methods':
      'POST, OPTIONS',

    'Cache-Control':
      'no-store, no-cache, must-revalidate',

    Pragma:
      'no-cache',

    Vary:
      'Origin',

    'X-Content-Type-Options':
      'nosniff',

    'Referrer-Policy':
      'no-referrer',
  };
}


function jsonResponse(
  request: Request,
  status: number,
  payload: Record<
    string,
    unknown
  >
) {
  return new Response(
    JSON.stringify(
      payload
    ),
    {
      status,

      headers: {
        ...getCorsHeaders(
          request.headers.get(
            'origin'
          )
        ),

        'Content-Type':
          'application/json; charset=utf-8',
      },
    }
  );
}


/* ============================================================
   BASE64 / CRYPTO
============================================================ */

const encoder =
  new TextEncoder();


const decoder =
  new TextDecoder();


function bytesToBase64(
  bytes: Uint8Array
) {
  let binary =
    '';

  for (
    let index = 0;
    index < bytes.length;
    index += 1
  ) {
    binary +=
      String.fromCharCode(
        bytes[index]
      );
  }

  return btoa(
    binary
  );
}


function base64ToBytes(
  value: string
) {
  const binary =
    atob(value);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let index = 0;
    index < binary.length;
    index += 1
  ) {
    bytes[index] =
      binary.charCodeAt(
        index
      );
  }

  return bytes;
}


function bytesToBase64Url(
  bytes: Uint8Array
) {
  return bytesToBase64(
    bytes
  )
    .replaceAll(
      '+',
      '-'
    )
    .replaceAll(
      '/',
      '_'
    )
    .replace(
      /=+$/g,
      ''
    );
}


function base64UrlToString(
  value: string
) {
  let normalized =
    value
      .replaceAll(
        '-',
        '+'
      )
      .replaceAll(
        '_',
        '/'
      );

  while (
    normalized.length %
      4 !==
    0
  ) {
    normalized += '=';
  }

  return atob(
    normalized
  );
}


async function sha256Hex(
  value: string
) {
  const digest =
    await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(
        value
      )
    );

  return Array.from(
    new Uint8Array(
      digest
    )
  )
    .map(
      (byte) =>
        byte
          .toString(16)
          .padStart(
            2,
            '0'
          )
    )
    .join('');
}


function createRandomCode(
  byteLength = 32
) {
  return bytesToBase64Url(
    crypto.getRandomValues(
      new Uint8Array(
        byteLength
      )
    )
  );
}


async function getEncryptionKey() {
  const rawKey =
    base64ToBytes(
      AUTH_FLOW_ENCRYPTION_KEY!
    );

  if (
    rawKey.length !== 32
  ) {
    throw new Error(
      'AUTH_FLOW_ENCRYPTION_KEY must decode to exactly 32 bytes.'
    );
  }

  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name:
        'AES-GCM',
    },
    false,
    [
      'encrypt',
      'decrypt',
    ]
  );
}


async function decryptSecret(
  encryptedValue: string,
  ivValue: string,
  key: CryptoKey
) {
  const decrypted =
    await crypto.subtle.decrypt(
      {
        name:
          'AES-GCM',

        iv:
          base64ToBytes(
            ivValue
          ),
      },
      key,
      base64ToBytes(
        encryptedValue
      )
    );

  return decoder.decode(
    decrypted
  );
}


async function encryptSecret(
  value: string,
  key: CryptoKey
) {
  const iv =
    crypto.getRandomValues(
      new Uint8Array(12)
    );

  const encrypted =
    await crypto.subtle.encrypt(
      {
        name:
          'AES-GCM',

        iv,
      },
      key,
      encoder.encode(
        value
      )
    );

  return {
    encrypted:
      bytesToBase64(
        new Uint8Array(
          encrypted
        )
      ),

    iv:
      bytesToBase64(
        iv
      ),
  };
}


/* ============================================================
   JWT
============================================================ */

function decodeJwtPayload(
  token: string
) {
  const parts =
    token.split('.');

  if (
    parts.length !== 3
  ) {
    throw new Error(
      'Invalid JWT structure.'
    );
  }

  return JSON.parse(
    base64UrlToString(
      parts[1]
    )
  );
}


/* ============================================================
   NETWORK INFORMATION
============================================================ */

function getClientIp(
  request: Request
) {
  const cloudflareIp =
    request.headers.get(
      'cf-connecting-ip'
    );

  if (cloudflareIp) {
    return cloudflareIp.trim();
  }

  const forwarded =
    request.headers.get(
      'x-forwarded-for'
    );

  if (forwarded) {
    return forwarded
      .split(',')[0]
      .trim();
  }

  const realIp =
    request.headers.get(
      'x-real-ip'
    );

  return realIp
    ? realIp.trim()
    : null;
}


function getUserAgent(
  request: Request
) {
  return (
    request.headers.get(
      'user-agent'
    ) || ''
  ).slice(
    0,
    1000
  );
}


/* ============================================================
   SECURITY EVENTS
============================================================ */

async function insertSecurityEvent({
  userId = null,
  companyId = null,
  eventType,
  portalType = null,
  ipAddress = null,
  userAgent = '',
  metadata = {},
}: {
  userId?: string | null;
  companyId?: string | null;
  eventType: string;
  portalType?: string | null;
  ipAddress?: string | null;
  userAgent?: string;
  metadata?: Record<
    string,
    unknown
  >;
}) {
  const {
    error,
  } =
    await adminClient
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
      'Security-event insert failed:',
      error
    );
  }
}


/* ============================================================
   LOAD LOGIN FLOW
============================================================ */

async function loadLoginFlow(
  flowCode: string
) {
  const flowHash =
    await sha256Hex(
      flowCode
    );

  const {
    data,
    error,
  } =
    await adminClient
      .from(
        'auth_login_flows'
      )
      .select(`
        id,
        flow_code_hash,
        user_id,
        portal_type,
        company_id,
        target_host,
        auth_session_id,
        state,
        session_aal,
        mfa_factor_id,
        mfa_challenge_id,
        encrypted_access_token,
        access_token_iv,
        encrypted_refresh_token,
        refresh_token_iv,
        device_id_hash,
        ip_address,
        user_agent,
        created_at,
        updated_at,
        expires_at,
        consumed_at
      `)
      .eq(
        'flow_code_hash',
        flowHash
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


/* ============================================================
   ACCOUNT SECURITY
============================================================ */

async function getSecurityState(
  userId: string
) {
  const {
    data,
    error,
  } =
    await adminClient
      .from(
        'user_security'
      )
      .select(`
        user_id,
        failed_password_attempts,
        failed_mfa_attempts,
        is_locked,
        locked_at,
        lock_reason
      `)
      .eq(
        'user_id',
        userId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


async function registerFailedMfa({
  userId,
  ipAddress,
  userAgent,
}: {
  userId: string;
  ipAddress: string | null;
  userAgent: string;
}) {
  const {
    data,
    error,
  } =
    await adminClient
      .rpc(
        'bf_register_failed_mfa',
        {
          p_user_id:
            userId,

          p_ip_address:
            ipAddress,

          p_user_agent:
            userAgent,
        }
      );

  if (error) {
    throw error;
  }

  return data;
}


async function resetMfaFailures(
  userId: string
) {
  const {
    error,
  } =
    await adminClient
      .rpc(
        'bf_reset_mfa_failures',
        {
          p_user_id:
            userId,
        }
      );

  if (error) {
    throw error;
  }
}


/* ============================================================
   EXPIRE LOGIN FLOW
============================================================ */

async function expireFlow(
  flowId: string
) {
  const {
    error,
  } =
    await adminClient
      .from(
        'auth_login_flows'
      )
      .update({
        state:
          'expired',

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'id',
        flowId
      );

  if (error) {
    console.error(
      'Flow expiration failed:',
      error
    );
  }
}


/* ============================================================
   RESTORE TEMPORARY SUPABASE AUTH SESSION
============================================================ */

async function restoreAuthSession(
  flow: Record<
    string,
    any
  >
) {
  const encryptionKey =
    await getEncryptionKey();


  const accessToken =
    await decryptSecret(
      flow
        .encrypted_access_token,

      flow
        .access_token_iv,

      encryptionKey
    );


  const refreshToken =
    await decryptSecret(
      flow
        .encrypted_refresh_token,

      flow
        .refresh_token_iv,

      encryptionKey
    );


  const authClient =
    createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
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


  const {
    data:
      sessionResult,
    error:
      sessionError,
  } =
    await authClient
      .auth
      .setSession({
        access_token:
          accessToken,

        refresh_token:
          refreshToken,
      });


  if (
    sessionError ||
    !sessionResult
      ?.session
  ) {
    throw new Error(
      'TEMP_AUTH_SESSION_INVALID'
    );
  }


  const {
    data:
      userResult,
    error:
      userError,
  } =
    await authClient
      .auth
      .getUser();


  if (
    userError ||
    !userResult
      ?.user ||
    userResult
      .user
      .id !==
      flow.user_id
  ) {
    throw new Error(
      'TEMP_AUTH_USER_INVALID'
    );
  }


  return {
    authClient,
    session:
      sessionResult.session,
    encryptionKey,
  };
}


/* ============================================================
   UPDATE FLOW AUTH TOKENS
============================================================ */

async function updateFlowSession({
  flowId,
  session,
  encryptionKey,
}: {
  flowId: string;
  session: any;
  encryptionKey: CryptoKey;
}) {
  const encryptedAccess =
    await encryptSecret(
      session.access_token,
      encryptionKey
    );


  const encryptedRefresh =
    await encryptSecret(
      session.refresh_token,
      encryptionKey
    );


  const payload =
    decodeJwtPayload(
      session.access_token
    );


  const authSessionId =
    typeof payload
      .session_id ===
      'string'
      ? payload.session_id
      : null;


  if (!authSessionId) {
    throw new Error(
      'SESSION_ID_MISSING'
    );
  }


  const {
    error,
  } =
    await adminClient
      .from(
        'auth_login_flows'
      )
      .update({
        auth_session_id:
          authSessionId,

        encrypted_access_token:
          encryptedAccess
            .encrypted,

        access_token_iv:
          encryptedAccess.iv,

        encrypted_refresh_token:
          encryptedRefresh
            .encrypted,

        refresh_token_iv:
          encryptedRefresh.iv,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'id',
        flowId
      );


  if (error) {
    throw error;
  }


  return authSessionId;
}


/* ============================================================
   MFA ERROR CLASSIFICATION
============================================================ */

function isInvalidMfaCode(
  error: any
) {
  if (!error) {
    return false;
  }


  const message =
    String(
      error.message ||
      ''
    ).toLowerCase();


  return (
    error.status === 400 ||
    error.status === 401 ||
    error.status === 422 ||
    message.includes(
      'totp'
    ) ||
    message.includes(
      'challenge'
    ) ||
    message.includes(
      'invalid code'
    ) ||
    message.includes(
      'verification code'
    )
  );
}


/* ============================================================
   DELETE STALE UNVERIFIED TOTP FACTORS
============================================================ */

async function removeStaleUnverifiedFactors(
  userId: string,
  factors: any[]
) {
  for (
    const factor
    of factors
  ) {
    if (
      factor
        ?.factor_type !==
        'totp' &&
      factor
        ?.type !==
        'totp'
    ) {
      continue;
    }


    if (
      factor
        ?.status !==
        'unverified'
    ) {
      continue;
    }


    try {
      await adminClient
        .auth
        .admin
        .mfa
        .deleteFactor({
          userId,
          id:
            factor.id,
        });
    } catch (
      error
    ) {
      console.error(
        'Stale MFA factor cleanup failed:',
        error
      );
    }
  }
}


/* ============================================================
   REVOKE PREVIOUS HANDOFFS
============================================================ */

async function revokePreviousHandoffs(
  userId: string
) {
  const {
    error,
  } =
    await adminClient
      .from(
        'auth_portal_handoffs'
      )
      .update({
        status:
          'revoked',
      })
      .eq(
        'user_id',
        userId
      )
      .eq(
        'status',
        'pending'
      );


  if (error) {
    throw error;
  }
}


/* ============================================================
   CREATE FINAL HANDOFF
============================================================ */

async function createPortalHandoff({
  flow,
  session,
  encryptionKey,
  deviceIdHash,
  ipAddress,
  userAgent,
}: {
  flow: Record<
    string,
    any
  >;
  session: any;
  encryptionKey: CryptoKey;
  deviceIdHash: string;
  ipAddress: string | null;
  userAgent: string;
}) {
  const jwtPayload =
    decodeJwtPayload(
      session.access_token
    );


  const authSessionId =
    typeof jwtPayload
      .session_id ===
      'string'
      ? jwtPayload.session_id
      : null;


  if (!authSessionId) {
    throw new Error(
      'SESSION_ID_MISSING'
    );
  }


  const accessEncrypted =
    await encryptSecret(
      session.access_token,
      encryptionKey
    );


  const refreshEncrypted =
    await encryptSecret(
      session.refresh_token,
      encryptionKey
    );


  const handoffCode =
    createRandomCode(
      32
    );


  const handoffCodeHash =
    await sha256Hex(
      handoffCode
    );


  const expiresAt =
    new Date(
      Date.now() +
        HANDOFF_LIFETIME_MS
    ).toISOString();


  await revokePreviousHandoffs(
    flow.user_id
  );


  const {
    error:
      handoffError,
  } =
    await adminClient
      .from(
        'auth_portal_handoffs'
      )
      .insert({
        handoff_code_hash:
          handoffCodeHash,

        user_id:
          flow.user_id,

        portal_type:
          flow.portal_type,

        company_id:
          flow.company_id,

        target_host:
          flow.target_host,

        auth_session_id:
          authSessionId,

        encrypted_access_token:
          accessEncrypted
            .encrypted,

        access_token_iv:
          accessEncrypted.iv,

        encrypted_refresh_token:
          refreshEncrypted
            .encrypted,

        refresh_token_iv:
          refreshEncrypted.iv,

        device_id_hash:
          deviceIdHash,

        ip_address:
          ipAddress,

        user_agent:
          userAgent,

        expires_at:
          expiresAt,

        status:
          'pending',
      });


  if (
    handoffError
  ) {
    throw handoffError;
  }


  return {
    handoffCode,
    authSessionId,
    expiresAt,
  };
}


/* ============================================================
   MAIN
============================================================ */

Deno.serve(
  async (
    request: Request
  ) => {

    const origin =
      request.headers.get(
        'origin'
      );


    /* ========================================================
       OPTIONS
    ======================================================== */

    if (
      request.method ===
      'OPTIONS'
    ) {
      if (
        !origin ||
        !ALLOWED_ORIGINS.includes(
          origin
        )
      ) {
        return new Response(
          null,
          {
            status:
              403,
          }
        );
      }


      return new Response(
        null,
        {
          status:
            204,

          headers:
            getCorsHeaders(
              origin
            ),
        }
      );
    }


    /* ========================================================
       POST ONLY
    ======================================================== */

    if (
      request.method !==
      'POST'
    ) {
      return jsonResponse(
        request,
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
       CENTRAL LOGIN ORIGIN ONLY
    ======================================================== */

    if (
      !origin ||
      !ALLOWED_ORIGINS.includes(
        origin
      )
    ) {
      return jsonResponse(
        request,
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
       REQUEST SIZE
    ======================================================== */

    const contentLength =
      Number(
        request.headers.get(
          'content-length'
        ) ||
        '0'
      );


    if (
      Number.isFinite(
        contentLength
      ) &&
      contentLength >
        MAX_BODY_BYTES
    ) {
      return jsonResponse(
        request,
        413,
        {
          ok:
            false,

          code:
            'REQUEST_TOO_LARGE',
        }
      );
    }


    /* ========================================================
       BODY
    ======================================================== */

    let body:
      Record<
        string,
        unknown
      >;


    try {
      body =
        await request.json();
    } catch {
      return jsonResponse(
        request,
        400,
        {
          ok:
            false,

          code:
            'INVALID_REQUEST',
        }
      );
    }


    const action =
      String(
        body.action ||
        ''
      )
        .trim()
        .toUpperCase();


    const flowCode =
      String(
        body.flowCode ||
        ''
      ).trim();


    const deviceId =
      String(
        body.deviceId ||
        ''
      ).trim();


    const verificationCode =
      String(
        body.code ||
        ''
      )
        .trim()
        .replace(
          /\s+/g,
          ''
        );


    if (
      ![
        'BEGIN_ENROLLMENT',
        'VERIFY',
      ].includes(
        action
      ) ||
      flowCode.length <
        20 ||
      flowCode.length >
        200 ||
      !deviceId ||
      deviceId.length >
        200
    ) {
      return jsonResponse(
        request,
        400,
        {
          ok:
            false,

          code:
            'INVALID_REQUEST',
        }
      );
    }


    if (
      action ===
        'VERIFY' &&
      !new RegExp(
        `^[0-9]{${MAX_MFA_CODE_LENGTH}}$`
      ).test(
        verificationCode
      )
    ) {
      return jsonResponse(
        request,
        400,
        {
          ok:
            false,

          code:
            'INVALID_MFA_CODE',
        }
      );
    }


    /* ========================================================
       SECURITY SIGNALS
    ======================================================== */

    const ipAddress =
      getClientIp(
        request
      );


    const userAgent =
      getUserAgent(
        request
      );


    const deviceIdHash =
      await sha256Hex(
        deviceId
      );


    /* ========================================================
       LOAD FLOW
    ======================================================== */

    let flow:
      Record<
        string,
        any
      > |
      null;


    try {
      flow =
        await loadLoginFlow(
          flowCode
        );
    } catch (
      error
    ) {
      console.error(
        'Login flow lookup failed:',
        error
      );


      return jsonResponse(
        request,
        503,
        {
          ok:
            false,

          code:
            'SECURITY_SERVICE_UNAVAILABLE',
        }
      );
    }


    if (!flow) {
      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'LOGIN_FLOW_INVALID',
        }
      );
    }


    /* ========================================================
       FIXED PORTAL TARGET VALIDATION

       Security rule:
       The database flow must point to the one fixed host
       allowed for its portal type.

       This intentionally invalidates stale flows created by
       the retired wildcard architecture:
       {companySlug}.buddyfleets.in

       Company route identity will be resolved later as:
       portal.buddyfleets.in/{companySlug}/...
       using authenticated company_id/session context.
    ======================================================== */

    const expectedTargetHost =
      getExpectedPortalHost(
        flow.portal_type
      );


    if (
      !expectedTargetHost ||
      String(
        flow.target_host ||
        ''
      )
        .trim()
        .toLowerCase() !==
      expectedTargetHost
    ) {
      await insertSecurityEvent({
        userId:
          flow.user_id,

        companyId:
          flow.company_id,

        eventType:
          'PORTAL_TARGET_MISMATCH',

        portalType:
          flow.portal_type,

        ipAddress,

        userAgent,

        metadata: {
          expected_target_host:
            expectedTargetHost,

          received_target_host:
            String(
              flow.target_host ||
              ''
            )
              .trim()
              .toLowerCase(),
        },
      });


      await expireFlow(
        flow.id
      );


      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'SECURITY_CONTEXT_CHANGED',
        }
      );
    }


    /* ========================================================
       FLOW EXPIRY / CONSUMPTION
    ======================================================== */

    const expiresAt =
      new Date(
        flow.expires_at
      ).getTime();


    if (
      !Number.isFinite(
        expiresAt
      ) ||
      expiresAt <=
        Date.now() ||
      flow.consumed_at ||
      [
        'expired',
        'consumed',
      ].includes(
        flow.state
      )
    ) {
      await expireFlow(
        flow.id
      );


      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'LOGIN_FLOW_EXPIRED',
        }
      );
    }


    /* ========================================================
       DEVICE BINDING
    ======================================================== */

    if (
      !flow.device_id_hash ||
      flow.device_id_hash !==
        deviceIdHash
    ) {
      await insertSecurityEvent({
        userId:
          flow.user_id,

        companyId:
          flow.company_id,

        eventType:
          'MFA_DEVICE_MISMATCH',

        portalType:
          flow.portal_type,

        ipAddress,

        userAgent,
      });


      await expireFlow(
        flow.id
      );


      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'SECURITY_CONTEXT_CHANGED',
        }
      );
    }


    /* ========================================================
       IP BINDING

       High-security policy:
       IP changed during login flow -> restart login.
    ======================================================== */

    if (
      flow.ip_address &&
      ipAddress &&
      String(
        flow.ip_address
      ) !==
        String(
          ipAddress
        )
    ) {
      await insertSecurityEvent({
        userId:
          flow.user_id,

        companyId:
          flow.company_id,

        eventType:
          'MFA_IP_CHANGED',

        portalType:
          flow.portal_type,

        ipAddress,

        userAgent,

        metadata: {
          original_ip:
            String(
              flow.ip_address
            ),
        },
      });


      await expireFlow(
        flow.id
      );


      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'SECURITY_CONTEXT_CHANGED',
        }
      );
    }


    /* ========================================================
       ACCOUNT LOCK CHECK
    ======================================================== */

    let securityState:
      any;


    try {
      securityState =
        await getSecurityState(
          flow.user_id
        );
    } catch (
      error
    ) {
      console.error(
        'User security lookup failed:',
        error
      );


      return jsonResponse(
        request,
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
      securityState
        ?.is_locked
    ) {
      await expireFlow(
        flow.id
      );


      return jsonResponse(
        request,
        423,
        {
          ok:
            false,

          code:
            'ACCOUNT_LOCKED',

          message:
            'This account is security locked.',
        }
      );
    }


    /* ========================================================
       RESTORE TEMP AUTH SESSION
    ======================================================== */

    let restored:
      Awaited<
        ReturnType<
          typeof restoreAuthSession
        >
      >;


    try {
      restored =
        await restoreAuthSession(
          flow
        );
    } catch (
      error
    ) {
      console.error(
        'Temporary authentication restoration failed:',
        error
      );


      await expireFlow(
        flow.id
      );


      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'LOGIN_FLOW_EXPIRED',
        }
      );
    }


    const {
      authClient,
      session:
        restoredSession,
      encryptionKey,
    } =
      restored;


    /* ========================================================
       REFRESH STORED SESSION IF NECESSARY
    ======================================================== */

    try {
      await updateFlowSession({
        flowId:
          flow.id,

        session:
          restoredSession,

        encryptionKey,
      });
    } catch (
      error
    ) {
      console.error(
        'Temporary auth-flow token update failed:',
        error
      );


      await expireFlow(
        flow.id
      );


      return jsonResponse(
        request,
        503,
        {
          ok:
            false,

          code:
            'SECURITY_SESSION_FAILED',
        }
      );
    }


    /* ========================================================
       BEGIN MFA ENROLLMENT
    ======================================================== */

    if (
      action ===
      'BEGIN_ENROLLMENT'
    ) {

      if (
        flow.state !==
        'mfa_setup_required'
      ) {
        return jsonResponse(
          request,
          409,
          {
            ok:
              false,

            code:
              'MFA_SETUP_NOT_REQUIRED',
          }
        );
      }


      const {
        data:
          factors,
        error:
          factorsError,
      } =
        await authClient
          .auth
          .mfa
          .listFactors();


      if (
        factorsError
      ) {
        console.error(
          'MFA factor lookup failed:',
          factorsError
        );


        return jsonResponse(
          request,
          503,
          {
            ok:
              false,

            code:
              'MFA_SERVICE_UNAVAILABLE',
          }
        );
      }


      const allTotp =
        factors
          ?.totp ||
        [];


      const verifiedTotp =
        allTotp.find(
          (factor: any) =>
            factor.status ===
            'verified'
        );


      /*
        Race-condition protection:
        If a verified factor appeared after secure-login,
        don't enroll another one.
      */

      if (
        verifiedTotp
      ) {
        const {
          data:
            challenge,
          error:
            challengeError,
        } =
          await authClient
            .auth
            .mfa
            .challenge({
              factorId:
                verifiedTotp.id,
            });


        if (
          challengeError ||
          !challenge
            ?.id
        ) {
          return jsonResponse(
            request,
            503,
            {
              ok:
                false,

              code:
                'MFA_SERVICE_UNAVAILABLE',
            }
          );
        }


        const {
          error:
            updateError,
        } =
          await adminClient
            .from(
              'auth_login_flows'
            )
            .update({
              state:
                'mfa_challenge_required',

              mfa_factor_id:
                verifiedTotp.id,

              mfa_challenge_id:
                challenge.id,

              updated_at:
                new Date()
                  .toISOString(),
            })
            .eq(
              'id',
              flow.id
            );


        if (
          updateError
        ) {
          throw updateError;
        }


        return jsonResponse(
          request,
          200,
          {
            ok:
              true,

            nextStep:
              'MFA_CHALLENGE',
          }
        );
      }


      /*
        Remove abandoned unverified factors
        before creating a new enrollment.
      */

      await removeStaleUnverifiedFactors(
        flow.user_id,
        allTotp
      );


      const {
        data:
          enrollment,
        error:
          enrollmentError,
      } =
        await authClient
          .auth
          .mfa
          .enroll({
            factorType:
              'totp',

            friendlyName:
              'Buddy Fleets Authenticator',
          });


      if (
        enrollmentError ||
        !enrollment
          ?.id ||
        !enrollment
          ?.totp
      ) {
        console.error(
          'MFA enrollment failed:',
          enrollmentError
        );


        return jsonResponse(
          request,
          503,
          {
            ok:
              false,

            code:
              'MFA_ENROLLMENT_FAILED',
          }
        );
      }


      const {
        data:
          challenge,
        error:
          challengeError,
      } =
        await authClient
          .auth
          .mfa
          .challenge({
            factorId:
              enrollment.id,
          });


      if (
        challengeError ||
        !challenge
          ?.id
      ) {
        console.error(
          'Enrollment challenge creation failed:',
          challengeError
        );


        return jsonResponse(
          request,
          503,
          {
            ok:
              false,

            code:
              'MFA_SERVICE_UNAVAILABLE',
          }
        );
      }


      const {
        error:
          flowUpdateError,
      } =
        await adminClient
          .from(
            'auth_login_flows'
          )
          .update({
            state:
              'mfa_challenge_required',

            mfa_factor_id:
              enrollment.id,

            mfa_challenge_id:
              challenge.id,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            'id',
            flow.id
          );


      if (
        flowUpdateError
      ) {
        throw flowUpdateError;
      }


      await insertSecurityEvent({
        userId:
          flow.user_id,

        companyId:
          flow.company_id,

        eventType:
          'MFA_ENROLLMENT_STARTED',

        portalType:
          flow.portal_type,

        ipAddress,

        userAgent,
      });


      return jsonResponse(
        request,
        200,
        {
          ok:
            true,

          nextStep:
            'MFA_VERIFY',

          qrCode:
            enrollment
              .totp
              .qr_code,

          secret:
            enrollment
              .totp
              .secret,

          uri:
            enrollment
              .totp
              .uri,
        }
      );
    }


    /* ========================================================
       VERIFY MFA
    ======================================================== */

    if (
      action ===
      'VERIFY'
    ) {

      if (
        flow.state !==
          'mfa_challenge_required' ||
        !flow.mfa_factor_id ||
        !flow.mfa_challenge_id
      ) {
        return jsonResponse(
          request,
          409,
          {
            ok:
              false,

            code:
              'MFA_CHALLENGE_NOT_READY',
          }
        );
      }


      const {
        data:
          verifyResult,
        error:
          verifyError,
      } =
        await authClient
          .auth
          .mfa
          .verify({
            factorId:
              flow
                .mfa_factor_id,

            challengeId:
              flow
                .mfa_challenge_id,

            code:
              verificationCode,
          });


      /* ======================================================
         INVALID MFA
      ====================================================== */

      if (
        verifyError
      ) {

        if (
          isInvalidMfaCode(
            verifyError
          )
        ) {
          try {
            const failed =
              await registerFailedMfa({
                userId:
                  flow.user_id,

                ipAddress,

                userAgent,
              });


            if (
              failed
                ?.locked
            ) {
              /*
                Revoke Supabase refresh sessions too.
                Global sign-out is intentional on security lock.
              */

              await authClient
                .auth
                .signOut({
                  scope:
                    'global',
                })
                .catch(
                  () => {}
                );


              await expireFlow(
                flow.id
              );


              return jsonResponse(
                request,
                423,
                {
                  ok:
                    false,

                  code:
                    'ACCOUNT_LOCKED',

                  message:
                    'Account locked after multiple incorrect authentication codes.',
                }
              );
            }


            return jsonResponse(
              request,
              401,
              {
                ok:
                  false,

                code:
                  'MFA_FAILED',

                message:
                  'Invalid authentication code.',
              }
            );
          } catch (
            error
          ) {
            console.error(
              'Failed MFA security registration failed:',
              error
            );


            return jsonResponse(
              request,
              503,
              {
                ok:
                  false,

                code:
                  'SECURITY_SERVICE_UNAVAILABLE',
              }
            );
          }
        }


        console.error(
          'MFA verification service error:',
          verifyError
        );


        return jsonResponse(
          request,
          503,
          {
            ok:
              false,

            code:
              'MFA_SERVICE_UNAVAILABLE',
          }
        );
      }


      /* ======================================================
         GET PROMOTED AAL2 SESSION
      ====================================================== */

      let aal2Session =
        verifyResult
          ?.session ||
        null;


      if (
        !aal2Session
      ) {
        const {
          data:
            sessionData,
          error:
            sessionError,
        } =
          await authClient
            .auth
            .getSession();


        if (
          sessionError ||
          !sessionData
            ?.session
        ) {
          return jsonResponse(
            request,
            503,
            {
              ok:
                false,

              code:
                'SECURITY_SESSION_FAILED',
            }
          );
        }


        aal2Session =
          sessionData.session;
      }


      /* ======================================================
         AUTHORITATIVE AAL CHECK
      ====================================================== */

      const {
        data:
          aalResult,
        error:
          aalError,
      } =
        await authClient
          .auth
          .mfa
          .getAuthenticatorAssuranceLevel(
            aal2Session
              .access_token
          );


      if (
        aalError ||
        aalResult
          ?.currentLevel !==
          'aal2'
      ) {
        console.error(
          'AAL2 verification failed:',
          aalError
        );


        return jsonResponse(
          request,
          401,
          {
            ok:
              false,

            code:
              'MFA_AAL2_REQUIRED',
          }
        );
      }


      /* ======================================================
         VERIFY SESSION USER
      ====================================================== */

      const {
        data:
          verifiedUser,
        error:
          verifiedUserError,
      } =
        await authClient
          .auth
          .getUser(
            aal2Session
              .access_token
          );


      if (
        verifiedUserError ||
        !verifiedUser
          ?.user ||
        verifiedUser
          .user
          .id !==
          flow.user_id
      ) {
        await expireFlow(
          flow.id
        );


        return jsonResponse(
          request,
          401,
          {
            ok:
              false,

            code:
              'SECURITY_SESSION_FAILED',
          }
        );
      }


      /* ======================================================
         RESET MFA FAILURE COUNTER
      ====================================================== */

      try {
        await resetMfaFailures(
          flow.user_id
        );
      } catch (
        error
      ) {
        console.error(
          'MFA counter reset failed:',
          error
        );


        return jsonResponse(
          request,
          503,
          {
            ok:
              false,

            code:
              'SECURITY_SERVICE_UNAVAILABLE',
          }
        );
      }


      /* ======================================================
         LOGIN SUCCESS AUDIT
      ====================================================== */

      const {
        data:
          loginSuccess,
        error:
          loginSuccessError,
      } =
        await adminClient
          .rpc(
            'bf_register_successful_login',
            {
              p_user_id:
                flow.user_id,

              p_ip_address:
                ipAddress,

              p_user_agent:
                userAgent,
            }
          );


      if (
        loginSuccessError ||
        loginSuccess
          ?.allowed ===
          false
      ) {
        console.error(
          'Successful-login registration failed:',
          loginSuccessError
        );


        await expireFlow(
          flow.id
        );


        return jsonResponse(
          request,
          423,
          {
            ok:
              false,

            code:
              'ACCOUNT_LOCKED',
          }
        );
      }


      /* ======================================================
         SESSION ID
      ====================================================== */

      const jwtPayload =
        decodeJwtPayload(
          aal2Session
            .access_token
        );


      const authSessionId =
        typeof jwtPayload
          .session_id ===
          'string'
          ? jwtPayload
              .session_id
          : null;


      if (
        !authSessionId
      ) {
        return jsonResponse(
          request,
          503,
          {
            ok:
              false,

            code:
              'SECURITY_SESSION_FAILED',
          }
        );
      }


      /* ======================================================
         SINGLE ACTIVE BUDDY FLEETS SESSION

         bf_start_security_session automatically revokes
         previous active application session.
      ====================================================== */

      const {
        data:
          securitySessionId,
        error:
          securitySessionError,
      } =
        await adminClient
          .rpc(
            'bf_start_security_session',
            {
              p_user_id:
                flow.user_id,

              p_auth_session_id:
                authSessionId,

              p_portal_type:
                flow.portal_type,

              p_company_id:
                flow.company_id,

              p_device_id_hash:
                deviceIdHash,

              p_ip_address:
                ipAddress,

              p_user_agent:
                userAgent,
            }
          );


      if (
        securitySessionError ||
        !securitySessionId
      ) {
        console.error(
          'Security session creation failed:',
          securitySessionError
        );


        return jsonResponse(
          request,
          503,
          {
            ok:
              false,

            code:
              'SECURITY_SESSION_FAILED',
          }
        );
      }


      /* ======================================================
         CREATE SINGLE-USE PORTAL HANDOFF
      ====================================================== */

      let handoff:
        Awaited<
          ReturnType<
            typeof createPortalHandoff
          >
        >;


      try {
        handoff =
          await createPortalHandoff({
            flow,

            session:
              aal2Session,

            encryptionKey,

            deviceIdHash,

            ipAddress,

            userAgent,
          });
      } catch (
        error
      ) {
        console.error(
          'Portal handoff creation failed:',
          error
        );


        return jsonResponse(
          request,
          503,
          {
            ok:
              false,

            code:
              'PORTAL_HANDOFF_FAILED',
          }
        );
      }


      /* ======================================================
         CONSUME LOGIN FLOW
      ====================================================== */

      const {
        error:
          consumeError,
      } =
        await adminClient
          .from(
            'auth_login_flows'
          )
          .update({
            state:
              'consumed',

            session_aal:
              'aal2',

            consumed_at:
              new Date()
                .toISOString(),

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            'id',
            flow.id
          );


      if (
        consumeError
      ) {
        console.error(
          'Login-flow consumption failed:',
          consumeError
        );
      }


      /* ======================================================
         FINAL SECURITY EVENT
      ====================================================== */

      await insertSecurityEvent({
        userId:
          flow.user_id,

        companyId:
          flow.company_id,

        eventType:
          'MFA_VERIFIED',

        portalType:
          flow.portal_type,

        ipAddress,

        userAgent,

        metadata: {
          security_session_id:
            securitySessionId,

          auth_session_id:
            authSessionId,

          target_host:
            flow.target_host,

          handoff_expires_at:
            handoff
              .expiresAt,
        },
      });


      /* ======================================================
         SAFE RESPONSE

         IMPORTANT:
         Supabase tokens are NOT returned.
      ====================================================== */

      return jsonResponse(
        request,
        200,
        {
          ok:
            true,

          nextStep:
            'PORTAL_HANDOFF',

          targetHost:
            flow.target_host,

          handoffCode:
            handoff
              .handoffCode,

          expiresIn:
            Math.floor(
              HANDOFF_LIFETIME_MS /
                1000
            ),
        }
      );
    }


    return jsonResponse(
      request,
      400,
      {
        ok:
          false,

        code:
          'INVALID_REQUEST',
      }
    );
  }
);