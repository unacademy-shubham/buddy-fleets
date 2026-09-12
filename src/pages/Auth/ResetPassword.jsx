import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { supabase } from '../../supabaseClient';

/* =========================================================
   BUDDY FLEETS
   RESET PASSWORD PAGE

   WebsiteLayout handles:
   - Header
   - Development notice
   - Footer
   - Dark / Light theme

   DESIGN:
   - One unified auth canvas
   - Same website visual language
   - No Framer Motion
   - No truck / radar / chart
   - No external background image
   - No blinking
   - PageSpeed-first

   SECURITY FLOW:

   Email Reset Link
        ↓
   Capture Raw Token
        ↓
   Remove Token From Browser URL
        ↓
   validate-password-reset
        ↓
   Valid Token Only
        ↓
   Password Form
        ↓
   complete-password-reset
        ↓
   Password Updated
        ↓
   Token Used
        ↓
   Existing Sessions Revoked
        ↓
   Manual Login
========================================================= */

/* =========================================================
   INPUT STYLE
========================================================= */

const inputBase = `
  w-full

  rounded-xl

  border
  border-[color:var(--bf-border)]

  bg-[var(--bf-page-bg)]

  py-2.5
  pl-3.5
  pr-20

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

function CloseIcon({
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
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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

function LockIcon({
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
        x="5"
        y="10"
        width="14"
        height="10"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 10V7.5A4 4 0 0 1 12 3.5a4 4 0 0 1 4 4V10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   RESET PASSWORD
========================================================= */

export default function ResetPassword() {
  const navigate =
    useNavigate();

  /* =========================================================
     CAPTURE INITIAL TOKEN

     React StrictMode development me effects repeat ho sakte
     hain.

     Isliye URL token ko useRef me immediately capture
     karenge before URL cleanup.
  ========================================================= */

  const initialTokenRef =
    useRef(
      new URLSearchParams(
        window.location.search
      )
        .get('token')
        ?.trim() || ''
    );

  /* =========================================================
     TOKEN STATES
  ========================================================= */

  const [
    token,
    setToken,
  ] = useState('');

  const [
    isTokenChecking,
    setIsTokenChecking,
  ] = useState(true);

  const [
    isTokenValid,
    setIsTokenValid,
  ] = useState(false);

  const [
    tokenError,
    setTokenError,
  ] = useState('');

  /* =========================================================
     PASSWORD STATES
  ========================================================= */

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /* =========================================================
     UI STATES
  ========================================================= */

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isSuccess,
    setIsSuccess,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  /* =========================================================
     VALIDATE TOKEN ON PAGE LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const validateResetToken =
      async () => {
        const resetToken =
          initialTokenRef.current;

        /* TOKEN MISSING */

        if (!resetToken) {
          if (!cancelled) {
            setToken('');

            setIsTokenValid(
              false
            );

            setTokenError(
              'This password reset link is invalid or missing.'
            );

            setIsTokenChecking(
              false
            );
          }

          return;
        }

        /*
          Keep token safely in component state.
        */

        setToken(
          resetToken
        );

        /*
          Remove raw token from visible browser URL.

          Token remains available inside initialTokenRef/state.
        */

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        try {
          /* ===============================================
             SERVER TOKEN VALIDATION
          =============================================== */

          const {
            data,
            error:
              functionError,
          } =
            await supabase
              .functions
              .invoke(
                'validate-password-reset',
                {
                  body: {
                    token:
                      resetToken,
                  },
                }
              );

          if (cancelled) {
            return;
          }

          /* FUNCTION ERROR */

          if (
            functionError
          ) {
            console.error(
              'Reset token validation function error:',
              functionError
            );

            setIsTokenValid(
              false
            );

            setTokenError(
              'Unable to validate this password reset link. Please request a new reset link.'
            );

            return;
          }

          /* VALID */

          if (
            data?.valid ===
              true &&
            data?.code ===
              'TOKEN_VALID'
          ) {
            setIsTokenValid(
              true
            );

            setTokenError('');

            return;
          }

          /* USED */

          if (
            data?.code ===
            'TOKEN_USED'
          ) {
            setIsTokenValid(
              false
            );

            setTokenError(
              'This password reset link has already been used.'
            );

            return;
          }

          /* EXPIRED */

          if (
            data?.code ===
            'TOKEN_EXPIRED'
          ) {
            setIsTokenValid(
              false
            );

            setTokenError(
              'This password reset link has expired.'
            );

            return;
          }

          /* REVOKED */

          if (
            data?.code ===
            'TOKEN_REVOKED'
          ) {
            setIsTokenValid(
              false
            );

            setTokenError(
              'This password reset link is no longer valid.'
            );

            return;
          }

          /* INVALID */

          setIsTokenValid(
            false
          );

          setTokenError(
            'This password reset link is invalid.'
          );
        } catch (err) {
          console.error(
            'Reset token validation error:',
            err
          );

          if (!cancelled) {
            setIsTokenValid(
              false
            );

            setTokenError(
              'Unable to validate this password reset link. Please request a new one.'
            );
          }
        } finally {
          if (!cancelled) {
            setIsTokenChecking(
              false
            );
          }
        }
      };

    validateResetToken();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =========================================================
     PASSWORD RULES
  ========================================================= */

  const passwordRules = {
    length:
      newPassword.length >=
        8 &&
      newPassword.length <=
        64,

    uppercase:
      /[A-Z]/.test(
        newPassword
      ),

    lowercase:
      /[a-z]/.test(
        newPassword
      ),

    number:
      /\d/.test(
        newPassword
      ),

    symbol:
      /[^A-Za-z0-9\s]/.test(
        newPassword
      ),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.symbol;

  const passwordsMatch =
    newPassword.length >
      0 &&
    newPassword ===
      confirmPassword;

  /* =========================================================
     INVALIDATE TOKEN LOCALLY
  ========================================================= */

  const invalidateToken = (
    message
  ) => {
    setIsTokenValid(
      false
    );

    setTokenError(
      message
    );

    setToken('');

    setNewPassword('');

    setConfirmPassword('');

    setShowPassword(
      false
    );

    setShowConfirmPassword(
      false
    );

    setErrorMessage('');
  };

  /* =========================================================
     SUBMIT PASSWORD RESET
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

      /* TOKEN */

      if (
        !token ||
        !isTokenValid
      ) {
        invalidateToken(
          'This password reset link is invalid or no longer available.'
        );

        return;
      }

      /* PASSWORD POLICY */

      if (
        !isPasswordValid
      ) {
        setErrorMessage(
          'Password must be 8–64 characters and include at least one uppercase letter, one lowercase letter, one number and one special character.'
        );

        return;
      }

      /* PASSWORD MATCH */

      if (
        newPassword !==
        confirmPassword
      ) {
        setErrorMessage(
          'New Password and Confirm Password do not match.'
        );

        return;
      }

      setIsLoading(
        true
      );

      try {
        /* ===============================================
           COMPLETE PASSWORD RESET
        =============================================== */

        const {
          data,
          error:
            functionError,
        } =
          await supabase
            .functions
            .invoke(
              'complete-password-reset',
              {
                body: {
                  token,
                  newPassword,
                },
              }
            );

        /* FUNCTION / NETWORK ERROR */

        if (
          functionError
        ) {
          console.error(
            'Complete password reset function error:',
            functionError
          );

          throw new Error(
            'RESET_FAILED'
          );
        }

        /* ===============================================
           SUCCESS
        =============================================== */

        if (
          data?.ok ===
          true
        ) {
          /*
            Backend already revokes sessions.

            Current browser Supabase session also clear
            locally.
          */

          try {
            await supabase
              .auth
              .signOut({
                scope:
                  'local',
              });
          } catch (
            signOutError
          ) {
            console.error(
              'Post reset local signout error:',
              signOutError
            );
          }

          setToken('');

          setNewPassword('');

          setConfirmPassword('');

          setShowPassword(
            false
          );

          setShowConfirmPassword(
            false
          );

          setIsTokenValid(
            false
          );

          setIsSuccess(
            true
          );

          return;
        }

        /* TOKEN USED */

        if (
          data?.code ===
          'TOKEN_USED'
        ) {
          invalidateToken(
            'This password reset link has already been used.'
          );

          return;
        }

        /* TOKEN EXPIRED */

        if (
          data?.code ===
          'TOKEN_EXPIRED'
        ) {
          invalidateToken(
            'This password reset link has expired.'
          );

          return;
        }

        /* TOKEN INVALID */

        if (
          data?.code ===
            'TOKEN_INVALID' ||
          data?.code ===
            'TOKEN_REVOKED'
        ) {
          invalidateToken(
            'This password reset link is invalid or no longer available.'
          );

          return;
        }

        /* PASSWORD POLICY */

        if (
          data?.code ===
          'PASSWORD_POLICY'
        ) {
          setErrorMessage(
            'Your new password does not meet Buddy Fleets security requirements.'
          );

          return;
        }

        throw new Error(
          'RESET_FAILED'
        );
      } catch (err) {
        console.error(
          'Password reset error:',
          err
        );

        setErrorMessage(
          'Unable to reset your password right now. Please try again or request a new reset link.'
        );
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

        {/* STATIC GRID */}

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

          lg:grid-cols-[minmax(0,1fr)_430px]
          lg:gap-12
          lg:px-12
          lg:py-5

          xl:grid-cols-[minmax(0,1fr)_448px]
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
              Secure Password Reset
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
              Create a new
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
              secure password.
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
            Choose a strong new password for your Buddy Fleets
            account. Used, expired or revoked reset links are
            blocked before password entry.
          </p>

          {/* SECURITY POINTS */}

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
              '30-minute secure reset link',
              'Single-use password reset token',
              'Existing sessions revoked after reset',
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

            Protected Password Recovery
          </div>
        </div>

        {/* =================================================
            RESET PASSWORD AREA
        ================================================= */}

        <div
          className="
            relative

            mx-auto

            w-full
            max-w-[448px]

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
              {/* =================================================
                  TOKEN CHECKING
              ================================================= */}

              {isTokenChecking && (
                <div
                  className="
                    py-6
                    text-center
                  "
                  aria-live="polite"
                >
                  <div
                    className="
                      mx-auto

                      h-11
                      w-11

                      animate-spin

                      rounded-full

                      border-2
                      border-cyan-400/20
                      border-t-cyan-500
                    "
                  />

                  <h2
                    className="
                      mt-4

                      text-lg
                      font-black

                      text-[color:var(--bf-text-primary)]

                      sm:text-xl
                    "
                  >
                    Checking Reset Link...
                  </h2>

                  <p
                    className="
                      mx-auto
                      mt-2

                      max-w-sm

                      text-[10px]
                      leading-5

                      text-[color:var(--bf-text-muted)]

                      sm:text-xs
                    "
                  >
                    Please wait while we securely verify your
                    password reset request.
                  </p>
                </div>
              )}

              {/* =================================================
                  INVALID / USED / EXPIRED
              ================================================= */}

              {!isTokenChecking &&
                !isTokenValid &&
                !isSuccess && (
                  <div
                    className="
                      py-3
                      text-center
                    "
                  >
                    {/* ERROR ICON */}

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
                        border-red-400/25

                        bg-red-400/[0.07]

                        text-red-500
                      "
                    >
                      <CloseIcon
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
                      Reset Link Unavailable
                    </h2>

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
                      role="alert"
                    >
                      {tokenError}
                    </p>

                    {/* SECURITY INFO */}

                    <div
                      className="
                        mt-4

                        rounded-2xl

                        border
                        border-red-400/10

                        bg-red-400/[0.025]

                        p-4

                        text-left
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          font-bold

                          text-[color:var(--bf-text-primary)]
                        "
                      >
                        For your security
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
                        Buddy Fleets password reset links are valid
                        for 30 minutes and can only be used once.
                      </p>
                    </div>

                    <Link
                      to="/forgot-password"
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
                        Request New Reset Link
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

                    <Link
                      to="/login"
                      className="
                        mt-3

                        inline-block

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
                      Back to Login
                    </Link>
                  </div>
                )}

              {/* =================================================
                  VALID TOKEN — FORM
              ================================================= */}

              {!isTokenChecking &&
                isTokenValid &&
                !isSuccess && (
                  <div>
                    {/* HEADER */}

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
                        Reset Password
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
                        Enter and confirm your new secure password.
                      </p>
                    </div>

                    {/* ERROR */}

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
                    )}

                    {/* FORM */}

                    <form
                      onSubmit={
                        handleSubmit
                      }
                      noValidate
                      className="
                        space-y-3
                      "
                    >
                      {/* NEW PASSWORD */}

                      <div>
                        <label
                          htmlFor="newPassword"
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
                          New Password
                        </label>

                        <div className="relative">

                          <input
                            id="newPassword"
                            type={
                              showPassword
                                ? 'text'
                                : 'password'
                            }
                            required
                            disabled={
                              isLoading
                            }
                            minLength={8}
                            maxLength={64}
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            value={
                              newPassword
                            }
                            onChange={(
                              event
                            ) => {
                              setNewPassword(
                                event.target.value
                              );

                              setErrorMessage('');
                            }}
                            className={
                              inputBase
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
                                ? 'Hide new password'
                                : 'Show new password'
                            }
                          >
                            {showPassword
                              ? 'HIDE'
                              : 'SHOW'}
                          </button>
                        </div>

                        {/* PASSWORD RULES */}

                        <div
                          className="
                            mt-1.5

                            flex
                            flex-wrap

                            gap-x-2.5
                            gap-y-1

                            text-[8px]
                          "
                        >
                          <span
                            className={
                              passwordRules.length
                                ? 'font-bold text-emerald-500'
                                : 'text-[color:var(--bf-text-muted)]'
                            }
                          >
                            • 8–64 Chars
                          </span>

                          <span
                            className={
                              passwordRules.uppercase
                                ? 'font-bold text-emerald-500'
                                : 'text-[color:var(--bf-text-muted)]'
                            }
                          >
                            • A-Z
                          </span>

                          <span
                            className={
                              passwordRules.lowercase
                                ? 'font-bold text-emerald-500'
                                : 'text-[color:var(--bf-text-muted)]'
                            }
                          >
                            • a-z
                          </span>

                          <span
                            className={
                              passwordRules.number
                                ? 'font-bold text-emerald-500'
                                : 'text-[color:var(--bf-text-muted)]'
                            }
                          >
                            • 0-9
                          </span>

                          <span
                            className={
                              passwordRules.symbol
                                ? 'font-bold text-emerald-500'
                                : 'text-[color:var(--bf-text-muted)]'
                            }
                          >
                            • Symbol
                          </span>
                        </div>
                      </div>

                      {/* CONFIRM PASSWORD */}

                      <div>
                        <label
                          htmlFor="confirmPassword"
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
                          Confirm Password
                        </label>

                        <div className="relative">

                          <input
                            id="confirmPassword"
                            type={
                              showConfirmPassword
                                ? 'text'
                                : 'password'
                            }
                            required
                            disabled={
                              isLoading
                            }
                            minLength={8}
                            maxLength={64}
                            autoComplete="new-password"
                            placeholder="Re-enter new password"
                            value={
                              confirmPassword
                            }
                            onChange={(
                              event
                            ) => {
                              setConfirmPassword(
                                event.target.value
                              );

                              setErrorMessage('');
                            }}
                            className={
                              inputBase
                            }
                          />

                          <button
                            type="button"
                            disabled={
                              isLoading
                            }
                            onClick={() =>
                              setShowConfirmPassword(
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
                              showConfirmPassword
                                ? 'Hide confirm password'
                                : 'Show confirm password'
                            }
                          >
                            {showConfirmPassword
                              ? 'HIDE'
                              : 'SHOW'}
                          </button>
                        </div>

                        {/* MATCH STATUS */}

                        {confirmPassword && (
                          <p
                            className={`
                              mt-1

                              text-[8px]
                              font-bold

                              ${
                                passwordsMatch
                                  ? 'text-emerald-500'
                                  : 'text-red-500'
                              }
                            `}
                            aria-live="polite"
                          >
                            {passwordsMatch
                              ? '✓ Passwords match'
                              : '✕ Passwords do not match'}
                          </p>
                        )}
                      </div>

                      {/* SUBMIT */}

                      <button
                        type="submit"
                        disabled={
                          isLoading ||
                          !isTokenValid ||
                          !token
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
                              Updating Password...
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              Update Password
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

                    {/* REQUEST NEW LINK */}

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
                        Request a new reset link
                      </Link>
                    </div>
                  </div>
                )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {!isTokenChecking &&
                isSuccess && (
                  <div
                    className="
                      py-3
                      text-center
                    "
                  >
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
                      <CheckIcon
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
                      Password Updated
                    </h2>

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
                      Your Buddy Fleets password has been changed successfully.
                    </p>

                    {/* SECURITY COMPLETE */}

                    <div
                      className="
                        mt-4

                        rounded-2xl

                        border
                        border-emerald-400/15

                        bg-emerald-400/[0.04]

                        p-4

                        text-left
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
                            h-6
                            w-6

                            shrink-0

                            items-center
                            justify-center

                            rounded-lg

                            border
                            border-emerald-400/20

                            bg-emerald-400/[0.06]

                            text-emerald-500
                          "
                        >
                          <LockIcon
                            className="
                              h-3.5
                              w-3.5
                            "
                          />
                        </span>

                        <div>
                          <p
                            className="
                              text-[10px]
                              font-bold

                              text-[color:var(--bf-text-primary)]

                              sm:text-[11px]
                            "
                          >
                            Security Completed
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
                            This password reset link has now been used
                            and cannot be used again.
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
                            Existing sessions have been revoked.
                            Please log in again using your new password.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          '/login',
                          {
                            replace:
                              true,
                          }
                        )
                      }
                      className="
                        group

                        mt-4

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
                        Continue to Login
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