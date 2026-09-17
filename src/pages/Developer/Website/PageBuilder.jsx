import { useEffect, useRef, useState } from 'react';
import { getWebsitePages, createWebsitePage } from '../../../services/developerWebsiteApi';

import {
  AppWindow,
  BadgeCheck,
  Blocks,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gauge,
  MonitorCog,
  PencilRuler,
  Plus,
  Rocket,
} from 'lucide-react';

import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  Button,
} from '../shared/DeveloperPageUI';

export default function PageBuilder() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);
  const [pageName, setPageName] = useState('');
  const [pagePath, setPagePath] = useState('');
  const [createError, setCreateError] = useState('');
  const dialogRef = useRef(null);
  const creatingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getWebsitePages().then((result) => {
      if (cancelled) return;
      if (result.ok && Array.isArray(result.pages)) {
        setPages(result.pages);
        setSelectedPageId((result.pages.find((page) => page.is_homepage) || result.pages[0])?.id || null);
      } else {
        setError('Unable to load website pages.');
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (createPageOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [createPageOpen]);

  const createPage = async (event) => {
    event.preventDefault();
    if (creatingRef.current) return;
    const name = pageName.trim();
    const path = pagePath.trim().replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
    if (!name) return setCreateError('Page name is required.');
    if (!pagePath.trim()) return setCreateError('Page URL is required.');
    if (!pagePath.trim().startsWith('/')) return setCreateError('Page URL must start with /.');
    if (path === '/' || pages.some((page) => page.path === path)) {
      return setCreateError('A page already exists at this URL.');
    }
    creatingRef.current = true;
    setCreatingPage(true);
    setCreateError('');
    try {
      const result = await createWebsitePage({ name, path });
      if (!result.ok || !result.page?.id) {
        const messages = {
          NAME_REQUIRED: 'Page name is required.',
          PATH_REQUIRED: 'Page URL is required.',
          INVALID_PATH: 'Page URL must start with /.',
          DUPLICATE_PATH: 'A page already exists at this URL.',
        };
        setCreateError(messages[result.code] || 'Unable to create website page.');
        return;
      }
      const refreshed = await getWebsitePages();
      if (refreshed.ok && Array.isArray(refreshed.pages)) {
        setPages(refreshed.pages);
        setError('');
      } else {
        setPages((current) => [...current, result.page]);
        setError('Unable to load website pages.');
      }
      setSelectedPageId(result.page.id);
      setCreatePageOpen(false);
    } catch {
      setCreateError('Unable to create website page.');
    } finally {
      creatingRef.current = false;
      setCreatingPage(false);
    }
  };

  return (
    <>
    <Page>
      <PageHeader
        eyebrow="Website Studio / Page Builder"
        title="Page Builder"
        description="Build and organize public Buddy Fleets website pages, reusable sections and conversion-focused content."
        actions={
          <>
            <Button
              variant="pageBand"
              icon={MonitorCog}
            >
              Preview
            </Button>

            <Button
              variant="primary"
              icon={Rocket}
            >
              Save draft
            </Button>
          </>
        }
      />

      <div
        className="
          grid
          gap-4
          xl:grid-cols-[300px_1fr]
        "
      >
        <Card>
          <CardHeader
            title="Website pages"
            subtitle="Select a page to edit"
            action={
              <Button icon={Plus} onClick={() => {
                if (loading) return;
                setPageName('');
                setPagePath('');
                setCreateError('');
                setCreatePageOpen(true);
              }}>
                Page
              </Button>
            }
          />

          <div className="space-y-1 p-2.5">
            {loading && <p role="status" className="p-3 text-[11px] text-[var(--bf-dev-text-3)]">Loading website pages?</p>}
            {error && <p role="alert" className="p-3 text-[11px] text-[var(--bf-dev-text-2)]">{error}</p>}
            {!loading && !error && !pages.length && <p className="p-3 text-[11px] text-[var(--bf-dev-text-3)]">No website pages.</p>}
            {pages.map(
              (page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  aria-pressed={selectedPageId === page.id}
                  style={selectedPageId === page.id ? {
                    borderColor: 'var(--bf-dev-primary)',
                    background: 'rgb(var(--bf-dev-primary-rgb) / .08)',
                  } : undefined}
                  type="button"
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface)]
                    px-3
                    py-3
                    text-left
                    transition
                    hover:bg-[var(--bf-dev-surface-2)]
                  "
                >
                  <div>
                    <div className="text-[11px] font-semibold text-[var(--bf-dev-text)]">
                      {page.name}
                    </div>
                    <div className="mt-0.5 text-[9px] text-[var(--bf-dev-text-3)]">
                      {page.path}
                    </div>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-[var(--bf-dev-text-3)]"
                  />
                </button>
              )
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Page canvas"
              subtitle="Reusable blocks available for the selected page"
            />

            <div
              className="
                grid
                gap-3
                p-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {[
                ['Hero Section', 'Headline, supporting copy, CTA and hero media.', AppWindow],
                ['Feature Grid', 'Product capability cards and module highlights.', Blocks],
                ['Trust Section', 'Customer proof, platform stats and testimonials.', BadgeCheck],
                ['Pricing Block', 'Plan cards, feature comparison and offer copy.', Gauge],
                ['CTA Block', 'Conversion-focused call-to-action section.', Rocket],
                ['Footer Block', 'Navigation, legal links and company information.', FileText],
              ].map(([title, text, Icon]) => (
                <button
                  key={title}
                  type="button"
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface)]
                    p-4
                    text-left
                    transition
                    hover:bg-[var(--bf-dev-surface-2)]
                  "
                >
                  <Icon
                    size={17}
                    className="text-[var(--bf-dev-primary)]"
                  />
                  <div className="mt-3 text-[11px] font-bold text-[var(--bf-dev-text)]">
                    {title}
                  </div>
                  <div className="mt-1 text-[10px] leading-5 text-[var(--bf-dev-text-2)]">
                    {text}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Builder status"
              subtitle="Draft changes are isolated from the live website"
            />

            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {[
                ['Draft pages', loading || error ? '?' : pages.filter((page) => page.status === 'draft').length, PencilRuler],
                ['Reusable blocks', '18', Blocks],
                ['Published pages', loading || error ? '?' : pages.filter((page) => page.status === 'published').length, CheckCircle2],
              ].map(([label, value, Icon]) => (
                <div
                  key={label}
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface-2)]
                    p-4
                  "
                >
                  <Icon
                    size={16}
                    className="text-[var(--bf-dev-primary)]"
                  />
                  <div className="mt-3 text-[20px] font-semibold text-[var(--bf-dev-text)]">
                    {value}
                  </div>
                  <div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
      <dialog
        ref={dialogRef}
        aria-labelledby="create-page-title"
        onCancel={(event) => {
          if (creatingRef.current) event.preventDefault();
          else setCreatePageOpen(false);
        }}
        onClose={() => setCreatePageOpen(false)}
        className="m-auto w-[calc(100%-28px)] max-w-md rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-5 text-[var(--bf-dev-text)] shadow-xl backdrop:bg-black/40"
      >
        <form onSubmit={createPage}>
          <h2 id="create-page-title" className="text-[15px] font-semibold">Create website page</h2>
          <label className="mt-4 block text-[11px] text-[var(--bf-dev-text-2)]">
            Page Name
            <input autoFocus value={pageName} onChange={(event) => setPageName(event.target.value)} disabled={creatingPage} placeholder="GPS Tracking" className="mt-1.5 h-10 w-full rounded border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-3 text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]" />
          </label>
          <label className="mt-3 block text-[11px] text-[var(--bf-dev-text-2)]">
            Page URL
            <input value={pagePath} onChange={(event) => setPagePath(event.target.value)} disabled={creatingPage} placeholder="/gps-tracking" className="mt-1.5 h-10 w-full rounded border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-3 text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]" />
          </label>
          {createError && <p role="alert" className="mt-3 text-[11px] text-[var(--bf-dev-text-2)]">{createError}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" disabled={creatingPage} onClick={() => setCreatePageOpen(false)} className="rounded border border-[var(--bf-dev-border)] px-3 py-1.5 text-[10px] font-semibold hover:bg-[var(--bf-dev-surface-2)] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={creatingPage} className="rounded border border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-[var(--bf-dev-primary-strong)] disabled:opacity-50">{creatingPage ? 'Creating?' : 'Create Page'}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
