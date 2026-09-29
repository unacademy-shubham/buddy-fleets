import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WebsiteCmsRenderer from './WebsiteCmsRenderer';

function usePublishedPage(path) {
  const [state, setState] = useState({ loading: true, found: false, content: null, page: null });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setState({ loading: true, found: false, content: null, page: null });
      try {
        const response = await fetch(`/api/public/website-page?path=${encodeURIComponent(path)}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && payload?.ok && payload?.content) {
          setState({ loading: false, found: true, content: payload.content, page: payload.page || null });
          return;
        }
        setState({ loading: false, found: false, content: null, page: null });
      } catch (error) {
        if (!cancelled && error?.name !== 'AbortError') {
          setState({ loading: false, found: false, content: null, page: null });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [path]);

  return state;
}

function CmsLoading() {
  return (
    <div className="grid min-h-[58dvh] place-items-center px-5">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
        <p className="mt-3 text-xs text-[color:var(--bf-text-muted)]">Loading Buddy Fleets…</p>
      </div>
    </div>
  );
}

export function PublishedSystemPage({ path, fallback }) {
  const published = usePublishedPage(path);

  if (published.loading) return fallback;
  if (!published.found) return fallback;

  return <WebsiteCmsRenderer content={published.content} />;
}

export default function PublishedWebsitePage() {
  const location = useLocation();
  const path = useMemo(() => location.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/', [location.pathname]);
  const published = usePublishedPage(path);

  if (published.loading) return <CmsLoading />;

  if (!published.found) {
    return (
      <section className="grid min-h-[58dvh] place-items-center px-5 py-16 text-center sm:px-8">
        <div className="max-w-xl rounded-[28px] border border-[color:var(--bf-border)] bg-[var(--bf-surface)] p-7 shadow-sm sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">404 · Buddy Fleets</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--bf-text-primary)]">This page is not published.</h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--bf-text-secondary)]">The URL may be incorrect or the Website Studio page has not been published yet.</p>
          <a href="/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] px-6 text-sm font-black text-white">Back to Home</a>
        </div>
      </section>
    );
  }

  return <WebsiteCmsRenderer content={published.content} />;
}
