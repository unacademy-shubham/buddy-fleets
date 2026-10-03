import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Layers3,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import {
  getCompanyModuleOverrides,
  getPlanFleetEntitlements,
  getRegistryBootstrap,
  removeCompanyModuleOverride,
  removeFleetPackModule,
  saveCompanyModuleOverride,
  saveFleetPackModule,
  saveNavigationNode,
  savePlanFleetEntitlement,
  setCompanyFleetPacks,
  updateFleetPack,
  updateRegistryModule,
} from '../../../services/developerPlatformRegistryApi';

const card = 'rounded-xl border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_1px_2px_rgba(0,0,0,.04)]';
const input = 'h-10 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[12px] text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]';
const textarea = 'min-h-[92px] w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2 text-[12px] text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]';
const label = 'block text-[10px] font-semibold text-[var(--bf-dev-text-2)]';

function Button({ children, primary = false, danger = false, header = false, icon: Icon, ...props }) {
  const headerStyle = 'border-white/30 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_1px_2px_rgba(0,0,0,.08)] hover:border-white/45 hover:bg-white/20 hover:text-white';
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 border px-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${header ? 'min-h-[32px] rounded-[4px] text-[10px] ' + headerStyle : 'min-h-9 rounded-lg text-[11px] ' + (primary ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white' : danger ? 'border-rose-500/30 bg-rose-500/10 text-rose-500' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)]')}`}
    >
      {Icon && <Icon size={header ? 13 : 14} />}{children}
    </button>
  );
}

function Header({ title, description, loading, reload }) {
  return (
    <>
      <section className="bg-[var(--bf-dev-primary)] px-5 pb-9 pt-6 text-white sm:px-7 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div><h1 className="text-[clamp(24px,2vw,31px)] font-semibold tracking-[-.025em]">{title}</h1><p className="mt-1.5 max-w-4xl text-[13px] leading-5 text-white/80">{description}</p></div>
          <Button header icon={RefreshCcw} onClick={reload} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
        </div>
      </section>
    </>
  );
}

function Notice({ error, success }) {
  if (!error && !success) return null;
  return <div className={`${card} p-3 text-[11px] ${error ? 'border-rose-500/25 text-rose-500' : 'border-emerald-500/25 text-emerald-500'}`}>{error || success}</div>;
}

function FleetPacksPanel({ data, refresh, setMessage }) {
  const [selectedKey, setSelectedKey] = useState(data.fleetPacks?.[0]?.pack_key || '');
  const pack = useMemo(() => data.fleetPacks.find((item) => item.pack_key === selectedKey) || data.fleetPacks[0] || null, [data.fleetPacks, selectedKey]);
  const [draft, setDraft] = useState(pack ? { ...pack } : null);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(pack ? { ...pack } : null), [pack?.pack_key, pack?.updated_at]);

  async function save() {
    if (!draft) return;
    setSaving(true); setMessage('', '');
    const result = await updateFleetPack({
      packKey: draft.pack_key, name: draft.name, shortName: draft.short_name, description: draft.description,
      iconKey: draft.icon_key, status: draft.status, displayOrder: Number(draft.display_order || 100),
      terminology: draft.terminology || {}, config: draft.config || {},
    });
    if (result.ok) { setMessage('', 'Fleet Pack saved successfully.'); await refresh(); }
    else setMessage(result.message || result.code || 'Unable to save Fleet Pack.', '');
    setSaving(false);
  }

  return <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
    <div className={`${card} p-3`}><div className="mb-2 text-[11px] font-bold">7 Fleet Packs</div><div className="space-y-2">{data.fleetPacks.map((item) => <button key={item.pack_key} onClick={() => setSelectedKey(item.pack_key)} className={`w-full rounded-lg border p-3 text-left ${pack?.pack_key === item.pack_key ? 'border-[var(--bf-dev-primary)] bg-[rgb(var(--bf-dev-primary-rgb)/.08)]' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]'}`}><div className="text-[12px] font-bold">{item.name}</div><div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">{item.pack_key} · {item.status}</div></button>)}</div></div>
    <div className={`${card} p-4`}>{draft ? <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Name<input className={input} value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label><label className={label}>Short name<input className={input} value={draft.short_name || ''} onChange={(e) => setDraft({ ...draft, short_name: e.target.value })} /></label><label className={label}>Slug<input className={input} value={draft.slug || ''} disabled /></label><label className={label}>Status<select className={input} value={draft.status || 'active'} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option value="active">active</option><option value="inactive">inactive</option><option value="archived">archived</option></select></label><label className={label}>Icon key<input className={input} value={draft.icon_key || ''} onChange={(e) => setDraft({ ...draft, icon_key: e.target.value })} /></label><label className={label}>Display order<input className={input} type="number" value={draft.display_order ?? 100} onChange={(e) => setDraft({ ...draft, display_order: e.target.value })} /></label></div>
      <label className={label}>Description<textarea className={textarea} value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
      <div className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3"><div className="text-[10px] font-bold">Registry status</div><div className="mt-2 grid gap-2 text-[10px] text-[var(--bf-dev-text-2)] sm:grid-cols-3"><div>Pack key: <b>{draft.pack_key}</b></div><div>Slug: <b>{draft.slug}</b></div><div>Modules: <b>{data.mappings.filter((m) => m.pack_key === draft.pack_key).length}</b></div></div></div>
      <div className="flex justify-end"><Button primary icon={Save} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Fleet Pack'}</Button></div>
    </div> : <div className="text-[11px] text-[var(--bf-dev-text-3)]">No Fleet Pack found.</div>}</div>
  </div>;
}

