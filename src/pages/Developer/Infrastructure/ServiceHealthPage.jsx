import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Database, RefreshCw, ServerCog, ShieldAlert } from 'lucide-react';
import { getDeveloperServiceHealth } from '../../../services/developerHealthApi';

const card = 'rounded-xl border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-4 shadow-[0_1px_2px_rgba(0,0,0,.04)]';

export default function ServiceHealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const result = await getDeveloperServiceHealth();
    setHealth(result);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const checks = Array.isArray(health?.checks) ? health.checks : [];
  const healthy = checks.filter((check) => check.ok).length;

  return (
    <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] text-[var(--bf-dev-text)]">
      <section className="bg-[var(--bf-dev-primary)] px-4 pb-8 pt-6 text-white sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><h1 className="text-[clamp(24px,2vw,30px)] font-semibold tracking-[-.03em]">Service Health</h1><p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-white/80">Live server-side health probes for tenant data, sessions, Fleet Packs, modules, entitlements, CMS and Part 05 platform foundations.</p></div>
          <button type="button" onClick={load} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-[11px] font-bold text-white disabled:opacity-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh</button>
        </div>
      </section>

      <div className="-mt-[22px] px-3 pb-8 sm:px-5 lg:px-8">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className={card}><div className="flex items-center justify-between"><div><div className="text-[9px] uppercase tracking-[.08em] text-[var(--bf-dev-text-3)]">Overall state</div><div className="mt-2 text-[22px] font-black capitalize">{health?.status || (loading ? 'Checking' : 'Unavailable')}</div></div><Activity size={20} className="text-[var(--bf-dev-primary)]" /></div></div>
            <div className={card}><div className="text-[9px] uppercase tracking-[.08em] text-[var(--bf-dev-text-3)]">Healthy probes</div><div className="mt-2 text-[22px] font-black">{healthy}/{checks.length || '—'}</div></div>
            <div className={card}><div className="text-[9px] uppercase tracking-[.08em] text-[var(--bf-dev-text-3)]">Checked at</div><div className="mt-2 text-[11px] font-bold">{health?.checkedAt ? new Date(health.checkedAt).toLocaleString() : '—'}</div></div>
            <div className={card}><div className="text-[9px] uppercase tracking-[.08em] text-[var(--bf-dev-text-3)]">Authority</div><div className="mt-2 text-[11px] font-bold">Developer server session</div><div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">No service-role data is exposed directly to browser queries.</div></div>
          </div>

          <section className={card}>
            <div className="flex items-center gap-2"><ServerCog size={17} className="text-[var(--bf-dev-primary)]" /><h2 className="text-[13px] font-black">Backend Probes</h2></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {checks.map((check) => (
                <div key={check.name} className="rounded-xl border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[11px] font-black">{check.name}</div><div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">{check.ok ? `${check.latencyMs} ms` : (check.code || 'Probe failed')}</div></div>{check.ok ? <CheckCircle2 size={18} className="shrink-0 text-emerald-500" /> : <ShieldAlert size={18} className="shrink-0 text-rose-500" />}</div>
                  {check.details ? <pre className="mt-3 max-h-28 overflow-auto rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-2 text-[8px] leading-4 text-[var(--bf-dev-text-3)]">{JSON.stringify(check.details, null, 2)}</pre> : null}
                  {!check.ok ? <div className="mt-3 text-[9px] leading-4 text-rose-500">{check.message || 'Backend dependency is unavailable.'}</div> : null}
                </div>
              ))}
              {!checks.length && !loading ? <div className="col-span-full py-10 text-center text-[11px] text-[var(--bf-dev-text-3)]">No health data returned.</div> : null}
            </div>
          </section>

          <section className={`${card} flex items-start gap-3`}><Database size={18} className="mt-0.5 shrink-0 text-[var(--bf-dev-primary)]" /><div><h3 className="text-[11px] font-black">Deployment note</h3><p className="mt-1 text-[10px] leading-5 text-[var(--bf-dev-text-3)]">If only “Part 05 platform add-ons” fails, apply the Part 05A SQL migration. Other failures identify the exact Buddy Fleets database/CMS/control-plane area that needs attention.</p></div></section>
        </div>
      </div>
    </div>
  );
}
