import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const COOKIE_NAME = '__Host-bf_session';
const COMPANY_HOST = 'portal.buddyfleets.in';
const SESSION_LIFETIME_MS = 60 * 60 * 1000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Company portal auth environment variables missing.');
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const hash = (value) => createHash('sha256').update(value).digest('hex');
const host = (req) =>
  String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');
const ip = (req) =>
  String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '')
    .split(',')[0]
    .trim() || null;
const ua = (req) => String(req.headers['user-agent'] || '').slice(0, 1000);

function cookies(header) {
  const out = {};
  String(header || '')
    .split(';')
    .forEach((part) => {
      const index = part.indexOf('=');
      if (index > 0) out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    });
  return out;
}

function hasUserActivitySignal(req) {
  return String(req.headers['x-bf-user-activity'] || '').trim() === '1';
}

export function setCompanyApiHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
}

async function touchSession(sessionId) {
  const now = new Date();
  const nextExpiry = new Date(now.getTime() + SESSION_LIFETIME_MS).toISOString();
  const { error } = await db
    .from('security_sessions')
    .update({ last_seen_at: now.toISOString(), http_session_expires_at: nextExpiry })
    .eq('id', sessionId)
    .eq('status', 'active');
  if (error) throw error;
  return nextExpiry;
}

export async function requireCompanyPortalSession(req) {
  if (host(req) !== COMPANY_HOST) return { ok: false, status: 403, code: 'COMPANY_HOST_REQUIRED' };

  const origin = req.headers.origin;
  if (origin) {
    try {
      const url = new URL(origin);
      if (url.protocol !== 'https:' || url.hostname !== COMPANY_HOST) {
        return { ok: false, status: 403, code: 'ORIGIN_NOT_ALLOWED' };
      }
    } catch {
      return { ok: false, status: 403, code: 'ORIGIN_NOT_ALLOWED' };
    }
  }

  const token = cookies(req.headers.cookie)[COOKIE_NAME];
  if (!token || token.length < 20) return { ok: false, status: 401, code: 'SESSION_REQUIRED' };

  const { data: session, error: sessionError } = await db
    .from('security_sessions')
    .select('id,user_id,portal_type,company_id,ip_address,user_agent,status,http_session_expires_at,last_seen_at')
    .eq('portal_session_token_hash', hash(token))
    .eq('status', 'active')
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (!session || session.portal_type !== 'company' || !session.company_id) {
    return { ok: false, status: 401, code: 'SESSION_INVALID' };
  }

  const expiry = Date.parse(session.http_session_expires_at);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    return { ok: false, status: 401, code: 'SESSION_EXPIRED' };
  }

  if (session.ip_address && ip(req) && String(session.ip_address) !== String(ip(req))) {
    return { ok: false, status: 401, code: 'SECURITY_CONTEXT_CHANGED' };
  }
  if (session.user_agent && session.user_agent !== ua(req)) {
    return { ok: false, status: 401, code: 'SECURITY_CONTEXT_CHANGED' };
  }

  const [{ data: membership, error: membershipError }, { data: employee, error: employeeError }] = await Promise.all([
    db
      .from('company_memberships')
      .select('status')
      .eq('company_id', session.company_id)
      .eq('user_id', session.user_id)
      .maybeSingle(),
    db
      .from('developer_company_employees')
      .select('status')
      .eq('company_id', session.company_id)
      .eq('user_id', session.user_id)
      .maybeSingle(),
  ]);

  if (membershipError || (employeeError && employeeError.code !== '42P01')) {
    throw membershipError || employeeError;
  }
  if (!membership || membership.status !== 'active') {
    return { ok: false, status: 403, code: 'COMPANY_ACCESS_DENIED' };
  }
  if (employee && !['active', 'invited'].includes(employee.status)) {
    return { ok: false, status: 403, code: 'EMPLOYEE_ACCESS_BLOCKED' };
  }

  const { data: bootstrap, error: bootstrapError } = await db.rpc('bf_resolve_company_portal_bootstrap', {
    p_company_id: session.company_id,
    p_user_id: session.user_id,
  });

  if (bootstrapError) throw bootstrapError;
  if (!bootstrap?.ok || bootstrap?.access_granted !== true) {
    return { ok: false, status: 403, code: bootstrap?.reason || 'COMPANY_ACCESS_DENIED' };
  }

  let httpSessionExpiresAt = session.http_session_expires_at;
  if (hasUserActivitySignal(req)) {
    httpSessionExpiresAt = await touchSession(session.id);
  }

  return {
    ok: true,
    db,
    userId: session.user_id,
    companyId: session.company_id,
    sessionId: session.id,
    bootstrap,
    httpSessionExpiresAt,
    sessionLifetimeSeconds: SESSION_LIFETIME_MS / 1000,
  };
}
