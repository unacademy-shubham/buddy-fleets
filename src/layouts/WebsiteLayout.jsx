import React, { useState } from 'react';
import {
  Outlet,
  NavLink,
  Link,
} from 'react-router-dom';

import {
  Menu,
  X,
} from 'lucide-react';

export default function WebsiteLayout() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  /* =========================================================
     NAV LINK STYLE
  ========================================================= */

  const navLinkClass = ({
    isActive,
  }) =>
    `
      transition
      duration-300
      hover:text-purple-400
      hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]
      ${
        isActive
          ? 'text-purple-400 font-bold drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]'
          : 'text-slate-300'
      }
    `;

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  const closeMobileMenu =
    () => {
      setMobileMenuOpen(
        false
      );
    };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0f1d] font-sans text-slate-100 selection:bg-purple-500 selection:text-slate-950">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 shadow-2xl backdrop-blur-xl">

        {/* MAIN NAV ROW */}

        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 lg:px-12 lg:py-4">

          {/* BRAND */}

          <Link
            to="/"
            onClick={
              closeMobileMenu
            }
            className="group flex items-center gap-2.5"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 font-extrabold text-white shadow-lg shadow-purple-600/30 transition duration-300 group-hover:scale-105">
              BF
            </div>

            <div className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
              Buddy Fleets
              <span className="text-purple-400">
                .
              </span>
            </div>

          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="hidden items-center space-x-8 text-base font-semibold md:flex lg:space-x-10 lg:text-lg">

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

            {/* PRICING */}

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

          </div>

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* LOGIN */}

            <Link
              to="/login"
              onClick={
                closeMobileMenu
              }
              className="
                rounded-xl
                border
                border-purple-500/60
                bg-gradient-to-r
                from-blue-600/30
                to-purple-600/30
                px-4
                py-2.5
                text-xs
                font-bold
                text-white
                shadow-lg
                shadow-purple-950/50
                backdrop-blur-md
                transition
                duration-300
                hover:scale-105
                hover:border-purple-400
                sm:px-5
                sm:text-sm
              "
            >
              Login
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
                  (
                    previous
                  ) =>
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
                hover:border-purple-400/40
                hover:bg-purple-500/10
                hover:text-purple-300
                md:hidden
              "
            >

              {mobileMenuOpen ? (
                <X
                  size={20}
                />
              ) : (
                <Menu
                  size={20}
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
            overflow-hidden
            border-t
            border-white/[0.06]
            bg-slate-950/95
            backdrop-blur-xl
            transition-all
            duration-300
            md:hidden

            ${
              mobileMenuOpen
                ? 'max-h-[420px] opacity-100'
                : 'max-h-0 border-transparent opacity-0'
            }
          `}
        >

          <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">

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

                  ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-300'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }
                `
              }
            >
              Home
            </NavLink>

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

                  ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-300'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }
                `
              }
            >
              Features
            </NavLink>

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

                  ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-300'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }
                `
              }
            >
              Pricing
            </NavLink>

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

                  ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-300'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }
                `
              }
            >
              About Us
            </NavLink>

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

                  ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-300'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }
                `
              }
            >
              Contact
            </NavLink>

          </div>

        </div>

      </nav>

      {/* =====================================================
          DYNAMIC PAGE CONTENT
      ===================================================== */}

      <main className="flex-grow">

        <Outlet />

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-10 text-center text-xs text-slate-400">

        <div className="space-y-2">

          {/* COPYRIGHT */}

          <p className="font-medium tracking-wide">

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
                hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]
              "
            >
              BUDDY COMPUTERS
            </a>

            . All rights reserved.

          </p>

          {/* DESIGN CREDIT */}

          <p className="font-semibold uppercase tracking-widest text-slate-400">

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
                hover:drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]
              "
            >
              SHUBHAM JANGIR
            </a>

          </p>

        </div>

      </footer>

    </div>
  );
}