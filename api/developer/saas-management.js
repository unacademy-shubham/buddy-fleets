import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../server/auth/requireDeveloperSession.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PLAN_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COMPANY_STATUSES = new Set([
  'pending_confirmation',
  'trial_active',
  'trial_expired',
  'active',
  'suspended',
]);
const PLAN_STATUSES = new Set(['active', 'inactive', 'archived']);
const EXPIRY_BEHAVIORS = new Set(['mark_expired', 'suspend_company', 'manual_review']);
const POST_EXPIRY_ACCESS = new Set(['restricted', 'read_only', 'blocked']);

function send(res, status, payload) {
  setDeveloperApiHeaders(res);
  return res.status(status).json(payload);
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value, max = 5000) {
  const result = typeof value === 'string' ? value.trim() : '';
  return result.slice(0, max);
}

function validUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function validDateOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const time = Date.parse(String(value));
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
}

function numberOrNull(value, min = 0, max = 1000000) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return undefined;
  return number;
}

function integer(value, fallback, min = 0, max = 1000000) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return fallback;
  return number;
}

function normalizeStringArray(value, maxItems = 200) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => text(item, 300)).filter(Boolean))].slice(0, maxItems);
}

function normalizeReminderDays(value) {
  if (!Array.isArray(value)) return null;
  const days = [...new Set(value.map(Number).filter((item) => Number.isInteger(item) && item >= 0 && item <= 365))]
    .sort((a, b) => b - a)
    .slice(0, 30);
  return days.length ? days : null;
}

function normalizeLimits(value) {
  const source = isObject(value) ? value : {};
  const vehiclesMin = numberOrNull(source.vehicles_min, 0, 1000000);
  const vehiclesMax = numberOrNull(source.vehicles_max, 0, 1000000);
  const users = numberOrNull(source.users, 0, 1000000);
  const sites = numberOrNull(source.sites, 0, 1000000);
  if ([vehiclesMin, vehiclesMax, users, sites].some((item) => item === undefined)) return null;
  if (vehiclesMin !== null && vehiclesMax !== null && vehiclesMax < vehiclesMin) return null;
  return {
    vehicles_min: vehiclesMin,
    vehicles_max: vehiclesMax,
    users,
    sites,
  };
}

function normalizePrices(value) {
  const source = isObject(value) ? value : {};
  const result = {};
  for (const duration of ['1', '3', '6', '12']) {
    const price = numberOrNull(source[duration], 0, 1000000000);
    if (price === undefined) return null;
    if (price !== null) result[duration] = price;
  }
  return result;
}

async function writeHistory(supabaseAdmin, actorUserId, domain, entityId, action, beforePayload, afterPayload) {
  try {
    await supabaseAdmin.from('developer_saas_history').insert({
      domain,
      entity_id: String(entityId),
      action,
      before_payload: beforePayload ?? null,
      after_payload: afterPayload ?? null,
      actor_user_id: actorUserId || null,
    });
  } catch (error) {
    console.error('Developer SaaS history write failed:', error?.message);
  }

  try {
    await supabaseAdmin.from('audit_logs').insert({
      actor_user_id: actorUserId || null,
      action: `developer_saas.${domain}.${action}`,
      entity_type: domain,
      entity_id: String(entityId),
      details: { before: beforePayload ?? null, after: afterPayload ?? null },
    });
  } catch {
    // Existing audit schema can differ. Domain action must not fail because of best-effort audit logging.
  }
}

