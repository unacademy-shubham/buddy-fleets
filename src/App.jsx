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

import WebsiteLayout from './layouts/WebsiteLayout';

/* =========================================================
   ROUTE-LEVEL CODE SPLITTING
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
   LAZY SUPABASE CLIENT

   IMPORTANT:

   Public marketing routes par Supabase SDK initial bundle
   ke saath load nahi hoga.

   Auth/dashboard runtime ko jab zarurat hogi tabhi
   separate chunk download hoga.
========================================================= */

let supabaseClientPromise = null;

function getSupabaseClient() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = import(
      './supabaseClient'
    ).then(
      (module) => module.supabase
    );
  }

  return supabaseClientPromise;
}

/* =========================================================
   AUTH RUNTIME ROUTES

   In routes par App-level session restore / auth listener
   required hai.

   Public marketing pages intentionally excluded.
========================================================= */

const AUTH_RUNTIME_PATHS = new Set([
  '/login',
  '/signup',
  '/forgot-password',
  '/confirm',
  '/reset-password',
  '/dashboard',
]);

function requiresAuthRuntime(
  pathname
) {
  if (
    AUTH_RUNTIME_PATHS.has(
      pathname
    )
  ) {
    return true;
  }

  return pathname.startsWith(
    '/dashboard/'
  );
}

/* =========================================================
   STORAGE KEYS
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

/* ACTIVITY WRITE THROTTLE */

const ACTIVITY_THROTTLE_MS =
  15 * 1000;

/* =========================================================
   PAGE CHUNK LOADER
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
      <div
        className="
          flex
          flex-col
          items-center
          gap-4
        "
      >
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
   FULL SCREEN LOADER
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
      <div
        className="
          flex
          flex-col
          items-center
          gap-4
        "
      >
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

function LazyPage({
  children,
}) {
  return (
    <Suspense
      fallback={
        <PageChunkLoader />
      }
    >
      {children}
    </Suspense>
  );
}

/* =========================================================
   SCROLL TO TOP
========================================================= */

function ScrollToTop() {
  const {
    pathname,
  } = useLocation();

  useEffect(
    () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    },
    [
      pathname,
    ]
  );

  return null;
}

/* =========================================================
   LEGACY REDIRECTS
========================================================= */

function LegacyConfirmationRedirect() {
  const location =
    useLocation();

  return (
    <Navigate
      replace
      to={`/confirm${location.search}${location.hash}`}
    />
  );
}

function LegacyContactRedirect() {
  const location =
    useLocation();

  return (
    <Navigate
      replace
      to={`/contact-us${location.search}${location.hash}`}
    />
  );
}

function LegacyForgotRedirect() {
  const location =
    useLocation();

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
      JSON.parse(
        raw
      );

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

function saveCompanyContext(
  user
) {
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
   PLATFORM ADMIN CONTEXT
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
   BUILD AUTHORIZED USER CONTEXT

   Security ordering preserved:

   Supabase Auth
        ↓
   Profile
        ↓
   Stored company context?
        ↓
   YES -> Membership -> Company -> Subscription
        ↓
   NO -> Platform Admin
========================================================= */

async function buildUserContext(
  authUser,
  preferredCompanyId = null
) {
  if (
    !authUser?.id
  ) {
    return null;
  }

  if (
    !authUser.email_confirmed_at
  ) {
    return null;
  }

  const supabase =
    await getSupabaseClient();

  /* =======================================================
     PROFILE
  ======================================================= */

  const {
    data: profile,
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
      'Profile context error:',
      profileError
    );
  }

  /* =======================================================
     COMPANY CONTEXT HAS PRIORITY
  ======================================================= */

  if (
    preferredCompanyId
  ) {
    /* MEMBERSHIP */

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
      if (
        membershipError
      ) {
        console.error(
          'Membership context error:',
          membershipError
        );
      }

      return null;
    }

    if (
      membership.status !==
      'active'
    ) {
      return null;
    }

    /* COMPANY */

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
          'id',
          membership.company_id
        )
        .maybeSingle();

    if (
      companyError ||
      !company
    ) {
      if (
        companyError
      ) {
        console.error(
          'Company context error:',
          companyError
        );
      }

      return null;
    }

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

    /* SUBSCRIPTION */

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
        'Subscription context error:',
        subscriptionError
      );
    }

    /* EFFECTIVE TRIAL STATUS */

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
     PLATFORM ADMIN
  ======================================================= */

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

  return null;
}