function MappingPanel({ data, refresh, setMessage }) {
  const [packKey, setPackKey] = useState(data.fleetPacks?.[0]?.pack_key || '');
  const [query, setQuery] = useState('');
  const [savingKey, setSavingKey] = useState('');
  const mapped = useMemo(() => new Map(data.mappings.filter((m) => m.pack_key === packKey).map((m) => [m.module_key, m])), [data.mappings, packKey]);
  const modules = useMemo(() => data.modules.filter((m) => `${m.module_name} ${m.module_key} ${m.category}`.toLowerCase().includes(query.trim().toLowerCase())), [data.modules, query]);

  async function toggle(module, enabled) {
    setSavingKey(module.module_key); setMessage('', '');
    const current = mapped.get(module.module_key);
    const result = enabled
      ? await saveFleetPackModule({ packKey, moduleKey: module.module_key, defaultEnabled: current?.default_enabled !== false, isCore: current?.is_core === true, sortOrder: current?.sort_order ?? module.sort_order ?? 100 })
      : await removeFleetPackModule({ packKey, moduleKey: module.module_key });
    if (result.ok) { setMessage('', `${module.module_name} mapping updated.`); await refresh(); }
    else setMessage(result.message || result.code || 'Unable to update module mapping.', '');
    setSavingKey('');
  }

  async function updateMapping(module, patch) {
    const current = mapped.get(module.module_key);
    if (!current) return;
    setSavingKey(module.module_key);
    const result = await saveFleetPackModule({ packKey, moduleKey: module.module_key, defaultEnabled: patch.defaultEnabled ?? current.default_enabled, isCore: patch.isCore ?? current.is_core, sortOrder: patch.sortOrder ?? current.sort_order, config: current.config || {} });
    if (result.ok) await refresh(); else setMessage(result.message || result.code || 'Unable to update mapping.', '');
    setSavingKey('');
  }

  return <div className="space-y-4"><div className={`${card} grid gap-3 p-4 lg:grid-cols-[280px_1fr]`}><label className={label}>Fleet Pack<select className={input} value={packKey} onChange={(e) => setPackKey(e.target.value)}>{data.fleetPacks.map((p) => <option key={p.pack_key} value={p.pack_key}>{p.name}</option>)}</select></label><label className={label}>Search modules<div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bf-dev-text-3)]"/><input className={`${input} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Module name, key or category"/></div></label></div>
    <div className={`${card} overflow-hidden`}><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-[11px]"><thead className="bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-3)]"><tr><th className="px-4 py-3">Module</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Mapped</th><th className="px-4 py-3">Core</th><th className="px-4 py-3">Default enabled</th><th className="px-4 py-3">Sort</th></tr></thead><tbody>{modules.map((module) => { const row = mapped.get(module.module_key); return <tr key={module.module_key} className="border-t border-[var(--bf-dev-border)]"><td className="px-4 py-3"><div className="font-bold">{module.module_name}</div><div className="text-[9px] text-[var(--bf-dev-text-3)]">{module.module_key}</div></td><td className="px-4 py-3">{module.category}</td><td className="px-4 py-3"><input type="checkbox" checked={Boolean(row)} disabled={savingKey === module.module_key} onChange={(e) => toggle(module, e.target.checked)} /></td><td className="px-4 py-3"><input type="checkbox" checked={Boolean(row?.is_core)} disabled={!row || savingKey === module.module_key} onChange={(e) => updateMapping(module, { isCore: e.target.checked })} /></td><td className="px-4 py-3"><input type="checkbox" checked={row?.default_enabled !== false && Boolean(row)} disabled={!row || savingKey === module.module_key} onChange={(e) => updateMapping(module, { defaultEnabled: e.target.checked })} /></td><td className="px-4 py-3"><input type="number" className="h-8 w-20 rounded border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-2" value={row?.sort_order ?? module.sort_order ?? 100} disabled={!row || savingKey === module.module_key} onChange={(e) => updateMapping(module, { sortOrder: Number(e.target.value || 100) })}/></td></tr>; })}</tbody></table></div></div>
  </div>;
}

