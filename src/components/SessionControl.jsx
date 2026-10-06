import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, ShieldAlert, WifiOff } from 'lucide-react';

import {
  clearSessionRuntime,
  getAuthoritativeNow,
  publishSessionInvalidated,
  publishSessionLogout,
  publishSessionUpdated,
  readSessionRuntime,
  runtimeFromServerPayload,
  subscribeSessionEvents,
  writeSessionRuntime,
} from '../services/sessionRuntime';

const TOUCH_THROTTLE_MS = 60 * 1000;
const SERVER_POLL_MS = 60 * 1000;
const EXPIRY_RECHECK_GRACE_MS = 5000;

const DEFINITIVE_SESSION_STATUSES = new Set([401, 403, 423]);

const SESSION_MESSAGES = {
  SESSION_EXPIRED: {
    title: 'Session expired',
    body: 'Your session ended after 30 minutes of inactivity. Log in again to continue.',
  },
  ACCOUNT_LOCKED: {
    title: 'Account locked',
    body: 'Your account is currently locked. Log in again after the account security issue is resolved.',
  },
  ACCESS_REVOKED: {
    title: 'Access changed',
    body: 'Your access to this portal is no longer available. Log in again if your access has been restored.',
  },
  MFA_AAL2_REQUIRED: {
    title: 'Security verification required',
    body: 'Your security requirements changed and this session can no longer continue. Please log in again.',
  },
  SESSION_INVALID: {
    title: 'Session ended',
    body: 'This secure session is no longer valid. Please log in again to continue.',
  },
  SESSION_REQUIRED: {
    title: 'Session ended',
    body: 'Your secure session is no longer available. Please log in again to continue.',
  },
};

function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function readResponseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function fetchSession() {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      referrerPolicy: 'no-referrer',
    });

    const data = await readResponseJson(response);

    return {
      ...data,
      status: response.status,
      ok: Boolean(response.ok && data?.ok),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }
}

async function touchSession() {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ action: 'TOUCH' }),
    });

    const data = await readResponseJson(response);

    return {
      ...data,
      status: response.status,
      ok: Boolean(response.ok && data?.ok),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }
}

function normalizeReason(result) {
  return String(result?.code || 'SESSION_INVALID').trim() || 'SESSION_INVALID';
}