async function getCompanies(supabaseAdmin) {
  const { data: companies, error: companiesError } = await supabaseAdmin
    .from('companies')
    .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
    .order('company_name', { ascending: true })
    .limit(500);

  if (companiesError) throw companiesError;

  const ids = (companies || []).map((company) => company.id).filter(Boolean);
  let subscriptions = [];
  let overrides = [];

  if (ids.length) {
    const [subscriptionResult, overrideResult] = await Promise.all([
      supabaseAdmin
        .from('subscriptions')
        .select('company_id,status,plan_id,trial_start_at,trial_end_at,subscription_start_at,subscription_end_at')
        .in('company_id', ids),
      supabaseAdmin
        .from('developer_company_overrides')
        .select('id,company_id,enabled,plan_key,limits_override,entitlements_override,notes,revision,updated_at')
        .in('company_id', ids),
    ]);

    if (subscriptionResult.error) throw subscriptionResult.error;
    if (overrideResult.error) throw overrideResult.error;
    subscriptions = subscriptionResult.data || [];
    overrides = overrideResult.data || [];
  }

  const subscriptionByCompany = new Map(subscriptions.map((item) => [item.company_id, item]));
  const overrideByCompany = new Map(overrides.map((item) => [item.company_id, item]));

  return (companies || []).map((company) => ({
    ...company,
    subscription: subscriptionByCompany.get(company.id) || null,
    override: overrideByCompany.get(company.id) || null,
  }));
}

