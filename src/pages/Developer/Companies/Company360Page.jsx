import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Download,
  FileSpreadsheet,
  ExternalLink,
  FileCheck2,
  FileText,
  Gauge,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Lock,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  PackageCheck,
  PanelsTopLeft,
  Plus,
  Pencil,
  Eye,
  Tags,
  ReceiptText,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Unlock,
  UploadCloud,
  UserCog,
  UserPlus,
  Users,
  WalletCards,
  Wrench,
  X,
} from 'lucide-react';
import { company360Action, getCompany360 } from '../../../services/developerCompany360Api';
import { supabase } from '../../../supabaseClient';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      ['overview', 'Overview', LayoutDashboard],
    ],
  },
  {
    label: 'Company',
    items: [
      ['profile', 'Company Profile', Building2],
      ['sites', 'Sites & Branches', MapPin],
      ['documents', 'Documents & KYC', FileCheck2],
    ],
  },
  {
    label: 'Commercial',
    items: [
      ['subscription', 'Subscription & Plan', PackageCheck],
      ['billing', 'Billing & Payments', WalletCards],
      ['invoices', 'Invoices & Receipts', ReceiptText],
      ['usage', 'Usage & Limits', Gauge],
    ],
  },
  {
    label: 'Access & Configuration',
    items: [
      ['employees', 'Employees & Access', Users],
      ['fleet', 'Fleet Packs', PanelsTopLeft],
      ['modules', 'Modules & Features', SlidersHorizontal],
      ['overrides', 'Overrides', Wrench],
      ['portal', 'Portal Configuration', Settings2],
    ],
  },
  {
    label: 'Data Management',
    items: [
      ['bulk_import', 'Bulk Data Import', UploadCloud],
    ],
  },
  {
    label: 'Control',
    items: [
      ['security', 'Security', ShieldCheck],
      ['communications', 'Communications', MessageSquareText],
      ['activity', 'Activity Log', Activity],
      ['support', 'Support & Notes', FileText],
    ],
  },
];

const CONTROL_CARDS = [
  ['profile', 'Company Profile', 'Identity, legal details, ownership and registered address.', Building2],
  ['sites', 'Sites & Branches', 'Company locations, primary site and tenant site footprint.', MapPin],
  ['subscription', 'Subscription & Plan', 'Commercial plan, lifecycle state and effective runtime access.', PackageCheck],
  ['billing', 'Billing & Payments', 'Invoices, payments, outstanding balance and receipts.', CreditCard],
  ['employees', 'Employees & Access', 'Tenant users, access state, password actions and roles.', Users],
  ['fleet', 'Fleet Packs', 'Primary fleet pack and enabled fleet business packs.', PanelsTopLeft],
  ['modules', 'Modules & Features', 'Effective modules, feature access and plan coverage.', SlidersHorizontal],
  ['portal', 'Portal Configuration', 'Landing page, portal widgets, navigation and tenant settings.', Settings2],
  ['security', 'Security', 'Tenant security posture and protected access controls.', ShieldCheck],
  ['communications', 'Communications', 'Platform announcements and tenant communication history.', Bell],
  ['activity', 'Activity Log', 'Developer actions, important configuration changes and audit trail.', Activity],
  ['support', 'Support & Notes', 'Internal notes and future support follow-up context.', FileText],
];

const BULK_IMPORT_DEFINITIONS = {
  vehicles: {
    label: 'Vehicle Master',
    sheetName: 'Vehicles',
    required: ['Vehicle Number'],
    columns: [
      ['Vehicle Number', 'vehicle_number'], ['Vehicle Code', 'vehicle_code'], ['Vehicle Type', 'vehicle_type'], ['Body Type', 'body_type'],
      ['Ownership', 'ownership'], ['Home Site Code', 'home_site_code'], ['Current Site Code', 'current_site_code'], ['Status', 'status'],
      ['Maker', 'maker'], ['Model', 'model'], ['Variant', 'variant'], ['Manufacturing Year', 'manufacturing_year'],
      ['Chassis Number', 'chassis_number'], ['Engine Number', 'engine_number'], ['Fuel Type', 'fuel_type'], ['GVW', 'gvw'],
      ['Unladen Weight', 'unladen_weight'], ['Payload MT', 'payload_mt'], ['Seating Capacity', 'seating_capacity'], ['Axle Count', 'axle_count'],
      ['Tyre Count', 'tyre_count'], ['Fuel Tank Capacity', 'fuel_tank_capacity'], ['RC Number', 'rc_number'], ['Registration Date', 'registration_date'],
      ['RC Validity', 'rc_validity'], ['Owner Name', 'owner_name'], ['RTO', 'rto'], ['Insurance Policy No', 'insurance_policy_no'],
      ['Insurance Company', 'insurance_company'], ['Insurance Expiry', 'insurance_expiry'], ['Fitness No', 'fitness_no'], ['Fitness Expiry', 'fitness_expiry'],
      ['PUC No', 'puc_no'], ['PUC Expiry', 'puc_expiry'], ['National Permit No', 'national_permit_no'], ['National Permit Expiry', 'national_permit_expiry'],
      ['State Permit No', 'state_permit_no'], ['State Permit Expiry', 'state_permit_expiry'], ['Road Tax Expiry', 'road_tax_expiry'], ['FASTag Reference', 'fastag_reference'],
    ],
    sample: {
      vehicle_number: 'GJ01AB1234', vehicle_code: 'VH-001', vehicle_type: 'Truck', body_type: 'Open Body', ownership: 'Own',
      home_site_code: 'HQ', current_site_code: 'HQ', status: 'available', maker: 'Tata', model: 'LPT', manufacturing_year: '2024', fuel_type: 'Diesel',
      registration_date: '2024-01-15', insurance_expiry: '2027-01-14', fitness_expiry: '2027-01-14', puc_expiry: '2027-01-14',
    },
  },
  drivers: {
    label: 'Driver Master',
    sheetName: 'Drivers',
    required: ['Driver Code', 'Full Name', 'Mobile'],
    columns: [
      ['Driver Code', 'driver_code'], ['Full Name', 'full_name'], ['Mobile', 'mobile'], ['Father Name', 'father_name'], ['DOB', 'dob'],
      ['Blood Group', 'blood_group'], ['Alternate Mobile', 'alternate_mobile'], ['Email', 'email'], ['Address', 'address'], ['City', 'city'],
      ['State', 'state'], ['Pincode', 'pincode'], ['Emergency Contact', 'emergency_contact'], ['Driver Type', 'driver_type'], ['Joining Date', 'joining_date'],
      ['Primary Site Code', 'primary_site_code'], ['Status', 'status'], ['DL Number', 'dl_number'], ['DL Class', 'dl_class'], ['DL Issue Date', 'dl_issue_date'],
      ['DL Expiry', 'dl_expiry'], ['Issuing RTO', 'issuing_rto'], ['Badge Number', 'badge_number'], ['Badge Expiry', 'badge_expiry'],
      ['Medical Fitness Date', 'medical_fitness_date'], ['Police Verification Status', 'police_verification_status'], ['Payment Type', 'payment_type'],
      ['Per Trip Rate', 'per_trip_rate'], ['Daily Allowance', 'daily_allowance'], ['Bank Account Last4', 'bank_account_last4'], ['IFSC', 'ifsc'], ['UPI ID', 'upi_id'],
    ],
    sample: {
      driver_code: 'DRV-001', full_name: 'Rahul Sharma', mobile: '9876543210', driver_type: 'Own Driver', primary_site_code: 'HQ',
      status: 'active', dl_number: 'GJ0120240012345', dl_class: 'HMV', dl_expiry: '2030-12-31', payment_type: 'Per Trip', per_trip_rate: '1500',
    },
  },
};

const surfaceCard = 'rounded-[10px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_8px_24px_rgba(0,0,0,.05)]';
const input = 'h-10 w-full rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[13px] font-medium text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text)] focus:border-[var(--bf-dev-primary)]';
const label = 'block space-y-1.5 text-[12px] font-semibold text-[var(--bf-dev-text)]';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function humanize(value) {
  if (!value) return '—';
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function moneyText(value, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function statusTone(value) {
  const status = String(value || '').toLowerCase();
  if (['active', 'paid', 'verified', 'healthy', 'full', 'trial_active'].includes(status)) return 'success';
  if (['submitted', 'pending', 'partially_paid', 'trial_expired', 'read_only'].includes(status)) return 'warning';
  if (['overdue', 'rejected', 'cancelled', 'void', 'suspended', 'blocked', 'critical'].includes(status)) return 'danger';
  if (['issued', 'draft'].includes(status)) return 'primary';
  return 'neutral';
}

function newRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : ((random & 0x3) | 0x8);
    return value.toString(16);
  });
}

