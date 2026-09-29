export async function getDeveloperServiceHealth() {
  try {
    const response = await fetch('/api/developer?route=health', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      referrerPolicy: 'no-referrer',
    });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch {}
    return { ...data, ok: Boolean(response.ok && data?.ok), statusCode: response.status };
  } catch {
    return { ok: false, status: 'down', code: 'NETWORK_ERROR', checks: [] };
  }
}
