import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  CircleHelp,
  Command,
  ContactRound,
  FileClock,
  FileText,
  Flag,
  Globe2,
  History,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Monitor,
  Moon,
  MoreHorizontal,
  PanelsTopLeft,
  Search,
  ServerCog,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  User,
  UserCog,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';

/* ============================================================
   BUDDY FLEETS
   DEVELOPER CPANEL — SPLITE-INSPIRED PREMIUM ADMIN SHELL

   File:
   src/layouts/DeveloperLayout.jsx

   IMPORTANT
   ----------------------------------------------------------------
   - Buddy Fleets content + routing only.
   - Visual workflow inspired by premium admin templates.
   - No auth authority is moved to the browser.
   - Existing secure App.jsx / /api/auth/session architecture remains.
   - This component only controls portal UI/chrome.
============================================================ */


/* ============================================================
   STORAGE KEYS
============================================================ */

const STORAGE = {
  theme:
    'buddy_fleets_dev_theme',

  primary:
    'buddy_fleets_dev_primary',

  background:
    'buddy_fleets_dev_background',

  menuStyle:
    'buddy_fleets_dev_menu_style',

  headerStyle:
    'buddy_fleets_dev_header_style',

  sidebarCollapsed:
    'buddy_fleets_dev_sidebar_collapsed',

  rightPanelTab:
    'buddy_fleets_dev_right_panel_tab',

  direction:
    'buddy_fleets_dev_direction',

  compactMode:
    'buddy_fleets_dev_compact_mode',
};


/* ============================================================
   LAYOUT CONSTANTS

   Proportions intentionally kept compact and admin-like.
============================================================ */

const DIMENSIONS = {
  sidebarExpanded:
    250,

  sidebarCollapsed:
    72,

  headerHeight:
    66,

  rightPanelWidth:
    302,

  navItemHeight:
    42,

  sidebarIcon:
    17,

  headerIcon:
    18,
};


/* ============================================================
   PRIMARY COLOR PRESETS
============================================================ */

const PRIMARY_PRESETS = [
  {
    id: 'indigo',
    label: 'Indigo',
    value: '#5553DF',
    strong: '#4845D2',
    soft: '#EEEDFF',
    rgb: '85 83 223',
  },
  {
    id: 'blue',
    label: 'Buddy Blue',
    value: '#0B84D8',
    strong: '#0871BB',
    soft: '#EAF6FE',
    rgb: '11 132 216',
  },
  {
    id: 'violet',
    label: 'Violet',
    value: '#7C3AED',
    strong: '#6D28D9',
    soft: '#F3E8FF',
    rgb: '124 58 237',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    value: '#0891B2',
    strong: '#0E7490',
    soft: '#ECFEFF',
    rgb: '8 145 178',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    value: '#059669',
    strong: '#047857',
    soft: '#ECFDF5',
    rgb: '5 150 105',
  },
  {
    id: 'orange',
    label: 'Orange',
    value: '#EA580C',
    strong: '#C2410C',
    soft: '#FFF7ED',
    rgb: '234 88 12',
  },
  {
    id: 'rose',
    label: 'Rose',
    value: '#E11D48',
    strong: '#BE123C',
    soft: '#FFF1F2',
    rgb: '225 29 72',
  },
];


/* ============================================================
   BACKGROUND PRESETS
============================================================ */

const BACKGROUND_PRESETS = [
  {
    id: 'soft',
    label: 'Soft',
    light: '#F4F6FA',
    dark: '#0F1725',
  },
  {
    id: 'cool',
    label: 'Cool',
    light: '#F1F5F9',
    dark: '#111827',
  },
  {
    id: 'bluegray',
    label: 'Blue Gray',
    light: '#EFF3F8',
    dark: '#101827',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    light: '#F5F5F5',
    dark: '#16181D',
  },
];


/* ============================================================
   LEFT NAVIGATION
============================================================ */

const NAV_GROUPS = [
  {
    label: 'Control Center',

    items: [
      {
        label: 'Overview',
        to: '/dashboard',
        icon: LayoutDashboard,
        end: true,
      },

      {
        label: 'Live Activity',
        to: '/activity',
        icon: Activity,
      },
    ],
  },

  {
    label: 'Website',

    items: [
      {
        label: 'Website Studio',
        to: '/website',
        icon: PanelsTopLeft,
        end: true,
      },

      {
        label: 'Content & SEO',
        to: '/website/seo',
        icon: Globe2,
      },

      {
        label: 'Website Enquiries',
        to: '/website/enquiries',
        icon: MessageSquare,
      },
    ],
  },

  {
    label: 'SaaS Platform',

    items: [
      {
        label: 'Companies',
        to: '/companies',
        icon: Building2,
      },

      {
        label: 'Plans & Entitlements',
        to: '/subscriptions',
        icon: BadgeCheck,
      },

      {
        label: 'Module Registry',
        to: '/modules',
        icon: Boxes,
      },

      {
        label: 'Team & Roles',
        to: '/team',
        icon: Users,
      },
    ],
  },

  {
    label: 'Developer Studio',

    items: [
      {
        label: 'Module Builder',
        to: '/developer-studio',
        icon: Blocks,
        end: true,
      },

      {
        label: 'Workflow Builder',
        to: '/developer-studio/workflows',
        icon: Workflow,
      },

      {
        label: 'Integrations',
        to: '/integrations',
        icon: Cable,
      },

      {
        label: 'Feature Flags',
        to: '/feature-flags',
        icon: Flag,
      },
    ],
  },

  {
    label: 'Security & System',

    items: [
      {
        label: 'Security Center',
        to: '/security',
        icon: ShieldCheck,
      },

      {
        label: 'Audit Logs',
        to: '/audit',
        icon: FileClock,
      },

      {
        label: 'Infrastructure',
        to: '/infrastructure',
        icon: ServerCog,
      },

      {
        label: 'System Settings',
        to: '/system',
        icon: Settings,
      },
    ],
  },
];

const ALL_NAV_ITEMS =
  NAV_GROUPS.flatMap(
    (group) =>
      group.items
  );


/* ============================================================
   HEADER MOCK DATA

   These are UI shell examples only.
   Real API wiring can replace these arrays later.
============================================================ */

const MESSAGE_ITEMS = [
  {
    id: 'm1',
    name: 'Platform Support',
    initials: 'PS',
    text: 'New company onboarding request is ready for review.',
    time: '12 min',
    unread: true,
  },
  {
    id: 'm2',
    name: 'Sales Team',
    initials: 'ST',
    text: 'Enterprise plan enquiry moved to technical review.',
    time: '1 hr',
    unread: true,
  },
  {
    id: 'm3',
    name: 'System Bot',
    initials: 'SB',
    text: 'Deployment checklist completed successfully.',
    time: '3 hr',
    unread: false,
  },
  {
    id: 'm4',
    name: 'Website Lead',
    initials: 'WL',
    text: 'New website enquiry has been assigned.',
    time: 'Today',
    unread: false,
  },
];

const NOTIFICATION_ITEMS = [
  {
    id: 'n1',
    title: 'Secure session verified',
    meta: 'Developer portal · 8 minutes ago',
    icon: ShieldCheck,
    tone: 'success',
  },
  {
    id: 'n2',
    title: 'New company created',
    meta: 'Tenant provisioning · 42 minutes ago',
    icon: Building2,
    tone: 'primary',
  },
  {
    id: 'n3',
    title: 'Trial expiry approaching',
    meta: '1 company · 5 hours ago',
    icon: History,
    tone: 'warning',
  },
  {
    id: 'n4',
    title: 'Module rollout updated',
    meta: 'Feature flags · Today',
    icon: Flag,
    tone: 'violet',
  },
];

