import { createClient } from 'npm:@supabase/supabase-js@2';

/* ============================================================
   BUDDY FLEETS
   SECURE ONE-TIME PORTAL HANDOFF CONSUMER

   MFA completed on:
   https://buddyfleets.in/login

          ↓

   60-second one-time handoff

          ↓

   developer.buddyfleets.in
   team.buddyfleets.in
   portal.buddyfleets.in/{companySlug}/...

   SECURITY:
   - One-time handoff
   - 60 second expiry
   - Exact target origin
   - Same IP
   - Same browser User-Agent
   - Account lock check
   - AAL2 required
   - Active security session required
   - Role / tenant re-validation
   - Portal-specific device binding
   - Tokens NEVER placed in URL
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const MAX_BODY_BYTES =
  8 * 1024;

const MAX_DEVICE_ID_LENGTH =
  200;

const PORTAL_HOSTS = {
  developer:
    'developer.buddyfleets.in',

  team:
    'team.buddyfleets.in',

  company:
    'portal.buddyfleets.in',
} as const;


/* ============================================================
   ENVIRONMENT HELPERS
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


if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !AUTH_FLOW_ENCRYPTION_KEY
) {
  throw new Error(
    'Required consume-handoff environment variables are missing.'
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
   PORTAL ORIGIN SECURITY

   Fixed production portal origins only:

   https://developer.buddyfleets.in
   https://team.buddyfleets.in
   https://portal.buddyfleets.in

   Company identity is NOT carried by hostname anymore.
   It lives in the URL path:

   /{companySlug}/...

   Final exact hostname is still verified against
   handoff.target_host.
============================================================ */

function isBuddyFleetsPortalOrigin(
  origin: string | null
) {
  if (!origin) {
    return false;
  }

  try {
    const url =
      new URL(origin);

    if (
      url.protocol !==
      'https:'
    ) {
      return false;
    }

    if (
      url.port
    ) {
      return false;
    }

    const hostname =
      url.hostname.toLowerCase();

    return (
      hostname ===
        PORTAL_HOSTS.developer ||
      hostname ===
        PORTAL_HOSTS.team ||
      hostname ===
        PORTAL_HOSTS.company
    );
  } catch {
    return false;
  }
}


function getOriginHostname(
  origin: string
) {
  try {
    return new URL(
      origin
    ).hostname.toLowerCase();
  } catch {
    return null;
  }
}


/* ============================================================
   RESPONSE HELPERS
============================================================ */

function getCorsHeaders(
  origin: string | null
) {
  return {
    'Access-Control-Allow-Origin':
      isBuddyFleetsPortalOrigin(
        origin
      )
        ? origin!
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
   CRYPTO
============================================================ */

const encoder =
  new TextEncoder();


const decoder =
  new TextDecoder();


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
   NETWORK SIGNALS
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
      'Security-event write failed:',
      error
    );
  }
}


/* ============================================================
   LOAD HANDOFF
============================================================ */

