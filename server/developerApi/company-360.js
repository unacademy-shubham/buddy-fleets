import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../auth/requireDeveloperSession.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECURITY_RISK_EVENT_TYPES = [
  'LOGIN_PASSWORD_FAILED',
  'LOCKED_ACCOUNT_LOGIN_ATTEMPT',
  'MFA_CODE_FAILED',
  'PORTAL_SESSION_AUTH_INVALID',
  'PORTAL_AUTHORIZATION_REJECTED',
  'ACCOUNT_SECURITY_LOCKED',
  'PORTAL_SESSION_BROWSER_CHANGED',
  'PORTAL_SESSION_IP_CHANGED',
  'HANDOFF_BROWSER_CHANGED',
];

function send(res, status, payload) {
  setDeveloperApiHeaders(res);
  return res.status(status).json(payload);
}
function clean(value, max = 5000) { return String(value ?? '').trim().slice(0, max); }
function money(value) { const n = Number(value); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; }
function asDate(value) { if (!value) return null; const t = Date.parse(value); return Number.isFinite(t) ? new Date(t).toISOString().slice(0,10) : undefined; }

function daysFromNow(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.ceil((date.getTime() - today) / 86400000);
}

function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function usageMetric(key, label, used, limit, target) {
  const normalizedUsed = Math.max(0, Number(used || 0));
  const normalizedLimit = limit === null || limit === undefined || limit === '' ? null : Number(limit);
  const finiteLimit = Number.isFinite(normalizedLimit) && normalizedLimit >= 0 ? normalizedLimit : null;
  const percent = finiteLimit && finiteLimit > 0 ? clampPercent((normalizedUsed / finiteLimit) * 100) : 0;
  const status = finiteLimit === null || finiteLimit === 0
    ? 'healthy'
    : normalizedUsed >= finiteLimit
      ? 'critical'
      : percent >= 80
        ? 'warning'
        : 'healthy';
  return { key, label, used: normalizedUsed, limit: finiteLimit, percent, status, target };
}

