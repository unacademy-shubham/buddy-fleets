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
   BUDDY FLEETS
   FORGOT PASSWORD PAGE

   File name:
   ForgotID.jsx

   Actual purpose:
   Password Recovery

   Navbar + Footer:
   AuthLayout.jsx handles them.

   Recovery flow:

   Company Code + Registered Email
            ↓
   request-password-reset Edge Function
            ↓
   Server-side account verification
            ↓
   Enumeration-safe generic response
            ↓
   Secure 30-minute reset link
            ↓
   /reset-password?token=...
========================================================= */

/* =========================================================
   INPUT STYLES

   Dedicated left padding prevents:
   # / @ prefix and placeholder overlap.
========================================================= */

const inputBase = `
  w-full
  rounded-xl
  border
  border-white/10
  bg-[#101a2c]/85
  py-2.5
  text-xs
  text-white
  outline-none
  transition-all
  duration-300

  placeholder:text-slate-600

  focus:border-cyan-400/60
  focus:bg-[#142139]
  focus:ring-4
  focus:ring-cyan-400/10

  disabled:cursor-not-allowed
  disabled:opacity-60

  sm:rounded-2xl
  sm:py-3
  sm:text-sm
`;

const companyCodeInput =
  `${inputBase} pl-11 pr-4 uppercase`;

const emailInput =
  `${inputBase} pl-11 pr-4`;

/* =========================================================
   AMBIENT ORB
========================================================= */

