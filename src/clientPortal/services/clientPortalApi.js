const ENDPOINT = '/api/company/entitlements';

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return {}; }
}

async function request({ method = 'GET', resource = '', action = '', payload = null, params = {} } = {}) {
  const search = new URLSearchParams();
  if (resource) search.set('resource', resource);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });

  const response = await fetch(`${ENDPOINT}${search.toString() ? `?${search}` : ''}`, {
    method,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
    },
    body: method === 'GET' ? undefined : JSON.stringify({ action, payload }),
    referrerPolicy: 'no-referrer',
  });

  const data = await readJson(response);
  if (!response.ok || data?.ok === false) {
    const error = new Error(data?.message || data?.code || 'Request failed.');
    error.code = data?.code || 'REQUEST_FAILED';
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export const clientPortalApi = {
  getEntitlements: () => request(),
  bootstrap: () => request({ resource: 'bootstrap' }),
  list: (resource, params) => request({ resource, params }),
  action: (action, payload) => request({ method: 'POST', action, payload }),
  lookupGst: (gstin) => request({ method: 'POST', action: 'gst_lookup', payload: { gstin } }),
  saveUserAccess: (payload) => request({ method: 'POST', action: 'save_user_access', payload }),
  uploadPhoto: (payload) => request({ method: 'POST', action: 'upload_photo', payload }),
};
