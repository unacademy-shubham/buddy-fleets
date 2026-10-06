import { randomBytes } from 'node:crypto';

import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../auth/requireDeveloperSession.js';

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
  for (const duration of ['1', '6', '12']) {
    const price = numberOrNull(source[duration], 0, 1000000000);
    if (price === undefined) return null;
    if (price !== null) result[duration] = price;
  }
  return result;
}


function normalizeEmail(value) {
  const email = text(value, 254).toLowerCase();
  if (!email) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function normalizeMobile(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (raw.startsWith('+')) {
    const e164 = `+${digits}`;
    return /^\+[1-9]\d{5,14}$/.test(e164) ? e164 : null;
  }
  if (/^[6-9]\d{9}$/.test(digits)) return digits;
  return /^\d{6,15}$/.test(digits) ? digits : null;
}

function normalizeGstin(value) {
  const gstin = text(value, 15).toUpperCase().replace(/\s+/g, '');
  if (!gstin) return '';
  return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin) ? gstin : null;
}

function normalizePan(value) {
  const pan = text(value, 10).toUpperCase().replace(/\s+/g, '');
  if (!pan) return '';
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(pan) ? pan : null;
}

function normalizeAadhaarLast4(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  const last4 = digits.slice(-4);
  return /^\d{4}$/.test(last4) ? last4 : null;
}

function normalizePostalCode(value, countryCode = 'IN') {
  const raw = text(value, 20);
  if (!raw) return '';
  if (String(countryCode || 'IN').toUpperCase() === 'IN') {
    const pin = raw.replace(/\D/g, '').slice(0, 6);
    return /^[1-9]\d{5}$/.test(pin) ? pin : null;
  }
  const normalized = raw.toUpperCase().replace(/\s+/g, ' ').trim();
  return /^[A-Z0-9][A-Z0-9 -]{1,19}$/.test(normalized) ? normalized : null;
}

function normalizeSlug(value) {
  return text(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}


function normalizeCin(value) {
  const cin = text(value, 21).toUpperCase().replace(/\s+/g, '');
  if (!cin) return '';
  return /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin) ? cin : null;
}


function normalizeDateOnly(value) {
  const candidate = text(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return null;
  const [year, month, day] = candidate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;
  return candidate;
}

function startOfUtcDate(value) {
  const dateOnly = normalizeDateOnly(value);
  return dateOnly ? `${dateOnly}T00:00:00.000Z` : null;
}

function endOfUtcDate(value) {
  const dateOnly = normalizeDateOnly(value);
  return dateOnly ? `${dateOnly}T23:59:59.999Z` : null;
}

function addDaysDateOnly(value, days) {
  const dateOnly = normalizeDateOnly(value);
  if (!dateOnly) return null;
  const [year, month, day] = dateOnly.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function addMonthsBillingEnd(value, months) {
  const dateOnly = normalizeDateOnly(value);
  if (!dateOnly) return null;
  const [year, month, day] = dateOnly.split('-').map(Number);
  const zeroMonth = month - 1;
  const targetIndex = zeroMonth + Number(months || 0);
  const targetYear = year + Math.floor(targetIndex / 12);
  const targetMonth = ((targetIndex % 12) + 12) % 12;
  const lastTargetDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  let end;
  if (day <= lastTargetDay) {
    end = new Date(Date.UTC(targetYear, targetMonth, day));
    end.setUTCDate(end.getUTCDate() - 1);
  } else {
    end = new Date(Date.UTC(targetYear, targetMonth, lastTargetDay));
  }
  return end.toISOString().slice(0, 10);
}

function money2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

async function findAuthUserByEmail(supabaseAdmin, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const { data: profileRows, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id,email')
    .ilike('email', normalized)
    .limit(2);
  if (profileError) throw profileError;

  const candidateId = profileRows?.[0]?.id || null;
  if (candidateId) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(candidateId);
    if (!error && data?.user?.email?.toLowerCase() === normalized) return data.user;
  }

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    const match = users.find((user) => String(user?.email || '').toLowerCase() === normalized);
    if (match) return match;
    if (users.length < 200) break;
  }
  return null;
}

function parseOwnerPhotoDataUrl(value) {
  const source = String(value || '');
  if (!source) return null;
  const match = source.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return { error: 'INVALID_OWNER_PHOTO' };
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 1048576) return { error: 'OWNER_PHOTO_TOO_LARGE' };
  const mime = match[1] === 'jpg' ? 'jpeg' : match[1];
  const extension = mime === 'jpeg' ? 'jpg' : mime;
  return { bytes, mime, extension };
}

async function sendOwnerSetPasswordLink(supabaseAdmin, companyCode, email) {
  try {
    const { data, error } = await supabaseAdmin.functions.invoke('request-password-reset', {
      body: { companyCode, email },
    });
    if (error) return { ok: false, code: 'OWNER_PASSWORD_LINK_SEND_FAILED' };
    if (data?.ok === false) return { ok: false, code: data?.code || 'OWNER_PASSWORD_LINK_SEND_FAILED' };
    return { ok: true };
  } catch {
    return { ok: false, code: 'OWNER_PASSWORD_LINK_SEND_FAILED' };
  }
}

function mapFleetCompanyType(value) {
  const source = String(value || '').trim();
  const normalized = source.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!normalized) return { companyType: 'Other', rawConstitution: source || null };
  if (normalized.includes('one person')) return { companyType: 'One Person Company (OPC)', rawConstitution: source };
  if (normalized.includes('limited liability partnership') || normalized === 'llp') return { companyType: 'Limited Liability Partnership (LLP)', rawConstitution: source };
  if (normalized.includes('private limited') || normalized.includes('private ltd')) return { companyType: 'Private Limited Company', rawConstitution: source };
  if (normalized.includes('public limited') || normalized.includes('public ltd')) return { companyType: 'Public Limited Company', rawConstitution: source };
  if (normalized.includes('partnership')) return { companyType: 'Partnership Firm', rawConstitution: source };
  if (normalized.includes('proprietor') || normalized.includes('proprietorship') || normalized.includes('sole propriet')) return { companyType: 'Proprietorship', rawConstitution: source };
  return { companyType: 'Other', rawConstitution: source };
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 7500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    return { response, payload };
  } finally {
    clearTimeout(timer);
  }
}

async function getCompanyCreateMetadata(supabaseAdmin) {
  const [plansResult, packsResult, trialPolicyResult, entitlementResult] = await Promise.all([
    supabaseAdmin
      .from('developer_plans')
      .select('id,plan_key,name,tagline,badge,status,currency,display_order,prices,limits')
      .eq('status', 'active')
      .order('display_order', { ascending: true }),
    supabaseAdmin
      .from('developer_fleet_packs')
      .select('pack_key,name,short_name,status,display_order')
      .eq('status', 'active')
      .order('display_order', { ascending: true }),
    supabaseAdmin
      .from('developer_lifecycle_access_policy')
      .select('policy_key,config')
      .eq('policy_key', 'trial')
      .maybeSingle(),
    supabaseAdmin
      .from('developer_plan_fleet_entitlements')
      .select('plan_key,pack_key,module_key,access_level'),
  ]);

  if (plansResult.error) throw plansResult.error;
  if (packsResult.error) throw packsResult.error;
  if (trialPolicyResult.error) throw trialPolicyResult.error;
  if (entitlementResult.error) throw entitlementResult.error;

  const accessSummary = {};
  for (const row of entitlementResult.data || []) {
    const key = `${row.plan_key}:${row.pack_key}`;
    if (!accessSummary[key]) accessSummary[key] = { full: 0, read_only: 0, blocked: 0, total: 0 };
    const level = String(row.access_level || '').toLowerCase();
    if (level === 'full') accessSummary[key].full += 1;
    else if (level === 'read_only') accessSummary[key].read_only += 1;
    else accessSummary[key].blocked += 1;
    accessSummary[key].total += 1;
  }

  const plans = (plansResult.data || []).map((plan) => ({
    ...plan,
    prices: {
      1: Number(plan.prices?.['1'] || 0),
      6: Number(plan.prices?.['6'] || 0),
      12: Number(plan.prices?.['12'] || 0),
    },
  }));

  const trialConfig = isObject(trialPolicyResult.data?.config) ? trialPolicyResult.data.config : {};
  return {
    plans,
    fleetPacks: packsResult.data || [],
    billingCycles: [1, 6, 12],
    trialDurations: [
      { weeks: 1, label: '1 Week' },
      { weeks: 2, label: '2 Weeks' },
      { weeks: 3, label: '3 Weeks' },
      { weeks: 4, label: '4 Weeks' },
    ],
    trialPolicy: {
      vehicleLimit: Number(trialConfig.vehicle_limit || 0) || null,
      userLimit: Number(trialConfig.employee_limit || 0) || null,
      siteLimit: Number(trialConfig.branch_limit || 0) || null,
      defaultAccess: String(trialConfig.default_access || 'full'),
    },
    accessSummary,
    gstProviderConfigured: Boolean(process.env.GSTIN_API_KEY || process.env.GSTINAPI_KEY),
  };
}

