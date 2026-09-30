import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Activity,
  AlignJustify,
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
  Edit3,
  EllipsisVertical,
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
  Share2,
  ServerCog,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Trash2,
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
const SIDEBAR_ICON_TEXT_W = 110;
const SIDEBAR_DOUBLE_RAIL_W = 80;
const SIDEBAR_DOUBLE_PANEL_W = 280;
const HEADER_H = 66;
const HORIZONTAL_NAV_H = 52;
const RIGHT_DRAWER_W = 302;


/* ============================================================
   FINAL DEFAULT THEME

   Reset All must always restore this exact Buddy Fleets preset:
   - Dark Theme
   - Dark Menu
   - Color Header
   - Primary #5551D7
   - Background #0E1929
   - Vertical / Default Menu
   - Sidebar open + locked
============================================================ */

const THEME_DEFAULTS = {
  direction:
    'ltr',

  navigationStyle:
    'vertical',

  horizontalLogo:
    'default',

  theme:
    'dark',

  primaryColor:
    '#5551D7',

  backgroundLight:
    '#ECECF3',

  backgroundDark:
    '#0E1929',

  sidebarStyle:
    'dark',

  headerStyle:
    'color',

  sideMenuLayout:
    'default',

  sidebarLockedOpen:
    true,

  themeDrawerTab:
    'theme',

  utilityDrawerTab:
    'recent',
};


