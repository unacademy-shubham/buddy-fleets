import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../auth/requireDeveloperSession.js';

import { HEALTH_DEPENDENCIES, probeDatabaseDependency } from './healthProbe.js';

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const auth = await requireDeveloperSession(req);
  if (!auth.ok) {
    if (auth.clearCookie) clearDeveloperSessionCookie(res);
    return send(res, auth.status || 401, { ok: false, code: auth.code || 'UNAUTHORIZED' });
  }

  const started = Date.now();
  const checks = await Promise.all(
    HEALTH_DEPENDENCIES.map((dependency) => probeDatabaseDependency(auth.supabaseAdmin, dependency))
  );
  const failed = checks.filter((check) => !check.ok).length;
  const status = failed === 0 ? 'healthy' : failed === checks.length ? 'down' : 'degraded';

  // 503 only if every database dependency failed. For partial degradation,
  // keep the detailed diagnostic response readable by the developer UI.
  return send(res, failed === checks.length ? 503 : 200, {
    ok: failed === 0,
    status,
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    checks,
  });
}
