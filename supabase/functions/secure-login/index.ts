import { createClient } from 'npm:@supabase/supabase-js@2';

/* ============================================================
   BUDDY FLEETS
   CENTRAL SECURE LOGIN GATEWAY

   Public entry:
   https://buddyfleets.in/login

   This function handles ONLY:
   - Request validation
   - App-level rate limiting
   - Account security-lock check
   - Password verification
   - Failed password attempt registration
   - ADMIN / TEAM / COMPANY resolution
   - User-controlled MFA preference enforcement
   - MFA challenge creation when MFA is enabled
   - Direct single-use portal handoff when MFA is disabled
   - Temporary encrypted auth flow creation for MFA challenges

   It DOES NOT:
   - Return Supabase access tokens
   - Return refresh tokens
   - Auto-enroll MFA during login

   MFA POLICY:
   - mfa_enabled=false -> password + authorization -> portal handoff
   - mfa_enabled=true  -> verified TOTP challenge required
   - Login never forces authenticator enrollment
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const MAX_BODY_BYTES = 8 * 1024;

const IP_RATE_LIMIT_WINDOW_MS =
  10 * 60 * 1000;

const IP_RATE_LIMIT_MAX =
  20;

const EMAIL_RATE_LIMIT_WINDOW_MS =
  10 * 60 * 1000;

const EMAIL_RATE_LIMIT_MAX =
  10;

const LOGIN_FLOW_LIFETIME_MS =
  5 * 60 * 1000;

const HANDOFF_LIFETIME_MS =
  60 * 1000;


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
          typeof value === 'string'
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


/* ============================================================
   BASIC VALIDATION
============================================================ */

if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !AUTH_FLOW_ENCRYPTION_KEY
) {
  throw new Error(
    'Required secure-login environment variables are missing.'
  );
}


/* ============================================================
   CLIENTS

   IMPORTANT:
   A new auth client is created for each login request.
============================================================ */

const adminClient =
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
  const origin =
    request.headers.get(
      'origin'
    );

  return new Response(
    JSON.stringify(
      payload
    ),
    {
      status,

      headers: {
        ...getCorsHeaders(
          origin
        ),

        'Content-Type':
          'application/json; charset=utf-8',
      },
    }
  );
}


function genericAuthFailure(
  request: Request
) {
  return jsonResponse(
    request,
    401,
    {
      ok: false,

      code:
        'AUTH_FAILED',

      message:
        'Invalid credentials or account access is unavailable.',
    }
  );
}


/* ============================================================
   CRYPTO HELPERS
============================================================ */

const encoder =
  new TextEncoder();


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
  const bytes =
    crypto.getRandomValues(
      new Uint8Array(
        byteLength
      )
    );

  return bytesToBase64Url(
    bytes
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
    ]
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
   JWT PAYLOAD

   Token has already been issued by Supabase Auth.
   We only extract session metadata here.
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
   NETWORK / DEVICE HELPERS
============================================================ */

function getClientIp(
  request: Request
) {
  const cloudflare =
    request.headers.get(
      'cf-connecting-ip'
    );

  if (cloudflare) {
    return cloudflare.trim();
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
   SECURITY EVENT
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
      'Security event write failed:',
      error
    );
  }
}


/* ============================================================
   RATE LIMIT
============================================================ */

class RateLimitError extends Error {
  constructor() {
    super(
      'RATE_LIMITED'
    );
  }
}


