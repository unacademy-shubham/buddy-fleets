import React, {
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  AppWindow,
  BadgeCheck,
  Bell,
  Blocks,
  Boxes,
  Building2,
  Cable,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cloud,
  Code2,
  Database,
  FileClock,
  FileText,
  Flag,
  Gauge,
  Globe2,
  KeyRound,
  LayoutDashboard,
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
  Share2,
  ServerCog,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  UserCog,
  Users,
  Workflow,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import useDeveloperControlPlane from './shared/useDeveloperControlPlane';
import ControlPlaneConfigDialog from './shared/ControlPlaneConfigDialog';

import {
  createCompany as createLiveCompany,
  getCompanies as getLiveCompanies,
  getPlans as getLivePlans,
  updateCompany as updateLiveCompany,
} from '../../services/developerSaasApi';

/* ============================================================
   BUDDY FLEETS
   DEVELOPER WORKSPACE — SPLITE-INSPIRED MULTI-THEME CPANEL UI

   Theme-neutral Buddy Fleets content.
   Visual tokens are supplied by DeveloperLayout.jsx.
   All page exports are preserved for App.jsx routing.
============================================================ */

const AUDIT = [
  {
    time: '02:03 AM',
    actor: 'SUPER_ADMIN',
    action: 'MFA gateway deployed',
    target: 'secure-mfa',
    severity: 'success',
  },
  {
    time: '01:42 AM',
    actor: 'SUPER_ADMIN',
    action: 'Auth callback architecture updated',
    target: 'developer portal',
    severity: 'success',
  },
  {
    time: '01:31 AM',
    actor: 'System',
    action: 'Portal session revalidated',
    target: 'developer.buddyfleets.in',
    severity: 'info',
  },
  {
    time: '12:56 AM',
    actor: 'SUPER_ADMIN',
    action: 'Repository sync completed',
    target: 'main branch',
    severity: 'info',
  },
];

const MODULES = [
  {
    id: 'dashboard',
    name: 'Dashboard & Reports',
    status: 'production',
    companies: 5,
    features: 8,
  },
  {
    id: 'vehicles',
    name: 'Vehicle Management',
    status: 'production',
    companies: 5,
    features: 14,
  },
  {
    id: 'drivers',
    name: 'Driver Management',
    status: 'production',
    companies: 5,
    features: 10,
  },
  {
    id: 'trips',
    name: 'Duty & Dispatch',
    status: 'production',
    companies: 4,
    features: 16,
  },
  {
    id: 'epod',
    name: 'ePOD',
    status: 'beta',
    companies: 3,
    features: 8,
  },
  {
    id: 'tracking',
    name: 'Vehicle Tracking',
    status: 'planned',
    companies: 0,
    features: 6,
  },
];

const TEAM = [
  {
    name: 'Platform Owner',
    email: 'owner@buddyfleets.in',
    role: 'SUPER_ADMIN',
    portal: 'Developer',
    status: 'active',
  },
  {
    name: 'Sales Admin',
    email: 'sales@buddyfleets.in',
    role: 'SALES_ADMIN',
    portal: 'Team',
    status: 'active',
  },
  {
    name: 'Support Admin',
    email: 'support@buddyfleets.in',
    role: 'SUPPORT_ADMIN',
    portal: 'Team',
    status: 'active',
  },
];

const WEBSITE_PAGES = [
  {
    name: 'Home',
    path: '/',
    status: 'published',
  },
  {
    name: 'Features',
    path: '/features',
    status: 'published',
  },
  {
    name: 'Pricing',
    path: '/pricing',
    status: 'published',
  },
  {
    name: 'About Us',
    path: '/about',
    status: 'published',
  },
  {
    name: 'Contact Us',
    path: '/contact-us',
    status: 'published',
  },
];

function cx(...classes) {
  return classes
    .filter(Boolean)
    .join(' ');
}

function Page({
  children,
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
        className="
          bf-dev-workspace
        "
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
      className="
        bf-dev-page-band
        relative
        min-h-[104px]
        overflow-hidden
        bg-[var(--bf-dev-primary)]
        px-6
        pb-8
        pt-6
        text-white
        sm:px-7
        lg:px-8
      "
    >
      <div
        className="
          relative
          z-[1]
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <h1
            className="
              text-[25px]
              font-semibold
              tracking-[-0.02em]
              text-white
              sm:text-[27px]
            "
          >
            {title}
          </h1>

          {description && (
            <p
              className="
                mt-1.5
                max-w-3xl
                text-[10px]
                leading-5
                text-white/72
              "
            >
              {description}
            </p>
          )}
        </div>

        <div
          className="
            flex
            shrink-0
            flex-col
            items-start
            gap-2
            lg:items-end
          "
        >
          <div
            className="
              text-[10px]
              font-medium
              text-white/80
            "
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
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Card({
  children,
  className = '',
}) {
  return (
    <section
      className={cx(
        `
          rounded-[5px]
          border
          border-[var(--bf-dev-border)]
          bg-[var(--bf-dev-surface)]
          shadow-[0_1px_2px_rgba(0,0,0,.04)]
        `,
        className
      )}
    >
      {children}
    </section>
  );
}

function Button({
  children,
  icon: Icon,
  variant = 'default',
  onClick,
  ...buttonProps
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
      {...buttonProps}
      onClick={onClick}
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
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.35)]
          disabled:cursor-not-allowed
          disabled:opacity-50
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
    suspended:
      'border-rose-500/20 bg-rose-500/10 text-rose-500',
    pending_confirmation:
      'border-slate-500/20 bg-slate-500/10 text-slate-500',
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

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent = 'blue',
}) {
  const accentStyles = {
    blue:
      'bg-[var(--bf-dev-primary)] text-white',
    green:
      'bg-emerald-500 text-white',
    violet:
      'bg-fuchsia-500 text-white',
    amber:
      'bg-orange-400 text-white',
  };

  return (
    <Card
      className="
        min-h-[118px]
        px-5
        py-5
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          gap-4
        "
      >
        <div
          className={cx(
            `
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[5px]
            `,
            accentStyles[accent]
          )}
        >
          <Icon
            size={19}
          />
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              text-[13px]
              font-medium
              text-[var(--bf-dev-text)]
            "
          >
            {label}
          </div>

          <div
            className="
              mt-0.5
              truncate
              text-[24px]
              font-semibold
              leading-none
              tracking-[-0.02em]
              text-[var(--bf-dev-text)]
            "
          >
            {value}
          </div>

          <div
            className="
              mt-2
              truncate
              text-[10px]
              text-[var(--bf-dev-text-3)]
            "
          >
            {note}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CardHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div
      className="
        flex
        min-h-[55px]
        items-center
        justify-between
        gap-3
        border-b
        border-[var(--bf-dev-border)]
        px-5
        py-3
      "
    >
      <div>
        <div
          className="
            text-[15px]
            font-medium
            text-[var(--bf-dev-text)]
          "
        >
          {title}
        </div>

        {subtitle && (
          <div
            className="
              mt-0.5
              text-[9px]
              text-[var(--bf-dev-text-3)]
            "
          >
            {subtitle}
          </div>
        )}
      </div>

      {action}
    </div>
  );
}


function FeatureMatrix({
  title,
  subtitle,
  items,
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
      />

      <div
        className="
          grid
          gap-3
          p-4
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {items.map(
          ({
            title: itemTitle,
            text,
            icon: Icon,
            status = 'active',
          }) => (
            <div
              key={itemTitle}
              className="
                rounded-lg
                border
                border-[var(--bf-dev-border)]
                bg-[var(--bf-dev-surface-2)]
                p-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-[rgb(var(--bf-dev-primary-rgb)/.10)]
                    text-[var(--bf-dev-primary)]
                  "
                >
                  <Icon size={16} />
                </div>

                <Status status={status} />
              </div>

              <div
                className="
                  mt-3
                  text-[12px]
                  font-bold
                  text-[var(--bf-dev-text)]
                "
              >
                {itemTitle}
              </div>

              <div
                className="
                  mt-1
                  text-[10px]
                  leading-5
                  text-[var(--bf-dev-text-2)]
                "
              >
                {text}
              </div>
            </div>
          )
        )}
      </div>
    </Card>
  );
}


function OverviewSection({
  onNavigate,
}) {
  return (
    <Page>
      <PageHeader
        eyebrow="Developer Control Center"
        title="Developer Dashboard"
        description="Platform companies, access, modules, security and operational health."
        actions={
          <Button
            icon={RefreshCcw}
            variant="header"
          >
            Refresh snapshot
          </Button>
        }
      />

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <MetricCard
          label="Companies"
          value="5"
          note="3 active • 1 trial • 1 suspended"
          icon={Building2}
          accent="blue"
        />

        <MetricCard
          label="Platform users"
          value="84"
          note="Customer + internal users"
          icon={Users}
          accent="green"
        />

        <MetricCard
          label="Production modules"
          value="9"
          note="3 beta / planned"
          icon={Boxes}
          accent="violet"
        />

        <MetricCard
          label="Security status"
          value="Healthy"
          note="Secure session controls active"
          icon={ShieldCheck}
          accent="amber"
        />
      </div>

      <div
        className="
          grid
          gap-4
          xl:grid-cols-[1.4fr_.6fr]
        "
      >
        <Card>
          <CardHeader
            title="Platform surfaces"
            subtitle="Current product and portal surfaces"
            action={
              <Status
                status="active"
              />
            }
          />

          <div
            className="
              grid
              gap-3
              p-4
              md:grid-cols-2
            "
          >
            {[
              [
                'Public Website',
                'buddyfleets.in',
                Globe2,
                'Marketing, pricing and central authentication entry.',
              ],
              [
                'Developer CPanel',
                'developer.buddyfleets.in',
                TerminalSquare,
                'Platform administration and control plane.',
              ],
              [
                'Team Portal',
                'team.buddyfleets.in',
                Users,
                'Role-based internal team operations.',
              ],
              [
                'Company Portal',
                'portal.buddyfleets.in/{slug}',
                Building2,
                'Tenant-isolated fleet operations.',
              ],
            ].map(
              ([
                title,
                url,
                Icon,
                text,
              ]) => (
                <div
                  key={title}
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface-2)]
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-[rgb(var(--bf-dev-primary-rgb)/.10)]
                        text-[var(--bf-dev-primary)]
                      "
                    >
                      <Icon
                        size={16}
                      />
                    </div>

                    <div
                      className="
                        min-w-0
                      "
                    >
                      <div
                        className="
                          text-[11px]
                          font-bold
                          text-[var(--bf-dev-text)]
                        "
                      >
                        {title}
                      </div>

                      <div
                        className="
                          mt-0.5
                          truncate
                          text-[9px]
                          text-[var(--bf-dev-primary)]
                        "
                      >
                        {url}
                      </div>
                    </div>
                  </div>

                  <p
                    className="
                      mt-3
                      text-[10px]
                      leading-5
                      text-[var(--bf-dev-text-2)]
                    "
                  >
                    {text}
                  </p>
                </div>
              )
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Quick actions"
            subtitle="Jump to a management area"
          />

          <div
            className="
              space-y-1.5
              p-3
            "
          >
            {[
              [
                'Website Studio',
                'website-studio',
                PanelsTopLeft,
              ],
              [
                'Companies',
                'companies',
                Building2,
              ],
              [
                'Module Registry',
                'modules',
                Boxes,
              ],
              [
                'Security Center',
                'security',
                ShieldCheck,
              ],
            ].map(
              ([
                label,
                target,
                Icon,
              ]) => (
                <button
                  key={target}
                  type="button"
                  onClick={() =>
                    onNavigate(
                      target
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface)]
                    px-3
                    py-3
                    text-left
                    text-[11px]
                    font-semibold
                    text-[var(--bf-dev-text-2)]
                    hover:bg-[var(--bf-dev-surface-2)]
                  "
                >
                  <span
                    className="
                      flex
                      items-center
                      gap-2.5
                    "
                  >
                    <Icon
                      size={15}
                      className="
                        text-[var(--bf-dev-primary)]
                      "
                    />

                    {label}
                  </span>

                  <ChevronRight
                    size={13}
                    className="
                      text-[var(--bf-dev-text-3)]
                    "
                  />
                </button>
              )
            )}
          </div>
        </Card>
      </div>


      <FeatureMatrix
        title="Developer control plane"
        subtitle="Core Super Admin capabilities available from the Developer CPanel"
        items={[
          {
            title: 'Tenant lifecycle',
            text: 'Create, activate, trial, suspend, reactivate and retire customer companies.',
            icon: Building2,
            status: 'active',
          },
          {
            title: 'Plans & billing controls',
            text: 'Plans, entitlements, trials, renewal windows, overrides and future billing hooks.',
            icon: Gauge,
            status: 'active',
          },
          {
            title: 'Users, roles & access',
            text: 'Platform admins, internal team accounts, role assignments and portal access.',
            icon: UserCog,
            status: 'active',
          },
          {
            title: 'Authentication & sessions',
            text: 'Secure login, sessions, account locks, MFA state and privileged re-auth controls.',
            icon: LockKeyhole,
            status: 'active',
          },
          {
            title: 'Module registry',
            text: 'Register modules, features, lifecycle state, dependencies and company rollout.',
            icon: Boxes,
            status: 'active',
          },
          {
            title: 'Feature flags & releases',
            text: 'Staged rollouts, company targeting, beta gates, release history and rollback controls.',
            icon: Flag,
            status: 'active',
          },
          {
            title: 'Developer Studio',
            text: 'Module builder, workflow builder, schemas, permissions and controlled publishing.',
            icon: Code2,
            status: 'active',
          },
          {
            title: 'Integrations & webhooks',
            text: 'Supabase, Vercel, messaging, GPS providers, APIs, webhooks, retries and health.',
            icon: Cable,
            status: 'active',
          },
          {
            title: 'Website Studio',
            text: 'Public pages, SEO metadata, enquiries, media, releases and rollback workflow.',
            icon: PanelsTopLeft,
            status: 'active',
          },
          {
            title: 'Audit & compliance',
            text: 'Privileged action trail, exports, retention, security events and compliance evidence.',
            icon: FileText,
            status: 'active',
          },
          {
            title: 'Infrastructure health',
            text: 'Portal availability, Edge Functions, APIs, database, deployments and environment health.',
            icon: ServerCog,
            status: 'active',
          },
          {
            title: 'Global system settings',
            text: 'Platform identity, tenant defaults, notifications, retention and API policy.',
            icon: Settings,
            status: 'active',
          },
        ]}
      />

      <Card>
        <CardHeader
          title="Recent platform activity"
          subtitle="Latest developer and security events"
        />

        <div
          className="
            overflow-x-auto
          "
        >
          <table
            className="
              min-w-full
              text-left
            "
          >
            <thead
              className="
                bg-[var(--bf-dev-surface-2)]
                text-[9px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-[var(--bf-dev-text-3)]
              "
            >
              <tr>
                <th className="px-4 py-3">
                  Time
                </th>
                <th className="px-4 py-3">
                  Actor
                </th>
                <th className="px-4 py-3">
                  Action
                </th>
                <th className="px-4 py-3">
                  Target
                </th>
                <th className="px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {AUDIT.map(
                (row) => (
                  <tr
                    key={`${row.time}-${row.action}`}
                    className="
                      border-t
                      border-[var(--bf-dev-border)]
                      text-[10px]
                    "
                  >
                    <td
                      className="
                        whitespace-nowrap
                        px-4
                        py-3.5
                        text-[var(--bf-dev-text-2)]
                      "
                    >
                      {row.time}
                    </td>

                    <td
                      className="
                        whitespace-nowrap
                        px-4
                        py-3.5
                        font-semibold
                        text-[var(--bf-dev-text-2)]
                      "
                    >
                      {row.actor}
                    </td>

                    <td
                      className="
                        px-4
                        py-3.5
                        font-semibold
                        text-[var(--bf-dev-text)]
                      "
                    >
                      {row.action}
                    </td>

                    <td
                      className="
                        px-4
                        py-3.5
                        text-[var(--bf-dev-text-2)]
                      "
                    >
                      {row.target}
                    </td>

                    <td
                      className="
                        px-4
                        py-3.5
                      "
                    >
                      <Status
                        status={
                          row.severity
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

function GenericCardsPage({
  eyebrow,
  title,
  description,
  cards,
  action,
}) {
  const { pathname } = useLocation();
  const workspaceKey = `route:${String(pathname || '/').toLowerCase()}`;
  const defaults = { cardSettings: {} };
  const { payload, save, saving, error } =
    useDeveloperControlPlane(workspaceKey, defaults);
  const [editingCard, setEditingCard] = useState(null);

  const cardSettings =
    payload?.cardSettings && typeof payload.cardSettings === 'object'
      ? payload.cardSettings
      : {};

  async function saveCardConfig(nextItem) {
    const result = await save({
      ...payload,
      cardSettings: {
        ...cardSettings,
        [nextItem.title]: {
          status: nextItem.status,
          config: nextItem.config || {},
        },
      },
    });
    if (result.ok) setEditingCard(null);
  }

  return (
    <Page>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={action}
      />

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {cards.map(
          ({
            title: cardTitle,
            text,
            icon: Icon,
            status,
          }) => {
            const saved = cardSettings[cardTitle] || {};
            const displayStatus = saved.status || status;

            return (
              <Card
                key={cardTitle}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-lg
                      bg-[rgb(var(--bf-dev-primary-rgb)/.10)]
                      text-[var(--bf-dev-primary)]
                    "
                  >
                    <Icon size={17} />
                  </div>

                  {displayStatus && (
                    <Status status={displayStatus} />
                  )}
                </div>

                <div className="mt-4 text-[12px] font-bold text-[var(--bf-dev-text)]">
                  {cardTitle}
                </div>

                <div className="mt-1.5 text-[10px] leading-5 text-[var(--bf-dev-text-2)]">
                  {text}
                </div>

                <div className="mt-4">
                  <Button
                    icon={SlidersHorizontal}
                    onClick={() =>
                      setEditingCard({
                        title: cardTitle,
                        status: displayStatus || 'active',
                        config: saved.config || { enabled: true, notes: '' },
                      })
                    }
                  >
                    Configure
                  </Button>
                </div>
              </Card>
            );
          }
        )}
      </div>

      {editingCard && (
        <ControlPlaneConfigDialog
          item={editingCard}
          saving={saving}
          error={error}
          onClose={() => setEditingCard(null)}
          onSave={saveCardConfig}
        />
      )}
    </Page>
  );
}

function LiveActivitySection() {
  const { pathname } = useLocation();
  const defaults = { rows: AUDIT };
  const { payload } =
    useDeveloperControlPlane(`route:${String(pathname || '/').toLowerCase()}`, defaults);
  const rows = Array.isArray(payload?.rows) ? payload.rows : AUDIT;

  return (
    <Page>
      <PageHeader
        eyebrow="Observability"
        title="Live platform activity"
        description="Operational events, security signals and important platform actions."
      />

      <Card>
        <CardHeader
          title="Activity stream"
          action={
            <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500/100" />
              LIVE
            </div>
          }
        />

        <div>
          {rows.map((row) => (
            <div
              key={`${row.time}-${row.action}`}
              className="grid gap-3 border-t border-[var(--bf-dev-border)] px-4 py-4 text-[10px] sm:grid-cols-[90px_140px_1fr_150px]"
            >
              <div className="text-[var(--bf-dev-text-3)]">{row.time}</div>
              <div className="font-semibold text-[var(--bf-dev-text-2)]">{row.actor}</div>
              <div>
                <div className="font-semibold text-[var(--bf-dev-text)]">{row.action}</div>
                <div className="mt-1 text-[var(--bf-dev-text-3)]">{row.target}</div>
              </div>
              <div className="sm:text-right"><Status status={row.severity} /></div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

function WebsiteStudioSection() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const defaults = { pages: WEBSITE_PAGES };
  const { payload } =
    useDeveloperControlPlane(`route:${String(pathname || '/').toLowerCase()}`, defaults);
  const websitePages = Array.isArray(payload?.pages) ? payload.pages : WEBSITE_PAGES;

  return (
    <Page>
      <PageHeader
        eyebrow="Website Studio"
        title="Public website control"
        description="Manage Buddy Fleets website content through a safe draft, preview and publish workflow."
        actions={
          <>
            <Button
              variant="pageBand"
              icon={MonitorCog}
              onClick={() => navigate('/website/website-studio/page-builder')}
            >
              Preview
            </Button>

            <Button
              variant="primary"
              icon={Rocket}
              onClick={() => navigate('/website/website-studio/release-workflow')}
            >
              Publish changes
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader
            title="Pages"
            action={
              <Button icon={Plus} onClick={() => navigate('/website/website-studio/page-builder')}>
                Page
              </Button>
            }
          />

          <div className="space-y-1 p-2.5">
            {websitePages.map((page) => (
              <div
                key={page.path}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--bf-dev-border)] px-3 py-3"
              >
                <div>
                  <div className="text-[11px] font-semibold text-[var(--bf-dev-text)]">{page.name}</div>
                  <div className="mt-0.5 text-[9px] text-[var(--bf-dev-text-3)]">{page.path}</div>
                </div>
                <Status status={page.status} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Visual content workspace"
              subtitle="Code-backed pages with controlled metadata configuration"
            />
            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ['Hero', 'Headline, CTA and media', AppWindow],
                ['Feature Blocks', 'Cards and product modules', Blocks],
                ['Trust & Proof', 'Stats and testimonials', BadgeCheck],
                ['Pricing', 'Plans and offers', Gauge],
                ['CTA Sections', 'Conversion content', Rocket],
                ['Footer & Legal', 'Navigation and policies', FileText],
              ].map(([title, text, Icon]) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => navigate('/website/website-studio/page-builder')}
                  className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-4 text-left hover:bg-[var(--bf-dev-surface-2)]"
                >
                  <Icon size={17} className="text-[var(--bf-dev-primary)]" />
                  <div className="mt-3 text-[11px] font-bold text-[var(--bf-dev-text)]">{title}</div>
                  <div className="mt-1 text-[10px] text-[var(--bf-dev-text-2)]">{text}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Release workflow" />
            <div className="grid gap-3 p-4 sm:grid-cols-4">
              {['Draft', 'Preview', 'Publish', 'Rollback'].map((step, index) => (
                <div key={step} className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgb(var(--bf-dev-primary-rgb)/.14)] text-[10px] font-bold text-[var(--bf-dev-primary)]">{index + 1}</div>
                  <div className="mt-3 text-[11px] font-bold text-[var(--bf-dev-text)]">{step}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}


function PageBuilderSection() {
  return (
    <Page>
      <PageHeader
        eyebrow="Website Studio / Page Builder"
        title="Page Builder"
        description="Build and organize public Buddy Fleets website pages, reusable sections and conversion-focused content."
        actions={
          <>
            <Button
              variant="pageBand"
              icon={MonitorCog}
            >
              Preview
            </Button>

            <Button
              variant="primary"
              icon={Rocket}
            >
              Save draft
            </Button>
          </>
        }
      />

      <div
        className="
          grid
          gap-4
          xl:grid-cols-[300px_1fr]
        "
      >
        <Card>
          <CardHeader
            title="Website pages"
            subtitle="Select a page to edit"
            action={
              <Button icon={Plus}>
                Page
              </Button>
            }
          />

          <div className="space-y-1 p-2.5">
            {WEBSITE_PAGES.map(
              (page) => (
                <button
                  key={page.path}
                  type="button"
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface)]
                    px-3
                    py-3
                    text-left
                    transition
                    hover:bg-[var(--bf-dev-surface-2)]
                  "
                >
                  <div>
                    <div className="text-[11px] font-semibold text-[var(--bf-dev-text)]">
                      {page.name}
                    </div>
                    <div className="mt-0.5 text-[9px] text-[var(--bf-dev-text-3)]">
                      {page.path}
                    </div>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-[var(--bf-dev-text-3)]"
                  />
                </button>
              )
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Page canvas"
              subtitle="Reusable blocks available for the selected page"
            />

            <div
              className="
                grid
                gap-3
                p-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {[
                ['Hero Section', 'Headline, supporting copy, CTA and hero media.', AppWindow],
                ['Feature Grid', 'Product capability cards and module highlights.', Blocks],
                ['Trust Section', 'Customer proof, platform stats and testimonials.', BadgeCheck],
                ['Pricing Block', 'Plan cards, feature comparison and offer copy.', Gauge],
                ['CTA Block', 'Conversion-focused call-to-action section.', Rocket],
                ['Footer Block', 'Navigation, legal links and company information.', FileText],
              ].map(([title, text, Icon]) => (
                <button
                  key={title}
                  type="button"
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface)]
                    p-4
                    text-left
                    transition
                    hover:bg-[var(--bf-dev-surface-2)]
                  "
                >
                  <Icon
                    size={17}
                    className="text-[var(--bf-dev-primary)]"
                  />
                  <div className="mt-3 text-[11px] font-bold text-[var(--bf-dev-text)]">
                    {title}
                  </div>
                  <div className="mt-1 text-[10px] leading-5 text-[var(--bf-dev-text-2)]">
                    {text}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Builder status"
              subtitle="Draft changes are isolated from the live website"
            />

            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {[
                ['Draft pages', '3', PencilRuler],
                ['Reusable blocks', '18', Blocks],
                ['Published pages', '5', CheckCircle2],
              ].map(([label, value, Icon]) => (
                <div
                  key={label}
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface-2)]
                    p-4
                  "
                >
                  <Icon
                    size={16}
                    className="text-[var(--bf-dev-primary)]"
                  />
                  <div className="mt-3 text-[20px] font-semibold text-[var(--bf-dev-text)]">
                    {value}
                  </div>
                  <div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}


function MediaAssetsSection() {
  return (
    <GenericCardsPage
      eyebrow="Website Studio / Media & Assets"
      title="Media & Assets"
      description="Manage public website images, brand files and reusable visual assets from one controlled library."
      action={
        <Button
          variant="primary"
          icon={Plus}
        >
          Upload asset
        </Button>
      }
      cards={[
        {
          title: 'Media Library',
          text: 'Website images, illustrations, screenshots and uploaded media files.',
          icon: AppWindow,
          status: 'active',
        },
        {
          title: 'Brand Assets',
          text: 'Logos, favicons, social graphics and approved Buddy Fleets brand resources.',
          icon: BadgeCheck,
          status: 'active',
        },
        {
          title: 'Asset Optimization',
          text: 'Review dimensions, file size, responsive usage and delivery readiness.',
          icon: Gauge,
          status: 'active',
        },
        {
          title: 'Usage References',
          text: 'See where each asset is currently used across public website pages.',
          icon: Network,
        },
        {
          title: 'Archive',
          text: 'Retire old website assets without immediately deleting historical references.',
          icon: FileClock,
        },
        {
          title: 'Delivery Health',
          text: 'Track missing resources and public asset delivery issues.',
          icon: Cloud,
          status: 'active',
        },
      ]}
    />
  );
}


function ReleaseWorkflowSection() {
  const { pathname } = useLocation();
  const defaults = { releases: [] };
  const { payload, save, saving } =
    useDeveloperControlPlane(`route:${String(pathname || '/').toLowerCase()}`, defaults);

  async function createRelease() {
    if (saving) return;
    const releases = Array.isArray(payload?.releases) ? payload.releases : [];
    await save({
      ...payload,
      releases: [
        ...releases,
        {
          id: globalThis.crypto?.randomUUID?.() || `release-${Date.now()}`,
          state: 'draft',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Website Studio / Release Workflow"
        title="Release Workflow"
        description="Move website changes through draft, preview, publish and rollback with controlled release visibility."
        actions={
          <Button
            variant="primary"
            icon={Rocket}
            disabled={saving}
            onClick={createRelease}
          >
            Create release
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          ['Draft', 'Changes being prepared before review.', PencilRuler, 'active'],
          ['Preview', 'Review changes in a non-public preview state.', MonitorCog, 'active'],
          ['Publish', 'Approved release promoted to the live website.', Rocket, 'production'],
          ['Rollback', 'Restore a previous stable website release.', RefreshCcw, 'planned'],
        ].map(([title, text, Icon, status], index) => (
          <Card
            key={title}
            className="p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-[rgb(var(--bf-dev-primary-rgb)/.10)]
                  text-[var(--bf-dev-primary)]
                "
              >
                <Icon size={17} />
              </div>

              <span className="text-[9px] font-bold text-[var(--bf-dev-text-3)]">
                0{index + 1}
              </span>
            </div>

            <div className="mt-4 text-[12px] font-bold text-[var(--bf-dev-text)]">
              {title}
            </div>
            <div className="mt-1.5 text-[10px] leading-5 text-[var(--bf-dev-text-2)]">
              {text}
            </div>
            <div className="mt-4">
              <Status status={status} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Release checklist"
          subtitle="Controls to verify before a public website release"
        />

        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ['Content review', 'Confirm public copy and CTA changes.', FileText],
            ['SEO review', 'Validate metadata and indexing impact.', Search],
            ['Responsive review', 'Check desktop and mobile presentation.', MonitorCog],
            ['Asset health', 'Verify images and public resources.', Cloud],
            ['Route health', 'Validate public website routes.', Globe2],
            ['Rollback point', 'Preserve the previous stable release.', RefreshCcw],
          ].map(([title, text, Icon]) => (
            <div
              key={title}
              className="
                rounded-lg
                border
                border-[var(--bf-dev-border)]
                bg-[var(--bf-dev-surface-2)]
                p-4
              "
            >
              <Icon
                size={16}
                className="text-[var(--bf-dev-primary)]"
              />
              <div className="mt-3 text-[11px] font-bold text-[var(--bf-dev-text)]">
                {title}
              </div>
              <div className="mt-1 text-[10px] leading-5 text-[var(--bf-dev-text-2)]">
                {text}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}


function ContentSeoSection() {
  return (
    <GenericCardsPage
      eyebrow="Content & SEO"
      title="Search, metadata & public content"
      description="Control titles, metadata, indexing and AI discoverability from one place."
      cards={[
        {
          title:
            'SEO metadata',
          text:
            'Titles, descriptions, canonical routes and OpenGraph settings.',
          icon:
            Search,
        },
        {
          title:
            'Indexing controls',
          text:
            'robots.txt, sitemap.xml, noindex rules and route health.',
          icon:
            Globe2,
        },
        {
          title:
            'Agent / AI discoverability',
          text:
            'llms.txt and structured machine-readable content.',
          icon:
            Code2,
        },
      ]}
    />
  );
}


function MetadataSection() {
  return (
    <GenericCardsPage
      eyebrow="Content & SEO / Metadata"
      title="Metadata"
      description="Manage page titles, descriptions, canonical metadata and public social-sharing information."
      cards={[
        {
          title: 'Page Titles',
          text: 'Control search titles for every public Buddy Fleets route.',
          icon: FileText,
          status: 'active',
        },
        {
          title: 'Meta Descriptions',
          text: 'Maintain concise search descriptions for public pages.',
          icon: PencilRuler,
          status: 'active',
        },
        {
          title: 'Canonical URLs',
          text: 'Define canonical routes and prevent duplicate-indexing ambiguity.',
          icon: Globe2,
          status: 'active',
        },
        {
          title: 'OpenGraph',
          text: 'Manage titles, descriptions and social preview assets.',
          icon: Share2,
        },
        {
          title: 'Structured Data',
          text: 'Control machine-readable public website schema metadata.',
          icon: Code2,
        },
        {
          title: 'Metadata Audit',
          text: 'Review missing, duplicated or incomplete public metadata.',
          icon: ListChecks,
        },
      ]}
    />
  );
}


function IndexingSection() {
  return (
    <GenericCardsPage
      eyebrow="Content & SEO / Indexing"
      title="Indexing"
      description="Control crawl access, sitemap health and indexability of Buddy Fleets public website routes."
      cards={[
        {
          title: 'robots.txt',
          text: 'Review crawler access rules and protected route exclusions.',
          icon: FileText,
          status: 'active',
        },
        {
          title: 'Sitemap',
          text: 'Track public routes included in sitemap.xml.',
          icon: Network,
          status: 'active',
        },
        {
          title: 'Indexability Rules',
          text: 'Manage index/noindex policy for public pages.',
          icon: SlidersHorizontal,
          status: 'active',
        },
        {
          title: 'Canonical Health',
          text: 'Review canonical route consistency across indexed pages.',
          icon: Globe2,
        },
        {
          title: 'Route Health',
          text: 'Identify public routes with redirect or response issues.',
          icon: Gauge,
        },
        {
          title: 'Index Coverage',
          text: 'Prepare indexing visibility for future search-console integration.',
          icon: Search,
        },
      ]}
    />
  );
}


function AiDiscoverabilitySection() {
  return (
    <GenericCardsPage
      eyebrow="Content & SEO / AI Discoverability"
      title="AI Discoverability"
      description="Prepare structured public content so AI-assisted search and machine readers can understand Buddy Fleets accurately."
      cards={[
        {
          title: 'llms.txt',
          text: 'Maintain a concise machine-readable guide to important public Buddy Fleets content.',
          icon: Code2,
          status: 'active',
        },
        {
          title: 'Structured Content',
          text: 'Expose clear product, feature and company information for machine interpretation.',
          icon: Blocks,
          status: 'active',
        },
        {
          title: 'Entity Signals',
          text: 'Keep company, product and brand references consistent across public surfaces.',
          icon: BadgeCheck,
        },
        {
          title: 'Answer Readiness',
          text: 'Review public content for concise factual explanations of Buddy Fleets capabilities.',
          icon: MessageSquare,
        },
        {
          title: 'Source Freshness',
          text: 'Track content areas that may become stale after product or pricing changes.',
          icon: RefreshCcw,
        },
        {
          title: 'Machine Access',
          text: 'Review crawler accessibility for approved AI and search discovery surfaces.',
          icon: Globe2,
        },
      ]}
    />
  );
}


function EnquiriesSection() {
  const { pathname } = useLocation();
  const defaults = {
    enquiries: [
      { id: 'enq-1', subject: 'Fleet Demo Request', company: 'Apex Transport', type: 'Product Demo', status: 'New' },
      { id: 'enq-2', subject: 'Pricing enquiry', company: 'Raj Roadlines', type: 'Pricing', status: 'Open' },
      { id: 'enq-3', subject: 'Enterprise onboarding', company: 'Western Cargo', type: 'Enterprise', status: 'Follow-up' },
    ],
  };
  const { payload, save, saving } =
    useDeveloperControlPlane(`route:${String(pathname || '/').toLowerCase()}`, defaults);
  const enquiries = Array.isArray(payload?.enquiries) ? payload.enquiries : defaults.enquiries;

  async function createEnquiry() {
    if (saving) return;
    const subject = window.prompt('Enquiry subject');
    if (!subject?.trim()) return;
    const company = window.prompt('Company / contact name');
    if (!company?.trim()) return;
    const type = window.prompt('Enquiry type', 'Product Demo');
    if (!type?.trim()) return;
    await save({
      ...payload,
      enquiries: [...enquiries, {
        id: globalThis.crypto?.randomUUID?.() || `enq-${Date.now()}`,
        subject: subject.trim(),
        company: company.trim(),
        type: type.trim(),
        status: 'New',
      }],
    });
  }

  async function openEnquiry(id) {
    if (saving) return;
    await save({
      ...payload,
      enquiries: enquiries.map((item) =>
        item.id === id && item.status === 'New' ? { ...item, status: 'Open' } : item
      ),
    });
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Website Enquiries"
        title="Inbound lead inbox"
        description="Website contact submissions, demo interest and public enquiries."
        actions={
          <Button variant="primary" icon={Plus} disabled={saving} onClick={createEnquiry}>
            New enquiry
          </Button>
        }
      />

      <Card>
        <CardHeader title="Current enquiries" />
        <div className="divide-y divide-slate-200">
          {enquiries.map((item) => (
            <div key={item.id} className="grid gap-3 px-4 py-4 text-[10px] sm:grid-cols-[1fr_180px_140px_100px] sm:items-center">
              <div><div className="font-semibold text-[var(--bf-dev-text)]">{item.subject}</div><div className="mt-1 text-[var(--bf-dev-text-3)]">{item.company}</div></div>
              <div className="text-[var(--bf-dev-text-2)]">{item.type}</div>
              <Status status={item.status === 'New' ? 'trial' : 'active'} />
              <Button disabled={saving} onClick={() => openEnquiry(item.id)}>Open</Button>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

function companyDateInput(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function companyDateLabel(value) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function companyStartOfDay(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function companyEndOfDay(value) {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function blankLiveCompanyForm() {
  return {
    companyName: '',
    companyCode: '',
    subdomainSlug: '',
    status: 'pending_confirmation',
    planKey: '',
    trialStartAt: companyDateInput(new Date()),
    trialEndAt: '',
    legalName: '',
    tradeName: '',
    registrationType: '',
    businessType: '',
    gstin: '',
    pan: '',
    aadhaarLast4: '',
    cin: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    ownerPassword: '',
    ownerPasswordConfirm: '',
    contactEmail: '',
    contactMobile: '',
    alternateMobile: '',
    billingEmail: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    notes: '',
    expectedRevision: 0,
  };
}

function liveCompanyToForm(company) {
  const profile = company?.profile || {};
  return {
    ...blankLiveCompanyForm(),
    companyName: company?.company_name || '',
    companyCode: company?.company_code || '',
    subdomainSlug: company?.subdomain_slug || '',
    status: company?.status || 'active',
    planKey: company?.override?.plan_key || '',
    trialStartAt: companyDateInput(company?.subscription?.trial_start_at),
    trialEndAt: companyDateInput(company?.subscription?.trial_end_at),
    legalName: profile.legal_name || '',
    tradeName: profile.trade_name || '',
    registrationType: profile.registration_type || '',
    businessType: profile.business_type || '',
    gstin: profile.gstin || '',
    pan: profile.pan || '',
    aadhaarLast4: profile.aadhaar_last4 || '',
    cin: profile.cin || '',
    ownerName: profile.owner_name || '',
    ownerEmail: profile.owner_email || '',
    ownerMobile: profile.owner_mobile || '',
    contactEmail: profile.contact_email || '',
    contactMobile: profile.contact_mobile || '',
    alternateMobile: profile.alternate_mobile || '',
    billingEmail: profile.billing_email || '',
    website: profile.website || '',
    addressLine1: profile.address_line1 || '',
    addressLine2: profile.address_line2 || '',
    city: profile.city || '',
    state: profile.state || '',
    postalCode: profile.postal_code || '',
    country: profile.country || 'India',
    notes: profile.notes || '',
    expectedRevision: Number(profile.revision || 0),
  };
}

function CompanyDetailsModal({ company, plans, saving, apiError, onClose, onSaved }) {
  const isNew = !company;
  const [form, setForm] = useState(() => (company ? liveCompanyToForm(company) : blankLiveCompanyForm()));
  const [localError, setLocalError] = useState('');

  const edit = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setLocalError('');
  };

  async function submit() {
    if (!form.companyName.trim()) {
      setLocalError('Company name is required.');
      return;
    }

    if (isNew && !form.ownerEmail.trim()) {
      setLocalError('Owner email is required.');
      return;
    }

    if (isNew && form.ownerPassword.length < 8) {
      setLocalError('Owner password must be at least 8 characters.');
      return;
    }

    if (isNew && form.ownerPassword !== form.ownerPasswordConfirm) {
      setLocalError('Owner password and confirmation do not match.');
      return;
    }

    if (form.status === 'trial_active' && !form.trialEndAt) {
      setLocalError('Trial end date is required for an active trial.');
      return;
    }

    const payload = {
      ...form,
      trialStartAt: companyStartOfDay(form.trialStartAt),
      trialEndAt: companyEndOfDay(form.trialEndAt),
    };

    await onSaved(payload, company?.id || '');
  }

  const inputClass = 'mt-1.5 h-10 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[11px] text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text-3)] focus:border-[var(--bf-dev-primary)] disabled:cursor-not-allowed disabled:opacity-60';
  const textareaClass = 'mt-1.5 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2.5 text-[11px] text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text-3)] focus:border-[var(--bf-dev-primary)]';
  const labelClass = 'block text-[10px] font-semibold text-[var(--bf-dev-text-2)]';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-5">
      <Card className="max-h-[92dvh] w-full max-w-5xl overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--bf-dev-border)] p-5">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--bf-dev-primary)]">
              {isNew ? 'New tenant' : 'Company profile'}
            </div>
            <div className="mt-1 text-[20px] font-extrabold text-[var(--bf-dev-text)]">
              {isNew ? 'Create company' : `Edit ${company.company_name}`}
            </div>
            <div className="mt-1 text-[10px] text-[var(--bf-dev-text-3)]">
              Company, legal, tax, owner, contact, billing and registered-address information.
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bf-dev-border)] text-[var(--bf-dev-text-2)]">
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[calc(92dvh-132px)] overflow-y-auto p-5">
          {(localError || apiError) && <p className="mb-4 text-[10px] font-medium text-rose-500">{localError || apiError}</p>}

          <div className="space-y-6">
            <section>
              <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--bf-dev-primary)]">Company & Portal</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className={labelClass}>Company name *<input value={form.companyName} onChange={(e) => edit('companyName', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Legal name<input value={form.legalName} onChange={(e) => edit('legalName', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Trade name<input value={form.tradeName} onChange={(e) => edit('tradeName', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Company code {isNew ? '(auto-generated)' : ''}<input value={isNew ? 'Generated automatically on create' : form.companyCode} disabled className={inputClass} /></label>
                <label className={labelClass}>Portal slug {isNew ? '(auto if blank)' : ''}<input value={form.subdomainSlug} onChange={(e) => edit('subdomainSlug', e.target.value.toLowerCase())} className={inputClass} /></label>
                {isNew && <label className={labelClass}>Initial status<select value={form.status} onChange={(e) => edit('status', e.target.value)} className={inputClass}><option value="pending_confirmation">Pending confirmation</option><option value="trial_active">Trial active</option><option value="active">Active</option></select></label>}
                {isNew && <label className={labelClass}>Initial plan<select value={form.planKey} onChange={(e) => edit('planKey', e.target.value)} className={inputClass}><option value="">No plan yet</option>{plans.filter((plan) => plan.status === 'active').map((plan) => <option key={plan.id} value={plan.plan_key}>{plan.name}</option>)}</select></label>}
                {isNew && <label className={labelClass}>Trial start<input type="date" value={form.trialStartAt} onChange={(e) => edit('trialStartAt', e.target.value)} className={inputClass} /></label>}
                {isNew && <label className={labelClass}>Trial end {form.status === 'trial_active' ? '*' : ''}<input type="date" value={form.trialEndAt} onChange={(e) => edit('trialEndAt', e.target.value)} className={inputClass} /></label>}
              </div>
            </section>

            <section>
              <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--bf-dev-primary)]">Legal & Tax</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className={labelClass}>Registration type<input placeholder="Proprietorship / Pvt Ltd / LLP" value={form.registrationType} onChange={(e) => edit('registrationType', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Business type<input placeholder="Transport / Logistics" value={form.businessType} onChange={(e) => edit('businessType', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>GSTIN<input maxLength={15} value={form.gstin} onChange={(e) => edit('gstin', e.target.value.toUpperCase())} className={inputClass} /></label>
                <label className={labelClass}>PAN<input maxLength={10} value={form.pan} onChange={(e) => edit('pan', e.target.value.toUpperCase())} className={inputClass} /></label>
                <label className={labelClass}>CIN / registration no.<input value={form.cin} onChange={(e) => edit('cin', e.target.value.toUpperCase())} className={inputClass} /></label>
                <label className={labelClass}>Aadhaar last 4<input inputMode="numeric" maxLength={4} value={form.aadhaarLast4} onChange={(e) => edit('aadhaarLast4', e.target.value.replace(/\D/g, '').slice(0, 4))} className={inputClass} /></label>
              </div>
              <p className="mt-2 text-[9px] leading-4 text-[var(--bf-dev-text-3)]">For privacy/security, this profile stores only Aadhaar last 4. Full Aadhaar documents should use private document storage with controlled access.</p>
            </section>

            <section>
              <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--bf-dev-primary)]">Owner & Contact</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className={labelClass}>Owner / contact person<input value={form.ownerName} onChange={(e) => edit('ownerName', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Owner email<input type="email" value={form.ownerEmail} onChange={(e) => edit('ownerEmail', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Owner mobile<input inputMode="numeric" value={form.ownerMobile} onChange={(e) => edit('ownerMobile', e.target.value)} className={inputClass} /></label>
                {isNew && <label className={labelClass}>Owner password *<input type="password" minLength={8} value={form.ownerPassword} onChange={(e) => edit('ownerPassword', e.target.value)} className={inputClass} /></label>}
                {isNew && <label className={labelClass}>Confirm owner password *<input type="password" minLength={8} value={form.ownerPasswordConfirm} onChange={(e) => edit('ownerPasswordConfirm', e.target.value)} className={inputClass} /></label>}
                <label className={labelClass}>Company email<input type="email" value={form.contactEmail} onChange={(e) => edit('contactEmail', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Company mobile<input inputMode="numeric" value={form.contactMobile} onChange={(e) => edit('contactMobile', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Alternate mobile<input inputMode="numeric" value={form.alternateMobile} onChange={(e) => edit('alternateMobile', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Billing email<input type="email" value={form.billingEmail} onChange={(e) => edit('billingEmail', e.target.value)} className={inputClass} /></label>
                <label className={`${labelClass} sm:col-span-2`}>Website<input placeholder="https://..." value={form.website} onChange={(e) => edit('website', e.target.value)} className={inputClass} /></label>
              </div>
            </section>

            <section>
              <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--bf-dev-primary)]">Registered Address</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className={`${labelClass} sm:col-span-2`}>Address line 1<input value={form.addressLine1} onChange={(e) => edit('addressLine1', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>Address line 2<input value={form.addressLine2} onChange={(e) => edit('addressLine2', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>City<input value={form.city} onChange={(e) => edit('city', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>State<input value={form.state} onChange={(e) => edit('state', e.target.value)} className={inputClass} /></label>
                <label className={labelClass}>PIN code<input inputMode="numeric" maxLength={6} value={form.postalCode} onChange={(e) => edit('postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))} className={inputClass} /></label>
                <label className={labelClass}>Country<input value={form.country} onChange={(e) => edit('country', e.target.value)} className={inputClass} /></label>
              </div>
            </section>

            <label className={labelClass}>Internal notes<textarea rows={4} value={form.notes} onChange={(e) => edit('notes', e.target.value)} className={textareaClass} /></label>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[var(--bf-dev-border)] pt-4">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={saving} onClick={submit}>
              {saving ? 'Saving...' : isNew ? 'Create company' : 'Save company details'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CompaniesSection() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCompany, setEditingCompany] = useState(undefined);

  async function loadCompanies() {
    setLoading(true);
    setError('');
    const [companyResult, planResult] = await Promise.all([
      getLiveCompanies(),
      getLivePlans(),
    ]);

    if (companyResult.ok && Array.isArray(companyResult.companies)) {
      setCompanies(companyResult.companies);
    } else {
      setCompanies([]);
      setError(companyResult?.code || 'Unable to load companies.');
    }

    if (planResult.ok && Array.isArray(planResult.plans)) {
      setPlans(planResult.plans);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadCompanies();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((company) => {
      const profile = company.profile || {};
      return `${company.company_name || ''} ${company.company_code || ''} ${company.subdomain_slug || ''} ${company.status || ''} ${profile.gstin || ''} ${profile.pan || ''} ${profile.owner_name || ''}`.toLowerCase().includes(q);
    });
  }, [companies, query]);

  async function saveCompany(payload, companyId = '') {
    setSaving(true);
    setError('');
    setSuccess('');

    const result = companyId
      ? await updateLiveCompany({ action: 'update_profile', companyId, ...payload })
      : await createLiveCompany(payload);

    if (result.ok) {
      setEditingCompany(undefined);
      setSuccess(companyId ? 'Company details updated.' : 'Company created in the live tenant database.');
      await loadCompanies();
    } else {
      const messages = {
        INVALID_COMPANY_PROFILE: 'Check GSTIN, PAN, mobile, email and PIN-code formats.',
        INVALID_COMPANY_PAYLOAD: 'Complete the required company information and check field formats.',
        INVALID_TRIAL_RANGE: 'Trial end date must be after the trial start date.',
        COMPANY_IDENTITY_EXISTS: 'Company code or portal slug already exists.',
        COMPANY_SLUG_EXISTS: 'Portal slug already exists.',
        PLAN_NOT_AVAILABLE: 'Selected plan is not available.',
        REVISION_CONFLICT: 'This company was changed in another session. Refresh and try again.',
      };
      setError(messages[result?.code] || result?.code || 'Unable to save company.');
    }
    setSaving(false);
  }

  async function changeLifecycle(company, action) {
    setSaving(true);
    setError('');
    setSuccess('');
    const result = await updateLiveCompany({ action, companyId: company.id });
    if (result.ok) {
      setSuccess(action === 'suspend' ? 'Company suspended. Existing company-portal sessions are revoked by the secure session gate.' : 'Company restored. The company user can sign in again.');
      await loadCompanies();
    } else {
      setError(result?.code || `Unable to ${action} company.`);
    }
    setSaving(false);
  }

  return (
    <Page>
      <PageHeader
        eyebrow="SaaS Platform"
        title="Company management"
        description="Create, inspect and manage Buddy Fleets customer tenants. Data is loaded from the live companies database."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button icon={RefreshCcw} onClick={loadCompanies} disabled={loading || saving}>Refresh</Button>
            <Button variant="primary" icon={Plus} onClick={() => { setError(''); setEditingCompany(null); }}>
              Create company
            </Button>
          </div>
        }
      />

      <Card className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bf-dev-text-3)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company, code, slug, GSTIN, PAN..."
              className="h-9 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] pl-9 pr-3 text-[11px] text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text-3)] focus:border-[var(--bf-dev-primary)]"
            />
          </div>
          <div className="text-[10px] text-[var(--bf-dev-text-3)]">{loading ? 'Loading...' : `${filtered.length} live companies`}</div>
        </div>
      </Card>

      {error && <div className="text-[10px] font-medium text-rose-500">{error}</div>}
      {success && <div className="text-[10px] font-medium text-emerald-500">{success}</div>}

      {!loading && !filtered.length && (
        <Card className="p-8 text-center text-[11px] text-[var(--bf-dev-text-3)]">
          No matching live company records found.
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((company) => {
          const profile = company.profile || {};
          const renewalDate = company.subscription?.subscription_end_at || company.subscription?.trial_end_at;
          const statusForChip = company.status === 'trial_active' ? 'trial' : company.status === 'trial_expired' ? 'warning' : company.status;
          const planLabel = company.override?.plan_key || company.subscription?.plan_id || 'Not assigned';

          return (
            <Card key={company.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]">
                    <Building2 size={17} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[var(--bf-dev-text)]">{company.company_name || 'Unnamed company'}</div>
                    <div className="mt-1 text-[9px] text-[var(--bf-dev-primary)]">{company.company_code || 'No code'} · portal.buddyfleets.in/{company.subdomain_slug || 'no-slug'}</div>
                    {profile.owner_name && <div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">Owner: {profile.owner_name}</div>}
                  </div>
                </div>
                <Status status={statusForChip} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['Plan', planLabel],
                  ['GSTIN', profile.gstin || 'Not set'],
                  ['PAN', profile.pan || 'Not set'],
                  ['Subscription', company.subscription?.status || 'Not set'],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3">
                    <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--bf-dev-text-3)]">{label}</div>
                    <div className="mt-1 truncate text-[10px] font-bold text-[var(--bf-dev-text)]" title={String(value)}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--bf-dev-border)] pt-4">
                <div className="text-[9px] text-[var(--bf-dev-text-3)]">Renewal / trial end: {companyDateLabel(renewalDate)}</div>
                <div className="flex flex-wrap gap-2">
                  <Button icon={ChevronRight} disabled={saving} onClick={() => navigate(`/saas-platform/companies/${company.id}`)}>View More</Button>
                  <Button icon={UserCog} disabled={saving} onClick={() => { setError(''); setEditingCompany(company); }}>Manage</Button>
                  {company.status === 'suspended' ? (
                    <Button disabled={saving} onClick={() => changeLifecycle(company, 'restore')}>Restore</Button>
                  ) : (
                    <Button variant="danger" icon={LockKeyhole} disabled={saving} onClick={() => changeLifecycle(company, 'suspend')}>Suspend</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {editingCompany !== undefined && (
        <CompanyDetailsModal
          company={editingCompany}
          plans={plans}
          saving={saving}
          apiError={error}
          onClose={() => { setEditingCompany(undefined); setError(''); }}
          onSaved={saveCompany}
        />
      )}
    </Page>
  );
}

function EntitlementsSection() {
  return (
    <GenericCardsPage
      eyebrow="Plans & Entitlements"
      title="Access entitlement engine"
      description="Plan, trial, company override, module and role based access control."
      action={
        <Button
          variant="primary"
          icon={Plus}
        >
          Create plan
        </Button>
      }
      cards={[
        {
          title: 'Starter',
          text: 'Core fleet operations with controlled limits and essential modules.',
          icon: BadgeCheck,
          status: 'active',
        },
        {
          title: 'Growth',
          text: 'Operations, finance and compliance for growing fleet businesses.',
          icon: BadgeCheck,
          status: 'active',
        },
        {
          title: 'Enterprise',
          text: 'Full platform access with advanced controls and custom limits.',
          icon: BadgeCheck,
          status: 'active',
        },
        {
          title: 'Trial policy',
          text: 'Trial duration, grace period, conversion rules and expiry handling.',
          icon: FileClock,
          status: 'active',
        },
        {
          title: 'Company overrides',
          text: 'Per-company module, feature, limit and entitlement exceptions.',
          icon: SlidersHorizontal,
          status: 'active',
        },
        {
          title: 'Renewal controls',
          text: 'Renewal windows, expiry actions, suspension policy and future billing integration.',
          icon: RefreshCcw,
          status: 'active',
        },
      ]}
    />
  );
}

function ModulesSection() {
  const { pathname } = useLocation();
  const defaults = { modules: MODULES };
  const { payload, save, saving } =
    useDeveloperControlPlane(`route:${String(pathname || '/').toLowerCase()}`, defaults);
  const modules = Array.isArray(payload?.modules) ? payload.modules : MODULES;

  async function registerModule() {
    if (saving) return;
    const name = window.prompt('Module name');
    if (!name?.trim()) return;
    const suggested = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const id = window.prompt('Module ID', suggested);
    if (!id?.trim()) return;
    if (modules.some((module) => module.id === id.trim())) {
      window.alert('A module with this ID already exists.');
      return;
    }
    await save({
      ...payload,
      modules: [...modules, {
        id: id.trim(),
        name: name.trim(),
        status: 'planned',
        companies: 0,
        features: 0,
      }],
    });
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Module Registry"
        title="Core SaaS module registry"
        description="Central registry of Buddy Fleets modules, features and rollout state."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            disabled={saving}
            onClick={registerModule}
          >
            Register module
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                <Boxes size={16} />
              </div>
              <Status status={module.status} />
            </div>
            <div className="mt-3 text-[12px] font-bold text-[var(--bf-dev-text)]">{module.name}</div>
            <div className="mt-1 font-mono text-[9px] text-[var(--bf-dev-text-3)]">module_id: {module.id}</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3">
                <div className="text-[8px] uppercase text-[var(--bf-dev-text-3)]">Companies</div>
                <div className="mt-1 text-[12px] font-bold">{module.companies}</div>
              </div>
              <div className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3">
                <div className="text-[8px] uppercase text-[var(--bf-dev-text-3)]">Features</div>
                <div className="mt-1 text-[12px] font-bold">{module.features}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function TeamSection() {
  const { pathname } = useLocation();
  const defaults = { team: TEAM };
  const { payload, save, saving } =
    useDeveloperControlPlane(`route:${String(pathname || '/').toLowerCase()}`, defaults);
  const team = Array.isArray(payload?.team) ? payload.team : TEAM;

  async function inviteMember() {
    if (saving) return;
    const name = window.prompt('Team member name');
    if (!name?.trim()) return;
    const email = window.prompt('Email address');
    if (!email?.trim()) return;
    const role = window.prompt('Role', 'SUPPORT_ADMIN');
    if (!role?.trim()) return;
    if (team.some((member) => member.email.toLowerCase() === email.trim().toLowerCase())) {
      window.alert('A team member with this email already exists.');
      return;
    }
    await save({
      ...payload,
      team: [...team, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim().toUpperCase(),
        portal: 'Team',
        status: 'planned',
      }],
    });
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Internal Team"
        title="Buddy Fleets team & roles"
        description="Internal staff, roles and portal assignment."
        actions={
          <Button variant="primary" icon={Plus} disabled={saving} onClick={inviteMember}>
            Invite team member
          </Button>
        }
      />

      <Card>
        <CardHeader title="Team members" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[var(--bf-dev-surface-2)] text-[9px] font-bold uppercase text-[var(--bf-dev-text-3)]">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Portal</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.email} className="border-t border-[var(--bf-dev-border)] text-[10px]">
                  <td className="px-4 py-3.5"><div className="font-semibold text-[var(--bf-dev-text)]">{member.name}</div><div className="mt-1 text-[var(--bf-dev-text-3)]">{member.email}</div></td>
                  <td className="px-4 py-3.5 font-semibold text-[var(--bf-dev-text-2)]">{member.role}</td>
                  <td className="px-4 py-3.5 text-[var(--bf-dev-primary)]">{member.portal}</td>
                  <td className="px-4 py-3.5"><Status status={member.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

function ModuleBuilderSection() {
  return (
    <GenericCardsPage
      eyebrow="Developer Studio"
      title="Module Builder"
      description="Metadata-driven module design with controlled schemas and permissions."
      action={
        <Button
          variant="primary"
          icon={Plus}
        >
          New module draft
        </Button>
      }
      cards={[
        {
          title:
            'Module Identity',
          text:
            'Name, module ID, icon, route and lifecycle status.',
          icon:
            Boxes,
        },
        {
          title:
            'Fields',
          text:
            'Text, number, date, relation, calculated and file fields.',
          icon:
            ListChecks,
        },
        {
          title:
            'Pages & Views',
          text:
            'List, detail, form and dashboard surfaces.',
          icon:
            PanelsTopLeft,
        },
        {
          title:
            'Permissions',
          text:
            'View, create, edit, delete, approve and export.',
          icon:
            ShieldCheck,
        },
        {
          title:
            'Company Assignment',
          text:
            'Entitlement and controlled rollout settings.',
          icon:
            Building2,
        },
        {
          title:
            'Publish',
          text:
            'Draft, test, publish and rollback workflow.',
          icon:
            Rocket,
        },
      ]}
    />
  );
}

function WorkflowBuilderSection() {
  return (
    <GenericCardsPage
      eyebrow="Developer Studio"
      title="Workflow Builder"
      description="Design controlled events, conditions, approvals and actions."
      action={
        <Button
          variant="primary"
          icon={Plus}
        >
          New workflow
        </Button>
      }
      cards={[
        {
          title:
            'Trigger',
          text:
            'Start workflows from approved system events.',
          icon:
            Zap,
        },
        {
          title:
            'Condition',
          text:
            'Evaluate workflow conditions and rules.',
          icon:
            CircleDot,
        },
        {
          title:
            'Approval',
          text:
            'Add controlled manager approval steps.',
          icon:
            BadgeCheck,
        },
        {
          title:
            'Action',
          text:
            'Execute registered platform actions.',
          icon:
            Rocket,
        },
      ]}
    />
  );
}

function IntegrationsSection() {
  return (
    <GenericCardsPage
      eyebrow="Developer Studio"
      title="Integration Manager"
      description="External APIs, webhooks, retries, mappings and integration health."
      action={
        <Button
          variant="primary"
          icon={Plus}
        >
          Add integration
        </Button>
      }
      cards={[
        {
          title:
            'Supabase',
          text:
            'Database, authentication and Edge Functions.',
          icon:
            Database,
          status:
            'active',
        },
        {
          title:
            'Vercel',
          text:
            'Production deployment and serverless APIs.',
          icon:
            Cloud,
          status:
            'active',
        },
        {
          title:
            'WhatsApp',
          text:
            'Customer communication provider integration.',
          icon:
            MessageSquare,
          status:
            'planned',
        },
        {
          title:
            'GPS Provider',
          text:
            'Vehicle tracking provider integration.',
          icon:
            Network,
          status:
            'planned',
        },
      ]}
    />
  );
}

function FeatureFlagsSection() {
  const { pathname } = useLocation();
  const defaults = {
    flags: [
      {
        id: 'new-company-shell',
        name: 'New Company Workspace Shell',
        scope: 'Demo + Internal',
        enabled: true,
      },
      {
        id: 'epod-v2',
        name: 'ePOD V2 Workflow',
        scope: 'Selected companies',
        enabled: true,
      },
      {
        id: 'toll-beta',
        name: 'Automated Toll Beta',
        scope: 'Beta companies',
        enabled: false,
      },
    ],
  };

  const { payload, save, saving } =
    useDeveloperControlPlane(`route:${String(pathname || '/').toLowerCase()}`, defaults);

  const flags = Array.isArray(payload?.flags) ? payload.flags : defaults.flags;

  async function toggleFlag(flagId) {
    if (saving) return;
    await save({
      ...payload,
      flags: flags.map((item) =>
        item.id === flagId ? { ...item, enabled: !item.enabled } : item
      ),
    });
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Release Control"
        title="Feature flags"
        description="Controlled staged releases for selected users or companies."
        actions={
          <Button
            variant="primary"
            icon={Plus}
          >
            Create flag
          </Button>
        }
      />

      <Card>
        <CardHeader title="Feature flags" />

        <div className="divide-y divide-slate-200">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between gap-4 px-4 py-4"
            >
              <div>
                <div className="text-[11px] font-semibold text-[var(--bf-dev-text)]">
                  {flag.name}
                </div>
                <div className="mt-1 font-mono text-[9px] text-[var(--bf-dev-text-3)]">
                  {flag.id}
                </div>
                <div className="mt-1 text-[9px] text-[var(--bf-dev-text-2)]">
                  Scope: {flag.scope}
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => toggleFlag(flag.id)}
                className={cx(
                  'relative h-6 w-11 rounded-full transition disabled:opacity-50',
                  flag.enabled
                    ? 'bg-emerald-500/100'
                    : 'bg-[var(--bf-dev-surface-3)]'
                )}
              >
                <span
                  className={cx(
                    'absolute top-1 h-4 w-4 rounded-full bg-[var(--bf-dev-surface)] shadow transition',
                    flag.enabled ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

function SecuritySection() {
  return (
    <GenericCardsPage
      eyebrow="Security Center"
      title="Platform security control"
      description="Authentication, sessions, MFA, account locks and privileged access."
      action={
        <Button
          icon={
            RefreshCcw
          }
        >
          Recheck
        </Button>
      }
      cards={[
        {
          title:
            'Central secure login',
          text:
            'Server-controlled authentication and portal destination.',
          icon:
            LockKeyhole,
          status:
            'active',
        },
        {
          title:
            'MFA / TOTP gateway',
          text:
            'Optional AAL2 verification for protected accounts.',
          icon:
            KeyRound,
          status:
            'active',
        },
        {
          title:
            'HttpOnly portal sessions',
          text:
            'Secure host-only browser session architecture.',
          icon:
            ShieldCheck,
          status:
            'active',
        },
        {
          title: 'Account lock protection',
          text: 'Automatic protection against repeated login failures.',
          icon: ShieldAlert,
          status: 'active',
        },
        {
          title: 'Session inventory',
          text: 'Review active developer, team and company portal sessions and revoke access.',
          icon: MonitorCog,
          status: 'active',
        },
        {
          title: 'Privileged access',
          text: 'Strict authorization boundary for Super Admin and high-risk operations.',
          icon: UserCog,
          status: 'active',
        },
        {
          title: 'Security events',
          text: 'Authentication anomalies, lockouts, session changes and sensitive actions.',
          icon: Bell,
          status: 'active',
        },
      ]}
    />
  );
}

function AuditSection() {
  const { pathname } = useLocation();
  const defaults = { rows: AUDIT };
  const { payload } =
    useDeveloperControlPlane(`route:${String(pathname || '/').toLowerCase()}`, defaults);
  const rows = Array.isArray(payload?.rows) ? payload.rows : AUDIT;

  return (
    <Page>
      <PageHeader
        eyebrow="Audit Trail"
        title="Critical action history"
        description="Trace important platform changes and privileged actions."
        actions={<Button icon={FileText}>Export log</Button>}
      />

      <Card>
        <CardHeader title="Audit events" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[var(--bf-dev-surface-2)] text-[9px] font-bold uppercase text-[var(--bf-dev-text-3)]">
              <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Severity</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.time}-${row.action}`} className="border-t border-[var(--bf-dev-border)] text-[10px]">
                  <td className="px-4 py-3.5 text-[var(--bf-dev-text-3)]">{row.time}</td>
                  <td className="px-4 py-3.5 font-semibold text-[var(--bf-dev-text-2)]">{row.actor}</td>
                  <td className="px-4 py-3.5 font-semibold text-[var(--bf-dev-text)]">{row.action}</td>
                  <td className="px-4 py-3.5 text-[var(--bf-dev-text-2)]">{row.target}</td>
                  <td className="px-4 py-3.5"><Status status={row.severity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

function InfrastructureSection() {
  return (
    <GenericCardsPage
      eyebrow="Infrastructure"
      title="System health & environments"
      description="Production services, deployments, database and platform health."
      action={
        <Button
          icon={
            RefreshCcw
          }
        >
          Refresh health
        </Button>
      }
      cards={[
        {
          title:
            'Main Website',
          text:
            'buddyfleets.in',
          icon:
            Globe2,
          status:
            'active',
        },
        {
          title:
            'Developer Portal',
          text:
            'developer.buddyfleets.in',
          icon:
            TerminalSquare,
          status:
            'active',
        },
        {
          title:
            'Secure Login',
          text:
            'Supabase Edge Function',
          icon:
            ShieldCheck,
          status:
            'active',
        },
        {
          title:
            'Vercel APIs',
          text:
            'Production serverless API layer',
          icon:
            ServerCog,
          status:
            'active',
        },
      ]}
    />
  );
}

function SettingsSection() {
  return (
    <GenericCardsPage
      eyebrow="System Settings"
      title="Global platform configuration"
      description="Central Super Admin defaults, policies, notifications and API behavior."
      cards={[
        {
          title:
            'Platform identity',
          text:
            'Brand, legal name, support contacts and global defaults.',
          icon:
            Globe2,
        },
        {
          title:
            'Tenant defaults',
          text:
            'Timezone, currency, date format and numbering.',
          icon:
            SlidersHorizontal,
        },
        {
          title:
            'Security policy',
          text:
            'Session duration, locks, MFA defaults and re-auth.',
          icon:
            ShieldCheck,
        },
        {
          title:
            'Notification center',
          text:
            'Email, SMS, WhatsApp and in-app templates.',
          icon:
            Bell,
        },
        {
          title:
            'Data retention',
          text:
            'Archive, deletion, export and privacy policy.',
          icon:
            Database,
        },
        {
          title: 'API platform',
          text: 'Versioning, idempotency, rate limits and external access.',
          icon: Cable,
        },
        {
          title: 'Environment controls',
          text: 'Production, staging and development configuration boundaries.',
          icon: ServerCog,
        },
        {
          title: 'Maintenance mode',
          text: 'Controlled maintenance windows, portal notices and emergency restrictions.',
          icon: Wrench,
        },
        {
          title: 'Backup & recovery',
          text: 'Backup visibility, restore readiness, recovery policy and verification.',
          icon: Database,
        },
      ]}
    />
  );
}

const SECTION_PATHS = {
  overview:
    '/dashboard',
  activity:
    '/activity',
  'website-studio':
    '/website',
  'content-seo':
    '/website/seo',
  enquiries:
    '/website/enquiries',
  companies:
    '/saas-platform/companies',
  entitlements:
    '/saas-platform/plans-entitlements',
  modules:
    '/saas-platform/module-registry',
  team:
    '/saas-platform/team-roles',
  'module-builder':
    '/developer-studio/module-builder',
  'workflow-builder':
    '/developer-studio/workflow-builder',
  integrations:
    '/developer-studio/integrations',
  'feature-flags':
    '/developer-studio/feature-flags',
  security:
    '/security-system/security-center',
  audit:
    '/security-system/audit-logs',
  infrastructure:
    '/security-system/infrastructure',
  settings:
    '/security-system/system-settings',
};

function useSectionNavigate() {
  const navigate =
    useNavigate();

  return (
    sectionId
  ) => {
    navigate(
      SECTION_PATHS[
        sectionId
      ] ||
        '/dashboard'
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
}

export function DeveloperOverviewPage() {
  const onNavigate =
    useSectionNavigate();

  return (
    <OverviewSection
      onNavigate={
        onNavigate
      }
    />
  );
}

export function DeveloperActivityPage() {
  return <LiveActivitySection />;
}

export function DeveloperWebsiteStudioPage() {
  const {
    pathname,
  } = useLocation();

  if (
    pathname.endsWith(
      '/page-builder'
    )
  ) {
    return <PageBuilderSection />;
  }

  if (
    pathname.endsWith(
      '/media-assets'
    )
  ) {
    return <MediaAssetsSection />;
  }

  if (
    pathname.endsWith(
      '/release-workflow'
    )
  ) {
    return <ReleaseWorkflowSection />;
  }

  return <WebsiteStudioSection />;
}

export function DeveloperContentSeoPage() {
  const {
    pathname,
  } = useLocation();

  if (
    pathname.endsWith(
      '/metadata'
    )
  ) {
    return <MetadataSection />;
  }

  if (
    pathname.endsWith(
      '/indexing'
    )
  ) {
    return <IndexingSection />;
  }

  if (
    pathname.endsWith(
      '/ai-discoverability'
    )
  ) {
    return <AiDiscoverabilitySection />;
  }

  return <ContentSeoSection />;
}

export function DeveloperEnquiriesPage() {
  return <EnquiriesSection />;
}

export function DeveloperCompaniesPage() {
  return <CompaniesSection />;
}

export function DeveloperEntitlementsPage() {
  return <EntitlementsSection />;
}

export function DeveloperModulesPage() {
  return <ModulesSection />;
}

export function DeveloperTeamPage() {
  return <TeamSection />;
}

export function DeveloperModuleBuilderPage() {
  return <ModuleBuilderSection />;
}

export function DeveloperWorkflowBuilderPage() {
  return <WorkflowBuilderSection />;
}

export function DeveloperIntegrationsPage() {
  return <IntegrationsSection />;
}

export function DeveloperFeatureFlagsPage() {
  return <FeatureFlagsSection />;
}

export function DeveloperSecurityPage() {
  return <SecuritySection />;
}

export function DeveloperAuditPage() {
  return <AuditSection />;
}

export function DeveloperInfrastructurePage() {
  return <InfrastructureSection />;
}

export function DeveloperSystemPage() {
  return <SettingsSection />;
}
