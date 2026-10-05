async function request(method, payload, resource) {
  try {
    const path = method === 'GET'
      ? `/api/developer?route=saas-management&resource=${encodeURIComponent(resource)}`
      : '/api/developer?route=saas-management';

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


export async function getCompanyDirectory(params = {}) {
  try {
    const search = new URLSearchParams({
      route: 'saas-management',
      resource: 'company-directory',
    });

    for (const [key, value] of Object.entries(params || {})) {
      if (value === undefined || value === null || value === '') continue;
      search.set(key, String(value));
    }

    const response = await fetch(`/api/developer?${search.toString()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
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



export function getCompanyCreateMetadata() {
  return request('GET', undefined, 'company-create-metadata');
}

export async function getCompanySlugPreview({ name = '', slug = '' } = {}) {
  try {
    const search = new URLSearchParams({ route: 'saas-management', resource: 'company-slug-preview' });
    if (name) search.set('name', name);
    if (slug) search.set('slug', slug);
    const response = await fetch(`/api/developer?${search.toString()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, ok: Boolean(response.ok && data?.ok), status: response.status };
  } catch {
    return { ok: false, status: 0, code: 'NETWORK_ERROR' };
  }
}

export async function lookupCompanyPostalCode({ country = 'IN', postalCode = '' } = {}) {
  try {
    const search = new URLSearchParams({ route: 'saas-management', resource: 'postal-lookup', country, postalCode });
    const response = await fetch(`/api/developer?${search.toString()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, ok: Boolean(response.ok && data?.ok), status: response.status };
  } catch {
    return { ok: false, status: 0, code: 'NETWORK_ERROR' };
  }
}

export function verifyCompanyGstin(gstin) {
  return request('POST', { gstin }, 'gst-verify');
}

export function createCompany(payload) {
  return request('POST', payload, 'companies');
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
