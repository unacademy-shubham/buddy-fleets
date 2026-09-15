import {
  createHash,
  randomBytes,
  webcrypto,
} from 'node:crypto';

import { createClient } from '@supabase/supabase-js';
import { waitUntil } from '@vercel/functions';

/* ============================================================
   BUDDY FLEETS
   SERVER-SIDE PORTAL AUTH CALLBACK

   GET /auth/callback?handoff=<one-time-code>

   Final behavior:
   - Performs the handoff security checks entirely server-side.
   - Creates the host-only HttpOnly portal session cookie.
   - Returns a tiny nonce-protected HTML document that writes only
     sanitized, short-lived UI bootstrap data to sessionStorage.
   - Immediately replaces the browser location with the canonical
     dashboard URL before React callback UI can render.

   IMPORTANT:
   - Supabase access/refresh tokens never reach browser JavaScript.
   - Cookie token never reaches browser JavaScript.
   - company_id remains tenant authorization authority.
   - company slug is routing identity only.
============================================================ */

const MAX_HANDOFF_LENGTH = 200;
const MIN_HANDOFF_LENGTH = 20;
const HTTP_SESSION_LIFETIME_SECONDS = 30 * 60;
const BOOTSTRAP_LIFETIME_MS = 15 * 1000;

const COOKIE_NAME = '__Host-bf_session';
const PORTAL_BOOTSTRAP_KEY = 'buddy_fleets_portal_bootstrap';
const LAST_ACTIVITY_KEY = 'buddy_fleets_last_activity';

const MAIN_HOST = 'buddyfleets.in';
const WWW_HOST = 'www.buddyfleets.in';
const DEVELOPER_HOST = 'developer.buddyfleets.in';
const TEAM_HOST = 'team.buddyfleets.in';
const COMPANY_PORTAL_HOST = 'portal.buddyfleets.in';
const SECURE_LOGIN_URL = 'https://buddyfleets.in/login';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUTH_FLOW_ENCRYPTION_KEY = process.env.AUTH_FLOW_ENCRYPTION_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !AUTH_FLOW_ENCRYPTION_KEY) {
  throw new Error(
    'Required server authentication environment variables are missing.'
  );
}

const supabaseAdmin = createClient(
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

function isPortalHost(host) {
  return [
    DEVELOPER_HOST,
    TEAM_HOST,
    COMPANY_PORTAL_HOST,
  ].includes(
    normalizeHost(host)
  );
}

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
    return String(realIp)
      .trim();
  }

  return null;
}

function getUserAgent(req) {
  return String(
    req.headers['user-agent'] || ''
  ).slice(
    0,
    1000
  );
}

function getReferrerHost(req) {
  const value =
    req.headers.referer ||
    req.headers.referrer;

  if (!value) {
    return null;
  }

  try {
    const url =
      new URL(
        String(value)
      );

    if (
      url.protocol !== 'https:'
    ) {
      return '__invalid__';
    }

    return normalizeHost(
      url.hostname
    );
  } catch {
    return '__invalid__';
  }
}

function isAllowedNavigationContext(
  req,
  requestHost
) {
  const fetchSite =
    String(
      req.headers['sec-fetch-site'] || ''
    )
      .trim()
      .toLowerCase();

  if (
    fetchSite &&
    ![
      'same-origin',
      'same-site',
      'none',
    ].includes(
      fetchSite
    )
  ) {
    return false;
  }

  const referrerHost =
    getReferrerHost(
      req
    );

  if (!referrerHost) {
    return true;
  }

  return [
    MAIN_HOST,
    WWW_HOST,
    requestHost,
  ].includes(
    referrerHost
  );
}

function sha256Hex(value) {
  return createHash(
    'sha256'
  )
    .update(
      String(value)
    )
    .digest(
      'hex'
    );
}

function base64ToBytes(value) {
  return new Uint8Array(
    Buffer.from(
      value,
      'base64'
    )
  );
}

function bytesToBase64(value) {
  return Buffer
    .from(
      value
    )
    .toString(
      'base64'
    );
}

