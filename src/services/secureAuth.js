/* ============================================================
   BUDDY FLEETS
   CENTRAL SECURE AUTH CLIENT

   IMPORTANT:
   - Password is NEVER stored
   - Password is NEVER logged
   - Supabase access/refresh tokens are NEVER handled here
   - Login happens only through secure Edge Functions
   - One stable random device ID per browser/origin

   OPTIONAL MFA MODEL:

   MFA disabled:
   secure-login
        ↓
   PORTAL_HANDOFF

   MFA enabled:
   secure-login
        ↓
   MFA_CHALLENGE
        ↓
   secure-mfa VERIFY
        ↓
   PORTAL_HANDOFF

   MFA enrollment is NOT part of normal login.

   BEGIN_ENROLLMENT remains available only for the future
   Settings → Security → Two-Factor Authentication flow.
============================================================ */


/* ============================================================
   CONFIG
============================================================ */

const SUPABASE_URL =
  (
    import.meta.env
      .VITE_SUPABASE_URL ||
    'https://exygxszkqmefhhzfiqsn.supabase.co'
  ).replace(
    /\/+$/,
    ''
  );


const FUNCTIONS_URL =
  `${SUPABASE_URL}/functions/v1`;


const LOGIN_DEVICE_KEY =
  'buddy_fleets_login_device_id';


const DEVELOPER_HOST =
  'developer.buddyfleets.in';

const TEAM_HOST =
  'team.buddyfleets.in';

const COMPANY_PORTAL_HOST =
  'portal.buddyfleets.in';


const ALLOWED_PORTAL_HOSTS = [
  DEVELOPER_HOST,
  TEAM_HOST,
  COMPANY_PORTAL_HOST,
];


/* ============================================================
   SECURITY ERROR
============================================================ */

export class SecureAuthError extends Error {
  constructor({
    code =
      'AUTH_FAILED',

    message =
      'Authentication failed.',

    status =
      500,

    payload =
      null,
  } = {}) {
    super(
      message
    );

    this.name =
      'SecureAuthError';

    this.code =
      code;

    this.status =
      status;

    this.payload =
      payload;
  }
}


/* ============================================================
   RANDOM DEVICE IDENTIFIER

   This is NOT:
   - a password
   - an auth token
   - a Supabase session

   It is only a random browser-device binding identifier.
============================================================ */

