/* ============================================================
   BUDDY FLEETS — AUTHORITATIVE SERVER SESSION POLICY

   Keep server-side session timing in one place. Browser code must consume
   the server-returned expiry instead of inventing an independent timeout.
============================================================ */

export const PORTAL_SESSION_COOKIE = '__Host-bf_session';

export const SESSION_IDLE_TIMEOUT_MINUTES = 30;
export const SESSION_IDLE_TIMEOUT_SECONDS =
  SESSION_IDLE_TIMEOUT_MINUTES * 60;
export const SESSION_IDLE_TIMEOUT_MS =
  SESSION_IDLE_TIMEOUT_SECONDS * 1000;

/* Refresh shortly before JWT expiry so a token cannot expire midway through
   a protected server request. */
export const AUTH_REFRESH_SKEW_SECONDS = 120;
