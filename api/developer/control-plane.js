import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../server/auth/requireDeveloperSession.js';

const MAX_BODY_BYTES = 512 * 1024;
const KEY_PATTERN = /^[a-z0-9][a-z0-9._:/-]{1,159}$/;
const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function send(res, status, payload) {
  setDeveloperApiHeaders(res);
  return res.status(status).json(payload);
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeTree(value, depth = 0) {
  if (depth > 16) return false;
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return true;
  if (typeof value === 'string') return value.length <= 50000;
  if (Array.isArray(value)) return value.length <= 500 && value.every((item) => safeTree(item, depth + 1));
  if (!isObject(value)) return false;
  const entries = Object.entries(value);
  if (entries.length > 500) return false;
  return entries.every(([key, item]) => !BLOCKED_KEYS.has(key) && key.length <= 160 && safeTree(item, depth + 1));
}

function bodySize(value) {
  try {
    return Buffer.byteLength(JSON.stringify(value ?? {}), 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function validKey(value) {
  return typeof value === 'string' && KEY_PATTERN.test(value);
}

async function writeAudit(supabaseAdmin, actorUserId, action, workspaceKey, details = {}) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      actor_user_id: actorUserId || null,
      action,
      entity_type: 'developer_control_plane',
      entity_id: workspaceKey,
      details,
    });
  } catch {
    // Existing audit schema can differ between environments. Control-plane save must not fail because of best-effort audit logging.
  }
}

async function readState(supabaseAdmin, key) {
  const { data, error } = await supabaseAdmin
    .from('developer_control_plane_state')
    .select('workspace_key,payload,revision,updated_by,created_at,updated_at')
    .eq('workspace_key', key)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function saveState({ supabaseAdmin, key, expectedRevision, payload, actorUserId, action = 'save' }) {
  const now = new Date().toISOString();

  if (expectedRevision === 0) {
    const { data, error } = await supabaseAdmin
      .from('developer_control_plane_state')
      .insert({
        workspace_key: key,
        payload,
        revision: 1,
        updated_by: actorUserId || null,
        updated_at: now,
      })
      .select('workspace_key,payload,revision,updated_by,created_at,updated_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        const conflict = new Error('REVISION_CONFLICT');
        conflict.code = 'REVISION_CONFLICT';
        throw conflict;
      }
      throw error;
    }

    await supabaseAdmin.from('developer_control_plane_history').insert({
      workspace_key: key,
      revision: data.revision,
      payload: data.payload,
      action,
      actor_user_id: actorUserId || null,
    });

    return data;
  }

  const nextRevision = expectedRevision + 1;
  const { data, error } = await supabaseAdmin
    .from('developer_control_plane_state')
    .update({
      payload,
      revision: nextRevision,
      updated_by: actorUserId || null,
      updated_at: now,
    })
    .eq('workspace_key', key)
    .eq('revision', expectedRevision)
    .select('workspace_key,payload,revision,updated_by,created_at,updated_at')
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const conflict = new Error('REVISION_CONFLICT');
    conflict.code = 'REVISION_CONFLICT';
    throw conflict;
  }

  await supabaseAdmin.from('developer_control_plane_history').insert({
    workspace_key: key,
    revision: data.revision,
    payload: data.payload,
    action,
    actor_user_id: actorUserId || null,
  });

  return data;
}

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);

  if (!['GET', 'PUT', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT, POST');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const auth = await requireDeveloperSession(req);
  if (!auth.ok) {
    if (auth.clearCookie) clearDeveloperSessionCookie(res);
    return send(res, auth.status || 401, { ok: false, code: auth.code || 'UNAUTHORIZED' });
  }

  try {
    if (req.method === 'GET') {
      const key = String(req.query?.key || '').trim();
      if (!validKey(key)) return send(res, 400, { ok: false, code: 'INVALID_WORKSPACE_KEY' });

      if (String(req.query?.history || '') === '1') {
        const { data, error } = await auth.supabaseAdmin
          .from('developer_control_plane_history')
          .select('id,workspace_key,revision,action,actor_user_id,created_at')
          .eq('workspace_key', key)
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;
        return send(res, 200, { ok: true, history: data || [] });
      }

      const state = await readState(auth.supabaseAdmin, key);
      return send(res, 200, {
        ok: true,
        state: state || { workspace_key: key, payload: null, revision: 0, updated_by: null, created_at: null, updated_at: null },
      });
    }

    if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return send(res, 415, { ok: false, code: 'JSON_REQUIRED' });
    }

    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      return send(res, 400, { ok: false, code: 'INVALID_PAYLOAD' });
    }

    if (bodySize(body) > MAX_BODY_BYTES) return send(res, 413, { ok: false, code: 'PAYLOAD_TOO_LARGE' });

    const key = String(body?.key || '').trim();
    if (!validKey(key)) return send(res, 400, { ok: false, code: 'INVALID_WORKSPACE_KEY' });

    if (req.method === 'PUT') {
      const expectedRevision = Number(body?.expectedRevision);
      const payload = body?.payload;
      if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
        return send(res, 400, { ok: false, code: 'INVALID_REVISION' });
      }
      if (!isObject(payload) || !safeTree(payload)) {
        return send(res, 400, { ok: false, code: 'INVALID_CONTROL_PLANE_PAYLOAD' });
      }

      try {
        const state = await saveState({
          supabaseAdmin: auth.supabaseAdmin,
          key,
          expectedRevision,
          payload,
          actorUserId: auth.user.id,
          action: 'save',
        });
        await writeAudit(auth.supabaseAdmin, auth.user.id, 'developer_control_plane.save', key, { revision: state.revision });
        return send(res, 200, { ok: true, state });
      } catch (error) {
        if (error?.code === 'REVISION_CONFLICT') {
          return send(res, 409, { ok: false, code: 'REVISION_CONFLICT' });
        }
        throw error;
      }
    }

    const action = String(body?.action || '').trim().toLowerCase();
    if (action !== 'rollback') return send(res, 400, { ok: false, code: 'INVALID_ACTION' });

    const expectedRevision = Number(body?.expectedRevision);
    const historyId = String(body?.historyId || '').trim();
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1 || !historyId) {
      return send(res, 400, { ok: false, code: 'INVALID_ROLLBACK_REQUEST' });
    }

    const { data: historyEntry, error: historyError } = await auth.supabaseAdmin
      .from('developer_control_plane_history')
      .select('id,workspace_key,payload,revision')
      .eq('id', historyId)
      .eq('workspace_key', key)
      .maybeSingle();
    if (historyError) throw historyError;
    if (!historyEntry) return send(res, 404, { ok: false, code: 'HISTORY_NOT_FOUND' });

    try {
      const state = await saveState({
        supabaseAdmin: auth.supabaseAdmin,
        key,
        expectedRevision,
        payload: historyEntry.payload,
        actorUserId: auth.user.id,
        action: 'rollback',
      });
      await writeAudit(auth.supabaseAdmin, auth.user.id, 'developer_control_plane.rollback', key, {
        revision: state.revision,
        sourceRevision: historyEntry.revision,
      });
      return send(res, 200, { ok: true, state });
    } catch (error) {
      if (error?.code === 'REVISION_CONFLICT') {
        return send(res, 409, { ok: false, code: 'REVISION_CONFLICT' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Developer control-plane API failed:', error?.message);
    return send(res, 500, { ok: false, code: 'DEVELOPER_CONTROL_PLANE_FAILED' });
  }
}
