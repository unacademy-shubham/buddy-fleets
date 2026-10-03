import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, ExternalLink, RefreshCw } from 'lucide-react';

const PERIODS = [1, 3, 6, 12];

function vehicleLabel(limits = {}) {
  const min = limits.vehicles_min;
  const max = limits.vehicles_max;
  if (min == null && max == null) return 'Custom Vehicles';
  if (max == null) return `${Number(min || 1)}+ Vehicles`;
  if (min == null || Number(min) <= 1) return `1–${max} Vehicles`;
  return `${min}–${max} Vehicles`;
}

function pluralLimit(value, singular) {
  if (value == null || value === '') return `Custom ${singular}s`;
  const count = Number(value);
  if (!Number.isFinite(count)) return `Custom ${singular}s`;
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

function entitlementLabel(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TrialExpiredPricing() {
  const [duration, setDuration] = useState(1);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const money = useMemo(
    () => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }),
    [],
  );

  async function loadPlans() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/public/pricing-plans', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.ok || !Array.isArray(payload.plans)) {
        throw new Error('PRICING_UNAVAILABLE');
      }

      setPlans(payload.plans);
    } catch {
      setPlans([]);
      setError('Live pricing is temporarily unavailable. You can still open the public Pricing page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-amber-400/25 bg-[var(--bf-surface)] shadow-sm">
      <div className="border-b border-amber-400/20 bg-amber-400/[0.07] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-500">Trial expired</p>
              <h2 className="mt-1 text-base font-black text-[var(--bf-text)] sm:text-lg">
                Your workspace is now read-only. Choose a plan to continue operations.
              </h2>
              <p className="mt-1 text-[11px] leading-5 text-[var(--bf-text-3)]">
                Your existing fleet data remains available for viewing, printing and permitted exports. Create, edit and delete actions stay disabled until a subscription is activated.
              </p>
            </div>
          </div>
          <a
            href="https://buddyfleets.in/pricing"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface-2)] px-4 text-[10px] font-black text-[var(--bf-text)] transition hover:border-cyan-400/40"
          >
            Public Pricing <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-black text-[var(--bf-text)]">Buddy Fleets Plans</h3>
            <p className="mt-1 text-[10px] text-[var(--bf-text-3)]">
              These values are loaded from the same live pricing source used by buddyfleets.in/pricing.
            </p>
          </div>

          <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface-2)] p-1">
            {PERIODS.map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => setDuration(months)}
                className={`rounded-lg px-3 py-2 text-[9px] font-black transition ${
                  duration === months
                    ? 'bg-cyan-500 text-white'
                    : 'text-[var(--bf-text-2)] hover:bg-[var(--bf-surface)]'
                }`}
              >
                {months} {months === 1 ? 'Month' : 'Months'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-5 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[var(--bf-border)] text-[11px] text-[var(--bf-text-3)]">
            Loading live pricing…
          </div>
        ) : error ? (
          <div className="mt-5 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--bf-border)] px-4 py-7 text-center">
            <p className="text-[11px] text-[var(--bf-text-3)]">{error}</p>
            <button type="button" className="bf-btn bf-btn-secondary" onClick={loadPlans}>
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const limits = plan.limits || {};
              const fleet = vehicleLabel(limits);
              const users = pluralLimit(limits.users, 'User');
              const sites = pluralLimit(limits.sites, 'Site');
              const price = Number(plan.prices?.[String(duration)] || 0);
              const features = Array.isArray(plan.entitlements) ? plan.entitlements : [];

              return (
                <article
                  key={plan.plan_key}
                  className={`relative flex min-w-0 flex-col rounded-2xl border bg-[var(--bf-surface-2)] p-4 ${
                    plan.badge ? 'border-cyan-400/40' : 'border-[var(--bf-border)]'
                  }`}
                >
                  {plan.badge ? (
                    <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] px-2 py-1 text-[7px] font-black uppercase tracking-[0.1em] text-white">
                      {plan.badge}
                    </span>
                  ) : null}

                  <h4 className="pr-16 text-base font-black text-[var(--bf-text)]">{plan.name}</h4>
                  <p className="mt-1 text-[9px] font-semibold text-[var(--bf-text-3)]">{fleet}</p>
                  <p className="mt-3 min-h-10 text-[10px] leading-5 text-[var(--bf-text-3)]">{plan.tagline}</p>

                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                    {[
                      ['Fleet', fleet],
                      ['Users', users],
                      ['Sites', sites],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0 rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface)] px-1.5 py-2">
                        <p className="text-[7px] font-bold uppercase tracking-wide text-[var(--bf-text-3)]">{label}</p>
                        <p className="mt-1 break-words text-[8px] font-black text-[var(--bf-text)]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--bf-text-3)]">
                      Total for {duration} {duration === 1 ? 'month' : 'months'}
                    </p>
                    <p className="mt-1 text-2xl font-black text-[var(--bf-text)]">₹{money.format(price)}</p>
                  </div>

                  <ul className="mt-4 space-y-1.5 text-[9px] leading-4 text-[var(--bf-text-2)]">
                    {[fleet, users, sites, ...features].slice(0, 10).map((feature, featureIndex) => (
                      <li key={`${feature}-${featureIndex}`} className="flex gap-2">
                        <Check size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span>{features.includes(feature) ? entitlementLabel(feature) : feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    <a
                      href={`https://buddyfleets.in/contact-us?plan=${encodeURIComponent(plan.plan_key || plan.name || '')}&source=trial-expired`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] px-3 text-[10px] font-black text-white"
                    >
                      Choose {plan.name}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
