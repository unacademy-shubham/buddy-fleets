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
import DeveloperLayout from './layouts/DeveloperLayout';

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

const DeveloperDashboard = lazy(() =>
  import('./pages/Dashboard/DeveloperDashboard')
);

const DeveloperActivity = lazy(() =>
  import('./pages/Developer/DeveloperActivity')
);

const DeveloperWebsiteStudio = lazy(() =>
  import('./pages/Developer/WebsiteStudio')
);

const DeveloperPageBuilder = lazy(() =>
  import('./pages/Developer/Website/PageBuilder')
);

const DeveloperWebsitePreview = lazy(() =>
  import('./pages/Developer/Website/WebsitePreview')
);

const DeveloperContentSeo = lazy(() =>
  import('./pages/Developer/ContentSeo')
);

const DeveloperWebsiteEnquiries = lazy(() =>
  import('./pages/Developer/WebsiteEnquiries')
);

const DeveloperCompanies = lazy(() =>
  import('./pages/Developer/Companies')
);

const DeveloperEntitlements = lazy(() =>
  import('./pages/Developer/Entitlements')
);

const DeveloperModules = lazy(() =>
  import('./pages/Developer/Modules')
);

const DeveloperTeam = lazy(() =>
  import('./pages/Developer/Team')
);

const DeveloperStudio = lazy(() =>
  import('./pages/Developer/DeveloperStudio')
);

const DeveloperWorkflowBuilder = lazy(() =>
  import('./pages/Developer/WorkflowBuilder')
);

const DeveloperIntegrations = lazy(() =>
  import('./pages/Developer/Integrations')
);

const DeveloperFeatureFlags = lazy(() =>
  import('./pages/Developer/FeatureFlags')
);

const DeveloperSecurity = lazy(() =>
  import('./pages/Developer/Security')
);

const DeveloperAudit = lazy(() =>
  import('./pages/Developer/Audit')
);

const DeveloperInfrastructure = lazy(() =>
  import('./pages/Developer/Infrastructure')
);

const DeveloperSystem = lazy(() =>
  import('./pages/Developer/System')
);


/* =========================================================
   ADDITIONAL DEVELOPER CPANEL PAGES

   Dedicated pages for the new second/third-level Developer
   navigation items. Existing auth, portal and session logic
   remains unchanged.
========================================================= */

const DeveloperTrialsRenewals = lazy(() =>
  import('./pages/Developer/Companies/TrialsRenewalsPage')
);

const DeveloperCompanyOverrides = lazy(() =>
  import('./pages/Developer/Companies/CompanyOverridesPage')
);

const DeveloperPlans = lazy(() =>
  import('./pages/Developer/Entitlements/PlansPage')
);

const DeveloperLimitsAccess = lazy(() =>
  import('./pages/Developer/Entitlements/LimitsAccessPage')
);

const DeveloperRenewalPolicy = lazy(() =>
  import('./pages/Developer/Entitlements/RenewalPolicyPage')
);

const DeveloperModuleRegistryPage = lazy(() =>
  import('./pages/Developer/Modules/ModuleRegistryPage')
);

const DeveloperModuleDependencies = lazy(() =>
  import('./pages/Developer/Modules/DependenciesPage')
);

const DeveloperModuleRolloutState = lazy(() =>
  import('./pages/Developer/Modules/RolloutStatePage')
);

const DeveloperTeamMembers = lazy(() =>
  import('./pages/Developer/Team/TeamMembersPage')
);

const DeveloperRolesPermissions = lazy(() =>
  import('./pages/Developer/Team/RolesPermissionsPage')
);

const DeveloperPortalAccess = lazy(() =>
  import('./pages/Developer/Team/PortalAccessPage')
);

const DeveloperModuleBuilderPage = lazy(() =>
  import('./pages/Developer/DeveloperStudio/ModuleBuilderPage')
);

const DeveloperSchemasFields = lazy(() =>
  import('./pages/Developer/DeveloperStudio/SchemasFieldsPage')
);

const DeveloperViewsForms = lazy(() =>
  import('./pages/Developer/DeveloperStudio/ViewsFormsPage')
);

const DeveloperModulePermissions = lazy(() =>
  import('./pages/Developer/DeveloperStudio/PermissionsPage')
);

const DeveloperPublishRollback = lazy(() =>
  import('./pages/Developer/DeveloperStudio/PublishRollbackPage')
);

const DeveloperWorkflowBuilderPage = lazy(() =>
  import('./pages/Developer/DeveloperStudio/WorkflowBuilderPage')
);

const DeveloperWorkflowTriggers = lazy(() =>
  import('./pages/Developer/DeveloperStudio/TriggersPage')
);

const DeveloperWorkflowConditions = lazy(() =>
  import('./pages/Developer/DeveloperStudio/ConditionsPage')
);

const DeveloperWorkflowApprovals = lazy(() =>
  import('./pages/Developer/DeveloperStudio/ApprovalsPage')
);

const DeveloperWorkflowActions = lazy(() =>
  import('./pages/Developer/DeveloperStudio/ActionsPage')
);

const DeveloperIntegrationProviders = lazy(() =>
  import('./pages/Developer/Integrations/ProvidersPage')
);

