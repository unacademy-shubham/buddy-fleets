const SESSION_RUNTIME_KEY = 'bf_session_runtime_v3';
const LEGACY_RUNTIME_KEY = 'bf_session_runtime_v2';
const LEGACY_ACTIVITY_KEY = 'buddy_fleets_last_activity';
const SESSION_EVENT_KEY = 'bf_session_event_v3';
const SESSION_CHANNEL_NAME = 'bf_session_v3';
const SESSION_EVENT_TTL_MS = 2 * 60 * 1000;

const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;

function toMs(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeRuntime(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const sessionId = String(value.sessionId || '').trim();
  const expiresAt = Number(value.expiresAt);
  const idleTimeoutSeconds = Number(value.idleTimeoutSeconds);
  const serverOffsetMs = Number(value.serverOffsetMs || 0);

  if (
    !sessionId ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= 0 ||
    !Number.isFinite(idleTimeoutSeconds) ||
    idleTimeoutSeconds <= 0 ||
    !Number.isFinite(serverOffsetMs) ||
    Math.abs(serverOffsetMs) > MAX_CLOCK_SKEW_MS
  ) {
    return null;
  }

  return {
    version: 3,
    sessionId,
    expiresAt,
    idleTimeoutSeconds,
    serverOffsetMs,
    lastSeenAt: toMs(value.lastSeenAt),
    updatedAt: Number(value.updatedAt || Date.now()),
  };
}

export function runtimeFromServerPayload(payload) {
  const session = payload?.session || {};
  const sessionId = String(session.id || '').trim();
  const expiresAt = toMs(session.expiresAt || payload?.expiresAt);
  const idleTimeoutSeconds = Number(
    session.idleTimeoutSeconds || payload?.idleTimeoutSeconds || 0
  );
  const serverTime = toMs(payload?.serverTime || session.serverTime);

  if (
    !sessionId ||
    !Number.isFinite(expiresAt) ||
    !Number.isFinite(idleTimeoutSeconds) ||
    idleTimeoutSeconds <= 0
  ) {
    return null;
  }

  const serverOffsetMs = Number.isFinite(serverTime)
    ? serverTime - Date.now()
    : 0;

  return normalizeRuntime({
    sessionId,
    expiresAt,
    idleTimeoutSeconds,
    serverOffsetMs,
    lastSeenAt: session.lastSeenAt,
    updatedAt: Date.now(),
  });
}

export function runtimeFromBootstrapSession(session) {
  const sessionId = String(session?.id || '').trim();
  const expiresAt = toMs(session?.expiresAt);
  const idleTimeoutSeconds = Number(session?.idleTimeoutSeconds || 0);
  const serverTime = toMs(session?.serverTime);

  if (
    !sessionId ||
    !Number.isFinite(expiresAt) ||
    !Number.isFinite(idleTimeoutSeconds) ||
    idleTimeoutSeconds <= 0
  ) {
    return null;
  }

  return normalizeRuntime({
    sessionId,
    expiresAt,
    idleTimeoutSeconds,
    serverOffsetMs: Number.isFinite(serverTime)
      ? serverTime - Date.now()
      : 0,
    updatedAt: Date.now(),
  });
}

export function readSessionRuntime() {
  try {
    const raw = window.localStorage.getItem(SESSION_RUNTIME_KEY);
    if (!raw) return null;
    return normalizeRuntime(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSessionRuntime(runtime) {
  const normalized = normalizeRuntime(runtime);
  if (!normalized) return null;

  try {
    window.localStorage.setItem(
      SESSION_RUNTIME_KEY,
      JSON.stringify(normalized)
    );
    window.localStorage.removeItem(LEGACY_RUNTIME_KEY);
    window.localStorage.removeItem(LEGACY_ACTIVITY_KEY);
  } catch {
    // Runtime cache is an optimization only.
  }

  return normalized;
}

export function clearSessionRuntime() {
  try {
    window.localStorage.removeItem(SESSION_RUNTIME_KEY);
    window.localStorage.removeItem(LEGACY_RUNTIME_KEY);
    window.localStorage.removeItem(LEGACY_ACTIVITY_KEY);
    window.localStorage.removeItem(SESSION_EVENT_KEY);
  } catch {
    // Non-critical browser storage cleanup.
  }
}

function publishStorageEvent(event) {
  try {
    window.localStorage.setItem(
      SESSION_EVENT_KEY,
      JSON.stringify(event)
    );
  } catch {
    // BroadcastChannel may still work.
  }
}

function publishChannelEvent(event) {
  if (typeof window.BroadcastChannel !== 'function') {
    return;
  }

  try {
    const channel = new window.BroadcastChannel(SESSION_CHANNEL_NAME);
    channel.postMessage(event);
    channel.close();
  } catch {
    // Storage fallback is sufficient.
  }
}

export function publishSessionEvent(event) {
  if (!event || typeof event !== 'object') return;

  const envelope = {
    ...event,
    eventId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    emittedAt: Date.now(),
  };

  publishStorageEvent(envelope);
  publishChannelEvent(envelope);
}

export function publishSessionUpdated(runtime) {
  const normalized = normalizeRuntime(runtime);
  if (!normalized) return;

  publishSessionEvent({
    type: 'SESSION_UPDATED',
    sessionId: normalized.sessionId,
    runtime: normalized,
  });
}

export function publishSessionLogout({ sessionId, reason = 'USER_LOGOUT' } = {}) {
  publishSessionEvent({
    type: 'SESSION_LOGOUT',
    sessionId: sessionId || null,
    reason,
  });
}

export function publishSessionInvalidated({ sessionId, reason } = {}) {
  publishSessionEvent({
    type: 'SESSION_INVALIDATED',
    sessionId: sessionId || null,
    reason: reason || 'SESSION_INVALID',
  });
}

function parseEvent(raw) {
  try {
    const event = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return event && typeof event === 'object' ? event : null;
  } catch {
    return null;
  }
}

export function subscribeSessionEvents(handler) {
  if (typeof handler !== 'function') {
    return () => {};
  }

  let channel = null;
  const seenEventIds = new Set();

  const deliver = (parsed) => {
    if (!parsed) return;

    const emittedAt = Number(parsed.emittedAt || 0);
    if (
      Number.isFinite(emittedAt) &&
      emittedAt > 0 &&
      (
        Date.now() - emittedAt > SESSION_EVENT_TTL_MS ||
        emittedAt - Date.now() > 30 * 1000
      )
    ) {
      return;
    }

    const eventId = String(parsed.eventId || '');
    if (eventId && seenEventIds.has(eventId)) return;

    if (eventId) {
      seenEventIds.add(eventId);
      if (seenEventIds.size > 100) {
        const first = seenEventIds.values().next().value;
        seenEventIds.delete(first);
      }
    }

    handler(parsed);
  };

  const onStorage = (event) => {
    if (event.key !== SESSION_EVENT_KEY || !event.newValue) return;
    deliver(parseEvent(event.newValue));
  };

  const onChannel = (event) => {
    deliver(parseEvent(event.data));
  };

  window.addEventListener('storage', onStorage);

  if (typeof window.BroadcastChannel === 'function') {
    try {
      channel = new window.BroadcastChannel(SESSION_CHANNEL_NAME);
      channel.addEventListener('message', onChannel);
    } catch {
      channel = null;
    }
  }

  return () => {
    window.removeEventListener('storage', onStorage);
    if (channel) {
      channel.removeEventListener('message', onChannel);
      channel.close();
    }
  };
}

export function getAuthoritativeNow(runtime) {
  return Date.now() + Number(runtime?.serverOffsetMs || 0);
}

export function getSessionRuntimeKey() {
  return SESSION_RUNTIME_KEY;
}