function humanAction(value) {
  return clean(value, 160).replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function activityCategory(action = '', domain = '') {
  const value = `${domain} ${action}`.toLowerCase();
  if (/payment|invoice|receipt|billing/.test(value)) return 'billing';
  if (/employee|role|access|password/.test(value)) return 'access';
  if (/module|fleet|portal|override|config/.test(value)) return 'configuration';
  if (/security|session|login|lock/.test(value)) return 'security';
  if (/announcement|communication/.test(value)) return 'communication';
  if (/document|kyc/.test(value)) return 'documents';
  if (/site|branch/.test(value)) return 'company';
  return 'company';
}

function activityTitle(action = '') {
  const titles = {
    employee_create: 'Employee added',
    employee_update: 'Employee updated',
    employee_password_reset: 'Employee password reset',
    block_employee: 'Employee blocked',
    unblock_employee: 'Employee unblocked',
    disable_employee: 'Employee disabled',
    fleet_packs_set: 'Fleet Pack configuration changed',
    module_override_save: 'Module override changed',
    module_override_clear: 'Module override cleared',
    invoice_create: 'Invoice generated',
    payment_record: 'Payment recorded',
    payment_verify: 'Payment verified',
    document_add: 'Document added',
    verify_document: 'Document verified',
    reject_document: 'Document rejected',
    profile_update: 'Company profile updated',
    internal_profile_update: 'Internal ownership updated',
    site_create: 'Site created',
    site_update: 'Site updated',
    announcement_publish: 'Announcement published',
    portal_config_save: 'Portal configuration changed',
    bulk_import_vehicles: 'Vehicle Master bulk import completed',
    bulk_import_drivers: 'Driver Master bulk import completed',
    suspend: 'Company suspended',
    restore: 'Company restored',
    update_trial: 'Trial updated',
  };
  return titles[action] || humanAction(action) || 'Company activity';
}

function activityDescription(action = '', payload = {}) {
  if (action === 'payment_verify' || action === 'payment_record') {
    const amount = Number(payload?.amount);
    return Number.isFinite(amount) ? `₹${amount.toLocaleString('en-IN')} payment` : 'Billing record updated';
  }
  if (action === 'invoice_create') {
    const number = clean(payload?.invoice_number, 120);
    const total = Number(payload?.total);
    if (number && Number.isFinite(total)) return `${number} · ₹${total.toLocaleString('en-IN')}`;
    return number || 'Invoice created';
  }
  if (action === 'fleet_packs_set') {
    const primary = clean(payload?.primary_pack, 120);
    return primary ? `Primary pack: ${primary}` : 'Fleet Pack access updated';
  }
  if (action === 'module_override_save' || action === 'module_override_clear') {
    const moduleKey = clean(payload?.module_key, 160);
    return moduleKey ? `Module: ${moduleKey}` : 'Module access updated';
  }
  if (action === 'announcement_publish') {
    const recipients = Number(payload?.recipients || 0);
    return recipients ? `Delivered to ${recipients} recipient${recipients === 1 ? '' : 's'}` : 'Company announcement updated';
  }
  if (action.startsWith('bulk_import_')) {
    const imported = Number(payload?.imported || 0);
    return `${imported} record${imported === 1 ? '' : 's'} imported`;
  }
  const role = clean(payload?.role_key, 100);
  const status = clean(payload?.status, 100);
  if (role) return `Role: ${role}`;
  if (status) return `Status: ${status}`;
  return '';
}

function buildOverviewIntelligence({
  company, profile, subscription, subscriptionContext, effectiveLimits, provisioningHealth,
  employees, invoices, payments, documents, portalAccess, vehicleCount, sites, activeSessionCount,
  securityEvents, securityAlertCount24h, userSecurity, recentActivity,
}) {
  const now = Date.now();
  const activeEmployees = (employees || []).filter((employee) => employee.status === 'active').length;
  const blockedEmployees = (employees || []).filter((employee) => employee.status === 'blocked').length;
  const activeSites = (sites || []).filter((site) => site.status === 'active').length;
  const vehiclesUsed = Math.max(0, Number(vehicleCount || 0));
  const userLimit = effectiveLimits?.users ?? null;
  const vehicleLimit = effectiveLimits?.vehicles_max ?? effectiveLimits?.vehicles ?? null;
  const siteLimit = effectiveLimits?.sites ?? null;
  const usage = [
    usageMetric('employees', 'Employees', activeEmployees, userLimit, 'employees'),
    usageMetric('vehicles', 'Vehicles', vehiclesUsed, vehicleLimit, 'usage'),
    usageMetric('sites', 'Sites', activeSites, siteLimit, 'sites'),
  ];

  const verifiedPaid = (payments || []).filter((payment) => payment.status === 'verified').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const totalInvoiced = (invoices || []).reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0);
  const outstanding = Math.max(0, totalInvoiced - verifiedPaid);
  const today = new Date().toISOString().slice(0, 10);
  const overdueInvoices = (invoices || []).filter((invoice) => {
    if (!invoice.due_date || invoice.due_date >= today) return false;
    return !['paid', 'cancelled', 'void'].includes(String(invoice.status || '').toLowerCase()) && Number(invoice.paid_amount || 0) < Number(invoice.grand_total || 0);
  });
  const pendingPayments = (payments || []).filter((payment) => ['submitted', 'pending'].includes(String(payment.status || '').toLowerCase()));

  const expiredDocuments = (documents || []).filter((document) => {
    const days = daysFromNow(document.expiry_date);
    return days !== null && days < 0;
  });
  const expiringDocuments = (documents || []).filter((document) => {
    const days = daysFromNow(document.expiry_date);
    return days !== null && days >= 0 && days <= 30;
  });
  const pendingDocuments = (documents || []).filter((document) => ['pending', 'submitted'].includes(String(document.status || '').toLowerCase()));

  const activeSessions = Math.max(0, Number(activeSessionCount || 0));
  const securityWindow = now - 24 * 60 * 60 * 1000;
  const riskySecurityTypes = new Set(SECURITY_RISK_EVENT_TYPES);
  const securityAlerts24h = (securityEvents || []).filter((event) => riskySecurityTypes.has(event.event_type) && new Date(event.created_at).getTime() >= securityWindow);
  const securityAlertTotal24h = Math.max(Number(securityAlertCount24h || 0), securityAlerts24h.length);
  const failedAuth24h = securityAlerts24h.filter((event) => /FAILED|REJECTED|LOCKED/.test(event.event_type)).length;
  const lockedUsers = (userSecurity || []).filter((row) => row.is_locked).length;
  const forcePasswordChange = (portalAccess || []).filter((row) => row.force_password_change).length;

  const lifecycleAccess = clean(subscriptionContext?.lifecycle_access, 40) || 'blocked';
  const lifecycleState = clean(subscriptionContext?.lifecycle_state, 60) || clean(subscription?.status, 60) || clean(company?.status, 60);

  const diagnostics = [
    { key: 'profile', label: 'Company profile', ok: Boolean(profile), detail: profile ? 'Profile record available' : 'Company profile is missing', target: 'profile' },
    { key: 'subscription', label: 'Subscription record', ok: Boolean(subscription), detail: subscription ? humanAction(subscription.status || 'configured') : 'Subscription is missing', target: 'subscription' },
    { key: 'portal_settings', label: 'Portal settings', ok: Boolean(provisioningHealth.portal_settings), detail: provisioningHealth.portal_settings ? 'Portal settings provisioned' : 'Portal settings missing', target: 'portal' },
    { key: 'primary_site', label: 'Primary site', ok: Boolean(provisioningHealth.primary_site), detail: provisioningHealth.primary_site ? 'Active primary site available' : 'Active primary site missing', target: 'sites' },
    { key: 'fleet_pack', label: 'Fleet Pack selected', ok: Boolean(provisioningHealth.fleet_pack_selected), detail: provisioningHealth.fleet_pack_selected ? 'Explicit fleet pack selection complete' : 'Fleet Pack selection is pending', target: 'fleet' },
    { key: 'system_roles', label: 'System roles', ok: Boolean(provisioningHealth.system_roles), detail: provisioningHealth.system_roles ? 'System role foundation available' : 'System roles incomplete', target: 'employees' },
    { key: 'owner_employee', label: 'Owner employee record', ok: Boolean(provisioningHealth.developer_owner_employee), detail: provisioningHealth.developer_owner_employee ? 'Developer owner employee linked' : 'Owner employee linkage missing', target: 'employees' },
    { key: 'owner_access', label: 'Owner runtime access', ok: Boolean(provisioningHealth.owner_access), detail: provisioningHealth.owner_access ? 'Owner portal access linked' : 'Owner portal access missing', target: 'employees' },
    { key: 'owner_profile', label: 'Owner portal profile', ok: Boolean(provisioningHealth.owner_profile), detail: provisioningHealth.owner_profile ? 'Owner portal profile available' : 'Owner portal profile missing', target: 'employees' },
    { key: 'portal_config', label: 'Portal configuration', ok: Boolean(provisioningHealth.portal_config), detail: provisioningHealth.portal_config ? 'Developer portal configuration available' : 'Portal configuration missing', target: 'portal' },
  ];
  const readinessPassed = diagnostics.filter((item) => item.ok).length;
  const provisioning = {
    percent: diagnostics.length ? Math.round((readinessPassed / diagnostics.length) * 100) : 0,
    passed: readinessPassed,
    total: diagnostics.length,
    ready: readinessPassed === diagnostics.length,
    steps: diagnostics,
  };

  const checks = [];
  const addCheck = (key, label, status, summary, target) => checks.push({ key, label, status, summary, target });

  const failedDiagnostics = diagnostics.filter((item) => !item.ok);
  const failedProvisioning = failedDiagnostics.length;
  addCheck(
    'provisioning', 'Provisioning',
    failedProvisioning === 0 ? 'healthy' : failedProvisioning >= 3 ? 'critical' : 'warning',
    failedProvisioning === 0 ? 'Tenant foundation is fully provisioned' : `${failedProvisioning} provisioning check${failedProvisioning === 1 ? '' : 's'} need attention`,
    failedDiagnostics[0]?.target || 'overview'
  );

  addCheck(
    'subscription', 'Subscription',
    !subscription ? 'critical' : lifecycleAccess === 'blocked' ? 'critical' : lifecycleAccess === 'read_only' ? 'warning' : 'healthy',
    !subscription ? 'Subscription record is missing' : lifecycleAccess === 'blocked' ? `${humanAction(lifecycleState)} · runtime access blocked` : lifecycleAccess === 'read_only' ? `${humanAction(lifecycleState)} · runtime is read only` : `${humanAction(lifecycleState)} · runtime access healthy`,
    'subscription'
  );

  addCheck(
    'billing', 'Billing',
    overdueInvoices.length > 0 ? 'critical' : outstanding > 0 || pendingPayments.length > 0 ? 'warning' : 'healthy',
    overdueInvoices.length > 0 ? `${overdueInvoices.length} overdue invoice${overdueInvoices.length === 1 ? '' : 's'} · ₹${outstanding.toLocaleString('en-IN')} outstanding` : outstanding > 0 ? `₹${outstanding.toLocaleString('en-IN')} outstanding` : pendingPayments.length > 0 ? `${pendingPayments.length} payment${pendingPayments.length === 1 ? '' : 's'} pending verification` : 'Billing is clear',
    'billing'
  );

  addCheck(
    'security', 'Security',
    lockedUsers > 0 ? 'critical' : failedAuth24h >= 5 || securityAlertTotal24h > 0 ? 'warning' : 'healthy',
    lockedUsers > 0 ? `${lockedUsers} locked account${lockedUsers === 1 ? '' : 's'}` : securityAlertTotal24h > 0 ? `${securityAlertTotal24h} security alert${securityAlertTotal24h === 1 ? '' : 's'} in the last 24 hours` : `${activeSessions} active session${activeSessions === 1 ? '' : 's'} · no recent security alerts`,
    'security'
  );

  addCheck(
    'documents', 'Documents & KYC',
    expiredDocuments.length > 0 ? 'critical' : expiringDocuments.length > 0 || pendingDocuments.length > 0 || documents.length === 0 ? 'warning' : 'healthy',
    expiredDocuments.length > 0 ? `${expiredDocuments.length} expired document${expiredDocuments.length === 1 ? '' : 's'}` : expiringDocuments.length > 0 ? `${expiringDocuments.length} document${expiringDocuments.length === 1 ? '' : 's'} expiring within 30 days` : pendingDocuments.length > 0 ? `${pendingDocuments.length} document${pendingDocuments.length === 1 ? '' : 's'} pending verification` : documents.length === 0 ? 'No company documents uploaded' : 'Documents are current',
    'documents'
  );

  const usageCritical = usage.filter((item) => item.status === 'critical');
  const usageWarning = usage.filter((item) => item.status === 'warning');
  addCheck(
    'usage', 'Usage & Limits',
    usageCritical.length ? 'critical' : usageWarning.length ? 'warning' : 'healthy',
    usageCritical.length ? `${usageCritical.map((item) => item.label).join(', ')} limit reached` : usageWarning.length ? `${usageWarning.map((item) => item.label).join(', ')} above 80% of plan limit` : 'Usage is within plan limits',
    'usage'
  );

  addCheck(
    'portal', 'Portal Setup',
    !provisioningHealth.portal_settings || !provisioningHealth.portal_config ? 'critical' : !provisioningHealth.fleet_pack_selected || !provisioningHealth.owner_access ? 'warning' : 'healthy',
    !provisioningHealth.portal_settings ? 'Portal settings are missing' : !provisioningHealth.portal_config ? 'Portal configuration is missing' : !provisioningHealth.fleet_pack_selected ? 'Fleet Pack selection is pending' : !provisioningHealth.owner_access ? 'Owner access linkage needs repair' : 'Portal control-plane setup is complete',
    'portal'
  );

  const points = { healthy: 100, warning: 60, critical: 20 };
  const score = checks.length ? Math.round(checks.reduce((sum, item) => sum + (points[item.status] || 0), 0) / checks.length) : 0;
  const overallStatus = checks.some((item) => item.status === 'critical') ? 'critical' : checks.some((item) => item.status === 'warning') ? 'warning' : 'healthy';

  const attention = [];
  const addAttention = (key, severity, title, detail, target) => attention.push({ key, severity, title, detail, target });
  if (!subscription) addAttention('subscription_missing', 'critical', 'Subscription missing', 'This tenant does not have a subscription record.', 'subscription');
  else if (lifecycleAccess === 'blocked') addAttention('lifecycle_blocked', 'critical', 'Runtime access blocked', `${humanAction(lifecycleState)} currently resolves to blocked access.`, 'subscription');
  else if (lifecycleAccess === 'read_only') addAttention('lifecycle_read_only', 'warning', 'Runtime is read only', `${humanAction(lifecycleState)} currently limits the company portal to read-only access.`, 'subscription');
  if (overdueInvoices.length) addAttention('overdue_invoices', 'critical', 'Invoice overdue', `${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? '' : 's'} overdue · ₹${outstanding.toLocaleString('en-IN')} outstanding.`, 'billing');
  else if (outstanding > 0) addAttention('outstanding', 'warning', 'Outstanding balance', `₹${outstanding.toLocaleString('en-IN')} remains outstanding.`, 'billing');
  if (pendingPayments.length) addAttention('pending_payments', 'warning', 'Payment verification pending', `${pendingPayments.length} submitted payment${pendingPayments.length === 1 ? '' : 's'} need verification.`, 'billing');
  if (lockedUsers > 0) addAttention('locked_users', 'critical', 'Locked user account', `${lockedUsers} tenant user${lockedUsers === 1 ? '' : 's'} currently locked.`, 'security');
  else if (securityAlertTotal24h > 0) addAttention('security_events', 'warning', 'Recent security events', `${securityAlertTotal24h} security alert${securityAlertTotal24h === 1 ? '' : 's'} recorded in the last 24 hours.`, 'security');
  if (forcePasswordChange > 0) addAttention('forced_password', 'warning', 'Password change pending', `${forcePasswordChange} user${forcePasswordChange === 1 ? '' : 's'} must change password on next login.`, 'employees');
  if (expiredDocuments.length) addAttention('expired_documents', 'critical', 'Company document expired', `${expiredDocuments.length} document${expiredDocuments.length === 1 ? '' : 's'} have expired.`, 'documents');
  else if (expiringDocuments.length) addAttention('expiring_documents', 'warning', 'Document expiry approaching', `${expiringDocuments.length} document${expiringDocuments.length === 1 ? '' : 's'} expire within 30 days.`, 'documents');
  if (!provisioningHealth.fleet_pack_selected) addAttention('fleet_pack_pending', 'warning', 'Fleet Pack setup pending', 'Explicit Fleet Pack selection is incomplete.', 'fleet');
  if (!provisioningHealth.primary_site) addAttention('primary_site_missing', 'warning', 'Primary site missing', 'No active primary site is configured.', 'sites');
  if (!provisioningHealth.owner_access || !provisioningHealth.owner_profile || !provisioningHealth.developer_owner_employee) addAttention('owner_linkage', 'critical', 'Owner provisioning incomplete', 'Owner identity, employee profile and runtime access are not fully aligned.', 'employees');
  for (const metric of usage.filter((item) => item.status !== 'healthy')) {
    addAttention(`usage_${metric.key}`, metric.status === 'critical' ? 'critical' : 'warning', `${metric.label} ${metric.status === 'critical' ? 'limit reached' : 'near plan limit'}`, metric.limit === null ? `${metric.used} in use.` : `${metric.used} of ${metric.limit} in use (${metric.percent}%).`, metric.target);
  }
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  attention.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));

  return {
    generatedAt: new Date().toISOString(),
    health: { score, status: overallStatus, checks },
    attention,
    diagnostics,
    provisioning,
    usage,
    billing: { totalInvoiced, verifiedPaid, outstanding, overdueCount: overdueInvoices.length, pendingPayments: pendingPayments.length },
    security: { activeSessions, lockedUsers, failedAuth24h, alerts24h: securityAlertTotal24h, blockedEmployees },
    access: { forcePasswordChange },
    recentActivity: (recentActivity || []).slice(0, 12),
  };
}