const DeveloperWebhooks = lazy(() =>
  import('./pages/Developer/Integrations/WebhooksPage')
);

const DeveloperApiHealth = lazy(() =>
  import('./pages/Developer/Integrations/ApiHealthPage')
);

const DeveloperSecurityCenterPage = lazy(() =>
  import('./pages/Developer/Security/SecurityCenterPage')
);

const DeveloperAuthSessions = lazy(() =>
  import('./pages/Developer/Security/AuthSessionsPage')
);

const DeveloperMfaLocks = lazy(() =>
  import('./pages/Developer/Security/MfaLocksPage')
);

const DeveloperPrivilegedAccess = lazy(() =>
  import('./pages/Developer/Security/PrivilegedAccessPage')
);

const DeveloperSecurityEvents = lazy(() =>
  import('./pages/Developer/Security/SecurityEventsPage')
);

const DeveloperServiceHealth = lazy(() =>
  import('./pages/Developer/Infrastructure/ServiceHealthPage')
);

const DeveloperDeployments = lazy(() =>
  import('./pages/Developer/Infrastructure/DeploymentsPage')
);

const DeveloperDatabaseApis = lazy(() =>
  import('./pages/Developer/Infrastructure/DatabaseApisPage')
);

const DeveloperPlatformDefaults = lazy(() =>
  import('./pages/Developer/System/PlatformDefaultsPage')
);

const DeveloperNotifications = lazy(() =>
  import('./pages/Developer/System/NotificationsPage')
);

const DeveloperRetentionPrivacy = lazy(() =>
  import('./pages/Developer/System/RetentionPrivacyPage')
);

const DeveloperApiPolicy = lazy(() =>
  import('./pages/Developer/System/ApiPolicyPage')
);


/* =========================================================
   FINAL PORTAL ARCHITECTURE

   Main website:
   buddyfleets.in

   Fixed portals:
   developer.buddyfleets.in
   team.buddyfleets.in
   portal.buddyfleets.in/{companySlug}/...

   IMPORTANT:
   - Browser-side Supabase session restore is intentionally removed.
   - Portal authentication authority is /api/auth/session.
   - Company authorization authority is server-side company_id.
   - URL companySlug is routing identity only.
========================================================= */

const MAIN_HOST =
  'buddyfleets.in';

const WWW_HOST =
  'www.buddyfleets.in';

const DEVELOPER_HOST =
  'developer.buddyfleets.in';

const TEAM_HOST =
  'team.buddyfleets.in';

const COMPANY_PORTAL_HOST =
  'portal.buddyfleets.in';

const SECURE_LOGIN_URL =
  'https://buddyfleets.in/login';


/* =========================================================
   LOCAL APP STORAGE

   These values are UI/runtime helpers only.
   None of them authorize access.
========================================================= */

const LEGACY_SESSION_KEY =
  'buddy_fleets_session';

const ACTIVE_COMPANY_KEY =
  'buddy_fleets_active_company';

const LAST_ACTIVITY_KEY =
  'buddy_fleets_last_activity';

const ACTIVE_TAB_KEY =
  'buddy_fleets_active_tab';

const PORTAL_BOOTSTRAP_KEY =
  'buddy_fleets_portal_bootstrap';

const PORTAL_BOOTSTRAP_MAX_AGE_MS =
  15 * 1000;

const INACTIVITY_TIMEOUT_MS =
  30 * 60 * 1000;

const ACTIVITY_THROTTLE_MS =
  15 * 1000;

const PORTAL_SESSION_RETRY_MS =
  2500;


/* =========================================================
   HOST HELPERS
========================================================= */

function normalizeHost(
  value
) {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase()
    .replace(
      /:\d+$/,
      ''
    );
}


function getCurrentHost() {
  if (
    typeof window ===
    'undefined'
  ) {
    return '';
  }

  return normalizeHost(
    window.location.hostname
  );
}


function getPortalTypeFromHost(
  host
) {
  const normalized =
    normalizeHost(
      host
    );

  if (
    normalized ===
    DEVELOPER_HOST
  ) {
    return 'developer';
  }

  if (
    normalized ===
    TEAM_HOST
  ) {
    return 'team';
  }

  if (
    normalized ===
    COMPANY_PORTAL_HOST
  ) {
    return 'company';
  }

  return null;
}


function isMainSiteHost(
  host
) {
  const normalized =
    normalizeHost(
      host
    );

  if (
    normalized ===
      MAIN_HOST ||
    normalized ===
      WWW_HOST
  ) {
    return true;
  }

  /*
    Local development / preview falls back to the main-site
    routing surface. Portal security still remains enforced by
    the server APIs on the real fixed portal hosts.
  */

  return (
    normalized ===
      'localhost' ||
    normalized ===
      '127.0.0.1' ||
    normalized.endsWith(
      '.vercel.app'
    )
  );
}


function normalizeCompanySlug(
  value
) {
  const slug =
    String(
      value || ''
    )
      .trim()
      .toLowerCase();

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/
      .test(
        slug
      )
  ) {
    return '';
  }

  if (
    slug.length >
      120
  ) {
    return '';
  }

  return slug;
}


