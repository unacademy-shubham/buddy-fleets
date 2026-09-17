import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeveloperOverview } from '../../services/developerApi';
import {
  Activity,
  AlertTriangle,
  AppWindow,
  BadgeCheck,
  Bell,
  Blocks,
  Bot,
  Boxes,
  Building2,
  Cable,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Cloud,
  Code2,
  Database,
  FileClock,
  FileText,
  Gauge,
  Globe2,
  HardDrive,
  KeyRound,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  MessageSquare,
  MonitorCog,
  Network,
  PanelsTopLeft,
  PencilRuler,
  Plus,
  RefreshCcw,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TerminalSquare,
  UserCog,
  Users,
  Workflow,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

/* ============================================================
   BUDDY FLEETS
   DEVELOPER / SUPER ADMIN CPANEL

   File:
   src/pages/Dashboard/DeveloperDashboard.jsx

   Scope:
   - Website Studio / CMS control surface
   - SaaS / company / entitlement management
   - Team portal roles & permissions
   - Module registry + future Developer Studio
   - Integrations / feature flags / system controls
   - Security / sessions / audit / observability

   IMPORTANT:
   - DeveloperLayout owns the application shell and navigation.
   - UI actions that require database mutation are represented as
     controlled interactive states until their server APIs/tables
     are wired in later phases.
   - Authentication authority remains the existing secure server
     session architecture. This component never handles Supabase
     access/refresh tokens.
============================================================ */

const OVERVIEW_ROUTES = {
  'website-studio': '/website/website-studio',
  companies: '/saas-platform/companies',
  modules: '/saas-platform/module-registry',
  'module-builder': '/developer-studio/module-builder',
  security: '/security-system/security-center',
};

const COMPANIES = [
  {
    id: 'cmp_001',
    name: 'Apex Logistics Pvt Ltd',
    slug: 'apex-logistics',
    plan: 'Enterprise',
    status: 'active',
    users: 38,
    vehicles: 126,
    modules: 14,
    renewal: '28 Oct 2026',
  },
  {
    id: 'cmp_002',
    name: 'Shree Balaji Roadways',
    slug: 'shree-balaji-roadways',
    plan: 'Growth',
    status: 'trial',
    users: 12,
    vehicles: 44,
    modules: 10,
    renewal: '19 Sep 2026',
  },
  {
    id: 'cmp_003',
    name: 'Northstar Freight Co.',
    slug: 'northstar-freight',
    plan: 'Growth',
    status: 'active',
    users: 19,
    vehicles: 73,
    modules: 11,
    renewal: '05 Nov 2026',
  },
  {
    id: 'cmp_004',
    name: 'Demo Company',
    slug: 'demo-company',
    plan: 'Demo',
    status: 'demo',
    users: 8,
    vehicles: 25,
    modules: 18,
    renewal: 'Resettable',
  },
  {
    id: 'cmp_005',
    name: 'Metro Cargo Movers',
    slug: 'metro-cargo',
    plan: 'Starter',
    status: 'suspended',
    users: 7,
    vehicles: 18,
    modules: 7,
    renewal: 'Payment due',
  },
];

const MODULES = [
  { id: 'dashboard', name: 'Dashboard & Reports', status: 'production', companies: 5, features: 8 },
  { id: 'vehicles', name: 'Vehicle Management', status: 'production', companies: 5, features: 14 },
  { id: 'drivers', name: 'Driver Management', status: 'production', companies: 5, features: 10 },
  { id: 'trips', name: 'Duty & Dispatch', status: 'production', companies: 4, features: 16 },
  { id: 'lr', name: 'LR / Bilty / Consignment', status: 'production', companies: 4, features: 15 },
  { id: 'epod', name: 'ePOD', status: 'beta', companies: 3, features: 8 },
  { id: 'expenses', name: 'Expense & Earning', status: 'production', companies: 5, features: 12 },
  { id: 'toll', name: 'Automated Toll Tracking', status: 'beta', companies: 2, features: 7 },
  { id: 'unit-economics', name: 'Unit Economics', status: 'production', companies: 3, features: 9 },
  { id: 'maintenance', name: 'Maintenance & Alerts', status: 'production', companies: 4, features: 11 },
  { id: 'documents', name: 'Document Compliance', status: 'production', companies: 5, features: 13 },
  { id: 'tracking', name: 'Vehicle Tracking', status: 'planned', companies: 0, features: 6 },
];

const TEAM = [
  { name: 'Platform Owner', email: 'owner@buddyfleets.in', role: 'SUPER_ADMIN', portal: 'Developer', status: 'active' },
  { name: 'Sales Admin', email: 'sales@buddyfleets.in', role: 'SALES_ADMIN', portal: 'Team', status: 'active' },
  { name: 'Support Admin', email: 'support@buddyfleets.in', role: 'SUPPORT_ADMIN', portal: 'Team', status: 'active' },
  { name: 'Finance Admin', email: 'finance@buddyfleets.in', role: 'FINANCE_ADMIN', portal: 'Team', status: 'invited' },
];

const AUDIT = [
  { time: '02:03 AM', actor: 'SUPER_ADMIN', action: 'MFA gateway deployed', target: 'secure-mfa', severity: 'success' },
  { time: '01:42 AM', actor: 'SUPER_ADMIN', action: 'Auth callback architecture updated', target: 'developer portal', severity: 'success' },
  { time: '01:31 AM', actor: 'System', action: 'Portal session revalidated', target: 'developer.buddyfleets.in', severity: 'info' },
  { time: '12:56 AM', actor: 'SUPER_ADMIN', action: 'Repository sync completed', target: 'main branch', severity: 'info' },
  { time: 'Yesterday', actor: 'System', action: 'Login attempt blocked', target: 'invalid portal context', severity: 'warning' },
];

const INTEGRATIONS = [
  { name: 'Supabase', category: 'Database & Auth', status: 'connected', icon: Database },
  { name: 'Vercel', category: 'Hosting & API', status: 'connected', icon: Cloud },
  { name: 'Resend', category: 'Transactional Email', status: 'configured', icon: MessageSquare },
  { name: 'WhatsApp', category: 'Customer Communication', status: 'planned', icon: MessageSquare },
  { name: 'GPS Provider', category: 'Vehicle Tracking', status: 'planned', icon: Network },
  { name: 'Accounting API', category: 'Finance', status: 'planned', icon: Cable },
];

const FEATURE_FLAGS = [
  { id: 'new-company-shell', name: 'New Company Workspace Shell', scope: 'Demo + Internal', enabled: true },
  { id: 'epod-v2', name: 'ePOD V2 Workflow', scope: 'Selected companies', enabled: true },
  { id: 'toll-beta', name: 'Automated Toll Beta', scope: 'Beta companies', enabled: false },
  { id: 'module-builder-beta', name: 'Developer Studio Module Builder', scope: 'Super Admin', enabled: false },
];

const WEBSITE_PAGES = [
  { name: 'Home', path: '/', status: 'published', updated: '11 Sep 2026' },
  { name: 'Features', path: '/features', status: 'published', updated: '11 Sep 2026' },
  { name: 'Pricing', path: '/pricing', status: 'published', updated: '10 Sep 2026' },
  { name: 'About Us', path: '/about', status: 'published', updated: '09 Sep 2026' },
  { name: 'Contact Us', path: '/contact-us', status: 'published', updated: '12 Sep 2026' },
  { name: 'Login', path: '/login', status: 'system', updated: '15 Sep 2026' },
];

const SYSTEM_HEALTH = [
  { label: 'Main Website', value: 'Operational', status: 'good', note: 'buddyfleets.in' },
  { label: 'Developer Portal', value: 'Operational', status: 'good', note: 'developer.buddyfleets.in' },
  { label: 'Team Portal', value: 'Ready', status: 'good', note: 'team.buddyfleets.in' },
  { label: 'Company Portal', value: 'Ready', status: 'good', note: 'portal.buddyfleets.in' },
  { label: 'Secure Login', value: 'Operational', status: 'good', note: 'Edge Function' },
  { label: 'Secure MFA', value: 'Deployed', status: 'good', note: 'TOTP / AAL2' },
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function StatusBadge({ status }) {
  const config = {
    active: 'border-emerald-400/20 bg-emerald-400/10 text-[var(--bf-dev-text)]',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-[var(--bf-dev-text)]',
    connected: 'border-emerald-400/20 bg-emerald-400/10 text-[var(--bf-dev-text)]',
    configured: 'border-[var(--bf-dev-border)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    production: 'border-emerald-400/20 bg-emerald-400/10 text-[var(--bf-dev-text)]',
    published: 'border-emerald-400/20 bg-emerald-400/10 text-[var(--bf-dev-text)]',
    trial: 'border-amber-400/20 bg-amber-400/10 text-[var(--bf-dev-text)]',
    beta: 'border-[var(--bf-dev-border)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    demo: 'border-[var(--bf-dev-border)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    invited: 'border-[var(--bf-dev-border)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    planned: 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]',
    system: 'border-[var(--bf-dev-border)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    suspended: 'border-rose-400/20 bg-rose-400/10 text-[var(--bf-dev-text)]',
    warning: 'border-amber-400/20 bg-amber-400/10 text-[var(--bf-dev-text)]',
    info: 'border-[var(--bf-dev-border)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
  };

  return (
    <span className={cx(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
      config[status] || 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]'
    )}>
      {status}
    </span>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={cx(
      'rounded-[var(--bf-dev-card-radius)] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text)] shadow-[var(--bf-dev-shadow)]',
      className
    )}>
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bf-dev-primary)]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--bf-dev-text)] sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--bf-dev-text-2)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon }) {
  return (
    <Card className="min-h-[118px] px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,.04)]">
      <div className="flex h-full items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] bg-[var(--bf-dev-primary)] text-white">
          <Icon size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-[var(--bf-dev-text)]">{label}</div>
          <div className="mt-0.5 text-[24px] font-semibold leading-none tracking-[-0.02em] text-[var(--bf-dev-text)]">{value}</div>
          <div className="mt-2 text-[10px] text-[var(--bf-dev-text-3)]">{note}</div>
        </div>
      </div>
    </Card>
  );
}

