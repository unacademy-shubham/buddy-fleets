async function request(method, payload, path = '/api/developer/website/pages') {
  try {
    const response = await fetch(path, {
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

export function getWebsitePageDraft(pageId) {
  return request('GET', undefined, `/api/developer/website/draft?pageId=${encodeURIComponent(pageId)}`);
}

export function saveWebsitePageDraft({ pageId, revision, content }) {
  return request('PUT', { pageId, revision, content }, '/api/developer/website/draft');
}