async function getCompanySlugPreview(supabaseAdmin, query = {}) {
  const requested = normalizeSlug(queryText(query.slug, 80));
  const base = requested || normalizeSlug(queryText(query.name, 180));
  if (!base || base.length < 2) {
    return { status: 400, payload: { ok: false, code: 'INVALID_SLUG_SOURCE' } };
  }

  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('subdomain_slug')
    .ilike('subdomain_slug', `${base}%`)
    .limit(500);
  if (error) throw error;

  const taken = new Set((data || []).map((row) => String(row.subdomain_slug || '').toLowerCase()));
  const available = !taken.has(base);
  const suggestions = [];
  for (let suffix = 2; suggestions.length < 3 && suffix < 1000; suffix += 1) {
    const candidate = `${base.slice(0, Math.max(1, 63 - String(suffix).length - 1))}-${suffix}`;
    if (!taken.has(candidate)) suggestions.push(candidate);
  }

  return {
    status: 200,
    payload: {
      ok: true,
      slug: base,
      available,
      suggestions,
    },
  };
}

async function lookupPostalCode(query = {}) {
  const countryCode = queryText(query.country, 3).toUpperCase() || 'IN';
  const postalCode = queryText(query.postalCode, 20).replace(/\s+/g, '');

  if (countryCode !== 'IN') {
    return {
      status: 200,
      payload: {
        ok: true,
        supported: false,
        countryCode,
        postalCode,
        state: '',
        city: '',
        localities: [],
      },
    };
  }

  const pin = normalizePostalCode(postalCode);
  if (!pin) return { status: 400, payload: { ok: false, code: 'INVALID_INDIAN_PINCODE' } };

  try {
    const { response, payload } = await fetchJsonWithTimeout(`https://api.postalpincode.in/pincode/${encodeURIComponent(pin)}`);
    const record = Array.isArray(payload) ? payload[0] : null;
    const offices = Array.isArray(record?.PostOffice) ? record.PostOffice : [];
    if (response.ok && String(record?.Status || '').toLowerCase() === 'success' && offices.length) {
      const first = offices[0] || {};
      return {
        status: 200,
        payload: {
          ok: true,
          supported: true,
          countryCode: 'IN',
          postalCode: pin,
          state: String(first.State || '').trim(),
          city: String(first.District || first.Division || '').trim(),
          district: String(first.District || '').trim(),
          localities: [...new Set(offices.map((office) => String(office?.Name || '').trim()).filter(Boolean))].slice(0, 50),
          provider: 'postalpincode.in',
        },
      };
    }
    if (response.status === 404 || String(record?.Status || '').toLowerCase() === 'error') {
      return { status: 404, payload: { ok: false, code: 'PINCODE_NOT_FOUND' } };
    }
  } catch {
    // Try the secondary provider below.
  }

  try {
    const { response, payload } = await fetchJsonWithTimeout(`https://api.pincodeapi.in/v1/pincode/${encodeURIComponent(pin)}`);
    const root = payload?.data || payload || {};
    const offices = Array.isArray(root.post_offices) ? root.post_offices : Array.isArray(root.postOffices) ? root.postOffices : [];
    const first = offices[0] || root;
    const state = String(first.state || first.State || root.state || '').trim();
    const city = String(first.district || first.District || root.district || '').trim();
    if (response.ok && (state || city)) {
      return {
        status: 200,
        payload: {
          ok: true,
          supported: true,
          countryCode: 'IN',
          postalCode: pin,
          state,
          city,
          district: city,
          localities: [...new Set(offices.map((office) => String(office?.office_name || office?.name || office?.Name || '').trim()).filter(Boolean))].slice(0, 50),
          provider: 'pincodeapi.in',
        },
      };
    }
  } catch {
    // Surface a controlled provider error below.
  }

  return { status: 502, payload: { ok: false, code: 'POSTAL_LOOKUP_UNAVAILABLE' } };
}

async function verifyGstin(body = {}) {
  const gstin = normalizeGstin(body?.gstin);
  if (!gstin) return { status: 400, payload: { ok: false, code: 'INVALID_GSTIN' } };

  const apiKey = String(process.env.GSTIN_API_KEY || process.env.GSTINAPI_KEY || '').trim();
  if (!apiKey) {
    return { status: 503, payload: { ok: false, code: 'GST_PROVIDER_NOT_CONFIGURED' } };
  }

  const baseUrl = String(process.env.GSTIN_API_BASE_URL || 'https://www.gstinapi.in/v1/gstin').replace(/\/+$/, '');
  const lookupUrl = new URL(`${baseUrl}/${encodeURIComponent(gstin)}`);
  lookupUrl.searchParams.set('include', 'profile');

  let response;
  let payload;
  try {
    ({ response, payload } = await fetchJsonWithTimeout(
      lookupUrl.toString(),
      { headers: { Accept: 'application/json', 'x-api-key': apiKey } },
      9000
    ));
  } catch {
    return { status: 502, payload: { ok: false, code: 'GST_PROVIDER_UNAVAILABLE' } };
  }

  if (!response.ok) {
    const upstreamCode = String(payload?.code || payload?.error?.code || '').trim();
    if (response.status === 404) return { status: 404, payload: { ok: false, code: 'GSTIN_NOT_FOUND' } };
    if ([401, 403].includes(response.status)) return { status: 502, payload: { ok: false, code: 'GST_PROVIDER_AUTH_FAILED' } };
    if (response.status === 402) return { status: 402, payload: { ok: false, code: 'GST_PROVIDER_CREDITS_EXHAUSTED' } };
    if (response.status === 429) return { status: 429, payload: { ok: false, code: 'GST_PROVIDER_RATE_LIMITED' } };
    return { status: 502, payload: { ok: false, code: upstreamCode || 'GST_PROVIDER_ERROR' } };
  }

  const source = payload?.data || payload?.profile || payload || {};
  const legalName = text(source.legal_name ?? source.legalName, 180);
  const tradeName = text(source.trade_name ?? source.tradeName, 180);
  const gstStatus = text(source.status ?? source.gstin_status, 80);
  const constitution = text(source.business_constitution ?? source.constitution_of_business ?? source.constitution, 160);
  if (!legalName || !gstStatus) {
    return { status: 502, payload: { ok: false, code: 'GST_PROVIDER_RESPONSE_INVALID' } };
  }

  const mapped = mapFleetCompanyType(constitution);
  return {
    status: 200,
    payload: {
      ok: true,
      verified: true,
      gstin,
      legalName,
      tradeName: tradeName || legalName,
      gstStatus,
      companyType: mapped.companyType,
      rawConstitution: mapped.rawConstitution,
    },
  };
}

function randomCompanyCode() {
  return `BF${randomBytes(4).toString('hex').toUpperCase()}`;
}

async function uniqueCompanyIdentity(supabaseAdmin, companyName, _requestedCode, requestedSlug) {
  let slug = normalizeSlug(requestedSlug || companyName);
  if (!slug) slug = `company-${randomBytes(3).toString('hex')}`;

  let code = '';
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data: generatedCode, error: codeError } = await supabaseAdmin.rpc('developer_generate_company_code');
    if (codeError) throw codeError;
    code = String(generatedCode || '').trim().toUpperCase();
    if (!code) throw new Error('UNABLE_TO_GENERATE_COMPANY_CODE');

    const [codeResult, slugResult] = await Promise.all([
      supabaseAdmin.from('companies').select('id').eq('company_code', code).limit(1),
      supabaseAdmin.from('companies').select('id').eq('subdomain_slug', slug).limit(1),
    ]);
    if (codeResult.error) throw codeResult.error;
    if (slugResult.error) throw slugResult.error;
    if (!(codeResult.data || []).length && !(slugResult.data || []).length) return { code, slug };
    if ((slugResult.data || []).length) slug = `${normalizeSlug(companyName).slice(0, 52) || 'company'}-${randomBytes(3).toString('hex')}`;
  }
  throw new Error('UNABLE_TO_GENERATE_COMPANY_IDENTITY');
}

