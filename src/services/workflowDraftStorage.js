import { readSessionRuntime } from './sessionRuntime';

const DRAFT_PREFIX = 'bf_workflow_draft';
const ASSET_PREFIX = 'bf_workflow_asset';

function safeWorkflowKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getSessionId() {
  try {
    return String(readSessionRuntime()?.sessionId || '').trim();
  } catch {
    return '';
  }
}

function draftKey(workflow, version, sessionId) {
  return `${DRAFT_PREFIX}:v${version}:${sessionId}:${safeWorkflowKey(workflow)}`;
}

function assetKey(workflow, asset, version, sessionId) {
  return `${ASSET_PREFIX}:v${version}:${sessionId}:${safeWorkflowKey(workflow)}:${safeWorkflowKey(asset)}`;
}

function removeStaleWorkflowKeys(workflow, sessionId, keepDraftKey = '') {
  if (typeof window === 'undefined') return;
  try {
    const matches = [];
    const draftSuffix = `:${workflow}`;
    const currentAssetPrefix = `${ASSET_PREFIX}:`;
    const currentAssetScope = `:${sessionId}:${workflow}:`;

    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (!key) continue;

      const staleDraft = key.startsWith(`${DRAFT_PREFIX}:`) && key.endsWith(draftSuffix) && key !== keepDraftKey;
      const staleAsset = key.startsWith(currentAssetPrefix) && key.includes(`:${workflow}:`) && !key.includes(currentAssetScope);
      if (staleDraft || staleAsset) matches.push(key);
    }

    matches.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Draft cleanup is best effort only.
  }
}

export function readWorkflowDraft(workflow, { version = 1 } = {}) {
  if (typeof window === 'undefined') return null;
  const sessionId = getSessionId();
  const normalizedWorkflow = safeWorkflowKey(workflow);
  if (!sessionId || !normalizedWorkflow) return null;

  const key = draftKey(normalizedWorkflow, version, sessionId);
  removeStaleWorkflowKeys(normalizedWorkflow, sessionId, key);

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      parsed.version !== version ||
      parsed.sessionId !== sessionId ||
      parsed.workflow !== normalizedWorkflow ||
      !parsed.data ||
      typeof parsed.data !== 'object'
    ) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    try { window.sessionStorage.removeItem(key); } catch { /* noop */ }
    return null;
  }
}

export function writeWorkflowDraft(workflow, data, { version = 1 } = {}) {
  if (typeof window === 'undefined') return false;
  const sessionId = getSessionId();
  const normalizedWorkflow = safeWorkflowKey(workflow);
  if (!sessionId || !normalizedWorkflow || !data || typeof data !== 'object') return false;

  const key = draftKey(normalizedWorkflow, version, sessionId);
  removeStaleWorkflowKeys(normalizedWorkflow, sessionId, key);

  try {
    window.sessionStorage.setItem(key, JSON.stringify({
      version,
      sessionId,
      workflow: normalizedWorkflow,
      savedAt: Date.now(),
      data,
    }));
    return true;
  } catch {
    return false;
  }
}

export function readWorkflowAsset(workflow, asset, { version = 1 } = {}) {
  if (typeof window === 'undefined') return null;
  const sessionId = getSessionId();
  const normalizedWorkflow = safeWorkflowKey(workflow);
  const normalizedAsset = safeWorkflowKey(asset);
  if (!sessionId || !normalizedWorkflow || !normalizedAsset) return null;

  const key = assetKey(normalizedWorkflow, normalizedAsset, version, sessionId);
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.sessionId !== sessionId || parsed?.version !== version) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data ?? null;
  } catch {
    try { window.sessionStorage.removeItem(key); } catch { /* noop */ }
    return null;
  }
}

export function writeWorkflowAsset(workflow, asset, data, { version = 1 } = {}) {
  if (typeof window === 'undefined') return false;
  const sessionId = getSessionId();
  const normalizedWorkflow = safeWorkflowKey(workflow);
  const normalizedAsset = safeWorkflowKey(asset);
  if (!sessionId || !normalizedWorkflow || !normalizedAsset) return false;

  const key = assetKey(normalizedWorkflow, normalizedAsset, version, sessionId);
  try {
    window.sessionStorage.setItem(key, JSON.stringify({
      version,
      sessionId,
      workflow: normalizedWorkflow,
      asset: normalizedAsset,
      savedAt: Date.now(),
      data,
    }));
    return true;
  } catch {
    return false;
  }
}

export function removeWorkflowAsset(workflow, asset, { version = 1 } = {}) {
  if (typeof window === 'undefined') return;
  const sessionId = getSessionId();
  const normalizedWorkflow = safeWorkflowKey(workflow);
  const normalizedAsset = safeWorkflowKey(asset);
  if (!sessionId || !normalizedWorkflow || !normalizedAsset) return;
  try {
    window.sessionStorage.removeItem(assetKey(normalizedWorkflow, normalizedAsset, version, sessionId));
  } catch {
    // Best effort only.
  }
}

export function clearWorkflowDraftFamily(workflow) {
  if (typeof window === 'undefined') return;
  const normalizedWorkflow = safeWorkflowKey(workflow);
  if (!normalizedWorkflow) return;

  try {
    const matches = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (!key) continue;
      if (
        (key.startsWith(`${DRAFT_PREFIX}:`) && key.endsWith(`:${normalizedWorkflow}`)) ||
        (key.startsWith(`${ASSET_PREFIX}:`) && key.includes(`:${normalizedWorkflow}:`))
      ) {
        matches.push(key);
      }
    }
    matches.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Best effort only.
  }
}
