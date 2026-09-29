import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function normalizePath(value) {
  const input = String(value || '/').trim();
  if (!input.startsWith('/') || input.startsWith('//')) return null;
  const normalized = input.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return normalized || '/';
}

function send(res, status, payload, cache = true) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Cache-Control',
    cache ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' : 'no-store'
  );
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' }, false);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return send(res, 503, { ok: false, code: 'WEBSITE_CONTENT_UNAVAILABLE' }, false);
  }

  const path = normalizePath(req.query?.path);
  if (!path) return send(res, 400, { ok: false, code: 'INVALID_PATH' }, false);

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  try {
    const { data: page, error: pageError } = await db
      .from('website_pages')
      .select('id,page_key,name,path,page_type,status,is_system,is_homepage,show_in_navigation,sort_order,published_version_id,updated_at')
      .eq('path', path)
      .eq('status', 'published')
      .maybeSingle();

    if (pageError) throw pageError;
    if (!page || !page.published_version_id) {
      return send(res, 404, { ok: false, code: 'PUBLISHED_PAGE_NOT_FOUND' });
    }

    const { data: version, error: versionError } = await db
      .from('website_page_versions')
      .select('id,page_id,version_number,schema_version,content,published_at,updated_at')
      .eq('id', page.published_version_id)
      .eq('page_id', page.id)
      .maybeSingle();

    if (versionError) throw versionError;
    if (!version?.content || version.schema_version !== 1) {
      return send(res, 404, { ok: false, code: 'PUBLISHED_VERSION_NOT_FOUND' });
    }

    return send(res, 200, {
      ok: true,
      page,
      version: {
        id: version.id,
        versionNumber: version.version_number,
        publishedAt: version.published_at,
        updatedAt: version.updated_at,
      },
      content: version.content,
    });
  } catch (error) {
    console.error('Public website page failed:', error?.message || error);
    return send(res, 503, { ok: false, code: 'WEBSITE_CONTENT_UNAVAILABLE' }, false);
  }
}