const BULK_IMPORT_MAX_ROWS = 1000;
const IMPORT_DATE = /^\d{4}-\d{2}-\d{2}$/;

function importDate(value) {
  const text = clean(value, 30);
  if (!text) return null;
  if (!IMPORT_DATE.test(text)) return undefined;
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) return undefined;
  return text;
}

function importNumber(value, { integer = false, min = 0, max = Number.POSITIVE_INFINITY } = {}) {
  const text = clean(value, 80).replace(/,/g, '');
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) return undefined;
  return number;
}

function importMobile(value) {
  const text = clean(value, 30);
  if (!text) return '';
  return /^[0-9+()\-\s]{7,30}$/.test(text) ? text : undefined;
}

function importSiteResolver(sites) {
  const byCode = new Map();
  const byName = new Map();
  for (const site of sites || []) {
    if (site.code) byCode.set(clean(site.code, 80).toUpperCase(), site);
    if (site.name) byName.set(clean(site.name, 160).toLowerCase(), site);
  }
  return (value) => {
    const text = clean(value, 160);
    if (!text) return { id: null, site: null };
    const site = byCode.get(text.toUpperCase()) || byName.get(text.toLowerCase()) || null;
    return { id: site?.id || null, site };
  };
}

async function buildBulkImportPlan(db, companyId, importType, inputRows, effectiveLimits = {}) {
  const rows = Array.isArray(inputRows) ? inputRows : [];
  if (!['vehicles', 'drivers'].includes(importType)) {
    return { valid: false, status: 400, code: 'INVALID_IMPORT_TYPE', summary: { total: rows.length, valid: 0, invalid: rows.length }, errors: [{ row: '—', field: 'Import Type', message: 'Supported import types are Vehicle Master and Driver Master.' }] };
  }
  if (!rows.length) {
    return { valid: false, status: 400, code: 'IMPORT_ROWS_REQUIRED', summary: { total: 0, valid: 0, invalid: 0 }, errors: [{ row: '—', field: 'File', message: 'No data rows were supplied.' }] };
  }
  if (rows.length > BULK_IMPORT_MAX_ROWS) {
    return { valid: false, status: 413, code: 'IMPORT_ROW_LIMIT_EXCEEDED', summary: { total: rows.length, valid: 0, invalid: rows.length }, errors: [{ row: '—', field: 'File', message: `Maximum ${BULK_IMPORT_MAX_ROWS.toLocaleString('en-IN')} rows are allowed per import.` }] };
  }

  const [{ data: sites, error: sitesError }, existingResult] = await Promise.all([
    db.from('company_portal_sites').select('id,code,name,status').eq('company_id', companyId),
    importType === 'vehicles'
      ? db.from('company_portal_vehicles').select('vehicle_number').eq('company_id', companyId)
      : db.from('company_portal_drivers').select('driver_code').eq('company_id', companyId),
  ]);
  if (sitesError) throw sitesError;
  if (existingResult.error) throw existingResult.error;

  const resolveSite = importSiteResolver(sites || []);
  const errors = [];
  const invalidRows = new Set();
  const records = [];
  const seen = new Set();
  const existing = new Set(
    (existingResult.data || [])
      .map((record) => importType === 'vehicles' ? clean(record.vehicle_number, 30).toUpperCase() : clean(record.driver_code, 50).toUpperCase())
      .filter(Boolean)
  );
  const addError = (index, field, message) => {
    invalidRows.add(index);
    if (errors.length < 200) errors.push({ row: index + 2, field, message });
  };
  const dateField = (row, index, key, field) => {
    const value = importDate(row?.[key]);
    if (value === undefined) addError(index, field, 'Use YYYY-MM-DD format or leave this field blank.');
    return value === undefined ? null : value;
  };
  const numberField = (row, index, key, field, options) => {
    const value = importNumber(row?.[key], options);
    if (value === undefined) addError(index, field, 'Enter a valid numeric value or leave this field blank.');
    return value === undefined ? null : value;
  };
  const siteField = (row, index, key, field) => {
    const raw = clean(row?.[key], 160);
    if (!raw) return null;
    const resolved = resolveSite(raw);
    if (!resolved.site) {
      addError(index, field, `Site “${raw}” does not belong to this company. Use a Site Code from the template Sites sheet.`);
      return null;
    }
    if (resolved.site.status !== 'active') {
      addError(index, field, `Site “${raw}” is ${resolved.site.status || 'inactive'} and cannot be assigned during import.`);
      return null;
    }
    return resolved.id;
  };

  rows.forEach((row, index) => {
    const beforeErrors = invalidRows.has(index);
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      addError(index, 'Row', 'Invalid row data.');
      return;
    }

    if (importType === 'vehicles') {
      const vehicleNumber = clean(row.vehicle_number, 30).toUpperCase();
      if (!vehicleNumber) addError(index, 'Vehicle Number', 'Vehicle Number is required.');
      if (vehicleNumber && existing.has(vehicleNumber)) addError(index, 'Vehicle Number', `Vehicle ${vehicleNumber} already exists in this company.`);
      if (vehicleNumber && seen.has(vehicleNumber)) addError(index, 'Vehicle Number', `Vehicle ${vehicleNumber} appears more than once in this file.`);
      if (vehicleNumber) seen.add(vehicleNumber);

      const manufacturingYear = numberField(row, index, 'manufacturing_year', 'Manufacturing Year', { integer: true, min: 1900, max: new Date().getFullYear() + 1 });
      const record = {
        company_id: companyId,
        vehicle_number: vehicleNumber,
        vehicle_code: clean(row.vehicle_code, 50) || null,
        vehicle_type: clean(row.vehicle_type, 100) || null,
        body_type: clean(row.body_type, 120) || null,
        ownership: clean(row.ownership, 50) || 'Own',
        home_site_id: siteField(row, index, 'home_site_code', 'Home Site Code'),
        current_site_id: siteField(row, index, 'current_site_code', 'Current Site Code'),
        status: clean(row.status, 30).toLowerCase() || 'available',
        maker: clean(row.maker, 80) || null,
        model: clean(row.model, 80) || null,
        variant: clean(row.variant, 80) || null,
        manufacturing_year: manufacturingYear,
        chassis_number: clean(row.chassis_number, 100) || null,
        engine_number: clean(row.engine_number, 100) || null,
        fuel_type: clean(row.fuel_type, 40) || null,
        gvw: numberField(row, index, 'gvw', 'GVW'),
        unladen_weight: numberField(row, index, 'unladen_weight', 'Unladen Weight'),
        payload_mt: numberField(row, index, 'payload_mt', 'Payload MT'),
        seating_capacity: numberField(row, index, 'seating_capacity', 'Seating Capacity', { integer: true, min: 0 }),
        axle_count: numberField(row, index, 'axle_count', 'Axle Count', { integer: true, min: 0 }),
        tyre_count: numberField(row, index, 'tyre_count', 'Tyre Count', { integer: true, min: 0 }),
        fuel_tank_capacity: numberField(row, index, 'fuel_tank_capacity', 'Fuel Tank Capacity'),
        rc_number: clean(row.rc_number, 80) || null,
        registration_date: dateField(row, index, 'registration_date', 'Registration Date'),
        rc_validity: dateField(row, index, 'rc_validity', 'RC Validity'),
        owner_name: clean(row.owner_name, 150) || null,
        rto: clean(row.rto, 100) || null,
        insurance_policy_no: clean(row.insurance_policy_no, 100) || null,
        insurance_company: clean(row.insurance_company, 120) || null,
        insurance_expiry: dateField(row, index, 'insurance_expiry', 'Insurance Expiry'),
        fitness_no: clean(row.fitness_no, 100) || null,
        fitness_expiry: dateField(row, index, 'fitness_expiry', 'Fitness Expiry'),
        puc_no: clean(row.puc_no, 100) || null,
        puc_expiry: dateField(row, index, 'puc_expiry', 'PUC Expiry'),
        national_permit_no: clean(row.national_permit_no, 100) || null,
        national_permit_expiry: dateField(row, index, 'national_permit_expiry', 'National Permit Expiry'),
        state_permit_no: clean(row.state_permit_no, 100) || null,
        state_permit_expiry: dateField(row, index, 'state_permit_expiry', 'State Permit Expiry'),
        road_tax_expiry: dateField(row, index, 'road_tax_expiry', 'Road Tax Expiry'),
        fastag_reference: clean(row.fastag_reference, 160) || null,
        extra: {},
      };
      if (!invalidRows.has(index) && !beforeErrors) records.push(record);
      return;
    }

    const driverCode = clean(row.driver_code, 50).toUpperCase();
    const fullName = clean(row.full_name, 150);
    const mobile = importMobile(row.mobile);
    if (!driverCode) addError(index, 'Driver Code', 'Driver Code is required for safe duplicate protection.');
    if (!fullName) addError(index, 'Full Name', 'Full Name is required.');
    if (!clean(row.mobile, 30)) addError(index, 'Mobile', 'Mobile is required.');
    else if (mobile === undefined) addError(index, 'Mobile', 'Enter a valid mobile number.');
    if (driverCode && existing.has(driverCode)) addError(index, 'Driver Code', `Driver Code ${driverCode} already exists in this company.`);
    if (driverCode && seen.has(driverCode)) addError(index, 'Driver Code', `Driver Code ${driverCode} appears more than once in this file.`);
    if (driverCode) seen.add(driverCode);
    const email = clean(row.email, 254).toLowerCase();
    if (email && !EMAIL.test(email)) addError(index, 'Email', 'Enter a valid email address or leave this field blank.');
    const bankLast4 = clean(row.bank_account_last4, 4);
    if (bankLast4 && !/^\d{4}$/.test(bankLast4)) addError(index, 'Bank Account Last4', 'Enter exactly the last 4 digits only.');
    const ifsc = clean(row.ifsc, 20).toUpperCase();
    if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) addError(index, 'IFSC', 'Enter a valid 11-character IFSC code.');

    const record = {
      company_id: companyId,
      driver_code: driverCode,
      full_name: fullName,
      father_name: clean(row.father_name, 150) || null,
      dob: dateField(row, index, 'dob', 'DOB'),
      blood_group: clean(row.blood_group, 20) || null,
      mobile: mobile || '',
      alternate_mobile: clean(row.alternate_mobile, 30) || null,
      email: email || null,
      address: clean(row.address, 500) || null,
      city: clean(row.city, 100) || null,
      state: clean(row.state, 100) || null,
      pincode: clean(row.pincode, 12) || null,
      emergency_contact: clean(row.emergency_contact, 100) || null,
      driver_type: clean(row.driver_type, 80) || 'Own Driver',
      joining_date: dateField(row, index, 'joining_date', 'Joining Date'),
      primary_site_id: siteField(row, index, 'primary_site_code', 'Primary Site Code'),
      status: clean(row.status, 30).toLowerCase() || 'active',
      dl_number: clean(row.dl_number, 80) || null,
      dl_class: clean(row.dl_class, 80) || null,
      dl_issue_date: dateField(row, index, 'dl_issue_date', 'DL Issue Date'),
      dl_expiry: dateField(row, index, 'dl_expiry', 'DL Expiry'),
      issuing_rto: clean(row.issuing_rto, 100) || null,
      badge_number: clean(row.badge_number, 80) || null,
      badge_expiry: dateField(row, index, 'badge_expiry', 'Badge Expiry'),
      medical_fitness_date: dateField(row, index, 'medical_fitness_date', 'Medical Fitness Date'),
      police_verification_status: clean(row.police_verification_status, 80) || null,
      payment_type: clean(row.payment_type, 80) || null,
      per_trip_rate: numberField(row, index, 'per_trip_rate', 'Per Trip Rate'),
      daily_allowance: numberField(row, index, 'daily_allowance', 'Daily Allowance'),
      bank_account_last4: bankLast4 || null,
      ifsc: ifsc || null,
      upi_id: clean(row.upi_id, 160) || null,
      financial: {},
      extra: {},
    };
    if (!invalidRows.has(index) && !beforeErrors) records.push(record);
  });

  const invalid = invalidRows.size;
  if (importType === 'vehicles') {
    const rawVehicleLimit = effectiveLimits?.vehicles_max;
    const vehicleLimit = rawVehicleLimit === null || rawVehicleLimit === undefined || rawVehicleLimit === '' ? Number.NaN : Number(rawVehicleLimit);
    if (Number.isFinite(vehicleLimit) && vehicleLimit >= 0 && existing.size + records.length > vehicleLimit) {
      errors.push({ row: '—', field: 'Vehicle Limit', message: `This import would exceed the effective vehicle limit (${existing.size} existing + ${records.length} import > ${vehicleLimit} allowed).` });
    }
  }
  const globallyBlocked = invalid === 0 && errors.length > 0;
  return {
    valid: invalid === 0 && errors.length === 0,
    status: 200,
    code: errors.length === 0 ? null : 'IMPORT_VALIDATION_FAILED',
    records,
    summary: { total: rows.length, valid: globallyBlocked ? 0 : rows.length - invalid, invalid: globallyBlocked ? rows.length : invalid },
    errors,
    errorsTruncated: errors.length >= 200,
  };
}

