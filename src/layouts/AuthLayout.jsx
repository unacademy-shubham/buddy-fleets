import React, { useState } from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  Menu,
  X,
} from 'lucide-react';

/* =========================================================
   BUDDY FLEETS
   COMMON AUTH LAYOUT

   Used for:
   - Login
   - Signup
   - Forgot Password
   - Reset Password
   - Email Confirmation

   Desktop:
   - Header 72px
   - Auth page fills remaining screen
   - Footer 58px

   Mobile / Tablet:
   - Natural vertical scrolling
   - Responsive navigation
========================================================= */

export default function AuthLayout() {
  const location =
    useLocation();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /* =========================================================
     NAVIGATION STYLE
  ========================================================= */

  const navLinkClass = ({
    isActive,
  }) =>
    `
      whitespace-nowrap
      text-xs
      font-semibold
      transition
      duration-300

      hover:text-purple-400
      hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]

      ${
        isActive
          ? `
              font-bold
              text-purple-400
              drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]
            `
          : 'text-slate-300'
      }
    `;

  /* =========================================================
     AUTH ACTION BUTTON

     /login  -> Sign Up
     Others  -> Login
  ========================================================= */

  const isLoginPage =
    location.pathname ===
    '/login';

  const authAction = isLoginPage
    ? {
        label:
          'Sign Up',

        to:
          '/signup',
      }
    : {
        label:
          'Login',

        to:
          '/login',
      };

  /* =========================================================
     LAYOUT
  ========================================================= */

  return (
    <div
      className="
        relative
        flex
        min-h-[100dvh]
        w-full
        flex-col
        overflow-x-hidden
        bg-[#050914]
        font-sans
        text-white
        selection:bg-purple-500
        selection:text-white

        lg:grid
        lg:h-[100dvh]
        lg:min-h-0
        lg:grid-rows-[72px_minmax(0,1fr)_58px]
        lg:overflow-hidden
      "
    >

      {/* =====================================================
          HEADER / NAVBAR
      ===================================================== */}

      <header
        className="
          relative
          z-50
          h-[72px]
          w-full
          shrink-0
          border-b
          border-white/[0.06]
          bg-slate-950/80
          shadow-xl
          backdrop-blur-xl
        "
      >

        <div
          className="
            mx-auto
            flex
            h-full
            w-full
            items-center
            justify-between
            px-4

            sm:px-6

            lg:px-10
          "
        >

          {/* =================================================
              BRAND
          ================================================= */}

          <Link
            to="/"
            onClick={
              closeMobileMenu
            }
            className="
              group
              flex
              shrink-0
              items-center
              gap-2.5

              sm:gap-3
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
                border
                border-cyan-400/30
                bg-gradient-to-br
                from-cyan-400
                via-blue-500
                to-violet-600
                text-[10px]
                font-black
                text-white
                shadow-lg
                shadow-cyan-500/20
                transition-transform
                duration-300

                group-hover:scale-105

                sm:h-11
                sm:w-11
                sm:text-xs
              "
            >
              BF
            </div>

            <div>

              <div
                className="
                  text-xs
                  font-black
                  tracking-tight
                  text-white

                  sm:text-sm
                "
              >
                Buddy Fleets

                <span className="text-purple-400">
                  .
                </span>

              </div>

              <div
                className="
                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.24em]
                  text-slate-400

                  sm:text-[8px]
                "
              >
                Fleet Intelligence
              </div>

            </div>

          </Link>

          {/* =================================================
              DESKTOP / TABLET NAVIGATION
          ================================================= */}

          <nav
            className="
              absolute
              left-1/2
              top-1/2
              hidden
              -translate-x-1/2
              -translate-y-1/2
              items-center
              gap-5
              rounded-full
              border
              border-white/10
              bg-[#07101f]/80
              px-6
              py-2.5
              shadow-2xl
              backdrop-blur-2xl

              md:flex

              lg:gap-7
            "
          >

            <NavLink
              to="/"
              end
              className={
                navLinkClass
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/features"
              className={
                navLinkClass
              }
            >
              Features
            </NavLink>

            <NavLink
              to="/pricing"
              className={
                navLinkClass
              }
            >
              Pricing
            </NavLink>

            <NavLink
              to="/about"
              className={
                navLinkClass
              }
            >
              About Us
            </NavLink>

            <NavLink
              to="/contact"
              className={
                navLinkClass
              }
            >
              Contact
            </NavLink>

          </nav>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2

              sm:gap-3
            "
          >

            {/* AUTH ACTION */}

            <Link
              to={
                authAction.to
              }
              onClick={
                closeMobileMenu
              }
              className="
                rounded-xl
                border
                border-purple-500/50
                bg-gradient-to-r
                from-blue-600/20
                to-purple-600/20
                px-4
                py-2.5
                text-[10px]
                font-bold
                text-white
                shadow-lg
                shadow-purple-950/40
                backdrop-blur-md
                transition
                duration-300

                hover:scale-105
                hover:border-purple-400
                hover:from-blue-600/30
                hover:to-purple-600/30

                sm:px-5
                sm:text-xs
              "
            >
              {
                authAction.label
              }
            </Link>

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
              onClick={() =>
                setMobileMenuOpen(
                  (previous) =>
                    !previous
                )
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-white/[0.04]
                text-slate-200
                transition
                duration-300

                hover:border-purple-400/40
                hover:bg-purple-500/10
                hover:text-purple-300

                md:hidden
              "
            >

              {mobileMenuOpen ? (
                <X
                  size={19}
                  strokeWidth={2}
                />
              ) : (
                <Menu
                  size={19}
                  strokeWidth={2}
                />
              )}

            </button>

          </div>

        </div>

        {/* =================================================
            MOBILE NAVIGATION
        ================================================= */}

        <div
          className={`
            absolute
            left-0
            right-0
            top-[72px]
            z-50
            overflow-hidden
            border-b
            border-white/[0.07]
            bg-[#050914]/98
            shadow-2xl
            backdrop-blur-2xl
            transition-all
            duration-300

            md:hidden

            ${
              mobileMenuOpen
                ? `
                    max-h-[420px]
                    opacity-100
                  `
                : `
                    pointer-events-none
                    max-h-0
                    border-transparent
                    opacity-0
                  `
            }
          `}
        >

          <nav
            className="
              flex
              flex-col
              gap-1
              px-4
              py-4

              sm:px-6
            "
          >

            {/* HOME */}

            <NavLink
              to="/"
              end
              onClick={
                closeMobileMenu
              }
              className={({
                isActive,
              }) =>
                `
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition
                  duration-300

                  ${
                    isActive
                      ? `
                          bg-purple-500/10
                          text-purple-300
                        `
                      : `
                          text-slate-300
                          hover:bg-white/[0.04]
                          hover:text-white
                        `
                  }
                `
              }
            >
              Home
            </NavLink>

            {/* FEATURES */}

            <NavLink
              to="/features"
              onClick={
                closeMobileMenu
              }
              className={({
                isActive,
              }) =>
                `
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition
                  duration-300

                  ${
                    isActive
                      ? `
                          bg-purple-500/10
                          text-purple-300
                        `
                      : `
                          text-slate-300
                          hover:bg-white/[0.04]
                          hover:text-white
                        `
                  }
                `
              }
            >
              Features
            </NavLink>

            {/* PRICING */}

            <NavLink
              to="/pricing"
              onClick={
                closeMobileMenu
              }
              className={({
                isActive,
              }) =>
                `
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition
                  duration-300

                  ${
                    isActive
                      ? `
                          bg-purple-500/10
                          text-purple-300
                        `
                      : `
                          text-slate-300
                          hover:bg-white/[0.04]
                          hover:text-white
                        `
                  }
                `
              }
            >
              Pricing
            </NavLink>

            {/* ABOUT */}

            <NavLink
              to="/about"
              onClick={
                closeMobileMenu
              }
              className={({
                isActive,
              }) =>
                `
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition
                  duration-300

                  ${
                    isActive
                      ? `
                          bg-purple-500/10
                          text-purple-300
                        `
                      : `
                          text-slate-300
                          hover:bg-white/[0.04]
                          hover:text-white
                        `
                  }
                `
              }
            >
              About Us
            </NavLink>

            {/* CONTACT */}

            <NavLink
              to="/contact"
              onClick={
                closeMobileMenu
              }
              className={({
                isActive,
              }) =>
                `
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition
                  duration-300

                  ${
                    isActive
                      ? `
                          bg-purple-500/10
                          text-purple-300
                        `
                      : `
                          text-slate-300
                          hover:bg-white/[0.04]
                          hover:text-white
                        `
                  }
                `
              }
            >
              Contact
            </NavLink>

          </nav>

        </div>

      </header>

      {/* =====================================================
          AUTH PAGE CONTENT

          Login / Signup / Forgot / Reset / Confirm
          yahan render honge.
      ===================================================== */}

      <main
        className="
          relative
          z-10
          min-h-0
          flex-1

          lg:overflow-hidden
        "
      >
        <Outlet />
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="
          relative
          z-40
          flex
          min-h-[64px]
          shrink-0
          flex-col
          items-center
          justify-center
          border-t
          border-white/[0.05]
          bg-[#030712]/95
          px-4
          py-3
          text-center
          backdrop-blur-xl

          sm:min-h-[70px]

          lg:min-h-[58px]
          lg:py-2
        "
      >

        {/* COPYRIGHT */}

        <p
          className="
            text-[9px]
            font-medium
            tracking-wide
            text-slate-400

            sm:text-[10px]
          "
        >

          <span className="mr-1">
            ©
          </span>

          Copyright by{' '}

          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="
              font-bold
              text-white
              underline
              decoration-slate-600
              underline-offset-2
              transition
              duration-300

              hover:text-cyan-300
              hover:decoration-cyan-400
              hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]
            "
          >
            BUDDY COMPUTERS
          </a>

          . All rights reserved.

        </p>

        {/* DESIGN CREDIT */}

        <p
          className="
            mt-1.5
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-slate-400

            sm:text-[9px]
            sm:tracking-[0.22em]
          "
        >

          DESIGNED BY{' '}

          <a
            href="https://www.instagram.com/happiest_banda"
            target="_blank"
            rel="noopener noreferrer"
            className="
              text-purple-400
              underline
              decoration-purple-400
              underline-offset-2
              transition
              duration-300

              hover:text-purple-300
              hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]
            "
          >
            SHUBHAM JANGIR
          </a>

        </p>

      </footer>

    </div>
  );
}