function PlanFleetPanel({ data, setMessage }) {
  const [planKey, setPlanKey] = useState(data.plans?.[0]?.plan_key || '');
  const [packKey, setPackKey] = useState(data.fleetPacks?.[0]?.pack_key || '');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState('');
  async function load() { setLoading(true); const result = await getPlanFleetEntitlements(planKey, packKey); setRows(result.ok ? result.entitlements || [] : []); if (!result.ok) setMessage(result.code || 'Unable to load plan matrix.', ''); setLoading(false); }
  useEffect(() => { if (planKey && packKey) load(); }, [planKey, packKey]);
  const access = useMemo(() => new Map(rows.map((row) => [row.module_key, row.access_level])), [rows]);
  const packModules = data.mappings.filter((m) => m.pack_key === packKey).map((m) => data.modules.find((module) => module.module_key === m.module_key)).filter(Boolean);
  async function save(moduleKey, accessLevel) { setSavingKey(moduleKey); const result = await savePlanFleetEntitlement({ planKey, packKey, moduleKey, accessLevel }); if (result.ok) { setMessage('', 'Plan × Fleet entitlement saved.'); await load(); } else setMessage(result.message || result.code || 'Unable to save entitlement.', ''); setSavingKey(''); }
  return <div className="space-y-4"><div className={`${card} grid gap-3 p-4 sm:grid-cols-2`}><label className={label}>Plan<select className={input} value={planKey} onChange={(e) => setPlanKey(e.target.value)}>{data.plans.map((p) => <option key={p.plan_key} value={p.plan_key}>{p.name}</option>)}</select></label><label className={label}>Fleet Pack<select className={input} value={packKey} onChange={(e) => setPackKey(e.target.value)}>{data.fleetPacks.map((p) => <option key={p.pack_key} value={p.pack_key}>{p.name}</option>)}</select></label></div><div className={`${card} overflow-hidden`}><div className="border-b border-[var(--bf-dev-border)] p-4 text-[11px] text-[var(--bf-dev-text-2)]">{loading ? 'Loading matrix…' : `${packModules.length} mapped modules. Trial runtime still resolves to Apex independently of commercial plan pricing.`}</div><div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{packModules.map((module) => <div key={module.module_key} className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3"><div className="font-bold text-[11px]">{module.module_name}</div><div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">{module.module_key}</div><select className={`${input} mt-3`} value={access.get(module.module_key) || 'blocked'} disabled={savingKey === module.module_key} onChange={(e) => save(module.module_key, e.target.value)}><option value="full">Full</option><option value="read_only">Read only</option><option value="blocked">Blocked</option></select></div>)}</div></div></div>;
}