function AmbientOrb({
  className = '',
}) {
  return (
    <motion.div
      animate={{
        scale: [
          1,
          1.12,
          1,
        ],

        opacity: [
          0.2,
          0.42,
          0.2,
        ],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`
        pointer-events-none
        absolute
        rounded-full
        blur-[110px]
        ${className}
      `}
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

        opacity: [
          0,
          0.35,
          0.65,
          0,
        ],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`
        pointer-events-none
        absolute
        left-0
        ${bottom}
        h-px
        ${width}
        bg-gradient-to-r
        from-transparent
        via-cyan-300/50
        to-transparent
      `}
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

        opacity: [
          0,
          1,
          1,
          0,
        ],
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
          scale: [
            0.7,
            1.4,
          ],

          opacity: [
            0.45,
            0,
          ],
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
          scale: [
            0.7,
            1.4,
          ],

          opacity: [
            0.3,
            0,
          ],
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
  const [
    companyCode,
    setCompanyCode,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    isSubmitted,
    setIsSubmitted,
  ] = useState(false);

  /*
    Frontend cooldown only UX protection hai.

    Actual security/rate limiting Edge Function
    enforce karti hai.
  */

  const [
    cooldown,
    setCooldown,
  ] = useState(0);

  /* =========================================================
     COOLDOWN TIMER
  ========================================================= */

  useEffect(() => {

    if (
      cooldown <= 0
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {

          setCooldown(
            (
              current
            ) => {

              if (
                current <= 1
              ) {

                window.clearInterval(
                  timer
                );

                return 0;
              }

              return (
                current - 1
              );
            }
          );

        },
        1000
      );

    return () => {

      window.clearInterval(
        timer
      );

    };

  }, [
    cooldown,
  ]);

  /* =========================================================
     REQUEST PASSWORD RESET
  ========================================================= */

  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();

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

      if (
        !cleanCompanyCode
      ) {

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

      setIsLoading(
        true
      );

      try {

        /* =====================================================
           SECURE PASSWORD RESET REQUEST

           Browser does NOT:
           - query companies for account verification
           - enumerate profiles/users
           - reveal account existence

           Edge Function:
           request-password-reset

           handles:
           - Company Code validation
           - Email/user validation
           - Membership validation
           - Rate limiting
           - Token generation
           - Secure email delivery
           - Generic response
        ===================================================== */

        const {
          error:
            functionError,
        } =
          await supabase
            .functions
            .invoke(
              'request-password-reset',
              {
                body: {
                  companyCode:
                    cleanCompanyCode,

                  email:
                    cleanEmail,
                },
              }
            );

        /*
          Application-level account mismatch should remain
          generic.

          Actual Edge Function/network failure can still
          produce temporary error.
        */

        if (
          functionError
        ) {

          console.error(
            'Password reset function error:',
            functionError
          );

          throw new Error(
            'RESET_REQUEST_FAILED'
          );

        }

        /* GENERIC SUCCESS */

        setIsSubmitted(
          true
        );

        setCooldown(
          60
        );

      } catch (err) {

        console.error(
          'Password reset request error:',
          err
        );

        setErrorMessage(
          'Unable to process the request right now. Please try again in a moment.'
        );

      } finally {

        setIsLoading(
          false
        );

      }

    };

  /* =========================================================
     REQUEST AGAIN
  ========================================================= */

  const handleTryAgain =
    () => {

      if (
        cooldown > 0
      ) {
        return;
      }

      setIsSubmitted(
        false
      );

      setErrorMessage('');

    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      className="
        relative
        min-h-full
        w-full
        overflow-x-hidden
        bg-[#050914]
        text-white

        lg:h-full
        lg:min-h-0
        lg:overflow-hidden
      "
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">

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
          DESKTOP EFFECTS
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden lg:block">

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

      {/* =====================================================
          CONTENT
      ===================================================== */}

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
          py-7

          sm:gap-9
          sm:px-6
          sm:py-9

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

            Enter your Buddy Fleets Company Code and registered
            email address to securely request a password reset.

          </p>

          {/* POINTS */}

          <div className="mx-auto mt-5 flex max-w-md flex-col items-start gap-2.5 sm:mt-6 lg:mx-0 lg:mt-7">

            {[
              'Secure company-based verification',
              'Enumeration-safe recovery process',
              '30-minute single-use reset link',
            ].map(
              (
                item
              ) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-left text-[10px] font-medium text-slate-300 sm:text-xs"
                >

                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-[9px] text-cyan-300">
                    ✓
                  </span>

                  {item}

                </div>
              )
            )}

          </div>

        </motion.section>

        {/* =================================================
            MOBILE / TABLET TRUCK
        ================================================= */}

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

            {/* TOP EDGE */}

            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* CARD GLOWS */}

            <div className="pointer-events-none absolute -right-28 -top-28 h-56 w-56 rounded-full bg-cyan-500/10 blur-[80px]" />

            <div className="pointer-events-none absolute -bottom-28 -left-28 h-56 w-56 rounded-full bg-violet-600/10 blur-[80px]" />

            <div className="relative p-4 sm:p-6 lg:p-5 xl:p-6">

              {!isSubmitted ? (

                <>
                  {/* =========================================
                      HEADER
                  ========================================= */}

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

                  {/* =========================================
                      ERROR
                  ========================================= */}

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

                  {/* =========================================
                      FORM
                  ========================================= */}

                  <form
                    onSubmit={
                      handleSubmit
                    }
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

                        <span
                          aria-hidden="true"
                          className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            z-10
                            -translate-y-1/2
                            text-[11px]
                            font-black
                            text-cyan-400/70
                          "
                        >
                          #
                        </span>

                        <input
                          id="companyCode"
                          type="text"
                          required
                          disabled={
                            isLoading
                          }
                          autoComplete="off"
                          autoCapitalize="characters"
                          spellCheck={false}
                          placeholder="BUDDY001"
                          value={
                            companyCode
                          }
                          onChange={(
                            event
                          ) => {

                            setCompanyCode(
                              event.target.value
                            );

                            setErrorMessage('');

                          }}
                          className={
                            companyCodeInput
                          }
                        />

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div>

                      <label
                        htmlFor="email"
                        className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                      >
                        Registered Email
                      </label>

                      <div className="relative">

                        <span
                          aria-hidden="true"
                          className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            z-10
                            -translate-y-1/2
                            text-[11px]
                            font-black
                            text-cyan-400/70
                          "
                        >
                          @
                        </span>

                        <input
                          id="email"
                          type="email"
                          required
                          disabled={
                            isLoading
                          }
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          placeholder="name@company.com"
                          value={
                            email
                          }
                          onChange={(
                            event
                          ) => {

                            setEmail(
                              event.target.value
                            );

                            setErrorMessage('');

                          }}
                          className={
                            emailInput
                          }
                        />

                      </div>

                    </div>

                    {/* =========================================
                        SECURITY INFO
                    ========================================= */}

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

                    {/* =========================================
                        SUBMIT
                    ========================================= */}

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
                              scale:
                                0.99,
                            }
                          : {}
                      }
                      type="submit"
                      disabled={
                        isLoading ||
                        cooldown > 0
                      }
                      className="
                        group
                        relative
                        w-full
                        overflow-hidden
                        rounded-xl
                        bg-gradient-to-r
                        from-cyan-400
                        via-blue-500
                        to-violet-600
                        px-4
                        py-3
                        text-xs
                        font-black
                        text-white
                        shadow-xl
                        shadow-blue-600/20
                        transition-all
                        duration-300

                        hover:shadow-cyan-500/20

                        focus:outline-none
                        focus:ring-4
                        focus:ring-cyan-400/20

                        disabled:cursor-not-allowed
                        disabled:opacity-60

                        sm:rounded-2xl
                        sm:py-3.5
                        sm:text-sm

                        lg:py-3
                        lg:text-xs
                      "
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

                /* =============================================
                   GENERIC SUCCESS
                ============================================= */

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
                      type:
                        'spring',

                      stiffness:
                        180,

                      delay:
                        0.1,
                    }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-xl text-emerald-300 shadow-lg shadow-emerald-500/10"
                  >
                    ✓
                  </motion.div>

                  <h2 className="mt-4 text-xl font-black text-white sm:text-2xl">
                    Check Your Email
                  </h2>

                  {/* GENERIC RESPONSE */}

                  <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-slate-300 sm:text-xs">
                    If the details match an account, a password reset link has been sent to the registered email address.
                  </p>

                  {/* SECURITY BOX */}

                  <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4 text-left">

                    <p className="text-[10px] font-bold text-slate-200 sm:text-[11px]">
                      Password Reset Security
                    </p>

                    <p className="mt-1.5 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                      The reset link is valid for 30 minutes and can only be used once.
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                      Never share your password or password reset link with anyone.
                    </p>

                  </div>

                  {/* LOGIN */}

                  <Link
                    to="/login"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-5 py-3 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition hover:shadow-cyan-500/20 sm:rounded-2xl sm:py-3.5 sm:text-sm"
                  >
                    Back to Login →
                  </Link>

                  {/* REQUEST AGAIN */}

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

              {/* =================================================
                  BACK TO LOGIN
              ================================================= */}

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

              {/* =================================================
                  SECURITY INDICATOR
              ================================================= */}

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

    </div>
  );
}