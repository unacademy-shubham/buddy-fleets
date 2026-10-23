/*
  Buddy Fleets — shared, server-side user-session safeguards.
  This is intentionally a pure module: no Supabase client is created here.
*/

function defaultPublishableKey(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.default === 'string' && parsed.default.trim()) {
      return parsed.default.trim();
    }
    const candidate = Object.values(parsed || {}).find(
      (value) => typeof value === 'string' && value.trim()
    );
    return candidate?.trim() || null;
  } catch {
    return null;
  }
}

function isPrivilegedKey(key, serviceRoleKey) {
  if (!key) return false;
  if (key === String(serviceRoleKey || '').trim()) return true;
  if (key.startsWith('sb_secret_')) return true;

  // Legacy Supabase API keys are JWTs. Reject a service_role JWT even if
  // its secret isn't identical to the configured service role key.
  try {
    const parts = key.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload?.role === 'service_role';
  } catch {
    return false;
  }
}

export function resolveSupabaseUserClientKey(environment = process.env) {
  const candidates = [
    environment.SUPABASE_ANON_KEY,
    environment.SUPABASE_PUBLISHABLE_KEY,
    environment.VITE_SUPABASE_ANON_KEY,
    defaultPublishableKey(environment.SUPABASE_PUBLISHABLE_KEYS),
  ];
  const key = candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || null;
  if (!key) return null; // Calling module fails closed; never use service_role.
  if (isPrivilegedKey(key, environment.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error('Supabase user-auth client requires an anon/publishable key, not a service-role/secret key.');
  }
  return key;
}

export function isHttpSessionExpired(expiresAt, now = Date.now()) {
  const timestamp = Date.parse(typeof expiresAt === 'string' ? expiresAt : '');
  return !Number.isFinite(timestamp) || timestamp <= now;
}

export function portalTypeForHost(host) {
  switch (host) {
    case 'developer.buddyfleets.in': return 'developer';
    case 'team.buddyfleets.in': return 'team';
    case 'portal.buddyfleets.in': return 'company';
    default: return null;
  }
}
