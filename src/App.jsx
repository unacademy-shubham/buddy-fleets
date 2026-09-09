import React, {
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
   WEBSITE
========================================================= */

import WebsiteLayout from './layouts/WebsiteLayout';

import Home from './pages/Website/Home';
import Features from './pages/Website/Features';
import AboutUs from './pages/Website/AboutUs';
import ContactUs from './pages/Website/ContactUs';

/* =========================================================
   AUTH
========================================================= */

import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotID from './pages/Auth/ForgotID';
import ConfirmationPage from './pages/Auth/ConfirmationPage';

/* =========================================================
   DASHBOARD
========================================================= */

import SuperAdminDashboard from './pages/Dashboard/SuperAdminDashboard';

/* =========================================================
   STORAGE KEYS

   IMPORTANT:
   Supabase session hi authentication authority hai.

   LocalStorage me:
   - password nahi
   - access token manually nahi
   - complete currentUser object nahi

   Sirf:
   - selected company context
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

/* Activity events ko throttle karenge */

const ACTIVITY_THROTTLE_MS =
  15 * 1000;

/* =========================================================
   SCROLL TO TOP
========================================================= */

function ScrollToTop() {
  const { pathname } =
    useLocation();

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

   Agar Supabase me purana redirect:
   /auth/confirmation

   kahin saved reh gaya ho to URL query/hash preserve karke
   /confirm par redirect karega.
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
   BUILD AUTHENTICATED APP USER

   Ye function password ko kabhi touch nahi karta.

   Supabase Auth user
            ↓
   platform_admins
        OR
   selected company membership
            ↓
   companies
            ↓
   subscription
========================================================= */

async function buildUserContext(
  authUser,
  preferredCompanyId = null
) {
  if (!authUser?.id) {
    return null;
  }

  /* ---------------------------------------------------------
     EMAIL MUST BE CONFIRMED
  --------------------------------------------------------- */

  if (!authUser.email_confirmed_at) {
    return null;
  }

  /* ---------------------------------------------------------
     PROFILE
  --------------------------------------------------------- */

  const {
    data: profile,
    error: profileError,
  } = await supabase
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

  /* ---------------------------------------------------------
     PLATFORM SUPER ADMIN

     No hardcoded credentials.
     Authorization = platform_admins table.
  --------------------------------------------------------- */

  const {
    data: platformAdmin,
    error: platformAdminError,
  } = await supabase
    .from('platform_admins')
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
    platformAdmin?.is_active
  ) {
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
    };
  }

  /* ---------------------------------------------------------
     COMPANY USER

     Company context required.

     IMPORTANT:
     Supabase session alone company dashboard access ke liye
     enough nahi hai.

     Selected company successful Login.jsx verification ke
     baad save hoti hai.
  --------------------------------------------------------- */

  if (!preferredCompanyId) {
    return null;
  }

  /* ---------------------------------------------------------
     MEMBERSHIP
  --------------------------------------------------------- */

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from(
      'company_memberships'
    )
    .select(
      'id, company_id, user_id, status, access_scope, joined_at'
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

  /* ---------------------------------------------------------
     COMPANY
  --------------------------------------------------------- */

  const {
    data: company,
    error: companyError,
  } = await supabase
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

  /* ---------------------------------------------------------
     BLOCKED COMPANY STATES
  --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     SUBSCRIPTION
  --------------------------------------------------------- */

  const {
    data: subscription,
    error: subscriptionError,
  } = await supabase
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

  /* ---------------------------------------------------------
     EFFECTIVE TRIAL STATUS

     Database me trial_active ho lekin trial_end_at past ho
     chuka ho to frontend immediately trial_expired treat karega.

     NOTE:
     Server-side entitlement enforcement bhi later database/RPC
     level par update karna hai. Sirf frontend par depend nahi
     karenge.
  --------------------------------------------------------- */

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
    ).getTime() <= Date.now()
  ) {
    effectiveCompanyStatus =
      'trial_expired';
  }

  /* ---------------------------------------------------------
     ALLOWED LOGIN STATES

     trial_expired login allowed hai.
     Usko restricted dashboard milega.
  --------------------------------------------------------- */

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
      company.account_owner_user_id ===
      authUser.id,

    subscriptionStatus:
      subscription?.status ||
      null,

    planId:
      subscription?.plan_id ||
      null,

    trialStartAt:
      subscription?.trial_start_at ||
      null,

    trialEndAt,

    subscriptionStartAt:
      subscription?.subscription_start_at ||
      null,

    subscriptionEndAt:
      subscription?.subscription_end_at ||
      null,
  };
}

