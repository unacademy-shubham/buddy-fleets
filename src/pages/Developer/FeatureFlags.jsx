import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Building2,
  Download,
  Eye,
  Flag,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';
import {
  getPlatformFinalizationSummary,
  getPlatformRecentActivity,
  previewDeveloperCompany,
  queueDeveloperExport,
  saveDeveloperWidgetPreset,
  updateDeveloperFeatureFlag,
  updateDeveloperMaintenanceMode,
  searchDeveloperPlatform,
} from '../../services/developerFinalizationApi';

const tabs = [
  ['overview', 'Overview', SlidersHorizontal],
  ['search', 'Global Search', Search],
  ['flags', 'Feature Flags', Flag],
  ['maintenance', 'Maintenance', Wrench],
  ['widgets', 'Widget Manager', LayoutDashboard],
  ['exports', 'Export Center', Download],
  ['preview', 'View as Company', Eye],
  ['activity', 'Recent Activity', Activity],
];

const card = 'rounded-xl border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-4 shadow-[0_1px_2px_rgba(0,0,0,.04)]';
const input = 'h-10 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[12px] text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]';
const label = 'space-y-1.5 text-[10px] font-semibold uppercase tracking-[.07em] text-[var(--bf-dev-text-3)]';

function Button({ children, primary = false, danger = false, header = false, icon: Icon, disabled = false, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 border px-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        header
          ? 'min-h-[32px] rounded-[4px] text-[10px] border-white/30 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_1px_2px_rgba(0,0,0,.08)] hover:border-white/45 hover:bg-white/20 hover:text-white'
          : 'min-h-9 rounded-lg text-[11px] ' + (primary
            ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white'
            : danger
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
              : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)] hover:text-[var(--bf-dev-text)]')
      }`}
    >
      {Icon ? <Icon size={header ? 13 : 14} /> : null}
      {children}
    </button>
  );
}

function Stat({ title, value, sub, icon: Icon }) {
  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--bf-dev-text-3)]">{title}</div>
          <div className="mt-2 text-[24px] font-black tracking-[-.03em] text-[var(--bf-dev-text)]">{value}</div>
          {sub ? <div className="mt-1 text-[10px] text-[var(--bf-dev-text-3)]">{sub}</div> : null}
        </div>
        {Icon ? <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]"><Icon size={18} /></div> : null}
      </div>
    </div>
  );
}

function StatusPill({ active, children }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${active ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-3)]'}`}>
      {children}
    </span>
  );
}

