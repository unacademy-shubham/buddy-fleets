import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../../server/auth/requireDeveloperSession.js';

const MAX_BYTES = 256 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const positiveInteger = (value) => Number.isInteger(value) && value > 0 && value <= 2147483647;
const plainText = (value) => typeof value === 'string' && value.length <= 20000 && !/<\/?[a-z!][^>]*>/i.test(value);

const fields = {
  hero: ['eyebrow', 'heading', 'subheading', 'description', 'primaryCta', 'secondaryCta', 'imageUrl', 'imageAlt', 'trustItems'],
  'rich-text': ['eyebrow', 'heading', 'body'],
  'feature-grid': ['eyebrow', 'heading', 'description', 'items'],
  'image-text': ['eyebrow', 'heading', 'description', 'imageUrl', 'imageAlt', 'imagePosition'],
  highlights: ['eyebrow', 'heading', 'description', 'items'],
  stats: ['eyebrow', 'heading', 'items'],
  workflow: ['eyebrow', 'heading', 'description', 'items'],
  benefits: ['eyebrow', 'heading', 'description', 'items'],
  pricing: ['eyebrow', 'heading', 'description', 'items'],
  faq: ['eyebrow', 'heading', 'items'],
  cta: ['eyebrow', 'heading', 'description', 'primaryCta', 'secondaryCta'],
  contact: ['eyebrow', 'heading', 'description', 'formTitle', 'formDescription'],
};

const itemFields = {
  'feature-grid': ['id', 'number', 'title', 'description', 'icon', 'category', 'accent', 'imageUrl', 'imageAlt'],
  highlights: ['id', 'number', 'title', 'description', 'icon'],
  stats: ['id', 'value', 'label'],
  workflow: ['id', 'step', 'title', 'description', 'icon'],
  benefits: ['id', 'number', 'title', 'description', 'icon'],
  pricing: ['id', 'name', 'tagline', 'fleet', 'users', 'sites', 'badge', 'price1', 'price3', 'price6', 'price12', 'features'],
  faq: ['id', 'question', 'answer'],
};

function safeTree(value, depth = 0) {
  if (depth > 20) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value !== 'object') return false;

  return Object.entries(value).every(([key, child]) =>
    !['__proto__', 'constructor', 'prototype'].includes(key) && safeTree(child, depth + 1));
}

function safeUrl(value, image = false) {
  if (!plainText(value)) return false;
  if (!value) return true;
  if (/\s/.test(value) || [...value].some((char) => char.charCodeAt(0) < 32)) return false;

  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (!image && value.startsWith('#')) return true;

  try {
    const url = new URL(value);
    return (image ? ['https:', 'http:'] : ['https:', 'http:', 'mailto:', 'tel:']).includes(url.protocol);
  } catch {
    return false;
  }
}

function validLineList(value, max = 100) {
  return Array.isArray(value) && value.length <= max && value.every(plainText);
}

function validData(type, data) {
  if (!isObject(data)) return false;

  return Object.entries(data).every(([key, value]) => {
    if (!fields[type]?.includes(key)) return false;

    if (key === 'items') {
      if (!Array.isArray(value) || value.length > 100) return false;
      const ids = new Set();

      return value.every((entry) => {
        if (!isObject(entry) || !plainText(entry.id) || !entry.id.trim() || ids.has(entry.id)) return false;
        ids.add(entry.id);

        return Object.entries(entry).every(([field, fieldValue]) => {
          if (!itemFields[type]?.includes(field)) return false;
          if (field === 'features') return validLineList(fieldValue);
          if (field === 'imageUrl') return safeUrl(fieldValue, true);
          return plainText(fieldValue);
        });
      });
    }

    if (key === 'trustItems') return validLineList(value, 30);

    if (key === 'primaryCta' || key === 'secondaryCta') {
      return isObject(value) &&
        Object.keys(value).every((field) => ['label', 'href'].includes(field)) &&
        plainText(value.label || '') &&
        safeUrl(value.href || '');
    }

    if (key === 'imageUrl') return safeUrl(value, true);
    if (key === 'imagePosition') return ['left', 'right'].includes(value);

    return plainText(value);
  });
}