async function updateCompany({ supabaseAdmin, actorUserId, body }) {
  const companyId = String(body?.companyId || '').trim();
  const action = String(body?.action || '').trim();
  if (!validUuid(companyId)) return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_ID' } };

  const { data: beforeCompany, error: beforeError } = await supabaseAdmin
    .from('companies')
    .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
    .eq('id', companyId)
    .maybeSingle();
  if (beforeError) throw beforeError;
  if (!beforeCompany) return { status: 404, payload: { ok: false, code: 'COMPANY_NOT_FOUND' } };

  if (action === 'set_status') {
    const status = String(body?.status || '').trim();
    if (!COMPANY_STATUSES.has(status)) {
      return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_STATUS' } };
    }

    const { data, error } = await supabaseAdmin
      .from('companies')
      .update({ status })
      .eq('id', companyId)
      .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
      .single();
    if (error) throw error;

    await writeHistory(supabaseAdmin, actorUserId, 'company', companyId, 'set_status', beforeCompany, data);
    return { status: 200, payload: { ok: true, company: data } };
  }

  if (action === 'update_trial') {
    const trialStartAt = validDateOrNull(body?.trialStartAt);
    const trialEndAt = validDateOrNull(body?.trialEndAt);
    const status = String(body?.status || 'trial_active').trim();
    if (trialStartAt === undefined || trialEndAt === undefined || !['trial_active', 'trial_expired'].includes(status)) {
      return { status: 400, payload: { ok: false, code: 'INVALID_TRIAL_PAYLOAD' } };
    }
    if (trialStartAt && trialEndAt && Date.parse(trialEndAt) <= Date.parse(trialStartAt)) {
      return { status: 400, payload: { ok: false, code: 'INVALID_TRIAL_RANGE' } };
    }

    const { data: beforeSubscription, error: beforeSubscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('company_id,status,plan_id,trial_start_at,trial_end_at,subscription_start_at,subscription_end_at')
      .eq('company_id', companyId)
      .maybeSingle();
    if (beforeSubscriptionError) throw beforeSubscriptionError;
    if (!beforeSubscription) {
      return { status: 409, payload: { ok: false, code: 'SUBSCRIPTION_NOT_FOUND' } };
    }

    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .update({ status, trial_start_at: trialStartAt, trial_end_at: trialEndAt })
      .eq('company_id', companyId)
      .select('company_id,status,plan_id,trial_start_at,trial_end_at,subscription_start_at,subscription_end_at')
      .single();
    if (subscriptionError) throw subscriptionError;

    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .update({ status })
      .eq('id', companyId)
      .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
      .single();
    if (companyError) throw companyError;

    await writeHistory(
      supabaseAdmin,
      actorUserId,
      'trial',
      companyId,
      'update_trial',
      { company: beforeCompany, subscription: beforeSubscription },
      { company, subscription }
    );
    return { status: 200, payload: { ok: true, company, subscription } };
  }

  return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_ACTION' } };
}

async function listPlans(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('developer_plans')
    .select('id,plan_key,name,tagline,badge,status,currency,display_order,prices,limits,entitlements,revision,created_at,updated_at')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

function normalizePlanBody(body, current = null) {
  const planKey = text(body?.planKey ?? current?.plan_key, 80).toLowerCase();
  const name = text(body?.name ?? current?.name, 120);
  const tagline = text(body?.tagline ?? current?.tagline, 500);
  const badge = text(body?.badge ?? current?.badge, 80);
  const status = String(body?.status ?? current?.status ?? 'active').trim();
  const currency = text(body?.currency ?? current?.currency ?? 'INR', 10).toUpperCase();
  const displayOrder = integer(body?.displayOrder ?? current?.display_order, 0, 0, 1000000);
  const prices = normalizePrices(body?.prices ?? current?.prices ?? {});
  const limits = normalizeLimits(body?.limits ?? current?.limits ?? {});
  const entitlements = normalizeStringArray(body?.entitlements ?? current?.entitlements ?? []);

  if (!PLAN_KEY_PATTERN.test(planKey) || !name || !PLAN_STATUSES.has(status) || !/^[A-Z]{3,5}$/.test(currency) || !prices || !limits) {
    return null;
  }

  return {
    plan_key: planKey,
    name,
    tagline,
    badge,
    status,
    currency,
    display_order: displayOrder,
    prices,
    limits,
    entitlements,
  };
}

async function createPlan({ supabaseAdmin, actorUserId, body }) {
  const normalized = normalizePlanBody(body);
  if (!normalized) return { status: 400, payload: { ok: false, code: 'INVALID_PLAN' } };

  const { data, error } = await supabaseAdmin
    .from('developer_plans')
    .insert({ ...normalized, revision: 1, created_by: actorUserId, updated_by: actorUserId })
    .select('id,plan_key,name,tagline,badge,status,currency,display_order,prices,limits,entitlements,revision,created_at,updated_at')
    .single();
  if (error) {
    if (error.code === '23505') return { status: 409, payload: { ok: false, code: 'DUPLICATE_PLAN_KEY' } };
    throw error;
  }
  await writeHistory(supabaseAdmin, actorUserId, 'plan', data.id, 'create', null, data);
  return { status: 201, payload: { ok: true, plan: data } };
}

async function updatePlan({ supabaseAdmin, actorUserId, body }) {
  const planId = String(body?.planId || '').trim();
  const expectedRevision = Number(body?.expectedRevision);
  if (!validUuid(planId) || !Number.isInteger(expectedRevision) || expectedRevision < 1) {
    return { status: 400, payload: { ok: false, code: 'INVALID_PLAN_UPDATE' } };
  }

  const { data: current, error: currentError } = await supabaseAdmin
    .from('developer_plans')
    .select('id,plan_key,name,tagline,badge,status,currency,display_order,prices,limits,entitlements,revision,created_at,updated_at')
    .eq('id', planId)
    .maybeSingle();
  if (currentError) throw currentError;
  if (!current) return { status: 404, payload: { ok: false, code: 'PLAN_NOT_FOUND' } };
  if (Number(current.revision) !== expectedRevision) {
    return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };
  }

  const normalized = normalizePlanBody(body, current);
  if (!normalized) return { status: 400, payload: { ok: false, code: 'INVALID_PLAN' } };

  const { data, error } = await supabaseAdmin
    .from('developer_plans')
    .update({
      ...normalized,
      revision: expectedRevision + 1,
      updated_by: actorUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId)
    .eq('revision', expectedRevision)
    .select('id,plan_key,name,tagline,badge,status,currency,display_order,prices,limits,entitlements,revision,created_at,updated_at')
    .maybeSingle();
  if (error) {
    if (error.code === '23505') return { status: 409, payload: { ok: false, code: 'DUPLICATE_PLAN_KEY' } };
    throw error;
  }
  if (!data) return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };

  await writeHistory(supabaseAdmin, actorUserId, 'plan', planId, 'update', current, data);
  return { status: 200, payload: { ok: true, plan: data } };
}

async function archivePlan({ supabaseAdmin, actorUserId, body }) {
  const planId = String(body?.planId || '').trim();
  const expectedRevision = Number(body?.expectedRevision);
  if (!validUuid(planId) || !Number.isInteger(expectedRevision) || expectedRevision < 1) {
    return { status: 400, payload: { ok: false, code: 'INVALID_PLAN_ARCHIVE' } };
  }

  const { data: current, error: currentError } = await supabaseAdmin
    .from('developer_plans')
    .select('id,plan_key,name,status,revision')
    .eq('id', planId)
    .maybeSingle();
  if (currentError) throw currentError;
  if (!current) return { status: 404, payload: { ok: false, code: 'PLAN_NOT_FOUND' } };
  if (Number(current.revision) !== expectedRevision) return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };

  const { data, error } = await supabaseAdmin
    .from('developer_plans')
    .update({ status: 'archived', revision: expectedRevision + 1, updated_by: actorUserId, updated_at: new Date().toISOString() })
    .eq('id', planId)
    .eq('revision', expectedRevision)
    .select('id,plan_key,name,tagline,badge,status,currency,display_order,prices,limits,entitlements,revision,created_at,updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };

  await writeHistory(supabaseAdmin, actorUserId, 'plan', planId, 'archive', current, data);
  return { status: 200, payload: { ok: true, plan: data } };
}

async function listOverrides(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('developer_company_overrides')
    .select('id,company_id,enabled,plan_key,limits_override,entitlements_override,notes,revision,created_at,updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function saveOverride({ supabaseAdmin, actorUserId, body }) {
  const companyId = String(body?.companyId || '').trim();
  const expectedRevision = Number(body?.expectedRevision || 0);
  if (!validUuid(companyId) || !Number.isInteger(expectedRevision) || expectedRevision < 0) {
    return { status: 400, payload: { ok: false, code: 'INVALID_OVERRIDE_REQUEST' } };
  }

  const enabled = body?.enabled !== false;
  const rawPlanKey = text(body?.planKey, 80).toLowerCase();
  const planKey = rawPlanKey || null;
  if (planKey && !PLAN_KEY_PATTERN.test(planKey)) {
    return { status: 400, payload: { ok: false, code: 'INVALID_PLAN_KEY' } };
  }
  if (planKey) {
    const { data: plan, error: planError } = await supabaseAdmin
      .from('developer_plans')
      .select('plan_key,status')
      .eq('plan_key', planKey)
      .maybeSingle();
    if (planError) throw planError;
    if (!plan || plan.status === 'archived') return { status: 400, payload: { ok: false, code: 'PLAN_NOT_AVAILABLE' } };
  }

  const sourceLimits = isObject(body?.limitsOverride) ? body.limitsOverride : {};
  const limitsOverride = {};
  for (const key of ['vehicles_max', 'users', 'sites']) {
    if (sourceLimits[key] === null || sourceLimits[key] === undefined || sourceLimits[key] === '') continue;
    const normalized = numberOrNull(sourceLimits[key], 0, 1000000);
    if (normalized === undefined) return { status: 400, payload: { ok: false, code: 'INVALID_OVERRIDE_LIMITS' } };
    limitsOverride[key] = normalized;
  }
  const entitlementsOverride = normalizeStringArray(body?.entitlementsOverride || []);
  const notes = text(body?.notes, 5000);

  const { data: current, error: currentError } = await supabaseAdmin
    .from('developer_company_overrides')
    .select('id,company_id,enabled,plan_key,limits_override,entitlements_override,notes,revision,created_at,updated_at')
    .eq('company_id', companyId)
    .maybeSingle();
  if (currentError) throw currentError;

  if (!current) {
    if (expectedRevision !== 0) return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };
    const { data, error } = await supabaseAdmin
      .from('developer_company_overrides')
      .insert({
        company_id: companyId,
        enabled,
        plan_key: planKey,
        limits_override: limitsOverride,
        entitlements_override: entitlementsOverride,
        notes,
        revision: 1,
        created_by: actorUserId,
        updated_by: actorUserId,
      })
      .select('id,company_id,enabled,plan_key,limits_override,entitlements_override,notes,revision,created_at,updated_at')
      .single();
    if (error) throw error;
    await writeHistory(supabaseAdmin, actorUserId, 'company_override', companyId, 'create', null, data);
    return { status: 201, payload: { ok: true, override: data } };
  }

  if (Number(current.revision) !== expectedRevision) {
    return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };
  }

  const { data, error } = await supabaseAdmin
    .from('developer_company_overrides')
    .update({
      enabled,
      plan_key: planKey,
      limits_override: limitsOverride,
      entitlements_override: entitlementsOverride,
      notes,
      revision: expectedRevision + 1,
      updated_by: actorUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('company_id', companyId)
    .eq('revision', expectedRevision)
    .select('id,company_id,enabled,plan_key,limits_override,entitlements_override,notes,revision,created_at,updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };

  await writeHistory(supabaseAdmin, actorUserId, 'company_override', companyId, 'update', current, data);
  return { status: 200, payload: { ok: true, override: data } };
}

async function clearOverride({ supabaseAdmin, actorUserId, body }) {
  const companyId = String(body?.companyId || '').trim();
  const expectedRevision = Number(body?.expectedRevision || 0);
  if (!validUuid(companyId) || !Number.isInteger(expectedRevision) || expectedRevision < 1) {
    return { status: 400, payload: { ok: false, code: 'INVALID_OVERRIDE_DELETE' } };
  }

  const { data: current, error: currentError } = await supabaseAdmin
    .from('developer_company_overrides')
    .select('id,company_id,enabled,plan_key,limits_override,entitlements_override,notes,revision,created_at,updated_at')
    .eq('company_id', companyId)
    .maybeSingle();
  if (currentError) throw currentError;
  if (!current) return { status: 404, payload: { ok: false, code: 'OVERRIDE_NOT_FOUND' } };
  if (Number(current.revision) !== expectedRevision) return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };

  const { error } = await supabaseAdmin
    .from('developer_company_overrides')
    .delete()
    .eq('company_id', companyId)
    .eq('revision', expectedRevision);
  if (error) throw error;

  await writeHistory(supabaseAdmin, actorUserId, 'company_override', companyId, 'delete', current, null);
  return { status: 200, payload: { ok: true } };
}

async function getRenewalPolicy(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('developer_renewal_policy')
    .select('policy_key,grace_days,reminder_days,expiry_behavior,post_expiry_access,auto_suspend,notes,revision,created_at,updated_at')
    .eq('policy_key', 'global')
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function saveRenewalPolicy({ supabaseAdmin, actorUserId, body }) {
  const expectedRevision = Number(body?.expectedRevision);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    return { status: 400, payload: { ok: false, code: 'INVALID_POLICY_REVISION' } };
  }

  const current = await getRenewalPolicy(supabaseAdmin);
  if (!current) return { status: 404, payload: { ok: false, code: 'RENEWAL_POLICY_NOT_FOUND' } };
  if (Number(current.revision) !== expectedRevision) return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };

  const graceDays = integer(body?.graceDays, -1, 0, 365);
  const reminderDays = normalizeReminderDays(body?.reminderDays);
  const expiryBehavior = String(body?.expiryBehavior || '').trim();
  const postExpiryAccess = String(body?.postExpiryAccess || '').trim();
  const autoSuspend = Boolean(body?.autoSuspend);
  const notes = text(body?.notes, 5000);
  if (graceDays < 0 || !reminderDays || !EXPIRY_BEHAVIORS.has(expiryBehavior) || !POST_EXPIRY_ACCESS.has(postExpiryAccess)) {
    return { status: 400, payload: { ok: false, code: 'INVALID_RENEWAL_POLICY' } };
  }

  const { data, error } = await supabaseAdmin
    .from('developer_renewal_policy')
    .update({
      grace_days: graceDays,
      reminder_days: reminderDays,
      expiry_behavior: expiryBehavior,
      post_expiry_access: postExpiryAccess,
      auto_suspend: autoSuspend,
      notes,
      revision: expectedRevision + 1,
      updated_by: actorUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('policy_key', 'global')
    .eq('revision', expectedRevision)
    .select('policy_key,grace_days,reminder_days,expiry_behavior,post_expiry_access,auto_suspend,notes,revision,created_at,updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };

  await writeHistory(supabaseAdmin, actorUserId, 'renewal_policy', 'global', 'update', current, data);
  return { status: 200, payload: { ok: true, policy: data } };
}

export default async function handler(req, res) {
  setDeveloperApiHeaders(res);

  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return send(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  const auth = await requireDeveloperSession(req);
  if (!auth.ok) {
    if (auth.clearCookie) clearDeveloperSessionCookie(res);
    return send(res, auth.status || 401, { ok: false, code: auth.code || 'UNAUTHORIZED' });
  }

  try {
    const resource = String(req.method === 'GET' ? req.query?.resource : req.body?.resource || '').trim().toLowerCase();

    if (req.method === 'GET') {
      if (resource === 'companies') {
        return send(res, 200, { ok: true, companies: await getCompanies(auth.supabaseAdmin) });
      }
      if (resource === 'plans') {
        return send(res, 200, { ok: true, plans: await listPlans(auth.supabaseAdmin) });
      }
      if (resource === 'overrides') {
        const [companies, plans, overrides] = await Promise.all([
          getCompanies(auth.supabaseAdmin),
          listPlans(auth.supabaseAdmin),
          listOverrides(auth.supabaseAdmin),
        ]);
        return send(res, 200, { ok: true, companies, plans, overrides });
      }
      if (resource === 'renewal') {
        return send(res, 200, { ok: true, policy: await getRenewalPolicy(auth.supabaseAdmin) });
      }
      return send(res, 400, { ok: false, code: 'INVALID_RESOURCE' });
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

    const bodyResource = String(body?.resource || '').trim().toLowerCase();
    let result;

    if (bodyResource === 'companies' && req.method === 'PATCH') {
      result = await updateCompany({ supabaseAdmin: auth.supabaseAdmin, actorUserId: auth.user.id, body });
    } else if (bodyResource === 'plans' && req.method === 'POST') {
      result = await createPlan({ supabaseAdmin: auth.supabaseAdmin, actorUserId: auth.user.id, body });
    } else if (bodyResource === 'plans' && req.method === 'PATCH') {
      result = await updatePlan({ supabaseAdmin: auth.supabaseAdmin, actorUserId: auth.user.id, body });
    } else if (bodyResource === 'plans' && req.method === 'DELETE') {
      result = await archivePlan({ supabaseAdmin: auth.supabaseAdmin, actorUserId: auth.user.id, body });
    } else if (bodyResource === 'overrides' && ['POST', 'PATCH'].includes(req.method)) {
      result = await saveOverride({ supabaseAdmin: auth.supabaseAdmin, actorUserId: auth.user.id, body });
    } else if (bodyResource === 'overrides' && req.method === 'DELETE') {
      result = await clearOverride({ supabaseAdmin: auth.supabaseAdmin, actorUserId: auth.user.id, body });
    } else if (bodyResource === 'renewal' && req.method === 'PATCH') {
      result = await saveRenewalPolicy({ supabaseAdmin: auth.supabaseAdmin, actorUserId: auth.user.id, body });
    } else {
      return send(res, 400, { ok: false, code: 'INVALID_RESOURCE_ACTION' });
    }

    return send(res, result.status, result.payload);
  } catch (error) {
    console.error('Developer SaaS management API failed:', error?.message);
    return send(res, 500, { ok: false, code: 'DEVELOPER_SAAS_MANAGEMENT_FAILED' });
  }
}
