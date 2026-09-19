import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Moon, RefreshCw, Sun, X } from 'lucide-react';

import WebsiteCmsRenderer from '../../../cms/WebsiteCmsRenderer';
import {
  getWebsitePageDraft,
  getWebsitePages,
} from '../../../services/developerWebsiteApi';

const THEME_STORAGE_KEY = 'buddy_fleets_theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : 'dark';
}

export default function WebsitePreview() {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(getInitialTheme);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.dataset.theme;
    const previousColorScheme = root.style.colorScheme;

    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);

    return () => {
      if (previousTheme) root.dataset.theme = previousTheme;
      else delete root.dataset.theme;
      root.style.colorScheme = previousColorScheme;
    };
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      setLoading(true);
      setError('');

      const [pagesResult, draftResult] = await Promise.all([
        getWebsitePages(),
        getWebsitePageDraft(pageId),
      ]);

      if (cancelled) return;

      const selectedPage = pagesResult.ok && Array.isArray(pagesResult.pages)
        ? pagesResult.pages.find((entry) => entry.id === pageId) || null
        : null;

      if (!selectedPage || !draftResult.ok || draftResult.draft?.page_id !== pageId) {
        setPage(selectedPage);
        setDraft(null);
        setError('Unable to load this draft preview.');
        setLoading(false);
        return;
      }

      setPage(selectedPage);
      setDraft(draftResult.draft);
      setLoading(false);
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [pageId, reloadKey]);

  const liveUrl = useMemo(() => {
    if (!page?.path) return 'https://buddyfleets.in';
    return `https://buddyfleets.in${page.path === '/' ? '' : page.path}`;
  }, [page]);

  return (
    <div className="min-h-[100dvh] bg-[var(--bf-page-bg)] text-[color:var(--bf-text-primary)]">
      <header className="sticky top-0 z-[100] border-b border-[color:var(--bf-border)] bg-[var(--bf-surface)]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[58px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-amber-500">
                Draft Preview
              </span>
              <span className="truncate text-[11px] font-bold text-[color:var(--bf-text-primary)]">
                {page?.name || 'Website page'}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[9px] text-[color:var(--bf-text-muted)]">
              {page?.path || ''} · Saved draft only · Not published
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--bf-border)] bg-[var(--bf-page-bg)] text-[color:var(--bf-text-secondary)] transition hover:border-cyan-400/30"
              aria-label="Toggle preview theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[color:var(--bf-border)] bg-[var(--bf-page-bg)] px-3 text-[10px] font-bold text-[color:var(--bf-text-secondary)] transition hover:border-cyan-400/30"
            >
              <RefreshCw size={13} />
              Reload
            </button>

            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-[color:var(--bf-border)] bg-[var(--bf-page-bg)] px-3 text-[10px] font-bold text-[color:var(--bf-text-secondary)] transition hover:border-cyan-400/30 sm:inline-flex"
            >
              <ExternalLink size={13} />
              Live page
            </a>

            <button
              type="button"
              onClick={() => window.close()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--bf-border)] bg-[var(--bf-page-bg)] text-[color:var(--bf-text-secondary)] transition hover:border-rose-400/30 hover:text-rose-500"
              aria-label="Close preview"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-[color:var(--bf-border)] bg-[var(--bf-surface)]">
        <div className="mx-auto flex min-h-[66px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a href="https://buddyfleets.in" target="_blank" rel="noreferrer" className="text-lg font-black tracking-tight text-[color:var(--bf-text-primary)]">
            Buddy <span className="text-cyan-500">Fleets</span>
          </a>
          <nav className="hidden items-center gap-5 text-[11px] font-bold text-[color:var(--bf-text-secondary)] md:flex">
            {[['Home', '/'], ['Features', '/features'], ['Pricing', '/pricing'], ['About Us', '/about'], ['Contact Us', '/contact-us']].map(([label, path]) => (
              <a key={path} href={`https://buddyfleets.in${path === '/' ? '' : path}`} target="_blank" rel="noreferrer" className="transition hover:text-cyan-500">{label}</a>
            ))}
          </nav>
          <a href="https://buddyfleets.in/signup" target="_blank" rel="noreferrer" className="rounded-xl bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] px-4 py-2.5 text-[10px] font-black text-white">Start Free Trial</a>
        </div>
      </div>

      {loading ? (
        <div className="grid min-h-[65dvh] place-items-center px-5">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
            <p className="mt-3 text-xs text-[color:var(--bf-text-muted)]">Loading saved draft preview…</p>
          </div>
        </div>
      ) : error ? (
        <div className="grid min-h-[65dvh] place-items-center px-5">
          <div className="max-w-md rounded-[22px] border border-rose-500/20 bg-rose-500/[0.05] p-6 text-center">
            <p className="text-sm font-bold text-rose-500">{error}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-4 rounded-xl border border-[color:var(--bf-border)] px-4 py-2 text-xs font-bold">
              Try again
            </button>
          </div>
        </div>
      ) : (
        <WebsiteCmsRenderer
          content={draft?.content}
          baseUrl="https://buddyfleets.in"
        />
      )}

      {!loading && !error && (
        <footer className="border-t border-[color:var(--bf-border)] bg-[var(--bf-surface)] px-5 py-8 text-center sm:px-8">
          <p className="text-sm font-black text-[color:var(--bf-text-primary)]">Buddy Fleets</p>
          <p className="mt-1 text-[10px] text-[color:var(--bf-text-muted)]">Draft preview · Header, footer and application integrations remain controlled by the website application.</p>
        </footer>
      )}
    </div>
  );
}