async function enforceRateLimit({
  ipAddress,
  emailHash,
}: {
  ipAddress: string | null;
  emailHash: string;
}) {
  const ipWindowStart =
    new Date(
      Date.now() -
        IP_RATE_LIMIT_WINDOW_MS
    ).toISOString();

  const emailWindowStart =
    new Date(
      Date.now() -
        EMAIL_RATE_LIMIT_WINDOW_MS
    ).toISOString();


  /*
    Both counters are independent. Run them together instead of
    paying two sequential database round-trips on every login.
  */

  const ipCountPromise =
    ipAddress
      ? adminClient
          .from(
            'security_events'
          )
          .select(
            'id',
            {
              count:
                'exact',

              head:
                true,
            }
          )
          .eq(
            'event_type',
            'LOGIN_REQUEST'
          )
          .eq(
            'ip_address',
            ipAddress
          )
          .gte(
            'created_at',
            ipWindowStart
          )
      : Promise.resolve({
          count:
            0,

          error:
            null,
        });


  const emailCountPromise =
    adminClient
      .from(
        'security_events'
      )
      .select(
        'id',
        {
          count:
            'exact',

          head:
            true,
        }
      )
      .eq(
        'event_type',
        'LOGIN_REQUEST'
      )
      .contains(
        'metadata',
        {
          email_hash:
            emailHash,
        }
      )
      .gte(
        'created_at',
        emailWindowStart
      );


  const [
    ipResult,
    emailResult,
  ] =
    await Promise.all([
      ipCountPromise,
      emailCountPromise,
    ]);


  if (
    ipResult.error
  ) {
    throw ipResult.error;
  }


  if (
    emailResult.error
  ) {
    throw emailResult.error;
  }


  if (
    (ipResult.count || 0) >=
      IP_RATE_LIMIT_MAX ||
    (emailResult.count || 0) >=
      EMAIL_RATE_LIMIT_MAX
  ) {
    throw new RateLimitError();
  }
}


/* ============================================================
   ACCOUNT RESOLUTION
============================================================ */

async function resolveUserId(
  email: string
) {
  const {
    data,
    error,
  } =
    await adminClient
      .rpc(
        'bf_resolve_auth_user_id_by_email',
        {
          p_email:
            email,
        }
      );

  if (error) {
    throw error;
  }

  return data
    ? String(data)
    : null;
}


/* ============================================================
   ACCOUNT SECURITY
============================================================ */

