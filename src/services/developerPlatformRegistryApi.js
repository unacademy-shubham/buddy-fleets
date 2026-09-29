async function request(method, payload, resource, params = {}) {
  try {
    const query = new URLSearchParams({ resource, ...Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')) });
    const path = method === 'GET'
      ? `/api/developer/platform-registry?${query.toString()}`
      : '/api/developer/platform-registry';
    const response = await fetch(path, {
      method,
      credentials: 'include',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/json', ...(payload ? { 'Content-Type': 'application/json' } : {}) },
      ...(payload ? { body: JSON.stringify({ resource, ...payload }) } : {}),
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, ok: Boolean(response.ok && data?.ok), status: response.status };
  } catch {
    return { ok: false, status: 0, code: 'NETWORK_ERROR' };
  }
}

export const getRegistryBootstrap = () => request('GET', null, 'bootstrap');
export const getFleetPacks = () => request('GET', null, 'fleet-packs');
export const getRegistryModules = () => request('GET', null, 'modules');
export const getFleetPackModules = (packKey = '') => request('GET', null, 'fleet-pack-modules', { packKey });
export const getPlanFleetEntitlements = (planKey = '', packKey = '') => request('GET', null, 'plan-fleet', { planKey, packKey });
export const getNavigationNodes = () => request('GET', null, 'navigation');
export const getRegistryCompanies = () => request('GET', null, 'companies-lite');
export const getRegistryPlans = () => request('GET', null, 'plans-lite');
export const getPricingHistory = () => request('GET', null, 'pricing-history');
export const getCompanyModuleOverrides = (companyId = '') => request('GET', null, 'company-module-overrides', { companyId });

export const updateFleetPack = (payload) => request('PATCH', { action: 'update_fleet_pack', ...payload }, 'fleet-packs');
export const saveFleetPackModule = (payload) => request('PATCH', { action: 'save_fleet_pack_module', ...payload }, 'fleet-pack-modules');
export const removeFleetPackModule = (payload) => request('PATCH', { action: 'remove_fleet_pack_module', ...payload }, 'fleet-pack-modules');
export const savePlanFleetEntitlement = (payload) => request('PATCH', { action: 'save_plan_fleet_entitlement', ...payload }, 'plan-fleet');
export const saveCompanyModuleOverride = (payload) => request('PATCH', { action: 'save_company_module_override', ...payload }, 'company-module-overrides');
export const removeCompanyModuleOverride = (payload) => request('PATCH', { action: 'remove_company_module_override', ...payload }, 'company-module-overrides');
export const updateRegistryModule = (payload) => request('PATCH', { action: 'update_module', ...payload }, 'modules');
export const saveNavigationNode = (payload) => request('PATCH', { action: 'save_navigation_node', ...payload }, 'navigation');
export const setCompanyFleetPacks = (payload) => request('PATCH', { action: 'set_company_fleet_packs', ...payload }, 'companies-lite');