const STORAGE = {
  // Deliberately shared with the Developer dashboard so the same theme engine
  // and preset persistence are used across the Buddy Fleets portal family.
  config:
    'bf_dev_theme_config_v4',
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


function nodeMatchesPath(
  pathname,
  node
) {
  const ownMatch =
    node?.to
      ? (
          node.end
            ? pathname === node.to
            : (
                pathname === node.to ||
                pathname.startsWith(
                  `${node.to}/`
                )
              )
        )
      : false;

  if (ownMatch) {
    return true;
  }

  return Array.isArray(
    node?.children
  )
    ? node.children.some(
        (child) =>
          nodeMatchesPath(
            pathname,
            child
          )
      )
    : false;
}


function pathIsInside(
  pathname,
  menu
) {
  return Array.isArray(
    menu?.children
  )
    ? menu.children.some(
        (child) =>
          nodeMatchesPath(
            pathname,
            child
          )
      )
    : false;
}


function activeMenuIdForPath(
  pathname,
  menuTree = [],
) {
  const found =
    menuTree.find(
      (menu) =>
        pathIsInside(
          pathname,
          menu
        )
    );

  return (
    found?.id ||
    menuTree[0]?.id ||
    ''
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
      ? '#F1F5F9'
      : '#20283A';

  const text2 =
    dark
      ? '#B6C2D2'
      : '#667085';

  const text3 =
    dark
      ? '#8F9CAF'
      : '#8793A8';

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
      : '#61708A';

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
      '#61708A';

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
    dark
      ? '0 3px 16px rgba(0,0,0,.22)'
      : '0 3px 16px rgba(15,23,42,.08)';


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

    '--bf-horizontal-nav-height':
      `${HORIZONTAL_NAV_H}px`,

    '--bf-sidebar-icon-text':
      `${SIDEBAR_ICON_TEXT_W}px`,

    '--bf-sidebar-double-rail':
      `${SIDEBAR_DOUBLE_RAIL_W}px`,

    '--bf-sidebar-double-panel':
      `${SIDEBAR_DOUBLE_PANEL_W}px`,

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
          color: var(--bf-header-text);
        }

        .bf-dev-header-bg .bf-header-main-text {
          color: var(--bf-header-text) !important;
        }

        .bf-dev-header-bg .bf-header-muted-text {
          color: var(--bf-header-muted) !important;
        }

        .bf-dev-gear {
          animation:
            bfGearSpin
            5s
            linear
            infinite;
        }

        @keyframes bfGearSpin {
          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

        .bf-dev-online-dot {
          position: absolute !important;
          z-index: 2;
          isolation: isolate;
        }

        .bf-dev-online-dot::after {
          content: '';
          position: absolute;
          inset: -1px;
          z-index: -1;
          border-radius: 999px;
          background: rgba(34, 197, 94, .34);
          pointer-events: none;
          animation:
            bfOnlineRadar
            1.8s
            ease-out
            infinite;
        }

        @keyframes bfOnlineRadar {
          0% {
            opacity: .85;
            transform:
              scale(.9);
          }

          75%,
          100% {
            opacity: 0;
            transform:
              scale(2.7);
          }
        }

        .bf-dev-sidebar-parent:hover,
        .bf-dev-sidebar-parent:hover svg,
        .bf-dev-sidebar-child:hover {
          color: var(--bf-primary) !important;
        }

        .bf-dev-horizontal-menu {
          box-shadow:
            0 1px 0
            var(--bf-border);
        }

        /*
          Reference typography scale.
          The existing DeveloperWorkspace uses many 8–13px utility
          classes; these overrides keep the same layout while making
          the dashboard readable like the reference theme.
        */
        .bf-dev-shell .text-\\[8px\\] {
          font-size: 10px !important;
          line-height: 1.35 !important;
        }

        .bf-dev-shell .text-\\[9px\\] {
          font-size: 11px !important;
          line-height: 1.4 !important;
        }

        .bf-dev-shell .text-\\[10px\\] {
          font-size: 12px !important;
          line-height: 1.45 !important;
        }

        .bf-dev-shell .text-\\[11px\\] {
          font-size: 13px !important;
          line-height: 1.45 !important;
        }

        .bf-dev-shell .text-\\[12px\\] {
          font-size: 13px !important;
          line-height: 1.45 !important;
        }

        .bf-dev-shell .text-\\[13px\\] {
          font-size: 14px !important;
          line-height: 1.45 !important;
        }

        .bf-dev-popover-surface {
          background: var(--bf-surface);
          color: var(--bf-text);
          box-shadow: 0 12px 32px rgba(15, 23, 42, .18);
        }

        .bf-dev-popover-arrow {
          position: absolute;
          top: -7px;
          right: 22px;
          width: 14px;
          height: 14px;
          transform: rotate(45deg);
          background: var(--bf-surface);
          border-left: 1px solid var(--bf-border);
          border-top: 1px solid var(--bf-border);
        }

        .bf-dev-sidebar-flyout {
          z-index: 140 !important;
          overflow: visible !important;
        }

        .bf-dev-sidebar-flyout-host {
          overflow: visible !important;
        }

        .bf-dev-profile-email {
          overflow-wrap: anywhere;
          word-break: break-word;
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

        /* Portal controls use the exact Developer header language. */
        .bf-dev-shell .bf-site-select {
          display: flex;
          height: 36px;
          min-width: 190px;
          max-width: 250px;
          align-items: center;
          gap: 7px;
          border: 1px solid var(--bf-header-border);
          border-radius: 6px;
          background: rgba(0,0,0,.10);
          color: var(--bf-header-text);
          padding: 0 10px;
        }

        .bf-dev-shell .bf-site-select svg {
          flex: 0 0 auto;
          color: var(--bf-header-muted);
        }

        .bf-dev-shell .bf-site-select select {
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--bf-header-text);
          font: inherit;
          font-size: 11px;
          font-weight: 600;
        }

        .bf-dev-shell .bf-site-select select option {
          background: var(--bf-surface);
          color: var(--bf-text);
        }

        .bf-dev-shell .bf-client-content {
          width: 100%;
          min-width: 0;
          padding: 0;
          background: transparent;
        }

        .bf-dev-shell .bf-page-head {
          margin-bottom: 20px;
        }

        .bf-dev-shell .bf-card {
          background: var(--bf-surface);
          border-color: var(--bf-border);
          box-shadow: var(--bf-shadow);
        }

        .bf-dev-shell .bf-card-head {
          border-bottom-color: var(--bf-border);
          background: transparent;
        }

        .bf-dev-shell .bf-table th {
          background: var(--bf-surface-2);
          color: var(--bf-text-3);
          border-bottom-color: var(--bf-border);
        }

        .bf-dev-shell .bf-table td {
          color: var(--bf-text-2);
          border-bottom-color: var(--bf-border);
        }

        .bf-dev-shell .bf-table .bf-clickable:hover td {
          background: rgb(var(--bf-primary-rgb)/.06);
        }

        .bf-dev-shell .bf-page-head h1,
        .bf-dev-shell .bf-card-head h3,
        .bf-dev-shell .bf-section-title {
          color: var(--bf-text);
        }

        .bf-dev-shell .bf-page-head p,
        .bf-dev-shell .bf-muted,
        .bf-dev-shell .bf-kpi-note {
          color: var(--bf-text-2);
        }

        .bf-dev-shell .bf-input,
        .bf-dev-shell .bf-select,
        .bf-dev-shell .bf-textarea {
          background: var(--bf-surface);
          color: var(--bf-text);
          border-color: var(--bf-border);
        }

        .bf-dev-shell .bf-btn-ghost {
          background: var(--bf-surface);
          color: var(--bf-text-2);
          border-color: var(--bf-border);
        }

        .bf-dev-shell .bf-tabs .bf-tab {
          background: var(--bf-surface);
          color: var(--bf-text-2);
          border-color: var(--bf-border);
        }

        .bf-dev-shell .bf-status {
          background: var(--bf-surface-3);
          color: var(--bf-text-2);
        }

        .bf-dev-shell .bf-status.active,
        .bf-dev-shell .bf-status.available,
        .bf-dev-shell .bf-status.paid,
        .bf-dev-shell .bf-status.delivered,
        .bf-dev-shell .bf-status.received {
          background: rgb(34 197 94 / .14);
          color: #4ade80;
        }

        .bf-dev-shell .bf-status.blocked,
        .bf-dev-shell .bf-status.expired,
        .bf-dev-shell .bf-status.cancelled {
          background: rgb(244 63 94 / .14);
          color: #fb7185;
        }

        .bf-dev-shell .bf-status.pending,
        .bf-dev-shell .bf-status.partial,
        .bf-dev-shell .bf-status.in_transit,
        .bf-dev-shell .bf-status.at_plant,
        .bf-dev-shell .bf-status.reserved {
          background: rgb(245 158 11 / .14);
          color: #fbbf24;
        }

        .bf-dev-shell .bf-status.maintenance {
          background: rgb(168 85 247 / .14);
          color: #c084fc;
        }

        .bf-dev-shell .bf-btn-secondary {
          background: rgb(var(--bf-primary-rgb)/.10);
          color: var(--bf-primary);
          border-color: rgb(var(--bf-primary-rgb)/.25);
        }

        .bf-dev-shell .bf-btn-danger {
          background: rgb(244 63 94 / .10);
          color: #fb7185;
          border-color: rgb(244 63 94 / .25);
        }

        .bf-dev-shell .bf-note {
          background: rgb(var(--bf-primary-rgb)/.08);
          color: var(--bf-text-2);
          border-color: rgb(var(--bf-primary-rgb)/.18);
        }

        .bf-dev-shell .bf-progress {
          background: var(--bf-surface-3);
        }

        .bf-dev-shell .bf-progress span {
          background: var(--bf-primary);
        }

        .bf-dev-shell .bf-modal {
          background: var(--bf-surface);
          color: var(--bf-text);
        }

        .bf-dev-shell .bf-modal-footer {
          background: var(--bf-surface-2);
          border-top-color: var(--bf-border);
        }

        .bf-dev-shell .bf-permission-row {
          background: var(--bf-surface);
          border-color: var(--bf-border);
        }

        .bf-dev-shell .bf-help,
        .bf-dev-shell .bf-action-checks label {
          color: var(--bf-text-3);
        }

        .bf-dev-shell .bf-list-row {
          border-bottom-color: var(--bf-border);
        }

        .bf-dev-shell .bf-toolbar {
          color: var(--bf-text);
        }

        .bf-dev-shell .bf-photo-avatar {
          background: rgb(var(--bf-primary-rgb)/.12);
          color: var(--bf-primary);
        }

        .bf-dev-shell .bf-tabs .bf-tab.active {
          background: var(--bf-primary);
          border-color: var(--bf-primary);
          color: #fff;
        }

        @media (max-width: 900px) {
          .bf-dev-shell .bf-site-select {
            min-width: 145px;
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
  brandName = 'Buddy Fleets',
  brandSubtitle = 'Portal',
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
          h-10
          w-10
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
            {brandName}
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
            {brandSubtitle}
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
          bf-dev-sidebar-parent
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

const BF_SUBMENU_TOGGLE_EVENT =
  'bf-dev-submenu-toggle';


function notifySiblingSubmenus({
  scope,
  key,
}) {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      BF_SUBMENU_TOGGLE_EVENT,
      {
        detail: {
          scope,
          key,
        },
      }
    )
  );
}


function ChildLink({
  child,
  collapsed,
  depth = 0,
}) {
  const location =
    useLocation();

  const hasChildren =
    Array.isArray(
      child.children
    ) &&
    child.children.length > 0;

  const active =
    nodeMatchesPath(
      location.pathname,
      child
    );

  const submenuKey =
    child.to ||
    child.label;

  const submenuScope =
    `sidebar-depth-${depth}`;

  const [
    expanded,
    setExpanded,
  ] =
    useState(
      active
    );

  useEffect(() => {
    if (
      active
    ) {
      setExpanded(
        true
      );
    }
  }, [
    location.pathname,
    active,
  ]);

  useEffect(() => {
    const handleSiblingToggle =
      (event) => {
        const detail =
          event?.detail;

        if (
          detail?.scope ===
            submenuScope &&
          detail?.key !==
            submenuKey
        ) {
          setExpanded(
            false
          );
        }
      };

    window.addEventListener(
      BF_SUBMENU_TOGGLE_EVENT,
      handleSiblingToggle
    );

    return () => {
      window.removeEventListener(
        BF_SUBMENU_TOGGLE_EVENT,
        handleSiblingToggle
      );
    };
  }, [
    submenuKey,
    submenuScope,
  ]);


  if (
    collapsed
  ) {
    if (
      hasChildren
    ) {
      return (
        <button
          type="button"
          title={child.label}
          aria-expanded={expanded}
          aria-label={`Toggle ${child.label}`}
          onClick={() => {
            const next =
              !expanded;

            if (next) {
              notifySiblingSubmenus({
                scope:
                  submenuScope,
                key:
                  submenuKey,
              });
            }

            setExpanded(
              next
            );
          }}
          className={cx(
            `
              bf-dev-sidebar-child
              relative
              flex
              min-h-[33px]
              w-full
              items-center
              justify-center
              rounded-md
              text-[12px]
              transition
              hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
              hover:text-[var(--bf-primary)]
            `,
            active
              ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
              : 'text-[var(--bf-sidebar-text)]'
          )}
        >
          <span
            className="
              h-[5px]
              w-[5px]
              rounded-full
              border
              border-current
            "
          />
        </button>
      );
    }

    return (
      <NavLink
        to={child.to}
        end={child.end}
        title={child.label}
        className={({ isActive }) =>
          cx(
            `
              bf-dev-sidebar-child
              relative
              flex
              min-h-[33px]
              items-center
              justify-center
              rounded-md
              text-[12px]
              transition
              hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
              hover:text-[var(--bf-primary)]
            `,
            isActive
              ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
              : 'text-[var(--bf-sidebar-text)]'
          )
        }
      >
        <span
          className="
            h-[5px]
            w-[5px]
            rounded-full
            border
            border-current
          "
        />
      </NavLink>
    );
  }


  if (
    hasChildren
  ) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`Toggle ${child.label}`}
          onClick={() => {
            const next =
              !expanded;

            if (next) {
              notifySiblingSubmenus({
                scope:
                  submenuScope,
                key:
                  submenuKey,
              });
            }

            setExpanded(
              next
            );
          }}
          className={cx(
            `
              bf-dev-sidebar-child
              group
              relative
              flex
              min-h-[35px]
              w-full
              items-center
              rounded-md
              pr-2
              text-left
              text-[12px]
              transition
              duration-150
              hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
              hover:text-[var(--bf-primary)]
            `,
            active
              ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
              : 'text-[var(--bf-sidebar-text)]'
          )}
          style={{
            paddingLeft:
              `${38 + depth * 16}px`,
          }}
        >
          <span
            className="
              absolute
              h-[5px]
              w-[5px]
              rounded-full
              border
              border-current
            "
            style={{
              left:
                `${18 + depth * 16}px`,
            }}
          />

          <span
            className="
              min-w-0
              flex-1
              truncate
            "
          >
            {child.label}
          </span>

          <ChevronDown
            size={12}
            className={cx(
              `
                ml-2
                shrink-0
                transition-transform
              `,
              expanded &&
                'rotate-180'
            )}
          />
        </button>

        {expanded && (
          <div>
            {child.children.map(
              (grandchild) => (
                <ChildLink
                  key={`${grandchild.label}-${grandchild.to}`}
                  child={grandchild}
                  collapsed={false}
                  depth={depth + 1}
                />
              )
            )}
          </div>
        )}
      </div>
    );
  }


  return (
    <NavLink
      to={child.to}
      end={child.end}
      className={({ isActive }) =>
        cx(
          `
            bf-dev-sidebar-child
            relative
            flex
            min-h-[35px]
            items-center
            rounded-md
            pr-2
            text-[12px]
            transition
            duration-150
            hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
            hover:text-[var(--bf-primary)]
          `,
          isActive
            ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
            : 'text-[var(--bf-sidebar-text)]'
        )
      }
      style={{
        paddingLeft:
          `${38 + depth * 16}px`,
      }}
    >
      <span
        className="
          absolute
          h-[5px]
          w-[5px]
          rounded-full
          border
          border-current
        "
        style={{
          left:
            `${18 + depth * 16}px`,
        }}
      />

      <span className="truncate">
        {child.label}
      </span>
    </NavLink>
  );
}


/* ============================================================
   SIDEBAR LAYOUT HELPERS
============================================================ */