async function history(db, actorUserId, companyId, action, details = {}) {
  try {
    await db.from('developer_saas_history').insert({
      domain: 'company_360', entity_id: companyId, action,
      before_payload: null, after_payload: details, actor_user_id: actorUserId || null,
    });
  } catch {}
}

async function loadCompany(db, companyId) {
  const { data: company, error } = await db.from('companies')
    .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
    .eq('id', companyId).maybeSingle();
  if (error) throw error;
  if (!company) return null;

  const [
    profileR, subscriptionR, overrideR, plansR, employeesR, invoicesR, paymentsR,
    documentsR, announcementsR, notesR, modulesR, portalR, policiesR, settingsR,
    fleetPacksR, companyModuleOverridesR, sitesR, rolesR, portalAccessR, portalProfilesR, internalProfileR,
    teamMembersR, platformAdminsR, subscriptionContextR, vehiclesR, securitySessionsR, securityEventsR, historyR, portalAuditR,
  ] = await Promise.all([
    db.from('developer_company_profiles').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('subscriptions').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('developer_company_overrides').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('developer_plans').select('*').order('display_order', { ascending: true }),
    db.from('developer_company_employees').select('*').eq('company_id', companyId).order('created_at', { ascending: true }),
    db.from('developer_company_invoices').select('*').eq('company_id', companyId).order('invoice_date', { ascending: false }),
    db.from('developer_company_payments').select('*').eq('company_id', companyId).order('payment_date', { ascending: false }),
    db.from('developer_company_documents').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
    db.from('developer_company_announcements').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100),
    db.from('developer_company_notes').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(200),
    db.from('developer_module_catalog').select('*').order('sort_order', { ascending: true }),
    db.from('developer_company_portal_config').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('developer_lifecycle_access_policy').select('*'),
    db.from('company_portal_settings').select('company_id,fleet_pack,enabled_packs,fleet_pack_selection_status,fleet_pack_selected_at,enabled_modules,company_display_name,default_scope,date_format,time_format,terminology,config').eq('company_id', companyId).maybeSingle(),
    db.from('developer_fleet_packs').select('pack_key,slug,name,short_name,status,display_order').order('display_order', { ascending: true }),
    db.from('developer_company_module_overrides').select('company_id,module_key,enabled,access_level,action_overrides,reason,created_at,updated_at').eq('company_id', companyId).order('updated_at', { ascending: false }),
    db.from('company_portal_sites').select('id,code,name,site_type,address,city,state,pincode,is_primary,status,manager_user_id,created_at,updated_at').eq('company_id', companyId).order('is_primary', { ascending: false }),
    db.from('company_portal_roles').select('id,role_key,name,is_system').eq('company_id', companyId).order('role_key', { ascending: true }),
    db.from('company_portal_user_access').select('company_id,user_id,role_id,role_name,primary_site_id,site_ids,all_sites,force_password_change').eq('company_id', companyId),
    db.from('company_portal_user_profiles').select('company_id,user_id,employee_code,full_name,designation,department,email,mobile').eq('company_id', companyId),
    db.from('developer_company_internal_profiles').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('platform_team_members').select('user_id,status').eq('status','active'),
    db.from('platform_admins').select('user_id,is_active').eq('is_active',true),
    db.rpc('bf_resolve_subscription_context', { p_company_id: companyId }),
    db.from('company_portal_vehicles').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
    db.from('security_sessions').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'active'),
    db.from('security_events').select('id,user_id,event_type,portal_type,ip_address,metadata,created_at', { count: 'exact' }).eq('company_id', companyId).in('event_type', SECURITY_RISK_EVENT_TYPES).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: false }).limit(200),
    db.from('developer_saas_history').select('id,domain,entity_id,action,before_payload,after_payload,actor_user_id,created_at').eq('entity_id', companyId).order('created_at', { ascending: false }).limit(80),
    db.from('company_portal_audit').select('id,user_id,module_key,action_type,entity_type,entity_id,description,before_data,after_data,created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(80),
  ]);
  for (const r of [profileR,subscriptionR,overrideR,plansR,employeesR,invoicesR,paymentsR,documentsR,announcementsR,notesR,modulesR,portalR,policiesR,settingsR,fleetPacksR,companyModuleOverridesR,sitesR,rolesR,portalAccessR,portalProfilesR,internalProfileR,teamMembersR,platformAdminsR,vehiclesR,securitySessionsR,securityEventsR,historyR,portalAuditR]) {
    if (r.error) throw r.error;
  }
  if (subscriptionContextR.error) console.warn('Subscription context resolver unavailable in Company 360:', subscriptionContextR.error.message);

  let ownerAccess = null;
  let ownerBootstrap = null;
  if (company.account_owner_user_id) {
    const [accessR, bootstrapR] = await Promise.all([
      db.rpc('bf_resolve_user_access', { p_company_id: companyId, p_user_id: company.account_owner_user_id }),
      db.rpc('bf_resolve_company_portal_bootstrap', { p_company_id: companyId, p_user_id: company.account_owner_user_id }),
    ]);
    if (!accessR.error) ownerAccess = accessR.data || null;
    if (!bootstrapR.error) ownerBootstrap = bootstrapR.data || null;
  }

  const subscription = subscriptionR.data || null;
  const override = overrideR.data || null;
  const plans = plansR.data || [];
  const subscriptionContext = subscriptionContextR.data || null;
  const planKey = subscriptionContext?.effective_plan_key || (override?.enabled && override?.plan_key ? override.plan_key : subscription?.plan_key || subscription?.plan_id || '');
  const plan = plans.find((p) => p.plan_key === planKey || p.id === planKey) || null;
  const lifecycle = Object.fromEntries((policiesR.data || []).map((policy) => [policy.policy_key, policy.config]));
  const baseLimits = plan?.limits || {};
  const effectiveLimits = { ...baseLimits, ...(override?.enabled ? (override?.limits_override || {}) : {}) };

  let effectiveModules;
  if (Array.isArray(ownerAccess?.modules)) {
    const resolved = new Map(ownerAccess.modules.map((m) => [m.module_key, m]));
    effectiveModules = (modulesR.data || []).map((m) => {
      const access = resolved.get(m.module_key);
      return {
        ...m,
        effective_access: access?.access_level || 'blocked',
        visible: access?.visible === true,
        actions: access?.actions || {},
        plan_access: access?.plan_access || 'blocked',
        company_override: access?.company_override || null,
      };
    });
  } else {
    const planEntitlements = new Set(Array.isArray(plan?.entitlements) ? plan.entitlements : []);
    const overrideEntitlements = new Set(Array.isArray(override?.entitlements_override) ? override.entitlements_override : []);
    const expired = ['trial_expired'].includes(company.status) || ['expired','past_due','trial_expired'].includes(subscription?.status);
    const trial = company.status === 'trial_active' || subscription?.status === 'trial_active';
    const suspended = company.status === 'suspended';
    effectiveModules = (modulesR.data || []).map((m) => {
      let access = planEntitlements.has(m.module_key) ? 'full' : 'blocked';
      if (trial) access = m.trial_access || access;
      if (expired) access = m.expired_access === 'read_only' ? 'read_only' : 'blocked';
      if (suspended) access = 'blocked';
      if (override?.enabled && overrideEntitlements.has(m.module_key)) access = 'full';
      return { ...m, effective_access: access };
    });
  }

  const totalInvoiced = (invoicesR.data || []).reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0);
  const totalPaid = (paymentsR.data || []).filter((payment) => payment.status === 'verified').reduce((sum,payment)=>sum+Number(payment.amount||0),0);
  const portalSettings = settingsR.data || null;
  const provisioningHealth = {
    portal_settings: Boolean(portalSettings),
    fleet_pack_selected: portalSettings?.fleet_pack_selection_status === 'selected',
    primary_site: (sitesR.data || []).some((site) => site.is_primary && site.status === 'active'),
    system_roles: (rolesR.data || []).filter((role) => role.is_system).length >= 6,
    owner_access: Boolean((portalAccessR.data || []).find((row) => row.user_id === company.account_owner_user_id)),
    owner_profile: Boolean((portalProfilesR.data || []).find((row) => row.user_id === company.account_owner_user_id)),
    developer_owner_employee: Boolean((employeesR.data || []).find((row) => row.user_id === company.account_owner_user_id)),
    portal_config: Boolean(portalR.data),
    subscription: Boolean(subscription),
  };

  const companyUserIds = [...new Set([
    ...(portalAccessR.data || []).map((row) => row.user_id),
    ...(employeesR.data || []).map((row) => row.user_id),
  ].filter(Boolean))];

  let userSecurity = [];
  for (let offset = 0; offset < companyUserIds.length; offset += 200) {
    const batch = companyUserIds.slice(offset, offset + 200);
    const userSecurityR = await db.from('user_security')
      .select('user_id,failed_password_attempts,is_locked,locked_at,lock_reason,last_failed_at,last_successful_login_at,failed_mfa_attempts,mfa_enabled')
      .in('user_id', batch);
    if (userSecurityR.error) throw userSecurityR.error;
    userSecurity = userSecurity.concat(userSecurityR.data || []);
  }

  const actorIds = [...new Set([
    ...(historyR.data || []).map((row) => row.actor_user_id),
    ...(portalAuditR.data || []).map((row) => row.user_id),
  ].filter(Boolean))];
  let actorProfiles = [];
  if (actorIds.length) {
    const actorProfilesR = await db.from('profiles').select('id,full_name,email').in('id', actorIds);
    if (actorProfilesR.error) throw actorProfilesR.error;
    actorProfiles = actorProfilesR.data || [];
  }
  const actorMap = new Map(actorProfiles.map((row) => [row.id, row.full_name || row.email || 'System']));

  const historyActivity = (historyR.data || []).map((row) => ({
    id: `developer:${row.id}`,
    source: 'developer',
    category: activityCategory(row.action, row.domain),
    action: row.action,
    title: activityTitle(row.action),
    description: activityDescription(row.action, row.after_payload || {}),
    actorUserId: row.actor_user_id || null,
    actorName: row.actor_user_id ? (actorMap.get(row.actor_user_id) || 'Developer') : 'System',
    createdAt: row.created_at,
    before: row.before_payload || null,
    after: row.after_payload || null,
  }));

  const portalActivity = (portalAuditR.data || []).map((row) => ({
    id: `portal:${row.id}`,
    source: 'portal',
    category: activityCategory(row.action_type, row.module_key),
    action: row.action_type,
    title: row.description || activityTitle(row.action_type),
    description: row.description ? [row.module_key, row.entity_type].filter(Boolean).join(' · ') : '',
    actorUserId: row.user_id || null,
    actorName: row.user_id ? (actorMap.get(row.user_id) || 'Company user') : 'System',
    createdAt: row.created_at,
    before: row.before_data || null,
    after: row.after_data || null,
  }));

  const recentActivity = [...historyActivity, ...portalActivity]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const assigneeIds = [...new Set([...(teamMembersR.data || []).map((row) => row.user_id), ...(platformAdminsR.data || []).map((row) => row.user_id)].filter(Boolean))];
  let developerAssignees = [];
  if (assigneeIds.length) {
    const { data: assigneeProfiles, error: assigneeError } = await db.from('profiles').select('id,full_name,email').in('id', assigneeIds);
    if (assigneeError) throw assigneeError;
    developerAssignees = assigneeProfiles || [];
  }

  const overview = buildOverviewIntelligence({
    company,
    profile: profileR.data || null,
    internalProfile: internalProfileR.data || null,
    developerAssignees,
    subscription,
    subscriptionContext,
    effectiveLimits,
    provisioningHealth,
    employees: employeesR.data || [],
    invoices: invoicesR.data || [],
    payments: paymentsR.data || [],
    documents: documentsR.data || [],
    portalAccess: portalAccessR.data || [],
    vehicleCount: vehiclesR.count || 0,
    sites: sitesR.data || [],
    activeSessionCount: securitySessionsR.count || 0,
    securityEvents: securityEventsR.data || [],
    securityAlertCount24h: securityEventsR.count || 0,
    userSecurity,
    recentActivity,
  });

  return {
    company,
    profile: profileR.data || null,
    internalProfile: internalProfileR.data || null,
    developerAssignees,
    subscription,
    subscriptionContext,
    ownerAccess,
    ownerBootstrap,
    portalSettings,
    fleetPacks: fleetPacksR.data || [],
    companyModuleOverrides: companyModuleOverridesR.data || [],
    sites: sitesR.data || [],
    roles: rolesR.data || [],
    portalUserAccess: portalAccessR.data || [],
    portalUserProfiles: portalProfilesR.data || [],
    provisioningHealth,
    overview,
    override,
    plans,
    employees: employeesR.data || [],
    invoices: invoicesR.data || [],
    payments: paymentsR.data || [],
    documents: documentsR.data || [],
    announcements: announcementsR.data || [],
    notes: notesR.data || [],
    modules: effectiveModules,
    portalConfig: portalR.data || null,
    lifecycle,
    effective: { planKey, plan, limits: effectiveLimits, modules: effectiveModules },
    billingSummary: { totalInvoiced, totalPaid, outstanding: Math.max(0, totalInvoiced - totalPaid) },
  };
}

