import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ban,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRoundCog,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Page, PageHeader } from '../shared/DeveloperPageUI';
import { getCompanyDirectory, updateCompany as updateLiveCompany } from '../../../services/developerSaasApi';

const DEFAULT_FILTERS = Object.freeze({
  lifecycle: '',
  plan: '',
  fleetPack: '',
  access: '',
  provisioning: '',
  security: '',
  quick: '',
  sort: 'name_asc',
  pageSize: '25',
});

const SUSPEND_REASONS = [
  { value: 'payment_issue', label: 'Payment issue' },
  { value: 'security_issue', label: 'Security issue' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'customer_request', label: 'Customer request' },
  { value: 'other', label: 'Other' },
];

const RESTORE_REASONS = [
  { value: 'issue_resolved', label: 'Issue resolved' },
  { value: 'payment_received', label: 'Payment received' },
  { value: 'security_cleared', label: 'Security cleared' },
  { value: 'customer_request', label: 'Customer request' },
  { value: 'other', label: 'Other' },
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function useOutsideClose(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open, onClose]);
  return ref;
}

function useDebouncedValue(value, delay = 320) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SelectMenu({ value, options, onChange, placeholder = 'All', className = '', ariaLabel = 'Select option' }) {
  const [open, setOpen] = useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useOutsideClose(open, close);
  const selected = options.find((option) => option.value === value);

  return (
    <div ref={ref} className={cx('relative', className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-left text-[10px] font-medium text-[var(--bf-dev-text-2)] outline-none transition hover:bg-[var(--bf-dev-surface-2)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.24)]"
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <ChevronDown size={13} className={cx('shrink-0 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-[80] max-h-72 min-w-full overflow-y-auto rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-1.5 shadow-[0_16px_44px_rgba(15,23,42,.18)]"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cx(
                  'flex w-full items-center justify-between gap-3 rounded-[4px] px-3 py-2 text-left text-[10px] transition',
                  active
                    ? 'bg-[rgb(var(--bf-dev-primary-rgb)/.12)] font-bold text-[var(--bf-dev-primary)]'
                    : 'text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]'
                )}
              >
                <span>{option.label}</span>
                {active && <CheckCircle2 size={12} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HeaderAction({ icon: Icon, children, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-[4px] border border-white/30 bg-white/12 px-3 py-1.5 text-[10px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_1px_2px_rgba(0,0,0,.08)] transition hover:border-white/45 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
}

function SoftButton({ icon: Icon, children, onClick, disabled, danger = false, className = '' }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex h-8 items-center justify-center gap-1.5 rounded-[4px] border px-2.5 text-[9px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.24)] disabled:cursor-not-allowed disabled:opacity-50',
        danger
          ? 'border-rose-500/25 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15'
          : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]',
        className
      )}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
}

function ToneBadge({ tone = 'neutral', children, icon: Icon }) {
  const styles = {
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    info: 'border-[rgb(var(--bf-dev-primary-rgb)/.22)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    warning: 'border-amber-500/25 bg-amber-500/10 text-amber-500',
    danger: 'border-rose-500/25 bg-rose-500/10 text-rose-500',
    neutral: 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]',
  };
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[.06em] whitespace-nowrap', styles[tone] || styles.neutral)}>
      {Icon && <Icon size={10} />}
      {children}
    </span>
  );
}

function SummaryCard({ title, value, helper, icon: Icon, tone = 'primary', active, onClick }) {
  const iconClass = {
    primary: 'bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]',
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    danger: 'bg-rose-500/10 text-rose-500',
    neutral: 'bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]',
  }[tone];

  return (
    <button type="button" onClick={onClick} className="group text-left">
      <Card className={cx('h-full p-4 transition', active ? 'border-[var(--bf-dev-primary)] shadow-[0_0_0_1px_rgb(var(--bf-dev-primary-rgb)/.18)]' : 'group-hover:border-[rgb(var(--bf-dev-primary-rgb)/.28)]')}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[.07em] text-[var(--bf-dev-text-3)]">{title}</div>
            <div className="mt-2 text-[22px] font-extrabold tracking-[-.02em] text-[var(--bf-dev-text)]">{value ?? 0}</div>
            <div className="mt-1 text-[8px] text-[var(--bf-dev-text-3)]">{helper}</div>
          </div>
          <div className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px]', iconClass)}>
            <Icon size={16} />
          </div>
        </div>
      </Card>
    </button>
  );
}

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function expiryText(row) {
  if (!row.expiryAt) return 'No expiry';
  if (row.daysRemaining === 0) return 'Expires today';
  if (Number.isFinite(row.daysRemaining) && row.daysRemaining > 0 && row.daysRemaining <= 7) return `${row.daysRemaining} day${row.daysRemaining === 1 ? '' : 's'} left`;
  if (Number.isFinite(row.daysRemaining) && row.daysRemaining < 0) return 'Expired';
  return formatDate(row.expiryAt);
}