/* =========================================================
   SAFE JSON
========================================================= */

async function readJsonSafely(
  response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return {};
  }
}


/* =========================================================
   SERVER SESSION API
========================================================= */

async function fetchPortalSession() {
  let response;

  try {
    response =
      await fetch(
        '/api/auth/session',
        {
          method:
            'GET',

          credentials:
            'include',

          cache:
            'no-store',

          headers: {
            Accept:
              'application/json',
          },

          referrerPolicy:
            'no-referrer',
        }
      );
  } catch {
    return {
      ok:
        false,

      status:
        0,

      code:
        'NETWORK_ERROR',
    };
  }

  const data =
    await readJsonSafely(
      response
    );

  return {
    ok:
      Boolean(
        response.ok &&
        data?.ok
      ),

    status:
      response.status,

    code:
      data?.code ||
      null,

    currentUser:
      data?.currentUser ||
      null,

    session:
      data?.session ||
      null,
  };
}


function isDefinitiveSessionRejection(
  result
) {
  return [
    401,
    403,
    423,
  ].includes(
    Number(
      result?.status ||
      0
    )
  );
}


async function requestPortalLogout() {
  try {
    const response =
      await fetch(
        '/api/auth/logout',
        {
          method:
            'POST',

          credentials:
            'include',

          cache:
            'no-store',

          keepalive:
            true,

          headers: {
            Accept:
              'application/json',
          },

          referrerPolicy:
            'no-referrer',
        }
      );

    return {
      ok:
        response.ok,
    };
  } catch {
    return {
      ok:
        false,
    };
  }
}


/* =========================================================
   CURRENT USER / HOST CONSISTENCY
========================================================= */

function isUserAllowedOnCurrentHost({
  currentUser,
  portalType,
}) {
  if (
    !currentUser ||
    !portalType
  ) {
    return false;
  }

  if (
    currentUser.portalType !==
    portalType
  ) {
    return false;
  }

  if (
    portalType ===
    'developer'
  ) {
    return (
      currentUser
        .isPlatformAdmin ===
      true
    );
  }

  if (
    portalType ===
    'team'
  ) {
    return (
      currentUser.userType ===
      'platform_team'
    );
  }

  if (
    portalType ===
    'company'
  ) {
    return Boolean(
      currentUser.companyId &&
      normalizeCompanySlug(
        currentUser.companySlug
      )
    );
  }

  return false;
}


/* =========================================================
   SAFE POST-LOGIN PORTAL BOOTSTRAP

   UI acceleration only.

   IMPORTANT:
   - No Supabase token
   - No refresh token
   - No cookie value
   - Server session remains authoritative
========================================================= */

function consumePortalBootstrap({
  portalType,
}) {
  if (
    !portalType
  ) {
    return null;
  }

  try {
    const raw =
      sessionStorage.getItem(
        PORTAL_BOOTSTRAP_KEY
      );

    /*
      One-time bootstrap.
      Remove immediately even if validation fails.
    */

    sessionStorage.removeItem(
      PORTAL_BOOTSTRAP_KEY
    );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(
        raw
      );

    const createdAt =
      Number(
        parsed?.createdAt ||
        0
      );

    const expiresAt =
      Number(
        parsed?.expiresAt ||
        0
      );

    const now =
      Date.now();

    if (
      !Number.isFinite(
        createdAt
      ) ||
      !Number.isFinite(
        expiresAt
      ) ||
      createdAt <= 0 ||
      expiresAt <= now ||
      createdAt >
        now + 5000 ||
      now - createdAt >
        PORTAL_BOOTSTRAP_MAX_AGE_MS
    ) {
      return null;
    }

    const currentUser =
      parsed?.currentUser ||
      null;

    if (
      !isUserAllowedOnCurrentHost({
        currentUser,
        portalType,
      })
    ) {
      return null;
    }

    const session =
      parsed?.session ||
      null;

    if (
      session?.portalType &&
      session.portalType !==
        portalType
    ) {
      return null;
    }

    if (
      portalType ===
      'company'
    ) {
      const userSlug =
        normalizeCompanySlug(
          currentUser
            ?.companySlug
        );

      const sessionSlug =
        normalizeCompanySlug(
          session
            ?.companySlug
        );

      if (
        !userSlug ||
        (
          sessionSlug &&
          sessionSlug !==
            userSlug
        )
      ) {
        return null;
      }
    }

    return {
      currentUser,
      session,
      createdAt,
      expiresAt,
    };
  } catch {
    try {
      sessionStorage.removeItem(
        PORTAL_BOOTSTRAP_KEY
      );
    } catch {
      // Non-critical.
    }

    return null;
  }
}


function clearPortalBootstrap() {
  try {
    sessionStorage.removeItem(
      PORTAL_BOOTSTRAP_KEY
    );
  } catch {
    // Non-critical.
  }
}


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
   TEAM DASHBOARD TEMPORARY GATE
========================================================= */

function TeamDashboardPending({
  currentUser,
  onLogout,
}) {
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
            Secure Team Workspace
          </p>

          <h1
            className="
              mt-2
              text-2xl
              font-black
              sm:text-3xl
            "
          >
            Buddy Fleets Team Portal
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
            Your secure team authentication is active. The role-aware
            internal workspace will be connected here in the next
            development phase.
          </p>

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
                Portal
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  font-bold
                  text-cyan-300
                "
              >
                TEAM
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
    </div>
  );
}