async function employeeAction(db, actor, companyId, body) {
  const action = clean(body.action, 50);
  if (action === 'create_employee') {
    const fullName = clean(body.fullName, 150);
    const email = clean(body.email, 254).toLowerCase();
    const password = String(body.password || '');
    if (!fullName || !EMAIL.test(email) || password.length < 8) return { status:400, payload:{ok:false,code:'INVALID_EMPLOYEE'} };
    const { data: created, error: authError } = await db.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: fullName, mobile: clean(body.mobile, 30), created_via: 'developer_company_360' },
    });
    if (authError) return { status:409, payload:{ok:false,code:'AUTH_USER_CREATE_FAILED',message:authError.message} };
    const userId = created.user.id;
    try {
      const membership = await db.from('company_memberships').insert({
        company_id: companyId, user_id: userId, status: 'active', access_scope: 'company', joined_at: new Date().toISOString(),
      });
      if (membership.error) throw membership.error;
      const emp = await db.from('developer_company_employees').insert({
        company_id: companyId, user_id: userId, full_name: fullName, email,
        mobile: clean(body.mobile,30), employee_code: clean(body.employeeCode,50), designation: clean(body.designation,120),
        branch: clean(body.branch,120), role_key: clean(body.roleKey,80) || 'viewer', status: 'active',
        force_password_change: Boolean(body.forcePasswordChange), notes: clean(body.notes,2000), created_by: actor, updated_by: actor,
      }).select('*').single();
      if (emp.error) throw emp.error;
      await history(db, actor, companyId, 'employee_create', { user_id:userId, email, role_key:emp.data.role_key });
      return { status:201, payload:{ok:true,employee:emp.data} };
    } catch (error) {
      await db.auth.admin.deleteUser(userId).catch(()=>{});
      throw error;
    }
  }

  const employeeId = clean(body.employeeId, 80);
  const { data: emp, error } = await db.from('developer_company_employees').select('*').eq('id', employeeId).eq('company_id', companyId).maybeSingle();
  if (error) throw error;
  if (!emp) return { status:404, payload:{ok:false,code:'EMPLOYEE_NOT_FOUND'} };

  if (action === 'reset_password') {
    const password = String(body.password || '');
    if (password.length < 8) return { status:400, payload:{ok:false,code:'INVALID_PASSWORD'} };
    const { error: authError } = await db.auth.admin.updateUserById(emp.user_id, { password });
    if (authError) throw authError;
    await db.from('developer_company_employees').update({ force_password_change:Boolean(body.forcePasswordChange), updated_by:actor, updated_at:new Date().toISOString() }).eq('id', emp.id);
    await history(db, actor, companyId, 'employee_password_reset', { employee_id: emp.id });
    return { status:200, payload:{ok:true} };
  }
  if (['block_employee','unblock_employee','disable_employee'].includes(action)) {
    const next = action === 'block_employee' ? 'blocked' : action === 'disable_employee' ? 'disabled' : 'active';
    await db.from('developer_company_employees').update({ status:next, updated_by:actor, updated_at:new Date().toISOString() }).eq('id', emp.id);
    if (next !== 'active') {
      await db.from('security_sessions').update({ status:'revoked', revoked_at:new Date().toISOString(), revoke_reason:'COMPANY_EMPLOYEE_BLOCKED' }).eq('company_id', companyId).eq('user_id', emp.user_id).eq('status','active');
    }
    await history(db, actor, companyId, action, { employee_id:emp.id, status:next });
    return { status:200, payload:{ok:true,status:next} };
  }
  if (action === 'update_employee') {
    const patch = {
      full_name: clean(body.fullName ?? emp.full_name,150), mobile: clean(body.mobile ?? emp.mobile,30),
      employee_code: clean(body.employeeCode ?? emp.employee_code,50), designation: clean(body.designation ?? emp.designation,120),
      branch: clean(body.branch ?? emp.branch,120), role_key: clean(body.roleKey ?? emp.role_key,80) || 'viewer',
      notes: clean(body.notes ?? emp.notes,2000), updated_by:actor, updated_at:new Date().toISOString(),
    };
    const { data, error: uErr } = await db.from('developer_company_employees').update(patch).eq('id',emp.id).select('*').single();
    if (uErr) throw uErr;
    await history(db, actor, companyId, 'employee_update', { employee_id:emp.id, role_key:data.role_key });
    return { status:200, payload:{ok:true,employee:data} };
  }
  return { status:400, payload:{ok:false,code:'INVALID_EMPLOYEE_ACTION'} };
}

