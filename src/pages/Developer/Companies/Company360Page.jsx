import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Gauge,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Lock,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  PackageCheck,
  PanelsTopLeft,
  Plus,
  Printer,
  ReceiptText,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Unlock,
  UserCog,
  UserPlus,
  Users,
  WalletCards,
  Wrench,
  X,
} from 'lucide-react';
import { company360Action, getCompany360 } from '../../../services/developerCompany360Api';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      ['overview', 'Overview', LayoutDashboard],
    ],
  },
  {
    label: 'Company',
    items: [
      ['profile', 'Company Profile', Building2],
      ['sites', 'Sites & Branches', MapPin],
      ['documents', 'Documents & KYC', FileCheck2],
    ],
  },
  {
    label: 'Commercial',
    items: [
      ['subscription', 'Subscription & Plan', PackageCheck],
      ['billing', 'Billing & Payments', WalletCards],
      ['invoices', 'Invoices & Receipts', ReceiptText],
      ['usage', 'Usage & Limits', Gauge],
    ],
  },
  {
    label: 'Access & Configuration',
    items: [
      ['employees', 'Employees & Access', Users],
      ['fleet', 'Fleet Packs', PanelsTopLeft],
      ['modules', 'Modules & Features', SlidersHorizontal],
      ['overrides', 'Overrides', Wrench],
      ['portal', 'Portal Configuration', Settings2],
    ],
  },
  {
    label: 'Control',
    items: [
      ['security', 'Security', ShieldCheck],
      ['communications', 'Communications', MessageSquareText],
      ['activity', 'Activity Log', Activity],
      ['support', 'Support & Notes', FileText],
    ],
  },
];

const CONTROL_CARDS = [
  ['profile', 'Company Profile', 'Identity, legal details, ownership and registered address.', Building2],
  ['sites', 'Sites & Branches', 'Company locations, primary site and tenant site footprint.', MapPin],
  ['subscription', 'Subscription & Plan', 'Commercial plan, lifecycle state and effective runtime access.', PackageCheck],
  ['billing', 'Billing & Payments', 'Invoices, payments, outstanding balance and receipts.', CreditCard],
  ['employees', 'Employees & Access', 'Tenant users, access state, password actions and roles.', Users],
  ['fleet', 'Fleet Packs', 'Primary fleet pack and enabled fleet business packs.', PanelsTopLeft],
  ['modules', 'Modules & Features', 'Effective modules, feature access and plan coverage.', SlidersHorizontal],
  ['portal', 'Portal Configuration', 'Landing page, portal widgets, navigation and tenant settings.', Settings2],
  ['security', 'Security', 'Tenant security posture and protected access controls.', ShieldCheck],
  ['communications', 'Communications', 'Platform announcements and tenant communication history.', Bell],
  ['activity', 'Activity Log', 'Developer actions, important configuration changes and audit trail.', Activity],
  ['support', 'Support & Notes', 'Internal notes and future support follow-up context.', FileText],
];

