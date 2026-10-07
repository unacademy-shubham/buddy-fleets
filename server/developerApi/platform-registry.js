import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../auth/requireDeveloperSession.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KEY = /^[a-z0-9][a-z0-9._:/_-]{0,159}$/;
const ACCESS_LEVELS = new Set(['full', 'read_only', 'blocked']);
const STATUSES = new Set(['active', 'inactive', 'archived']);
const NODE_TYPES = new Set(['category', 'menu', 'submenu', 'level3']);
const PLACEMENTS = new Set(['sidebar', 'dashboard', 'both']);

function send(res, status, payload) {
  setDeveloperApiHeaders(res);
  return res.status(status).json(payload);
}

function clean(value, max = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function bool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function integer(value, fallback = 100, min = 0, max = 1000000) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return fallback;
  return number;
}

function stringArray(value, max = 100) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => clean(String(item), 160)).filter(Boolean))].slice(0, max);
}

async function audit(db, actor, action, entityType, entityId, details = {}) {
  try {
    await db.from('audit_logs').insert({
      actor_user_id: actor || null,
      action,
      entity_type: entityType,
      entity_id: String(entityId || ''),
      details,
    });
  } catch {
    // Audit schema varies between environments. Registry writes remain authoritative.
  }
}

async function getFleetPacks(db) {
  const { data, error } = await db
    .from('developer_fleet_packs')
    .select('pack_key,slug,name,short_name,description,icon_key,status,display_order,terminology,config,created_at,updated_at')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function getModules(db) {
  const { data, error } = await db
    .from('developer_module_catalog')
    .select('id,module_key,module_name,category,description,icon_key,status,unavailable_behavior,trial_access,expired_access,dependencies,show_in_sidebar,show_on_dashboard,sort_order,route,fleet_packs,is_core,website_feature,created_at,updated_at')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('module_name', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function getFleetPackModules(db, packKey = '') {
  let query = db
    .from('developer_fleet_pack_modules')
    .select('pack_key,module_key,default_enabled,is_core,sort_order,config,created_at,updated_at')
    .order('pack_key', { ascending: true })
    .order('sort_order', { ascending: true });
  if (packKey) query = query.eq('pack_key', packKey);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getPlanFleet(db, planKey = '', packKey = '') {
  let query = db
    .from('developer_plan_fleet_entitlements')
    .select('plan_key,pack_key,module_key,access_level,limits,created_at,updated_at')
    .order('plan_key', { ascending: true })
    .order('pack_key', { ascending: true })
    .order('module_key', { ascending: true });
  if (planKey) query = query.eq('plan_key', planKey);
  if (packKey) query = query.eq('pack_key', packKey);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getNavigation(db) {
  const { data, error } = await db
    .from('developer_navigation_nodes')
    .select('id,node_key,parent_node_key,node_type,label,module_key,route,icon_key,fleet_packs,placement,sort_order,status,show_in_sidebar,show_on_dashboard,metadata,created_at,updated_at')
    .order('sort_order', { ascending: true })
    .order('label', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function getCompanyModuleOverrides(db, companyId = '') {
  let query = db
    .from('developer_company_module_overrides')
    .select('company_id,module_key,enabled,access_level,action_overrides,reason,created_by,updated_by,created_at,updated_at')
    .order('updated_at', { ascending: false });
  if (companyId) query = query.eq('company_id', companyId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getCompaniesLite(db) {
  const [{ data: companies, error: companyError }, { data: settings, error: settingsError }] = await Promise.all([
    db.from('companies').select('id,company_code,company_name,status,account_owner_user_id,subdomain_slug').order('company_name', { ascending: true }).limit(500),
    db.from('company_portal_settings').select('company_id,fleet_pack,enabled_packs,fleet_pack_selection_status,fleet_pack_selected_at').limit(500),
  ]);
  if (companyError) throw companyError;
  if (settingsError) throw settingsError;
  const byCompany = new Map((settings || []).map((row) => [row.company_id, row]));
  return (companies || []).map((company) => ({ ...company, portal_settings: byCompany.get(company.id) || null }));
}

async function getPlansLite(db) {
  const { data, error } = await db
    .from('developer_plans')
    .select('id,plan_key,name,status,currency,display_order,prices,revision,updated_at')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function getPricingHistory(db) {
  const { data, error } = await db
    .from('developer_saas_history')
    .select('id,entity_id,action,before_payload,after_payload,actor_user_id,created_at')
    .eq('domain', 'plan')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []).filter((row) => {
    const before = row.before_payload?.prices || null;
    const after = row.after_payload?.prices || null;
    return row.action === 'create' || JSON.stringify(before) !== JSON.stringify(after);
  });
}

async function updateFleetPack({ db, actor, body }) {
  const packKey = clean(body.packKey, 120);
  if (!KEY.test(packKey)) return { status: 400, payload: { ok: false, code: 'INVALID_PACK_KEY' } };
  const status = clean(body.status || 'active', 30);
  if (!STATUSES.has(status)) return { status: 400, payload: { ok: false, code: 'INVALID_STATUS' } };

  const patch = {
    name: clean(body.name, 160),
    short_name: clean(body.shortName, 80),
    description: clean(body.description, 2000),
    icon_key: clean(body.iconKey, 100),
    status,
    display_order: integer(body.displayOrder, 100),
    terminology: isObject(body.terminology) ? body.terminology : {},
    config: isObject(body.config) ? body.config : {},
    updated_at: new Date().toISOString(),
  };
  if (!patch.name || !patch.short_name) return { status: 400, payload: { ok: false, code: 'INVALID_FLEET_PACK' } };

  const { data, error } = await db.from('developer_fleet_packs').update(patch).eq('pack_key', packKey).select('*').maybeSingle();
  if (error) throw error;
  if (!data) return { status: 404, payload: { ok: false, code: 'FLEET_PACK_NOT_FOUND' } };
  await audit(db, actor, 'developer.registry.fleet_pack.update', 'fleet_pack', packKey, { name: data.name, status: data.status });
  return { status: 200, payload: { ok: true, fleetPack: data } };
}

async function saveFleetPackModule({ db, actor, body }) {
  const packKey = clean(body.packKey, 120);
  const moduleKey = clean(body.moduleKey, 160);
  if (!KEY.test(packKey) || !KEY.test(moduleKey)) return { status: 400, payload: { ok: false, code: 'INVALID_MAPPING' } };
  const row = {
    pack_key: packKey,
    module_key: moduleKey,
    default_enabled: body.defaultEnabled !== false,
    is_core: body.isCore === true,
    sort_order: integer(body.sortOrder, 100),
    config: isObject(body.config) ? body.config : {},
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('developer_fleet_pack_modules').upsert(row, { onConflict: 'pack_key,module_key' }).select('*').single();
  if (error) throw error;
  await audit(db, actor, 'developer.registry.fleet_pack_module.save', 'fleet_pack_module', `${packKey}:${moduleKey}`, row);
  return { status: 200, payload: { ok: true, mapping: data } };
}

async function removeFleetPackModule({ db, actor, body }) {
  const packKey = clean(body.packKey, 120);
  const moduleKey = clean(body.moduleKey, 160);
  if (!KEY.test(packKey) || !KEY.test(moduleKey)) return { status: 400, payload: { ok: false, code: 'INVALID_MAPPING' } };
  const { error } = await db.from('developer_fleet_pack_modules').delete().eq('pack_key', packKey).eq('module_key', moduleKey);
  if (error) throw error;
  await audit(db, actor, 'developer.registry.fleet_pack_module.remove', 'fleet_pack_module', `${packKey}:${moduleKey}`);
  return { status: 200, payload: { ok: true } };
}

async function savePlanFleet({ db, actor, body }) {
  const planKey = clean(body.planKey, 120);
  const packKey = clean(body.packKey, 120);
  const moduleKey = clean(body.moduleKey, 160);
  const accessLevel = clean(body.accessLevel || 'blocked', 30);
  if (!KEY.test(planKey) || !KEY.test(packKey) || !KEY.test(moduleKey) || !ACCESS_LEVELS.has(accessLevel)) {
    return { status: 400, payload: { ok: false, code: 'INVALID_PLAN_FLEET_ENTITLEMENT' } };
  }
  const row = {
    plan_key: planKey,
    pack_key: packKey,
    module_key: moduleKey,
    access_level: accessLevel,
    limits: isObject(body.limits) ? body.limits : {},
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('developer_plan_fleet_entitlements').upsert(row, { onConflict: 'plan_key,pack_key,module_key' }).select('*').single();
  if (error) throw error;
  await audit(db, actor, 'developer.registry.plan_fleet.save', 'plan_fleet_entitlement', `${planKey}:${packKey}:${moduleKey}`, row);
  return { status: 200, payload: { ok: true, entitlement: data } };
}

async function saveCompanyModuleOverride({ db, actor, body }) {
  const companyId = clean(body.companyId, 80);
  const moduleKey = clean(body.moduleKey, 160);
  const accessLevel = clean(body.accessLevel || 'full', 30);
  if (!UUID.test(companyId) || !KEY.test(moduleKey) || !ACCESS_LEVELS.has(accessLevel)) {
    return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_MODULE_OVERRIDE' } };
  }
  const currentR = await db.from('developer_company_module_overrides').select('revision,reason').eq('company_id',companyId).eq('module_key',moduleKey).maybeSingle();
  if (currentR.error) throw currentR.error;
  const reason = clean(body.reason,1000) || currentR.data?.reason || 'Platform Registry change';
  const { data, error } = await db.rpc('developer_company360_save_module_override', {
    p_company_id: companyId,
    p_module_key: moduleKey,
    p_access_level: accessLevel,
    p_action_overrides: isObject(body.actionOverrides) ? body.actionOverrides : {},
    p_reason: reason,
    p_expected_revision: Number(currentR.data?.revision || 0),
    p_actor: actor || null,
  });
  if (error) throw error;
  if (!data?.ok) return { status: data?.code === 'REVISION_CONFLICT' ? 409 : 400, payload: { ok:false, ...data } };
  await audit(db, actor, 'developer.registry.company_module_override.save', 'company_module_override', `${companyId}:${moduleKey}`, data.override);
  return { status: 200, payload: { ok: true, override: data.override } };
}

async function removeCompanyModuleOverride({ db, actor, body }) {
  const companyId = clean(body.companyId, 80);
  const moduleKey = clean(body.moduleKey, 160);
  if (!UUID.test(companyId) || !KEY.test(moduleKey)) return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_MODULE_OVERRIDE' } };
  const currentR = await db.from('developer_company_module_overrides').select('revision').eq('company_id',companyId).eq('module_key',moduleKey).maybeSingle();
  if (currentR.error) throw currentR.error;
  if (!currentR.data) return { status:200, payload:{ok:true,idempotent:true} };
  const { data, error } = await db.rpc('developer_company360_clear_module_override', {
    p_company_id: companyId,
    p_module_key: moduleKey,
    p_expected_revision: Number(currentR.data.revision || 0),
    p_reason: clean(body.reason,1000) || 'Platform Registry reset',
    p_actor: actor || null,
  });
  if (error) throw error;
  if (!data?.ok) return { status: data?.code === 'REVISION_CONFLICT' ? 409 : 400, payload:{ok:false,...data} };
  await audit(db, actor, 'developer.registry.company_module_override.remove', 'company_module_override', `${companyId}:${moduleKey}`);
  return { status: 200, payload: { ok: true, idempotent:data.idempotent===true } };
}

async function updateModule({ db, actor, body }) {
  const moduleKey = clean(body.moduleKey, 160);
  if (!KEY.test(moduleKey)) return { status: 400, payload: { ok: false, code: 'INVALID_MODULE_KEY' } };
  const status = clean(body.status || 'active', 30);
  if (!STATUSES.has(status)) return { status: 400, payload: { ok: false, code: 'INVALID_STATUS' } };
  const patch = {
    module_name: clean(body.moduleName, 180),
    category: clean(body.category, 120),
    description: clean(body.description, 2000),
    icon_key: clean(body.iconKey, 100),
    route: clean(body.route, 300) || null,
    status,
    fleet_packs: stringArray(body.fleetPacks),
    is_core: body.isCore === true,
    website_feature: body.websiteFeature === true,
    show_in_sidebar: body.showInSidebar !== false,
    show_on_dashboard: body.showOnDashboard === true,
    sort_order: integer(body.sortOrder, 100),
    updated_at: new Date().toISOString(),
  };
  if (!patch.module_name || !patch.category) return { status: 400, payload: { ok: false, code: 'INVALID_MODULE' } };
  const { data, error } = await db.from('developer_module_catalog').update(patch).eq('module_key', moduleKey).select('*').maybeSingle();
  if (error) throw error;
  if (!data) return { status: 404, payload: { ok: false, code: 'MODULE_NOT_FOUND' } };
  await audit(db, actor, 'developer.registry.module.update', 'module', moduleKey, { status: data.status, route: data.route });
  return { status: 200, payload: { ok: true, module: data } };
}

async function saveNavigationNode({ db, actor, body }) {
  const nodeKey = clean(body.nodeKey, 160);
  const parentNodeKey = clean(body.parentNodeKey, 160) || null;
  const moduleKey = clean(body.moduleKey, 160) || null;
  const nodeType = clean(body.nodeType, 30);
  const status = clean(body.status || 'active', 30);
  const placement = clean(body.placement || 'sidebar', 30);
  if (!KEY.test(nodeKey) || (parentNodeKey && !KEY.test(parentNodeKey)) || (moduleKey && !KEY.test(moduleKey)) || !NODE_TYPES.has(nodeType) || !STATUSES.has(status) || !PLACEMENTS.has(placement)) {
    return { status: 400, payload: { ok: false, code: 'INVALID_NAVIGATION_NODE' } };
  }
  const row = {
    node_key: nodeKey,
    parent_node_key: parentNodeKey,
    node_type: nodeType,
    label: clean(body.label, 160),
    module_key: moduleKey,
    route: clean(body.route, 300) || null,
    icon_key: clean(body.iconKey, 100),
    fleet_packs: stringArray(body.fleetPacks),
    placement,
    sort_order: integer(body.sortOrder, 100),
    status,
    show_in_sidebar: body.showInSidebar !== false,
    show_on_dashboard: body.showOnDashboard === true,
    metadata: isObject(body.metadata) ? body.metadata : {},
    updated_at: new Date().toISOString(),
  };
  if (!row.label) return { status: 400, payload: { ok: false, code: 'INVALID_NAVIGATION_NODE' } };
  const { data, error } = await db.from('developer_navigation_nodes').upsert(row, { onConflict: 'node_key' }).select('*').single();
  if (error) throw error;
  await audit(db, actor, 'developer.registry.navigation.save', 'navigation_node', nodeKey, { node_type: nodeType, parent_node_key: parentNodeKey });
  return { status: 200, payload: { ok: true, node: data } };
}

async function setCompanyFleetPacks({ db, actor, body }) {
  const companyId = clean(body.companyId, 80);
  const primaryPack = clean(body.primaryPack, 120);
  const enabledPacks = stringArray(body.enabledPacks, 20);
  if (!UUID.test(companyId) || !KEY.test(primaryPack)) return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_FLEET_PACK' } };
  const normalizedEnabled = enabledPacks.includes(primaryPack) ? enabledPacks : [primaryPack, ...enabledPacks];
  const { data, error } = await db.rpc('bf_set_company_fleet_packs', {
    p_company_id: companyId,
    p_primary_pack: primaryPack,
    p_enabled_packs: normalizedEnabled,
  });
  if (error) throw error;
  await audit(db, actor, 'developer.registry.company_fleet_packs.set', 'company', companyId, { primaryPack, enabledPacks: normalizedEnabled });
  return { status: 200, payload: { ok: true, result: data } };
}

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);
  if (!['GET', 'PATCH', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PATCH, POST');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const auth = await requireDeveloperSession(req);
  if (!auth.ok) {
    if (auth.clearCookie) clearDeveloperSessionCookie(res);
    return send(res, auth.status || 401, { ok: false, code: auth.code || 'UNAUTHORIZED' });
  }

  const db = auth.supabaseAdmin;
  const actor = auth.user?.id || null;

  try {
    if (req.method === 'GET') {
      const resource = clean(req.query?.resource, 80);
      if (resource === 'fleet-packs') return send(res, 200, { ok: true, fleetPacks: await getFleetPacks(db) });
      if (resource === 'modules') return send(res, 200, { ok: true, modules: await getModules(db) });
      if (resource === 'fleet-pack-modules') return send(res, 200, { ok: true, mappings: await getFleetPackModules(db, clean(req.query?.packKey, 120)) });
      if (resource === 'plan-fleet') return send(res, 200, { ok: true, entitlements: await getPlanFleet(db, clean(req.query?.planKey, 120), clean(req.query?.packKey, 120)) });
      if (resource === 'navigation') return send(res, 200, { ok: true, nodes: await getNavigation(db) });
      if (resource === 'company-module-overrides') {
        const companyId = clean(req.query?.companyId, 80);
        if (companyId && !UUID.test(companyId)) return send(res, 400, { ok: false, code: 'INVALID_COMPANY_ID' });
        return send(res, 200, { ok: true, overrides: await getCompanyModuleOverrides(db, companyId) });
      }
      if (resource === 'companies-lite') return send(res, 200, { ok: true, companies: await getCompaniesLite(db) });
      if (resource === 'plans-lite') return send(res, 200, { ok: true, plans: await getPlansLite(db) });
      if (resource === 'pricing-history') return send(res, 200, { ok: true, history: await getPricingHistory(db) });
      if (resource === 'bootstrap') {
        const [fleetPacks, modules, mappings, plans, navigation, companies] = await Promise.all([
          getFleetPacks(db), getModules(db), getFleetPackModules(db), getPlansLite(db), getNavigation(db), getCompaniesLite(db),
        ]);
        return send(res, 200, { ok: true, fleetPacks, modules, mappings, plans, navigation, companies });
      }
      return send(res, 400, { ok: false, code: 'INVALID_RESOURCE' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const action = clean(body.action, 100);
    let result;
    if (action === 'update_fleet_pack') result = await updateFleetPack({ db, actor, body });
    else if (action === 'save_fleet_pack_module') result = await saveFleetPackModule({ db, actor, body });
    else if (action === 'remove_fleet_pack_module') result = await removeFleetPackModule({ db, actor, body });
    else if (action === 'save_plan_fleet_entitlement') result = await savePlanFleet({ db, actor, body });
    else if (action === 'save_company_module_override') result = await saveCompanyModuleOverride({ db, actor, body });
    else if (action === 'remove_company_module_override') result = await removeCompanyModuleOverride({ db, actor, body });
    else if (action === 'update_module') result = await updateModule({ db, actor, body });
    else if (action === 'save_navigation_node') result = await saveNavigationNode({ db, actor, body });
    else if (action === 'set_company_fleet_packs') result = await setCompanyFleetPacks({ db, actor, body });
    else return send(res, 400, { ok: false, code: 'INVALID_ACTION' });
    return send(res, result.status, result.payload);
  } catch (error) {
    console.error('Developer platform registry API failed:', error?.message || error);
    return send(res, 500, { ok: false, code: 'PLATFORM_REGISTRY_FAILED', message: error?.message || 'Unexpected error' });
  }
}
