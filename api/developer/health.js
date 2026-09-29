import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../server/auth/requireDeveloperSession.js';

function send(res, status, payload) {
  setDeveloperApiHeaders(res);
  return res.status(status).json(payload);
}

async function probe(name, fn) {
  const started = Date.now();
  try {
    const result = await fn();
    if (result?.error) throw result.error;
    return { name, ok: true, latencyMs: Date.now() - started, details: result?.details || null };
  } catch (error) {
    return { name, ok: false, latencyMs: Date.now() - started, code: error?.code || null, message: error?.message || 'Probe failed' };
  }
}

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

  const db = auth.supabaseAdmin;
  const checks = await Promise.all([
    probe('Companies / tenant registry', async () => {
      const result = await db.from('companies').select('id', { count: 'exact', head: true });
      return { ...result, details: { rows: result.count || 0 } };
    }),
    probe('Security sessions', async () => {
      const result = await db.from('security_sessions').select('id', { count: 'exact', head: true });
      return { ...result, details: { rows: result.count || 0 } };
    }),
    probe('Fleet Pack registry', async () => {
      const result = await db.from('developer_fleet_packs').select('pack_key', { count: 'exact' });
      return { ...result, details: { rows: result.data?.length || 0, keys: (result.data || []).map((row) => row.pack_key) } };
    }),
    probe('Module catalog', async () => {
      const result = await db.from('developer_module_catalog').select('module_key,status', { count: 'exact' });
      return { ...result, details: { rows: result.data?.length || 0, beta: (result.data || []).filter((row) => row.status === 'beta').length } };
    }),
    probe('Plan × Fleet entitlements', async () => {
      const result = await db.from('developer_plan_fleet_entitlements').select('plan_key', { count: 'exact', head: true });
      return { ...result, details: { rows: result.count || 0 } };
    }),
    probe('Navigation registry', async () => {
      const result = await db.from('developer_navigation_nodes').select('id', { count: 'exact', head: true });
      return { ...result, details: { rows: result.count || 0 } };
    }),
    probe('Website CMS', async () => {
      const result = await db.from('website_pages').select('id', { count: 'exact', head: true });
      return { ...result, details: { rows: result.count || 0 } };
    }),
    probe('Part 05 platform add-ons', async () => {
      const result = await db.from('bf_developer_platform_addon_health').select('*').maybeSingle();
      return { ...result, details: result.data || {} };
    }),
  ]);

  const failed = checks.filter((check) => !check.ok);
  return send(res, 200, {
    ok: true,
    status: failed.length === 0 ? 'healthy' : (failed.length < checks.length ? 'degraded' : 'down'),
    checkedAt: new Date().toISOString(),
    checks,
  });
}