export default function DeveloperPlatformToolsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewCompanyId, setPreviewCompanyId] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewTargetUserId, setPreviewTargetUserId] = useState('');
  const [exportType, setExportType] = useState('companies');
  const [exportCompanyId, setExportCompanyId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    const result = await getPlatformFinalizationSummary();
    if (!result.ok) {
      setError(result.code === 'PART_05_MIGRATION_REQUIRED' ? 'Run the Part 05A Supabase migration first.' : (result.code || 'Unable to load platform tools.'));
      setLoading(false);
      return;
    }
    setSummary(result.summary || {});
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (tab !== 'activity') return;
    getPlatformRecentActivity().then((result) => {
      if (result.ok) setActivity(result.activity || []);
    });
  }, [tab]);

  const maintenance = summary?.maintenance || {};
  const companyList = summary?.companyList || [];
  const featureFlags = summary?.featureFlags || [];
  const widgetPresets = summary?.widgetPresets || [];
  const exportJobs = summary?.exportJobs || [];

  const defaultPreviewCompany = useMemo(() => previewCompanyId || companyList[0]?.id || '', [previewCompanyId, companyList]);

  async function run(label, fn) {
    setSaving(label);
    setError('');
    setMessage('');
    const result = await fn();
    setSaving('');
    if (!result?.ok) {
      setError(result?.code || 'Action failed.');
      return result;
    }
    setMessage('Changes saved successfully.');
    await load();
    return result;
  }

  async function toggleFlag(flag) {
    await run(`flag:${flag.flag_key}`, () => updateDeveloperFeatureFlag({
      flagKey: flag.flag_key,
      enabled: !flag.enabled,
      rolloutPercent: flag.enabled ? 0 : Math.max(100, Number(flag.rollout_percent || 0)),
      scope: flag.scope || {},
    }));
  }

  async function saveMaintenance(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await run('maintenance', () => updateDeveloperMaintenanceMode({
      enabled: form.get('enabled') === 'on',
      readOnly: form.get('readOnly') === 'on',
      message: form.get('message'),
      allowDeveloperAccess: true,
      allowTeamAccess: form.get('allowTeamAccess') === 'on',
    }));
  }

  async function savePreset(event, preset) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const widgets = String(form.get('widgets') || '').split(',').map((v) => v.trim()).filter(Boolean);
    await run(`preset:${preset.preset_key}`, () => saveDeveloperWidgetPreset({
      presetKey: preset.preset_key,
      name: form.get('name'),
      fleetPack: preset.fleet_pack,
      widgets,
      isDefault: true,
    }));
  }

  async function createExport(event) {
    event.preventDefault();
    await run('export', () => queueDeveloperExport({
      exportType,
      companyId: exportCompanyId || null,
      filters: {},
    }));
  }

  async function runGlobalSearch(event) {
    event?.preventDefault?.();
    const q = searchQuery.trim();
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    setError('');
    const result = await searchDeveloperPlatform(q);
    setSearching(false);
    if (!result.ok) { setError(result.code || 'Search failed.'); setSearchResults([]); return; }
    setSearchResults(result.results || []);
  }

  async function loadPreview() {
    const companyId = defaultPreviewCompany;
    if (!companyId) return;
    setSaving('preview');
    setError('');
    const result = await previewDeveloperCompany(companyId, previewTargetUserId);
    setSaving('');
    if (!result.ok) {
      setError(result.code || 'Unable to resolve preview.');
      return;
    }
    setPreview(result.preview || null);
  }

  return (
    <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] text-[var(--bf-dev-text)]">
      <section className="bg-[var(--bf-dev-primary)] px-4 pb-8 pt-6 text-white sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[clamp(24px,2vw,30px)] font-semibold tracking-[-.03em]">Platform Tools & Add-ons</h1>
            <p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-white/80">Feature flags, audited company preview, dashboard widgets, export queue, maintenance controls and final platform operations.</p>
          </div>
          <Button header icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
        </div>
      </section>

      <div className="-mt-[22px] px-3 pb-8 sm:px-5 lg:px-8">
        <div className="space-y-4">
          <div className={`${card} overflow-x-auto p-2`}>
            <div className="flex min-w-max gap-1">
              {tabs.map(([key, text, Icon]) => (
                <button key={key} type="button" onClick={() => setTab(key)} className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[11px] font-bold transition ${tab === key ? 'bg-[var(--bf-dev-primary)] text-white' : 'text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)]'}`}>
                  <Icon size={14} />{text}
                </button>
              ))}
            </div>
          </div>

          {error ? <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-[11px] font-semibold text-rose-500">{error}</div> : null}
          {message ? <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-[11px] font-semibold text-emerald-500">{message}</div> : null}

          {loading ? <div className={`${card} flex min-h-40 items-center justify-center`}><Loader2 className="animate-spin text-[var(--bf-dev-primary)]" size={24} /></div> : null}

          {!loading && tab === 'overview' ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat title="Companies" value={summary?.companies || 0} sub={`${summary?.pendingFleetPackSelection || 0} awaiting fleet selection`} icon={Building2} />
                <Stat title="Fleet Packs" value={(summary?.fleetPacks || []).length} sub="Canonical dashboard families" icon={SlidersHorizontal} />
                <Stat title="Modules" value={(summary?.modules || []).length} sub={`${summary?.betaModules || 0} beta foundations`} icon={Settings2} />
                <Stat title="Feature Flags" value={featureFlags.length} sub={`${featureFlags.filter((f) => f.enabled).length} enabled`} icon={Flag} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className={card}>
                  <div className="flex items-center justify-between gap-3"><h2 className="text-[13px] font-black">Platform State</h2><StatusPill active={!maintenance.enabled}>{maintenance.enabled ? 'Maintenance' : 'Healthy'}</StatusPill></div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[
                      ['Maintenance', maintenance.enabled ? 'Enabled' : 'Off'],
                      ['Read-only mode', maintenance.read_only ? 'Enabled' : 'Off'],
                      ['Export queue', `${exportJobs.filter((job) => job.status === 'queued').length} queued`],
                      ['Widget presets', widgetPresets.length],
                    ].map(([k, v]) => <div key={k} className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3"><div className="text-[9px] uppercase tracking-[.08em] text-[var(--bf-dev-text-3)]">{k}</div><div className="mt-1 text-[12px] font-bold">{v}</div></div>)}
                  </div>
                </section>

                <section className={card}>
                  <h2 className="text-[13px] font-black">Finalization Principles</h2>
                  <div className="mt-3 space-y-2 text-[11px] leading-5 text-[var(--bf-dev-text-2)]">
                    <p>• View-as-Company is read-only and audited; it never creates an impersonated authenticated session.</p>
                    <p>• Advanced modules are registered as beta foundations and remain blocked until deliberately promoted.</p>
                    <p>• Usage limits remain unenforced until the final commercial limits decision is made.</p>
                    <p>• Existing cookie, service-role and tenant-authority security decisions remain unchanged.</p>
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {!loading && tab === 'search' ? (
            <section className={`${card} max-w-4xl`}>
              <div className="flex items-center gap-3"><Search size={18} className="text-[var(--bf-dev-primary)]" /><div><h2 className="text-[13px] font-black">Global Platform Search</h2><p className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">Search live companies, modules, Fleet Packs and plans from the server-authoritative Developer API.</p></div></div>
              <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={runGlobalSearch}>
                <input className={`${input} flex-1`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Company, code, module, Fleet Pack or plan…" />
                <Button type="submit" primary icon={Search} disabled={searching || searchQuery.trim().length < 2}>{searching ? 'Searching…' : 'Search'}</Button>
              </form>
              <div className="mt-4 space-y-2">{searchResults.map((item) => <button key={`${item.type}:${item.key}`} type="button" onClick={() => navigate(item.to)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3 text-left transition hover:border-[var(--bf-dev-primary)]"><span className="min-w-0"><span className="block truncate text-[11px] font-bold">{item.title}</span><span className="mt-1 block truncate text-[9px] text-[var(--bf-dev-text-3)]">{item.subtitle}</span></span><span className="shrink-0 rounded-full border border-[var(--bf-dev-border)] px-2 py-1 text-[8px] font-bold uppercase tracking-[.08em] text-[var(--bf-dev-text-3)]">{String(item.type || '').replace('_', ' ')}</span></button>)}{searchQuery.trim().length >= 2 && !searching && !searchResults.length ? <div className="py-10 text-center text-[11px] text-[var(--bf-dev-text-3)]">Run a search to find live control-plane records.</div> : null}</div>
            </section>
          ) : null}

          {!loading && tab === 'flags' ? (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {featureFlags.map((flag) => (
                <section key={flag.flag_key} className={card}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><h3 className="text-[12px] font-black">{flag.name}</h3><p className="mt-1 text-[10px] leading-5 text-[var(--bf-dev-text-3)]">{flag.description}</p></div>
                    <StatusPill active={flag.enabled}>{flag.enabled ? 'On' : 'Off'}</StatusPill>
                  </div>
                  <div className="mt-3 text-[10px] text-[var(--bf-dev-text-2)]">Rollout: <b>{flag.rollout_percent}%</b></div>
                  <Button primary={!flag.enabled} danger={flag.enabled} icon={Flag} disabled={saving === `flag:${flag.flag_key}`} onClick={() => toggleFlag(flag)}>{flag.enabled ? 'Disable' : 'Enable'}</Button>
                </section>
              ))}
            </div>
          ) : null}

          {!loading && tab === 'maintenance' ? (
            <form className={`${card} max-w-3xl`} onSubmit={saveMaintenance}>
              <div className="flex items-center gap-3"><ShieldCheck className="text-[var(--bf-dev-primary)]" size={20} /><div><h2 className="text-[13px] font-black">Maintenance / Read-only Mode</h2><p className="mt-1 text-[10px] text-[var(--bf-dev-text-3)]">Control-plane foundation. Runtime enforcement can be activated deliberately after all portals are connected.</p></div></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-lg border border-[var(--bf-dev-border)] p-3 text-[11px] font-semibold"><input name="enabled" type="checkbox" defaultChecked={maintenance.enabled === true} /> Maintenance enabled</label>
                <label className="flex items-center gap-2 rounded-lg border border-[var(--bf-dev-border)] p-3 text-[11px] font-semibold"><input name="readOnly" type="checkbox" defaultChecked={maintenance.read_only === true} /> Read-only mode</label>
                <label className="flex items-center gap-2 rounded-lg border border-[var(--bf-dev-border)] p-3 text-[11px] font-semibold"><input name="allowTeamAccess" type="checkbox" defaultChecked={maintenance.allow_team_access !== false} /> Allow Team portal</label>
              </div>
              <label className={`${label} mt-4 block`}>User-facing message<textarea name="message" defaultValue={maintenance.message || 'Buddy Fleets maintenance is in progress.'} className="mt-1 min-h-24 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-3 text-[12px] normal-case tracking-normal text-[var(--bf-dev-text)] outline-none" /></label>
              <div className="mt-4"><Button type="submit" primary icon={Save} disabled={saving === 'maintenance'}>{saving === 'maintenance' ? 'Saving…' : 'Save Maintenance Policy'}</Button></div>
            </form>
          ) : null}

          {!loading && tab === 'widgets' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {widgetPresets.map((preset) => (
                <form key={preset.preset_key} className={card} onSubmit={(event) => savePreset(event, preset)}>
                  <div className="flex items-center justify-between gap-3"><div><h3 className="text-[12px] font-black">{preset.name}</h3><p className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">{preset.fleet_pack || 'Shared'} · {preset.preset_key}</p></div><StatusPill active={preset.status === 'active'}>{preset.status}</StatusPill></div>
                  <label className={`${label} mt-4 block`}>Preset name<input name="name" defaultValue={preset.name} className={`${input} mt-1`} /></label>
                  <label className={`${label} mt-3 block`}>Widget/module keys<textarea name="widgets" defaultValue={(preset.widgets || []).join(', ')} className="mt-1 min-h-24 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-3 text-[11px] normal-case tracking-normal text-[var(--bf-dev-text)] outline-none" /></label>
                  <div className="mt-4"><Button type="submit" primary icon={Save} disabled={saving === `preset:${preset.preset_key}`}>Save Preset</Button></div>
                </form>
              ))}
            </div>
          ) : null}

          {!loading && tab === 'exports' ? (
            <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
              <form className={card} onSubmit={createExport}>
                <h2 className="text-[13px] font-black">Queue Export</h2>
                <label className={`${label} mt-4 block`}>Export type<select className={`${input} mt-1`} value={exportType} onChange={(e) => setExportType(e.target.value)}>{['companies','users','modules','subscriptions','audit','vehicles','drivers','trips','finance','reports'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                <label className={`${label} mt-3 block`}>Company (optional)<select className={`${input} mt-1`} value={exportCompanyId} onChange={(e) => setExportCompanyId(e.target.value)}><option value="">Platform-wide</option>{companyList.map((c) => <option key={c.id} value={c.id}>{c.company_name} · {c.company_code}</option>)}</select></label>
                <div className="mt-4"><Button type="submit" primary icon={Download} disabled={saving === 'export'}>{saving === 'export' ? 'Queueing…' : 'Queue Export'}</Button></div>
                <p className="mt-3 text-[9px] leading-4 text-[var(--bf-dev-text-3)]">This release creates the auditable export queue. File generation workers/providers can be attached later without changing the UI contract.</p>
              </form>

              <section className={card}>
                <h2 className="text-[13px] font-black">Recent Export Jobs</h2>
                <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr>{['Type','Company','Status','Requested','Completed'].map((h) => <th key={h} className="border-b border-[var(--bf-dev-border)] px-3 py-2 text-[9px] uppercase text-[var(--bf-dev-text-3)]">{h}</th>)}</tr></thead><tbody>{exportJobs.map((job) => <tr key={job.id}><td className="border-b border-[var(--bf-dev-border)] px-3 py-2 text-[10px] font-semibold">{job.export_type}</td><td className="border-b border-[var(--bf-dev-border)] px-3 py-2 text-[10px]">{job.company_id || 'Platform'}</td><td className="border-b border-[var(--bf-dev-border)] px-3 py-2 text-[10px]">{job.status}</td><td className="border-b border-[var(--bf-dev-border)] px-3 py-2 text-[10px]">{new Date(job.requested_at).toLocaleString()}</td><td className="border-b border-[var(--bf-dev-border)] px-3 py-2 text-[10px]">{job.completed_at ? new Date(job.completed_at).toLocaleString() : '—'}</td></tr>)}</tbody></table></div>
              </section>
            </div>
          ) : null}

          {!loading && tab === 'preview' ? (
            <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
              <section className={card}>
                <div className="flex items-center gap-3"><Eye size={18} className="text-[var(--bf-dev-primary)]" /><div><h2 className="text-[13px] font-black">Read-only View as Company</h2><p className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">Audited access simulation without creating an impersonated browser session.</p></div></div>
                <label className={`${label} mt-4 block`}>Company<select className={`${input} mt-1`} value={defaultPreviewCompany} onChange={(e) => { setPreviewCompanyId(e.target.value); setPreviewTargetUserId(''); setPreview(null); }}><option value="">Choose company</option>{companyList.map((c) => <option key={c.id} value={c.id}>{c.company_name} · {c.company_code}</option>)}</select></label>
                <div className="mt-4"><Button primary icon={Search} onClick={loadPreview} disabled={!defaultPreviewCompany || saving === 'preview'}>{saving === 'preview' ? 'Resolving…' : 'Resolve Access'}</Button></div>
              </section>

              <section className={card}>
                {!preview ? <div className="flex min-h-40 items-center justify-center text-center text-[11px] text-[var(--bf-dev-text-3)]">Select a company to inspect its effective runtime access.</div> : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[15px] font-black">{preview.company?.company_name}</h2><p className="mt-1 text-[10px] text-[var(--bf-dev-text-3)]">{preview.company?.company_code} · {preview.company?.status}</p></div><StatusPill active>Read only</StatusPill></div>
                    {Array.isArray(preview.companyUsers) && preview.companyUsers.length ? (
                      <div className="flex flex-col gap-2 rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3 sm:flex-row sm:items-end">
                        <label className={`${label} flex-1`}>Access simulator user
                          <select className={`${input} mt-1`} value={previewTargetUserId || preview.targetUserId || ''} onChange={(e) => setPreviewTargetUserId(e.target.value)}>
                            {preview.companyUsers.map((user) => <option key={user.user_id} value={user.user_id}>{user.full_name || user.email || user.user_id} · {user.role_name || 'role'}</option>)}
                          </select>
                        </label>
                        <Button primary icon={Search} onClick={loadPreview} disabled={saving === 'preview'}>Simulate User Access</Button>
                      </div>
                    ) : null}
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{[
                      ['Lifecycle', preview.bootstrap?.lifecycle_state],
                      ['Lifecycle access', preview.bootstrap?.lifecycle_access],
                      ['Effective plan', preview.bootstrap?.effective_plan_key],
                      ['Fleet selection', preview.bootstrap?.fleet_pack_selection_status],
                      ['Primary pack', preview.bootstrap?.primary_pack || 'Pending'],
                      ['Visible modules', preview.bootstrap?.visible_module_count ?? 0],
                    ].map(([k, v]) => <div key={k} className="rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3"><div className="text-[9px] uppercase tracking-[.08em] text-[var(--bf-dev-text-3)]">{k}</div><div className="mt-1 text-[11px] font-bold">{String(v ?? '—')}</div></div>)}</div>
                    <div><h3 className="text-[11px] font-black">Navigation</h3><pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3 text-[9px] leading-4 text-[var(--bf-dev-text-2)]">{JSON.stringify(preview.bootstrap?.navigation || [], null, 2)}</pre></div>
                  </div>
                )}
              </section>
            </div>
          ) : null}

          {!loading && tab === 'activity' ? (
            <section className={card}>
              <div className="flex items-center justify-between gap-3"><h2 className="text-[13px] font-black">Recent Developer Activity</h2><Button icon={RefreshCw} onClick={() => getPlatformRecentActivity().then((r) => r.ok && setActivity(r.activity || []))}>Refresh</Button></div>
              <div className="mt-3 space-y-2">{activity.length ? activity.map((row) => <div key={row.id} className="flex flex-col gap-1 rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[10px] font-bold">{row.action || row.workspace_key || 'Activity'}</div><div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">{row.domain || row.workspace_key || 'developer'} · {row.entity_id || `revision ${row.revision || '—'}`}</div></div><div className="text-[9px] text-[var(--bf-dev-text-3)]">{row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</div></div>) : <div className="py-12 text-center text-[11px] text-[var(--bf-dev-text-3)]">No recent activity.</div>}</div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
