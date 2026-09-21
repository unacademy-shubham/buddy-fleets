async function request(method, companyId, payload) {
  try {
    const url = method === 'GET'
      ? `/api/developer/company-360?companyId=${encodeURIComponent(companyId)}`
      : '/api/developer/company-360';
    const response = await fetch(url, {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json', ...(payload ? { 'Content-Type': 'application/json' } : {}) },
      ...(payload ? { body: JSON.stringify({ companyId, ...payload }) } : {}),
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, ok: Boolean(response.ok && data?.ok), status: response.status };
  } catch {
    return { ok: false, status: 0, code: 'NETWORK_ERROR' };
  }
}

export const getCompany360 = (companyId) => request('GET', companyId);
export const company360Action = (companyId, payload) => request('POST', companyId, payload);
