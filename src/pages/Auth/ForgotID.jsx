import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import { supabase } from '../../supabaseClient';

/* =========================================================
   BUDDY FLEETS
   FORGOT PASSWORD PAGE

   File:
   ForgotID.jsx

   Route:
   /forgot-password

   WebsiteLayout handles:
   - Header
   - Development notice
   - Footer
   - Dark / Light theme

   DESIGN RULE:
   - One unified auth canvas
   - Same website visual language
   - No separate page sections
   - No Framer Motion
   - No truck / radar / chart
   - No external background image
   - No blinking
   - PageSpeed-first

   RECOVERY FLOW:

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

function MailIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="m5 8 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M12 11v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="8"
        r="1"
        fill="currentColor"
      />
    </svg>
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

    Actual security / rate limiting Edge Function
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

           Handles:
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

        {/* CYAN GLOW */}

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

        {/* BLUE GLOW */}

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

        {/* GREEN GLOW */}

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
              Secure Recovery Portal
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
              Recover your
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
              account access.
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
            Enter your Buddy Fleets Company Code and registered
            email address to securely request a password reset.
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
              'Secure company-based verification',
              'Enumeration-safe recovery process',
              '30-minute single-use reset link',
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

            Protected Account Recovery
          </div>
        </div>

        {/* =================================================
            RECOVERY FORM AREA
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
            {/* TOP ACCENT */}

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

            {/* STATIC GLOW */}

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
              {!isSubmitted ? (
                <>
                  {/* =============================================
                      FORM HEADER
                  ============================================= */}

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
                      Forgot Password
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
                      Enter your company details to request a secure reset link.
                    </p>
                  </div>

                  {/* =============================================
                      ERROR
                  ============================================= */}

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

                  {/* =============================================
                      FORM
                  ============================================= */}

                  <form
                    onSubmit={
                      handleSubmit
                    }
                    noValidate
                    className="
                      space-y-3
                    "
                  >
                    {/* COMPANY CODE */}

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

                    {/* SECURITY INFO */}

                    <div
                      className="
                        rounded-xl

                        border
                        border-cyan-400/15

                        bg-cyan-400/[0.035]

                        p-3
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          gap-2.5
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

                            rounded-md

                            border
                            border-cyan-400/20

                            bg-cyan-400/[0.07]

                            text-cyan-500
                          "
                        >
                          <InfoIcon
                            className="
                              h-3
                              w-3
                            "
                          />
                        </span>

                        <p
                          className="
                            text-[8px]
                            leading-4

                            text-[color:var(--bf-text-muted)]

                            sm:text-[9px]
                          "
                        >
                          For your security, Buddy Fleets will not reveal whether a particular Company Code or email exists.
                        </p>
                      </div>
                    </div>

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        cooldown > 0
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

                  {/* BACK TO LOGIN */}

                  <div
                    className="
                      mt-4

                      border-t
                      border-[color:var(--bf-border)]

                      pt-3

                      text-center
                    "
                  >
                    <Link
                      to="/login"
                      className="
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
                      ← Back to Login
                    </Link>
                  </div>
                </>
              ) : (
                /* =============================================
                   GENERIC SUCCESS
                ============================================= */

                <div
                  className="
                    py-2

                    text-center
                  "
                >
                  {/* ICON */}

                  <div
                    className="
                      mx-auto

                      flex
                      h-14
                      w-14

                      items-center
                      justify-center

                      rounded-2xl

                      border
                      border-emerald-400/25

                      bg-emerald-400/[0.08]

                      text-emerald-500
                    "
                  >
                    <MailIcon
                      className="
                        h-6
                        w-6
                      "
                    />
                  </div>

                  <h2
                    className="
                      mt-4

                      text-xl
                      font-black

                      text-[color:var(--bf-text-primary)]

                      sm:text-2xl
                    "
                  >
                    Check Your Email
                  </h2>

                  {/* GENERIC RESPONSE */}

                  <p
                    className="
                      mx-auto
                      mt-2

                      max-w-sm

                      text-[10px]
                      leading-5

                      text-[color:var(--bf-text-secondary)]

                      sm:text-xs
                    "
                  >
                    If the details match an account, a password reset link has been sent to the registered email address.
                  </p>

                  {/* SECURITY BOX */}

                  <div
                    className="
                      mt-4

                      rounded-2xl

                      border
                      border-cyan-400/15

                      bg-cyan-400/[0.04]

                      p-4

                      text-left
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold

                        text-[color:var(--bf-text-primary)]

                        sm:text-[11px]
                      "
                    >
                      Password Reset Security
                    </p>

                    <p
                      className="
                        mt-1.5

                        text-[9px]
                        leading-4

                        text-[color:var(--bf-text-muted)]

                        sm:text-[10px]
                      "
                    >
                      The reset link is valid for 30 minutes and can only be used once.
                    </p>

                    <p
                      className="
                        mt-1

                        text-[9px]
                        leading-4

                        text-[color:var(--bf-text-muted)]

                        sm:text-[10px]
                      "
                    >
                      Never share your password or password reset link with anyone.
                    </p>
                  </div>

                  {/* LOGIN */}

                  <Link
                    to="/login"
                    className="
                      group

                      mt-4

                      inline-flex
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

                      px-5
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

                      sm:text-sm
                    "
                  >
                    <span>
                      Back to Login
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
                    className="
                      mt-3

                      rounded-lg

                      px-2
                      py-1

                      text-[9px]
                      font-bold

                      text-cyan-500

                      transition-colors
                      duration-200

                      hover:bg-cyan-400/[0.05]
                      hover:text-cyan-400
                      hover:underline

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-cyan-400/30

                      disabled:cursor-not-allowed
                      disabled:text-[color:var(--bf-text-muted)]
                      disabled:no-underline

                      sm:text-[10px]
                    "
                  >
                    {cooldown > 0
                      ? `Request again in ${cooldown}s`
                      : 'Request another reset link'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}