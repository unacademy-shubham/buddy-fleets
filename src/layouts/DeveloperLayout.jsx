import React, {
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
  Blocks,
  Boxes,
  Building2,
  Cable,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileClock,
  Flag,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  PanelsTopLeft,
  ServerCog,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  Workflow,
  X,
} from 'lucide-react';


/* ============================================================
   BUDDY FLEETS
   DEVELOPER PORTAL LAYOUT

   Route host:
   developer.buddyfleets.in

   Purpose:
   - Developer / Super Admin shell
   - URL-driven navigation
   - Shared Buddy Fleets theme preference
   - Responsive sidebar
   - Dedicated developer portal chrome
============================================================ */


/* ============================================================
   THEME
============================================================ */

const THEME_STORAGE_KEY =
  'buddy_fleets_theme';

const THEME_SWITCH_CLASS =
  'bf-theme-switching';


function getInitialTheme() {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined'
  ) {
    return 'dark';
  }

  const saved =
    window.localStorage.getItem(
      THEME_STORAGE_KEY
    );

  const theme =
    saved === 'light' ||
    saved === 'dark'
      ? saved
      : 'dark';

  document.documentElement.dataset.theme =
    theme;

  document.documentElement.style.colorScheme =
    theme;

  return theme;
}


/* ============================================================
   NAVIGATION
============================================================ */