const RECENT_ITEMS = [
  {
    id: 'r1',
    title: 'Security policy updated',
    text: 'Developer MFA defaults were reviewed.',
    time: '14:20',
    icon: ShieldCheck,
    tone: 'success',
  },
  {
    id: 'r2',
    title: 'Company access changed',
    text: 'Entitlement configuration updated.',
    time: '13:10',
    icon: BadgeCheck,
    tone: 'primary',
  },
  {
    id: 'r3',
    title: 'Website publish completed',
    text: 'Production website release finished.',
    time: '11:48',
    icon: Globe2,
    tone: 'violet',
  },
  {
    id: 'r4',
    title: 'Audit export generated',
    text: 'Admin activity export is available.',
    time: '09:20',
    icon: FileText,
    tone: 'warning',
  },
];

const CONTACT_ITEMS = [
  {
    id: 'c1',
    name: 'Platform Owner',
    role: 'Super Admin',
    status: 'online',
    initials: 'PO',
  },
  {
    id: 'c2',
    name: 'Support Admin',
    role: 'Customer Support',
    status: 'online',
    initials: 'SA',
  },
  {
    id: 'c3',
    name: 'Sales Admin',
    role: 'Sales Team',
    status: 'away',
    initials: 'SA',
  },
  {
    id: 'c4',
    name: 'Operations',
    role: 'Platform Team',
    status: 'offline',
    initials: 'OP',
  },
];


/* ============================================================
   GENERIC HELPERS
============================================================ */

function cx(
  ...classes
) {
  return classes
    .filter(Boolean)
    .join(' ');
}


function safeReadStorage(
  key,
  fallback = ''
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return fallback;
  }

  try {
    return (
      window.localStorage.getItem(
        key
      ) ?? fallback
    );
  } catch {
    return fallback;
  }
}


function safeWriteStorage(
  key,
  value
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      String(value)
    );
  } catch {
    // Non-critical UI persistence failure.
  }
}


function getInitialTheme() {
  const stored =
    safeReadStorage(
      STORAGE.theme,
      'dark'
    );

  return (
    stored === 'light' ||
    stored === 'dark'
  )
    ? stored
    : 'dark';
}


function getInitialPrimary() {
  const stored =
    safeReadStorage(
      STORAGE.primary,
      'indigo'
    );

  return (
    PRIMARY_PRESETS.some(
      (item) =>
        item.id === stored
    )
  )
    ? stored
    : 'indigo';
}


function getInitialBackground() {
  const stored =
    safeReadStorage(
      STORAGE.background,
      'soft'
    );

  return (
    BACKGROUND_PRESETS.some(
      (item) =>
        item.id === stored
    )
  )
    ? stored
    : 'soft';
}


function getInitialMenuStyle() {
  const stored =
    safeReadStorage(
      STORAGE.menuStyle,
      'dark'
    );

  return [
    'light',
    'dark',
    'color',
    'gradient',
  ].includes(stored)
    ? stored
    : 'dark';
}


function getInitialHeaderStyle() {
  const stored =
    safeReadStorage(
      STORAGE.headerStyle,
      'color'
    );

  return [
    'light',
    'dark',
    'color',
    'gradient',
  ].includes(stored)
    ? stored
    : 'color';
}


function getInitialSidebarCollapsed() {
  return (
    safeReadStorage(
      STORAGE.sidebarCollapsed,
      'false'
    ) === 'true'
  );
}


function getInitialRightTab() {
  const stored =
    safeReadStorage(
      STORAGE.rightPanelTab,
      'recent'
    );

  return [
    'recent',
    'contacts',
    'settings',
  ].includes(stored)
    ? stored
    : 'recent';
}


function getInitialDirection() {
  return (
    safeReadStorage(
      STORAGE.direction,
      'ltr'
    ) === 'rtl'
  )
    ? 'rtl'
    : 'ltr';
}


function getInitialCompactMode() {
  return (
    safeReadStorage(
      STORAGE.compactMode,
      'false'
    ) === 'true'
  );
}


function getPageDetails(
  pathname
) {
  const exact =
    ALL_NAV_ITEMS.find(
      (item) =>
        item.to ===
        pathname
    );

  if (exact) {
    return exact;
  }

  const nested =
    ALL_NAV_ITEMS
      .filter(
        (item) =>
          pathname.startsWith(
            `${item.to}/`
          )
      )
      .sort(
        (a, b) =>
          b.to.length -
          a.to.length
      );

  return (
    nested[0] || {
      label:
        'Developer CPanel',
      icon:
        LayoutDashboard,
    }
  );
}


function getInitials(
  value
) {
  const text =
    String(
      value || ''
    )
      .trim()
      .replace(
        /\s+/g,
        ' '
      );

  if (!text) {
    return 'SA';
  }

  const parts =
    text.split(' ');

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    `${parts[0][0]}${
      parts[
        parts.length - 1
      ][0]
    }`
  ).toUpperCase();
}


/* ============================================================
   THEME TOKEN BUILDER
============================================================ */

function buildThemeTokens({
  theme,
  primaryId,
  backgroundId,
  menuStyle,
  headerStyle,
  compactMode,
}) {
  const primary =
    PRIMARY_PRESETS.find(
      (item) =>
        item.id ===
        primaryId
    ) ||
    PRIMARY_PRESETS[0];

  const background =
    BACKGROUND_PRESETS.find(
      (item) =>
        item.id ===
        backgroundId
    ) ||
    BACKGROUND_PRESETS[0];

  const isDark =
    theme === 'dark';

  const pageBackground =
    isDark
      ? background.dark
      : background.light;

  const darkSurface =
    '#1B2636';

  const darkSurface2 =
    '#121C2B';

  const lightSurface =
    '#FFFFFF';

  const textPrimary =
    isDark
      ? '#EAF1F8'
      : '#1E293B';

  const textSecondary =
    isDark
      ? '#9BAAC0'
      : '#64748B';

  const border =
    isDark
      ? '#2B394B'
      : '#E1E7EF';

  let sidebarBackground =
    isDark
      ? '#1A2636'
      : lightSurface;

  let sidebarText =
    isDark
      ? '#E7EEF8'
      : '#52627A';

  let sidebarMuted =
    isDark
      ? '#8594AA'
      : '#8A98AC';

  let sidebarBorder =
    isDark
      ? '#2A394D'
      : '#E2E8F0';

  if (
    menuStyle ===
    'light'
  ) {
    sidebarBackground =
      '#FFFFFF';

    sidebarText =
      '#52627A';

    sidebarMuted =
      '#8A98AC';

    sidebarBorder =
      '#E2E8F0';
  }

  if (
    menuStyle ===
    'dark'
  ) {
    sidebarBackground =
      '#1A2636';

    sidebarText =
      '#E7EEF8';

    sidebarMuted =
      '#8798AE';

    sidebarBorder =
      '#2A394D';
  }

  if (
    menuStyle ===
    'color'
  ) {
    sidebarBackground =
      primary.strong;

    sidebarText =
      '#FFFFFF';

    sidebarMuted =
      'rgba(255,255,255,.68)';

    sidebarBorder =
      'rgba(255,255,255,.13)';
  }

  if (
    menuStyle ===
    'gradient'
  ) {
    sidebarBackground =
      `linear-gradient(180deg, ${primary.strong} 0%, #1A2636 100%)`;

    sidebarText =
      '#FFFFFF';

    sidebarMuted =
      'rgba(255,255,255,.7)';

    sidebarBorder =
      'rgba(255,255,255,.12)';
  }

  let headerBackground =
    isDark
      ? darkSurface2
      : '#FFFFFF';

  let headerText =
    isDark
      ? '#EDF3FB'
      : '#334155';

  let headerMuted =
    isDark
      ? '#A1B0C4'
      : '#718096';

  let headerBorder =
    border;

  if (
    headerStyle ===
    'light'
  ) {
    headerBackground =
      '#FFFFFF';

    headerText =
      '#334155';

    headerMuted =
      '#718096';

    headerBorder =
      '#E2E8F0';
  }

  if (
    headerStyle ===
    'dark'
  ) {
    headerBackground =
      '#1A2636';

    headerText =
      '#FFFFFF';

    headerMuted =
      '#B5C0CF';

    headerBorder =
      '#2A394D';
  }

  if (
    headerStyle ===
    'color'
  ) {
    headerBackground =
      primary.value;

    headerText =
      '#FFFFFF';

    headerMuted =
      'rgba(255,255,255,.78)';

    headerBorder =
      'rgba(255,255,255,.14)';
  }

  if (
    headerStyle ===
    'gradient'
  ) {
    headerBackground =
      `linear-gradient(90deg, ${primary.strong}, ${primary.value})`;

    headerText =
      '#FFFFFF';

    headerMuted =
      'rgba(255,255,255,.78)';

    headerBorder =
      'rgba(255,255,255,.14)';
  }

  return {
    primary,
    background,
    pageBackground,
    isDark,

    css: {
      '--bf-dev-primary':
        primary.value,

      '--bf-dev-primary-strong':
        primary.strong,

      '--bf-dev-primary-soft':
        primary.soft,

      '--bf-dev-primary-rgb':
        primary.rgb,

      '--bf-dev-page-bg':
        pageBackground,

      '--bf-dev-surface':
        isDark
          ? darkSurface
          : lightSurface,

      '--bf-dev-surface-2':
        isDark
          ? darkSurface2
          : '#F8FAFC',

      '--bf-dev-surface-3':
        isDark
          ? '#202C3D'
          : '#F1F5F9',

      '--bf-dev-text':
        textPrimary,

      '--bf-dev-text-2':
        textSecondary,

      '--bf-dev-text-3':
        isDark
          ? '#748399'
          : '#94A3B8',

      '--bf-dev-border':
        border,

      '--bf-dev-border-soft':
        isDark
          ? '#243247'
          : '#EDF1F6',

      '--bf-dev-success':
        '#22C55E',

      '--bf-dev-warning':
        '#F59E0B',

      '--bf-dev-danger':
        '#EF4444',

      '--bf-dev-violet':
        '#A855F7',

      '--bf-dev-sidebar-bg':
        sidebarBackground,

      '--bf-dev-sidebar-text':
        sidebarText,

      '--bf-dev-sidebar-muted':
        sidebarMuted,

      '--bf-dev-sidebar-border':
        sidebarBorder,

      '--bf-dev-header-bg':
        headerBackground,

      '--bf-dev-header-text':
        headerText,

      '--bf-dev-header-muted':
        headerMuted,

      '--bf-dev-header-border':
        headerBorder,

      '--bf-dev-radius':
        compactMode
          ? '7px'
          : '10px',

      '--bf-dev-card-radius':
        compactMode
          ? '8px'
          : '11px',

      '--bf-dev-shadow':
        isDark
          ? '0 10px 30px rgba(0,0,0,.18)'
          : '0 7px 20px rgba(15,23,42,.07)',

      '--bf-dev-sidebar-expanded':
        `${DIMENSIONS.sidebarExpanded}px`,

      '--bf-dev-sidebar-collapsed':
        `${DIMENSIONS.sidebarCollapsed}px`,

      '--bf-dev-header-height':
        `${DIMENSIONS.headerHeight}px`,

      '--bf-dev-right-panel-width':
        `${DIMENSIONS.rightPanelWidth}px`,
    },
  };
}


