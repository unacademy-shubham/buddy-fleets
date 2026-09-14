import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../server/auth/requireDeveloperSession.js';


/* ============================================================
   BUDDY FLEETS
   DEVELOPER PORTAL — OVERVIEW API

   GET /api/developer/overview
============================================================ */


function sendJson(
  res,
  status,
  payload
) {
  setDeveloperApiHeaders(
    res
  );

  return res
    .status(status)
    .json(payload);
}


async function getCount(
  supabase,
  table,
  configure = null
) {
  let query =
    supabase
      .from(table)
      .select(
        'id',
        {
          count: 'exact',
          head: true,
        }
      );

  if (configure) {
    query =
      configure(query);
  }

  const {
    count,
    error,
  } =
    await query;

  if (error) {
    throw error;
  }

  return count || 0;
}


export default async function handler(
  req,
  res
) {
  setDeveloperApiHeaders(
    res
  );


  if (
    req.method !==
    'GET'
  ) {
    return sendJson(
      res,
      405,
      {
        ok: false,
        code:
          'METHOD_NOT_ALLOWED',
      }
    );
  }


  /* ========================================================
     DEVELOPER AUTHORIZATION
  ======================================================== */

  const auth =
    await requireDeveloperSession(
      req
    );


  if (
    !auth.ok
  ) {
    if (
      auth.clearCookie
    ) {
      clearDeveloperSessionCookie(
        res
      );
    }

    return sendJson(
      res,
      auth.status || 401,
      {
        ok: false,
        code:
          auth.code ||
          'UNAUTHORIZED',
      }
    );
  }


  const {
    supabaseAdmin,
  } =
    auth;


  try {
    /* ======================================================
       COUNTS
    ====================================================== */

    const [
      totalCompanies,
      activeCompanies,
      trialCompanies,
      expiredTrials,
      pendingCompanies,
      totalUsers,
      activeTeamMembers,
      activeSessions,
      lockedAccounts,
      activeSubscriptions,
      activeTrials,
    ] =
      await Promise.all([

        getCount(
          supabaseAdmin,
          'companies'
        ),

        getCount(
          supabaseAdmin,
          'companies',
          (query) =>
            query.eq(
              'status',
              'active'
            )
        ),

        getCount(
          supabaseAdmin,
          'companies',
          (query) =>
            query.eq(
              'status',
              'trial_active'
            )
        ),

        getCount(
          supabaseAdmin,
          'companies',
          (query) =>
            query.eq(
              'status',
              'trial_expired'
            )
        ),

        getCount(
          supabaseAdmin,
          'companies',
          (query) =>
            query.eq(
              'status',
              'pending_confirmation'
            )
        ),

        getCount(
          supabaseAdmin,
          'profiles'
        ),

        getCount(
          supabaseAdmin,
          'platform_team_members',
          (query) =>
            query.eq(
              'status',
              'active'
            )
        ),

        getCount(
          supabaseAdmin,
          'security_sessions',
          (query) =>
            query.eq(
              'status',
              'active'
            )
        ),

        getCount(
          supabaseAdmin,
          'user_security',
          (query) =>
            query.eq(
              'is_locked',
              true
            )
        ),

        getCount(
          supabaseAdmin,
          'subscriptions',
          (query) =>
            query.eq(
              'status',
              'active'
            )
        ),

        getCount(
          supabaseAdmin,
          'subscriptions',
          (query) =>
            query.eq(
              'status',
              'trial_active'
            )
        ),
      ]);


    /* ======================================================
       RECENT SECURITY EVENTS
    ====================================================== */

    const {
      data:
        securityEvents,

      error:
        securityEventsError,
    } =
      await supabaseAdmin
        .from(
          'security_events'
        )
        .select(`
          id,
          user_id,
          company_id,
          event_type,
          portal_type,
          ip_address,
          metadata,
          created_at
        `)
        .order(
          'created_at',
          {
            ascending: false,
          }
        )
        .limit(5);


    if (
      securityEventsError
    ) {
      throw securityEventsError;
    }


    /* ======================================================
       RECENT AUDIT LOGS
    ====================================================== */

    const {
      data:
        auditLogs,

      error:
        auditLogsError,
    } =
      await supabaseAdmin
        .from(
          'audit_logs'
        )
        .select(`
          id,
          company_id,
          actor_user_id,
          action,
          entity_type,
          entity_id,
          details,
          created_at
        `)
        .order(
          'created_at',
          {
            ascending: false,
          }
        )
        .limit(5);


    if (
      auditLogsError
    ) {
      throw auditLogsError;
    }


    /* ======================================================
       RESPONSE
    ====================================================== */

    return sendJson(
      res,
      200,
      {
        ok: true,

        generatedAt:
          new Date()
            .toISOString(),

        metrics: {
          companies: {
            total:
              totalCompanies,

            active:
              activeCompanies,

            trialActive:
              trialCompanies,

            trialExpired:
              expiredTrials,

            pendingConfirmation:
              pendingCompanies,
          },

          users: {
            total:
              totalUsers,

            activeTeamMembers,
          },

          subscriptions: {
            active:
              activeSubscriptions,

            trials:
              activeTrials,
          },

          security: {
            activeSessions,
            lockedAccounts,

            status:
              lockedAccounts > 0
                ? 'attention'
                : 'healthy',
          },
        },

        recent: {
          securityEvents:
            securityEvents || [],

          auditLogs:
            auditLogs || [],
        },
      }
    );
  } catch (error) {
    console.error(
      'Developer overview API failed:',
      error?.message
    );


    return sendJson(
      res,
      500,
      {
        ok: false,
        code:
          'DEVELOPER_OVERVIEW_FAILED',
      }
    );
  }
}