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
   EMAIL CONFIRMATION PAGE

   WebsiteLayout handles:
   - Header
   - Development notice
   - Footer
   - Dark / Light theme

   DESIGN:
   - One unified auth canvas
   - Same website visual language
   - No separate visual page sections
   - No Framer Motion
   - No truck / radar / chart
   - No external background image
   - No blinking / pulsing
   - PageSpeed-first

   IMPORTANT:

   This page DOES NOT:
   - generate Company Code
   - activate trial
   - activate membership

   Database confirmation trigger handles activation.

   This page only:
   - verifies Supabase user
   - waits for activation data
   - reads Company Code
   - reads trial details
   - displays activation success
========================================================= */

/* =========================================================
   HELPERS
========================================================= */

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function formatDateTime(value) {
  if (!value) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(
      'en-IN',
      {
        dateStyle:
          'medium',

        timeStyle:
          'short',
      }
    ).format(
      new Date(value)
    );
  } catch {
    return '';
  }
}

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

function CopyIcon({
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
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        stroke="currentColor"
        strokeWidth="1.7"
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

/* =========================================================
   CONFIRMATION PAGE
========================================================= */

export default function ConfirmationPage() {
  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    accountData,
    setAccountData,
  ] = useState(null);

  const [
    copyStatus,
    setCopyStatus,
  ] = useState('idle');

  /*
    React StrictMode / auth callbacks ke duplicate
    processing se protection.
  */

  const processingRef =
    useRef(false);

  const completedRef =
    useRef(false);

  /* =========================================================
     AUTH + ACTIVATION DATA
  ========================================================= */

  useEffect(() => {
    let cancelled =
      false;

    let noSessionTimer =
      null;

    /* =======================================================
       FETCH ACTIVATED COMPANY

       Database trigger already handles:

       Email confirmation
            ↓
       Company Code
            ↓
       Active Membership
            ↓
       Trial Activation
            ↓
       Subscription

       ConfirmationPage sirf resulting data read karegi.
    ======================================================= */

    const fetchActivationData =
      async (
        user
      ) => {
        /*
          Auth confirmation aur DB trigger visibility ke
          beech tiny delay ho sakta hai.

          Isliye limited retry.
        */

        for (
          let attempt = 0;
          attempt < 6;
          attempt += 1
        ) {
          if (
            cancelled
          ) {
            return null;
          }

          /* ===============================================
             ACTIVE MEMBERSHIP
          =============================================== */

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
                company_id,
                status,
                joined_at,
                created_at
              `)
              .eq(
                'user_id',
                user.id
              )
              .eq(
                'status',
                'active'
              )
              .order(
                'created_at',
                {
                  ascending:
                    false,
                }
              )
              .limit(1)
              .maybeSingle();

          if (
            membershipError
          ) {
            console.error(
              'Confirmation membership read error:',
              membershipError
            );
          }

          if (
            membership
              ?.company_id
          ) {
            /* =============================================
               COMPANY
            ============================================= */

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
                  confirmed_at
                `)
                .eq(
                  'id',
                  membership.company_id
                )
                .maybeSingle();

            if (
              companyError
            ) {
              console.error(
                'Confirmation company read error:',
                companyError
              );
            }

            /*
              Successful activation:

              Company Code must exist
              AND
              Company must be trial_active / active
            */

            if (
              company
                ?.company_code &&
              (
                company.status ===
                  'trial_active' ||
                company.status ===
                  'active'
              )
            ) {
              /* ===========================================
                 SUBSCRIPTION
              =========================================== */

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
                    trial_start_at,
                    trial_end_at
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
                  'Confirmation subscription read error:',
                  subscriptionError
                );
              }

              return {
                companyId:
                  company.id,

                companyCode:
                  company.company_code,

                companyName:
                  company.company_name,

                companyStatus:
                  company.status,

                confirmedAt:
                  company.confirmed_at,

                email:
                  user.email || '',

                membershipStatus:
                  membership.status,

                trialStatus:
                  subscription
                    ?.status ||
                  company.status,

                trialStartAt:
                  subscription
                    ?.trial_start_at ||
                  company
                    .confirmed_at ||
                  null,

                trialEndAt:
                  subscription
                    ?.trial_end_at ||
                  null,
              };
            }
          }

          /* SMALL RETRY */

          await sleep(
            700 +
              attempt *
                250
          );
        }

        return null;
      };

    /* =======================================================
       PROCESS CONFIRMED SESSION
    ======================================================= */

    const processSession =
      async (
        session
      ) => {
        if (
          cancelled ||
          completedRef.current ||
          processingRef.current ||
          !session?.user
        ) {
          return;
        }

        processingRef.current =
          true;

        if (
          noSessionTimer
        ) {
          clearTimeout(
            noSessionTimer
          );
        }

        try {
          /*
            getUser() server-backed identity verification.
          */

          const {
            data:
              userResult,
            error:
              userError,
          } =
            await supabase
              .auth
              .getUser();

          if (
            userError
          ) {
            throw userError;
          }

          const verifiedUser =
            userResult
              ?.user;

          if (
            !verifiedUser
          ) {
            throw new Error(
              'AUTH_USER_NOT_FOUND'
            );
          }

          /* EMAIL CONFIRMATION REQUIRED */

          if (
            !verifiedUser
              .email_confirmed_at
          ) {
            throw new Error(
              'EMAIL_NOT_CONFIRMED'
            );
          }

          /* ACTIVATION DATA */

          const activation =
            await fetchActivationData(
              verifiedUser
            );

          if (
            !activation
          ) {
            throw new Error(
              'ACTIVATION_NOT_READY'
            );
          }

          if (
            cancelled
          ) {
            return;
          }

          completedRef.current =
            true;

          setAccountData(
            activation
          );

          setError('');

          setLoading(
            false
          );
        } catch (err) {
          console.error(
            'Confirmation processing error:',
            err
          );

          if (
            cancelled
          ) {
            return;
          }

          /*
            Internal error details user ko expose nahi karenge.
          */

          setError(
            'We could not complete account verification. The confirmation link may be invalid, expired, or the activation is not ready yet.'
          );

          setLoading(
            false
          );
        } finally {
          processingRef.current =
            false;
        }
      };

    /* =======================================================
       AUTH EVENT LISTENER
    ======================================================= */

    const {
      data:
        authListener,
    } =
      supabase
        .auth
        .onAuthStateChange(
          (
            _event,
            session
          ) => {
            if (
              cancelled ||
              !session?.user
            ) {
              return;
            }

            /*
              Auth callback ke andar direct complex DB workflow
              await nahi karenge.
            */

            window.setTimeout(
              () => {
                processSession(
                  session
                );
              },
              0
            );
          }
        );

    /* =======================================================
       EXISTING SESSION FALLBACK
    ======================================================= */

    const checkInitialSession =
      async () => {
        try {
          const {
            data,
            error:
              sessionError,
          } =
            await supabase
              .auth
              .getSession();

          if (
            sessionError
          ) {
            throw sessionError;
          }

          if (
            data
              ?.session
              ?.user
          ) {
            await processSession(
              data.session
            );

            return;
          }

          /*
            Confirmation redirect ke baad session establish
            hone ke liye grace period.
          */

          noSessionTimer =
            window.setTimeout(
              () => {
                if (
                  cancelled ||
                  completedRef.current
                ) {
                  return;
                }

                setLoading(
                  false
                );

                setError(
                  'Verification session was not found. The confirmation link may have expired or is invalid.'
                );
              },
              6000
            );
        } catch (err) {
          console.error(
            'Initial confirmation session error:',
            err
          );

          if (
            !cancelled
          ) {
            setLoading(
              false
            );

            setError(
              'Unable to verify this confirmation link. Please try again.'
            );
          }
        }
      };

    checkInitialSession();

    return () => {
      cancelled =
        true;

      if (
        noSessionTimer
      ) {
        clearTimeout(
          noSessionTimer
        );
      }

      authListener
        ?.subscription
        ?.unsubscribe();
    };
  }, []);

  /* =========================================================
     COPY COMPANY CODE
  ========================================================= */

  const handleCopy =
    async () => {
      const code =
        accountData
          ?.companyCode;

      if (
        !code
      ) {
        return;
      }

      try {
        await navigator
          .clipboard
          .writeText(
            code
          );

        setCopyStatus(
          'copied'
        );

        window.setTimeout(
          () => {
            setCopyStatus(
              'idle'
            );
          },
          2000
        );
      } catch (err) {
        console.error(
          'Clipboard error:',
          err
        );

        setCopyStatus(
          'failed'
        );

        window.setTimeout(
          () => {
            setCopyStatus(
              'idle'
            );
          },
          2500
        );
      }
    };

  /* =========================================================
     PROCEED TO LOGIN

     Confirmation ke baad auto-login nahi hoga.

     Confirmation session locally clear karke user manually
     Company Code + Email + Password se login karega.
  ========================================================= */

  const handleProceedToLogin =
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
          'Post-confirmation signout error:',
          err
        );
      } finally {
        navigate(
          '/login',
          {
            replace:
              true,
          }
        );
      }
    };

  /* =========================================================
     DISPLAY VALUES
  ========================================================= */

  const trialEndText =
    formatDateTime(
      accountData
        ?.trialEndAt
    );

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

            bg-emerald-500/[0.045]

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

          lg:grid-cols-[minmax(0,1fr)_440px]
          lg:gap-12
          lg:px-12
          lg:py-5

          xl:grid-cols-[minmax(0,1fr)_460px]
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
              border-emerald-400/20

              bg-emerald-400/[0.06]

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

                text-emerald-500

                sm:text-[9px]
              "
            >
              Account Activation
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
              Your fleet journey
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
              starts here.
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
            Your verified Buddy Fleets account connects your
            company, users and fleet operations inside one
            secure platform.
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
              'Verified company account',
              'Unique Buddy Fleets Company Code',
              '5-day free trial activated',
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
                      border-emerald-400/20

                      bg-emerald-400/[0.06]

                      text-emerald-500
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

            Secure Account Verification
          </div>
        </div>

        {/* =================================================
            CONFIRMATION AREA
        ================================================= */}

        <div
          className="
            relative

            mx-auto

            w-full
            max-w-[460px]

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

          {/* CARD */}

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
              {/* =========================================
                  LOADING
              ========================================= */}

              {loading && (
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
                    Verifying your account...
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
                    We're confirming your Buddy Fleets account
                    and loading your activation details.
                  </p>
                </div>
              )}

              {/* =========================================
                  ERROR
              ========================================= */}

              {!loading &&
                error && (
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
                      Verification Failed
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
                      {error}
                    </p>

                    <div
                      className="
                        mt-4

                        grid
                        gap-2.5
                      "
                    >
                      <Link
                        to="/login"
                        className="
                          inline-flex
                          min-h-11
                          w-full

                          items-center
                          justify-center

                          rounded-xl

                          border
                          border-[color:var(--bf-border)]

                          bg-[var(--bf-page-bg)]

                          px-5
                          py-2.5

                          text-xs
                          font-black

                          text-[color:var(--bf-text-primary)]

                          transition-colors
                          duration-200

                          hover:border-cyan-400/30
                          hover:bg-cyan-400/[0.04]

                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-cyan-400/30
                        "
                      >
                        Go to Login
                      </Link>

                      <Link
                        to="/signup"
                        className="
                          rounded

                          text-[10px]
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
                        Back to Signup
                      </Link>
                    </div>
                  </div>
                )}

              {/* =========================================
                  SUCCESS
              ========================================= */}

              {!loading &&
                !error &&
                accountData && (
                  <div
                    className="
                      text-center
                    "
                  >
                    {/* SUCCESS ICON */}

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

                    {/* HEADING */}

                    <h2
                      className="
                        mt-3.5

                        text-xl
                        font-black
                        leading-tight

                        text-[color:var(--bf-text-primary)]

                        sm:text-2xl
                      "
                    >
                      Congratulations!
                    </h2>

                    <p
                      className="
                        mt-1

                        text-[11px]
                        font-bold

                        text-emerald-500

                        sm:text-xs
                      "
                    >
                      Your 5-Day Free Trial has been Activated.
                    </p>

                    {/* COMPANY */}

                    {accountData
                      .companyName && (
                      <p
                        className="
                          mt-1.5

                          text-[10px]

                          text-[color:var(--bf-text-muted)]

                          sm:text-[11px]
                        "
                      >
                        {
                          accountData
                            .companyName
                        }
                      </p>
                    )}

                    {/* =====================================
                        COMPANY CODE
                    ===================================== */}

                    <div
                      className="
                        mt-4

                        rounded-2xl

                        border
                        border-cyan-400/20

                        bg-cyan-400/[0.045]

                        p-3.5
                      "
                    >
                      <p
                        className="
                          text-[8px]
                          font-black
                          uppercase
                          tracking-[0.2em]

                          text-cyan-500

                          sm:text-[9px]
                        "
                      >
                        Your Company Code
                      </p>

                      <div
                        className="
                          mt-1.5

                          break-all

                          text-2xl
                          font-black
                          tracking-[0.11em]

                          text-[color:var(--bf-text-primary)]

                          sm:text-[1.7rem]
                        "
                      >
                        {
                          accountData
                            .companyCode
                        }
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleCopy
                        }
                        className="
                          mt-1.5

                          inline-flex

                          items-center
                          justify-center

                          gap-1.5

                          rounded-lg

                          px-2
                          py-1

                          text-[8px]
                          font-bold

                          text-[color:var(--bf-text-muted)]

                          transition-colors
                          duration-200

                          hover:bg-cyan-400/[0.06]
                          hover:text-cyan-500

                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-cyan-400/30

                          sm:text-[9px]
                        "
                        aria-live="polite"
                      >
                        {copyStatus ===
                        'copied' ? (
                          <>
                            <CheckIcon
                              className="
                                h-3
                                w-3
                              "
                            />

                            Copied
                          </>
                        ) : copyStatus ===
                          'failed' ? (
                          'Copy failed'
                        ) : (
                          <>
                            <CopyIcon
                              className="
                                h-3
                                w-3
                              "
                            />

                            Copy Company Code
                          </>
                        )}
                      </button>
                    </div>

                    {/* =====================================
                        LOGIN DETAILS
                    ===================================== */}

                    <div
                      className="
                        mt-3

                        overflow-hidden

                        rounded-2xl

                        border
                        border-[color:var(--bf-border)]

                        bg-[var(--bf-page-bg)]

                        text-left
                      "
                    >
                      {/* USERNAME */}

                      <div
                        className="
                          px-4
                          py-2.5
                        "
                      >
                        <p
                          className="
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-[0.16em]

                            text-[color:var(--bf-text-muted)]
                          "
                        >
                          Username
                        </p>

                        <p
                          className="
                            mt-1

                            break-all

                            text-[10px]
                            font-semibold

                            text-[color:var(--bf-text-primary)]

                            sm:text-xs
                          "
                        >
                          {
                            accountData
                              .email
                          }
                        </p>
                      </div>

                      {/* STATUS + PERIOD */}

                      <div
                        className="
                          grid
                          grid-cols-2

                          border-t
                          border-[color:var(--bf-border)]
                        "
                      >
                        <div
                          className="
                            px-4
                            py-2.5
                          "
                        >
                          <p
                            className="
                              text-[8px]
                              font-bold
                              uppercase
                              tracking-[0.16em]

                              text-[color:var(--bf-text-muted)]
                            "
                          >
                            Trial Status
                          </p>

                          <p
                            className="
                              mt-1

                              text-[10px]
                              font-bold

                              text-emerald-500

                              sm:text-xs
                            "
                          >
                            ACTIVE
                          </p>
                        </div>

                        <div
                          className="
                            border-l
                            border-[color:var(--bf-border)]

                            px-4
                            py-2.5
                          "
                        >
                          <p
                            className="
                              text-[8px]
                              font-bold
                              uppercase
                              tracking-[0.16em]

                              text-[color:var(--bf-text-muted)]
                            "
                          >
                            Trial Period
                          </p>

                          <p
                            className="
                              mt-1

                              text-[10px]
                              font-bold

                              text-[color:var(--bf-text-primary)]

                              sm:text-xs
                            "
                          >
                            5 Days
                          </p>
                        </div>
                      </div>

                      {/* TRIAL END */}

                      {trialEndText && (
                        <div
                          className="
                            border-t
                            border-[color:var(--bf-border)]

                            px-4
                            py-2.5
                          "
                        >
                          <p
                            className="
                              text-[8px]
                              font-bold
                              uppercase
                              tracking-[0.16em]

                              text-[color:var(--bf-text-muted)]
                            "
                          >
                            Trial Valid Until
                          </p>

                          <p
                            className="
                              mt-1

                              text-[10px]
                              font-semibold

                              text-[color:var(--bf-text-primary)]

                              sm:text-xs
                            "
                          >
                            {
                              trialEndText
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {/* INFORMATION */}

                    <div
                      className="
                        mt-3

                        rounded-xl

                        border
                        border-cyan-400/10

                        bg-cyan-400/[0.025]

                        px-3
                        py-2.5

                        text-left
                      "
                    >
                      <p
                        className="
                          text-[9px]
                          leading-4

                          text-[color:var(--bf-text-muted)]

                          sm:text-[10px]
                        "
                      >
                        Save your Company Code. You will use it
                        together with your registered email and
                        password whenever you log in to Buddy Fleets.
                      </p>
                    </div>

                    {/* LOGIN */}

                    <button
                      type="button"
                      onClick={
                        handleProceedToLogin
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
                        Proceed to Login
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