function SidebarProfile({
  compact = false,
  currentUser,
  profileRole = 'Company Owner',
  profileMeta = '',
}) {
  const displayName = currentUser?.name || currentUser?.fullName || currentUser?.full_name || currentUser?.email || 'Portal User';
  const avatarUrl = currentUser?.avatar_url || currentUser?.avatarUrl || currentUser?.photoUrl || currentUser?.photoURL || null;
  const initials = getInitials(displayName);

  if (compact) {
    return (
      <div className="flex justify-center py-5">
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--bf-sidebar-border)] bg-[rgb(var(--bf-primary-rgb)/.10)] text-[10px] font-black text-[var(--bf-primary)]">
          {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : initials}
          <span className="bf-dev-online-dot absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bf-sidebar-solid)] bg-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-b border-[var(--bf-sidebar-border)] py-7 text-center">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[var(--bf-sidebar-border)] bg-[rgb(var(--bf-primary-rgb)/.10)] text-[13px] font-black text-[var(--bf-primary)]">
        {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : initials}
        <span className="bf-dev-online-dot absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--bf-sidebar-solid)] bg-emerald-500" />
      </div>
      <div className="mt-3 truncate px-3 text-[13px] font-bold text-[var(--bf-sidebar-text)]">{displayName}</div>
      <div className="mt-0.5 text-[10px] text-[var(--bf-sidebar-muted)]">{profileRole}</div>
      {profileMeta ? <div className="mt-0.5 truncate px-3 text-[9px] text-[var(--bf-sidebar-muted)]">{profileMeta}</div> : null}
    </div>
  );
}


function FlyoutNode({
  child,
  depth = 0,
}) {
  const location =
    useLocation();

  const hasChildren =
    Array.isArray(
      child.children
    ) &&
    child.children.length > 0;

  const active =
    nodeMatchesPath(
      location.pathname,
      child
    );

  const submenuKey =
    child.to ||
    child.label;

  const submenuScope =
    `flyout-depth-${depth}`;

  const [
    expanded,
    setExpanded,
  ] =
    useState(
      active
    );

  useEffect(() => {
    if (
      active
    ) {
      setExpanded(
        true
      );
    }
  }, [
    location.pathname,
    active,
  ]);

  useEffect(() => {
    const handleSiblingToggle =
      (event) => {
        const detail =
          event?.detail;

        if (
          detail?.scope ===
            submenuScope &&
          detail?.key !==
            submenuKey
        ) {
          setExpanded(
            false
          );
        }
      };

    window.addEventListener(
      BF_SUBMENU_TOGGLE_EVENT,
      handleSiblingToggle
    );

    return () => {
      window.removeEventListener(
        BF_SUBMENU_TOGGLE_EVENT,
        handleSiblingToggle
      );
    };
  }, [
    submenuKey,
    submenuScope,
  ]);


  if (
    hasChildren
  ) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`Toggle ${child.label}`}
          onClick={() => {
            const next =
              !expanded;

            if (next) {
              notifySiblingSubmenus({
                scope:
                  submenuScope,
                key:
                  submenuKey,
              });
            }

            setExpanded(
              next
            );
          }}
          className={cx(
            `
              flex
              min-h-[38px]
              w-full
              items-center
              gap-2
              px-4
              py-2.5
              text-left
              text-[11px]
              transition
              hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
              hover:text-[var(--bf-primary)]
            `,
            active
              ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
              : 'text-[var(--bf-text-2)]'
          )}
          style={{
            paddingLeft:
              `${16 + depth * 16}px`,
          }}
        >
          <span
            className="
              h-[5px]
              w-[5px]
              shrink-0
              rounded-full
              border
              border-current
            "
          />

          <span
            className="
              min-w-0
              flex-1
              truncate
            "
          >
            {child.label}
          </span>

          <ChevronDown
            size={12}
            className={cx(
              `
                shrink-0
                transition-transform
              `,
              expanded &&
                'rotate-180'
            )}
          />
        </button>

        {expanded && (
          <div
            className="
              border-l
              border-[var(--bf-border)]
              bg-[var(--bf-surface-2)]
            "
          >
            {child.children.map(
              (grandchild) => (
                <FlyoutNode
                  key={`${grandchild.label}-${grandchild.to}`}
                  child={grandchild}
                  depth={depth + 1}
                />
              )
            )}
          </div>
        )}
      </div>
    );
  }


  return (
    <NavLink
      to={child.to}
      end={child.end}
      className={({ isActive }) =>
        cx(
          `
            flex
            min-h-[38px]
            items-center
            gap-2
            px-4
            py-2.5
            text-[11px]
            transition
            hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
            hover:text-[var(--bf-primary)]
          `,
          isActive
            ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
            : 'text-[var(--bf-text-2)]'
        )
      }
      style={{
        paddingLeft:
          `${16 + depth * 16}px`,
      }}
    >
      <span
        className="
          h-[5px]
          w-[5px]
          shrink-0
          rounded-full
          border
          border-current
        "
      />

      <span className="truncate">
        {child.label}
      </span>
    </NavLink>
  );
}


function SidebarFlyout({
  menu,
  visible,
  title = true,
}) {
  if (
    !visible ||
    !menu
  ) {
    return null;
  }

  return (
    <div
      className="
        bf-dev-sidebar-flyout
        absolute
        left-full
        top-0
        z-[140]
        min-w-[210px]
        overflow-hidden
        rounded-r-md
        border
        border-[var(--bf-border)]
        bg-[var(--bf-surface)]
        shadow-[var(--bf-shadow)]
      "
    >
      {title && (
        <div
          className="
            border-b
            border-[var(--bf-border)]
            px-4
            py-3
            text-[11px]
            font-bold
            text-[var(--bf-text)]
          "
        >
          {menu.label}
        </div>
      )}

      <div
        className="
          py-2
        "
      >
        {menu.children.map(
          (child) => (
            <FlyoutNode
              key={`${child.label}-${child.to}`}
              child={child}
            />
          )
        )}
      </div>
    </div>
  );
}


