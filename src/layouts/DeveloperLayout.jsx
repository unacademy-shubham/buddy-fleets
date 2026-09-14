import React, {
  useEffect,
  useMemo,
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  FileClock,
  Flag,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelsTopLeft,
  Search,
  ServerCog,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from 'lucide-react';

/* ============================================================
   BUDDY FLEETS
   DEVELOPER CPANEL — PROFESSIONAL SINGLE-THEME SHELL

   Design:
   - Clean enterprise light theme
   - WordPress / premium SaaS admin density
   - Compact sidebar + topbar
   - URL-based navigation
   - No theme switcher
============================================================ */

const SIDEBAR_STORAGE_KEY =
  'buddy_fleets_developer_sidebar';

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

const ALL_ITEMS =
  NAV_GROUPS.flatMap(
    (group) => group.items
  );

function cx(...classes) {
  return classes
    .filter(Boolean)
    .join(' ');
}

function getInitialSidebar() {
  if (
    typeof window ===
    'undefined'
  ) {
    return false;
  }

  return (
    window.localStorage.getItem(
      SIDEBAR_STORAGE_KEY
    ) === 'collapsed'
  );
}

function getCurrentPage(
  pathname
) {
  const exact =
    ALL_ITEMS.find(
      (item) =>
        item.to === pathname
    );

  if (exact) {
    return exact;
  }

  const nested =
    ALL_ITEMS
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
    ).trim();

  if (!text) {
    return 'SA';
  }

  const parts =
    text.split(
      /\s+/
    );

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
          rounded-xl
          bg-gradient-to-br
          from-[#0878dd]
          via-[#0a91e7]
          to-[#13a447]
          text-[12px]
          font-black
          text-white
          shadow-sm
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
              text-[15px]
              font-extrabold
              tracking-tight
              text-slate-900
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
              text-slate-400
            "
          >
            Developer CPanel
          </div>
        </div>
      )}
    </div>
  );
}

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
            min-h-[40px]
            items-center
            rounded-lg
            border
            text-[12px]
            font-semibold
            transition
            duration-150
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-400/40
          `,
          collapsed
            ? `
                justify-center
                px-2
              `
            : `
                gap-2.5
                px-3
              `,
          isActive
            ? `
                border-blue-100
                bg-blue-50
                text-[#0b65b8]
              `
            : `
                border-transparent
                text-slate-600
                hover:border-slate-200
                hover:bg-slate-50
                hover:text-slate-900
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
                bg-[#1495e5]
              "
            />
          )}

          <Icon
            size={16}
            className={
              isActive
                ? 'text-[#0b84d8]'
                : 'text-slate-500'
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
                  size={12}
                  className="
                    text-[#0b84d8]
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

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const location =
    useLocation();

  useEffect(() => {
    setMobileOpen(
      false
    );
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
            setMobileOpen(
              false
            )
          }
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/35
            backdrop-blur-[1px]
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
            border-slate-200
            bg-white
            shadow-sm
            transition-[width,transform]
            duration-200
          `,
          collapsed
            ? 'lg:w-[70px]'
            : 'lg:w-[250px]',
          mobileOpen
            ? 'w-[250px] translate-x-0'
            : 'w-[250px] -translate-x-full lg:translate-x-0'
        )}
      >
        <div
          className={cx(
            `
              flex
              h-[62px]
              shrink-0
              items-center
              border-b
              border-slate-200
            `,
            collapsed
              ? 'justify-center px-2'
              : 'justify-between px-4'
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
                setMobileOpen(
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
                border-slate-200
                text-slate-500
                hover:bg-slate-50
                lg:hidden
              "
            >
              <X
                size={15}
              />
            </button>
          )}
        </div>

        <nav
          className="
            flex-1
            overflow-y-auto
            px-2.5
            py-4
            [scrollbar-width:thin]
          "
        >
          <div
            className="
              space-y-4
            "
          >
            {NAV_GROUPS.map(
              (group) => (
                <div
                  key={
                    group.label
                  }
                >
                  {!collapsed && (
                    <p
                      className="
                        mb-1.5
                        px-2.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-slate-400
                      "
                    >
                      {group.label}
                    </p>
                  )}

                  <div
                    className="
                      space-y-0.5
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
        </nav>

        <div
          className="
            border-t
            border-slate-200
            bg-slate-50/70
            p-2.5
          "
        >
          <button
            type="button"
            onClick={() =>
              setCollapsed(
                (value) =>
                  !value
              )
            }
            className={cx(
              `
                hidden
                h-9
                w-full
                items-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-[11px]
                font-semibold
                text-slate-600
                hover:bg-slate-50
                lg:flex
              `,
              collapsed
                ? 'justify-center'
                : 'justify-between px-3'
            )}
          >
            {!collapsed && (
              <span>
                Collapse menu
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

function UserMenu({
  currentUser,
  onLogout,
}) {
  const [
    open,
    setOpen,
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
    'Developer account';

  return (
    <div
      className="
        relative
      "
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) =>
              !value
          )
        }
        className="
          flex
          h-10
          min-w-0
          items-center
          gap-2
          rounded-lg
          border
          border-slate-200
          bg-white
          px-2
          hover:bg-slate-50
          sm:min-w-[195px]
        "
      >
        <div
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-gradient-to-br
            from-[#128fe5]
            to-[#13a447]
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
            min-w-0
            flex-1
            text-left
            sm:block
          "
        >
          <div
            className="
              truncate
              text-[10px]
              font-bold
              text-slate-900
            "
          >
            {displayName}
          </div>

          <div
            className="
              mt-0.5
              text-[8px]
              font-bold
              uppercase
              tracking-[0.07em]
              text-slate-400
            "
          >
            SUPER_ADMIN
          </div>
        </div>

        <ChevronDown
          size={12}
          className="
            hidden
            text-slate-400
            sm:block
          "
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close user menu"
            className="
              fixed
              inset-0
              z-40
            "
            onClick={() =>
              setOpen(false)
            }
          />

          <div
            className="
              absolute
              right-0
              top-[46px]
              z-50
              w-[270px]
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-xl
              shadow-slate-900/10
            "
          >
            <div
              className="
                border-b
                border-slate-200
                p-4
              "
            >
              <div
                className="
                  text-[11px]
                  font-bold
                  text-slate-900
                "
              >
                {displayName}
              </div>

              <div
                className="
                  mt-1
                  truncate
                  text-[10px]
                  text-slate-500
                "
              >
                {displayEmail}
              </div>
            </div>

            <div
              className="
                p-2
              "
            >
              <button
                type="button"
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-lg
                  px-3
                  py-2.5
                  text-[11px]
                  font-medium
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                <Settings
                  size={14}
                />
                Account settings
              </button>

              <button
                type="button"
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-lg
                  px-3
                  py-2.5
                  text-[11px]
                  font-medium
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                <HelpCircle
                  size={14}
                />
                Help & documentation
              </button>

              <div
                className="
                  my-1.5
                  border-t
                  border-slate-200
                "
              />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout?.();
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-lg
                  px-3
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-rose-600
                  hover:bg-rose-50
                "
              >
                <LogOut
                  size={14}
                />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TopBar({
  collapsed,
  setMobileOpen,
  currentUser,
  onLogout,
}) {
  const location =
    useLocation();

  const page =
    useMemo(
      () =>
        getCurrentPage(
          location.pathname
        ),
      [
        location.pathname,
      ]
    );

  const Icon =
    page.icon ||
    LayoutDashboard;

  return (
    <header
      className={cx(
        `
          fixed
          right-0
          top-0
          z-30
          h-[62px]
          border-b
          border-slate-200
          bg-white/95
          shadow-sm
          backdrop-blur-xl
          transition-[left]
          duration-200
        `,
        collapsed
          ? 'left-0 lg:left-[70px]'
          : 'left-0 lg:left-[250px]'
      )}
    >
      <div
        className="
          flex
          h-full
          items-center
          gap-3
          px-3
          sm:px-4
          lg:px-5
        "
      >
        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              true
            )
          }
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            text-slate-500
            lg:hidden
          "
        >
          <Menu
            size={16}
          />
        </button>

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
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
              border
              border-slate-200
              bg-slate-50
              text-[#0b84d8]
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
                truncate
                text-[13px]
                font-bold
                text-slate-900
              "
            >
              {page.label}
            </div>

            <div
              className="
                mt-0.5
                hidden
                text-[9px]
                text-slate-400
                sm:block
              "
            >
              Buddy Fleets Platform Control
            </div>
          </div>
        </div>

        <div
          className="
            hidden
            h-6
            w-px
            bg-slate-200
            lg:block
          "
        />

        <button
          type="button"
          className="
            hidden
            h-9
            min-w-[260px]
            max-w-[420px]
            flex-1
            items-center
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            px-3
            text-left
            text-[11px]
            text-slate-400
            hover:bg-white
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
              border
              border-slate-200
              bg-white
              px-1.5
              py-0.5
              font-mono
              text-[9px]
              text-slate-400
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
            gap-1.5
          "
        >
          <div
            className="
              mr-1
              hidden
              items-center
              gap-1.5
              rounded-lg
              border
              border-emerald-200
              bg-emerald-50
              px-2.5
              py-1.5
              text-[8px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-emerald-700
              md:flex
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-500
              "
            />
            Production
          </div>

          {[Command, Bell].map(
            (UtilityIcon, index) => (
              <button
                key={index}
                type="button"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  text-slate-500
                  hover:bg-slate-50
                  hover:text-slate-900
                "
              >
                <UtilityIcon
                  size={15}
                />
              </button>
            )
          )}

          <UserMenu
            currentUser={
              currentUser
            }
            onLogout={
              onLogout
            }
          />
        </div>
      </div>
    </header>
  );
}

export default function DeveloperLayout({
  currentUser,
  onLogout,
}) {
  const [
    collapsed,
    setCollapsed,
  ] =
    useState(
      getInitialSidebar
    );

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      collapsed
        ? 'collapsed'
        : 'expanded'
    );
  }, [
    collapsed,
  ]);

  return (
    <div
      className="
        min-h-screen
        min-h-[100dvh]
        bg-[#f5f7fb]
        font-sans
        text-slate-900
      "
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

      <TopBar
        collapsed={
          collapsed
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
      />

      <main
        className={cx(
          `
            relative
            min-h-[100dvh]
            pt-[62px]
            transition-[padding-left]
            duration-200
          `,
          collapsed
            ? 'lg:pl-[70px]'
            : 'lg:pl-[250px]'
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
            lg:px-6
            lg:py-6
          "
        >
          <Outlet
            context={{
              currentUser,
              onLogout,
            }}
          />
        </div>
      </main>
    </div>
  );
}