const NAVIGATION = [
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


/* ============================================================
   HELPERS
============================================================ */

function cx(
  ...classes
) {
  return classes
    .filter(Boolean)
    .join(' ');
}


function getPageDetails(
  pathname
) {
  const exact =
    NAVIGATION
      .flatMap(
        (group) =>
          group.items
      )
      .find(
        (item) =>
          item.to ===
          pathname
      );

  if (exact) {
    return exact;
  }

  const matches =
    NAVIGATION
      .flatMap(
        (group) =>
          group.items
      )
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
    matches[0] || {
      label:
        'Developer Portal',

      icon:
        LayoutDashboard,
    }
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
      className="
        flex
        min-w-0
        items-center
        gap-3
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-[14px]
          bg-gradient-to-br
          from-[#0450A5]
          via-[#079BE5]
          to-[#0AA23B]
          text-white
          shadow-lg
          shadow-blue-950/20
        "
      >
        <span
          className="
            select-none
            text-[24px]
            font-black
            leading-none
            tracking-[-0.09em]
          "
          style={{
            transform:
              'scaleX(1.08)',
          }}
        >
          BF
        </span>
      </div>

      {!collapsed && (
        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex
              items-center
              text-[19px]
              font-black
              tracking-tight
            "
          >
            <span
              className="
                bg-gradient-to-r
                from-[#12BFF2]
                to-[#078EE5]
                bg-clip-text
                text-transparent
              "
            >
              Buddy
            </span>

            <span
              className="
                ml-1
                bg-gradient-to-r
                from-[#19B63F]
                to-[#07872B]
                bg-clip-text
                text-transparent
              "
            >
              Fleets
            </span>
          </div>

          <p
            className="
              mt-0.5
              truncate
              text-[9px]
              font-black
              uppercase
              tracking-[0.19em]
              text-[var(--bf-dev-muted)]
            "
          >
            Developer CPanel
          </p>
        </div>
      )}
    </div>
  );
}


/* ============================================================
   NAV ITEM
============================================================ */

function SidebarItem({
  item,
  collapsed,
  onNavigate,
}) {
  const Icon =
    item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
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
            min-h-[44px]
            items-center
            rounded-[14px]
            border
            text-[12px]
            font-bold
            transition
            duration-200
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-cyan-400/60
          `,

          collapsed
            ? `
                justify-center
                px-2
              `
            : `
                gap-3
                px-3.5
              `,

          isActive
            ? `
                border-[var(--bf-dev-active-border)]
                bg-[var(--bf-dev-active-bg)]
                text-[var(--bf-dev-text)]
                shadow-sm
              `
            : `
                border-transparent
                text-[var(--bf-dev-muted)]
                hover:border-[var(--bf-dev-border)]
                hover:bg-[var(--bf-dev-hover)]
                hover:text-[var(--bf-dev-text)]
              `
        )
      }
    >
      {({
        isActive,
      }) => (
        <>
          {isActive && (
            <span
              className="
                absolute
                left-0
                top-1/2
                h-5
                w-[3px]
                -translate-y-1/2
                rounded-r-full
                bg-gradient-to-b
                from-cyan-400
                to-emerald-400
              "
            />
          )}

          <Icon
            size={17}
            strokeWidth={
              isActive
                ? 2.25
                : 1.8
            }
            className={
              isActive
                ? 'text-cyan-500'
                : ''
            }
          />

          {!collapsed && (
            <>
              <span
                className="
                  min-w-0
                  flex-1
                  truncate
                "
              >
                {item.label}
              </span>

              {isActive && (
                <ChevronRight
                  size={13}
                  className="
                    text-cyan-500
                  "
                />
              )}
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
          aria-label="Close sidebar overlay"
          onClick={() =>
            setMobileOpen(false)
          }
          className="
            fixed
            inset-0
            z-40
            bg-black/55
            backdrop-blur-sm
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
            border-[var(--bf-dev-border)]
            bg-[var(--bf-dev-sidebar)]
            shadow-2xl
            backdrop-blur-2xl
            transition-[width,transform]
            duration-300
          `,

          collapsed
            ? `
                lg:w-[82px]
              `
            : `
                lg:w-[280px]
              `,

          mobileOpen
            ? `
                w-[280px]
                translate-x-0
              `
            : `
                w-[280px]
                -translate-x-full
                lg:translate-x-0
              `
        )}
      >
        <div
          className={cx(
            `
              flex
              h-[72px]
              shrink-0
              items-center
              border-b
              border-[var(--bf-dev-border)]
            `,

            collapsed
              ? `
                  justify-center
                  px-3
                `
              : `
                  justify-between
                  px-4
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
              onClick={() =>
                setMobileOpen(false)
              }
              aria-label="Close sidebar"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--bf-dev-border)]
                text-[var(--bf-dev-muted)]
                hover:bg-[var(--bf-dev-hover)]
                hover:text-[var(--bf-dev-text)]
                lg:hidden
              "
            >
              <X
                size={17}
              />
            </button>
          )}
        </div>

        <div
          className="
            flex-1
            overflow-y-auto
            overscroll-contain
            px-3
            py-4
            [scrollbar-width:thin]
          "
        >
          <div
            className="
              space-y-5
            "
          >
            {NAVIGATION.map(
              (group) => (
                <div
                  key={
                    group.label
                  }
                >
                  {!collapsed && (
                    <p
                      className="
                        mb-2
                        px-3
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-[var(--bf-dev-subtle)]
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
                          onNavigate={() =>
                            setMobileOpen(
                              false
                            )
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div
          className="
            hidden
            border-t
            border-[var(--bf-dev-border)]
            p-3
            lg:block
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
                flex
                h-10
                w-full
                items-center
                rounded-xl
                border
                border-[var(--bf-dev-border)]
                text-[11px]
                font-bold
                text-[var(--bf-dev-muted)]
                transition
                hover:bg-[var(--bf-dev-hover)]
                hover:text-[var(--bf-dev-text)]
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
   TOP HEADER
============================================================ */

function TopHeader({
  collapsed,
  setMobileOpen,
  theme,
  toggleTheme,
  currentUser,
  onLogout,
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

  const Icon =
    page.icon ||
    LayoutDashboard;

  const [
    profileOpen,
    setProfileOpen,
  ] =
    useState(false);

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

  return (
    <header
      className={cx(
        `
          fixed
          right-0
          top-0
          z-30
          h-[72px]
          border-b
          border-[var(--bf-dev-border)]
          bg-[var(--bf-dev-header)]
          backdrop-blur-2xl
          transition-[left]
          duration-300
        `,

        collapsed
          ? `
              left-0
              lg:left-[82px]
            `
          : `
              left-0
              lg:left-[280px]
            `
      )}
    >
      <div
        className="
          flex
          h-full
          items-center
          justify-between
          gap-3
          px-4
          sm:px-5
          lg:px-6
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <button
            type="button"
            onClick={() =>
              setMobileOpen(true)
            }
            aria-label="Open sidebar"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--bf-dev-border)]
              bg-[var(--bf-dev-card)]
              text-[var(--bf-dev-muted)]
              lg:hidden
            "
          >
            <Menu
              size={18}
            />
          </button>

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            <div
              className="
                hidden
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--bf-dev-border)]
                bg-[var(--bf-dev-card)]
                text-cyan-500
                sm:flex
              "
            >
              <Icon
                size={18}
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  truncate
                  text-[14px]
                  font-black
                  text-[var(--bf-dev-text)]
                  sm:text-[15px]
                "
              >
                {page.label}
              </p>

              <p
                className="
                  mt-0.5
                  hidden
                  text-[10px]
                  font-semibold
                  text-[var(--bf-dev-subtle)]
                  sm:block
                "
              >
                Buddy Fleets Platform Control
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          <div
            className="
              hidden
              items-center
              gap-2
              rounded-xl
              border
              border-emerald-400/15
              bg-emerald-400/[0.06]
              px-3
              py-2
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              text-emerald-500
              md:flex
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-500
                shadow-[0_0_10px_currentColor]
              "
            />

            Production
          </div>

          <button
            type="button"
            onClick={
              toggleTheme
            }
            aria-label={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
            title={
              theme === 'dark'
                ? 'Light theme'
                : 'Dark theme'
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--bf-dev-border)]
              bg-[var(--bf-dev-card)]
              text-[var(--bf-dev-muted)]
              transition
              hover:border-cyan-400/30
              hover:text-cyan-500
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-cyan-400/60
            "
          >
            {theme === 'dark' ? (
              <Sun
                size={17}
              />
            ) : (
              <Moon
                size={17}
              />
            )}
          </button>

          <div
            className="
              relative
            "
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (previous) =>
                    !previous
                )
              }
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-[var(--bf-dev-border)]
                bg-[var(--bf-dev-card)]
                px-2
                text-left
                transition
                hover:bg-[var(--bf-dev-hover)]
                sm:px-3
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
                  bg-gradient-to-br
                  from-cyan-500
                  to-emerald-500
                  text-[10px]
                  font-black
                  text-white
                "
              >
                {String(
                  displayName
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div
                className="
                  hidden
                  max-w-[160px]
                  sm:block
                "
              >
                <p
                  className="
                    truncate
                    text-[11px]
                    font-black
                    text-[var(--bf-dev-text)]
                  "
                >
                  {displayName}
                </p>

                <p
                  className="
                    truncate
                    text-[9px]
                    text-[var(--bf-dev-subtle)]
                  "
                >
                  SUPER_ADMIN
                </p>
              </div>

              <ChevronDown
                size={13}
                className="
                  hidden
                  text-[var(--bf-dev-subtle)]
                  sm:block
                "
              />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="
                    fixed
                    inset-0
                    z-40
                  "
                />

                <div
                  className="
                    absolute
                    right-0
                    top-[48px]
                    z-50
                    w-[260px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-popover)]
                    shadow-2xl
                    shadow-black/20
                    backdrop-blur-2xl
                  "
                >
                  <div
                    className="
                      border-b
                      border-[var(--bf-dev-border)]
                      p-4
                    "
                  >
                    <p
                      className="
                        text-[12px]
                        font-black
                        text-[var(--bf-dev-text)]
                      "
                    >
                      {displayName}
                    </p>

                    <p
                      className="
                        mt-1
                        truncate
                        text-[10px]
                        text-[var(--bf-dev-muted)]
                      "
                    >
                      {displayEmail}
                    </p>
                  </div>

                  <div
                    className="
                      p-2
                    "
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(
                          false
                        );

                        onLogout?.();
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        text-[11px]
                        font-bold
                        text-rose-500
                        transition
                        hover:bg-rose-500/[0.07]
                      "
                    >
                      <LogOut
                        size={15}
                      />

                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


/* ============================================================
   LAYOUT
============================================================ */

export default function DeveloperLayout({
  currentUser,
  onLogout,
}) {
  const [
    collapsed,
    setCollapsed,
  ] =
    useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  const [
    theme,
    setTheme,
  ] =
    useState(
      getInitialTheme
    );

  const themeFrameOneRef =
    useRef(null);

  const themeFrameTwoRef =
    useRef(null);

  const isDark =
    theme === 'dark';


  /* ========================================================
     APPLY THEME
  ======================================================== */

  useLayoutEffect(() => {
    const root =
      document.documentElement;

    root.dataset.theme =
      theme;

    root.style.colorScheme =
      theme;

    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      theme
    );
  }, [
    theme,
  ]);


  /* ========================================================
     CLEANUP
  ======================================================== */

  useEffect(() => {
    return () => {
      if (
        themeFrameOneRef.current
      ) {
        window.cancelAnimationFrame(
          themeFrameOneRef.current
        );
      }

      if (
        themeFrameTwoRef.current
      ) {
        window.cancelAnimationFrame(
          themeFrameTwoRef.current
        );
      }

      document.documentElement
        .classList
        .remove(
          THEME_SWITCH_CLASS
        );
    };
  }, []);


  /* ========================================================
     THEME TOGGLE
  ======================================================== */

  const toggleTheme = () => {
    const nextTheme =
      isDark
        ? 'light'
        : 'dark';

    const root =
      document.documentElement;

    if (
      themeFrameOneRef.current
    ) {
      window.cancelAnimationFrame(
        themeFrameOneRef.current
      );
    }

    if (
      themeFrameTwoRef.current
    ) {
      window.cancelAnimationFrame(
        themeFrameTwoRef.current
      );
    }

    root.classList.add(
      THEME_SWITCH_CLASS
    );

    root.dataset.theme =
      nextTheme;

    root.style.colorScheme =
      nextTheme;

    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme
    );

    setTheme(
      nextTheme
    );

    themeFrameOneRef.current =
      window.requestAnimationFrame(
        () => {
          themeFrameTwoRef.current =
            window.requestAnimationFrame(
              () => {
                root.classList.remove(
                  THEME_SWITCH_CLASS
                );

                themeFrameOneRef.current =
                  null;

                themeFrameTwoRef.current =
                  null;
              }
            );
        }
      );
  };


  return (
    <>
      <style>
        {`
          html.${THEME_SWITCH_CLASS},
          html.${THEME_SWITCH_CLASS} *,
          html.${THEME_SWITCH_CLASS} *::before,
          html.${THEME_SWITCH_CLASS} *::after {
            transition-property: none !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }

          html[data-theme='dark'] {
            --bf-dev-page: #050914;
            --bf-dev-sidebar: rgba(5, 9, 20, 0.96);
            --bf-dev-header: rgba(5, 9, 20, 0.88);
            --bf-dev-card: rgba(255, 255, 255, 0.035);
            --bf-dev-popover: rgba(8, 14, 27, 0.98);

            --bf-dev-text: #f8fafc;
            --bf-dev-muted: #94a3b8;
            --bf-dev-subtle: #64748b;

            --bf-dev-border: rgba(255, 255, 255, 0.075);
            --bf-dev-hover: rgba(255, 255, 255, 0.045);

            --bf-dev-active-bg: rgba(14, 165, 233, 0.10);
            --bf-dev-active-border: rgba(34, 211, 238, 0.20);
          }

          html[data-theme='light'] {
            --bf-dev-page: #f4f9fd;
            --bf-dev-sidebar: rgba(255, 255, 255, 0.96);
            --bf-dev-header: rgba(255, 255, 255, 0.88);
            --bf-dev-card: rgba(255, 255, 255, 0.86);
            --bf-dev-popover: rgba(255, 255, 255, 0.98);

            --bf-dev-text: #0f172a;
            --bf-dev-muted: #475569;
            --bf-dev-subtle: #94a3b8;

            --bf-dev-border: rgba(14, 74, 120, 0.10);
            --bf-dev-hover: rgba(2, 132, 199, 0.055);

            --bf-dev-active-bg: rgba(2, 132, 199, 0.08);
            --bf-dev-active-border: rgba(2, 132, 199, 0.18);
          }
        `}
      </style>

      <div
        className="
          min-h-screen
          min-h-[100dvh]
          bg-[var(--bf-dev-page)]
          font-sans
          text-[var(--bf-dev-text)]
          transition-colors
        "
      >
        <div
          className="
            pointer-events-none
            fixed
            inset-0
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              left-[-180px]
              top-[-190px]
              h-[420px]
              w-[420px]
              rounded-full
              bg-cyan-400/[0.055]
              blur-[120px]
            "
          />

          <div
            className="
              absolute
              bottom-[-220px]
              right-[-200px]
              h-[520px]
              w-[520px]
              rounded-full
              bg-emerald-400/[0.045]
              blur-[150px]
            "
          />
        </div>

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

        <TopHeader
          collapsed={
            collapsed
          }
          setMobileOpen={
            setMobileOpen
          }
          theme={
            theme
          }
          toggleTheme={
            toggleTheme
          }
          currentUser={
            currentUser
          }
          onLogout={
            onLogout
          }
        />

        <main
          className={cx(
            `
              relative
              min-h-[100dvh]
              pt-[72px]
              transition-[padding-left]
              duration-300
            `,

            collapsed
              ? `
                  lg:pl-[82px]
                `
              : `
                  lg:pl-[280px]
                `
          )}
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1800px]
              px-4
              py-5
              sm:px-5
              sm:py-6
              lg:px-6
              lg:py-7
              xl:px-8
            "
          >
            <Outlet
              context={{
                currentUser,
                onLogout,
                theme,
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}