async function updateCompanyProfile360(db, actor, companyId, body, companyData) {
  const current = companyData.profile || null;
  const expectedRevision = Number(body.expectedRevision ?? current?.revision ?? 0);
  if (current && Number(current.revision || 0) !== expectedRevision) return { status:409, payload:{ok:false,code:'REVISION_CONFLICT',message:'Company profile changed in another session. Refresh and try again.'} };
  const companyName = clean(body.companyName, 180);
  if (!companyName) return {status:400,payload:{ok:false,code:'COMPANY_NAME_REQUIRED'}};
  const fields = {
    legal_name:clean(body.legalName,180), trade_name:clean(body.tradeName,180), registration_type:clean(body.registrationType,80), business_type:clean(body.businessType,120),
    gstin:clean(body.gstin,20).toUpperCase(), pan:clean(body.pan,20).toUpperCase(), aadhaar_last4:clean(body.aadhaarLast4,4), cin:clean(body.cin,30).toUpperCase(),
    contact_email:clean(body.contactEmail,254).toLowerCase(), contact_mobile:clean(body.contactMobile,30), alternate_mobile:clean(body.alternateMobile,30), billing_email:clean(body.billingEmail,254).toLowerCase(), website:clean(body.website,500),
    owner_name:clean(body.ownerName,150), owner_email:clean(body.ownerEmail,254).toLowerCase(), owner_mobile:clean(body.ownerMobile,30), address_line1:clean(body.addressLine1,250), address_line2:clean(body.addressLine2,250),
    city:clean(body.city,100), state:clean(body.state,100), postal_code:clean(body.postalCode,20), country:clean(body.country,100)||'India', notes:clean(body.notes,5000), revision:expectedRevision+1, updated_by:actor, updated_at:new Date().toISOString(),
  };
  for (const key of ['contact_email','billing_email','owner_email']) if (fields[key] && !EMAIL.test(fields[key])) return {status:400,payload:{ok:false,code:'INVALID_EMAIL',field:key}};
  const companyUpdate = await db.from('companies').update({company_name:companyName}).eq('id',companyId).select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug').single();
  if (companyUpdate.error) throw companyUpdate.error;
  let query = db.from('developer_company_profiles').upsert({company_id:companyId,...fields,created_via:current?.created_via||'developer_cpanel',created_by:current?.created_by||actor},{onConflict:'company_id'});
  const saved = await query.select('*').single(); if(saved.error) throw saved.error;
  await history(db,actor,companyId,'profile_update',{before_revision:current?.revision||0,after_revision:saved.data.revision});
  return {status:200,payload:{ok:true,company:companyUpdate.data,profile:saved.data}};
}

async function saveInternalProfile(db, actor, companyId, body, companyData) {
  const current = companyData.internalProfile || null;
  const expectedRevision = Number(body.expectedRevision ?? current?.revision ?? 0);
  if (current && Number(current.revision || 0) !== expectedRevision) return {status:409,payload:{ok:false,code:'REVISION_CONFLICT'}};
  const accountManager = UUID.test(clean(body.accountManagerUserId,80)) ? clean(body.accountManagerUserId,80) : null;
  const supportOwner = UUID.test(clean(body.supportOwnerUserId,80)) ? clean(body.supportOwnerUserId,80) : null;
  const priority = clean(body.priority,20)||'normal', risk = clean(body.riskLevel,20)||'low';
  if(!['low','normal','high','critical'].includes(priority) || !['low','medium','high','critical'].includes(risk)) return {status:400,payload:{ok:false,code:'INVALID_INTERNAL_PROFILE'}};
  const tags = Array.isArray(body.tags) ? [...new Set(body.tags.map((v)=>clean(v,60)).filter(Boolean))].slice(0,30) : [];
  const row={company_id:companyId,account_manager_user_id:accountManager,support_owner_user_id:supportOwner,customer_segment:clean(body.customerSegment,80)||'standard',priority,risk_level:risk,tags,revision:expectedRevision+1,updated_by:actor,updated_at:new Date().toISOString(),created_by:current?.created_by||actor};
  const {data,error}=await db.from('developer_company_internal_profiles').upsert(row,{onConflict:'company_id'}).select('*').single(); if(error)throw error;
  await history(db,actor,companyId,'internal_profile_update',{revision:data.revision,priority:data.priority,risk_level:data.risk_level,tags:data.tags});
  return {status:200,payload:{ok:true,internalProfile:data}};
}

async function saveSite(db, actor, companyId, body) {
  const siteId = UUID.test(clean(body.siteId,80)) ? clean(body.siteId,80) : null;
  const {data,error}=await db.rpc('developer_company360_save_site',{p_company_id:companyId,p_site_id:siteId,p_code:clean(body.code,40),p_name:clean(body.name,160),p_site_type:clean(body.siteType,80)||'Branch Office',p_address:clean(body.address,500),p_city:clean(body.city,100),p_state:clean(body.state,100),p_pincode:clean(body.pincode,20),p_is_primary:Boolean(body.isPrimary),p_status:clean(body.status,20)||'active'});
  if(error){ if(error.code==='23505') return {status:409,payload:{ok:false,code:'SITE_CODE_EXISTS',message:'This site code is already used by the company.'}}; throw error; }
  await history(db,actor,companyId,siteId?'site_update':'site_create',{site_id:data?.id||siteId,code:data?.code||clean(body.code,40),status:data?.status||body.status});
  return {status:siteId?200:201,payload:{ok:true,site:data}};
}