/* ============================================================
   GLOBAL CSS
============================================================ */

function DeveloperGlobalStyles() {
  return (
    <style>
      {`
        .bf-dev-root,
        .bf-dev-root * {
          box-sizing: border-box;
        }

        .bf-dev-root {
          background: var(--bf-dev-page-bg);
          color: var(--bf-dev-text);
        }

        .bf-dev-root button,
        .bf-dev-root input,
        .bf-dev-root select,
        .bf-dev-root textarea {
          font: inherit;
        }

        .bf-dev-root ::selection {
          background: rgb(var(--bf-dev-primary-rgb) / .2);
        }

        .bf-dev-scroll {
          scrollbar-width: thin;
          scrollbar-color:
            rgb(var(--bf-dev-primary-rgb) / .35)
            transparent;
        }

        .bf-dev-scroll::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        .bf-dev-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .bf-dev-scroll::-webkit-scrollbar-thumb {
          background: rgb(var(--bf-dev-primary-rgb) / .28);
          border-radius: 999px;
        }

        .bf-dev-scroll::-webkit-scrollbar-thumb:hover {
          background: rgb(var(--bf-dev-primary-rgb) / .45);
        }

        .bf-dev-sidebar-bg {
          background: var(--bf-dev-sidebar-bg);
        }

        .bf-dev-header-bg {
          background: var(--bf-dev-header-bg);
        }

        .bf-dev-theme-dot {
          box-shadow:
            0 0 0 2px var(--bf-dev-surface),
            0 0 0 3px var(--bf-dev-border);
        }

        @media (prefers-reduced-motion: reduce) {
          .bf-dev-root *,
          .bf-dev-root *::before,
          .bf-dev-root *::after {
            scroll-behavior: auto !important;
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
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
        `
          flex
          min-w-0
          items-center
        `,
        collapsed
          ? `
              justify-center
            `
          : `
              gap-3
            `
      )}
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[11px]
          bg-gradient-to-br
          from-[#078EE5]
          via-[#0B7FD1]
          to-[#0AA23B]
          text-[13px]
          font-black
          tracking-[-0.07em]
          text-white
          shadow-lg
          shadow-black/10
        "
      >
        BF
      </div>

      {!collapsed && (
        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              truncate
              text-[18px]
              font-black
              tracking-[-0.03em]
              text-[var(--bf-dev-sidebar-text)]
            "
          >
            Buddy Fleets
          </div>

          <div
            className="
              mt-0.5
              truncate
              text-[8px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-[var(--bf-dev-sidebar-muted)]
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
   SIDEBAR ITEM
============================================================ */

function SidebarItem({
  item,
  collapsed,
  onNavigate,
  compactMode,
}) {
  const Icon =
    item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={
        onNavigate
      }
      title={
        collapsed
          ? item.label
          : undefined
      }
      className={({
        isActive,
      }) =>
        cx(
          `
            group
            relative
            flex
            items-center
            rounded-[var(--bf-dev-radius)]
            text-[13px]
            font-medium
            outline-none
            transition-colors
            duration-150
            focus-visible:ring-2
            focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.42)]
          `,
          compactMode
            ? `
                min-h-[36px]
              `
            : `
                min-h-[42px]
              `,
          collapsed
            ? `
                justify-center
                px-2
              `
            : `
                gap-3
                px-3
              `
        )
      }
    >
      {({
        isActive,
      }) => (
        <>
          <span
            className={cx(
              `
                absolute
                inset-0
                rounded-[var(--bf-dev-radius)]
                transition
              `,
              isActive
                ? `
                    bg-[rgb(var(--bf-dev-primary-rgb)/.12)]
                  `
                : `
                    bg-transparent
                    group-hover:bg-[rgb(var(--bf-dev-primary-rgb)/.07)]
                  `
            )}
          />

          {isActive && (
            <span
              className="
                absolute
                bottom-[7px]
                left-0
                top-[7px]
                w-[3px]
                rounded-r-full
                bg-[var(--bf-dev-primary)]
              "
            />
          )}

          <Icon
            size={
              DIMENSIONS.sidebarIcon
            }
            strokeWidth={
              isActive
                ? 2.15
                : 1.8
            }
            className={cx(
              `
                relative
                z-[1]
                shrink-0
              `,
              isActive
                ? `
                    text-[var(--bf-dev-primary)]
                  `
                : `
                    text-[var(--bf-dev-sidebar-muted)]
                    group-hover:text-[var(--bf-dev-sidebar-text)]
                  `
            )}
          />

          {!collapsed && (
            <>
              <span
                className={cx(
                  `
                    relative
                    z-[1]
                    min-w-0
                    flex-1
                    truncate
                  `,
                  isActive
                    ? `
                        font-semibold
                        text-[var(--bf-dev-primary)]
                      `
                    : `
                        text-[var(--bf-dev-sidebar-text)]
                      `
                )}
              >
                {item.label}
              </span>

              <ChevronRight
                size={12}
                className={cx(
                  `
                    relative
                    z-[1]
                    shrink-0
                    transition
                  `,
                  isActive
                    ? `
                        translate-x-0
                        opacity-100
                        text-[var(--bf-dev-primary)]
                      `
                    : `
                        -translate-x-1
                        opacity-0
                        text-[var(--bf-dev-sidebar-muted)]
                        group-hover:translate-x-0
                        group-hover:opacity-100
                      `
                )}
              />
            </>
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
  compactMode,
}) {
  const location =
    useLocation();

  useEffect(() => {
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
          aria-label="Close navigation overlay"
          onClick={() =>
            setMobileOpen(false)
          }
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/55
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      <aside
        className={cx(
          `
            bf-dev-sidebar-bg
            fixed
            inset-y-0
            left-0
            z-50
            flex
            flex-col
            border-r
            border-[var(--bf-dev-sidebar-border)]
            shadow-[0_0_0_1px_rgba(0,0,0,.01)]
            transition-[width,transform]
            duration-200
            ease-out
          `,
          collapsed
            ? `
                lg:w-[var(--bf-dev-sidebar-collapsed)]
              `
            : `
                lg:w-[var(--bf-dev-sidebar-expanded)]
              `,
          mobileOpen
            ? `
                w-[var(--bf-dev-sidebar-expanded)]
                translate-x-0
              `
            : `
                w-[var(--bf-dev-sidebar-expanded)]
                -translate-x-full
                lg:translate-x-0
              `
        )}
      >
        <div
          className={cx(
            `
              flex
              h-[var(--bf-dev-header-height)]
              shrink-0
              items-center
              border-b
              border-[var(--bf-dev-sidebar-border)]
            `,
            collapsed
              ? `
                  justify-center
                  px-2
                `
              : `
                  justify-between
                  px-5
                `
          )}
        >
          <Brand
            collapsed={
              collapsed
            }
          />

          {!collapsed && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() =>
                setMobileOpen(false)
              }
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                text-[var(--bf-dev-sidebar-muted)]
                transition
                hover:bg-[rgb(var(--bf-dev-primary-rgb)/.08)]
                hover:text-[var(--bf-dev-sidebar-text)]
                lg:hidden
              "
            >
              <X
                size={16}
              />
            </button>
          )}
        </div>

        {!collapsed && (
          <div
            className="
              shrink-0
              border-b
              border-[var(--bf-dev-sidebar-border)]
              px-5
              py-4
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
                  relative
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[var(--bf-dev-sidebar-border)]
                  bg-[rgb(var(--bf-dev-primary-rgb)/.10)]
                  text-[12px]
                  font-black
                  text-[var(--bf-dev-primary)]
                "
              >
                SA

                <span
                  className="
                    absolute
                    right-[1px]
                    top-[1px]
                    h-3
                    w-3
                    rounded-full
                    border-2
                    border-[var(--bf-dev-sidebar-bg)]
                    bg-emerald-500
                  "
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <div
                  className="
                    truncate
                    text-[13px]
                    font-bold
                    text-[var(--bf-dev-sidebar-text)]
                  "
                >
                  Super Admin
                </div>

                <div
                  className="
                    mt-0.5
                    truncate
                    text-[10px]
                    text-[var(--bf-dev-sidebar-muted)]
                  "
                >
                  Platform Developer
                </div>
              </div>
            </div>
          </div>
        )}

        <nav
          aria-label="Developer portal navigation"
          className="
            bf-dev-scroll
            flex-1
            overflow-y-auto
            px-3
            py-4
          "
        >
          <div
            className="
              space-y-5
            "
          >
            {NAV_GROUPS.map(
              (group) => (
                <section
                  key={
                    group.label
                  }
                >
                  {!collapsed && (
                    <p
                      className="
                        mb-1.5
                        px-3
                        text-[9px]
                        font-extrabold
                        uppercase
                        tracking-[0.14em]
                        text-[var(--bf-dev-sidebar-muted)]
                      "
                    >
                      {group.label}
                    </p>
                  )}

                  <div
                    className="
                      space-y-1
                    "
                  >
                    {group.items.map(
                      (item) => (
                        <SidebarItem
                          key={
                            item.to
                          }
                          item={
                            item
                          }
                          collapsed={
                            collapsed
                          }
                          compactMode={
                            compactMode
                          }
                          onNavigate={() =>
                            setMobileOpen(false)
                          }
                        />
                      )
                    )}
                  </div>
                </section>
              )
            )}
          </div>
        </nav>

        <div
          className="
            shrink-0
            border-t
            border-[var(--bf-dev-sidebar-border)]
            p-3
          "
        >
          <button
            type="button"
            onClick={() =>
              setCollapsed(
                (previous) =>
                  !previous
              )
            }
            className={cx(
              `
                hidden
                h-10
                w-full
                items-center
                rounded-[var(--bf-dev-radius)]
                text-[11px]
                font-semibold
                text-[var(--bf-dev-sidebar-muted)]
                transition
                hover:bg-[rgb(var(--bf-dev-primary-rgb)/.08)]
                hover:text-[var(--bf-dev-sidebar-text)]
                lg:flex
              `,
              collapsed
                ? `
                    justify-center
                  `
                : `
                    justify-between
                    px-3
                  `
            )}
          >
            {!collapsed && (
              <span>
                Collapse sidebar
              </span>
            )}

            {collapsed ? (
              <ChevronRight
                size={15}
              />
            ) : (
              <ChevronLeft
                size={15}
              />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}


/* ============================================================
   GENERIC HEADER ICON BUTTON
============================================================ */

function HeaderIconButton({
  label,
  children,
  onClick,
  active,
  badge,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={
        onClick
      }
      className={cx(
        `
          relative
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-md
          text-[var(--bf-dev-header-muted)]
          transition
          duration-150
          hover:bg-white/10
          hover:text-[var(--bf-dev-header-text)]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/35
        `,
        active &&
          `
            bg-white/10
            text-[var(--bf-dev-header-text)]
          `
      )}
    >
      {children}

      {badge != null && (
        <span
          className="
            absolute
            right-[1px]
            top-[1px]
            min-w-[16px]
            rounded-full
            bg-rose-500
            px-1
            py-[1px]
            text-center
            text-[8px]
            font-bold
            leading-[14px]
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
   DROPDOWN SHELL
============================================================ */

function HeaderDropdown({
  children,
  width = 350,
  align = 'right',
}) {
  return (
    <div
      className={cx(
        `
          absolute
          top-[calc(100%+8px)]
          z-[80]
          overflow-hidden
          rounded-[10px]
          border
          border-[var(--bf-dev-border)]
          bg-[var(--bf-dev-surface)]
          shadow-[var(--bf-dev-shadow)]
        `,
        align === 'right'
          ? `
              right-0
            `
          : `
              left-0
            `
      )}
      style={{
        width,
        maxWidth:
          'calc(100vw - 24px)',
      }}
    >
      <div
        className={cx(
          `
            absolute
            -top-[6px]
            h-3
            w-3
            rotate-45
            border-l
            border-t
            border-[var(--bf-dev-border)]
            bg-[var(--bf-dev-surface)]
          `,
          align === 'right'
            ? `
                right-6
              `
            : `
                left-6
              `
        )}
      />

      {children}
    </div>
  );
}


/* ============================================================
   MESSAGE DROPDOWN
============================================================ */

function MessagesDropdown({
  onClose,
}) {
  return (
    <HeaderDropdown
      width={385}
    >
      <div
        className="
          relative
          z-[1]
          flex
          items-center
          justify-between
          border-b
          border-[var(--bf-dev-border)]
          px-4
          py-3
        "
      >
        <div
          className="
            text-[12px]
            font-bold
            text-[var(--bf-dev-text)]
          "
        >
          New Messages
        </div>

        <button
          type="button"
          className="
            rounded-full
            bg-[rgb(var(--bf-dev-primary-rgb)/.12)]
            px-2
            py-1
            text-[8px]
            font-bold
            text-[var(--bf-dev-primary)]
          "
        >
          Mark all as read
        </button>
      </div>

      <div
        className="
          bf-dev-scroll
          max-h-[345px]
          overflow-y-auto
        "
      >
        {MESSAGE_ITEMS.map(
          (item) => (
            <button
              key={
                item.id
              }
              type="button"
              className="
                flex
                w-full
                gap-3
                border-b
                border-[var(--bf-dev-border-soft)]
                px-4
                py-3
                text-left
                transition
                hover:bg-[rgb(var(--bf-dev-primary-rgb)/.05)]
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
                  bg-[rgb(var(--bf-dev-primary-rgb)/.12)]
                  text-[10px]
                  font-black
                  text-[var(--bf-dev-primary)]
                "
              >
                {item.initials}

                {item.unread && (
                  <span
                    className="
                      absolute
                      bottom-0
                      right-0
                      h-2.5
                      w-2.5
                      rounded-full
                      border-2
                      border-[var(--bf-dev-surface)]
                      bg-emerald-500
                    "
                  />
                )}
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
                  <div
                    className="
                      truncate
                      text-[11px]
                      font-bold
                      text-[var(--bf-dev-text)]
                    "
                  >
                    {item.name}
                  </div>

                  <div
                    className="
                      shrink-0
                      text-[9px]
                      text-[var(--bf-dev-text-3)]
                    "
                  >
                    {item.time}
                  </div>
                </div>

                <div
                  className="
                    mt-1
                    line-clamp-2
                    text-[10px]
                    leading-5
                    text-[var(--bf-dev-text-2)]
                  "
                >
                  {item.text}
                </div>
              </div>
            </button>
          )
        )}
      </div>

      <div
        className="
          p-3
        "
      >
        <button
          type="button"
          onClick={
            onClose
          }
          className="
            flex
            h-10
            w-full
            items-center
            justify-center
            rounded-md
            bg-[var(--bf-dev-primary)]
            text-[11px]
            font-bold
            text-white
            transition
            hover:bg-[var(--bf-dev-primary-strong)]
          "
        >
          View All
        </button>
      </div>
    </HeaderDropdown>
  );
}


/* ============================================================
   NOTIFICATION DROPDOWN
============================================================ */

function NotificationsDropdown({
  onClose,
}) {
  return (
    <HeaderDropdown
      width={330}
    >
      <div
        className="
          relative
          z-[1]
          flex
          items-center
          justify-between
          border-b
          border-[var(--bf-dev-border)]
          px-4
          py-3
        "
      >
        <div
          className="
            text-[12px]
            font-bold
            text-[var(--bf-dev-text)]
          "
        >
          Notifications
        </div>

        <button
          type="button"
          className="
            rounded-full
            bg-[rgb(var(--bf-dev-primary-rgb)/.12)]
            px-2
            py-1
            text-[8px]
            font-bold
            text-[var(--bf-dev-primary)]
          "
        >
          Mark all as read
        </button>
      </div>

      <div
        className="
          bf-dev-scroll
          max-h-[335px]
          overflow-y-auto
        "
      >
        {NOTIFICATION_ITEMS.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.id
                }
                className="
                  flex
                  items-start
                  gap-3
                  border-b
                  border-[var(--bf-dev-border-soft)]
                  px-4
                  py-3
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
                    rounded-full
                    bg-[rgb(var(--bf-dev-primary-rgb)/.12)]
                    text-[var(--bf-dev-primary)]
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
                      text-[var(--bf-dev-text)]
                    "
                  >
                    {item.title}
                  </div>

                  <div
                    className="
                      mt-1
                      text-[9px]
                      text-[var(--bf-dev-text-3)]
                    "
                  >
                    {item.meta}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Dismiss notification"
                  className="
                    mt-0.5
                    text-[var(--bf-dev-text-3)]
                    hover:text-[var(--bf-dev-text)]
                  "
                >
                  <X
                    size={13}
                  />
                </button>
              </div>
            );
          }
        )}
      </div>

      <div
        className="
          p-3
        "
      >
        <button
          type="button"
          onClick={
            onClose
          }
          className="
            flex
            h-10
            w-full
            items-center
            justify-center
            rounded-md
            bg-[var(--bf-dev-primary)]
            text-[11px]
            font-bold
            text-white
            transition
            hover:bg-[var(--bf-dev-primary-strong)]
          "
        >
          View All
        </button>
      </div>
    </HeaderDropdown>
  );
}


/* ============================================================
   PROFILE DROPDOWN
============================================================ */

function ProfileDropdown({
  currentUser,
  onLogout,
  onClose,
}) {
  const displayName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email
      ?.split('@')[0] ||
    'Super Admin';

  const displayEmail =
    currentUser?.email ||
    'Developer Account';

  const menu = [
    {
      label: 'Profile',
      icon: User,
    },
    {
      label: 'Settings',
      icon: Settings,
    },
    {
      label: 'Security',
      icon: LockKeyhole,
    },
    {
      label: 'Activity',
      icon: Activity,
    },
  ];

  return (
    <HeaderDropdown
      width={250}
    >
      <div
        className="
          px-4
          py-4
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
            bg-[rgb(var(--bf-dev-primary-rgb)/.12)]
            text-[12px]
            font-black
            text-[var(--bf-dev-primary)]
          "
        >
          {getInitials(
            displayName
          )}
        </div>

        <div
          className="
            mt-2
            truncate
            text-[14px]
            font-bold
            text-[var(--bf-dev-text)]
          "
        >
          {displayName}
        </div>

        <div
          className="
            mt-0.5
            truncate
            text-[9px]
            text-[var(--bf-dev-text-3)]
          "
        >
          {displayEmail}
        </div>
      </div>

      <div
        className="
          border-t
          border-[var(--bf-dev-border)]
          p-2
        "
      >
        {menu.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <button
                key={
                  item.label
                }
                type="button"
                onClick={
                  onClose
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-md
                  px-3
                  py-2.5
                  text-left
                  text-[11px]
                  font-medium
                  text-[var(--bf-dev-text-2)]
                  transition
                  hover:bg-[rgb(var(--bf-dev-primary-rgb)/.06)]
                  hover:text-[var(--bf-dev-text)]
                "
              >
                <Icon
                  size={15}
                  className="
                    text-[var(--bf-dev-primary)]
                  "
                />

                {item.label}
              </button>
            );
          }
        )}
      </div>

      <div
        className="
          border-t
          border-[var(--bf-dev-border)]
          p-2
        "
      >
        <button
          type="button"
          onClick={() => {
            onClose?.();
            onLogout?.();
          }}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-md
            px-3
            py-2.5
            text-left
            text-[11px]
            font-semibold
            text-rose-500
            transition
            hover:bg-rose-500/10
          "
        >
          <LogOut
            size={15}
          />

          Sign out
        </button>
      </div>
    </HeaderDropdown>
  );
}


/* ============================================================
   TOP HEADER
============================================================ */

function TopBar({
  collapsed,
  setCollapsed,
  setMobileOpen,
  currentUser,
  onLogout,
  theme,
  setTheme,
  openPanel,
  setOpenPanel,
  openRightPanel,
  setOpenRightPanel,
}) {
  const location =
    useLocation();

  const page =
    useMemo(
      () =>
        getPageDetails(
          location.pathname
        ),
      [
        location.pathname,
      ]
    );

  const PageIcon =
    page.icon ||
    LayoutDashboard;

  const dropdownRootRef =
    useRef(null);

  useEffect(() => {
    if (!openPanel) {
      return undefined;
    }

    const handlePointer = (
      event
    ) => {
      if (
        dropdownRootRef.current &&
        !dropdownRootRef.current.contains(
          event.target
        )
      ) {
        setOpenPanel(null);
      }
    };

    const handleKey = (
      event
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        setOpenPanel(null);
      }
    };

    document.addEventListener(
      'mousedown',
      handlePointer
    );

    document.addEventListener(
      'keydown',
      handleKey
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointer
      );

      document.removeEventListener(
        'keydown',
        handleKey
      );
    };
  }, [
    openPanel,
    setOpenPanel,
  ]);

  const togglePanel =
    useCallback(
      (panel) => {
        setOpenRightPanel(false);

        setOpenPanel(
          (current) =>
            current === panel
              ? null
              : panel
        );
      },
      [
        setOpenPanel,
        setOpenRightPanel,
      ]
    );

  const displayName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email
      ?.split('@')[0] ||
    'Super Admin';

  return (
    <header
      className={cx(
        `
          bf-dev-header-bg
          fixed
          right-0
          top-0
          z-30
          h-[var(--bf-dev-header-height)]
          border-b
          border-[var(--bf-dev-header-border)]
          transition-[left]
          duration-200
          ease-out
        `,
        collapsed
          ? `
              left-0
              lg:left-[var(--bf-dev-sidebar-collapsed)]
            `
          : `
              left-0
              lg:left-[var(--bf-dev-sidebar-expanded)]
            `
      )}
    >
      <div
        ref={
          dropdownRootRef
        }
        className="
          flex
          h-full
          items-center
          gap-2
          px-3
          sm:px-4
          lg:px-5
        "
      >
        <HeaderIconButton
          label="Toggle sidebar"
          onClick={() => {
            if (
              window.innerWidth <
              1024
            ) {
              setMobileOpen(true);
            } else {
              setCollapsed(
                (previous) =>
                  !previous
              );
            }
          }}
        >
          <Menu
            size={
              DIMENSIONS.headerIcon
            }
          />
        </HeaderIconButton>

        <div
          className="
            hidden
            min-w-0
            items-center
            gap-2.5
            md:flex
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              bg-white/10
              text-[var(--bf-dev-header-text)]
            "
          >
            <PageIcon
              size={15}
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                truncate
                text-[12px]
                font-bold
                text-[var(--bf-dev-header-text)]
              "
            >
              {page.label}
            </div>

            <div
              className="
                mt-0.5
                text-[8px]
                text-[var(--bf-dev-header-muted)]
              "
            >
              Developer Platform
            </div>
          </div>
        </div>

        <div
          className="
            hidden
            h-6
            w-px
            bg-[var(--bf-dev-header-border)]
            xl:block
          "
        />

        <button
          type="button"
          className="
            hidden
            min-w-[240px]
            max-w-[420px]
            flex-1
            items-center
            gap-2
            rounded-md
            bg-white/10
            px-3
            py-2
            text-left
            text-[10px]
            text-[var(--bf-dev-header-muted)]
            transition
            hover:bg-white/15
            xl:flex
          "
        >
          <Search
            size={14}
          />

          <span
            className="
              flex-1
            "
          >
            Search companies, modules, settings...
          </span>

          <span
            className="
              rounded
              bg-black/10
              px-1.5
              py-0.5
              font-mono
              text-[8px]
            "
          >
            /
          </span>
        </button>

        <div
          className="
            ml-auto
            flex
            items-center
            gap-1
          "
        >
          <HeaderIconButton
            label={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
            onClick={() =>
              setTheme(
                theme === 'dark'
                  ? 'light'
                  : 'dark'
              )
            }
          >
            {theme === 'dark' ? (
              <Sun
                size={
                  DIMENSIONS.headerIcon
                }
              />
            ) : (
              <Moon
                size={
                  DIMENSIONS.headerIcon
                }
              />
            )}
          </HeaderIconButton>

          <div
            className="
              relative
            "
          >
            <HeaderIconButton
              label="Notifications"
              badge={4}
              active={
                openPanel ===
                'notifications'
              }
              onClick={() =>
                togglePanel(
                  'notifications'
                )
              }
            >
              <Bell
                size={
                  DIMENSIONS.headerIcon
                }
              />
            </HeaderIconButton>

            {openPanel ===
              'notifications' && (
              <NotificationsDropdown
                onClose={() =>
                  setOpenPanel(null)
                }
              />
            )}
          </div>

          <div
            className="
              relative
            "
          >
            <HeaderIconButton
              label="Messages"
              badge={3}
              active={
                openPanel ===
                'messages'
              }
              onClick={() =>
                togglePanel(
                  'messages'
                )
              }
            >
              <Mail
                size={
                  DIMENSIONS.headerIcon
                }
              />
            </HeaderIconButton>

            {openPanel ===
              'messages' && (
              <MessagesDropdown
                onClose={() =>
                  setOpenPanel(null)
                }
              />
            )}
          </div>

          <HeaderIconButton
            label="Open right panel"
            active={
              openRightPanel
            }
            onClick={() => {
              setOpenPanel(null);

              setOpenRightPanel(
                (previous) =>
                  !previous
              );
            }}
          >
            <SlidersHorizontal
              size={
                DIMENSIONS.headerIcon
              }
            />
          </HeaderIconButton>

          <div
            className="
              relative
              ml-1
            "
          >
            <button
              type="button"
              onClick={() =>
                togglePanel(
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
                text-[var(--bf-dev-header-text)]
                transition
                hover:bg-white/10
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white/30
              "
            >
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
                {getInitials(
                  displayName
                )}
              </div>

              <div
                className="
                  hidden
                  max-w-[150px]
                  text-left
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
                  {displayName}
                </div>

                <div
                  className="
                    mt-0.5
                    text-[8px]
                    text-[var(--bf-dev-header-muted)]
                  "
                >
                  SUPER_ADMIN
                </div>
              </div>

              <ChevronDown
                size={12}
                className="
                  hidden
                  text-[var(--bf-dev-header-muted)]
                  xl:block
                "
              />
            </button>

            {openPanel ===
              'profile' && (
              <ProfileDropdown
                currentUser={
                  currentUser
                }
                onLogout={
                  onLogout
                }
                onClose={() =>
                  setOpenPanel(null)
                }
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


/* ============================================================
   SWITCH COMPONENT
============================================================ */

function ToggleSwitch({
  checked,
  onChange,
  label,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={
        checked
      }
      aria-label={
        label
      }
      onClick={() =>
        onChange(
          !checked
        )
      }
      className={cx(
        `
          relative
          h-[22px]
          w-[38px]
          shrink-0
          rounded-full
          transition
        `,
        checked
          ? `
              bg-[var(--bf-dev-primary)]
            `
          : `
              bg-[var(--bf-dev-surface-3)]
            `
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
            shadow-sm
            transition
          `,
          checked
            ? `
                left-[19px]
              `
            : `
                left-[3px]
              `
        )}
      />
    </button>
  );
}


