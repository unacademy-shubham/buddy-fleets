import {
  createHash,
  webcrypto,
} from 'node:crypto';

import {
  createClient,
} from '@supabase/supabase-js';


/* ============================================================
   BUDDY FLEETS
   SECURE HTTPONLY PORTAL SESSION VALIDATOR

   GET /api/auth/session

   FIXED PORTAL ARCHITECTURE:

   developer.buddyfleets.in
   team.buddyfleets.in
   portal.buddyfleets.in/{companySlug}/...

   SECURITY:

   - Host-only HttpOnly cookie
   - Account lock check
   - Session expiry check
   - Single-session registry check
   - IP binding
   - Browser/User-Agent binding
   - Fixed portal hostname verification
   - Tenant / role authorization re-check
   - Supabase user verification
   - Optional MFA policy re-validation

   MFA POLICY:

   mfa_enabled = false
   → AAL1 or AAL2 accepted

   mfa_enabled = true
   → AAL2 required

   IMPORTANT:

   company_id is tenant authorization authority.

   companySlug/subdomain_slug is only routing identity.

   NEVER RETURNS:

   - Supabase access token
   - Supabase refresh token
   - cookie token
   - session token hash
   - service-role key
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
    .status(
      status
    )
    .json(
      payload
    );
}


/* ============================================================
   COOKIE
============================================================ */