function CompactMenuButton({
  menu,
  active,
  showLabel,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const Icon =
    menu.icon;

  return (
    <button
      type="button"
      title={
        showLabel
          ? undefined
          : menu.label
      }
      onMouseEnter={
        onMouseEnter
      }
      onMouseLeave={
        onMouseLeave
      }
      onClick={
        onClick
      }
      className={cx(
        `
          bf-dev-sidebar-parent
          relative
          flex
          w-full
          flex-col
          items-center
          justify-center
          gap-1
          rounded-md
          px-2
          py-2.5
          text-center
          transition
        `,
        active
          ? 'text-[var(--bf-primary)]'
          : 'text-[var(--bf-sidebar-text)] hover:text-[var(--bf-primary)]'
      )}
    >
      <Icon
        size={17}
      />

      {showLabel && (
        <span
          className="
            max-w-full
            truncate
            text-[10px]
          "
        >
          {menu.label}
        </span>
      )}
    </button>
  );
}


/* ============================================================
   VERTICAL SIDEBAR

   Supported layout modes:
   - default
   - closed
   - icon-text
   - icon-overlay
   - hover-submenu
   - hover-submenu-1
   - double
   - double-tabs
============================================================ */

function Sidebar({
  config,
  mobileOpen,
  setMobileOpen,
  menuTree = [],
  currentUser,
  brandName = 'Buddy Fleets',
  brandSubtitle = 'Portal',
  profileRole = 'Company Owner',
  profileMeta = '',
}) {
  const location =
    useLocation();

  const activeMenuId =
    activeMenuIdForPath(
      location.pathname,
      menuTree
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

  const [
    flyoutMenuId,
    setFlyoutMenuId,
  ] =
    useState(null);

  const [
    doubleMenuId,
    setDoubleMenuId,
  ] =
    useState(
      activeMenuId
    );


  useEffect(() => {
    setOpenMenuId(
      activeMenuId
    );

    setDoubleMenuId(
      activeMenuId
    );
  }, [
    activeMenuId,
  ]);

  useEffect(() => {
    setMobileOpen(false);
    // Reset transient navigation UI when React Router commits a new pathname.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlyoutMenuId(null);
  }, [location.pathname, setMobileOpen]);


  if (
    config.navigationStyle !==
    'vertical'
  ) {
    return null;
  }


  if (
    config.sideMenuLayout ===
    'closed'
  ) {
    return null;
  }


  const layout =
    config.sideMenuLayout;


  /*
     Default menu:
     open + locked by default.
     Hamburger controls lock state.
     Collapsed state expands temporarily on hover.

     Icon Overlay:
     always compact until mouse enters the sidebar.
  */

  const isDefault =
    layout ===
    'default';

  const isIconOverlay =
    layout ===
    'icon-overlay';

  const lockedOpen =
    isDefault
      ? config.sidebarLockedOpen
      : false;

  const visualExpandOnHover =
    isDefault ||
    isIconOverlay;

  const visuallyExpanded =
    isDefault
      ? (
          lockedOpen ||
          hoverExpanded
        )
      : isIconOverlay
        ? hoverExpanded
        : false;


  const isIconText =
    layout ===
    'icon-text';

  const isHoverMenu =
    layout ===
      'hover-submenu' ||
    layout ===
      'hover-submenu-1';

  const isHoverStyleOne =
    layout ===
    'hover-submenu-1';

  const isDouble =
    layout ===
      'double' ||
    layout ===
      'double-tabs';


  const widthClass =
    isDouble
      ? 'lg:w-[360px]'
      : isIconText ||
          (
            isHoverMenu &&
            !isHoverStyleOne
          )
        ? 'lg:w-[var(--bf-sidebar-icon-text)]'
        : visuallyExpanded
          ? 'lg:w-[var(--bf-sidebar-width)]'
          : 'lg:w-[var(--bf-sidebar-collapsed)]';


  const activeDoubleMenu =
    menuTree.find(
      (menu) =>
        menu.id ===
        doubleMenuId
    ) ||
    menuTree[0];


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
            visualExpandOnHover &&
            !lockedOpen
          ) {
            setHoverExpanded(
              true
            );
          }
        }}
        onMouseLeave={() => {
          if (
            visualExpandOnHover &&
            !lockedOpen
          ) {
            setHoverExpanded(
              false
            );
          }

          if (
            isHoverMenu
          ) {
            setFlyoutMenuId(
              null
            );
          }
        }}
        className={cx(
          `
            bf-dev-sidebar-bg
            fixed
            inset-y-0
            left-0
            z-[60]
            flex
            overflow-visible
            border-r
            border-[var(--bf-sidebar-border)]
            transition-[width,transform]
            duration-200
            ease-out
          `,
          widthClass,
          mobileOpen
            ? 'w-[var(--bf-sidebar-width)] translate-x-0'
            : 'w-[var(--bf-sidebar-width)] -translate-x-full lg:translate-x-0'
        )}
      >
        {isDouble ? (
          <>
            <div
              className="
                flex
                w-[var(--bf-sidebar-double-rail)]
                shrink-0
                flex-col
                border-r
                border-[var(--bf-sidebar-border)]
              "
            >
              <div
                className="
                  flex
                  h-[var(--bf-header-height)]
                  items-center
                  justify-center
                  border-b
                  border-[var(--bf-sidebar-border)]
                "
              >
                <Brand
                  collapsed
                  brandName={brandName}
                  brandSubtitle={brandSubtitle}
                />
              </div>

              <SidebarProfile
                compact
                currentUser={currentUser}
                profileRole={profileRole}
                profileMeta={profileMeta}
              />

              <div
                className="
                  bf-dev-scroll
                  flex-1
                  overflow-y-auto
                  px-2
                  py-3
                "
              >
                {menuTree.map(
                  (menu) => (
                    <CompactMenuButton
                      key={
                        menu.id
                      }
                      menu={
                        menu
                      }
                      active={
                        doubleMenuId ===
                        menu.id
                      }
                      showLabel={
                        false
                      }
                      onClick={() =>
                        setDoubleMenuId(
                          menu.id
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>


            <div
              className="
                flex
                w-[var(--bf-sidebar-double-panel)]
                min-w-0
                flex-1
                flex-col
                bg-[var(--bf-sidebar-solid)]
              "
            >
              {layout ===
                'double-tabs' && (
                <div
                  className="
                    grid
                    grid-cols-3
                    gap-2
                    border-b
                    border-[var(--bf-sidebar-border)]
                    p-3
                  "
                >
                  {menuTree
                    .slice(
                      0,
                      3
                    )
                    .map(
                      (menu) => {
                        const Icon =
                          menu.icon;

                        return (
                          <button
                            key={
                              menu.id
                            }
                            type="button"
                            onClick={() =>
                              setDoubleMenuId(
                                menu.id
                              )
                            }
                            className={cx(
                              `
                                flex
                                flex-col
                                items-center
                                gap-1
                                rounded-md
                                border
                                border-[var(--bf-sidebar-border)]
                                px-2
                                py-2
                                text-[9px]
                                transition
                              `,
                              doubleMenuId ===
                                menu.id
                                ? 'bg-[var(--bf-primary)] text-white'
                                : 'text-[var(--bf-sidebar-text)] hover:text-[var(--bf-primary)]'
                            )}
                          >
                            <Icon
                              size={14}
                            />

                            {menu.label
                              .split(' ')[0]}
                          </button>
                        );
                      }
                    )}
                </div>
              )}


              <div
                className="
                  border-b
                  border-[var(--bf-sidebar-border)]
                  px-5
                  py-4
                  text-[13px]
                  font-bold
                  text-[var(--bf-sidebar-text)]
                "
              >
                {
                  activeDoubleMenu.label
                }
              </div>


              <div
                className="
                  bf-dev-scroll
                  flex-1
                  overflow-y-auto
                  px-3
                  py-3
                "
              >
                {activeDoubleMenu.children.map(
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


                {layout ===
                  'double-tabs' && (
                  <div
                    className="
                      mt-5
                      space-y-3
                    "
                  >
                    <div
                      className="
                        text-[11px]
                        font-bold
                        text-[var(--bf-sidebar-text)]
                      "
                    >
                      Workspace Snapshot
                    </div>

                    {[
                      [
                        'Sites',
                        '24',
                      ],

                      [
                        'Modules',
                        '18',
                      ],

                      [
                        'Alerts',
                        '3',
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
                            rounded-md
                            border
                            border-[var(--bf-sidebar-border)]
                            p-3
                          "
                        >
                          <div
                            className="
                              text-[9px]
                              text-[var(--bf-sidebar-muted)]
                            "
                          >
                            {label}
                          </div>

                          <div
                            className="
                              mt-1
                              text-[18px]
                              font-bold
                              text-[var(--bf-sidebar-text)]
                            "
                          >
                            {value}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            className="
              relative
              flex
              min-w-0
              flex-1
              flex-col
            "
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
                (
                  visuallyExpanded ||
                  (
                    isHoverMenu &&
                    !isHoverStyleOne
                  )
                )
                  ? 'px-5'
                  : 'justify-center px-2'
              )}
            >
              <Brand collapsed={!visuallyExpanded} brandName={brandName} brandSubtitle={brandSubtitle} />
            </div>


            {isDefault &&
              visuallyExpanded && (
                <SidebarProfile currentUser={currentUser} profileRole={profileRole} profileMeta={profileMeta} />
              )}


            {(
              (
                isDefault &&
                !visuallyExpanded
              ) ||
              isIconOverlay ||
              isIconText ||
              isHoverMenu
            ) && (
              <SidebarProfile
                compact
                currentUser={currentUser}
                profileRole={profileRole}
                profileMeta={profileMeta}
              />
            )}


            <nav
              className={cx(
                `
                  bf-dev-scroll
                  flex-1
                  px-3
                  py-4
                `,
                (
                  isIconText ||
                  isHoverMenu
                )
                  ? 'bf-dev-sidebar-flyout-host overflow-visible'
                  : 'overflow-y-auto'
              )}
            >
              {isIconText ? (
                <div
                  className="
                    space-y-1
                  "
                >
                  {menuTree.map(
                    (menu) => (
                      <div
                        key={
                          menu.id
                        }
                        className="
                          relative
                        "
                      >
                        <CompactMenuButton
                          menu={
                            menu
                          }
                          active={
                            pathIsInside(
                              location.pathname,
                              menu
                            )
                          }
                          showLabel
                          onClick={() =>
                            setFlyoutMenuId(
                              flyoutMenuId ===
                                menu.id
                                ? null
                                : menu.id
                            )
                          }
                        />

                        <SidebarFlyout
                          menu={
                            menu
                          }
                          visible={
                            flyoutMenuId ===
                            menu.id
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              ) : isHoverMenu ? (
                <div
                  className="
                    space-y-1
                  "
                >
                  {menuTree.map(
                    (menu) => (
                      <div
                        key={
                          menu.id
                        }
                        className="
                          relative
                        "
                        onMouseEnter={() =>
                          setFlyoutMenuId(
                            menu.id
                          )
                        }
                      >
                        <CompactMenuButton
                          menu={
                            menu
                          }
                          active={
                            pathIsInside(
                              location.pathname,
                              menu
                            )
                          }
                          showLabel={
                            !isHoverStyleOne
                          }
                        />

                        <SidebarFlyout
                          menu={
                            menu
                          }
                          visible={
                            flyoutMenuId ===
                            menu.id
                          }
                          title={
                            true
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div
                  className="
                    space-y-1
                  "
                >
                  {menuTree.map(
                    (menu) => {
                      const active =
                        pathIsInside(
                          location.pathname,
                          menu
                        );

                      const expanded =
                        openMenuId ===
                        menu.id;

                      const compact =
                        !visuallyExpanded;

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
                            onToggle={() => {
                              if (
                                compact
                              ) {
                                return;
                              }

                              setOpenMenuId(
                                (current) =>
                                  current ===
                                  menu.id
                                    ? null
                                    : menu.id
                              );
                            }}
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
              )}
            </nav>
          </div>
        )}
      </aside>
    </>
  );
}


/* ============================================================
   HORIZONTAL NAVIGATION

   Click mode:
     click parent -> first tray
     child with nested items -> second tray on right

   Hover mode:
     hover parent -> first tray
     hover nested child -> second tray on right

   IMPORTANT:
   - Third-level items never stack vertically inside the first tray.
   - Nested items open in a separate right-side tray.
   - Existing vertical sidebar behavior remains unchanged.
============================================================ */

function HorizontalFlyoutNode({
  child,
  hoverMode,
  closeAll,
}) {
  const location =
    useLocation();

  const hasChildren =
    Array.isArray(
      child.children
    ) &&
    child.children.length > 0;

  const active =
    nodeMatchesPath(
      location.pathname,
      child
    );

  const submenuKey =
    child.to ||
    child.label;

  const submenuScope =
    'horizontal-nested';

  const [
    nestedOpen,
    setNestedOpen,
  ] =
    useState(
      active
    );

  useEffect(() => {
    if (
      active
    ) {
      setNestedOpen(
        true
      );
    } else {
      setNestedOpen(
        false
      );
    }
  }, [
    location.pathname,
    active,
  ]);

  useEffect(() => {
    const handleSiblingToggle =
      (event) => {
        const detail =
          event?.detail;

        if (
          detail?.scope ===
            submenuScope &&
          detail?.key !==
            submenuKey
        ) {
          setNestedOpen(
            false
          );
        }
      };

    window.addEventListener(
      BF_SUBMENU_TOGGLE_EVENT,
      handleSiblingToggle
    );

    return () => {
      window.removeEventListener(
        BF_SUBMENU_TOGGLE_EVENT,
        handleSiblingToggle
      );
    };
  }, [
    submenuKey,
  ]);


  return (
    <div
      className="
        relative
      "
      onMouseEnter={() => {
        if (
          hoverMode &&
          hasChildren
        ) {
          notifySiblingSubmenus({
            scope:
              submenuScope,
            key:
              submenuKey,
          });

          setNestedOpen(
            true
          );
        }
      }}
      onMouseLeave={() => {
        if (
          hoverMode &&
          hasChildren &&
          !active
        ) {
          setNestedOpen(
            false
          );
        }
      }}
    >
      {hasChildren ? (
        <button
          type="button"
          aria-expanded={nestedOpen}
          aria-label={`Toggle ${child.label}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            const next =
              !nestedOpen;

            if (next) {
              notifySiblingSubmenus({
                scope:
                  submenuScope,
                key:
                  submenuKey,
              });
            }

            setNestedOpen(
              next
            );
          }}
          className={cx(
            `
              flex
              min-h-[40px]
              w-full
              items-center
              gap-2
              px-4
              py-2.5
              text-left
              text-[11px]
              transition
              hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
              hover:text-[var(--bf-primary)]
            `,
            active
              ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
              : 'text-[var(--bf-text-2)]'
          )}
        >
          <span
            className="
              h-[5px]
              w-[5px]
              shrink-0
              rounded-full
              border
              border-current
            "
          />

          <span
            className="
              min-w-0
              flex-1
              truncate
            "
          >
            {child.label}
          </span>

          <ChevronRight
            size={13}
            className={cx(
              `
                shrink-0
                transition
              `,
              nestedOpen &&
                'text-[var(--bf-primary)]'
            )}
          />
        </button>
      ) : (
        <NavLink
          to={child.to}
          end={child.end}
          onClick={closeAll}
          className={({ isActive }) =>
            cx(
              `
                flex
                min-h-[40px]
                items-center
                gap-2
                px-4
                py-2.5
                text-[11px]
                transition
                hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
                hover:text-[var(--bf-primary)]
              `,
              isActive
                ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
                : 'text-[var(--bf-text-2)]'
            )
          }
        >
          <span
            className="
              h-[5px]
              w-[5px]
              shrink-0
              rounded-full
              border
              border-current
            "
          />

          <span
            className="
              min-w-0
              flex-1
              truncate
            "
          >
            {child.label}
          </span>
        </NavLink>
      )}

      {hasChildren &&
        nestedOpen && (
          <div
            className="
              absolute
              left-[calc(100%-2px)]
              top-0
              z-[100]
              min-w-[220px]
              overflow-visible
              rounded-md
              border
              border-[var(--bf-border)]
              bg-[var(--bf-surface)]
              shadow-[var(--bf-shadow)]
            "
          >
            <div
              className={cx(
                `
                  border-b
                  border-[var(--bf-border)]
                  px-4
                  py-3
                  text-[11px]
                  font-semibold
                `,
                active
                  ? 'bg-[rgb(var(--bf-primary-rgb)/.08)] text-[var(--bf-primary)]'
                  : 'text-[var(--bf-text)]'
              )}
            >
              {child.label}
            </div>

            <div className="py-1.5">
              {child.children.map(
                (grandchild) => (
                  <NavLink
                    key={`${grandchild.label}-${grandchild.to}`}
                    to={grandchild.to}
                    end={grandchild.end}
                    onClick={closeAll}
                    className={({ isActive }) =>
                      cx(
                        `
                          flex
                          min-h-[38px]
                          items-center
                          gap-2
                          px-4
                          py-2
                          text-[11px]
                          transition
                          hover:bg-[rgb(var(--bf-primary-rgb)/.08)]
                          hover:text-[var(--bf-primary)]
                        `,
                        isActive
                          ? 'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]'
                          : 'text-[var(--bf-text-2)]'
                      )
                    }
                  >
                    <span
                      className="
                        h-[5px]
                        w-[5px]
                        shrink-0
                        rounded-full
                        border
                        border-current
                      "
                    />

                    <span
                      className="
                        min-w-0
                        flex-1
                        truncate
                      "
                    >
                      {grandchild.label}
                    </span>
                  </NavLink>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}


function HorizontalNavigation({
  config,
  menuTree = [],
}) {
  const location =
    useLocation();

  const [
    openMenuId,
    setOpenMenuId,
  ] =
    useState(null);

  const hoverMode =
    config.navigationStyle ===
    'horizontal-hover';


  useEffect(() => {
    setOpenMenuId(
      null
    );
  }, [
    location.pathname,
    config.navigationStyle,
  ]);


  if (
    config.navigationStyle ===
    'vertical'
  ) {
    return null;
  }


  const closeAll =
    () => {
      setOpenMenuId(
        null
      );
    };


  return (
    <div
      className="
        bf-dev-horizontal-menu
        fixed
        left-0
        right-0
        top-[var(--bf-header-height)]
        z-20
        h-[var(--bf-horizontal-nav-height)]
        border-b
        border-[var(--bf-sidebar-border)]
        bg-[var(--bf-sidebar-solid)]
      "
      onMouseLeave={() => {
        if (
          hoverMode
        ) {
          setOpenMenuId(
            null
          );
        }
      }}
    >
      <div
        className="
          bf-dev-scroll
          mx-auto
          flex
          h-full
          max-w-[1500px]
          items-center
          gap-1
          overflow-visible
          px-4
        "
      >
        {menuTree.map(
          (menu) => {
            const Icon =
              menu.icon;

            const active =
              pathIsInside(
                location.pathname,
                menu
              );

            const open =
              openMenuId ===
              menu.id;

            return (
              <div
                key={
                  menu.id
                }
                className="
                  relative
                  shrink-0
                "
                onMouseEnter={() => {
                  if (
                    hoverMode
                  ) {
                    setOpenMenuId(
                      menu.id
                    );
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (
                      hoverMode &&
                      window.matchMedia(
                        '(hover: hover)'
                      ).matches
                    ) {
                      return;
                    }

                    setOpenMenuId(
                      (current) =>
                        current ===
                        menu.id
                          ? null
                          : menu.id
                    );
                  }}
                  className={cx(
                    `
                      flex
                      h-9
                      items-center
                      gap-2
                      rounded-md
                      px-3
                      text-[11px]
                      font-medium
                      transition
                      hover:text-[var(--bf-primary)]
                    `,
                    active
                      ? 'text-[var(--bf-primary)]'
                      : 'text-[var(--bf-sidebar-text)]'
                  )}
                >
                  <Icon
                    size={15}
                  />

                  <span>
                    {menu.label}
                  </span>

                  <ChevronDown
                    size={11}
                    className={cx(
                      `
                        transition-transform
                      `,
                      open &&
                        'rotate-180'
                    )}
                  />
                </button>


                {open && (
                  <div
                    className="
                      absolute
                      left-0
                      top-[calc(100%+7px)]
                      z-[90]
                      min-w-[230px]
                      overflow-visible
                      rounded-md
                      border
                      border-[var(--bf-border)]
                      bg-[var(--bf-surface)]
                      shadow-[var(--bf-shadow)]
                    "
                  >
                    <div
                      className="
                        py-1.5
                      "
                    >
                      {menu.children.map(
                        (child) => (
                          <HorizontalFlyoutNode
                            key={`${child.label}-${child.to}`}
                            child={child}
                            hoverMode={hoverMode}
                            closeAll={closeAll}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
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
  align = 'right',
}) {
  return (
    <div
      className={cx(
        `
          bf-dev-pop
          absolute
          top-[calc(100%+10px)]
          z-[120]
        `,
        align === 'left'
          ? 'left-0'
          : 'right-0'
      )}
      style={{
        width,
        maxWidth:
          'calc(100vw - 24px)',
      }}
    >
      <span
        className="
          bf-dev-popover-arrow
        "
      />

      <div
        className="
          bf-dev-popover-surface
          overflow-hidden
          rounded-md
          border
          border-[var(--bf-border)]
        "
      >
        {children}
      </div>
    </div>
  );
}


/* ============================================================
   MESSAGES POPOVER
============================================================ */

function MessagesPopover() {
  return (
    <Popover width={405}>
      <div className="flex items-center justify-between border-b border-[var(--bf-border)] px-5 py-4">
        <div className="text-[13px] font-semibold text-[var(--bf-primary)]">Messages</div>
        <span className="rounded-full bg-[var(--bf-primary)] px-2.5 py-1 text-[10px] font-bold text-white">Workspace</span>
      </div>
      <div className="bf-dev-scroll max-h-[335px] overflow-y-auto">
        {[
          ['Workspace ready','Your secure portal workspace is active.','Now'],
          ['Navigation updated','Available modules are ready to use.','Today'],
          ['Support available','Use your account controls for profile and settings.','Today'],
        ].map(([title,text,time]) => (
          <div key={title} className="flex gap-3 border-b border-[var(--bf-border)] px-4 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--bf-primary-rgb)/.12)] text-[11px] font-black text-[var(--bf-primary)]">BF</div>
            <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold text-[var(--bf-text)]">{title}</div><div className="mt-1 text-[11px] leading-5 text-[var(--bf-text-2)]">{text}</div></div>
            <span className="text-[9px] text-[var(--bf-text-3)]">{time}</span>
          </div>
        ))}
      </div>
    </Popover>
  );
}


function NotificationsPopover() {
  return (
    <Popover width={360}>
      <div className="flex items-center justify-between border-b border-[var(--bf-border)] px-5 py-4">
        <div className="text-[13px] font-semibold text-[var(--bf-primary)]">Notifications</div>
        <span className="rounded-full bg-[var(--bf-primary)] px-2.5 py-1 text-[10px] font-bold text-white">Live</span>
      </div>
      <div className="bf-dev-scroll max-h-[340px] overflow-y-auto">
        {[
          ['Secure session active','Your authenticated portal session is verified.',ShieldCheck],
          ['Workspace ready','Your fleet workspace and authorized modules are loaded.',BadgeCheck],
          ['Recent activity','New workspace activity will appear here.',Activity],
        ].map(([title,meta,Icon]) => (
          <div key={title} className="flex items-center gap-3 border-b border-[var(--bf-border)] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--bf-primary-rgb)/.12)] text-[var(--bf-primary)]"><Icon size={16}/></div>
            <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold text-[var(--bf-text)]">{title}</div><div className="mt-1 text-[10px] leading-4 text-[var(--bf-text-3)]">{meta}</div></div>
          </div>
        ))}
      </div>
    </Popover>
  );
}


function SearchPopover() {
  const inputRef =
    useRef(null);

  const [
    query,
    setQuery,
  ] =
    useState('');


  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          inputRef.current?.focus();
        },
        50
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);


  const submitSearch =
    (event) => {
      event.preventDefault();

      /*
        Shell search UI is intentionally route-agnostic.
        The input remains ready for future global-search wiring.
      */
    };


  return (
    <Popover
      width={315}
    >
      <form
        onSubmit={
          submitSearch
        }
        className="
          p-3
        "
      >
        <div
          className="
            flex
            overflow-hidden
            rounded-md
            border
            border-[var(--bf-border)]
            bg-[var(--bf-surface)]
          "
        >
          <input
            ref={
              inputRef
            }
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
            type="search"
            placeholder="Search....."
            className="
              h-11
              min-w-0
              flex-1
              bg-transparent
              px-4
              text-[13px]
              text-[var(--bf-text)]
              outline-none
              placeholder:text-[var(--bf-text-3)]
            "
          />

          <button
            type="submit"
            aria-label="Search"
            className="
              flex
              h-11
              w-12
              shrink-0
              items-center
              justify-center
              bg-[var(--bf-primary)]
              text-white
            "
          >
            <Search
              size={18}
            />
          </button>
        </div>
      </form>
    </Popover>
  );
}


function UserAvatar({
  currentUser,
  size = 'md',
  showStatus = false,
}) {
  const name =
    currentUser?.name ||
    currentUser?.fullName ||
    'Portal User';

  const avatarUrl =
    currentUser?.avatar_url ||
    currentUser?.avatarUrl ||
    currentUser?.photoURL ||
    currentUser?.photoUrl ||
    currentUser?.image ||
    null;

  const sizeClass =
    size === 'lg'
      ? 'h-14 w-14'
      : size === 'sm'
        ? 'h-9 w-9'
        : 'h-10 w-10';


  return (
    <div
      className={cx(
        `
          relative
          flex
          shrink-0
          items-center
          justify-center
          overflow-visible
          rounded-full
          border
          border-[var(--bf-border)]
          bg-[rgb(var(--bf-primary-rgb)/.12)]
          font-black
          text-[var(--bf-primary)]
        `,
        sizeClass
      )}
    >
      {avatarUrl ? (
        <img
          src={
            avatarUrl
          }
          alt={
            name
          }
          className="
            h-full
            w-full
            rounded-full
            object-cover
          "
        />
      ) : (
        <span>
          {getInitials(
            name
          )}
        </span>
      )}

      {showStatus && (
        <span
          className="
            bf-dev-online-dot
            absolute
            -right-0.5
            -top-0.5
            h-2.5
            w-2.5
            rounded-full
            border-2
            border-[var(--bf-surface)]
            bg-emerald-500
          "
        />
      )}
    </div>
  );
}


function ProfilePopover({
  currentUser,
  onLogout,
  onClose,
  profileActions = [],
}) {
  const navigate = useNavigate();
  const displayName = currentUser?.name || currentUser?.fullName || currentUser?.full_name || currentUser?.email || 'Portal User';
  const email = currentUser?.email || '';

  return (
    <Popover width={300}>
      <div className="border-b border-[var(--bf-border)] px-5 py-4 text-center">
        <div className="flex justify-center"><UserAvatar currentUser={currentUser} size="lg" showStatus /></div>
        <div className="mt-3 text-[15px] font-semibold text-[var(--bf-text)]">{displayName}</div>
        {email ? <div className="bf-dev-profile-email mx-auto mt-1 max-w-[250px] text-[11px] text-[var(--bf-text-3)]">{email}</div> : null}
      </div>
      <div className="py-2">
        {profileActions.map((item) => {
          const Icon = item.icon || User;
          return (
            <button
              key={item.id || item.label}
              type="button"
              onClick={() => {
                if (item.onClick) item.onClick();
                else if (item.to) navigate(item.to);
                onClose?.();
              }}
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] font-medium text-[var(--bf-text-2)] transition hover:bg-[rgb(var(--bf-primary-rgb)/.06)] hover:text-[var(--bf-primary)]"
            >
              <Icon size={16} className="shrink-0 text-[var(--bf-primary)]" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <div className="my-2 border-t border-[var(--bf-border)]" />
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] font-medium text-[var(--bf-text-2)] transition hover:bg-rose-500/10 hover:text-rose-500">
          <LogOut size={16} className="shrink-0 text-[var(--bf-primary)]" />
          <span>Sign out</span>
        </button>
      </div>
    </Popover>
  );
}


/* ============================================================
   LAYOUT OFFSET
============================================================ */


function getSidebarOffset(
  config
) {
  if (
    config.navigationStyle !==
    'vertical'
  ) {
    return 0;
  }

  switch (
    config.sideMenuLayout
  ) {
    case 'closed':
      return 0;

    case 'icon-text':
      return SIDEBAR_ICON_TEXT_W;

    case 'icon-overlay':
      return SIDEBAR_COLLAPSED_W;

    case 'hover-submenu':
      return SIDEBAR_ICON_TEXT_W;

    case 'hover-submenu-1':
      return SIDEBAR_COLLAPSED_W;

    case 'double':
    case 'double-tabs':
      return (
        SIDEBAR_DOUBLE_RAIL_W +
        SIDEBAR_DOUBLE_PANEL_W
      );

    case 'default':
    default:
      return config.sidebarLockedOpen
        ? SIDEBAR_W
        : SIDEBAR_COLLAPSED_W;
  }
}


/* ============================================================
   HORIZONTAL HEADER BRAND
============================================================ */

function HorizontalHeaderBrand({
  centered,
  brandName = 'Buddy Fleets',
}) {
  return (
    <div
      className={cx(
        `
          flex
          items-center
          gap-2
          text-[var(--bf-header-text)]
        `,
        centered &&
          `
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
          `
      )}
    >
      <div
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          bg-white/15
          text-[9px]
          font-black
          text-white
        "
      >
        BF
      </div>

      <div
        className="
          text-[18px]
          font-black
          tracking-[-0.03em]
        "
      >
        {brandName}
      </div>
    </div>
  );
}


/* ============================================================
   HEADER

   Important:
   - Theme switch changes content + menu theme.
   - Header style stays independent.
   - 3-lines icon opens Utility drawer.
   - Rotating gear opens Theme Customizer ONLY.
============================================================ */

function SessionCountdown() {
  const [expiresAt, setExpiresAt] = useState(null);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && data?.ok && data?.session?.expiresAt) {
          setExpiresAt(new Date(data.session.expiresAt).getTime());
        }
      } catch {
        // Session authority remains server-side; timer is display-only.
      }
    };
    sync();
    const poll = window.setInterval(sync, 60000);
    return () => { cancelled = true; window.clearInterval(poll); };
  }, []);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (remaining === null) return null;
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return (
    <div className="hidden min-w-[112px] rounded-md border border-white/15 bg-black/10 px-2.5 py-1.5 text-right xl:block">
      <div className="text-[8px] font-bold uppercase tracking-[.12em] text-[var(--bf-header-muted)]">Session</div>
      <div className="text-[11px] font-bold tabular-nums text-[var(--bf-header-text)]">{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</div>
    </div>
  );
}


function Header({
  config,
  menuTree = [],
  brandName = 'Buddy Fleets',
  portalLabel = 'Portal',
  headerSubLabel = '',
  headerExtra = null,
  profileActions = [],
  updateConfig,
  setMobileOpen,
  currentUser,
  onLogout,
  openPopover,
  setOpenPopover,
  utilityDrawerOpen,
  setUtilityDrawerOpen,
  themeDrawerOpen,
  setThemeDrawerOpen,
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
    'Portal User';


  const horizontal =
    config.navigationStyle !==
    'vertical';


  const centerLogo =
    horizontal &&
    config.horizontalLogo ===
      'center';


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
      setUtilityDrawerOpen(
        false
      );

      setThemeDrawerOpen(
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
        // Fullscreen can be denied by browser/OS.
      }
    };


  const handleSidebarToggle =
    () => {
      if (
        horizontal
      ) {
        return;
      }

      if (
        window.innerWidth <
        1024
      ) {
        setMobileOpen(
          true
        );

        return;
      }

      /*
        Default menu supports locked open/collapsed.
        Icon Overlay is hover-driven by design.
      */
      if (
        config.sideMenuLayout ===
        'default'
      ) {
        updateConfig({
          sidebarLockedOpen:
            !config.sidebarLockedOpen,
        });
      }
    };


  return (
    <header
      className="
        bf-dev-header-bg
        fixed
        left-0
        right-0
        top-0
        z-30
        h-[var(--bf-header-height)]
        border-b
        border-[var(--bf-header-border)]
        transition-[left]
        duration-200
        ease-out
        lg:left-[var(--bf-main-offset)]
      "
    >
      <div
        ref={
          rootRef
        }
        className="
          relative
          flex
          h-full
          items-center
          px-4
        "
      >
        {!horizontal && (
          <HeaderIcon
            label="Toggle menu"
            onClick={
              handleSidebarToggle
            }
          >
            <Menu
              size={19}
            />
          </HeaderIcon>
        )}


        {horizontal &&
          !centerLogo && (
            <HorizontalHeaderBrand centered={false} brandName={brandName} />
          )}


        {centerLogo && (
          <HorizontalHeaderBrand centered brandName={brandName} />
        )}


        <div
          className={cx(
            `
              hidden
              items-center
              gap-1.5
              text-[13px]
              font-semibold
              text-[var(--bf-header-text)]
              md:flex
            `,
            horizontal
              ? 'ml-5'
              : 'ml-4'
          )}
        >
          <span>{portalLabel}</span>

          <ChevronDown
            size={12}
            className="
              text-[var(--bf-header-muted)]
            "
          />
        </div>


        {headerSubLabel ? (
          <div className="hidden max-w-[250px] truncate text-[10px] text-[var(--bf-header-muted)] lg:block">{headerSubLabel}</div>
        ) : null}

        <div
          className="
            ml-auto
            flex
            items-center
            gap-2
          "
        >
          <SessionCountdown />

          {headerExtra}

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
                size={19}
              />
            ) : (
              <Maximize2
                size={19}
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
                size={19}
              />
            ) : (
              <Moon
                size={19}
              />
            )}
          </HeaderIcon>


          <div
            className="
              relative
            "
          >
            <HeaderIcon
              label="Search"
              active={
                openPopover ===
                'search'
              }
              onClick={() =>
                togglePopover(
                  'search'
                )
              }
            >
              <Search
                size={19}
              />
            </HeaderIcon>

            {openPopover ===
              'search' && (
              <SearchPopover />
            )}
          </div>


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
                size={19}
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
                size={19}
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
                h-11
                items-center
                gap-2.5
                rounded-md
                px-2
                text-[var(--bf-header-text)]
                transition
                hover:bg-black/10
              "
            >
              <span
                className="
                  hidden
                  max-w-[145px]
                  truncate
                  text-[13px]
                  font-semibold
                  xl:block
                "
              >
                {name}
              </span>

              <UserAvatar
                currentUser={
                  currentUser
                }
                size="sm"
              />

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
                onClose={() => setOpenPopover(null)}
                profileActions={profileActions}
              />
            )}
          </div>


          <HeaderIcon
            label="Open utility panel"
            active={
              utilityDrawerOpen
            }
            onClick={() => {
              setOpenPopover(
                null
              );

              setThemeDrawerOpen(
                false
              );

              setUtilityDrawerOpen(
                (current) =>
                  !current
              );
            }}
          >
            <AlignJustify
              size={19}
            />
          </HeaderIcon>


          <HeaderIcon
            label="Open theme settings"
            active={
              themeDrawerOpen
            }
            onClick={() => {
              setOpenPopover(
                null
              );

              setUtilityDrawerOpen(
                false
              );

              setThemeDrawerOpen(
                (current) =>
                  !current
              );
            }}
          >
            <Settings
              size={19}
              className="
                bf-dev-gear
              "
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
          border
          border-[var(--bf-border)]
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
            top-[2px]
            h-4
            w-4
            rounded-full
            bg-white
            shadow
            transition
          `,
          value
            ? 'left-[18px]'
            : 'left-[3px]'
        )}
      />
    </button>
  );
}


/* ============================================================
   COMMON DRAWER UI
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
   THEME CUSTOMIZER
   Gear icon opens ONLY this drawer.
============================================================ */

function ThemeSettings({
  config,
  updateConfig,
  resetConfig,
}) {
  const horizontal =
    config.navigationStyle !==
    'vertical';

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


      {horizontal && (
        <>
          <SectionTitle>
            Horizontal Layout Styles
          </SectionTitle>

          <SettingRow
            label="Default Logo"
            selected={
              config.horizontalLogo ===
              'default'
            }
            onClick={() =>
              updateConfig({
                horizontalLogo:
                  'default',
              })
            }
          />

          <SettingRow
            label="Center Logo"
            selected={
              config.horizontalLogo ===
              'center'
            }
            onClick={() =>
              updateConfig({
                horizontalLogo:
                  'center',
              })
            }
          />
        </>
      )}


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


      {!horizontal && (
        <>
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
        </>
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
   UTILITY DRAWER — RECENT
============================================================ */

function UtilityRecentTab() {
  const items = [
    ['Workspace loaded','Secure portal initialized.','Now'],
    ['Modules ready','Authorized modules are available.','Today'],
    ['Session verified','Authentication is active.','Today'],
    ['Activity center','Recent workspace activity will appear here.','Today'],
  ];
  return <div>{items.map(([title,description,time])=><div key={title} className="flex gap-3 border-b border-[var(--bf-border)] px-4 py-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--bf-primary-rgb)/.12)] text-[9px] font-black text-[var(--bf-primary)]">BF</div><div className="min-w-0 flex-1"><div className="text-[12px] font-semibold text-[var(--bf-text)]">{title}</div><div className="mt-1 text-[10px] leading-4 text-[var(--bf-text-2)]">{description}</div></div><span className="text-[9px] text-[var(--bf-text-3)]">{time}</span></div>)}</div>;
}


function UtilityContactsTab() {
  const contacts = [
    ['Account Owner','Workspace owner','AO',true],
    ['Operations Team','Workspace support','OT',true],
    ['Support','Customer support','SU',false],
  ];
  return <div>{contacts.map(([name,meta,initials,online])=><div key={name} className="relative flex items-center gap-3 border-b border-[var(--bf-border)] px-4 py-3.5"><div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--bf-primary-rgb)/.12)] text-[10px] font-black text-[var(--bf-primary)]">{initials}{online?<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--bf-surface)] bg-emerald-500"/>:null}</div><div><div className="text-[12px] font-semibold text-[var(--bf-text)]">{name}</div><div className="mt-0.5 text-[10px] text-[var(--bf-text-3)]">{meta}</div></div></div>)}</div>;
}


function UtilitySettingsTab() {
  const [state,setState] = useState({notifications:false,mails:false,taskStats:false,recentActivity:false,systemLogs:false,errorReporting:false,showStatus:false,keepUpdated:false});
  const setFlag=(key,value)=>setState(current=>({...current,[key]:value}));
  const rows=[
    ['Notifications','notifications'],
    ['Show messages','mails'],
    ['Show task statistics','taskStats'],
    ['Show recent activity','recentActivity'],
    ['System logs','systemLogs'],
    ['Error reporting','errorReporting'],
    ['Show your status','showStatus'],
    ['Keep up to date','keepUpdated'],
  ];
  const overview=[
    ['Workspace Health',92],
    ['Module Availability',86],
    ['Active Operations',74],
    ['Data Readiness',95],
    ['Security Status',100],
  ];
  return <div>
    <div className="border-b border-[var(--bf-border)] bg-[var(--bf-surface-2)] px-2 py-2 text-[12px] font-semibold text-[var(--bf-text)]">General Settings</div>
    <div className="py-2">{rows.map(([label,key])=><div key={key} className="flex items-center justify-between gap-3 px-4 py-2"><span className="text-[10px] text-[var(--bf-text-2)]">{label}</span><Switch label={label} value={state[key]} onChange={value=>setFlag(key,value)}/></div>)}</div>
    <div className="border-y border-[var(--bf-border)] bg-[var(--bf-surface-2)] px-2 py-2 text-[12px] font-semibold text-[var(--bf-text)]">Workspace Overview</div>
    <div className="space-y-5 px-4 py-4">{overview.map(([label,percent])=><div key={label}><div className="flex items-center justify-between gap-3"><span className="text-[10px] text-[var(--bf-text-2)]">{label}</span><span className="text-[10px] text-[var(--bf-text-3)]">{percent}%</span></div><div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[var(--bf-surface-3)]"><div className="h-full bg-[var(--bf-primary)]" style={{width:`${percent}%`}}/></div></div>)}</div>
  </div>;
}


function UtilityDrawer({
  open,
  onClose,
  activeTab,
  setActiveTab,
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close utility drawer"
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
            h-[58px]
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
                    text-[10px]
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
              hover:bg-[var(--bf-surface-2)]
            "
          >
            <X
              size={14}
            />
          </button>
        </div>


        <div
          className="
            bf-dev-scroll
            h-[calc(100dvh-58px)]
            overflow-y-auto
          "
        >
          {activeTab ===
            'recent' && (
            <UtilityRecentTab />
          )}

          {activeTab ===
            'contacts' && (
            <UtilityContactsTab />
          )}

          {activeTab ===
            'settings' && (
            <UtilitySettingsTab />
          )}
        </div>
      </aside>
    </>
  );
}


/* ============================================================
   THEME DRAWER
   Opened ONLY by the rotating gear icon.
============================================================ */

function ThemeDrawer({
  open,
  onClose,
  config,
  updateConfig,
  resetConfig,
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close theme customizer"
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
            z-[72]
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
            h-[58px]
            items-center
            justify-between
            border-b
            border-[var(--bf-border)]
            px-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-[11px]
              font-bold
              text-[var(--bf-text)]
            "
          >
            <Settings
              size={15}
              className="
                bf-dev-gear
                text-[var(--bf-primary)]
              "
            />

            Theme Settings
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              text-[var(--bf-text-3)]
              hover:bg-[var(--bf-surface-2)]
            "
          >
            <X
              size={14}
            />
          </button>
        </div>


        <div
          className="
            bf-dev-scroll
            h-[calc(100dvh-58px)]
            overflow-y-auto
          "
        >
          <ThemeSettings
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
        </div>
      </aside>
    </>
  );
}



/* ============================================================
   FOOTER
============================================================ */

function PortalShellFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--bf-border)] bg-[var(--bf-surface)] px-5 py-4 text-center text-[13px] text-[var(--bf-text-2)]">
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 leading-5">
        <span>© 2026</span>
        <a href="https://www.instagram.com/buddy_computers" target="_blank" rel="noreferrer" className="font-semibold text-[var(--bf-primary)] transition hover:underline">BUDDYCOMPUTERS</a>
        <span>. All Rights Reserved.</span>
        <span className="text-[var(--bf-text-3)]">•</span>
        <span>DESIGNED BY</span>
        <a href="https://www.instagram.com/happiest_banda" target="_blank" rel="noreferrer" className="font-semibold text-[var(--bf-primary)] transition hover:underline">SHUBHAM JANGIR</a>
      </div>
    </footer>
  );
}


/* ============================================================
   ROOT
============================================================ */

export default function UniversalDashboardShell({
  currentUser,
  onLogout,
  menuTree = [],
  brandName = 'Buddy Fleets',
  brandSubtitle = 'Portal',
  portalLabel = 'Portal',
  headerSubLabel = '',
  headerExtra = null,
  profileActions = [],
  profileRole = 'Company Owner',
  profileMeta = '',
  footer = null,
  children,
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
    utilityDrawerOpen,
    setUtilityDrawerOpen,
  ] =
    useState(false);

  const [
    utilityDrawerTab,
    setUtilityDrawerTab,
  ] =
    useState(
      config.utilityDrawerTab ||
      'recent'
    );

  const [
    themeDrawerOpen,
    setThemeDrawerOpen,
  ] =
    useState(false);


  /*
     CENTRAL LIVE THEME ENGINE

     Requirement:
     - Any Theme Settings change must update the current scene immediately.
     - Light Theme automatically uses Light Menu.
     - Dark Theme automatically uses Dark Menu.
     - Header Style remains independent and must NOT change with Theme Style.
  */
  const updateConfig =
    useCallback(
      (patch) => {
        setConfig(
          (current) => {
            const requested =
              typeof patch ===
              'function'
                ? patch(current)
                : patch;

            const next = {
              ...current,
              ...requested,
            };

            if (
              Object.prototype.hasOwnProperty.call(
                requested,
                'theme'
              ) &&
              requested.theme !==
                current.theme
            ) {
              next.sidebarStyle =
                requested.theme ===
                'dark'
                  ? 'dark'
                  : 'light';

              /*
                Header must preserve its selected style.
                Color Header stays Color Header in both themes.
              */
              next.headerStyle =
                current.headerStyle;
            }

            return next;
          }
        );
      },
      []
    );


  /*
     Reset always restores the locked Buddy Fleets DARK preset.
  */
  const resetConfig =
    useCallback(
      () => {
        setConfig({
          ...THEME_DEFAULTS,
        });

        setUtilityDrawerTab(
          THEME_DEFAULTS.utilityDrawerTab
        );

        setOpenPopover(
          null
        );
      },
      []
    );


  const vars =
    useMemo(
      () => {
        const base =
          buildVars({
            config,
          });

        return {
          ...base,

          '--bf-main-offset':
            `${getSidebarOffset(
              config
            )}px`,
        };
      },
      [
        config,
      ]
    );


  useEffect(() => {
    writeThemeConfig({
      ...config,

      utilityDrawerTab:
        utilityDrawerTab,
    });
  }, [
    config,
    utilityDrawerTab,
  ]);


  useEffect(() => {
    document.documentElement.dir =
      config.direction;

    /*
      Keep visual colors fully controlled by our tokens.
      Browser color-scheme must not unexpectedly recolor the header.
    */
    document.documentElement.dataset.bfTheme =
      config.theme;
  }, [
    config.direction,
    config.theme,
  ]);


  const horizontal =
    config.navigationStyle !==
    'vertical';


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
          config={config}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          menuTree={menuTree}
          currentUser={currentUser}
          brandName={brandName}
          brandSubtitle={brandSubtitle}
          profileRole={profileRole}
          profileMeta={profileMeta}
        />


        <Header
          config={config}
          menuTree={menuTree}
          brandName={brandName}
          portalLabel={portalLabel}
          headerSubLabel={headerSubLabel}
          headerExtra={headerExtra}
          profileActions={profileActions}
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
          utilityDrawerOpen={
            utilityDrawerOpen
          }
          setUtilityDrawerOpen={
            setUtilityDrawerOpen
          }
          themeDrawerOpen={
            themeDrawerOpen
          }
          setThemeDrawerOpen={
            setThemeDrawerOpen
          }
        />


        <HorizontalNavigation
          config={config}
          menuTree={menuTree}
        />


        <UtilityDrawer
          open={
            utilityDrawerOpen
          }
          onClose={() =>
            setUtilityDrawerOpen(
              false
            )
          }
          activeTab={
            utilityDrawerTab
          }
          setActiveTab={
            setUtilityDrawerTab
          }
        />


        <ThemeDrawer
          open={
            themeDrawerOpen
          }
          onClose={() =>
            setThemeDrawerOpen(
              false
            )
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
              transition-[padding-left,padding-top]
              duration-200
              lg:pl-[var(--bf-main-offset)]
            `,
            horizontal
              ? 'pt-[calc(var(--bf-header-height)+var(--bf-horizontal-nav-height))]'
              : 'pt-[var(--bf-header-height)]'
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
              className="
                min-w-0
                flex-1
              "
            >
              {children}
            </div>

            {footer || <PortalShellFooter />}
          </div>
        </main>
      </div>
    </>
  );
}