function SecurityCell({ security }) {
  const [open, setOpen] = useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useOutsideClose(open, close);
  const tone = security?.level === 'critical' ? 'danger' : security?.level === 'warning' ? 'warning' : 'success';
  const label = security?.label || 'Clear';

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen((current) => !current)}>
        <ToneBadge tone={tone} icon={security?.level === 'clear' ? ShieldCheck : ShieldAlert}>{label}</ToneBadge>
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+7px)] z-[85] w-72 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-3 shadow-[0_18px_48px_rgba(15,23,42,.20)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-[var(--bf-dev-text)]">Security summary</div>
              <div className="mt-0.5 text-[8px] text-[var(--bf-dev-text-3)]">Last event: {formatDate(security?.lastEventAt, true)}</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-[var(--bf-dev-text-3)] hover:text-[var(--bf-dev-text)]"><X size={13} /></button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ['Locked users', security?.lockedCount || 0],
              ['Restricted', security?.restrictedCount || 0],
              ['Failed-login alerts', security?.failedLoginAlerts || 0],
              ['MFA alerts', security?.mfaAlerts || 0],
            ].map(([name, count]) => (
              <div key={name} className="rounded-[4px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-2">
                <div className="text-[8px] text-[var(--bf-dev-text-3)]">{name}</div>
                <div className="mt-1 text-[11px] font-bold text-[var(--bf-dev-text)]">{count}</div>
              </div>
            ))}
          </div>
          {(security?.alerts || []).length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-[var(--bf-dev-border)] pt-3">
              {(security.alerts || []).slice(0, 4).map((alert, index) => (
                <div key={`${alert.userId || 'user'}-${alert.type}-${index}`} className="rounded-[4px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[9px] font-bold text-[var(--bf-dev-text)]">{alert.name}</span>
                    <span className={cx('shrink-0 text-[8px] font-bold', alert.severity === 'critical' ? 'text-rose-500' : 'text-amber-500')}>{alert.type}</span>
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-[var(--bf-dev-text-3)]">{alert.reason}</div>
                </div>
              ))}
            </div>
          )}
          {(security?.ownerLocked || security?.ownerRestricted) && (
            <div className="mt-3 rounded-[4px] border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-[9px] font-semibold text-rose-500">
              {security.ownerLocked ? 'Company Owner account is locked.' : 'Company Owner access is restricted.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProvisioningCell({ provisioning }) {
  const [open, setOpen] = useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useOutsideClose(open, close);
  const tone = provisioning?.level === 'healthy' ? 'success' : provisioning?.level === 'incomplete' ? 'danger' : 'warning';
  const label = provisioning?.label || 'Attention';

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen((current) => !current)}>
        <ToneBadge tone={tone} icon={provisioning?.level === 'healthy' ? CheckCircle2 : AlertTriangle}>{label}</ToneBadge>
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+7px)] z-[84] w-72 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-3 shadow-[0_18px_48px_rgba(15,23,42,.20)]">
          <div className="text-[10px] font-bold text-[var(--bf-dev-text)]">Provisioning checks</div>
          <div className="mt-2 space-y-1.5">
            {Object.entries(provisioning?.checks || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 text-[9px]">
                <span className="capitalize text-[var(--bf-dev-text-2)]">{key.replaceAll('_', ' ')}</span>
                {value ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-amber-500" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RowActions({ row, onSuspend, onRestore }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useOutsideClose(open, close);
  const openPortal = () => {
    if (!row.subdomain_slug) return;
    window.open(`https://portal.buddyfleets.in/${encodeURIComponent(row.subdomain_slug)}/`, '_blank', 'noopener,noreferrer');
  };
  const go360 = () => navigate(`/saas-platform/companies/${row.id}`);

  const items = [
    { label: 'Open Company 360', icon: Eye, action: go360 },
    { label: 'Edit Company Profile', icon: UserRoundCog, action: go360 },
    { label: 'Open Company Portal', icon: ExternalLink, action: openPortal },
    { label: 'View Audit Activity', icon: Activity, action: go360 },
    row.lifecycle?.key === 'suspended'
      ? { label: 'Restore Company', icon: RotateCcw, action: () => onRestore(row) }
      : { label: 'Suspend Company', icon: Ban, action: () => onSuspend(row), danger: true },
  ];

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        aria-label={`Actions for ${row.company_name}`}
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] transition hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-[90] w-52 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-1.5 shadow-[0_18px_48px_rgba(15,23,42,.20)]">
          {items.map(({ label, icon: Icon, action, danger }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setOpen(false);
                action();
              }}
              className={cx(
                'flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-left text-[9px] font-semibold transition',
                danger ? 'text-rose-500 hover:bg-rose-500/10' : 'text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]'
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LifecycleDialog({ company, mode, onClose, onSubmit, saving }) {
  const options = mode === 'suspend' ? SUSPEND_REASONS : RESTORE_REASONS;
  const [reasonCategory, setReasonCategory] = useState(options[0]?.value || 'other');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_24px_80px_rgba(2,6,23,.35)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--bf-dev-border)] p-5">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[.08em] text-[var(--bf-dev-primary)]">Company lifecycle</div>
            <div className="mt-1 text-[18px] font-extrabold text-[var(--bf-dev-text)]">{mode === 'suspend' ? 'Suspend' : 'Restore'} {company.company_name}?</div>
            <div className="mt-1 text-[9px] leading-4 text-[var(--bf-dev-text-3)]">
              {mode === 'suspend'
                ? 'Company portal access will be blocked. Trial/expiry state is not rewritten.'
                : 'Company access will be restored to its prior valid lifecycle state.'}
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--bf-dev-text-3)] hover:text-[var(--bf-dev-text)]"><X size={16} /></button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-[9px] font-semibold text-[var(--bf-dev-text-2)]">Reason *</span>
            <SelectMenu value={reasonCategory} options={options} onChange={setReasonCategory} className="mt-1.5" ariaLabel="Lifecycle reason" />
          </label>
          <label className="block">
            <span className="text-[9px] font-semibold text-[var(--bf-dev-text-2)]">Internal note</span>
            <textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional context for the audit trail"
              className="mt-1.5 w-full rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2.5 text-[10px] text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text-3)] focus:border-[var(--bf-dev-primary)]"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--bf-dev-border)] p-4">
          <SoftButton onClick={onClose} disabled={saving}>Cancel</SoftButton>
          <SoftButton
            danger={mode === 'suspend'}
            icon={mode === 'suspend' ? Ban : RotateCcw}
            disabled={saving || !reasonCategory}
            onClick={() => onSubmit({ reasonCategory, reasonNote: note.trim() })}
          >
            {saving ? 'Saving…' : mode === 'suspend' ? 'Suspend Company' : 'Restore Company'}
          </SoftButton>
        </div>
      </div>
    </div>
  );
}

