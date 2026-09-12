import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { supabase } from './supabaseClient';

/* =========================================================
   LAYOUT
========================================================= */

import WebsiteLayout from './layouts/WebsiteLayout';

/* =========================================================
   ROUTE-LEVEL CODE SPLITTING

   Public + Auth + Dashboard pages lazy load honge.
   Isse initial JS bundle smaller hoga.
========================================================= */

const Home = lazy(() =>
  import('./pages/Website/Home')
);

const Features = lazy(() =>
  import('./pages/Website/Features')
);

const Pricing = lazy(() =>
  import('./pages/Website/Pricing')
);

const AboutUs = lazy(() =>
  import('./pages/Website/AboutUs')
);

const ContactUs = lazy(() =>
  import('./pages/Website/ContactUs')
);

const Login = lazy(() =>
  import('./pages/Auth/Login')
);

const Signup = lazy(() =>
  import('./pages/Auth/Signup')
);

const ForgotID = lazy(() =>
  import('./pages/Auth/ForgotID')
);

const ConfirmationPage = lazy(() =>
  import('./pages/Auth/ConfirmationPage')
);

const ResetPassword = lazy(() =>
  import('./pages/Auth/ResetPassword')
);

const SuperAdminDashboard = lazy(() =>
  import('./pages/Dashboard/SuperAdminDashboard')
);

/* =========================================================
   STORAGE KEYS

   IMPORTANT:

   Supabase Auth = authentication authority.

   localStorage me kabhi:
   - password
   - password hash
   - manually managed access token
   - complete currentUser object

   store nahi karenge.

   Sirf:
   - active company context
   - inactivity timestamp
   - UI active tab
========================================================= */

const LEGACY_SESSION_KEY =
  'buddy_fleets_session';

const ACTIVE_COMPANY_KEY =
  'buddy_fleets_active_company';

const LAST_ACTIVITY_KEY =
  'buddy_fleets_last_activity';

const ACTIVE_TAB_KEY =
  'buddy_fleets_active_tab';

/* 30 MINUTES */

const INACTIVITY_TIMEOUT_MS =
  30 * 60 * 1000;

/*
  Mouse movement etc. frequently fire hote hain,
  isliye activity writes throttle karenge.
*/

const ACTIVITY_THROTTLE_MS =
  15 * 1000;

/* =========================================================
   PAGE CHUNK LOADER

   WebsiteLayout ke andar use hoga.
   Header/footer visible rahenge.
========================================================= */

