import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../../server/auth/requireDeveloperSession.js';

import {
  getDefaultPageContent,
} from '../../../server/website/defaultPageContent.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function unwrapRpc(data) {
  return Array.isArray(data) ? data[0] : data;
}

function safeErrorCode(error) {
  const message = String(error?.message || '');

  if (/PAGE_NOT_FOUND/.test(message)) return 'PAGE_NOT_FOUND';
  if (/DRAFT_CONFLICT/.test(message)) return 'DRAFT_CONFLICT';
  if (/DRAFT_NOT_(?:INITIALIZED|FOUND)/.test(message)) return 'DRAFT_NOT_READY';

  return null;
}

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const auth = await requireDeveloperSession(req);

  if (!auth.ok) {
    if (auth.clearCookie) clearDeveloperSessionCookie(res);
    return res.status(auth.status || 401).json({
      ok: false,
      code: auth.code || 'UNAUTHORIZED',
    });
  }

  if (String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
    return res.status(415).json({ ok: false, code: 'JSON_REQUIRED' });
  }

  let body;

  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, code: 'INVALID_PAYLOAD' });
  }

  const pageId = typeof body?.pageId === 'string' ? body.pageId.trim() : '';

  if (!UUID.test(pageId)) {
    return res.status(400).json({ ok: false, code: 'INVALID_PAGE_ID' });
  }

  try {
    const { data: page, error: pageError } = await auth.supabaseAdmin
      .from('website_pages')
      .select('id,page_key,is_system,current_draft_version_id')
      .eq('id', pageId)
      .maybeSingle();

    if (pageError) throw pageError;

    if (!page) {
      return res.status(404).json({ ok: false, code: 'PAGE_NOT_FOUND' });
    }

    if (!page.is_system) {
      return res.status(409).json({ ok: false, code: 'SYSTEM_PAGE_REQUIRED' });
    }

    const content = getDefaultPageContent(page.page_key);

    if (!content) {
      return res.status(404).json({ ok: false, code: 'NO_DEFAULT_CONTENT' });
    }

    const { data: ensureData, error: ensureError } = await auth.supabaseAdmin.rpc(
      'ensure_website_page_draft',
      {
        p_page_id: pageId,
        p_actor_user_id: auth.user.id,
      }
    );

    if (ensureError) throw ensureError;

    const ensured = unwrapRpc(ensureData);
    const currentDraft = ensured?.draft;

    if (!ensured?.ok || !currentDraft?.id || currentDraft.page_id !== pageId) {
      throw new Error('INVALID_DRAFT_RESPONSE');
    }

    const currentSections = Array.isArray(currentDraft.content?.sections)
      ? currentDraft.content.sections
      : [];

    if (currentSections.length > 0) {
      return res.status(200).json({
        ok: true,
        migrated: false,
        draft: currentDraft,
      });
    }

    const { data: saveData, error: saveError } = await auth.supabaseAdmin.rpc(
      'save_website_page_draft',
      {
        p_page_id: pageId,
        p_content: content,
        p_expected_revision: currentDraft.revision,
        p_actor_user_id: auth.user.id,
      }
    );

    if (saveError) {
      const code = safeErrorCode(saveError);

      if (code === 'DRAFT_CONFLICT') {
        return res.status(409).json({ ok: false, code });
      }

      if (code === 'PAGE_NOT_FOUND') {
        return res.status(404).json({ ok: false, code });
      }

      throw saveError;
    }

    const saved = unwrapRpc(saveData);

    if (!saved?.ok || !saved?.draft?.id) {
      throw new Error('INVALID_SAVE_RESPONSE');
    }

    return res.status(200).json({
      ok: true,
      migrated: true,
      draft: saved.draft,
    });
  } catch (error) {
    console.error('Existing website CMS migration failed:', error?.message);

    return res.status(500).json({
      ok: false,
      code: 'EXISTING_CONTENT_MIGRATION_FAILED',
    });
  }
}
