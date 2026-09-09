import React, { useState } from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { motion } from 'framer-motion';

import { supabase } from '../../supabaseClient';

/* =========================================================
   BUDDY FLEETS
   LOGIN PAGE

   Navbar + Footer:
   AuthLayout.jsx handles them.

   Login Security:

   Company Code
        +
   Registered Email
        +
   Password
        ↓
   Supabase Auth
        ↓
   Platform Admin
        OR
   Company + Membership Verification
        ↓
   Authorized Dashboard Context
========================================================= */

/* =========================================================
   INPUT STYLES

   Dedicated padding prevents:
   # / @ / SHOW button overlap.
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

const passwordInput =
  `${inputBase} pl-4 pr-20`;

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
   LOGIN
========================================================= */

export default function Login({
  onLoginSuccess,
}) {
  const navigate =
    useNavigate();

  const [
    companyCode,
    setCompanyCode,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  /* =========================================================
     SAFE LOCAL SIGNOUT

     Email/password valid but company verification fail ho
     jaye to Supabase authenticated session browser me
     leave nahi karenge.
  ========================================================= */

  const clearAuthSession =
    async () => {

      try {

        await supabase
          .auth
          .signOut({
            scope:
              'local',
          });

      } catch (err) {

        console.error(
          'Local signout error:',
          err
        );

      }

    };

  /* =========================================================
     LOGIN SUBMIT
  ========================================================= */

  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();

      if (isLoading) {
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

      /*
        IMPORTANT:

        Password ko trim NAHI karna.

        Leading/trailing spaces password ka actual part
        ho sakte hain.
      */

      const cleanPassword =
        password;

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
          'Please enter your registered email address.'
        );

        return;
      }

      /* PASSWORD */

      if (
        !cleanPassword
      ) {

        setErrorMessage(
          'Please enter your password.'
        );

        return;
      }

      setIsLoading(
        true
      );

      try {

        /* =====================================================
           STEP 1
           SUPABASE AUTH

           Password authentication ONLY Supabase Auth.
        ===================================================== */

        const {
          data:
            authData,
          error:
            authError,
        } =
          await supabase
            .auth
            .signInWithPassword({
              email:
                cleanEmail,

              password:
                cleanPassword,
            });

        if (
          authError ||
          !authData?.user ||
          !authData?.session
        ) {

          throw new Error(
            'INVALID_CREDENTIALS'
          );

        }

        const authUser =
          authData.user;

        /* =====================================================
           EMAIL MUST BE CONFIRMED
        ===================================================== */

        if (
          !authUser
            .email_confirmed_at
        ) {

          await clearAuthSession();

          throw new Error(
            'EMAIL_CONFIRMATION_REQUIRED'
          );

        }

        /* =====================================================
           STEP 2
           PROFILE
        ===================================================== */

        const {
          data:
            profile,
          error:
            profileError,
        } =
          await supabase
            .from(
              'profiles'
            )
            .select(
              'id, full_name, email, mobile'
            )
            .eq(
              'id',
              authUser.id
            )
            .maybeSingle();

        if (
          profileError
        ) {

          console.error(
            'Profile read error:',
            profileError
          );

        }

        /* =====================================================
           STEP 3
           PLATFORM SUPER ADMIN
        ===================================================== */

        const {
          data:
            platformAdmin,
          error:
            platformAdminError,
        } =
          await supabase
            .from(
              'platform_admins'
            )
            .select(
              'user_id, is_active'
            )
            .eq(
              'user_id',
              authUser.id
            )
            .eq(
              'is_active',
              true
            )
            .maybeSingle();

        if (
          platformAdminError
        ) {

          console.error(
            'Platform admin check error:',
            platformAdminError
          );

        }

        /* =====================================================
           PLATFORM SUPER ADMIN LOGIN

           Company Code:
           ADMIN

           ADMIN itself is NOT authentication.

           Actual authentication:
           Supabase Auth + active platform_admins row.
        ===================================================== */

        if (
          cleanCompanyCode ===
          'ADMIN'
        ) {

          if (
            !platformAdmin
              ?.is_active
          ) {

            await clearAuthSession();

            throw new Error(
              'INVALID_CREDENTIALS'
            );

          }

          const authenticatedUser = {
            id:
              authUser.id,

            username:
              authUser.email,

            email:
              authUser.email,

            name:
              profile
                ?.full_name ||
              authUser.email,

            mobile:
              profile
                ?.mobile ||
              null,

            role:
              'SUPER_ADMIN',

            userType:
              'platform_admin',

            isPlatformAdmin:
              true,

            companyCode:
              'ADMIN',

            companyId:
              null,

            companyName:
              'Buddy Fleets',

            companyStatus:
              'active',

            databaseCompanyStatus:
              'active',

            accessScope:
              'platform',

            membershipId:
              null,

            membershipStatus:
              null,

            subscriptionStatus:
              null,

            planId:
              null,

            trialStartAt:
              null,

            trialEndAt:
              null,

            subscriptionStartAt:
              null,

            subscriptionEndAt:
              null,
          };

          if (
            onLoginSuccess
          ) {

            onLoginSuccess(
              authenticatedUser
            );

          } else {

            navigate(
              '/dashboard',
              {
                replace:
                  true,
              }
            );

          }

          return;
        }

        /* =====================================================
           IMPORTANT

           Active platform admin ne normal Company Code enter
           kiya hai to company-login flow hi chalega.

           Super Admin privilege automatically company session
           me carry nahi karenge.
        ===================================================== */

        /* =====================================================
           STEP 4
           COMPANY LOOKUP
        ===================================================== */

        const {
          data:
            company,
          error:
            companyError,
        } =
          await supabase
            .from(
              'companies'
            )
            .select(
              `
                id,
                company_code,
                company_name,
                status,
                confirmed_at,
                account_owner_user_id
              `
            )
            .eq(
              'company_code',
              cleanCompanyCode
            )
            .maybeSingle();

        if (
          companyError ||
          !company
        ) {

          await clearAuthSession();

          throw new Error(
            'INVALID_CREDENTIALS'
          );

        }

        /* =====================================================
           STEP 5
           MEMBERSHIP
        ===================================================== */

        const {
          data:
            membership,
          error:
            membershipError,
        } =
          await supabase
            .from(
              'company_memberships'
            )
            .select(
              `
                id,
                company_id,
                user_id,
                status,
                access_scope,
                joined_at
              `
            )
            .eq(
              'company_id',
              company.id
            )
            .eq(
              'user_id',
              authUser.id
            )
            .maybeSingle();

        if (
          membershipError ||
          !membership
        ) {

          await clearAuthSession();

          throw new Error(
            'INVALID_CREDENTIALS'
          );

        }

        /* =====================================================
           MEMBERSHIP STATUS
        ===================================================== */

        if (
          membership.status !==
          'active'
        ) {

          await clearAuthSession();

          if (
            membership.status ===
              'pending' ||
            membership.status ===
              'invited'
          ) {

            throw new Error(
              'MEMBERSHIP_PENDING'
            );

          }

          throw new Error(
            'MEMBERSHIP_DISABLED'
          );

        }

        /* =====================================================
           COMPANY STATUS
        ===================================================== */

        if (
          company.status ===
          'pending_confirmation'
        ) {

          await clearAuthSession();

          throw new Error(
            'EMAIL_CONFIRMATION_REQUIRED'
          );

        }

        if (
          company.status ===
            'suspended' ||
          company.status ===
            'cancelled'
        ) {

          await clearAuthSession();

          throw new Error(
            'COMPANY_BLOCKED'
          );

        }

        const allowedStatuses = [
          'trial_active',
          'trial_expired',
          'active',
        ];

        if (
          !allowedStatuses.includes(
            company.status
          )
        ) {

          await clearAuthSession();

          throw new Error(
            'COMPANY_NOT_AVAILABLE'
          );

        }

        /* =====================================================
           STEP 6
           SUBSCRIPTION
        ===================================================== */

        const {
          data:
            subscription,
          error:
            subscriptionError,
        } =
          await supabase
            .from(
              'subscriptions'
            )
            .select(
              `
                status,
                plan_id,
                trial_start_at,
                trial_end_at,
                subscription_start_at,
                subscription_end_at
              `
            )
            .eq(
              'company_id',
              company.id
            )
            .maybeSingle();

        if (
          subscriptionError
        ) {

          console.error(
            'Subscription read error:',
            subscriptionError
          );

        }

        /* =====================================================
           EFFECTIVE TRIAL STATUS

           DB scheduler later backend state update karega.

           Frontend login ke time:
           trial_end_at past hai to immediately expired
           treat karenge.
        ===================================================== */

        let effectiveCompanyStatus =
          company.status;

        const trialEndAt =
          subscription
            ?.trial_end_at ||
          null;

        if (
          company.status ===
            'trial_active' &&
          trialEndAt &&
          new Date(
            trialEndAt
          ).getTime() <=
            Date.now()
        ) {

          effectiveCompanyStatus =
            'trial_expired';

        }

        /* =====================================================
           STEP 7
           AUTHORIZED COMPANY USER
        ===================================================== */

        const authenticatedUser = {
          id:
            authUser.id,

          username:
            authUser.email,

          email:
            authUser.email,

          name:
            profile
              ?.full_name ||
            authUser.email,

          mobile:
            profile
              ?.mobile ||
            null,

          role:
            'COMPANY_USER',

          userType:
            'company_user',

          /*
            Company login context is NOT platform context.
          */

          isPlatformAdmin:
            false,

          companyId:
            company.id,

          companyCode:
            company.company_code,

          companyName:
            company.company_name,

          companyStatus:
            effectiveCompanyStatus,

          databaseCompanyStatus:
            company.status,

          confirmedAt:
            company.confirmed_at,

          membershipId:
            membership.id,

          membershipStatus:
            membership.status,

          accessScope:
            membership.access_scope,

          isAccountOwner:
            company
              .account_owner_user_id ===
            authUser.id,

          subscriptionStatus:
            subscription
              ?.status ||
            null,

          planId:
            subscription
              ?.plan_id ||
            null,

          trialStartAt:
            subscription
              ?.trial_start_at ||
            null,

          trialEndAt,

          subscriptionStartAt:
            subscription
              ?.subscription_start_at ||
            null,

          subscriptionEndAt:
            subscription
              ?.subscription_end_at ||
            null,
        };

        if (
          onLoginSuccess
        ) {

          onLoginSuccess(
            authenticatedUser
          );

        } else {

          navigate(
            '/dashboard',
            {
              replace:
                true,
            }
          );

        }

      } catch (err) {

        console.error(
          'Login error:',
          err
        );

        const code =
          err?.message;

        /* =====================================================
           SAFE USER ERRORS
        ===================================================== */

        if (
          code ===
          'MEMBERSHIP_PENDING'
        ) {

          setErrorMessage(
            'Your company access is not active yet. Please complete verification or contact your administrator.'
          );

        } else if (
          code ===
          'MEMBERSHIP_DISABLED'
        ) {

          setErrorMessage(
            'Your account access has been disabled. Please contact your administrator.'
          );

        } else if (
          code ===
          'EMAIL_CONFIRMATION_REQUIRED'
        ) {

          setErrorMessage(
            'Please verify your email address before logging in.'
          );

        } else if (
          code ===
            'COMPANY_BLOCKED' ||
          code ===
            'COMPANY_NOT_AVAILABLE'
        ) {

          setErrorMessage(
            'This company account is currently unavailable. Please contact Buddy Fleets support.'
          );

        } else {

          /*
            Wrong Company Code / Email / Password me
            exact failed field reveal nahi karenge.
          */

          setErrorMessage(
            'Invalid company code, email, or password.'
          );

        }

      } finally {

        setIsLoading(
          false
        );

      }

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

        {/* COLOR GLOW */}

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
              Secure Console Access
            </span>

          </div>

          {/* HEADING */}

          <h1 className="text-4xl font-black leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl">

            Welcome back to

            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              command center.
            </span>

          </h1>

          {/* DESCRIPTION */}

          <p className="mx-auto mt-4 max-w-lg text-xs leading-6 text-slate-400 sm:mt-5 sm:text-sm sm:leading-7 lg:mx-0 lg:max-w-md">

            Access your fleet operations, compliance,
            workshops and financial information securely
            through your company workspace.

          </p>

          {/* POINTS */}

          <div className="mx-auto mt-5 flex max-w-md flex-col items-start gap-2.5 sm:mt-6 lg:mx-0 lg:mt-7">

            {[
              'Company-specific secure access',
              'Role & site based permissions',
              'Protected fleet operations',
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
            LOGIN CARD
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

              {/* HEADER */}

              <div className="mb-4">

                <div className="mb-2 flex items-center gap-1.5">

                  <span className="h-1.5 w-8 rounded-full bg-cyan-400" />

                  <span className="h-1.5 w-3 rounded-full bg-blue-500" />

                  <span className="h-1.5 w-2 rounded-full bg-violet-500" />

                </div>

                <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Log in to console
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-[11px]">
                  Enter your Company Code and registered credentials.
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

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={
                  handleSubmit
                }
                noValidate
                className="space-y-3"
              >

                {/* =============================================
                    COMPANY CODE
                ============================================= */}

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
                      autoComplete="organization"
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

                {/* =============================================
                    EMAIL
                ============================================= */}

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
                      autoComplete="username"
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

                {/* =============================================
                    PASSWORD
                ============================================= */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      required
                      disabled={
                        isLoading
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) => {

                        setPassword(
                          event.target.value
                        );

                        setErrorMessage('');

                      }}
                      className={
                        passwordInput
                      }
                    />

                    <button
                      type="button"
                      disabled={
                        isLoading
                      }
                      onClick={() =>
                        setShowPassword(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }
                      className="
                        absolute
                        right-2.5
                        top-1/2
                        -translate-y-1/2
                        rounded-lg
                        px-2.5
                        py-1.5
                        text-[9px]
                        font-bold
                        text-slate-500
                        transition

                        hover:bg-white/5
                        hover:text-cyan-300

                        focus:outline-none
                        focus:ring-2
                        focus:ring-cyan-400/20

                        disabled:opacity-50
                      "
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword
                        ? 'HIDE'
                        : 'SHOW'}
                    </button>

                  </div>

                  {/* FORGOT PASSWORD */}

                  <div className="mt-2 text-right">

                    <Link
                      to="/forgot-password"
                      className="rounded text-[9px] font-bold text-cyan-400 transition hover:text-cyan-300 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-400/20 sm:text-[10px]"
                    >
                      Forgot Password?
                    </Link>

                  </div>

                </div>

                {/* =============================================
                    LOGIN BUTTON
                ============================================= */}

                <motion.button
                  whileHover={
                    !isLoading
                      ? {
                          y: -1,
                        }
                      : {}
                  }
                  whileTap={
                    !isLoading
                      ? {
                          scale:
                            0.99,
                        }
                      : {}
                  }
                  type="submit"
                  disabled={
                    isLoading
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
                          Verifying Access...
                        </span>

                      </>
                    ) : (
                      <>

                        <span>
                          Login
                        </span>

                        <span className="text-base">
                          →
                        </span>

                      </>
                    )}

                  </span>

                </motion.button>

              </form>

              {/* =================================================
                  SIGNUP
              ================================================= */}

              <div className="mt-4 border-t border-white/[0.07] pt-3 text-center">

                <p className="text-[9px] text-slate-500 sm:text-[10px]">

                  New to Buddy Fleets?{' '}

                  <Link
                    to="/signup"
                    className="font-bold text-cyan-300 transition hover:text-cyan-200 hover:underline"
                  >
                    Start your 5-day free trial
                  </Link>

                </p>

              </div>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <div className="mt-3 flex items-center justify-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Supabase Secure Authentication
                </span>

              </div>

            </div>

          </div>

        </motion.section>

      </div>

    </div>
  );
}