async function getEncryptionKey() {
  const rawKey =
    base64ToBytes(
      AUTH_FLOW_ENCRYPTION_KEY
    );

  if (
    rawKey.length !== 32
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
        'encrypt',
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

async function encryptSecret({
  value,
  encryptionKey,
}) {
  const iv =
    randomBytes(
      12
    );

  const encrypted =
    await webcrypto
      .subtle
      .encrypt(
        {
          name:
            'AES-GCM',

          iv,
        },

        encryptionKey,

        new TextEncoder()
          .encode(
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

function decodeJwtPayload(
  token
) {
  const parts =
    String(
      token || ''
    ).split(
      '.'
    );

  if (
    parts.length !== 3
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

function createSessionCookie(
  token
) {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(
      token
    )}`,

    'Path=/',

    'HttpOnly',

    'Secure',

    'SameSite=Strict',

    `Max-Age=${HTTP_SESSION_LIFETIME_SECONDS}`,
  ].join(
    '; '
  );
}

function createExpiredSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=0',
  ].join(
    '; '
  );
}

function setNoStoreHeaders(
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

function redirectToLogin(
  res,
  clearCookie = false
) {
  setNoStoreHeaders(
    res
  );

  if (
    clearCookie
  ) {
    res.setHeader(
      'Set-Cookie',
      createExpiredSessionCookie()
    );
  }

  res.statusCode =
    302;

  res.setHeader(
    'Location',
    SECURE_LOGIN_URL
  );

  return res.end();
}

function normalizeCompanySlug(
  value
) {
  const slug =
    String(
      value || ''
    )
      .trim()
      .toLowerCase();

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/
      .test(
        slug
      )
  ) {
    return '';
  }

  if (
    slug.length >
    120
  ) {
    return '';
  }

  return slug;
}

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

async function getHandoff(
  handoffCode
) {
  const handoffHash =
    sha256Hex(
      handoffCode
    );

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        'auth_portal_handoffs'
      )
      .select(`
        id,
        user_id,
        company_id,
        portal_type,
        target_host,
        auth_session_id,
        encrypted_access_token,
        access_token_iv,
        encrypted_refresh_token,
        refresh_token_iv,
        ip_address,
        user_agent,
        expires_at,
        consumed_at,
        status
      `)
      .eq(
        'handoff_code_hash',
        handoffHash
      )
      .maybeSingle();

  if (
    error
  ) {
    throw error;
  }

  return data;
}

async function getUserSecurity(
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

async function getSecuritySession(
  handoff
) {
  let query =
    supabaseAdmin
      .from(
        'security_sessions'
      )
      .select(`
        id,
        user_id,
        auth_session_id,
        portal_type,
        company_id,
        status
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

  if (
    error
  ) {
    throw error;
  }

  return data;
}

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

async function verifyPortalAuthorization(
  handoff
) {
  if (
    handoff.portal_type ===
    'developer'
  ) {
    if (
      normalizeHost(
        handoff.target_host
      ) !==
      DEVELOPER_HOST
    ) {
      return {
        authorized:
          false,
      };
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
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

    if (
      error
    ) {
      throw error;
    }

    return {
      authorized:
        Boolean(
          data?.is_active
        ),

      portalType:
        'developer',

      companySlug:
        null,

      roles: [
        'SUPER_ADMIN',
      ],

      roleDetails:
        [],
    };
  }

  if (
    handoff.portal_type ===
    'team'
  ) {
    if (
      normalizeHost(
        handoff.target_host
      ) !==
      TEAM_HOST
    ) {
      return {
        authorized:
          false,
      };
    }

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
        .select(
          'user_id, status'
        )
        .eq(
          'user_id',
          handoff.user_id
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
      return {
        authorized:
          false,
      };
    }

    const {
      data:
        assignments,
      error:
        assignmentsError,
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
      return {
        authorized:
          false,
      };
    }

    const {
      data:
        activeRoles,
      error:
        activeRolesError,
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
      activeRolesError
    ) {
      throw activeRolesError;
    }

    if (
      !activeRoles ||
      activeRoles.length ===
      0
    ) {
      return {
        authorized:
          false,
      };
    }

    return {
      authorized:
        true,

      portalType:
        'team',

      companySlug:
        null,

      roles:
        activeRoles.map(
          (
            role
          ) =>
            role.role_key
        ),

      roleDetails:
        activeRoles.map(
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

  if (
    handoff.portal_type ===
    'company'
  ) {
    if (
      !handoff.company_id ||
      normalizeHost(
        handoff.target_host
      ) !==
      COMPANY_PORTAL_HOST
    ) {
      return {
        authorized:
          false,
      };
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
      !company
        .subdomain_slug
    ) {
      return {
        authorized:
          false,
      };
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
      return {
        authorized:
          false,
      };
    }

    const [
      membershipResult,
      subscriptionResult,
    ] =
      await Promise.all([
        supabaseAdmin
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
            handoff.user_id
          )
          .maybeSingle(),

        supabaseAdmin
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
          .maybeSingle(),
      ]);

    if (
      membershipResult.error
    ) {
      throw membershipResult.error;
    }

    if (
      subscriptionResult.error
    ) {
      throw subscriptionResult.error;
    }

    const membership =
      membershipResult.data;

    const subscription =
      subscriptionResult.data;

    if (
      !membership ||
      membership.status !==
      'active'
    ) {
      return {
        authorized:
          false,
      };
    }

    let effectiveCompanyStatus =
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
      effectiveCompanyStatus =
        'trial_expired';
    }

    return {
      authorized:
        true,

      portalType:
        'company',

      companySlug:
        company
          .subdomain_slug,

      company,

      membership,

      subscription,

      effectiveCompanyStatus,

      roles: [
        'COMPANY_USER',
      ],

      roleDetails:
        [],
    };
  }

  return {
    authorized:
      false,
  };
}

function buildSafeCurrentUser({
  authUser,
  profile,
  authorization,
  security,
  jwtAal,
}) {
  const mfaEnabled =
    security
      ?.mfa_enabled ===
    true;

  if (
    authorization.portalType ===
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

      sessionAal:
        jwtAal,
    };
  }

  if (
    authorization.portalType ===
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
        authorization
          .roles ||
        [],

      roleDetails:
        authorization
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

      sessionAal:
        jwtAal,
    };
  }

  const company =
    authorization
      .company;

  const membership =
    authorization
      .membership;

  const subscription =
    authorization
      .subscription;

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
      authorization
        .effectiveCompanyStatus,

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

    mfaEnabled,

    sessionAal:
      jwtAal,
  };
}

function getDashboardPath(
  portalType,
  companySlug
) {
  if (
    portalType ===
      'developer' ||
    portalType ===
      'team'
  ) {
    return '/dashboard';
  }

  if (
    portalType ===
    'company'
  ) {
    const slug =
      normalizeCompanySlug(
        companySlug
      );

    if (
      !slug
    ) {
      return null;
    }

    return `/${encodeURIComponent(
      slug
    )}/dashboard`;
  }

  return null;
}

function serializeForInlineScript(
  value
) {
  return JSON
    .stringify(
      value
    )
    .replace(
      /</g,
      '\\u003c'
    )
    .replace(
      />/g,
      '\\u003e'
    )
    .replace(
      /&/g,
      '\\u0026'
    )
    .replace(
      /\u2028/g,
      '\\u2028'
    )
    .replace(
      /\u2029/g,
      '\\u2029'
    );
}

function sendImmediateDashboardBootstrap({
  res,
  cookie,
  destination,
  currentUser,
  session,
}) {
  const nonce =
    randomBytes(
      18
    ).toString(
      'base64url'
    );

  const now =
    Date.now();

  const bootstrap = {
    createdAt:
      now,

    expiresAt:
      now +
      BOOTSTRAP_LIFETIME_MS,

    currentUser,

    session,
  };

  const safeBootstrap =
    serializeForInlineScript(
      bootstrap
    );

  const safeDestination =
    serializeForInlineScript(
      destination
    );

  const safeBootstrapKey =
    serializeForInlineScript(
      PORTAL_BOOTSTRAP_KEY
    );

  const safeActivityKey =
    serializeForInlineScript(
      LAST_ACTIVITY_KEY
    );

  setNoStoreHeaders(
    res
  );

  res.setHeader(
    'Set-Cookie',
    cookie
  );

  res.setHeader(
    'Content-Security-Policy',
    `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`
  );

  res.setHeader(
    'Content-Type',
    'text/html; charset=utf-8'
  );

  const html =
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Buddy Fleets</title>
<style nonce="${nonce}">
html,body{
  margin:0;
  background:#050914;
  color:#fff;
}
</style>
<script nonce="${nonce}">
(() => {
  const bootstrap = ${safeBootstrap};
  const destination = ${safeDestination};
  const bootstrapKey = ${safeBootstrapKey};
  const activityKey = ${safeActivityKey};

  try {
    sessionStorage.setItem(
      bootstrapKey,
      JSON.stringify(
        bootstrap
      )
    );
  } catch {}

  try {
    localStorage.setItem(
      activityKey,
      String(
        Date.now()
      )
    );
  } catch {}

  window.location.replace(
    destination
  );
})();
</script>
</head>
<body></body>
</html>`;

  return res
    .status(
      200
    )
    .send(
      html
    );
}

export default async function handler(
  req,
  res
) {
  if (
    req.method !==
    'GET'
  ) {
    setNoStoreHeaders(
      res
    );

    res.setHeader(
      'Allow',
      'GET'
    );

    return res
      .status(
        405
      )
      .end();
  }

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
    return redirectToLogin(
      res,
      true
    );
  }

  if (
    !isAllowedNavigationContext(
      req,
      requestHost
    )
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  const handoffCode =
    String(
      req.query
        ?.handoff ||
      ''
    ).trim();

  if (
    handoffCode.length <
      MIN_HANDOFF_LENGTH ||
    handoffCode.length >
      MAX_HANDOFF_LENGTH
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  const ipAddress =
    getClientIp(
      req
    );

  const userAgent =
    getUserAgent(
      req
    );

  let handoff;


  try {
    handoff =
      await getHandoff(
        handoffCode
      );

  } catch (
    error
  ) {
    console.error(
      'Callback handoff lookup failed:',
      error?.message
    );

    return redirectToLogin(
      res,
      true
    );
  }

  if (
    !handoff
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

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
    return redirectToLogin(
      res,
      true
    );
  }

  if (
    normalizeHost(
      handoff.target_host
    ) !==
    requestHost
  ) {
    await writeSecurityEvent({
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
    });

    return redirectToLogin(
      res,
      true
    );
  }

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
    await writeSecurityEvent({
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

    return redirectToLogin(
      res,
      true
    );
  }

  if (
    handoff.user_agent &&
    handoff.user_agent !==
      userAgent
  ) {
    await writeSecurityEvent({
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

    return redirectToLogin(
      res,
      true
    );
  }

  let security;
  let authorization;
  let securitySession;


  try {
    [
      security,
      authorization,
      securitySession,
    ] =
      await Promise.all([
        getUserSecurity(
          handoff.user_id
        ),

        verifyPortalAuthorization(
          handoff
        ),

        getSecuritySession(
          handoff
        ),
      ]);

  } catch (
    error
  ) {
    console.error(
      'Callback security verification failed:',
      error?.message
    );

    return redirectToLogin(
      res,
      true
    );
  }

  if (
    !security ||
    security.is_locked
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  if (
    !authorization
      ?.authorized
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  if (
    !securitySession
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  let encryptionKey;
  let accessToken;
  let refreshToken;


  try {
    encryptionKey =
      await getEncryptionKey();

    [
      accessToken,
      refreshToken,
    ] =
      await Promise.all([
        decryptSecret({
          encrypted:
            handoff
              .encrypted_access_token,

          iv:
            handoff
              .access_token_iv,

          encryptionKey,
        }),

        decryptSecret({
          encrypted:
            handoff
              .encrypted_refresh_token,

          iv:
            handoff
              .refresh_token_iv,

          encryptionKey,
        }),
      ]);

  } catch (
    error
  ) {
    console.error(
      'Callback token decryption failed:',
      error?.message
    );

    return redirectToLogin(
      res,
      true
    );
  }

  let jwt;

  try {
    jwt =
      decodeJwtPayload(
        accessToken
      );
  } catch {
    return redirectToLogin(
      res,
      true
    );
  }

  const jwtAal =
    String(
      jwt?.aal ||
      ''
    )
      .trim()
      .toLowerCase();

  if (
    jwt.sub !==
      handoff.user_id ||
    jwt.session_id !==
      handoff.auth_session_id ||
    ![
      'aal1',
      'aal2',
    ].includes(
      jwtAal
    )
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  const mfaEnabled =
    security
      ?.mfa_enabled ===
    true;

  if (
    mfaEnabled &&
    jwtAal !==
      'aal2'
  ) {
    await writeSecurityEvent({
      userId:
        handoff.user_id,

      companyId:
        handoff.company_id,

      eventType:
        'MFA_AAL2_REQUIRED',

      portalType:
        handoff.portal_type,

      ipAddress,

      userAgent,

      metadata: {
        received_aal:
          jwtAal,

        mfa_enabled:
          true,
      },
    });

    return redirectToLogin(
      res,
      true
    );
  }

  /*
    Performance:
    Supabase user verification and profile lookup are independent,
    so run them in parallel. Security decisions remain unchanged.
  */

  let verifiedUserResult;
  let profile;


  try {
    [
      verifiedUserResult,
      profile,
    ] =
      await Promise.all([
        supabaseAdmin
          .auth
          .getUser(
            accessToken
          ),

        getProfile(
          handoff.user_id
        ),
      ]);

  } catch (
    error
  ) {
    console.error(
      'Callback user/profile verification failed:',
      error?.message
    );

    return redirectToLogin(
      res,
      true
    );
  }

  const {
    data:
      verifiedUser,
    error:
      verifiedUserError,
  } =
    verifiedUserResult ||
    {};

  if (
    verifiedUserError ||
    !verifiedUser
      ?.user ||
    verifiedUser
      .user
      .id !==
      handoff.user_id
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  const currentUser =
    buildSafeCurrentUser({
      authUser:
        verifiedUser.user,

      profile,

      authorization,

      security,

      jwtAal,
    });

  const destination =
    getDashboardPath(
      handoff.portal_type,
      authorization.companySlug
    );

  if (
    !destination
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  const portalSessionToken =
    randomBytes(
      32
    ).toString(
      'base64url'
    );

  const portalSessionHash =
    sha256Hex(
      portalSessionToken
    );

  const portalDeviceHash =
    sha256Hex(
      `server-callback:${randomBytes(
        32
      ).toString(
        'base64url'
      )}`
    );

  let encryptedAccess;
  let encryptedRefresh;


  try {
    [
      encryptedAccess,
      encryptedRefresh,
    ] =
      await Promise.all([
        encryptSecret({
          value:
            accessToken,

          encryptionKey,
        }),

        encryptSecret({
          value:
            refreshToken,

          encryptionKey,
        }),
      ]);

  } catch (
    error
  ) {
    console.error(
      'Callback session encryption failed:',
      error?.message
    );

    return redirectToLogin(
      res,
      true
    );
  }

  const httpSessionExpiresAt =
    new Date(
      Date.now() +
      HTTP_SESSION_LIFETIME_SECONDS *
      1000
    ).toISOString();


  const {
    data:
      finalized,
    error:
      finalizeError,
  } =
    await supabaseAdmin
      .rpc(
        'bf_finalize_portal_http_session',
        {
          p_handoff_id:
            handoff.id,

          p_security_session_id:
            securitySession.id,

          p_expected_host:
            requestHost,

          p_portal_session_token_hash:
            portalSessionHash,

          p_encrypted_access_token:
            encryptedAccess
              .encrypted,

          p_access_token_iv:
            encryptedAccess
              .iv,

          p_encrypted_refresh_token:
            encryptedRefresh
              .encrypted,

          p_refresh_token_iv:
            encryptedRefresh
              .iv,

          p_device_id_hash:
            portalDeviceHash,

          p_ip_address:
            ipAddress,

          p_user_agent:
            userAgent,

          p_http_session_expires_at:
            httpSessionExpiresAt,
        }
      );


  if (
    finalizeError
  ) {
    console.error(
      'Callback HTTP session finalization failed:',
      finalizeError.message
    );

    return redirectToLogin(
      res,
      true
    );
  }

  if (
    !finalized
      ?.ok
  ) {
    return redirectToLogin(
      res,
      true
    );
  }

  const session = {
    expiresAt:
      httpSessionExpiresAt,

    portalType:
      handoff.portal_type,

    companyId:
      handoff.company_id ||
      null,

    companySlug:
      authorization
        .companySlug ||
      null,

    mfaEnabled,

    aal:
      jwtAal,
  };

  /*
    SUCCESS AUDIT

    The Buddy Fleets HTTP session is already fully finalized above.
    Logging this successful audit event must not delay the user's
    dashboard navigation, so let Vercel keep the function alive after
    the response while this non-authoritative write completes.
  */

  waitUntil(
    writeSecurityEvent({
      userId:
        handoff.user_id,

      companyId:
        handoff.company_id,

      eventType:
        'PORTAL_HTTP_SESSION_CREATED',

      portalType:
        handoff.portal_type,

      ipAddress,

      userAgent,

      metadata: {
        target_host:
          requestHost,

        company_slug:
          authorization
            .companySlug ||
          null,

        security_session_id:
          securitySession.id,

        mfa_enabled:
          mfaEnabled,

        session_aal:
          jwtAal,

        http_session_expires_at:
          httpSessionExpiresAt,

        callback_mode:
          'server_direct',
      },
    }).catch(
      (error) => {
        console.error(
          'Background callback audit failed:',
          error?.message
        );
      }
    )
  );


  return sendImmediateDashboardBootstrap({
    res,

    cookie:
      createSessionCookie(
        portalSessionToken
      ),

    destination,

    currentUser,

    session,
  });
}