function parseCookies(
  cookieHeader
) {
  const result = {};


  if (
    !cookieHeader
  ) {
    return result;
  }


  String(
    cookieHeader
  )
    .split(';')
    .forEach(
      (
        part
      ) => {
        const separator =
          part.indexOf('=');


        if (
          separator <=
          0
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


        const value =
          part
            .slice(
              separator + 1
            )
            .trim();


        try {
          result[
            name
          ] =
            decodeURIComponent(
              value
            );
        } catch {
          result[
            name
          ] =
            value;
        }
      }
    );


  return result;
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
    ].join(
      '; '
    )
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
    value ||
    ''
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
   SAME-ORIGIN SAFETY

   GET requests may not always send Origin.

   If Origin exists, it MUST match current portal host.
============================================================ */

function originMatchesHost(
  req,
  requestHost
) {
  const origin =
    req.headers
      .origin;


  if (
    !origin
  ) {
    return true;
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
   CLIENT IP
============================================================ */

function getClientIp(
  req
) {
  const forwarded =
    req.headers[
      'x-forwarded-for'
    ];


  if (
    forwarded
  ) {
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


  if (
    realIp
  ) {
    return String(
      realIp
    ).trim();
  }


  return null;
}


/* ============================================================
   USER AGENT
============================================================ */

function getUserAgent(
  req
) {
  return String(
    req.headers[
      'user-agent'
    ] ||
    ''
  ).slice(
    0,
    1000
  );
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
  const result =
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
      result
    );
}


/* ============================================================
   JWT
============================================================ */

function decodeJwtPayload(
  token
) {
  const parts =
    String(
      token ||
      ''
    ).split('.');


  if (
    parts.length !==
    3
  ) {
    throw new Error(
      'Invalid JWT.'
    );
  }


  const normalized =
    parts[1]
      .replace(
        /-/g,
        '+'
      )
      .replace(
        /_/g,
        '/'
      );


  const padded =
    normalized.padEnd(
      Math.ceil(
        normalized.length /
        4
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


  if (
    error
  ) {
    console.error(
      'Security event write failed:',
      error.message
    );
  }
}


/* ============================================================
   REVOKE / EXPIRE SESSION
============================================================ */

async function invalidateSession({
  sessionId,
  reason,
  expired = false,
}) {
  if (
    !sessionId
  ) {
    return;
  }


  const {
    error,
  } =
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


  if (
    error
  ) {
    console.error(
      'Session invalidation failed:',
      error.message
    );
  }
}


/* ============================================================
   LOAD SESSION BY COOKIE HASH
============================================================ */

async function getSecuritySession(
  cookieToken
) {
  const tokenHash =
    sha256Hex(
      cookieToken
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
      .eq(
        'portal_session_token_hash',
        tokenHash
      )
      .eq(
        'status',
        'active'
      )
      .maybeSingle();


  if (
    error
  ) {
    throw error;
  }


  return data;
}


/* ============================================================
   ACCOUNT SECURITY

   This is also the authoritative MFA preference source.
============================================================ */

async function getAccountSecurity(
  userId
) {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        'user_security'
      )
      .select(`
        user_id,
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


  if (
    error
  ) {
    throw error;
  }


  return data;
}


/* ============================================================
   PROFILE
============================================================ */

async function getProfile(
  userId
) {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        'profiles'
      )
      .select(`
        id,
        full_name,
        email,
        mobile
      `)
      .eq(
        'id',
        userId
      )
      .maybeSingle();


  if (
    error
  ) {
    throw error;
  }


  return data;
}



async function getEffectiveCompanyAccess(companyId) {
  const { data: override, error: overrideError } = await supabaseAdmin
    .from('developer_company_overrides')
    .select('enabled,plan_key,limits_override,entitlements_override,revision,updated_at')
    .eq('company_id', companyId)
    .maybeSingle();

  if (overrideError) {
    // Phase 2.1 tables are additive. Authentication must remain available
    // even during a rolling deploy before the migration reaches the database.
    console.error('Company entitlement override lookup failed:', overrideError.message);
    return null;
  }

  if (!override?.enabled) {
    return null;
  }

  let plan = null;
  if (override.plan_key) {
    const { data, error } = await supabaseAdmin
      .from('developer_plans')
      .select('plan_key,name,status,limits,entitlements,revision,updated_at')
      .eq('plan_key', override.plan_key)
      .maybeSingle();

    if (error) {
      console.error('Company effective plan lookup failed:', error.message);
    } else if (data && data.status !== 'archived') {
      plan = data;
    }
  }

  const baseLimits = plan?.limits && typeof plan.limits === 'object' ? plan.limits : {};
  const overrideLimits =
    override?.limits_override && typeof override.limits_override === 'object'
      ? override.limits_override
      : {};
  const overrideEntitlements = Array.isArray(override?.entitlements_override)
    ? override.entitlements_override
    : [];
  const baseEntitlements = Array.isArray(plan?.entitlements) ? plan.entitlements : [];

  return {
    overrideEnabled: true,
    planKey: plan?.plan_key || override.plan_key || null,
    planName: plan?.name || null,
    limits: {
      ...baseLimits,
      ...overrideLimits,
    },
    entitlements: overrideEntitlements.length ? overrideEntitlements : baseEntitlements,
    overrideRevision: override.revision || null,
    updatedAt: override.updated_at || plan?.updated_at || null,
  };
}


/* ============================================================
   EXPECTED PORTAL CONTEXT
============================================================ */

async function getExpectedPortalContext(
  session
) {
  /* ==========================================================
     DEVELOPER
  ========================================================== */

  if (
    session.portal_type ===
    'developer'
  ) {
    const {
      data,
      error,
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
          session.user_id
        )
        .eq(
          'is_active',
          true
        )
        .maybeSingle();


    if (
      error
    ) {
      throw error;
    }


    if (
      !data
        ?.is_active
    ) {
      return null;
    }


    return {
      expectedHost:
        DEVELOPER_HOST,

      portalType:
        'developer',

      company:
        null,

      membership:
        null,

      roles: [
        'SUPER_ADMIN',
      ],
    };
  }


  /* ==========================================================
     TEAM
  ========================================================== */

  if (
    session.portal_type ===
    'team'
  ) {
    const {
      data:
        member,
      error:
        memberError,
    } =
      await supabaseAdmin
        .from(
          'platform_team_members'
        )
        .select(`
          user_id,
          status
        `)
        .eq(
          'user_id',
          session.user_id
        )
        .maybeSingle();


    if (
      memberError
    ) {
      throw memberError;
    }


    if (
      !member ||
      member.status !==
        'active'
    ) {
      return null;
    }


    const {
      data:
        assignments,
      error:
        assignmentError,
    } =
      await supabaseAdmin
        .from(
          'platform_team_member_roles'
        )
        .select(
          'role_id'
        )
        .eq(
          'user_id',
          session.user_id
        );


    if (
      assignmentError
    ) {
      throw assignmentError;
    }


    const roleIds =
      (
        assignments ||
        []
      )
        .map(
          (
            item
          ) =>
            item.role_id
        )
        .filter(
          Boolean
        );


    if (
      roleIds.length ===
      0
    ) {
      return null;
    }


    const {
      data:
        roles,
      error:
        rolesError,
    } =
      await supabaseAdmin
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
      roles.length ===
        0
    ) {
      return null;
    }


    return {
      expectedHost:
        TEAM_HOST,

      portalType:
        'team',

      company:
        null,

      membership:
        null,

      roles:
        roles.map(
          (
            role
          ) =>
            role.role_key
        ),

      roleDetails:
        roles.map(
          (
            role
          ) => ({
            key:
              role.role_key,

            name:
              role.role_name,
          })
        ),
    };
  }


  /* ==========================================================
     COMPANY

     Fixed host:
     portal.buddyfleets.in

     subdomain_slug is historical DB field name.

     Semantics now:
     URL path slug only.

     company_id is tenant authorization authority.
  ========================================================== */

  if (
    session.portal_type ===
    'company'
  ) {
    if (
      !session.company_id
    ) {
      return null;
    }


    const {
      data:
        company,
      error:
        companyError,
    } =
      await supabaseAdmin
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
          'id',
          session.company_id
        )
        .maybeSingle();


    if (
      companyError
    ) {
      throw companyError;
    }


    if (
      !company ||
      !company
        .subdomain_slug
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
      await supabaseAdmin
        .from(
          'company_memberships'
        )
        .select(`
          id,
          company_id,
          user_id,
          status,
          access_scope,
          joined_at
        `)
        .eq(
          'company_id',
          company.id
        )
        .eq(
          'user_id',
          session.user_id
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


    /* Company 360 employee access control.
       Existing companies/users without a Company 360 employee row remain compatible. */
    const {
      data: companyEmployeeAccess,
      error: companyEmployeeAccessError,
    } = await supabaseAdmin
      .from('developer_company_employees')
      .select('status')
      .eq('company_id', company.id)
      .eq('user_id', session.user_id)
      .maybeSingle();

    if (companyEmployeeAccessError && companyEmployeeAccessError.code !== '42P01') {
      throw companyEmployeeAccessError;
    }

    if (
      companyEmployeeAccess &&
      companyEmployeeAccess.status !== 'active' &&
      companyEmployeeAccess.status !== 'invited'
    ) {
      return null;
    }


    const {
      data:
        subscription,
      error:
        subscriptionError,
    } =
      await supabaseAdmin
        .from(
          'subscriptions'
        )
        .select(`
          status,
          plan_id,
          trial_start_at,
          trial_end_at,
          subscription_start_at,
          subscription_end_at
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
        subscription
          .trial_end_at
      ).getTime() <=
        Date.now()
    ) {
      effectiveStatus =
        'trial_expired';
    }


    const effectiveAccess =
      await getEffectiveCompanyAccess(
        company.id
      );


    return {
      expectedHost:
        COMPANY_PORTAL_HOST,

      portalType:
        'company',

      company: {
        ...company,

        effectiveStatus,

        subscription,

        effectiveAccess,
      },

      membership,

      roles: [
        'COMPANY_USER',
      ],
    };
  }


  return null;
}


/* ============================================================
   VERIFY STORED SUPABASE SESSION

   MFA policy is supplied from user_security.

   mfaEnabled=false
   → AAL1 or AAL2 accepted.

   mfaEnabled=true
   → AAL2 required.
============================================================ */

async function verifySupabaseSession({
  securitySession,
  mfaEnabled,
}) {
  if (
    !securitySession
      .encrypted_access_token ||
    !securitySession
      .access_token_iv
  ) {
    throw new Error(
      'SERVER_AUTH_TOKEN_MISSING'
    );
  }


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
      jwt.aal ||
      ''
    )
      .trim()
      .toLowerCase();


  /* ==========================================================
     CORE SESSION IDENTITY
  ========================================================== */

  if (
    jwt.sub !==
      securitySession
        .user_id ||
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


  /* ==========================================================
     OPTIONAL MFA POLICY
  ========================================================== */

  if (
    mfaEnabled &&
    jwtAal !==
      'aal2'
  ) {
    const error =
      new Error(
        'MFA_AAL2_REQUIRED'
      );

    error.code =
      'MFA_AAL2_REQUIRED';

    throw error;
  }


  /*
    Authoritative verification against Supabase Auth.
  */

  const {
    data:
      userResult,
    error:
      userError,
  } =
    await supabaseAdmin
      .auth
      .getUser(
        accessToken
      );


  if (
    userError ||
    !userResult
      ?.user ||
    userResult
      .user
      .id !==
      securitySession
        .user_id
  ) {
    throw new Error(
      'SERVER_AUTH_USER_INVALID'
    );
  }


  return {
    authUser:
      userResult.user,

    jwt,

    aal:
      jwtAal,
  };
}


/* ============================================================
   TOUCH LAST-SEEN
============================================================ */

async function touchSession(
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
        last_seen_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'id',
        sessionId
      )
      .eq(
        'status',
        'active'
      );


  if (
    error
  ) {
    console.error(
      'Session last-seen update failed:',
      error.message
    );
  }
}


/* ============================================================
   BUILD SANITIZED CURRENT USER
============================================================ */

function buildCurrentUser({
  authUser,
  profile,
  context,
  accountSecurity,
  sessionAal,
}) {
  const mfaEnabled =
    accountSecurity
      ?.mfa_enabled ===
    true;


  /* ==========================================================
     DEVELOPER
  ========================================================== */

  if (
    context.portalType ===
    'developer'
  ) {
    return {
      id:
        authUser.id,

      username:
        authUser.email,

      email:
        authUser.email,

      name:
        profile
          ?.full_name ||
        authUser.email,

      mobile:
        profile
          ?.mobile ||
        null,

      role:
        'SUPER_ADMIN',

      roles: [
        'SUPER_ADMIN',
      ],

      userType:
        'platform_admin',

      portalType:
        'developer',

      isPlatformAdmin:
        true,

      companyId:
        null,

      companySlug:
        null,

      companyCode:
        'ADMIN',

      companyName:
        'Buddy Fleets',

      companyStatus:
        'active',

      accessScope:
        'platform',

      isAccountOwner:
        false,

      mfaEnabled,

      sessionAal,
    };
  }


  /* ==========================================================
     TEAM
  ========================================================== */

  if (
    context.portalType ===
    'team'
  ) {
    return {
      id:
        authUser.id,

      username:
        authUser.email,

      email:
        authUser.email,

      name:
        profile
          ?.full_name ||
        authUser.email,

      mobile:
        profile
          ?.mobile ||
        null,

      role:
        'INTERNAL_TEAM',

      roles:
        context.roles,

      roleDetails:
        context
          .roleDetails ||
        [],

      userType:
        'platform_team',

      portalType:
        'team',

      isPlatformAdmin:
        false,

      companyId:
        null,

      companySlug:
        null,

      companyCode:
        'TEAM',

      companyName:
        'Buddy Fleets',

      companyStatus:
        'active',

      accessScope:
        'platform_team',

      isAccountOwner:
        false,

      mfaEnabled,

      sessionAal,
    };
  }


  /* ==========================================================
     COMPANY
  ========================================================== */

  const company =
    context.company;


  const membership =
    context.membership;


  const subscription =
    company.subscription;


  return {
    id:
      authUser.id,

    username:
      authUser.email,

    email:
      authUser.email,

    name:
      profile
        ?.full_name ||
      authUser.email,

    mobile:
      profile
        ?.mobile ||
      null,

    role:
      'COMPANY_USER',

    roles: [
      'COMPANY_USER',
    ],

    userType:
      'company_user',

    portalType:
      'company',

    isPlatformAdmin:
      false,

    companyId:
      company.id,

    companyCode:
      company.company_code,

    companyName:
      company.company_name,

    companySlug:
      company.subdomain_slug,

    companyStatus:
      company.effectiveStatus,

    databaseCompanyStatus:
      company.status,

    confirmedAt:
      company.confirmed_at,

    membershipId:
      membership.id,

    membershipStatus:
      membership.status,

    accessScope:
      membership.access_scope,

    isAccountOwner:
      company
        .account_owner_user_id ===
      authUser.id,

    subscriptionStatus:
      subscription
        ?.status ||
      null,

    planId:
      subscription
        ?.plan_id ||
      null,

    trialStartAt:
      subscription
        ?.trial_start_at ||
      null,

    trialEndAt:
      subscription
        ?.trial_end_at ||
      null,

    subscriptionStartAt:
      subscription
        ?.subscription_start_at ||
      null,

    subscriptionEndAt:
      subscription
        ?.subscription_end_at ||
      null,

    effectivePlan:
      company
        .effectiveAccess
        ? {
            key:
              company
                .effectiveAccess
                .planKey ||
              null,

            name:
              company
                .effectiveAccess
                .planName ||
              null,
          }
        : null,

    effectiveLimits:
      company
        .effectiveAccess
        ?.limits ||
      {},

    effectiveEntitlements:
      company
        .effectiveAccess
        ?.entitlements ||
      [],

    companyOverrideEnabled:
      company
        .effectiveAccess
        ?.overrideEnabled ===
      true,

    mfaEnabled,

    sessionAal,
  };
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
     GET ONLY
  ======================================================== */

  if (
    req.method !==
    'GET'
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
     ORIGIN IF PROVIDED MUST MATCH
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
     SEC-FETCH-SITE
  ======================================================== */

  const secFetchSite =
    String(
      req.headers[
        'sec-fetch-site'
      ] ||
      ''
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
      401,
      {
        ok:
          false,

        code:
          'SESSION_REQUIRED',
      }
    );
  }


  /* ========================================================
     SESSION LOOKUP
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
      'Security session lookup failed:',
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
    !securitySession
  ) {
    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      401,
      {
        ok:
          false,

        code:
          'SESSION_INVALID',
      }
    );
  }


  /* ========================================================
     HTTP SESSION EXPIRY
  ======================================================== */

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
    await invalidateSession({
      sessionId:
        securitySession.id,

      reason:
        'HTTP_SESSION_EXPIRED',

      expired:
        true,
    });


    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      401,
      {
        ok:
          false,

        code:
          'SESSION_EXPIRED',
      }
    );
  }


  /* ========================================================
     ACCOUNT SECURITY + CURRENT MFA POLICY
  ======================================================== */

  let accountSecurity;


  try {
    accountSecurity =
      await getAccountSecurity(
        securitySession
          .user_id
      );
  } catch (
    error
  ) {
    console.error(
      'Account security lookup failed:',
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
    !accountSecurity ||
    accountSecurity
      .is_locked
  ) {
    await invalidateSession({
      sessionId:
        securitySession.id,

      reason:
        'ACCOUNT_SECURITY_LOCK',
    });


    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      423,
      {
        ok:
          false,

        code:
          'ACCOUNT_LOCKED',
      }
    );
  }


  const mfaEnabled =
    accountSecurity
      .mfa_enabled ===
    true;


  /* ========================================================
     IP BINDING
  ======================================================== */

  const currentIp =
    getClientIp(
      req
    );


  if (
    securitySession
      .ip_address
  ) {
    if (
      !currentIp ||
      String(
        currentIp
      ) !==
        String(
          securitySession
            .ip_address
        )
    ) {
      await writeSecurityEvent({
        userId:
          securitySession
            .user_id,

        companyId:
          securitySession
            .company_id,

        eventType:
          'PORTAL_SESSION_IP_CHANGED',

        portalType:
          securitySession
            .portal_type,

        ipAddress:
          currentIp,

        userAgent:
          getUserAgent(
            req
          ),
      });


      await invalidateSession({
        sessionId:
          securitySession.id,

        reason:
          'IP_CHANGED',
      });


      clearSessionCookie(
        res
      );


      return sendJson(
        res,
        401,
        {
          ok:
            false,

          code:
            'SECURITY_CONTEXT_CHANGED',
        }
      );
    }
  }


  /* ========================================================
     USER AGENT BINDING
  ======================================================== */

  const currentUserAgent =
    getUserAgent(
      req
    );


  if (
    securitySession
      .user_agent &&
    currentUserAgent !==
      securitySession
        .user_agent
  ) {
    await writeSecurityEvent({
      userId:
        securitySession
          .user_id,

      companyId:
        securitySession
          .company_id,

      eventType:
        'PORTAL_SESSION_BROWSER_CHANGED',

      portalType:
        securitySession
          .portal_type,

      ipAddress:
        currentIp,

      userAgent:
        currentUserAgent,
    });


    await invalidateSession({
      sessionId:
        securitySession.id,

      reason:
        'BROWSER_CHANGED',
    });


    clearSessionCookie(
      res
    );


    return sendJson(
      res,
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
     ROLE / TENANT / HOST REVALIDATION
  ======================================================== */

  let portalContext;


  try {
    portalContext =
      await getExpectedPortalContext(
        securitySession
      );
  } catch (
    error
  ) {
    console.error(
      'Portal context verification failed:',
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
    !portalContext ||
    normalizeHost(
      portalContext
        .expectedHost
    ) !==
      requestHost
  ) {
    await invalidateSession({
      sessionId:
        securitySession.id,

      reason:
        'PORTAL_ACCESS_REVOKED',
    });


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
          'ACCESS_REVOKED',
      }
    );
  }


  /* ========================================================
     SUPABASE SESSION + OPTIONAL MFA VERIFICATION
  ======================================================== */

  let verifiedAuth;


  try {
    verifiedAuth =
      await verifySupabaseSession({
        securitySession,

        mfaEnabled,
      });
  } catch (
    error
  ) {
    const errorCode =
      error?.code ||
      error?.message;


    console.error(
      'Stored Supabase session verification failed:',
      errorCode
    );


    await writeSecurityEvent({
      userId:
        securitySession
          .user_id,

      companyId:
        securitySession
          .company_id,

      eventType:
        errorCode ===
          'MFA_AAL2_REQUIRED'
          ? 'PORTAL_SESSION_MFA_REQUIRED'
          : 'PORTAL_SESSION_AUTH_INVALID',

      portalType:
        securitySession
          .portal_type,

      ipAddress:
        currentIp,

      userAgent:
        currentUserAgent,

      metadata: {
        mfa_enabled:
          mfaEnabled,

        reason:
          String(
            errorCode ||
            'UNKNOWN'
          ),
      },
    });


    await invalidateSession({
      sessionId:
        securitySession.id,

      reason:
        errorCode ===
          'MFA_AAL2_REQUIRED'
          ? 'MFA_AAL2_REQUIRED'
          : 'SUPABASE_SESSION_INVALID',
    });


    clearSessionCookie(
      res
    );


    return sendJson(
      res,
      401,
      {
        ok:
          false,

        code:
          errorCode ===
            'MFA_AAL2_REQUIRED'
            ? 'MFA_AAL2_REQUIRED'
            : 'SESSION_INVALID',
      }
    );
  }


  /* ========================================================
     PROFILE
  ======================================================== */

  let profile;


  try {
    profile =
      await getProfile(
        securitySession
          .user_id
      );
  } catch (
    error
  ) {
    console.error(
      'Profile lookup failed:',
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
     SAFE CURRENT USER
  ======================================================== */

  const currentUser =
    buildCurrentUser({
      authUser:
        verifiedAuth
          .authUser,

      profile,

      context:
        portalContext,

      accountSecurity,

      sessionAal:
        verifiedAuth.aal,
    });


  /* ========================================================
     LAST-SEEN + SUCCESS AUDIT

     Both writes are independent after verification succeeds.
     Running them together removes one serial database wait.
  ======================================================== */

  await Promise.all([
    touchSession(
      securitySession.id
    ),

    writeSecurityEvent({
      userId:
        securitySession
          .user_id,

      companyId:
        securitySession
          .company_id,

      eventType:
        'PORTAL_SESSION_VERIFIED',

      portalType:
        securitySession
          .portal_type,

      ipAddress:
        currentIp,

      userAgent:
        currentUserAgent,

      metadata: {
        host:
          requestHost,

        company_slug:
          currentUser
            ?.companySlug ||
          null,

        mfa_enabled:
          mfaEnabled,

        session_aal:
          verifiedAuth.aal,
      },
    }),
  ]);


  /* ========================================================
     SAFE RESPONSE
  ======================================================== */

  return sendJson(
    res,
    200,
    {
      ok:
        true,

      currentUser,

      session: {
        expiresAt:
          securitySession
            .http_session_expires_at,

        portalType:
          securitySession
            .portal_type,

        companyId:
          securitySession
            .company_id ||
          null,

        companySlug:
          currentUser
            ?.companySlug ||
          null,

        mfaEnabled,

        aal:
          verifiedAuth.aal,
      },
    }
  );
}