function ModulesPanel({ data, refresh, setMessage }) {
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState(data.modules?.[0]?.module_key || '');
  const module = data.modules.find((m) => m.module_key === selectedKey) || null;
  const [draft, setDraft] = useState(module ? { ...module } : null);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(module ? { ...module } : null), [module?.module_key, module?.updated_at]);
  const filtered = data.modules.filter((m) => `${m.module_name} ${m.module_key} ${m.category}`.toLowerCase().includes(query.toLowerCase()));
  async function save() { if (!draft) return; setSaving(true); const result = await updateRegistryModule({ moduleKey: draft.module_key, moduleName: draft.module_name, category: draft.category, description: draft.description, iconKey: draft.icon_key, route: draft.route, status: draft.status, fleetPacks: draft.fleet_packs || [], isCore: draft.is_core === true, websiteFeature: draft.website_feature === true, showInSidebar: draft.show_in_sidebar !== false, showOnDashboard: draft.show_on_dashboard === true, sortOrder: Number(draft.sort_order || 100) }); if (result.ok) { setMessage('', 'Module updated.'); await refresh(); } else setMessage(result.message || result.code || 'Unable to update module.', ''); setSaving(false); }
  return <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]"><div className={`${card} p-3`}><div className="relative mb-3"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bf-dev-text-3)]"/><input className={`${input} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search modules"/></div><div className="max-h-[64dvh] space-y-2 overflow-y-auto pr-1">{filtered.map((m) => <button key={m.module_key} onClick={() => setSelectedKey(m.module_key)} className={`w-full rounded-lg border p-3 text-left ${selectedKey === m.module_key ? 'border-[var(--bf-dev-primary)] bg-[rgb(var(--bf-dev-primary-rgb)/.08)]' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]'}`}><div className="text-[11px] font-bold">{m.module_name}</div><div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">{m.category} · {m.status}</div></button>)}</div></div><div className={`${card} p-4`}>{draft && <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><label className={label}>Module name<input className={input} value={draft.module_name || ''} onChange={(e) => setDraft({ ...draft, module_name: e.target.value })}/></label><label className={label}>Module key<input className={input} value={draft.module_key || ''} disabled/></label><label className={label}>Category<input className={input} value={draft.category || ''} onChange={(e) => setDraft({ ...draft, category: e.target.value })}/></label><label className={label}>Route<input className={input} value={draft.route || ''} onChange={(e) => setDraft({ ...draft, route: e.target.value })}/></label><label className={label}>Status<select className={input} value={draft.status || 'active'} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option value="active">active</option><option value="inactive">inactive</option><option value="archived">archived</option></select></label><label className={label}>Sort order<input className={input} type="number" value={draft.sort_order ?? 100} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}/></label></div><label className={label}>Description<textarea className={textarea} value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })}/></label><div className="grid gap-3 sm:grid-cols-3"><label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={draft.show_in_sidebar !== false} onChange={(e) => setDraft({ ...draft, show_in_sidebar: e.target.checked })}/>Sidebar</label><label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={draft.show_on_dashboard === true} onChange={(e) => setDraft({ ...draft, show_on_dashboard: e.target.checked })}/>Dashboard</label><label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={draft.is_core === true} onChange={(e) => setDraft({ ...draft, is_core: e.target.checked })}/>Core module</label></div><div><div className="mb-2 text-[10px] font-bold">Fleet availability</div><div className="flex flex-wrap gap-2">{data.fleetPacks.map((p) => { const checked = (draft.fleet_packs || []).includes(p.pack_key); return <label key={p.pack_key} className="flex items-center gap-2 rounded-lg border border-[var(--bf-dev-border)] px-3 py-2 text-[10px]"><input type="checkbox" checked={checked} onChange={(e) => setDraft({ ...draft, fleet_packs: e.target.checked ? [...new Set([...(draft.fleet_packs || []), p.pack_key])] : (draft.fleet_packs || []).filter((x) => x !== p.pack_key) })}/>{p.short_name || p.name}</label>; })}</div></div><div className="flex justify-end"><Button primary icon={Save} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Module'}</Button></div></div>}</div></div>;
}

