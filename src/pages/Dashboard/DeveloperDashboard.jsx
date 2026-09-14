import React, { useMemo, useState } from 'react';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Cloud,
  Code2,
  Database,
  FileClock,
  FileText,
  Flag,
  Gauge,
  Globe2,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquare,
  MonitorCog,
  Network,
  PanelsTopLeft,
  PencilRuler,
  Plus,
  RefreshCcw,
  Rocket,
  Search,
  ServerCog,
  Settings,
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
   - This file is intentionally self-contained for the first
     production-grade CPanel shell.
   - UI actions that require database mutation are represented as
     controlled interactive states until their server APIs/tables
     are wired in later phases.
   - Authentication authority remains the existing secure server
     session architecture. This component never handles Supabase
     access/refresh tokens.
============================================================ */

const SIDEBAR_GROUPS = [
  {
    label: 'Control Center',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'activity', label: 'Live Activity', icon: Activity },
    ],
  },
  {
    label: 'Website',
    items: [
      { id: 'website-studio', label: 'Website Studio', icon: PanelsTopLeft },
      { id: 'content-seo', label: 'Content & SEO', icon: Globe2 },
      { id: 'enquiries', label: 'Website Enquiries', icon: MessageSquare },
    ],
  },
  {
    label: 'SaaS Platform',
    items: [
      { id: 'companies', label: 'Companies', icon: Building2 },
      { id: 'entitlements', label: 'Plans & Entitlements', icon: BadgeCheck },
      { id: 'modules', label: 'Module Registry', icon: Boxes },
      { id: 'team', label: 'Team & Roles', icon: Users },
    ],
  },
  {
    label: 'Developer Studio',
    items: [
      { id: 'module-builder', label: 'Module Builder', icon: Blocks },
      { id: 'workflow-builder', label: 'Workflow Builder', icon: Workflow },
      { id: 'integrations', label: 'Integrations', icon: Cable },
      { id: 'feature-flags', label: 'Feature Flags', icon: Flag },
    ],
  },
  {
    label: 'Security & System',
    items: [
      { id: 'security', label: 'Security Center', icon: ShieldCheck },
      { id: 'audit', label: 'Audit Logs', icon: FileClock },
      { id: 'infrastructure', label: 'Infrastructure', icon: ServerCog },
      { id: 'settings', label: 'System Settings', icon: Settings },
    ],
  },
];

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
    active: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    connected: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    configured: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    production: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    published: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    trial: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    beta: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
    demo: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    invited: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
    planned: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
    system: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
    suspended: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    warning: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    info: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  };

  return (
    <span className={cx(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
      config[status] || 'border-white/10 bg-white/5 text-slate-400'
    )}>
      {status}
    </span>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={cx(
      'rounded-[24px] border border-white/[0.08] bg-[#0a1220]/90 shadow-[0_18px_50px_rgba(0,0,0,0.18)]',
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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone = 'cyan' }) {
  const toneMap = {
    cyan: 'from-cyan-400/20 to-blue-500/5 text-cyan-300 border-cyan-400/10',
    green: 'from-emerald-400/20 to-emerald-500/5 text-emerald-300 border-emerald-400/10',
    violet: 'from-violet-400/20 to-purple-500/5 text-violet-300 border-violet-400/10',
    amber: 'from-amber-400/20 to-orange-500/5 text-amber-300 border-amber-400/10',
  };

  return (
    <Card className={cx('overflow-hidden bg-gradient-to-br p-5', toneMap[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/10">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function ActionButton({ children, icon: Icon, onClick, variant = 'primary', disabled = false }) {
  const variants = {
    primary: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15',
    neutral: 'border-white/10 bg-white/[0.045] text-slate-300 hover:bg-white/[0.08] hover:text-white',
    danger: 'border-rose-400/20 bg-rose-400/10 text-rose-300 hover:bg-rose-400/15',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-40',
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

function OverviewSection({ onNavigate }) {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Developer Control Center"
        title="Platform command center"
        description="One place to operate the Buddy Fleets public website, SaaS platform, companies, internal team, developer tools, security, integrations and system health."
        action={<ActionButton icon={RefreshCcw} variant="neutral">Refresh snapshot</ActionButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Companies" value="5" note="3 active • 1 trial • 1 suspended" icon={Building2} tone="cyan" />
        <MetricCard label="Platform users" value="84" note="Across customer + internal portals" icon={Users} tone="green" />
        <MetricCard label="Production modules" value="9" note="3 additional modules in beta/planned" icon={Boxes} tone="violet" />
        <MetricCard label="Security status" value="Healthy" note="Central auth + HttpOnly portal sessions" icon={ShieldCheck} tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">Platform surfaces</p>
              <p className="mt-1 text-xs text-slate-500">Current product surfaces and architecture status.</p>
            </div>
            <StatusBadge status="active" />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ['Public Website', 'buddyfleets.in', Globe2, 'Published marketing + auth entry'],
              ['Developer CPanel', 'developer.buddyfleets.in', TerminalSquare, 'Super Admin control plane'],
              ['Team Portal', 'team.buddyfleets.in', Users, 'Role-based internal workspace'],
              ['Company Portal', 'portal.buddyfleets.in/{slug}', Building2, 'Tenant-isolated customer workspace'],
            ].map(([title, url, Icon, note]) => (
              <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="truncate text-[11px] text-cyan-300">{url}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">{note}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-white">Quick controls</p>
              <p className="mt-1 text-xs text-slate-500">Jump straight to a platform area.</p>
            </div>
            <Zap size={18} className="text-amber-300" />
          </div>

          <div className="mt-5 space-y-2">
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
                className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3 text-left text-xs font-bold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white"
              >
                <span className="flex items-center gap-3"><Icon size={15} className="text-cyan-300" />{label}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">Recent platform activity</p>
              <p className="mt-1 text-xs text-slate-500">Security and deployment events from the current build cycle.</p>
            </div>
            <FileClock size={18} className="text-slate-500" />
          </div>
          <div className="mt-4 divide-y divide-white/[0.06]">
            {AUDIT.slice(0, 4).map((row) => (
              <div key={`${row.time}-${row.action}`} className="flex gap-3 py-3.5">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-200">{row.action}</p>
                    <span className="text-[10px] text-slate-600">{row.time}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{row.actor} • {row.target}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">Architecture foundation</p>
              <p className="mt-1 text-xs text-slate-500">Locked project requirements carried into the CPanel.</p>
            </div>
            <LockKeyhole size={18} className="text-emerald-300" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
              <div key={item} className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-5 text-slate-400">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
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

export default function DeveloperDashboard({ currentUser, onLogout, onUserUpdate }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeItem = useMemo(() => {
    for (const group of SIDEBAR_GROUPS) {
      const match = group.items.find((item) => item.id === activeSection);
      if (match) return match;
    }
    return SIDEBAR_GROUPS[0].items[0];
  }, [activeSection]);

  const navigate = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
    setCommandOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ActiveIcon = activeItem.icon;

  const displayName = currentUser?.name || currentUser?.fullName || currentUser?.username || currentUser?.email?.split('@')[0] || 'Super Admin';
  const displayEmail = currentUser?.email || 'Authenticated Developer';

  return (
    <div className="min-h-screen bg-[#050914] font-sans text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[-14%] top-[-18%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute right-[-16%] top-[22%] h-[560px] w-[560px] rounded-full bg-violet-500/[0.06] blur-[140px]" />
      </div>

      {sidebarOpen ? <button aria-label="Close sidebar overlay" type="button" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" /> : null}

      <aside className={cx(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#07101d]/95 shadow-2xl backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'w-[84px]' : 'w-[286px]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className={cx('flex h-[76px] items-center border-b border-white/[0.07]', sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-5')}>
          <button type="button" onClick={() => navigate('overview')} className="flex min-w-0 items-center gap-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 text-xs font-black text-white shadow-lg shadow-cyan-500/15">BF</div>
            {!sidebarCollapsed ? <div className="min-w-0"><p className="truncate text-sm font-black tracking-tight text-white">Buddy Fleets</p><p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">Developer CPanel</p></div> : null}
          </button>
          {!sidebarCollapsed ? <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.05] hover:text-white lg:hidden"><X size={17} /></button> : null}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent]">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              {!sidebarCollapsed ? <p className="mb-2 px-3 text-[8px] font-black uppercase tracking-[0.19em] text-slate-700">{group.label}</p> : <div className="mx-auto mb-2 h-px w-8 bg-white/[0.06]" />}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={sidebarCollapsed ? item.label : undefined}
                      onClick={() => navigate(item.id)}
                      className={cx(
                        'group flex w-full items-center rounded-xl border text-left transition-all duration-200',
                        sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                        active ? 'border-cyan-400/15 bg-gradient-to-r from-cyan-400/[0.12] to-blue-500/[0.05] text-cyan-200' : 'border-transparent text-slate-500 hover:border-white/[0.06] hover:bg-white/[0.035] hover:text-slate-200'
                      )}
                    >
                      <Icon size={17} className={cx('shrink-0', active ? 'text-cyan-300' : 'text-slate-600 group-hover:text-slate-400')} />
                      {!sidebarCollapsed ? <span className="min-w-0 flex-1 truncate text-[12px] font-bold">{item.label}</span> : null}
                      {!sidebarCollapsed && active ? <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.7)]" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.07] p-3">
          {!sidebarCollapsed ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-xs font-black text-cyan-300">{displayName.slice(0, 2).toUpperCase()}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-white">{displayName}</p><p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300">SUPER ADMIN</p></div>
              </div>
              <button type="button" onClick={onLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/10 bg-rose-400/[0.05] px-3 py-2 text-[11px] font-bold text-rose-300 transition hover:bg-rose-400/[0.1]"><LogOut size={14} /> Secure logout</button>
            </div>
          ) : (
            <button type="button" onClick={onLogout} title="Secure logout" className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/10 bg-rose-400/[0.05] text-rose-300 hover:bg-rose-400/[0.1]"><LogOut size={16} /></button>
          )}
        </div>
      </aside>

      <div className={cx('relative min-h-screen transition-all duration-300', sidebarCollapsed ? 'lg:pl-[84px]' : 'lg:pl-[286px]')}>
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#050914]/85 backdrop-blur-xl">
          <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6 xl:px-8">
            <button type="button" onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 lg:hidden"><Menu size={18} /></button>
            <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-500 transition hover:text-white lg:flex">{sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><ActiveIcon size={15} className="text-cyan-300" /><p className="truncate text-sm font-black text-white">{activeItem.label}</p></div>
              <p className="mt-1 hidden text-[10px] text-slate-600 sm:block">developer.buddyfleets.in • Authenticated Super Admin session</p>
            </div>

            <button type="button" onClick={() => setCommandOpen(true)} className="hidden min-w-[220px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-left text-xs text-slate-600 transition hover:border-cyan-400/20 hover:text-slate-400 md:flex"><Search size={14} /><span className="flex-1">Search CPanel...</span><kbd className="rounded-md border border-white/[0.08] bg-black/10 px-1.5 py-0.5 text-[9px]">⌘K</kbd></button>
            <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-500 transition hover:text-white"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300" /></button>

            <div className="relative">
              <button type="button" onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2 py-1.5 text-left transition hover:border-cyan-400/20">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 text-[10px] font-black">{displayName.slice(0, 2).toUpperCase()}</div>
                <div className="hidden max-w-[150px] md:block"><p className="truncate text-[11px] font-black text-white">{displayName}</p><p className="truncate text-[9px] text-slate-600">Super Admin</p></div>
                <ChevronDown size={14} className="hidden text-slate-600 md:block" />
              </button>
              {profileOpen ? <div className="absolute right-0 top-[48px] w-64 rounded-2xl border border-white/10 bg-[#0a1220] p-3 shadow-2xl"><div className="rounded-xl bg-white/[0.025] p-3"><p className="text-xs font-black text-white">{displayName}</p><p className="mt-1 break-all text-[10px] text-slate-500">{displayEmail}</p></div><button type="button" onClick={() => { setProfileOpen(false); if (onUserUpdate) onUserUpdate(); }} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-400 hover:bg-white/[0.04] hover:text-white"><RefreshCcw size={14} /> Refresh session context</button><button type="button" onClick={onLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-400/[0.06]"><LogOut size={14} /> Secure logout</button></div> : null}
            </div>
          </div>
        </header>

        <main className="relative px-4 py-6 sm:px-6 sm:py-7 xl:px-8 xl:py-8">
          <div className="mx-auto max-w-[1600px]">
            <SectionRenderer activeSection={activeSection} onNavigate={navigate} />
          </div>
        </main>
      </div>

      {commandOpen ? (
        <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/70 p-4 pt-[10vh] backdrop-blur-sm" onMouseDown={() => setCommandOpen(false)}>
          <Card className="w-full max-w-2xl overflow-hidden" >
            <div onMouseDown={(event) => event.stopPropagation()}>
              <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3"><Search size={17} className="text-cyan-300" /><input autoFocus placeholder="Search sections..." className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /><button type="button" onClick={() => setCommandOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.04] hover:text-white"><X size={15} /></button></div>
              <div className="max-h-[55vh] overflow-y-auto p-3">{SIDEBAR_GROUPS.flatMap((group) => group.items).map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => navigate(item.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-slate-400 transition hover:bg-cyan-400/[0.06] hover:text-white"><Icon size={15} className="text-cyan-300" />{item.label}<ChevronRight size={14} className="ml-auto text-slate-700" /></button>; })}</div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
