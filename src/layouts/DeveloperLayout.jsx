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
  Minimize2,
  Menu,
  MessageCircle,
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


/* ============================================================
   THEME / LAYOUT DEFAULTS

   Splite-style workflow:
   - sidebar starts OPEN + LOCKED
   - hamburger toggles locked-open / locked-collapsed
   - collapsed rail temporarily expands on mouse hover
   - mouse leave returns it to collapsed state
============================================================ */

const THEME_DEFAULTS = {
  direction: 'ltr',

  navigationStyle:
    'vertical',

  theme:
    'light',

  primaryColor:
    '#5551D7',

  backgroundLight:
    '#ECECF3',

  backgroundDark:
    '#0E1929',

  sidebarStyle:
    'light',

  headerStyle:
    'color',

  shadowMode:
    'shadow',

  layoutWidth:
    'full',

  layoutPosition:
    'fixed',

  sideMenuLayout:
    'default',

  sidebarLockedOpen:
    true,

  drawerTab:
    'settings',
};


const STORAGE = {
  config:
    'bf_dev_theme_config_v3',
};


const PRIMARY_PRESETS = [
  {
    id:
      'indigo',

    label:
      'Indigo',

    value:
      '#5551D7',
  },

  {
    id:
      'buddy-blue',

    label:
      'Buddy Blue',

    value:
      '#1689E5',
  },

  {
    id:
      'violet',

    label:
      'Violet',

    value:
      '#7C3AED',
  },

  {
    id:
      'cyan',

    label:
      'Cyan',

    value:
      '#0891B2',
  },

  {
    id:
      'emerald',

    label:
      'Emerald',

    value:
      '#059669',
  },

  {
    id:
      'orange',

    label:
      'Orange',

    value:
      '#EA580C',
  },

  {
    id:
      'rose',

    label:
      'Rose',

    value:
      '#E11D48',
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
  return items
    .filter(Boolean)
    .join(' ');
}


function clampRgb(value) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      255,
      Math.round(number)
    )
  );
}


function hexToRgb(hex) {
  const clean =
    String(hex || '')
      .trim()
      .replace('#', '');

  if (
    clean.length !== 6
  ) {
    return {
      r: 85,
      g: 81,
      b: 215,
    };
  }

  return {
    r:
      parseInt(
        clean.slice(0, 2),
        16
      ),

    g:
      parseInt(
        clean.slice(2, 4),
        16
      ),

    b:
      parseInt(
        clean.slice(4, 6),
        16
      ),
  };
}


function rgbToHex(
  r,
  g,
  b
) {
  return (
    '#' +
    [
      r,
      g,
      b,
    ]
      .map(
        (value) =>
          clampRgb(value)
            .toString(16)
            .padStart(
              2,
              '0'
            )
      )
      .join('')
      .toUpperCase()
  );
}


function darkenHex(
  hex,
  amount = 0.13
) {
  const {
    r,
    g,
    b,
  } =
    hexToRgb(hex);

  return rgbToHex(
    r * (1 - amount),
    g * (1 - amount),
    b * (1 - amount)
  );
}


function lightenHex(
  hex,
  amount = 0.84
) {
  const {
    r,
    g,
    b,
  } =
    hexToRgb(hex);

  return rgbToHex(
    r +
      (255 - r) *
        amount,

    g +
      (255 - g) *
        amount,

    b +
      (255 - b) *
        amount
  );
}


function readThemeConfig() {
  try {
    const raw =
      window.localStorage.getItem(
        STORAGE.config
      );

    if (!raw) {
      return {
        ...THEME_DEFAULTS,
      };
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...THEME_DEFAULTS,
      ...parsed,
    };
  } catch {
    return {
      ...THEME_DEFAULTS,
    };
  }
}


function writeThemeConfig(
  config
) {
  try {
    window.localStorage.setItem(
      STORAGE.config,
      JSON.stringify(config)
    );
  } catch {
    // Theme persistence is non-critical.
  }
}


