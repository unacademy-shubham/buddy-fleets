import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../../server/auth/requireDeveloperSession.js';

const PAGE_COLUMNS = 'id,page_key,name,path,page_type,status,is_system,is_homepage,show_in_navigation,sort_order,created_at,updated_at';

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }
  const auth = await requireDeveloperSession(req);
  if (!auth.ok) {
    if (auth.clearCookie) clearDeveloperSessionCookie(res);
    return res.status(auth.status || 401).json({ ok: false, code: auth.code || 'UNAUTHORIZED' });
  }
  try {
    if (req.method === 'POST') {
      if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        return res.status(415).json({ ok: false, code: 'JSON_REQUIRED' });
      }
      let body;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        return res.status(400).json({ ok: false, code: 'INVALID_PAYLOAD' });
      }
      const name = typeof body?.name === 'string' ? body.name.trim() : '';
      const rawPath = typeof body?.path === 'string' ? body.path.trim() : '';
      if (!name) return res.status(400).json({ ok: false, code: 'NAME_REQUIRED' });
      if (!rawPath) return res.status(400).json({ ok: false, code: 'PATH_REQUIRED' });
      if (!rawPath.startsWith('/')) return res.status(400).json({ ok: false, code: 'INVALID_PATH' });
      const path = rawPath.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
      if (path === '/') return res.status(409).json({ ok: false, code: 'DUPLICATE_PATH' });

      // The service-role-only RPC owns validation, uniqueness, ordering and the
      // atomic page + version-1 draft + current_draft_version_id transaction.
      // Never forward client-supplied actor IDs, flags, status or version fields.
      const { data, error } = await auth.supabaseAdmin.rpc('create_website_page', {
        p_name: name,
        p_path: path,
        p_actor_user_id: auth.user.id,
      });
      if (error) {
        const message = String(error.message || '').toLowerCase();
        if ((error.code === '23505' && /path/.test(message)) ||
            /(?:path|url).*(?:already exists|duplicate)|(?:already exists|duplicate).*(?:path|url)/.test(message)) {
          return res.status(409).json({ ok: false, code: 'DUPLICATE_PATH' });
        }
        if (['22023', '23514', 'P0001'].includes(error.code)) {
          return res.status(400).json({ ok: false, code: 'INVALID_PAGE' });
        }
        throw error;
      }
      const page = Array.isArray(data) ? data[0] : data;
      if (!page?.id) throw new Error('INVALID_RPC_RESPONSE');
      return res.status(201).json({ ok: true, page });
    }
    const { data, error } = await auth.supabaseAdmin
      .from('website_pages')
      .select(PAGE_COLUMNS)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return res.status(200).json({ ok: true, pages: data || [] });
  } catch {
    return res.status(500).json({ ok: false, code: req.method === 'POST' ? 'WEBSITE_PAGE_CREATE_FAILED' : 'WEBSITE_PAGES_FAILED' });
  }
}