/* =========================================================
   COMPANY DASHBOARD TEMPORARY GATE
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
            onClick={
              onLogout
            }
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
   AUTH GUEST ROUTE
========================================================= */

function AuthGuestRoute({
  isSessionLoading,
  currentUser,
  children,
}) {
  if (
    isSessionLoading
  ) {
    return (
      <PageChunkLoader />
    );
  }

  if (
    currentUser
  ) {
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
   APP ROUTER
========================================================= */

function AppRouter() {
  const location =
    useLocation();

  const authRuntimeRequired =
    requiresAuthRuntime(
      location.pathname
    );

  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  /*
    Intentionally TRUE initially.

    Public website is never blocked by this value.

    Agar visitor public route se login par navigate kare to
    Login route session restore complete hone tak flash nahi karega.
  */

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
     COMPONENT MOUNT STATE
  ========================================================= */

  useEffect(
    () => {
      mountedRef.current =
        true;

      return () => {
        mountedRef.current =
          false;
      };
    },
    []
  );

  /* =========================================================
     SYNC CURRENT USER REF
  ========================================================= */

  useEffect(
    () => {
      currentUserRef.current =
        currentUser;
    },
    [
      currentUser,
    ]
  );

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

        setCurrentUser(
          null
        );

        currentUserRef.current =
          null;

        clearLocalAppContext();

        try {
          const supabase =
            await getSupabaseClient();

          await supabase
            .auth
            .signOut({
              scope:
                'local',
            });
        } catch (
          err
        ) {
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
     INACTIVITY LOGOUT
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
          String(
            now
          )
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
     REFRESH AUTHORIZED CONTEXT
  ========================================================= */

  const refreshCurrentContext =
    useCallback(
      async () => {
        try {
          const supabase =
            await getSupabaseClient();

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

          if (
            currentUserRef.current &&
            !context
          ) {
            await handleLogout(
              false
            );

            return null;
          }

          if (
            context
          ) {
            setCurrentUser(
              context
            );

            currentUserRef.current =
              context;
          }

          return context;
        } catch (
          err
        ) {
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
     ROUTE-AWARE SESSION RESTORE

     Critical performance change:

     Public routes:
       /
       /features
       /pricing
       /about
       /contact-us

     par Supabase client import nahi hoga.
  ========================================================= */

  useEffect(
    () => {
      if (
        !authRuntimeRequired
      ) {
        /*
          Public website session restore ke liye wait nahi karega.

          TRUE rakhenge so next auth-route navigation par
          login/signup content premature render na ho.
        */

        setIsSessionLoading(
          true
        );

        return undefined;
      }

      let cancelled =
        false;

      setIsSessionLoading(
        true
      );

      const restoreSession =
        async () => {
          try {
            localStorage.removeItem(
              LEGACY_SESSION_KEY
            );

            const supabase =
              await getSupabaseClient();

            const {
              data:
                sessionData,
              error:
                sessionError,
            } =
              await supabase
                .auth
                .getSession();

            if (
              cancelled
            ) {
              return;
            }

            if (
              sessionError
            ) {
              throw sessionError;
            }

            const session =
              sessionData
                ?.session;

            if (
              !session?.user
            ) {
              if (
                mountedRef.current &&
                !cancelled
              ) {
                setCurrentUser(
                  null
                );

                currentUserRef.current =
                  null;
              }

              return;
            }

            /* INACTIVITY CHECK */

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

            /* SERVER USER VERIFICATION */

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
              cancelled
            ) {
              return;
            }

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

            const storedCompany =
              getStoredCompanyContext();

            const context =
              await buildUserContext(
                authUser,
                storedCompany?.companyId ||
                  null
              );

            if (
              cancelled ||
              !mountedRef.current
            ) {
              return;
            }

            if (
              context
            ) {
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
                Stored company context present tha but
                authorization ab valid nahi hai.
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
          } catch (
            err
          ) {
            console.error(
              'Session restore error:',
              err
            );

            if (
              mountedRef.current &&
              !cancelled
            ) {
              setCurrentUser(
                null
              );

              currentUserRef.current =
                null;
            }
          } finally {
            if (
              mountedRef.current &&
              !cancelled
            ) {
              setIsSessionLoading(
                false
              );
            }
          }
        };

      restoreSession();

      return () => {
        cancelled =
          true;
      };
    },
    [
      authRuntimeRequired,
      handleLogout,
    ]
  );

  /* =========================================================
     ROUTE-AWARE SUPABASE AUTH LISTENER

     Public marketing route par listener bhi initialize
     nahi hoga.
  ========================================================= */

  useEffect(
    () => {
      if (
        !authRuntimeRequired
      ) {
        return undefined;
      }

      let cancelled =
        false;

      let subscription =
        null;

      const setupAuthListener =
        async () => {
          const supabase =
            await getSupabaseClient();

          if (
            cancelled
          ) {
            return;
          }

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
                  /* SIGNED OUT */

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

                  /*
                    SIGNED_IN event alone authorization nahi deta.
                  */

                  if (
                    event ===
                    'SIGNED_IN'
                  ) {
                    return;
                  }

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

          subscription =
            authListener
              ?.subscription ||
            null;
        };

      setupAuthListener();

      return () => {
        cancelled =
          true;

        subscription
          ?.unsubscribe();
      };
    },
    [
      authRuntimeRequired,
      refreshCurrentContext,
    ]
  );

  /* =========================================================
     ACTIVITY LISTENERS
  ========================================================= */

  useEffect(
    () => {
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
    },
    [
      currentUser,
      recordActivity,
      scheduleInactivityLogout,
    ]
  );

  /* =========================================================
     LOGIN SUCCESS
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

        if (
          authenticatedUser
            .isPlatformAdmin
        ) {
          localStorage.removeItem(
            ACTIVE_COMPANY_KEY
          );
        } else {
          saveCompanyContext(
            authenticatedUser
          );
        }

        const now =
          Date.now();

        localStorage.setItem(
          LAST_ACTIVITY_KEY,
          String(
            now
          )
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
    <>
      <ScrollToTop />

      <Routes>
        {/* ===================================================
            PUBLIC WEBSITE + AUTH
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

          {/* ABOUT */}

          <Route
            path="/about"
            element={
              <LazyPage>
                <AboutUs />
              </LazyPage>
            }
          />

          {/* CONTACT */}

          <Route
            path="/contact-us"
            element={
              <LazyPage>
                <ContactUs />
              </LazyPage>
            }
          />

          {/* LOGIN */}

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

          {/* SIGNUP */}

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

          {/* FORGOT PASSWORD */}

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

          {/* CONFIRMATION */}

          <Route
            path="/confirm"
            element={
              <LazyPage>
                <ConfirmationPage />
              </LazyPage>
            }
          />

          {/* RESET PASSWORD */}

          <Route
            path="/reset-password"
            element={
              <LazyPage>
                <ResetPassword />
              </LazyPage>
            }
          />
        </Route>

        {/* LEGACY CONTACT */}

        <Route
          path="/contact"
          element={
            <LegacyContactRedirect />
          }
        />

        {/* LEGACY FORGOT */}

        <Route
          path="/forgot-id"
          element={
            <LegacyForgotRedirect />
          }
        />

        {/* LEGACY CONFIRMATION */}

        <Route
          path="/auth/confirmation"
          element={
            <LegacyConfirmationRedirect />
          }
        />

        {/* ===================================================
            PROTECTED DASHBOARD
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

        {/* CATCH ALL */}

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
    </>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}