function normalizeCompanyProfile(body) {
  const countryCode = text(body?.countryCode || 'IN', 3).toUpperCase() || 'IN';
  const gstin = normalizeGstin(body?.gstin);
  const pan = normalizePan(body?.pan);
  const aadhaarLast4 = normalizeAadhaarLast4(body?.aadhaarLast4 ?? body?.aadhaar);
  const contactEmail = normalizeEmail(body?.contactEmail ?? body?.companyEmail);
  const billingEmail = normalizeEmail(body?.billingEmail ?? body?.companyEmail);
  const ownerEmail = normalizeEmail(body?.ownerEmail);
  const contactMobile = normalizeMobile(body?.contactMobile ?? body?.companyPhone);
  const alternateMobile = normalizeMobile(body?.alternateMobile);
  const ownerMobile = normalizeMobile(body?.ownerMobile);
  const postalCode = normalizePostalCode(body?.postalCode, countryCode);
  const cin = normalizeCin(body?.cin);

  if ([gstin, pan, aadhaarLast4, contactEmail, billingEmail, ownerEmail, contactMobile, alternateMobile, ownerMobile, postalCode, cin].includes(null)) {
    return null;
  }

  const companyType = text(body?.companyType ?? body?.registrationType ?? body?.businessType, 120);
  return {
    legal_name: text(body?.legalName, 180),
    trade_name: text(body?.tradeName, 180),
    registration_type: text(body?.registrationType || companyType, 80),
    business_type: text(body?.businessType || companyType, 120),
    gstin,
    pan,
    aadhaar_last4: aadhaarLast4,
    cin,
    contact_email: contactEmail,
    contact_mobile: contactMobile,
    alternate_mobile: alternateMobile,
    billing_email: billingEmail,
    website: text(body?.website, 500),
    owner_name: text(body?.ownerName, 150),
    owner_email: ownerEmail,
    owner_mobile: ownerMobile,
    address_line1: text(body?.addressLine1, 250),
    address_line2: text(body?.addressLine2, 250),
    city: text(body?.city, 100),
    state: text(body?.state, 100),
    postal_code: postalCode,
    country: text(body?.country || 'India', 100),
    notes: text(body?.notes, 5000),
  };
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
  let profiles = [];
  let portalSettings = [];

  if (ids.length) {
    const [subscriptionResult, overrideResult, profileResult, portalSettingsResult] = await Promise.all([
      supabaseAdmin
        .from('subscriptions')
        .select('company_id,status,plan_id,plan_key,trial_start_at,trial_end_at,subscription_start_at,subscription_end_at')
        .in('company_id', ids),
      supabaseAdmin
        .from('developer_company_overrides')
        .select('id,company_id,enabled,plan_key,limits_override,entitlements_override,notes,revision,updated_at')
        .in('company_id', ids),
      supabaseAdmin
        .from('developer_company_profiles')
        .select('company_id,legal_name,trade_name,registration_type,business_type,gstin,pan,aadhaar_last4,cin,contact_email,contact_mobile,alternate_mobile,billing_email,website,owner_name,owner_email,owner_mobile,address_line1,address_line2,city,state,postal_code,country,notes,status_before_suspend,created_via,revision,updated_at')
        .in('company_id', ids),
      supabaseAdmin
        .from('company_portal_settings')
        .select('company_id,fleet_pack,enabled_packs,fleet_pack_selection_status,fleet_pack_selected_at')
        .in('company_id', ids),
    ]);

    if (subscriptionResult.error) throw subscriptionResult.error;
    if (overrideResult.error) throw overrideResult.error;
    if (profileResult.error) throw profileResult.error;
    if (portalSettingsResult.error) throw portalSettingsResult.error;
    subscriptions = subscriptionResult.data || [];
    overrides = overrideResult.data || [];
    profiles = profileResult.data || [];
    portalSettings = portalSettingsResult.data || [];
  }

  const subscriptionByCompany = new Map(subscriptions.map((item) => [item.company_id, item]));
  const overrideByCompany = new Map(overrides.map((item) => [item.company_id, item]));
  const profileByCompany = new Map(profiles.map((item) => [item.company_id, item]));
  const portalSettingsByCompany = new Map(portalSettings.map((item) => [item.company_id, item]));

  return (companies || []).map((company) => ({
    ...company,
    subscription: subscriptionByCompany.get(company.id) || null,
    override: overrideByCompany.get(company.id) || null,
    profile: profileByCompany.get(company.id) || null,
    portal_settings: portalSettingsByCompany.get(company.id) || null,
  }));
}




function queryText(value, max = 120) {
  const raw = Array.isArray(value) ? value[0] : value;
  return text(raw, max);
}

function queryInteger(value, fallback, min, max) {
  const raw = Array.isArray(value) ? value[0] : value;
  return integer(raw, fallback, min, max);
}

function chunks(values, size = 180) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

async function selectInChunks(supabaseAdmin, table, columns, field, values, extra = null) {
  const uniqueValues = [...new Set((values || []).filter(Boolean))];
  if (!uniqueValues.length) return [];
  const output = [];
  for (const batch of chunks(uniqueValues)) {
    let query = supabaseAdmin.from(table).select(columns).in(field, batch);
    if (typeof extra === 'function') query = extra(query);
    const { data, error } = await query;
    if (error) throw error;
    output.push(...(data || []));
  }
  return output;
}

async function listAllCompanies(supabaseAdmin) {
  const pageSize = 1000;
  const output = [];
  for (let start = 0; start < 10000; start += pageSize) {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug,created_at,updated_at')
      .order('company_name', { ascending: true })
      .range(start, start + pageSize - 1);
    if (error) throw error;
    output.push(...(data || []));
    if ((data || []).length < pageSize) break;
  }
  return output;
}

function latestIso(values) {
  let winner = null;
  let winnerTime = -1;
  for (const value of values || []) {
    if (!value) continue;
    const time = Date.parse(value);
    if (Number.isFinite(time) && time > winnerTime) {
      winner = value;
      winnerTime = time;
    }
  }
  return winner;
}

function lifecycleFor(company, subscription) {
  const companyStatus = String(company?.status || '').trim();
  const subscriptionStatus = String(subscription?.status || '').trim();
  const now = Date.now();
  const subscriptionExpired = subscription?.subscription_end_at && Date.parse(subscription.subscription_end_at) <= now;
  const trialExpired = subscription?.trial_end_at && Date.parse(subscription.trial_end_at) <= now;

  if (companyStatus === 'suspended') return { key: 'suspended', label: 'Suspended', tone: 'danger' };
  if (companyStatus === 'pending_confirmation') return { key: 'pending_confirmation', label: 'Pending', tone: 'neutral' };
  if (companyStatus === 'trial_expired' || subscriptionStatus === 'trial_expired' || (companyStatus === 'trial_active' && trialExpired)) {
    return { key: 'expired', label: 'Expired', tone: 'warning' };
  }
  if (['expired', 'past_due'].includes(subscriptionStatus) || subscriptionExpired) {
    return { key: 'expired', label: 'Expired', tone: 'warning' };
  }
  if (companyStatus === 'trial_active' || subscriptionStatus === 'trial_active') {
    return { key: 'trial_active', label: 'Trial', tone: 'warning' };
  }
  return { key: 'active', label: 'Active', tone: 'success' };
}

function accessFor(lifecycle) {
  if (lifecycle.key === 'suspended' || lifecycle.key === 'pending_confirmation') return { key: 'blocked', label: 'Blocked' };
  if (lifecycle.key === 'expired') return { key: 'read_only', label: 'Read Only' };
  return { key: 'full', label: 'Full' };
}

function provisioningFor({ portalSettings, sites, systemRoles, portalAccess, portalProfiles, employees, company, subscription, portalConfig }) {
  const ownerId = company?.account_owner_user_id || null;
  const checks = {
    portal_settings: Boolean(portalSettings),
    fleet_pack_selected: portalSettings?.fleet_pack_selection_status === 'selected',
    primary_site: (sites || []).some((site) => site.is_primary && site.status === 'active'),
    system_roles: (systemRoles || []).filter((role) => role.is_system).length >= 6,
    owner_access: Boolean(ownerId && (portalAccess || []).some((row) => row.user_id === ownerId)),
    owner_profile: Boolean(ownerId && (portalProfiles || []).some((row) => row.user_id === ownerId)),
    developer_owner_employee: Boolean(ownerId && (employees || []).some((row) => row.user_id === ownerId)),
    portal_config: Boolean(portalConfig),
    subscription: Boolean(subscription),
  };
  const missing = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
  const criticalMissing = new Set(['portal_settings', 'primary_site', 'owner_access', 'owner_profile', 'developer_owner_employee', 'subscription']);
  const criticalCount = missing.filter((key) => criticalMissing.has(key)).length;
  const level = missing.length === 0 ? 'healthy' : criticalCount >= 2 || missing.length >= 4 ? 'incomplete' : 'attention';
  return {
    level,
    label: level === 'healthy' ? 'Healthy' : level === 'incomplete' ? 'Incomplete' : 'Attention',
    checks,
    missing,
  };
}