/* =========================================================
   TEMPORARY PORTAL SESSION ERROR

   IMPORTANT:
   A network / 5xx failure is NOT treated as logout.
========================================================= */

function PortalSessionUnavailable({
  onRetry,
}) {
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
        text-white
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-[24px]
          border
          border-white/10
          bg-[#07101f]/95
          p-6
          text-center
          shadow-2xl
          shadow-black/40
        "
      >
        <div
          className="
            mx-auto
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
          "
        >
          BF
        </div>

        <h1
          className="
            mt-4
            text-lg
            font-black
          "
        >
          Secure session check delayed
        </h1>

        <p
          className="
            mt-2
            text-xs
            leading-5
            text-slate-400
          "
        >
          Your portal session could not be verified right now.
          You have not been logged out.
        </p>

        <button
          type="button"
          onClick={
            onRetry
          }
          className="
            mt-5
            rounded-xl
            border
            border-cyan-400/20
            bg-cyan-400/[0.08]
            px-5
            py-2.5
            text-xs
            font-bold
            text-cyan-300
            hover:bg-cyan-400/[0.12]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-cyan-400/50
          "
        >
          Retry secure check
        </button>
      </div>
    </div>
  );
}


/* =========================================================
   EXTERNAL REDIRECT
========================================================= */

function ExternalRedirect({
  to,
}) {
  useEffect(
    () => {
      window.location.replace(
        to
      );
    },
    [
      to,
    ]
  );

  return (
    <FullScreenLoader />
  );
}


/* =========================================================
   MAIN WEBSITE ROUTES
========================================================= */

function MainWebsiteRoutes() {
  return (
    <Routes>
      <Route
        element={
          <WebsiteLayout />
        }
      >
        <Route
          path="/"
          element={
            <LazyPage>
              <Home />
            </LazyPage>
          }
        />

        <Route
          path="/features"
          element={
            <LazyPage>
              <Features />
            </LazyPage>
          }
        />

        <Route
          path="/pricing"
          element={
            <LazyPage>
              <Pricing />
            </LazyPage>
          }
        />

        <Route
          path="/about"
          element={
            <LazyPage>
              <AboutUs />
            </LazyPage>
          }
        />

        <Route
          path="/contact-us"
          element={
            <LazyPage>
              <ContactUs />
            </LazyPage>
          }
        />

        <Route
          path="/login"
          element={
            <LazyPage>
              <Login />
            </LazyPage>
          }
        />

        <Route
          path="/signup"
          element={
            <LazyPage>
              <Signup />
            </LazyPage>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <LazyPage>
              <ForgotID />
            </LazyPage>
          }
        />

        <Route
          path="/confirm"
          element={
            <LazyPage>
              <ConfirmationPage />
            </LazyPage>
          }
        />

        <Route
          path="/reset-password"
          element={
            <LazyPage>
              <ResetPassword />
            </LazyPage>
          }
        />
      </Route>

      <Route
        path="/contact"
        element={
          <LegacyContactRedirect />
        }
      />

      <Route
        path="/forgot-id"
        element={
          <LegacyForgotRedirect />
        }
      />

      <Route
        path="/auth/confirmation"
        element={
          <LegacyConfirmationRedirect />
        }
      />

      <Route
        path="/auth/callback"
        element={
          <Navigate
            replace
            to="/login"
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <Navigate
            replace
            to="/login"
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            replace
            to="/"
          />
        }
      />
    </Routes>
  );
}


/* =========================================================
   PORTAL ROUTES
========================================================= */

