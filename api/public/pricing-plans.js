import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PERIODS = [1, 3, 6, 12];

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(payload);
}

function normalizePrices(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const prices = {};
  const priceOptions = [];

  for (const months of PERIODS) {
    const raw = source[String(months)];
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < 0) continue;
    prices[String(months)] = amount;
    priceOptions.push({ months, amount });
  }

  return { prices, priceOptions };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return send(res, 503, { ok: false, code: 'PRICING_SERVICE_UNAVAILABLE' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  try {
    const { data, error } = await supabaseAdmin
      .from('developer_plans')
      .select('plan_key,name,tagline,badge,currency,display_order,prices,limits,entitlements,revision,updated_at')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (error) throw error;

    const plans = (data || []).map((plan) => {
      const normalized = normalizePrices(plan.prices);
      return {
        ...plan,
        prices: normalized.prices,
        priceOptions: normalized.priceOptions,
      };
    });

    return send(res, 200, {
      ok: true,
      billingPeriods: PERIODS,
      plans,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Public pricing plans failed:', error?.message || error);
    return send(res, 503, { ok: false, code: 'PRICING_SERVICE_UNAVAILABLE' });
  }
}