function securityFor({ company, employees, memberships, securityRows }) {
  const ownerId = company?.account_owner_user_id || null;
  const employeeByUser = new Map((employees || []).filter((row) => row.user_id).map((row) => [row.user_id, row]));
  const membershipByUser = new Map((memberships || []).filter((row) => row.user_id).map((row) => [row.user_id, row]));
  const securityByUser = new Map((securityRows || []).filter((row) => row.user_id).map((row) => [row.user_id, row]));
  const userIds = [...new Set([ownerId, ...employeeByUser.keys(), ...membershipByUser.keys()].filter(Boolean))];

  let lockedCount = 0;
  let restrictedCount = 0;
  let failedLoginAlerts = 0;
  let mfaAlerts = 0;
  const eventTimes = [];
  const alerts = [];

  for (const userId of userIds) {
    const employee = employeeByUser.get(userId);
    const membership = membershipByUser.get(userId);
    const security = securityByUser.get(userId);
    const actorLabel = employee?.full_name || employee?.email || (userId === ownerId ? 'Company Owner' : 'Company user');
    const isOwner = userId === ownerId;
    if (security?.is_locked) {
      lockedCount += 1;
      alerts.push({
        userId,
        name: actorLabel,
        type: isOwner ? 'Owner Locked' : 'Locked',
        reason: security.lock_reason || `${Number(security.failed_password_attempts || 0)} failed password attempts`,
        severity: isOwner ? 'critical' : 'warning',
        at: security.locked_at || security.last_failed_at || null,
      });
    }
    const employeeRestricted = Boolean(employee && employee.status !== 'active');
    const membershipRestricted = Boolean(membership && membership.status !== 'active');
    if (employeeRestricted || membershipRestricted) {
      restrictedCount += 1;
      alerts.push({
        userId,
        name: actorLabel,
        type: isOwner ? 'Owner Restricted' : 'Restricted',
        reason: employeeRestricted ? `Employee status: ${employee.status}` : `Membership status: ${membership.status}`,
        severity: isOwner ? 'critical' : 'warning',
        at: employee?.updated_at || membership?.updated_at || null,
      });
    }
    if (Number(security?.failed_password_attempts || 0) >= 2 && !security?.is_locked) {
      failedLoginAlerts += 1;
      alerts.push({
        userId,
        name: actorLabel,
        type: 'Failed Login Warning',
        reason: `${Number(security.failed_password_attempts || 0)} recent failed password attempts`,
        severity: 'warning',
        at: security.last_failed_at || null,
      });
    }
    if (Number(security?.failed_mfa_attempts || 0) >= 2) {
      mfaAlerts += 1;
      alerts.push({
        userId,
        name: actorLabel,
        type: 'MFA Warning',
        reason: `${Number(security.failed_mfa_attempts || 0)} failed MFA attempts`,
        severity: 'warning',
        at: security.last_failed_mfa_at || null,
      });
    }
    eventTimes.push(security?.locked_at, security?.last_failed_at, security?.last_failed_mfa_at);
  }

  const ownerSecurity = ownerId ? securityByUser.get(ownerId) : null;
  const ownerEmployee = ownerId ? employeeByUser.get(ownerId) : null;
  const ownerMembership = ownerId ? membershipByUser.get(ownerId) : null;
  const ownerLocked = Boolean(ownerSecurity?.is_locked);
  const ownerRestricted = Boolean(ownerId && ((ownerEmployee && ownerEmployee.status !== 'active') || (ownerMembership && ownerMembership.status !== 'active')));
  const alertCount = lockedCount + restrictedCount + failedLoginAlerts + mfaAlerts;
  const level = ownerLocked || ownerRestricted ? 'critical' : alertCount > 0 ? 'warning' : 'clear';
  const label = ownerLocked ? 'Owner Locked' : ownerRestricted ? 'Owner Restricted' : alertCount > 0 ? `${alertCount} Alert${alertCount === 1 ? '' : 's'}` : 'Clear';

  return {
    level,
    label,
    ownerLocked,
    ownerRestricted,
    lockedCount,
    restrictedCount,
    failedLoginAlerts,
    mfaAlerts,
    alertCount,
    lastEventAt: latestIso(eventTimes),
    alerts: alerts
      .sort((a, b) => (a.severity === 'critical' ? -1 : 0) - (b.severity === 'critical' ? -1 : 0))
      .slice(0, 8),
  };
}

function expiryFor(lifecycle, subscription) {
  if (lifecycle.key === 'trial_active' || (lifecycle.key === 'expired' && subscription?.trial_end_at)) return subscription?.trial_end_at || null;
  return subscription?.subscription_end_at || subscription?.trial_end_at || null;
}

function daysUntil(value) {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return Math.ceil((time - Date.now()) / 86400000);
}

function companySearchBlob(row) {
  return [
    row.company_name,
    row.company_code,
    row.subdomain_slug,
    row.owner?.name,
    row.owner?.email,
    row.plan?.name,
    row.plan?.key,
    row.fleet?.primary?.name,
    row.fleet?.primary?.key,
    ...(row.fleet?.enabled || []).map((item) => item.name || item.key),
  ].filter(Boolean).join(' ').toLowerCase();
}

