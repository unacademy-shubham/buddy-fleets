async function request(method, payload, resource) {
  try {
    const path = method === 'GET'
      ? `/api/developer/saas-management?resource=${encodeURIComponent(resource)}`
      : '/api/developer/saas-management';

    const response = await fetch(path, {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(payload ? { body: JSON.stringify({ resource, ...payload }) } : {}),
    });

    const data = await response.json().catch(() => ({}));
    return {
      ...data,
      ok: Boolean(response.ok && data?.ok),
      status: response.status,
    };
  } catch {
    return { ok: false, status: 0, code: 'NETWORK_ERROR' };
  }
}

export function getCompanies() {
  return request('GET', undefined, 'companies');
}

export function updateCompany(payload) {
  return request('PATCH', payload, 'companies');
}

export function getPlans() {
  return request('GET', undefined, 'plans');
}

export function createPlan(payload) {
  return request('POST', payload, 'plans');
}

export function updatePlan(payload) {
  return request('PATCH', payload, 'plans');
}

export function archivePlan(payload) {
  return request('DELETE', payload, 'plans');
}

export function getCompanyOverrides() {
  return request('GET', undefined, 'overrides');
}

export function saveCompanyOverride(payload) {
  return request(payload?.expectedRevision ? 'PATCH' : 'POST', payload, 'overrides');
}

export function clearCompanyOverride(payload) {
  return request('DELETE', payload, 'overrides');
}

export function getRenewalPolicy() {
  return request('GET', undefined, 'renewal');
}

export function saveRenewalPolicy(payload) {
  return request('PATCH', payload, 'renewal');
}