function NavigationPanel({ data, refresh, setMessage }) {
  const [selectedKey, setSelectedKey] = useState(data.navigation?.[0]?.node_key || '');
  const node = data.navigation.find((n) => n.node_key === selectedKey) || null;
  const [draft, setDraft] = useState(node ? { ...node } : null);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(node ? { ...node } : null), [node?.node_key, node?.updated_at]);
  const ordered = [...data.navigation].sort((a,b) => Number(a.sort_order||0)-Number(b.sort_order||0));
  async function save() { if (!draft) return; setSaving(true); const result = await saveNavigationNode({ nodeKey: draft.node_key, parentNodeKey: draft.parent_node_key, nodeType: draft.node_type, label: draft.label, moduleKey: draft.module_key, route: draft.route, iconKey: draft.icon_key, fleetPacks: draft.fleet_packs || [], placement: draft.placement || 'sidebar', sortOrder: Number(draft.sort_order || 100), status: draft.status || 'active', showInSidebar: draft.show_in_sidebar !== false, showOnDashboard: draft.show_on_dashboard === true, metadata: draft.metadata || {} }); if (result.ok) { setMessage('', 'Navigation node saved.'); await refresh(); } else setMessage(result.message || result.code || 'Unable to save navigation node.', ''); setSaving(false); }
  return <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]"><div className={`${card} max-h-[70dvh] overflow-y-auto p-3`}>{ordered.map((item) => <button key={item.node_key} onClick={() => setSelectedKey(item.node_key)} className={`mb-2 flex w-full items-center gap-2 rounded-lg border p-3 text-left ${selectedKey === item.node_key ? 'border-[var(--bf-dev-primary)] bg-[rgb(var(--bf-dev-primary-rgb)/.08)]' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]'}`}><ChevronRight size={13}/><div className="min-w-0"><div className="truncate text-[11px] font-bold">{item.label}</div><div className="truncate text-[9px] text-[var(--bf-dev-text-3)]">{item.node_type} · {item.node_key}</div></div></button>)}</div><div className={`${card} p-4`}>{draft && <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><label className={label}>Label<input className={input} value={draft.label || ''} onChange={(e) => setDraft({ ...draft, label: e.target.value })}/></label><label className={label}>Node key<input className={input} value={draft.node_key || ''} disabled/></label><label className={label}>Type<select className={input} value={draft.node_type || 'menu'} onChange={(e) => setDraft({ ...draft, node_type: e.target.value })}><option value="category">category</option><option value="menu">menu</option><option value="submenu">submenu</option><option value="level3">level3</option></select></label><label className={label}>Parent<select className={input} value={draft.parent_node_key || ''} onChange={(e) => setDraft({ ...draft, parent_node_key: e.target.value || null })}><option value="">Root</option>{ordered.filter((n) => n.node_key !== draft.node_key).map((n) => <option key={n.node_key} value={n.node_key}>{n.label} ({n.node_type})</option>)}</select></label><label className={label}>Module<select className={input} value={draft.module_key || ''} onChange={(e) => setDraft({ ...draft, module_key: e.target.value || null })}><option value="">Structural node</option>{data.modules.map((m) => <option key={m.module_key} value={m.module_key}>{m.module_name}</option>)}</select></label><label className={label}>Route<input className={input} value={draft.route || ''} onChange={(e) => setDraft({ ...draft, route: e.target.value })}/></label><label className={label}>Placement<select className={input} value={draft.placement || 'sidebar'} onChange={(e) => setDraft({ ...draft, placement: e.target.value })}><option value="sidebar">sidebar</option><option value="dashboard">dashboard</option><option value="both">both</option></select></label><label className={label}>Sort order<input className={input} type="number" value={draft.sort_order ?? 100} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}/></label></div><div><div className="mb-2 text-[10px] font-bold">Fleet Packs (blank = shared)</div><div className="flex flex-wrap gap-2">{data.fleetPacks.map((p) => <label key={p.pack_key} className="flex items-center gap-2 rounded-lg border border-[var(--bf-dev-border)] px-3 py-2 text-[10px]"><input type="checkbox" checked={(draft.fleet_packs || []).includes(p.pack_key)} onChange={(e) => setDraft({ ...draft, fleet_packs: e.target.checked ? [...new Set([...(draft.fleet_packs || []), p.pack_key])] : (draft.fleet_packs || []).filter((x) => x !== p.pack_key) })}/>{p.short_name || p.name}</label>)}</div></div><div className="flex justify-end"><Button primary icon={Save} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Navigation'}</Button></div></div>}</div></div>;
}