function getInitials(value) {
  const text =
    String(value || '')
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


function pathIsInside(
  pathname,
  menu
) {
  return menu.children.some(
    (child) => {
      if (child.end) {
        return (
          pathname ===
          child.to
        );
      }

      return (
        pathname ===
          child.to ||
        pathname.startsWith(
          `${child.to}/`
        )
      );
    }
  );
}


function activeMenuIdForPath(
  pathname
) {
  const found =
    MENU_TREE.find(
      (menu) =>
        pathIsInside(
          pathname,
          menu
        )
    );

  return (
    found?.id ||
    'dashboard'
  );
}


function buildVars({
  config,
}) {
  const dark =
    config.theme ===
    'dark';

  const primary =
    config.primaryColor;

  const primaryStrong =
    darkenHex(
      primary,
      0.13
    );

  const primarySoft =
    lightenHex(
      primary,
      0.84
    );

  const rgb =
    hexToRgb(
      primary
    );

  /*
     Reference palette locked from screenshots:

     Primary:
       #5551D7

     Dark:
       page canvas  #0E1929
       cards/menu   #1B2433
       surface 2    #162131
       border       #313B4B

     Light:
       page canvas  #ECECF3
       cards/menu   #FFFFFF
       surface 2    #F8F9FC
       border       #E2E6EE

     Text hierarchy is intentionally NOT pure black / pure white.
  */

  const darkSurface =
    '#1B2433';

  const darkSurface2 =
    '#162131';

  const darkSurface3 =
    '#253247';

  const lightSurface =
    '#FFFFFF';

  const lightSurface2 =
    '#F8F9FC';

  const lightSurface3 =
    '#EEF1F6';

  const page =
    dark
      ? config.backgroundDark
      : config.backgroundLight;

  const surface =
    dark
      ? darkSurface
      : lightSurface;

  const surface2 =
    dark
      ? darkSurface2
      : lightSurface2;

  const surface3 =
    dark
      ? darkSurface3
      : lightSurface3;

  const text =
    dark
      ? '#E7EEF8'
      : '#1F2937';

  const text2 =
    dark
      ? '#A2B0C3'
      : '#67758B';

  const text3 =
    dark
      ? '#78879B'
      : '#96A2B5';

  const border =
    dark
      ? '#313B4B'
      : '#E2E6EE';


  /* ========================================================
     SIDEBAR COLORS
  ======================================================== */

  let sidebarBg =
    dark
      ? darkSurface
      : '#FFFFFF';

  let sidebarSolid =
    dark
      ? darkSurface
      : '#FFFFFF';

  let sidebarText =
    dark
      ? '#EEF3F8'
      : '#66748B';

  let sidebarMuted =
    dark
      ? '#8B9AAF'
      : '#97A3B5';

  let sidebarBorder =
    dark
      ? '#313B4B'
      : '#ECEEF3';


  if (
    config.sidebarStyle ===
    'light'
  ) {
    sidebarBg =
      '#FFFFFF';

    sidebarSolid =
      '#FFFFFF';

    sidebarText =
      '#66748B';

    sidebarMuted =
      '#97A3B5';

    sidebarBorder =
      '#ECEEF3';
  }


  if (
    config.sidebarStyle ===
    'dark'
  ) {
    sidebarBg =
      darkSurface;

    sidebarSolid =
      darkSurface;

    sidebarText =
      '#EEF3F8';

    sidebarMuted =
      '#8B9AAF';

    sidebarBorder =
      '#313B4B';
  }


  if (
    config.sidebarStyle ===
    'color'
  ) {
    sidebarBg =
      primary;

    sidebarSolid =
      primaryStrong;

    sidebarText =
      '#FFFFFF';

    sidebarMuted =
      'rgba(255,255,255,.72)';

    sidebarBorder =
      'rgba(255,255,255,.16)';
  }


  if (
    config.sidebarStyle ===
    'gradient'
  ) {
    sidebarBg =
      `linear-gradient(
        180deg,
        ${primary} 0%,
        ${primaryStrong} 56%,
        ${darkSurface} 100%
      )`;

    sidebarSolid =
      primaryStrong;

    sidebarText =
      '#FFFFFF';

    sidebarMuted =
      'rgba(255,255,255,.72)';

    sidebarBorder =
      'rgba(255,255,255,.15)';
  }


  /* ========================================================
     HEADER COLORS
  ======================================================== */

  let headerBg =
    primary;

  let headerText =
    '#FFFFFF';

  let headerMuted =
    'rgba(255,255,255,.82)';

  let headerBorder =
    'rgba(255,255,255,.14)';


  if (
    config.headerStyle ===
    'light'
  ) {
    headerBg =
      '#FFFFFF';

    headerText =
      '#2B3544';

    headerMuted =
      '#69778B';

    headerBorder =
      '#E7EAF0';
  }


  if (
    config.headerStyle ===
    'dark'
  ) {
    headerBg =
      darkSurface;

    headerText =
      '#FFFFFF';

    headerMuted =
      '#ACB8C8';

    headerBorder =
      '#313B4B';
  }


  if (
    config.headerStyle ===
    'color'
  ) {
    headerBg =
      primary;

    headerText =
      '#FFFFFF';

    headerMuted =
      'rgba(255,255,255,.82)';

    headerBorder =
      'rgba(255,255,255,.14)';
  }


  if (
    config.headerStyle ===
    'gradient'
  ) {
    headerBg =
      `linear-gradient(
        90deg,
        ${primary} 0%,
        ${primaryStrong} 100%
      )`;

    headerText =
      '#FFFFFF';

    headerMuted =
      'rgba(255,255,255,.82)';

    headerBorder =
      'rgba(255,255,255,.14)';
  }


  const shadow =
    config.shadowMode ===
    'shadow'
      ? dark
        ? '0 3px 16px rgba(0,0,0,.22)'
        : '0 3px 16px rgba(15,23,42,.08)'
      : 'none';


  return {
    '--bf-primary':
      primary,

    '--bf-primary-strong':
      primaryStrong,

    '--bf-primary-soft':
      primarySoft,

    '--bf-primary-rgb':
      `${rgb.r} ${rgb.g} ${rgb.b}`,

    '--bf-page':
      page,

    '--bf-surface':
      surface,

    '--bf-surface-2':
      surface2,

    '--bf-surface-3':
      surface3,

    '--bf-text':
      text,

    '--bf-text-2':
      text2,

    '--bf-text-3':
      text3,

    '--bf-border':
      border,

    '--bf-sidebar-bg':
      sidebarBg,

    '--bf-sidebar-solid':
      sidebarSolid,

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

    '--bf-shadow':
      shadow,

    '--bf-sidebar-width':
      `${SIDEBAR_W}px`,

    '--bf-sidebar-collapsed':
      `${SIDEBAR_COLLAPSED_W}px`,

    '--bf-header-height':
      `${HEADER_H}px`,

    '--bf-drawer-width':
      `${RIGHT_DRAWER_W}px`,

    /*
      DeveloperWorkspace.jsx compatibility aliases.
      Layout and page content now share one theme source.
    */

    '--bf-dev-primary':
      primary,

    '--bf-dev-primary-strong':
      primaryStrong,

    '--bf-dev-primary-soft':
      primarySoft,

    '--bf-dev-primary-rgb':
      `${rgb.r} ${rgb.g} ${rgb.b}`,

    '--bf-dev-page-bg':
      page,

    '--bf-dev-surface':
      surface,

    '--bf-dev-surface-2':
      surface2,

    '--bf-dev-surface-3':
      surface3,

    '--bf-dev-text':
      text,

    '--bf-dev-text-2':
      text2,

    '--bf-dev-text-3':
      text3,

    '--bf-dev-border':
      border,

    '--bf-dev-border-soft':
      dark
        ? '#283446'
        : '#EEF0F5',

    '--bf-dev-radius':
      '4px',

    '--bf-dev-card-radius':
      '5px',

    '--bf-dev-shadow':
      shadow,
  };
}


/* ============================================================
   GLOBAL STYLE
============================================================ */

function GlobalStyle() {
  return (
    <style>
      {`
        html,
        body,
        #root {
          min-height: 100%;
        }

        .bf-dev-shell,
        .bf-dev-shell * {
          box-sizing: border-box;
        }

        .bf-dev-shell {
          min-height: 100dvh;
          background: var(--bf-page);
          color: var(--bf-text);
        }

        .bf-dev-shell button,
        .bf-dev-shell input,
        .bf-dev-shell select,
        .bf-dev-shell textarea {
          font: inherit;
        }

        .bf-dev-sidebar-bg {
          background: var(--bf-sidebar-bg);
        }

        .bf-dev-header-bg {
          background: var(--bf-header-bg);
        }

        .bf-dev-scroll {
          scrollbar-width: thin;
          scrollbar-color:
            rgb(var(--bf-primary-rgb) / .36)
            transparent;
        }

        .bf-dev-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .bf-dev-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .bf-dev-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background:
            rgb(var(--bf-primary-rgb) / .34);
        }

        .bf-dev-pop {
          animation:
            bfDevPop
            .12s
            ease-out;
        }

        @keyframes bfDevPop {
          from {
            opacity: 0;
            transform:
              translateY(-4px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bf-dev-shell *,
          .bf-dev-shell *::before,
          .bf-dev-shell *::after {
            transition-duration:
              .01ms !important;

            animation-duration:
              .01ms !important;

            animation-iteration-count:
              1 !important;

            scroll-behavior:
              auto !important;
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

   REQUIRED WORKFLOW
   ------------------------------------------------------------
   Default:
     sidebarLockedOpen = true

   Header hamburger:
     open locked -> collapsed locked
     collapsed locked -> open locked

   When collapsed:
     mouse enter sidebar -> temporary expand
     mouse leave sidebar -> collapse again

   Accordion:
     only ONE parent menu can be expanded at a time.
============================================================ */

function Sidebar({
  config,
  mobileOpen,
  setMobileOpen,
}) {
  const location =
    useLocation();

  const activeMenuId =
    activeMenuIdForPath(
      location.pathname
    );

  const [
    openMenuId,
    setOpenMenuId,
  ] =
    useState(
      activeMenuId
    );

  const [
    hoverExpanded,
    setHoverExpanded,
  ] =
    useState(false);


  const lockedOpen =
    config.sidebarLockedOpen;


  const temporaryExpanded =
    !lockedOpen &&
    hoverExpanded;


  const visuallyExpanded =
    lockedOpen ||
    temporaryExpanded;


  const compact =
    !visuallyExpanded;


  useEffect(() => {
    /*
      Route change always opens the active group,
      and because openMenuId is a single id,
      every other group automatically closes.
    */
    setOpenMenuId(
      activeMenuId
    );

    setMobileOpen(
      false
    );
  }, [
    activeMenuId,
    setMobileOpen,
  ]);


  const handleParentToggle =
    (menuId) => {
      if (compact) {
        return;
      }

      setOpenMenuId(
        (current) =>
          current === menuId
            ? null
            : menuId
      );
    };


  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setMobileOpen(
              false
            )
          }
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/45
            backdrop-blur-[1px]
            lg:hidden
          "
        />
      )}


      <aside
        onMouseEnter={() => {
          if (
            !lockedOpen
          ) {
            setHoverExpanded(
              true
            );
          }
        }}
        onMouseLeave={() => {
          if (
            !lockedOpen
          ) {
            setHoverExpanded(
              false
            );
          }
        }}
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
            border-[var(--bf-sidebar-border)]
            transition-[width,transform]
            duration-200
            ease-out
          `,
          visuallyExpanded
            ? 'lg:w-[var(--bf-sidebar-width)]'
            : 'lg:w-[var(--bf-sidebar-collapsed)]',
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
            compact
              ? 'justify-center px-2'
              : 'px-5'
          )}
        >
          <Brand
            collapsed={
              compact
            }
          />
        </div>


        {!compact && (
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
                  border-[var(--bf-sidebar-solid)]
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
          <div
            className="
              space-y-1
            "
          >
            {MENU_TREE.map(
              (menu) => {
                const active =
                  pathIsInside(
                    location.pathname,
                    menu
                  );

                const expanded =
                  openMenuId ===
                  menu.id;

                return (
                  <div
                    key={
                      menu.id
                    }
                  >
                    <ParentMenuItem
                      menu={
                        menu
                      }
                      collapsed={
                        compact
                      }
                      expanded={
                        expanded
                      }
                      active={
                        active
                      }
                      onToggle={() =>
                        handleParentToggle(
                          menu.id
                        )
                      }
                    />


                    {!compact &&
                      expanded && (
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


        {!compact && (
          <div
            className="
              shrink-0
              border-t
              border-[var(--bf-sidebar-border)]
              px-4
              py-3
              text-[9px]
              text-[var(--bf-sidebar-muted)]
            "
          >
            Buddy Fleets Platform
          </div>
        )}
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
  config,
  updateConfig,
  setMobileOpen,
  currentUser,
  onLogout,
  openPopover,
  setOpenPopover,
  drawerOpen,
  setDrawerOpen,
}) {
  const rootRef =
    useRef(null);

  const [
    fullscreen,
    setFullscreen,
  ] =
    useState(
      Boolean(
        document.fullscreenElement
      )
    );


  const name =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email?.split('@')[0] ||
    'Super Admin';


  useEffect(() => {
    const syncFullscreen =
      () => {
        setFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );
      };

    document.addEventListener(
      'fullscreenchange',
      syncFullscreen
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        syncFullscreen
      );
    };
  }, []);


  useEffect(() => {
    if (!openPopover) {
      return undefined;
    }

    const outside =
      (event) => {
        if (
          rootRef.current &&
          !rootRef.current.contains(
            event.target
          )
        ) {
          setOpenPopover(
            null
          );
        }
      };

    const escape =
      (event) => {
        if (
          event.key ===
          'Escape'
        ) {
          setOpenPopover(
            null
          );
        }
      };

    document.addEventListener(
      'mousedown',
      outside
    );

    document.addEventListener(
      'keydown',
      escape
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        outside
      );

      document.removeEventListener(
        'keydown',
        escape
      );
    };
  }, [
    openPopover,
    setOpenPopover,
  ]);


  const togglePopover =
    (id) => {
      setDrawerOpen(
        false
      );

      setOpenPopover(
        (current) =>
          current === id
            ? null
            : id
      );
    };


  const toggleFullscreen =
    async () => {
      try {
        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Browser or OS may deny fullscreen.
      }
    };


  const handleSidebarToggle =
    () => {
      if (
        window.innerWidth <
        1024
      ) {
        setMobileOpen(
          true
        );

        return;
      }

      updateConfig({
        sidebarLockedOpen:
          !config.sidebarLockedOpen,
      });
    };


  return (
    <header
      className={cx(
        `
          bf-dev-header-bg
          fixed
          right-0
          top-0
          z-30
          h-[var(--bf-header-height)]
          border-b
          border-[var(--bf-header-border)]
          transition-[left]
          duration-200
          ease-out
        `,
        config.sidebarLockedOpen
          ? 'left-0 lg:left-[var(--bf-sidebar-width)]'
          : 'left-0 lg:left-[var(--bf-sidebar-collapsed)]'
      )}
    >
      <div
        ref={
          rootRef
        }
        className="
          flex
          h-full
          items-center
          px-4
        "
      >
        <HeaderIcon
          label="Toggle menu"
          onClick={
            handleSidebarToggle
          }
        >
          <Menu
            size={18}
          />
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
            label={
              fullscreen
                ? 'Exit fullscreen'
                : 'Enter fullscreen'
            }
            onClick={
              toggleFullscreen
            }
          >
            {fullscreen ? (
              <Minimize2
                size={18}
              />
            ) : (
              <Maximize2
                size={18}
              />
            )}
          </HeaderIcon>


          <HeaderIcon
            label="Theme"
            onClick={() =>
              updateConfig({
                theme:
                  config.theme ===
                  'dark'
                    ? 'light'
                    : 'dark',
              })
            }
          >
            {config.theme ===
              'dark' ? (
              <Sun
                size={18}
              />
            ) : (
              <Moon
                size={18}
              />
            )}
          </HeaderIcon>


          <HeaderIcon
            label="Search"
          >
            <Search
              size={18}
            />
          </HeaderIcon>


          <div
            className="
              relative
            "
          >
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
              <Bell
                size={18}
              />
            </HeaderIcon>

            {openPopover ===
              'notifications' && (
              <NotificationsPopover />
            )}
          </div>


          <div
            className="
              relative
            "
          >
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
              <Mail
                size={18}
              />
            </HeaderIcon>

            {openPopover ===
              'messages' && (
              <MessagesPopover />
            )}
          </div>


          <div
            className="
              relative
              ml-1
            "
          >
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
                transition
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
                {getInitials(
                  name
                )}
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
              setOpenPopover(
                null
              );

              setDrawerOpen(
                (current) =>
                  !current
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
  label,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={
        value
      }
      aria-label={
        label
      }
      onClick={() =>
        onChange(
          !value
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
   SETTINGS UI
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
        gap-3
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
        label={
          label
        }
        value={
          selected
        }
        onChange={() =>
          onClick()
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


function ColorControl({
  label,
  value,
  onChange,
}) {
  const rgb =
    hexToRgb(
      value
    );


  const updateChannel =
    (
      channel,
      nextValue
    ) => {
      const next = {
        ...rgb,

        [channel]:
          clampRgb(
            nextValue
          ),
      };

      onChange(
        rgbToHex(
          next.r,
          next.g,
          next.b
        )
      );
    };


  return (
    <div
      className="
        border-b
        border-[var(--bf-border)]
        px-4
        py-4
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
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

        <label
          className="
            relative
            h-8
            w-12
            cursor-pointer
            overflow-hidden
            border-2
            border-[var(--bf-border)]
            bg-[var(--bf-surface)]
          "
          style={{
            background:
              value,
          }}
        >
          <input
            type="color"
            value={
              value
            }
            onChange={(
              event
            ) =>
              onChange(
                event.target.value.toUpperCase()
              )
            }
            className="
              absolute
              inset-0
              h-full
              w-full
              cursor-pointer
              opacity-0
            "
          />
        </label>
      </div>


      <div
        className="
          mt-3
          grid
          grid-cols-3
          gap-2
        "
      >
        {[
          [
            'R',
            'r',
          ],

          [
            'G',
            'g',
          ],

          [
            'B',
            'b',
          ],
        ].map(
          ([
            text,
            channel,
          ]) => (
            <label
              key={
                channel
              }
              className="
                block
                text-center
              "
            >
              <input
                type="number"
                min="0"
                max="255"
                value={
                  rgb[
                    channel
                  ]
                }
                onChange={(
                  event
                ) =>
                  updateChannel(
                    channel,
                    event.target.value
                  )
                }
                className="
                  h-8
                  w-full
                  border
                  border-[var(--bf-border)]
                  bg-[var(--bf-surface)]
                  px-2
                  text-center
                  text-[10px]
                  text-[var(--bf-text)]
                  outline-none
                  focus:border-[var(--bf-primary)]
                "
              />

              <div
                className="
                  mt-1
                  text-[8px]
                  font-semibold
                  text-[var(--bf-text-3)]
                "
              >
                {text}
              </div>
            </label>
          )
        )}
      </div>
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
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[rgb(var(--bf-primary-rgb)/.12)]
                  text-[var(--bf-primary)]
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
                  text-[var(--bf-text)]
                "
              >
                {item.name}
              </div>

              <div
                className="
                  mt-0.5
                  truncate
                  text-[9px]
                  text-[var(--bf-text-3)]
                "
              >
                {item.role}
              </div>
            </div>

            <MessageCircle
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
  config,
  updateConfig,
  resetConfig,
}) {
  return (
    <div
      className="
        pb-6
      "
    >
      <SectionTitle>
        LTR and RTL Versions
      </SectionTitle>

      <SettingRow
        label="LTR"
        selected={
          config.direction ===
          'ltr'
        }
        onClick={() =>
          updateConfig({
            direction:
              'ltr',
          })
        }
      />

      <SettingRow
        label="RTL"
        selected={
          config.direction ===
          'rtl'
        }
        onClick={() =>
          updateConfig({
            direction:
              'rtl',
          })
        }
      />


      <SectionTitle>
        Navigation Style
      </SectionTitle>

      <SettingRow
        label="Vertical Menu"
        selected={
          config.navigationStyle ===
          'vertical'
        }
        onClick={() =>
          updateConfig({
            navigationStyle:
              'vertical',
          })
        }
      />

      <SettingRow
        label="Horizontal Click Menu"
        selected={
          config.navigationStyle ===
          'horizontal-click'
        }
        onClick={() =>
          updateConfig({
            navigationStyle:
              'horizontal-click',
          })
        }
      />

      <SettingRow
        label="Horizontal Hover Menu"
        selected={
          config.navigationStyle ===
          'horizontal-hover'
        }
        onClick={() =>
          updateConfig({
            navigationStyle:
              'horizontal-hover',
          })
        }
      />


      <SectionTitle>
        Theme Style
      </SectionTitle>

      <SettingRow
        label="Light Theme"
        selected={
          config.theme ===
          'light'
        }
        onClick={() =>
          updateConfig({
            theme:
              'light',
          })
        }
      />

      <SettingRow
        label="Dark Theme"
        selected={
          config.theme ===
          'dark'
        }
        onClick={() =>
          updateConfig({
            theme:
              'dark',
          })
        }
      />


      <SectionTitle>
        Theme Colors
      </SectionTitle>

      <ColorControl
        label="Theme Primary"
        value={
          config.primaryColor
        }
        onChange={(
          value
        ) =>
          updateConfig({
            primaryColor:
              value,
          })
        }
      />

      <ColorControl
        label="Theme Background"
        value={
          config.theme ===
          'dark'
            ? config.backgroundDark
            : config.backgroundLight
        }
        onChange={(
          value
        ) =>
          updateConfig(
            config.theme ===
              'dark'
              ? {
                  backgroundDark:
                    value,
                }
              : {
                  backgroundLight:
                    value,
                }
          )
        }
      />


      <div
        className="
          border-b
          border-[var(--bf-border)]
          px-4
          py-4
        "
      >
        <div
          className="
            text-[10px]
            font-semibold
            text-[var(--bf-text-3)]
          "
        >
          Quick Primary Presets
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
                onClick={() =>
                  updateConfig({
                    primaryColor:
                      preset.value,
                  })
                }
                className={cx(
                  `
                    relative
                    h-7
                    rounded-md
                    border
                    border-[var(--bf-border)]
                  `,
                  config.primaryColor ===
                    preset.value &&
                    'ring-2 ring-[var(--bf-primary)]'
                )}
                style={{
                  background:
                    preset.value,
                }}
              >
                {config.primaryColor ===
                  preset.value && (
                  <Check
                    size={12}
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
          value,
          label,
        ]) => (
          <SettingRow
            key={
              value
            }
            label={
              label
            }
            selected={
              config.sidebarStyle ===
              value
            }
            onClick={() =>
              updateConfig({
                sidebarStyle:
                  value,
              })
            }
          />
        )
      )}


      <SectionTitle>
        Header Styles
      </SectionTitle>

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
          value,
          label,
        ]) => (
          <SettingRow
            key={
              value
            }
            label={
              label
            }
            selected={
              config.headerStyle ===
              value
            }
            onClick={() =>
              updateConfig({
                headerStyle:
                  value,
              })
            }
          />
        )
      )}


      <SectionTitle>
        Skin Modes
      </SectionTitle>

      <SettingRow
        label="Shadow"
        selected={
          config.shadowMode ===
          'shadow'
        }
        onClick={() =>
          updateConfig({
            shadowMode:
              'shadow',
          })
        }
      />

      <SettingRow
        label="No-shadow"
        selected={
          config.shadowMode ===
          'no-shadow'
        }
        onClick={() =>
          updateConfig({
            shadowMode:
              'no-shadow',
          })
        }
      />


      <SectionTitle>
        Layout Width Styles
      </SectionTitle>

      <SettingRow
        label="Full Width"
        selected={
          config.layoutWidth ===
          'full'
        }
        onClick={() =>
          updateConfig({
            layoutWidth:
              'full',
          })
        }
      />

      <SettingRow
        label="Boxed"
        selected={
          config.layoutWidth ===
          'boxed'
        }
        onClick={() =>
          updateConfig({
            layoutWidth:
              'boxed',
          })
        }
      />


      <SectionTitle>
        Layout Positions
      </SectionTitle>

      <SettingRow
        label="Fixed"
        selected={
          config.layoutPosition ===
          'fixed'
        }
        onClick={() =>
          updateConfig({
            layoutPosition:
              'fixed',
          })
        }
      />

      <SettingRow
        label="Scrollable"
        selected={
          config.layoutPosition ===
          'scrollable'
        }
        onClick={() =>
          updateConfig({
            layoutPosition:
              'scrollable',
          })
        }
      />


      <SectionTitle>
        Sidemenu Layout Styles
      </SectionTitle>

      {[
        [
          'default',
          'Default Menu',
        ],

        [
          'closed',
          'Closed Menu',
        ],

        [
          'icon-text',
          'Icon with Text',
        ],

        [
          'icon-overlay',
          'Icon Overlay',
        ],

        [
          'hover-submenu',
          'Hover Submenu',
        ],

        [
          'hover-submenu-1',
          'Hover Submenu style 1',
        ],

        [
          'double',
          'Double Menu',
        ],

        [
          'double-tabs',
          'Double Menu with Tabs',
        ],
      ].map(
        ([
          value,
          label,
        ]) => (
          <SettingRow
            key={
              value
            }
            label={
              label
            }
            selected={
              config.sideMenuLayout ===
              value
            }
            onClick={() =>
              updateConfig({
                sideMenuLayout:
                  value,
              })
            }
          />
        )
      )}


      <SectionTitle>
        Reset All Styles
      </SectionTitle>

      <div
        className="
          px-4
          py-4
        "
      >
        <button
          type="button"
          onClick={
            resetConfig
          }
          className="
            h-10
            w-full
            rounded-md
            bg-red-500
            text-[11px]
            font-bold
            text-white
            transition
            hover:bg-red-600
          "
        >
          Reset All
        </button>
      </div>
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
  config,
  updateConfig,
  resetConfig,
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close drawer overlay"
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
              value,
              label,
            ]) => (
              <button
                key={
                  value
                }
                type="button"
                onClick={() =>
                  setActiveTab(
                    value
                  )
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
                    value
                    ? 'text-[var(--bf-primary)]'
                    : 'text-[var(--bf-text-2)]'
                )}
              >
                {label}

                {activeTab ===
                  value && (
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
            onClick={
              onClose
            }
            className="
              mr-2
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              text-[var(--bf-text-3)]
              transition
              hover:bg-[rgb(var(--bf-primary-rgb)/.06)]
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
              config={
                config
              }
              updateConfig={
                updateConfig
              }
              resetConfig={
                resetConfig
              }
            />
          )}
        </div>
      </aside>
    </>
  );
}


/* ============================================================
   FOOTER
============================================================ */

function DeveloperFooter() {
  return (
    <footer
      className="
        mt-auto
        border-t
        border-[var(--bf-border)]
        bg-[var(--bf-surface)]
        px-4
        py-4
        text-center
        text-[10px]
        text-[var(--bf-text-2)]
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          gap-1
          sm:flex-row
          sm:flex-wrap
          sm:gap-2
        "
      >
        <span>
          © 2026
        </span>

        <a
          href="https://www.instagram.com/buddy_computers"
          target="_blank"
          rel="noreferrer"
          className="
            font-bold
            text-[var(--bf-primary)]
            transition
            hover:underline
          "
        >
          BUDDYCOMPUTERS
        </a>

        <span>
          . All Rights Reserved.
        </span>

        <span
          className="
            hidden
            text-[var(--bf-text-3)]
            sm:inline
          "
        >
          •
        </span>

        <span
          className="
            font-semibold
          "
        >
          DESIGNED BY
        </span>

        <a
          href="https://www.instagram.com/happiest_banda"
          target="_blank"
          rel="noreferrer"
          className="
            font-bold
            text-[var(--bf-primary)]
            transition
            hover:underline
          "
        >
          SHUBHAM JANGIR
        </a>
      </div>
    </footer>
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
    config,
    setConfig,
  ] =
    useState(
      readThemeConfig
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
      config.drawerTab ||
      'settings'
    );


  const updateConfig =
    useCallback(
      (patch) => {
        setConfig(
          (current) => ({
            ...current,
            ...patch,
          })
        );
      },
      []
    );


  const resetConfig =
    useCallback(
      () => {
        setConfig({
          ...THEME_DEFAULTS,
        });

        setDrawerTab(
          THEME_DEFAULTS.drawerTab
        );
      },
      []
    );


  const vars =
    useMemo(
      () =>
        buildVars({
          config,
        }),
      [
        config,
      ]
    );


  useEffect(() => {
    writeThemeConfig({
      ...config,

      drawerTab:
        drawerTab,
    });
  }, [
    config,
    drawerTab,
  ]);


  useEffect(() => {
    document.documentElement.dir =
      config.direction;

    document.documentElement.style.colorScheme =
      config.theme;
  }, [
    config.direction,
    config.theme,
  ]);


  const boxed =
    config.layoutWidth ===
    'boxed';


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
        style={
          vars
        }
        dir={
          config.direction
        }
      >
        <Sidebar
          config={
            config
          }
          mobileOpen={
            mobileOpen
          }
          setMobileOpen={
            setMobileOpen
          }
        />


        <Header
          config={
            config
          }
          updateConfig={
            updateConfig
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
            setDrawerOpen(
              false
            )
          }
          activeTab={
            drawerTab
          }
          setActiveTab={
            setDrawerTab
          }
          config={
            config
          }
          updateConfig={
            updateConfig
          }
          resetConfig={
            resetConfig
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
            config.sidebarLockedOpen
              ? 'lg:pl-[var(--bf-sidebar-width)]'
              : 'lg:pl-[var(--bf-sidebar-collapsed)]'
          )}
        >
          <div
            className="
              flex
              min-h-[calc(100dvh-var(--bf-header-height))]
              flex-col
              bg-[var(--bf-page)]
            "
          >
            <div
              className={cx(
                `
                  min-w-0
                  flex-1
                `,
                boxed &&
                  `
                    mx-auto
                    w-full
                    max-w-[1380px]
                  `
              )}
            >
              <Outlet
                context={{
                  currentUser,
                  onLogout,

                  theme:
                    config.theme,

                  primary:
                    config.primaryColor,

                  sidebarStyle:
                    config.sidebarStyle,

                  headerStyle:
                    config.headerStyle,

                  themeConfig:
                    config,

                  openThemeSettings:
                    () => {
                      setDrawerTab(
                        'settings'
                      );

                      setDrawerOpen(
                        true
                      );
                    },
                }}
              />
            </div>

            <DeveloperFooter />
          </div>
        </main>
      </div>
    </>
  );
}
