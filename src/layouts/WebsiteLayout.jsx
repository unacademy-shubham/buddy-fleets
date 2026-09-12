import React, {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  Bot,
  LoaderCircle,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';

import WhatsAppContactButton
  from '../components/WhatsAppContactButton';

/* =========================================================
   LAZY CHATBOT
========================================================= */

const BuddyChatbot = lazy(
  () =>
    import(
      '../components/BuddyChatbot'
    )
);

/* =========================================================
   WEBSITE CONFIG
========================================================= */

const START_YEAR = 2026;

const THEME_STORAGE_KEY =
  'buddy_fleets_theme';

const THEME_SWITCH_CLASS =
  'bf-theme-switching';

/* =========================================================
   NAVIGATION
========================================================= */

const NAV_ITEMS = [
  {
    label: 'Home',
    to: '/',
    end: true,
  },
  {
    label: 'Features',
    to: '/features',
  },
  {
    label: 'Pricing',
    to: '/pricing',
  },
  {
    label: 'About Us',
    to: '/about',
  },
  {
    label: 'Contact Us',
    to: '/contact-us',
  },
];

/* =========================================================
   DEFAULT THEME

   First visit = DARK.

   Saved preference is used immediately.
========================================================= */

function getInitialTheme() {
  if (
    typeof window ===
      'undefined' ||
    typeof document ===
      'undefined'
  ) {
    return 'dark';
  }

  const savedTheme =
    window.localStorage.getItem(
      THEME_STORAGE_KEY
    );

  const initialTheme =
    savedTheme === 'light' ||
    savedTheme === 'dark'
      ? savedTheme
      : 'dark';

  /*
    Apply immediately during initialization.

    This reduces first-render theme mismatch.
  */

  document.documentElement.dataset.theme =
    initialTheme;

  document.documentElement.style.colorScheme =
    initialTheme;

  return initialTheme;
}

/* =========================================================
   CHATBOT LOADING UI
========================================================= */

function ChatbotLoader() {
  return (
    <div
      className="
        flex
        h-[180px]
        w-[min(370px,calc(100vw-28px))]
        items-center
        justify-center
        rounded-[22px]
        border
        border-[color:var(--bf-border)]
        bg-[var(--bf-surface)]
        shadow-2xl
        shadow-black/25
        backdrop-blur-2xl
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-3
        "
      >
        <LoaderCircle
          size={23}
          aria-hidden="true"
          className="
            animate-spin
            text-cyan-500
          "
        />

        <p
          className="
            text-[11px]
            font-semibold
            text-[color:var(--bf-text-muted)]
          "
        >
          Opening Buddy Assistant...
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   CHATBOT FLOATING CONTROL
========================================================= */

function ChatbotControl() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const containerRef =
    useRef(null);

  const buttonRef =
    useRef(null);

  /* =======================================================
     CLOSE ON OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsideClick =
      (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target
          )
        ) {
          setIsOpen(false);
        }
      };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    document.addEventListener(
      'touchstart',
      handleOutsideClick,
      {
        passive: true,
      }
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );

      document.removeEventListener(
        'touchstart',
        handleOutsideClick
      );
    };
  }, [
    isOpen,
  ]);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          'Escape'
        ) {
          setIsOpen(false);

          window.setTimeout(
            () => {
              buttonRef.current
                ?.focus();
            },
            0
          );
        }
      };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    isOpen,
  ]);

  return (
    <div
      ref={containerRef}
      className="
        relative
        flex
        flex-col
        items-end
      "
    >
      {/* =====================================================
          LAZY CHATBOT PANEL
      ===================================================== */}

      {isOpen && (
        <div
          className="
            fixed
            bottom-[132px]
            right-3
            z-[70]
            max-w-[calc(100vw-24px)]
            sm:bottom-[140px]
            sm:right-5
          "
        >
          <Suspense
            fallback={
              <ChatbotLoader />
            }
          >
            <BuddyChatbot
              onClose={() =>
                setIsOpen(false)
              }
            />
          </Suspense>
        </div>
      )}

      {/* =====================================================
          CHATBOT BUTTON
      ===================================================== */}

      <button
        ref={buttonRef}
        type="button"
        onClick={() =>
          setIsOpen(
            (previous) =>
              !previous
          )
        }
        aria-label={
          isOpen
            ? 'Close Buddy Assistant'
            : 'Open Buddy Assistant'
        }
        aria-expanded={
          isOpen
        }
        title="Buddy Assistant"
        className="
          group
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          border
          border-cyan-300/25
          bg-gradient-to-br
          from-[#078EE5]
          via-[#087acb]
          to-[#075bb8]
          text-white
          shadow-xl
          shadow-blue-950/25
          transition
          duration-200
          hover:-translate-y-0.5
          hover:shadow-blue-500/25
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-cyan-400
          focus-visible:ring-offset-2
        "
      >
        {isOpen ? (
          <X
            size={21}
            aria-hidden="true"
          />
        ) : (
          <Bot
            size={22}
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}

/* =========================================================
   WEBSITE LAYOUT
========================================================= */

export default function WebsiteLayout() {
  const location =
    useLocation();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    theme,
    setTheme,
  ] = useState(
    getInitialTheme
  );

  const themeFrameOneRef =
    useRef(null);

  const themeFrameTwoRef =
    useRef(null);

  const isDark =
    theme === 'dark';

  /* =======================================================
     COPYRIGHT
  ======================================================= */

  const currentYear =
    new Date().getFullYear();

  const copyrightYear =
    currentYear >
    START_YEAR
      ? `${START_YEAR} - ${currentYear}`
      : `${START_YEAR}`;

  /* =======================================================
     APPLY CURRENT THEME

     useLayoutEffect runs before browser paint.

     Theme toggle itself also updates DOM immediately,
     so there is no visible transition delay.
  ======================================================= */

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

  /* =======================================================
     CLEANUP THEME RAF
  ======================================================= */

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

  /* =======================================================
     ROUTE CHANGE
  ======================================================= */

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [
    location.pathname,
  ]);

  /* =======================================================
     THEME TOGGLE

     IMPORTANT:

     1. Disable transitions globally.
     2. Change data-theme IMMEDIATELY.
     3. Change colorScheme IMMEDIATELY.
     4. Save localStorage IMMEDIATELY.
     5. Update React state.
     6. Re-enable normal transitions after React has painted.

     Result:
     DARK <-> LIGHT is an instant color switch.
  ======================================================= */

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

    /*
      Freeze CSS transitions before changing theme.
    */

    root.classList.add(
      THEME_SWITCH_CLASS
    );

    /*
      DOM changes happen immediately.
      We do not wait for useEffect.
    */

    root.dataset.theme =
      nextTheme;

    root.style.colorScheme =
      nextTheme;

    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme
    );

    /*
      React classes update in the same interaction.
    */

    setTheme(
      nextTheme
    );

    /*
      Keep transition lock through React render + browser paint.

      Two requestAnimationFrame calls ensure theme dependent
      className changes are also applied without transitions.
    */

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

  /* =======================================================
     DESKTOP NAV
  ======================================================= */

  const desktopNavLinkClass = ({
    isActive,
  }) => {
    const base = `
      inline-flex
      min-h-9
      items-center
      justify-center
      whitespace-nowrap
      rounded-xl
      border
      px-3
      py-2
      text-[13px]
      font-semibold
      backdrop-blur-xl
      transition
      duration-200
      focus-visible:outline-none
      focus-visible:ring-2
    `;

    if (isDark) {
      return `
        ${base}

        ${
          isActive
            ? `
                border-white/15
                bg-white/[0.09]
                text-white
                shadow-lg
                shadow-black/20
                ring-1
                ring-white/[0.04]
              `
            : `
                border-transparent
                bg-transparent
                text-slate-300
                hover:border-white/[0.08]
                hover:bg-white/[0.04]
                hover:text-white
              `
        }

        focus-visible:ring-cyan-400/70
      `;
    }

    return `
      ${base}

      ${
        isActive
          ? `
              border-blue-200/90
              bg-white/85
              text-[#064b97]
              shadow-lg
              shadow-blue-950/[0.08]
              ring-1
              ring-blue-100
            `
          : `
              border-transparent
              bg-transparent
              text-slate-600
              hover:border-blue-100
              hover:bg-white/70
              hover:text-[#064b97]
            `
      }

      focus-visible:ring-blue-400/60
    `;
  };

  /* =======================================================
     MOBILE NAV
  ======================================================= */

  const mobileNavLinkClass = ({
    isActive,
  }) => {
    const base = `
      rounded-xl
      border
      px-4
      py-3
      text-sm
      font-semibold
      backdrop-blur-xl
      transition
      duration-200
      focus-visible:outline-none
      focus-visible:ring-2
    `;

    if (isDark) {
      return `
        ${base}

        ${
          isActive
            ? `
                border-white/10
                bg-white/[0.08]
                text-white
              `
            : `
                border-transparent
                text-slate-300
                hover:bg-white/[0.04]
                hover:text-white
              `
        }

        focus-visible:ring-cyan-400/70
      `;
    }

    return `
      ${base}

      ${
        isActive
          ? `
              border-blue-200
              bg-white/85
              text-[#064b97]
            `
          : `
              border-transparent
              text-slate-600
              hover:bg-white/70
              hover:text-[#064b97]
            `
      }

      focus-visible:ring-blue-400/60
    `;
  };

  /* =======================================================
     THEME CLASSES
  ======================================================= */

  const rootThemeClass =
    isDark
      ? `
          bg-[#070b14]
          text-slate-100
        `
      : `
          bg-[#f6fbff]
          text-slate-900
        `;

  const headerThemeClass =
    isDark
      ? `
          border-slate-800/80
          bg-[#050914]/95
          shadow-black/20
        `
      : `
          border-blue-100
          bg-white/90
          shadow-blue-950/[0.06]
        `;

  const mobileMenuThemeClass =
    isDark
      ? `
          bg-[#050914]/97
        `
      : `
          bg-[#f8fcff]/97
        `;

  const footerThemeClass =
    isDark
      ? `
          border-slate-900
          bg-[#050914]
          text-slate-400
        `
      : `
          border-blue-100
          bg-white
          text-slate-600
        `;

  return (
    <>
      {/* =====================================================
          GLOBAL INSTANT THEME SWITCH RULE

          This only activates for ~2 animation frames while
          switching theme.

          Normal hover/focus transitions remain enabled
          before and after theme switching.
      ===================================================== */}

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
        `}
      </style>

      <div
        className={`
          flex
          min-h-screen
          min-h-[100dvh]
          w-full
          flex-col
          overflow-x-clip
          font-sans

          ${rootThemeClass}
        `}
      >
        {/* =====================================================
            FIXED HEADER
        ===================================================== */}

        <header
          className="
            fixed
            inset-x-0
            top-0
            z-50
            w-full
          "
        >
          <nav
            aria-label="Main navigation"
            className={`
              border-b
              shadow-xl
              backdrop-blur-2xl

              ${headerThemeClass}
            `}
          >
            <div
              className="
                mx-auto
                flex
                min-h-[68px]
                w-full
                items-center
                justify-between
                px-4
                sm:px-6
                lg:min-h-[72px]
                lg:px-12
              "
            >
              {/* ===============================================
                  BRAND
              =============================================== */}

              <Link
                to="/"
                aria-label="Buddy Fleets home"
                className="
                  group
                  flex
                  shrink-0
                  items-center
                  gap-3
                  rounded-xl
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cyan-400/70
                "
              >
                {/* BF LOGO */}

                <div
                  aria-hidden="true"
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    bg-gradient-to-br
                    from-[#0450A5]
                    via-[#079BE5]
                    to-[#0AA23B]
                    text-white
                    shadow-lg
                    shadow-blue-900/20
                    transition-transform
                    duration-200
                    group-hover:scale-[1.03]
                  "
                >
                  <span
                    className="
                      select-none
                      text-[25px]
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

                {/* BRAND NAME */}

                <div
                  className="
                    flex
                    items-center
                    text-xl
                    font-black
                    tracking-tight
                    sm:text-[23px]
                    lg:text-[25px]
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
                      ml-1.5
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
              </Link>

              {/* ===============================================
                  DESKTOP NAV
              =============================================== */}

              <div
                className="
                  hidden
                  items-center
                  gap-1.5
                  md:flex
                  lg:gap-2
                "
              >
                {NAV_ITEMS.map(
                  (item) => (
                    <NavLink
                      key={
                        item.to
                      }
                      to={
                        item.to
                      }
                      end={
                        item.end
                      }
                      className={
                        desktopNavLinkClass
                      }
                    >
                      {
                        item.label
                      }
                    </NavLink>
                  )
                )}
              </div>

              {/* ===============================================
                  HEADER ACTIONS
              =============================================== */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                {/* THEME BUTTON */}

                <button
                  type="button"
                  onClick={
                    toggleTheme
                  }
                  aria-label={
                    isDark
                      ? 'Switch to light theme'
                      : 'Switch to dark theme'
                  }
                  title={
                    isDark
                      ? 'Light theme'
                      : 'Dark theme'
                  }
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    backdrop-blur-xl

                    focus-visible:outline-none
                    focus-visible:ring-2

                    ${
                      isDark
                        ? `
                            border-white/10
                            bg-white/[0.04]
                            text-cyan-300

                            hover:border-cyan-300/30
                            hover:bg-cyan-300/[0.07]

                            focus-visible:ring-cyan-300/60
                          `
                        : `
                            border-blue-100
                            bg-white/80
                            text-[#07519c]

                            hover:border-blue-200
                            hover:bg-blue-50

                            focus-visible:ring-blue-400/60
                          `
                    }
                  `}
                >
                  {isDark ? (
                    <Sun
                      size={18}
                      aria-hidden="true"
                    />
                  ) : (
                    <Moon
                      size={18}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {/* LOGIN */}

                <NavLink
                  to="/login"
                  className={({
                    isActive,
                  }) => `
                    inline-flex
                    min-h-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-4
                    py-2
                    text-xs
                    font-bold
                    transition
                    duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2
                    sm:px-5
                    sm:text-sm

                    ${
                      isDark
                        ? `
                            border-cyan-400/30
                            bg-gradient-to-r
                            from-blue-600/30
                            to-emerald-600/20
                            text-white

                            ${
                              isActive
                                ? `
                                    ring-1
                                    ring-cyan-300/30
                                  `
                                : ''
                            }
                          `
                        : `
                            border-blue-200
                            bg-gradient-to-r
                            from-[#086fd0]
                            to-[#0b9b3b]
                            text-white
                          `
                    }
                  `}
                >
                  Login
                </NavLink>

                {/* MOBILE MENU BUTTON */}

                <button
                  type="button"
                  aria-label={
                    mobileMenuOpen
                      ? 'Close navigation menu'
                      : 'Open navigation menu'
                  }
                  aria-expanded={
                    mobileMenuOpen
                  }
                  aria-controls="mobile-navigation"
                  onClick={() =>
                    setMobileMenuOpen(
                      (previous) =>
                        !previous
                    )
                  }
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    transition
                    duration-200
                    md:hidden

                    ${
                      isDark
                        ? `
                            border-white/10
                            bg-white/[0.04]
                            text-slate-200
                          `
                        : `
                            border-blue-100
                            bg-white/80
                            text-[#07519c]
                          `
                    }
                  `}
                >
                  {mobileMenuOpen ? (
                    <X
                      size={20}
                      aria-hidden="true"
                    />
                  ) : (
                    <Menu
                      size={20}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* ===============================================
                MOBILE NAVIGATION
            =============================================== */}

            <div
              id="mobile-navigation"
              className={`
                overflow-hidden
                backdrop-blur-2xl
                transition-[max-height,opacity,border-color]
                duration-300
                md:hidden

                ${mobileMenuThemeClass}

                ${
                  mobileMenuOpen
                    ? `
                        max-h-[420px]
                        border-t
                        border-[color:var(--bf-border)]
                        opacity-100
                      `
                    : `
                        max-h-0
                        border-t
                        border-transparent
                        opacity-0
                      `
                }
              `}
            >
              <div
                className="
                  flex
                  flex-col
                  gap-1
                  px-4
                  py-3
                  sm:px-6
                "
              >
                {NAV_ITEMS.map(
                  (item) => (
                    <NavLink
                      key={
                        item.to
                      }
                      to={
                        item.to
                      }
                      end={
                        item.end
                      }
                      className={
                        mobileNavLinkClass
                      }
                    >
                      {
                        item.label
                      }
                    </NavLink>
                  )
                )}
              </div>
            </div>
          </nav>

          {/* =====================================================
              TEMPORARY DEVELOPMENT NOTICE - START

              WEBSITE OFFICIALLY READY HONE KE BAAD
              IS COMPLETE BLOCK KO REMOVE KARNA HAI.
          ===================================================== */}

          <div
            className={`
              flex
              min-h-[30px]
              items-center
              justify-center
              border-b
              px-4
              py-1.5
              text-center
              text-[9px]
              font-bold
              uppercase
              tracking-[0.13em]
              backdrop-blur-xl
              sm:text-[10px]

              ${
                isDark
                  ? `
                      border-amber-300/10
                      bg-amber-400/[0.09]
                      text-amber-200
                    `
                  : `
                      border-amber-200
                      bg-amber-50/95
                      text-amber-700
                    `
              }
            `}
          >
            Website is currently under development.
            Some features and content may change before the official release.
          </div>

          {/* =====================================================
              TEMPORARY DEVELOPMENT NOTICE - END
          ===================================================== */}
        </header>

        {/* =====================================================
            MAIN CONTENT

            TEMPORARY NOTICE KE SAATH:
            pt-[98px] lg:pt-[102px]

            NOTICE REMOVE KARNE KE BAAD:
            pt-[68px] lg:pt-[72px]
        ===================================================== */}

        <main
          id="main-content"
          className="
            relative
            flex
            w-full
            flex-1
            flex-col
            bg-[var(--bf-page-bg)]
            pt-[98px]
            lg:pt-[102px]
          "
        >
          <Outlet />
        </main>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          className={`
            mt-auto
            border-t
            px-4
            py-2
            text-center
            text-[11px]
            leading-[1.35]
            sm:px-6
            sm:py-2.5
            sm:text-xs

            ${footerThemeClass}
          `}
        >
          <div
            className="
              mx-auto
              w-full
              max-w-7xl
              space-y-0.5
            "
          >
            <p
              className="
                font-medium
                tracking-wide
              "
            >
              © {copyrightYear}{' '}

              <a
                href="https://www.instagram.com/buddy_computers"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  font-bold
                  underline
                  underline-offset-2
                  transition-colors
                  duration-200

                  ${
                    isDark
                      ? `
                          text-white
                          decoration-slate-600
                          hover:text-cyan-300
                        `
                      : `
                          text-[#07519c]
                          decoration-blue-300
                          hover:text-[#078f34]
                        `
                  }
                `}
              >
                BUDDY COMPUTERS
              </a>

              . All Rights Reserved.
            </p>

            <p
              className="
                font-semibold
                uppercase
                tracking-[0.14em]
              "
            >
              DESIGNED BY{' '}

              <a
                href="https://www.instagram.com/happiest_banda"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  underline
                  underline-offset-2
                  transition-colors
                  duration-200

                  ${
                    isDark
                      ? `
                          text-cyan-300
                          decoration-cyan-400
                          hover:text-emerald-300
                        `
                      : `
                          text-[#078f34]
                          decoration-emerald-400
                          hover:text-[#07519c]
                        `
                  }
                `}
              >
                SHUBHAM JANGIR
              </a>
            </p>
          </div>
        </footer>

        {/* =====================================================
            GLOBAL FLOATING SUPPORT
        ===================================================== */}

        <div
          className="
            fixed
            bottom-4
            right-4
            z-40
            flex
            flex-col
            items-end
            gap-2.5
            sm:bottom-5
            sm:right-5
          "
        >
          <ChatbotControl />

          <WhatsAppContactButton />
        </div>
      </div>
    </>
  );
}