async function documentAction(db, actor, companyId, body, companyData) {
  const action=clean(body.action,80);
  if(action==='request_document_upload'){
    const name=clean(body.fileName,220).replace(/[^a-zA-Z0-9._-]+/g,'_'); const mime=clean(body.mimeType,120); const size=Number(body.fileSize||0);
    if(!name || !['application/pdf','image/jpeg','image/png','image/webp'].includes(mime) || !Number.isFinite(size) || size<=0 || size>15728640) return {status:400,payload:{ok:false,code:'INVALID_DOCUMENT_FILE',message:'Use PDF/JPG/PNG/WEBP up to 15 MB.'}};
    const path=`${companyId}/${new Date().getUTCFullYear()}/${crypto.randomUUID()}-${name}`;
    const {data,error}=await db.storage.from('company-kyc-documents').createSignedUploadUrl(path); if(error)throw error;
    return {status:200,payload:{ok:true,bucket:'company-kyc-documents',path:data.path||path,token:data.token,signedUrl:data.signedUrl}};
  }
  if(action==='add_document'){
    const bucket=clean(body.storageBucket,120), path=clean(body.storagePath,1000); if(bucket!=='company-kyc-documents'||!path.startsWith(`${companyId}/`)) return {status:400,payload:{ok:false,code:'INVALID_DOCUMENT_STORAGE'}};
    const expiry=asDate(body.expiryDate); if(expiry===undefined)return {status:400,payload:{ok:false,code:'INVALID_EXPIRY_DATE'}};
    const {data,error}=await db.from('developer_company_documents').insert({company_id:companyId,document_type:clean(body.documentType,100)||'other',document_name:clean(body.documentName,220)||clean(body.fileName,220),file_url:'',storage_bucket:bucket,storage_path:path,mime_type:clean(body.mimeType,120),file_size:Number(body.fileSize||0)||null,uploaded_by:actor,status:'pending',expiry_date:expiry,notes:clean(body.notes,3000)}).select('*').single();
    if(error){ await db.storage.from(bucket).remove([path]).catch(()=>{}); throw error; }
    await history(db,actor,companyId,'document_add',{document_id:data.id,document_type:data.document_type}); return {status:201,payload:{ok:true,document:data}};
  }
  const documentId=clean(body.documentId,80); const doc=(companyData.documents||[]).find((row)=>row.id===documentId); if(!doc)return {status:404,payload:{ok:false,code:'DOCUMENT_NOT_FOUND'}};
  if(action==='get_document_url'){
    if(doc.storage_bucket&&doc.storage_path){const {data,error}=await db.storage.from(doc.storage_bucket).createSignedUrl(doc.storage_path,300,{download:false});if(error)throw error;return {status:200,payload:{ok:true,url:data.signedUrl}};}
    if(doc.file_url)return {status:200,payload:{ok:true,url:doc.file_url}}; return {status:404,payload:{ok:false,code:'DOCUMENT_FILE_MISSING'}};
  }
  if(action==='verify_document'||action==='reject_document'){
    const next=action==='verify_document'?'verified':'rejected'; const patch={status:next,verified_by:action==='verify_document'?actor:null,verified_at:action==='verify_document'?new Date().toISOString():null,notes:clean(body.notes,3000)||doc.notes,updated_at:new Date().toISOString()};
    const {data,error}=await db.from('developer_company_documents').update(patch).eq('id',documentId).eq('company_id',companyId).select('*').single();if(error)throw error;await history(db,actor,companyId,action,{document_id:documentId,status:next});return {status:200,payload:{ok:true,document:data}};
  }
  return {status:400,payload:{ok:false,code:'INVALID_DOCUMENT_ACTION'}};
}

async function createInvoice(db, actor, companyId, body, companyData) {
  const items = Array.isArray(body.items) ? body.items.slice(0,100) : [];
  if (!items.length) return {status:400,payload:{ok:false,code:'INVOICE_ITEMS_REQUIRED'}};
  const normalized = items.map((i,idx)=>{
    const q=Number(i.quantity||1), r=money(i.rate), d=money(i.discount||0), tr=Number(i.taxRate||0);
    if (!clean(i.description,500) || !Number.isFinite(q) || q<=0 || r===null || d===null || !Number.isFinite(tr) || tr<0 || tr>100) return null;
    const base=Math.max(0,q*r-d); return {description:clean(i.description,500),quantity:q,rate:r,discount:d,tax_rate:tr,hsn_sac:clean(i.hsnSac,50),amount:base,sort_order:idx};
  });
  if (normalized.some((x)=>!x)) return {status:400,payload:{ok:false,code:'INVALID_INVOICE_ITEM'}};
  const subtotal=normalized.reduce((s,i)=>s+i.quantity*i.rate,0), discount=normalized.reduce((s,i)=>s+i.discount,0), taxable=Math.max(0,subtotal-discount);
  const tax=normalized.reduce((s,i)=>s+(i.amount*i.tax_rate/100),0);
  const interstate=Boolean(body.interstate); const cgst=interstate?0:tax/2, sgst=interstate?0:tax/2, igst=interstate?tax:0;
  const roundOff=Number(body.roundOff||0); const grand=Math.round((taxable+tax+roundOff)*100)/100;
  const { data: numData, error:numErr } = await db.rpc('developer_next_invoice_number'); if (numErr) throw numErr;
  const profile=companyData.profile||{};
  const { data: invoice, error } = await db.from('developer_company_invoices').insert({
    company_id:companyId, invoice_number:numData, invoice_type:clean(body.invoiceType,50)||'subscription', invoice_date:asDate(body.invoiceDate)||new Date().toISOString().slice(0,10), due_date:asDate(body.dueDate),
    subtotal,discount,taxable_amount:taxable,cgst,sgst,igst,round_off:roundOff,grand_total:grand,status:clean(body.status,30)||'issued',
    billing_period_start:asDate(body.billingPeriodStart), billing_period_end:asDate(body.billingPeriodEnd), place_of_supply:clean(body.placeOfSupply,120), notes:clean(body.notes,5000), terms:clean(body.terms,5000),
    company_snapshot:{company_name:companyData.company.company_name,company_code:companyData.company.company_code,gstin:profile.gstin||'',pan:profile.pan||'',address:[profile.address_line1,profile.address_line2,profile.city,profile.state,profile.postal_code].filter(Boolean).join(', ')},
    plan_snapshot:{plan_key:companyData.effective.planKey,plan_name:companyData.effective.plan?.name||'',limits:companyData.effective.limits}, created_by:actor,updated_by:actor,
  }).select('*').single();
  if (error) throw error;
  const { error: itemErr } = await db.from('developer_company_invoice_items').insert(normalized.map(i=>({...i,invoice_id:invoice.id})));
  if (itemErr) throw itemErr;
  await history(db, actor, companyId, 'invoice_create', { invoice_id:invoice.id, invoice_number:invoice.invoice_number, total:grand });
  return {status:201,payload:{ok:true,invoice}};
}

