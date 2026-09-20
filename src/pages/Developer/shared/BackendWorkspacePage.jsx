import React, { useMemo, useState } from 'react';
import { Search, Settings, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import useDeveloperControlPlane from './useDeveloperControlPlane';
import ControlPlaneConfigDialog from './ControlPlaneConfigDialog';

const COMMON_CONFIGURATION_TEXT = 'Configure the key settings for this Developer CPanel area.';
const COMMON_OPERATIONAL_TEXT = 'Review current state, make controlled changes and keep an auditable workflow.';

function cx(...items) {
  return items.filter(Boolean).join(' ');
}

function Status({ status }) {
  const styles = {
    active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
    planned: 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]',
  };
  return <span className={cx('inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]', styles[status] || styles.active)}>{status}</span>;
}

function Card({ children, className = '' }) {
  return <section className={cx('rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_1px_2px_rgba(0,0,0,.04)]', className)}>{children}</section>;
}

export default function BackendWorkspacePage({ workspaceKey, title, description }) {
  const defaults = useMemo(() => ({ items: [
    { title: 'Overview', text: description, status: 'active', config: { enabled: true, notes: '' } },
    { title: 'Configuration', text: COMMON_CONFIGURATION_TEXT, status: 'active', config: { enabled: true, notes: '' } },
    { title: 'Operational Controls', text: COMMON_OPERATIONAL_TEXT, status: 'active', config: { enabled: true, notes: '' } },
  ] }), [description]);

  const { payload, saving, error, save } = useDeveloperControlPlane(workspaceKey, defaults);
  const [query, setQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const items = Array.isArray(payload?.items) && payload.items.length ? payload.items : defaults.items;

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.title} ${item.text} ${item.status}`.toLowerCase().includes(q));
  }, [items, query]);

  async function saveItem(nextItem) {
    const nextItems = items.map((item) => item.title === nextItem.title ? nextItem : item);
    const result = await save({ ...payload, items: nextItems });
    if (result.ok) setEditingItem(null);
  }

  return (
    <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] text-[var(--bf-dev-text)]">
      <section className="bg-[var(--bf-dev-primary)] px-6 pb-8 pt-6 text-white sm:px-7 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0"><h1 className="text-[27px] font-semibold tracking-[-0.02em]">{title}</h1><p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-white/80">{description}</p></div>
          <div className="text-[12px] font-medium text-white/80">Developer<span className="mx-2 text-white/35">/</span><span className="text-white">{title}</span></div>
        </div>
      </section>

      <div className="-mt-[22px] px-4 pb-6 sm:px-6 lg:px-8"><div className="space-y-4">
        <Card className="p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="text-[15px] font-semibold text-[var(--bf-dev-text)]">{title}</div><div className="mt-1 text-[12px] text-[var(--bf-dev-text-2)]">Developer CPanel feature workspace</div></div>
          <div className="relative w-full sm:max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bf-dev-text-3)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="h-10 w-full rounded-md border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] pl-9 pr-3 text-[13px] text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text-3)] focus:border-[var(--bf-dev-primary)]" /></div>
        </div></Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item, index) => {
            const Icon = [Settings, SlidersHorizontal, ShieldCheck][index % 3];
            return <Card key={item.title} className="p-4">
              <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]"><Icon size={17} /></div><Status status={item.status} /></div>
              <div className="mt-4 text-[14px] font-bold text-[var(--bf-dev-text)]">{item.title}</div>
              <div className="mt-1.5 text-[12px] leading-5 text-[var(--bf-dev-text-2)]">{item.text}</div>
              <button type="button" onClick={() => setEditingItem(item)} className="mt-4 inline-flex h-9 items-center rounded-md border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[12px] font-semibold text-[var(--bf-dev-text-2)] transition hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]">Configure</button>
            </Card>;
          })}
        </div>
      </div></div>
      {editingItem && <ControlPlaneConfigDialog item={editingItem} saving={saving} error={error} onClose={() => setEditingItem(null)} onSave={saveItem} />}
    </div>
  );
}