function PortalRoutes({
  portalType,
  currentUser,
  sessionState,
  onRetrySession,
  onLogout,
  onUserUpdate,
}) {
  const location =
    useLocation();

  const authoritativeCompanySlug =
    normalizeCompanySlug(
      currentUser
        ?.companySlug
    );

  const pathSegments =
    location.pathname
      .split('/')
      .filter(Boolean);

  const requestedCompanySlug =
    portalType ===
      'company'
      ? normalizeCompanySlug(
          pathSegments[0]
        )
      : '';


  /* =======================================================
     SESSION STATE
  ======================================================= */

  if (
    sessionState ===
      'checking' ||
    sessionState ===
      'idle'
  ) {
    return (
      <FullScreenLoader />
    );
  }


  if (
    sessionState ===
    'temporary-error'
  ) {
    return (
      <PortalSessionUnavailable
        onRetry={
          onRetrySession
        }
      />
    );
  }


  if (
    sessionState ===
      'unauthenticated' ||
    !currentUser
  ) {
    return (
      <ExternalRedirect
        to={
          SECURE_LOGIN_URL
        }
      />
    );
  }


  if (
    !isUserAllowedOnCurrentHost({
      currentUser,
      portalType,
    })
  ) {
    return (
      <ExternalRedirect
        to={
          SECURE_LOGIN_URL
        }
      />
    );
  }


  /* =======================================================
     DEVELOPER

     Routed Developer CPanel:
     - URL-driven navigation
     - Dedicated DeveloperLayout shell
     - Secure server session remains authoritative
  ======================================================= */

  if (
    portalType ===
    'developer'
  ) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              replace
              to="/dashboard"
            />
          }
        />

        <Route
          path="website-preview/:pageId"
          element={
            <LazyPage>
              <DeveloperWebsitePreview />
            </LazyPage>
          }
        />

        <Route
          element={
            <DeveloperLayout
              currentUser={
                currentUser
              }
              onLogout={
                onLogout
              }
            />
          }
        >
          <Route
            path="dashboard"
            element={
              <LazyPage>
                <DeveloperDashboard
                  currentUser={currentUser}
                  onLogout={onLogout}
                  onUserUpdate={onUserUpdate}
                />
              </LazyPage>
            }
          />

          <Route
            path="dashboard/live-activity"
            element={
              <LazyPage>
                <DeveloperActivity />
              </LazyPage>
            }
          />

          <Route
            path="website/website-studio"
            element={
              <LazyPage>
                <DeveloperWebsiteStudio />
              </LazyPage>
            }
          />

          <Route
            path="website/content-seo"
            element={
              <LazyPage>
                <DeveloperContentSeo />
              </LazyPage>
            }
          />

          <Route
            path="website/website-enquiries"
            element={
              <LazyPage>
                <DeveloperWebsiteEnquiries />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/companies"
            element={
              <LazyPage>
                <DeveloperCompanies />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/plans-entitlements"
            element={
              <LazyPage>
                <DeveloperEntitlements />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/module-registry"
            element={
              <LazyPage>
                <DeveloperModules />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/team-roles"
            element={
              <LazyPage>
                <DeveloperTeam />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio"
            element={
              <LazyPage>
                <DeveloperStudio />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/workflow-builder"
            element={
              <LazyPage>
                <DeveloperWorkflowBuilder />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/integrations"
            element={
              <LazyPage>
                <DeveloperIntegrations />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/feature-flags"
            element={
              <LazyPage>
                <DeveloperFeatureFlags />
              </LazyPage>
            }
          />

          <Route
            path="security-system/security-center"
            element={
              <LazyPage>
                <DeveloperSecurity />
              </LazyPage>
            }
          />

          <Route
            path="security-system/audit-logs"
            element={
              <LazyPage>
                <DeveloperAudit />
              </LazyPage>
            }
          />

          <Route
            path="security-system/infrastructure"
            element={
              <LazyPage>
                <DeveloperInfrastructure />
              </LazyPage>
            }
          />

          <Route
            path="security-system/system-settings"
            element={
              <LazyPage>
                <DeveloperSystem />
              </LazyPage>
            }
          />


          {/* =====================================================
              ADDITIONAL DEVELOPER CPANEL ROUTES

              These routes live inside the existing DeveloperLayout,
              so the existing secure developer portal/session gate
              remains authoritative and unchanged.
          ===================================================== */}

          <Route
            path="saas-platform/companies/trials-renewals"
            element={
              <LazyPage>
                <DeveloperTrialsRenewals />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/companies/company-overrides"
            element={
              <LazyPage>
                <DeveloperCompanyOverrides />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/plans-entitlements/plans"
            element={
              <LazyPage>
                <DeveloperPlans />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/plans-entitlements/limits-access"
            element={
              <LazyPage>
                <DeveloperLimitsAccess />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/plans-entitlements/renewal-policy"
            element={
              <LazyPage>
                <DeveloperRenewalPolicy />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/module-registry/modules"
            element={
              <LazyPage>
                <DeveloperModuleRegistryPage />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/module-registry/dependencies"
            element={
              <LazyPage>
                <DeveloperModuleDependencies />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/module-registry/rollout-state"
            element={
              <LazyPage>
                <DeveloperModuleRolloutState />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/team-roles/team-members"
            element={
              <LazyPage>
                <DeveloperTeamMembers />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/team-roles/roles-permissions"
            element={
              <LazyPage>
                <DeveloperRolesPermissions />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/team-roles/portal-access"
            element={
              <LazyPage>
                <DeveloperPortalAccess />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/module-builder"
            element={
              <LazyPage>
                <DeveloperModuleBuilderPage />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/module-builder/schemas-fields"
            element={
              <LazyPage>
                <DeveloperSchemasFields />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/module-builder/views-forms"
            element={
              <LazyPage>
                <DeveloperViewsForms />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/module-builder/permissions"
            element={
              <LazyPage>
                <DeveloperModulePermissions />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/module-builder/publish-rollback"
            element={
              <LazyPage>
                <DeveloperPublishRollback />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/workflow-builder"
            element={
              <LazyPage>
                <DeveloperWorkflowBuilderPage />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/workflow-builder/triggers"
            element={
              <LazyPage>
                <DeveloperWorkflowTriggers />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/workflow-builder/conditions"
            element={
              <LazyPage>
                <DeveloperWorkflowConditions />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/workflow-builder/approvals"
            element={
              <LazyPage>
                <DeveloperWorkflowApprovals />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/workflow-builder/actions"
            element={
              <LazyPage>
                <DeveloperWorkflowActions />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/integrations/providers"
            element={
              <LazyPage>
                <DeveloperIntegrationProviders />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/integrations/webhooks"
            element={
              <LazyPage>
                <DeveloperWebhooks />
              </LazyPage>
            }
          />

          <Route
            path="developer-studio/integrations/api-health"
            element={
              <LazyPage>
                <DeveloperApiHealth />
              </LazyPage>
            }
          />

          <Route
            path="security-system/security-center/overview"
            element={
              <LazyPage>
                <DeveloperSecurityCenterPage />
              </LazyPage>
            }
          />

          <Route
            path="security-system/security-center/auth-sessions"
            element={
              <LazyPage>
                <DeveloperAuthSessions />
              </LazyPage>
            }
          />

          <Route
            path="security-system/security-center/mfa-locks"
            element={
              <LazyPage>
                <DeveloperMfaLocks />
              </LazyPage>
            }
          />

          <Route
            path="security-system/security-center/privileged-access"
            element={
              <LazyPage>
                <DeveloperPrivilegedAccess />
              </LazyPage>
            }
          />

          <Route
            path="security-system/security-center/security-events"
            element={
              <LazyPage>
                <DeveloperSecurityEvents />
              </LazyPage>
            }
          />

          <Route
            path="security-system/infrastructure/service-health"
            element={
              <LazyPage>
                <DeveloperServiceHealth />
              </LazyPage>
            }
          />

          <Route
            path="security-system/infrastructure/deployments"
            element={
              <LazyPage>
                <DeveloperDeployments />
              </LazyPage>
            }
          />

          <Route
            path="security-system/infrastructure/database-apis"
            element={
              <LazyPage>
                <DeveloperDatabaseApis />
              </LazyPage>
            }
          />

          <Route
            path="security-system/system-settings/platform-defaults"
            element={
              <LazyPage>
                <DeveloperPlatformDefaults />
              </LazyPage>
            }
          />

          <Route
            path="security-system/system-settings/notifications"
            element={
              <LazyPage>
                <DeveloperNotifications />
              </LazyPage>
            }
          />

          <Route
            path="security-system/system-settings/retention-privacy"
            element={
              <LazyPage>
                <DeveloperRetentionPrivacy />
              </LazyPage>
            }
          />

          <Route
            path="security-system/system-settings/api-policy"
            element={
              <LazyPage>
                <DeveloperApiPolicy />
              </LazyPage>
            }
          />

          {/* Missing hierarchy URLs backed by existing parent pages. */}
          <Route
            path="website/website-studio/page-builder"
            element={
              <LazyPage>
                <DeveloperPageBuilder />
              </LazyPage>
            }
          />

          <Route
            path="website/website-studio/media-assets"
            element={
              <LazyPage>
                <DeveloperWebsiteStudio />
              </LazyPage>
            }
          />

          <Route
            path="website/website-studio/release-workflow"
            element={
              <LazyPage>
                <DeveloperWebsiteStudio />
              </LazyPage>
            }
          />

          <Route
            path="website/content-seo/metadata"
            element={
              <LazyPage>
                <DeveloperContentSeo />
              </LazyPage>
            }
          />

          <Route
            path="website/content-seo/indexing"
            element={
              <LazyPage>
                <DeveloperContentSeo />
              </LazyPage>
            }
          />

          <Route
            path="website/content-seo/ai-discoverability"
            element={
              <LazyPage>
                <DeveloperContentSeo />
              </LazyPage>
            }
          />

          <Route
            path="saas-platform/companies/all-companies"
            element={
              <LazyPage>
                <DeveloperCompanies />
              </LazyPage>
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              replace
              to="/dashboard"
            />
          }
        />
      </Routes>
    );
  }


  /* =======================================================
     TEAM
  ======================================================= */

  if (
    portalType ===
    'team'
  ) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              replace
              to="/dashboard"
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <TeamDashboardPending
              currentUser={
                currentUser
              }
              onLogout={
                onLogout
              }
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              replace
              to="/dashboard"
            />
          }
        />
      </Routes>
    );
  }


  /* =======================================================
     COMPANY
  ======================================================= */

  if (
    portalType ===
    'company'
  ) {
    if (
      !authoritativeCompanySlug
    ) {
      return (
        <ExternalRedirect
          to={
            SECURE_LOGIN_URL
          }
        />
      );
    }


    const authoritativeDashboardPath =
      `/${authoritativeCompanySlug}/dashboard`;


    if (
      location.pathname ===
      '/'
    ) {
      return (
        <Navigate
          replace
          to={
            authoritativeDashboardPath
          }
        />
      );
    }


    if (
      requestedCompanySlug !==
      authoritativeCompanySlug
    ) {
      return (
        <Navigate
          replace
          to={
            authoritativeDashboardPath
          }
        />
      );
    }


    return (
      <Routes>
        <Route
          path="/dashboard"
          element={
            <Navigate
              replace
              to={
                authoritativeDashboardPath
              }
            />
          }
        />

        <Route
          path="/:companySlug"
          element={
            <Navigate
              replace
              to={
                authoritativeDashboardPath
              }
            />
          }
        />

        <Route
          path="/:companySlug/dashboard"
          element={
            <CompanyDashboardPending
              currentUser={
                currentUser
              }
              onLogout={
                onLogout
              }
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              replace
              to={
                authoritativeDashboardPath
              }
            />
          }
        />
      </Routes>
    );
  }


  return (
    <ExternalRedirect
      to={
        SECURE_LOGIN_URL
      }
    />
  );
}


/* =========================================================
   APP ROUTER
========================================================= */

function AppRouter() {
  const location =
    useLocation();

  const currentHost =
    getCurrentHost();

  const portalType =
    getPortalTypeFromHost(
      currentHost
    );

  const mainSite =
    isMainSiteHost(
      currentHost
    );

  /* =========================================================
     FAST VERIFIED POST-LOGIN BOOTSTRAP

     The server-side /auth/callback has already verified the
     newly-created HttpOnly session before redirecting here.

     This only avoids showing the second loader.

     Server verification still runs silently in background.
  ========================================================= */

  const initialBootstrapRef =
    useRef(
      undefined
    );

  if (
    initialBootstrapRef.current ===
    undefined
  ) {
    initialBootstrapRef.current =
      consumePortalBootstrap({
        portalType,
      });
  }

  const initialBootstrap =
    initialBootstrapRef.current;


  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    () =>
      initialBootstrap
        ?.currentUser ||
      null
  );


  const [
    sessionState,
    setSessionState,
  ] = useState(
    () => {
      if (
        initialBootstrap
          ?.currentUser
      ) {
        return 'authenticated';
      }

      return (
        portalType
          ? 'checking'
          : 'idle'
      );
    }
  );


  const bootstrapNeedsRevalidationRef =
    useRef(
      Boolean(
        initialBootstrap
          ?.currentUser
      )
    );


  const currentUserRef =
    useRef(
      initialBootstrap
        ?.currentUser ||
      null
    );

  const sessionStateRef =
    useRef(
      sessionState
    );

  const inactivityTimerRef =
    useRef(
      null
    );

  const sessionRetryTimerRef =
    useRef(
      null
    );

  const sessionRequestRef =
    useRef(
      null
    );

  const lastActivityHandledRef =
    useRef(
      0
    );

  const mountedRef =
    useRef(
      true
    );


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

        if (
          sessionRetryTimerRef.current
        ) {
          window.clearTimeout(
            sessionRetryTimerRef.current
          );

          sessionRetryTimerRef.current =
            null;
        }
      };
    },
    []
  );


  /* =========================================================
     SYNC REFS
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


  useEffect(
    () => {
      sessionStateRef.current =
        sessionState;
    },
    [
      sessionState,
    ]
  );


  /* =========================================================
     CLEAR LOCAL UI CONTEXT
  ========================================================= */

  const clearLocalAppContext =
    useCallback(
      () => {
        try {
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
        } catch {
          // Non-critical.
        }

        clearPortalBootstrap();
      },
      []
    );


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout =
    useCallback(
      (
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

        if (
          sessionRetryTimerRef.current
        ) {
          window.clearTimeout(
            sessionRetryTimerRef.current
          );

          sessionRetryTimerRef.current =
            null;
        }

        /*
          Start the authoritative server logout immediately, but do
          not block the user's navigation on the network response.

          keepalive=true allows this same-origin POST to continue
          during document unload in supporting browsers.
        */
        void requestPortalLogout();

        clearLocalAppContext();

        if (
          mountedRef.current
        ) {
          setCurrentUser(
            null
          );

          setSessionState(
            'unauthenticated'
          );
        }

        currentUserRef.current =
          null;

        sessionStateRef.current =
          'unauthenticated';

        if (
          isAutoTimeout
        ) {
          console.info(
            'Buddy Fleets secure session ended due to inactivity.'
          );
        }

        window.location.replace(
          SECURE_LOGIN_URL
        );
      },
      [
        clearLocalAppContext,
      ]
    );


  /* =========================================================
     AUTHORITATIVE PORTAL SESSION RESTORE
  ========================================================= */

  const restorePortalSession =
    useCallback(
      async ({
        showLoader = false,

        preserveAuthenticatedOnTemporaryError =
          false,
      } = {}) => {
        if (
          !portalType
        ) {
          return null;
        }


        if (
          sessionRequestRef.current
        ) {
          return await sessionRequestRef.current;
        }


        if (
          showLoader &&
          mountedRef.current
        ) {
          setSessionState(
            'checking'
          );

          sessionStateRef.current =
            'checking';
        }


        const requestPromise =
          (async () => {
            const result =
              await fetchPortalSession();


            if (
              !mountedRef.current
            ) {
              return null;
            }


            if (
              result.ok &&
              result.currentUser &&
              isUserAllowedOnCurrentHost({
                currentUser:
                  result.currentUser,

                portalType,
              })
            ) {
              setCurrentUser(
                result.currentUser
              );

              setSessionState(
                'authenticated'
              );

              currentUserRef.current =
                result.currentUser;

              sessionStateRef.current =
                'authenticated';

              return result.currentUser;
            }


            if (
              isDefinitiveSessionRejection(
                result
              )
            ) {
              setCurrentUser(
                null
              );

              setSessionState(
                'unauthenticated'
              );

              currentUserRef.current =
                null;

              sessionStateRef.current =
                'unauthenticated';

              clearPortalBootstrap();

              return null;
            }


            const canPreserveAuthenticatedUi =
              Boolean(
                preserveAuthenticatedOnTemporaryError &&
                currentUserRef.current &&
                sessionStateRef.current ===
                  'authenticated'
              );


            if (
              !canPreserveAuthenticatedUi
            ) {
              setSessionState(
                'temporary-error'
              );

              sessionStateRef.current =
                'temporary-error';
            }


            if (
              sessionRetryTimerRef.current
            ) {
              window.clearTimeout(
                sessionRetryTimerRef.current
              );
            }


            sessionRetryTimerRef.current =
              window.setTimeout(
                () => {
                  sessionRetryTimerRef.current =
                    null;

                  restorePortalSession({
                    showLoader:
                      false,

                    preserveAuthenticatedOnTemporaryError:
                      canPreserveAuthenticatedUi,
                  });
                },
                PORTAL_SESSION_RETRY_MS
              );


            return null;
          })();


        sessionRequestRef.current =
          requestPromise;


        try {
          return await requestPromise;
        } finally {
          if (
            sessionRequestRef.current ===
            requestPromise
          ) {
            sessionRequestRef.current =
              null;
          }
        }
      },
      [
        portalType,
      ]
    );


  /* =========================================================
     INITIAL PORTAL SESSION RESTORE

     Fresh login:
     → dashboard instantly renders from verified bootstrap
     → server validation runs silently

     Refresh/direct URL:
     → no bootstrap
     → server verification happens before protected UI
  ========================================================= */

  useEffect(
    () => {
      if (
        !portalType
      ) {
        setCurrentUser(
          null
        );

        setSessionState(
          'idle'
        );

        currentUserRef.current =
          null;

        sessionStateRef.current =
          'idle';

        return;
      }


      if (
        bootstrapNeedsRevalidationRef.current
      ) {
        bootstrapNeedsRevalidationRef.current =
          false;


        restorePortalSession({
          showLoader:
            false,

          preserveAuthenticatedOnTemporaryError:
            true,
        });


        return;
      }


      restorePortalSession({
        showLoader:
          true,
      });
    },
    [
      portalType,
      restorePortalSession,
    ]
  );


  /* =========================================================
     BROWSER BACK / FORWARD CACHE PROTECTION
  ========================================================= */

  useEffect(
    () => {
      if (
        !portalType
      ) {
        return undefined;
      }


      const handlePageShow =
        (
          event
        ) => {
          if (
            event.persisted
          ) {
            restorePortalSession({
              showLoader:
                true,
            });
          }
        };


      window.addEventListener(
        'pageshow',
        handlePageShow
      );


      return () => {
        window.removeEventListener(
          'pageshow',
          handlePageShow
        );
      };
    },
    [
      portalType,
      restorePortalSession,
    ]
  );


  /* =========================================================
     SESSION REFRESH
  ========================================================= */

  const refreshCurrentContext =
    useCallback(
      async () => {
        return await restorePortalSession({
          showLoader:
            false,
        });
      },
      [
        restorePortalSession,
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
          remaining <=
          0
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


  const recordActivity =
    useCallback(
      () => {
        if (
          !currentUserRef.current ||
          sessionStateRef.current !==
            'authenticated'
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

        try {
          localStorage.setItem(
            LAST_ACTIVITY_KEY,
            String(
              now
            )
          );
        } catch {
          // Non-critical.
        }

        scheduleInactivityLogout(
          now
        );
      },
      [
        scheduleInactivityLogout,
      ]
    );


  /* =========================================================
     ACTIVITY LISTENERS
  ========================================================= */

  useEffect(
    () => {
      if (
        !portalType ||
        !currentUser ||
        sessionState !==
          'authenticated'
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

      let initialActivity =
        Date.now();

      try {
        const existing =
          Number(
            localStorage.getItem(
              LAST_ACTIVITY_KEY
            )
          );

        if (
          existing &&
          Number.isFinite(
            existing
          )
        ) {
          initialActivity =
            existing;
        } else {
          localStorage.setItem(
            LAST_ACTIVITY_KEY,
            String(
              initialActivity
            )
          );
        }
      } catch {
        // Non-critical.
      }

      if (
        Date.now() -
          initialActivity >=
        INACTIVITY_TIMEOUT_MS
      ) {
        handleLogout(
          true
        );

        return undefined;
      }

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
      handleLogout,
      portalType,
      recordActivity,
      scheduleInactivityLogout,
      sessionState,
    ]
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
     ROUTING SURFACES
  ========================================================= */

  return (
    <>
      <ScrollToTop />

      {portalType ? (
        <PortalRoutes
          portalType={
            portalType
          }
          currentUser={
            currentUser
          }
          sessionState={
            sessionState
          }
          onRetrySession={() =>
            restorePortalSession({
              showLoader:
                true,
            })
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
      ) : mainSite ? (
        <MainWebsiteRoutes />
      ) : (
        <ExternalRedirect
          to={
            `https://${MAIN_HOST}/`
          }
        />
      )}
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