/* =========================================================
   COMPANY DASHBOARD TEMPORARY GATE

   IMPORTANT:
   Abhi hamare folder me customer company ka real dashboard
   nahi hai.

   Customer ko SuperAdminDashboard dena SECURITY BUG hota.

   Isliye jab tak Company Dashboard build nahi hota,
   authenticated customer yahan safe placeholder dekhega.
========================================================= */

function CompanyDashboardPending({
  currentUser,
  onLogout,
}) {
  const isTrialExpired =
    currentUser?.companyStatus ===
    'trial_expired';

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#050914] text-white">

      {/* MAIN */}

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">

        <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#07101f]/95 p-6 text-center shadow-2xl shadow-black/50 sm:p-8">

          {/* LOGO */}

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-sm font-black">
            BF
          </div>

          {isTrialExpired ? (
            <>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                Trial Expired
              </p>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Your free trial has ended.
              </h1>

              <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-slate-400 sm:text-sm">
                Your account remains accessible, but operational modules are restricted until a subscription is activated.
              </p>
            </>
          ) : (
            <>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                Secure Company Workspace
              </p>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Welcome to Buddy Fleets
              </h1>

              <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-slate-400 sm:text-sm">
                Your company authentication is active. The customer fleet dashboard will be connected here in the next development phase.
              </p>
            </>
          )}

          {/* COMPANY INFO */}

          <div className="mt-6 grid gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left sm:grid-cols-2">

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Company
              </p>

              <p className="mt-1 break-words text-xs font-bold text-white">
                {currentUser?.companyName}
              </p>
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Company Code
              </p>

              <p className="mt-1 text-xs font-bold text-cyan-300">
                {currentUser?.companyCode}
              </p>
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500">
                User
              </p>

              <p className="mt-1 break-all text-xs font-medium text-slate-300">
                {currentUser?.email}
              </p>
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Account Status
              </p>

              <p
                className={`mt-1 text-xs font-bold ${
                  isTrialExpired
                    ? 'text-amber-300'
                    : 'text-emerald-300'
                }`}
              >
                {currentUser?.companyStatus
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
            className="mt-6 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
          >
            Logout
          </button>

        </div>

      </main>

      {/* FOOTER */}

      <footer className="border-t border-white/[0.05] bg-[#030712]/95 px-4 py-4 text-center">

        <p className="text-[9px] font-medium tracking-wide text-slate-400 sm:text-[10px]">

          Copyright by{' '}

          <span className="font-bold text-white">
            BUDDY COMPUTERS
          </span>

          . All rights reserved.

        </p>

        <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[9px]">

          DESIGNED BY{' '}

          <a
            href="https://www.instagram.com/happiest_banda"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 underline decoration-purple-400 underline-offset-2 transition hover:text-purple-300"
          >
            SHUBHAM JANGIR
          </a>

        </p>

      </footer>

    </div>
  );
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
     SYNC USER REF
  ========================================================= */

  useEffect(() => {
    currentUserRef.current =
      currentUser;
  }, [currentUser]);

  /* =========================================================
     CLEAR APP CONTEXT
  ========================================================= */

  const clearLocalAppContext =
    useCallback(() => {

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
        Remove old insecure Buddy Fleets session object
        from previous App.jsx versions.
      */

      localStorage.removeItem(
        LEGACY_SESSION_KEY
      );

    }, []);

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
          UI immediately lock karo.
        */

        setCurrentUser(null);

        currentUserRef.current =
          null;

        clearLocalAppContext();

        try {

          /*
            Normal logout / inactivity logout:
            current browser session end.

            Password reset ke time ALL sessions revoke karna
            separate secure backend flow me hoga.
          */

          await supabase.auth.signOut({
            scope: 'local',
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
      [clearLocalAppContext]
    );

  /* =========================================================
     SCHEDULE INACTIVITY LOGOUT
  ========================================================= */

  const scheduleInactivityLogout =
    useCallback(
      (lastActivity) => {

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

        if (remaining <= 0) {

          handleLogout(true);

          return;
        }

        inactivityTimerRef.current =
          window.setTimeout(
            () => {
              handleLogout(true);
            },
            remaining
          );

      },
      [handleLogout]
    );

  /* =========================================================
     RECORD ACTIVITY

     LocalStorage timestamp auth authority nahi hai.
     Ye sirf inactivity policy ke liye hai.
  ========================================================= */

  const recordActivity =
    useCallback(() => {

      if (
        !currentUserRef.current
      ) {
        return;
      }

      const now =
        Date.now();

      /*
        mousemove etc bahut frequently fire hote hain.
        Har event par localStorage write nahi karenge.
      */

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

    }, [
      scheduleInactivityLogout,
    ]);

  /* =========================================================
     REFRESH CURRENT AUTHORIZED CONTEXT

     Existing logged-in user ke liye DB state re-check karta hai.
  ========================================================= */

  const refreshCurrentContext =
    useCallback(async () => {

      try {

        const {
          data: userResult,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (
          userError ||
          !userResult?.user
        ) {

          setCurrentUser(null);

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
          If previously authenticated app context existed but
          now access is gone, lock dashboard.
        */

        if (
          currentUserRef.current &&
          !context
        ) {

          await handleLogout(false);

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

    }, [handleLogout]);

  /* =========================================================
     INITIAL SESSION RESTORE

     AUTHORITY:
     supabase.auth.getSession()
              +
     supabase.auth.getUser()
              +
     database authorization

     NOT:
     localStorage user object.
  ========================================================= */

  useEffect(() => {
    mountedRef.current = true;

    const restoreSession =
      async () => {

        try {

          /*
            Remove old insecure session object.
          */

          localStorage.removeItem(
            LEGACY_SESSION_KEY
          );

          const {
            data: sessionData,
            error: sessionError,
          } =
            await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          const session =
            sessionData?.session;

          if (!session?.user) {

            if (
              mountedRef.current
            ) {
              setCurrentUser(
                null
              );
            }

            return;
          }

          /* -----------------------------------------------
             INACTIVITY CHECK
          ----------------------------------------------- */

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

          /*
            Verify user against Supabase Auth server.
          */

          const {
            data: userResult,
            error: userError,
          } =
            await supabase.auth.getUser();

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
            Company users ke liye selected company context
            required hai.

            Confirmation / password recovery session me ye key
            intentionally absent ho sakti hai. Us situation me
            auth session ko destroy nahi karenge because
            /confirm ko uski zarurat hoti hai.
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
              storedActivity ||
              Date.now();

            localStorage.setItem(
              LAST_ACTIVITY_KEY,
              String(activity)
            );

          } else {

            setCurrentUser(
              null
            );

            currentUserRef.current =
              null;

            /*
              Agar active company context stored tha but ab
              authorization verify nahi hua, stale session
              context remove karo.
            */

            if (
              storedCompany?.companyId
            ) {

              localStorage.removeItem(
                ACTIVE_COMPANY_KEY
              );

              localStorage.removeItem(
                LAST_ACTIVITY_KEY
              );

              await supabase.auth
                .signOut({
                  scope:
                    'local',
                })
                .catch(() => {});

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

  }, [handleLogout]);

  /* =========================================================
     SUPABASE AUTH LISTENER

     VERY IMPORTANT SECURITY RULE:

     SIGNED_IN event par automatically currentUser set NAHI
     karenge.

     Why?

     signInWithPassword() pehle email/password verify karta hai,
     lekin Login.jsx ko uske baad Company Code + Membership bhi
     verify karna hota hai.

     Agar App SIGNED_IN ko direct dashboard access de de,
     wrong Company Code bypass ho sakta hai.

     Actual dashboard activation:
     handleLoginSuccess()
  ========================================================= */

  useEffect(() => {

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {

          /* -----------------------------------------------
             SIGN OUT
          ----------------------------------------------- */

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

          /* -----------------------------------------------
             DO NOT AUTHORIZE ON SIGNED_IN
          ----------------------------------------------- */

          if (
            event ===
            'SIGNED_IN'
          ) {
            return;
          }

          /* -----------------------------------------------
             REFRESH EXISTING AUTHORIZED SESSION
          ----------------------------------------------- */

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

  }, [refreshCurrentContext]);

  /* =========================================================
     ACTIVITY LISTENERS
  ========================================================= */

  useEffect(() => {

    if (!currentUser) {
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

    /*
      Login ke immediately baad activity initialize.
    */

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
      (eventName) => {

        window.addEventListener(
          eventName,
          handleActivity,
          {
            passive: true,
          }
        );

      }
    );

    return () => {

      activityEvents.forEach(
        (eventName) => {

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

     Called ONLY after Login.jsx successfully verifies:

     1. Supabase Auth
     2. Company Code
     3. Membership
     4. Company Status

     Full user object localStorage me save nahi hota.
  ========================================================= */

  const handleLoginSuccess =
    useCallback(
      (
        authenticatedUser
      ) => {

        if (
          !authenticatedUser?.id
        ) {
          return;
        }

        /* PLATFORM ADMIN */

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

     Dashboard se supplied object ko blindly authentication
     authority nahi banayenge.

     DB se fresh authorized context re-read karenge.
  ========================================================= */

  const handleUserUpdate =
    useCallback(
      async () => {

        await refreshCurrentContext();

      },
      [refreshCurrentContext]
    );

  /* =========================================================
     SESSION LOADING
  ========================================================= */

  if (isSessionLoading) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[#050914] font-sans text-white">

        <div className="flex flex-1 items-center justify-center">

          <div className="flex flex-col items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-xs font-black shadow-lg shadow-cyan-500/20">
              BF
            </div>

            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/25 border-t-cyan-300" />

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Restoring Secure Session...
            </p>

          </div>

        </div>

        <footer className="border-t border-white/[0.05] px-4 py-3 text-center">

          <p className="text-[8px] text-slate-500 sm:text-[9px]">

            Copyright by{' '}

            <span className="font-bold text-slate-300">
              BUDDY COMPUTERS
            </span>

            . All rights reserved.

          </p>

          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-[8px]">

            DESIGNED BY{' '}

            <a
              href="https://www.instagram.com/happiest_banda"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline"
            >
              SHUBHAM JANGIR
            </a>

          </p>

        </footer>

      </div>
    );
  }

  /* =========================================================
     ROUTES
  ========================================================= */

  return (
    <BrowserRouter>

      <ScrollToTop />

      <Routes>

        {/* ===================================================
            PUBLIC WEBSITE
        =================================================== */}

        <Route
          element={
            <WebsiteLayout />
          }
        >

          <Route
            path="/"
            element={
              <Home />
            }
          />

          <Route
            path="/features"
            element={
              <Features />
            }
          />

          <Route
            path="/about"
            element={
              <AboutUs />
            }
          />

          <Route
            path="/contact"
            element={
              <ContactUs />
            }
          />

        </Route>

        {/* ===================================================
            LOGIN
        =================================================== */}

        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <Login
                onLoginSuccess={
                  handleLoginSuccess
                }
              />
            )
          }
        />

        {/* ===================================================
            SIGNUP

            Signup successful hone par auto login NAHI hoga.
            Trial email confirmation ke baad activate hoga.
        =================================================== */}

        <Route
          path="/signup"
          element={
            currentUser ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <Signup />
            )
          }
        />

        {/* ===================================================
            FORGOT PASSWORD

            File ka naam abhi ForgotID.jsx retain hai.
            UI/logic Forgot Password only hai.
        =================================================== */}

        <Route
          path="/forgot-id"
          element={
            currentUser ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <ForgotID />
            )
          }
        />

        {/* FRIENDLY FUTURE ALIAS */}

        <Route
          path="/forgot-password"
          element={
            currentUser ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <ForgotID />
            )
          }
        />

        {/* ===================================================
            EMAIL CONFIRMATION

            Is route ko currentUser ke basis par block nahi
            karenge because Supabase confirmation redirect
            temporary session create kar sakta hai.
        =================================================== */}

        <Route
          path="/confirm"
          element={
            <ConfirmationPage />
          }
        />

        {/* OLD REDIRECT COMPATIBILITY */}

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
            !currentUser ? (

              <Navigate
                to="/login"
                replace
              />

            ) : currentUser
                .isPlatformAdmin ? (

              /* ---------------------------------------------
                 ONLY PLATFORM SUPER ADMIN
                 gets SuperAdminDashboard.
              --------------------------------------------- */

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

            ) : (

              /*
                Customer ko SuperAdminDashboard kabhi nahi.

                Company Dashboard ready hone tak safe
                customer placeholder.
              */

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