async function getCompanyDirectory(supabaseAdmin, requestQuery = {}) {
  const companies = await listAllCompanies(supabaseAdmin);
  const companyIds = companies.map((company) => company.id).filter(Boolean);
  const ownerIds = companies.map((company) => company.account_owner_user_id).filter(Boolean);

  const [
    subscriptions,
    overrides,
    profiles,
    portalSettings,
    sites,
    employees,
    memberships,
    sessions,
    invoices,
    plansResult,
    packsResult,
    roles,
    portalAccess,
    portalProfiles,
    portalConfigs,
  ] = await Promise.all([
    selectInChunks(supabaseAdmin, 'subscriptions', 'company_id,status,plan_id,plan_key,trial_start_at,trial_end_at,subscription_start_at,subscription_end_at,created_at,updated_at', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'developer_company_overrides', 'id,company_id,enabled,plan_key,limits_override,entitlements_override,notes,revision,updated_at', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'developer_company_profiles', 'company_id,legal_name,trade_name,gstin,pan,owner_name,owner_email,owner_mobile,contact_email,contact_mobile,city,state,country,revision,updated_at', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'company_portal_settings', 'company_id,fleet_pack,enabled_packs,fleet_pack_selection_status,fleet_pack_selected_at,updated_at', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'company_portal_sites', 'id,company_id,name,is_primary,status,created_at,updated_at', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'developer_company_employees', 'id,company_id,user_id,full_name,email,role_key,status,created_at,updated_at', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'company_memberships', 'id,company_id,user_id,status,access_scope,created_at,updated_at', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'security_sessions', 'id,company_id,user_id,status,last_seen_at,created_at,revoked_at', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'developer_company_invoices', 'id,company_id,due_date,grand_total,paid_amount,status,created_at,updated_at', 'company_id', companyIds),
    supabaseAdmin.from('developer_plans').select('id,plan_key,name,status,display_order').order('display_order', { ascending: true }),
    supabaseAdmin.from('developer_fleet_packs').select('pack_key,name,short_name,status,display_order').order('display_order', { ascending: true }),
    selectInChunks(supabaseAdmin, 'company_portal_roles', 'id,company_id,role_key,name,is_system', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'company_portal_user_access', 'company_id,user_id,role_id,role_name,primary_site_id,site_ids,all_sites', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'company_portal_user_profiles', 'company_id,user_id,full_name,email,mobile', 'company_id', companyIds),
    selectInChunks(supabaseAdmin, 'developer_company_portal_config', 'company_id,revision,updated_at', 'company_id', companyIds),
  ]);

  if (plansResult.error) throw plansResult.error;
  if (packsResult.error) throw packsResult.error;

  const allUserIds = [...new Set([...ownerIds, ...employees.map((row) => row.user_id).filter(Boolean), ...memberships.map((row) => row.user_id).filter(Boolean)])];
  const securityRows = await selectInChunks(
    supabaseAdmin,
    'user_security',
    'user_id,failed_password_attempts,is_locked,locked_at,lock_reason,last_failed_at,last_successful_login_at,failed_mfa_attempts,last_failed_mfa_at,mfa_enabled,updated_at',
    'user_id',
    allUserIds
  );

  const group = (rows, key = 'company_id') => {
    const map = new Map();
    for (const row of rows || []) {
      const value = row[key];
      if (!value) continue;
      if (!map.has(value)) map.set(value, []);
      map.get(value).push(row);
    }
    return map;
  };
  const one = (rows, key = 'company_id') => new Map((rows || []).filter((row) => row[key]).map((row) => [row[key], row]));

  const subscriptionMap = one(subscriptions);
  const overrideMap = one(overrides);
  const profileMap = one(profiles);
  const portalSettingsMap = one(portalSettings);
  const sitesMap = group(sites);
  const employeeMap = group(employees);
  const membershipMap = group(memberships);
  const sessionMap = group(sessions);
  const invoiceMap = group(invoices);
  const rolesMap = group(roles);
  const accessMap = group(portalAccess);
  const portalProfilesMap = group(portalProfiles);
  const portalConfigMap = one(portalConfigs);
  const securityMap = new Map(securityRows.map((row) => [row.user_id, row]));
  const planByKey = new Map();
  for (const plan of plansResult.data || []) {
    planByKey.set(plan.plan_key, plan);
    planByKey.set(plan.id, plan);
  }
  const packByKey = new Map((packsResult.data || []).map((pack) => [pack.pack_key, pack]));

  const today = new Date().toISOString().slice(0, 10);
  const rows = companies.map((company) => {
    const subscription = subscriptionMap.get(company.id) || null;
    const override = overrideMap.get(company.id) || null;
    const profile = profileMap.get(company.id) || null;
    const settings = portalSettingsMap.get(company.id) || null;
    const companySites = sitesMap.get(company.id) || [];
    const companyEmployees = employeeMap.get(company.id) || [];
    const companyMemberships = membershipMap.get(company.id) || [];
    const companySessions = sessionMap.get(company.id) || [];
    const companyInvoices = invoiceMap.get(company.id) || [];
    const companyRoles = rolesMap.get(company.id) || [];
    const companyAccess = accessMap.get(company.id) || [];
    const companyPortalProfiles = portalProfilesMap.get(company.id) || [];
    const companyPortalConfig = portalConfigMap.get(company.id) || null;
    const lifecycle = lifecycleFor(company, subscription);
    const access = accessFor(lifecycle);
    const planKey = override?.enabled && override?.plan_key ? override.plan_key : subscription?.plan_key || subscription?.plan_id || '';
    const plan = planByKey.get(planKey) || null;
    const enabledPackKeys = [...new Set([settings?.fleet_pack, ...(Array.isArray(settings?.enabled_packs) ? settings.enabled_packs : [])].filter(Boolean))];
    const enabledPacks = enabledPackKeys.map((key) => {
      const pack = packByKey.get(key);
      return { key, name: pack?.name || pack?.short_name || key };
    });
    const primaryPack = settings?.fleet_pack ? enabledPacks.find((pack) => pack.key === settings.fleet_pack) || { key: settings.fleet_pack, name: settings.fleet_pack } : null;
    const ownerEmployee = companyEmployees.find((row) => row.user_id === company.account_owner_user_id) || companyEmployees.find((row) => row.role_key === 'owner') || null;
    const ownerPortalProfile = companyPortalProfiles.find((row) => row.user_id === company.account_owner_user_id) || null;
    const owner = {
      userId: company.account_owner_user_id || ownerEmployee?.user_id || null,
      name: profile?.owner_name || ownerEmployee?.full_name || ownerPortalProfile?.full_name || '',
      email: profile?.owner_email || ownerEmployee?.email || ownerPortalProfile?.email || '',
    };
    const companySecurityRows = [...new Set([
      company.account_owner_user_id,
      ...companyEmployees.map((row) => row.user_id),
      ...companyMemberships.map((row) => row.user_id),
    ].filter(Boolean))]
      .map((userId) => securityMap.get(userId)).filter(Boolean);
    const security = securityFor({ company, employees: companyEmployees, memberships: companyMemberships, securityRows: companySecurityRows });
    const provisioning = provisioningFor({
      portalSettings: settings,
      sites: companySites,
      systemRoles: companyRoles,
      portalAccess: companyAccess,
      portalProfiles: companyPortalProfiles,
      employees: companyEmployees,
      company,
      subscription,
      portalConfig: companyPortalConfig,
    });
    const activeSites = companySites.filter((site) => site.status === 'active').length;
    const overdueInvoices = companyInvoices.filter((invoice) => {
      const status = String(invoice.status || '').toLowerCase();
      const outstanding = Number(invoice.grand_total || 0) - Number(invoice.paid_amount || 0);
      return invoice.due_date && invoice.due_date < today && outstanding > 0 && !['paid', 'cancelled', 'void'].includes(status);
    });
    const overdueOutstanding = overdueInvoices.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.grand_total || 0) - Number(invoice.paid_amount || 0)), 0);
    const expiryAt = expiryFor(lifecycle, subscription);
    const remaining = daysUntil(expiryAt);
    const lastActivityAt = latestIso([
      ...companySessions.map((row) => row.last_seen_at || row.created_at),
      ...companySecurityRows.map((row) => row.last_successful_login_at),
    ]);

    const attentionReasons = [];
    if (provisioning.level !== 'healthy') attentionReasons.push(`Provisioning ${provisioning.label.toLowerCase()}`);
    if (security.level !== 'clear') attentionReasons.push(security.label);
    if (overdueInvoices.length) attentionReasons.push(`${overdueInvoices.length} overdue invoice${overdueInvoices.length === 1 ? '' : 's'}`);
    if (lifecycle.key === 'expired') attentionReasons.push('Lifecycle expired');
    if (lifecycle.key === 'trial_active' && Number.isFinite(remaining) && remaining <= 7) attentionReasons.push('Trial ending soon');
    if (!plan && lifecycle.key === 'active') attentionReasons.push('Plan not assigned');

    return {
      id: company.id,
      company_code: company.company_code,
      company_name: company.company_name,
      subdomain_slug: company.subdomain_slug,
      status: company.status,
      created_at: company.created_at,
      owner,
      plan: plan
        ? { id: plan.id, key: plan.plan_key, name: plan.name }
        : { id: null, key: planKey || '', name: planKey || (subscription?.trial_start_at ? 'Trial Policy' : '') },
      fleet: {
        primary: primaryPack,
        enabled: enabledPacks,
        additionalCount: Math.max(0, enabledPacks.length - (primaryPack ? 1 : 0)),
        selectionStatus: settings?.fleet_pack_selection_status || 'pending',
      },
      lifecycle,
      access,
      provisioning,
      security,
      sites: { active: activeSites, total: companySites.length },
      billing: { overdueInvoices: overdueInvoices.length, overdueOutstanding },
      expiryAt,
      daysRemaining: remaining,
      lastActivityAt,
      attention: { required: attentionReasons.length > 0, reasons: attentionReasons },
      raw: { company, profile, subscription, override, portal_settings: settings },
    };
  });

  const summary = {
    total: rows.length,
    active: rows.filter((row) => row.lifecycle.key === 'active').length,
    trial: rows.filter((row) => row.lifecycle.key === 'trial_active').length,
    expired: rows.filter((row) => row.lifecycle.key === 'expired').length,
    suspended: rows.filter((row) => row.lifecycle.key === 'suspended').length,
    needsAttention: rows.filter((row) => row.attention.required).length,
  };

  const search = queryText(requestQuery.search, 160).toLowerCase();
  const lifecycle = queryText(requestQuery.lifecycle, 50);
  const planFilter = queryText(requestQuery.plan, 80);
  const fleetPack = queryText(requestQuery.fleetPack, 120);
  const accessFilter = queryText(requestQuery.access, 30);
  const provisioningFilter = queryText(requestQuery.provisioning, 30);
  const securityFilter = queryText(requestQuery.security, 30);
  const quick = queryText(requestQuery.quick, 50);
  const sort = queryText(requestQuery.sort, 40) || 'name_asc';
  const pageSize = queryInteger(requestQuery.pageSize, 25, 25, 100);
  let page = queryInteger(requestQuery.page, 1, 1, 100000);

  let filtered = rows.filter((row) => {
    if (search && !companySearchBlob(row).includes(search)) return false;
    if (lifecycle && row.lifecycle.key !== lifecycle) return false;
    if (planFilter && row.plan?.key !== planFilter && row.plan?.id !== planFilter) return false;
    if (fleetPack && !(row.fleet?.enabled || []).some((pack) => pack.key === fleetPack)) return false;
    if (accessFilter && row.access.key !== accessFilter) return false;
    if (provisioningFilter && row.provisioning.level !== provisioningFilter) return false;
    if (securityFilter && row.security.level !== securityFilter) return false;
    if (quick === 'needs_attention' && !row.attention.required) return false;
    if (quick === 'trials_ending' && !(row.lifecycle.key === 'trial_active' && Number.isFinite(row.daysRemaining) && row.daysRemaining >= 0 && row.daysRemaining <= 7)) return false;
    if (quick === 'expired' && row.lifecycle.key !== 'expired') return false;
    if (quick === 'suspended' && row.lifecycle.key !== 'suspended') return false;
    return true;
  });

  const dateScore = (value, fallback) => {
    if (!value) return fallback;
    const score = Date.parse(value);
    return Number.isFinite(score) ? score : fallback;
  };
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'name_desc') return String(b.company_name || '').localeCompare(String(a.company_name || ''));
    if (sort === 'expiry_asc') return dateScore(a.expiryAt, Number.MAX_SAFE_INTEGER) - dateScore(b.expiryAt, Number.MAX_SAFE_INTEGER);
    if (sort === 'activity_desc') return dateScore(b.lastActivityAt, 0) - dateScore(a.lastActivityAt, 0);
    if (sort === 'created_desc') return dateScore(b.created_at, 0) - dateScore(a.created_at, 0);
    return String(a.company_name || '').localeCompare(String(b.company_name || ''));
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) page = totalPages;
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  return {
    rows: pageRows,
    summary,
    filters: {
      plans: (plansResult.data || []).filter((plan) => plan.status !== 'archived').map((plan) => ({ value: plan.plan_key, label: plan.name })),
      fleetPacks: (packsResult.data || []).filter((pack) => pack.status === 'active').map((pack) => ({ value: pack.pack_key, label: pack.name })),
    },
    pagination: { page, pageSize, total, totalPages },
  };
}

