import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

/* =========================================================
   HELPERS
========================================================= */

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function formatDateTime(value) {
  if (!value) return '';

  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

/* =========================================================
   AMBIENT ORB
========================================================= */

function AmbientOrb({ className = '' }) {
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
   CONFIRMATION PAGE
========================================================= */

export default function ConfirmationPage() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [accountData, setAccountData] =
    useState(null);

  const [copyStatus, setCopyStatus] =
    useState('idle');

  const processingRef =
    useRef(false);

  const completedRef =
    useRef(false);

  /* =========================================================
     AUTH + ACTIVATION DATA
  ========================================================= */

  useEffect(() => {
    let cancelled = false;
    let noSessionTimer = null;

    /* ---------------------------------------------------------
       FETCH ACTIVATED COMPANY

       Important:
       Company Code yahan generate NAHI ho raha.

       Database ka:
       handle_email_confirmation()

       already:
       - company_code generate karta hai
       - trial activate karta hai
       - membership active karta hai
       - subscription activate karta hai
    --------------------------------------------------------- */

    const fetchActivationData =
      async (user) => {

        /*
          Trigger data available hone me generally delay nahi
          hona chahiye, but retry rakha hai so auth/session aur
          DB read ke beech race condition na aaye.
        */

        for (
          let attempt = 0;
          attempt < 6;
          attempt += 1
        ) {
          if (cancelled) {
            return null;
          }

          /* -----------------------------------------------
             ACTIVE MEMBERSHIP
          ----------------------------------------------- */

          const {
            data: membership,
            error: membershipError,
          } = await supabase
            .from('company_memberships')
            .select(
              'company_id, status, joined_at, created_at'
            )
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
                ascending: false,
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
            membership?.company_id
          ) {

            /* ---------------------------------------------
               COMPANY
            --------------------------------------------- */

            const {
              data: company,
              error: companyError,
            } = await supabase
              .from('companies')
              .select(
                'id, company_code, company_name, status, confirmed_at'
              )
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
              Successful activation तभी maana jayega jab:

              company code exists
              +
              company status trial_active / active
            */

            if (
              company?.company_code &&
              (
                company.status ===
                  'trial_active' ||
                company.status ===
                  'active'
              )
            ) {

              /* -------------------------------------------
                 SUBSCRIPTION
                 Supplemental info only.
              ------------------------------------------- */

              const {
                data: subscription,
                error: subscriptionError,
              } = await supabase
                .from('subscriptions')
                .select(
                  'status, trial_start_at, trial_end_at'
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
                  subscription?.status ||
                  company.status,

                trialStartAt:
                  subscription?.trial_start_at ||
                  company.confirmed_at ||
                  null,

                trialEndAt:
                  subscription?.trial_end_at ||
                  null,
              };
            }
          }

          /*
            DB confirmation trigger data read ke liye
            small retry.
          */

          await sleep(
            700 + attempt * 250
          );
        }

        return null;
      };

    /* ---------------------------------------------------------
       PROCESS CONFIRMED SESSION
    --------------------------------------------------------- */

    const processSession =
      async (session) => {

        if (
          cancelled ||
          completedRef.current ||
          processingRef.current ||
          !session?.user
        ) {
          return;
        }

        processingRef.current = true;

        if (noSessionTimer) {
          clearTimeout(
            noSessionTimer
          );
        }

        try {

          /*
            getUser server-verified auth user deta hai.
            Session object par alone depend nahi karenge.
          */

          const {
            data: userResult,
            error: userError,
          } =
            await supabase.auth.getUser();

          if (userError) {
            throw userError;
          }

          const verifiedUser =
            userResult?.user;

          if (
            !verifiedUser
          ) {
            throw new Error(
              'AUTH_USER_NOT_FOUND'
            );
          }

          /*
            Confirmation page sirf actually confirmed email
            ke liye activation show karega.
          */

          if (
            !verifiedUser.email_confirmed_at
          ) {
            throw new Error(
              'EMAIL_NOT_CONFIRMED'
            );
          }

          const activation =
            await fetchActivationData(
              verifiedUser
            );

          if (!activation) {
            throw new Error(
              'ACTIVATION_NOT_READY'
            );
          }

          if (cancelled) {
            return;
          }

          completedRef.current = true;

          setAccountData(
            activation
          );

          setError('');

          setLoading(false);

        } catch (err) {

          console.error(
            'Confirmation processing error:',
            err
          );

          if (cancelled) {
            return;
          }

          /*
            Internal Supabase/DB errors user ko directly
            expose nahi karenge.
          */

          setError(
            'We could not complete account verification. The confirmation link may be invalid, expired, or the activation is not ready yet.'
          );

          setLoading(false);

        } finally {

          processingRef.current = false;

        }
      };

    /* ---------------------------------------------------------
       AUTH EVENT LISTENER

       Callback ke andar direct awaited Supabase DB calls
       nahi kar rahe. setTimeout se auth callback ke bahar
       processing schedule kar rahe hain.
    --------------------------------------------------------- */

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {

          if (
            cancelled ||
            !session?.user
          ) {
            return;
          }

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

    /* ---------------------------------------------------------
       EXISTING SESSION FALLBACK
    --------------------------------------------------------- */

    const checkInitialSession =
      async () => {

        try {

          const {
            data,
            error: sessionError,
          } =
            await supabase.auth.getSession();

          if (
            sessionError
          ) {
            throw sessionError;
          }

          if (
            data?.session?.user
          ) {

            await processSession(
              data.session
            );

            return;
          }

          /*
            Confirmation redirect session establish hone ke
            liye short grace period.
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

                setLoading(false);

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

          if (!cancelled) {

            setLoading(false);

            setError(
              'Unable to verify this confirmation link. Please try again.'
            );

          }

        }
      };

    checkInitialSession();

    return () => {

      cancelled = true;

      if (noSessionTimer) {
        clearTimeout(
          noSessionTimer
        );
      }

      authListener?.subscription?.unsubscribe();

    };

  }, []);

  /* =========================================================
     COPY COMPANY CODE
  ========================================================= */

  const handleCopy =
    async () => {

      const code =
        accountData?.companyCode;

      if (!code) return;

      try {

        await navigator.clipboard.writeText(
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

     Locked workflow:
     confirmation ke baad user manually login karega.

     Confirmation se jo Supabase session create hua ho sakta
     hai, usko local browser se sign out kar dete hain.
  ========================================================= */

  const handleProceedToLogin =
    async () => {

      try {

        await supabase.auth.signOut({
          scope: 'local',
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
            replace: true,
          }
        );

      }

    };

  /* =========================================================
     DISPLAY VALUES
  ========================================================= */

  const trialEndText =
    formatDateTime(
      accountData?.trialEndAt
    );

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

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.7) 1px, transparent 1px)',
            backgroundSize:
              '55px 55px',
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(6,182,212,0.10),transparent_30%),radial-gradient(circle_at_85%_40%,rgba(124,58,237,0.12),transparent_32%)]" />

        <AmbientOrb className="left-[4%] top-[15%] h-72 w-72 bg-cyan-500/20" />

        <AmbientOrb className="right-[5%] top-[20%] h-80 w-80 bg-violet-600/20" />

      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          relative
          z-50
          h-[110px]
          w-full
          shrink-0

          sm:h-[104px]

          lg:h-[72px]
        "
      >

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

        {/* TOP CENTER NAV */}

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

        {/* DESKTOP EFFECTS */}

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
            MAIN CONTENT
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

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3.5 py-2 backdrop-blur-md sm:mb-5 sm:px-4">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

              </span>

              <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-300 sm:text-[9px] xl:text-[10px]">
                Account Activation
              </span>

            </div>

            <h1 className="text-4xl font-black leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl">

              Your fleet journey

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                starts here.
              </span>

            </h1>

            <p className="mx-auto mt-4 max-w-lg text-xs leading-6 text-slate-400 sm:mt-5 sm:text-sm sm:leading-7 lg:mx-0 lg:max-w-md">

              Your verified Buddy Fleets account connects your company, users and fleet operations inside one secure platform.

            </p>

            <div className="mx-auto mt-5 flex max-w-md flex-col items-start gap-2.5 sm:mt-6 lg:mx-0 lg:mt-7">

              {[
                'Verified company account',
                'Unique Buddy Fleets Company Code',
                '5-day free trial activated',
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-3 text-left text-[10px] font-medium text-slate-300 sm:text-xs"
                >

                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-[9px] text-emerald-300">
                    ✓
                  </span>

                  {item}

                </div>

              ))}

            </div>

          </motion.section>

          {/* MOBILE / TABLET TRUCK */}

          <MobileTruckScene />

          {/* =================================================
              CONFIRMATION CARD
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

            <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-br from-cyan-400/30 via-blue-500/10 to-violet-500/30 blur-xl sm:rounded-[30px]" />

            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#07101f]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl sm:rounded-[30px]">

              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              <div className="pointer-events-none absolute -right-28 -top-28 h-56 w-56 rounded-full bg-cyan-500/10 blur-[80px]" />

              <div className="pointer-events-none absolute -bottom-28 -left-28 h-56 w-56 rounded-full bg-violet-600/10 blur-[80px]" />

              <div className="relative p-5 sm:p-6">

                {/* =========================================
                    LOADING
                ========================================= */}

                {loading && (

                  <div className="py-8 text-center">

                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />

                    <h2 className="mt-5 text-lg font-black text-white">
                      Verifying your account...
                    </h2>

                    <p className="mt-2 text-[10px] leading-5 text-slate-400 sm:text-xs">
                      We're confirming your Buddy Fleets account and loading your activation details.
                    </p>

                  </div>

                )}

                {/* =========================================
                    ERROR
                ========================================= */}

                {!loading && error && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="py-5 text-center"
                  >

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 text-xl font-black text-red-300">
                      ✕
                    </div>

                    <h2 className="mt-4 text-xl font-black text-white">
                      Verification Failed
                    </h2>

                    <p
                      className="mt-2 text-[10px] leading-5 text-slate-400 sm:text-xs"
                      role="alert"
                    >
                      {error}
                    </p>

                    <div className="mt-5 grid gap-2.5">

                      <Link
                        to="/login"
                        className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-xs font-black text-white transition hover:bg-white/[0.09] sm:rounded-2xl"
                      >
                        Go to Login
                      </Link>

                      <Link
                        to="/signup"
                        className="text-[10px] font-bold text-cyan-300 transition hover:text-cyan-200 hover:underline"
                      >
                        Back to Signup
                      </Link>

                    </div>

                  </motion.div>

                )}

                {/* =========================================
                    SUCCESS
                ========================================= */}

                {!loading &&
                  !error &&
                  accountData && (

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.55,
                      }}
                      className="text-center"
                    >

                      {/* SUCCESS ICON */}

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

                      {/* HEADING */}

                      <h2 className="mt-4 text-xl font-black leading-tight text-white sm:text-2xl">
                        Congratulations!
                      </h2>

                      <p className="mt-1 text-xs font-bold text-emerald-300">
                        Your 5-Day Free Trial has been Activated.
                      </p>

                      {accountData.companyName && (

                        <p className="mt-2 text-[10px] text-slate-500 sm:text-[11px]">
                          {accountData.companyName}
                        </p>

                      )}

                      {/* COMPANY CODE */}

                      <div className="mt-5 rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.05] p-4">

                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                          Your Company Code
                        </p>

                        <div className="mt-2 break-all text-2xl font-black tracking-[0.12em] text-white sm:text-3xl">
                          {accountData.companyCode}
                        </div>

                        <button
                          type="button"
                          onClick={
                            handleCopy
                          }
                          className="mt-2 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-400 transition hover:bg-white/5 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                        >

                          {copyStatus ===
                          'copied'
                            ? '✓ Copied'
                            : copyStatus ===
                                'failed'
                              ? 'Copy failed'
                              : 'Copy Company Code'}

                        </button>

                      </div>

                      {/* LOGIN DETAILS */}

                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] text-left">

                        <div className="border-b border-white/[0.06] px-4 py-3">

                          <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                            Username
                          </p>

                          <p className="mt-1 break-all text-[10px] font-semibold text-slate-200 sm:text-xs">
                            {accountData.email}
                          </p>

                        </div>

                        <div className="grid grid-cols-2 divide-x divide-white/[0.06]">

                          <div className="px-4 py-3">

                            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                              Trial Status
                            </p>

                            <p className="mt-1 text-[10px] font-bold text-emerald-300 sm:text-xs">
                              ACTIVE
                            </p>

                          </div>

                          <div className="px-4 py-3">

                            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                              Trial Period
                            </p>

                            <p className="mt-1 text-[10px] font-bold text-white sm:text-xs">
                              5 Days
                            </p>

                          </div>

                        </div>

                        {trialEndText && (

                          <div className="border-t border-white/[0.06] px-4 py-3">

                            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                              Trial Valid Until
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-slate-200 sm:text-xs">
                              {trialEndText}
                            </p>

                          </div>

                        )}

                      </div>

                      {/* INFORMATION */}

                      <p className="mt-3 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                        Save your Company Code. You will use it together with your registered email and password whenever you log in to Buddy Fleets.
                      </p>

                      {/* LOGIN */}

                      <motion.button
                        whileHover={{
                          y: -1,
                        }}
                        whileTap={{
                          scale: 0.99,
                        }}
                        type="button"
                        onClick={
                          handleProceedToLogin
                        }
                        className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-5 py-3 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition hover:shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 sm:rounded-2xl sm:py-3.5 sm:text-sm"
                      >
                        Proceed to Login →
                      </motion.button>

                    </motion.div>

                  )}

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