function CompanyOverridesPanel({ data, setMessage }) {
  const [companyId, setCompanyId] = useState(data.companies?.[0]?.id || '');
  const [primaryPack, setPrimaryPack] = useState(data.companies?.[0]?.portal_settings?.fleet_pack || data.fleetPacks?.[0]?.pack_key || '');
  const [enabledPacks, setEnabledPacks] = useState(data.companies?.[0]?.portal_settings?.enabled_packs || []);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedCompany = data.companies.find((c) => c.id === companyId);
  useEffect(() => { const settings = selectedCompany?.portal_settings; setPrimaryPack(settings?.fleet_pack || data.fleetPacks?.[0]?.pack_key || ''); setEnabledPacks(settings?.enabled_packs || []); if (companyId) { setLoading(true); getCompanyModuleOverrides(companyId).then((result) => { setOverrides(result.ok ? result.overrides || [] : []); setLoading(false); }); } }, [companyId]);
  const overrideMap = useMemo(() => new Map(overrides.map((o) => [o.module_key, o])), [overrides]);
  async function savePacks() { const result = await setCompanyFleetPacks({ companyId, primaryPack, enabledPacks: [...new Set([primaryPack, ...enabledPacks])] }); if (result.ok) setMessage('', 'Company Fleet Pack assignment saved.'); else setMessage(result.message || result.code || 'Unable to set company Fleet Packs.', ''); }
  async function saveOverride(moduleKey, accessLevel) { const result = await saveCompanyModuleOverride({ companyId, moduleKey, enabled: accessLevel !== 'blocked', accessLevel, reason: 'Developer CPanel company-specific override' }); if (result.ok) { setMessage('', 'Company module override saved.'); const next = await getCompanyModuleOverrides(companyId); setOverrides(next.ok ? next.overrides || [] : []); } else setMessage(result.message || result.code || 'Unable to save override.', ''); }
  async function clearOverride(moduleKey) { const result = await removeCompanyModuleOverride({ companyId, moduleKey }); if (result.ok) { const next = await getCompanyModuleOverrides(companyId); setOverrides(next.ok ? next.overrides || [] : []); } else setMessage(result.message || result.code || 'Unable to clear override.', ''); }
  return <div className="space-y-4"><div className={`${card} p-4`}><div className="grid gap-3 lg:grid-cols-3"><label className={label}>Company<select className={input} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>{data.companies.map((c) => <option key={c.id} value={c.id}>{c.company_name} ({c.company_code})</option>)}</select></label><label className={label}>Primary Fleet Pack<select className={input} value={primaryPack} onChange={(e) => { const value=e.target.value; setPrimaryPack(value); setEnabledPacks((current)=>[...new Set([value,...current])]); }}>{data.fleetPacks.map((p) => <option key={p.pack_key} value={p.pack_key}>{p.name}</option>)}</select></label><div className="flex items-end"><Button primary icon={Save} onClick={savePacks} disabled={!companyId}>Save Fleet Assignment</Button></div></div><div className="mt-3 flex flex-wrap gap-2">{data.fleetPacks.map((p) => <label key={p.pack_key} className="flex items-center gap-2 rounded-lg border border-[var(--bf-dev-border)] px-3 py-2 text-[10px]"><input type="checkbox" checked={enabledPacks.includes(p.pack_key)} disabled={p.pack_key===primaryPack} onChange={(e) => setEnabledPacks(e.target.checked ? [...new Set([...enabledPacks,p.pack_key])] : enabledPacks.filter((x)=>x!==p.pack_key))}/>{p.short_name||p.name}</label>)}</div><div className="mt-3 text-[10px] text-[var(--bf-dev-text-3)]">Current selection state: <b>{selectedCompany?.portal_settings?.fleet_pack_selection_status || 'pending'}</b>. Saving here makes the Fleet Pack explicit and authoritative.</div></div><div className={`${card} overflow-hidden`}><div className="border-b border-[var(--bf-dev-border)] p-4 text-[11px] font-bold">Company Module Overrides {loading ? '· Loading…' : ''}</div><div className="overflow-x-auto"><table className="min-w-[780px] w-full text-left text-[11px]"><thead className="bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-3)]"><tr><th className="px-4 py-3">Module</th><th className="px-4 py-3">Current override</th><th className="px-4 py-3">Set override</th><th className="px-4 py-3">Clear</th></tr></thead><tbody>{data.modules.map((m) => { const o=overrideMap.get(m.module_key); return <tr key={m.module_key} className="border-t border-[var(--bf-dev-border)]"><td className="px-4 py-3"><b>{m.module_name}</b><div className="text-[9px] text-[var(--bf-dev-text-3)]">{m.module_key}</div></td><td className="px-4 py-3">{o ? `${o.enabled ? 'enabled' : 'disabled'} · ${o.access_level}` : 'Plan default'}</td><td className="px-4 py-3"><select className="h-9 rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-2" defaultValue={o?.access_level || 'full'} onChange={(e) => saveOverride(m.module_key,e.target.value)}><option value="full">Full</option><option value="read_only">Read only</option><option value="blocked">Blocked</option></select></td><td className="px-4 py-3"><Button danger={Boolean(o)} disabled={!o} onClick={()=>clearOverride(m.module_key)}>Clear</Button></td></tr>; })}</tbody></table></div></div></div>;
}