async function handlePost(db, actor, companyId, body) {
  const action=clean(body.action,80);
  if (action.includes('employee')) return employeeAction(db,actor,companyId,body);
  const companyData=await loadCompany(db,companyId); if(!companyData) return {status:404,payload:{ok:false,code:'COMPANY_NOT_FOUND'}};

  if(action==='update_profile') return updateCompanyProfile360(db,actor,companyId,body,companyData);
  if(action==='save_internal_profile') return saveInternalProfile(db,actor,companyId,body,companyData);
  if(action==='save_site') return saveSite(db,actor,companyId,body);
  if(['request_document_upload','add_document','get_document_url','verify_document','reject_document'].includes(action)) return documentAction(db,actor,companyId,body,companyData);

  if(action==='validate_bulk_import' || action==='commit_bulk_import'){
    const importType=clean(body.importType,40);
    const templateVersion=clean(body.templateVersion,80);
    if(templateVersion!=='BF-C360-IMPORT-V1') return {status:400,payload:{ok:false,code:'UNSUPPORTED_IMPORT_TEMPLATE',message:'Download the latest Buddy Fleets import template and try again.'}};
    const plan=await buildBulkImportPlan(db,companyId,importType,body.rows,companyData.effective?.limits||{});
    if(action==='validate_bulk_import'){
      return {status:plan.status||200,payload:{ok:true,valid:plan.valid,code:plan.code,summary:plan.summary,errors:plan.errors,errorsTruncated:plan.errorsTruncated}};
    }
    if(!plan.valid){
      return {status:422,payload:{ok:false,valid:false,code:plan.code||'IMPORT_VALIDATION_FAILED',message:'Import validation failed. No rows were written.',summary:plan.summary,errors:plan.errors,errorsTruncated:plan.errorsTruncated}};
    }
    const table=importType==='vehicles'?'company_portal_vehicles':'company_portal_drivers';
    const {data:inserted,error:insertError}=await db.from(table).insert(plan.records).select('id');
    if(insertError){
      if(insertError.code==='23505') return {status:409,payload:{ok:false,code:'IMPORT_DUPLICATE_DETECTED',message:'A duplicate record was created after validation. Refresh the company data and validate the file again.'}};
      throw insertError;
    }
    const imported=(inserted||[]).length;
    await history(db,actor,companyId,`bulk_import_${importType}`,{template_version:templateVersion,import_type:importType,imported});
    try{
      await db.from('company_portal_audit').insert({
        company_id:companyId,user_id:actor,site_id:null,module_key:importType==='vehicles'?'vehicles':'drivers',action_type:'bulk_import',
        entity_type:importType==='vehicles'?'vehicle':'driver',entity_id:null,
        description:`Developer bulk imported ${imported} ${importType} record(s)`,before_data:null,
        after_data:{template_version:templateVersion,import_type:importType,imported},
      });
    }catch(auditError){console.error('Company portal bulk import audit failed:',auditError?.message||auditError);}
    return {status:201,payload:{ok:true,valid:true,importType,imported,summary:{total:imported,valid:imported,invalid:0}}};
  }

  if(action==='set_fleet_packs'){
    const primaryPack=clean(body.primaryPack,120);
    const enabledPacks=Array.isArray(body.enabledPacks)?[...new Set(body.enabledPacks.map((value)=>clean(value,120)).filter(Boolean))]:[];
    if(!primaryPack) return {status:400,payload:{ok:false,code:'PRIMARY_FLEET_PACK_REQUIRED'}};
    const normalized=enabledPacks.includes(primaryPack)?enabledPacks:[primaryPack,...enabledPacks];
    const {data,error}=await db.rpc('bf_set_company_fleet_packs',{p_company_id:companyId,p_primary_pack:primaryPack,p_enabled_packs:normalized});
    if(error) throw error;
    await history(db,actor,companyId,'fleet_packs_set',{primary_pack:primaryPack,enabled_packs:normalized});
    return {status:200,payload:{ok:true,result:data}};
  }
  if(action==='save_module_override'){
    const moduleKey=clean(body.moduleKey,160), accessLevel=clean(body.accessLevel,30)||'full';
    if(!moduleKey||!['full','read_only','blocked'].includes(accessLevel)) return {status:400,payload:{ok:false,code:'INVALID_MODULE_OVERRIDE'}};
    const row={company_id:companyId,module_key:moduleKey,enabled:body.enabled!==false&&accessLevel!=='blocked',access_level:accessLevel,action_overrides:body.actionOverrides&&typeof body.actionOverrides==='object'?body.actionOverrides:{},reason:clean(body.reason,1000),updated_by:actor,updated_at:new Date().toISOString()};
    const {data,error}=await db.from('developer_company_module_overrides').upsert(row,{onConflict:'company_id,module_key'}).select('*').single();
    if(error) throw error;
    await history(db,actor,companyId,'module_override_save',{module_key:moduleKey,access_level:accessLevel});
    return {status:200,payload:{ok:true,override:data}};
  }
  if(action==='clear_module_override'){
    const moduleKey=clean(body.moduleKey,160); if(!moduleKey)return {status:400,payload:{ok:false,code:'MODULE_KEY_REQUIRED'}};
    const {error}=await db.from('developer_company_module_overrides').delete().eq('company_id',companyId).eq('module_key',moduleKey); if(error)throw error;
    await history(db,actor,companyId,'module_override_clear',{module_key:moduleKey});
    return {status:200,payload:{ok:true}};
  }
  if(action==='create_invoice') return createInvoice(db,actor,companyId,body,companyData);
  if(action==='record_payment'){
    const amount=money(body.amount); const paymentDate=asDate(body.paymentDate); if(amount===null||!paymentDate) return {status:400,payload:{ok:false,code:'INVALID_PAYMENT'}};
    const {data,error}=await db.from('developer_company_payments').insert({company_id:companyId,invoice_id:UUID.test(body.invoiceId||'')?body.invoiceId:null,amount,payment_date:paymentDate,payment_mode:clean(body.paymentMode,50)||'bank_transfer',transaction_reference:clean(body.transactionReference,200),proof_url:clean(body.proofUrl,1000),status:clean(body.status,30)||'submitted',remarks:clean(body.remarks,3000),created_by:actor}).select('*').single();
    if(error) throw error;
    await history(db,actor,companyId,'payment_record',{payment_id:data.id,amount:data.amount,status:data.status});
    return {status:201,payload:{ok:true,payment:data}};
  }
  if(action==='verify_payment'){
    const paymentId=clean(body.paymentId,80); const {data,error}=await db.from('developer_company_payments').update({status:'verified',verified_by:actor,verified_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',paymentId).eq('company_id',companyId).select('*').single(); if(error) throw error;
    if(data.invoice_id){ const {data:invoice}=await db.from('developer_company_invoices').select('id,grand_total,paid_amount').eq('id',data.invoice_id).maybeSingle(); if(invoice){ const paid=Number(invoice.paid_amount||0)+Number(data.amount||0); await db.from('developer_company_invoices').update({paid_amount:paid,status:paid>=Number(invoice.grand_total||0)?'paid':'partially_paid',updated_at:new Date().toISOString()}).eq('id',invoice.id); }}
    const {data:receiptNo,error:rErr}=await db.rpc('developer_next_receipt_number');
    if(rErr) throw rErr;
    const receiptNumber=receiptNo||`BFR/${new Date().getFullYear()}/${String(Date.now()).slice(-8)}`;
    const receiptResult=await db.from('developer_company_receipts').insert({company_id:companyId,payment_id:data.id,receipt_number:receiptNumber,snapshot:{amount:data.amount,payment_date:data.payment_date,payment_mode:data.payment_mode,transaction_reference:data.transaction_reference},created_by:actor});
    if(receiptResult.error) throw receiptResult.error;
    await history(db,actor,companyId,'payment_verify',{payment_id:data.id}); return {status:200,payload:{ok:true,payment:data}};
  }
  if(action==='send_announcement'){
    const title=clean(body.title,200), message=clean(body.message,10000); if(!title||!message)return {status:400,payload:{ok:false,code:'INVALID_ANNOUNCEMENT'}};
    const {data:ann,error}=await db.from('developer_company_announcements').insert({company_id:companyId,title,message,priority:clean(body.priority,20)||'normal',audience_type:'all_employees',require_acknowledgement:Boolean(body.requireAcknowledgement),allow_dismiss:body.allowDismiss!==false,starts_at:body.startsAt||new Date().toISOString(),expires_at:body.expiresAt||null,status:'published',created_by:actor}).select('*').single(); if(error) throw error;
    const recipients=(companyData.employees||[]).filter(e=>e.status==='active').map(e=>({announcement_id:ann.id,company_id:companyId,user_id:e.user_id,delivered_at:new Date().toISOString()})); if(recipients.length){const rr=await db.from('developer_company_announcement_recipients').insert(recipients); if(rr.error) throw rr.error;}
    await history(db,actor,companyId,'announcement_publish',{announcement_id:ann.id,recipients:recipients.length}); return {status:201,payload:{ok:true,announcement:ann,recipients:recipients.length}};
  }
  if(action==='add_note'){
    const bodyText=clean(body.body,10000); if(!bodyText)return {status:400,payload:{ok:false,code:'NOTE_REQUIRED'}}; const {data,error}=await db.from('developer_company_notes').insert({company_id:companyId,note_type:clean(body.noteType,50)||'internal',title:clean(body.title,200),body:bodyText,follow_up_at:body.followUpAt||null,created_by:actor}).select('*').single(); if(error) throw error; return {status:201,payload:{ok:true,note:data}};
  }
  if(action==='save_portal_config'){
    const {data,error}=await db.from('developer_company_portal_config').upsert({company_id:companyId,dashboard_widgets:Array.isArray(body.dashboardWidgets)?body.dashboardWidgets:[],sidebar_overrides:body.sidebarOverrides&&typeof body.sidebarOverrides==='object'?body.sidebarOverrides:{},branding:body.branding&&typeof body.branding==='object'?body.branding:{},landing_path:clean(body.landingPath,200)||'/dashboard',revision:Number(body.revision||0)+1,updated_by:actor,updated_at:new Date().toISOString()},{onConflict:'company_id'}).select('*').single(); if(error) throw error; await history(db,actor,companyId,'portal_config_save',{revision:data.revision}); return {status:200,payload:{ok:true,portalConfig:data}};
  }
  return {status:400,payload:{ok:false,code:'INVALID_ACTION'}};
}

export default async function handler(req,res){
  const auth=await requireDeveloperSession(req);
  if(!auth.ok){ if(auth.clearCookie) clearDeveloperSessionCookie(res); return send(res,auth.status||401,{ok:false,code:auth.code||'UNAUTHORIZED'}); }
  const db=auth.supabaseAdmin, actor=auth.user?.id||null;
  try{
    const companyId=clean(req.method==='GET'?req.query?.companyId:req.body?.companyId,80);
    if(!UUID.test(companyId)) return send(res,400,{ok:false,code:'INVALID_COMPANY_ID'});
    if(req.method==='GET'){
      const data=await loadCompany(db,companyId); if(!data)return send(res,404,{ok:false,code:'COMPANY_NOT_FOUND'}); return send(res,200,{ok:true,...data});
    }
    if(req.method==='POST'||req.method==='PATCH'){
      const result=await handlePost(db,actor,companyId,req.body||{}); return send(res,result.status,result.payload);
    }
    return send(res,405,{ok:false,code:'METHOD_NOT_ALLOWED'});
  }catch(error){ console.error('Company 360 API failed:',error); return send(res,500,{ok:false,code:'COMPANY_360_FAILED',message:error?.message||'Unexpected error'}); }
}
