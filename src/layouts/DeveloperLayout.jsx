import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  Activity,
  BadgeCheck,
  Bell,
  Blocks,
  Boxes,
  Building2,
  Cable,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileClock,
  Flag,
  Globe2,
  LayoutDashboard,
  LogOut,
  Mail,
  Maximize2,
  Menu,
  MessageSquare,
  Moon,
  PanelsTopLeft,
  Search,
  ServerCog,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  User,
  Users,
  Workflow,
  X,
} from 'lucide-react';

/* ============================================================
   BUDDY FLEETS DEVELOPER CPANEL
   SPLITE-STYLE SHELL — GEOMETRY + WORKFLOW MATCH

   Key principles:
   - Left sidebar workflow mirrors classic premium admin templates:
     brand -> centered profile -> collapsible parent menus -> child links
   - Header is a single horizontal utility bar.
   - Header and sidebar colors can shift independently.
   - Light/Dark affects the content area, not layout geometry.
   - Right drawer provides Recent / Contacts / Settings.
   - Existing secure auth remains outside this component.
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const SIDEBAR_W = 250;
const SIDEBAR_COLLAPSED_W = 72;
const HEADER_H = 66;
const RIGHT_DRAWER_W = 302;

const STORAGE = {
  theme: 'bf_dev_theme',
  primary: 'bf_dev_primary',
  sidebar: 'bf_dev_sidebar_style',
  header: 'bf_dev_header_style',
  collapsed: 'bf_dev_sidebar_collapsed',
  drawerTab: 'bf_dev_drawer_tab',
};

const PRIMARY_PRESETS = [
  {
    id: 'indigo',
    label: 'Indigo',
    value: '#5652DE',
    strong: '#4945CC',
    rgb: '86 82 222',
  },
  {
    id: 'buddy-blue',
    label: 'Buddy Blue',
    value: '#1689E5',
    strong: '#0F73C3',
    rgb: '22 137 229',
  },
  {
    id: 'violet',
    label: 'Violet',
    value: '#7C3AED',
    strong: '#6D28D9',
    rgb: '124 58 237',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    value: '#0891B2',
    strong: '#0E7490',
    rgb: '8 145 178',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    value: '#059669',
    strong: '#047857',
    rgb: '5 150 105',
  },
  {
    id: 'orange',
    label: 'Orange',
    value: '#EA580C',
    strong: '#C2410C',
    rgb: '234 88 12',
  },
];


/* ============================================================
   SIDEBAR TREE
============================================================ */

const MENU_TREE = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    children: [
      {
        label: 'Overview',
        to: '/dashboard',
        end: true,
      },
      {
        label: 'Live Activity',
        to: '/activity',
      },
    ],
  },

  {
    id: 'website',
    label: 'Website',
    icon: Globe2,
    children: [
      {
        label: 'Website Studio',
        to: '/website',
        end: true,
      },
      {
        label: 'Content & SEO',
        to: '/website/seo',
      },
      {
        label: 'Website Enquiries',
        to: '/website/enquiries',
      },
    ],
  },

  {
    id: 'platform',
    label: 'SaaS Platform',
    icon: Building2,
    children: [
      {
        label: 'Companies',
        to: '/companies',
      },
      {
        label: 'Plans & Entitlements',
        to: '/subscriptions',
      },
      {
        label: 'Module Registry',
        to: '/modules',
      },
      {
        label: 'Team & Roles',
        to: '/team',
      },
    ],
  },

  {
    id: 'studio',
    label: 'Developer Studio',
    icon: Blocks,
    children: [
      {
        label: 'Module Builder',
        to: '/developer-studio',
        end: true,
      },
      {
        label: 'Workflow Builder',
        to: '/developer-studio/workflows',
      },
      {
        label: 'Integrations',
        to: '/integrations',
      },
      {
        label: 'Feature Flags',
        to: '/feature-flags',
      },
    ],
  },

  {
    id: 'security',
    label: 'Security & System',
    icon: ShieldCheck,
    children: [
      {
        label: 'Security Center',
        to: '/security',
      },
      {
        label: 'Audit Logs',
        to: '/audit',
      },
      {
        label: 'Infrastructure',
        to: '/infrastructure',
      },
      {
        label: 'System Settings',
        to: '/system',
      },
    ],
  },
];


/* ============================================================
   MOCK SHELL CONTENT
============================================================ */

const RECENT = [
  {
    title: 'Security policy updated',
    text: 'Developer security defaults reviewed.',
    time: '14:20',
    icon: ShieldCheck,
  },
  {
    title: 'Company access changed',
    text: 'Plan entitlement configuration updated.',
    time: '13:10',
    icon: BadgeCheck,
  },
  {
    title: 'Website publish completed',
    text: 'Public website deployment finished.',
    time: '11:48',
    icon: Globe2,
  },
  {
    title: 'Audit export generated',
    text: 'Admin activity export is available.',
    time: '09:20',
    icon: FileClock,
  },
];

const CONTACTS = [
  {
    name: 'Platform Owner',
    role: 'Super Admin',
    state: 'online',
    initials: 'PO',
  },
  {
    name: 'Support Admin',
    role: 'Customer Support',
    state: 'online',
    initials: 'SA',
  },
  {
    name: 'Sales Admin',
    role: 'Sales',
    state: 'away',
    initials: 'SA',
  },
  {
    name: 'Operations',
    role: 'Platform Team',
    state: 'offline',
    initials: 'OP',
  },
];

