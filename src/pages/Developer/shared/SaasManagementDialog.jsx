import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Plus,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  archivePlan,
  clearCompanyOverride,
  createPlan,
  getCompanies,
  getCompanyOverrides,
  getPlans,
  getRenewalPolicy,
  saveCompanyOverride,
  saveRenewalPolicy,
  updateCompany,
  updatePlan,
} from '../../../services/developerSaasApi';

const inputClass = 'mt-1.5 h-10 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[11px] text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]';
const textareaClass = 'mt-1.5 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2 text-[11px] text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]';
const labelClass = 'block text-[10px] font-semibold text-[var(--bf-dev-text-2)]';

function errorText(result, fallback) {
  if (result?.status === 401) return 'Your developer session expired. Sign in again and retry.';
  if (result?.status === 409 && result?.code === 'REVISION_CONFLICT') return 'This record changed in another session. Reload before saving again.';
  if (result?.code === 'DUPLICATE_PLAN_KEY') return 'A plan with this key already exists.';
  return fallback;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function endOfLocalDay(value) {
  if (!value) return null;
  return `${value}T23:59:59.000`;
}

function startOfLocalDay(value) {
  if (!value) return null;
  return `${value}T00:00:00.000`;
}

function StatusPill({ value }) {
  const warning = ['trial_active', 'trial_expired', 'pending_confirmation', 'inactive'].includes(value);
  const danger = ['suspended', 'archived'].includes(value);
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${danger ? 'border-rose-500/20 bg-rose-500/10 text-rose-500' : warning ? 'border-amber-500/20 bg-amber-500/10 text-amber-500' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'}`}>
      {String(value || 'unknown').replaceAll('_', ' ')}
    </span>
  );
}

function SmallButton({ children, icon: Icon, variant = 'default', ...props }) {
  const variantClass = variant === 'primary'
    ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white'
    : variant === 'danger'
      ? 'border-rose-500/25 bg-rose-500/10 text-rose-500'
      : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)]';
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClass}`}
    >
      {Icon && <Icon size={13} aria-hidden="true" />}
      {children}
    </button>
  );
}

function EmptyState({ children }) {
  return <div className="rounded-lg border border-dashed border-[var(--bf-dev-border)] p-5 text-center text-[11px] text-[var(--bf-dev-text-3)]">{children}</div>;
}

function CompaniesPanel({ trialOnly = false }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    const result = await getCompanies();
    if (result.ok && Array.isArray(result.companies)) setCompanies(result.companies);
    else setError(errorText(result, 'Unable to load companies.'));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (trialOnly && !['trial_active', 'trial_expired'].includes(company.status)) return false;
      if (!q) return true;
      return `${company.company_name || ''} ${company.company_code || ''} ${company.subdomain_slug || ''} ${company.status || ''}`.toLowerCase().includes(q);
    });
  }, [companies, query, trialOnly]);

  async function setStatus(company, status) {
    setSavingId(company.id);
    setError('');
    setSuccess('');
    const result = await updateCompany({ action: 'set_status', companyId: company.id, status });
    if (result.ok) {
      setSuccess(`${company.company_name || 'Company'} updated successfully.`);
      await load();
    } else {
      setError(errorText(result, 'Unable to update company status.'));
    }
    setSavingId('');
  }

  async function saveTrial(company, startDate, endDate, status) {
    setSavingId(company.id);
    setError('');
    setSuccess('');
    const result = await updateCompany({
      action: 'update_trial',
      companyId: company.id,
      trialStartAt: startOfLocalDay(startDate),
      trialEndAt: endOfLocalDay(endDate),
      status,
    });
    if (result.ok) {
      setSuccess(`${company.company_name || 'Company'} trial updated successfully.`);
      await load();
    } else {
      setError(errorText(result, result?.code === 'SUBSCRIPTION_NOT_FOUND' ? 'This company does not have a subscription row to update.' : 'Unable to update trial.'));
    }
    setSavingId('');
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bf-dev-text-3)]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, code, slug..." className={`${inputClass} mt-0 pl-9`} />
        </div>
        <SmallButton icon={RefreshCcw} onClick={load} disabled={loading}>Refresh</SmallButton>
      </div>

      {error && <p className="mb-3 text-[10px] text-rose-500">{error}</p>}
      {success && <p className="mb-3 text-[10px] text-emerald-500">{success}</p>}
      {loading && <p className="py-6 text-center text-[11px] text-[var(--bf-dev-text-3)]">Loading companies...</p>}
      {!loading && !filtered.length && <EmptyState>No matching companies.</EmptyState>}

      <div className="space-y-3">
        {filtered.map((company) => (
          <CompanyRow
            key={company.id}
            company={company}
            trialOnly={trialOnly}
            saving={savingId === company.id}
            onStatus={setStatus}
            onSaveTrial={saveTrial}
          />
        ))}
      </div>
    </div>
  );
}

function CompanyRow({ company, trialOnly, saving, onStatus, onSaveTrial }) {
  const [startDate, setStartDate] = useState(formatDate(company.subscription?.trial_start_at));
  const [endDate, setEndDate] = useState(formatDate(company.subscription?.trial_end_at));
  const [trialStatus, setTrialStatus] = useState(['trial_active', 'trial_expired'].includes(company.status) ? company.status : 'trial_active');

  return (
    <div className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[12px] font-bold text-[var(--bf-dev-text)]">{company.company_name || 'Unnamed company'}</div>
            <StatusPill value={company.status} />
          </div>
          <div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">
            {company.company_code || 'No code'} · portal.buddyfleets.in/{company.subdomain_slug || 'no-slug'}
          </div>
          <div className="mt-2 text-[9px] text-[var(--bf-dev-text-3)]">
            Subscription: {company.subscription?.status || 'not found'} · Plan ID: {company.subscription?.plan_id || 'not assigned'}
          </div>
          {company.override?.enabled && (
            <div className="mt-1 text-[9px] text-[var(--bf-dev-primary)]">
              Override active{company.override.plan_key ? ` · ${company.override.plan_key}` : ''}
            </div>
          )}
        </div>

        {!trialOnly && (
          <div className="flex flex-wrap gap-2">
            {company.status !== 'active' && <SmallButton disabled={saving} onClick={() => onStatus(company, 'active')}>Activate</SmallButton>}
            {company.status !== 'suspended' && <SmallButton variant="danger" disabled={saving} onClick={() => onStatus(company, 'suspended')}>Suspend</SmallButton>}
            {company.status === 'suspended' && <SmallButton disabled={saving} onClick={() => onStatus(company, 'active')}>Restore</SmallButton>}
          </div>
        )}
      </div>

      {trialOnly && (
        <div className="mt-4 grid gap-3 border-t border-[var(--bf-dev-border)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={labelClass}>Trial start<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Trial end<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Trial status<select value={trialStatus} onChange={(event) => setTrialStatus(event.target.value)} className={inputClass}><option value="trial_active">trial_active</option><option value="trial_expired">trial_expired</option></select></label>
          <div className="flex items-end"><SmallButton icon={Save} variant="primary" disabled={saving || !endDate} onClick={() => onSaveTrial(company, startDate, endDate, trialStatus)}>{saving ? 'Saving...' : 'Save trial'}</SmallButton></div>
        </div>
      )}
    </div>
  );
}

const blankPlan = () => ({
  id: '',
  plan_key: '',
  name: '',
  tagline: '',
  badge: '',
  status: 'active',
  currency: 'INR',
  display_order: 50,
  prices: { 1: '', 3: '', 6: '', 12: '' },
  limits: { vehicles_min: '', vehicles_max: '', users: '', sites: '' },
  entitlements: [],
  revision: 0,
});

function PlansPanel({ limitsOnly = false }) {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load(preferredId = '') {
    setLoading(true);
    setError('');
    const result = await getPlans();
    if (result.ok && Array.isArray(result.plans)) {
      setPlans(result.plans);
      if (preferredId) setSelected(result.plans.find((plan) => plan.id === preferredId) || null);
    } else setError(errorText(result, 'Unable to load plans.'));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function savePlan() {
    if (!selected) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = {
      planKey: selected.plan_key,
      name: selected.name,
      tagline: selected.tagline,
      badge: selected.badge,
      status: selected.status,
      currency: selected.currency,
      displayOrder: Number(selected.display_order || 0),
      prices: selected.prices,
      limits: selected.limits,
      entitlements: selected.entitlements,
    };
    const result = selected.id
      ? await updatePlan({ ...payload, planId: selected.id, expectedRevision: selected.revision })
      : await createPlan(payload);
    if (result.ok) {
      setSuccess('Plan saved successfully.');
      await load(result.plan?.id || '');
    } else setError(errorText(result, 'Unable to save plan.'));
    setSaving(false);
  }

  async function doArchive() {
    if (!selected?.id || !window.confirm(`Archive ${selected.name}? Existing records are retained.`)) return;
    setSaving(true);
    const result = await archivePlan({ planId: selected.id, expectedRevision: selected.revision });
    if (result.ok) {
      setSelected(null);
      setSuccess('Plan archived.');
      await load();
    } else setError(errorText(result, 'Unable to archive plan.'));
    setSaving(false);
  }

  const edit = (key, value) => setSelected((current) => ({ ...current, [key]: value }));
  const editNested = (group, key, value) => setSelected((current) => ({ ...current, [group]: { ...(current[group] || {}), [key]: value } }));

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-[11px] font-bold text-[var(--bf-dev-text)]">Plans</div>
          {!limitsOnly && <SmallButton icon={Plus} onClick={() => setSelected(blankPlan())}>New</SmallButton>}
        </div>
        {loading && <p className="text-[10px] text-[var(--bf-dev-text-3)]">Loading...</p>}
        <div className="space-y-2">
          {plans.map((plan) => (
            <button key={plan.id} type="button" onClick={() => setSelected(JSON.parse(JSON.stringify(plan)))} className={`w-full rounded-lg border p-3 text-left ${selected?.id === plan.id ? 'border-[var(--bf-dev-primary)] bg-[rgb(var(--bf-dev-primary-rgb)/.08)]' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]'}`}>
              <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold">{plan.name}</span><StatusPill value={plan.status} /></div>
              <div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">{plan.plan_key}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
        {error && <p className="mb-3 text-[10px] text-rose-500">{error}</p>}
        {success && <p className="mb-3 text-[10px] text-emerald-500">{success}</p>}
        {!selected ? <EmptyState>Select a plan{limitsOnly ? ' to edit limits and entitlements.' : ', or create a new one.'}</EmptyState> : (
          <div className="space-y-4">
            {!limitsOnly && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={labelClass}>Plan name<input value={selected.name || ''} onChange={(event) => edit('name', event.target.value)} className={inputClass} /></label>
                  <label className={labelClass}>Plan key<input value={selected.plan_key || ''} onChange={(event) => edit('plan_key', event.target.value.toLowerCase())} className={inputClass} disabled={Boolean(selected.id)} /></label>
                  <label className={labelClass}>Status<select value={selected.status || 'active'} onChange={(event) => edit('status', event.target.value)} className={inputClass}><option value="active">active</option><option value="inactive">inactive</option><option value="archived">archived</option></select></label>
                  <label className={labelClass}>Display order<input type="number" value={selected.display_order ?? 0} onChange={(event) => edit('display_order', event.target.value)} className={inputClass} /></label>
                  <label className={labelClass}>Currency<input value={selected.currency || 'INR'} onChange={(event) => edit('currency', event.target.value.toUpperCase())} className={inputClass} /></label>
                  <label className={labelClass}>Badge<input value={selected.badge || ''} onChange={(event) => edit('badge', event.target.value)} className={inputClass} /></label>
                </div>
                <label className={labelClass}>Tagline<textarea value={selected.tagline || ''} onChange={(event) => edit('tagline', event.target.value)} rows={2} className={textareaClass} /></label>
                <div>
                  <div className="text-[10px] font-bold text-[var(--bf-dev-text)]">Duration pricing</div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {['1', '3', '6', '12'].map((month) => <label key={month} className={labelClass}>{month} month{month !== '1' ? 's' : ''}<input type="number" min="0" value={selected.prices?.[month] ?? ''} onChange={(event) => editNested('prices', month, event.target.value)} className={inputClass} /></label>)}
                  </div>
                </div>
              </>
            )}

            <div>
              <div className="text-[10px] font-bold text-[var(--bf-dev-text)]">Limits & access</div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className={labelClass}>Vehicle min<input type="number" min="0" value={selected.limits?.vehicles_min ?? ''} onChange={(event) => editNested('limits', 'vehicles_min', event.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Vehicle max<input type="number" min="0" placeholder="Blank = unlimited" value={selected.limits?.vehicles_max ?? ''} onChange={(event) => editNested('limits', 'vehicles_max', event.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Users<input type="number" min="0" value={selected.limits?.users ?? ''} onChange={(event) => editNested('limits', 'users', event.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Sites<input type="number" min="0" value={selected.limits?.sites ?? ''} onChange={(event) => editNested('limits', 'sites', event.target.value)} className={inputClass} /></label>
              </div>
              <label className={`${labelClass} mt-3`}>Entitlements / modules (one per line)<textarea rows={7} value={(selected.entitlements || []).join('\n')} onChange={(event) => edit('entitlements', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} className={textareaClass} /></label>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--bf-dev-border)] pt-4">
              {!limitsOnly && selected.id && selected.status !== 'archived' && <SmallButton variant="danger" icon={Archive} disabled={saving} onClick={doArchive}>Archive</SmallButton>}
              <SmallButton variant="primary" icon={Save} disabled={saving} onClick={savePlan}>{saving ? 'Saving...' : 'Save'}</SmallButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OverridesPanel() {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load(preferredCompanyId = companyId) {
    setLoading(true);
    setError('');
    const result = await getCompanyOverrides();
    if (result.ok) {
      setCompanies(result.companies || []);
      setPlans(result.plans || []);
      setOverrides(result.overrides || []);
      if (preferredCompanyId) selectCompany(preferredCompanyId, result.overrides || []);
    } else setError(errorText(result, 'Unable to load company overrides.'));
    setLoading(false);
  }

  useEffect(() => { load(''); }, []);

  function selectCompany(id, list = overrides) {
    setCompanyId(id);
    const existing = list.find((item) => item.company_id === id);
    setDraft(existing ? JSON.parse(JSON.stringify(existing)) : {
      company_id: id,
      enabled: true,
      plan_key: '',
      limits_override: {},
      entitlements_override: [],
      notes: '',
      revision: 0,
    });
    setError('');
    setSuccess('');
  }

  async function save() {
    if (!draft?.company_id) return;
    setSaving(true);
    setError('');
    const result = await saveCompanyOverride({
      companyId: draft.company_id,
      expectedRevision: Number(draft.revision || 0),
      enabled: draft.enabled !== false,
      planKey: draft.plan_key || '',
      limitsOverride: draft.limits_override || {},
      entitlementsOverride: draft.entitlements_override || [],
      notes: draft.notes || '',
    });
    if (result.ok) {
      setSuccess('Company override saved successfully.');
      await load(draft.company_id);
    } else setError(errorText(result, 'Unable to save company override.'));
    setSaving(false);
  }

  async function clear() {
    if (!draft?.revision || !window.confirm('Clear this company override? Plan defaults will apply again.')) return;
    setSaving(true);
    const result = await clearCompanyOverride({ companyId: draft.company_id, expectedRevision: draft.revision });
    if (result.ok) {
      setSuccess('Company override cleared.');
      await load(draft.company_id);
    } else setError(errorText(result, 'Unable to clear company override.'));
    setSaving(false);
  }

  const setLimit = (key, value) => setDraft((current) => ({ ...current, limits_override: { ...(current?.limits_override || {}), [key]: value } }));

  return (
    <div>
      {error && <p className="mb-3 text-[10px] text-rose-500">{error}</p>}
      {success && <p className="mb-3 text-[10px] text-emerald-500">{success}</p>}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div>
          <label className={labelClass}>Company<select value={companyId} onChange={(event) => selectCompany(event.target.value)} className={inputClass}><option value="">Select company</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.company_name || company.company_code}</option>)}</select></label>
          <p className="mt-2 text-[9px] leading-4 text-[var(--bf-dev-text-3)]">Overrides do not mutate global plan defaults. Clear the override to return the company to plan-level settings.</p>
        </div>
        <div className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
          {loading ? <p className="text-[10px] text-[var(--bf-dev-text-3)]">Loading...</p> : !draft ? <EmptyState>Select a company to configure its override.</EmptyState> : (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-semibold text-[var(--bf-dev-text-2)]"><input type="checkbox" checked={draft.enabled !== false} onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))} />Override enabled</label>
              <label className={labelClass}>Override plan<select value={draft.plan_key || ''} onChange={(event) => setDraft((current) => ({ ...current, plan_key: event.target.value }))} className={inputClass}><option value="">Keep subscription/default plan</option>{plans.filter((plan) => plan.status !== 'archived').map((plan) => <option key={plan.id} value={plan.plan_key}>{plan.name}</option>)}</select></label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className={labelClass}>Vehicle max<input type="number" min="0" value={draft.limits_override?.vehicles_max ?? ''} onChange={(event) => setLimit('vehicles_max', event.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Users<input type="number" min="0" value={draft.limits_override?.users ?? ''} onChange={(event) => setLimit('users', event.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Sites<input type="number" min="0" value={draft.limits_override?.sites ?? ''} onChange={(event) => setLimit('sites', event.target.value)} className={inputClass} /></label>
              </div>
              <label className={labelClass}>Entitlement overrides (one per line)<textarea rows={6} value={(draft.entitlements_override || []).join('\n')} onChange={(event) => setDraft((current) => ({ ...current, entitlements_override: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) }))} className={textareaClass} /></label>
              <label className={labelClass}>Internal notes<textarea rows={4} value={draft.notes || ''} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} className={textareaClass} /></label>
              <div className="flex justify-end gap-2 border-t border-[var(--bf-dev-border)] pt-4">{Number(draft.revision || 0) > 0 && <SmallButton variant="danger" disabled={saving} onClick={clear}>Clear override</SmallButton>}<SmallButton icon={Save} variant="primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save override'}</SmallButton></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RenewalPanel() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    const result = await getRenewalPolicy();
    if (result.ok && result.policy) setPolicy(result.policy);
    else setError(errorText(result, 'Unable to load renewal policy.'));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!policy) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const result = await saveRenewalPolicy({
      expectedRevision: policy.revision,
      graceDays: Number(policy.grace_days),
      reminderDays: Array.isArray(policy.reminder_days) ? policy.reminder_days : [],
      expiryBehavior: policy.expiry_behavior,
      postExpiryAccess: policy.post_expiry_access,
      autoSuspend: Boolean(policy.auto_suspend),
      notes: policy.notes || '',
    });
    if (result.ok) {
      setPolicy(result.policy);
      setSuccess('Renewal policy saved successfully.');
    } else setError(errorText(result, 'Unable to save renewal policy.'));
    setSaving(false);
  }

  if (loading) return <p className="py-6 text-center text-[11px] text-[var(--bf-dev-text-3)]">Loading renewal policy...</p>;
  if (!policy) return <EmptyState>{error || 'Renewal policy is unavailable.'}</EmptyState>;

  return (
    <div className="space-y-4">
      {error && <p className="text-[10px] text-rose-500">{error}</p>}
      {success && <p className="text-[10px] text-emerald-500">{success}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>Grace period (days)<input type="number" min="0" max="365" value={policy.grace_days} onChange={(event) => setPolicy((current) => ({ ...current, grace_days: event.target.value }))} className={inputClass} /></label>
        <label className={labelClass}>Reminder days<input value={(policy.reminder_days || []).join(', ')} onChange={(event) => setPolicy((current) => ({ ...current, reminder_days: event.target.value.split(',').map((item) => Number(item.trim())).filter((item) => Number.isInteger(item) && item >= 0) }))} className={inputClass} /></label>
        <label className={labelClass}>Expiry behavior<select value={policy.expiry_behavior} onChange={(event) => setPolicy((current) => ({ ...current, expiry_behavior: event.target.value }))} className={inputClass}><option value="mark_expired">Mark expired</option><option value="suspend_company">Suspend company</option><option value="manual_review">Manual review</option></select></label>
        <label className={labelClass}>Post-expiry access<select value={policy.post_expiry_access} onChange={(event) => setPolicy((current) => ({ ...current, post_expiry_access: event.target.value }))} className={inputClass}><option value="restricted">Restricted</option><option value="read_only">Read only</option><option value="blocked">Blocked</option></select></label>
      </div>
      <label className="flex items-center gap-2 text-[10px] font-semibold text-[var(--bf-dev-text-2)]"><input type="checkbox" checked={Boolean(policy.auto_suspend)} onChange={(event) => setPolicy((current) => ({ ...current, auto_suspend: event.target.checked }))} />Automatically suspend when policy requires it</label>
      <label className={labelClass}>Internal notes<textarea rows={5} value={policy.notes || ''} onChange={(event) => setPolicy((current) => ({ ...current, notes: event.target.value }))} className={textareaClass} /></label>
      <div className="flex justify-end border-t border-[var(--bf-dev-border)] pt-4"><SmallButton icon={Save} variant="primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save policy'}</SmallButton></div>
    </div>
  );
}

const MODE_META = {
  companies: ['Company Management', 'Live company records and controlled tenant lifecycle actions.'],
  trials: ['Trials & Renewals', 'Review and update existing company trial windows without changing the authentication architecture.'],
  overrides: ['Company Overrides', 'Apply company-specific plan, limit and entitlement exceptions.'],
  plans: ['Plans', 'Create and maintain commercial plan definitions and duration pricing.'],
  limits: ['Limits & Access', 'Edit per-plan vehicle, user, site and entitlement limits.'],
  renewal: ['Renewal Policy', 'Configure renewal reminders, grace period and expiry handling.'],
};

export default function SaasManagementDialog({ mode, onClose }) {
  const dialogRef = useRef(null);
  const [title, description] = MODE_META[mode] || ['SaaS Management', 'Developer management workspace.'];

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  return (
    <dialog ref={dialogRef} onCancel={onClose} className="m-auto max-h-[92dvh] w-[calc(100%-24px)] max-w-6xl overflow-y-auto rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-0 text-[var(--bf-dev-text)] shadow-2xl backdrop:bg-black/45">
      <div className="sticky top-0 z-10 border-b border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--bf-dev-primary)]"><ShieldCheck size={13} />Secure SaaS backend</div>
            <h2 className="mt-1 text-[19px] font-semibold">{title}</h2>
            <p className="mt-1 max-w-3xl text-[10px] leading-5 text-[var(--bf-dev-text-3)]">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--bf-dev-border)] text-[var(--bf-dev-text-2)]"><X size={15} /></button>
        </div>
      </div>

      <div className="p-5">
        {mode === 'companies' && <CompaniesPanel />}
        {mode === 'trials' && <CompaniesPanel trialOnly />}
        {mode === 'overrides' && <OverridesPanel />}
        {mode === 'plans' && <PlansPanel />}
        {mode === 'limits' && <PlansPanel limitsOnly />}
        {mode === 'renewal' && <RenewalPanel />}
      </div>
    </dialog>
  );
}
