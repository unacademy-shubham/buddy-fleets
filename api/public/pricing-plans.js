import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return send(res, 503, { ok: false, code: 'PRICING_SERVICE_UNAVAILABLE' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('developer_plans')
      .select('plan_key,name,tagline,badge,currency,display_order,prices,limits,entitlements')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return send(res, 200, {
      ok: true,
      plans: data || [],
    });
  } catch (error) {
    console.error('Public pricing plans failed:', error?.message);
    return send(res, 503, { ok: false, code: 'PRICING_SERVICE_UNAVAILABLE' });
  }
}
