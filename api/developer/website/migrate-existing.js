import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../../server/auth/requireDeveloperSession.js';
import { getDefaultPageContent } from '../../../server/website/defaultPageContent.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const auth = await requireDeveloperSession(req);
  if (!auth.ok) {
    if (auth.clearCookie) clearDeveloperSessionCookie(res);
    return res.status(auth.status || 401).json({ ok: false, code: auth.code || 'UNAUTHORIZED' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ ok: false, code: 'INVALID_PAYLOAD' });
  }

  const pageId = typeof body.pageId === 'string' ? body.pageId.trim() : '';
  if (!UUID.test(pageId)) {
    return res.status(400).json({ ok: false, code: 'INVALID_PAGE_ID' });
  }

  try {
    const { data: page, error: pageError } = await auth.supabaseAdmin
      .from('website_pages')
      .select('id,page_key,is_system')
      .eq('id', pageId)
      .maybeSingle();

    if (pageError) throw pageError;
    if (!page) return res.status(404).json({ ok: false, code: 'PAGE_NOT_FOUND' });
    if (!page.is_system) return res.status(400).json({ ok: false, code: 'NOT_SYSTEM_PAGE' });

    const defaultContent = getDefaultPageContent(page.page_key);
    if (!defaultContent) {
      return res.status(404).json({ ok: false, code: 'DEFAULT_CONTENT_NOT_FOUND' });
    }

    const { data: ensured, error: ensureError } = await auth.supabaseAdmin.rpc(
      'ensure_website_page_draft',
      { p_page_id: pageId, p_actor_user_id: auth.user.id }
    );

    if (ensureError) throw ensureError;
    const ensureResult = Array.isArray(ensured) ? ensured[0] : ensured;
    const draft = ensureResult?.draft;

    if (!ensureResult?.ok || !draft?.id) {
      throw new Error('INVALID_DRAFT_RESPONSE');
    }

    if (Array.isArray(draft.content?.sections) && draft.content.sections.length > 0) {
      return res.status(200).json({ ok: true, draft, migrated: false });
    }

    const { data: saved, error: saveError } = await auth.supabaseAdmin.rpc(
      'save_website_page_draft',
      {
        p_page_id: pageId,
        p_actor_user_id: auth.user.id,
        p_content: defaultContent,
        p_expected_revision: draft.revision,
      }
    );

    if (saveError) throw saveError;
    const saveResult = Array.isArray(saved) ? saved[0] : saved;
    if (!saveResult?.ok || !saveResult?.draft?.id) {
      throw new Error('INVALID_SAVE_RESPONSE');
    }

    return res.status(200).json({ ok: true, draft: saveResult.draft, migrated: true });
  } catch (error) {
    console.error('Website system-page migration failed:', error?.message || error);
    return res.status(500).json({ ok: false, code: 'SYSTEM_PAGE_MIGRATION_FAILED' });
  }
}