function ActionButton({ children, icon: Icon, onClick, variant = 'primary', disabled = false }) {
  const variants = {
    primary: 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white hover:bg-[var(--bf-dev-primary-strong)] hover:border-[var(--bf-dev-primary-strong)]',
    neutral: 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text)] hover:bg-[rgb(var(--bf-dev-primary-rgb)/.08)] hover:text-[var(--bf-dev-text)]',
    danger: 'border-rose-400/20 bg-rose-400/10 text-[var(--bf-dev-text)] hover:bg-rose-400/15',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-[var(--bf-dev-text)] hover:bg-emerald-400/15',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-[var(--bf-dev-radius)] border px-4 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-dev-primary)] disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant]
      )}
    >
      {Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 font-black text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{text}</p>
    </Card>
  );
}

function Page({
  children,
  busy,
}) {
  return (
    <>
      <style>
        {`
          .bf-dev-workspace {
            min-height: calc(100dvh - var(--bf-header-height, 66px));
            background: var(--bf-dev-page-bg);
            color: var(--bf-dev-text);
            overflow-x: hidden;
          }

          .bf-dev-workspace > * + * {
            margin-top: 24px;
          }

          .bf-dev-workspace > :not(.bf-dev-page-band) {
            margin-left: 24px;
            margin-right: 24px;
          }

          .bf-dev-workspace > .bf-dev-page-band + * {
            position: relative;
            z-index: 2;
            margin-top: -22px;
          }

          .bf-dev-workspace > :last-child {
            margin-bottom: 24px;
          }

          @media (max-width: 767px) {
            .bf-dev-workspace > :not(.bf-dev-page-band) {
              margin-left: 14px;
              margin-right: 14px;
            }

            .bf-dev-workspace > .bf-dev-page-band + * {
              margin-top: -14px;
            }

            .bf-dev-workspace > * + * {
              margin-top: 16px;
            }
          }
        `}
      </style>

      <div
        className="bf-dev-workspace"
        aria-busy={busy}
      >
        {children}
      </div>
    </>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}) {
  return (
    <section
      className="bf-dev-page-band relative min-h-[104px] overflow-hidden bg-[var(--bf-dev-primary)] px-6 pb-8 pt-6 text-white sm:px-7 lg:px-8"
    >
      <div
        className="relative z-[1] flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div
          className="min-w-0"
        >
          <h1
            className="text-[25px] font-semibold tracking-[-0.02em] text-white sm:text-[27px]"
          >
            {title}
          </h1>

          {description && (
            <p
              className="mt-1.5 max-w-3xl text-[10px] leading-5 text-white/72"
            >
              {description}
            </p>
          )}
        </div>

        <div
          className="flex shrink-0 flex-col items-start gap-2 lg:items-end"
        >
          <div
            className="text-[10px] font-medium text-white/80"
          >
            Developer
            <span className="mx-2 text-white/35">
              /
            </span>
            <span className="text-white">
              {eyebrow || title}
            </span>
          </div>

          {actions && (
            <div
              className="flex flex-wrap items-center gap-2"
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Button({
  children,
  icon: Icon,
  variant = 'default',
  onClick,
  disabled = false,
}) {
  const styles = {
    default:
      'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]',
    header:
      'border-[#111827] bg-[#111827] text-white hover:border-[#1F2937] hover:bg-[#1F2937] hover:text-white',
    pageBand:
      'border-white/30 bg-white/12 text-white hover:border-white/45 hover:bg-white/20 hover:text-white',
    primary:
      'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white hover:bg-[var(--bf-dev-primary-strong)]',
    success:
      'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600',
    danger:
      'border-rose-500/25 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        `
          inline-flex
          min-h-[32px]
          items-center
          justify-center
          gap-1.5
          rounded-[4px]
          border
          px-3
          py-1.5
          text-[10px]
          font-semibold
          transition
          duration-150
          disabled:cursor-not-allowed
          disabled:opacity-40
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.35)]
        `,
        styles[variant]
      )}
    >
      {Icon && (
        <Icon size={13} />
      )}

      {children}
    </button>
  );
}

function Status({
  status,
}) {
  const styles = {
    active:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    success:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    production:
      'border-[rgb(var(--bf-dev-primary-rgb)/.20)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    trial:
      'border-amber-500/20 bg-amber-500/10 text-amber-500',
    beta:
      'border-violet-500/20 bg-violet-500/10 text-violet-500',
    planned:
      'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]',
    published:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    info:
      'border-[rgb(var(--bf-dev-primary-rgb)/.20)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    warning:
      'border-amber-500/20 bg-amber-500/10 text-amber-500',
  };

  return (
    <span
      className={cx(
        `
          inline-flex
          items-center
          rounded-full
          border
          px-2
          py-1
          text-[8px]
          font-bold
          uppercase
          tracking-[0.08em]
        `,
        styles[status] ||
          'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]'
      )}
    >
      {status}
    </span>
  );
}

function CardHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div
      className="flex min-h-[55px] items-center justify-between gap-3 border-b border-[var(--bf-dev-border)] px-5 py-3"
    >
      <div>
        <div
          className="text-[15px] font-medium text-[var(--bf-dev-text)]"
        >
          {title}
        </div>

        {subtitle && (
          <div
            className="mt-0.5 text-[9px] text-[var(--bf-dev-text-3)]"
          >
            {subtitle}
          </div>
        )}
      </div>

      {action}
    </div>
  );
}


function OverviewSection({ onNavigate }) {
  const [snapshot, setSnapshot] = useState({ loading: true, data: null, error: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        const result = await getDeveloperOverview();
        if (cancelled) return;
        if (!result.ok) {
          const denied = [401, 403, 423].includes(result.status);
          setSnapshot({ loading: false, data: null, error: denied
            ? 'Overview access is unavailable. Please sign in again.'
            : 'Unable to load the overview. Use Refresh snapshot to try again.' });
          return;
        }
        setSnapshot({ loading: false, data: result, error: '' });
      } catch {
        if (!cancelled) {
          setSnapshot({ loading: false, data: null, error: 'Unable to load the overview. Use Refresh snapshot to try again.' });
        }
      }
    }

    void loadOverview();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const { loading, data, error } = snapshot;
  const count = (value) => Number.isSafeInteger(value) && value >= 0 ? value.toLocaleString() : 'Unavailable';
  const metric = (value) => loading ? '…' : count(value);
  const companies = data?.metrics?.companies;
  const security = data?.metrics?.security;
  const securityStatus = loading ? '…' : security?.status === 'healthy' ? 'Healthy' : security?.status === 'attention' ? 'Attention' : 'Unavailable';
  const text = (value, fallback) => typeof value === 'string' && value.trim() ? value : fallback;
  const auditLogs = data?.recent?.auditLogs;
  const securityEvents = data?.recent?.securityEvents;
  const activityAvailable = Array.isArray(auditLogs) || Array.isArray(securityEvents);
  const activity = [
    ...(Array.isArray(auditLogs) ? auditLogs.filter((row) => row && typeof row === 'object').map((row, index) => ({
      key: `audit-${text(row.id, String(index))}`,
      action: text(row.action, 'Action unavailable'),
      actor: text(row.actor_user_id, 'Actor unavailable'),
      target: text(row.entity_type, 'Target unavailable'),
      createdAt: row.created_at,
    })) : []),
    ...(Array.isArray(securityEvents) ? securityEvents.filter((row) => row && typeof row === 'object').map((row, index) => ({
      key: `security-${text(row.id, String(index))}`,
      action: text(row.event_type, 'Event unavailable'),
      actor: text(row.user_id, 'Actor unavailable'),
      target: text(row.portal_type, 'Portal unavailable'),
      createdAt: row.created_at,
    })) : []),
  ].map((row) => {
    const timestamp = typeof row.createdAt === 'string' ? Date.parse(row.createdAt) : NaN;
    return { ...row, timestamp: Number.isFinite(timestamp) ? timestamp : 0,
      time: Number.isFinite(timestamp) ? new Date(timestamp).toLocaleString() : 'Time unavailable' };
  }).sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);

  const refresh = () => {
    setSnapshot({ loading: true, data: null, error: '' });
    setRefreshKey((value) => value + 1);
  };

  return (
    <Page busy={loading}>
      <PageHeader
        eyebrow="Developer Control Center"
        title="Developer Dashboard"
        description="Platform companies, access, modules, security and operational health."
        actions={<Button icon={RefreshCcw} variant="header" onClick={refresh} disabled={loading}>Refresh snapshot</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Companies" value={metric(companies?.total)} note={loading ? 'Loading company counts…' : `${count(companies?.active)} active • ${count(companies?.trialActive)} trial • Suspended count unavailable`} icon={Building2} />
        <MetricCard label="Platform users" value={metric(data?.metrics?.users?.total)} note="Across customer + internal portals" icon={Users} />
        <MetricCard label="Production modules" value="Unavailable" note="Module counts are not available yet" icon={Boxes} />
        <MetricCard label="Security status" value={securityStatus} note={loading ? 'Loading security summary…' : `${count(security?.lockedAccounts)} locked accounts • Based on account locks`} icon={ShieldCheck} />
      </div>

      {loading || error ? <p role={error ? 'alert' : 'status'} className="text-xs text-[var(--bf-dev-text-2)]">{error || 'Loading overview…'}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
        <Card className="shadow-[0_1px_2px_rgba(0,0,0,.04)]">
          <CardHeader title="Platform surfaces" subtitle="Current product and portal surfaces" action={<Status status="active" />} />

          <div className="grid gap-3 p-4 md:grid-cols-2">
            {[
              ['Public Website', 'buddyfleets.in', Globe2, 'Published marketing + auth entry'],
              ['Developer CPanel', 'developer.buddyfleets.in', TerminalSquare, 'Super Admin control plane'],
              ['Team Portal', 'team.buddyfleets.in', Users, 'Role-based internal workspace'],
              ['Company Portal', 'portal.buddyfleets.in/{slug}', Building2, 'Tenant-isolated customer workspace'],
            ].map(([title, url, Icon, note]) => (
              <div key={title} className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--bf-dev-radius)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--bf-dev-text)]">{title}</p>
                    <p className="truncate text-[11px] text-[var(--bf-dev-primary)]">{url}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--bf-dev-text-2)]">{note}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="shadow-[0_1px_2px_rgba(0,0,0,.04)]">
          <CardHeader title="Quick actions" subtitle="Jump to a management area" action={<Zap size={16} className="text-[var(--bf-dev-primary)]" />} />

          <div className="space-y-2 p-4">
            {[
              ['Website Studio', 'website-studio', PanelsTopLeft],
              ['Create / manage company', 'companies', Building2],
              ['Modules & entitlements', 'modules', Boxes],
              ['Developer Studio', 'module-builder', Blocks],
              ['Security Center', 'security', ShieldCheck],
            ].map(([label, target, Icon]) => (
              <button
                key={target}
                type="button"
                onClick={() => onNavigate(target)}
                className="flex w-full items-center justify-between rounded-[var(--bf-dev-radius)] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2.5 text-left text-[11px] font-medium text-[var(--bf-dev-text)] transition hover:border-[var(--bf-dev-primary)] hover:bg-[rgb(var(--bf-dev-primary-rgb)/.08)] hover:text-[var(--bf-dev-text)]"
              >
                <span className="flex items-center gap-3"><Icon size={15} className="text-[var(--bf-dev-primary)]" />{label}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="shadow-[0_1px_2px_rgba(0,0,0,.04)]">
          <CardHeader title="Recent platform activity" subtitle="Security and deployment events from the current build cycle." action={<FileClock size={16} className="text-[var(--bf-dev-text-3)]" />} />
          <div className="divide-y divide-[var(--bf-dev-border)]">
            {!activity.length ? <p className="px-4 py-3.5 text-xs text-[var(--bf-dev-text-2)]">{loading ? 'Loading activity…' : error || !activityAvailable ? 'Activity unavailable.' : 'No recent activity.'}</p> : null}
            {activity.map((row) => (
              <div key={row.key} className="grid gap-3 px-4 py-4 text-[10px] sm:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="text-[var(--bf-dev-text-3)]">{row.time}</div>
                <div className="break-words font-semibold text-[var(--bf-dev-text-2)]">{row.actor}</div>
                <div className="min-w-0 break-words">
                  <div className="font-semibold text-[var(--bf-dev-text)]">{row.action}</div>
                  <div className="mt-1 text-[var(--bf-dev-text-3)]">{row.target}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="shadow-[0_1px_2px_rgba(0,0,0,.04)]">
          <CardHeader title="Architecture foundation" subtitle="Locked project requirements carried into the CPanel." action={<LockKeyhole size={16} className="text-[var(--bf-dev-primary)]" />} />
          <div className="grid gap-2 p-4 sm:grid-cols-2">
            {[
              'Central secure authentication',
              'Database-level tenant isolation',
              'Role + action permissions',
              'Module registry foundation',
              'Draft / preview / publish / rollback',
              'Feature flags & entitlements',
              'Audit + observability',
              'No arbitrary raw code execution',
              'Secure support impersonation design',
              'Environment / migration readiness',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-[var(--bf-dev-radius)] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3 text-xs leading-5 text-[var(--bf-dev-text-2)]">
                <Check size={14} className="mt-0.5 shrink-0 text-[var(--bf-dev-text)]" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}

function LiveActivitySection() {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Observability"
        title="Live platform activity"
        description="Operational events, security signals, deployments and important platform actions in one timeline."
      />
      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black text-white">Activity stream</p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Live
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {AUDIT.map((row) => (
            <div key={`${row.time}-${row.action}`} className="grid gap-3 px-5 py-4 sm:grid-cols-[90px_130px_1fr_160px] sm:px-6">
              <span className="text-xs text-slate-500">{row.time}</span>
              <span className="text-xs font-bold text-slate-300">{row.actor}</span>
              <div>
                <p className="text-xs font-bold text-white">{row.action}</p>
                <p className="mt-1 text-[11px] text-slate-500">{row.target}</p>
              </div>
              <div className="sm:text-right"><StatusBadge status={row.severity} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WebsiteStudioSection() {
  const [draftMode, setDraftMode] = useState(true);
  const [selectedPage, setSelectedPage] = useState('Home');

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Website Studio"
        title="Public website control"
        description="Manage the Buddy Fleets marketing website through a controlled Draft → Preview → Publish workflow without exposing arbitrary code execution."
        action={
          <div className="flex gap-2">
            <ActionButton icon={MonitorCog} variant="neutral">Preview</ActionButton>
            <ActionButton icon={Rocket} variant="success">Publish changes</ActionButton>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Pages</p>
            <ActionButton icon={Plus} variant="neutral">Page</ActionButton>
          </div>
          <div className="mt-3 space-y-2">
            {WEBSITE_PAGES.map((page) => (
              <button
                key={page.path}
                type="button"
                onClick={() => setSelectedPage(page.name)}
                className={cx(
                  'w-full rounded-xl border px-3 py-3 text-left transition',
                  selectedPage === page.name
                    ? 'border-cyan-400/20 bg-cyan-400/[0.08]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{page.name}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{page.path}</p>
                  </div>
                  <StatusBadge status={page.status} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-cyan-300">Editing: {selectedPage}</p>
                <h3 className="mt-1 text-xl font-black text-white">Visual content workspace</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">The full visual builder will be metadata-driven. Core pages remain code-backed until builder blocks are progressively introduced.</p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-300">
                <input type="checkbox" checked={draftMode} onChange={(event) => setDraftMode(event.target.checked)} className="accent-cyan-400" />
                Draft mode
              </label>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {[
                ['Hero', 'Headline, subtext, CTAs, media', AppWindow],
                ['Feature Blocks', 'Cards, feature groups, visual modules', Blocks],
                ['Trust / Proof', 'Stats, testimonials, badges', BadgeCheck],
                ['Pricing', 'Plans, durations, offers', Gauge],
                ['CTA Sections', 'Conversion blocks and forms', Rocket],
                ['Footer / Legal', 'Navigation, policies, business info', FileText],
              ].map(([title, note, Icon]) => (
                <button key={title} type="button" className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.04]">
                  <Icon size={18} className="text-cyan-300" />
                  <p className="mt-3 text-sm font-black text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">Release control</p>
                <p className="mt-1 text-xs text-slate-500">Safe publishing prevents accidental live-site damage.</p>
              </div>
              <Workflow size={19} className="text-violet-300" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {['Draft', 'Preview', 'Publish', 'Rollback'].map((step, index) => (
                <div key={step} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10 text-xs font-black text-cyan-300">{index + 1}</div>
                  <p className="mt-3 text-xs font-black text-white">{step}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">{index === 0 ? 'Prepare changes safely.' : index === 1 ? 'Review before release.' : index === 2 ? 'Push approved version live.' : 'Restore last stable version.'}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContentSeoSection() {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Content & SEO"
        title="Search, metadata & public content"
        description="Control page metadata, indexing, structured content and public-site publishing quality from the Super Admin CPanel."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          ['SEO metadata', 'Titles, descriptions, canonical routes and OpenGraph settings.', Search],
          ['Indexing controls', 'robots.txt, sitemap.xml, noindex rules and route health.', Globe2],
          ['Agent / AI discoverability', 'llms.txt and structured content surfaces for machine discovery.', Bot],
        ].map(([title, text, Icon]) => (
          <Card key={title} className="p-5">
            <Icon size={20} className="text-cyan-300" />
            <h3 className="mt-4 text-sm font-black text-white">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
            <ActionButton variant="neutral" icon={SlidersHorizontal}>Configure</ActionButton>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.07] p-5"><p className="text-sm font-black text-white">Page SEO status</p></div>
        <div className="divide-y divide-white/[0.06]">
          {WEBSITE_PAGES.slice(0, 5).map((page) => (
            <div key={page.path} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_140px_140px_120px] sm:items-center">
              <div><p className="text-xs font-bold text-white">{page.name}</p><p className="mt-1 text-[11px] text-slate-500">{page.path}</p></div>
              <span className="text-xs text-emerald-300">Meta ready</span>
              <span className="text-xs text-emerald-300">Indexable</span>
              <ActionButton variant="neutral" icon={PencilRuler}>Edit</ActionButton>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function EnquiriesSection() {
  const enquiries = [
    ['Fleet Demo Request', 'Apex Transport', 'Product Demo', 'New'],
    ['Pricing enquiry', 'Raj Roadlines', 'Pricing', 'Open'],
    ['Enterprise onboarding', 'Western Cargo', 'Enterprise', 'Follow-up'],
  ];

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Website Enquiries" title="Inbound lead inbox" description="Website contact submissions, demo interest and public enquiries routed into a future role-aware team workflow." action={<ActionButton icon={Plus}>New enquiry</ActionButton>} />
      <Card className="overflow-hidden">
        <div className="divide-y divide-white/[0.06]">
          {enquiries.map(([subject, company, type, status]) => (
            <div key={subject} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_180px_130px_110px] sm:items-center">
              <div><p className="text-xs font-bold text-white">{subject}</p><p className="mt-1 text-[11px] text-slate-500">{company}</p></div>
              <span className="text-xs text-slate-400">{type}</span>
              <StatusBadge status={status === 'New' ? 'trial' : status === 'Open' ? 'active' : 'beta'} />
              <ActionButton variant="neutral">Open</ActionButton>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CompaniesSection() {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMPANIES;
    return COMPANIES.filter((company) => `${company.name} ${company.slug} ${company.plan} ${company.status}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="SaaS Platform"
        title="Company management"
        description="Create, activate, suspend and inspect customer tenants. Company authorization remains server-side through immutable company IDs; slug is only routing identity."
        action={<ActionButton icon={Plus} onClick={() => setShowCreate(true)}>Create company</ActionButton>}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, slug, plan..." className="w-full rounded-xl border border-white/10 bg-black/10 py-2.5 pl-10 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30" />
          </div>
          <p className="text-xs text-slate-500">{filtered.length} companies</p>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((company) => (
          <Card key={company.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-cyan-300"><Building2 size={20} /></div>
                <div>
                  <p className="text-sm font-black text-white">{company.name}</p>
                  <p className="mt-1 text-[11px] text-cyan-300">portal.buddyfleets.in/{company.slug}</p>
                </div>
              </div>
              <StatusBadge status={company.status} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Plan', company.plan],
                ['Users', company.users],
                ['Vehicles', company.vehicles],
                ['Modules', company.modules],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">{label}</p>
                  <p className="mt-1 text-xs font-black text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
              <p className="text-[11px] text-slate-500">Renewal: {company.renewal}</p>
              <div className="flex gap-2">
                <ActionButton variant="neutral" icon={UserCog}>Manage</ActionButton>
                {company.status !== 'suspended' ? <ActionButton variant="danger" icon={LockKeyhole}>Suspend</ActionButton> : <ActionButton variant="success" icon={RefreshCcw}>Restore</ActionButton>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showCreate ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">New tenant</p><h3 className="mt-2 text-xl font-black text-white">Create company</h3></div>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="mt-5 space-y-3">
              {['Company name', 'Owner email', 'Mobile number', 'Preferred slug'].map((label) => (
                <label key={label} className="block text-xs font-bold text-slate-400">{label}<input className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/30" /></label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2"><ActionButton variant="neutral" onClick={() => setShowCreate(false)}>Cancel</ActionButton><ActionButton icon={Plus}>Create draft tenant</ActionButton></div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function EntitlementsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Plans & Entitlements" title="Access entitlement engine" description="Platform access is calculated centrally from plan + trial + company overrides + module assignment + expiry instead of being hardcoded in the UI." action={<ActionButton icon={Plus}>Create plan</ActionButton>} />
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          ['Starter', 'Core fleet operations', '7 modules', '25 users'],
          ['Growth', 'Operations + finance + compliance', '12 modules', '75 users'],
          ['Enterprise', 'Full platform + advanced controls', '18 modules', 'Custom users'],
        ].map(([name, desc, modules, users]) => (
          <Card key={name} className="p-5">
            <BadgeCheck size={20} className="text-cyan-300" />
            <h3 className="mt-4 text-lg font-black text-white">{name}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">{desc}</p>
            <div className="mt-5 space-y-2 text-xs text-slate-400"><p>{modules}</p><p>{users}</p><p>Company overrides supported</p></div>
            <div className="mt-5"><ActionButton variant="neutral" icon={SlidersHorizontal}>Configure plan</ActionButton></div>
          </Card>
        ))}
      </div>
      <Card className="p-5 sm:p-6">
        <p className="text-sm font-black text-white">Entitlement resolution order</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
          {['Platform access', 'Subscription / Trial', 'Plan', 'Company override', 'Module feature', 'Role permission', 'User / branch scope'].map((item, index, array) => (
            <React.Fragment key={item}><span className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">{item}</span>{index < array.length - 1 ? <ChevronRight size={14} className="text-slate-700" /> : null}</React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ModulesSection() {
  const [query, setQuery] = useState('');
  const filtered = MODULES.filter((module) => module.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Module Registry" title="Core SaaS module registry" description="Standard IDs, routes, features, permissions, company assignment, menu order and settings are centralized from day one so future Module Builder features do not require a rewrite." action={<ActionButton icon={Plus}>Register module</ActionButton>} />
      <Card className="p-4"><div className="relative max-w-md"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modules..." className="w-full rounded-xl border border-white/10 bg-black/10 py-2.5 pl-10 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30" /></div></Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((module) => (
          <Card key={module.id} className="p-5">
            <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300"><Boxes size={18} /></div><StatusBadge status={module.status} /></div>
            <h3 className="mt-4 text-sm font-black text-white">{module.name}</h3>
            <p className="mt-1 font-mono text-[10px] text-slate-600">module_id: {module.id}</p>
            <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"><p className="text-[9px] uppercase tracking-[0.13em] text-slate-600">Companies</p><p className="mt-1 text-sm font-black text-white">{module.companies}</p></div><div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"><p className="text-[9px] uppercase tracking-[0.13em] text-slate-600">Features</p><p className="mt-1 text-sm font-black text-white">{module.features}</p></div></div>
            <div className="mt-4"><ActionButton variant="neutral" icon={SlidersHorizontal}>Manage registry</ActionButton></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TeamSection() {
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Internal Team" title="Buddy Fleets team & roles" description="Internal Sales, Marketing, Support, Finance, Operations and Technical roles receive only role-approved access through team.buddyfleets.in." action={<ActionButton icon={Plus}>Invite team member</ActionButton>} />
      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b border-white/[0.07] bg-white/[0.02] px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 sm:grid-cols-[1fr_180px_130px_110px]">
          <span>User</span><span>Role</span><span>Portal</span><span>Status</span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {TEAM.map((member) => (
            <div key={member.email} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_180px_130px_110px] sm:items-center">
              <div><p className="text-xs font-bold text-white">{member.name}</p><p className="mt-1 text-[11px] text-slate-500">{member.email}</p></div>
              <span className="text-xs font-bold text-slate-300">{member.role}</span>
              <span className="text-xs text-cyan-300">{member.portal}</span>
              <StatusBadge status={member.status} />
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {['Sales Admin', 'Marketing Admin', 'Support Admin', 'Finance Admin', 'Operations Admin', 'Technical Admin', 'Content Manager', 'Custom Role'].map((role) => (
          <Card key={role} className="p-4"><UserCog size={18} className="text-cyan-300" /><p className="mt-3 text-xs font-black text-white">{role}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Permission-driven internal workspace access.</p></Card>
        ))}
      </div>
    </div>
  );
}

function ModuleBuilderSection() {
  const [selectedType, setSelectedType] = useState('Core extension');
  const builderSteps = [
    ['Module Identity', 'Name, ID, icon, route, status', Boxes],
    ['Fields', 'Text, number, date, relation, calculated, file', ListChecks],
    ['Pages & Views', 'List, detail, form, dashboard widgets', PanelsTopLeft],
    ['Permissions', 'View, create, edit, delete, approve, export', ShieldCheck],
    ['Company Assignment', 'Entitlements and beta rollout', Building2],
    ['Publish', 'Draft → Test → Publish → Rollback', Rocket],
  ];

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Developer Studio" title="Module Builder" description="Future custom modules are metadata-driven. Complex core modules remain professionally coded while the builder progressively exposes safe configuration and extension capabilities." action={<ActionButton icon={Plus}>New module draft</ActionButton>} />
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-black text-white">Builder mode</p><p className="mt-1 text-xs text-slate-500">Controlled extension architecture — never arbitrary production SQL/server code.</p></div><select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="rounded-xl border border-white/10 bg-[#0c1626] px-3 py-2.5 text-xs font-bold text-slate-300 outline-none"><option>Core extension</option><option>Dynamic custom module</option><option>Internal-only tool</option></select></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {builderSteps.map(([title, note, Icon], index) => (
            <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300"><Icon size={17} /></div><span className="text-[10px] font-black text-slate-700">0{index + 1}</span></div><p className="mt-4 text-sm font-black text-white">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{note}</p></div>
          ))}
        </div>
      </Card>
      <Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-300" /><div><p className="text-sm font-black text-white">Safety boundary</p><p className="mt-2 text-xs leading-6 text-slate-500">The CPanel can create modules, fields, workflows, API mappings and permissions through approved schemas. Direct arbitrary SQL, raw server scripts and destructive database execution remain outside the normal CPanel surface.</p></div></div></Card>
    </div>
  );
}

function WorkflowBuilderSection() {
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Developer Studio" title="Workflow Builder" description="Design approvals, statuses, notifications and automations using controlled events and actions." action={<ActionButton icon={Plus}>New workflow</ActionButton>} />
      <div className="grid gap-4 lg:grid-cols-4">
        {[
          ['Trigger', 'trip.completed', Zap],
          ['Condition', 'POD uploaded', CircleDot],
          ['Approval', 'Manager review', BadgeCheck],
          ['Action', 'Generate invoice', Rocket],
        ].map(([title, note, Icon], index, array) => (
          <React.Fragment key={title}><Card className="p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Icon size={18} /></div><p className="mt-4 text-sm font-black text-white">{title}</p><p className="mt-1 text-xs text-slate-500">{note}</p></Card>{index < array.length - 1 ? <div className="hidden items-center justify-center lg:flex"><ChevronRight className="text-slate-700" /></div> : null}</React.Fragment>
        ))}
      </div>
      <Card className="p-5"><p className="text-sm font-black text-white">Standard event bus examples</p><div className="mt-4 flex flex-wrap gap-2">{['vehicle.created', 'trip.completed', 'pod.uploaded', 'invoice.generated', 'driver.document.expiring', 'company.suspended'].map((event) => <span key={event} className="rounded-xl border border-white/[0.08] bg-black/10 px-3 py-2 font-mono text-[11px] text-cyan-300">{event}</span>)}</div></Card>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Developer Studio" title="Integration Manager" description="Central layer for external APIs, webhooks, credential references, retries, timeouts, mappings and integration logs." action={<ActionButton icon={Plus}>Add integration</ActionButton>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;
          return <Card key={integration.name} className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Icon size={20} /></div><StatusBadge status={integration.status} /></div><h3 className="mt-4 text-sm font-black text-white">{integration.name}</h3><p className="mt-1 text-xs text-slate-500">{integration.category}</p><div className="mt-5"><ActionButton variant="neutral" icon={Wrench}>Manage</ActionButton></div></Card>;
        })}
      </div>
    </div>
  );
}

function FeatureFlagsSection() {
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const toggleFlag = (id) => setFlags((current) => current.map((flag) => flag.id === id ? { ...flag, enabled: !flag.enabled } : flag));

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Release Control" title="Feature flags" description="Ship code safely, then selectively enable features for internal users, demo tenants, beta companies or all customers." action={<ActionButton icon={Plus}>Create flag</ActionButton>} />
      <Card className="overflow-hidden"><div className="divide-y divide-white/[0.06]">{flags.map((flag) => <div key={flag.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-white">{flag.name}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{flag.id}</p><p className="mt-1 text-[11px] text-slate-500">Scope: {flag.scope}</p></div><button type="button" onClick={() => toggleFlag(flag.id)} className={cx('relative h-7 w-12 rounded-full border transition', flag.enabled ? 'border-emerald-400/30 bg-emerald-400/20' : 'border-white/10 bg-white/[0.05]')}><span className={cx('absolute top-1 h-5 w-5 rounded-full transition', flag.enabled ? 'left-6 bg-emerald-300' : 'left-1 bg-slate-500')} /></button></div>)}</div></Card>
    </div>
  );
}

function SecuritySection() {
  const controls = [
    ['Central secure login', 'Operational', 'good', LockKeyhole],
    ['MFA / TOTP gateway', 'Deployed', 'good', KeyRound],
    ['HttpOnly portal sessions', 'Operational', 'good', ShieldCheck],
    ['30-minute inactivity policy', 'Enabled', 'good', FileClock],
    ['Account lock protection', 'Enabled', 'good', ShieldAlert],
    ['Tenant authorization', 'Server-side', 'good', Building2],
  ];

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Security Center" title="Platform security control" description="Monitor authentication, sessions, locks, MFA, tenant boundaries and privileged actions. Security authority remains on the server — UI visibility alone never grants access." action={<ActionButton icon={RefreshCcw} variant="neutral">Recheck</ActionButton>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{controls.map(([title, value, status, Icon]) => <Card key={title} className="p-5"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Icon size={18} /></div><span className="text-[10px] font-bold text-emerald-300">HEALTHY</span></div><p className="mt-4 text-sm font-black text-white">{title}</p><p className="mt-1 text-xs text-slate-500">{value}</p></Card>)}</div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-black text-white">Session controls</p><p className="mt-1 text-xs text-slate-500">Future device/session administration.</p></div><MonitorCog size={18} className="text-cyan-300" /></div><div className="mt-4 space-y-2">{['View active sessions', 'Revoke specific device', 'Logout all devices', 'Force re-authentication for critical actions'].map((item) => <div key={item} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-400"><span>{item}</span><ChevronRight size={14} /></div>)}</div></Card>
        <Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-black text-white">Privileged support</p><p className="mt-1 text-xs text-slate-500">Secure support impersonation architecture.</p></div><LifeBuoy size={18} className="text-amber-300" /></div><div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-4 text-xs leading-6 text-slate-400">Support “view as user” requires re-authentication, reason capture, visible impersonation banner and full audit trail. Silent impersonation is not allowed.</div></Card>
      </div>
    </div>
  );
}

function AuditSection() {
  return (
    <div className="space-y-6"><SectionTitle eyebrow="Audit Trail" title="Critical action history" description="Trace who created companies, changed modules, updated permissions, deployed security changes, published website content or modified integrations." action={<ActionButton icon={FileText} variant="neutral">Export log</ActionButton>} /><Card className="overflow-hidden"><div className="divide-y divide-white/[0.06]">{AUDIT.map((row) => <div key={`${row.time}-${row.action}`} className="grid gap-3 px-5 py-4 sm:grid-cols-[100px_140px_1fr_170px] sm:items-center"><span className="text-xs text-slate-500">{row.time}</span><span className="text-xs font-bold text-slate-300">{row.actor}</span><div><p className="text-xs font-bold text-white">{row.action}</p><p className="mt-1 text-[11px] text-slate-500">{row.target}</p></div><div className="sm:text-right"><StatusBadge status={row.severity} /></div></div>)}</div></Card></div>
  );
}

function InfrastructureSection() {
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Infrastructure" title="System health & environments" description="Monitor production surfaces, backend services, deployments, storage, database health and environment separation." action={<ActionButton icon={RefreshCcw} variant="neutral">Refresh health</ActionButton>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{SYSTEM_HEALTH.map((item) => <Card key={item.label} className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Activity size={18} /></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.65)]" /></div><p className="mt-4 text-sm font-black text-white">{item.label}</p><p className="mt-1 text-xs font-bold text-emerald-300">{item.value}</p><p className="mt-1 text-[11px] text-slate-500">{item.note}</p></Card>)}</div>
      <div className="grid gap-5 xl:grid-cols-2"><Card className="p-5"><p className="text-sm font-black text-white">Environment strategy</p><div className="mt-4 space-y-2">{['Development', 'Staging', 'Production'].map((env, index) => <div key={env} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"><div><p className="text-xs font-bold text-white">{env}</p><p className="mt-1 text-[10px] text-slate-600">{index === 0 ? 'Local / feature work' : index === 1 ? 'Safe pre-production verification' : 'Customer-facing live environment'}</p></div><StatusBadge status={index === 2 ? 'active' : 'planned'} /></div>)}</div></Card><Card className="p-5"><p className="text-sm font-black text-white">Operational foundations</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{['Database migrations', 'Automated backups', 'Restore drills', 'Private storage', 'Secret management', 'CI/CD checks', 'Error monitoring', 'Background jobs'].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-400"><CircleDot size={12} className="text-cyan-300" />{item}</div>)}</div></Card></div>
    </div>
  );
}

function SettingsSection() {
  const settings = [
    ['Platform identity', 'Brand, legal name, support contacts, global defaults', Globe2],
    ['Tenant defaults', 'Timezone, currency, date format, financial year, numbering', SlidersHorizontal],
    ['Security policy', 'Session duration, lock policy, MFA defaults, critical re-auth', ShieldCheck],
    ['Notification center', 'Email / SMS / WhatsApp / in-app templates and triggers', Bell],
    ['Data retention', 'Archive, deletion, export and privacy lifecycle policy', HardDrive],
    ['API platform', 'Versioning, idempotency, rate limits and external access', Cable],
  ];

  return (
    <div className="space-y-6"><SectionTitle eyebrow="System Settings" title="Global platform configuration" description="Central Super Admin configuration for platform defaults, security policies, notifications, privacy and API behavior." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{settings.map(([title, text, Icon]) => <Card key={title} className="p-5"><Icon size={20} className="text-cyan-300" /><h3 className="mt-4 text-sm font-black text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p><div className="mt-5"><ActionButton variant="neutral" icon={SlidersHorizontal}>Configure</ActionButton></div></Card>)}</div></div>
  );
}

function PlaceholderSection({ title, description, icon: Icon }) {
  return <div className="space-y-6"><SectionTitle eyebrow="Developer CPanel" title={title} description={description} /><EmptyState icon={Icon} title={`${title} workspace ready`} text="The complete CPanel navigation and interaction shell is in place. This workspace will be connected to authoritative Supabase tables / server APIs as each backend domain is implemented." /></div>;
}

function SectionRenderer({ activeSection, onNavigate }) {
  switch (activeSection) {
    case 'overview': return <OverviewSection onNavigate={onNavigate} />;
    case 'activity': return <LiveActivitySection />;
    case 'website-studio': return <WebsiteStudioSection />;
    case 'content-seo': return <ContentSeoSection />;
    case 'enquiries': return <EnquiriesSection />;
    case 'companies': return <CompaniesSection />;
    case 'entitlements': return <EntitlementsSection />;
    case 'modules': return <ModulesSection />;
    case 'team': return <TeamSection />;
    case 'module-builder': return <ModuleBuilderSection />;
    case 'workflow-builder': return <WorkflowBuilderSection />;
    case 'integrations': return <IntegrationsSection />;
    case 'feature-flags': return <FeatureFlagsSection />;
    case 'security': return <SecuritySection />;
    case 'audit': return <AuditSection />;
    case 'infrastructure': return <InfrastructureSection />;
    case 'settings': return <SettingsSection />;
    default: return <PlaceholderSection title="Control Center" description="Buddy Fleets Super Admin CPanel." icon={TerminalSquare} />;
  }
}

export default function DeveloperDashboard() {
  const navigate = useNavigate();

  const navigateToSection = (id) => {
    const path = OVERVIEW_ROUTES[id];
    if (path) navigate(path);
  };

  return (
    <SectionRenderer activeSection="overview" onNavigate={navigateToSection} />
  );
}