async function createCompany({ supabaseAdmin, actorUserId, body }) {
  const stageSteps = [
    'validate',
    'identity',
    'company',
    'owner_auth',
    'owner_membership',
    'company_profile',
    'subscription',
    'fleet_portal',
    'head_office',
    'owner_profile',
    'invoice',
    'owner_photo',
    'password_link',
    'complete',
  ];
  let currentStage = 'validate';
  const completed = [];
  const warnings = [];
  const mark = (stage) => {
    currentStage = stage;
    if (!completed.includes(stage)) completed.push(stage);
  };

  const accountType = text(body?.accountType, 20).toLowerCase();
  const legalName = text(body?.legalName, 180);
  const tradeName = text(body?.tradeName, 180);
  const companyType = text(body?.companyType, 120);
  const companyEmail = normalizeEmail(body?.companyEmail);
  const companyPhone = normalizeMobile(body?.companyPhone);
  const ownerName = text(body?.ownerName, 150);
  const ownerEmail = normalizeEmail(body?.ownerEmail);
  const ownerMobile = normalizeMobile(body?.ownerMobile);
  const ownerAlternateMobile = normalizeMobile(body?.ownerAlternateMobile);
  const ownerDesignation = text(body?.ownerDesignation, 120);
  const countryCode = text(body?.countryCode || 'IN', 3).toUpperCase() || 'IN';
  const country = text(body?.country || 'India', 100) || 'India';
  const postalCode = normalizePostalCode(body?.postalCode, countryCode);
  const portalSlug = normalizeSlug(body?.portalSlug || tradeName || legalName);
  const primaryFleet = text(body?.primaryFleet, 120).toLowerCase();
  const additionalFleets = normalizeStringArray(body?.additionalFleets, 10).map((value) => value.toLowerCase());
  const enabledPacks = [...new Set([primaryFleet, ...additionalFleets].filter(Boolean))];
  const subscriptionStart = normalizeDateOnly(body?.subscriptionStart);
  const gstin = normalizeGstin(body?.gstin);
  const pan = normalizePan(body?.pan);
  const cin = normalizeCin(body?.cin);
  const website = text(body?.website, 500);
  const gstStatus = text(body?.gstStatus, 80);
  const gstWarningAccepted = Boolean(body?.gstWarningAccepted);

  if (
    !['trial', 'paid'].includes(accountType) ||
    !legalName || !tradeName || !companyType ||
    !companyEmail || !companyPhone ||
    !ownerName || !ownerEmail || !ownerMobile || !ownerDesignation ||
    ownerAlternateMobile === null ||
    !text(body?.addressLine1, 250) || !text(body?.state, 100) || !text(body?.city, 100) ||
    !postalCode || !portalSlug || !primaryFleet || !subscriptionStart ||
    [gstin, pan, cin].includes(null)
  ) {
    return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_PAYLOAD', stage: currentStage } };
  }
  if (gstin && gstStatus && gstStatus.toLowerCase() !== 'active' && !gstWarningAccepted) {
    return { status: 400, payload: { ok: false, code: 'GST_STATUS_CONFIRMATION_REQUIRED', stage: currentStage } };
  }

  const { data: duplicateSlug, error: duplicateSlugError } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('subdomain_slug', portalSlug)
    .limit(1);
  if (duplicateSlugError) throw duplicateSlugError;
  if ((duplicateSlug || []).length) {
    return { status: 409, payload: { ok: false, code: 'COMPANY_SLUG_EXISTS', stage: currentStage } };
  }

  const { data: fleetRows, error: fleetError } = await supabaseAdmin
    .from('developer_fleet_packs')
    .select('pack_key,status')
    .in('pack_key', enabledPacks);
  if (fleetError) throw fleetError;
  const activePacks = new Set((fleetRows || []).filter((row) => row.status === 'active').map((row) => row.pack_key));
  if (!enabledPacks.length || enabledPacks.some((key) => !activePacks.has(key))) {
    return { status: 400, payload: { ok: false, code: 'FLEET_PACK_NOT_AVAILABLE', stage: currentStage } };
  }

  let plan = null;
  let planKey = '';
  let billingCycle = null;
  let discountPercent = 0;
  let discountReason = '';
  let basePrice = 0;
  let discountAmount = 0;
  let netPrice = 0;
  let trialWeeks = null;
  let trialEndDate = null;
  let subscriptionEndDate = null;

  if (accountType === 'trial') {
    trialWeeks = integer(body?.trialWeeks, 0, 1, 4);
    if (![1, 2, 3, 4].includes(trialWeeks)) {
      return { status: 400, payload: { ok: false, code: 'INVALID_TRIAL_DURATION', stage: currentStage } };
    }
    trialEndDate = addDaysDateOnly(subscriptionStart, (trialWeeks * 7) - 1);
  } else {
    planKey = text(body?.planKey, 80).toLowerCase();
    billingCycle = integer(body?.billingCycle, 0, 1, 12);
    discountPercent = Number(body?.discountPercent || 0);
    discountReason = text(body?.discountReason, 1000);
    if (!PLAN_KEY_PATTERN.test(planKey) || ![1, 6, 12].includes(billingCycle)) {
      return { status: 400, payload: { ok: false, code: 'INVALID_COMMERCIAL_SETUP', stage: currentStage } };
    }
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100 || (discountPercent > 0 && !discountReason)) {
      return { status: 400, payload: { ok: false, code: 'INVALID_DISCOUNT', stage: currentStage } };
    }
    const { data: planRow, error: planError } = await supabaseAdmin
      .from('developer_plans')
      .select('id,plan_key,name,status,currency,prices,limits,revision')
      .eq('plan_key', planKey)
      .maybeSingle();
    if (planError) throw planError;
    if (!planRow || planRow.status !== 'active') {
      return { status: 400, payload: { ok: false, code: 'PLAN_NOT_AVAILABLE', stage: currentStage } };
    }
    plan = planRow;
    basePrice = Number(plan.prices?.[String(billingCycle)]);
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return { status: 400, payload: { ok: false, code: 'PLAN_PRICE_NOT_CONFIGURED', stage: currentStage } };
    }
    discountAmount = money2(basePrice * discountPercent / 100);
    netPrice = money2(Math.max(0, basePrice - discountAmount));
    subscriptionEndDate = addMonthsBillingEnd(subscriptionStart, billingCycle);
    if (!subscriptionEndDate) {
      return { status: 400, payload: { ok: false, code: 'INVALID_SUBSCRIPTION_RANGE', stage: currentStage } };
    }
  }

  const photo = parseOwnerPhotoDataUrl(body?.ownerPhotoDataUrl);
  if (photo?.error) return { status: 400, payload: { ok: false, code: photo.error, stage: currentStage } };

  const profile = normalizeCompanyProfile({
    ...body,
    contactEmail: companyEmail,
    billingEmail: companyEmail,
    contactMobile: companyPhone,
    ownerEmail,
    ownerMobile,
    countryCode,
    country,
    companyType,
    registrationType: companyType,
    businessType: companyType,
    postalCode,
    notes: gstStatus ? `GST status at onboarding: ${gstStatus}` : '',
  });
  if (!profile) return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_PROFILE', stage: currentStage } };
  mark('validate');

  let company = null;
  let ownerUser = null;
  let ownerWasCreated = false;
  let invoice = null;
  let primarySiteId = null;
  let ownerPhotoPath = null;
  let passwordLinkSent = false;

  try {
    const identity = await uniqueCompanyIdentity(supabaseAdmin, tradeName, null, portalSlug);
    if (identity.slug !== portalSlug) {
      return { status: 409, payload: { ok: false, code: 'COMPANY_SLUG_EXISTS', stage: currentStage } };
    }
    mark('identity');

    const companyStatus = accountType === 'trial' ? 'trial_active' : 'active';
    const { data: createdCompany, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        company_code: identity.code,
        company_name: tradeName,
        status: companyStatus,
        confirmed_at: new Date().toISOString(),
        subdomain_slug: identity.slug,
        account_owner_user_id: null,
      })
      .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
      .single();
    if (companyError) throw companyError;
    company = createdCompany;
    mark('company');

    ownerUser = await findAuthUserByEmail(supabaseAdmin, ownerEmail);
    if (!ownerUser) {
      const temporaryPassword = `${randomBytes(24).toString('base64url')}Aa1!`;
      const { data: createdOwner, error: ownerError } = await supabaseAdmin.auth.admin.createUser({
        email: ownerEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: ownerName,
          mobile: ownerMobile,
          created_via: 'developer_cpanel_company_owner',
        },
      });
      if (ownerError || !createdOwner?.user?.id) {
        const error = new Error(ownerError?.message || 'OWNER_AUTH_CREATE_FAILED');
        error.code = 'OWNER_AUTH_CREATE_FAILED';
        throw error;
      }
      ownerUser = createdOwner.user;
      ownerWasCreated = true;
    }
    mark('owner_auth');

    const ownerUserId = ownerUser.id;
    const profileLookup = await supabaseAdmin.from('profiles').select('id,full_name,email,mobile').eq('id', ownerUserId).maybeSingle();
    if (profileLookup.error) throw profileLookup.error;
    if (!profileLookup.data) {
      const profileInsert = await supabaseAdmin.from('profiles').insert({ id: ownerUserId, full_name: ownerName, email: ownerEmail, mobile: ownerMobile });
      if (profileInsert.error) throw profileInsert.error;
    } else if (ownerWasCreated) {
      const profileUpdate = await supabaseAdmin.from('profiles').update({ full_name: ownerName, email: ownerEmail, mobile: ownerMobile, updated_at: new Date().toISOString() }).eq('id', ownerUserId);
      if (profileUpdate.error) throw profileUpdate.error;
    }

    const ownerLink = await supabaseAdmin.from('companies').update({ account_owner_user_id: ownerUserId }).eq('id', company.id);
    if (ownerLink.error) throw ownerLink.error;

    const membership = await supabaseAdmin.from('company_memberships').upsert({
      company_id: company.id,
      user_id: ownerUserId,
      status: 'active',
      access_scope: 'company_wide',
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id,user_id' });
    if (membership.error) throw membership.error;
    mark('owner_membership');

    const profilePayload = {
      company_id: company.id,
      ...profile,
      gst_status: gstin ? (gstStatus || 'Not verified') : '',
      created_via: 'developer_cpanel',
      created_by: actorUserId,
      updated_by: actorUserId,
      revision: 1,
    };
    const profileResult = await supabaseAdmin.from('developer_company_profiles').insert(profilePayload);
    if (profileResult.error) throw profileResult.error;
    mark('company_profile');

    const subscriptionPayload = accountType === 'trial'
      ? {
          company_id: company.id,
          status: 'trial_active',
          plan_key: null,
          trial_start_at: startOfUtcDate(subscriptionStart),
          trial_end_at: endOfUtcDate(trialEndDate),
          subscription_start_at: null,
          subscription_end_at: null,
        }
      : {
          company_id: company.id,
          status: 'active',
          plan_key: planKey,
          trial_start_at: null,
          trial_end_at: null,
          subscription_start_at: startOfUtcDate(subscriptionStart),
          subscription_end_at: endOfUtcDate(subscriptionEndDate),
        };
    const subscriptionResult = await supabaseAdmin.from('subscriptions').insert(subscriptionPayload);
    if (subscriptionResult.error) throw subscriptionResult.error;
    mark('subscription');

    const { data: portalResult, error: portalError } = await supabaseAdmin.rpc('bf_set_company_fleet_packs', {
      p_company_id: company.id,
      p_primary_pack: primaryFleet,
      p_enabled_packs: enabledPacks,
    });
    if (portalError) throw portalError;
    primarySiteId = portalResult?.primary_site_id || null;
    mark('fleet_portal');

    if (!primarySiteId) {
      const siteLookup = await supabaseAdmin.from('company_portal_sites').select('id').eq('company_id', company.id).eq('is_primary', true).limit(1).maybeSingle();
      if (siteLookup.error) throw siteLookup.error;
      primarySiteId = siteLookup.data?.id || null;
    }
    if (!primarySiteId) throw new Error('PRIMARY_SITE_PROVISION_FAILED');

    const addressLine1 = text(body?.addressLine1, 250);
    const addressLine2 = text(body?.addressLine2, 250);
    const locality = text(body?.locality, 120);
    const siteAddress = [addressLine1, addressLine2, locality].filter(Boolean).join(', ');
    const siteUpdate = await supabaseAdmin.from('company_portal_sites').update({
      name: 'Head Office',
      site_type: 'Head Office',
      address: siteAddress,
      city: text(body?.city, 100),
      state: text(body?.state, 100),
      pincode: postalCode,
      manager_user_id: ownerUserId,
      is_primary: true,
      status: 'active',
      metadata: {
        provisioned_by: 'create_company_wizard',
        country,
        country_code: countryCode,
        address_line1: addressLine1,
        address_line2: addressLine2,
        locality,
      },
      updated_at: new Date().toISOString(),
    }).eq('id', primarySiteId).eq('company_id', company.id);
    if (siteUpdate.error) throw siteUpdate.error;
    mark('head_office');

    const employeeUpdate = await supabaseAdmin.from('developer_company_employees').update({
      full_name: ownerName,
      email: ownerEmail,
      mobile: ownerMobile,
      designation: ownerDesignation,
      branch: 'Head Office',
      role_key: 'owner',
      status: 'active',
      updated_by: actorUserId,
      updated_at: new Date().toISOString(),
    }).eq('company_id', company.id).eq('user_id', ownerUserId);
    if (employeeUpdate.error) throw employeeUpdate.error;

    const portalProfileUpdate = await supabaseAdmin.from('company_portal_user_profiles').upsert({
      company_id: company.id,
      user_id: ownerUserId,
      full_name: ownerName,
      designation: ownerDesignation,
      department: 'Management',
      mobile: ownerMobile,
      alternate_mobile: ownerAlternateMobile || null,
      email: ownerEmail,
      address: [addressLine1, addressLine2, text(body?.city, 100), text(body?.state, 100), postalCode, country].filter(Boolean).join(', '),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id,user_id' });
    if (portalProfileUpdate.error) throw portalProfileUpdate.error;
    mark('owner_profile');

    if (accountType === 'paid') {
      currentStage = 'invoice';
      const { data: invoiceNumber, error: invoiceNoError } = await supabaseAdmin.rpc('developer_next_invoice_number');
      if (invoiceNoError) throw invoiceNoError;
      const today = new Date().toISOString().slice(0, 10);
      const dueDate = subscriptionStart > today ? subscriptionStart : today;
      const invoiceNotes = [
        'Initial subscription invoice generated automatically during company provisioning.',
        discountPercent > 0 ? `Commercial discount: ${discountPercent}% — ${discountReason}` : '',
      ].filter(Boolean).join('\n');
      const invoiceResult = await supabaseAdmin.from('developer_company_invoices').insert({
        company_id: company.id,
        invoice_number: invoiceNumber,
        invoice_type: 'subscription',
        invoice_date: today,
        due_date: dueDate,
        currency: plan.currency || 'INR',
        subtotal: money2(basePrice),
        discount: discountAmount,
        taxable_amount: netPrice,
        cgst: 0,
        sgst: 0,
        igst: 0,
        round_off: 0,
        grand_total: netPrice,
        paid_amount: 0,
        status: 'issued',
        billing_period_start: subscriptionStart,
        billing_period_end: subscriptionEndDate,
        place_of_supply: text(body?.state, 100),
        notes: invoiceNotes,
        terms: 'Offline payment workflow. Company access is activated independently of payment verification.',
        company_snapshot: {
          company_name: tradeName,
          legal_name: legalName,
          company_code: company.company_code,
          gstin: gstin || '',
          pan: pan || '',
          cin: cin || '',
          email: companyEmail,
          phone: companyPhone,
          address: [addressLine1, addressLine2, text(body?.city, 100), text(body?.state, 100), postalCode, country].filter(Boolean).join(', '),
        },
        plan_snapshot: {
          plan_key: plan.plan_key,
          plan_name: plan.name,
          billing_cycle_months: billingCycle,
          base_price: money2(basePrice),
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          discount_reason: discountReason || '',
          net_price: netPrice,
          limits: plan.limits || {},
          primary_fleet: primaryFleet,
          enabled_fleets: enabledPacks,
          plan_revision: plan.revision || null,
        },
        created_by: actorUserId,
        updated_by: actorUserId,
      }).select('*').single();
      if (invoiceResult.error) throw invoiceResult.error;
      invoice = invoiceResult.data;
      const itemResult = await supabaseAdmin.from('developer_company_invoice_items').insert({
        invoice_id: invoice.id,
        description: `${plan.name} subscription — ${billingCycle} month${billingCycle === 1 ? '' : 's'}`,
        quantity: 1,
        rate: money2(basePrice),
        discount: discountAmount,
        tax_rate: 0,
        hsn_sac: '',
        amount: netPrice,
        sort_order: 0,
      });
      if (itemResult.error) throw itemResult.error;
      mark('invoice');
    } else {
      mark('invoice');
    }

    if (photo) {
      currentStage = 'owner_photo';
      const path = `company/${company.id}/users/${ownerUserId}.${photo.extension}`;
      const upload = await supabaseAdmin.storage.from('company-profile-photos').upload(path, photo.bytes, {
        contentType: `image/${photo.mime}`,
        upsert: true,
      });
      if (upload.error) {
        warnings.push('OWNER_PHOTO_UPLOAD_FAILED');
      } else {
        ownerPhotoPath = path;
        const photoUpdate = await supabaseAdmin.from('company_portal_user_profiles').update({ photo_path: path, updated_at: new Date().toISOString() }).eq('company_id', company.id).eq('user_id', ownerUserId);
        if (photoUpdate.error) warnings.push('OWNER_PHOTO_PROFILE_UPDATE_FAILED');
      }
    }
    mark('owner_photo');

    if (ownerWasCreated) {
      currentStage = 'password_link';
      const passwordLink = await sendOwnerSetPasswordLink(supabaseAdmin, company.company_code, ownerEmail);
      passwordLinkSent = passwordLink.ok;
      if (!passwordLink.ok) warnings.push(passwordLink.code || 'OWNER_PASSWORD_LINK_SEND_FAILED');
    } else {
      warnings.push('OWNER_ACCOUNT_REUSED_EXISTING_PASSWORD');
    }
    mark('password_link');

    const refreshed = (await getCompanies(supabaseAdmin)).find((item) => item.id === company.id) || {
      ...company,
      profile,
    };
    mark('complete');

    await writeHistory(supabaseAdmin, actorUserId, 'company', company.id, 'create', null, {
      company: refreshed,
      onboarding: {
        account_type: accountType,
        primary_fleet: primaryFleet,
        enabled_fleets: enabledPacks,
        plan_key: planKey || null,
        billing_cycle_months: billingCycle,
        trial_weeks: trialWeeks,
        discount_percent: discountPercent,
        discount_reason: discountReason || null,
        invoice_id: invoice?.id || null,
        owner_user_id: ownerUserId,
        owner_account_reused: !ownerWasCreated,
        password_link_sent: passwordLinkSent,
        warnings,
      },
    });

    return {
      status: 201,
      payload: {
        ok: true,
        company: refreshed,
        owner: {
          userId: ownerUserId,
          reused: !ownerWasCreated,
          passwordLinkSent,
          photoPath: ownerPhotoPath,
        },
        invoice: invoice ? {
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          total: Number(invoice.grand_total || 0),
          status: invoice.status,
        } : null,
        commercial: accountType === 'trial'
          ? { accountType, trialWeeks, startDate: subscriptionStart, endDate: trialEndDate }
          : { accountType, planKey, billingCycle, startDate: subscriptionStart, endDate: subscriptionEndDate, basePrice, discountPercent, discountAmount, netPrice },
        provisioning: {
          steps: stageSteps.map((key) => ({ key, complete: completed.includes(key) })),
          warnings,
        },
      },
    };
  } catch (error) {
    const rollback = [];
    const rollbackError = [];
    if (company?.id) {
      try {
        const inv = await supabaseAdmin.from('developer_company_invoices').delete().eq('company_id', company.id);
        if (inv.error) throw inv.error;
        rollback.push('invoices');
      } catch (cleanupError) { rollbackError.push(`invoices:${cleanupError?.message || cleanupError}`); }
      try {
        const deleted = await supabaseAdmin.from('companies').delete().eq('id', company.id);
        if (deleted.error) throw deleted.error;
        rollback.push('company_cascade');
      } catch (cleanupError) { rollbackError.push(`company:${cleanupError?.message || cleanupError}`); }
    }
    if (ownerWasCreated && ownerUser?.id) {
      try {
        const deletedUser = await supabaseAdmin.auth.admin.deleteUser(ownerUser.id);
        if (deletedUser.error) throw deletedUser.error;
        rollback.push('owner_auth');
      } catch (cleanupError) { rollbackError.push(`owner_auth:${cleanupError?.message || cleanupError}`); }
    }
    console.error('Create Company provisioning failed:', currentStage, error?.message || error, rollbackError);
    return {
      status: 500,
      payload: {
        ok: false,
        code: error?.code || 'COMPANY_PROVISIONING_FAILED',
        stage: currentStage,
        rollback: {
          complete: rollbackError.length === 0,
          cleaned: rollback,
          errors: rollbackError,
        },
      },
    };
  }
}

async function updateCompanyProfile({ supabaseAdmin, actorUserId, body, currentCompany }) {
  const profile = normalizeCompanyProfile(body);
  if (!profile) {
    return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_PROFILE' } };
  }

  const companyName = text(body?.companyName ?? currentCompany.company_name, 180);
  const requestedSlug = normalizeSlug(body?.subdomainSlug ?? currentCompany.subdomain_slug);
  if (!companyName || !requestedSlug) {
    return { status: 400, payload: { ok: false, code: 'INVALID_COMPANY_PROFILE' } };
  }

  if (requestedSlug !== currentCompany.subdomain_slug) {
    const { data: duplicate, error: duplicateError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('subdomain_slug', requestedSlug)
      .neq('id', currentCompany.id)
      .limit(1);
    if (duplicateError) throw duplicateError;
    if ((duplicate || []).length) {
      return { status: 409, payload: { ok: false, code: 'COMPANY_SLUG_EXISTS' } };
    }
  }

  const { data: beforeProfile, error: beforeProfileError } = await supabaseAdmin
    .from('developer_company_profiles')
    .select('*')
    .eq('company_id', currentCompany.id)
    .maybeSingle();
  if (beforeProfileError) throw beforeProfileError;

  const expectedRevision = Number(body?.expectedRevision || beforeProfile?.revision || 0);
  if (beforeProfile && Number(beforeProfile.revision) !== expectedRevision) {
    return { status: 409, payload: { ok: false, code: 'REVISION_CONFLICT' } };
  }

  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .update({ company_name: companyName, subdomain_slug: requestedSlug })
    .eq('id', currentCompany.id)
    .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
    .single();
  if (companyError) throw companyError;

  const nextRevision = beforeProfile ? expectedRevision + 1 : 1;
  const { data: savedProfile, error: profileError } = await supabaseAdmin
    .from('developer_company_profiles')
    .upsert({
      company_id: currentCompany.id,
      ...profile,
      status_before_suspend: beforeProfile?.status_before_suspend || null,
      created_via: beforeProfile?.created_via || 'developer_cpanel',
      revision: nextRevision,
      created_by: beforeProfile?.created_by || actorUserId,
      updated_by: actorUserId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id' })
    .select('*')
    .single();
  if (profileError) throw profileError;

  await writeHistory(
    supabaseAdmin,
    actorUserId,
    'company_profile',
    currentCompany.id,
    'update',
    { company: currentCompany, profile: beforeProfile },
    { company, profile: savedProfile }
  );

  return { status: 200, payload: { ok: true, company: { ...company, profile: savedProfile } } };
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

  if (action === 'update_profile') {
    return updateCompanyProfile({
      supabaseAdmin,
      actorUserId,
      body,
      currentCompany: beforeCompany,
    });
  }

  if (action === 'suspend') {
    const reasonCategory = text(body?.reasonCategory, 80);
    const reasonNote = text(body?.reasonNote, 1000);
    if (body?.source === 'all_companies' && !reasonCategory) {
      return { status: 400, payload: { ok: false, code: 'LIFECYCLE_REASON_REQUIRED' } };
    }
    if (beforeCompany.status === 'suspended') {
      return { status: 200, payload: { ok: true, company: beforeCompany } };
    }

    const { data: existingProfile, error: profileReadError } = await supabaseAdmin
      .from('developer_company_profiles')
      .select('company_id,status_before_suspend,revision')
      .eq('company_id', companyId)
      .maybeSingle();
    if (profileReadError) throw profileReadError;

    const { error: lifecycleError } = await supabaseAdmin
      .from('developer_company_profiles')
      .upsert({
        company_id: companyId,
        status_before_suspend: beforeCompany.status,
        revision: Number(existingProfile?.revision || 0) + 1,
        updated_by: actorUserId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id' });
    if (lifecycleError) throw lifecycleError;

    const { data, error } = await supabaseAdmin
      .from('companies')
      .update({ status: 'suspended' })
      .eq('id', companyId)
      .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
      .single();
    if (error) throw error;

    const { error: sessionRevokeError } = await supabaseAdmin
      .from('security_sessions')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoke_reason: 'COMPANY_SUSPENDED_BY_DEVELOPER',
      })
      .eq('company_id', companyId)
      .eq('status', 'active');
    if (sessionRevokeError) throw sessionRevokeError;

    await writeHistory(
      supabaseAdmin,
      actorUserId,
      'company',
      companyId,
      'suspend',
      beforeCompany,
      { company: data, reason: { category: reasonCategory || 'not_supplied', note: reasonNote } }
    );
    return { status: 200, payload: { ok: true, company: data } };
  }

  if (action === 'restore') {
    const reasonCategory = text(body?.reasonCategory, 80);
    const reasonNote = text(body?.reasonNote, 1000);
    if (body?.source === 'all_companies' && !reasonCategory) {
      return { status: 400, payload: { ok: false, code: 'LIFECYCLE_REASON_REQUIRED' } };
    }
    if (beforeCompany.status !== 'suspended') {
      return { status: 409, payload: { ok: false, code: 'COMPANY_NOT_SUSPENDED' } };
    }

    const [{ data: lifecycle, error: lifecycleError }, { data: subscription, error: subscriptionError }] = await Promise.all([
      supabaseAdmin
        .from('developer_company_profiles')
        .select('status_before_suspend')
        .eq('company_id', companyId)
        .maybeSingle(),
      supabaseAdmin
        .from('subscriptions')
        .select('status,trial_end_at')
        .eq('company_id', companyId)
        .maybeSingle(),
    ]);
    if (lifecycleError) throw lifecycleError;
    if (subscriptionError) throw subscriptionError;

    let restoreStatus = lifecycle?.status_before_suspend;
    if (!['pending_confirmation', 'trial_active', 'trial_expired', 'active'].includes(restoreStatus)) {
      restoreStatus = ['trial_active', 'trial_expired', 'active'].includes(subscription?.status)
        ? subscription.status
        : 'active';
    }
    if (
      restoreStatus === 'trial_active' &&
      subscription?.trial_end_at &&
      Date.parse(subscription.trial_end_at) <= Date.now()
    ) {
      restoreStatus = 'trial_expired';
    }

    const { data, error } = await supabaseAdmin
      .from('companies')
      .update({ status: restoreStatus })
      .eq('id', companyId)
      .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
      .single();
    if (error) throw error;

    await supabaseAdmin
      .from('developer_company_profiles')
      .update({
        status_before_suspend: null,
        updated_by: actorUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', companyId);

    await writeHistory(
      supabaseAdmin,
      actorUserId,
      'company',
      companyId,
      'restore',
      beforeCompany,
      { company: data, reason: { category: reasonCategory || 'not_supplied', note: reasonNote } }
    );
    return { status: 200, payload: { ok: true, company: data } };
  }

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
      if (resource === 'company-directory') {
        const directory = await getCompanyDirectory(auth.supabaseAdmin, req.query || {});
        return send(res, 200, { ok: true, ...directory });
      }
      if (resource === 'company-create-metadata') {
        return send(res, 200, { ok: true, ...(await getCompanyCreateMetadata(auth.supabaseAdmin)) });
      }
      if (resource === 'company-slug-preview') {
        const result = await getCompanySlugPreview(auth.supabaseAdmin, req.query || {});
        return send(res, result.status, result.payload);
      }
      if (resource === 'postal-lookup') {
        const result = await lookupPostalCode(req.query || {});
        return send(res, result.status, result.payload);
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

    if (bodyResource === 'gst-verify' && req.method === 'POST') {
      result = await verifyGstin(body);
    } else if (bodyResource === 'companies' && req.method === 'POST') {
      result = await createCompany({ supabaseAdmin: auth.supabaseAdmin, actorUserId: auth.user.id, body });
    } else if (bodyResource === 'companies' && req.method === 'PATCH') {
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
