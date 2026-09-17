async function request(method, payload) {
  try {
    const response = await fetch('/api/developer/website/pages', {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, ok: Boolean(response.ok && data?.ok), status: response.status };
  } catch {
    return { ok: false, status: 0, code: 'NETWORK_ERROR' };
  }
}

export function getWebsitePages() {
  return request('GET');
}

export function createWebsitePage(payload) {
  return request('POST', { name: payload.name, path: payload.path });
}