function validContent(content) {
  if (
    !isObject(content) ||
    !safeTree(content) ||
    content.schemaVersion !== 1 ||
    Object.keys(content).some((key) => !['schemaVersion', 'sections'].includes(key)) ||
    !Array.isArray(content.sections) ||
    content.sections.length > 100
  ) {
    return false;
  }

  const ids = new Set();

  return content.sections.every((section) => {
    if (
      !isObject(section) ||
      !plainText(section.id) ||
      !section.id.trim() ||
      section.id.length > 200 ||
      ids.has(section.id) ||
      typeof section.type !== 'string' ||
      !Object.hasOwn(fields, section.type) ||
      typeof section.enabled !== 'boolean' ||
      !Number.isSafeInteger(section.order) ||
      !(section.variant === null || (plainText(section.variant) && section.variant.length <= 100)) ||
      Object.keys(section).some((key) => !['id', 'type', 'enabled', 'order', 'variant', 'data'].includes(key))
    ) {
      return false;
    }

    ids.add(section.id);
    return validData(section.type, section.data);
  });
}

function failure(res, error, saving) {
  const known = ['PAGE_NOT_FOUND', 'DRAFT_CONFLICT', 'DRAFT_NOT_INITIALIZED', 'DRAFT_NOT_FOUND'];
  const message = String(error?.message || '');
  const code = known.find((candidate) => error?.code === candidate || message.includes(candidate));

  if (code === 'PAGE_NOT_FOUND') return res.status(404).json({ ok: false, code });
  if (saving && code) return res.status(409).json({ ok: false, code });

  if (
    saving &&
    (
      ['22023', '23514'].includes(error?.code) ||
      /^INVALID_[A-Z_]+$/.test(String(error?.code || '')) ||
      /\bINVALID_[A-Z_]+\b/.test(message)
    )
  ) {
    return res.status(400).json({ ok: false, code: 'INVALID_DRAFT' });
  }

  return res.status(500).json({
    ok: false,
    code: saving ? 'DRAFT_SAVE_FAILED' : 'DRAFT_LOAD_FAILED',
  });
}

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);

  if (!['GET', 'PUT', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT, POST');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const saving = req.method === 'PUT';
  const releasing = req.method === 'POST';

  try {
    const auth = await requireDeveloperSession(req);

    if (!auth.ok) {
      if (auth.clearCookie) clearDeveloperSessionCookie(res);
      return res.status(auth.status || 401).json({
        ok: false,
        code: auth.code || 'UNAUTHORIZED',
      });
    }

    let body;

    if (saving || releasing) {
      if (String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
        return res.status(415).json({ ok: false, code: 'JSON_REQUIRED' });
      }

      try {
        const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        if (!raw || Buffer.byteLength(raw, 'utf8') > MAX_BYTES) {
          return res.status(400).json({ ok: false, code: 'INVALID_DRAFT_SIZE' });
        }

        body = JSON.parse(raw);
      } catch {
        return res.status(400).json({ ok: false, code: 'INVALID_PAYLOAD' });
      }
    }

    const pageId = (saving || releasing) ? body?.pageId : req.query?.pageId;

    if (typeof pageId !== 'string' || !UUID.test(pageId)) {
      return res.status(400).json({ ok: false, code: 'INVALID_PAGE_ID' });
    }

    /* =======================================================
       RELEASE HISTORY
    ======================================================= */
    if (req.method === 'GET' && String(req.query?.mode || '') === 'history') {
      const { data: versions, error: versionsError } = await auth.supabaseAdmin
        .from('website_page_versions')
        .select('id,page_id,version_number,state,schema_version,revision,actor_user_id,created_at,updated_at,published_at')
        .eq('page_id', pageId)
        .order('version_number', { ascending: false })
        .limit(50);

      if (versionsError) throw versionsError;

      const { data: releases, error: releasesError } = await auth.supabaseAdmin
        .from('website_releases')
        .select('id,page_id,version_id,action,actor_user_id,notes,created_at')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (releasesError) throw releasesError;

      return res.status(200).json({ ok: true, versions: versions || [], releases: releases || [] });
    }

    /* =======================================================
       PUBLISH / ROLLBACK
    ======================================================= */
    if (releasing) {
      const action = String(body?.action || '').trim().toLowerCase();

      if (!['publish', 'rollback'].includes(action)) {
        return res.status(400).json({ ok: false, code: 'INVALID_RELEASE_ACTION' });
      }

      if (action === 'publish') {
        const expectedRevision = Number(body?.revision);
        if (!positiveInteger(expectedRevision)) {
          return res.status(400).json({ ok: false, code: 'INVALID_REVISION' });
        }

        const { data, error } = await auth.supabaseAdmin.rpc('publish_website_page', {
          p_page_id: pageId,
          p_actor_user_id: auth.user.id,
          p_expected_revision: expectedRevision,
        });

        if (error) {
          const message = String(error.message || '');
          if (/REVISION_CONFLICT/i.test(message)) return res.status(409).json({ ok: false, code: 'REVISION_CONFLICT' });
          if (/PAGE_NOT_FOUND|DRAFT_NOT_FOUND/i.test(message)) return res.status(404).json({ ok: false, code: 'DRAFT_NOT_FOUND' });
          throw error;
        }

        const result = Array.isArray(data) ? data[0] : data;
        return res.status(200).json({ ok: true, release: result || {} });
      }

      const versionId = typeof body?.versionId === 'string' ? body.versionId : '';
      if (!UUID.test(versionId)) {
        return res.status(400).json({ ok: false, code: 'INVALID_VERSION_ID' });
      }

      const { data, error } = await auth.supabaseAdmin.rpc('rollback_website_page', {
        p_page_id: pageId,
        p_version_id: versionId,
        p_actor_user_id: auth.user.id,
      });

      if (error) {
        const message = String(error.message || '');
        if (/PAGE_NOT_FOUND|VERSION_NOT_FOUND/i.test(message)) return res.status(404).json({ ok: false, code: 'VERSION_NOT_FOUND' });
        throw error;
      }

      const result = Array.isArray(data) ? data[0] : data;
      return res.status(200).json({ ok: true, release: result || {} });
    }

    if (saving && (!safeTree(body) || !positiveInteger(body.revision) || !validContent(body.content))) {
      return res.status(400).json({ ok: false, code: 'INVALID_DRAFT' });
    }

    const { data, error } = await auth.supabaseAdmin.rpc(
      saving ? 'save_website_page_draft' : 'ensure_website_page_draft',
      {
        p_page_id: pageId,
        p_actor_user_id: auth.user.id,
        ...(saving
          ? {
              p_content: body.content,
              p_expected_revision: body.revision,
            }
          : {}),
      }
    );

    if (error) return failure(res, error, saving);

    const result = Array.isArray(data) ? data[0] : data;

    if (!result?.ok) return failure(res, result, saving);

    const draft = result.draft;

    if (
      !draft?.id ||
      draft.page_id !== pageId ||
      draft.state !== 'draft' ||
      draft.schema_version !== 1 ||
      !positiveInteger(draft.revision) ||
      !validContent(draft.content)
    ) {
      return failure(res, null, saving);
    }

    return res.status(200).json({ ok: true, draft });
  } catch (error) {
    console.error('Developer website draft API failed:', error?.message || error);
    return res.status(500).json({ ok: false, code: releasing ? 'WEBSITE_RELEASE_FAILED' : (saving ? 'DRAFT_SAVE_FAILED' : 'DRAFT_LOAD_FAILED') });
  }
}