function filterOptions(filters) {
  return {
    lifecycle: [
      { value: '', label: 'All lifecycle states' },
      { value: 'active', label: 'Active' },
      { value: 'trial_active', label: 'Trial' },
      { value: 'expired', label: 'Expired' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'pending_confirmation', label: 'Pending confirmation' },
    ],
    plan: [{ value: '', label: 'All plans' }, ...(filters?.plans || [])],
    fleetPack: [{ value: '', label: 'All Fleet Packs' }, ...(filters?.fleetPacks || [])],
    access: [
      { value: '', label: 'All access modes' },
      { value: 'full', label: 'Full' },
      { value: 'read_only', label: 'Read Only' },
      { value: 'blocked', label: 'Blocked' },
    ],
    provisioning: [
      { value: '', label: 'All provisioning states' },
      { value: 'healthy', label: 'Healthy' },
      { value: 'attention', label: 'Attention' },
      { value: 'incomplete', label: 'Incomplete' },
    ],
    security: [
      { value: '', label: 'All security states' },
      { value: 'clear', label: 'Clear' },
      { value: 'warning', label: 'Warning' },
      { value: 'critical', label: 'Critical' },
    ],
    sort: [
      { value: 'name_asc', label: 'Company name A–Z' },
      { value: 'name_desc', label: 'Company name Z–A' },
      { value: 'expiry_asc', label: 'Expiry soonest' },
      { value: 'activity_desc', label: 'Recent activity' },
      { value: 'created_desc', label: 'Newest companies' },
    ],
    pageSize: [
      { value: '25', label: '25 rows' },
      { value: '50', label: '50 rows' },
      { value: '100', label: '100 rows' },
    ],
  };
}