const modes = {
  'fleet-packs': ['Fleet Pack Registry', 'Manage the seven Buddy Fleets business packs without changing the client portal shell.'],
  'fleet-pack-modules': ['Fleet Pack Module Mapping', 'Choose which modules belong to each Fleet Pack and which workflow modules are core.'],
  'plan-fleet': ['Plan × Fleet Matrix', 'Manage Full, Read-only and Blocked access per plan, Fleet Pack and module.'],
  modules: ['Module Registry', 'Maintain module metadata, routes, Fleet Pack availability and visibility.'],
  navigation: ['Navigation Builder', 'Manage Category → Menu → Submenu → Level 3 navigation nodes from the central registry.'],
  'company-overrides': ['Company Fleet & Module Overrides', 'Assign real Fleet Packs and apply company-specific module exceptions without altering plan defaults.'],
};

export default function PlatformRegistryWorkspace({ mode = 'fleet-packs' }) {
  const [data, setData] = useState({ fleetPacks: [], modules: [], mappings: [], plans: [], navigation: [], companies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [title, description] = modes[mode] || modes['fleet-packs'];
  async function load() { setLoading(true); setError(''); const result = await getRegistryBootstrap(); if (result.ok) setData({ fleetPacks: result.fleetPacks || [], modules: result.modules || [], mappings: result.mappings || [], plans: result.plans || [], navigation: result.navigation || [], companies: result.companies || [] }); else setError(result.message || result.code || 'Unable to load platform registry.'); setLoading(false); }
  useEffect(() => { load(); }, []);
  function setMessage(nextError = '', nextSuccess = '') { setError(nextError); setSuccess(nextSuccess); }
  return <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] text-[var(--bf-dev-text)]"><Header title={title} description={description} loading={loading} reload={load}/><main className="-mt-[22px] space-y-4 px-4 pb-8 sm:px-6 lg:px-8"><Notice error={error} success={success}/>{loading ? <div className={`${card} p-8 text-center text-[12px] text-[var(--bf-dev-text-3)]`}>Loading live control-plane data…</div> : <>{mode==='fleet-packs'&&<FleetPacksPanel data={data} refresh={load} setMessage={setMessage}/>} {mode==='fleet-pack-modules'&&<MappingPanel data={data} refresh={load} setMessage={setMessage}/>} {mode==='plan-fleet'&&<PlanFleetPanel data={data} setMessage={setMessage}/>} {mode==='modules'&&<ModulesPanel data={data} refresh={load} setMessage={setMessage}/>} {mode==='navigation'&&<NavigationPanel data={data} refresh={load} setMessage={setMessage}/>} {mode==='company-overrides'&&<CompanyOverridesPanel data={data} setMessage={setMessage}/>}</>}</main></div>;
}