async function loadHandoff(
  handoffCode: string
) {
  const handoffHash =
    await sha256Hex(
      handoffCode
    );

  const {
    data,
    error,
  } =
    await adminClient
      .from(
        'auth_portal_handoffs'
      )
      .select(`
        id,
        handoff_code_hash,
        user_id,
        portal_type,
        company_id,
        target_host,
        auth_session_id,
        encrypted_access_token,
        access_token_iv,
        encrypted_refresh_token,
        refresh_token_iv,
        device_id_hash,
        ip_address,
        user_agent,
        created_at,
        expires_at,
        consumed_at,
        status
      `)
      .eq(
        'handoff_code_hash',
        handoffHash
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

async function getAccountSecurity(
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


/* ============================================================
   PORTAL ENTITLEMENT RE-VALIDATION

   Never trust the temporary handoff alone.
   Final authorization is rechecked here.
============================================================ */

async function verifyPortalAuthorization(
  handoff: Record<
    string,
    any
  >
) {
  /* ==========================================================
     DEVELOPER
  ========================================================== */

  if (
    handoff.portal_type ===
    'developer'
  ) {
    if (
      handoff.target_host !==
      'developer.buddyfleets.in'
    ) {
      return false;
    }

    const {
      data,
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
          handoff.user_id
        )
        .eq(
          'is_active',
          true
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    return Boolean(
      data?.is_active
    );
  }


  /* ==========================================================
     TEAM
  ========================================================== */

  if (
    handoff.portal_type ===
    'team'
  ) {
    if (
      handoff.target_host !==
      'team.buddyfleets.in'
    ) {
      return false;
    }

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
        .select(
          'user_id, status'
        )
        .eq(
          'user_id',
          handoff.user_id
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
      return false;
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
          handoff.user_id
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
      return false;
    }


    const {
      data:
        activeRoles,
      error:
        activeRolesError,
    } =
      await adminClient
        .from(
          'platform_team_roles'
        )
        .select(
          'id'
        )
        .in(
          'id',
          roleIds
        )
        .eq(
          'is_active',
          true
        )
        .limit(1);


    if (
      activeRolesError
    ) {
      throw activeRolesError;
    }


    return Boolean(
      activeRoles &&
      activeRoles.length >
        0
    );
  }


  /* ==========================================================
     COMPANY
  ========================================================== */

  if (
    handoff.portal_type ===
    'company'
  ) {
    if (
      !handoff.company_id
    ) {
      return false;
    }


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
          status,
          subdomain_slug
        `)
        .eq(
          'id',
          handoff.company_id
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
      return false;
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
      return false;
    }


    const expectedHost =
      PORTAL_HOSTS.company;


    if (
      handoff.target_host !==
      expectedHost
    ) {
      return false;
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
        .select(
          'id, status'
        )
        .eq(
          'company_id',
          company.id
        )
        .eq(
          'user_id',
          handoff.user_id
        )
        .maybeSingle();


    if (
      membershipError
    ) {
      throw membershipError;
    }


    return Boolean(
      membership &&
      membership.status ===
        'active'
    );
  }


  return false;
}


/* ============================================================
   COMPANY SLUG RESOLUTION

   The slug is routing identity only.
   Tenant authorization remains bound to company_id.
============================================================ */

async function resolveCompanySlug(
  handoff: Record<
    string,
    any
  >
) {
  if (
    handoff.portal_type !==
      'company' ||
    !handoff.company_id
  ) {
    return null;
  }


  const {
    data,
    error,
  } =
    await adminClient
      .from(
        'companies'
      )
      .select(
        'subdomain_slug'
      )
      .eq(
        'id',
        handoff.company_id
      )
      .maybeSingle();


  if (error) {
    throw error;
  }


  const slug =
    typeof data
      ?.subdomain_slug ===
      'string'
      ? data
          .subdomain_slug
          .trim()
          .toLowerCase()
      : '';


  return slug ||
    null;
}


/* ============================================================
   SECURITY SESSION VALIDATION
============================================================ */

async function loadActiveSecuritySession(
  handoff: Record<
    string,
    any
  >
) {
  let query =
    adminClient
      .from(
        'security_sessions'
      )
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
        last_seen_at
      `)
      .eq(
        'user_id',
        handoff.user_id
      )
      .eq(
        'auth_session_id',
        handoff.auth_session_id
      )
      .eq(
        'portal_type',
        handoff.portal_type
      )
      .eq(
        'status',
        'active'
      );


  if (
    handoff.company_id
  ) {
    query =
      query.eq(
        'company_id',
        handoff.company_id
      );
  } else {
    query =
      query.is(
        'company_id',
        null
      );
  }


  const {
    data,
    error,
  } =
    await query
      .maybeSingle();


  if (error) {
    throw error;
  }


  return data;
}


/* ============================================================
   RESTORE AAL2 AUTH SESSION
============================================================ */

async function restoreSupabaseSession(
  handoff: Record<
    string,
    any
  >
) {
  const encryptionKey =
    await getEncryptionKey();


  const accessToken =
    await decryptSecret(
      handoff
        .encrypted_access_token,

      handoff
        .access_token_iv,

      encryptionKey
    );


  const refreshToken =
    await decryptSecret(
      handoff
        .encrypted_refresh_token,

      handoff
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
      'HANDOFF_AUTH_SESSION_INVALID'
    );
  }


  const session =
    sessionResult.session;


  const jwtPayload =
    decodeJwtPayload(
      session.access_token
    );


  const jwtUserId =
    typeof jwtPayload.sub ===
      'string'
      ? jwtPayload.sub
      : null;


  const jwtSessionId =
    typeof jwtPayload
      .session_id ===
      'string'
      ? jwtPayload
          .session_id
      : null;


  const jwtAal =
    typeof jwtPayload.aal ===
      'string'
      ? jwtPayload.aal
      : null;


  if (
    jwtUserId !==
      handoff.user_id ||
    jwtSessionId !==
      handoff.auth_session_id ||
    jwtAal !==
      'aal2'
  ) {
    throw new Error(
      'HANDOFF_SESSION_CONTEXT_INVALID'
    );
  }


  const {
    data:
      verifiedUser,
    error:
      verifiedUserError,
  } =
    await authClient
      .auth
      .getUser(
        session.access_token
      );


  if (
    verifiedUserError ||
    !verifiedUser
      ?.user ||
    verifiedUser
      .user
      .id !==
      handoff.user_id
  ) {
    throw new Error(
      'HANDOFF_USER_INVALID'
    );
  }


  return {
    session,
    authClient,
  };
}


/* ============================================================
   CONSUME HANDOFF ATOMICALLY

   If two requests race:
   only ONE request gets the row.
============================================================ */

async function consumeHandoff(
  handoffId: string
) {
  const consumedAt =
    new Date()
      .toISOString();


  const {
    data,
    error,
  } =
    await adminClient
      .from(
        'auth_portal_handoffs'
      )
      .update({
        status:
          'consumed',

        consumed_at:
          consumedAt,

        /*
          Scrub encrypted Supabase tokens after consumption.

          The real tokens only survive in this Edge Function
          request memory and the HTTPS response.
        */

        encrypted_access_token:
          '',

        access_token_iv:
          '',

        encrypted_refresh_token:
          '',

        refresh_token_iv:
          '',
      })
      .eq(
        'id',
        handoffId
      )
      .eq(
        'status',
        'pending'
      )
      .is(
        'consumed_at',
        null
      )
      .select(
        'id'
      )
      .maybeSingle();


  if (error) {
    throw error;
  }


  return Boolean(
    data?.id
  );
}


/* ============================================================
   PORTAL DEVICE BINDING
============================================================ */

async function bindPortalDevice({
  securitySessionId,
  deviceIdHash,
  ipAddress,
  userAgent,
}: {
  securitySessionId: string;
  deviceIdHash: string;
  ipAddress: string | null;
  userAgent: string;
}) {
  const {
    error,
  } =
    await adminClient
      .from(
        'security_sessions'
      )
      .update({
        device_id_hash:
          deviceIdHash,

        ip_address:
          ipAddress,

        user_agent:
          userAgent,

        last_seen_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'id',
        securitySessionId
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
        !isBuddyFleetsPortalOrigin(
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
       PORTAL ORIGIN REQUIRED
    ======================================================== */

    if (
      !isBuddyFleetsPortalOrigin(
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


    const originHost =
      getOriginHostname(
        origin!
      );


    if (!originHost) {
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


    const handoffCode =
      String(
        body.handoffCode ||
        ''
      ).trim();


    const portalDeviceId =
      String(
        body.deviceId ||
        ''
      ).trim();


    if (
      handoffCode.length <
        20 ||
      handoffCode.length >
        200 ||
      portalDeviceId.length <
        16 ||
      portalDeviceId.length >
        MAX_DEVICE_ID_LENGTH
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
       REQUEST SIGNALS
    ======================================================== */

    const ipAddress =
      getClientIp(
        request
      );


    const userAgent =
      getUserAgent(
        request
      );


    const portalDeviceHash =
      await sha256Hex(
        portalDeviceId
      );


    /* ========================================================
       LOAD HANDOFF
    ======================================================== */

    let handoff:
      Record<
        string,
        any
      > |
      null;


    try {
      handoff =
        await loadHandoff(
          handoffCode
        );
    } catch (
      error
    ) {
      console.error(
        'Handoff lookup failed:',
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


    if (!handoff) {
      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'HANDOFF_INVALID',
        }
      );
    }


    /* ========================================================
       ONE-TIME + EXPIRY CHECK
    ======================================================== */

    const expiry =
      new Date(
        handoff.expires_at
      ).getTime();


    if (
      handoff.status !==
        'pending' ||
      handoff.consumed_at ||
      !Number.isFinite(
        expiry
      ) ||
      expiry <=
        Date.now()
    ) {
      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'HANDOFF_EXPIRED',
        }
      );
    }


    /* ========================================================
       EXACT TARGET HOST CHECK
    ======================================================== */

    if (
      originHost !==
      String(
        handoff.target_host
      ).toLowerCase()
    ) {
      await insertSecurityEvent({
        userId:
          handoff.user_id,

        companyId:
          handoff.company_id,

        eventType:
          'HANDOFF_WRONG_PORTAL',

        portalType:
          handoff.portal_type,

        ipAddress,

        userAgent,

        metadata: {
          expected_host:
            handoff.target_host,

          received_host:
            originHost,
        },
      });


      return jsonResponse(
        request,
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
       IP BINDING

       Locked high-security rule:
       IP changes during authentication -> restart login.
    ======================================================== */

    if (
      handoff.ip_address &&
      ipAddress &&
      String(
        handoff.ip_address
      ) !==
        String(
          ipAddress
        )
    ) {
      await insertSecurityEvent({
        userId:
          handoff.user_id,

        companyId:
          handoff.company_id,

        eventType:
          'HANDOFF_IP_CHANGED',

        portalType:
          handoff.portal_type,

        ipAddress,

        userAgent,
      });


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
       USER-AGENT BINDING
    ======================================================== */

    if (
      handoff.user_agent &&
      userAgent !==
        handoff.user_agent
    ) {
      await insertSecurityEvent({
        userId:
          handoff.user_id,

        companyId:
          handoff.company_id,

        eventType:
          'HANDOFF_BROWSER_CHANGED',

        portalType:
          handoff.portal_type,

        ipAddress,

        userAgent,
      });


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

    let accountSecurity:
      any;


    try {
      accountSecurity =
        await getAccountSecurity(
          handoff.user_id
        );
    } catch (
      error
    ) {
      console.error(
        'Account security lookup failed:',
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
      !accountSecurity ||
      accountSecurity
        .is_locked
    ) {
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


    /* ========================================================
       RE-VALIDATE PORTAL AUTHORIZATION
    ======================================================== */

    let authorized =
      false;


    try {
      authorized =
        await verifyPortalAuthorization(
          handoff
        );
    } catch (
      error
    ) {
      console.error(
        'Portal authorization re-check failed:',
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


    if (!authorized) {
      await insertSecurityEvent({
        userId:
          handoff.user_id,

        companyId:
          handoff.company_id,

        eventType:
          'HANDOFF_AUTHORIZATION_REJECTED',

        portalType:
          handoff.portal_type,

        ipAddress,

        userAgent,
      });


      return jsonResponse(
        request,
        403,
        {
          ok:
            false,

          code:
            'ACCESS_REVOKED',
        }
      );
    }


    /* ========================================================
       ACTIVE SECURITY SESSION
    ======================================================== */

    let securitySession:
      any;


    try {
      securitySession =
        await loadActiveSecuritySession(
          handoff
        );
    } catch (
      error
    ) {
      console.error(
        'Security-session lookup failed:',
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
      !securitySession
    ) {
      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'SESSION_REVOKED',
        }
      );
    }


    /* ========================================================
       DECRYPT + VERIFY SUPABASE AAL2 SESSION
    ======================================================== */

    let restored:
      Awaited<
        ReturnType<
          typeof restoreSupabaseSession
        >
      >;


    try {
      restored =
        await restoreSupabaseSession(
          handoff
        );
    } catch (
      error
    ) {
      console.error(
        'Portal handoff session restoration failed:',
        error
      );


      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'HANDOFF_SESSION_INVALID',
        }
      );
    }


    const session =
      restored.session;


    /* ========================================================
       BIND PORTAL-SPECIFIC DEVICE
    ======================================================== */

    try {
      await bindPortalDevice({
        securitySessionId:
          securitySession.id,

        deviceIdHash:
          portalDeviceHash,

        ipAddress,

        userAgent,
      });
    } catch (
      error
    ) {
      console.error(
        'Portal device binding failed:',
        error
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
       ATOMIC ONE-TIME CONSUMPTION
    ======================================================== */

    let consumed =
      false;


    try {
      consumed =
        await consumeHandoff(
          handoff.id
        );
    } catch (
      error
    ) {
      console.error(
        'Handoff consumption failed:',
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


    if (!consumed) {
      return jsonResponse(
        request,
        401,
        {
          ok:
            false,

          code:
            'HANDOFF_ALREADY_USED',
        }
      );
    }


    /* ========================================================
       AUDIT SUCCESS
    ======================================================== */

    await insertSecurityEvent({
      userId:
        handoff.user_id,

      companyId:
        handoff.company_id,

      eventType:
        'PORTAL_HANDOFF_CONSUMED',

      portalType:
        handoff.portal_type,

      ipAddress,

      userAgent,

      metadata: {
        target_host:
          handoff.target_host,

        security_session_id:
          securitySession.id,

        auth_session_id:
          handoff.auth_session_id,
      },
    });


    /* ========================================================
       COMPANY ROUTING IDENTITY
    ======================================================== */

    let companySlug:
      string |
      null =
      null;


    try {
      companySlug =
        await resolveCompanySlug(
          handoff
        );
    } catch (
      error
    ) {
      console.error(
        'Company slug resolution failed:',
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
      handoff.portal_type ===
        'company' &&
      !companySlug
    ) {
      return jsonResponse(
        request,
        403,
        {
          ok:
            false,

          code:
            'ACCESS_REVOKED',
        }
      );
    }


    /* ========================================================
       SAFE HTTPS RESPONSE

       IMPORTANT:

       Tokens are returned ONLY here over HTTPS to the
       already-verified exact portal origin.

       They are NEVER:
       - placed in URL
       - placed in query string
       - placed in fragment
       - logged
       - stored plaintext in DB

       Portal callback will immediately call:

       supabase.auth.setSession({
         access_token,
         refresh_token
       })

       and then navigate to:
       - /dashboard for developer/team
       - /{companySlug}/dashboard for company
    ======================================================== */

    return jsonResponse(
      request,
      200,
      {
        ok:
          true,

        accessToken:
          session.access_token,

        refreshToken:
          session.refresh_token,

        expiresAt:
          session.expires_at ||
          null,

        tokenType:
          session.token_type ||
          'bearer',

        portalType:
          handoff.portal_type,

        targetHost:
          handoff.target_host,

        companySlug,
      }
    );
  }
);