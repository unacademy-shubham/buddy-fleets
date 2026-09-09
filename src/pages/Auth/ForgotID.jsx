import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

/* =========================================================
   COMMON INPUT
========================================================= */

const inputBase =
  'w-full rounded-xl border border-white/10 bg-[#101a2c]/85 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-cyan-400/60 focus:bg-[#142139] focus:ring-4 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm';

/* =========================================================
   AMBIENT ORB
========================================================= */

function AmbientOrb({
  className = '',
}) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.2, 0.42, 0.2],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`pointer-events-none absolute rounded-full blur-[110px] ${className}`}
    />
  );
}

/* =========================================================
   LIGHT TRAIL
========================================================= */

function LightTrail({
  delay = 0,
  duration = 8,
  bottom = 'bottom-[15%]',
  width = 'w-48',
}) {
  return (
    <motion.div
      initial={{
        x: '-30vw',
        opacity: 0,
      }}
      animate={{
        x: '130vw',
        opacity: [0, 0.35, 0.65, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`pointer-events-none absolute left-0 ${bottom} h-px ${width} bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent`}
    />
  );
}

/* =========================================================
   TRUCK
========================================================= */

function Truck() {
  return (
    <div className="relative h-16 w-44 sm:h-20 sm:w-56">

      {/* UNDER GLOW */}

      <div className="absolute -bottom-2 left-2 h-5 w-40 rounded-full bg-cyan-400/20 blur-xl sm:w-52" />

      {/* TRAILER */}

      <div className="absolute left-0 top-1 h-11 w-32 rounded-md border border-cyan-300/20 bg-gradient-to-br from-slate-700/80 via-slate-800/80 to-[#07101f] shadow-[0_0_30px_rgba(34,211,238,0.12)] sm:h-14 sm:w-40">

        <div className="absolute left-2 right-2 top-2 h-1 rounded-full bg-cyan-400/40" />

        <div className="absolute left-2 top-5 text-[7px] font-black uppercase tracking-[0.25em] text-slate-500 sm:top-6">
          BUDDY FLEETS
        </div>

        <div className="absolute bottom-2 left-2 h-1 w-8 rounded-full bg-blue-400/30" />

        <div className="absolute bottom-2 right-2 h-1 w-12 rounded-full bg-violet-400/30" />

      </div>

      {/* CABIN */}

      <div className="absolute right-0 top-5 h-8 w-12 rounded-r-lg rounded-tl-sm border border-cyan-300/25 bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-violet-700/30 shadow-[0_0_25px_rgba(34,211,238,0.2)] sm:top-7 sm:h-10 sm:w-14">

        <div className="absolute left-2 top-2 h-3 w-7 rounded-sm border border-cyan-300/20 bg-cyan-300/10 sm:h-4 sm:w-9" />

      </div>

      {/* FRONT LIGHT */}

      <div className="absolute right-[-4px] top-[31px] h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,1)] sm:top-[39px]" />

      {/* WHEELS */}

      <div className="absolute bottom-0 left-6 h-6 w-6 rounded-full border-2 border-slate-500 bg-[#020617] sm:left-8 sm:h-7 sm:w-7" />

      <div className="absolute bottom-0 right-6 h-6 w-6 rounded-full border-2 border-slate-500 bg-[#020617] sm:right-7 sm:h-7 sm:w-7" />

      {/* HUBS */}

      <div className="absolute bottom-[7px] left-[35px] h-2 w-2 rounded-full bg-slate-600 sm:bottom-[8px] sm:left-[42px]" />

      <div className="absolute bottom-[7px] right-[35px] h-2 w-2 rounded-full bg-slate-600 sm:bottom-[8px] sm:right-[42px]" />

    </div>
  );
}

/* =========================================================
   ANIMATED TRUCK
========================================================= */

function AnimatedTruck() {
  return (
    <motion.div
      initial={{
        x: '-20vw',
        opacity: 0,
      }}
      animate={{
        x: '120vw',
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 22,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'linear',
      }}
      className="absolute bottom-0 left-0"
    >
      <Truck />
    </motion.div>
  );
}

/* =========================================================
   MOBILE / TABLET TRUCK
========================================================= */

function MobileTruckScene() {
  return (
    <div className="relative h-24 w-full overflow-hidden border-y border-white/[0.04] sm:h-28 lg:hidden">

      <div className="absolute inset-x-0 bottom-2 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-cyan-500/[0.06] to-transparent" />

      <AnimatedTruck />

    </div>
  );
}

/* =========================================================
   RADAR
========================================================= */

function RadarPulse() {
  return (
    <div className="pointer-events-none absolute right-[7%] top-[30%] hidden h-36 w-36 xl:block">

      <motion.div
        animate={{
          scale: [0.7, 1.4],
          opacity: [0.45, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className="absolute inset-0 rounded-full border border-cyan-400/20"
      />

      <motion.div
        animate={{
          scale: [0.7, 1.4],
          opacity: [0.3, 0],
        }}
        transition={{
          duration: 3,
          delay: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className="absolute inset-0 rounded-full border border-cyan-400/15"
      />

      <div className="absolute inset-[20%] rounded-full border border-cyan-400/10" />

      <div className="absolute inset-[38%] rounded-full border border-cyan-400/20 bg-cyan-400/5" />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute left-1/2 top-1/2 h-[1px] w-1/2 origin-left bg-gradient-to-r from-cyan-400/70 to-transparent"
      />

      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,1)]" />

    </div>
  );
}

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export default function ForgotID() {
  const [companyCode, setCompanyCode] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [isSubmitted, setIsSubmitted] =
    useState(false);

  /*
    Frontend cooldown sirf UX hai.

    Security/rate limiting actual Edge Function/backend
    me enforce hogi.
  */

  const [cooldown, setCooldown] =
    useState(0);

  /* =========================================================
     COOLDOWN TIMER
  ========================================================= */

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer =
      window.setInterval(() => {

        setCooldown(
          (current) => {

            if (current <= 1) {
              window.clearInterval(
                timer
              );

              return 0;
            }

            return current - 1;

          }
        );

      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };

  }, [cooldown]);

  /* =========================================================
     REQUEST RESET
  ========================================================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      if (
        isLoading ||
        cooldown > 0
      ) {
        return;
      }

      setErrorMessage('');

      const cleanCompanyCode =
        companyCode
          .trim()
          .toUpperCase();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      /* COMPANY CODE */

      if (!cleanCompanyCode) {

        setErrorMessage(
          'Please enter your Company Code.'
        );

        return;

      }

      /* EMAIL */

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          cleanEmail
        )
      ) {

        setErrorMessage(
          'Please enter a valid registered email address.'
        );

        return;

      }

      setIsLoading(true);

      try {

        /*
          =====================================================
          SECURE PASSWORD RESET REQUEST
          =====================================================

          IMPORTANT:

          Browser directly:
          - companies table verify nahi karega
          - profiles/users enumerate nahi karega
          - email existence expose nahi karega

          Secure Edge Function:
          request-password-reset

          ko Company Code + Email diya jayega.

          Edge Function later:
          1. Company Code verify karegi
          2. User/company membership verify karegi
          3. Server-side rate limit karegi
          4. Generic response degi
          5. Reset link generate/send karegi
          6. Audit log create karegi
        */

        const {
          error: functionError,
        } =
          await supabase.functions.invoke(
            'request-password-reset',
            {
              body: {
                companyCode:
                  cleanCompanyCode,

                email:
                  cleanEmail,

                redirectTo:
                  `${window.location.origin}/forgot-id`,
              },
            }
          );

        /*
          Enumeration avoid karne ke liye normal
          application-level "account not found" response
          frontend par differentiate nahi karenge.

          Real server/network/function failure ko however
          development me console me log kar sakte hain.
        */

        if (functionError) {

          console.error(
            'Password reset function error:',
            functionError
          );

          throw new Error(
            'RESET_REQUEST_FAILED'
          );

        }

        /*
          Generic success:
          email/account exist kare ya na kare,
          frontend same message dikhayega.
        */

        setIsSubmitted(true);

        setCooldown(60);

      } catch (err) {

        console.error(
          'Password reset request error:',
          err
        );

        setErrorMessage(
          'Unable to process the request right now. Please try again in a moment.'
        );

      } finally {

        setIsLoading(false);

      }

    };

  /* =========================================================
     REQUEST AGAIN
  ========================================================= */

  const handleTryAgain =
    () => {

      if (cooldown > 0) {
        return;
      }

      setIsSubmitted(false);
      setErrorMessage('');

    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      className="
        relative
        min-h-[100dvh]
        w-full
        overflow-x-hidden
        bg-[#050914]
        font-sans
        text-white

        lg:grid
        lg:h-[100dvh]
        lg:min-h-0
        lg:grid-rows-[72px_minmax(0,1fr)_58px]
        lg:overflow-hidden
      "
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=85&w=2400&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-25"
        />

        <div className="absolute inset-0 bg-[#050914]/80" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/90 to-[#071329]/75" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-[#050914]/65" />

        {/* GRID */}

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.7) 1px, transparent 1px)',
            backgroundSize:
              '55px 55px',
          }}
        />

        {/* GLOWS */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(6,182,212,0.10),transparent_30%),radial-gradient(circle_at_85%_40%,rgba(124,58,237,0.12),transparent_32%)]" />

        <AmbientOrb className="left-[4%] top-[15%] h-72 w-72 bg-cyan-500/20" />

        <AmbientOrb className="right-[5%] top-[20%] h-80 w-80 bg-violet-600/20" />

      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-50 h-[110px] w-full shrink-0 sm:h-[104px] lg:h-[72px]">

        {/* BRAND */}

        <Link
          to="/"
          className="
            group
            absolute
            left-4
            top-4
            z-20
            flex
            items-center
            gap-2.5

            sm:left-6
            sm:top-5
            sm:gap-3

            lg:left-10
            lg:top-1/2
            lg:-translate-y-1/2
          "
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-[10px] font-black text-white shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11 sm:text-xs">
            BF
          </div>

          <div>

            <div className="text-xs font-black tracking-tight text-white sm:text-sm">
              Buddy Fleets
            </div>

            <div className="text-[7px] font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-[8px]">
              Fleet Intelligence
            </div>

          </div>

        </Link>

        {/* TOP CENTER NAVBAR */}

        <nav
          className="
            absolute
            left-1/2
            top-[66px]
            z-10
            flex
            w-[calc(100%-24px)]
            max-w-[430px]
            -translate-x-1/2
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-white/10
            bg-[#07101f]/90
            px-2
            py-2
            shadow-2xl
            backdrop-blur-2xl

            sm:top-[62px]
            sm:w-auto
            sm:gap-4
            sm:px-5
            sm:py-2.5

            md:gap-6
            md:px-7

            lg:top-1/2
            lg:-translate-y-1/2
          "
        >

          <Link
            to="/"
            className="whitespace-nowrap px-1 text-[9px] font-semibold text-slate-300 transition hover:text-cyan-300 sm:text-[10px] md:text-xs"
          >
            Home
          </Link>

          <Link
            to="/features"
            className="whitespace-nowrap px-1 text-[9px] font-semibold text-slate-300 transition hover:text-cyan-300 sm:text-[10px] md:text-xs"
          >
            Features
          </Link>

          <Link
            to="/about"
            className="whitespace-nowrap px-1 text-[9px] font-semibold text-slate-300 transition hover:text-cyan-300 sm:text-[10px] md:text-xs"
          >
            About Us
          </Link>

          <Link
            to="/contact"
            className="whitespace-nowrap px-1 text-[9px] font-semibold text-slate-300 transition hover:text-cyan-300 sm:text-[10px] md:text-xs"
          >
            Contact Us
          </Link>

        </nav>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-20 lg:min-h-0 lg:overflow-hidden">

        {/* DESKTOP ANIMATIONS */}

        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">

          <LightTrail
            delay={0}
            duration={8}
            bottom="bottom-[12%]"
            width="w-56"
          />

          <LightTrail
            delay={2.5}
            duration={9}
            bottom="bottom-[18%]"
            width="w-72"
          />

          <RadarPulse />

          <div className="absolute inset-x-0 bottom-0 h-20 overflow-hidden">

            <div className="absolute inset-x-0 bottom-1 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

            <AnimatedTruck />

          </div>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            w-full
            max-w-[1280px]
            flex-col
            gap-7
            px-4
            pb-8
            pt-5

            sm:gap-9
            sm:px-6
            sm:pb-10
            sm:pt-7

            lg:grid
            lg:h-full
            lg:grid-cols-[minmax(0,1fr)_430px]
            lg:items-center
            lg:gap-10
            lg:px-10
            lg:py-2

            xl:grid-cols-[minmax(0,1fr)_448px]
            xl:gap-16
          "
        >

          {/* =================================================
              HERO
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="
              relative
              mx-auto
              w-full
              max-w-2xl
              text-center

              lg:mx-0
              lg:max-w-none
              lg:text-left
            "
          >

            {/* BADGE */}

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3.5 py-2 backdrop-blur-md sm:mb-5 sm:px-4">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

              </span>

              <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-300 sm:text-[9px] xl:text-[10px]">
                Secure Recovery Portal
              </span>

            </div>

            {/* HEADING */}

            <h1 className="text-4xl font-black leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl">

              Recover your

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                account access.
              </span>

            </h1>

            {/* DESCRIPTION */}

            <p className="mx-auto mt-4 max-w-lg text-xs leading-6 text-slate-400 sm:mt-5 sm:text-sm sm:leading-7 lg:mx-0 lg:max-w-md">

              Enter your Buddy Fleets Company Code and registered email address to securely request a password reset.

            </p>

            {/* POINTS */}

            <div className="mx-auto mt-5 flex max-w-md flex-col items-start gap-2.5 sm:mt-6 lg:mx-0 lg:mt-7">

              {[
                'Secure email verification',
                'Protected account recovery',
                'No password visible to administrators',
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-3 text-left text-[10px] font-medium text-slate-300 sm:text-xs"
                >

                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-[9px] text-cyan-300">
                    ✓
                  </span>

                  {item}

                </div>

              ))}

            </div>

          </motion.section>

          {/* MOBILE/TABLET TRUCK */}

          <MobileTruckScene />

          {/* =================================================
              RECOVERY CARD
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.7,
              ease: 'easeOut',
            }}
            className="relative mx-auto w-full max-w-[448px] lg:mx-0 lg:max-w-[430px] lg:justify-self-end xl:max-w-[448px]"
          >

            {/* GLOW */}

            <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-br from-cyan-400/30 via-blue-500/10 to-violet-500/30 blur-xl sm:rounded-[30px]" />

            {/* CARD */}

            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#07101f]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl sm:rounded-[30px]">

              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              <div className="pointer-events-none absolute -right-28 -top-28 h-56 w-56 rounded-full bg-cyan-500/10 blur-[80px]" />

              <div className="pointer-events-none absolute -bottom-28 -left-28 h-56 w-56 rounded-full bg-violet-600/10 blur-[80px]" />

              <div className="relative p-4 sm:p-6 lg:p-5 xl:p-6">

                {!isSubmitted ? (

                  /* =========================================
                     REQUEST FORM
                  ========================================= */

                  <>

                    {/* HEADER */}

                    <div className="mb-4">

                      <div className="mb-2 flex items-center gap-1.5">

                        <span className="h-1.5 w-8 rounded-full bg-cyan-400" />

                        <span className="h-1.5 w-3 rounded-full bg-blue-500" />

                        <span className="h-1.5 w-2 rounded-full bg-violet-500" />

                      </div>

                      <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-xl xl:text-2xl">
                        Forgot Password
                      </h2>

                      <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-[11px]">
                        Enter your company details to request a secure reset link.
                      </p>

                    </div>

                    {/* ERROR */}

                    {errorMessage && (

                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="mb-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2.5"
                        role="alert"
                      >

                        <div className="flex items-start gap-2">

                          <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-[9px] font-black text-red-400">
                            !
                          </span>

                          <p className="text-[9px] leading-4 text-red-300 sm:text-[10px]">
                            {errorMessage}
                          </p>

                        </div>

                      </motion.div>

                    )}

                    {/* FORM */}

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-3"
                    >

                      {/* COMPANY CODE */}

                      <div>

                        <label
                          htmlFor="companyCode"
                          className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                        >
                          Company Code
                        </label>

                        <div className="relative">

                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cyan-400/60">
                            #
                          </span>

                          <input
                            id="companyCode"
                            type="text"
                            required
                            disabled={isLoading}
                            autoComplete="organization"
                            autoCapitalize="characters"
                            spellCheck={false}
                            placeholder="e.g. BUDDY001"
                            value={companyCode}
                            onChange={(e) => {

                              setCompanyCode(
                                e.target.value
                              );

                              setErrorMessage('');

                            }}
                            className={`${inputBase} pl-8 uppercase`}
                          />

                        </div>

                      </div>

                      {/* EMAIL */}

                      <div>

                        <label
                          htmlFor="email"
                          className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                        >
                          Registered Email ID
                        </label>

                        <div className="relative">

                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cyan-400/60">
                            @
                          </span>

                          <input
                            id="email"
                            type="email"
                            required
                            disabled={isLoading}
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => {

                              setEmail(
                                e.target.value
                              );

                              setErrorMessage('');

                            }}
                            className={`${inputBase} pl-8`}
                          />

                        </div>

                      </div>

                      {/* INFO */}

                      <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.035] p-3">

                        <div className="flex items-start gap-2.5">

                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-[9px] font-black text-cyan-300">
                            i
                          </span>

                          <p className="text-[8px] leading-4 text-slate-500 sm:text-[9px]">
                            For your security, Buddy Fleets will not reveal whether a particular Company Code or email exists.
                          </p>

                        </div>

                      </div>

                      {/* SUBMIT */}

                      <motion.button
                        whileHover={
                          !isLoading &&
                          cooldown === 0
                            ? {
                                y: -1,
                              }
                            : {}
                        }
                        whileTap={
                          !isLoading &&
                          cooldown === 0
                            ? {
                                scale: 0.99,
                              }
                            : {}
                        }
                        type="submit"
                        disabled={
                          isLoading ||
                          cooldown > 0
                        }
                        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-4 py-3 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:py-3.5 sm:text-sm lg:py-3 lg:text-xs"
                      >

                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                        <span className="relative flex items-center justify-center gap-2">

                          {isLoading ? (

                            <>

                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                              <span>
                                Processing Request...
                              </span>

                            </>

                          ) : cooldown > 0 ? (

                            <span>
                              Try again in {cooldown}s
                            </span>

                          ) : (

                            <>

                              <span>
                                Send Reset Link
                              </span>

                              <span className="text-base">
                                →
                              </span>

                            </>

                          )}

                        </span>

                      </motion.button>

                    </form>

                  </>

                ) : (

                  /* =========================================
                     GENERIC SUCCESS
                  ========================================= */

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                    className="py-4 text-center"
                  >

                    {/* ICON */}

                    <motion.div
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 180,
                        delay: 0.1,
                      }}
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-xl text-emerald-300 shadow-lg shadow-emerald-500/10"
                    >
                      ✓
                    </motion.div>

                    <h2 className="mt-4 text-xl font-black text-white sm:text-2xl">
                      Check Your Email
                    </h2>

                    {/* LOCKED GENERIC RESPONSE */}

                    <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-slate-300 sm:text-xs">

                      If the details match an account, a password reset link has been sent to the registered email address.

                    </p>

                    {/* INFO BOX */}

                    <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4 text-left">

                      <p className="text-[10px] font-bold text-slate-200 sm:text-[11px]">
                        Password Reset Security
                      </p>

                      <p className="mt-1.5 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                        The reset link will be time-limited and can only be used according to Buddy Fleets recovery security rules.
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                        Never share your password or password reset link with anyone.
                      </p>

                    </div>

                    {/* BACK TO LOGIN */}

                    <Link
                      to="/login"
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-5 py-3 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition hover:shadow-cyan-500/20 sm:rounded-2xl sm:py-3.5 sm:text-sm"
                    >
                      Back to Login →
                    </Link>

                    {/* RESEND */}

                    <button
                      type="button"
                      disabled={
                        cooldown > 0
                      }
                      onClick={
                        handleTryAgain
                      }
                      className="mt-3 rounded-lg px-2 py-1 text-[9px] font-bold text-cyan-300 transition hover:bg-white/5 hover:text-cyan-200 hover:underline disabled:cursor-not-allowed disabled:text-slate-600 disabled:no-underline sm:text-[10px]"
                    >

                      {cooldown > 0
                        ? `Request again in ${cooldown}s`
                        : 'Request another reset link'}

                    </button>

                  </motion.div>

                )}

                {/* BACK TO LOGIN */}

                {!isSubmitted && (

                  <div className="mt-4 border-t border-white/[0.07] pt-3 text-center">

                    <Link
                      to="/login"
                      className="text-[9px] font-bold text-cyan-300 transition hover:text-cyan-200 hover:underline sm:text-[10px]"
                    >
                      ← Back to Login
                    </Link>

                  </div>

                )}

                {/* SECURITY */}

                <div className="mt-3 flex items-center justify-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Protected Account Recovery
                  </span>

                </div>

              </div>

            </div>

          </motion.section>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="
          relative
          z-40
          mt-2
          flex
          min-h-[64px]
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

          lg:mt-0
          lg:min-h-[58px]
          lg:py-2
        "
      >

        <p className="text-[9px] font-medium tracking-wide text-slate-400 sm:text-[10px]">

          Copyright by{' '}

          <span className="font-bold text-white">
            BUDDY COMPUTERS
          </span>

          . All rights reserved.

        </p>

        <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[9px] sm:tracking-[0.22em]">

          DESIGNED BY{' '}

          <a
            href="https://www.instagram.com/happiest_banda"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 underline decoration-purple-400 underline-offset-2 transition duration-300 hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]"
          >
            SHUBHAM JANGIR
          </a>

        </p>

      </footer>

    </div>
  );
}