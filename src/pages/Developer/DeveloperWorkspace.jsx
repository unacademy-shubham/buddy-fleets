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
  useNavigate,
} from 'react-router-dom';

/* ============================================================
   BUDDY FLEETS
   DEVELOPER WORKSPACE — SPLITE-INSPIRED MULTI-THEME CPANEL UI

   Theme-neutral Buddy Fleets content.
   Visual tokens are supplied by DeveloperLayout.jsx.
   All page exports are preserved for App.jsx routing.
============================================================ */

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
];

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
    <div
      className="
        bf-dev-workspace
        space-y-5
        text-[var(--bf-dev-text)]
      "
    >
      {children}
    </div>
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
        relative
        overflow-hidden
        rounded-[var(--bf-dev-card-radius)]
        border
        border-[rgb(var(--bf-dev-primary-rgb)/.20)]
        bg-[var(--bf-dev-primary)]
        px-5
        py-5
        text-white
        shadow-[var(--bf-dev-shadow)]
        sm:px-6
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-20
          h-48
          w-48
          rounded-full
          bg-white/10
          blur-2xl
        "
      />

      <div
        className="
          relative
          z-[1]
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div className="min-w-0">
          {eyebrow && (
            <div
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.16em]
                text-white/70
              "
            >
              {eyebrow}
            </div>
          )}

          <h1
            className="
              mt-1.5
              text-[25px]
              font-extrabold
              tracking-[-0.025em]
              text-white
              sm:text-[29px]
            "
          >
            {title}
          </h1>

          {description && (
            <p
              className="
                mt-1.5
                max-w-4xl
                text-[11px]
                leading-5
                text-white/75
              "
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div
            className="
              flex
              shrink-0
              flex-wrap
              items-center
              gap-2
            "
          >
            {actions}
          </div>
        )}
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
          rounded-[var(--bf-dev-card-radius)]
          border
          border-[var(--bf-dev-border)]
          bg-[var(--bf-dev-surface)]
          shadow-[var(--bf-dev-shadow)]
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
}) {
  const styles = {
    default:
      'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]',
    primary:
      'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white hover:bg-[var(--bf-dev-primary-strong)]',
    success:
      'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600',
    danger:
      'border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        `
          inline-flex
          min-h-[36px]
          items-center
          justify-center
          gap-2
          rounded-[var(--bf-dev-radius)]
          border
          px-3
          py-2
          text-[10px]
          font-semibold
          transition
          duration-150
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.35)]
        `,
        styles[variant]
      )}
    >
      {Icon && (
        <Icon
          size={14}
        />
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

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent = 'blue',
}) {
  const accentStyles = {
    blue:
      'bg-[rgb(var(--bf-dev-primary-rgb)/.11)] text-[var(--bf-dev-primary)]',
    green:
      'bg-emerald-500/10 text-emerald-500',
    violet:
      'bg-violet-500/10 text-violet-500',
    amber:
      'bg-amber-500/10 text-amber-500',
  };

  return (
    <Card className="p-4">
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <div
            className="
              text-[10px]
              font-semibold
              text-[var(--bf-dev-text-2)]
            "
          >
            {label}
          </div>

          <div
            className="
              mt-1.5
              truncate
              text-[25px]
              font-extrabold
              tracking-[-0.03em]
              text-[var(--bf-dev-text)]
            "
          >
            {value}
          </div>

          <div
            className="
              mt-1.5
              text-[9px]
              leading-4
              text-[var(--bf-dev-text-3)]
            "
          >
            {note}
          </div>
        </div>

        <div
          className={cx(
            `
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-[9px]
            `,
            accentStyles[accent]
          )}
        >
          <Icon size={18} />
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
        items-center
        justify-between
        gap-3
        border-b
        border-[var(--bf-dev-border)]
        px-4
        py-3.5
      "
    >
      <div>
        <div
          className="
            text-[12px]
            font-bold
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

function OverviewSection({
  onNavigate,
}) {
  return (
    <Page>
      <PageHeader
        eyebrow="Developer Control Center"
        title="Platform overview"
        description="Central view of Buddy Fleets companies, users, platform modules, security and operational activity."
        actions={
          <Button
            icon={RefreshCcw}
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
  return (
    <Page>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={
          description
        }
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
            title:
              cardTitle,
            text,
            icon: Icon,
            status,
          }) => (
            <Card
              key={
                cardTitle
              }
              className="
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
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    bg-[rgb(var(--bf-dev-primary-rgb)/.10)]
                    text-[var(--bf-dev-primary)]
                  "
                >
                  <Icon
                    size={17}
                  />
                </div>

                {status && (
                  <Status
                    status={
                      status
                    }
                  />
                )}
              </div>

              <div
                className="
                  mt-4
                  text-[12px]
                  font-bold
                  text-[var(--bf-dev-text)]
                "
              >
                {cardTitle}
              </div>

              <div
                className="
                  mt-1.5
                  text-[10px]
                  leading-5
                  text-[var(--bf-dev-text-2)]
                "
              >
                {text}
              </div>

              <div
                className="
                  mt-4
                "
              >
                <Button
                  icon={
                    SlidersHorizontal
                  }
                >
                  Configure
                </Button>
              </div>
            </Card>
          )
        )}
      </div>
    </Page>
  );
}

function LiveActivitySection() {
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
            <div
              className="
                flex
                items-center
                gap-2
                text-[9px]
                font-bold
                text-emerald-500
              "
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500/100
                "
              />
              LIVE
            </div>
          }
        />

        <div>
          {AUDIT.map(
            (row) => (
              <div
                key={`${row.time}-${row.action}`}
                className="
                  grid
                  gap-3
                  border-t
                  border-[var(--bf-dev-border)]
                  px-4
                  py-4
                  text-[10px]
                  sm:grid-cols-[90px_140px_1fr_150px]
                "
              >
                <div
                  className="
                    text-[var(--bf-dev-text-3)]
                  "
                >
                  {row.time}
                </div>

                <div
                  className="
                    font-semibold
                    text-[var(--bf-dev-text-2)]
                  "
                >
                  {row.actor}
                </div>

                <div>
                  <div
                    className="
                      font-semibold
                      text-[var(--bf-dev-text)]
                    "
                  >
                    {row.action}
                  </div>

                  <div
                    className="
                      mt-1
                      text-[var(--bf-dev-text-3)]
                    "
                  >
                    {row.target}
                  </div>
                </div>

                <div
                  className="
                    sm:text-right
                  "
                >
                  <Status
                    status={
                      row.severity
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      </Card>
    </Page>
  );
}

function WebsiteStudioSection() {
  return (
    <Page>
      <PageHeader
        eyebrow="Website Studio"
        title="Public website control"
        description="Manage Buddy Fleets website content through a safe draft, preview and publish workflow."
        actions={
          <>
            <Button
              icon={
                MonitorCog
              }
            >
              Preview
            </Button>

            <Button
              variant="primary"
              icon={Rocket}
            >
              Publish changes
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
            title="Pages"
            action={
              <Button
                icon={Plus}
              >
                Page
              </Button>
            }
          />

          <div
            className="
              space-y-1
              p-2.5
            "
          >
            {WEBSITE_PAGES.map(
              (page) => (
                <div
                  key={
                    page.path
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    px-3
                    py-3
                  "
                >
                  <div>
                    <div
                      className="
                        text-[11px]
                        font-semibold
                        text-[var(--bf-dev-text)]
                      "
                    >
                      {page.name}
                    </div>

                    <div
                      className="
                        mt-0.5
                        text-[9px]
                        text-[var(--bf-dev-text-3)]
                      "
                    >
                      {page.path}
                    </div>
                  </div>

                  <Status
                    status={
                      page.status
                    }
                  />
                </div>
              )
            )}
          </div>
        </Card>

        <div
          className="
            space-y-4
          "
        >
          <Card>
            <CardHeader
              title="Visual content workspace"
              subtitle="Code-backed pages with controlled metadata configuration"
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
                [
                  'Hero',
                  'Headline, CTA and media',
                  AppWindow,
                ],
                [
                  'Feature Blocks',
                  'Cards and product modules',
                  Blocks,
                ],
                [
                  'Trust & Proof',
                  'Stats and testimonials',
                  BadgeCheck,
                ],
                [
                  'Pricing',
                  'Plans and offers',
                  Gauge,
                ],
                [
                  'CTA Sections',
                  'Conversion content',
                  Rocket,
                ],
                [
                  'Footer & Legal',
                  'Navigation and policies',
                  FileText,
                ],
              ].map(
                ([
                  title,
                  text,
                  Icon,
                ]) => (
                  <button
                    key={
                      title
                    }
                    type="button"
                    className="
                      rounded-lg
                      border
                      border-[var(--bf-dev-border)]
                      bg-[var(--bf-dev-surface)]
                      p-4
                      text-left
                      hover:bg-[var(--bf-dev-surface-2)]
                    "
                  >
                    <Icon
                      size={17}
                      className="
                        text-[var(--bf-dev-primary)]
                      "
                    />

                    <div
                      className="
                        mt-3
                        text-[11px]
                        font-bold
                        text-[var(--bf-dev-text)]
                      "
                    >
                      {title}
                    </div>

                    <div
                      className="
                        mt-1
                        text-[10px]
                        text-[var(--bf-dev-text-2)]
                      "
                    >
                      {text}
                    </div>
                  </button>
                )
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Release workflow"
            />

            <div
              className="
                grid
                gap-3
                p-4
                sm:grid-cols-4
              "
            >
              {[
                'Draft',
                'Preview',
                'Publish',
                'Rollback',
              ].map(
                (
                  step,
                  index
                ) => (
                  <div
                    key={step}
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
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-[rgb(var(--bf-dev-primary-rgb)/.14)]
                        text-[10px]
                        font-bold
                        text-[var(--bf-dev-primary)]
                      "
                    >
                      {index + 1}
                    </div>

                    <div
                      className="
                        mt-3
                        text-[11px]
                        font-bold
                        text-[var(--bf-dev-text)]
                      "
                    >
                      {step}
                    </div>
                  </div>
                )
              )}
            </div>
          </Card>
        </div>
      </div>
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

function EnquiriesSection() {
  return (
    <Page>
      <PageHeader
        eyebrow="Website Enquiries"
        title="Inbound lead inbox"
        description="Website contact submissions, demo interest and public enquiries."
        actions={
          <Button
            variant="primary"
            icon={Plus}
          >
            New enquiry
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Current enquiries"
        />

        <div
          className="
            divide-y
            divide-slate-200
          "
        >
          {[
            [
              'Fleet Demo Request',
              'Apex Transport',
              'Product Demo',
              'New',
            ],
            [
              'Pricing enquiry',
              'Raj Roadlines',
              'Pricing',
              'Open',
            ],
            [
              'Enterprise onboarding',
              'Western Cargo',
              'Enterprise',
              'Follow-up',
            ],
          ].map(
            ([
              subject,
              company,
              type,
              status,
            ]) => (
              <div
                key={
                  subject
                }
                className="
                  grid
                  gap-3
                  px-4
                  py-4
                  text-[10px]
                  sm:grid-cols-[1fr_180px_140px_100px]
                  sm:items-center
                "
              >
                <div>
                  <div
                    className="
                      font-semibold
                      text-[var(--bf-dev-text)]
                    "
                  >
                    {subject}
                  </div>

                  <div
                    className="
                      mt-1
                      text-[var(--bf-dev-text-3)]
                    "
                  >
                    {company}
                  </div>
                </div>

                <div
                  className="
                    text-[var(--bf-dev-text-2)]
                  "
                >
                  {type}
                </div>

                <Status
                  status={
                    status === 'New'
                      ? 'trial'
                      : 'active'
                  }
                />

                <Button>
                  Open
                </Button>
              </div>
            )
          )}
        </div>
      </Card>
    </Page>
  );
}

function CompaniesSection() {
  const [
    query,
    setQuery,
  ] =
    useState('');

  const [
    showCreate,
    setShowCreate,
  ] =
    useState(false);

  const filtered =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      if (!q) {
        return COMPANIES;
      }

      return COMPANIES.filter(
        (company) =>
          `${company.name} ${company.slug} ${company.plan} ${company.status}`
            .toLowerCase()
            .includes(q)
      );
    }, [
      query,
    ]);

  return (
    <Page>
      <PageHeader
        eyebrow="SaaS Platform"
        title="Company management"
        description="Create, inspect and manage Buddy Fleets customer tenants."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() =>
              setShowCreate(
                true
              )
            }
          >
            Create company
          </Button>
        }
      />

      <Card
        className="
          p-3
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              relative
              max-w-md
              flex-1
            "
          >
            <Search
              size={14}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[var(--bf-dev-text-3)]
              "
            />

            <input
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search company, slug, plan..."
              className="
                h-9
                w-full
                rounded-lg
                border
                border-[var(--bf-dev-border)]
                bg-[var(--bf-dev-surface)]
                pl-9
                pr-3
                text-[11px]
                text-[var(--bf-dev-text)]
                outline-none
                placeholder:text-[var(--bf-dev-text-3)]
                focus:border-[var(--bf-dev-primary)]
              "
            />
          </div>

          <div
            className="
              text-[10px]
              text-[var(--bf-dev-text-3)]
            "
          >
            {filtered.length} companies
          </div>
        </div>
      </Card>

      <div
        className="
          grid
          gap-4
          xl:grid-cols-2
        "
      >
        {filtered.map(
          (company) => (
            <Card
              key={
                company.id
              }
              className="
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
                    items-start
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-[rgb(var(--bf-dev-primary-rgb)/.10)]
                      text-[var(--bf-dev-primary)]
                    "
                  >
                    <Building2
                      size={17}
                    />
                  </div>

                  <div>
                    <div
                      className="
                        text-[12px]
                        font-bold
                        text-[var(--bf-dev-text)]
                      "
                    >
                      {company.name}
                    </div>

                    <div
                      className="
                        mt-1
                        text-[9px]
                        text-[var(--bf-dev-primary)]
                      "
                    >
                      portal.buddyfleets.in/{company.slug}
                    </div>
                  </div>
                </div>

                <Status
                  status={
                    company.status
                  }
                />
              </div>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-2
                  sm:grid-cols-4
                "
              >
                {[
                  [
                    'Plan',
                    company.plan,
                  ],
                  [
                    'Users',
                    company.users,
                  ],
                  [
                    'Vehicles',
                    company.vehicles,
                  ],
                  [
                    'Modules',
                    company.modules,
                  ],
                ].map(
                  ([
                    label,
                    value,
                  ]) => (
                    <div
                      key={
                        label
                      }
                      className="
                        rounded-lg
                        border
                        border-[var(--bf-dev-border)]
                        bg-[var(--bf-dev-surface-2)]
                        p-3
                      "
                    >
                      <div
                        className="
                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.08em]
                          text-[var(--bf-dev-text-3)]
                        "
                      >
                        {label}
                      </div>

                      <div
                        className="
                          mt-1
                          text-[11px]
                          font-bold
                          text-[var(--bf-dev-text)]
                        "
                      >
                        {value}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-3
                  border-t
                  border-[var(--bf-dev-border)]
                  pt-4
                "
              >
                <div
                  className="
                    text-[9px]
                    text-[var(--bf-dev-text-3)]
                  "
                >
                  Renewal: {company.renewal}
                </div>

                <div
                  className="
                    flex
                    gap-2
                  "
                >
                  <Button
                    icon={
                      UserCog
                    }
                  >
                    Manage
                  </Button>

                  <Button
                    variant="danger"
                    icon={
                      LockKeyhole
                    }
                  >
                    Suspend
                  </Button>
                </div>
              </div>
            </Card>
          )
        )}
      </div>

      {showCreate && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/35
            p-4
            backdrop-blur-sm
          "
        >
          <Card
            className="
              w-full
              max-w-lg
              p-5
              shadow-xl
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <div
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-[var(--bf-dev-primary)]
                  "
                >
                  New tenant
                </div>

                <div
                  className="
                    mt-1
                    text-[20px]
                    font-extrabold
                    text-[var(--bf-dev-text)]
                  "
                >
                  Create company
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[var(--bf-dev-border)]
                  text-[var(--bf-dev-text-2)]
                "
              >
                <X
                  size={15}
                />
              </button>
            </div>

            <div
              className="
                mt-4
                space-y-3
              "
            >
              {[
                'Company name',
                'Owner email',
                'Mobile number',
                'Preferred slug',
              ].map(
                (label) => (
                  <label
                    key={
                      label
                    }
                    className="
                      block
                      text-[10px]
                      font-semibold
                      text-[var(--bf-dev-text-2)]
                    "
                  >
                    {label}

                    <input
                      className="
                        mt-1.5
                        h-10
                        w-full
                        rounded-lg
                        border
                        border-[var(--bf-dev-border)]
                        px-3
                        text-[11px]
                        outline-none
                        focus:border-[var(--bf-dev-primary)]
                      "
                    />
                  </label>
                )
              )}
            </div>

            <div
              className="
                mt-5
                flex
                justify-end
                gap-2
              "
            >
              <Button
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                icon={Plus}
              >
                Create draft tenant
              </Button>
            </div>
          </Card>
        </div>
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
          title:
            'Starter',
          text:
            'Core fleet operations with controlled limits and essential modules.',
          icon:
            BadgeCheck,
          status:
            'active',
        },
        {
          title:
            'Growth',
          text:
            'Operations, finance and compliance for growing fleet businesses.',
          icon:
            BadgeCheck,
          status:
            'active',
        },
        {
          title:
            'Enterprise',
          text:
            'Full platform access with advanced controls and custom limits.',
          icon:
            BadgeCheck,
          status:
            'active',
        },
      ]}
    />
  );
}

function ModulesSection() {
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
          >
            Register module
          </Button>
        }
      />

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {MODULES.map(
          (module) => (
            <Card
              key={
                module.id
              }
              className="
                p-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
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
                    bg-violet-500/10
                    text-violet-500
                  "
                >
                  <Boxes
                    size={16}
                  />
                </div>

                <Status
                  status={
                    module.status
                  }
                />
              </div>

              <div
                className="
                  mt-3
                  text-[12px]
                  font-bold
                  text-[var(--bf-dev-text)]
                "
              >
                {module.name}
              </div>

              <div
                className="
                  mt-1
                  font-mono
                  text-[9px]
                  text-[var(--bf-dev-text-3)]
                "
              >
                module_id: {module.id}
              </div>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-2
                "
              >
                <div
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface-2)]
                    p-3
                  "
                >
                  <div
                    className="
                      text-[8px]
                      uppercase
                      text-[var(--bf-dev-text-3)]
                    "
                  >
                    Companies
                  </div>

                  <div
                    className="
                      mt-1
                      text-[12px]
                      font-bold
                    "
                  >
                    {module.companies}
                  </div>
                </div>

                <div
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface-2)]
                    p-3
                  "
                >
                  <div
                    className="
                      text-[8px]
                      uppercase
                      text-[var(--bf-dev-text-3)]
                    "
                  >
                    Features
                  </div>

                  <div
                    className="
                      mt-1
                      text-[12px]
                      font-bold
                    "
                  >
                    {module.features}
                  </div>
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </Page>
  );
}

function TeamSection() {
  return (
    <Page>
      <PageHeader
        eyebrow="Internal Team"
        title="Buddy Fleets team & roles"
        description="Internal staff, roles and portal assignment."
        actions={
          <Button
            variant="primary"
            icon={Plus}
          >
            Invite team member
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Team members"
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
                text-[var(--bf-dev-text-3)]
              "
            >
              <tr>
                <th className="px-4 py-3">
                  User
                </th>
                <th className="px-4 py-3">
                  Role
                </th>
                <th className="px-4 py-3">
                  Portal
                </th>
                <th className="px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {TEAM.map(
                (member) => (
                  <tr
                    key={
                      member.email
                    }
                    className="
                      border-t
                      border-[var(--bf-dev-border)]
                      text-[10px]
                    "
                  >
                    <td
                      className="
                        px-4
                        py-3.5
                      "
                    >
                      <div
                        className="
                          font-semibold
                          text-[var(--bf-dev-text)]
                        "
                      >
                        {member.name}
                      </div>

                      <div
                        className="
                          mt-1
                          text-[var(--bf-dev-text-3)]
                        "
                      >
                        {member.email}
                      </div>
                    </td>

                    <td
                      className="
                        px-4
                        py-3.5
                        font-semibold
                        text-[var(--bf-dev-text-2)]
                      "
                    >
                      {member.role}
                    </td>

                    <td
                      className="
                        px-4
                        py-3.5
                        text-[var(--bf-dev-primary)]
                      "
                    >
                      {member.portal}
                    </td>

                    <td
                      className="
                        px-4
                        py-3.5
                      "
                    >
                      <Status
                        status={
                          member.status
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
  const [
    flags,
    setFlags,
  ] =
    useState([
      {
        id:
          'new-company-shell',
        name:
          'New Company Workspace Shell',
        scope:
          'Demo + Internal',
        enabled:
          true,
      },
      {
        id:
          'epod-v2',
        name:
          'ePOD V2 Workflow',
        scope:
          'Selected companies',
        enabled:
          true,
      },
      {
        id:
          'toll-beta',
        name:
          'Automated Toll Beta',
        scope:
          'Beta companies',
        enabled:
          false,
      },
    ]);

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
        <CardHeader
          title="Feature flags"
        />

        <div
          className="
            divide-y
            divide-slate-200
          "
        >
          {flags.map(
            (flag) => (
              <div
                key={
                  flag.id
                }
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  px-4
                  py-4
                "
              >
                <div>
                  <div
                    className="
                      text-[11px]
                      font-semibold
                      text-[var(--bf-dev-text)]
                    "
                  >
                    {flag.name}
                  </div>

                  <div
                    className="
                      mt-1
                      font-mono
                      text-[9px]
                      text-[var(--bf-dev-text-3)]
                    "
                  >
                    {flag.id}
                  </div>

                  <div
                    className="
                      mt-1
                      text-[9px]
                      text-[var(--bf-dev-text-2)]
                    "
                  >
                    Scope: {flag.scope}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFlags(
                      (current) =>
                        current.map(
                          (
                            item
                          ) =>
                            item.id ===
                            flag.id
                              ? {
                                  ...item,
                                  enabled:
                                    !item.enabled,
                                }
                              : item
                        )
                    )
                  }
                  className={cx(
                    `
                      relative
                      h-6
                      w-11
                      rounded-full
                      transition
                    `,
                    flag.enabled
                      ? 'bg-emerald-500/100'
                      : 'bg-[var(--bf-dev-surface-3)]'
                  )}
                >
                  <span
                    className={cx(
                      `
                        absolute
                        top-1
                        h-4
                        w-4
                        rounded-full
                        bg-[var(--bf-dev-surface)]
                        shadow
                        transition
                      `,
                      flag.enabled
                        ? 'left-6'
                        : 'left-1'
                    )}
                  />
                </button>
              </div>
            )
          )}
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
          title:
            'Account lock protection',
          text:
            'Automatic protection against repeated login failures.',
          icon:
            ShieldAlert,
          status:
            'active',
        },
      ]}
    />
  );
}

function AuditSection() {
  return (
    <Page>
      <PageHeader
        eyebrow="Audit Trail"
        title="Critical action history"
        description="Trace important platform changes and privileged actions."
        actions={
          <Button
            icon={
              FileText
            }
          >
            Export log
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Audit events"
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
                  Severity
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
                    <td className="px-4 py-3.5 text-[var(--bf-dev-text-3)]">
                      {row.time}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--bf-dev-text-2)]">
                      {row.actor}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--bf-dev-text)]">
                      {row.action}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--bf-dev-text-2)]">
                      {row.target}
                    </td>
                    <td className="px-4 py-3.5">
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
          title:
            'API platform',
          text:
            'Versioning, idempotency, rate limits and external access.',
          icon:
            Cable,
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
    '/companies',
  entitlements:
    '/subscriptions',
  modules:
    '/modules',
  team:
    '/team',
  'module-builder':
    '/developer-studio',
  'workflow-builder':
    '/developer-studio/workflows',
  integrations:
    '/integrations',
  'feature-flags':
    '/feature-flags',
  security:
    '/security',
  audit:
    '/audit',
  infrastructure:
    '/infrastructure',
  settings:
    '/system',
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
  return <WebsiteStudioSection />;
}

export function DeveloperContentSeoPage() {
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