function SelectMenu({ value, options, onChange, ariaLabel = 'Select option', className = '' }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));

  function positionMenu() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportPadding = 10;
    const preferredHeight = 208;
    const below = window.innerHeight - rect.bottom - viewportPadding;
    const above = rect.top - viewportPadding;
    const openUp = below < 150 && above > below;
    const available = Math.max(112, Math.min(preferredHeight, (openUp ? above : below) - 6));
    setMenuStyle({
      position: 'fixed',
      left: `${Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - rect.width - viewportPadding))}px`,
      width: `${Math.min(Math.max(180, rect.width), window.innerWidth - (viewportPadding * 2))}px`,
      maxHeight: `${available}px`,
      ...(openUp
        ? { bottom: `${Math.max(viewportPadding, window.innerHeight - rect.top + 6)}px` }
        : { top: `${Math.min(window.innerHeight - viewportPadding - available, rect.bottom + 6)}px` }),
    });
  }

  useEffect(() => {
    if (!open) return undefined;
    positionMenu();
    const close = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.type === 'pointerdown'
        && !triggerRef.current?.contains(event.target)
        && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    const reposition = () => positionMenu();
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open]);

  return (
    <div className={cx('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-[7px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-left text-[13px] font-medium text-[var(--bf-dev-text)] outline-none transition hover:bg-[var(--bf-dev-surface-2)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.24)]"
      >
        <span className="truncate">{selected?.label || 'Select'}</span>
        <ChevronDown size={13} className={cx('shrink-0 transition', open && 'rotate-180')} />
      </button>
      {open && menuStyle && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          className="bf-c360-scrollbar z-[420] overflow-y-auto rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.24)]"
        >
          {options.map((option) => {
            const active = String(option.value) === String(value);
            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={cx(
                  'flex w-full items-center justify-between gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] font-medium transition',
                  active
                    ? 'bg-[rgb(var(--bf-dev-primary-rgb)/.12)] font-bold text-[var(--bf-dev-primary)]'
                    : 'text-[var(--bf-dev-text)] hover:bg-[var(--bf-dev-surface-2)]'
                )}
              >
                <span>{option.label}</span>
                {active && <CheckCircle2 size={13} />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

function Button({ children, icon: Icon, primary = false, danger = false, className = '', style, ...props }) {
  const fixedStyle = primary ? { ...style, color: '#FFFFFF' } : style;
  return (
    <button
      type="button"
      {...props}
      style={fixedStyle}
      className={cx(
        'inline-flex min-h-9 items-center justify-center gap-2 rounded-[8px] border px-3.5 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.28)] disabled:cursor-not-allowed disabled:opacity-50',
        primary
          ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] !text-white hover:brightness-110'
          : danger
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15'
            : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]',
        className
      )}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function ToneBadge({ tone = 'neutral', children }) {
  const styles = {
    success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500',
    warning: 'border-amber-500/25 bg-amber-500/10 text-amber-500',
    danger: 'border-rose-500/25 bg-rose-500/10 text-rose-500',
    primary: 'border-[rgb(var(--bf-dev-primary-rgb)/.28)] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]',
    neutral: 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text)]',
  };
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.05em]', styles[tone] || styles.neutral)}>
      {children}
    </span>
  );
}

function Money({ value }) {
  return <>₹{Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</>;
}

function Empty({ text = 'No records yet.' }) {
  return (
    <div className="rounded-[5px] border border-dashed border-[var(--bf-dev-border)] p-6 text-center text-[13px] font-medium text-[var(--bf-dev-text)]">
      {text}
    </div>
  );
}

function MoreActionsMenu({ onRefresh, onAnnouncement }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.type === 'pointerdown' && ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const actions = [
    ['Refresh Data', RefreshCcw, onRefresh],
    ['Send Announcement', Bell, onAnnouncement],
  ];

  return (
    <div ref={ref} className="relative">
      <Button icon={MoreHorizontal} onClick={() => setOpen((current) => !current)}>
        More Actions <ChevronDown size={13} className={cx('transition', open && 'rotate-180')} />
      </Button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+7px)] z-[120] w-56 rounded-[9px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,.22)]">
          {actions.map(([text, Icon, onClick]) => (
            <button
              key={text}
              type="button"
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
              className="flex w-full items-center gap-2.5 rounded-[7px] px-3 py-2.5 text-left text-[12px] font-semibold text-[var(--bf-dev-text)] transition hover:bg-[var(--bf-dev-surface-2)]"
            >
              <Icon size={14} className="text-[var(--bf-dev-primary)]" />
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Company360Nav({ active, onChange }) {
  const items = NAV_GROUPS.flatMap((group) => group.items);
  return (
    <aside className="print:hidden lg:sticky lg:top-4 lg:self-start">
      <div className="hidden lg:flex lg:max-h-[calc(100dvh-100px)] lg:flex-col">
        <div className="mb-3 flex shrink-0 items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[rgb(var(--bf-dev-primary-rgb)/.13)] text-[var(--bf-dev-primary)]">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-[var(--bf-dev-text)]">Company 360</div>
            <div className="mt-0.5 text-[11px] font-semibold text-[var(--bf-dev-text)]">Tenant control center</div>
          </div>
        </div>

        <nav className="bf-c360-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1.5">
          {items.map(([key, text, Icon], index) => {
            const selected = active === key;
            const groupStart = NAV_GROUPS.some((group) => group.items[0]?.[0] === key) && index !== 0;
            return (
              <React.Fragment key={key}>
                {groupStart && <div className="my-2 h-px bg-[var(--bf-dev-border)]" />}
                <button
                  type="button"
                  onClick={() => onChange(key)}
                  className={cx(
                    'flex w-full items-center gap-2.5 rounded-[8px] border px-3 py-2.5 text-left text-[12px] font-semibold transition',
                    selected
                      ? 'border-[rgb(var(--bf-dev-primary-rgb)/.22)] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)] shadow-[inset_2px_0_0_var(--bf-dev-primary)]'
                      : 'border-transparent text-[var(--bf-dev-text)] hover:border-[var(--bf-dev-border)] hover:bg-[var(--bf-dev-surface)]'
                  )}
                >
                  <Icon size={15} />
                  <span className="min-w-0 flex-1 truncate">{text}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="bf-c360-scrollbar flex gap-1 overflow-x-auto pb-2 lg:hidden">
        {items.map(([key, text, Icon]) => {
          const selected = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              style={selected ? { color: '#FFFFFF' } : undefined}
              className={cx(
                'inline-flex shrink-0 items-center gap-2 rounded-[8px] border px-3 py-2 text-[12px] font-semibold transition',
                selected
                  ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] !text-white'
                  : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text)]'
              )}
            >
              <Icon size={14} />
              {text}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function HeroCard({ company, profile, data, activeEmployees }) {
  const sites = data.sites || [];
  const activeSites = sites.filter((site) => site.status === 'active').length;
  const planName = data.effective?.plan?.name || data.effective?.planKey || 'Not assigned';
  const location = [profile.city, profile.state].filter(Boolean).join(', ') || 'Location not configured';
  const initials = (company.company_name || 'C').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <section className={cx(surfaceCard, 'relative min-h-[176px] overflow-hidden p-5 sm:p-6')}>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] overflow-hidden xl:block">
        <img src="/images/truck-640.webp" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bf-dev-surface)] via-[color:rgb(0_0_0/.18)] to-[color:rgb(0_0_0/.48)]" />
        <div className="absolute inset-x-6 bottom-5 text-right" style={{ color: '#FFFFFF' }}>
          <div className="text-[14px] font-extrabold leading-5">Reliable Transport<br />for a Better Tomorrow</div>
          <div className="mt-2 ml-auto h-0.5 w-16 rounded-full bg-[var(--bf-dev-primary)]" />
        </div>
      </div>

      <div className="relative z-10 max-w-full xl:max-w-[70%]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] border border-[rgb(var(--bf-dev-primary-rgb)/.28)] bg-[rgb(var(--bf-dev-primary-rgb)/.15)] text-[22px] font-black text-[var(--bf-dev-primary)]">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-[23px] font-extrabold tracking-[-.02em] text-[var(--bf-dev-text)] sm:text-[27px]">
                {company.company_name || 'Company'}
              </h1>
              <ToneBadge tone={company.status === 'suspended' ? 'danger' : company.status?.includes('expired') ? 'warning' : 'success'}>
                {humanize(company.status)}
              </ToneBadge>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-semibold text-[var(--bf-dev-text)]">
              <span>{company.company_code || 'No company code'}</span>
              <span aria-hidden="true">|</span>
              <span className="break-all">{company.subdomain_slug ? `${company.subdomain_slug}.buddyfleets.com` : 'Portal subdomain not configured'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          <HeroFact icon={MapPin} label="Location" value={location} />
          <HeroFact icon={Landmark} label="Sites / Branches" value={`${activeSites}`} helper="Active sites" />
          <HeroFact icon={Users} label="Employees" value={`${activeEmployees}`} helper="Active users" />
          <HeroFact icon={PackageCheck} label="Effective Plan" value={planName} />
        </div>
      </div>
    </section>
  );
}

function HeroFact({ icon: Icon, label: factLabel, value, helper }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 border-l border-[var(--bf-dev-border)] pl-3 first:border-l-0 first:pl-0 sm:[&:nth-child(odd)]:border-l-0 sm:[&:nth-child(odd)]:pl-0 xl:[&:nth-child(n)]:border-l xl:[&:nth-child(n)]:pl-3 xl:[&:first-child]:border-l-0 xl:[&:first-child]:pl-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center text-[var(--bf-dev-primary)]">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-extrabold uppercase tracking-[.06em] text-[var(--bf-dev-text)]">{factLabel}</div>
        <div className="mt-0.5 truncate text-[13px] font-bold text-[var(--bf-dev-text)]">{value}</div>
        {helper && <div className="mt-0.5 text-[10px] font-semibold text-[var(--bf-dev-text)]">{helper}</div>}
      </div>
    </div>
  );
}

function ControlModuleGrid({ onOpen, data, activeEmployees }) {
  const badges = {
    subscription: data.effective?.plan?.name || data.effective?.planKey || '',
    billing: Number(data.billingSummary?.outstanding || 0) > 0 ? `₹${Number(data.billingSummary.outstanding).toLocaleString('en-IN')} due` : 'Clear',
    employees: `${activeEmployees} active`,
    fleet: humanize(data.portalSettings?.fleet_pack_selection_status || 'pending'),
    modules: `${(data.modules || []).filter((module) => module.effective_access !== 'blocked').length} enabled`,
    security: companySecurityLabel(data),
  };
  const visual = {
    profile: ['bg-indigo-500/14', 'text-indigo-500', 'View Profile'],
    sites: ['bg-emerald-500/14', 'text-emerald-500', 'Manage Sites'],
    subscription: ['bg-amber-500/14', 'text-amber-500', 'View Plan'],
    billing: ['bg-yellow-500/14', 'text-yellow-500', 'View Billing'],
    employees: ['bg-violet-500/14', 'text-violet-500', 'Manage Access'],
    fleet: ['bg-blue-500/14', 'text-blue-500', 'Manage Fleet Packs'],
    modules: ['bg-teal-500/14', 'text-teal-500', 'Manage Modules'],
    portal: ['bg-sky-500/14', 'text-sky-500', 'Configure Portal'],
    security: ['bg-emerald-500/14', 'text-emerald-500', 'View Security'],
    communications: ['bg-indigo-500/14', 'text-indigo-500', 'Manage Comms'],
    activity: ['bg-purple-500/14', 'text-purple-500', 'View Logs'],
    support: ['bg-pink-500/14', 'text-pink-500', 'View Support'],
  };

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold text-[var(--bf-dev-text)]">Control Modules</h2>
          <p className="mt-1 text-[12px] font-semibold text-[var(--bf-dev-text)]">Everything you need to manage this company in one place.</p>
        </div>
        <Button icon={Settings2} onClick={() => onOpen('modules')}>Manage Modules</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CONTROL_CARDS.map(([key, title, description, Icon]) => {
          const [iconBg, iconText, cta] = visual[key] || ['bg-[rgb(var(--bf-dev-primary-rgb)/.12)]', 'text-[var(--bf-dev-primary)]', 'Open'];
          return (
            <div key={key} className={cx(surfaceCard, 'flex min-h-[148px] flex-col p-4')}>
              <div className="flex items-start gap-3">
                <div className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px]', iconBg, iconText)}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[13px] font-extrabold text-[var(--bf-dev-text)]">{title}</div>
                    {badges[key] && <span className="rounded-full border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-2 py-0.5 text-[9px] font-bold text-[var(--bf-dev-text)]">{badges[key]}</span>}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-[18px] text-[var(--bf-dev-text)]">{description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpen(key)}
                className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-[7px] border border-[rgb(var(--bf-dev-primary-rgb)/.34)] px-2.5 py-1.5 text-[10px] font-bold text-[var(--bf-dev-primary)] transition hover:bg-[rgb(var(--bf-dev-primary-rgb)/.10)]"
              >
                {cta} <ChevronRight size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function companySecurityLabel(data) {
  const security = data.overview?.security || {};
  if (Number(security.lockedUsers || 0) > 0) return `${security.lockedUsers} locked`;
  if (Number(security.alerts24h || 0) > 0) return `${security.alerts24h} alerts`;
  const blocked = (data.employees || []).filter((employee) => employee.status === 'blocked').length;
  if (blocked > 0) return `${blocked} blocked`;
  return 'Clear';
}

function statusDot(status) {
  if (status === 'critical') return 'bg-rose-500';
  if (status === 'warning') return 'bg-amber-500';
  if (status === 'healthy') return 'bg-emerald-500';
  return 'bg-[var(--bf-dev-text)]';
}

function relativeTime(value) {
  if (!value) return '—';
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '—';
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

function UsageMetricCard({ icon: Icon, label: metricLabel, metric, helper }) {
  const used = Number(metric?.used || 0);
  const limit = metric?.limit;
  const unlimited = limit === null || limit === undefined;
  const percent = Number(metric?.percent || 0);
  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[.06em] text-[var(--bf-dev-text)]">{metricLabel}</div>
          <div className="mt-1.5 text-[21px] font-black tracking-[-.02em] text-[var(--bf-dev-text)]">
            {used}{unlimited ? '' : ` / ${limit}`}
          </div>
          <div className="mt-1 text-[10px] font-semibold text-[var(--bf-dev-text)]">{helper || (unlimited ? 'No plan cap' : `${percent}% of plan limit`)}</div>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]">
          <Icon size={17} />
        </div>
      </div>
      {!unlimited && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bf-dev-surface-3)]">
          <div
            className={cx('h-full rounded-full', metric?.status === 'critical' ? 'bg-rose-500' : metric?.status === 'warning' ? 'bg-amber-500' : 'bg-[var(--bf-dev-primary)]')}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function OverviewMetrics({ data }) {
  const overview = data.overview || {};
  const metrics = Object.fromEntries((overview.usage || []).map((metric) => [metric.key, metric]));
  const billing = overview.billing || {};
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <UsageMetricCard icon={Truck} label="Vehicles" metric={metrics.vehicles} />
      <UsageMetricCard icon={Users} label="Employees" metric={metrics.employees} />
      <UsageMetricCard icon={MapPin} label="Sites" metric={metrics.sites} />
      <div className={cx(surfaceCard, 'p-4')}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.06em] text-[var(--bf-dev-text)]">Outstanding</div>
            <div className="mt-1.5 text-[21px] font-black tracking-[-.02em] text-[var(--bf-dev-text)]">
              ₹{Number(billing.outstanding || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-[10px] font-semibold text-[var(--bf-dev-text)]">
              {Number(billing.overdueCount || 0) > 0
                ? `${billing.overdueCount} overdue invoice${billing.overdueCount === 1 ? '' : 's'}`
                : Number(billing.pendingPayments || 0) > 0
                  ? `${billing.pendingPayments} payment${billing.pendingPayments === 1 ? '' : 's'} pending verification`
                  : 'Billing clear'}
            </div>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]">
            <WalletCards size={17} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyHealthPanel({ data, onOpen }) {
  const health = data.overview?.health || {};
  const checks = Array.isArray(health.checks) ? health.checks : [];
  const tone = statusTone(health.status);
  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-[var(--bf-dev-primary)]" />
          <div>
            <div className="text-[14px] font-extrabold text-[var(--bf-dev-text)]">Company Health</div>
            <div className="mt-0.5 text-[10px] font-semibold text-[var(--bf-dev-text)]">Deterministic checks from the tenant's current runtime state.</div>
          </div>
        </div>
        <ToneBadge tone={tone}>{Number(health.score || 0)}% {humanize(health.status || 'unknown')}</ToneBadge>
      </div>
      <div className="mt-3 divide-y divide-[var(--bf-dev-border)]">
        {checks.map((check) => (
          <button
            key={check.key}
            type="button"
            onClick={() => onOpen(check.target || 'overview')}
            className="grid w-full gap-1 py-2.5 text-left sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-center sm:gap-3"
          >
            <span className="flex items-center gap-2 text-[11px] font-extrabold text-[var(--bf-dev-text)]">
              <span className={cx('h-2 w-2 shrink-0 rounded-full', statusDot(check.status))} />
              {check.label}
            </span>
            <span className="text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">{check.summary}</span>
            <ChevronRight size={13} className="hidden text-[var(--bf-dev-primary)] sm:block" />
          </button>
        ))}
      </div>
    </div>
  );
}

function NeedsAttentionPanel({ data, onOpen }) {
  const attention = Array.isArray(data.overview?.attention) ? data.overview.attention : [];
  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={18} className={attention.length ? 'text-amber-500' : 'text-emerald-500'} />
          <div>
            <div className="text-[14px] font-extrabold text-[var(--bf-dev-text)]">Needs Attention</div>
            <div className="mt-0.5 text-[10px] font-semibold text-[var(--bf-dev-text)]">Only items that need developer action.</div>
          </div>
        </div>
        <ToneBadge tone={attention.some((item) => item.severity === 'critical') ? 'danger' : attention.length ? 'warning' : 'success'}>
          {attention.length ? `${attention.length} item${attention.length === 1 ? '' : 's'}` : 'Clear'}
        </ToneBadge>
      </div>
      <div className="mt-3 divide-y divide-[var(--bf-dev-border)]">
        {attention.length === 0 ? (
          <div className="flex items-center gap-2 py-5 text-[11px] font-bold text-[var(--bf-dev-text)]">
            <CheckCircle2 size={16} className="text-emerald-500" /> No developer action required right now.
          </div>
        ) : attention.slice(0, 6).map((item) => (
          <button key={item.key} type="button" onClick={() => onOpen(item.target || 'overview')} className="flex w-full items-start gap-3 py-3 text-left">
            <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', item.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500')} />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-extrabold text-[var(--bf-dev-text)]">{item.title}</span>
              <span className="mt-0.5 block text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">{item.detail}</span>
            </span>
            <ChevronRight size={13} className="mt-1 shrink-0 text-[var(--bf-dev-primary)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function TenantDiagnostics({ data, onOpen }) {
  const overview = data.overview || {};
  const health = data.provisioningHealth || {};
  const lifecycleAccess = data.subscriptionContext?.lifecycle_access || 'blocked';
  const enabledModules = (data.modules || []).filter((module) => module.effective_access !== 'blocked').length;
  const items = [
    ['Runtime access', lifecycleAccess !== 'blocked', humanize(lifecycleAccess), 'subscription'],
    ['Portal settings', Boolean(health.portal_settings), health.portal_settings ? 'Available' : 'Missing', 'portal'],
    ['Owner access', Boolean(health.owner_access), health.owner_access ? 'Runtime access linked' : 'Linkage missing', 'employees'],
    ['Module resolution', enabledModules > 0, `${enabledModules} effective module${enabledModules === 1 ? '' : 's'}`, 'modules'],
    ['Security state', Number(overview.security?.lockedUsers || 0) === 0, Number(overview.security?.lockedUsers || 0) ? `${overview.security.lockedUsers} locked` : `${overview.security?.activeSessions || 0} active session${overview.security?.activeSessions === 1 ? '' : 's'}`, 'security'],
  ];
  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Wrench size={17} className="text-[var(--bf-dev-primary)]" />
          <div className="text-[14px] font-extrabold text-[var(--bf-dev-text)]">Tenant Diagnostics</div>
        </div>
      </div>
      <div className="mt-3">
        {items.map(([title, ok, helper, target]) => (
          <button key={title} type="button" onClick={() => onOpen(target)} className="flex w-full items-start gap-2.5 border-t border-[var(--bf-dev-border)] py-3 text-left first:border-0">
            <span className={cx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', ok ? 'bg-emerald-500/14 text-emerald-500' : 'bg-amber-500/14 text-amber-500')}>
              {ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-extrabold text-[var(--bf-dev-text)]">{title}</span>
              <span className="mt-0.5 block truncate text-[10px] font-semibold text-[var(--bf-dev-text)]">{helper}</span>
            </span>
            <ChevronRight size={12} className="mt-1 text-[var(--bf-dev-primary)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProvisioningReadiness({ data, onOpen }) {
  const provisioning = data.overview?.provisioning || {};
  const steps = Array.isArray(provisioning.steps) ? provisioning.steps : [];
  const visibleSteps = [...steps].sort((a, b) => Number(a.ok) - Number(b.ok)).slice(0, 6);
  const percent = Number(provisioning.percent || 0);
  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <PackageCheck size={17} className="text-[var(--bf-dev-primary)]" />
          <div className="text-[14px] font-extrabold text-[var(--bf-dev-text)]">Provisioning Readiness</div>
        </div>
        <span className="text-[10px] font-bold text-[var(--bf-dev-text)]">{provisioning.passed || 0}/{provisioning.total || 0}</span>
      </div>
      <div className="mt-4 grid grid-cols-[92px_minmax(0,1fr)] items-center gap-4">
        <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full" style={{ background: `conic-gradient(${percent === 100 ? '#22c55e' : '#f59e0b'} ${percent}%, var(--bf-dev-surface-3) ${percent}% 100%)` }}>
          <div className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[var(--bf-dev-surface)] text-[18px] font-black text-[var(--bf-dev-text)]">{percent}%</div>
        </div>
        <div className="space-y-2">
          {visibleSteps.map((item) => (
            <button key={item.key} type="button" onClick={() => onOpen(item.target || 'overview')} className="flex w-full items-center gap-2 text-left text-[10px] font-bold text-[var(--bf-dev-text)]">
              {item.ok ? <CheckCircle2 size={13} className="shrink-0 text-emerald-500" /> : <AlertTriangle size={13} className="shrink-0 text-amber-500" />}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentActivityCard({ data, onOpen }) {
  const activity = Array.isArray(data.overview?.recentActivity) ? data.overview.recentActivity : [];
  return (
    <div className={cx(surfaceCard, 'p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Activity size={17} className="text-[var(--bf-dev-primary)]" />
          <div className="text-[14px] font-extrabold text-[var(--bf-dev-text)]">Recent Activity</div>
        </div>
        <button type="button" onClick={() => onOpen('activity')} className="text-[10px] font-bold text-[var(--bf-dev-primary)] hover:underline">View all</button>
      </div>
      <div className="mt-3">
        {activity.length === 0 ? (
          <div className="py-5 text-[10px] font-semibold text-[var(--bf-dev-text)]">No recent company activity.</div>
        ) : activity.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-start gap-2.5 border-t border-[var(--bf-dev-border)] py-3 first:border-0">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--bf-dev-primary)]" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-extrabold text-[var(--bf-dev-text)]">{item.title}</div>
              <div className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">{item.description || item.actorName || 'Company activity'}</div>
              <div className="mt-1 text-[9px] font-semibold text-[var(--bf-dev-text)]">{item.actorName || 'System'} · {relativeTime(item.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewPage({ data, activeEmployees, onOpen, company, profile }) {
  const hasOverview = Boolean(data.overview);
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
        <HeroCard company={company} profile={profile} data={data} activeEmployees={activeEmployees} />
        {hasOverview && <OverviewMetrics data={data} />}
        {hasOverview && (
          <div className="grid gap-4 xl:grid-cols-2">
            <CompanyHealthPanel data={data} onOpen={onOpen} />
            <NeedsAttentionPanel data={data} onOpen={onOpen} />
          </div>
        )}
        <ControlModuleGrid onOpen={onOpen} data={data} activeEmployees={activeEmployees} />
      </div>
      <aside className="space-y-4">
        <TenantDiagnostics data={data} onOpen={onOpen} />
        <ProvisioningReadiness data={data} onOpen={onOpen} />
        <RecentActivityCard data={data} onOpen={onOpen} />
      </aside>
    </div>
  );
}

function ProfileManagement({ data, onEditProfile, onEditInternal }) {
  const company=data.company||{}, profile=data.profile||{}, internal=data.internalProfile||{};
  const assignees=new Map((data.developerAssignees||[]).map((row)=>[row.id,row]));
  const manager=assignees.get(internal.account_manager_user_id), support=assignees.get(internal.support_owner_user_id);
  return <div className="space-y-4">
    <Section title="Company Profile" action={<Button icon={Pencil} primary onClick={onEditProfile}>Edit Profile</Button>}>
      <Grid rows={[["Company Name",company.company_name],["Company Code",company.company_code],["Legal Name",profile.legal_name],["Trade Name",profile.trade_name],["Registration Type",profile.registration_type],["Business Type",profile.business_type],["GSTIN",profile.gstin],["PAN",profile.pan],["CIN / Registration",profile.cin],["Owner",profile.owner_name],["Owner Email",profile.owner_email],["Owner Mobile",profile.owner_mobile],["Company Email",profile.contact_email],["Company Mobile",profile.contact_mobile],["Billing Email",profile.billing_email],["Website",profile.website],["Address",[profile.address_line1,profile.address_line2,profile.city,profile.state,profile.postal_code,profile.country].filter(Boolean).join(', ')]]}/>
    </Section>
    <Section title="Internal Account Ownership" action={<Button icon={Tags} onClick={onEditInternal}>Manage Ownership</Button>}>
      <Grid rows={[["Account Manager",manager?.full_name||manager?.email||'Unassigned'],["Support Owner",support?.full_name||support?.email||'Unassigned'],["Customer Segment",humanize(internal.customer_segment||'standard')],["Priority",humanize(internal.priority||'normal')],["Risk Level",humanize(internal.risk_level||'low')],["Internal Tags",Array.isArray(internal.tags)&&internal.tags.length?internal.tags.join(', '):'None']]}/>
    </Section>
  </div>;
}

function SitesManagement({ sites, onAdd, onEdit }) {
  return <Section title="Sites & Branches" action={<Button icon={Plus} primary onClick={onAdd}>Add Site</Button>}>
    {!sites.length?<Empty/>:<div className="grid gap-3 xl:grid-cols-2">{sites.map((site)=><div key={site.id} className="rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
      <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="text-[14px] font-extrabold text-[var(--bf-dev-text)]">{site.name}</span>{site.is_primary&&<span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[9px] font-extrabold text-emerald-500">PRIMARY</span>}</div><div className="mt-1 text-[11px] font-semibold text-[var(--bf-dev-text)]">{site.code} · {site.site_type} · {humanize(site.status)}</div></div><Button icon={Pencil} onClick={()=>onEdit(site)}>Edit</Button></div>
      <div className="mt-3 border-t border-[var(--bf-dev-border)] pt-3 text-[11px] font-semibold leading-5 text-[var(--bf-dev-text)]">{[site.address,site.city,site.state,site.pincode].filter(Boolean).join(', ')||'Address not configured'}</div>
    </div>)}</div>}
  </Section>;
}

function DocumentsManagement({ documents, onUpload, onView, onVerify, onReject }) {
  return <Section title="Documents & KYC" action={<Button icon={UploadCloud} primary onClick={onUpload}>Upload Document</Button>}>
    {!documents.length?<Empty/>:<div className="space-y-2">{documents.map((doc)=><div key={doc.id} className="flex flex-col gap-3 rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-[13px] font-extrabold text-[var(--bf-dev-text)]">{doc.document_name||humanize(doc.document_type)}</span><span className={cx('rounded-full px-2 py-1 text-[9px] font-extrabold',doc.status==='verified'?'bg-emerald-500/12 text-emerald-500':doc.status==='rejected'?'bg-rose-500/12 text-rose-500':'bg-amber-500/12 text-amber-500')}>{humanize(doc.status)}</span></div><div className="mt-1 text-[11px] font-semibold text-[var(--bf-dev-text)]">{humanize(doc.document_type)} · Expiry {formatDate(doc.expiry_date)}{doc.mime_type?` · ${doc.mime_type}`:''}</div></div>
      <div className="flex flex-wrap gap-2"><Button icon={Eye} onClick={()=>onView(doc)}>View</Button>{doc.status!=='verified'&&<Button icon={CheckCircle2} onClick={()=>onVerify(doc)}>Verify</Button>}{doc.status!=='rejected'&&<Button danger icon={X} onClick={()=>onReject(doc)}>Reject</Button>}</div>
    </div>)}</div>}
  </Section>;
}


function CommercialMetric({ label: metricLabel, value, helper, tone = 'neutral' }) {
  const toneClass = {
    success: 'border-emerald-500/25 bg-emerald-500/[.07]',
    warning: 'border-amber-500/25 bg-amber-500/[.07]',
    danger: 'border-rose-500/25 bg-rose-500/[.07]',
    primary: 'border-[rgb(var(--bf-dev-primary-rgb)/.25)] bg-[rgb(var(--bf-dev-primary-rgb)/.07)]',
    neutral: 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]',
  }[tone] || 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]';
  return (
    <div className={cx('rounded-[8px] border p-3.5', toneClass)}>
      <div className="text-[10px] font-extrabold uppercase tracking-[.07em] text-[var(--bf-dev-text)]">{metricLabel}</div>
      <div className="mt-1.5 text-[18px] font-black tracking-[-.02em] text-[var(--bf-dev-text)]">{value}</div>
      {helper && <div className="mt-1 text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">{helper}</div>}
    </div>
  );
}

function PlanLimitsLine({ plan }) {
  const limits = plan?.limits || {};
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-[var(--bf-dev-text)]">
      <span>Vehicles: {limits.vehicles_max ?? 'Unlimited'}</span>
      <span>Users: {limits.users ?? 'Unlimited'}</span>
      <span>Sites: {limits.sites ?? 'Unlimited'}</span>
    </div>
  );
}

function SubscriptionPlanPanel({ data, onEdit }) {
  const subscription = data.subscription || {};
  const plans = data.plans || [];
  const commercialPlan = plans.find((plan) => plan.plan_key === subscription.plan_key) || null;
  const effectiveKey = data.subscriptionContext?.effective_plan_key || data.effective?.planKey || '';
  const effectivePlan = plans.find((plan) => plan.plan_key === effectiveKey) || data.effective?.plan || null;
  const source = data.subscriptionContext?.effective_plan_source || 'Not resolved';
  const lifecycleAccess = data.subscriptionContext?.lifecycle_access || 'blocked';
  const status = subscription.status || 'missing';

  return (
    <div className="space-y-4">
      <Section title="Subscription & Plan" action={<Button icon={Pencil} primary onClick={onEdit}>Edit Commercial Subscription</Button>}>
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-[9px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--bf-dev-text)]">Commercial Subscription</div>
                <div className="mt-1 text-[20px] font-black tracking-[-.02em] text-[var(--bf-dev-text)]">{commercialPlan?.name || subscription.plan_key || 'Not assigned'}</div>
              </div>
              <ToneBadge tone={statusTone(status)}>{humanize(status)}</ToneBadge>
            </div>
            <PlanLimitsLine plan={commercialPlan} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-[7px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-3"><div className="text-[10px] font-bold uppercase text-[var(--bf-dev-text)]">Trial</div><div className="mt-1 text-[11px] font-semibold text-[var(--bf-dev-text)]">{formatDate(subscription.trial_start_at)} → {formatDate(subscription.trial_end_at)}</div></div>
              <div className="rounded-[7px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-3"><div className="text-[10px] font-bold uppercase text-[var(--bf-dev-text)]">Paid Term</div><div className="mt-1 text-[11px] font-semibold text-[var(--bf-dev-text)]">{formatDate(subscription.subscription_start_at)} → {formatDate(subscription.subscription_end_at)}</div></div>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-[var(--bf-dev-text)]">Revision {subscription.revision || 1} · Commercial plan changes use optimistic revision protection.</div>
          </div>

          <div className="rounded-[9px] border border-[rgb(var(--bf-dev-primary-rgb)/.24)] bg-[rgb(var(--bf-dev-primary-rgb)/.06)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--bf-dev-text)]">Effective Runtime Access</div>
                <div className="mt-1 text-[20px] font-black tracking-[-.02em] text-[var(--bf-dev-text)]">{effectivePlan?.name || effectiveKey || 'Not resolved'}</div>
              </div>
              <ToneBadge tone={statusTone(lifecycleAccess)}>{humanize(lifecycleAccess)}</ToneBadge>
            </div>
            <PlanLimitsLine plan={effectivePlan} />
            <div className="mt-4 rounded-[7px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-3">
              <div className="text-[10px] font-bold uppercase text-[var(--bf-dev-text)]">Resolver Source</div>
              <div className="mt-1 text-[11px] font-semibold text-[var(--bf-dev-text)]">{humanize(source)}</div>
            </div>
            <p className="mt-3 text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">Commercial Plan is the paid contract selection. Effective Runtime Plan is what the portal currently receives after trial/lifecycle resolution. Company Overrides remain a separate control and are not treated as a paid plan change.</p>
          </div>
        </div>
      </Section>

      <Section title="Available Commercial Plans">
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {plans.filter((plan) => plan.status !== 'archived').map((plan) => {
            const selected = plan.plan_key === subscription.plan_key;
            return (
              <div key={plan.id || plan.plan_key} className={cx('rounded-[9px] border p-4', selected ? 'border-[var(--bf-dev-primary)] bg-[rgb(var(--bf-dev-primary-rgb)/.08)]' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]')}>
                <div className="flex items-center justify-between gap-2"><div className="text-[14px] font-extrabold text-[var(--bf-dev-text)]">{plan.name}</div>{selected && <ToneBadge tone="primary">Selected</ToneBadge>}</div>
                <div className="mt-1 text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">{plan.tagline || 'Commercial fleet plan'}</div>
                <PlanLimitsLine plan={plan} />
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {[1, 6, 12].map((months) => <div key={months} className="rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-2 py-2 text-center"><div className="text-[9px] font-bold uppercase text-[var(--bf-dev-text)]">{months}M</div><div className="mt-0.5 text-[10px] font-extrabold text-[var(--bf-dev-text)]">{moneyText(plan.prices?.[String(months)] || 0, plan.currency || 'INR')}</div></div>)}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function BillingPaymentsPanel({ data, onRecord, onVerify, onReject, onReceipt }) {
  const commercial = data.commercial || {};
  const summary = commercial.summary || data.billingSummary || {};
  const payments = commercial.payments || data.payments || [];
  const integrity = commercial.integrity || { healthy: true, issueCount: 0 };

  return (
    <div className="space-y-4">
      <Section title="Billing & Payments" action={<Button icon={Plus} primary onClick={onRecord}>Record Payment</Button>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <CommercialMetric label="Invoiced" value={moneyText(summary.totalInvoiced)} />
          <CommercialMetric label="Applied to Invoices" value={moneyText(summary.appliedPaid)} tone="success" />
          <CommercialMetric label="Outstanding" value={moneyText(summary.outstanding)} tone={Number(summary.outstanding || 0) > 0 ? 'warning' : 'success'} />
          <CommercialMetric label="Pending Verification" value={moneyText(summary.pendingPaymentAmount)} helper={`${Number(summary.pendingPayments || 0)} payment(s)`} tone={Number(summary.pendingPayments || 0) ? 'warning' : 'neutral'} />
          <CommercialMetric label="Unallocated Advance" value={moneyText(summary.unallocatedVerified)} helper="Verified payments not linked to an invoice" />
        </div>

        <div className={cx('mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border p-3', integrity.healthy ? 'border-emerald-500/25 bg-emerald-500/[.06]' : 'border-rose-500/25 bg-rose-500/[.06]')}>
          <div>
            <div className="text-[11px] font-extrabold text-[var(--bf-dev-text)]">Commercial Ledger Integrity</div>
            <div className="mt-0.5 text-[10px] font-semibold text-[var(--bf-dev-text)]">{integrity.healthy ? 'Invoice paid totals and verified-payment receipts are consistent.' : `${integrity.issueCount} consistency issue(s) detected. Do not manually edit financial rows.`}</div>
          </div>
          <ToneBadge tone={integrity.healthy ? 'success' : 'danger'}>{integrity.healthy ? 'Healthy' : 'Needs Review'}</ToneBadge>
        </div>
      </Section>

      <Section title="Payment Ledger">
        {!payments.length ? <Empty text="No payments recorded yet." /> : (
          <div className="bf-c360-scrollbar overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[var(--bf-dev-surface-2)]"><tr>{['Date','Amount','Invoice','Mode / Reference','Status','Receipt','Actions'].map((heading)=><th key={heading} className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[11px] font-bold uppercase tracking-[.05em] text-[var(--bf-dev-text)]">{heading}</th>)}</tr></thead>
              <tbody>{payments.map((payment)=>(
                <tr key={payment.id} className="border-b border-[var(--bf-dev-border)] last:border-0">
                  <td className="px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">{formatDate(payment.payment_date)}</td>
                  <td className="px-3 py-3 text-[12px] font-extrabold text-[var(--bf-dev-text)]"><Money value={payment.amount}/></td>
                  <td className="px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">{payment.invoice_number || 'Advance / Unallocated'}</td>
                  <td className="px-3 py-3"><div className="text-[11px] font-semibold text-[var(--bf-dev-text)]">{humanize(payment.payment_mode)}</div><div className="mt-0.5 text-[10px] font-medium text-[var(--bf-dev-text)]">{payment.transaction_reference || 'No reference'}</div></td>
                  <td className="px-3 py-3"><ToneBadge tone={statusTone(payment.status)}>{humanize(payment.status)}</ToneBadge></td>
                  <td className="px-3 py-3">{payment.receipt ? <button type="button" onClick={()=>onReceipt(payment.receipt)} className="text-[11px] font-bold text-[var(--bf-dev-primary)] hover:underline">{payment.receipt.receipt_number}</button> : <span className="text-[11px] font-semibold text-[var(--bf-dev-text)]">—</span>}</td>
                  <td className="px-3 py-3"><div className="flex flex-wrap gap-2">{['pending','submitted'].includes(String(payment.status).toLowerCase()) && <><Button icon={CheckCircle2} primary onClick={()=>onVerify(payment)}>Verify</Button><Button icon={X} danger onClick={()=>onReject(payment)}>Reject</Button></>}{payment.status==='verified'&&payment.receipt&&<Button icon={Eye} onClick={()=>onReceipt(payment.receipt)}>View Receipt</Button>}</div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

function InvoicesReceiptsPanel({ data, onCreate, onInvoice, onReceipt }) {
  const commercial = data.commercial || {};
  const invoices = commercial.invoices || data.invoices || [];
  const receipts = commercial.receipts || data.receipts || [];
  const summary = commercial.summary || {};

  return (
    <div className="space-y-4">
      <Section title="Invoices" action={<Button icon={Plus} primary onClick={onCreate}>Generate Invoice</Button>}>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CommercialMetric label="Total Invoiced" value={moneyText(summary.totalInvoiced)} />
          <CommercialMetric label="Outstanding" value={moneyText(summary.outstanding)} tone={Number(summary.outstanding || 0) ? 'warning' : 'success'} />
          <CommercialMetric label="Overdue" value={moneyText(summary.overdueBalance)} helper={`${Number(summary.overdueCount || 0)} invoice(s)`} tone={Number(summary.overdueCount || 0) ? 'danger' : 'neutral'} />
          <CommercialMetric label="Receipts Issued" value={Number(summary.receiptCount || receipts.length).toLocaleString('en-IN')} />
        </div>
        {!invoices.length ? <Empty text="No invoices generated yet." /> : (
          <div className="bf-c360-scrollbar overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-[var(--bf-dev-surface-2)]"><tr>{['Invoice','Invoice / Due Date','Total','Paid','Balance','Status','Action'].map((heading)=><th key={heading} className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[11px] font-bold uppercase tracking-[.05em] text-[var(--bf-dev-text)]">{heading}</th>)}</tr></thead>
              <tbody>{invoices.map((invoice)=>(
                <tr key={invoice.id} className="border-b border-[var(--bf-dev-border)] last:border-0">
                  <td className="px-3 py-3"><div className="text-[12px] font-extrabold text-[var(--bf-dev-text)]">{invoice.invoice_number}</div><div className="mt-0.5 text-[10px] font-semibold text-[var(--bf-dev-text)]">{humanize(invoice.invoice_type)}</div></td>
                  <td className="px-3 py-3"><div className="text-[11px] font-semibold text-[var(--bf-dev-text)]">{formatDate(invoice.invoice_date)}</div><div className="mt-0.5 text-[10px] font-semibold text-[var(--bf-dev-text)]">Due {formatDate(invoice.due_date)}</div></td>
                  <td className="px-3 py-3 text-[12px] font-extrabold text-[var(--bf-dev-text)]"><Money value={invoice.grand_total}/></td>
                  <td className="px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]"><Money value={invoice.paid_amount}/></td>
                  <td className="px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]"><Money value={invoice.balance_due}/></td>
                  <td className="px-3 py-3"><ToneBadge tone={statusTone(invoice.display_status || invoice.status)}>{humanize(invoice.display_status || invoice.status)}</ToneBadge></td>
                  <td className="px-3 py-3"><Button icon={Eye} onClick={()=>onInvoice(invoice)}>View</Button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Receipts">
        {!receipts.length ? <Empty text="Receipts are issued automatically when a payment is verified." /> : (
          <Table headers={['Receipt','Issued','Amount','Invoice','Reference','Action']} rows={receipts.map((receipt)=>{
            const payment=receipt.payment||{};
            return [receipt.receipt_number,formatDate(receipt.issued_at,true),<Money value={payment.amount ?? receipt.snapshot?.amount}/>,receipt.invoice_number||'Advance / Unallocated',payment.transaction_reference||receipt.snapshot?.transaction_reference||'—',<Button key={receipt.id} icon={Eye} onClick={()=>onReceipt(receipt)}>View</Button>];
          })}/>
        )}
      </Section>
    </div>
  );
}

function UsageLimitsPanel({ data }) {
  const metrics = data.overview?.usage || [];
  const effectivePlan = data.effective?.plan || {};
  const commercialPlan = (data.plans || []).find((plan)=>plan.plan_key===data.subscription?.plan_key) || null;
  return (
    <div className="space-y-4">
      <Section title="Usage & Limits">
        <div className="grid gap-3 xl:grid-cols-3">
          {metrics.map((metric)=>(
            <div key={metric.key} className="rounded-[9px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
              <div className="flex items-center justify-between gap-2"><div className="text-[11px] font-extrabold uppercase tracking-[.06em] text-[var(--bf-dev-text)]">{metric.label}</div><ToneBadge tone={metric.status==='critical'?'danger':metric.status==='warning'?'warning':'success'}>{humanize(metric.status)}</ToneBadge></div>
              <div className="mt-2 text-[22px] font-black tracking-[-.03em] text-[var(--bf-dev-text)]">{Number(metric.used||0).toLocaleString('en-IN')} <span className="text-[13px] font-bold">/ {metric.limit===null?'Unlimited':Number(metric.limit).toLocaleString('en-IN')}</span></div>
              {metric.limit!==null&&<div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bf-dev-surface)]"><div className={cx('h-full rounded-full',metric.status==='critical'?'bg-rose-500':metric.status==='warning'?'bg-amber-500':'bg-emerald-500')} style={{width:`${Math.min(100,Number(metric.percent||0))}%`}}/></div>}
              <div className="mt-2 text-[10px] font-semibold text-[var(--bf-dev-text)]">{metric.limit===null?'No hard limit on the effective plan.':`${metric.percent}% of effective plan capacity used.`}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Limit Source">
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[10px] font-bold uppercase text-[var(--bf-dev-text)]">Commercial Plan</div><div className="mt-1 text-[15px] font-extrabold text-[var(--bf-dev-text)]">{commercialPlan?.name||data.subscription?.plan_key||'Not assigned'}</div><PlanLimitsLine plan={commercialPlan}/></div>
          <div className="rounded-[8px] border border-[rgb(var(--bf-dev-primary-rgb)/.24)] bg-[rgb(var(--bf-dev-primary-rgb)/.06)] p-4"><div className="text-[10px] font-bold uppercase text-[var(--bf-dev-text)]">Effective Runtime Plan</div><div className="mt-1 text-[15px] font-extrabold text-[var(--bf-dev-text)]">{effectivePlan?.name||data.effective?.planKey||'Not resolved'}</div><PlanLimitsLine plan={effectivePlan}/><div className="mt-2 text-[10px] font-semibold text-[var(--bf-dev-text)]">Source: {humanize(data.subscriptionContext?.effective_plan_source||'unknown')}</div></div>
        </div>
        <p className="mt-3 text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">Usage is counted from live tenant runtime data. A commercial plan change is blocked when current tenant usage exceeds the selected plan limits.</p>
      </Section>
    </div>
  );
}

function InvoiceDetail({ invoice, payments, onReceipt }) {
  const linkedPayments=(payments||[]).filter((payment)=>payment.invoice_id===invoice.id);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CommercialMetric label="Invoice" value={invoice.invoice_number}/>
        <CommercialMetric label="Total" value={moneyText(invoice.grand_total,invoice.currency)}/>
        <CommercialMetric label="Paid" value={moneyText(invoice.paid_amount,invoice.currency)} tone="success"/>
        <CommercialMetric label="Balance" value={moneyText(invoice.balance_due,invoice.currency)} tone={Number(invoice.balance_due||0)>0?'warning':'success'}/>
      </div>
      <Grid rows={[['Type',humanize(invoice.invoice_type)],['Status',humanize(invoice.display_status||invoice.status)],['Invoice Date',formatDate(invoice.invoice_date)],['Due Date',formatDate(invoice.due_date)],['Billing Period',`${formatDate(invoice.billing_period_start)} → ${formatDate(invoice.billing_period_end)}`],['Place of Supply',invoice.place_of_supply||'—']]}/>
      <div>
        <div className="mb-2 text-[12px] font-extrabold text-[var(--bf-dev-text)]">Line Items</div>
        <Table headers={['Description','Qty','Rate','Discount','Tax','Taxable']} rows={(invoice.items||[]).map((item)=>[item.description,item.quantity,<Money value={item.rate}/>,<Money value={item.discount}/>,`${Number(item.tax_rate||0)}%`,<Money value={item.amount}/>])}/>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <CommercialMetric label="Subtotal" value={moneyText(invoice.subtotal,invoice.currency)}/>
        <CommercialMetric label="Discount" value={moneyText(invoice.discount,invoice.currency)}/>
        <CommercialMetric label="GST" value={moneyText(Number(invoice.cgst||0)+Number(invoice.sgst||0)+Number(invoice.igst||0),invoice.currency)}/>
        <CommercialMetric label="Grand Total" value={moneyText(invoice.grand_total,invoice.currency)} tone="primary"/>
      </div>
      <div>
        <div className="mb-2 text-[12px] font-extrabold text-[var(--bf-dev-text)]">Linked Payments</div>
        {!linkedPayments.length?<Empty text="No payment linked to this invoice."/>:<Table headers={['Date','Amount','Status','Receipt']} rows={linkedPayments.map((payment)=>[formatDate(payment.payment_date),<Money value={payment.amount}/>,<ToneBadge tone={statusTone(payment.status)}>{humanize(payment.status)}</ToneBadge>,payment.receipt?<Button icon={Eye} onClick={()=>onReceipt(payment.receipt)}>{payment.receipt.receipt_number}</Button>:'—'])}/>}
      </div>
    </div>
  );
}

function ReceiptDetail({ receipt }) {
  const payment=receipt.payment||{};
  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-emerald-500/25 bg-emerald-500/[.06] p-5">
        <div className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--bf-dev-text)]">Buddy Fleets Payment Receipt</div>
        <div className="mt-1 text-[22px] font-black text-[var(--bf-dev-text)]">{receipt.receipt_number}</div>
        <div className="mt-2"><ToneBadge tone="success">Verified Payment</ToneBadge></div>
      </div>
      <Grid rows={[['Issued At',formatDate(receipt.issued_at,true)],['Amount',moneyText(payment.amount??receipt.snapshot?.amount)],['Payment Date',formatDate(payment.payment_date??receipt.snapshot?.payment_date)],['Payment Mode',humanize(payment.payment_mode??receipt.snapshot?.payment_mode)],['Transaction Reference',payment.transaction_reference||receipt.snapshot?.transaction_reference||'—'],['Invoice',receipt.invoice_number||receipt.snapshot?.invoice_number||'Advance / Unallocated']]}/>
      <p className="text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">Receipt issuance is idempotent: one verified payment can have only one receipt. Re-verifying a previously verified payment returns the existing receipt instead of creating a duplicate.</p>
    </div>
  );
}

function FleetAccessPanel({ data, onAction }) {
  const settings = data.portalSettings || {};
  const packs = data.fleetPacks || [];
  const [firstPack] = packs;
  const [primary, setPrimary] = useState(settings.fleet_pack || firstPack?.pack_key || '');
  const [enabled, setEnabled] = useState(Array.isArray(settings.enabled_packs) ? settings.enabled_packs : []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrimary(settings.fleet_pack || firstPack?.pack_key || '');
    setEnabled(Array.isArray(settings.enabled_packs) ? settings.enabled_packs : []);
  }, [settings.fleet_pack, settings.fleet_pack_selection_status, firstPack?.pack_key]);

  async function savePacks() {
    setSaving(true);
    await onAction({ action: 'set_fleet_packs', primaryPack: primary, enabledPacks: [...new Set([primary, ...enabled])] }, 'Fleet Pack configuration saved.');
    setSaving(false);
  }

  const overrides = new Map((data.companyModuleOverrides || []).map((override) => [override.module_key, override]));
  async function saveOverride(moduleKey, accessLevel) {
    await onAction({ action: 'save_module_override', moduleKey, accessLevel, enabled: accessLevel !== 'blocked', reason: 'Company 360 Developer override' }, 'Module override saved.');
  }
  async function clearOverride(moduleKey) {
    await onAction({ action: 'clear_module_override', moduleKey }, 'Module override cleared.');
  }

  return (
    <div className="space-y-4">
      <Section title="Fleet Pack Assignment" action={<Button primary icon={Save} disabled={saving || !primary} onClick={savePacks}>{saving ? 'Saving…' : 'Save Fleet Packs'}</Button>}>
        <div className="grid gap-3 lg:grid-cols-3">
          <label className={label}>
            Primary Fleet Pack
            <SelectMenu
              value={primary}
              ariaLabel="Primary Fleet Pack"
              options={packs.map((pack) => ({ value: pack.pack_key, label: pack.name }))}
              onChange={(value) => { setPrimary(value); setEnabled((current) => [...new Set([value, ...current])]); }}
            />
          </label>
          <Grid rows={[["Selection status", settings.fleet_pack_selection_status || 'pending'], ["Selected at", formatDate(settings.fleet_pack_selected_at, true)]]} />
        </div>
        <div className="mt-4">
          <div className="mb-2 text-[12px] font-bold text-[var(--bf-dev-text)]">Enabled Fleet Packs</div>
          <div className="flex flex-wrap gap-2">
            {packs.map((pack) => (
              <label key={pack.pack_key} className="flex items-center gap-2 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-3 py-2 text-[12px] font-semibold text-[var(--bf-dev-text)]">
                <input
                  type="checkbox"
                  checked={enabled.includes(pack.pack_key) || primary === pack.pack_key}
                  disabled={primary === pack.pack_key}
                  onChange={(event) => setEnabled(event.target.checked ? [...new Set([...enabled, pack.pack_key])] : enabled.filter((value) => value !== pack.pack_key))}
                />
                {pack.short_name || pack.name}
              </label>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[12px] font-medium text-[var(--bf-dev-text)]">Pending compatibility value <b>travels</b> is not treated as the real company type until this selection is explicitly saved.</p>
      </Section>

      <Section title="Company Module Overrides">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr>{['Module', 'Effective access', 'Company override', 'Set', 'Clear'].map((heading) => <th key={heading} className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[12px] font-bold uppercase tracking-[.05em] text-[var(--bf-dev-text)]">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {(data.modules || []).map((module) => {
                const override = overrides.get(module.module_key);
                return (
                  <tr key={module.module_key} className="border-b border-[var(--bf-dev-border)]">
                    <td className="px-3 py-3 text-[12px] text-[var(--bf-dev-text)]"><b>{module.module_name}</b><div className="mt-0.5 text-[11px] font-medium text-[var(--bf-dev-text)]">{module.module_key}</div></td>
                    <td className="px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">{humanize(module.effective_access || 'blocked')}</td>
                    <td className="px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">{override ? `${override.enabled ? 'Enabled' : 'Disabled'} · ${humanize(override.access_level)}` : 'Plan default'}</td>
                    <td className="px-3 py-3">
                      <SelectMenu
                        value={override?.access_level || 'full'}
                        ariaLabel={`Access for ${module.module_name}`}
                        className="w-36"
                        options={[{ value: 'full', label: 'Full' }, { value: 'read_only', label: 'Read only' }, { value: 'blocked', label: 'Blocked' }]}
                        onChange={(value) => saveOverride(module.module_key, value)}
                      />
                    </td>
                    <td className="px-3 py-3"><Button danger={Boolean(override)} disabled={!override} onClick={() => clearOverride(module.module_key)}>Clear</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

export default function Company360Page() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const pageTopRef = useRef(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError('');
    const result = await getCompany360(companyId);
    if (result.ok) setData(result);
    else setError(result.status === 401 ? 'Developer session expired. Please sign in again.' : 'Unable to load Company 360 profile.');
    if (!silent) setLoading(false);
  }

  useEffect(() => { load(); }, [companyId]);

  useEffect(() => {
    document.documentElement.classList.add('bf-c360-page-active');
    document.body.classList.add('bf-c360-page-active');
    return () => {
      document.documentElement.classList.remove('bf-c360-page-active');
      document.body.classList.remove('bf-c360-page-active');
    };
  }, []);

  const company = data?.company || {};
  const profile = data?.profile || {};
  const subscription = data?.subscription || {};
  const activeEmployees = (data?.employees || []).filter((employee) => employee.status === 'active').length;

  async function act(payload, success) {
    const result = await company360Action(companyId, payload);
    if (!result.ok) {
      setNotice({ tone: 'danger', message: result.message || result.code || 'Action failed' });
      return false;
    }
    if (success) setNotice({ tone: 'success', message: success });
    await load();
    setModal(null);
    return true;
  }

  function changeTab(nextTab) {
    setTab(nextTab);
    requestAnimationFrame(() => {
      const element = pageTopRef.current;
      if (!element) return;
      const top = element.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  }

  function openPortal() {
    if (!company.subdomain_slug) return;
    window.open(`https://portal.buddyfleets.in/${encodeURIComponent(company.subdomain_slug)}/`, '_blank', 'noopener,noreferrer');
  }

  async function viewDocument(document) {
    const result=await company360Action(companyId,{action:'get_document_url',documentId:document.id});
    if(!result.ok||!result.url){setNotice({tone:'danger',message:result.message||result.code||'Unable to open document.'});return;}
    window.open(result.url,'_blank','noopener,noreferrer');
  }

  async function uploadDocument(payload) {
    const file=payload.file;
    const ticket=await company360Action(companyId,{action:'request_document_upload',fileName:file.name,mimeType:file.type,fileSize:file.size});
    if(!ticket.ok){setNotice({tone:'danger',message:ticket.message||ticket.code||'Unable to prepare secure upload.'});return false;}
    const {error:uploadError}=await supabase.storage.from(ticket.bucket).uploadToSignedUrl(ticket.path,ticket.token,file,{contentType:file.type,upsert:false});
    if(uploadError){setNotice({tone:'danger',message:uploadError.message||'Document upload failed.'});return false;}
    return act({action:'add_document',documentType:payload.documentType,documentName:payload.documentName||file.name,expiryDate:payload.expiryDate||null,notes:payload.notes||'',storageBucket:ticket.bucket,storagePath:ticket.path,fileName:file.name,mimeType:file.type,fileSize:file.size},'Document uploaded for verification.');
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] p-6 text-[var(--bf-dev-text)]">
        <div className="mx-auto max-w-7xl animate-pulse space-y-4">
          <div className="h-10 w-56 rounded-[5px] bg-[var(--bf-dev-surface-2)]" />
          <div className="h-48 rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)]" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)]" />)}</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] p-6 text-[var(--bf-dev-text)]">
        <div className="mx-auto max-w-4xl">
          <Button icon={ArrowLeft} onClick={() => navigate('/saas-platform/companies/all-companies')}>Back to All Companies</Button>
          <div className="mt-4 rounded-[6px] border border-rose-500/25 bg-rose-500/10 p-4 text-[13px] font-semibold text-rose-500">{error || 'Company not found.'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-var(--bf-header-height,66px))] bg-[var(--bf-dev-page-bg)] text-[var(--bf-dev-text)] print:bg-white print:text-black">
      <style>{`
        .bf-c360-scrollbar { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--bf-dev-text) 18%, transparent) transparent; }
        .bf-c360-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .bf-c360-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .bf-c360-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--bf-dev-text) 18%, transparent); border-radius: 999px; }
        .bf-c360-scrollbar:hover::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--bf-dev-text) 28%, transparent); }
        html.bf-c360-page-active, body.bf-c360-page-active { scrollbar-width: thin; scrollbar-color: rgba(127,127,127,.28) transparent; }
        html.bf-c360-page-active::-webkit-scrollbar, body.bf-c360-page-active::-webkit-scrollbar { width: 6px; height: 6px; }
        html.bf-c360-page-active::-webkit-scrollbar-track, body.bf-c360-page-active::-webkit-scrollbar-track { background: transparent; }
        html.bf-c360-page-active::-webkit-scrollbar-thumb, body.bf-c360-page-active::-webkit-scrollbar-thumb { background: rgba(127,127,127,.28); border-radius: 999px; }
        html.bf-c360-page-active::-webkit-scrollbar-thumb:hover, body.bf-c360-page-active::-webkit-scrollbar-thumb:hover { background: rgba(127,127,127,.42); }
      `}</style>
      <div className="mx-auto max-w-[1720px] px-4 py-5 sm:px-6 xl:px-7">
        <div className="grid gap-5 lg:grid-cols-[205px_minmax(0,1fr)]">
          <Company360Nav active={tab} onChange={changeTab} />

          <main ref={pageTopRef} className="min-w-0">
            <div className="mb-5 print:hidden">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[var(--bf-dev-text)]">
                <button type="button" onClick={() => navigate('/saas-platform/companies/all-companies')} className="hover:text-[var(--bf-dev-primary)]">Companies</button>
                <ChevronRight size={12} />
                <span>{company.company_name}</span>
                <ChevronRight size={12} />
                <span className="font-bold">Company 360</span>
              </div>

              <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold tracking-[-.025em] text-[var(--bf-dev-text)]">Company 360</h2>
                  <p className="mt-1 text-[12px] font-semibold text-[var(--bf-dev-text)]">Complete view and control for this company. Manage configuration, users, subscription and platform access.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button icon={ExternalLink} onClick={openPortal} disabled={!company.subdomain_slug}>Open Portal</Button>
                  <Button icon={UserCog} primary onClick={() => changeTab('profile')}>Edit Company</Button>
                  <MoreActionsMenu onRefresh={load} onAnnouncement={() => setModal('announcement')} />
                </div>
              </div>
            </div>

            <div className="print:hidden">
              {tab === 'overview' && <OverviewPage data={data} activeEmployees={activeEmployees} onOpen={changeTab} company={company} profile={profile} />}

              {tab !== 'overview' && <div className="mb-5"><HeroCard company={company} profile={profile} data={data} activeEmployees={activeEmployees} /></div>}

              {tab === 'profile' && <ProfileManagement data={data} onEditProfile={() => setModal({type:'profile'})} onEditInternal={() => setModal({type:'internal_profile'})} />}

              {tab === 'sites' && <SitesManagement sites={data.sites || []} onAdd={() => setModal({type:'site',site:null})} onEdit={(site) => setModal({type:'site',site})} />}

              {tab === 'subscription' && <SubscriptionPlanPanel data={data} onEdit={() => setModal({ type: 'subscription' })} />}

              {tab === 'billing' && <BillingPaymentsPanel data={data} onRecord={() => setModal('payment')} onVerify={(payment) => act({ action: 'verify_payment', paymentId: payment.id }, 'Payment verified and receipt issued.')} onReject={(payment) => setModal({ type: 'reject_payment', payment })} onReceipt={(receipt) => setModal({ type: 'receipt_detail', receipt })} />}

              {tab === 'invoices' && <InvoicesReceiptsPanel data={data} onCreate={() => setModal('invoice')} onInvoice={(invoice) => setModal({ type: 'invoice_detail', invoice })} onReceipt={(receipt) => setModal({ type: 'receipt_detail', receipt })} />}

              {tab === 'employees' && <Section title="Employees & Access" action={<Button icon={UserPlus} primary onClick={() => setModal('employee')}>Add Employee</Button>}><div className="space-y-2">{!(data.employees || []).length && <Empty />}{(data.employees || []).map((employee) => <div key={employee.id} className="flex flex-col gap-3 rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="text-[13px] font-bold text-[var(--bf-dev-text)]">{employee.full_name}</div><div className="mt-1 text-[12px] font-medium text-[var(--bf-dev-text)]">{employee.email} · {humanize(employee.role_key)} · {employee.branch || 'No branch'} · {humanize(employee.status)}</div></div><div className="flex flex-wrap gap-2">{employee.status === 'blocked' ? <Button icon={Unlock} onClick={() => act({ action: 'unblock_employee', employeeId: employee.id }, 'Employee access restored.')}>Unblock</Button> : <Button icon={Lock} danger onClick={() => act({ action: 'block_employee', employeeId: employee.id }, 'Employee blocked.')}>Block</Button>}<Button icon={KeyRound} onClick={() => setModal({ type: 'reset', employee })}>Reset Password</Button></div></div>)}</div></Section>}

              {tab === 'documents' && <DocumentsManagement documents={data.documents || []} onUpload={() => setModal({type:'document'})} onView={viewDocument} onVerify={(doc)=>act({action:'verify_document',documentId:doc.id},'Document verified.')} onReject={(doc)=>act({action:'reject_document',documentId:doc.id},'Document rejected.')} />}

              {tab === 'usage' && <UsageLimitsPanel data={data} />}

              {tab === 'fleet' && <FleetAccessPanel data={data} onAction={act} />}

              {tab === 'modules' && <Section title="Modules & Features"><Table headers={['Module', 'Category', 'Effective Access', 'Availability UX']} rows={(data.modules || []).map((module) => [module.module_name, humanize(module.category), humanize(module.effective_access), humanize(module.unavailable_behavior)])} /></Section>}

              {tab === 'overrides' && <Section title="Company Overrides"><Grid rows={[["Override Enabled", data.override?.enabled ? 'Yes' : 'No'], ["Override Plan", data.override?.plan_key || 'Plan default'], ["Vehicle Max", data.override?.limits_override?.vehicles_max ?? 'Default'], ["Users", data.override?.limits_override?.users ?? 'Default'], ["Sites", data.override?.limits_override?.sites ?? 'Default'], ["Module Overrides", (data.override?.entitlements_override || []).join(', ') || 'None']]} /></Section>}

              {tab === 'portal' && <Section title="Portal Configuration"><p className="text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">Controls company dashboard widgets, sidebar visibility, landing screen and company-specific branding. Module visibility is resolved from Plan → Lifecycle Policy → Company Override → Employee Role.</p><div className="mt-4"><Grid rows={[["Landing Path", data.portalConfig?.landing_path || '/dashboard'], ["Dashboard Widgets", Array.isArray(data.portalConfig?.dashboard_widgets) ? data.portalConfig.dashboard_widgets.join(', ') : 'Default'], ["Revision", data.portalConfig?.revision || 1]]} /></div></Section>}

              {tab === 'bulk_import' && <BulkImportPanel companyId={companyId} company={company} sites={data.sites || []} onImported={() => load(true)} />}

              {tab === 'communications' && <Section title="Communications" action={<Button icon={Bell} primary onClick={() => setModal('announcement')}>Send Announcement</Button>}><Table headers={['Created', 'Title', 'Priority', 'Audience', 'Status']} rows={(data.announcements || []).map((announcement) => [formatDate(announcement.created_at, true), announcement.title, humanize(announcement.priority), humanize(announcement.audience_type), humanize(announcement.status)])} /></Section>}

              {tab === 'security' && <Section title="Security"><Grid rows={[["Company Status", humanize(company.status)], ["Owner User ID", company.account_owner_user_id || 'Not linked'], ["Access Policy", company.status === 'suspended' ? 'Blocked by company suspension' : humanize(subscription.status || 'Standard')], ["Employees", `${activeEmployees} active`]]} /><p className="mt-3 text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">Password hashes and session tokens are never shown. Block/unblock and password reset actions operate through secure server-side admin APIs.</p></Section>}

              {tab === 'activity' && <Section title="Activity Log"><p className="text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">Company 360 actions are already written to the Developer SaaS history layer. The full filtered timeline will be connected in the Control Plane phase without changing this visual foundation.</p></Section>}

              {tab === 'support' && <Section title="Support & Notes" action={<Button icon={Plus} onClick={() => setModal('note')}>Add Note</Button>}><div className="space-y-2">{!(data.notes || []).length && <Empty />}{(data.notes || []).map((note) => <div key={note.id} className="rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[13px] font-bold text-[var(--bf-dev-text)]">{note.title || humanize(note.note_type)}</div><div className="mt-1 whitespace-pre-wrap text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">{note.body}</div></div>)}</div></Section>}
            </div>

          </main>
        </div>
      </div>

      {notice && <Toast tone={notice.tone} message={notice.message} onClose={() => setNotice(null)} />}

      {modal && <ModalShell title={
        modal?.type === 'reset' ? 'Reset Employee Password'
          : modal?.type === 'profile' ? 'Edit Company Profile'
            : modal?.type === 'internal_profile' ? 'Internal Account Ownership'
              : modal?.type === 'site' ? (modal.site ? 'Edit Site / Branch' : 'Add Site / Branch')
                : modal?.type === 'document' ? 'Upload Company Document'
                  : modal?.type === 'subscription' ? 'Edit Commercial Subscription'
                    : modal?.type === 'reject_payment' ? 'Reject Payment'
                      : modal?.type === 'invoice_detail' ? `Invoice ${modal.invoice?.invoice_number || ''}`
                        : modal?.type === 'receipt_detail' ? `Receipt ${modal.receipt?.receipt_number || ''}`
                          : modal === 'employee' ? 'Add Employee'
                            : modal === 'payment' ? 'Record Payment'
                              : modal === 'invoice' ? 'Generate Invoice'
                                : modal === 'announcement' ? 'Send Company Announcement'
                                  : 'Add Internal Note'
      } onClose={() => setModal(null)}>
        {modal?.type === 'profile' && <ProfileForm company={company} profile={profile} onSubmit={(payload)=>act({action:'update_profile',...payload,expectedRevision:profile.revision||0},'Company profile updated.')} />}
        {modal?.type === 'internal_profile' && <InternalProfileForm value={data.internalProfile||{}} assignees={data.developerAssignees||[]} onSubmit={(payload)=>act({action:'save_internal_profile',...payload,expectedRevision:data.internalProfile?.revision||0},'Internal ownership updated.')} />}
        {modal?.type === 'site' && <SiteForm site={modal.site} onSubmit={(payload)=>act({action:'save_site',...payload,siteId:modal.site?.id||null},modal.site?'Site updated.':'Site created.')} />}
        {modal?.type === 'document' && <DocumentUploadForm onSubmit={uploadDocument} />}
        {modal?.type === 'subscription' && <SubscriptionForm data={data} onSubmit={(payload)=>act({action:'update_subscription',...payload},'Commercial subscription updated.')} />}
        {modal === 'employee' && <EmployeeForm onSubmit={(payload) => act({ action: 'create_employee', ...payload }, 'Employee created successfully.')} />}
        {modal?.type === 'reset' && <ResetForm employee={modal.employee} onSubmit={(payload) => act({ action: 'reset_password', employeeId: modal.employee.id, ...payload }, 'Password reset successfully.')} />}
        {modal === 'payment' && <PaymentForm invoices={data.commercial?.invoices || data.invoices || []} onSubmit={(payload) => act({ action: 'record_payment', ...payload }, 'Payment recorded for verification.')} />}
        {modal?.type === 'reject_payment' && <RejectPaymentForm payment={modal.payment} onSubmit={(payload)=>act({action:'reject_payment',paymentId:modal.payment.id,...payload},'Payment rejected.')} />}
        {modal === 'invoice' && <InvoiceForm onSubmit={(payload) => act({ action: 'create_invoice', ...payload }, 'Invoice generated.')} />}
        {modal?.type === 'invoice_detail' && <InvoiceDetail invoice={modal.invoice} payments={data.commercial?.payments || data.payments || []} onReceipt={(receipt)=>setModal({type:'receipt_detail',receipt})} />}
        {modal?.type === 'receipt_detail' && <ReceiptDetail receipt={modal.receipt} />}
        {modal === 'announcement' && <AnnouncementForm onSubmit={(payload) => act({ action: 'send_announcement', ...payload }, 'Announcement published to company employees.')} />}
        {modal === 'note' && <NoteForm onSubmit={(payload) => act({ action: 'add_note', ...payload }, 'Note saved.')} />}
      </ModalShell>}
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <section className={cx(surfaceCard, 'p-4 sm:p-5')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--bf-dev-border)] pb-3">
        <h2 className="text-[17px] font-bold text-[var(--bf-dev-text)]">{title}</h2>
        <div className="print:hidden">{action}</div>
      </div>
      {children}
    </section>
  );
}

function Grid({ rows }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map(([key, value]) => (
        <div key={key} className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-[.06em] text-[var(--bf-dev-text)]">{key}</div>
          <div className="mt-1.5 break-words text-[13px] font-semibold text-[var(--bf-dev-text)]">{value || '—'}</div>
        </div>
      ))}
    </div>
  );
}

function Table({ headers, rows }) {
  if (!rows.length) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead className="bg-[var(--bf-dev-surface-2)]">
          <tr>{headers.map((heading) => <th key={heading} className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[12px] font-bold uppercase tracking-[.05em] text-[var(--bf-dev-text)]">{heading}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-[var(--bf-dev-border)] last:border-0">
              {row.map((value, cellIndex) => <td key={cellIndex} className="px-3 py-3 text-[12px] font-medium text-[var(--bf-dev-text)]">{value || '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Toast({ tone = 'success', message, onClose }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const success = tone === 'success';
  return (
    <div className="fixed bottom-5 right-5 z-[250] w-[min(390px,calc(100vw-40px))] rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.28)] print:hidden">
      <div className="flex items-start gap-3">
        {success ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-500" />}
        <div className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-[var(--bf-dev-text)]">{message}</div>
        <button type="button" onClick={onClose} aria-label="Close notification" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-[var(--bf-dev-text)] hover:bg-[var(--bf-dev-surface-2)]"><X size={14} /></button>
      </div>
    </div>
  );
}

function normalizeImportHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeImportCell(key, value, XLSX) {
  const dateLike = key === 'dob' || key === 'registration_date' || key === 'rc_validity' || key.endsWith('_date') || key.endsWith('_expiry');
  if (!dateLike) return typeof value === 'string' ? value.trim() : value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') {
    const parsed = XLSX.SSF?.parse_date_code?.(value);
    if (parsed?.y && parsed?.m && parsed?.d) return `${String(parsed.y).padStart(4, '0')}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
  }
  return typeof value === 'string' ? value.trim() : value;
}

function BulkImportPanel({ companyId, company, sites, onImported }) {
  const [importType, setImportType] = useState('vehicles');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [validation, setValidation] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState('');
  const fileRef = useRef(null);
  const definition = BULK_IMPORT_DEFINITIONS[importType];

  function resetFileState() {
    setFileName('');
    setRows([]);
    setParseError('');
    setValidation(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function downloadTemplate() {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const headers = definition.columns.map(([header]) => header);
    const firstActiveSite = (sites || []).find((site) => site.status === 'active') || (sites || [])[0] || null;
    const sampleValues = { ...definition.sample };
    if (importType === 'vehicles') {
      sampleValues.home_site_code = firstActiveSite?.code || '';
      sampleValues.current_site_code = firstActiveSite?.code || '';
    } else {
      sampleValues.primary_site_code = firstActiveSite?.code || '';
    }
    const sample = definition.columns.map(([, key]) => sampleValues?.[key] ?? '');
    const dataSheet = XLSX.utils.aoa_to_sheet([headers]);
    dataSheet['!cols'] = headers.map((header) => ({ wch: Math.max(14, Math.min(24, header.length + 3)) }));
    XLSX.utils.book_append_sheet(workbook, dataSheet, definition.sheetName);
    const exampleSheet = XLSX.utils.aoa_to_sheet([headers, sample]);
    exampleSheet['!cols'] = dataSheet['!cols'];
    XLSX.utils.book_append_sheet(workbook, exampleSheet, 'Example');

    const instructions = [
      ['Buddy Fleets Bulk Import Template'],
      ['Template Version', 'BF-C360-IMPORT-V1'],
      ['Import Type', definition.label],
      ['Company', company.company_name || ''],
      ['Company Code', company.company_code || ''],
      [],
      ['Rules'],
      ['1', `Required columns: ${definition.required.join(', ')}`],
      ['2', 'Do not rename template headers. Column order may be changed.'],
      ['3', 'Dates must use YYYY-MM-DD format.'],
      ['4', 'Site fields use the Site Code shown in the Sites sheet. Leave blank when no site assignment is needed.'],
      ['5', 'Duplicate vehicle numbers / driver codes are rejected. Existing records are never overwritten by bulk import.'],
      ['6', 'The Example sheet is for reference only. Enter real records in the main data sheet. Maximum 1,000 data rows per import.'],
      ['7', 'The import is validated before commit. If validation fails, no rows are written.'],
    ];
    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
    instructionSheet['!cols'] = [{ wch: 22 }, { wch: 95 }];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');

    const siteRows = [['Site Code', 'Site Name', 'Type', 'Status'], ...(sites || []).map((site) => [site.code || '', site.name || '', site.site_type || '', site.status || ''])];
    const sitesSheet = XLSX.utils.aoa_to_sheet(siteRows);
    sitesSheet['!cols'] = [{ wch: 18 }, { wch: 28 }, { wch: 22 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(workbook, sitesSheet, 'Sites');

    const metaSheet = XLSX.utils.aoa_to_sheet([
      ['template_version', 'BF-C360-IMPORT-V1'],
      ['import_type', importType],
      ['company_id', companyId],
    ]);
    XLSX.utils.book_append_sheet(workbook, metaSheet, '_BF_Meta');
    const metaIndex = workbook.SheetNames.indexOf('_BF_Meta');
    if (metaIndex >= 0) workbook.Workbook = { ...(workbook.Workbook || {}), Sheets: workbook.SheetNames.map((name, index) => ({ name, Hidden: index === metaIndex ? 1 : 0 })) };

    const safeCompany = (company.company_name || 'Company').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
    XLSX.writeFile(workbook, `${safeCompany}_${definition.sheetName}_Import_Template.xlsx`);
  }

  async function parseFile(file) {
    setParseError('');
    setValidation(null);
    setResult(null);
    setRows([]);
    setFileName(file?.name || '');
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setParseError('Unsupported file. Upload an Excel (.xlsx/.xls) or CSV file.');
      return;
    }
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const meta = workbook.Sheets._BF_Meta ? XLSX.utils.sheet_to_json(workbook.Sheets._BF_Meta, { header: 1, defval: '' }) : [];
      const metaMap = Object.fromEntries(meta.filter((row) => row?.[0]).map((row) => [String(row[0]), String(row[1] ?? '')]));
      if (metaMap.import_type && metaMap.import_type !== importType) {
        setParseError(`This template is for ${BULK_IMPORT_DEFINITIONS[metaMap.import_type]?.label || metaMap.import_type}. Select the matching import type or download a new template.`);
        return;
      }
      const sheetName = workbook.SheetNames.includes(definition.sheetName) ? definition.sheetName : workbook.SheetNames.find((name) => !['Instructions', 'Sites', 'Example', '_BF_Meta'].includes(name));
      if (!sheetName || !workbook.Sheets[sheetName]) {
        setParseError(`Data sheet not found. Expected a sheet named “${definition.sheetName}”.`);
        return;
      }
      const sheet = workbook.Sheets[sheetName];
      const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: false });
      const headers = (matrix[0] || []).map((value) => String(value || '').trim()).filter(Boolean);
      if (!headers.length) {
        setParseError('The file has no header row. Download the Buddy Fleets template and use its headers.');
        return;
      }
      const allowed = new Map(definition.columns.map(([header, key]) => [normalizeImportHeader(header), { header, key }]));
      const normalizedHeaders = headers.map(normalizeImportHeader);
      const duplicateHeaders = normalizedHeaders.filter((header, index) => header && normalizedHeaders.indexOf(header) !== index);
      const unknownHeaders = headers.filter((header) => !allowed.has(normalizeImportHeader(header)));
      const missingRequired = definition.required.filter((required) => !normalizedHeaders.includes(normalizeImportHeader(required)));
      if (duplicateHeaders.length || unknownHeaders.length || missingRequired.length) {
        const messages = [];
        if (missingRequired.length) messages.push(`Missing required column(s): ${missingRequired.join(', ')}`);
        if (unknownHeaders.length) messages.push(`Unsupported column(s): ${unknownHeaders.join(', ')}`);
        if (duplicateHeaders.length) messages.push('Duplicate column headers detected.');
        setParseError(`${messages.join(' ')} Download the latest template and keep the supported headers unchanged.`);
        return;
      }
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true, blankrows: false });
      const mapped = rawRows.map((raw) => {
        const output = {};
        for (const [header, value] of Object.entries(raw)) {
          const match = allowed.get(normalizeImportHeader(header));
          if (match) output[match.key] = normalizeImportCell(match.key, value, XLSX);
        }
        return output;
      }).filter((row) => Object.values(row).some((value) => String(value ?? '').trim() !== ''));
      if (!mapped.length) {
        setParseError('No data rows found. Add records below the template header and try again.');
        return;
      }
      if (mapped.length > 1000) {
        setParseError(`This file contains ${mapped.length.toLocaleString('en-IN')} rows. Maximum 1,000 rows are allowed per import.`);
        return;
      }
      setRows(mapped);
    } catch (error) {
      setParseError(error?.message ? `Unable to read this file: ${error.message}` : 'Unable to read this file. Download a fresh template and try again.');
    }
  }

  async function validateFile() {
    if (!rows.length) return;
    setBusy('validate');
    setValidation(null);
    setResult(null);
    const response = await company360Action(companyId, {
      action: 'validate_bulk_import',
      importType,
      templateVersion: 'BF-C360-IMPORT-V1',
      rows,
    });
    setBusy('');
    if (!response.ok) {
      setValidation({ valid: false, summary: response.summary || { total: rows.length, valid: 0, invalid: rows.length }, errors: response.errors || [{ row: '—', field: 'File', message: response.message || response.code || 'Validation failed.' }] });
      return;
    }
    setValidation(response);
  }

  async function commitImport() {
    if (!validation?.valid || !rows.length) return;
    setBusy('import');
    setResult(null);
    const response = await company360Action(companyId, {
      action: 'commit_bulk_import',
      importType,
      templateVersion: 'BF-C360-IMPORT-V1',
      rows,
    });
    setBusy('');
    if (!response.ok) {
      setValidation({ valid: false, summary: response.summary || validation.summary, errors: response.errors || [{ row: '—', field: 'Import', message: response.message || response.code || 'Import failed.' }] });
      return;
    }
    setResult(response);
    setValidation({ ...validation, valid: true });
    await onImported?.();
  }

  const previewColumns = definition.columns.filter(([, key]) => rows.some((row) => String(row[key] ?? '').trim() !== '')).slice(0, 6);
  const summary = validation?.summary;

  return (
    <div className="space-y-4">
      <Section title="Bulk Data Import">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="rounded-[9px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1">
                  <Select
                    title="Import Type"
                    value={importType}
                    onChange={(event) => { setImportType(event.target.value); resetFileState(); }}
                  >
                    <option value="vehicles">Vehicle Master</option>
                    <option value="drivers">Driver Master</option>
                  </Select>
                </div>
                <Button icon={Download} onClick={downloadTemplate}>Download Template</Button>
              </div>
              <div className="mt-3 text-[12px] font-medium leading-5 text-[var(--bf-dev-text)]">
                Download the current Buddy Fleets template, keep its supported headers unchanged, then upload the completed file. Existing records are never overwritten by this importer.
              </div>
            </div>

            <div className="rounded-[9px] border border-dashed border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-5">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)]"><FileSpreadsheet size={19} /></div>
                  <div>
                    <div className="text-[13px] font-extrabold text-[var(--bf-dev-text)]">{fileName || 'Choose completed import file'}</div>
                    <div className="mt-1 text-[11px] font-semibold text-[var(--bf-dev-text)]">Excel .xlsx/.xls or CSV · maximum 1,000 rows</div>
                  </div>
                </div>
                <label style={{ color: '#FFFFFF' }} className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-[8px] bg-[var(--bf-dev-primary)] px-3.5 text-[12px] font-bold !text-white transition hover:brightness-110">
                  <UploadCloud size={14} /> Select File
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(event) => parseFile(event.target.files?.[0])} />
                </label>
              </div>
              {parseError && <div className="mt-4 rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-3 text-[12px] font-semibold leading-5 text-rose-500">{parseError}</div>}
            </div>

            {!!rows.length && !parseError && (
              <div className="rounded-[9px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-extrabold text-[var(--bf-dev-text)]">File loaded · {rows.length.toLocaleString('en-IN')} rows</div>
                    <div className="mt-1 text-[11px] font-semibold text-[var(--bf-dev-text)]">Validate against company sites, duplicates and field rules before importing.</div>
                  </div>
                  <Button icon={CheckCircle2} primary disabled={Boolean(busy)} onClick={validateFile}>{busy === 'validate' ? 'Validating…' : 'Validate File'}</Button>
                </div>
                {previewColumns.length > 0 && (
                  <div className="bf-c360-scrollbar mt-4 overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left">
                      <thead className="bg-[var(--bf-dev-surface-2)]"><tr>{previewColumns.map(([header]) => <th key={header} className="border-b border-[var(--bf-dev-border)] px-3 py-2.5 text-[11px] font-bold text-[var(--bf-dev-text)]">{header}</th>)}</tr></thead>
                      <tbody>{rows.slice(0, 5).map((row, index) => <tr key={index}>{previewColumns.map(([header, key]) => <td key={key} className="border-b border-[var(--bf-dev-border)] px-3 py-2.5 text-[11px] font-medium text-[var(--bf-dev-text)]">{String(row[key] ?? '') || '—'}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[9px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-4">
              <div className="text-[13px] font-extrabold text-[var(--bf-dev-text)]">Import Safety</div>
              <div className="mt-3 space-y-3 text-[11px] font-semibold leading-5 text-[var(--bf-dev-text)]">
                <div>✓ Server re-validates every row before commit.</div>
                <div>✓ Existing vehicle numbers / driver codes are protected from overwrite.</div>
                <div>✓ Site codes must belong to this company.</div>
                <div>✓ Validation failure writes zero rows.</div>
                <div>✓ Successful import is recorded in the Developer audit history.</div>
              </div>
            </div>

            {summary && (
              <div className={cx('rounded-[9px] border p-4', validation.valid ? 'border-emerald-500/30 bg-emerald-500/[.08]' : 'border-amber-500/30 bg-amber-500/[.08]')}>
                <div className="flex items-center gap-2 text-[13px] font-extrabold text-[var(--bf-dev-text)]">{validation.valid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />} Validation Summary</div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[['Total', summary.total], ['Valid', summary.valid], ['Invalid', summary.invalid]].map(([title, value]) => <div key={title} className="rounded-[7px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-2.5"><div className="text-[10px] font-bold uppercase text-[var(--bf-dev-text)]">{title}</div><div className="mt-1 text-[18px] font-black text-[var(--bf-dev-text)]">{Number(value || 0).toLocaleString('en-IN')}</div></div>)}
                </div>
                {validation.valid && <Button className="mt-3 w-full" icon={UploadCloud} primary disabled={Boolean(busy) || Boolean(result?.ok)} onClick={commitImport}>{result?.ok ? 'Import Complete' : busy === 'import' ? 'Importing…' : `Import ${summary.valid} Rows`}</Button>}
              </div>
            )}

            {result?.ok && (
              <div className="rounded-[9px] border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-[13px] font-extrabold text-emerald-500"><CheckCircle2 size={16} /> Import Completed</div>
                <div className="mt-2 text-[12px] font-semibold leading-5 text-[var(--bf-dev-text)]">{Number(result.imported || 0).toLocaleString('en-IN')} {definition.label.toLowerCase()} record(s) imported successfully. No existing records were overwritten.</div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {!!validation?.errors?.length && (
        <Section title="Validation Errors">
          <div className="bf-c360-scrollbar max-h-[360px] overflow-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="sticky top-0 bg-[var(--bf-dev-surface-2)]"><tr>{['Excel Row', 'Field', 'Issue'].map((heading) => <th key={heading} className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[11px] font-bold text-[var(--bf-dev-text)]">{heading}</th>)}</tr></thead>
              <tbody>{validation.errors.map((error, index) => <tr key={`${error.row}-${error.field}-${index}`}><td className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[12px] font-bold text-[var(--bf-dev-text)]">{error.row}</td><td className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[12px] font-semibold text-[var(--bf-dev-text)]">{error.field || '—'}</td><td className="border-b border-[var(--bf-dev-border)] px-3 py-3 text-[12px] font-medium text-rose-500">{error.message}</td></tr>)}</tbody>
            </table>
          </div>
          {validation.errorsTruncated && <div className="mt-3 text-[11px] font-semibold text-[var(--bf-dev-text)]">Only the first validation errors are shown. Correct the file and validate again.</div>}
        </Section>
      )}
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 print:hidden">
      <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[9px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--bf-dev-border)] px-5 py-4">
          <h3 className="text-[17px] font-bold text-[var(--bf-dev-text)]">{title}</h3>
          <Button onClick={onClose}>Close</Button>
        </div>
        <div className="bf-c360-scrollbar min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ title, ...props }) {
  return <label className={label}>{title}<input {...props} className={input} /></label>;
}

function Select({ title, children, value, onChange, ...props }) {
  const options = React.Children.toArray(children).map((child) => ({
    value: child.props.value ?? '',
    label: child.props.children,
  }));
  return (
    <label className={label}>
      {title}
      <SelectMenu
        {...props}
        value={value}
        ariaLabel={title}
        options={options}
        onChange={(nextValue) => onChange?.({ target: { value: nextValue } })}
      />
    </label>
  );
}

function Submit({ text = 'Save' }) {
  return <div className="mt-4 flex justify-end"><button style={{ color: '#FFFFFF' }} className="inline-flex min-h-10 items-center gap-2 rounded-[8px] bg-[var(--bf-dev-primary)] px-4 text-[12px] font-bold !text-white"><Save size={14} />{text}</button></div>;
}

function ProfileForm({ company, profile, onSubmit }) {
  const [form,setForm]=useState({companyName:company.company_name||'',legalName:profile.legal_name||'',tradeName:profile.trade_name||'',registrationType:profile.registration_type||'',businessType:profile.business_type||'',gstin:profile.gstin||'',pan:profile.pan||'',aadhaarLast4:profile.aadhaar_last4||'',cin:profile.cin||'',contactEmail:profile.contact_email||'',contactMobile:profile.contact_mobile||'',alternateMobile:profile.alternate_mobile||'',billingEmail:profile.billing_email||'',website:profile.website||'',ownerName:profile.owner_name||'',ownerEmail:profile.owner_email||'',ownerMobile:profile.owner_mobile||'',addressLine1:profile.address_line1||'',addressLine2:profile.address_line2||'',city:profile.city||'',state:profile.state||'',postalCode:profile.postal_code||'',country:profile.country||'India',notes:profile.notes||''});
  const set=(key)=>(event)=>setForm({...form,[key]:event.target.value});
  return <form onSubmit={(event)=>{event.preventDefault();onSubmit(form);}}><div className="grid gap-3 sm:grid-cols-2"><Field title="Company Name *" required value={form.companyName} onChange={set('companyName')}/><Field title="Legal Name" value={form.legalName} onChange={set('legalName')}/><Field title="Trade Name" value={form.tradeName} onChange={set('tradeName')}/><Field title="Registration Type" value={form.registrationType} onChange={set('registrationType')}/><Field title="Business Type" value={form.businessType} onChange={set('businessType')}/><Field title="GSTIN" value={form.gstin} onChange={set('gstin')}/><Field title="PAN" value={form.pan} onChange={set('pan')}/><Field title="CIN / Registration" value={form.cin} onChange={set('cin')}/><Field title="Aadhaar Last 4" maxLength={4} value={form.aadhaarLast4} onChange={set('aadhaarLast4')}/><Field title="Company Email" type="email" value={form.contactEmail} onChange={set('contactEmail')}/><Field title="Company Mobile" value={form.contactMobile} onChange={set('contactMobile')}/><Field title="Alternate Mobile" value={form.alternateMobile} onChange={set('alternateMobile')}/><Field title="Billing Email" type="email" value={form.billingEmail} onChange={set('billingEmail')}/><Field title="Website" value={form.website} onChange={set('website')}/><Field title="Owner Name" value={form.ownerName} onChange={set('ownerName')}/><Field title="Owner Email" type="email" value={form.ownerEmail} onChange={set('ownerEmail')}/><Field title="Owner Mobile" value={form.ownerMobile} onChange={set('ownerMobile')}/><Field title="Address Line 1" value={form.addressLine1} onChange={set('addressLine1')}/><Field title="Address Line 2" value={form.addressLine2} onChange={set('addressLine2')}/><Field title="City" value={form.city} onChange={set('city')}/><Field title="State" value={form.state} onChange={set('state')}/><Field title="Postal Code" value={form.postalCode} onChange={set('postalCode')}/><Field title="Country" value={form.country} onChange={set('country')}/></div><label className={`${label} mt-3`}>Internal Company Notes<textarea rows={4} value={form.notes} onChange={set('notes')} className={`${input} h-auto py-2`}/></label><Submit text="Save Company Profile"/></form>;
}

function InternalProfileForm({ value, assignees, onSubmit }) {
  const [form,setForm]=useState({accountManagerUserId:value.account_manager_user_id||'',supportOwnerUserId:value.support_owner_user_id||'',customerSegment:value.customer_segment||'standard',priority:value.priority||'normal',riskLevel:value.risk_level||'low',tags:Array.isArray(value.tags)?value.tags.join(', '):''});
  const assigneeOptions=[{value:'',label:'Unassigned'},...assignees.map((row)=>({value:row.id,label:row.full_name||row.email||row.id}))];
  return <form onSubmit={(event)=>{event.preventDefault();onSubmit({...form,tags:form.tags.split(',').map((v)=>v.trim()).filter(Boolean)});}}><div className="grid gap-3 sm:grid-cols-2"><label className={label}>Account Manager<SelectMenu value={form.accountManagerUserId} options={assigneeOptions} onChange={(value)=>setForm({...form,accountManagerUserId:value})}/></label><label className={label}>Support Owner<SelectMenu value={form.supportOwnerUserId} options={assigneeOptions} onChange={(value)=>setForm({...form,supportOwnerUserId:value})}/></label><Field title="Customer Segment" value={form.customerSegment} onChange={(event)=>setForm({...form,customerSegment:event.target.value})}/><Select title="Priority" value={form.priority} onChange={(event)=>setForm({...form,priority:event.target.value})}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option></Select><Select title="Risk Level" value={form.riskLevel} onChange={(event)=>setForm({...form,riskLevel:event.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></Select><Field title="Tags (comma separated)" value={form.tags} onChange={(event)=>setForm({...form,tags:event.target.value})}/></div><Submit text="Save Internal Ownership"/></form>;
}

function SiteForm({ site, onSubmit }) {
  const [form,setForm]=useState({code:site?.code||'',name:site?.name||'',siteType:site?.site_type||'Branch Office',address:site?.address||'',city:site?.city||'',state:site?.state||'',pincode:site?.pincode||'',isPrimary:Boolean(site?.is_primary),status:site?.status||'active'});
  const set=(key)=>(event)=>setForm({...form,[key]:event.target.value});
  return <form onSubmit={(event)=>{event.preventDefault();onSubmit(form);}}><div className="grid gap-3 sm:grid-cols-2"><Field title="Site Code *" required value={form.code} onChange={set('code')}/><Field title="Site Name *" required value={form.name} onChange={set('name')}/><Select title="Site Type" value={form.siteType} onChange={set('siteType')}><option value="Head Office">Head Office</option><option value="Branch Office">Branch Office</option><option value="Depot">Depot</option><option value="Plant">Plant</option><option value="Warehouse">Warehouse</option><option value="Yard">Yard</option><option value="Other">Other</option></Select><Select title="Status" value={form.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></Select><Field title="Address" value={form.address} onChange={set('address')}/><Field title="City" value={form.city} onChange={set('city')}/><Field title="State" value={form.state} onChange={set('state')}/><Field title="Pincode" value={form.pincode} onChange={set('pincode')}/></div><label className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[var(--bf-dev-text)]"><input type="checkbox" checked={form.isPrimary} onChange={(event)=>setForm({...form,isPrimary:event.target.checked})}/>Set as primary site</label><Submit text={site?'Save Site':'Create Site'}/></form>;
}

function DocumentUploadForm({ onSubmit }) {
  const [form,setForm]=useState({documentType:'gst_certificate',documentName:'',expiryDate:'',notes:'',file:null}); const [busy,setBusy]=useState(false);
  async function submit(event){event.preventDefault();if(!form.file)return;setBusy(true);await onSubmit(form);setBusy(false);}
  return <form onSubmit={submit}><div className="grid gap-3 sm:grid-cols-2"><Select title="Document Type" value={form.documentType} onChange={(event)=>setForm({...form,documentType:event.target.value})}><option value="gst_certificate">GST Certificate</option><option value="pan">PAN</option><option value="incorporation_certificate">Incorporation Certificate</option><option value="agreement">Agreement</option><option value="other">Other</option></Select><Field title="Document Name" value={form.documentName} onChange={(event)=>setForm({...form,documentName:event.target.value})}/><Field title="Expiry Date" type="date" value={form.expiryDate} onChange={(event)=>setForm({...form,expiryDate:event.target.value})}/><label className={label}>File *<input required type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event)=>setForm({...form,file:event.target.files?.[0]||null})} className="block w-full rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2 text-[12px] font-medium text-[var(--bf-dev-text)]"/></label></div><label className={`${label} mt-3`}>Notes<textarea rows={4} value={form.notes} onChange={(event)=>setForm({...form,notes:event.target.value})} className={`${input} h-auto py-2`}/></label><div className="mt-2 text-[11px] font-semibold text-[var(--bf-dev-text)]">Private storage · PDF/JPG/PNG/WEBP · maximum 15 MB.</div><Submit text={busy?'Uploading…':'Upload Document'}/></form>;
}

function EmployeeForm({ onSubmit }) {
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', employeeCode: '', designation: '', branch: '', roleKey: 'viewer', password: '', forcePasswordChange: true });
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><div className="grid gap-3 sm:grid-cols-2"><Field title="Full Name *" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /><Field title="Email *" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Field title="Mobile" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /><Field title="Employee ID" value={form.employeeCode} onChange={(event) => setForm({ ...form, employeeCode: event.target.value })} /><Field title="Designation" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} /><Field title="Branch" value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} /><Select title="Role" value={form.roleKey} onChange={(event) => setForm({ ...form, roleKey: event.target.value })}><option value="owner">Company Owner</option><option value="admin">Company Admin</option><option value="fleet_manager">Fleet Manager</option><option value="dispatcher">Dispatcher</option><option value="accountant">Accountant</option><option value="operations_manager">Operations Manager</option><option value="driver_manager">Driver Manager</option><option value="viewer">Viewer</option></Select><Field title="Password *" type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div><label className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[var(--bf-dev-text)]"><input type="checkbox" checked={form.forcePasswordChange} onChange={(event) => setForm({ ...form, forcePasswordChange: event.target.checked })} />Force password change on first login</label><Submit text="Create Employee" /></form>;
}

function ResetForm({ employee, onSubmit }) {
  const [password, setPassword] = useState('');
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit({ password, forcePasswordChange: true }); }}><p className="mb-3 text-[12px] font-medium text-[var(--bf-dev-text)]">Reset password for {employee.full_name}. Current password is never displayed.</p><Field title="New Password *" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /><Submit text="Reset Password" /></form>;
}

function SubscriptionForm({ data, onSubmit }) {
  const subscription = data.subscription || {};
  const plans = (data.plans || []).filter((plan) => plan.status === 'active');
  const usage = data.overview?.usage || [];
  const [form, setForm] = useState({
    expectedRevision: Number(subscription.revision || 1),
    planKey: subscription.plan_key || '',
    status: subscription.status || 'trial_active',
    trialStartAt: dateInputValue(subscription.trial_start_at),
    trialEndAt: dateInputValue(subscription.trial_end_at),
    subscriptionStartAt: dateInputValue(subscription.subscription_start_at),
    subscriptionEndAt: dateInputValue(subscription.subscription_end_at),
    reason: '',
  });
  const selectedPlan = plans.find((plan) => plan.plan_key === form.planKey) || null;
  const selectedLimits = selectedPlan?.limits || {};
  const usageMap = Object.fromEntries(usage.map((metric) => [metric.key, Number(metric.used || 0)]));
  const conflicts = [];
  if (selectedPlan) {
    if (selectedLimits.vehicles_max != null && Number(usageMap.vehicles || 0) > Number(selectedLimits.vehicles_max)) conflicts.push(`Vehicles ${usageMap.vehicles || 0}/${selectedLimits.vehicles_max}`);
    if (selectedLimits.users != null && Number(usageMap.employees || 0) > Number(selectedLimits.users)) conflicts.push(`Users ${usageMap.employees || 0}/${selectedLimits.users}`);
    if (selectedLimits.sites != null && Number(usageMap.sites || 0) > Number(selectedLimits.sites)) conflicts.push(`Sites ${usageMap.sites || 0}/${selectedLimits.sites}`);
  }
  const companyBlocked = ['pending_confirmation', 'suspended', 'cancelled'].includes(String(data.company?.status || '').toLowerCase());
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <div className="rounded-[8px] border border-[rgb(var(--bf-dev-primary-rgb)/.24)] bg-[rgb(var(--bf-dev-primary-rgb)/.06)] p-3 text-[11px] font-semibold leading-5 text-[var(--bf-dev-text)]">
        This changes the commercial subscription only. Effective Runtime Access is still resolved by lifecycle state, trial rules, fleet packs and overrides.
      </div>
      {companyBlocked && <div className="mt-3 rounded-[8px] border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] font-semibold leading-5 text-[var(--bf-dev-text)]">Company control state is {humanize(data.company?.status)}. Commercial edits cannot bypass suspension, cancellation or pending-confirmation controls.</div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Select title="Commercial Plan" value={form.planKey} onChange={set('planKey')}>
          <option value="">No paid plan assigned</option>
          {plans.map((plan) => <option key={plan.plan_key} value={plan.plan_key}>{plan.name}</option>)}
        </Select>
        <Select title="Subscription Status" value={form.status} onChange={set('status')}>
          <option value="trial_active">Trial Active</option>
          <option value="trial_expired">Trial Expired</option>
          <option value="active">Paid Active</option>
        </Select>
        <Field title="Trial Start" type="date" value={form.trialStartAt} onChange={set('trialStartAt')} />
        <Field title="Trial End" type="date" value={form.trialEndAt} onChange={set('trialEndAt')} />
        <Field title="Paid Term Start" type="date" value={form.subscriptionStartAt} onChange={set('subscriptionStartAt')} />
        <Field title="Paid Term End" type="date" value={form.subscriptionEndAt} onChange={set('subscriptionEndAt')} />
      </div>
      {selectedPlan && <div className="mt-3 rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[12px] font-extrabold text-[var(--bf-dev-text)]">{selectedPlan.name}</div><PlanLimitsLine plan={selectedPlan}/></div><div className="flex flex-wrap gap-1.5">{[1,6,12].map((months)=><ToneBadge key={months} tone="neutral">{months}M {moneyText(selectedPlan.prices?.[String(months)] || 0,selectedPlan.currency||'INR')}</ToneBadge>)}</div></div></div>}
      {!!conflicts.length && <div className="mt-3 rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-3 text-[11px] font-semibold leading-5 text-[var(--bf-dev-text)]">Current tenant usage exceeds this plan: {conflicts.join(' · ')}. Server will block the downgrade until usage is reduced or a suitable plan is selected.</div>}
      <label className={`${label} mt-3`}>Change Reason *<textarea required minLength={3} rows={4} value={form.reason} onChange={set('reason')} className={`${input} h-auto py-2`} placeholder="Why is the commercial subscription being changed?" /></label>
      <div className="mt-2 text-[10px] font-semibold text-[var(--bf-dev-text)]">Revision {form.expectedRevision}. If another admin changes this subscription first, this save will be rejected instead of overwriting their change.</div>
      <Submit text="Save Commercial Subscription" />
    </form>
  );
}

function PaymentForm({ invoices, onSubmit }) {
  const payable = invoices.filter((invoice) => {
    const state = String(invoice.display_status || invoice.status || '').toLowerCase();
    const balance = Number(invoice.balance_due ?? (Number(invoice.grand_total || 0) - Number(invoice.paid_amount || 0)));
    const available = Math.max(0, balance - Number(invoice.pending_payment_total || 0));
    return !['draft','paid','cancelled','void'].includes(state) && available > 0.009;
  });
  const [form, setForm] = useState({ requestId: newRequestId(), invoiceId: '', amount: '', paymentDate: new Date().toISOString().slice(0, 10), paymentMode: 'bank_transfer', transactionReference: '', proofUrl: '', remarks: '' });
  const selectedInvoice = payable.find((invoice) => invoice.id === form.invoiceId) || null;
  const availableBalance = selectedInvoice ? Math.max(0, Number(selectedInvoice.balance_due ?? 0) - Number(selectedInvoice.pending_payment_total || 0)) : null;
  const referenceRequired = form.paymentMode !== 'cash';

  function chooseInvoice(event) {
    const invoiceId = event.target.value;
    const invoice = payable.find((row) => row.id === invoiceId);
    const available = invoice ? Math.max(0, Number(invoice.balance_due ?? 0) - Number(invoice.pending_payment_total || 0)) : null;
    setForm((current) => ({ ...current, invoiceId, amount: invoice && available > 0 ? available.toFixed(2) : current.amount }));
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select title="Invoice Allocation" value={form.invoiceId} onChange={chooseInvoice}>
          <option value="">Unallocated / Advance</option>
          {payable.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · Open {moneyText(Math.max(0,Number(invoice.balance_due||0)-Number(invoice.pending_payment_total||0)),invoice.currency)}</option>)}
        </Select>
        <Field title="Amount *" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        <Field title="Payment Date *" type="date" required value={form.paymentDate} onChange={(event) => setForm({ ...form, paymentDate: event.target.value })} />
        <Select title="Mode" value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value })}>
          <option value="upi">UPI</option><option value="bank_transfer">Bank Transfer / NEFT / RTGS / IMPS</option><option value="card">Card</option><option value="payment_gateway">Payment Gateway</option><option value="cheque">Cheque</option><option value="cash">Cash</option><option value="other">Other</option>
        </Select>
        <Field title={`Transaction / UTR${referenceRequired ? ' *' : ''}`} required={referenceRequired} value={form.transactionReference} onChange={(event) => setForm({ ...form, transactionReference: event.target.value })} />
        <Field title="Payment Proof URL" value={form.proofUrl} onChange={(event) => setForm({ ...form, proofUrl: event.target.value })} />
      </div>
      {selectedInvoice && <div className="mt-3 rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3 text-[11px] font-semibold text-[var(--bf-dev-text)]">Invoice {selectedInvoice.invoice_number}: balance {moneyText(selectedInvoice.balance_due,selectedInvoice.currency)} · pending payments {moneyText(selectedInvoice.pending_payment_total,selectedInvoice.currency)} · currently available {moneyText(availableBalance,selectedInvoice.currency)}.</div>}
      <label className={`${label} mt-3`}>Remarks<textarea rows={3} value={form.remarks} onChange={(event)=>setForm({...form,remarks:event.target.value})} className={`${input} h-auto py-2`} /></label>
      <div className="mt-2 text-[10px] font-semibold leading-4 text-[var(--bf-dev-text)]">New payments are recorded as Submitted. Invoice paid totals and receipts change only after verification.</div>
      <Submit text="Record Payment" />
    </form>
  );
}

function RejectPaymentForm({ payment, onSubmit }) {
  const [reason,setReason]=useState('');
  return <form onSubmit={(event)=>{event.preventDefault();onSubmit({reason});}}><div className="rounded-[8px] border border-rose-500/25 bg-rose-500/[.07] p-3 text-[11px] font-semibold leading-5 text-[var(--bf-dev-text)]">Reject {moneyText(payment.amount)} payment{payment.transaction_reference?` · ${payment.transaction_reference}`:''}. A verified payment cannot be rejected from this action.</div><label className={`${label} mt-3`}>Rejection Reason *<textarea required minLength={3} rows={4} value={reason} onChange={(event)=>setReason(event.target.value)} className={`${input} h-auto py-2`} /></label><Submit text="Reject Payment"/></form>;
}

function InvoiceForm({ onSubmit }) {
  const newLine = () => ({ description: '', quantity: 1, rate: '', discount: 0, taxRate: 18, hsnSac: '' });
  const [form, setForm] = useState({ requestId: newRequestId(), invoiceType: 'subscription', invoiceDate: new Date().toISOString().slice(0, 10), dueDate: '', billingPeriodStart: '', billingPeriodEnd: '', placeOfSupply: 'Gujarat', interstate: false, roundOff: 0, notes: '', terms: '', items: [{ ...newLine(), description: 'Buddy Fleets Subscription' }] });

  function updateLine(index,key,value){setForm((current)=>({...current,items:current.items.map((item,itemIndex)=>itemIndex===index?{...item,[key]:value}:item)}));}
  function addLine(){setForm((current)=>({...current,items:[...current.items,newLine()]}));}
  function removeLine(index){setForm((current)=>({...current,items:current.items.filter((_,itemIndex)=>itemIndex!==index)}));}

  const preview=form.items.reduce((acc,item)=>{
    const qty=Math.max(0,Number(item.quantity||0)); const rate=Math.max(0,Number(item.rate||0)); const discount=Math.max(0,Number(item.discount||0)); const taxRate=Math.max(0,Number(item.taxRate||0));
    const gross=qty*rate; const taxable=Math.max(0,gross-discount); const tax=taxable*taxRate/100;
    acc.subtotal+=gross; acc.discount+=discount; acc.taxable+=taxable; acc.tax+=tax; return acc;
  },{subtotal:0,discount:0,taxable:0,tax:0});
  preview.total=preview.taxable+preview.tax+Number(form.roundOff||0);

  return (
    <form onSubmit={(event)=>{event.preventDefault();onSubmit(form);}}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select title="Invoice Type" value={form.invoiceType} onChange={(event)=>setForm({...form,invoiceType:event.target.value})}><option value="subscription">Subscription</option><option value="renewal">Renewal</option><option value="upgrade">Upgrade / Downgrade</option><option value="addon">Add-on</option><option value="custom">Custom</option><option value="proforma">Proforma</option></Select>
        <Field title="Invoice Date *" type="date" required value={form.invoiceDate} onChange={(event)=>setForm({...form,invoiceDate:event.target.value})}/>
        <Field title="Due Date" type="date" min={form.invoiceDate} value={form.dueDate} onChange={(event)=>setForm({...form,dueDate:event.target.value})}/>
        <Field title="Place of Supply" value={form.placeOfSupply} onChange={(event)=>setForm({...form,placeOfSupply:event.target.value})}/>
        <Field title="Billing Period Start" type="date" value={form.billingPeriodStart} onChange={(event)=>setForm({...form,billingPeriodStart:event.target.value})}/>
        <Field title="Billing Period End" type="date" min={form.billingPeriodStart||undefined} value={form.billingPeriodEnd} onChange={(event)=>setForm({...form,billingPeriodEnd:event.target.value})}/>
        <Field title="Round Off" type="number" min="-100" max="100" step="0.01" value={form.roundOff} onChange={(event)=>setForm({...form,roundOff:event.target.value})}/>
        <label className="flex items-end gap-2 pb-2 text-[12px] font-semibold text-[var(--bf-dev-text)]"><input type="checkbox" checked={form.interstate} onChange={(event)=>setForm({...form,interstate:event.target.checked})}/>Inter-state supply (IGST)</label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3"><div><div className="text-[12px] font-extrabold text-[var(--bf-dev-text)]">Invoice Items</div><div className="mt-0.5 text-[10px] font-semibold text-[var(--bf-dev-text)]">Totals are recalculated and validated on the server.</div></div><Button icon={Plus} onClick={addLine}>Add Line</Button></div>
      <div className="mt-2 space-y-2">{form.items.map((item,index)=><div key={index} className="rounded-[8px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3"><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6"><div className="xl:col-span-2"><Field title="Description *" required value={item.description} onChange={(event)=>updateLine(index,'description',event.target.value)}/></div><Field title="Qty *" type="number" min="0.01" step="0.01" required value={item.quantity} onChange={(event)=>updateLine(index,'quantity',event.target.value)}/><Field title="Rate *" type="number" min="0" step="0.01" required value={item.rate} onChange={(event)=>updateLine(index,'rate',event.target.value)}/><Field title="Discount" type="number" min="0" step="0.01" value={item.discount} onChange={(event)=>updateLine(index,'discount',event.target.value)}/><Field title="Tax %" type="number" min="0" max="100" step="0.01" value={item.taxRate} onChange={(event)=>updateLine(index,'taxRate',event.target.value)}/><div className="xl:col-span-2"><Field title="HSN / SAC" value={item.hsnSac} onChange={(event)=>updateLine(index,'hsnSac',event.target.value)}/></div><div className="flex items-end xl:col-span-4"><Button icon={X} danger disabled={form.items.length===1} onClick={()=>removeLine(index)}>Remove Line</Button></div></div></div>)}</div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5"><CommercialMetric label="Subtotal" value={moneyText(preview.subtotal)}/><CommercialMetric label="Discount" value={moneyText(preview.discount)}/><CommercialMetric label="Taxable" value={moneyText(preview.taxable)}/><CommercialMetric label="GST" value={moneyText(preview.tax)}/><CommercialMetric label="Grand Total" value={moneyText(preview.total)} tone="primary"/></div>
      <label className={`${label} mt-3`}>Notes<textarea rows={3} value={form.notes} onChange={(event)=>setForm({...form,notes:event.target.value})} className={`${input} h-auto py-2`}/></label>
      <label className={`${label} mt-3`}>Terms<textarea rows={3} value={form.terms} onChange={(event)=>setForm({...form,terms:event.target.value})} className={`${input} h-auto py-2`}/></label>
      <Submit text={form.invoiceType==='proforma'?'Create Proforma':'Generate Invoice'}/>
    </form>
  );
}

function AnnouncementForm({ onSubmit }) {
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal', requireAcknowledgement: true, allowDismiss: true });
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><Field title="Title *" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><label className={`${label} mt-3`}>Message *<textarea required rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className={`${input} h-auto py-2`} /></label><div className="mt-3 grid gap-3 sm:grid-cols-2"><Select title="Priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="normal">Normal</option><option value="important">Important</option><option value="critical">Critical</option></Select><label className="flex items-end gap-2 pb-2 text-[12px] font-medium text-[var(--bf-dev-text)]"><input type="checkbox" checked={form.requireAcknowledgement} onChange={(event) => setForm({ ...form, requireAcknowledgement: event.target.checked })} />Require acknowledgement</label></div><Submit text="Send to All Active Employees" /></form>;
}

function NoteForm({ onSubmit }) {
  const [form, setForm] = useState({ title: '', body: '', noteType: 'internal' });
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><Field title="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><label className={`${label} mt-3`}>Note *<textarea required rows={6} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className={`${input} h-auto py-2`} /></label><Submit text="Save Note" /></form>;
}