const MESSAGES = [
  {
    name: 'Platform Support',
    text: 'New company onboarding request is ready for review.',
    time: '12 min',
    initials: 'PS',
  },
  {
    name: 'Sales Team',
    text: 'Enterprise plan enquiry moved to technical review.',
    time: '1 hr',
    initials: 'ST',
  },
  {
    name: 'System Bot',
    text: 'Deployment checklist completed successfully.',
    time: '3 hr',
    initials: 'SB',
  },
  {
    name: 'Website Lead',
    text: 'New website enquiry has been assigned.',
    time: 'Today',
    initials: 'WL',
  },
];

const NOTIFICATIONS = [
  {
    title: 'Secure session verified',
    meta: 'Developer portal · 8 minutes ago',
    icon: ShieldCheck,
  },
  {
    title: 'New company created',
    meta: 'Tenant provisioning · 42 minutes ago',
    icon: Building2,
  },
  {
    title: 'Trial expiry approaching',
    meta: '1 company · 5 hours ago',
    icon: Flag,
  },
  {
    title: 'Module rollout updated',
    meta: 'Feature flags · Today',
    icon: Boxes,
  },
];


/* ============================================================
   HELPERS
============================================================ */

function cx(...items) {
  return items.filter(Boolean).join(' ');
}

function readStorage(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // UI preference persistence is non-critical.
  }
}

