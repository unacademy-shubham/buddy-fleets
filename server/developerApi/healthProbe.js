// Each probe checks reachability, NOT row counts. This avoids unbounded
// count(*) queries and large row transfers as fleet data grows.
export const HEALTH_DEPENDENCIES = Object.freeze([
  { name: 'Companies / tenant registry', table: 'companies', column: 'id' },
  { name: 'Security sessions', table: 'security_sessions', column: 'id' },
  { name: 'Fleet Pack registry', table: 'developer_fleet_packs', column: 'pack_key' },
  { name: 'Module catalog', table: 'developer_module_catalog', column: 'module_key' },
  { name: 'Plan × Fleet entitlements', table: 'developer_plan_fleet_entitlements', column: 'plan_key' },
  { name: 'Navigation registry', table: 'developer_navigation_nodes', column: 'id' },
  { name: 'Website CMS', table: 'website_pages', column: 'id' },
  { name: 'Platform add-ons / Feature flags', table: 'developer_feature_flags', column: 'flag_key' },
  { name: 'Platform add-ons / Dashboard presets', table: 'developer_dashboard_widget_presets', column: 'preset_key' },
  { name: 'Platform add-ons / Export jobs', table: 'developer_export_jobs', column: 'id' },
  { name: 'Platform add-ons / Preview audit', table: 'developer_preview_audit', column: 'id' },
]);

export const HEALTH_PROBE_TIMEOUT_MS = 6000;

function send(res, status, payload) {
  setDeveloperApiHeaders(res);
  return res.status(status).json(payload);
}

export async function probeDatabaseDependency(db, dependency, now = () => Date.now()) {
  const started = now();
  try {
    // A zero-row table must still be considered healthy if its query works.
    // Supabase JS/PostgREST supports abortSignal on select query builders.
    let query = db.from(dependency.table).select(dependency.column).limit(1);
    if (typeof AbortSignal.timeout === 'function') {
      query = query.abortSignal(AbortSignal.timeout(HEALTH_PROBE_TIMEOUT_MS));
    }
    const result = await query;
    if (result?.error) throw result.error;
    return { name: dependency.name, ok: true, latencyMs: Math.max(0, now() - started) };
  } catch (error) {
    // Never reflect SQL errors, table contents or credentials to the browser.
    // Log a bounded code only for diagnostics; no raw error messages.
    const rawCode = String(error?.code || 'DEPENDENCY_ERROR');
    const code = /^[A-Z0-9_]{1,32}$/i.test(rawCode) ? rawCode : 'DEPENDENCY_ERROR';
    console.warn('[developer-health] dependency failed', dependency.name, code);
    return {
      name: dependency.name,
      ok: false,
      latencyMs: Math.max(0, now() - started),
      code,
      message: 'Backend dependency is unavailable.',
    };
  }
}

