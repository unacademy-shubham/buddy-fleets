import {
  PORTAL_SESSION_COOKIE,
  buildClearedPortalSessionCookie,
  SESSION_IDLE_TIMEOUT_SECONDS,
  getPortalRequestHost,
  invalidatePortalSecuritySession,
  isApplicationSessionExpired,
  loadPortalSecuritySession,
  normalizePortalHost,
  parsePortalCookies,
  supabaseAdmin,
  verifyAndRefreshSupabaseSession,
} from './portalSessionCore.js';

const COMPANY_HOST = 'portal.buddyfleets.in';

function originMatchesCompanyHost(req) {
  const origin = req.headers.origin;

  if (!origin) {
    return true;
  }

  try {
    const url = new URL(origin);

    return (
      url.protocol === 'https:' &&
      normalizePortalHost(url.hostname) === COMPANY_HOST
    );
  } catch {
    return false;
  }
}

export function clearCompanySessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    buildClearedPortalSessionCookie()
  );
}

export function setCompanyApiHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
}

export async function requireCompanyPortalSession(req) {
  const requestHost = getPortalRequestHost(req);

  if (requestHost !== COMPANY_HOST) {
    return {
      ok: false,
      status: 403,
      code: 'COMPANY_HOST_REQUIRED',
      clearCookie: true,
    };
  }

  if (!originMatchesCompanyHost(req)) {
    return {
      ok: false,
      status: 403,
      code: 'ORIGIN_NOT_ALLOWED',
    };
  }

  const secFetchSite = String(
    req.headers['sec-fetch-site'] || ''
  )
    .trim()
    .toLowerCase();

  if (
    secFetchSite &&
    !['same-origin', 'none'].includes(secFetchSite)
  ) {
    return {
      ok: false,
      status: 403,
      code: 'CROSS_SITE_REQUEST_BLOCKED',
    };
  }

  const token = parsePortalCookies(
    req.headers.cookie
  )[PORTAL_SESSION_COOKIE];

  if (
    !token ||
    token.length < 20 ||
    token.length > 200
  ) {
    return {
      ok: false,
      status: 401,
      code: 'SESSION_REQUIRED',
      clearCookie: true,
    };
  }

  let session;

  try {
    session = await loadPortalSecuritySession(
      token,
      { portalType: 'company' }
    );
  } catch (error) {
    console.error(
      'Company session lookup failed:',
      error?.message
    );

    return {
      ok: false,
      status: 503,
      code: 'SECURITY_SERVICE_UNAVAILABLE',
    };
  }

  if (!session || !session.company_id) {
    return {
      ok: false,
      status: 401,
      code: 'SESSION_INVALID',
      clearCookie: true,
    };
  }

  if (isApplicationSessionExpired(session)) {
    await invalidatePortalSecuritySession({
      sessionId: session.id,
      reason: 'HTTP_SESSION_EXPIRED',
      expired: true,
    }).catch(() => {});

    return {
      ok: false,
      status: 401,
      code: 'SESSION_EXPIRED',
      clearCookie: true,
    };
  }

  const [
    securityResult,
    membershipResult,
    employeeResult,
  ] = await Promise.all([
    supabaseAdmin
      .from('user_security')
      .select('user_id,is_locked,mfa_enabled')
      .eq('user_id', session.user_id)
      .maybeSingle(),

    supabaseAdmin
      .from('company_memberships')
      .select('status')
      .eq('company_id', session.company_id)
      .eq('user_id', session.user_id)
      .maybeSingle(),

    supabaseAdmin
      .from('developer_company_employees')
      .select('status')
      .eq('company_id', session.company_id)
      .eq('user_id', session.user_id)
      .maybeSingle(),
  ]);

  if (
    securityResult.error ||
    membershipResult.error ||
    (
      employeeResult.error &&
      employeeResult.error.code !== '42P01'
    )
  ) {
    console.error(
      'Company access preflight failed:',
      securityResult.error?.message ||
        membershipResult.error?.message ||
        employeeResult.error?.message
    );

    return {
      ok: false,
      status: 503,
      code: 'SECURITY_SERVICE_UNAVAILABLE',
    };
  }

  const accountSecurity = securityResult.data;
  const membership = membershipResult.data;
  const employee = employeeResult.data;

  if (
    !accountSecurity ||
    accountSecurity.is_locked
  ) {
    await invalidatePortalSecuritySession({
      sessionId: session.id,
      reason: 'ACCOUNT_SECURITY_LOCK',
    }).catch(() => {});

    return {
      ok: false,
      status: 423,
      code: 'ACCOUNT_LOCKED',
      clearCookie: true,
    };
  }

  if (
    !membership ||
    membership.status !== 'active'
  ) {
    await invalidatePortalSecuritySession({
      sessionId: session.id,
      reason: 'COMPANY_ACCESS_REVOKED',
    }).catch(() => {});

    return {
      ok: false,
      status: 403,
      code: 'COMPANY_ACCESS_DENIED',
      clearCookie: true,
    };
  }

  if (
    employee &&
    !['active', 'invited'].includes(employee.status)
  ) {
    await invalidatePortalSecuritySession({
      sessionId: session.id,
      reason: 'EMPLOYEE_ACCESS_BLOCKED',
    }).catch(() => {});

    return {
      ok: false,
      status: 403,
      code: 'EMPLOYEE_ACCESS_BLOCKED',
      clearCookie: true,
    };
  }

  const {
    data: bootstrap,
    error: bootstrapError,
  } = await supabaseAdmin.rpc(
    'bf_resolve_company_portal_bootstrap',
    {
      p_company_id: session.company_id,
      p_user_id: session.user_id,
    }
  );

  if (bootstrapError) {
    console.error(
      'Company bootstrap validation failed:',
      bootstrapError.message
    );

    return {
      ok: false,
      status: 503,
      code: 'SECURITY_SERVICE_UNAVAILABLE',
    };
  }

  if (
    !bootstrap?.ok ||
    bootstrap?.access_granted !== true
  ) {
    await invalidatePortalSecuritySession({
      sessionId: session.id,
      reason: bootstrap?.reason || 'COMPANY_ACCESS_REVOKED',
    }).catch(() => {});

    return {
      ok: false,
      status: 403,
      code:
        bootstrap?.reason ||
        'COMPANY_ACCESS_DENIED',
      clearCookie: true,
    };
  }

  let verifiedAuth;

  try {
    verifiedAuth = await verifyAndRefreshSupabaseSession({
      securitySession: session,
      mfaEnabled: accountSecurity.mfa_enabled === true,
    });
  } catch (error) {
    const errorCode =
      error?.code ||
      error?.message ||
      'SESSION_INVALID';

    console.error(
      'Company Supabase session verification failed:',
      errorCode
    );

    await invalidatePortalSecuritySession({
      sessionId: session.id,
      reason:
        errorCode === 'MFA_AAL2_REQUIRED'
          ? 'MFA_AAL2_REQUIRED'
          : 'SUPABASE_SESSION_INVALID',
    }).catch(() => {});

    return {
      ok: false,
      status: 401,
      code:
        errorCode === 'MFA_AAL2_REQUIRED'
          ? 'MFA_AAL2_REQUIRED'
          : 'SESSION_INVALID',
      clearCookie: true,
    };
  }

  return {
    ok: true,
    db: supabaseAdmin,
    userId: session.user_id,
    companyId: session.company_id,
    sessionId: session.id,
    bootstrap,
    httpSessionExpiresAt: session.http_session_expires_at,
    sessionLifetimeSeconds: SESSION_IDLE_TIMEOUT_SECONDS,
    authRefreshed: verifiedAuth.refreshed === true,
    aal: verifiedAuth.aal,
  };
}