export default function SessionControl({ showBadge = true }) {
  const [runtime, setRuntime] = useState(() => readSessionRuntime());
  const [remaining, setRemaining] = useState(null);
  const [phase, setPhase] = useState('checking');
  const [endReason, setEndReason] = useState(null);

  const runtimeRef = useRef(runtime);
  const phaseRef = useRef(phase);
  const syncRequestRef = useRef(null);
  const touchRequestRef = useRef(null);
  const lastTouchRef = useRef(0);
  const expiryCheckRef = useRef(0);

  const applyRuntime = useCallback((nextRuntime, { broadcast = false } = {}) => {
    if (!nextRuntime) return false;

    runtimeRef.current = nextRuntime;
    setRuntime(nextRuntime);
    writeSessionRuntime(nextRuntime);
    setPhase('active');
    phaseRef.current = 'active';
    setEndReason(null);

    if (broadcast) {
      publishSessionUpdated(nextRuntime);
    }

    return true;
  }, []);

  const markSessionEnded = useCallback((reason, { broadcast = true } = {}) => {
    const normalizedReason = String(reason || 'SESSION_INVALID');
    const sessionId = runtimeRef.current?.sessionId || null;

    setEndReason(normalizedReason);
    setPhase('ended');
    phaseRef.current = 'ended';

    if (broadcast) {
      publishSessionInvalidated({
        sessionId,
        reason: normalizedReason,
      });
    }
  }, []);

  const syncFromServer = useCallback(async ({ silent = false } = {}) => {
    if (navigator.onLine === false) {
      setPhase('offline');
      phaseRef.current = 'offline';
      return {
        ok: false,
        status: 0,
        code: 'OFFLINE',
      };
    }

    if (syncRequestRef.current) {
      return await syncRequestRef.current;
    }

    if (!silent && phaseRef.current !== 'ended') {
      setPhase('revalidating');
      phaseRef.current = 'revalidating';
    }

    const request = (async () => {
      const result = await fetchSession();

      if (result.ok) {
        const nextRuntime = runtimeFromServerPayload(result);
        if (nextRuntime) {
          applyRuntime(nextRuntime);
        }
        return result;
      }

      if (DEFINITIVE_SESSION_STATUSES.has(result.status)) {
        markSessionEnded(normalizeReason(result));
        return result;
      }

      if (result.status === 0) {
        setPhase(navigator.onLine === false ? 'offline' : 'revalidating');
        phaseRef.current = navigator.onLine === false ? 'offline' : 'revalidating';
        return result;
      }

      if (phaseRef.current !== 'ended') {
        setPhase('revalidating');
        phaseRef.current = 'revalidating';
      }

      return result;
    })();

    syncRequestRef.current = request;

    try {
      return await request;
    } finally {
      if (syncRequestRef.current === request) {
        syncRequestRef.current = null;
      }
    }
  }, [applyRuntime, markSessionEnded]);

  const touch = useCallback(async () => {
    if (phaseRef.current === 'ended') return null;

    if (navigator.onLine === false) {
      setPhase('offline');
      phaseRef.current = 'offline';
      return null;
    }

    const now = Date.now();
    if (now - lastTouchRef.current < TOUCH_THROTTLE_MS) {
      return null;
    }

    if (touchRequestRef.current) {
      return await touchRequestRef.current;
    }

    lastTouchRef.current = now;

    const request = (async () => {
      const result = await touchSession();

      if (result.ok) {
        const nextRuntime = runtimeFromServerPayload(result);
        if (nextRuntime) {
          applyRuntime(nextRuntime, { broadcast: true });
        }
        return result;
      }

      if (DEFINITIVE_SESSION_STATUSES.has(result.status)) {
        markSessionEnded(normalizeReason(result));
        return result;
      }

      if (result.status === 0) {
        setPhase(navigator.onLine === false ? 'offline' : 'revalidating');
        phaseRef.current = navigator.onLine === false ? 'offline' : 'revalidating';
      }

      return result;
    })();

    touchRequestRef.current = request;

    try {
      return await request;
    } finally {
      if (touchRequestRef.current === request) {
        touchRequestRef.current = null;
      }
    }
  }, [applyRuntime, markSessionEnded]);

  useEffect(() => {
    runtimeRef.current = runtime;
  }, [runtime]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    void syncFromServer({ silent: Boolean(runtimeRef.current) });

    const poll = window.setInterval(() => {
      if (
        phaseRef.current !== 'ended' &&
        document.visibilityState === 'visible'
      ) {
        void syncFromServer({ silent: true });
      }
    }, SERVER_POLL_MS);

    return () => window.clearInterval(poll);
  }, [syncFromServer]);

  useEffect(() => {
    const meaningfulEvents = [
      'pointerdown',
      'keydown',
      'input',
      'change',
      'touchstart',
      'wheel',
      'scroll',
    ];

    const handleActivity = () => {
      if (phaseRef.current === 'ended') return;
      void touch();
    };

    meaningfulEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      meaningfulEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [touch]);

  useEffect(() => {
    const revalidateOnResume = () => {
      if (phaseRef.current === 'ended') return;
      void syncFromServer({ silent: false });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        revalidateOnResume();
      }
    };

    const onPageShow = (event) => {
      if (event.persisted) {
        revalidateOnResume();
      }
    };

    const onOnline = () => revalidateOnResume();
    const onOffline = () => {
      if (phaseRef.current !== 'ended') {
        setPhase('offline');
        phaseRef.current = 'offline';
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', revalidateOnResume);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', revalidateOnResume);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncFromServer]);

  useEffect(() => {
    return subscribeSessionEvents((event) => {
      const currentSessionId = runtimeRef.current?.sessionId || null;

      if (event.type === 'SESSION_UPDATED') {
        if (!event.runtime) return;

        if (!currentSessionId) {
          void syncFromServer({ silent: true });
          return;
        }

        if (event.sessionId === currentSessionId) {
          const nextRuntime =
            writeSessionRuntime(
              event.runtime
            );

          if (!nextRuntime) return;

          runtimeRef.current = nextRuntime;
          setRuntime(nextRuntime);
          setPhase('active');
          phaseRef.current = 'active';
          setEndReason(null);
          return;
        }

        void syncFromServer({ silent: false });
        return;
      }

      if (event.type === 'SESSION_LOGOUT') {
        if (!event.sessionId || !currentSessionId || event.sessionId === currentSessionId) {
          clearSessionRuntime();
          window.location.replace('https://buddyfleets.in/login');
        }
        return;
      }

      if (event.type === 'SESSION_INVALIDATED') {
        if (!event.sessionId || !currentSessionId || event.sessionId === currentSessionId) {
          markSessionEnded(event.reason || 'SESSION_INVALID', { broadcast: false });
        }
      }
    });
  }, [markSessionEnded, syncFromServer]);

  useEffect(() => {
    if (!runtime?.expiresAt || phase === 'ended') {
      if (!runtime?.expiresAt) setRemaining(null);
      return undefined;
    }

    const tick = () => {
      const authoritativeNow = getAuthoritativeNow(runtime);
      const left = runtime.expiresAt - authoritativeNow;

      if (left > 0) {
        setRemaining(left);
        return;
      }

      setRemaining(0);

      if (navigator.onLine === false) {
        setPhase('offline');
        phaseRef.current = 'offline';
        return;
      }

      const now = Date.now();
      if (now - expiryCheckRef.current >= EXPIRY_RECHECK_GRACE_MS) {
        expiryCheckRef.current = now;
        void syncFromServer({ silent: false });
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [phase, runtime, syncFromServer]);

  const display = useMemo(() => {
    if (phase === 'offline') return 'Offline';
    if (phase === 'checking' || phase === 'revalidating') {
      if (remaining === null) return 'Check…';
    }
    if (remaining === null) return '--:--';
    return formatRemaining(remaining);
  }, [phase, remaining]);

  const message = SESSION_MESSAGES[endReason] || SESSION_MESSAGES.SESSION_INVALID;

  const handleLoginAgain = async () => {
    const sessionId = runtimeRef.current?.sessionId || null;

    publishSessionLogout({
      sessionId,
      reason: endReason || 'SESSION_ENDED',
    });

    clearSessionRuntime();

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        keepalive: true,
        headers: { Accept: 'application/json' },
        referrerPolicy: 'no-referrer',
      });
    } catch {
      // Local cleanup + redirect remain authoritative for this browser tab.
    }

    window.location.replace('https://buddyfleets.in/login');
  };

  return (
    <>
      {showBadge ? (
        <div className="hidden xl:block">
          <div
          className="flex min-w-[112px] cursor-default flex-col items-center justify-center rounded-md border border-white/20 bg-white/[.08] px-3 py-1.5 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_1px_2px_rgba(0,0,0,.08)] backdrop-blur-sm"
          aria-label="Session time remaining"
          title="Server-authoritative session time remaining"
        >
          <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[.12em] text-[var(--bf-header-muted)]">
            {phase === 'offline' ? <WifiOff size={9} /> : <Clock3 size={9} />} Session
          </span>
          <span className="text-[11px] font-bold tabular-nums text-[var(--bf-header-text)]">
            {display}
          </span>
          </div>
        </div>
      ) : null}

      {phase === 'ended' ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[440px] rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface)] p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <ShieldAlert size={26} />
            </div>
            <h2 className="mt-4 text-[20px] font-bold text-[var(--bf-text)]">{message.title}</h2>
            <p className="mx-auto mt-2 max-w-[350px] text-[11px] leading-5 text-[var(--bf-text-2)]">
              {message.body}
            </p>
            <button
              type="button"
              onClick={handleLoginAgain}
              className="mt-5 inline-flex items-center justify-center rounded-md border border-[var(--bf-primary)] bg-[var(--bf-primary)] px-5 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-[var(--bf-primary-strong)]"
            >
              Login again
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
