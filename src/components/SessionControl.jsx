import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, ShieldAlert, TimerReset, X } from 'lucide-react';

const DEFAULT_MINUTES = 30;
const ALLOWED_MINUTES = [30, 60, 90];
const TOUCH_THROTTLE_MS = 15000;
const RUNTIME_KEY = 'bf_session_runtime_v2';
const ACTIVITY_KEY = 'buddy_fleets_last_activity';

function readRuntime() {
  try {
    const raw = window.localStorage.getItem(RUNTIME_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || !Number.isFinite(Number(value.expiresAt))) return null;
    const minutes = ALLOWED_MINUTES.includes(Number(value.timeoutMinutes))
      ? Number(value.timeoutMinutes)
      : DEFAULT_MINUTES;
    return { expiresAt: Number(value.expiresAt), timeoutMinutes: minutes };
  } catch {
    return null;
  }
}

function writeRuntime(runtime) {
  try {
    window.localStorage.setItem(RUNTIME_KEY, JSON.stringify(runtime));
  } catch {
    // UI state only.
  }
}

function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function sessionMutation(action, minutes) {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      timeoutMinutes: minutes,
    }),
  });
  const data = await response.json().catch(() => ({}));
  return { ...data, status: response.status, ok: Boolean(response.ok && data?.ok) };
}

