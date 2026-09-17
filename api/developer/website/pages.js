import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../../server/auth/requireDeveloperSession.js';

const PAGE_COLUMNS =
  'id,page_key,name,path,page_type,status,is_system,is_homepage,show_in_navigation,sort_order,current_draft_version_id,published_version_id,created_at,updated_at';

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);

  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');

    return res.status(405).json({
      ok: false,
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  const auth = await requireDeveloperSession(req);

  if (!auth.ok) {
    if (auth.clearCookie) {
      clearDeveloperSessionCookie(res);
    }

    return res.status(auth.status || 401).json({
      ok: false,
      code: auth.code || 'UNAUTHORIZED',
    });
  }

  try {
    if (req.method === 'POST') {
      const contentType = String(
        req.headers['content-type'] || ''
      )
        .split(';')[0]
        .trim()
        .toLowerCase();

      if (contentType !== 'application/json') {
        return res.status(415).json({
          ok: false,
          code: 'JSON_REQUIRED',
        });
      }

      let body;

      try {
        body =
          typeof req.body === 'string'
            ? JSON.parse(req.body)
            : req.body;
      } catch {
        return res.status(400).json({
          ok: false,
          code: 'INVALID_PAYLOAD',
        });
      }

      const name =
        typeof body?.name === 'string'
          ? body.name.trim()
          : '';

      const rawPath =
        typeof body?.path === 'string'
          ? body.path.trim()
          : '';

      if (!name) {
        return res.status(400).json({
          ok: false,
          code: 'NAME_REQUIRED',
        });
      }

      if (!rawPath) {
        return res.status(400).json({
          ok: false,
          code: 'PATH_REQUIRED',
        });
      }

      if (!rawPath.startsWith('/')) {
        return res.status(400).json({
          ok: false,
          code: 'INVALID_PATH',
        });
      }

      const path =
        rawPath
          .replace(/\/{2,}/g, '/')
          .replace(/\/$/, '') || '/';

      if (path === '/') {
        return res.status(409).json({
          ok: false,
          code: 'DUPLICATE_PATH',
        });
      }

      /*
        The service-role-only RPC owns:

        - validation
        - page_key generation
        - path uniqueness
        - sort ordering
        - page creation
        - version 1 draft creation
        - current_draft_version_id linking

        Never trust or forward client-supplied:
        actor IDs, status, flags or version fields.
      */

      const { data, error } =
        await auth.supabaseAdmin.rpc(
          'create_website_page',
          {
            p_name: name,
            p_path: path,
            p_actor_user_id: auth.user.id,
          }
        );

      if (error) {
        const message =
          String(error.message || '').toLowerCase();

        const duplicatePath =
          (error.code === '23505' &&
            /path/.test(message)) ||
          /(?:path|url).*(?:already exists|duplicate)|(?:already exists|duplicate).*(?:path|url)/.test(
            message
          );

        if (duplicatePath) {
          return res.status(409).json({
            ok: false,
            code: 'DUPLICATE_PATH',
          });
        }

        if (
          ['22023', '23514', 'P0001'].includes(
            error.code
          )
        ) {
          return res.status(400).json({
            ok: false,
            code: 'INVALID_PAGE',
          });
        }

        throw error;
      }

      const rpcResult =
        Array.isArray(data) ? data[0] : data;

      if (
        !rpcResult?.ok ||
        !rpcResult?.page?.id
      ) {
        throw new Error(
          'INVALID_RPC_RESPONSE'
        );
      }

      return res.status(201).json({
        ok: true,
        page: rpcResult.page,
      });
    }

    // =========================================================
    // GET WEBSITE PAGES
    // =========================================================

    const { data, error } =
      await auth.supabaseAdmin
        .from('website_pages')
        .select(PAGE_COLUMNS)
        .order('sort_order', {
          ascending: true,
        })
        .order('created_at', {
          ascending: true,
        });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      ok: true,
      pages: data || [],
    });
  } catch (error) {
    console.error(
      'Developer website pages API failed:',
      error?.message
    );

    return res.status(500).json({
      ok: false,
      code:
        req.method === 'POST'
          ? 'WEBSITE_PAGE_CREATE_FAILED'
          : 'WEBSITE_PAGES_FAILED',
    });
  }
}