export default function AllCompaniesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rows: [], summary: {}, filters: { plans: [], fleetPacks: [] }, pagination: { page: 1, pageSize: 25, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lifecycleDialog, setLifecycleDialog] = useState(null);

  const options = useMemo(() => filterOptions(data.filters), [data.filters]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getCompanyDirectory({
      search: debouncedQuery,
      lifecycle: filters.lifecycle,
      plan: filters.plan,
      fleetPack: filters.fleetPack,
      access: filters.access,
      provisioning: filters.provisioning,
      security: filters.security,
      quick: filters.quick,
      sort: filters.sort,
      page,
      pageSize: Number(filters.pageSize),
    });
    if (result.ok) {
      setData({
        rows: result.rows || [],
        summary: result.summary || {},
        filters: result.filters || { plans: [], fleetPacks: [] },
        pagination: result.pagination || { page: 1, pageSize: Number(filters.pageSize), total: 0, totalPages: 1 },
      });
    } else {
      setError(result.code || 'Unable to load company directory.');
      setData((current) => ({ ...current, rows: [] }));
    }
    setLoading(false);
  }, [debouncedQuery, filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function applySummaryFilter(type) {
    if (type === 'all') {
      setFilters((current) => ({ ...current, lifecycle: '', quick: '' }));
    } else if (type === 'trial') {
      setFilters((current) => ({ ...current, lifecycle: 'trial_active', quick: '' }));
    } else if (type === 'expired') {
      setFilters((current) => ({ ...current, lifecycle: 'expired', quick: '' }));
    } else if (type === 'suspended') {
      setFilters((current) => ({ ...current, lifecycle: 'suspended', quick: '' }));
    } else if (type === 'active') {
      setFilters((current) => ({ ...current, lifecycle: 'active', quick: '' }));
    } else if (type === 'attention') {
      setFilters((current) => ({ ...current, lifecycle: '', quick: 'needs_attention' }));
    }
    setPage(1);
  }

  function resetFilters() {
    setQuery('');
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  async function submitLifecycle(payload) {
    if (!lifecycleDialog?.company) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const action = lifecycleDialog.mode === 'suspend' ? 'suspend' : 'restore';
    const result = await updateLiveCompany({
      action,
      companyId: lifecycleDialog.company.id,
      source: 'all_companies',
      ...payload,
    });
    if (result.ok) {
      setSuccess(action === 'suspend' ? 'Company suspended and lifecycle action recorded.' : 'Company restored and lifecycle action recorded.');
      setLifecycleDialog(null);
      await load();
    } else {
      setError(result.code || `Unable to ${action} company.`);
    }
    setSaving(false);
  }

  const quickOptions = [
    ['All Companies', '', Building2],
    ['Needs Attention', 'needs_attention', AlertTriangle],
    ['Trials Ending Soon', 'trials_ending', Clock3],
    ['Expired', 'expired', LockKeyhole],
    ['Suspended', 'suspended', Ban],
  ];

  const pagination = data.pagination || {};
  const firstItem = pagination.total ? ((pagination.page - 1) * pagination.pageSize) + 1 : 0;
  const lastItem = pagination.total ? Math.min(pagination.page * pagination.pageSize, pagination.total) : 0;

  return (
    <Page>
      <PageHeader
        eyebrow="SaaS Platform / Companies"
        title="All Companies"
        description="Manage customer companies, subscription state, access, provisioning health and security from one tenant-control view."
        actions={(
          <>
            <HeaderAction icon={RefreshCcw} disabled={loading || saving} onClick={load}>Refresh</HeaderAction>
            <HeaderAction icon={Plus} onClick={() => navigate('/saas-platform/companies/create')}>Create Company</HeaderAction>
          </>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard title="Total Companies" value={data.summary?.total} helper="All tenants" icon={Building2} active={!filters.lifecycle && !filters.quick} onClick={() => applySummaryFilter('all')} />
        <SummaryCard title="Active" value={data.summary?.active} helper="Paid / active" icon={CheckCircle2} tone="success" active={filters.lifecycle === 'active'} onClick={() => applySummaryFilter('active')} />
        <SummaryCard title="Trial" value={data.summary?.trial} helper="Active trials" icon={Clock3} tone="warning" active={filters.lifecycle === 'trial_active'} onClick={() => applySummaryFilter('trial')} />
        <SummaryCard title="Expired / Read Only" value={data.summary?.expired} helper="Login allowed" icon={LockKeyhole} tone="warning" active={filters.lifecycle === 'expired'} onClick={() => applySummaryFilter('expired')} />
        <SummaryCard title="Suspended" value={data.summary?.suspended} helper="Portal blocked" icon={Ban} tone="danger" active={filters.lifecycle === 'suspended'} onClick={() => applySummaryFilter('suspended')} />
        <SummaryCard title="Needs Attention" value={data.summary?.needsAttention} helper="Security / billing / setup" icon={ShieldAlert} tone="danger" active={filters.quick === 'needs_attention'} onClick={() => applySummaryFilter('attention')} />
      </div>

      <Card className="overflow-visible p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bf-dev-text-3)]" />
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder="Search name, code, owner email, portal slug…"
              className="h-9 w-full rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] pl-9 pr-3 text-[10px] text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text-3)] focus:border-[var(--bf-dev-primary)]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {quickOptions.map(([label, value, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (!value) applySummaryFilter('all');
                  else {
                    setFilters((current) => ({ ...current, lifecycle: '', quick: value }));
                    setPage(1);
                  }
                }}
                className={cx(
                  'inline-flex h-8 items-center gap-1.5 rounded-[4px] border px-2.5 text-[8px] font-semibold transition',
                  filters.quick === value && (value || !filters.lifecycle)
                    ? 'border-[rgb(var(--bf-dev-primary-rgb)/.32)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]'
                    : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)]'
                )}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-7">
          <SelectMenu value={filters.lifecycle} options={options.lifecycle} onChange={(value) => setFilter('lifecycle', value)} ariaLabel="Lifecycle filter" />
          <SelectMenu value={filters.plan} options={options.plan} onChange={(value) => setFilter('plan', value)} ariaLabel="Plan filter" />
          <SelectMenu value={filters.fleetPack} options={options.fleetPack} onChange={(value) => setFilter('fleetPack', value)} ariaLabel="Fleet Pack filter" />
          <SelectMenu value={filters.access} options={options.access} onChange={(value) => setFilter('access', value)} ariaLabel="Access filter" />
          <SelectMenu value={filters.provisioning} options={options.provisioning} onChange={(value) => setFilter('provisioning', value)} ariaLabel="Provisioning filter" />
          <SelectMenu value={filters.security} options={options.security} onChange={(value) => setFilter('security', value)} ariaLabel="Security filter" />
          <div className="flex gap-2">
            <SelectMenu value={filters.sort} options={options.sort} onChange={(value) => setFilter('sort', value)} className="min-w-0 flex-1" ariaLabel="Sort companies" />
            <button type="button" title="Reset filters" onClick={resetFilters} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] transition hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]"><RotateCcw size={13} /></button>
          </div>
        </div>
      </Card>

      {error && <div className="rounded-[5px] border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-[10px] font-medium text-rose-500">{error}</div>}
      {success && <div className="rounded-[5px] border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-[10px] font-medium text-emerald-500">{success}</div>}

      <Card className="overflow-visible">
        <div className="flex flex-col gap-3 border-b border-[var(--bf-dev-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[13px] font-semibold text-[var(--bf-dev-text)]">Company directory</div>
            <div className="mt-0.5 text-[8px] text-[var(--bf-dev-text-3)]">Lifecycle, effective access, provisioning and security are deliberately shown as separate states.</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[8px] text-[var(--bf-dev-text-3)]">{loading ? 'Loading…' : `${pagination.total || 0} matching companies`}</div>
            <SelectMenu value={String(filters.pageSize)} options={options.pageSize} onChange={(value) => setFilter('pageSize', value)} className="w-28" ariaLabel="Rows per page" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1710px] w-full border-collapse text-left">
            <thead className="bg-[var(--bf-dev-surface-2)]">
              <tr>
                {['Company', 'Company Code', 'Owner', 'Fleet Pack', 'Plan', 'Lifecycle', 'Access', 'Provisioning', 'Security', 'Sites', 'Expiry', 'Last Activity', 'Actions'].map((heading) => (
                  <th key={heading} className="border-b border-[var(--bf-dev-border)] px-4 py-3 text-[8px] font-bold uppercase tracking-[.07em] text-[var(--bf-dev-text-3)]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && !data.rows.length && (
                <tr>
                  <td colSpan={13} className="px-4 py-14 text-center text-[10px] text-[var(--bf-dev-text-3)]">No companies match the current filters.</td>
                </tr>
              )}
              {data.rows.map((row) => (
                <tr key={row.id} className="group border-b border-[var(--bf-dev-border)] transition hover:bg-[var(--bf-dev-surface-2)]/70">
                  <td className="px-4 py-3 align-top">
                    <button type="button" onClick={() => navigate(`/saas-platform/companies/${row.id}`)} className="max-w-[220px] text-left">
                      <div className="truncate text-[10px] font-bold text-[var(--bf-dev-text)] group-hover:text-[var(--bf-dev-primary)]">{row.company_name}</div>
                      <div className="mt-1 truncate text-[8px] text-[var(--bf-dev-text-3)]">portal.buddyfleets.in/{row.subdomain_slug}</div>
                    </button>
                  </td>
                  <td className="px-4 py-3 align-top text-[9px] font-semibold text-[var(--bf-dev-primary)]">{row.company_code || '—'}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="max-w-[190px] truncate text-[9px] font-semibold text-[var(--bf-dev-text)]">{row.owner?.name || 'Owner not configured'}</div>
                    <div className="mt-1 max-w-[190px] truncate text-[8px] text-[var(--bf-dev-text-3)]">{row.owner?.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="max-w-[180px] truncate text-[9px] font-semibold text-[var(--bf-dev-text)]">{row.fleet?.primary?.name || 'Not selected'}</div>
                    {(row.fleet?.additionalCount || 0) > 0 && <div className="mt-1 text-[8px] text-[var(--bf-dev-primary)]">+{row.fleet.additionalCount} additional</div>}
                  </td>
                  <td className="px-4 py-3 align-top text-[9px] font-semibold text-[var(--bf-dev-text)]">{row.plan?.name || 'Not assigned'}</td>
                  <td className="px-4 py-3 align-top"><ToneBadge tone={row.lifecycle?.tone}>{row.lifecycle?.label || 'Unknown'}</ToneBadge></td>
                  <td className="px-4 py-3 align-top"><ToneBadge tone={row.access?.key === 'full' ? 'success' : row.access?.key === 'read_only' ? 'warning' : 'danger'}>{row.access?.label || 'Blocked'}</ToneBadge></td>
                  <td className="px-4 py-3 align-top"><ProvisioningCell provisioning={row.provisioning} /></td>
                  <td className="px-4 py-3 align-top"><SecurityCell security={row.security} /></td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-[10px] font-bold text-[var(--bf-dev-text)]">{row.sites?.active || 0}</div>
                    <div className="mt-1 text-[8px] text-[var(--bf-dev-text-3)]">{row.sites?.total || 0} total</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className={cx('text-[9px] font-semibold', Number.isFinite(row.daysRemaining) && row.daysRemaining <= 7 ? 'text-amber-500' : 'text-[var(--bf-dev-text)]')}>{expiryText(row)}</div>
                    <div className="mt-1 text-[8px] text-[var(--bf-dev-text-3)]">{row.expiryAt ? formatDate(row.expiryAt) : '—'}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-[8px] text-[var(--bf-dev-text-2)]">{formatDate(row.lastActivityAt, true)}</td>
                  <td className="px-4 py-3 align-top"><RowActions row={row} onSuspend={(company) => setLifecycleDialog({ company, mode: 'suspend' })} onRestore={(company) => setLifecycleDialog({ company, mode: 'restore' })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--bf-dev-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[8px] text-[var(--bf-dev-text-3)]">Showing {firstItem}–{lastItem} of {pagination.total || 0}</div>
          <div className="flex items-center gap-2">
            <SoftButton icon={ChevronLeft} disabled={loading || (pagination.page || 1) <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</SoftButton>
            <div className="min-w-[72px] text-center text-[9px] font-semibold text-[var(--bf-dev-text-2)]">Page {pagination.page || 1} / {pagination.totalPages || 1}</div>
            <SoftButton icon={ChevronRight} disabled={loading || (pagination.page || 1) >= (pagination.totalPages || 1)} onClick={() => setPage((current) => current + 1)}>Next</SoftButton>
          </div>
        </div>
      </Card>

      {lifecycleDialog && (
        <LifecycleDialog
          company={lifecycleDialog.company}
          mode={lifecycleDialog.mode}
          saving={saving}
          onClose={() => !saving && setLifecycleDialog(null)}
          onSubmit={submitLifecycle}
        />
      )}
    </Page>
  );
}