/* ============================================================
   CUSTOMIZER ROWS
============================================================ */

function SettingsSectionTitle({
  children,
}) {
  return (
    <div
      className="
        border-y
        border-[var(--bf-dev-border)]
        bg-[var(--bf-dev-surface-2)]
        px-4
        py-2.5
        text-[10px]
        font-extrabold
        uppercase
        tracking-[0.08em]
        text-[var(--bf-dev-text-2)]
      "
    >
      {children}
    </div>
  );
}


function SettingsToggleRow({
  label,
  checked,
  onChange,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        px-4
        py-2.5
      "
    >
      <div
        className="
          text-[11px]
          font-medium
          text-[var(--bf-dev-text-2)]
        "
      >
        {label}
      </div>

      <ToggleSwitch
        checked={
          checked
        }
        onChange={
          onChange
        }
        label={
          label
        }
      />
    </div>
  );
}


/* ============================================================
   RIGHT PANEL — RECENT
============================================================ */

function RecentTab() {
  return (
    <div>
      {RECENT_ITEMS.map(
        (item) => {
          const Icon =
            item.icon;

          return (
            <div
              key={
                item.id
              }
              className="
                flex
                gap-3
                border-b
                border-[var(--bf-dev-border)]
                px-4
                py-4
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[rgb(var(--bf-dev-primary-rgb)/.12)]
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
                  <div
                    className="
                      text-[11px]
                      font-semibold
                      text-[var(--bf-dev-text)]
                    "
                  >
                    {item.title}
                  </div>

                  <div
                    className="
                      shrink-0
                      text-[9px]
                      text-[var(--bf-dev-text-3)]
                    "
                  >
                    {item.time}
                  </div>
                </div>

                <div
                  className="
                    mt-1
                    text-[10px]
                    leading-5
                    text-[var(--bf-dev-text-2)]
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


/* ============================================================
   RIGHT PANEL — CONTACTS
============================================================ */

function ContactsTab() {
  return (
    <div>
      {CONTACT_ITEMS.map(
        (item) => (
          <div
            key={
              item.id
            }
            className="
              flex
              items-center
              gap-3
              border-b
              border-[var(--bf-dev-border)]
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
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[rgb(var(--bf-dev-primary-rgb)/.12)]
                text-[10px]
                font-black
                text-[var(--bf-dev-primary)]
              "
            >
              {item.initials}

              <span
                className={cx(
                  `
                    absolute
                    bottom-[1px]
                    right-[1px]
                    h-2.5
                    w-2.5
                    rounded-full
                    border-2
                    border-[var(--bf-dev-surface)]
                  `,
                  item.status ===
                    'online'
                    ? `
                        bg-emerald-500
                      `
                    : item.status ===
                        'away'
                      ? `
                          bg-amber-500
                        `
                      : `
                          bg-slate-400
                        `
                )}
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
                  truncate
                  text-[11px]
                  font-semibold
                  text-[var(--bf-dev-text)]
                "
              >
                {item.name}
              </div>

              <div
                className="
                  mt-0.5
                  truncate
                  text-[9px]
                  text-[var(--bf-dev-text-3)]
                "
              >
                {item.role}
              </div>
            </div>

            <button
              type="button"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                text-[var(--bf-dev-text-3)]
                hover:bg-[rgb(var(--bf-dev-primary-rgb)/.08)]
                hover:text-[var(--bf-dev-primary)]
              "
            >
              <MessageCircle
                size={15}
              />
            </button>

            <button
              type="button"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                text-[var(--bf-dev-text-3)]
                hover:bg-[rgb(var(--bf-dev-primary-rgb)/.08)]
                hover:text-[var(--bf-dev-text)]
              "
            >
              <MoreHorizontal
                size={15}
              />
            </button>
          </div>
        )
      )}
    </div>
  );
}


/* ============================================================
   RIGHT PANEL — SETTINGS / THEME CUSTOMIZER
============================================================ */

function SettingsTab({
  theme,
  setTheme,

  primaryId,
  setPrimaryId,

  backgroundId,
  setBackgroundId,

  menuStyle,
  setMenuStyle,

  headerStyle,
  setHeaderStyle,

  direction,
  setDirection,

  compactMode,
  setCompactMode,
}) {
  return (
    <div
      className="
        pb-6
      "
    >
      <SettingsSectionTitle>
        Direction
      </SettingsSectionTitle>

      <SettingsToggleRow
        label="LTR"
        checked={
          direction ===
          'ltr'
        }
        onChange={() =>
          setDirection(
            'ltr'
          )
        }
      />

      <SettingsToggleRow
        label="RTL"
        checked={
          direction ===
          'rtl'
        }
        onChange={() =>
          setDirection(
            'rtl'
          )
        }
      />

      <SettingsSectionTitle>
        Navigation Style
      </SettingsSectionTitle>

      <SettingsToggleRow
        label="Vertical Menu"
        checked
        onChange={() => {}}
      />

      <SettingsToggleRow
        label="Compact Menu Density"
        checked={
          compactMode
        }
        onChange={
          setCompactMode
        }
      />

      <SettingsSectionTitle>
        Theme Style
      </SettingsSectionTitle>

      <SettingsToggleRow
        label="Light Theme"
        checked={
          theme ===
          'light'
        }
        onChange={() =>
          setTheme(
            'light'
          )
        }
      />

      <SettingsToggleRow
        label="Dark Theme"
        checked={
          theme ===
          'dark'
        }
        onChange={() =>
          setTheme(
            'dark'
          )
        }
      />

      <SettingsSectionTitle>
        Theme Colors
      </SettingsSectionTitle>

      <div
        className="
          px-4
          py-4
        "
      >
        <div
          className="
            text-[11px]
            font-medium
            text-[var(--bf-dev-text-2)]
          "
        >
          Primary Color
        </div>

        <div
          className="
            mt-3
            grid
            grid-cols-7
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
                aria-label={`Use ${preset.label} accent`}
                onClick={() =>
                  setPrimaryId(
                    preset.id
                  )
                }
                className={cx(
                  `
                    bf-dev-theme-dot
                    relative
                    h-7
                    w-7
                    rounded-md
                    transition
                    hover:scale-105
                  `
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

      <div
        className="
          border-t
          border-[var(--bf-dev-border)]
          px-4
          py-4
        "
      >
        <div
          className="
            text-[11px]
            font-medium
            text-[var(--bf-dev-text-2)]
          "
        >
          Theme Background
        </div>

        <div
          className="
            mt-3
            grid
            grid-cols-4
            gap-2
          "
        >
          {BACKGROUND_PRESETS.map(
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
                  setBackgroundId(
                    preset.id
                  )
                }
                className={cx(
                  `
                    relative
                    h-8
                    rounded-md
                    border
                    border-[var(--bf-dev-border)]
                    transition
                  `,
                  backgroundId ===
                    preset.id &&
                    `
                      ring-2
                      ring-[var(--bf-dev-primary)]
                    `
                )}
                style={{
                  background:
                    theme === 'dark'
                      ? preset.dark
                      : preset.light,
                }}
              />
            )
          )}
        </div>
      </div>

      <SettingsSectionTitle>
        Menu Styles
      </SettingsSectionTitle>

      {[
        [
          'light',
          'Light Menu',
        ],
        [
          'color',
          'Color Menu',
        ],
        [
          'dark',
          'Dark Menu',
        ],
        [
          'gradient',
          'Gradient Menu',
        ],
      ].map(
        ([
          id,
          label,
        ]) => (
          <SettingsToggleRow
            key={id}
            label={label}
            checked={
              menuStyle ===
              id
            }
            onChange={() =>
              setMenuStyle(id)
            }
          />
        )
      )}

      <SettingsSectionTitle>
        Header Styles
      </SettingsSectionTitle>

      {[
        [
          'light',
          'Light Header',
        ],
        [
          'color',
          'Color Header',
        ],
        [
          'dark',
          'Dark Header',
        ],
        [
          'gradient',
          'Gradient Header',
        ],
      ].map(
        ([
          id,
          label,
        ]) => (
          <SettingsToggleRow
            key={id}
            label={label}
            checked={
              headerStyle ===
              id
            }
            onChange={() =>
              setHeaderStyle(id)
            }
          />
        )
      )}

      <SettingsSectionTitle>
        CPanel Preferences
      </SettingsSectionTitle>

      <div
        className="
          px-4
          py-4
        "
      >
        <button
          type="button"
          className="
            flex
            h-10
            w-full
            items-center
            justify-center
            gap-2
            rounded-md
            bg-[var(--bf-dev-primary)]
            text-[10px]
            font-bold
            text-white
            transition
            hover:bg-[var(--bf-dev-primary-strong)]
          "
        >
          <Sparkles
            size={14}
          />

          Apply Buddy Fleets Preset
        </button>
      </div>
    </div>
  );
}


/* ============================================================
   RIGHT PANEL
============================================================ */

function RightPanel({
  open,
  onClose,
  activeTab,
  setActiveTab,

  theme,
  setTheme,

  primaryId,
  setPrimaryId,

  backgroundId,
  setBackgroundId,

  menuStyle,
  setMenuStyle,

  headerStyle,
  setHeaderStyle,

  direction,
  setDirection,

  compactMode,
  setCompactMode,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKey = (
      event
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleKey
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKey
      );
    };
  }, [
    open,
    onClose,
  ]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close right panel overlay"
          onClick={
            onClose
          }
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
            w-[var(--bf-dev-right-panel-width)]
            border-l
            border-[var(--bf-dev-border)]
            bg-[var(--bf-dev-surface)]
            shadow-[-18px_0_38px_rgba(0,0,0,.12)]
            transition-transform
            duration-200
            ease-out
          `,
          open
            ? `
                translate-x-0
              `
            : `
                translate-x-full
              `
        )}
      >
        <div
          className="
            flex
            h-[var(--bf-dev-header-height)]
            items-center
            border-b
            border-[var(--bf-dev-border)]
          "
        >
          {[
            [
              'recent',
              'Recent',
            ],
            [
              'contacts',
              'Contacts',
            ],
            [
              'settings',
              'Settings',
            ],
          ].map(
            ([
              id,
              label,
            ]) => (
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
                    transition
                  `,
                  activeTab ===
                    id
                    ? `
                        text-[var(--bf-dev-primary)]
                      `
                    : `
                        text-[var(--bf-dev-text-2)]
                        hover:text-[var(--bf-dev-text)]
                      `
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
                      bg-[var(--bf-dev-primary)]
                    "
                  />
                )}
              </button>
            )
          )}

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close right panel"
            className="
              mr-2
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              text-[var(--bf-dev-text-3)]
              hover:bg-[rgb(var(--bf-dev-primary-rgb)/.08)]
              hover:text-[var(--bf-dev-text)]
            "
          >
            <X
              size={15}
            />
          </button>
        </div>

        <div
          className="
            bf-dev-scroll
            h-[calc(100dvh-var(--bf-dev-header-height))]
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
              backgroundId={
                backgroundId
              }
              setBackgroundId={
                setBackgroundId
              }
              menuStyle={
                menuStyle
              }
              setMenuStyle={
                setMenuStyle
              }
              headerStyle={
                headerStyle
              }
              setHeaderStyle={
                setHeaderStyle
              }
              direction={
                direction
              }
              setDirection={
                setDirection
              }
              compactMode={
                compactMode
              }
              setCompactMode={
                setCompactMode
              }
            />
          )}
        </div>
      </aside>
    </>
  );
}


