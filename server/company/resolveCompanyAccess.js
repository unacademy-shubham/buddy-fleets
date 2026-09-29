const ACTIVE_PLAN_STATUS = 'active';
const ACCESS_RANK = { blocked: 0, none: 0, read_only: 1, full: 2 };

function normalizeAccess(value) {
  const key = String(value || '').trim().toLowerCase();
  if (key === 'full' || key === 'read_only' || key === 'blocked') return key;
  if (key === 'none' || key === 'hidden') return 'blocked';
  return 'blocked';
}

function legacyAccess(value) {
  const access = normalizeAccess(value);
  if (access === 'blocked') return 'blocked';
  return access;
}

function mergeLimits(...items) {
  return Object.assign({}, ...items.filter((item) => item && typeof item === 'object' && !Array.isArray(item)));
}

/**
 * Central company-access adapter.
 *
 * New authority lives in the DB resolvers introduced in the 2026-09-29
 * foundation migration. This helper keeps the existing server API contract
 * compatible while exposing the normalized runtime context to newer callers.
 */
export async function resolveCompanyAccess(db, companyId, userId = null) {
  if (!db || !companyId) return null;

  const { data: subscriptionContext, error: contextError } = await db.rpc(
    'bf_resolve_subscription_context',
    { p_company_id: companyId }
  );

  if (contextError) throw contextError;
  if (!subscriptionContext?.ok) return null;

  const [companyR, portalR, planR, overrideR] = await Promise.all([
    db
      .from('companies')
      .select('id,company_code,company_name,status,subdomain_slug,account_owner_user_id')
      .eq('id', companyId)
      .maybeSingle(),
    db
      .from('developer_company_portal_config')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle(),
    subscriptionContext.effective_plan_key
      ? db
          .from('developer_plans')
          .select('plan_key,name,status,limits,entitlements,revision,updated_at,prices,currency')
          .eq('plan_key', subscriptionContext.effective_plan_key)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    db
      .from('developer_company_overrides')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle(),
  ]);

  for (const result of [companyR, portalR, planR, overrideR]) {
    if (result?.error) throw result.error;
  }

  if (!companyR.data) return null;

  const enabledPacks = Array.isArray(subscriptionContext.enabled_packs)
    ? subscriptionContext.enabled_packs
    : [];
  const effectivePlanKey = subscriptionContext.effective_plan_key || null;

  let userBootstrap = null;
  if (userId) {
    const { data, error } = await db.rpc('bf_resolve_company_portal_bootstrap', {
      p_company_id: companyId,
      p_user_id: userId,
    });
    if (error) throw error;
    userBootstrap = data || null;
  }

  let moduleRows = [];

  if (userBootstrap?.ok && Array.isArray(userBootstrap.navigation)) {
    const collected = new Map();
    const visit = (nodes) => {
      for (const node of Array.isArray(nodes) ? nodes : []) {
        if (node?.module_key) {
          collected.set(node.module_key, {
            module_key: node.module_key,
            module_name: node.label || node.module_key,
            category: null,
            access_level: normalizeAccess(node.access_level),
            access: legacyAccess(node.access_level),
            visible: normalizeAccess(node.access_level) !== 'blocked',
            actions: node.actions || {},
            route: node.route || null,
            icon_key: node.icon_key || '',
            show_in_sidebar: true,
            show_on_dashboard: Boolean(node.show_on_dashboard),
            dependencies: [],
          });
        }
        visit(node?.children);
      }
    };
    visit(userBootstrap.navigation);
    moduleRows = [...collected.values()];
  } else if (effectivePlanKey && enabledPacks.length) {
    const [matrixR, catalogR, companyOverrideR] = await Promise.all([
      db
        .from('developer_plan_fleet_entitlements')
        .select('module_key,access_level,limits,pack_key')
        .eq('plan_key', effectivePlanKey)
        .in('pack_key', enabledPacks),
      db
        .from('developer_module_catalog')
        .select('module_key,module_name,category,route,icon_key,status,show_in_sidebar,show_on_dashboard,dependencies,unavailable_behavior,sort_order'),
      db
        .from('developer_company_module_overrides')
        .select('module_key,enabled,access_level,action_overrides')
        .eq('company_id', companyId),
    ]);

    for (const result of [matrixR, catalogR, companyOverrideR]) {
      if (result.error) throw result.error;
    }

    const matrix = new Map();
    for (const row of matrixR.data || []) {
      const current = matrix.get(row.module_key);
      const nextAccess = normalizeAccess(row.access_level);
      if (!current || ACCESS_RANK[nextAccess] > ACCESS_RANK[current.access_level]) {
        matrix.set(row.module_key, {
          access_level: nextAccess,
          limits: row.limits || {},
        });
      }
    }

    const overrides = new Map((companyOverrideR.data || []).map((row) => [row.module_key, row]));
    const catalog = new Map((catalogR.data || []).map((row) => [row.module_key, row]));
    const keys = new Set([...matrix.keys(), ...overrides.keys()]);

    moduleRows = [...keys]
      .map((moduleKey) => {
        const catalogRow = catalog.get(moduleKey) || { module_key: moduleKey, module_name: moduleKey };
        const matrixRow = matrix.get(moduleKey) || { access_level: 'blocked', limits: {} };
        const override = overrides.get(moduleKey);
        let accessLevel = matrixRow.access_level;

        if (catalogRow.status && catalogRow.status !== 'active') accessLevel = 'blocked';
        if (override) {
          accessLevel = override.enabled === false ? 'blocked' : normalizeAccess(override.access_level);
        }

        if (subscriptionContext.lifecycle_access === 'read_only' && accessLevel === 'full') {
          accessLevel = 'read_only';
        }
        if (subscriptionContext.lifecycle_access === 'blocked') accessLevel = 'blocked';

        return {
          ...catalogRow,
          module_key: moduleKey,
          access_level: accessLevel,
          access: legacyAccess(accessLevel),
          visible: accessLevel !== 'blocked',
          actions: override?.action_overrides || {},
          limits: matrixRow.limits || {},
        };
      })
      .sort((a, b) => Number(a.sort_order || 100) - Number(b.sort_order || 100));
  }

  const plan = planR.data && planR.data.status === ACTIVE_PLAN_STATUS ? planR.data : planR.data || null;
  const legacyOverride = overrideR.data || null;
  const limits = mergeLimits(
    plan?.limits,
    legacyOverride?.enabled ? legacyOverride?.limits_override : null
  );

  return {
    company: companyR.data,
    subscription: {
      id: subscriptionContext.subscription_id || null,
      status: subscriptionContext.subscription_status || null,
      plan_key: subscriptionContext.selected_plan_key || null,
      effective_plan_key: effectivePlanKey,
      trial_start_at: subscriptionContext.trial_start_at || null,
      trial_end_at: subscriptionContext.trial_end_at || null,
      subscription_start_at: subscriptionContext.subscription_start_at || null,
      subscription_end_at: subscriptionContext.subscription_end_at || null,
    },
    plan: plan
      ? {
          plan_key: plan.plan_key,
          name: plan.name,
          currency: plan.currency || 'INR',
          prices: plan.prices || {},
        }
      : null,
    limits,
    modules: moduleRows,
    portalConfig: portalR.data || null,
    policies: {},
    context: subscriptionContext,
    bootstrap: userBootstrap,
    lifecycleState: subscriptionContext.lifecycle_state || null,
    lifecycleAccess: subscriptionContext.lifecycle_access || 'blocked',
    selectedPlanKey: subscriptionContext.selected_plan_key || null,
    effectivePlanKey,
    primaryPack: userBootstrap?.fleet_pack_setup_required === true
      ? null
      : (userBootstrap?.primary_pack || subscriptionContext.primary_pack || null),
    enabledPacks: userBootstrap?.fleet_pack_setup_required === true
      ? []
      : (Array.isArray(userBootstrap?.enabled_packs) ? userBootstrap.enabled_packs : enabledPacks),
    fleetPackSetupRequired: userBootstrap?.fleet_pack_setup_required === true,
    limitsEnforced: false,
  };
}
