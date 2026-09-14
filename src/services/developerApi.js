/* ============================================================
   BUDDY FLEETS
   DEVELOPER PORTAL API CLIENT

   Frontend helper only.
   Authentication authority remains the HttpOnly portal session.
============================================================ */


async function readJsonSafely(response) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}


async function developerRequest(
  path,
  options = {}
) {
  let response;

  try {
    response =
      await fetch(
        path,
        {
          ...options,

          credentials:
            'include',

          cache:
            'no-store',

          headers: {
            Accept:
              'application/json',

            ...(options.headers || {}),
          },

          referrerPolicy:
            'no-referrer',
        }
      );
  } catch {
    return {
      ok: false,
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }


  const data =
    await readJsonSafely(
      response
    );


  return {
    ...data,

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
  };
}


export async function getDeveloperOverview() {
  return await developerRequest(
    '/api/developer/overview',
    {
      method: 'GET',
    }
  );
}