import React, {
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { supabase } from '../../supabaseClient';

/* =========================================================
   BUDDY FLEETS
   LOGIN PAGE

   WebsiteLayout handles:
   - Header
   - Development notice
   - Footer
   - Dark / Light theme

   DESIGN RULE:
   - One unified auth canvas
   - No separate visual sections
   - Same website theme system
   - No Framer Motion
   - No external background image
   - No truck / radar / chart
   - No blinking effects
   - PageSpeed-first

   LOGIN SECURITY:

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
========================================================= */

const inputBase = `
  w-full

  rounded-xl

  border
  border-[color:var(--bf-border)]

  bg-[var(--bf-page-bg)]

  py-2.5

  text-xs
  text-[color:var(--bf-text-primary)]

  outline-none

  transition-colors
  duration-200

  placeholder:text-[color:var(--bf-text-muted)]

  hover:border-cyan-400/25

  focus:border-cyan-400/45
  focus:ring-2
  focus:ring-cyan-400/[0.07]

  disabled:cursor-not-allowed
  disabled:opacity-60

  sm:text-sm
`;

const companyCodeInput =
  `${inputBase} pl-10 pr-3.5 uppercase`;

const emailInput =
  `${inputBase} pl-10 pr-3.5`;

const passwordInput =
  `${inputBase} pl-3.5 pr-20`;

/* =========================================================
   ICONS
========================================================= */

function CheckIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
     jaye to authenticated Supabase session browser me
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

      /* =====================================================
         COMPANY CODE
      ===================================================== */

      if (
        !cleanCompanyCode
      ) {
        setErrorMessage(
          'Please enter your Company Code.'
        );

        return;
      }

      /* =====================================================
         EMAIL
      ===================================================== */

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

      /* =====================================================
         PASSWORD
      ===================================================== */

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
            .select(`
              id,
              company_code,
              company_name,
              status,
              confirmed_at,
              account_owner_user_id
            `)
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
            .select(`
              id,
              company_id,
              user_id,
              status,
              access_scope,
              joined_at
            `)
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
            .select(`
              status,
              plan_id,
              trial_start_at,
              trial_end_at,
              subscription_start_at,
              subscription_end_at
            `)
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
        isolate

        flex
        w-full
        flex-1

        overflow-hidden

        bg-[var(--bf-page-bg)]

        text-[color:var(--bf-text-primary)]

        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          SINGLE UNIFIED BACKGROUND
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-10

          overflow-hidden
        "
      >
        {/* BASE */}

        <div
          className="
            absolute
            inset-0

            bg-[var(--bf-page-bg)]
          "
        />

        {/* GRID */}

        <div
          className="
            absolute
            inset-0

            opacity-[0.035]
          "
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.28) 1px, transparent 1px)',

            backgroundSize:
              '72px 72px',
          }}
        />

        {/* LEFT CYAN GLOW */}

        <div
          className="
            absolute
            -left-48
            top-[-80px]

            h-[480px]
            w-[480px]

            rounded-full

            bg-cyan-500/[0.065]

            blur-[135px]
          "
        />

        {/* RIGHT BLUE GLOW */}

        <div
          className="
            absolute
            -right-52
            top-[5%]

            h-[500px]
            w-[500px]

            rounded-full

            bg-blue-500/[0.055]

            blur-[145px]
          "
        />

        {/* CENTER GREEN GLOW */}

        <div
          className="
            absolute
            bottom-[-240px]
            left-[38%]

            h-[420px]
            w-[420px]

            rounded-full

            bg-emerald-500/[0.04]

            blur-[130px]
          "
        />
      </div>

      {/* =====================================================
          ONE UNIFIED AUTH CANVAS

          Left content + login form are one composition.
          No separate visual page sections.
      ===================================================== */}

      <div
        className="
          relative

          mx-auto

          grid
          w-full
          max-w-7xl

          items-center

          gap-7

          px-5
          py-6

          sm:px-8
          sm:py-7

          lg:grid-cols-[minmax(0,1fr)_420px]
          lg:gap-12
          lg:px-12
          lg:py-5

          xl:grid-cols-[minmax(0,1fr)_440px]
          xl:gap-16
        "
      >
        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div
          className="
            mx-auto

            w-full
            max-w-2xl

            text-center

            lg:mx-0
            lg:text-left
          "
        >
          {/* BADGE */}

          <div
            className="
              inline-flex

              items-center
              gap-2.5

              rounded-full

              border
              border-cyan-400/20

              bg-cyan-400/[0.06]

              px-3.5
              py-2
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

            <span
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.19em]

                text-cyan-500

                sm:text-[9px]
              "
            >
              Secure Console Access
            </span>
          </div>

          {/* HEADING */}

          <h1
            className="
              mt-4

              text-[clamp(2.15rem,4.2vw,3.75rem)]

              font-black

              leading-[1.04]

              tracking-[-0.035em]
            "
          >
            <span
              className="
                block

                text-[color:var(--bf-text-primary)]
              "
            >
              Welcome back to
            </span>

            <span
              className="
                block

                bg-gradient-to-r
                from-[#12BFF2]
                via-[#078EE5]
                to-[#0AA23B]

                bg-clip-text
                text-transparent
              "
            >
              command center.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-3.5

              max-w-lg

              text-xs
              leading-6

              text-[color:var(--bf-text-secondary)]

              sm:text-sm
              sm:leading-7

              lg:mx-0
            "
          >
            Access your fleet operations, compliance,
            workshops and financial information securely
            through your company workspace.
          </p>

          {/* SUPPORTING POINTS */}

          <div
            className="
              mx-auto
              mt-5

              flex
              max-w-lg
              flex-col

              gap-2.5

              lg:mx-0
            "
          >
            {[
              'Company-specific secure access',
              'Role & site based permissions',
              'Protected fleet operations',
            ].map(
              (
                item
              ) => (
                <div
                  key={
                    item
                  }
                  className="
                    flex
                    items-center
                    gap-3

                    text-left

                    text-[10px]
                    font-medium

                    text-[color:var(--bf-text-secondary)]

                    sm:text-xs
                  "
                >
                  <span
                    className="
                      flex
                      h-5
                      w-5

                      shrink-0

                      items-center
                      justify-center

                      rounded-lg

                      border
                      border-cyan-400/20

                      bg-cyan-400/[0.06]

                      text-cyan-500
                    "
                  >
                    <CheckIcon
                      className="
                        h-3
                        w-3
                      "
                    />
                  </span>

                  <span>
                    {item}
                  </span>
                </div>
              )
            )}
          </div>

          {/* SECURITY LINE */}

          <div
            className="
              mx-auto
              mt-5

              flex
              max-w-lg

              items-center
              justify-center

              gap-2

              text-[8px]
              font-semibold
              uppercase
              tracking-[0.14em]

              text-[color:var(--bf-text-muted)]

              lg:mx-0
              lg:justify-start
            "
          >
            <ShieldIcon
              className="
                h-3.5
                w-3.5

                text-emerald-500
              "
            />

            Supabase Secure Authentication
          </div>
        </div>

        {/* =================================================
            LOGIN FORM AREA

            Part of same unified canvas.
        ================================================= */}

        <div
          className="
            relative

            mx-auto

            w-full
            max-w-[440px]

            lg:mx-0
            lg:justify-self-end
          "
        >
          {/* SOFT OUTER GLOW */}

          <div
            aria-hidden="true"
            className="
              absolute
              -inset-[1px]

              rounded-[25px]

              bg-gradient-to-br
              from-cyan-400/18
              via-blue-500/[0.05]
              to-emerald-500/14

              blur-xl
            "
          />

          {/* FORM SURFACE */}

          <div
            className="
              relative

              overflow-hidden

              rounded-[24px]

              border
              border-[color:var(--bf-border)]

              bg-[var(--bf-surface)]

              shadow-2xl
              shadow-black/10

              backdrop-blur-xl
            "
          >
            {/* TOP GRADIENT LINE */}

            <div
              className="
                absolute
                left-0
                right-0
                top-0

                h-px

                bg-gradient-to-r
                from-transparent
                via-cyan-400
                to-transparent
              "
            />

            {/* STATIC CARD GLOW */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none

                absolute
                -right-28
                -top-28

                h-56
                w-56

                rounded-full

                bg-cyan-500/[0.055]

                blur-[80px]
              "
            />

            <div
              className="
                relative

                p-5

                sm:p-6
              "
            >
              {/* ===============================================
                  FORM HEADER
              =============================================== */}

              <div className="mb-4">

                <div
                  className="
                    mb-2

                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-8

                      rounded-full

                      bg-[#12BFF2]
                    "
                  />

                  <span
                    className="
                      h-1.5
                      w-3

                      rounded-full

                      bg-[#078EE5]
                    "
                  />

                  <span
                    className="
                      h-1.5
                      w-2

                      rounded-full

                      bg-[#0AA23B]
                    "
                  />
                </div>

                <h2
                  className="
                    text-xl
                    font-black
                    tracking-tight

                    text-[color:var(--bf-text-primary)]

                    sm:text-2xl
                  "
                >
                  Log in to console
                </h2>

                <p
                  className="
                    mt-1

                    text-[10px]
                    leading-4

                    text-[color:var(--bf-text-muted)]

                    sm:text-[11px]
                  "
                >
                  Enter your Company Code and registered credentials.
                </p>
              </div>

              {/* ===============================================
                  ERROR
              =============================================== */}

              {errorMessage && (
                <div
                  className="
                    mb-3

                    rounded-xl

                    border
                    border-red-400/20

                    bg-red-400/[0.06]

                    px-3
                    py-2.5
                  "
                  role="alert"
                  aria-live="polite"
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-2
                    "
                  >
                    <span
                      className="
                        mt-[1px]

                        flex
                        h-4
                        w-4

                        shrink-0

                        items-center
                        justify-center

                        rounded-full

                        bg-red-400/10

                        text-[9px]
                        font-black

                        text-red-500
                      "
                    >
                      !
                    </span>

                    <p
                      className="
                        text-[9px]
                        leading-4

                        text-red-500

                        sm:text-[10px]
                      "
                    >
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* ===============================================
                  FORM
              =============================================== */}

              <form
                onSubmit={
                  handleSubmit
                }
                noValidate
                className="
                  space-y-3
                "
              >
                {/* =============================================
                    COMPANY CODE
                ============================================= */}

                <div>
                  <label
                    htmlFor="companyCode"
                    className="
                      mb-1

                      block

                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.13em]

                      text-[color:var(--bf-text-muted)]

                      sm:text-[9px]
                    "
                  >
                    Company Code
                  </label>

                  <div className="relative">

                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none

                        absolute
                        left-3.5
                        top-1/2
                        z-10

                        -translate-y-1/2

                        text-[11px]
                        font-black

                        text-cyan-500
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
                    className="
                      mb-1

                      block

                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.13em]

                      text-[color:var(--bf-text-muted)]

                      sm:text-[9px]
                    "
                  >
                    Registered Email
                  </label>

                  <div className="relative">

                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none

                        absolute
                        left-3.5
                        top-1/2
                        z-10

                        -translate-y-1/2

                        text-[11px]
                        font-black

                        text-cyan-500
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
                    className="
                      mb-1

                      block

                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.13em]

                      text-[color:var(--bf-text-muted)]

                      sm:text-[9px]
                    "
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
                        right-2
                        top-1/2

                        -translate-y-1/2

                        rounded-lg

                        px-2.5
                        py-1.5

                        text-[8px]
                        font-black

                        text-[color:var(--bf-text-muted)]

                        transition-colors
                        duration-200

                        hover:bg-cyan-400/[0.06]
                        hover:text-cyan-500

                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-cyan-400/30

                        disabled:opacity-50

                        sm:text-[9px]
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

                  <div
                    className="
                      mt-1.5
                      text-right
                    "
                  >
                    <Link
                      to="/forgot-password"
                      className="
                        rounded

                        text-[9px]
                        font-bold

                        text-cyan-500

                        transition-colors
                        duration-200

                        hover:text-cyan-400
                        hover:underline

                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-cyan-400/30

                        sm:text-[10px]
                      "
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* =============================================
                    LOGIN BUTTON
                ============================================= */}

                <button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="
                    group

                    flex
                    min-h-11
                    w-full

                    items-center
                    justify-center

                    gap-2

                    rounded-xl

                    bg-gradient-to-r
                    from-[#12BFF2]
                    via-[#078EE5]
                    to-[#0AA23B]

                    px-4
                    py-2.5

                    text-xs
                    font-black

                    text-white

                    shadow-lg
                    shadow-blue-500/10

                    transition
                    duration-200

                    hover:-translate-y-0.5
                    hover:shadow-blue-500/20

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400/50

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0

                    sm:text-sm
                  "
                >
                  {isLoading ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4

                          animate-spin

                          rounded-full

                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      <span>
                        Verifying Access...
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Login
                      </span>

                      <ArrowIcon
                        className="
                          h-4
                          w-4

                          transition-transform
                          duration-200

                          group-hover:translate-x-0.5
                        "
                      />
                    </>
                  )}
                </button>
              </form>

              {/* ===============================================
                  SIGNUP LINK
              =============================================== */}

              <div
                className="
                  mt-4

                  border-t
                  border-[color:var(--bf-border)]

                  pt-3

                  text-center
                "
              >
                <p
                  className="
                    text-[9px]

                    text-[color:var(--bf-text-muted)]

                    sm:text-[10px]
                  "
                >
                  New to Buddy Fleets?{' '}

                  <Link
                    to="/signup"
                    className="
                      font-bold

                      text-cyan-500

                      transition-colors
                      duration-200

                      hover:text-cyan-400
                      hover:underline

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-cyan-400/30
                    "
                  >
                    Start your 5-day free trial
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}