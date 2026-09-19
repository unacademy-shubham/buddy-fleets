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

  if (!['GET', 'PUT'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const saving = req.method === 'PUT';

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

    if (saving) {
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

    const pageId = saving ? body?.pageId : req.query?.pageId;

    if (typeof pageId !== 'string' || !UUID.test(pageId)) {
      return res.status(400).json({ ok: false, code: 'INVALID_PAGE_ID' });
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
    console.error('Developer website draft API failed:', error?.message);
    return failure(res, null, saving);
  }
}
