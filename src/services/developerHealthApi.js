const HEALTH_REQUEST_TIMEOUT_MS = 12000;

export async function getDeveloperServiceHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch('/api/developer?route=health', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { /* treat invalid JSON as down */ }
    return {
      ...data,
      ok: Boolean(response.ok && data?.ok),
      status: typeof data?.status === 'string' ? data.status : 'down',
      statusCode: response.status,
      checks: Array.isArray(data?.checks) ? data.checks : [],
    };
  } catch (error) {
    return {
      ok: false,
      status: 'down',
      code: error?.name === 'AbortError' ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
      checks: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}