function createRandomDeviceId() {
  if (
    typeof crypto
      ?.randomUUID ===
    'function'
  ) {
    return (
      `bf-${crypto.randomUUID()}`
    );
  }


  const bytes =
    new Uint8Array(
      32
    );


  crypto.getRandomValues(
    bytes
  );


  const value =
    Array.from(
      bytes
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


  return (
    `bf-${value}`
  );
}


/* ============================================================
   LOGIN DEVICE ID
============================================================ */

export function getLoginDeviceId() {
  try {
    const existing =
      localStorage.getItem(
        LOGIN_DEVICE_KEY
      );


    if (
      existing &&
      existing.length >=
        16 &&
      existing.length <=
        200
    ) {
      return existing;
    }


    const created =
      createRandomDeviceId();


    localStorage.setItem(
      LOGIN_DEVICE_KEY,
      created
    );


    return created;
  } catch {
    /*
      Very restrictive/private browser environments may block
      localStorage.

      Login can still continue with an in-memory random device
      identifier for the current page.
    */

    return createRandomDeviceId();
  }
}


/* ============================================================
   SAFE JSON RESPONSE
============================================================ */

async function readJsonSafely(
  response
) {
  const text =
    await response.text();


  if (!text) {
    return {};
  }


  try {
    return JSON.parse(
      text
    );
  } catch {
    return {};
  }
}


/* ============================================================
   EDGE FUNCTION REQUEST
============================================================ */

async function callSecureFunction(
  functionName,
  payload
) {
  let response;


  try {
    response =
      await fetch(
        `${FUNCTIONS_URL}/${functionName}`,
        {
          method:
            'POST',

          /*
            IMPORTANT PERFORMANCE + SECURITY NOTE:

            This cross-origin request intentionally uses a CORS-safelisted
            Content-Type so the browser does not send a separate OPTIONS
            preflight before every login/MFA request.

            The payload remains JSON text and the Edge Function still parses
            it with request.json(). No credential, authorization, MFA, portal,
            session, or tenant validation is weakened by this change.
          */

          headers: {
            'Content-Type':
              'text/plain;charset=UTF-8',
          },

          body:
            JSON.stringify(
              payload
            ),

          /*
            Secure login does not depend on browser-readable
            authentication cookies.

            Final portal authentication is established later
            through the one-time handoff and HttpOnly cookie.
          */

          credentials:
            'omit',

          cache:
            'no-store',

          referrerPolicy:
            'no-referrer',
        }
      );
  } catch {
    throw new SecureAuthError({
      code:
        'NETWORK_ERROR',

      message:
        'Unable to reach the secure authentication service.',

      status:
        0,
    });
  }


  const data =
    await readJsonSafely(
      response
    );


  if (
    !response.ok
  ) {
    throw new SecureAuthError({
      code:
        data?.code ||
        'AUTH_FAILED',

      message:
        data?.message ||
        'Authentication failed.',

      status:
        response.status,

      payload:
        data,
    });
  }


  if (
    data?.ok ===
      false
  ) {
    throw new SecureAuthError({
      code:
        data?.code ||
        'AUTH_FAILED',

      message:
        data?.message ||
        'Authentication failed.',

      status:
        response.status,

      payload:
        data,
    });
  }


  return data;
}


/* ============================================================
   LOGIN RESPONSE VALIDATION
============================================================ */

function normalizeNextStep(
  value
) {
  return String(
    value || ''
  )
    .trim()
    .toUpperCase();
}


function validatePortalHandoffResponse(
  data
) {
  const nextStep =
    normalizeNextStep(
      data?.nextStep
    );


  if (
    nextStep !==
    'PORTAL_HANDOFF'
  ) {
    return data;
  }


  const targetHost =
    normalizePortalHost(
      data?.targetHost
    );


  const handoffCode =
    String(
      data?.handoffCode ||
      ''
    ).trim();


  if (
    !ALLOWED_PORTAL_HOSTS.includes(
      targetHost
    ) ||
    handoffCode.length <
      20 ||
    handoffCode.length >
      200
  ) {
    throw new SecureAuthError({
      code:
        'INVALID_HANDOFF',

      message:
        'Secure portal handoff is invalid.',

      status:
        500,

      payload:
        data,
    });
  }


  return {
    ...data,

    nextStep:
      'PORTAL_HANDOFF',

    targetHost,

    handoffCode,
  };
}


function validateLoginResponse(
  data
) {
  const nextStep =
    normalizeNextStep(
      data?.nextStep
    );


  /* ==========================================================
     MFA DISABLED
  ========================================================== */

  if (
    nextStep ===
    'PORTAL_HANDOFF'
  ) {
    return validatePortalHandoffResponse(
      data
    );
  }


  /* ==========================================================
     MFA ENABLED
  ========================================================== */

  if (
    nextStep ===
    'MFA_CHALLENGE'
  ) {
    const flowCode =
      String(
        data?.flowCode ||
        ''
      ).trim();


    if (
      flowCode.length <
        20 ||
      flowCode.length >
        200
    ) {
      throw new SecureAuthError({
        code:
          'LOGIN_FLOW_INVALID',

        message:
          'Secure login flow is invalid.',

        status:
          500,

        payload:
          data,
      });
    }


    return {
      ...data,

      nextStep:
        'MFA_CHALLENGE',

      flowCode,
    };
  }


  /*
    secure-login must never send MFA_ENROLL during normal
    login anymore.

    If it does, treat it as a server configuration problem
    rather than silently starting enrollment in the browser.
  */

  if (
    nextStep ===
    'MFA_ENROLL' ||
    nextStep ===
    'MFA_VERIFY'
  ) {
    throw new SecureAuthError({
      code:
        'MFA_CONFIGURATION_REQUIRED',

      message:
        'MFA configuration requires attention.',

      status:
        409,

      payload:
        data,
    });
  }


  throw new SecureAuthError({
    code:
      'LOGIN_FLOW_INVALID',

    message:
      'Secure login flow is invalid.',

    status:
      500,

    payload:
      data,
  });
}


/* ============================================================
   STEP 1
   PASSWORD LOGIN

   Possible successful responses:

   1. MFA disabled:
      PORTAL_HANDOFF

   2. MFA enabled:
      MFA_CHALLENGE
============================================================ */

export async function secureLogin({
  companyCode,
  email,
  password,
}) {
  const deviceId =
    getLoginDeviceId();


  const result =
    await callSecureFunction(
      'secure-login',
      {
        companyCode,
        email,
        password,
        deviceId,
      }
    );


  return validateLoginResponse(
    result
  );
}


/* ============================================================
   MFA ENROLLMENT

   IMPORTANT:
   NOT used by the login page.

   Reserved for the future authenticated:

   Settings
      →
   Security
      →
   Two-Factor Authentication
      →
   Enable MFA

   The backend must still independently authorize the user
   before enrollment is allowed.
============================================================ */

export async function beginMfaEnrollment(
  flowCode
) {
  const cleanFlowCode =
    String(
      flowCode ||
      ''
    ).trim();


  if (
    cleanFlowCode.length <
      20 ||
    cleanFlowCode.length >
      200
  ) {
    throw new SecureAuthError({
      code:
        'LOGIN_FLOW_INVALID',

      message:
        'Secure authentication flow is invalid.',

      status:
        400,
    });
  }


  const deviceId =
    getLoginDeviceId();


  return await callSecureFunction(
    'secure-mfa',
    {
      action:
        'BEGIN_ENROLLMENT',

      flowCode:
        cleanFlowCode,

      deviceId,
    }
  );
}


/* ============================================================
   STEP 2
   VERIFY EXISTING TOTP MFA CODE

   Used during login ONLY when secure-login returns:

   MFA_CHALLENGE
============================================================ */

export async function verifyMfa({
  flowCode,
  code,
}) {
  const cleanFlowCode =
    String(
      flowCode ||
      ''
    ).trim();


  const cleanCode =
    String(
      code ||
      ''
    )
      .replace(
        /\D/g,
        ''
      )
      .slice(
        0,
        6
      );


  if (
    cleanFlowCode.length <
      20 ||
    cleanFlowCode.length >
      200
  ) {
    throw new SecureAuthError({
      code:
        'LOGIN_FLOW_INVALID',

      message:
        'Secure login flow is invalid.',

      status:
        400,
    });
  }


  if (
    cleanCode.length !==
    6
  ) {
    throw new SecureAuthError({
      code:
        'INVALID_MFA_CODE',

      message:
        'Invalid authentication code.',

      status:
        400,
    });
  }


  const deviceId =
    getLoginDeviceId();


  const result =
    await callSecureFunction(
      'secure-mfa',
      {
        action:
          'VERIFY',

        flowCode:
          cleanFlowCode,

        deviceId,

        code:
          cleanCode,
      }
    );


  return validatePortalHandoffResponse(
    result
  );
}


/* ============================================================
   PORTAL TARGET NORMALIZATION
============================================================ */

function normalizePortalHost(
  value
) {
  return String(
    value ||
    ''
  )
    .trim()
    .toLowerCase()
    .replace(
      /^https?:\/\//,
      ''
    )
    .replace(
      /\/.*$/,
      ''
    )
    .replace(
      /:\d+$/,
      ''
    );
}


/* ============================================================
   PORTAL TARGET VALIDATION

   Only these portal hosts are valid:

   developer.buddyfleets.in
   team.buddyfleets.in
   portal.buddyfleets.in

   Company-specific identity is NEVER encoded in the hostname.
============================================================ */

export function isValidSecurePortalHost(
  targetHost
) {
  const cleanHost =
    normalizePortalHost(
      targetHost
    );


  return ALLOWED_PORTAL_HOSTS.includes(
    cleanHost
  );
}


/* ============================================================
   PORTAL HANDOFF URL

   IMPORTANT:

   URL contains ONLY a short-lived single-use opaque handoff
   code.

   It NEVER contains:
   - password
   - Supabase access token
   - Supabase refresh token

   Company routing happens AFTER successful handoff:

   portal.buddyfleets.in/auth/callback
        ↓
   server-verified companySlug
        ↓
   /{companySlug}/dashboard
============================================================ */

export function buildPortalHandoffUrl({
  targetHost,
  handoffCode,
}) {
  const cleanHost =
    normalizePortalHost(
      targetHost
    );


  const cleanCode =
    String(
      handoffCode ||
      ''
    ).trim();


  if (
    !ALLOWED_PORTAL_HOSTS.includes(
      cleanHost
    )
  ) {
    throw new SecureAuthError({
      code:
        'INVALID_PORTAL_TARGET',

      message:
        'Secure portal destination is invalid.',
    });
  }


  if (
    cleanCode.length <
      20 ||
    cleanCode.length >
      200
  ) {
    throw new SecureAuthError({
      code:
        'INVALID_HANDOFF',

      message:
        'Secure portal handoff is invalid.',
    });
  }


  return (
    `https://${cleanHost}` +
    '/auth/callback' +
    `?handoff=${encodeURIComponent(
      cleanCode
    )}`
  );
}


/* ============================================================
   SECURITY ERROR → SAFE LOGIN MESSAGE
============================================================ */

export function getSecureAuthMessage(
  error
) {
  const code =
    error?.code ||
    'AUTH_FAILED';


  switch (
    code
  ) {
    case 'ACCOUNT_LOCKED':
      return (
        'This account has been security locked. ' +
        'Please contact your authorized administrator.'
      );


    case 'TOO_MANY_REQUESTS':
      return (
        'Too many login attempts. ' +
        'Please try again later.'
      );


    case 'MFA_FAILED':
    case 'INVALID_MFA_CODE':
      return (
        'Invalid authentication code. ' +
        'Please check your authenticator app and try again.'
      );


    case 'MFA_CONFIGURATION_REQUIRED':
      return (
        'Two-factor authentication is enabled for this account, ' +
        'but its authenticator setup is incomplete. ' +
        'Please contact your authorized administrator or reset your security settings.'
      );


    case 'MFA_AAL2_REQUIRED':
      return (
        'Two-factor authentication verification is required for this account. ' +
        'Please log in again and complete the authenticator verification.'
      );


    case 'LOGIN_FLOW_EXPIRED':
    case 'LOGIN_FLOW_INVALID':
      return (
        'Your secure login session has expired. ' +
        'Please log in again.'
      );


    case 'SECURITY_CONTEXT_CHANGED':
      return (
        'Your network or security context changed during login. ' +
        'Please restart the login process.'
      );


    case 'NETWORK_ERROR':
      return (
        'Unable to reach the secure authentication service. ' +
        'Please check your connection and try again.'
      );


    case 'MFA_SERVICE_UNAVAILABLE':
    case 'SECURITY_SERVICE_UNAVAILABLE':
    case 'SECURITY_SESSION_FAILED':
    case 'SECURITY_INITIALIZATION_FAILED':
      return (
        'Secure authentication is temporarily unavailable. ' +
        'Please try again shortly.'
      );


    case 'INVALID_PORTAL_TARGET':
    case 'PORTAL_MISMATCH':
    case 'ACCESS_REVOKED':
      return (
        'You are not authorized to access this portal.'
      );


    case 'INVALID_HANDOFF':
    case 'HANDOFF_INVALID':
    case 'HANDOFF_EXPIRED':
    case 'HANDOFF_ALREADY_USED':
    case 'PORTAL_HANDOFF_FAILED':
      return (
        'Your secure login session has expired or is invalid. ' +
        'Please log in again.'
      );


    case 'SESSION_REVOKED':
      return (
        'Your previous secure session is no longer active. ' +
        'Please log in again.'
      );


    case 'COMPANY_CONTEXT_INVALID':
      return (
        'Your company portal context could not be verified. ' +
        'Please log in again.'
      );


    default:
      /*
        Deliberately generic.

        Never reveal whether:
        - Company Code exists
        - email exists
        - password was wrong
        - user belongs to company
      */

      return (
        'Invalid company code, email, or password.'
      );
  }
}