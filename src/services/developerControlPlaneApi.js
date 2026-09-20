async function request(method, payload, path) {
  try {
    const response = await fetch(path, {
      method,
      credentials: 'include',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
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

export function getDeveloperControlPlaneState(key) {
  return request('GET', undefined, `/api/developer/control-plane?key=${encodeURIComponent(key)}`);
}

export function saveDeveloperControlPlaneState({ key, expectedRevision, payload }) {
  return request('PUT', { key, expectedRevision, payload }, '/api/developer/control-plane');
}

export function getDeveloperControlPlaneHistory(key) {
  return request('GET', undefined, `/api/developer/control-plane?key=${encodeURIComponent(key)}&history=1`);
}

export function rollbackDeveloperControlPlaneState({ key, expectedRevision, historyId }) {
  return request('POST', { action: 'rollback', key, expectedRevision, historyId }, '/api/developer/control-plane');
}