const surfaceCard = 'rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_1px_2px_rgba(0,0,0,.04)]';
const input = 'h-10 w-full rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[13px] font-medium text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text)] focus:border-[var(--bf-dev-primary)]';
const label = 'block space-y-1.5 text-[12px] font-semibold text-[var(--bf-dev-text)]';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function humanize(value) {
  if (!value) return '—';
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function SelectMenu({ value, options, onChange, ariaLabel = 'Select option', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={ref} className={cx('relative', className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-left text-[13px] font-medium text-[var(--bf-dev-text)] outline-none transition hover:bg-[var(--bf-dev-surface-2)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.24)]"
      >
        <span className="truncate">{selected?.label || 'Select'}</span>
        <ChevronDown size={13} className={cx('shrink-0 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div role="listbox" className="absolute left-0 top-[calc(100%+6px)] z-[150] max-h-72 min-w-full overflow-y-auto rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-1.5 shadow-[0_16px_44px_rgba(0,0,0,.22)]">
          {options.map((option) => {
            const active = String(option.value) === String(value);
            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={cx(
                  'flex w-full items-center justify-between gap-3 rounded-[4px] px-3 py-2.5 text-left text-[13px] font-medium transition',
                  active
                    ? 'bg-[rgb(var(--bf-dev-primary-rgb)/.12)] font-bold text-[var(--bf-dev-primary)]'
                    : 'text-[var(--bf-dev-text)] hover:bg-[var(--bf-dev-surface-2)]'
                )}
              >
                <span>{option.label}</span>
                {active && <CheckCircle2 size={13} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Button({ children, icon: Icon, primary = false, danger = false, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        'inline-flex min-h-9 items-center justify-center gap-2 rounded-[4px] border px-3 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.28)] disabled:cursor-not-allowed disabled:opacity-50',
        primary
          ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white hover:brightness-110'
          : danger
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15'
            : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]',
        className
      )}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function ToneBadge({ tone = 'neutral', children }) {
  const styles = {
    success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500',
    warning: 'border-amber-500/25 bg-amber-500/10 text-amber-500',
    danger: 'border-rose-500/25 bg-rose-500/10 text-rose-500',
    primary: 'border-[rgb(var(--bf-dev-primary-rgb)/.28)] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]',
    neutral: 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text)]',
  };
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.05em]', styles[tone] || styles.neutral)}>
      {children}
    </span>
  );
}

function Money({ value }) {
  return <>₹{Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</>;
}

function Empty({ text = 'No records yet.' }) {
  return (
    <div className="rounded-[5px] border border-dashed border-[var(--bf-dev-border)] p-6 text-center text-[13px] font-medium text-[var(--bf-dev-text)]">
      {text}
    </div>
  );
}

function InfoStat({ icon: Icon, label: statLabel, value, helper, progress }) {
  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-bold uppercase tracking-[.06em] text-[var(--bf-dev-text)]">{statLabel}</div>
          <div className="mt-2 truncate text-[22px] font-extrabold tracking-[-.02em] text-[var(--bf-dev-text)]">{value}</div>
          {helper && <div className="mt-1 text-[12px] font-medium text-[var(--bf-dev-text)]">{helper}</div>}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]">
          <Icon size={17} />
        </div>
      </div>
      {Number.isFinite(progress) && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bf-dev-surface-3)]">
          <div className="h-full rounded-full bg-[var(--bf-dev-primary)]" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      )}
    </div>
  );
}

function MoreActionsMenu({ onPrint, onExport, onAnnouncement, onPayment, onEmployee }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const actions = [
    ['Send Announcement', Bell, onAnnouncement],
    ['Record Payment', WalletCards, onPayment],
    ['Add Employee', UserPlus, onEmployee],
    ['Export Excel', Download, onExport],
    ['Print Report', Printer, onPrint],
  ];

  return (
    <div ref={ref} className="relative">
      <Button icon={MoreHorizontal} onClick={() => setOpen((current) => !current)}>
        More Actions <ChevronDown size={13} className={cx('transition', open && 'rotate-180')} />
      </Button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-[120] w-56 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,.22)]">
          {actions.map(([text, Icon, onClick]) => (
            <button
              key={text}
              type="button"
              onClick={() => {
                setOpen(false);
                onClick();
              }}
              className="flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2.5 text-left text-[12px] font-semibold text-[var(--bf-dev-text)] transition hover:bg-[var(--bf-dev-surface-2)]"
            >
              <Icon size={14} className="text-[var(--bf-dev-primary)]" />
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Company360Nav({ active, onChange }) {
  return (
    <aside className={cx(surfaceCard, 'overflow-hidden print:hidden lg:sticky lg:top-4 lg:self-start')}>
      <div className="border-b border-[var(--bf-dev-border)] px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]">
            <Building2 size={17} />
          </div>
          <div>
            <div className="text-[15px] font-bold text-[var(--bf-dev-text)]">Company 360</div>
            <div className="mt-0.5 text-[12px] font-medium text-[var(--bf-dev-text)]">Tenant control center</div>
          </div>
        </div>
      </div>

      <div className="hidden max-h-[calc(100dvh-150px)] overflow-y-auto p-2 lg:block">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label} className={cx(groupIndex > 0 && 'mt-4')}>
            <div className="px-2 pb-1.5 text-[11px] font-extrabold uppercase tracking-[.08em] text-[var(--bf-dev-text)]">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map(([key, text, Icon]) => {
                const selected = active === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    className={cx(
                      'flex w-full items-center gap-2.5 rounded-[5px] border px-3 py-2.5 text-left text-[12px] font-semibold transition',
                      selected
                        ? 'border-[rgb(var(--bf-dev-primary-rgb)/.24)] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]'
                        : 'border-transparent text-[var(--bf-dev-text)] hover:border-[var(--bf-dev-border)] hover:bg-[var(--bf-dev-surface-2)]'
                    )}
                  >
                    <Icon size={15} />
                    <span className="min-w-0 flex-1 truncate">{text}</span>
                    {selected && <ChevronRight size={13} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 overflow-x-auto p-2 lg:hidden">
        {NAV_GROUPS.flatMap((group) => group.items).map(([key, text, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cx(
              'inline-flex shrink-0 items-center gap-2 rounded-[5px] border px-3 py-2 text-[12px] font-semibold transition',
              active === key
                ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white'
                : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text)]'
            )}
          >
            <Icon size={14} />
            {text}
          </button>
        ))}
      </div>
    </aside>
  );
}

function HeroCard({ company, profile, data, activeEmployees }) {
  const sites = data.sites || [];
  const activeSites = sites.filter((site) => site.status === 'active').length;
  const planName = data.effective?.plan?.name || data.effective?.planKey || 'No plan assigned';
  const lifecycle = data.subscriptionContext?.lifecycle_state || data.subscription?.status || company.status;
  const location = [profile.city, profile.state].filter(Boolean).join(', ') || 'Location not configured';

  return (
    <section className={cx(surfaceCard, 'relative overflow-hidden p-5 sm:p-6')}>
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[rgb(var(--bf-dev-primary-rgb)/.14)] blur-3xl" />
      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[6px] border border-[rgb(var(--bf-dev-primary-rgb)/.28)] bg-[rgb(var(--bf-dev-primary-rgb)/.14)] text-[20px] font-black text-[var(--bf-dev-primary)]">
              {(company.company_name || 'C').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-[24px] font-extrabold tracking-[-.02em] text-[var(--bf-dev-text)] sm:text-[28px]">
                  {company.company_name || 'Company'}
                </h1>
                <ToneBadge tone={company.status === 'suspended' ? 'danger' : company.status?.includes('expired') ? 'warning' : 'success'}>
                  {humanize(company.status)}
                </ToneBadge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold text-[var(--bf-dev-text)]">
                <span>{company.company_code || 'No company code'}</span>
                <span aria-hidden="true">•</span>
                <span className="break-all">portal.buddyfleets.in/{company.subdomain_slug || 'no-slug'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <HeroFact icon={MapPin} label="Location" value={location} />
            <HeroFact icon={Landmark} label="Sites / Branches" value={`${activeSites} active`} />
            <HeroFact icon={Users} label="Employees" value={`${activeEmployees} active`} />
            <HeroFact icon={PackageCheck} label="Effective Plan" value={planName} />
          </div>
        </div>

        <div className="min-w-[220px] rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4 xl:max-w-[280px]">
          <div className="text-[11px] font-extrabold uppercase tracking-[.08em] text-[var(--bf-dev-text)]">Runtime State</div>
          <div className="mt-3 flex items-center justify-between gap-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">
            <span>Lifecycle</span>
            <span className="text-right">{humanize(lifecycle)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">
            <span>Access</span>
            <span className="text-right">{humanize(data.subscriptionContext?.lifecycle_access || '—')}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">
            <span>Fleet Setup</span>
            <span className="text-right">{humanize(data.portalSettings?.fleet_pack_selection_status || 'pending')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFact({ icon: Icon, label: factLabel, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[rgb(var(--bf-dev-primary-rgb)/.11)] text-[var(--bf-dev-primary)]">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[.05em] text-[var(--bf-dev-text)]">{factLabel}</div>
        <div className="mt-0.5 truncate text-[13px] font-bold text-[var(--bf-dev-text)]">{value}</div>
      </div>
    </div>
  );
}

function ControlModuleGrid({ onOpen, data, activeEmployees }) {
  const badges = {
    subscription: data.effective?.plan?.name || data.effective?.planKey || '',
    billing: Number(data.billingSummary?.outstanding || 0) > 0 ? `₹${Number(data.billingSummary.outstanding).toLocaleString('en-IN')} due` : 'Clear',
    employees: `${activeEmployees} active`,
    fleet: humanize(data.portalSettings?.fleet_pack_selection_status || 'pending'),
    modules: `${(data.modules || []).filter((module) => module.effective_access !== 'blocked').length} enabled`,
    security: companySecurityLabel(data),
  };

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[var(--bf-dev-text)]">Control Modules</h2>
          <p className="mt-1 text-[12px] font-medium text-[var(--bf-dev-text)]">Open a tenant-control area without mixing in the client’s daily operations.</p>
        </div>
        <ToneBadge tone="primary">Developer Control Plane</ToneBadge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {CONTROL_CARDS.map(([key, title, description, Icon]) => (
          <button key={key} type="button" onClick={() => onOpen(key)} className="group text-left">
            <div className={cx(surfaceCard, 'h-full p-4 transition group-hover:border-[rgb(var(--bf-dev-primary-rgb)/.38)] group-hover:shadow-[0_0_0_1px_rgb(var(--bf-dev-primary-rgb)/.10)]')}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[14px] font-bold text-[var(--bf-dev-text)]">{title}</div>
                    {badges[key] && <span className="rounded-full bg-[var(--bf-dev-surface-2)] px-2 py-1 text-[10px] font-bold text-[var(--bf-dev-text)]">{badges[key]}</span>}
                  </div>
                  <p className="mt-1.5 text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">{description}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--bf-dev-primary)]">
                    Manage <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function companySecurityLabel(data) {
  const blocked = (data.employees || []).filter((employee) => employee.status === 'blocked').length;
  if (blocked > 0) return `${blocked} blocked`;
  return 'Clear';
}

function TenantDiagnostics({ data }) {
  const health = data.provisioningHealth || {};
  const items = [
    ['Tenant profile', Boolean(data.profile), 'Company profile record available'],
    ['Portal settings', health.portal_settings, 'Runtime portal settings provisioned'],
    ['Primary site', health.primary_site, 'Primary active site available'],
    ['Owner access', health.owner_access, 'Owner runtime access linked'],
    ['Portal config', health.portal_config, 'Tenant portal configuration available'],
  ];
  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold text-[var(--bf-dev-text)]">Tenant Diagnostics</div>
          <div className="mt-1 text-[12px] font-medium text-[var(--bf-dev-text)]">Current foundation checks from live tenant data.</div>
        </div>
        <Wrench size={18} className="text-[var(--bf-dev-primary)]" />
      </div>
      <div className="mt-4 space-y-3">
        {items.map(([title, ok, helper]) => (
          <div key={title} className="flex items-start gap-2.5 border-t border-[var(--bf-dev-border)] pt-3 first:border-0 first:pt-0">
            {ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-500" /> : <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-500" />}
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-[var(--bf-dev-text)]">{title}</div>
              <div className="mt-0.5 text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">{helper}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProvisioningReadiness({ health = {}, onOpen }) {
  const items = [
    ['Portal settings', health.portal_settings],
    ['Fleet Pack selected', health.fleet_pack_selected],
    ['Primary site', health.primary_site],
    ['System roles', health.system_roles],
    ['Owner access', health.owner_access],
    ['Owner profile', health.owner_profile],
    ['Developer owner row', health.developer_owner_employee],
    ['Portal config', health.portal_config],
    ['Subscription', health.subscription],
  ];
  const passed = items.filter(([, ok]) => ok).length;
  const percent = items.length ? Math.round((passed / items.length) * 100) : 0;

  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold text-[var(--bf-dev-text)]">Provisioning Readiness</div>
          <div className="mt-1 text-[12px] font-medium text-[var(--bf-dev-text)]">{passed}/{items.length} checks currently healthy</div>
        </div>
        <ToneBadge tone={percent === 100 ? 'success' : 'warning'}>{percent}%</ToneBadge>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bf-dev-surface-3)]">
        <div className={cx('h-full rounded-full', percent === 100 ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-4 space-y-2.5">
        {items.slice(0, 6).map(([name, ok]) => (
          <div key={name} className="flex items-center justify-between gap-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">
            <span>{name}</span>
            {ok ? <CheckCircle2 size={15} className="text-emerald-500" /> : <AlertTriangle size={15} className="text-amber-500" />}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onOpen('activity')} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--bf-dev-primary)] hover:underline">
        View tenant control history <ChevronRight size={13} />
      </button>
    </div>
  );
}

function QuickAlerts({ data, onOpen }) {
  const alerts = [];
  const outstanding = Number(data.billingSummary?.outstanding || 0);
  const health = data.provisioningHealth || {};
  if (outstanding > 0) alerts.push(['Billing outstanding', `₹${outstanding.toLocaleString('en-IN')} currently outstanding`, 'billing', 'warning']);
  if (!health.fleet_pack_selected) alerts.push(['Fleet Pack setup pending', 'Company has not completed explicit Fleet Pack selection.', 'fleet', 'warning']);
  if (!health.owner_access) alerts.push(['Owner access needs review', 'Company owner runtime access is not healthy.', 'employees', 'danger']);
  if (!health.primary_site) alerts.push(['Primary site missing', 'No active primary site is currently provisioned.', 'sites', 'warning']);
  if (!alerts.length) alerts.push(['No critical foundation alerts', 'Current Company 360 foundation checks are healthy.', 'overview', 'success']);

  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold text-[var(--bf-dev-text)]">Recent Alerts</div>
          <div className="mt-1 text-[12px] font-medium text-[var(--bf-dev-text)]">Only current tenant-control attention items are shown.</div>
        </div>
        <Bell size={18} className="text-[var(--bf-dev-primary)]" />
      </div>
      <div className="mt-4 space-y-3">
        {alerts.slice(0, 4).map(([title, helper, target, tone]) => (
          <button key={title} type="button" onClick={() => onOpen(target)} className="flex w-full items-start gap-2.5 border-t border-[var(--bf-dev-border)] pt-3 text-left first:border-0 first:pt-0">
            <span className={cx('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', tone === 'success' ? 'bg-emerald-500' : tone === 'danger' ? 'bg-rose-500' : 'bg-amber-500')} />
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-bold text-[var(--bf-dev-text)]">{title}</span>
              <span className="mt-0.5 block text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">{helper}</span>
            </span>
            <ChevronRight size={14} className="mt-1 shrink-0 text-[var(--bf-dev-primary)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function OverviewPage({ data, activeEmployees, onOpen }) {
  const limits = data.effective?.limits || {};
  const activeSites = (data.sites || []).filter((site) => site.status === 'active').length;
  const userLimit = Number(limits.users);
  const siteLimit = Number(limits.sites);
  const employeeProgress = Number.isFinite(userLimit) && userLimit > 0 ? (activeEmployees / userLimit) * 100 : undefined;
  const siteProgress = Number.isFinite(siteLimit) && siteLimit > 0 ? (activeSites / siteLimit) * 100 : undefined;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoStat icon={PackageCheck} label="Effective Plan" value={data.effective?.plan?.name || data.effective?.planKey || '—'} helper={humanize(data.subscription?.status || 'No subscription')} />
        <InfoStat icon={CircleDollarSign} label="Outstanding" value={<Money value={data.billingSummary?.outstanding} />} helper="Current billing balance" />
        <InfoStat icon={Users} label="Active Employees" value={activeEmployees} helper={Number.isFinite(userLimit) ? `${activeEmployees} / ${userLimit} users` : `${(data.employees || []).length} total records`} progress={employeeProgress} />
        <InfoStat icon={MapPin} label="Active Sites" value={activeSites} helper={Number.isFinite(siteLimit) ? `${activeSites} / ${siteLimit} sites` : `${(data.sites || []).length} total sites`} progress={siteProgress} />
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <ControlModuleGrid onOpen={onOpen} data={data} activeEmployees={activeEmployees} />
        </div>
        <div className="space-y-4">
          <TenantDiagnostics data={data} />
          <ProvisioningReadiness health={data.provisioningHealth} onOpen={onOpen} />
          <QuickAlerts data={data} onOpen={onOpen} />
        </div>
      </div>
    </div>
  );
}

function FleetAccessPanel({ data, onAction }) {
  const settings = data.portalSettings || {};
  const packs = data.fleetPacks || [];
  const [firstPack] = packs;
  const [primary, setPrimary] = useState(settings.fleet_pack || firstPack?.pack_key || '');
  const [enabled, setEnabled] = useState(Array.isArray(settings.enabled_packs) ? settings.enabled_packs : []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrimary(settings.fleet_pack || firstPack?.pack_key || '');
    setEnabled(Array.isArray(settings.enabled_packs) ? settings.enabled_packs : []);
  }, [settings.fleet_pack, settings.fleet_pack_selection_status, firstPack?.pack_key]);

  async function savePacks() {
    setSaving(true);
    await onAction({ action: 'set_fleet_packs', primaryPack: primary, enabledPacks: [...new Set([primary, ...enabled])] }, 'Fleet Pack configuration saved.');
    setSaving(false);
  }

  const overrides = new Map((data.companyModuleOverrides || []).map((override) => [override.module_key, override]));
  async function saveOverride(moduleKey, accessLevel) {
    await onAction({ action: 'save_module_override', moduleKey, accessLevel, enabled: accessLevel !== 'blocked', reason: 'Company 360 Developer override' }, 'Module override saved.');
  }
  async function clearOverride(moduleKey) {
    await onAction({ action: 'clear_module_override', moduleKey }, 'Module override cleared.');
  }

  return (
    <div className="space-y-4">
      <Section title="Fleet Pack Assignment" action={<Button primary icon={Save} disabled={saving || !primary} onClick={savePacks}>{saving ? 'Saving…' : 'Save Fleet Packs'}</Button>}>
        <div className="grid gap-3 lg:grid-cols-3">
          <label className={label}>
            Primary Fleet Pack
            <SelectMenu
              value={primary}
              ariaLabel="Primary Fleet Pack"
              options={packs.map((pack) => ({ value: pack.pack_key, label: pack.name }))}
              onChange={(value) => { setPrimary(value); setEnabled((current) => [...new Set([value, ...current])]); }}
            />
          </label>
          <Grid rows={[["Selection status", settings.fleet_pack_selection_status || 'pending'], ["Selected at", formatDate(settings.fleet_pack_selected_at, true)]]} />
        </div>
        <div className="mt-4">
          <div className="mb-2 text-[12px] font-bold text-[var(--bf-dev-text)]">Enabled Fleet Packs</div>
          <div className="flex flex-wrap gap-2">
            {packs.map((pack) => (
              <label key={pack.pack_key} className="flex items-center gap-2 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-3 py-2 text-[12px] font-semibold text-[var(--bf-dev-text)]">
                <input
                  type="checkbox"
                  checked={enabled.includes(pack.pack_key) || primary === pack.pack_key}
                  disabled={primary === pack.pack_key}
                  onChange={(event) => setEnabled(event.target.checked ? [...new Set([...enabled, pack.pack_key])] : enabled.filter((value) => value !== pack.pack_key))}
                />
                {pack.short_name || pack.name}
              </label>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[12px] font-medium text-[var(--bf-dev-text)]">Pending compatibility value <b>travels</b> is not treated as the real company type until this selection is explicitly saved.</p>
      </Section>

      <Section title="Company Module Overrides">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr>{['Module', 'Effective access', 'Company override', 'Set', 'Clear'].map((heading) => <th key={heading} className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[12px] font-bold uppercase tracking-[.05em] text-[var(--bf-dev-text)]">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {(data.modules || []).map((module) => {
                const override = overrides.get(module.module_key);
                return (
                  <tr key={module.module_key} className="border-b border-[var(--bf-dev-border)]">
                    <td className="px-3 py-3 text-[12px] text-[var(--bf-dev-text)]"><b>{module.module_name}</b><div className="mt-0.5 text-[11px] font-medium text-[var(--bf-dev-text)]">{module.module_key}</div></td>
                    <td className="px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">{humanize(module.effective_access || 'blocked')}</td>
                    <td className="px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">{override ? `${override.enabled ? 'Enabled' : 'Disabled'} · ${humanize(override.access_level)}` : 'Plan default'}</td>
                    <td className="px-3 py-3">
                      <SelectMenu
                        value={override?.access_level || 'full'}
                        ariaLabel={`Access for ${module.module_name}`}
                        className="w-36"
                        options={[{ value: 'full', label: 'Full' }, { value: 'read_only', label: 'Read only' }, { value: 'blocked', label: 'Blocked' }]}
                        onChange={(value) => saveOverride(module.module_key, value)}
                      />
                    </td>
                    <td className="px-3 py-3"><Button danger={Boolean(override)} disabled={!override} onClick={() => clearOverride(module.module_key)}>Clear</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

export default function Company360Page() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    const result = await getCompany360(companyId);
    if (result.ok) setData(result);
    else setError(result.status === 401 ? 'Developer session expired. Please sign in again.' : 'Unable to load Company 360 profile.');
    setLoading(false);
  }

  useEffect(() => { load(); }, [companyId]);

  const company = data?.company || {};
  const profile = data?.profile || {};
  const subscription = data?.subscription || {};
  const summary = data?.billingSummary || {};
  const activeEmployees = (data?.employees || []).filter((employee) => employee.status === 'active').length;

  async function act(payload, success) {
    const result = await company360Action(companyId, payload);
    if (!result.ok) {
      setNotice({ tone: 'danger', message: result.message || result.code || 'Action failed' });
      return false;
    }
    if (success) setNotice({ tone: 'success', message: success });
    await load();
    setModal(null);
    return true;
  }

  function printCompany() { window.print(); }

  async function exportExcel() {
    if (!data) return;
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const add = (name, rows) => XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.length ? rows : [{ Info: 'No records' }]), name.slice(0, 31));
    add('Company_Profile', [{ ...company, ...profile }]);
    add('Subscription', [subscription]);
    add('Effective_Limits', [data.effective?.limits || {}]);
    add('Employees', data.employees || []);
    add('Invoices', data.invoices || []);
    add('Payments', data.payments || []);
    add('Documents', data.documents || []);
    add('Modules', (data.modules || []).map((module) => ({ module_key: module.module_key, module_name: module.module_name, effective_access: module.effective_access, status: module.status })));
    add('Announcements', data.announcements || []);
    add('Notes', data.notes || []);
    XLSX.writeFile(workbook, `${(company.company_name || 'Company').replace(/[^a-z0-9]+/gi, '_')}_BuddyFleets_Export.xlsx`);
  }

  function openPortal() {
    if (!company.subdomain_slug) return;
    window.open(`https://portal.buddyfleets.in/${encodeURIComponent(company.subdomain_slug)}/`, '_blank', 'noopener,noreferrer');
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] p-6 text-[var(--bf-dev-text)]">
        <div className="mx-auto max-w-7xl animate-pulse space-y-4">
          <div className="h-10 w-56 rounded-[5px] bg-[var(--bf-dev-surface-2)]" />
          <div className="h-48 rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)]" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)]" />)}</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] p-6 text-[var(--bf-dev-text)]">
        <div className="mx-auto max-w-4xl">
          <Button icon={ArrowLeft} onClick={() => navigate('/saas-platform/companies/all-companies')}>Back to All Companies</Button>
          <div className="mt-4 rounded-[6px] border border-rose-500/25 bg-rose-500/10 p-4 text-[13px] font-semibold text-rose-500">{error || 'Company not found.'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] text-[var(--bf-dev-text)] print:bg-white print:text-black">
      <div className="border-b border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-4 py-4 print:hidden sm:px-6 xl:px-8">
        <div className="mx-auto flex max-w-[1720px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[var(--bf-dev-text)]">
              <button type="button" onClick={() => navigate('/saas-platform/companies/all-companies')} className="inline-flex items-center gap-1.5 hover:text-[var(--bf-dev-primary)]"><ArrowLeft size={14} /> All Companies</button>
              <span>/</span>
              <span>{company.company_name}</span>
              <span>/</span>
              <span className="text-[var(--bf-dev-primary)]">Company 360</span>
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
              <h2 className="text-[22px] font-extrabold tracking-[-.02em] text-[var(--bf-dev-text)]">Company 360</h2>
              <span className="pb-0.5 text-[12px] font-medium text-[var(--bf-dev-text)]">Complete developer-side view and control for this tenant.</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button icon={RefreshCcw} onClick={load}>Refresh</Button>
            <Button icon={ExternalLink} onClick={openPortal} disabled={!company.subdomain_slug}>Open Portal</Button>
            <Button icon={UserCog} primary onClick={() => setTab('profile')}>Edit Company</Button>
            <MoreActionsMenu onPrint={printCompany} onExport={exportExcel} onAnnouncement={() => setModal('announcement')} onPayment={() => setModal('payment')} onEmployee={() => setModal('employee')} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1720px] gap-4 px-4 py-5 sm:px-6 xl:px-8 lg:grid-cols-[245px_minmax(0,1fr)]">
        <Company360Nav active={tab} onChange={setTab} />

        <main className="min-w-0 space-y-5">
          <HeroCard company={company} profile={profile} data={data} activeEmployees={activeEmployees} />

          <div className="print:hidden">
            {tab === 'overview' && <OverviewPage data={data} activeEmployees={activeEmployees} onOpen={setTab} />}

            {tab === 'profile' && <Section title="Company Profile"><Grid rows={[
              ['Company Name', company.company_name], ['Company Code', company.company_code], ['Legal Name', profile.legal_name], ['Trade Name', profile.trade_name], ['GSTIN', profile.gstin], ['PAN', profile.pan], ['CIN / Registration', profile.cin], ['Aadhaar Ref', profile.aadhaar_last4 ? `•••• ${profile.aadhaar_last4}` : ''], ['Owner', profile.owner_name], ['Owner Email', profile.owner_email], ['Owner Mobile', profile.owner_mobile], ['Company Email', profile.contact_email], ['Company Mobile', profile.contact_mobile], ['Billing Email', profile.billing_email], ['Website', profile.website], ['Address', [profile.address_line1, profile.address_line2, profile.city, profile.state, profile.postal_code, profile.country].filter(Boolean).join(', ')],
            ]} /></Section>}

            {tab === 'sites' && <Section title="Sites & Branches"><Table headers={['Code', 'Site', 'Type', 'Primary', 'Status']} rows={(data.sites || []).map((site) => [site.code, site.name, site.site_type, site.is_primary ? 'Yes' : 'No', humanize(site.status)])} /></Section>}

            {tab === 'subscription' && <Section title="Subscription & Plan"><Grid rows={[["Status", humanize(subscription.status)], ["Selected commercial plan", subscription.plan_key || 'Not assigned'], ["Effective runtime plan", data.subscriptionContext?.effective_plan_key || data.effective?.planKey], ["Lifecycle access", humanize(data.subscriptionContext?.lifecycle_access || '—')], ["Trial Start", formatDate(subscription.trial_start_at)], ["Trial End", formatDate(subscription.trial_end_at)], ["Subscription Start", formatDate(subscription.subscription_start_at)], ["Subscription End", formatDate(subscription.subscription_end_at)]]} /></Section>}

            {tab === 'billing' && <Section title="Billing & Payments" action={<Button icon={Plus} primary onClick={() => setModal('payment')}>Record Payment</Button>}><Table headers={['Date', 'Amount', 'Mode', 'Reference', 'Status']} rows={(data.payments || []).map((payment) => [formatDate(payment.payment_date), <Money value={payment.amount} />, humanize(payment.payment_mode), payment.transaction_reference, humanize(payment.status)])} /></Section>}

            {tab === 'invoices' && <Section title="Invoices & Receipts" action={<Button icon={Plus} primary onClick={() => setModal('invoice')}>Generate Invoice</Button>}><Table headers={['Invoice', 'Date', 'Due', 'Amount', 'Paid', 'Status']} rows={(data.invoices || []).map((invoice) => [invoice.invoice_number, formatDate(invoice.invoice_date), formatDate(invoice.due_date), <Money value={invoice.grand_total} />, <Money value={invoice.paid_amount} />, humanize(invoice.status)])} /></Section>}

            {tab === 'employees' && <Section title="Employees & Access" action={<Button icon={UserPlus} primary onClick={() => setModal('employee')}>Add Employee</Button>}><div className="space-y-2">{!(data.employees || []).length && <Empty />}{(data.employees || []).map((employee) => <div key={employee.id} className="flex flex-col gap-3 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="text-[13px] font-bold text-[var(--bf-dev-text)]">{employee.full_name}</div><div className="mt-1 text-[12px] font-medium text-[var(--bf-dev-text)]">{employee.email} · {humanize(employee.role_key)} · {employee.branch || 'No branch'} · {humanize(employee.status)}</div></div><div className="flex flex-wrap gap-2">{employee.status === 'blocked' ? <Button icon={Unlock} onClick={() => act({ action: 'unblock_employee', employeeId: employee.id }, 'Employee access restored.')}>Unblock</Button> : <Button icon={Lock} danger onClick={() => act({ action: 'block_employee', employeeId: employee.id }, 'Employee blocked.')}>Block</Button>}<Button icon={KeyRound} onClick={() => setModal({ type: 'reset', employee })}>Reset Password</Button></div></div>)}</div></Section>}

            {tab === 'documents' && <Section title="Documents & KYC"><Table headers={['Type', 'Document', 'Status', 'Expiry']} rows={(data.documents || []).map((document) => [humanize(document.document_type), document.document_name, humanize(document.status), formatDate(document.expiry_date)])} /></Section>}

            {tab === 'usage' && <Section title="Usage & Limits"><Grid rows={[["Vehicles", `— / ${data.effective?.limits?.vehicles_max ?? 'Unlimited'}`], ["Employees", `${activeEmployees} / ${data.effective?.limits?.users ?? 'Unlimited'}`], ["Branches / Sites", `${(data.sites || []).filter((site) => site.status === 'active').length} / ${data.effective?.limits?.sites ?? 'Unlimited'}`]]} /><p className="mt-3 text-[12px] font-medium text-[var(--bf-dev-text)]">Vehicle usage will be connected to the authoritative transport runtime in its dedicated phase. Employee and site counts shown here are current live tenant counts.</p></Section>}

            {tab === 'fleet' && <FleetAccessPanel data={data} onAction={act} />}

            {tab === 'modules' && <Section title="Modules & Features"><Table headers={['Module', 'Category', 'Effective Access', 'Availability UX']} rows={(data.modules || []).map((module) => [module.module_name, humanize(module.category), humanize(module.effective_access), humanize(module.unavailable_behavior)])} /></Section>}

            {tab === 'overrides' && <Section title="Company Overrides"><Grid rows={[["Override Enabled", data.override?.enabled ? 'Yes' : 'No'], ["Override Plan", data.override?.plan_key || 'Plan default'], ["Vehicle Max", data.override?.limits_override?.vehicles_max ?? 'Default'], ["Users", data.override?.limits_override?.users ?? 'Default'], ["Sites", data.override?.limits_override?.sites ?? 'Default'], ["Module Overrides", (data.override?.entitlements_override || []).join(', ') || 'None']]} /></Section>}

            {tab === 'portal' && <Section title="Portal Configuration"><p className="text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">Controls company dashboard widgets, sidebar visibility, landing screen and company-specific branding. Module visibility is resolved from Plan → Lifecycle Policy → Company Override → Employee Role.</p><div className="mt-4"><Grid rows={[["Landing Path", data.portalConfig?.landing_path || '/dashboard'], ["Dashboard Widgets", Array.isArray(data.portalConfig?.dashboard_widgets) ? data.portalConfig.dashboard_widgets.join(', ') : 'Default'], ["Revision", data.portalConfig?.revision || 1]]} /></div></Section>}

            {tab === 'communications' && <Section title="Communications" action={<Button icon={Bell} primary onClick={() => setModal('announcement')}>Send Announcement</Button>}><Table headers={['Created', 'Title', 'Priority', 'Audience', 'Status']} rows={(data.announcements || []).map((announcement) => [formatDate(announcement.created_at, true), announcement.title, humanize(announcement.priority), humanize(announcement.audience_type), humanize(announcement.status)])} /></Section>}

            {tab === 'security' && <Section title="Security"><Grid rows={[["Company Status", humanize(company.status)], ["Owner User ID", company.account_owner_user_id || 'Not linked'], ["Access Policy", company.status === 'suspended' ? 'Blocked by company suspension' : humanize(subscription.status || 'Standard')], ["Employees", `${activeEmployees} active`]]} /><p className="mt-3 text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">Password hashes and session tokens are never shown. Block/unblock and password reset actions operate through secure server-side admin APIs.</p></Section>}

            {tab === 'activity' && <Section title="Activity Log"><p className="text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">Company 360 actions are already written to the Developer SaaS history layer. The full filtered timeline will be connected in the Control Plane phase without changing this visual foundation.</p></Section>}

            {tab === 'support' && <Section title="Support & Notes" action={<Button icon={Plus} onClick={() => setModal('note')}>Add Note</Button>}><div className="space-y-2">{!(data.notes || []).length && <Empty />}{(data.notes || []).map((note) => <div key={note.id} className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[13px] font-bold text-[var(--bf-dev-text)]">{note.title || humanize(note.note_type)}</div><div className="mt-1 whitespace-pre-wrap text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">{note.body}</div></div>)}</div></Section>}
          </div>

          <div className="hidden print:block print:text-black">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Buddy Fleets — Company 360° Report</h2>
              <div>Generated: {new Date().toLocaleString()}</div>
              <Grid rows={[["Company", company.company_name], ["Code", company.company_code], ["Status", company.status], ["Plan", data.effective?.plan?.name || data.effective?.planKey], ["GSTIN", profile.gstin], ["PAN", profile.pan], ["Owner", profile.owner_name], ["Owner Email", profile.owner_email], ["Owner Mobile", profile.owner_mobile], ["Address", [profile.address_line1, profile.address_line2, profile.city, profile.state, profile.postal_code].filter(Boolean).join(', ')]]} />
              <Grid rows={[["Subscription Status", subscription.status], ["Trial End", subscription.trial_end_at], ["Subscription End", subscription.subscription_end_at], ["Total Invoiced", `₹${Number(summary.totalInvoiced || 0).toLocaleString('en-IN')}`], ["Total Paid", `₹${Number(summary.totalPaid || 0).toLocaleString('en-IN')}`], ["Outstanding", `₹${Number(summary.outstanding || 0).toLocaleString('en-IN')}`]]} />
              <h3 className="font-bold">Employees</h3><Table headers={['Name', 'Email', 'Role', 'Branch', 'Status']} rows={(data.employees || []).map((employee) => [employee.full_name, employee.email, employee.role_key, employee.branch, employee.status])} />
              <h3 className="font-bold">Invoices</h3><Table headers={['Invoice', 'Date', 'Amount', 'Paid', 'Status']} rows={(data.invoices || []).map((invoice) => [invoice.invoice_number, invoice.invoice_date, `₹${invoice.grand_total}`, `₹${invoice.paid_amount}`, invoice.status])} />
              <h3 className="font-bold">Payments</h3><Table headers={['Date', 'Amount', 'Mode', 'Reference', 'Status']} rows={(data.payments || []).map((payment) => [payment.payment_date, `₹${payment.amount}`, payment.payment_mode, payment.transaction_reference, payment.status])} />
              <h3 className="font-bold">Modules</h3><Table headers={['Module', 'Access']} rows={(data.modules || []).map((module) => [module.module_name, module.effective_access])} />
            </div>
          </div>
        </main>
      </div>

      {notice && <Toast tone={notice.tone} message={notice.message} onClose={() => setNotice(null)} />}

      {modal && <ModalShell title={typeof modal === 'object' && modal.type === 'reset' ? 'Reset Employee Password' : modal === 'employee' ? 'Add Employee' : modal === 'payment' ? 'Record Payment' : modal === 'invoice' ? 'Generate Invoice' : modal === 'announcement' ? 'Send Company Announcement' : 'Add Internal Note'} onClose={() => setModal(null)}>
        {modal === 'employee' && <EmployeeForm onSubmit={(payload) => act({ action: 'create_employee', ...payload }, 'Employee created successfully.')} />}
        {typeof modal === 'object' && modal.type === 'reset' && <ResetForm employee={modal.employee} onSubmit={(payload) => act({ action: 'reset_password', employeeId: modal.employee.id, ...payload }, 'Password reset successfully.')} />}
        {modal === 'payment' && <PaymentForm invoices={data.invoices || []} onSubmit={(payload) => act({ action: 'record_payment', ...payload }, 'Payment recorded.')} />}
        {modal === 'invoice' && <InvoiceForm onSubmit={(payload) => act({ action: 'create_invoice', ...payload }, 'Invoice generated.')} />}
        {modal === 'announcement' && <AnnouncementForm onSubmit={(payload) => act({ action: 'send_announcement', ...payload }, 'Announcement published to company employees.')} />}
        {modal === 'note' && <NoteForm onSubmit={(payload) => act({ action: 'add_note', ...payload }, 'Note saved.')} />}
      </ModalShell>}
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <section className={cx(surfaceCard, 'p-4 sm:p-5')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--bf-dev-border)] pb-3">
        <h2 className="text-[17px] font-bold text-[var(--bf-dev-text)]">{title}</h2>
        <div className="print:hidden">{action}</div>
      </div>
      {children}
    </section>
  );
}

function Grid({ rows }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map(([key, value]) => (
        <div key={key} className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-[.06em] text-[var(--bf-dev-text)]">{key}</div>
          <div className="mt-1.5 break-words text-[13px] font-semibold text-[var(--bf-dev-text)]">{value || '—'}</div>
        </div>
      ))}
    </div>
  );
}

function Table({ headers, rows }) {
  if (!rows.length) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead className="bg-[var(--bf-dev-surface-2)]">
          <tr>{headers.map((heading) => <th key={heading} className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[12px] font-bold uppercase tracking-[.05em] text-[var(--bf-dev-text)]">{heading}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-[var(--bf-dev-border)] last:border-0">
              {row.map((value, cellIndex) => <td key={cellIndex} className="px-3 py-3 text-[12px] font-medium text-[var(--bf-dev-text)]">{value || '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Toast({ tone = 'success', message, onClose }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const success = tone === 'success';
  return (
    <div className="fixed bottom-5 right-5 z-[250] w-[min(390px,calc(100vw-40px))] rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.28)] print:hidden">
      <div className="flex items-start gap-3">
        {success ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-500" />}
        <div className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-[var(--bf-dev-text)]">{message}</div>
        <button type="button" onClick={onClose} aria-label="Close notification" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-[var(--bf-dev-text)] hover:bg-[var(--bf-dev-surface-2)]"><X size={14} /></button>
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 print:hidden">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[7px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--bf-dev-border)] pb-3">
          <h3 className="text-[17px] font-bold text-[var(--bf-dev-text)]">{title}</h3>
          <Button onClick={onClose}>Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ title, ...props }) {
  return <label className={label}>{title}<input {...props} className={input} /></label>;
}

function Select({ title, children, value, onChange, ...props }) {
  const options = React.Children.toArray(children).map((child) => ({
    value: child.props.value ?? '',
    label: child.props.children,
  }));
  return (
    <label className={label}>
      {title}
      <SelectMenu
        {...props}
        value={value}
        ariaLabel={title}
        options={options}
        onChange={(nextValue) => onChange?.({ target: { value: nextValue } })}
      />
    </label>
  );
}

function Submit({ text = 'Save' }) {
  return <div className="mt-4 flex justify-end"><button className="inline-flex min-h-10 items-center gap-2 rounded-[4px] bg-[var(--bf-dev-primary)] px-4 text-[12px] font-bold text-white"><Save size={14} />{text}</button></div>;
}

function EmployeeForm({ onSubmit }) {
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', employeeCode: '', designation: '', branch: '', roleKey: 'viewer', password: '', forcePasswordChange: true });
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><div className="grid gap-3 sm:grid-cols-2"><Field title="Full Name *" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /><Field title="Email *" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Field title="Mobile" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /><Field title="Employee ID" value={form.employeeCode} onChange={(event) => setForm({ ...form, employeeCode: event.target.value })} /><Field title="Designation" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} /><Field title="Branch" value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} /><Select title="Role" value={form.roleKey} onChange={(event) => setForm({ ...form, roleKey: event.target.value })}><option value="owner">Company Owner</option><option value="admin">Company Admin</option><option value="fleet_manager">Fleet Manager</option><option value="dispatcher">Dispatcher</option><option value="accountant">Accountant</option><option value="operations_manager">Operations Manager</option><option value="driver_manager">Driver Manager</option><option value="viewer">Viewer</option></Select><Field title="Password *" type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div><label className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[var(--bf-dev-text)]"><input type="checkbox" checked={form.forcePasswordChange} onChange={(event) => setForm({ ...form, forcePasswordChange: event.target.checked })} />Force password change on first login</label><Submit text="Create Employee" /></form>;
}

function ResetForm({ employee, onSubmit }) {
  const [password, setPassword] = useState('');
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit({ password, forcePasswordChange: true }); }}><p className="mb-3 text-[12px] font-medium text-[var(--bf-dev-text)]">Reset password for {employee.full_name}. Current password is never displayed.</p><Field title="New Password *" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /><Submit text="Reset Password" /></form>;
}

function PaymentForm({ invoices, onSubmit }) {
  const [form, setForm] = useState({ invoiceId: '', amount: '', paymentDate: new Date().toISOString().slice(0, 10), paymentMode: 'bank_transfer', transactionReference: '', proofUrl: '', status: 'submitted', remarks: '' });
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><div className="grid gap-3 sm:grid-cols-2"><Select title="Invoice" value={form.invoiceId} onChange={(event) => setForm({ ...form, invoiceId: event.target.value })}><option value="">Unallocated / Advance</option>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · ₹{invoice.grand_total}</option>)}</Select><Field title="Amount *" type="number" min="0" step="0.01" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /><Field title="Payment Date *" type="date" required value={form.paymentDate} onChange={(event) => setForm({ ...form, paymentDate: event.target.value })} /><Select title="Mode" value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value })}><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer / NEFT / RTGS / IMPS</option><option value="card">Card</option><option value="payment_gateway">Payment Gateway</option><option value="cheque">Cheque</option><option value="cash">Cash</option><option value="other">Other</option></Select><Field title="Transaction / UTR" value={form.transactionReference} onChange={(event) => setForm({ ...form, transactionReference: event.target.value })} /><Field title="Payment Proof URL" value={form.proofUrl} onChange={(event) => setForm({ ...form, proofUrl: event.target.value })} /></div><Submit text="Record Payment" /></form>;
}

function InvoiceForm({ onSubmit }) {
  const [form, setForm] = useState({ invoiceType: 'subscription', invoiceDate: new Date().toISOString().slice(0, 10), dueDate: '', placeOfSupply: 'Gujarat', interstate: false, items: [{ description: 'Buddy Fleets Subscription', quantity: 1, rate: '', discount: 0, taxRate: 18, hsnSac: '' }] });
  const item = form.items[0];
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><div className="grid gap-3 sm:grid-cols-2"><Select title="Invoice Type" value={form.invoiceType} onChange={(event) => setForm({ ...form, invoiceType: event.target.value })}><option value="subscription">Subscription</option><option value="renewal">Renewal</option><option value="upgrade">Upgrade / Downgrade</option><option value="addon">Add-on</option><option value="custom">Custom</option><option value="proforma">Proforma</option></Select><Field title="Invoice Date" type="date" value={form.invoiceDate} onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })} /><Field title="Due Date" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /><Field title="Place of Supply" value={form.placeOfSupply} onChange={(event) => setForm({ ...form, placeOfSupply: event.target.value })} /><Field title="Description" value={item.description} onChange={(event) => setForm({ ...form, items: [{ ...item, description: event.target.value }] })} /><Field title="Rate" type="number" min="0" step="0.01" required value={item.rate} onChange={(event) => setForm({ ...form, items: [{ ...item, rate: event.target.value }] })} /><Field title="Discount" type="number" min="0" step="0.01" value={item.discount} onChange={(event) => setForm({ ...form, items: [{ ...item, discount: event.target.value }] })} /><Field title="Tax %" type="number" min="0" max="100" value={item.taxRate} onChange={(event) => setForm({ ...form, items: [{ ...item, taxRate: event.target.value }] })} /></div><label className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[var(--bf-dev-text)]"><input type="checkbox" checked={form.interstate} onChange={(event) => setForm({ ...form, interstate: event.target.checked })} />Inter-state supply (IGST)</label><Submit text="Generate Invoice" /></form>;
}

function AnnouncementForm({ onSubmit }) {
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal', requireAcknowledgement: true, allowDismiss: true });
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><Field title="Title *" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><label className={`${label} mt-3`}>Message *<textarea required rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className={`${input} h-auto py-2`} /></label><div className="mt-3 grid gap-3 sm:grid-cols-2"><Select title="Priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="normal">Normal</option><option value="important">Important</option><option value="critical">Critical</option></Select><label className="flex items-end gap-2 pb-2 text-[12px] font-medium text-[var(--bf-dev-text)]"><input type="checkbox" checked={form.requireAcknowledgement} onChange={(event) => setForm({ ...form, requireAcknowledgement: event.target.checked })} />Require acknowledgement</label></div><Submit text="Send to All Active Employees" /></form>;
}

function NoteForm({ onSubmit }) {
  const [form, setForm] = useState({ title: '', body: '', noteType: 'internal' });
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><Field title="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><label className={`${label} mt-3`}>Note *<textarea required rows={6} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className={`${input} h-auto py-2`} /></label><Submit text="Save Note" /></form>;
}
