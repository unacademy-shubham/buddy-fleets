import React, { useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Bell,
  Boxes,
  Building2,
  Cable,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  FileClock,
  FileText,
  Flag,
  Gauge,
  KeyRound,
  LockKeyhole,
  MonitorCog,
  Network,
  PanelsTopLeft,
  RefreshCcw,
  Rocket,
  Search,
  ServerCog,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react';


const SAMPLE_ITEMS = [
  {
    title: 'Overview',
    text: 'Control expiry handling, grace period, renewal reminders, suspension behavior and post-expiry access.',
    status: 'active',
  },
  {
    title: 'Configuration',
    text: 'Configure the key settings for this Developer CPanel area.',
    status: 'active',
  },
  {
    title: 'Operational Controls',
    text: 'Review current state, make controlled changes and keep an auditable workflow.',
    status: 'active',
  },
];

function cx(...items) {
  return items.filter(Boolean).join(' ');
}

function Status({ status }) {
  const styles = {
    active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
    planned: 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]',
  };

  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]',
        styles[status] || styles.active
      )}
    >
      {status}
    </span>
  );
}

function Card({ children, className = '' }) {
  return (
    <section
      className={cx(
        'rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_1px_2px_rgba(0,0,0,.04)]',
        className
      )}
    >
      {children}
    </section>
  );
}

export default function RenewalPolicyPage() {
  const [query, setQuery] = useState('');

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_ITEMS;
    return SAMPLE_ITEMS.filter((item) =>
      `${item.title} ${item.text} ${item.status}`.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div
      className="
        min-h-[calc(100dvh-var(--bf-header-height,66px))]
        bg-[var(--bf-dev-page-bg)]
        text-[var(--bf-dev-text)]
      "
    >
      <section
        className="
          bg-[var(--bf-dev-primary)]
          px-6
          pb-8
          pt-6
          text-white
          sm:px-7
          lg:px-8
        "
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[27px] font-semibold tracking-[-0.02em]">
              Renewal Policy
            </h1>
            <p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-white/80">
              Control expiry handling, grace period, renewal reminders, suspension behavior and post-expiry access.
            </p>
          </div>

          <div className="text-[12px] font-medium text-white/80">
            Developer
            <span className="mx-2 text-white/35">/</span>
            <span className="text-white">Renewal Policy</span>
          </div>
        </div>
      </section>

      <div className="-mt-[22px] px-4 pb-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[15px] font-semibold text-[var(--bf-dev-text)]">
                  Renewal Policy
                </div>
                <div className="mt-1 text-[12px] text-[var(--bf-dev-text-2)]">
                  Developer CPanel feature workspace
                </div>
              </div>

              <div className="relative w-full sm:max-w-sm">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bf-dev-text-3)]"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search..."
                  className="
                    h-10
                    w-full
                    rounded-md
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface)]
                    pl-9
                    pr-3
                    text-[13px]
                    text-[var(--bf-dev-text)]
                    outline-none
                    placeholder:text-[var(--bf-dev-text-3)]
                    focus:border-[var(--bf-dev-primary)]
                  "
                />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item, index) => {
              const Icon = [Settings, SlidersHorizontal, ShieldCheck][index % 3];

              return (
                <Card key={item.title} className="p-4">
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

                    <Status status={item.status} />
                  </div>

                  <div className="mt-4 text-[14px] font-bold text-[var(--bf-dev-text)]">
                    {item.title}
                  </div>

                  <div className="mt-1.5 text-[12px] leading-5 text-[var(--bf-dev-text-2)]">
                    {item.text}
                  </div>

                  <button
                    type="button"
                    className="
                      mt-4
                      inline-flex
                      h-9
                      items-center
                      rounded-md
                      border
                      border-[var(--bf-dev-border)]
                      bg-[var(--bf-dev-surface)]
                      px-3
                      text-[12px]
                      font-semibold
                      text-[var(--bf-dev-text-2)]
                      transition
                      hover:bg-[var(--bf-dev-surface-2)]
                      hover:text-[var(--bf-dev-text)]
                    "
                  >
                    Configure
                  </button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
