import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Fuel,
  Gauge,
  Landmark,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  Route,
  ShieldCheck,
  Truck,
  Users,
  WalletCards,
  Wrench,
} from 'lucide-react';

const ICONS = {
  truck: Truck,
  users: Users,
  'shield-check': ShieldCheck,
  wrench: Wrench,
  'file-text': FileText,
  'badge-check': BadgeCheck,
  'wallet-cards': WalletCards,
  'clipboard-check': ClipboardCheck,
  'package-check': PackageCheck,
  'receipt-text': ReceiptText,
  fuel: Fuel,
  bell: Bell,
  'check-circle': CheckCircle2,
  gauge: Gauge,
  landmark: Landmark,
  route: Route,
  'alert-triangle': AlertTriangle,
  'message-circle': MessageCircle,
};

const sectionShell = 'relative px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12';
const card = 'rounded-[22px] border border-[color:var(--bf-border)] bg-[var(--bf-surface)] shadow-sm';

function IconFor({ name, size = 18, className = '' }) {
  const Icon = ICONS[name] || BadgeCheck;
  return <Icon size={size} aria-hidden="true" className={className} />;
}

function resolveHref(href, baseUrl) {
  const value = String(href || '').trim();
  if (!value) return '';
  if (/^(?:https?:|mailto:|tel:|#)/i.test(value)) return value;
  if (value.startsWith('/')) return `${baseUrl || ''}${value}` || value;
  return value;
}

function CtaLink({ cta, baseUrl, secondary = false }) {
  if (!cta?.label || !cta?.href) return null;

  return (
    <a
      href={resolveHref(cta.href, baseUrl)}
      target={baseUrl ? '_blank' : undefined}
      rel={baseUrl ? 'noreferrer' : undefined}
      className={secondary
        ? 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[color:var(--bf-border)] bg-[var(--bf-page-bg)] px-6 py-3 text-sm font-bold text-[color:var(--bf-text-primary)] transition hover:-translate-y-0.5 hover:border-cyan-400/30'
        : 'inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/10 transition hover:-translate-y-0.5 hover:shadow-blue-500/20'}
    >
      {cta.label}
    </a>
  );
}

function Heading({ eyebrow, heading, description, center = false }) {
  if (!eyebrow && !heading && !description) return null;

  return (
    <div className={center ? 'mx-auto max-w-4xl text-center' : 'max-w-4xl'}>
      {eyebrow && (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">
          {eyebrow}
        </p>
      )}
      {heading && (
        <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[color:var(--bf-text-primary)] sm:text-4xl">
          {heading}
        </h2>
      )}
      {description && (
        <p className="mt-3 text-sm leading-7 text-[color:var(--bf-text-secondary)] sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

function HeroSection({ section, baseUrl }) {
  const data = section.data || {};
  const centered = section.variant === 'centered';

  return (
    <section className={`${sectionShell} ${centered ? 'text-center' : ''}`}>
      <div className={`mx-auto max-w-7xl ${centered ? '' : 'grid items-center gap-8 lg:grid-cols-[1fr_0.92fr] lg:gap-12'}`}>
        <div className={centered ? 'mx-auto max-w-4xl' : 'relative z-10'}>
          {data.eyebrow && (
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500 sm:text-[10px]">
                {data.eyebrow}
              </span>
            </div>
          )}

          {data.heading && (
            <h1 className="text-[clamp(2.15rem,4.6vw,3.7rem)] font-black leading-[1.04] tracking-[-0.03em]">
              <span className="bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] bg-clip-text text-transparent">
                {data.heading}
              </span>
            </h1>
          )}

          {data.subheading && (
            <p className="mt-3 text-base font-bold text-[color:var(--bf-text-primary)]">
              {data.subheading}
            </p>
          )}

          {data.description && (
            <p className={`mt-4 text-sm leading-7 text-[color:var(--bf-text-secondary)] sm:text-base ${centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>
              {data.description}
            </p>
          )}

          {(data.primaryCta?.label || data.secondaryCta?.label) && (
            <div className={`mt-5 flex flex-col gap-3 sm:flex-row ${centered ? 'justify-center' : ''}`}>
              <CtaLink cta={data.primaryCta} baseUrl={baseUrl} />
              <CtaLink cta={data.secondaryCta} baseUrl={baseUrl} secondary />
            </div>
          )}

          {Array.isArray(data.trustItems) && data.trustItems.length > 0 && (
            <div className={`mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-[color:var(--bf-text-muted)] ${centered ? 'justify-center' : ''}`}>
              {data.trustItems.map((label) => (
                <span key={label} className="flex items-center gap-2">
                  <BadgeCheck size={14} aria-hidden="true" className="text-emerald-500" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {!centered && (
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -inset-5 rounded-[34px] bg-gradient-to-r from-cyan-500/10 via-blue-500/[0.07] to-emerald-500/[0.08] blur-3xl" />
            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#081425] p-4 shadow-2xl shadow-black/25">
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt={data.imageAlt || ''}
                  className="aspect-[4/3] w-full rounded-[18px] object-cover"
                  loading="eager"
                />
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-[18px] border border-white/[0.07] bg-[#0b111c] p-6 text-center">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-400">Buddy Fleets</p>
                    <p className="mt-2 text-xl font-black text-white">Fleet Operations Intelligence</p>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {['Fleet', 'Workflow', 'Reports'].map((label) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold text-slate-300">
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RichTextSection({ section }) {
  const data = section.data || {};
  const paragraphs = String(data.body || '').split(/\n\s*\n/).filter(Boolean);

  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-7xl">
        <div className={section.variant === 'split-intro' ? 'grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10' : 'mx-auto max-w-4xl'}>
          <Heading eyebrow={data.eyebrow} heading={data.heading} />
          <div className="space-y-3 text-sm leading-7 text-[color:var(--bf-text-secondary)] sm:text-base">
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGridSection({ section }) {
  const data = section.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-7xl">
        <Heading eyebrow={data.eyebrow} heading={data.heading} description={data.description} />
        <div className={`mt-6 grid gap-4 ${section.variant === 'founders' ? 'lg:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
          {items.map((entry, index) => (
            <article key={entry.id || index} className={`${card} overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/25`}>
              {entry.imageUrl && (
                <img src={entry.imageUrl} alt={entry.imageAlt || ''} className="mb-4 aspect-[16/9] w-full rounded-xl object-cover" loading="lazy" />
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-500">
                  <IconFor name={entry.icon} />
                </div>
                {(entry.category || entry.number) && (
                  <span className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-cyan-500">
                    {entry.category || entry.number}
                  </span>
                )}
              </div>
              {entry.number && entry.category && <p className="mt-4 font-mono text-[9px] text-[color:var(--bf-text-muted)]">{entry.number}</p>}
              <h3 className="mt-3 text-lg font-black text-[color:var(--bf-text-primary)]">{entry.title}</h3>
              {entry.description && <p className="mt-2.5 text-sm leading-6 text-[color:var(--bf-text-secondary)]">{entry.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightsSection({ section }) {
  const data = section.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-7xl">
        <Heading eyebrow={data.eyebrow} heading={data.heading} description={data.description} center={section.variant === 'four-cards'} />
        <div className={`mt-6 grid gap-3 ${items.length === 2 ? 'lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {items.map((entry, index) => (
            <article key={entry.id || index} className={`${card} p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/25`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-500">
                  <IconFor name={entry.icon} />
                </div>
                {entry.number && <span className="font-mono text-[9px] text-[color:var(--bf-text-muted)]">{entry.number}</span>}
              </div>
              <h3 className="mt-3 text-sm font-black text-[color:var(--bf-text-primary)]">{entry.title}</h3>
              {entry.description && <p className="mt-1.5 text-xs leading-5 text-[color:var(--bf-text-muted)]">{entry.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ section }) {
  const data = section.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-7xl">
        <Heading eyebrow={data.eyebrow} heading={data.heading} description={data.description} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((entry, index) => (
            <article key={entry.id || index} className={`${card} p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/25`}>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-500">
                  <IconFor name={entry.icon} />
                </div>
                <span className="font-mono text-[9px] text-[color:var(--bf-text-muted)]">{entry.step || String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-4 text-base font-black text-[color:var(--bf-text-primary)]">{entry.title}</h3>
              {entry.description && <p className="mt-2 text-xs leading-5 text-[color:var(--bf-text-muted)]">{entry.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection({ section }) {
  const data = section.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-7xl">
        <Heading eyebrow={data.eyebrow} heading={data.heading} description={data.description} center />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((entry, index) => (
            <article key={entry.id || index} className={`${card} p-5`}>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-500">
                  <IconFor name={entry.icon} size={21} />
                </div>
                <span className="font-mono text-[10px] text-[color:var(--bf-text-muted)]">{entry.number || `0${index + 1}`}</span>
              </div>
              <h3 className="mt-5 text-lg font-black text-[color:var(--bf-text-primary)]">{entry.title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-[color:var(--bf-text-secondary)]">{entry.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ section }) {
  const data = section.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-7xl">
        <Heading eyebrow={data.eyebrow} heading={data.heading} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((entry, index) => (
            <div key={entry.id || index} className={`${card} p-5`}>
              <p className="text-3xl font-black text-cyan-500">{entry.value}</p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--bf-text-secondary)]">{entry.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageTextSection({ section }) {
  const data = section.data || {};
  const imageFirst = data.imagePosition === 'left';
  const image = data.imageUrl ? (
    <img src={data.imageUrl} alt={data.imageAlt || ''} className="aspect-[4/3] w-full rounded-[24px] border border-[color:var(--bf-border)] object-cover shadow-sm" />
  ) : (
    <div className="grid aspect-[4/3] place-items-center rounded-[24px] border border-[color:var(--bf-border)] bg-[var(--bf-surface)] text-sm text-[color:var(--bf-text-muted)]">Image</div>
  );

  return (
    <section className={sectionShell}>
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {imageFirst && image}
        <Heading eyebrow={data.eyebrow} heading={data.heading} description={data.description} />
        {!imageFirst && image}
      </div>
    </section>
  );
}

function PricingSection({ section, baseUrl }) {
  const data = section.data || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const [duration, setDuration] = useState(1);
  const priceField = `price${duration}`;

  const money = useMemo(() => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }), []);

  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={data.eyebrow} heading={data.heading} description={data.description} center />
        <div className="mx-auto mt-5 flex w-fit flex-wrap justify-center gap-2 rounded-xl border border-[color:var(--bf-border)] bg-[var(--bf-surface)] p-1.5">
          {[1, 3, 6, 12].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setDuration(months)}
              className={`rounded-lg px-3 py-2 text-[10px] font-black transition ${duration === months ? 'bg-cyan-500 text-white' : 'text-[color:var(--bf-text-secondary)] hover:bg-[var(--bf-page-bg)]'}`}
            >
              {months} {months === 1 ? 'Month' : 'Months'}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((entry, index) => {
            const price = Number(entry[priceField] || 0);
            return (
              <article key={entry.id || index} className={`${card} relative flex flex-col p-5 ${entry.badge ? 'border-cyan-400/35' : ''}`}>
                {entry.badge && <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.12em] text-white">{entry.badge}</span>}
                <h3 className="text-xl font-black text-[color:var(--bf-text-primary)]">{entry.name}</h3>
                <p className="mt-1 text-[9px] font-semibold text-[color:var(--bf-text-muted)]">{entry.fleet}</p>
                <p className="mt-3 min-h-[38px] text-[11px] leading-5 text-[color:var(--bf-text-muted)]">{entry.tagline}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[['Fleet', entry.fleet], ['Users', entry.users], ['Sites', entry.sites]].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[color:var(--bf-border)] bg-[var(--bf-page-bg)] px-2 py-2.5">
                      <p className="text-[7px] font-bold uppercase tracking-wide text-[color:var(--bf-text-muted)]">{label}</p>
                      <p className="mt-1 text-[9px] font-black text-[color:var(--bf-text-primary)]">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--bf-text-muted)]">Total for {duration} {duration === 1 ? 'month' : 'months'}</p>
                  <p className="mt-1 text-3xl font-black text-[color:var(--bf-text-primary)]">₹{money.format(price)}</p>
                </div>
                <ul className="mt-5 space-y-2 text-[11px] leading-5 text-[color:var(--bf-text-secondary)]">
                  {(entry.features || []).map((feature) => (
                    <li key={feature} className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />{feature}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <a href={resolveHref('/signup', baseUrl)} target={baseUrl ? '_blank' : undefined} rel={baseUrl ? 'noreferrer' : undefined} className="flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] px-4 text-[11px] font-black text-white">Start Free Trial</a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ section }) {
  const data = section.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-4xl">
        <Heading eyebrow={data.eyebrow} heading={data.heading} center />
        <div className="mt-6 space-y-3">
          {items.map((entry, index) => (
            <details key={entry.id || index} className={`${card} p-4`}>
              <summary className="cursor-pointer text-sm font-black text-[color:var(--bf-text-primary)]">{entry.question}</summary>
              <p className="mt-3 text-sm leading-6 text-[color:var(--bf-text-secondary)]">{entry.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ section, baseUrl }) {
  const data = section.data || {};
  return (
    <section className="relative px-5 pb-10 pt-4 sm:px-8 sm:pb-12 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[var(--bf-surface)] px-6 py-8 text-center shadow-sm sm:px-10 sm:py-10">
          <div aria-hidden="true" className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/12 blur-[90px]" />
          <div className="relative">
            <Heading eyebrow={data.eyebrow} heading={data.heading} description={data.description} center />
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <CtaLink cta={data.primaryCta} baseUrl={baseUrl} />
              <CtaLink cta={data.secondaryCta} baseUrl={baseUrl} secondary />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection({ section }) {
  const data = section.data || {};
  return (
    <section className={sectionShell}>
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <div className={`${card} p-5 sm:p-6`}>
          <Heading eyebrow={data.eyebrow} heading={data.heading} description={data.description} />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {['Name', 'Company', 'Email', 'Mobile'].map((label) => (
              <label key={label} className="text-[10px] font-bold text-[color:var(--bf-text-muted)]">{label}<input disabled className="mt-1.5 h-10 w-full rounded-xl border border-[color:var(--bf-border)] bg-[var(--bf-page-bg)] px-3 opacity-80" /></label>
            ))}
          </div>
          <label className="mt-3 block text-[10px] font-bold text-[color:var(--bf-text-muted)]">Message<textarea disabled rows={5} className="mt-1.5 w-full rounded-xl border border-[color:var(--bf-border)] bg-[var(--bf-page-bg)] p-3 opacity-80" /></label>
          <button type="button" disabled className="mt-4 rounded-xl bg-gradient-to-r from-[#12BFF2] via-[#078EE5] to-[#0AA23B] px-5 py-3 text-xs font-black text-white opacity-70">Submit Enquiry</button>
          <p className="mt-3 text-[10px] text-[color:var(--bf-text-muted)]">Preview only. The live Contact page keeps the existing secure enquiry submission flow.</p>
        </div>
        <div className={`${card} p-5 sm:p-6`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Direct Contact</p>
          <h3 className="mt-3 text-2xl font-black text-[color:var(--bf-text-primary)]">People behind Buddy Fleets</h3>
          <p className="mt-3 text-sm leading-7 text-[color:var(--bf-text-secondary)]">Contact-person records continue to come from the existing live database source. CMS migration does not replace that application data.</p>
        </div>
      </div>
    </section>
  );
}

function UnknownSection({ section }) {
  return (
    <section className={sectionShell}>
      <div className="mx-auto max-w-7xl rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-sm text-amber-500">
        Unsupported CMS section: {section.type}
      </div>
    </section>
  );
}

function renderSection(section, baseUrl) {
  const props = { section, baseUrl };
  switch (section.type) {
    case 'hero': return <HeroSection {...props} />;
    case 'rich-text': return <RichTextSection {...props} />;
    case 'feature-grid': return <FeatureGridSection {...props} />;
    case 'image-text': return <ImageTextSection {...props} />;
    case 'highlights': return <HighlightsSection {...props} />;
    case 'stats': return <StatsSection {...props} />;
    case 'workflow': return <WorkflowSection {...props} />;
    case 'benefits': return <BenefitsSection {...props} />;
    case 'pricing': return <PricingSection {...props} />;
    case 'faq': return <FaqSection {...props} />;
    case 'cta': return <CtaSection {...props} />;
    case 'contact': return <ContactSection {...props} />;
    default: return <UnknownSection {...props} />;
  }
}

export default function WebsiteCmsRenderer({ content, baseUrl = '' }) {
  const sections = Array.isArray(content?.sections)
    ? [...content.sections].filter((section) => section?.enabled !== false).sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  return (
    <main className="relative isolate overflow-hidden bg-[var(--bf-page-bg)] text-[color:var(--bf-text-primary)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--bf-page-bg)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(100,116,139,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.28) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute -left-44 top-10 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute -right-44 top-[30rem] h-[440px] w-[440px] rounded-full bg-blue-500/[0.06] blur-[130px]" />
      </div>

      {sections.length > 0
        ? sections.map((section) => <React.Fragment key={section.id}>{renderSection(section, baseUrl)}</React.Fragment>)
        : <div className="mx-auto max-w-4xl px-5 py-24 text-center"><p className="text-sm text-[color:var(--bf-text-muted)]">This draft has no sections yet.</p></div>}
    </main>
  );
}