function getInitials(value) {
  const text = String(value || '').trim();

  if (!text) {
    return 'SA';
  }

  const parts = text.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function pathIsInside(pathname, menu) {
  return menu.children.some((child) => {
    if (child.end) {
      return pathname === child.to;
    }

    return (
      pathname === child.to ||
      pathname.startsWith(`${child.to}/`)
    );
  });
}

function buildVars({
  theme,
  primaryId,
  sidebarStyle,
  headerStyle,
}) {
  const primary =
    PRIMARY_PRESETS.find(
      (item) => item.id === primaryId
    ) || PRIMARY_PRESETS[0];

  const dark = theme === 'dark';

  let sidebarBg = dark ? '#1B2737' : '#FFFFFF';
  let sidebarText = dark ? '#F1F5F9' : '#66748A';
  let sidebarMuted = dark ? '#8D9DB2' : '#94A3B8';
  let sidebarBorder = dark ? '#2B3A4E' : '#E4E9F0';

  if (sidebarStyle === 'dark') {
    sidebarBg = '#1B2737';
    sidebarText = '#F1F5F9';
    sidebarMuted = '#8D9DB2';
    sidebarBorder = '#2B3A4E';
  }

  if (sidebarStyle === 'light') {
    sidebarBg = '#FFFFFF';
    sidebarText = '#66748A';
    sidebarMuted = '#94A3B8';
    sidebarBorder = '#E4E9F0';
  }

  if (sidebarStyle === 'color') {
    sidebarBg = primary.strong;
    sidebarText = '#FFFFFF';
    sidebarMuted = 'rgba(255,255,255,.70)';
    sidebarBorder = 'rgba(255,255,255,.14)';
  }

  if (sidebarStyle === 'gradient') {
    sidebarBg = `linear-gradient(180deg, ${primary.strong} 0%, #1B2737 100%)`;
    sidebarText = '#FFFFFF';
    sidebarMuted = 'rgba(255,255,255,.70)';
    sidebarBorder = 'rgba(255,255,255,.14)';
  }

  let headerBg = primary.value;
  let headerText = '#FFFFFF';
  let headerMuted = 'rgba(255,255,255,.80)';
  let headerBorder = 'rgba(255,255,255,.16)';

  if (headerStyle === 'light') {
    headerBg = '#FFFFFF';
    headerText = '#334155';
    headerMuted = '#64748B';
    headerBorder = '#E4E9F0';
  }

  if (headerStyle === 'dark') {
    headerBg = '#1B2737';
    headerText = '#FFFFFF';
    headerMuted = '#AAB5C4';
    headerBorder = '#2B3A4E';
  }

  if (headerStyle === 'color') {
    headerBg = primary.value;
    headerText = '#FFFFFF';
    headerMuted = 'rgba(255,255,255,.80)';
    headerBorder = 'rgba(255,255,255,.16)';
  }

  if (headerStyle === 'gradient') {
    headerBg = `linear-gradient(90deg, ${primary.strong}, ${primary.value})`;
    headerText = '#FFFFFF';
    headerMuted = 'rgba(255,255,255,.80)';
    headerBorder = 'rgba(255,255,255,.16)';
  }

  return {
    '--bf-primary': primary.value,
    '--bf-primary-strong': primary.strong,
    '--bf-primary-rgb': primary.rgb,

    '--bf-page':
      dark
        ? '#101827'
        : '#F1F3F7',

    '--bf-surface':
      dark
        ? '#1B2737'
        : '#FFFFFF',

    '--bf-surface-2':
      dark
        ? '#162131'
        : '#F8FAFC',

    '--bf-surface-3':
      dark
        ? '#243145'
        : '#EEF2F7',

    '--bf-text':
      dark
        ? '#EAF1F8'
        : '#1F2937',

    '--bf-text-2':
      dark
        ? '#A5B2C4'
        : '#64748B',

    '--bf-text-3':
      dark
        ? '#76869C'
        : '#94A3B8',

    '--bf-border':
      dark
        ? '#2C3A4D'
        : '#E1E7EF',

    '--bf-sidebar-bg':
      sidebarBg,

    '--bf-sidebar-text':
      sidebarText,

    '--bf-sidebar-muted':
      sidebarMuted,

    '--bf-sidebar-border':
      sidebarBorder,

    '--bf-header-bg':
      headerBg,

    '--bf-header-text':
      headerText,

    '--bf-header-muted':
      headerMuted,

    '--bf-header-border':
      headerBorder,

    '--bf-sidebar-width':
      `${SIDEBAR_W}px`,

    '--bf-sidebar-collapsed':
      `${SIDEBAR_COLLAPSED_W}px`,

    '--bf-header-height':
      `${HEADER_H}px`,

    '--bf-drawer-width':
      `${RIGHT_DRAWER_W}px`,
  };
}


/* ============================================================
   GLOBAL STYLE
============================================================ */

function GlobalStyle() {
  return (
    <style>
      {`
        .bf-dev-shell,
        .bf-dev-shell * {
          box-sizing: border-box;
        }

        .bf-dev-shell {
          min-height: 100dvh;
          background: var(--bf-page);
          color: var(--bf-text);
        }

        .bf-dev-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgb(var(--bf-primary-rgb) / .35) transparent;
        }

        .bf-dev-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .bf-dev-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgb(var(--bf-primary-rgb) / .32);
        }

        .bf-dev-pop {
          animation: bfDevPop .12s ease-out;
        }

        @keyframes bfDevPop {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}
    </style>
  );
}


/* ============================================================
   BRAND
============================================================ */

function Brand({
  collapsed,
}) {
  return (
    <div
      className={cx(
        'flex min-w-0 items-center',
        collapsed
          ? 'justify-center'
          : 'gap-3'
      )}
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
          bg-gradient-to-br
          from-sky-500
          to-emerald-500
          text-[12px]
          font-black
          text-white
        "
      >
        BF
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <div
            className="
              truncate
              text-[19px]
              font-black
              tracking-[-0.03em]
              text-[var(--bf-sidebar-text)]
            "
          >
            Buddy Fleets
          </div>

          <div
            className="
              mt-0.5
              text-[8px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-[var(--bf-sidebar-muted)]
            "
          >
            Developer CPanel
          </div>
        </div>
      )}
    </div>
  );
}


/* ============================================================
   SIDEBAR PARENT ITEM
============================================================ */

function ParentMenuItem({
  menu,
  expanded,
  onToggle,
  collapsed,
  active,
}) {
  const Icon = menu.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      title={
        collapsed
          ? menu.label
          : undefined
      }
      className={cx(
        `
          group
          relative
          flex
          h-[44px]
          w-full
          items-center
          rounded-md
          text-[13px]
          font-medium
          transition
          duration-150
        `,
        collapsed
          ? 'justify-center'
          : 'gap-3 px-3',
        active
          ? 'text-[var(--bf-primary)]'
          : 'text-[var(--bf-sidebar-text)] hover:bg-[rgb(var(--bf-primary-rgb)/.06)]'
      )}
    >
      <Icon
        size={17}
        className={cx(
          'shrink-0',
          active
            ? 'text-[var(--bf-primary)]'
            : 'text-[var(--bf-sidebar-muted)]'
        )}
      />

      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left">
            {menu.label}
          </span>

          <ChevronDown
            size={13}
            className={cx(
              'shrink-0 text-[var(--bf-sidebar-muted)] transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </>
      )}
    </button>
  );
}


/* ============================================================
   SIDEBAR CHILD LINK
============================================================ */

function ChildLink({
  child,
  collapsed,
}) {
  return (
    <NavLink
      to={child.to}
      end={child.end}
      className={({ isActive }) =>
        cx(
          `
            relative
            flex
            min-h-[33px]
            items-center
            text-[12px]
            transition
            duration-150
          `,
          collapsed
            ? 'justify-center'
            : 'pl-[38px] pr-2',
          isActive
            ? 'font-semibold text-[var(--bf-primary)]'
            : 'text-[var(--bf-sidebar-text)] hover:text-[var(--bf-primary)]'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cx(
              `
                absolute
                h-[5px]
                w-[5px]
                rounded-full
                border
              `,
              collapsed
                ? 'left-1/2 -translate-x-1/2'
                : 'left-[18px]',
              isActive
                ? 'border-[var(--bf-primary)] bg-[var(--bf-primary)]'
                : 'border-[var(--bf-sidebar-muted)]'
            )}
          />

          {!collapsed && (
            <span className="truncate">
              {child.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}


/* ============================================================
   SIDEBAR
============================================================ */

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const location = useLocation();

  const initialExpanded = useMemo(() => {
    const result = {};

    MENU_TREE.forEach((menu) => {
      result[menu.id] =
        pathIsInside(
          location.pathname,
          menu
        );
    });

    return result;
  }, []);

  const [
    expanded,
    setExpanded,
  ] =
    useState(
      initialExpanded
    );

  useEffect(() => {
    MENU_TREE.forEach((menu) => {
      if (
        pathIsInside(
          location.pathname,
          menu
        )
      ) {
        setExpanded(
          (prev) => ({
            ...prev,
            [menu.id]: true,
          })
        );
      }
    });

    setMobileOpen(false);
  }, [
    location.pathname,
    setMobileOpen,
  ]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setMobileOpen(false)
          }
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/45
            lg:hidden
          "
        />
      )}

      <aside
        className={cx(
          `
            fixed
            inset-y-0
            left-0
            z-50
            flex
            flex-col
            border-r
            border-[var(--bf-sidebar-border)]
            bg-[var(--bf-sidebar-bg)]
            transition-[width,transform]
            duration-200
            ease-out
          `,
          collapsed
            ? 'lg:w-[var(--bf-sidebar-collapsed)]'
            : 'lg:w-[var(--bf-sidebar-width)]',
          mobileOpen
            ? 'w-[var(--bf-sidebar-width)] translate-x-0'
            : 'w-[var(--bf-sidebar-width)] -translate-x-full lg:translate-x-0'
        )}
      >
        <div
          className={cx(
            `
              flex
              h-[var(--bf-header-height)]
              shrink-0
              items-center
              border-b
              border-[var(--bf-sidebar-border)]
            `,
            collapsed
              ? 'justify-center px-2'
              : 'px-5'
          )}
        >
          <Brand
            collapsed={
              collapsed
            }
          />
        </div>

        {!collapsed && (
          <div
            className="
              shrink-0
              border-b
              border-[var(--bf-sidebar-border)]
              py-7
              text-center
            "
          >
            <div
              className="
                relative
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border
                border-[var(--bf-sidebar-border)]
                bg-[rgb(var(--bf-primary-rgb)/.10)]
                text-[13px]
                font-black
                text-[var(--bf-primary)]
              "
            >
              SA

              <span
                className="
                  absolute
                  right-1
                  top-1
                  h-3
                  w-3
                  rounded-full
                  border-2
                  border-[var(--bf-sidebar-bg)]
                  bg-emerald-500
                "
              />
            </div>

            <div
              className="
                mt-3
                text-[13px]
                font-bold
                text-[var(--bf-sidebar-text)]
              "
            >
              Super Admin
            </div>

            <div
              className="
                mt-0.5
                text-[10px]
                text-[var(--bf-sidebar-muted)]
              "
            >
              Platform Developer
            </div>
          </div>
        )}

        <nav
          className="
            bf-dev-scroll
            flex-1
            overflow-y-auto
            px-3
            py-4
          "
        >
          <div className="space-y-1">
            {MENU_TREE.map(
              (menu) => {
                const active =
                  pathIsInside(
                    location.pathname,
                    menu
                  );

                const isExpanded =
                  expanded[
                    menu.id
                  ];

                return (
                  <div key={menu.id}>
                    <ParentMenuItem
                      menu={menu}
                      collapsed={
                        collapsed
                      }
                      expanded={
                        isExpanded
                      }
                      active={
                        active
                      }
                      onToggle={() =>
                        setExpanded(
                          (prev) => ({
                            ...prev,
                            [menu.id]:
                              !prev[
                                menu.id
                              ],
                          })
                        )
                      }
                    />

                    {!collapsed &&
                      isExpanded && (
                      <div
                        className="
                          mb-1
                          mt-0.5
                        "
                      >
                        {menu.children.map(
                          (child) => (
                            <ChildLink
                              key={
                                child.to
                              }
                              child={
                                child
                              }
                              collapsed={
                                false
                              }
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </nav>

        <div
          className="
            shrink-0
            border-t
            border-[var(--bf-sidebar-border)]
            p-3
          "
        >
          <button
            type="button"
            onClick={() =>
              setCollapsed(
                (prev) =>
                  !prev
              )
            }
            className={cx(
              `
                hidden
                h-9
                w-full
                items-center
                rounded-md
                text-[11px]
                font-semibold
                text-[var(--bf-sidebar-muted)]
                transition
                hover:bg-[rgb(var(--bf-primary-rgb)/.06)]
                hover:text-[var(--bf-sidebar-text)]
                lg:flex
              `,
              collapsed
                ? 'justify-center'
                : 'justify-between px-3'
            )}
          >
            {!collapsed && (
              <span>
                Collapse sidebar
              </span>
            )}

            {collapsed ? (
              <ChevronRight
                size={14}
              />
            ) : (
              <ChevronLeft
                size={14}
              />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}


/* ============================================================
   HEADER ICON
============================================================ */

function HeaderIcon({
  label,
  children,
  onClick,
  badge,
  active,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        `
          relative
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-md
          text-[var(--bf-header-muted)]
          transition
          duration-150
          hover:bg-black/10
          hover:text-[var(--bf-header-text)]
        `,
        active &&
          'bg-black/10 text-[var(--bf-header-text)]'
      )}
    >
      {children}

      {badge != null && (
        <span
          className="
            absolute
            -right-0.5
            -top-0.5
            min-w-[15px]
            rounded-full
            bg-rose-500
            px-1
            text-center
            text-[8px]
            font-bold
            leading-[15px]
            text-white
          "
        >
          {badge}
        </span>
      )}
    </button>
  );
}


/* ============================================================
   HEADER POPOVER SHELL
============================================================ */

function Popover({
  children,
  width,
}) {
  return (
    <div
      className="
        bf-dev-pop
        absolute
        right-0
        top-[calc(100%+8px)]
        z-[80]
        overflow-hidden
        rounded-md
        border
        border-[var(--bf-border)]
        bg-[var(--bf-surface)]
        shadow-2xl
      "
      style={{
        width,
        maxWidth:
          'calc(100vw - 24px)',
      }}
    >
      {children}
    </div>
  );
}


/* ============================================================
   MESSAGES POPOVER
============================================================ */

function MessagesPopover() {
  return (
    <Popover
      width={385}
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[var(--bf-border)]
          px-4
          py-3
        "
      >
        <div
          className="
            text-[12px]
            font-bold
            text-[var(--bf-text)]
          "
        >
          New Messages
        </div>

        <button
          type="button"
          className="
            rounded-full
            bg-[rgb(var(--bf-primary-rgb)/.12)]
            px-2
            py-1
            text-[8px]
            font-bold
            text-[var(--bf-primary)]
          "
        >
          Mark all as read
        </button>
      </div>

      <div
        className="
          max-h-[330px]
          overflow-y-auto
        "
      >
        {MESSAGES.map(
          (item) => (
            <div
              key={
                item.name
              }
              className="
                flex
                gap-3
                border-b
                border-[var(--bf-border)]
                px-4
                py-3
              "
            >
              <div
                className="
                  relative
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[rgb(var(--bf-primary-rgb)/.12)]
                  text-[10px]
                  font-black
                  text-[var(--bf-primary)]
                "
              >
                {item.initials}

                <span
                  className="
                    absolute
                    bottom-0
                    right-0
                    h-2.5
                    w-2.5
                    rounded-full
                    border-2
                    border-[var(--bf-surface)]
                    bg-emerald-500
                  "
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
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-bold
                      text-[var(--bf-text)]
                    "
                  >
                    {item.name}
                  </span>

                  <span
                    className="
                      shrink-0
                      text-[9px]
                      text-[var(--bf-text-3)]
                    "
                  >
                    {item.time}
                  </span>
                </div>

                <div
                  className="
                    mt-1
                    text-[10px]
                    leading-5
                    text-[var(--bf-text-2)]
                  "
                >
                  {item.text}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="p-3">
        <button
          type="button"
          className="
            h-10
            w-full
            rounded-md
            bg-[var(--bf-primary)]
            text-[11px]
            font-bold
            text-white
          "
        >
          View All
        </button>
      </div>
    </Popover>
  );
}


/* ============================================================
   NOTIFICATIONS POPOVER
============================================================ */

function NotificationsPopover() {
  return (
    <Popover
      width={330}
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[var(--bf-border)]
          px-4
          py-3
        "
      >
        <div
          className="
            text-[12px]
            font-bold
            text-[var(--bf-text)]
          "
        >
          Notifications
        </div>

        <button
          type="button"
          className="
            rounded-full
            bg-[rgb(var(--bf-primary-rgb)/.12)]
            px-2
            py-1
            text-[8px]
            font-bold
            text-[var(--bf-primary)]
          "
        >
          Mark all as read
        </button>
      </div>

      {NOTIFICATIONS.map(
        (item) => {
          const Icon =
            item.icon;

          return (
            <div
              key={
                item.title
              }
              className="
                flex
                items-center
                gap-3
                border-b
                border-[var(--bf-border)]
                px-4
                py-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-[rgb(var(--bf-primary-rgb)/.12)]
                  text-[var(--bf-primary)]
                "
              >
                <Icon
                  size={15}
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
                    text-[11px]
                    font-semibold
                    text-[var(--bf-text)]
                  "
                >
                  {item.title}
                </div>

                <div
                  className="
                    mt-1
                    text-[9px]
                    text-[var(--bf-text-3)]
                  "
                >
                  {item.meta}
                </div>
              </div>

              <X
                size={13}
                className="
                  text-[var(--bf-text-3)]
                "
              />
            </div>
          );
        }
      )}

      <div className="p-3">
        <button
          type="button"
          className="
            h-10
            w-full
            rounded-md
            bg-[var(--bf-primary)]
            text-[11px]
            font-bold
            text-white
          "
        >
          View All
        </button>
      </div>
    </Popover>
  );
}


/* ============================================================
   PROFILE POPOVER
============================================================ */

function ProfilePopover({
  currentUser,
  onLogout,
}) {
  const name =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email?.split('@')[0] ||
    'Super Admin';

  return (
    <Popover
      width={250}
    >
      <div
        className="
          border-b
          border-[var(--bf-border)]
          p-4
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-[rgb(var(--bf-primary-rgb)/.12)]
            text-[12px]
            font-black
            text-[var(--bf-primary)]
          "
        >
          {getInitials(name)}
        </div>

        <div
          className="
            mt-2
            text-[13px]
            font-bold
            text-[var(--bf-text)]
          "
        >
          {name}
        </div>

        <div
          className="
            mt-0.5
            text-[9px]
            text-[var(--bf-text-3)]
          "
        >
          SUPER_ADMIN
        </div>
      </div>

      <div className="p-2">
        {[
          ['Profile', User],
          ['Settings', Settings],
          ['Security', ShieldCheck],
          ['Activity', Activity],
        ].map(
          ([label, Icon]) => (
            <button
              key={label}
              type="button"
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-md
                px-3
                py-2.5
                text-[11px]
                text-[var(--bf-text-2)]
                hover:bg-[rgb(var(--bf-primary-rgb)/.06)]
              "
            >
              <Icon
                size={14}
                className="
                  text-[var(--bf-primary)]
                "
              />

              {label}
            </button>
          )
        )}

        <div
          className="
            my-1
            border-t
            border-[var(--bf-border)]
          "
        />

        <button
          type="button"
          onClick={
            onLogout
          }
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-md
            px-3
            py-2.5
            text-[11px]
            font-semibold
            text-rose-500
            hover:bg-rose-500/10
          "
        >
          <LogOut
            size={14}
          />

          Sign out
        </button>
      </div>
    </Popover>
  );
}


/* ============================================================
   HEADER
============================================================ */

function Header({
  collapsed,
  setCollapsed,
  setMobileOpen,
  currentUser,
  onLogout,
  theme,
  setTheme,
  openPopover,
  setOpenPopover,
  drawerOpen,
  setDrawerOpen,
}) {
  const rootRef =
    useRef(null);

  useEffect(() => {
    if (!openPopover) {
      return undefined;
    }

    const outside = (
      event
    ) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target
        )
      ) {
        setOpenPopover(null);
      }
    };

    const esc = (
      event
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        setOpenPopover(null);
      }
    };

    document.addEventListener(
      'mousedown',
      outside
    );

    document.addEventListener(
      'keydown',
      esc
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        outside
      );

      document.removeEventListener(
        'keydown',
        esc
      );
    };
  }, [
    openPopover,
    setOpenPopover,
  ]);

  const name =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email?.split('@')[0] ||
    'Super Admin';

  const togglePopover =
    (id) => {
      setDrawerOpen(false);

      setOpenPopover(
        (current) =>
          current === id
            ? null
            : id
      );
    };

  return (
    <header
      className={cx(
        `
          fixed
          right-0
          top-0
          z-30
          h-[var(--bf-header-height)]
          border-b
          border-[var(--bf-header-border)]
          bg-[var(--bf-header-bg)]
          transition-[left]
          duration-200
        `,
        collapsed
          ? 'left-0 lg:left-[var(--bf-sidebar-collapsed)]'
          : 'left-0 lg:left-[var(--bf-sidebar-width)]'
      )}
    >
      <div
        ref={rootRef}
        className="
          flex
          h-full
          items-center
          px-4
        "
      >
        <HeaderIcon
          label="Toggle menu"
          onClick={() => {
            if (
              window.innerWidth <
              1024
            ) {
              setMobileOpen(true);
            } else {
              setCollapsed(
                (prev) =>
                  !prev
              );
            }
          }}
        >
          <Menu size={18} />
        </HeaderIcon>

        <div
          className="
            ml-4
            hidden
            items-center
            gap-1.5
            text-[11px]
            font-semibold
            text-[var(--bf-header-text)]
            md:flex
          "
        >
          <span>
            Developer
          </span>

          <ChevronDown
            size={12}
            className="
              text-[var(--bf-header-muted)]
            "
          />
        </div>

        <div
          className="
            ml-auto
            flex
            items-center
            gap-1
          "
        >
          <HeaderIcon
            label="Fullscreen"
          >
            <Maximize2
              size={17}
            />
          </HeaderIcon>

          <HeaderIcon
            label="Theme"
            onClick={() =>
              setTheme(
                theme === 'dark'
                  ? 'light'
                  : 'dark'
              )
            }
          >
            {theme === 'dark' ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </HeaderIcon>

          <HeaderIcon
            label="Search"
          >
            <Search size={18} />
          </HeaderIcon>

          <div className="relative">
            <HeaderIcon
              label="Notifications"
              badge={4}
              active={
                openPopover ===
                'notifications'
              }
              onClick={() =>
                togglePopover(
                  'notifications'
                )
              }
            >
              <Bell size={18} />
            </HeaderIcon>

            {openPopover ===
              'notifications' && (
              <NotificationsPopover />
            )}
          </div>

          <div className="relative">
            <HeaderIcon
              label="Messages"
              badge={3}
              active={
                openPopover ===
                'messages'
              }
              onClick={() =>
                togglePopover(
                  'messages'
                )
              }
            >
              <Mail size={18} />
            </HeaderIcon>

            {openPopover ===
              'messages' && (
              <MessagesPopover />
            )}
          </div>

          <div className="relative ml-1">
            <button
              type="button"
              onClick={() =>
                togglePopover(
                  'profile'
                )
              }
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-md
                px-1.5
                text-[var(--bf-header-text)]
                hover:bg-black/10
              "
            >
              <div
                className="
                  hidden
                  max-w-[150px]
                  text-right
                  xl:block
                "
              >
                <div
                  className="
                    truncate
                    text-[11px]
                    font-semibold
                  "
                >
                  {name}
                </div>

                <div
                  className="
                    mt-0.5
                    text-[8px]
                    text-[var(--bf-header-muted)]
                  "
                >
                  SUPER_ADMIN
                </div>
              </div>

              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/20
                  bg-white/15
                  text-[9px]
                  font-black
                  text-white
                "
              >
                {getInitials(name)}
              </div>

              <ChevronDown
                size={12}
                className="
                  hidden
                  text-[var(--bf-header-muted)]
                  xl:block
                "
              />
            </button>

            {openPopover ===
              'profile' && (
              <ProfilePopover
                currentUser={
                  currentUser
                }
                onLogout={
                  onLogout
                }
              />
            )}
          </div>

          <HeaderIcon
            label="Open customizer"
            active={
              drawerOpen
            }
            onClick={() => {
              setOpenPopover(null);

              setDrawerOpen(
                (prev) =>
                  !prev
              );
            }}
          >
            <Settings
              size={18}
            />
          </HeaderIcon>
        </div>
      </div>
    </header>
  );
}


/* ============================================================
   TOGGLE
============================================================ */

function Switch({
  value,
  onChange,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() =>
        onChange(!value)
      }
      className={cx(
        `
          relative
          h-[22px]
          w-[38px]
          rounded-full
          transition
        `,
        value
          ? 'bg-[var(--bf-primary)]'
          : 'bg-[var(--bf-surface-3)]'
      )}
    >
      <span
        className={cx(
          `
            absolute
            top-[3px]
            h-4
            w-4
            rounded-full
            bg-white
            shadow
            transition
          `,
          value
            ? 'left-[19px]'
            : 'left-[3px]'
        )}
      />
    </button>
  );
}


/* ============================================================
   RIGHT DRAWER SETTINGS ROW
============================================================ */

function SettingRow({
  label,
  selected,
  onClick,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        px-4
        py-2.5
      "
    >
      <span
        className="
          text-[11px]
          text-[var(--bf-text-2)]
        "
      >
        {label}
      </span>

      <Switch
        value={
          selected
        }
        onChange={
          onClick
        }
      />
    </div>
  );
}

function SectionTitle({
  children,
}) {
  return (
    <div
      className="
        border-y
        border-[var(--bf-border)]
        bg-[var(--bf-surface-2)]
        px-4
        py-2.5
        text-[10px]
        font-bold
        uppercase
        tracking-[0.06em]
        text-[var(--bf-text-2)]
      "
    >
      {children}
    </div>
  );
}


/* ============================================================
   RIGHT DRAWER TABS
============================================================ */

function RecentTab() {
  return (
    <div>
      {RECENT.map(
        (item) => {
          const Icon =
            item.icon;

          return (
            <div
              key={
                item.title
              }
              className="
                flex
                gap-3
                border-b
                border-[var(--bf-border)]
                px-4
                py-4
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[rgb(var(--bf-primary-rgb)/.12)]
                  text-[var(--bf-primary)]
                "
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-semibold
                      text-[var(--bf-text)]
                    "
                  >
                    {item.title}
                  </span>

                  <span
                    className="
                      text-[9px]
                      text-[var(--bf-text-3)]
                    "
                  >
                    {item.time}
                  </span>
                </div>

                <div
                  className="
                    mt-1
                    text-[10px]
                    leading-5
                    text-[var(--bf-text-2)]
                  "
                >
                  {item.text}
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}

function ContactsTab() {
  return (
    <div>
      {CONTACTS.map(
        (item) => (
          <div
            key={
              item.name
            }
            className="
              flex
              items-center
              gap-3
              border-b
              border-[var(--bf-border)]
              px-4
              py-3.5
            "
          >
            <div
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[rgb(var(--bf-primary-rgb)/.12)]
                text-[10px]
                font-black
                text-[var(--bf-primary)]
              "
            >
              {item.initials}

              <span
                className={cx(
                  `
                    absolute
                    bottom-0
                    right-0
                    h-2.5
                    w-2.5
                    rounded-full
                    border-2
                    border-[var(--bf-surface)]
                  `,
                  item.state ===
                    'online'
                    ? 'bg-emerald-500'
                    : item.state ===
                        'away'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div
                className="
                  text-[11px]
                  font-semibold
                  text-[var(--bf-text)]
                "
              >
                {item.name}
              </div>

              <div
                className="
                  mt-0.5
                  text-[9px]
                  text-[var(--bf-text-3)]
                "
              >
                {item.role}
              </div>
            </div>

            <MessageSquare
              size={15}
              className="
                text-[var(--bf-text-3)]
              "
            />
          </div>
        )
      )}
    </div>
  );
}

function SettingsTab({
  theme,
  setTheme,
  primaryId,
  setPrimaryId,
  sidebarStyle,
  setSidebarStyle,
  headerStyle,
  setHeaderStyle,
}) {
  return (
    <div className="pb-6">
      <SectionTitle>
        Theme Style
      </SectionTitle>

      <SettingRow
        label="Light Theme"
        selected={
          theme === 'light'
        }
        onClick={() =>
          setTheme('light')
        }
      />

      <SettingRow
        label="Dark Theme"
        selected={
          theme === 'dark'
        }
        onClick={() =>
          setTheme('dark')
        }
      />

      <SectionTitle>
        Theme Colors
      </SectionTitle>

      <div className="px-4 py-4">
        <div
          className="
            text-[11px]
            text-[var(--bf-text-2)]
          "
        >
          Theme Primary
        </div>

        <div
          className="
            mt-3
            grid
            grid-cols-6
            gap-2
          "
        >
          {PRIMARY_PRESETS.map(
            (preset) => (
              <button
                key={
                  preset.id
                }
                type="button"
                title={
                  preset.label
                }
                onClick={() =>
                  setPrimaryId(
                    preset.id
                  )
                }
                className={cx(
                  `
                    relative
                    h-8
                    rounded-md
                    border
                    border-[var(--bf-border)]
                  `,
                  primaryId ===
                    preset.id &&
                    'ring-2 ring-[var(--bf-primary)]'
                )}
                style={{
                  background:
                    preset.value,
                }}
              >
                {primaryId ===
                  preset.id && (
                  <Check
                    size={13}
                    className="
                      absolute
                      left-1/2
                      top-1/2
                      -translate-x-1/2
                      -translate-y-1/2
                      text-white
                    "
                  />
                )}
              </button>
            )
          )}
        </div>
      </div>

      <SectionTitle>
        Menu Styles
      </SectionTitle>

      {[
        ['light', 'Light Menu'],
        ['color', 'Color Menu'],
        ['dark', 'Dark Menu'],
        ['gradient', 'Gradient Menu'],
      ].map(
        ([id, label]) => (
          <SettingRow
            key={id}
            label={label}
            selected={
              sidebarStyle ===
              id
            }
            onClick={() =>
              setSidebarStyle(
                id
              )
            }
          />
        )
      )}

      <SectionTitle>
        Header Styles
      </SectionTitle>

      {[
        ['light', 'Light Header'],
        ['color', 'Color Header'],
        ['dark', 'Dark Header'],
        ['gradient', 'Gradient Header'],
      ].map(
        ([id, label]) => (
          <SettingRow
            key={id}
            label={label}
            selected={
              headerStyle ===
              id
            }
            onClick={() =>
              setHeaderStyle(
                id
              )
            }
          />
        )
      )}
    </div>
  );
}


/* ============================================================
   RIGHT DRAWER
============================================================ */

function RightDrawer({
  open,
  onClose,
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  primaryId,
  setPrimaryId,
  sidebarStyle,
  setSidebarStyle,
  headerStyle,
  setHeaderStyle,
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close drawer overlay"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/20
            lg:hidden
          "
        />
      )}

      <aside
        className={cx(
          `
            fixed
            bottom-0
            right-0
            top-0
            z-[70]
            w-[var(--bf-drawer-width)]
            border-l
            border-[var(--bf-border)]
            bg-[var(--bf-surface)]
            shadow-[-18px_0_40px_rgba(0,0,0,.14)]
            transition-transform
            duration-200
          `,
          open
            ? 'translate-x-0'
            : 'translate-x-full'
        )}
      >
        <div
          className="
            flex
            h-[var(--bf-header-height)]
            items-center
            border-b
            border-[var(--bf-border)]
          "
        >
          {[
            ['recent', 'Recent'],
            ['contacts', 'Contacts'],
            ['settings', 'Settings'],
          ].map(
            ([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setActiveTab(id)
                }
                className={cx(
                  `
                    relative
                    flex
                    h-full
                    flex-1
                    items-center
                    justify-center
                    text-[11px]
                    font-semibold
                  `,
                  activeTab ===
                    id
                    ? 'text-[var(--bf-primary)]'
                    : 'text-[var(--bf-text-2)]'
                )}
              >
                {label}

                {activeTab ===
                  id && (
                  <span
                    className="
                      absolute
                      bottom-0
                      left-4
                      right-4
                      h-[2px]
                      bg-[var(--bf-primary)]
                    "
                  />
                )}
              </button>
            )
          )}

          <button
            type="button"
            onClick={onClose}
            className="
              mr-2
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              text-[var(--bf-text-3)]
              hover:bg-[rgb(var(--bf-primary-rgb)/.06)]
            "
          >
            <X size={15} />
          </button>
        </div>

        <div
          className="
            bf-dev-scroll
            h-[calc(100dvh-var(--bf-header-height))]
            overflow-y-auto
          "
        >
          {activeTab ===
            'recent' && (
            <RecentTab />
          )}

          {activeTab ===
            'contacts' && (
            <ContactsTab />
          )}

          {activeTab ===
            'settings' && (
            <SettingsTab
              theme={
                theme
              }
              setTheme={
                setTheme
              }
              primaryId={
                primaryId
              }
              setPrimaryId={
                setPrimaryId
              }
              sidebarStyle={
                sidebarStyle
              }
              setSidebarStyle={
                setSidebarStyle
              }
              headerStyle={
                headerStyle
              }
              setHeaderStyle={
                setHeaderStyle
              }
            />
          )}
        </div>
      </aside>
    </>
  );
}


/* ============================================================
   ROOT
============================================================ */

export default function DeveloperLayout({
  currentUser,
  onLogout,
}) {
  const [
    theme,
    setTheme,
  ] =
    useState(
      () =>
        readStorage(
          STORAGE.theme,
          'dark'
        )
    );

  const [
    primaryId,
    setPrimaryId,
  ] =
    useState(
      () =>
        readStorage(
          STORAGE.primary,
          'indigo'
        )
    );

  const [
    sidebarStyle,
    setSidebarStyle,
  ] =
    useState(
      () =>
        readStorage(
          STORAGE.sidebar,
          'dark'
        )
    );

  const [
    headerStyle,
    setHeaderStyle,
  ] =
    useState(
      () =>
        readStorage(
          STORAGE.header,
          'color'
        )
    );

  const [
    collapsed,
    setCollapsed,
  ] =
    useState(
      () =>
        readStorage(
          STORAGE.collapsed,
          'false'
        ) === 'true'
    );

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  const [
    openPopover,
    setOpenPopover,
  ] =
    useState(null);

  const [
    drawerOpen,
    setDrawerOpen,
  ] =
    useState(false);

  const [
    drawerTab,
    setDrawerTab,
  ] =
    useState(
      () =>
        readStorage(
          STORAGE.drawerTab,
          'settings'
        )
    );

  const vars =
    useMemo(
      () =>
        buildVars({
          theme,
          primaryId,
          sidebarStyle,
          headerStyle,
        }),
      [
        theme,
        primaryId,
        sidebarStyle,
        headerStyle,
      ]
    );

  useEffect(() => {
    writeStorage(
      STORAGE.theme,
      theme
    );

    writeStorage(
      STORAGE.primary,
      primaryId
    );

    writeStorage(
      STORAGE.sidebar,
      sidebarStyle
    );

    writeStorage(
      STORAGE.header,
      headerStyle
    );

    writeStorage(
      STORAGE.collapsed,
      collapsed
    );

    writeStorage(
      STORAGE.drawerTab,
      drawerTab
    );

    document.documentElement.style.colorScheme =
      theme;
  }, [
    theme,
    primaryId,
    sidebarStyle,
    headerStyle,
    collapsed,
    drawerTab,
  ]);

  return (
    <>
      <GlobalStyle />

      <div
        className="
          bf-dev-shell
          min-h-screen
          min-h-[100dvh]
          font-sans
        "
        style={vars}
      >
        <Sidebar
          collapsed={
            collapsed
          }
          setCollapsed={
            setCollapsed
          }
          mobileOpen={
            mobileOpen
          }
          setMobileOpen={
            setMobileOpen
          }
        />

        <Header
          collapsed={
            collapsed
          }
          setCollapsed={
            setCollapsed
          }
          setMobileOpen={
            setMobileOpen
          }
          currentUser={
            currentUser
          }
          onLogout={
            onLogout
          }
          theme={
            theme
          }
          setTheme={
            setTheme
          }
          openPopover={
            openPopover
          }
          setOpenPopover={
            setOpenPopover
          }
          drawerOpen={
            drawerOpen
          }
          setDrawerOpen={
            setDrawerOpen
          }
        />

        <RightDrawer
          open={
            drawerOpen
          }
          onClose={() =>
            setDrawerOpen(false)
          }
          activeTab={
            drawerTab
          }
          setActiveTab={
            setDrawerTab
          }
          theme={
            theme
          }
          setTheme={
            setTheme
          }
          primaryId={
            primaryId
          }
          setPrimaryId={
            setPrimaryId
          }
          sidebarStyle={
            sidebarStyle
          }
          setSidebarStyle={
            setSidebarStyle
          }
          headerStyle={
            headerStyle
          }
          setHeaderStyle={
            setHeaderStyle
          }
        />

        <main
          className={cx(
            `
              min-h-[100dvh]
              pt-[var(--bf-header-height)]
              transition-[padding-left]
              duration-200
            `,
            collapsed
              ? 'lg:pl-[var(--bf-sidebar-collapsed)]'
              : 'lg:pl-[var(--bf-sidebar-width)]'
          )}
        >
          <div
            className="
              min-h-[calc(100dvh-var(--bf-header-height))]
              bg-[var(--bf-page)]
            "
          >
            <Outlet
              context={{
                currentUser,
                onLogout,
                theme,
                primaryId,
                sidebarStyle,
                headerStyle,
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}