async function getUserSecurity(
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
        is_locked,
        locked_at,
        lock_reason,
        mfa_enabled,
        mfa_enabled_at
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


async function ensureUserSecurityRow(
  userId: string
) {
  const {
    error,
  } =
    await adminClient
      .from(
        'user_security'
      )
      .upsert(
        {
          user_id:
            userId,
        },
        {
          onConflict:
            'user_id',

          ignoreDuplicates:
            true,
        }
      );

  if (error) {
    throw error;
  }
}


async function registerFailedPassword({
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
        'bf_register_failed_login',
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


async function clearFailedPasswordAttempts(
  userId: string
) {
  const {
    error,
  } =
    await adminClient
      .from(
        'user_security'
      )
      .update({
        failed_password_attempts:
          0,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'user_id',
        userId
      );

  if (error) {
    throw error;
  }
}


/* ============================================================
   AUTH ERROR CLASSIFICATION
============================================================ */

function isInvalidCredentialsError(
  error: {
    code?: string;
    message?: string;
  } | null
) {
  if (!error) {
    return false;
  }

  if (
    error.code ===
    'invalid_credentials'
  ) {
    return true;
  }

  const message =
    (
      error.message ||
      ''
    ).toLowerCase();

  return (
    message.includes(
      'invalid login credentials'
    ) ||
    message.includes(
      'invalid credentials'
    )
  );
}


/* ============================================================
   AUTHORIZATION TARGET RESOLUTION
============================================================ */

type PortalResolution = {
  portalType:
    'developer' |
    'team' |
    'company';

  companyId:
    string | null;

  targetHost:
    string;

  metadata:
    Record<
      string,
      unknown
    >;
};


async function resolvePortal({
  companyCode,
  userId,
}: {
  companyCode: string;
  userId: string;
}): Promise<PortalResolution | null> {

  /* ==========================================================
     SUPER ADMIN
  ========================================================== */

  if (
    companyCode ===
    'ADMIN'
  ) {
    const {
      data:
        platformAdmin,
      error,
    } =
      await adminClient
        .from(
          'platform_admins'
        )
        .select(
          'user_id, is_active'
        )
        .eq(
          'user_id',
          userId
        )
        .eq(
          'is_active',
          true
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (
      !platformAdmin
        ?.is_active
    ) {
      return null;
    }

    return {
      portalType:
        'developer',

      companyId:
        null,

      targetHost:
        'developer.buddyfleets.in',

      metadata: {
        role:
          'SUPER_ADMIN',
      },
    };
  }


  /* ==========================================================
     BUDDY FLEETS INTERNAL TEAM
  ========================================================== */

  if (
    companyCode ===
    'TEAM'
  ) {
    const {
      data:
        teamMember,
      error:
        teamMemberError,
    } =
      await adminClient
        .from(
          'platform_team_members'
        )
        .select(`
          user_id,
          status
        `)
        .eq(
          'user_id',
          userId
        )
        .maybeSingle();

    if (
      teamMemberError
    ) {
      throw teamMemberError;
    }

    if (
      !teamMember ||
      teamMember.status !==
        'active'
    ) {
      return null;
    }


    const {
      data:
        assignments,
      error:
        assignmentsError,
    } =
      await adminClient
        .from(
          'platform_team_member_roles'
        )
        .select(
          'role_id'
        )
        .eq(
          'user_id',
          userId
        );

    if (
      assignmentsError
    ) {
      throw assignmentsError;
    }


    const roleIds =
      (
        assignments ||
        []
      )
        .map(
          (row) =>
            row.role_id
        )
        .filter(Boolean);


    if (
      roleIds.length === 0
    ) {
      return null;
    }


    const {
      data:
        roles,
      error:
        rolesError,
    } =
      await adminClient
        .from(
          'platform_team_roles'
        )
        .select(`
          id,
          role_key,
          role_name,
          is_active
        `)
        .in(
          'id',
          roleIds
        )
        .eq(
          'is_active',
          true
        );


    if (
      rolesError
    ) {
      throw rolesError;
    }


    if (
      !roles ||
      roles.length === 0
    ) {
      return null;
    }


    return {
      portalType:
        'team',

      companyId:
        null,

      targetHost:
        'team.buddyfleets.in',

      metadata: {
        roles:
          roles.map(
            (role) =>
              role.role_key
          ),
      },
    };
  }


  /* ==========================================================
     COMPANY
  ========================================================== */

  const {
    data:
      company,
    error:
      companyError,
  } =
    await adminClient
      .from(
        'companies'
      )
      .select(`
        id,
        company_code,
        company_name,
        status,
        confirmed_at,
        account_owner_user_id,
        subdomain_slug
      `)
      .eq(
        'company_code',
        companyCode
      )
      .maybeSingle();


  if (
    companyError
  ) {
    throw companyError;
  }


  if (
    !company ||
    !company.subdomain_slug
  ) {
    return null;
  }


  if (
    company.status ===
      'pending_confirmation' ||
    company.status ===
      'suspended' ||
    company.status ===
      'cancelled'
  ) {
    return null;
  }


  if (
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


  const {
    data:
      membership,
    error:
      membershipError,
  } =
    await adminClient
      .from(
        'company_memberships'
      )
      .select(`
        id,
        status,
        access_scope
      `)
      .eq(
        'company_id',
        company.id
      )
      .eq(
        'user_id',
        userId
      )
      .maybeSingle();


  if (
    membershipError
  ) {
    throw membershipError;
  }


  if (
    !membership ||
    membership.status !==
      'active'
  ) {
    return null;
  }


  const {
    data:
      subscription,
    error:
      subscriptionError,
  } =
    await adminClient
      .from(
        'subscriptions'
      )
      .select(`
        status,
        plan_id,
        trial_end_at
      `)
      .eq(
        'company_id',
        company.id
      )
      .maybeSingle();


  if (
    subscriptionError
  ) {
    throw subscriptionError;
  }


  let effectiveStatus =
    company.status;


  if (
    company.status ===
      'trial_active' &&
    subscription
      ?.trial_end_at &&
    new Date(
      subscription.trial_end_at
    ).getTime() <=
      Date.now()
  ) {
    effectiveStatus =
      'trial_expired';
  }


  return {
    portalType:
      'company',

    companyId:
      company.id,

    /*
      COMPANY PORTAL ARCHITECTURE

      Fixed host:
      portal.buddyfleets.in

      Company identity is carried in the URL path later:
      /{company_slug}/dashboard

      IMPORTANT:
      company_slug is routing identity only.
      companyId remains the tenant/data authority.
    */
    targetHost:
      'portal.buddyfleets.in',

    metadata: {
      company_code:
        company.company_code,

      company_slug:
        company.subdomain_slug,

      company_status:
        effectiveStatus,

      membership_id:
        membership.id,

      access_scope:
        membership.access_scope,

      is_account_owner:
        company
          .account_owner_user_id ===
        userId,

      subscription_status:
        subscription
          ?.status ||
        null,

      plan_id:
        subscription
          ?.plan_id ||
        null,
    },
  };
}


/* ============================================================
   INVALIDATE OLD TEMP AUTH FLOWS
============================================================ */

async function expirePreviousFlows(
  userId: string
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
        'user_id',
        userId
      )
      .in(
        'state',
        [
          'password_verified',
          'mfa_setup_required',
          'mfa_challenge_required',
          'mfa_verified',
          'handoff_ready',
        ]
      );

  if (error) {
    throw error;
  }
}


/* ============================================================
   REVOKE PREVIOUS PORTAL HANDOFFS
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
   CREATE DIRECT PORTAL HANDOFF

   Used only when the user has explicitly left MFA disabled.
   Supabase tokens remain encrypted server-side and are never
   returned to the browser.
============================================================ */

async function createDirectPortalHandoff({
  userId,
  portal,
  session,
  encryptionKey,
  deviceIdHash,
  ipAddress,
  userAgent,
}: {
  userId: string;
  portal: PortalResolution;
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

  const handoffCode =
    createRandomCode(
      32
    );

  const expiresAt =
    new Date(
      Date.now() +
        HANDOFF_LIFETIME_MS
    ).toISOString();


  /*
    Token encryption, handoff hashing, and revoking older pending
    handoffs are independent. Do them in one parallel stage.
  */

  const [
    accessEncrypted,
    refreshEncrypted,
    handoffCodeHash,
  ] =
    await Promise.all([
      encryptSecret(
        session.access_token,
        encryptionKey
      ),

      encryptSecret(
        session.refresh_token,
        encryptionKey
      ),

      sha256Hex(
        handoffCode
      ),

      revokePreviousHandoffs(
        userId
      ),
    ]);

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
          userId,

        portal_type:
          portal.portalType,

        company_id:
          portal.companyId,

        target_host:
          portal.targetHost,

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
   MAIN HANDLER
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
       PREFLIGHT
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
       BODY SIZE
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
       REQUEST DATA
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


    const companyCode =
      String(
        body.companyCode ||
        ''
      )
        .trim()
        .toUpperCase();


    const email =
      String(
        body.email ||
        ''
      )
        .trim()
        .toLowerCase();


    /*
      NEVER trim passwords.
    */

    const password =
      typeof body.password ===
        'string'
        ? body.password
        : '';


    const deviceId =
      typeof body.deviceId ===
        'string'
        ? body.deviceId.trim()
        : '';


    /* ========================================================
       INPUT VALIDATION
    ======================================================== */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    const companyCodeRegex =
      /^[A-Z0-9_-]{2,64}$/;


    if (
      !companyCodeRegex.test(
        companyCode
      ) ||
      !emailRegex.test(
        email
      ) ||
      !password ||
      password.length > 128 ||
      !deviceId ||
      deviceId.length > 200
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


    /* ========================================================
       REQUEST SECURITY SIGNALS
    ======================================================== */

    const ipAddress =
      getClientIp(
        request
      );


    const userAgent =
      getUserAgent(
        request
      );


    let emailHash:
      string;


    let deviceIdHash:
      string;


    try {
      [
        emailHash,
        deviceIdHash,
      ] =
        await Promise.all([
          sha256Hex(
            email
          ),

          sha256Hex(
            deviceId
          ),
        ]);
    } catch {
      return jsonResponse(
        request,
        500,
        {
          ok:
            false,

          code:
            'SECURITY_INITIALIZATION_FAILED',
        }
      );
    }


    /* ========================================================
       RATE LIMIT
    ======================================================== */

    try {
      await enforceRateLimit({
        ipAddress,
        emailHash,
      });
    } catch (
      error
    ) {
      if (
        error instanceof
        RateLimitError
      ) {
        await insertSecurityEvent({
          eventType:
            'LOGIN_RATE_LIMITED',

          ipAddress,

          userAgent,

          metadata: {
            email_hash:
              emailHash,
          },
        });


        return jsonResponse(
          request,
          429,
          {
            ok:
              false,

            code:
              'TOO_MANY_REQUESTS',

            message:
              'Too many login attempts. Please try again later.',
          }
        );
      }


      console.error(
        'Rate limit check failed:',
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


    /* ========================================================
       AUDIT LOGIN REQUEST + RESOLVE USER

       These operations are independent. The audit helper already
       handles its own insert failure without exposing credentials.
    ======================================================== */

    let resolvedUserId:
      string | null =
      null;


    try {
      const [
        ,
        userIdResult,
      ] =
        await Promise.all([
          insertSecurityEvent({
            eventType:
              'LOGIN_REQUEST',

            ipAddress,

            userAgent,

            metadata: {
              email_hash:
                emailHash,

              company_code:
                companyCode,
            },
          }),

          resolveUserId(
            email
          ),
        ]);

      resolvedUserId =
        userIdResult;
    } catch (
      error
    ) {
      console.error(
        'Auth user resolution failed:',
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


    /* ========================================================
       LOCK CHECK
    ======================================================== */

    if (
      resolvedUserId
    ) {
      try {
        await ensureUserSecurityRow(
          resolvedUserId
        );


        const security =
          await getUserSecurity(
            resolvedUserId
          );


        if (
          security
            ?.is_locked
        ) {
          await insertSecurityEvent({
            userId:
              resolvedUserId,

            eventType:
              'LOCKED_ACCOUNT_LOGIN_ATTEMPT',

            ipAddress,

            userAgent,

            metadata: {
              company_code:
                companyCode,
            },
          });


          return genericAuthFailure(
            request
          );
        }
      } catch (
        error
      ) {
        console.error(
          'Account security check failed:',
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


    /* ========================================================
       PASSWORD AUTH CLIENT
    ======================================================== */

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


    /* ========================================================
       PASSWORD VERIFY

       Password exists ONLY in function memory.
       Never stored or logged.
    ======================================================== */

    const {
      data:
        authData,
      error:
        authError,
    } =
      await authClient
        .auth
        .signInWithPassword({
          email,
          password,
        });


    /* ========================================================
       PASSWORD FAILURE
    ======================================================== */

    if (
      authError ||
      !authData
        ?.user ||
      !authData
        ?.session
    ) {
      if (
        resolvedUserId &&
        isInvalidCredentialsError(
          authError
        )
      ) {
        try {
          await registerFailedPassword({
            userId:
              resolvedUserId,

            ipAddress,

            userAgent,
          });
        } catch (
          error
        ) {
          console.error(
            'Failed-login security registration failed:',
            error
          );
        }
      } else {
        await insertSecurityEvent({
          userId:
            resolvedUserId,

          eventType:
            'LOGIN_AUTH_REJECTED',

          ipAddress,

          userAgent,

          metadata: {
            auth_error_code:
              authError
                ?.code ||
              'unknown',
          },
        });
      }


      return genericAuthFailure(
        request
      );
    }


    const authUser =
      authData.user;


    const authSession =
      authData.session;


    /* ========================================================
       PRE-AUTH USER MISMATCH PROTECTION
    ======================================================== */

    if (
      resolvedUserId &&
      resolvedUserId !==
        authUser.id
    ) {
      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
        );


      await insertSecurityEvent({
        userId:
          authUser.id,

        eventType:
          'SECURITY_USER_RESOLUTION_MISMATCH',

        ipAddress,

        userAgent,
      });


      return genericAuthFailure(
        request
      );
    }


    /* ========================================================
       SECURITY ROW + SECOND LOCK CHECK

       This protects even if pre-auth lookup ever failed.
    ======================================================== */

    let postAuthSecurity:
      Awaited<
        ReturnType<
          typeof getUserSecurity
        >
      > |
      null =
      null;


    try {
      await ensureUserSecurityRow(
        authUser.id
      );


      postAuthSecurity =
        await getUserSecurity(
          authUser.id
        );


      if (
        postAuthSecurity
          ?.is_locked
      ) {
        await authClient
          .auth
          .signOut({
            scope:
              'local',
          })
          .catch(
            () => {}
          );


        await insertSecurityEvent({
          userId:
            authUser.id,

          eventType:
            'LOCKED_ACCOUNT_PASSWORD_VERIFIED',

          ipAddress,

          userAgent,
        });


        return genericAuthFailure(
          request
        );
      }
    } catch (
      error
    ) {
      console.error(
        'Post-auth security check failed:',
        error
      );


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
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


    /* ========================================================
       EMAIL CONFIRMATION
    ======================================================== */

    if (
      !authUser
        .email_confirmed_at
    ) {
      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
        );


      await insertSecurityEvent({
        userId:
          authUser.id,

        eventType:
          'UNCONFIRMED_EMAIL_LOGIN_ATTEMPT',

        ipAddress,

        userAgent,
      });


      return genericAuthFailure(
        request
      );
    }


    /* ========================================================
       PASSWORD SUCCESS + PORTAL RESOLUTION

       Resetting the failed-attempt counter, recording the password
       audit, and resolving portal authorization are independent
       after the second lock check succeeds. Run them concurrently.
    ======================================================== */

    let portal:
      PortalResolution |
      null;


    try {
      const [
        ,
        ,
        portalResult,
      ] =
        await Promise.all([
          clearFailedPasswordAttempts(
            authUser.id
          ),

          insertSecurityEvent({
            userId:
              authUser.id,

            eventType:
              'PASSWORD_VERIFIED',

            ipAddress,

            userAgent,
          }),

          resolvePortal({
            companyCode,
            userId:
              authUser.id,
          }),
        ]);

      portal =
        portalResult;
    } catch (
      error
    ) {
      console.error(
        'Post-password authorization/update failed:',
        error
      );


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
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


    if (!portal) {
      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
        );


      await insertSecurityEvent({
        userId:
          authUser.id,

        eventType:
          'PORTAL_AUTHORIZATION_REJECTED',

        ipAddress,

        userAgent,

        metadata: {
          company_code:
            companyCode,
        },
      });


      return genericAuthFailure(
        request
      );
    }


    /* ========================================================
       SESSION ID / JWT
    ======================================================== */

    let jwtPayload:
      Record<
        string,
        unknown
      >;


    try {
      jwtPayload =
        decodeJwtPayload(
          authSession
            .access_token
        );
    } catch (
      error
    ) {
      console.error(
        'JWT metadata read failed:',
        error
      );


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
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


    const authSessionId =
      typeof jwtPayload
        .session_id ===
        'string'
        ? jwtPayload
            .session_id
        : null;


    const currentAal =
      jwtPayload.aal ===
        'aal2'
        ? 'aal2'
        : 'aal1';


    if (
      !authSessionId
    ) {
      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
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
       USER MFA PREFERENCE

       MFA is optional and explicitly controlled by the user.
       Login NEVER auto-enrolls a factor.
    ======================================================== */

    const mfaEnabled =
      postAuthSecurity
        ?.mfa_enabled ===
      true;


    /* ========================================================
       ENCRYPTION KEY
    ======================================================== */

    let encryptionKey:
      CryptoKey;


    try {
      encryptionKey =
        await getEncryptionKey();
    } catch (
      error
    ) {
      console.error(
        'Encryption key initialization failed:',
        error
      );


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
        );


      return jsonResponse(
        request,
        500,
        {
          ok:
            false,

          code:
            'SECURITY_INITIALIZATION_FAILED',
        }
      );
    }


    /* ========================================================
       MFA DISABLED

       Password + authorization are sufficient for this user.
       Create the single active Buddy Fleets security session
       and a short-lived one-time portal handoff immediately.
    ======================================================== */

    if (
      !mfaEnabled
    ) {
      try {
        await expirePreviousFlows(
          authUser.id
        );


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
                  authUser.id,

                p_auth_session_id:
                  authSessionId,

                p_portal_type:
                  portal.portalType,

                p_company_id:
                  portal.companyId,

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


          throw new Error(
            'SECURITY_SESSION_FAILED'
          );
        }


        const handoff =
          await createDirectPortalHandoff({
            userId:
              authUser.id,

            portal,

            session:
              authSession,

            encryptionKey,

            deviceIdHash,

            ipAddress,

            userAgent,
          });


        await insertSecurityEvent({
          userId:
            authUser.id,

          companyId:
            portal.companyId,

          eventType:
            'LOGIN_SUCCESS',

          portalType:
            portal.portalType,

          ipAddress,

          userAgent,

          metadata: {
            ...portal.metadata,

            mfa_enabled:
              false,

            session_aal:
              currentAal,

            security_session_id:
              securitySessionId,

            auth_session_id:
              authSessionId,

            target_host:
              portal.targetHost,

            handoff_expires_at:
              handoff.expiresAt,
          },
        });


        return jsonResponse(
          request,
          200,
          {
            ok:
              true,

            nextStep:
              'PORTAL_HANDOFF',

            targetHost:
              portal.targetHost,

            handoffCode:
              handoff.handoffCode,

            expiresIn:
              Math.floor(
                HANDOFF_LIFETIME_MS /
                  1000
              ),
          }
        );
      } catch (
        error
      ) {
        console.error(
          'Direct portal handoff failed:',
          error
        );


        await authClient
          .auth
          .signOut({
            scope:
              'local',
          })
          .catch(
            () => {}
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
    }


    /* ========================================================
       MFA ENABLED

       A verified TOTP factor MUST already exist because MFA
       enrollment belongs in Security Settings, not login.
    ======================================================== */

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
        'MFA factor check failed:',
        factorsError
      );


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
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


    const verifiedTotp =
      factors
        ?.totp
        ?.find(
          (factor) =>
            factor.status ===
            'verified'
        ) ||
      null;


    if (
      !verifiedTotp
    ) {
      await insertSecurityEvent({
        userId:
          authUser.id,

        companyId:
          portal.companyId,

        eventType:
          'MFA_CONFIGURATION_REQUIRED',

        portalType:
          portal.portalType,

        ipAddress,

        userAgent,

        metadata: {
          ...portal.metadata,

          mfa_enabled:
            true,
        },
      });


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
        );


      return jsonResponse(
        request,
        409,
        {
          ok:
            false,

          code:
            'MFA_CONFIGURATION_REQUIRED',

          message:
            'Two-factor authentication is enabled, but no verified authenticator is configured.',
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
            verifiedTotp.id,
        });


    if (
      challengeError ||
      !challenge
        ?.id
    ) {
      console.error(
        'MFA challenge failed:',
        challengeError
      );


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
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


    /* ========================================================
       ENCRYPT SUPABASE TOKENS

       NEVER returned to browser.
    ======================================================== */

    const encryptedAccess =
      await encryptSecret(
        authSession
          .access_token,
        encryptionKey
      );


    const encryptedRefresh =
      await encryptSecret(
        authSession
          .refresh_token,
        encryptionKey
      );


    /* ========================================================
       ONE ACTIVE TEMP LOGIN FLOW
    ======================================================== */

    try {
      await expirePreviousFlows(
        authUser.id
      );
    } catch (
      error
    ) {
      console.error(
        'Previous login-flow expiration failed:',
        error
      );


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
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
       CREATE OPAQUE FLOW CODE
    ======================================================== */

    const flowCode =
      createRandomCode(
        32
      );


    const flowCodeHash =
      await sha256Hex(
        flowCode
      );


    const expiresAt =
      new Date(
        Date.now() +
          LOGIN_FLOW_LIFETIME_MS
      ).toISOString();


    /* ========================================================
       STORE MFA CHALLENGE FLOW
    ======================================================== */

    const {
      error:
        flowInsertError,
    } =
      await adminClient
        .from(
          'auth_login_flows'
        )
        .insert({
          flow_code_hash:
            flowCodeHash,

          user_id:
            authUser.id,

          portal_type:
            portal.portalType,

          company_id:
            portal.companyId,

          target_host:
            portal.targetHost,

          auth_session_id:
            authSessionId,

          state:
            'mfa_challenge_required',

          session_aal:
            currentAal,

          mfa_factor_id:
            verifiedTotp.id,

          mfa_challenge_id:
            challenge.id,

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

          device_id_hash:
            deviceIdHash,

          ip_address:
            ipAddress,

          user_agent:
            userAgent,

          expires_at:
            expiresAt,
        });


    if (
      flowInsertError
    ) {
      console.error(
        'Secure login flow creation failed:',
        flowInsertError
      );


      await authClient
        .auth
        .signOut({
          scope:
            'local',
        })
        .catch(
          () => {}
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


    await insertSecurityEvent({
      userId:
        authUser.id,

      companyId:
        portal.companyId,

      eventType:
        'MFA_CHALLENGE_CREATED',

      portalType:
        portal.portalType,

      ipAddress,

      userAgent,

      metadata: {
        ...portal.metadata,

        mfa_enabled:
          true,

        auth_session_id:
          authSessionId,

        flow_expires_at:
          expiresAt,
      },
    });


    return jsonResponse(
      request,
      200,
      {
        ok:
          true,

        nextStep:
          'MFA_CHALLENGE',

        flowCode,

        expiresIn:
          Math.floor(
            LOGIN_FLOW_LIFETIME_MS /
              1000
          ),
      }
    );
  }
);