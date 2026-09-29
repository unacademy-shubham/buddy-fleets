async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return {}; }
}

async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await readJson(response);
    return {
      ...data,
      ok: Boolean(response.ok && data?.ok),
      status: response.status,
      code: data?.code || null,
    };
  } catch {
    return { ok: false, status: 0, code: 'NETWORK_ERROR' };
  }
}

export function getPlatformFinalizationSummary() {
  return request('/api/developer/finalization?action=summary');
}

export function getPlatformRecentActivity() {
  return request('/api/developer/finalization?action=activity');
}

export function searchDeveloperPlatform(query) {
  const q = encodeURIComponent(String(query || '').trim());
  return request(`/api/developer/finalization?action=search&q=${q}`);
}

export function previewDeveloperCompany(companyId, targetUserId = '') {
  const params = new URLSearchParams({ action: 'preview_company', companyId });
  if (targetUserId) params.set('targetUserId', targetUserId);
  return request(`/api/developer/finalization?${params.toString()}`);
}

export function updateDeveloperFeatureFlag(payload) {
  return request('/api/developer/finalization', {
    method: 'POST',
    body: JSON.stringify({ action: 'set_feature_flag', ...payload }),
  });
}

export function updateDeveloperMaintenanceMode(payload) {
  return request('/api/developer/finalization', {
    method: 'POST',
    body: JSON.stringify({ action: 'set_maintenance_mode', ...payload }),
  });
}

export function saveDeveloperWidgetPreset(payload) {
  return request('/api/developer/finalization', {
    method: 'POST',
    body: JSON.stringify({ action: 'save_widget_preset', ...payload }),
  });
}

export function queueDeveloperExport(payload) {
  return request('/api/developer/finalization', {
    method: 'POST',
    body: JSON.stringify({ action: 'queue_export', ...payload }),
  });
}