/* ============================================================
   CONTENT AREA
============================================================ */

function ContentArea({
  collapsed,
  rightPanelOpen,
  children,
}) {
  return (
    <main
      className={cx(
        `
          relative
          min-h-[100dvh]
          pt-[var(--bf-dev-header-height)]
          transition-[padding-left,padding-right]
          duration-200
          ease-out
        `,
        collapsed
          ? `
              lg:pl-[var(--bf-dev-sidebar-collapsed)]
            `
          : `
              lg:pl-[var(--bf-dev-sidebar-expanded)]
            `,
        rightPanelOpen
          ? `
              2xl:pr-[var(--bf-dev-right-panel-width)]
            `
          : `
              pr-0
            `
      )}
    >
      <div
        className="
          min-h-[calc(100dvh-var(--bf-dev-header-height))]
          bg-[var(--bf-dev-page-bg)]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1760px]
            px-4
            py-5
            sm:px-5
            lg:px-6
            lg:py-6
            xl:px-7
          "
        >
          {children}
        </div>
      </div>
    </main>
  );
}


/* ============================================================
   ROOT LAYOUT
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
      getInitialTheme
    );

  const [
    primaryId,
    setPrimaryId,
  ] =
    useState(
      getInitialPrimary
    );

  const [
    backgroundId,
    setBackgroundId,
  ] =
    useState(
      getInitialBackground
    );

  const [
    menuStyle,
    setMenuStyle,
  ] =
    useState(
      getInitialMenuStyle
    );

  const [
    headerStyle,
    setHeaderStyle,
  ] =
    useState(
      getInitialHeaderStyle
    );

  const [
    collapsed,
    setCollapsed,
  ] =
    useState(
      getInitialSidebarCollapsed
    );

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  const [
    openPanel,
    setOpenPanel,
  ] =
    useState(null);

  const [
    openRightPanel,
    setOpenRightPanel,
  ] =
    useState(false);

  const [
    rightPanelTab,
    setRightPanelTab,
  ] =
    useState(
      getInitialRightTab
    );

  const [
    direction,
    setDirection,
  ] =
    useState(
      getInitialDirection
    );

  const [
    compactMode,
    setCompactMode,
  ] =
    useState(
      getInitialCompactMode
    );

  const themeTokens =
    useMemo(
      () =>
        buildThemeTokens({
          theme,
          primaryId,
          backgroundId,
          menuStyle,
          headerStyle,
          compactMode,
        }),
      [
        theme,
        primaryId,
        backgroundId,
        menuStyle,
        headerStyle,
        compactMode,
      ]
    );


  /* ========================================================
     APPLY THEME TOKENS
  ======================================================== */

  useLayoutEffect(() => {
    const root =
      document.documentElement;

    root.style.colorScheme =
      theme;

    root.dir =
      direction;

    safeWriteStorage(
      STORAGE.theme,
      theme
    );

    safeWriteStorage(
      STORAGE.primary,
      primaryId
    );

    safeWriteStorage(
      STORAGE.background,
      backgroundId
    );

    safeWriteStorage(
      STORAGE.menuStyle,
      menuStyle
    );

    safeWriteStorage(
      STORAGE.headerStyle,
      headerStyle
    );

    safeWriteStorage(
      STORAGE.sidebarCollapsed,
      collapsed
    );

    safeWriteStorage(
      STORAGE.rightPanelTab,
      rightPanelTab
    );

    safeWriteStorage(
      STORAGE.direction,
      direction
    );

    safeWriteStorage(
      STORAGE.compactMode,
      compactMode
    );
  }, [
    theme,
    primaryId,
    backgroundId,
    menuStyle,
    headerStyle,
    collapsed,
    rightPanelTab,
    direction,
    compactMode,
  ]);


  /* ========================================================
     CLOSE HEADER DROPDOWNS ON ROUTE CHANGE
  ======================================================== */

  const location =
    useLocation();

  useEffect(() => {
    setOpenPanel(null);
    setMobileOpen(false);
  }, [
    location.pathname,
  ]);


  /* ========================================================
     BODY OVERFLOW FOR MOBILE DRAWERS
  ======================================================== */

  useEffect(() => {
    if (
      typeof document ===
      'undefined'
    ) {
      return undefined;
    }

    const shouldLock =
      window.innerWidth <
        1024 &&
      (
        mobileOpen ||
        openRightPanel
      );

    if (
      shouldLock
    ) {
      document.body.style.overflow =
        'hidden';
    }

    return () => {
      document.body.style.overflow =
        '';
    };
  }, [
    mobileOpen,
    openRightPanel,
  ]);


  return (
    <>
      <DeveloperGlobalStyles />

      <div
        className="
          bf-dev-root
          min-h-screen
          min-h-[100dvh]
          w-full
          overflow-x-clip
          font-sans
        "
        style={
          themeTokens.css
        }
        dir={
          direction
        }
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
          compactMode={
            compactMode
          }
        />

        <TopBar
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
          openPanel={
            openPanel
          }
          setOpenPanel={
            setOpenPanel
          }
          openRightPanel={
            openRightPanel
          }
          setOpenRightPanel={
            setOpenRightPanel
          }
        />

        <RightPanel
          open={
            openRightPanel
          }
          onClose={() =>
            setOpenRightPanel(false)
          }
          activeTab={
            rightPanelTab
          }
          setActiveTab={
            setRightPanelTab
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
          backgroundId={
            backgroundId
          }
          setBackgroundId={
            setBackgroundId
          }
          menuStyle={
            menuStyle
          }
          setMenuStyle={
            setMenuStyle
          }
          headerStyle={
            headerStyle
          }
          setHeaderStyle={
            setHeaderStyle
          }
          direction={
            direction
          }
          setDirection={
            setDirection
          }
          compactMode={
            compactMode
          }
          setCompactMode={
            setCompactMode
          }
        />

        <ContentArea
          collapsed={
            collapsed
          }
          rightPanelOpen={
            openRightPanel
          }
        >
          <Outlet
            context={{
              currentUser,
              onLogout,

              theme,
              primaryId,
              backgroundId,
              menuStyle,
              headerStyle,
              compactMode,

              openThemeCustomizer: () => {
                setRightPanelTab(
                  'settings'
                );

                setOpenRightPanel(
                  true
                );
              },
            }}
          />
        </ContentArea>
      </div>
    </>
  );
}