export default function SessionControl({ onLogout }) {
  const [runtime, setRuntime] = useState(() => readRuntime());
  const [remaining, setRemaining] = useState(null);
  const [open, setOpen] = useState(false);
  const [expired, setExpired] = useState(false);
  const [notice, setNotice] = useState('');
  const lastTouchRef = useRef(0);
  const lastLocalActivityRef = useRef(0);
  const lastCrossTabSyncRef = useRef(0);
  const expiredRef = useRef(false);

  const syncFromServer = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if ([401, 403, 423].includes(response.status)) {
          setExpired(true);
          expiredRef.current = true;
        }
        return;
      }
      const expiresAt = Date.parse(data?.session?.expiresAt || '');
      if (!Number.isFinite(expiresAt)) return;
      const timeoutMinutes = ALLOWED_MINUTES.includes(Number(data?.session?.timeoutMinutes))
        ? Number(data.session.timeoutMinutes)
        : DEFAULT_MINUTES;
      const next = { expiresAt, timeoutMinutes };
      setRuntime(next);
      writeRuntime(next);
      setExpired(false);
      expiredRef.current = false;
    } catch {
      // Temporary network failures do not expire the UI session.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await syncFromServer();
    };
    run();
    const poll = window.setInterval(run, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [syncFromServer]);

  const touch = useCallback(async () => {
    if (expiredRef.current) return;
    const now = Date.now();
    if (now - lastTouchRef.current < TOUCH_THROTTLE_MS) return;
    lastTouchRef.current = now;

    const minutes = runtime?.timeoutMinutes || DEFAULT_MINUTES;
    const result = await sessionMutation('TOUCH', minutes);
    if (result.ok && result.expiresAt) {
      const next = {
        expiresAt: Date.parse(result.expiresAt),
        timeoutMinutes: Number(result.timeoutMinutes) || minutes,
      };
      setRuntime(next);
      writeRuntime(next);
      try {
        window.localStorage.setItem(ACTIVITY_KEY, String(now));
      } catch {}
      return;
    }
    if ([401, 403, 423].includes(result.status)) {
      setExpired(true);
      expiredRef.current = true;
    }
  }, [runtime?.timeoutMinutes]);

  useEffect(() => {
    const events = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll', 'mousemove'];
    const handler = () => {
      if (expiredRef.current) return;
      const now = Date.now();
      const minutes = runtime?.timeoutMinutes || DEFAULT_MINUTES;

      if (now - lastLocalActivityRef.current >= 1000) {
        lastLocalActivityRef.current = now;
        const optimistic = {
          expiresAt: now + minutes * 60 * 1000,
          timeoutMinutes: minutes,
        };
        setRuntime(optimistic);
        writeRuntime(optimistic);
        setRemaining(optimistic.expiresAt - now);
      }

      try {
        window.localStorage.setItem(ACTIVITY_KEY, String(now));
      } catch {}
      void touch();
    };
    events.forEach((event) => window.addEventListener(event, handler, { passive: true }));
    const onStorage = (event) => {
      if (event.key === RUNTIME_KEY) {
        const next = readRuntime();
        if (next) {
          setRuntime(next);
          setExpired(false);
          expiredRef.current = false;
        }
      }
      if (event.key === ACTIVITY_KEY) {
        const now = Date.now();
        if (now - lastCrossTabSyncRef.current >= TOUCH_THROTTLE_MS) {
          lastCrossTabSyncRef.current = now;
          void syncFromServer();
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      events.forEach((event) => window.removeEventListener(event, handler));
      window.removeEventListener('storage', onStorage);
    };
  }, [runtime?.timeoutMinutes, syncFromServer, touch]);

  useEffect(() => {
    if (!runtime?.expiresAt) return undefined;
    const tick = () => {
      const left = runtime.expiresAt - Date.now();
      if (left <= 0) {
        setRemaining(0);
        if (!expiredRef.current) {
          expiredRef.current = true;
          setExpired(true);
        }
        return;
      }
      setRemaining(left);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [runtime?.expiresAt]);

  const extend = useCallback(async (minutes) => {
    if (!ALLOWED_MINUTES.includes(minutes) || expiredRef.current) return;
    const result = await sessionMutation('EXTEND', minutes);
    if (!result.ok || !result.expiresAt) {
      if ([401, 403, 423].includes(result.status)) {
        expiredRef.current = true;
        setExpired(true);
      }
      return;
    }
    const next = {
      expiresAt: Date.parse(result.expiresAt),
      timeoutMinutes: minutes,
    };
    setRuntime(next);
    writeRuntime(next);
    setRemaining(next.expiresAt - Date.now());
    setOpen(false);
    setNotice(`Your session has been extended by ${minutes} minutes.`);
    window.setTimeout(() => setNotice(''), 3000);
  }, []);

  const display = useMemo(() => {
    if (remaining === null) return '--:--';
    return formatRemaining(remaining);
  }, [remaining]);

  const handleLoginAgain = async () => {
    try {
      window.localStorage.removeItem(RUNTIME_KEY);
      window.localStorage.removeItem(ACTIVITY_KEY);
    } catch {}
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        keepalive: true,
        headers: { Accept: 'application/json' },
      });
    } catch {}
    window.location.replace('https://buddyfleets.in/login');
  };

  return (
    <>
      <div className="relative hidden xl:block">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-[112px] flex-col items-center justify-center rounded-md border border-white/20 bg-white/[.08] px-3 py-1.5 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_1px_2px_rgba(0,0,0,.08)] backdrop-blur-sm transition hover:border-white/35 hover:bg-white/[.14]"
          aria-label="Session controls"
        >
          <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[.12em] text-[var(--bf-header-muted)]">
            <Clock3 size={9} /> Session
          </span>
          <span className="text-[11px] font-bold tabular-nums text-[var(--bf-header-text)]">{display}</span>
        </button>

        {open && !expired ? (
          <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[310px] overflow-hidden rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface)] p-3 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-bold text-[var(--bf-text)]">Session time</div>
                <div className="mt-0.5 text-[9px] text-[var(--bf-text-3)]">Choose how long the inactivity window should be.</div>
              </div>
              <TimerReset size={16} className="text-[var(--bf-primary)]" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ALLOWED_MINUTES.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => void extend(minutes)}
                  className="rounded-lg border border-[var(--bf-border)] bg-[var(--bf-surface-2)] px-2 py-3 text-center transition hover:border-[var(--bf-primary)] hover:bg-[rgb(var(--bf-primary-rgb)/.08)]"
                >
                  <div className="text-[12px] font-bold text-[var(--bf-text)]">{minutes} min</div>
                  <div className="mt-1 text-[8px] text-[var(--bf-text-3)]">Extend session</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {notice ? (
        <div className="fixed right-5 top-5 z-[120] flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-[var(--bf-surface)] px-4 py-3 text-[11px] font-semibold text-[var(--bf-text)] shadow-2xl">
          <ShieldAlert size={15} className="text-emerald-500" />
          {notice}
        </div>
      ) : null}

      {expired ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[440px] rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface)] p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <ShieldAlert size={26} />
            </div>
            <h2 className="mt-4 text-[20px] font-bold text-[var(--bf-text)]">Session expired</h2>
            <p className="mx-auto mt-2 max-w-[350px] text-[11px] leading-5 text-[var(--bf-text-2)]">
              Your session has expired due to inactivity. For your security, please log in again to continue.
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