function PageChunkLoader() {
  return (
    <div
      className="
        flex
        min-h-[320px]
        flex-1
        items-center
        justify-center
        bg-[#0a0f1d]
        px-4
        py-12
      "
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-cyan-400
            via-blue-500
            to-violet-600
            text-xs
            font-black
            text-white
            shadow-lg
            shadow-cyan-500/15
          "
        >
          BF
        </div>

        <div
          aria-label="Loading page"
          role="status"
          className="
            h-7
            w-7
            animate-spin
            rounded-full
            border-2
            border-cyan-400/20
            border-t-cyan-300
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD / FULL SCREEN LOADER
========================================================= */

function FullScreenLoader() {
  return (
    <div
      className="
        flex
        min-h-screen
        min-h-[100dvh]
        items-center
        justify-center
        bg-[#050914]
        px-4
        font-sans
        text-white
      "
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-cyan-400
            via-blue-500
            to-violet-600
            text-xs
            font-black
            shadow-lg
            shadow-cyan-500/20
          "
        >
          BF
        </div>

        <div
          aria-label="Restoring secure session"
          role="status"
          className="
            h-8
            w-8
            animate-spin
            rounded-full
            border-2
            border-cyan-400/25
            border-t-cyan-300
          "
        />

        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-slate-500
          "
        >
          Restoring Secure Session...
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   LAZY PAGE WRAPPER
========================================================= */

function LazyPage({ children }) {
  return (
    <Suspense fallback={<PageChunkLoader />}>
      {children}
    </Suspense>
  );
}

/* =========================================================
   SCROLL TO TOP
========================================================= */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}

/* =========================================================
   LEGACY CONFIRMATION REDIRECT

   Agar Supabase me old URL:

   /auth/confirmation

   configured reh gaya ho, query/hash preserve karke
   /confirm par redirect karega.
========================================================= */

function LegacyConfirmationRedirect() {
  const location = useLocation();

  return (
    <Navigate
      replace
      to={`/confirm${location.search}${location.hash}`}
    />
  );
}

/* =========================================================
   LEGACY CONTACT REDIRECT

   Old:
   /contact

   New canonical:
   /contact-us
========================================================= */

function LegacyContactRedirect() {
  const location = useLocation();

  return (
    <Navigate
      replace
      to={`/contact-us${location.search}${location.hash}`}
    />
  );
}

/* =========================================================
   LEGACY FORGOT ID REDIRECT

   Old:
   /forgot-id

   Canonical:
   /forgot-password
========================================================= */

function LegacyForgotRedirect() {
  const location = useLocation();

  return (
    <Navigate
      replace
      to={`/forgot-password${location.search}${location.hash}`}
    />
  );
}

/* =========================================================
   ACTIVE COMPANY STORAGE
========================================================= */

function getStoredCompanyContext() {
  try {
    const raw =
      localStorage.getItem(
        ACTIVE_COMPANY_KEY
      );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(raw);

    if (
      !parsed?.companyId ||
      !parsed?.companyCode
    ) {
      return null;
    }

    return parsed;

  } catch {
    return null;
  }
}

function saveCompanyContext(user) {
  if (
    !user?.companyId ||
    !user?.companyCode
  ) {
    localStorage.removeItem(
      ACTIVE_COMPANY_KEY
    );

    return;
  }

  localStorage.setItem(
    ACTIVE_COMPANY_KEY,
    JSON.stringify({
      companyId:
        user.companyId,

      companyCode:
        user.companyCode,
    })
  );
}

/* =========================================================
   BUILD PLATFORM ADMIN CONTEXT
========================================================= */

function createPlatformAdminContext({
  authUser,
  profile,
}) {
  return {
    id:
      authUser.id,

    username:
      authUser.email,

    email:
      authUser.email,

    name:
      profile?.full_name ||
      authUser.email,

    mobile:
      profile?.mobile ||
      null,

    userType:
      'platform_admin',

    role:
      'SUPER_ADMIN',

    isPlatformAdmin:
      true,

    companyId:
      null,

    companyCode:
      'ADMIN',

    companyName:
      'Buddy Fleets',

    companyStatus:
      'active',

    databaseCompanyStatus:
      'active',

    confirmedAt:
      null,

    membershipId:
      null,

    membershipStatus:
      null,

    accessScope:
      'platform',

    isAccountOwner:
      false,

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
}

/* =========================================================
   BUILD AUTHENTICATED APP USER

   IMPORTANT:

   Supabase Auth user
        ↓
   Profile
        ↓
   Company context exists?
        ↓
   YES:
   Company + Membership + Subscription
        ↓
   NO:
   Check Platform Admin

   This ordering is intentional.

   Platform Admin normal Company Code se company workspace me
   login kare to refresh ke baad bhi company context me hi
   rahega.

   ADMIN login par ACTIVE_COMPANY_KEY absent hoga, tab
   platform_admin context build hoga.
========================================================= */

async function buildUserContext(
  authUser,
  preferredCompanyId = null
) {
  if (!authUser?.id) {
    return null;
  }

  /* =======================================================
     EMAIL MUST BE CONFIRMED
  ======================================================= */

  if (!authUser.email_confirmed_at) {
    return null;
  }

  /* =======================================================
     PROFILE
  ======================================================= */

  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from('profiles')
      .select(
        'id, full_name, email, mobile'
      )
      .eq(
        'id',
        authUser.id
      )
      .maybeSingle();

  if (profileError) {
    console.error(
      'Profile context error:',
      profileError
    );
  }

  /* =======================================================
     COMPANY CONTEXT HAS PRIORITY
  ======================================================= */

  if (preferredCompanyId) {

    /* =====================================================
       MEMBERSHIP
    ===================================================== */

    const {
      data: membership,
      error: membershipError,
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
          preferredCompanyId
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
      if (membershipError) {
        console.error(
          'Membership context error:',
          membershipError
        );
      }

      return null;
    }

    /* ONLY ACTIVE MEMBERS */

    if (
      membership.status !==
      'active'
    ) {
      return null;
    }

    /* =====================================================
       COMPANY
    ===================================================== */

    const {
      data: company,
      error: companyError,
    } =
      await supabase
        .from('companies')
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
          'id',
          membership.company_id
        )
        .maybeSingle();

    if (
      companyError ||
      !company
    ) {
      if (companyError) {
        console.error(
          'Company context error:',
          companyError
        );
      }

      return null;
    }

    /* =====================================================
       BLOCKED COMPANY STATES
    ===================================================== */

    if (
      company.status ===
        'pending_confirmation' ||
      company.status ===
        'suspended' ||
      company.status ===
        'cancelled'
    ) {
      return null;
    }

    /* =====================================================
       SUBSCRIPTION
    ===================================================== */

    const {
      data: subscription,
      error: subscriptionError,
    } =
      await supabase
        .from('subscriptions')
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

    if (subscriptionError) {
      console.error(
        'Subscription context error:',
        subscriptionError
      );
    }

    /* =====================================================
       EFFECTIVE TRIAL STATUS

       Database status trial_active ho lekin trial_end_at
       already past ho to frontend immediately expired
       treat karega.

       IMPORTANT:
       Real module entitlement backend/database level par bhi
       enforce hona chahiye.
    ===================================================== */

    let effectiveCompanyStatus =
      company.status;

    const trialEndAt =
      subscription?.trial_end_at ||
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
       ALLOWED STATES
    ===================================================== */

    const allowedStatuses = [
      'trial_active',
      'trial_expired',
      'active',
    ];

    if (
      !allowedStatuses.includes(
        effectiveCompanyStatus
      )
    ) {
      return null;
    }

    /* =====================================================
       COMPANY USER CONTEXT
    ===================================================== */

    return {
      id:
        authUser.id,

      username:
        authUser.email,

      email:
        authUser.email,

      name:
        profile?.full_name ||
        authUser.email,

      mobile:
        profile?.mobile ||
        null,

      userType:
        'company_user',

      role:
        'COMPANY_USER',

      /*
        Company context me platform privilege expose
        nahi karenge.
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
        subscription?.status ||
        null,

      planId:
        subscription?.plan_id ||
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
  }

  /* =======================================================
     NO COMPANY CONTEXT
     CHECK PLATFORM SUPER ADMIN

     No hardcoded credentials.

     Authorization:
     public.platform_admins
  ======================================================= */

  const {
    data: platformAdmin,
    error: platformAdminError,
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

  if (platformAdminError) {
    console.error(
      'Platform admin context error:',
      platformAdminError
    );
  }

  if (
    platformAdmin
      ?.is_active
  ) {
    return createPlatformAdminContext({
      authUser,
      profile,
    });
  }

  /*
    Auth session valid ho sakti hai but company context nahi.

    Example:
    - email confirmation page
    - reset/recovery flow
    - login incomplete

    Aise session ko automatically dashboard authority
    nahi denge.
  */

  return null;
}

/* =========================================================
   COMPANY DASHBOARD TEMPORARY GATE

   Customer Company Dashboard abhi build nahi hua.

   Customer ko SuperAdminDashboard kabhi render nahi karenge.
========================================================= */

function CompanyDashboardPending({
  currentUser,
  onLogout,
}) {
  const isTrialExpired =
    currentUser?.companyStatus ===
    'trial_expired';

  return (
    <div
      className="
        flex
        min-h-screen
        min-h-[100dvh]
        flex-col
        bg-[#050914]
        text-white
      "
    >
      <main
        className="
          flex
          flex-1
          items-center
          justify-center
          px-4
          py-10
          sm:px-6
        "
      >
        <div
          className="
            w-full
            max-w-xl
            rounded-[28px]
            border
            border-white/10
            bg-[#07101f]/95
            p-6
            text-center
            shadow-2xl
            shadow-black/50
            sm:p-8
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
              bg-gradient-to-br
              from-cyan-400
              via-blue-500
              to-violet-600
              text-sm
              font-black
            "
          >
            BF
          </div>

          {isTrialExpired ? (
            <>
              <p
                className="
                  mt-5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-amber-300
                "
              >
                Trial Expired
              </p>

              <h1
                className="
                  mt-2
                  text-2xl
                  font-black
                  sm:text-3xl
                "
              >
                Your free trial has ended.
              </h1>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-md
                  text-xs
                  leading-6
                  text-slate-400
                  sm:text-sm
                "
              >
                Your account remains accessible, but operational
                modules are restricted until a subscription is activated.
              </p>
            </>
          ) : (
            <>
              <p
                className="
                  mt-5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-cyan-300
                "
              >
                Secure Company Workspace
              </p>

              <h1
                className="
                  mt-2
                  text-2xl
                  font-black
                  sm:text-3xl
                "
              >
                Welcome to Buddy Fleets
              </h1>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-md
                  text-xs
                  leading-6
                  text-slate-400
                  sm:text-sm
                "
              >
                Your company authentication is active. The customer
                fleet dashboard will be connected here in the next
                development phase.
              </p>
            </>
          )}

          <div
            className="
              mt-6
              grid
              gap-3
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-4
              text-left
              sm:grid-cols-2
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-slate-500
                "
              >
                Company
              </p>

              <p
                className="
                  mt-1
                  break-words
                  text-xs
                  font-bold
                  text-white
                "
              >
                {currentUser?.companyName}
              </p>
            </div>

            <div>
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-slate-500
                "
              >
                Company Code
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  font-bold
                  text-cyan-300
                "
              >
                {currentUser?.companyCode}
              </p>
            </div>

            <div>
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-slate-500
                "
              >
                User
              </p>

              <p
                className="
                  mt-1
                  break-all
                  text-xs
                  font-medium
                  text-slate-300
                "
              >
                {currentUser?.email}
              </p>
            </div>

            <div>
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-slate-500
                "
              >
                Account Status
              </p>

              <p
                className={`
                  mt-1
                  text-xs
                  font-bold
                  ${
                    isTrialExpired
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                  }
                `}
              >
                {currentUser
                  ?.companyStatus
                  ?.replaceAll(
                    '_',
                    ' '
                  )
                  ?.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="
              mt-6
              rounded-xl
              border
              border-white/10
              bg-white/[0.05]
              px-6
              py-3
              text-xs
              font-bold
              text-slate-200
              transition-colors
              duration-200
              hover:bg-white/[0.1]
              hover:text-white
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-cyan-400/70
            "
          >
            Logout
          </button>
        </div>
      </main>

      <footer
        className="
          border-t
          border-white/[0.05]
          bg-[#030712]/95
          px-4
          py-4
          text-center
        "
      >
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
              transition-colors
              hover:text-cyan-300
              hover:decoration-cyan-400
            "
          >
            BUDDY COMPUTERS
          </a>

          . All rights reserved.
        </p>

        <p
          className="
            mt-1.5
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-slate-400
            sm:text-[9px]
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
              transition-colors
              hover:text-purple-300
            "
          >
            SHUBHAM JANGIR
          </a>
        </p>
      </footer>
    </div>
  );
}

/* =========================================================
   AUTH ROUTE GATE

   Public website ko session restoration ke liye block nahi
   karenge.

   Sirf Login / Signup / Forgot pages user state resolve hone
   ka wait karenge, taaki redirect flash na ho.
========================================================= */

function AuthGuestRoute({
  isSessionLoading,
  currentUser,
  children,
}) {
  if (isSessionLoading) {
    return <PageChunkLoader />;
  }

  if (currentUser) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    isSessionLoading,
    setIsSessionLoading,
  ] = useState(true);

  const currentUserRef =
    useRef(null);

  const inactivityTimerRef =
    useRef(null);

  const lastActivityHandledRef =
    useRef(0);

  const mountedRef =
    useRef(true);

  /* =========================================================
     SYNC CURRENT USER REF
  ========================================================= */

  useEffect(() => {
    currentUserRef.current =
      currentUser;
  }, [
    currentUser,
  ]);

  /* =========================================================
     CLEAR LOCAL APP CONTEXT
  ========================================================= */

  const clearLocalAppContext =
    useCallback(
      () => {

        localStorage.removeItem(
          ACTIVE_COMPANY_KEY
        );

        localStorage.removeItem(
          LAST_ACTIVITY_KEY
        );

        localStorage.removeItem(
          ACTIVE_TAB_KEY
        );

        /*
          Remove legacy insecure session object from
          old App.jsx versions.
        */

        localStorage.removeItem(
          LEGACY_SESSION_KEY
        );

      },
      []
    );

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout =
    useCallback(
      async (
        isAutoTimeout = false
      ) => {

        if (
          inactivityTimerRef.current
        ) {
          window.clearTimeout(
            inactivityTimerRef.current
          );

          inactivityTimerRef.current =
            null;
        }

        /*
          UI immediately lock.
        */

        setCurrentUser(
          null
        );

        currentUserRef.current =
          null;

        clearLocalAppContext();

        try {

          /*
            Normal logout / inactivity logout:
            current browser session only.

            Password reset all-session revocation backend
            separately handle karta hai.
          */

          await supabase
            .auth
            .signOut({
              scope:
                'local',
            });

        } catch (err) {

          console.error(
            isAutoTimeout
              ? 'Inactivity logout error:'
              : 'Logout error:',
            err
          );

        }

      },
      [
        clearLocalAppContext,
      ]
    );

  /* =========================================================
     SCHEDULE INACTIVITY LOGOUT
  ========================================================= */

  const scheduleInactivityLogout =
    useCallback(
      (
        lastActivity
      ) => {

        if (
          inactivityTimerRef.current
        ) {
          window.clearTimeout(
            inactivityTimerRef.current
          );
        }

        const elapsed =
          Date.now() -
          lastActivity;

        const remaining =
          INACTIVITY_TIMEOUT_MS -
          elapsed;

        if (
          remaining <= 0
        ) {
          handleLogout(
            true
          );

          return;
        }

        inactivityTimerRef.current =
          window.setTimeout(
            () => {
              handleLogout(
                true
              );
            },
            remaining
          );

      },
      [
        handleLogout,
      ]
    );

  /* =========================================================
     RECORD ACTIVITY
  ========================================================= */

  const recordActivity =
    useCallback(
      () => {

        if (
          !currentUserRef.current
        ) {
          return;
        }

        const now =
          Date.now();

        if (
          now -
            lastActivityHandledRef.current <
          ACTIVITY_THROTTLE_MS
        ) {
          return;
        }

        lastActivityHandledRef.current =
          now;

        localStorage.setItem(
          LAST_ACTIVITY_KEY,
          String(now)
        );

        scheduleInactivityLogout(
          now
        );

      },
      [
        scheduleInactivityLogout,
      ]
    );

  /* =========================================================
     REFRESH AUTHORIZED USER CONTEXT
  ========================================================= */

  const refreshCurrentContext =
    useCallback(
      async () => {

        try {

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
            userError ||
            !userResult?.user
          ) {
            setCurrentUser(
              null
            );

            return null;
          }

          const authUser =
            userResult.user;

          const storedCompany =
            getStoredCompanyContext();

          const context =
            await buildUserContext(
              authUser,
              storedCompany?.companyId ||
                null
            );

          if (
            !mountedRef.current
          ) {
            return null;
          }

          /*
            Existing authorized context tha but ab DB
            authorization fail ho gaya.
          */

          if (
            currentUserRef.current &&
            !context
          ) {
            await handleLogout(
              false
            );

            return null;
          }

          if (context) {
            setCurrentUser(
              context
            );

            currentUserRef.current =
              context;
          }

          return context;

        } catch (err) {

          console.error(
            'User context refresh error:',
            err
          );

          return null;

        }

      },
      [
        handleLogout,
      ]
    );

  /* =========================================================
     INITIAL SESSION RESTORE

     IMPORTANT CHANGE:

     Public website ko restore complete hone tak blank/loading
     screen par block nahi karenge.

     Auth-sensitive routes individually isSessionLoading
     handle karenge.
  ========================================================= */

  useEffect(() => {
    mountedRef.current =
      true;

    const restoreSession =
      async () => {

        try {

          /* REMOVE LEGACY OBJECT */

          localStorage.removeItem(
            LEGACY_SESSION_KEY
          );

          const {
            data:
              sessionData,
            error:
              sessionError,
          } =
            await supabase
              .auth
              .getSession();

          if (sessionError) {
            throw sessionError;
          }

          const session =
            sessionData
              ?.session;

          if (
            !session?.user
          ) {
            if (
              mountedRef.current
            ) {
              setCurrentUser(
                null
              );
            }

            return;
          }

          /* =================================================
             INACTIVITY CHECK
          ================================================= */

          const storedActivity =
            Number(
              localStorage.getItem(
                LAST_ACTIVITY_KEY
              )
            );

          if (
            storedActivity &&
            Number.isFinite(
              storedActivity
            )
          ) {
            const elapsed =
              Date.now() -
              storedActivity;

            if (
              elapsed >=
              INACTIVITY_TIMEOUT_MS
            ) {
              await handleLogout(
                true
              );

              return;
            }
          }

          /* =================================================
             VERIFY USER AGAINST AUTH SERVER
          ================================================= */

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
            userError ||
            !userResult?.user
          ) {
            await handleLogout(
              false
            );

            return;
          }

          const authUser =
            userResult.user;

          /*
            Confirmation / recovery session me active company
            context intentionally absent ho sakti hai.

            Us situation me auth session ko automatically
            destroy nahi karenge.
          */

          const storedCompany =
            getStoredCompanyContext();

          const context =
            await buildUserContext(
              authUser,
              storedCompany?.companyId ||
                null
            );

          if (
            !mountedRef.current
          ) {
            return;
          }

          if (context) {
            setCurrentUser(
              context
            );

            currentUserRef.current =
              context;

            const activity =
              storedActivity &&
              Number.isFinite(
                storedActivity
              )
                ? storedActivity
                : Date.now();

            localStorage.setItem(
              LAST_ACTIVITY_KEY,
              String(
                activity
              )
            );

          } else {

            setCurrentUser(
              null
            );

            currentUserRef.current =
              null;

            /*
              Stored company context present tha but DB
              authorization fail hua.

              Stale context remove + auth session clear.
            */

            if (
              storedCompany
                ?.companyId
            ) {
              localStorage.removeItem(
                ACTIVE_COMPANY_KEY
              );

              localStorage.removeItem(
                LAST_ACTIVITY_KEY
              );

              await supabase
                .auth
                .signOut({
                  scope:
                    'local',
                })
                .catch(
                  () => {}
                );
            }
          }

        } catch (err) {

          console.error(
            'Session restore error:',
            err
          );

          if (
            mountedRef.current
          ) {
            setCurrentUser(
              null
            );
          }

        } finally {

          if (
            mountedRef.current
          ) {
            setIsSessionLoading(
              false
            );
          }

        }

      };

    restoreSession();

    return () => {
      mountedRef.current =
        false;
    };

  }, [
    handleLogout,
  ]);

  /* =========================================================
     SUPABASE AUTH LISTENER

     IMPORTANT SECURITY RULE:

     SIGNED_IN event alone dashboard authorization nahi deta.

     Login.jsx ko pehle:
     - password
     - company code
     - membership
     - company status

     verify karna hota hai.

     Actual app activation:
     handleLoginSuccess()
  ========================================================= */

  useEffect(() => {

    const {
      data:
        authListener,
    } =
      supabase
        .auth
        .onAuthStateChange(
          (
            event,
            session
          ) => {

            /* =============================================
               SIGNED OUT
            ============================================= */

            if (
              event ===
              'SIGNED_OUT'
            ) {
              window.setTimeout(
                () => {

                  if (
                    !mountedRef.current
                  ) {
                    return;
                  }

                  setCurrentUser(
                    null
                  );

                  currentUserRef.current =
                    null;

                },
                0
              );

              return;
            }

            /* =============================================
               DO NOT AUTHORIZE ON SIGNED_IN
            ============================================= */

            if (
              event ===
              'SIGNED_IN'
            ) {
              return;
            }

            /* =============================================
               REFRESH EXISTING AUTHORIZED SESSION
            ============================================= */

            if (
              (
                event ===
                  'TOKEN_REFRESHED' ||
                event ===
                  'USER_UPDATED'
              ) &&
              session?.user &&
              currentUserRef.current
            ) {
              window.setTimeout(
                () => {
                  refreshCurrentContext();
                },
                0
              );
            }

          }
        );

    return () => {

      authListener
        ?.subscription
        ?.unsubscribe();

    };

  }, [
    refreshCurrentContext,
  ]);

  /* =========================================================
     ACTIVITY LISTENERS
  ========================================================= */

  useEffect(() => {

    if (
      !currentUser
    ) {
      return undefined;
    }

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    const existing =
      Number(
        localStorage.getItem(
          LAST_ACTIVITY_KEY
        )
      );

    const initialActivity =
      existing &&
      Number.isFinite(
        existing
      )
        ? existing
        : Date.now();

    localStorage.setItem(
      LAST_ACTIVITY_KEY,
      String(
        initialActivity
      )
    );

    scheduleInactivityLogout(
      initialActivity
    );

    const handleActivity =
      () => {
        recordActivity();
      };

    activityEvents.forEach(
      (
        eventName
      ) => {

        window.addEventListener(
          eventName,
          handleActivity,
          {
            passive:
              true,
          }
        );

      }
    );

    return () => {

      activityEvents.forEach(
        (
          eventName
        ) => {

          window.removeEventListener(
            eventName,
            handleActivity
          );

        }
      );

      if (
        inactivityTimerRef.current
      ) {
        window.clearTimeout(
          inactivityTimerRef.current
        );

        inactivityTimerRef.current =
          null;
      }

    };

  }, [
    currentUser,
    recordActivity,
    scheduleInactivityLogout,
  ]);

  /* =========================================================
     LOGIN SUCCESS

     Called only after Login.jsx successfully verifies:

     1. Supabase Auth
     2. Company Code
     3. Membership
     4. Company Status
  ========================================================= */

  const handleLoginSuccess =
    useCallback(
      (
        authenticatedUser
      ) => {

        if (
          !authenticatedUser
            ?.id
        ) {
          return;
        }

        /* PLATFORM ADMIN LOGIN */

        if (
          authenticatedUser
            .isPlatformAdmin
        ) {
          localStorage.removeItem(
            ACTIVE_COMPANY_KEY
          );

        } else {

          /* COMPANY LOGIN */

          saveCompanyContext(
            authenticatedUser
          );
        }

        const now =
          Date.now();

        localStorage.setItem(
          LAST_ACTIVITY_KEY,
          String(now)
        );

        lastActivityHandledRef.current =
          now;

        setCurrentUser(
          authenticatedUser
        );

        currentUserRef.current =
          authenticatedUser;

      },
      []
    );

  /* =========================================================
     USER UPDATE

     Dashboard supplied object ko blindly trust nahi karenge.

     Fresh DB-authorized context read hoga.
  ========================================================= */

  const handleUserUpdate =
    useCallback(
      async () => {

        await refreshCurrentContext();

      },
      [
        refreshCurrentContext,
      ]
    );

  /* =========================================================
     ROUTES
  ========================================================= */

  return (
    <BrowserRouter>

      <ScrollToTop />

      <Routes>

        {/* ===================================================
            PUBLIC WEBSITE + AUTH

            SAME WEBSITE LAYOUT:
            Header
              ↓
            Outlet
              ↓
            Footer
        =================================================== */}

        <Route
          element={
            <WebsiteLayout />
          }
        >

          {/* HOME */}

          <Route
            path="/"
            element={
              <LazyPage>
                <Home />
              </LazyPage>
            }
          />

          {/* FEATURES */}

          <Route
            path="/features"
            element={
              <LazyPage>
                <Features />
              </LazyPage>
            }
          />

          {/* PRICING */}

          <Route
            path="/pricing"
            element={
              <LazyPage>
                <Pricing />
              </LazyPage>
            }
          />

          {/* ABOUT US */}

          <Route
            path="/about"
            element={
              <LazyPage>
                <AboutUs />
              </LazyPage>
            }
          />

          {/* CONTACT US */}

          <Route
            path="/contact-us"
            element={
              <LazyPage>
                <ContactUs />
              </LazyPage>
            }
          />

          {/* ===============================================
              LOGIN
          =============================================== */}

          <Route
            path="/login"
            element={
              <AuthGuestRoute
                isSessionLoading={
                  isSessionLoading
                }
                currentUser={
                  currentUser
                }
              >
                <LazyPage>
                  <Login
                    onLoginSuccess={
                      handleLoginSuccess
                    }
                  />
                </LazyPage>
              </AuthGuestRoute>
            }
          />

          {/* ===============================================
              SIGNUP

              Successful signup:
              NO auto-login.

              Trial starts only after email confirmation.
          =============================================== */}

          <Route
            path="/signup"
            element={
              <AuthGuestRoute
                isSessionLoading={
                  isSessionLoading
                }
                currentUser={
                  currentUser
                }
              >
                <LazyPage>
                  <Signup />
                </LazyPage>
              </AuthGuestRoute>
            }
          />

          {/* ===============================================
              FORGOT PASSWORD
          =============================================== */}

          <Route
            path="/forgot-password"
            element={
              <AuthGuestRoute
                isSessionLoading={
                  isSessionLoading
                }
                currentUser={
                  currentUser
                }
              >
                <LazyPage>
                  <ForgotID />
                </LazyPage>
              </AuthGuestRoute>
            }
          />

          {/* ===============================================
              EMAIL CONFIRMATION

              No currentUser guard intentionally.

              Supabase confirmation temporary session create
              kar sakta hai.
          =============================================== */}

          <Route
            path="/confirm"
            element={
              <LazyPage>
                <ConfirmationPage />
              </LazyPage>
            }
          />

          {/* ===============================================
              RESET PASSWORD

              No currentUser guard intentionally.
          =============================================== */}

          <Route
            path="/reset-password"
            element={
              <LazyPage>
                <ResetPassword />
              </LazyPage>
            }
          />

        </Route>

        {/* ===================================================
            LEGACY CONTACT URL
        =================================================== */}

        <Route
          path="/contact"
          element={
            <LegacyContactRedirect />
          }
        />

        {/* ===================================================
            LEGACY FORGOT URL
        =================================================== */}

        <Route
          path="/forgot-id"
          element={
            <LegacyForgotRedirect />
          }
        />

        {/* ===================================================
            LEGACY CONFIRMATION URL

            Query/hash preserve hoga.
        =================================================== */}

        <Route
          path="/auth/confirmation"
          element={
            <LegacyConfirmationRedirect />
          }
        />

        {/* ===================================================
            PROTECTED DASHBOARD

            WebsiteLayout intentionally nahi.

            Dashboard application workspace hai.
        =================================================== */}

        <Route
          path="/dashboard"
          element={
            isSessionLoading ? (

              <FullScreenLoader />

            ) : !currentUser ? (

              <Navigate
                to="/login"
                replace
              />

            ) : currentUser
                .isPlatformAdmin ? (

              <Suspense
                fallback={
                  <FullScreenLoader />
                }
              >
                <SuperAdminDashboard
                  currentUser={
                    currentUser
                  }
                  onLogout={() =>
                    handleLogout(
                      false
                    )
                  }
                  onUserUpdate={
                    handleUserUpdate
                  }
                />
              </Suspense>

            ) : (

              <CompanyDashboardPending
                currentUser={
                  currentUser
                }
                onLogout={() =>
                  handleLogout(
                    false
                  )
                }
              />

            )
          }
        />

        {/* ===================================================
            CATCH ALL
        =================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}