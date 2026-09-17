import { useEffect, useRef, useState } from 'react';
import { getWebsitePages, createWebsitePage, getWebsitePageDraft, saveWebsitePageDraft } from '../../../services/developerWebsiteApi';

import {
  AppWindow,
  Truck,
  Users,
  ShieldCheck,
  Wrench,
  WalletCards,
  ClipboardCheck,
  PackageCheck,
  ReceiptText,
  Fuel,
  Bell,
  ArrowUp,
  ArrowDown,
  Trash2,
  Pencil,
  Image,
  MessageCircle,
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

const ICONS = {
  truck: Truck, users: Users, 'shield-check': ShieldCheck, wrench: Wrench,
  'file-text': FileText, 'badge-check': BadgeCheck, 'wallet-cards': WalletCards,
  'clipboard-check': ClipboardCheck, 'package-check': PackageCheck,
  'receipt-text': ReceiptText, fuel: Fuel, bell: Bell, 'check-circle': CheckCircle2,
};
const CATALOG = [
  ['hero', 'Hero', AppWindow], ['rich-text', 'Rich Text', FileText],
  ['feature-grid', 'Feature Grid', Blocks], ['image-text', 'Image + Text', Image],
  ['highlights', 'Highlights', BadgeCheck], ['stats', 'Stats', Gauge],
  ['workflow', 'Workflow', ClipboardCheck], ['benefits', 'Benefits', ShieldCheck],
  ['pricing', 'Pricing', ReceiptText], ['faq', 'FAQ', MessageCircle],
  ['cta', 'CTA', Rocket], ['contact', 'Contact', Users],
];
const DATA_FIELDS = {
  hero: ['eyebrow', 'heading', 'subheading', 'description', 'primaryCta', 'secondaryCta', 'imageUrl', 'imageAlt'],
  'rich-text': ['eyebrow', 'heading', 'body'],
  'feature-grid': ['eyebrow', 'heading', 'description', 'items'],
  'image-text': ['eyebrow', 'heading', 'description', 'imageUrl', 'imageAlt', 'imagePosition'],
  highlights: ['items'], stats: ['eyebrow', 'heading', 'items'],
  workflow: ['eyebrow', 'heading', 'items'], benefits: ['eyebrow', 'heading', 'description', 'items'],
  pricing: ['eyebrow', 'heading', 'description', 'items'], faq: ['eyebrow', 'heading', 'items'],
  cta: ['eyebrow', 'heading', 'description', 'primaryCta', 'secondaryCta'],
  contact: ['eyebrow', 'heading', 'description'],
};
const ITEM_FIELDS = {
  'feature-grid': ['title', 'description', 'icon'], highlights: ['title', 'description', 'icon'],
  workflow: ['title', 'description', 'icon'], benefits: ['title', 'description', 'icon'],
  stats: ['value', 'label'], pricing: ['name', 'priceLabel', 'description', 'features'], faq: ['question', 'answer'],
};
const LABELS = { primaryCta: 'Primary action', secondaryCta: 'Secondary action', href: 'Link URL',
  imageUrl: 'Image URL', imageAlt: 'Image description', imagePosition: 'Image position', priceLabel: 'Price label',
  body: 'Body text', features: 'Features (one per line)' };
const inputStyle = 'mt-1.5 w-full rounded border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-3 py-2 text-[11px] text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]';
let localId = 0;
function newId() {
  return globalThis.crypto?.randomUUID?.() || `section-${Date.now()}-${++localId}`;
}
function defaultData(type) {
  return Object.fromEntries(DATA_FIELDS[type].map((key) => [key,
    key === 'items' ? [] : key.endsWith('Cta') ? { label: '', href: '' } : key === 'imagePosition' ? 'right' : '',
  ]));
}
function newItem(type) {
  return { id: newId(), ...Object.fromEntries(ITEM_FIELDS[type].map((key) => [key,
    key === 'features' ? [] : key === 'icon' ? (type === 'feature-grid' ? 'truck' : type === 'workflow' ? 'check-circle' : 'badge-check') : '',
  ])) };
}
function moveEntry(items, index, delta) {
  const next = [...items];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
function SmallButton({ children, icon: Icon, ...props }) {
  return <button type="button" {...props} className="inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-[4px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-1.5 text-[10px] font-semibold text-[var(--bf-dev-text-2)] transition hover:bg-[var(--bf-dev-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-dev-primary)] disabled:cursor-not-allowed disabled:opacity-40">
    {Icon && <Icon size={13} aria-hidden="true" />}{children}
  </button>;
}
function EditorDialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} aria-label={title} onCancel={onClose} className="m-auto max-h-[85dvh] w-[calc(100%-28px)] max-w-2xl overflow-y-auto rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-5 text-[var(--bf-dev-text)] shadow-xl backdrop:bg-black/40">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-[15px] font-semibold">{title}</h2><SmallButton onClick={onClose}>Close</SmallButton></div>
    {children}
  </dialog>;
}
function EditorField({ name, value, onChange }) {
  const label = LABELS[name] || name.charAt(0).toUpperCase() + name.slice(1);
  const choices = name === 'icon' ? [...new Set([...Object.keys(ICONS), value].filter(Boolean))] : name === 'imagePosition' ? ['left', 'right'] : null;
  return <label className="block text-[11px] text-[var(--bf-dev-text-2)]">{label}
    {choices ? <select className={inputStyle} value={value || choices[0]} onChange={(event) => onChange(event.target.value)}>{choices.map((option) => <option key={option} value={option}>{option}</option>)}</select>
      : ['body', 'description', 'answer', 'features'].includes(name)
        ? <textarea className={inputStyle} rows={name === 'body' ? 6 : 3} maxLength={20000} value={name === 'features' ? (value || []).join('\n') : value || ''} onChange={(event) => onChange(name === 'features' ? event.target.value.split('\n') : event.target.value)} />
        : <input className={inputStyle} maxLength={20000} value={value || ''} onChange={(event) => onChange(event.target.value)} />}
  </label>;
}
function SectionEditor({ section, onApply, onClose }) {
  const [data, setData] = useState(() => ({ ...defaultData(section.type), ...JSON.parse(JSON.stringify(section.data)) }));
  const [editorError, setEditorError] = useState('');
  const fields = DATA_FIELDS[section.type];
  const update = (key, value) => setData((current) => ({ ...current, [key]: value }));
  const items = data.items || [];
  const editItem = (id, key, value) => update('items', items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  return <EditorDialog title={`Edit ${CATALOG.find(([type]) => type === section.type)?.[1] || 'section'}`} onClose={onClose}>
    <form onSubmit={(event) => {
      event.preventDefault();
      const hasMarkup = (value) => typeof value === 'string' ? /<\/?[a-z!][^>]*>/i.test(value) : value && typeof value === 'object' && Object.values(value).some(hasMarkup);
      if (hasMarkup(data)) return setEditorError('Use plain text only. HTML and scripts are not supported.');
      onApply({ ...section, data });
    }}>
      <div className="space-y-3">
        {fields.filter((key) => key !== 'items').map((key) => key.endsWith('Cta')
          ? <fieldset key={key} className="rounded border border-[var(--bf-dev-border)] p-3"><legend className="px-1 text-[11px]">{LABELS[key]}</legend><div className="grid gap-3 sm:grid-cols-2">{['label', 'href'].map((field) => <EditorField key={field} name={field} value={data[key]?.[field]} onChange={(value) => update(key, { ...data[key], [field]: value })} />)}</div></fieldset>
          : <EditorField key={key} name={key} value={data[key]} onChange={(value) => update(key, value)} />)}
        {fields.includes('items') && <div className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold">Items</h3><SmallButton icon={Plus} disabled={items.length >= 100} onClick={() => update('items', [...items, newItem(section.type)])}>Add item</SmallButton></div>
          {items.map((item, index) => <fieldset key={item.id} className="space-y-3 rounded border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3">
            <legend className="px-1 text-[11px]">Item {index + 1}</legend>
            {ITEM_FIELDS[section.type].map((key) => <EditorField key={key} name={key} value={item[key]} onChange={(value) => editItem(item.id, key, value)} />)}
            <div className="flex flex-wrap gap-2">
              <SmallButton icon={ArrowUp} disabled={index === 0} onClick={() => update('items', moveEntry(items, index, -1))}>Move Up</SmallButton>
              <SmallButton icon={ArrowDown} disabled={index === items.length - 1} onClick={() => update('items', moveEntry(items, index, 1))}>Move Down</SmallButton>
              <SmallButton icon={Trash2} onClick={() => update('items', items.filter((entry) => entry.id !== item.id))}>Remove item</SmallButton>
            </div>
          </fieldset>)}
        </div>}
      </div>
      {editorError && <p role="alert" className="mt-3 text-[11px]">{editorError}</p>}
      <p className="mt-4 text-[10px] text-[var(--bf-dev-text-3)]">Changes stay local until you save the draft.</p>
      <div className="mt-4 flex justify-end gap-2"><SmallButton onClick={onClose}>Cancel</SmallButton><button type="submit" className="rounded border border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] px-3 py-1.5 text-[10px] font-semibold text-white">Apply changes</button></div>
    </form>
  </EditorDialog>;
}

export default function PageBuilder() {
  const [draft, setDraft] = useState(null);
  const [draftLoading, setDraftLoading] = useState(true);
  const [draftError, setDraftError] = useState('');
  const [draftSaving, setDraftSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [sectionEditorOpen, setSectionEditorOpen] = useState(false);
  const [sectionBeingEdited, setSectionBeingEdited] = useState(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const savingRef = useRef(false);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);
  const [pageName, setPageName] = useState('');
  const [pagePath, setPagePath] = useState('');
  const [createError, setCreateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const successTimerRef = useRef(null);
  const dialogRef = useRef(null);
  const creatingRef = useRef(false);

  useEffect(() => () => window.clearTimeout(successTimerRef.current), []);

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

  useEffect(() => {
    if (!selectedPageId) {
      setDraft(null);
      setDraftLoading(false);
      setDraftError('');
      return;
    }

    setDraft(null);
    setDraftLoading(true);
    setDraftError('');

    let cancelled = false;
    getWebsitePageDraft(selectedPageId).then((result) => {
      if (cancelled) return;
      if (result.ok && result.draft?.page_id === selectedPageId && Array.isArray(result.draft.content?.sections)) {
        setDraft(result.draft);
        setPages((current) => current.map((page) => page.id === selectedPageId ? { ...page, current_draft_version_id: result.draft.id } : page));
      } else {
        setDraftError('Unable to load draft.');
      }
      setDraftLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedPageId]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const notify = (message) => {
    window.clearTimeout(successTimerRef.current);
    setSuccessMessage(message);
    successTimerRef.current = window.setTimeout(() => setSuccessMessage(''), 3000);
  };
  const resetDraft = () => {
    setDraft(null);
    setDraftLoading(true);
    setDraftError('');
    setDirty(false);
    setSectionEditorOpen(false);
    setSectionBeingEdited(null);
    setAddSectionOpen(false);
  };
  const selectPage = (pageId) => {
    if (pageId === selectedPageId || savingRef.current || creatingRef.current) return;
    if (dirty && !window.confirm('Discard unsaved changes and switch pages?')) return;
    resetDraft();
    setSelectedPageId(pageId);
  };
  const activeDraft = draft?.page_id === selectedPageId ? draft : null;
  const sections = [...(activeDraft?.content.sections || [])].sort((a, b) => a.order - b.order);
  const editSections = (next) => {
    if (!activeDraft || savingRef.current || creatingRef.current) return;
    setDraft((current) => ({ ...current, content: { ...current.content, sections: next } }));
    setDirty(true);
  };
  const saveDraft = async () => {
    if (!dirty || !activeDraft || savingRef.current || creatingRef.current || sectionEditorOpen) return;
    savingRef.current = true;
    setDraftSaving(true);
    setDraftError('');
    try {
      const result = await saveWebsitePageDraft({ pageId: selectedPageId, revision: activeDraft.revision, content: activeDraft.content });
      if (result.ok && result.draft?.page_id === selectedPageId) {
        setDraft(result.draft);
        setDirty(false);
        notify('Draft saved successfully.');
      } else {
        setDraftError(result.status === 409 && result.code === 'DRAFT_CONFLICT'
          ? 'This draft changed elsewhere. Reload the page before saving again.' : 'Unable to save draft.');
      }
    } catch { setDraftError('Unable to save draft.'); }
    finally { savingRef.current = false; setDraftSaving(false); }
  };

  const createPage = async (event) => {
    event.preventDefault();
    if (creatingRef.current || savingRef.current) return;
    const name = pageName.trim();
    const path = pagePath.trim().replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
    if (!name) return setCreateError('Page name is required.');
    if (!pagePath.trim()) return setCreateError('Page URL is required.');
    if (!pagePath.trim().startsWith('/')) return setCreateError('Page URL must start with /.');
    if (path === '/' || pages.some((page) => page.path === path)) {
      return setCreateError('A page already exists at this URL.');
    }
    if (dirty && !window.confirm('Discard unsaved changes and select the new page after creation?')) return;
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
      resetDraft();
      setSelectedPageId(result.page.id);
      setCreatePageOpen(false);
      notify('Page created successfully.');
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
              onClick={() => notify('Preview will be available after the draft renderer is connected.')}
            >
              Preview
            </Button>

            <fieldset disabled={!dirty || !activeDraft || draftSaving || creatingPage || sectionEditorOpen} className="m-0 inline-flex min-w-0 border-0 p-0 disabled:opacity-50">
              <Button variant="primary" icon={Rocket} onClick={saveDraft}>
                {draftSaving ? 'Saving...' : 'Save draft'}
              </Button>
            </fieldset>
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
                if (loading || savingRef.current) return;
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
            {loading && <p role="status" className="p-3 text-[11px] text-[var(--bf-dev-text-3)]">Loading website pages…</p>}
            {error && <p role="alert" className="p-3 text-[11px] text-[var(--bf-dev-text-2)]">{error}</p>}
            {!loading && !error && !pages.length && <p className="p-3 text-[11px] text-[var(--bf-dev-text-3)]">No website pages.</p>}
            {pages.map(
              (page) => (
                <button
                  key={page.id}
                  onClick={() => selectPage(page.id)}
                  disabled={draftSaving || creatingPage}
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
            <CardHeader title="Page canvas" subtitle={dirty ? 'Unsaved changes' : 'Draft sections for the selected page'} action={
              <SmallButton icon={Plus} disabled={!activeDraft || draftLoading || draftSaving || creatingPage || sections.length >= 100} onClick={() => setAddSectionOpen(true)}>Add Section</SmallButton>
            } />
            {draftError && <p role="alert" className="px-4 pt-3 text-[11px] text-[var(--bf-dev-text-2)]">{draftError}</p>}
            {!selectedPageId ? <p className="p-4 text-[11px] text-[var(--bf-dev-text-3)]">Select a website page.</p>
              : draftLoading ? <p role="status" className="p-4 text-[11px] text-[var(--bf-dev-text-3)]">Loading draft...</p>
              : activeDraft && !sections.length ? <div className="p-4 text-[11px] text-[var(--bf-dev-text-2)]"><p className="font-semibold">No sections yet.</p><p className="mt-1">Add your first section to start building this page.</p></div> : null}
            <fieldset disabled={draftSaving || creatingPage} className="m-0 grid min-w-0 gap-3 border-0 p-4 md:grid-cols-2 xl:grid-cols-3">
              {sections.map((section, index) => {
                const entry = CATALOG.find(([type]) => type === section.type);
                const iconKey = section.data.items?.[0]?.icon;
                const Icon = Object.hasOwn(ICONS, iconKey) ? ICONS[iconKey] : entry?.[2] || Blocks;
                return <div key={section.id} className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-4">
                  <div className="flex items-center justify-between gap-2"><Icon size={17} className="text-[var(--bf-dev-primary)]" /><span className="text-[9px] text-[var(--bf-dev-text-3)]">{section.enabled ? 'Enabled' : 'Disabled'}</span></div>
                  <h3 className="mt-3 text-[11px] font-bold text-[var(--bf-dev-text)]">{entry?.[1] || 'Section'}</h3>
                  <p className="mt-1 truncate text-[10px] leading-5 text-[var(--bf-dev-text-2)]">{section.data.heading || section.data.items?.[0]?.title || 'Ready to edit'}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <SmallButton icon={Pencil} onClick={() => { setSectionBeingEdited(section); setSectionEditorOpen(true); }}>Edit</SmallButton>
                    <SmallButton icon={ArrowUp} disabled={index === 0} onClick={() => editSections(moveEntry(sections, index, -1).map((item, order) => ({ ...item, order: (order + 1) * 10 })))}>Move Up</SmallButton>
                    <SmallButton icon={ArrowDown} disabled={index === sections.length - 1} onClick={() => editSections(moveEntry(sections, index, 1).map((item, order) => ({ ...item, order: (order + 1) * 10 })))}>Move Down</SmallButton>
                    <SmallButton onClick={() => editSections(sections.map((item) => item.id === section.id ? { ...item, enabled: !item.enabled } : item))}>{section.enabled ? 'Disable' : 'Enable'}</SmallButton>
                    <SmallButton icon={Trash2} onClick={() => editSections(sections.filter((item) => item.id !== section.id))}>Remove</SmallButton>
                  </div>
                </div>;
              })}
            </fieldset>
          </Card>

          <Card>
            <CardHeader
              title="Builder status"
              subtitle="Draft changes are isolated from the live website"
            />

            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {[
                ['Draft pages', loading || error ? '?' : pages.filter((page) => page.status === 'draft' || page.current_draft_version_id).length, PencilRuler],
                ['Reusable blocks', CATALOG.length, Blocks],
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
      <div role="status" aria-live="polite" aria-atomic="true">
        {successMessage && (
          <div className="fixed right-4 top-[calc(var(--bf-header-height,66px)+var(--bf-horizontal-nav-height,52px)+12px)] z-[80] flex max-w-[calc(100vw-28px)] items-center gap-2 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-4 py-3 text-[11px] font-medium text-[var(--bf-dev-text)] shadow-sm">
            <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 text-emerald-500" />
            {successMessage}
          </div>
        )}
      </div>
      {addSectionOpen && <EditorDialog title="Add Section" onClose={() => setAddSectionOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {CATALOG.map(([type, label, Icon]) => <SmallButton key={type} icon={Icon} onClick={() => {
            if (!activeDraft || sections.length >= 100 || savingRef.current) return;
            editSections([...sections, { id: newId(), type, enabled: true, order: (Math.floor(Math.max(0, ...sections.map((section) => section.order)) / 10) + 1) * 10, variant: 'default', data: defaultData(type) }]);
            setAddSectionOpen(false);
          }}>{label}</SmallButton>)}
        </div>
      </EditorDialog>}
      {sectionEditorOpen && sectionBeingEdited && <SectionEditor key={sectionBeingEdited.id} section={sectionBeingEdited} onClose={() => { setSectionEditorOpen(false); setSectionBeingEdited(null); }} onApply={(section) => {
        editSections(sections.map((item) => item.id === section.id ? section : item));
        setSectionEditorOpen(false);
        setSectionBeingEdited(null);
      }} />}
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
            <button type="submit" disabled={creatingPage} className="rounded border border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-[var(--bf-dev-primary-strong)] disabled:opacity-50">{creatingPage ? 'Creating…' : 'Create Page'}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
