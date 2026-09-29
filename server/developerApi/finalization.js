import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../auth/requireDeveloperSession.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KEY = /^[a-z0-9][a-z0-9._:-]{1,119}$/;
const EXPORT_TYPES = new Set([
  'companies', 'users', 'modules', 'subscriptions', 'audit', 'vehicles',
  'drivers', 'trips', 'finance', 'reports', 'custom',
]);

function send(res, status, payload) {
  setDeveloperApiHeaders(res);
  return res.status(status).json(payload);
}

function clean(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function asBool(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function asPercent(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
}

function isMissingRelation(error) {
  return ['42P01', 'PGRST205', 'PGRST204'].includes(error?.code);
}

async function bestEffortAudit(db, actorUserId, action, details = {}) {
  try {
    await db.from('developer_saas_history').insert({
      domain: 'platform_finalization',
      entity_id: details.companyId || null,
      action,
      before_payload: null,
      after_payload: details,
      actor_user_id: actorUserId || null,
    });
    return;
  } catch {}

  try {
    await db.from('audit_logs').insert({
      actor_user_id: actorUserId || null,
      action,
      entity_type: 'developer_platform',
      entity_id: details.companyId || details.key || null,
      details,
    });
  } catch {}
}

async function platformSummary(db) {
  const [
    companiesR,
    plansR,
    packsR,
    modulesR,
    pendingPackR,
    flagsR,
    settingsR,
    widgetsR,
    exportsR,
  ] = await Promise.all([
    db.from('companies').select('id,company_code,company_name,status,account_owner_user_id,subdomain_slug', { count: 'exact' }).order('company_name', { ascending: true }).limit(200),
    db.from('developer_plans').select('plan_key,name,status,display_order').order('display_order', { ascending: true }),
    db.from('developer_fleet_packs').select('pack_key,name,status,display_order').order('display_order', { ascending: true }),
    db.from('developer_module_catalog').select('module_key,module_name,category,status,sort_order').order('sort_order', { ascending: true }),
    db.from('company_portal_settings').select('company_id', { count: 'exact', head: true }).eq('fleet_pack_selection_status', 'pending'),
    db.from('developer_feature_flags').select('*').order('flag_key', { ascending: true }),
    db.from('developer_platform_settings').select('*').order('setting_key', { ascending: true }),
    db.from('developer_dashboard_widget_presets').select('*').order('fleet_pack', { ascending: true }),
    db.from('developer_export_jobs').select('id,company_id,export_type,status,requested_at,completed_at,expires_at,error_message').order('requested_at', { ascending: false }).limit(25),
  ]);

  const migrationError = [flagsR, settingsR, widgetsR, exportsR].find((r) => r.error && isMissingRelation(r.error));
  if (migrationError) {
    return { ok: false, code: 'PART_05_MIGRATION_REQUIRED' };
  }

  for (const result of [companiesR, plansR, packsR, modulesR, pendingPackR, flagsR, settingsR, widgetsR, exportsR]) {
    if (result.error) throw result.error;
  }

  const maintenance = (settingsR.data || []).find((row) => row.setting_key === 'maintenance_mode')?.setting_value || {};

  return {
    ok: true,
    summary: {
      companies: companiesR.count || 0,
      companyList: companiesR.data || [],
      pendingFleetPackSelection: pendingPackR.count || 0,
      plans: plansR.data || [],
      fleetPacks: packsR.data || [],
      modules: modulesR.data || [],
      betaModules: (modulesR.data || []).filter((m) => m.status === 'beta').length,
      featureFlags: flagsR.data || [],
      platformSettings: settingsR.data || [],
      maintenance,
      widgetPresets: widgetsR.data || [],
      exportJobs: exportsR.data || [],
    },
  };
}

async function globalSearch(db, query) {
  const q = clean(query, 80);
  if (q.length < 2) return { ok: true, results: [] };
  const like = `%${q.replace(/[%_]/g, '')}%`;

  const [companiesR, modulesR, packsR, plansR] = await Promise.all([
    db.from('companies')
      .select('id,company_code,company_name,status,subdomain_slug')
      .or(`company_name.ilike.${like},company_code.ilike.${like},subdomain_slug.ilike.${like}`)
      .limit(8),
    db.from('developer_module_catalog')
      .select('module_key,module_name,category,status')
      .or(`module_key.ilike.${like},module_name.ilike.${like},category.ilike.${like}`)
      .limit(8),
    db.from('developer_fleet_packs')
      .select('pack_key,name,slug,status')
      .or(`pack_key.ilike.${like},name.ilike.${like},slug.ilike.${like}`)
      .limit(5),
    db.from('developer_plans')
      .select('plan_key,name,status')
      .or(`plan_key.ilike.${like},name.ilike.${like}`)
      .limit(5),
  ]);

  for (const r of [companiesR, modulesR, packsR, plansR]) if (r.error) throw r.error;

  const results = [
    ...(companiesR.data || []).map((row) => ({
      type: 'company',
      key: row.id,
      title: row.company_name,
      subtitle: `${row.company_code || '—'} · ${row.status || '—'}`,
      to: `/saas-platform/companies/${row.id}`,
    })),
    ...(modulesR.data || []).map((row) => ({
      type: 'module',
      key: row.module_key,
      title: row.module_name,
      subtitle: `${row.category || 'module'} · ${row.status || '—'}`,
      to: `/saas-platform/module-registry/modules?focus=${encodeURIComponent(row.module_key)}`,
    })),
    ...(packsR.data || []).map((row) => ({
      type: 'fleet_pack',
      key: row.pack_key,
      title: row.name,
      subtitle: `${row.pack_key} · ${row.status}`,
      to: `/saas-platform/fleet-packs/registry?focus=${encodeURIComponent(row.pack_key)}`,
    })),
    ...(plansR.data || []).map((row) => ({
      type: 'plan',
      key: row.plan_key,
      title: row.name,
      subtitle: `${row.plan_key} · ${row.status}`,
      to: `/saas-platform/plans-entitlements/plans?focus=${encodeURIComponent(row.plan_key)}`,
    })),
  ];

  return { ok: true, results: results.slice(0, 20) };
}

async function previewCompany(db, actorUserId, companyId, targetUserId = null) {
  if (!UUID.test(companyId)) return { ok: false, code: 'INVALID_COMPANY_ID', status: 400 };

  const { data: company, error: companyError } = await db
    .from('companies')
    .select('id,company_code,company_name,status,account_owner_user_id,subdomain_slug')
    .eq('id', companyId)
    .maybeSingle();
  if (companyError) throw companyError;
  if (!company) return { ok: false, code: 'COMPANY_NOT_FOUND', status: 404 };

  const userId = UUID.test(String(targetUserId || '')) ? targetUserId : company.account_owner_user_id;
  if (!userId) return { ok: false, code: 'TARGET_USER_REQUIRED', status: 409 };

  const { data: bootstrap, error } = await db.rpc('bf_resolve_company_portal_bootstrap', {
    p_company_id: company.id,
    p_user_id: userId,
  });
  if (error) throw error;

  const [profilesR, accessR] = await Promise.all([
    db.from('company_portal_user_profiles').select('user_id,employee_code,full_name,designation,department,email').eq('company_id', company.id),
    db.from('company_portal_user_access').select('user_id,role_name,all_sites,force_password_change').eq('company_id', company.id),
  ]);
  if (profilesR.error) throw profilesR.error;
  if (accessR.error) throw accessR.error;
  const accessByUser = new Map((accessR.data || []).map((row) => [row.user_id, row]));
  const companyUsers = (profilesR.data || []).map((profile) => ({
    ...profile,
    ...(accessByUser.get(profile.user_id) || {}),
  }));

  try {
    await db.from('developer_preview_audit').insert({
      developer_user_id: actorUserId || null,
      company_id: company.id,
      target_user_id: userId,
      purpose: 'support_preview',
      context: {
        lifecycle_state: bootstrap?.lifecycle_state || null,
        lifecycle_access: bootstrap?.lifecycle_access || null,
        primary_pack: bootstrap?.primary_pack || null,
        visible_module_count: bootstrap?.visible_module_count || 0,
      },
    });
  } catch (auditError) {
    if (!isMissingRelation(auditError)) console.warn('Preview audit write failed:', auditError?.message);
  }

  return {
    ok: true,
    preview: {
      readOnly: true,
      company,
      targetUserId: userId,
      companyUsers,
      bootstrap,
    },
  };
}

async function recentActivity(db) {
  try {
    const { data, error } = await db
      .from('developer_saas_history')
      .select('id,domain,entity_id,action,after_payload,actor_user_id,created_at')
      .order('created_at', { ascending: false })
      .limit(40);
    if (error) throw error;
    return { ok: true, activity: data || [] };
  } catch {
    const { data, error } = await db
      .from('developer_control_plane_history')
      .select('id,workspace_key,revision,action,actor_user_id,created_at')
      .order('created_at', { ascending: false })
      .limit(40);
    if (error) throw error;
    return { ok: true, activity: data || [] };
  }
}

async function handlePost(db, actorUserId, body) {
  const action = clean(body?.action, 80).toLowerCase();

  if (action === 'set_feature_flag') {
    const flagKey = clean(body?.flagKey, 120).toLowerCase();
    if (!KEY.test(flagKey)) return { ok: false, code: 'INVALID_FLAG_KEY', status: 400 };

    const patch = {
      enabled: asBool(body?.enabled),
      rollout_percent: asPercent(body?.rolloutPercent),
      updated_by: actorUserId || null,
      updated_at: new Date().toISOString(),
    };
    if (body?.scope && typeof body.scope === 'object' && !Array.isArray(body.scope)) patch.scope = body.scope;

    const { data, error } = await db.from('developer_feature_flags')
      .update(patch)
      .eq('flag_key', flagKey)
      .select('*')
      .maybeSingle();
    if (error) {
      if (isMissingRelation(error)) return { ok: false, code: 'PART_05_MIGRATION_REQUIRED', status: 409 };
      throw error;
    }
    if (!data) return { ok: false, code: 'FEATURE_FLAG_NOT_FOUND', status: 404 };
    await bestEffortAudit(db, actorUserId, 'feature_flag.updated', { key: flagKey, enabled: patch.enabled, rollout: patch.rollout_percent });
    return { ok: true, featureFlag: data };
  }

  if (action === 'set_maintenance_mode') {
    const current = {
      enabled: asBool(body?.enabled),
      read_only: asBool(body?.readOnly),
      message: clean(body?.message || 'Buddy Fleets maintenance is in progress.', 500),
      allow_developer_access: body?.allowDeveloperAccess !== false,
      allow_team_access: body?.allowTeamAccess !== false,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await db.from('developer_platform_settings')
      .upsert({
        setting_key: 'maintenance_mode',
        setting_value: current,
        updated_by: actorUserId || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'setting_key' })
      .select('*')
      .single();
    if (error) {
      if (isMissingRelation(error)) return { ok: false, code: 'PART_05_MIGRATION_REQUIRED', status: 409 };
      throw error;
    }
    await bestEffortAudit(db, actorUserId, 'maintenance_mode.updated', current);
    return { ok: true, setting: data };
  }

  if (action === 'save_widget_preset') {
    const presetKey = clean(body?.presetKey, 120).toLowerCase();
    const name = clean(body?.name, 160);
    const fleetPack = clean(body?.fleetPack, 80) || null;
    const widgets = Array.isArray(body?.widgets)
      ? [...new Set(body.widgets.map((v) => clean(v, 100)).filter(Boolean))].slice(0, 100)
      : [];
    if (!KEY.test(presetKey) || !name) return { ok: false, code: 'INVALID_WIDGET_PRESET', status: 400 };

    const { data, error } = await db.from('developer_dashboard_widget_presets')
      .upsert({
        preset_key: presetKey,
        name,
        fleet_pack: fleetPack,
        widgets,
        is_default: asBool(body?.isDefault),
        status: 'active',
        updated_by: actorUserId || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'preset_key' })
      .select('*')
      .single();
    if (error) throw error;
    await bestEffortAudit(db, actorUserId, 'dashboard_widget_preset.saved', { key: presetKey, fleetPack, widgets });
    return { ok: true, preset: data };
  }

  if (action === 'queue_export') {
    const exportType = clean(body?.exportType, 80).toLowerCase();
    const companyId = clean(body?.companyId, 60) || null;
    if (!EXPORT_TYPES.has(exportType)) return { ok: false, code: 'INVALID_EXPORT_TYPE', status: 400 };
    if (companyId && !UUID.test(companyId)) return { ok: false, code: 'INVALID_COMPANY_ID', status: 400 };
    const filters = body?.filters && typeof body.filters === 'object' && !Array.isArray(body.filters) ? body.filters : {};

    const { data, error } = await db.from('developer_export_jobs').insert({
      requested_by: actorUserId || null,
      company_id: companyId,
      export_type: exportType,
      filters,
      status: 'queued',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).select('*').single();
    if (error) throw error;
    await bestEffortAudit(db, actorUserId, 'export.queued', { companyId, exportType });
    return { ok: true, job: data };
  }

  if (action === 'preview_company') {
    return await previewCompany(db, actorUserId, clean(body?.companyId, 60), clean(body?.targetUserId, 60) || null);
  }

  return { ok: false, code: 'INVALID_ACTION', status: 400 };
}

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const auth = await requireDeveloperSession(req);
  if (!auth.ok) {
    if (auth.clearCookie) clearDeveloperSessionCookie(res);
    return send(res, auth.status || 401, { ok: false, code: auth.code || 'UNAUTHORIZED' });
  }

  try {
    if (req.method === 'GET') {
      const action = clean(req.query?.action || 'summary', 80).toLowerCase();
      let result;
      if (action === 'summary') result = await platformSummary(auth.supabaseAdmin);
      else if (action === 'search') result = await globalSearch(auth.supabaseAdmin, req.query?.q);
      else if (action === 'activity') result = await recentActivity(auth.supabaseAdmin);
      else if (action === 'preview_company') result = await previewCompany(auth.supabaseAdmin, auth.user.id, clean(req.query?.companyId, 60), clean(req.query?.targetUserId, 60) || null);
      else result = { ok: false, code: 'INVALID_ACTION', status: 400 };
      return send(res, result.status || (result.ok ? 200 : 400), result);
    }

    if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return send(res, 415, { ok: false, code: 'JSON_REQUIRED' });
    }
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch {
      return send(res, 400, { ok: false, code: 'INVALID_JSON' });
    }
    const result = await handlePost(auth.supabaseAdmin, auth.user.id, body);
    return send(res, result.status || (result.ok ? 200 : 400), result);
  } catch (error) {
    console.error('Developer finalization API failed:', error);
    return send(res, 500, { ok: false, code: 'DEVELOPER_FINALIZATION_FAILED' });
  }
}
