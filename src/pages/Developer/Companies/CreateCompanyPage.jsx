import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileImage,
  Globe2,
  Loader2,
  MapPin,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Page, PageHeader } from '../shared/DeveloperPageUI';
import { COUNTRIES, COUNTRY_BY_CODE } from '../../../Data/countries';
import {
  checkCompanyIdentityAvailability,
  createCompany,
  createCompanyDraft,
  deleteCompanyDraft,
  getCompanyCreateMetadata,
  getCompanyDraft,
  getCompanyDrafts,
  getCompanySlugPreview,
  lookupCompanyPostalCode,
  saveCompanyDraft,
  verifyCompanyGstin,
} from '../../../services/developerSaasApi';
import { subscribeSessionEvents } from '../../../services/sessionRuntime';
import {
  clearWorkflowDraftFamily,
  readWorkflowAsset,
  readWorkflowDraft,
  removeWorkflowAsset,
  writeWorkflowAsset,
  writeWorkflowDraft,
} from '../../../services/workflowDraftStorage';

const COMPANY_TYPES = [
  'Proprietorship',
  'Partnership Firm',
  'Limited Liability Partnership (LLP)',
  'Private Limited Company',
  'Public Limited Company',
  'One Person Company (OPC)',
  'Other',
];

const DESIGNATIONS = [
  'Proprietor',
  'Partner',
  'Director',
  'Managing Director',
  'Authorized Person',
  'Other',
];

const STEPS = [
  { key: 'company', label: 'Company Details', icon: Building2 },
  { key: 'owner', label: 'Owner Details', icon: UserRound },
  { key: 'fleet', label: 'Fleet Setup', icon: Truck },
  { key: 'commercial', label: 'Commercial', icon: CircleDollarSign },
  { key: 'review', label: 'Review', icon: ShieldCheck },
];

const CREATE_COMPANY_DRAFT_WORKFLOW = 'create-company';
const CREATE_COMPANY_DRAFT_VERSION = 1;
const OWNER_PHOTO_ASSET = 'owner-photo';

function createInitialForm() {
  return {
    legalName: '',
    tradeName: '',
    sameTradeName: false,
    companyType: '',
    gstin: '',
    pan: '',
    cin: '',
    companyEmail: '',
    companyPhone: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    countryCode: 'IN',
    postalCode: '',
    state: '',
    city: '',
    locality: '',
    portalSlug: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    ownerDesignation: '',
    ownerAlternateMobile: '',
    ownerPhoto: null,
    primaryFleet: '',
    additionalFleets: [],
    accountType: 'trial',
    trialWeeks: 1,
    planKey: '',
    billingCycle: 1,
    subscriptionStart: todayIso(),
    discountPercent: 0,
    discountReason: '',
  };
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function useOutsideClose(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open, onClose]);
  return ref;
}

function todayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromIso(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function isoFromDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function endDateForMonths(start, months) {
  const date = dateFromIso(start);
  if (!date) return '';
  date.setMonth(date.getMonth() + Number(months || 0));
  date.setDate(date.getDate() - 1);
  return isoFromDate(date);
}

function endDateForWeeks(start, weeks) {
  const date = dateFromIso(start);
  if (!date) return '';
  date.setDate(date.getDate() + (Number(weeks || 0) * 7) - 1);
  return isoFromDate(date);
}

function formatDate(value) {
  const date = dateFromIso(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatMoney(value, currency = 'INR') {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(number);
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

function digitsOnly(value, max = 20) {
  return String(value || '').replace(/\D/g, '').slice(0, max);
}


function toE164(dialCode, value) {
  const country = String(dialCode || '+91').replace(/\D/g, '');
  const local = digitsOnly(value, 15);
  return country && local ? `+${country}${local}` : '';
}

function fileToDataUrl(file) {
  if (!file) return Promise.resolve('');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return Promise.reject(Object.assign(new Error('INVALID_OWNER_PHOTO'), { code: 'INVALID_OWNER_PHOTO' }));
  }
  if (file.size > 1048576) {
    return Promise.reject(Object.assign(new Error('OWNER_PHOTO_TOO_LARGE'), { code: 'OWNER_PHOTO_TOO_LARGE' }));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(Object.assign(new Error('OWNER_PHOTO_READ_FAILED'), { code: 'OWNER_PHOTO_READ_FAILED' }));
    reader.readAsDataURL(file);
  });
}

function dataUrlToFile(asset) {
  if (!asset?.dataUrl || typeof window === 'undefined' || typeof File !== 'function') return null;
  try {
    const [header, payload] = String(asset.dataUrl).split(',', 2);
    const type = asset.type || header.match(/^data:([^;]+);base64$/)?.[1] || 'application/octet-stream';
    const binary = window.atob(payload || '');
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new File([bytes], asset.name || 'owner-photo', { type, lastModified: Number(asset.lastModified || Date.now()) });
  } catch {
    return null;
  }
}

function serializeCreateCompanyForm(form) {
  const { ownerPhoto, ...serializable } = form || {};
  return serializable;
}

function draftWorkflowKey(draftId) {
  return `${CREATE_COMPANY_DRAFT_WORKFLOW}-${String(draftId || '').trim()}`;
}

function loadCreateCompanyDraft(draftId, serverDraft) {
  const workflow = draftWorkflowKey(draftId);
  const localDraft = readWorkflowDraft(workflow, { version: CREATE_COMPANY_DRAFT_VERSION });
  const localOwnerPhoto = dataUrlToFile(readWorkflowAsset(workflow, OWNER_PHOTO_ASSET, { version: CREATE_COMPANY_DRAFT_VERSION }));
  const serverData = {
    step: Number.isInteger(serverDraft?.currentStep) ? serverDraft.currentStep : 0,
    maxReached: Number.isInteger(serverDraft?.maxReached) ? serverDraft.maxReached : 0,
    form: serverDraft?.formData || {},
    gstResult: serverDraft?.workflowState?.gstResult || null,
    gstWarningAccepted: Boolean(serverDraft?.workflowState?.gstWarningAccepted),
    slugState: serverDraft?.workflowState?.slugState || { slug: '', available: null, suggestions: [], manualAvailable: null },
    slugInput: serverDraft?.workflowState?.slugInput || '',
  };
  const serverUpdatedAt = Date.parse(serverDraft?.updatedAt || '') || 0;
  const useLocal = Boolean(localDraft?.data && Number(localDraft.savedAt || 0) > serverUpdatedAt);
  return {
    data: useLocal ? localDraft.data : serverData,
    ownerPhoto: localOwnerPhoto,
  };
}

function useIdentityAvailability(field, value, enabled) {
  const [state, setState] = useState({ status: 'idle', available: null, code: '' });

  useEffect(() => {
    if (!enabled || !String(value || '').trim()) {
      setState({ status: 'idle', available: null, code: '' });
      return undefined;
    }

    let active = true;
    setState({ status: 'checking', available: null, code: '' });
    const timer = window.setTimeout(async () => {
      const result = await checkCompanyIdentityAvailability({ field, value });
      if (!active) return;
      if (result.ok) {
        setState({
          status: result.available ? 'available' : 'unavailable',
          available: Boolean(result.available),
          code: '',
        });
      } else {
        setState({ status: 'error', available: null, code: result.code || 'IDENTITY_CHECK_FAILED' });
      }
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [field, value, enabled]);

  return state;
}

function AvailabilityHint({ state, idleText = '' }) {
  if (state?.status === 'checking') {
    return <span className="inline-flex items-center gap-1 text-[var(--bf-dev-text-2)]"><Loader2 size={11} className="animate-spin" /> Checking live database…</span>;
  }
  if (state?.status === 'available') {
    return <span className="inline-flex items-center gap-1 font-semibold text-emerald-500"><CheckCircle2 size={11} /> Available</span>;
  }
  if (state?.status === 'error') {
    return <span className="inline-flex items-center gap-1 text-amber-500"><AlertTriangle size={11} /> Availability check unavailable. Retry before continuing.</span>;
  }
  return idleText;
}

function identityAvailabilityError(state, label) {
  if (state?.status === 'unavailable') return `${label} is already in use. Enter a different value.`;
  if (state?.status === 'checking') return `Wait for ${label.toLowerCase()} availability check to finish.`;
  if (state?.status === 'error') return `Unable to verify ${label.toLowerCase()} availability. Retry the check before continuing.`;
  return '';
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function validGstin(value) {
  if (!value) return true;
  return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(value).trim().toUpperCase());
}

function validPan(value) {
  if (!value) return true;
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(String(value).trim().toUpperCase());
}

function validCin(value) {
  if (!value) return true;
  return /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(String(value).trim().toUpperCase());
}

function validWebsite(value) {
  if (!String(value || '').trim()) return true;
  try {
    const normalized = /^https?:\/\//i.test(String(value).trim()) ? String(value).trim() : `https://${String(value).trim()}`;
    const url = new URL(normalized);
    return Boolean(url.hostname && url.hostname.includes('.'));
  } catch {
    return false;
  }
}

function validNationalPhone(value, countryCode) {
  const digits = digitsOnly(value, 15);
  if (countryCode === 'IN') return /^[6-9]\d{9}$/.test(digits);
  return digits.length >= 6 && digits.length <= 15;
}

function InputShell({ label, required, helper, error, children }) {
  return (
    <label className="block min-w-0">
      <span className="flex items-center gap-1 text-[13px] font-semibold text-[var(--bf-dev-text-2)]">
        {label}{required && <span className="text-rose-500">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error ? <div className="mt-1 text-[12px] font-medium text-rose-500">{error}</div> : helper ? <div className="mt-1 text-[12px] leading-4 text-[var(--bf-dev-text-2)]">{helper}</div> : null}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', readOnly = false, autoComplete, className = '', maxLength }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      autoComplete={autoComplete}
      maxLength={maxLength}
      className={cx(
        'h-10 w-full rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[14px] text-[var(--bf-dev-text)] outline-none transition placeholder:text-[var(--bf-dev-text-3)] focus:border-[var(--bf-dev-primary)] focus:ring-2 focus:ring-[rgb(var(--bf-dev-primary-rgb)/.10)]',
        readOnly && 'cursor-default bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]',
        className
      )}
    />
  );
}

function SelectMenu({ value, options, onChange, placeholder = 'Select', searchable = false, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const close = React.useCallback(() => { setOpen(false); setSearch(''); }, []);
  const ref = useOutsideClose(open, close);
  const selected = options.find((item) => item.value === value);
  const filtered = searchable && search
    ? options.filter((item) => `${item.label} ${item.searchText || ''}`.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between gap-3 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-left text-[14px] font-medium text-[var(--bf-dev-text)] outline-none transition hover:bg-[var(--bf-dev-surface-2)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.20)] disabled:cursor-not-allowed disabled:opacity-55"
      >
        <span className={cx('truncate', !selected && 'text-[var(--bf-dev-text-2)]')}>{selected?.label || placeholder}</span>
        <ChevronDown size={14} className={cx('shrink-0 text-[var(--bf-dev-text-2)] transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[120] w-full min-w-[240px] rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-1.5 shadow-[0_20px_60px_rgba(2,6,23,.24)]">
          {searchable && (
            <div className="relative mb-1.5">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bf-dev-text-2)]" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search…"
                className="h-9 w-full rounded-[4px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] pl-8 pr-3 text-[13px] text-[var(--bf-dev-text)] outline-none focus:border-[var(--bf-dev-primary)]"
              />
            </div>
          )}
          <div role="listbox" className="max-h-64 overflow-y-auto">
            {filtered.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(option.value); close(); }}
                  className={cx(
                    'flex w-full items-center justify-between gap-3 rounded-[4px] px-3 py-2 text-left text-[13px] transition',
                    active
                      ? 'bg-[rgb(var(--bf-dev-primary-rgb)/.12)] font-bold text-[var(--bf-dev-primary)]'
                      : 'text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.meta && <span className="shrink-0 text-[12px] text-[var(--bf-dev-text-2)]">{option.meta}</span>}
                </button>
              );
            })}
            {!filtered.length && <div className="px-3 py-4 text-center text-[13px] text-[var(--bf-dev-text-2)]">No matching options</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function MultiSelectMenu({ values, options, onChange, placeholder = 'Add Fleet Packs' }) {
  const [open, setOpen] = useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useOutsideClose(open, close);
  const selected = new Set(values || []);

  function toggle(value) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange([...next]);
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex min-h-10 w-full items-center justify-between gap-3 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2 text-left text-[14px] text-[var(--bf-dev-text)] transition hover:bg-[var(--bf-dev-surface-2)]">
        <span className={cx('truncate', !values?.length && 'text-[var(--bf-dev-text-2)]')}>{values?.length ? `${values.length} additional Fleet Pack${values.length === 1 ? '' : 's'} selected` : placeholder}</span>
        <ChevronDown size={14} className={cx('shrink-0 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[120] max-h-72 w-full min-w-[280px] overflow-y-auto rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-1.5 shadow-[0_20px_60px_rgba(2,6,23,.24)]">
          {options.map((option) => {
            const active = selected.has(option.value);
            return (
              <button key={option.value} type="button" onClick={() => toggle(option.value)} className="flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-left text-[13px] text-[var(--bf-dev-text-2)] transition hover:bg-[var(--bf-dev-surface-2)]">
                <span className={cx('flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border', active ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white' : 'border-[var(--bf-dev-border)]')}>
                  {active && <Check size={10} />}
                </span>
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const active = String(value) === String(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cx(
              'min-h-10 rounded-[5px] border px-3 py-2 text-[13px] font-bold transition',
              active
                ? 'border-[var(--bf-dev-primary)] bg-[rgb(var(--bf-dev-primary-rgb)/.12)] text-[var(--bf-dev-primary)] shadow-[0_0_0_1px_rgb(var(--bf-dev-primary-rgb)/.08)]'
                : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function PhoneInput({ value, onChange, countryCode, placeholder = '98765 43210' }) {
  const country = COUNTRY_BY_CODE[countryCode] || COUNTRY_BY_CODE.IN;
  return (
    <div className="flex h-10 overflow-hidden rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] focus-within:border-[var(--bf-dev-primary)] focus-within:ring-2 focus-within:ring-[rgb(var(--bf-dev-primary-rgb)/.10)]">
      <div className="flex min-w-[76px] items-center justify-center border-r border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-2 text-[13px] font-bold text-[var(--bf-dev-text-2)]">{country?.dialCode || '+91'}</div>
      <input value={value} onChange={(event) => onChange(digitsOnly(event.target.value, 15))} placeholder={placeholder} inputMode="numeric" className="min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[var(--bf-dev-text)] outline-none placeholder:text-[var(--bf-dev-text-3)]" />
    </div>
  );
}

function FieldCard({ title, subtitle, children, icon: Icon }) {
  return (
    <Card className="overflow-visible">
      <div className="flex items-center gap-3 border-b border-[var(--bf-dev-border)] px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]"><Icon size={16} /></div>
        <div>
          <div className="text-[16px] font-semibold text-[var(--bf-dev-text)]">{title}</div>
          {subtitle && <div className="mt-0.5 text-[12px] text-[var(--bf-dev-text-2)]">{subtitle}</div>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function HeaderAction({ icon: Icon, children, onClick, disabled }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-[4px] border border-white/30 bg-white/12 px-3 py-1.5 text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_1px_2px_rgba(0,0,0,.08)] transition hover:border-white/45 hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-55">
      {Icon && <Icon size={13} />}{children}
    </button>
  );
}

function PrimaryButton({ children, icon: Icon, onClick, disabled }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[5px] border border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] px-4 py-2 text-[13px] font-bold !text-white transition hover:brightness-110 hover:!text-white disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:!text-white">
      {Icon && <Icon size={13} />}{children}
    </button>
  );
}

function SecondaryButton({ children, icon: Icon, onClick, disabled, danger = false }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={cx('inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[5px] border px-4 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', danger ? 'border-rose-500/25 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]')}>
      {Icon && <Icon size={13} />}{children}
    </button>
  );
}

function Stepper({ current, maxReached, onStepClick }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-2 border-b border-[var(--bf-dev-border)] sm:grid-cols-5 sm:border-b-0">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const active = current === index;
          const unlocked = index <= maxReached;
          const complete = unlocked && !active && index < maxReached;
          return (
            <button
              key={step.key}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && onStepClick?.(index)}
              className={cx(
                'relative flex min-h-[70px] items-center gap-2 border-r border-[var(--bf-dev-border)] px-3 text-left transition last:border-r-0',
                active && 'bg-[rgb(var(--bf-dev-primary-rgb)/.07)]',
                unlocked ? 'cursor-pointer hover:bg-[var(--bf-dev-surface-2)]' : 'cursor-not-allowed opacity-60'
              )}
            >
              <div className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold', complete ? 'border-emerald-500 bg-emerald-500 text-white' : active ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]')}>
                {complete ? <Check size={13} /> : <Icon size={13} />}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[.08em] text-[var(--bf-dev-text-2)]">Step {index + 1}</div>
                <div className={cx('mt-0.5 truncate text-[13px] font-semibold', active ? 'text-[var(--bf-dev-primary)]' : 'text-[var(--bf-dev-text)]')}>{step.label}</div>
              </div>
              {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--bf-dev-primary)]" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function SlugConflictDialog({ slugState, value, onChange, onCheck, onPick, onClose, checking }) {
  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-lg rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_28px_90px_rgba(2,6,23,.38)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--bf-dev-border)] p-5">
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[.08em] text-amber-500">Portal slug conflict</div>
            <div className="mt-1 text-[20px] font-extrabold text-[var(--bf-dev-text)]">Choose a unique portal slug</div>
            <div className="mt-1 text-[13px] leading-4 text-[var(--bf-dev-text-2)]">The name-matched slug is already in use. Company Code remains fully system-generated.</div>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--bf-dev-text-2)] hover:text-[var(--bf-dev-text)]"><X size={16} /></button>
        </div>
        <div className="space-y-4 p-5">
          <InputShell label="Portal Slug" required helper="Lowercase letters, numbers and hyphens only.">
            <TextInput value={value} onChange={onChange} placeholder="company-name" />
          </InputShell>
          <div className="flex flex-wrap gap-2">
            {(slugState?.suggestions || []).map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => onPick(suggestion)} className="rounded-[4px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-3 py-2 text-[12px] font-semibold text-[var(--bf-dev-text-2)] hover:border-[var(--bf-dev-primary)] hover:text-[var(--bf-dev-primary)]">{suggestion}</button>
            ))}
          </div>
          {slugState?.manualAvailable === true && <div className="rounded-[4px] border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 text-[13px] font-semibold text-emerald-500">This slug is available.</div>}
          {slugState?.manualAvailable === false && <div className="rounded-[4px] border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-[13px] font-semibold text-rose-500">This slug is already in use.</div>}
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--bf-dev-border)] p-4">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton icon={checking ? Loader2 : Search} disabled={checking || !value.trim()} onClick={onCheck}>{checking ? 'Checking…' : 'Check Availability'}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function ProvisionCompanyDialog({ onClose, payload, onOpenCompany, onAllCompanies, onProvisioned }) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const errorMessage = (response) => {
    const messages = {
      COMPANY_SLUG_EXISTS: 'This portal slug was taken before provisioning completed. Go back and choose another slug.',
      COMPANY_EMAIL_EXISTS: 'This Company Email is already in use. Enter a different email.',
      COMPANY_PHONE_EXISTS: 'This Company Phone is already in use. Enter a different contact number.',
      OWNER_EMAIL_EXISTS: 'This Owner Email is already in use. Enter a different owner email.',
      OWNER_MOBILE_EXISTS: 'This Owner Mobile is already in use. Enter a different owner contact number.',
      INVALID_COMPANY_PAYLOAD: 'Some company details are no longer valid. Review the wizard and retry.',
      INVALID_COMPANY_PROFILE: 'Company profile validation failed. Review contact/address details.',
      GST_STATUS_CONFIRMATION_REQUIRED: 'Confirm the GST status warning before provisioning.',
      FLEET_PACK_NOT_AVAILABLE: 'One of the selected Fleet Packs is no longer available.',
      PLAN_NOT_AVAILABLE: 'The selected plan is no longer active.',
      PLAN_PRICE_NOT_CONFIGURED: 'The selected billing cycle does not have a live plan price.',
      OWNER_AUTH_CREATE_FAILED: 'Owner account could not be created.',
      INVALID_OWNER_PHOTO: 'Owner photo must be JPG, PNG or WebP.',
      OWNER_PHOTO_TOO_LARGE: 'Owner photo must be 1 MB or smaller.',
      COMPANY_PROVISIONING_FAILED: 'Provisioning failed. The backend attempted a safe rollback.',
      NETWORK_ERROR: 'Network error while provisioning. Check connectivity and retry.',
    };
    return messages[response?.code] || response?.code || 'Unable to provision the company.';
  };

  async function provision() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const ownerPhotoDataUrl = await fileToDataUrl(payload.ownerPhoto);
      const requestPayload = {
        ...payload,
        country: payload.countryName,
        companyPhone: toE164(payload.countryDialCode, payload.companyPhone),
        ownerMobile: toE164(payload.countryDialCode, payload.ownerMobile),
        ownerAlternateMobile: payload.ownerAlternateMobile ? toE164(payload.countryDialCode, payload.ownerAlternateMobile) : '',
        ownerPhotoDataUrl,
        ownerPhoto: undefined,
        countryDialCode: undefined,
        countryName: undefined,
      };
      const response = await createCompany(requestPayload);
      if (!response.ok) {
        setSubmitError({
          ...response,
          message: errorMessage(response),
        });
      } else {
        onProvisioned?.(response);
        setResult(response);
      }
    } catch (error) {
      const code = error?.code || 'COMPANY_PROVISIONING_FAILED';
      setSubmitError({ code, message: errorMessage({ code }) });
    }
    setSubmitting(false);
  }

  const steps = result?.provisioning?.steps || [];
  const warningLabels = {
    OWNER_PASSWORD_LINK_SEND_FAILED: 'Company was created, but the owner set-password email could not be sent. The owner can use Forgot Password with the new Company Code.',
    OWNER_PHOTO_UPLOAD_FAILED: 'Company was created, but the owner photo could not be uploaded.',
    OWNER_PHOTO_PROFILE_UPDATE_FAILED: 'Photo uploaded, but profile linking needs a retry later.',
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-transparent p-4">
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_28px_90px_rgba(2,6,23,.38)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--bf-dev-border)] p-5">
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[.08em] text-[var(--bf-dev-primary)]">Create Company</div>
            <div className="mt-1 text-[20px] font-extrabold text-[var(--bf-dev-text)]">{result ? 'Provisioning completed' : 'Create & provision this company?'}</div>
            <div className="mt-1 text-[13px] leading-5 text-[var(--bf-dev-text-2)]">
              {result
                ? 'Tenant identity, owner access, Fleet Packs and commercial setup are now live.'
                : 'This will create the real tenant, owner access, Head Office, subscription and initial paid invoice where applicable.'}
            </div>
          </div>
          <button type="button" disabled={submitting} onClick={onClose} className="text-[var(--bf-dev-text-2)] hover:text-[var(--bf-dev-text)] disabled:opacity-40"><X size={18} /></button>
        </div>

        {!result && (
          <div className="space-y-4 p-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['Trade Name', payload.tradeName],
                ['Portal Slug', payload.portalSlug],
                ['Owner', payload.ownerName],
                ['Primary Fleet', payload.primaryFleetLabel],
                ['Account Type', payload.accountType === 'trial' ? 'Developer Trial' : 'Paid Subscription'],
                ['Plan / Duration', payload.accountType === 'trial' ? `${payload.trialWeeks} Week${payload.trialWeeks === 1 ? '' : 's'}` : `${payload.planName} · ${payload.billingCycle} Month${payload.billingCycle === 1 ? '' : 's'}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[4px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3">
                  <div className="text-[12px] text-[var(--bf-dev-text-2)]">{label}</div>
                  <div className="mt-1 text-[14px] font-bold text-[var(--bf-dev-text)]">{value || '—'}</div>
                </div>
              ))}
            </div>

            {submitError && (
              <div className="rounded-[5px] border border-rose-500/25 bg-rose-500/10 p-4 text-[13px] text-rose-500">
                <div className="font-bold">{submitError.message}</div>
                {submitError.stage && <div className="mt-1">Failed stage: <b>{String(submitError.stage).replaceAll('_', ' ')}</b></div>}
                {submitError.rollback && (
                  <div className="mt-1">Rollback: <b>{submitError.rollback.complete ? 'Completed' : 'Needs attention'}</b></div>
                )}
              </div>
            )}

            {submitting && (
              <div className="flex items-center gap-3 rounded-[5px] border border-[rgb(var(--bf-dev-primary-rgb)/.20)] bg-[rgb(var(--bf-dev-primary-rgb)/.08)] p-4 text-[13px] text-[var(--bf-dev-text)]">
                <Loader2 size={18} className="animate-spin text-[var(--bf-dev-primary)]" />
                Provisioning tenant, owner access, Fleet Packs and commercial records…
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[5px] border border-emerald-500/20 bg-emerald-500/8 p-4"><div className="text-[12px] text-[var(--bf-dev-text-2)]">Company Code</div><div className="mt-1 text-[17px] font-extrabold text-emerald-500">{result.company?.company_code || '—'}</div></div>
              <div className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[12px] text-[var(--bf-dev-text-2)]">Portal Slug</div><div className="mt-1 truncate text-[14px] font-bold text-[var(--bf-dev-text)]">{result.company?.subdomain_slug || '—'}</div></div>
              <div className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[12px] text-[var(--bf-dev-text-2)]">Invoice</div><div className="mt-1 text-[14px] font-bold text-[var(--bf-dev-text)]">{result.invoice?.invoiceNumber || 'Trial · Not applicable'}</div></div>
            </div>

            <div className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
              <div className="text-[14px] font-bold text-[var(--bf-dev-text)]">Provisioning checklist</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {steps.filter((item) => item.key !== 'validate' && item.key !== 'complete').map((item) => (
                  <div key={item.key} className="flex items-center gap-2 text-[13px] text-[var(--bf-dev-text-2)]">
                    {item.complete ? <CheckCircle2 size={15} className="text-emerald-500" /> : <AlertTriangle size={15} className="text-amber-500" />}
                    <span className="capitalize">{item.key.replaceAll('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {(result.provisioning?.warnings || []).length > 0 && (
              <div className="space-y-2 rounded-[5px] border border-amber-500/25 bg-amber-500/10 p-4 text-[13px] text-amber-600 dark:text-amber-400">
                {(result.provisioning.warnings || []).map((warning) => <div key={warning}>• {warningLabels[warning] || warning}</div>)}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--bf-dev-border)] p-4">
          {!result ? (
            <>
              <SecondaryButton disabled={submitting} onClick={onClose}>Cancel</SecondaryButton>
              <PrimaryButton icon={submitting ? Loader2 : CheckCircle2} disabled={submitting} onClick={provision}>{submitting ? 'Provisioning…' : 'Provision Company'}</PrimaryButton>
            </>
          ) : (
            <>
              <SecondaryButton onClick={onAllCompanies}>All Companies</SecondaryButton>
              <PrimaryButton icon={CheckCircle2} onClick={() => onOpenCompany(result.company?.id)}>Open Company 360</PrimaryButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function ConfirmDraftDeleteDialog({ title, description, confirmLabel = 'Delete Draft', onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm?.();
    } catch {
      setError('Unable to delete this draft right now.');
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_28px_90px_rgba(2,6,23,.38)]">
        <div className="border-b border-[var(--bf-dev-border)] p-5">
          <div className="text-[13px] font-bold uppercase tracking-[.08em] text-rose-500">Draft confirmation</div>
          <div className="mt-1 text-[20px] font-extrabold text-[var(--bf-dev-text)]">{title}</div>
          <div className="mt-2 text-[13px] leading-5 text-[var(--bf-dev-text-2)]">{description}</div>
          {error && <div className="mt-3 text-[12px] font-semibold text-rose-500">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 p-4">
          <SecondaryButton disabled={busy} onClick={onCancel}>Keep Draft</SecondaryButton>
          <SecondaryButton danger disabled={busy} icon={busy ? Loader2 : Trash2} onClick={confirm}>{busy ? 'Deleting…' : confirmLabel}</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function formatDraftTime(value) {
  const time = Date.parse(String(value || ''));
  if (!Number.isFinite(time)) return 'Recently updated';
  const diffMinutes = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (diffMinutes < 1) return 'Updated just now';
  if (diffMinutes < 60) return `Updated ${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Updated ${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  return `Updated ${new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(time))}`;
}

function CreateCompanyEntryDialog({ drafts, limit, busy, error, onCreateNew, onContinue, onDelete, onClose }) {
  const atLimit = drafts.length >= limit;
  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-transparent p-4">
      <div className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] shadow-[0_28px_90px_rgba(2,6,23,.38)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--bf-dev-border)] p-5">
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[.08em] text-[var(--bf-dev-primary)]">Create Company</div>
            <div className="mt-1 text-[22px] font-extrabold text-[var(--bf-dev-text)]">Start new or continue a draft</div>
            <div className="mt-1 text-[13px] leading-5 text-[var(--bf-dev-text-2)]">Drafts are securely saved to Buddy Fleets and can be continued after refresh, browser close or a later login.</div>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--bf-dev-text-2)] hover:text-[var(--bf-dev-text)]"><X size={18} /></button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[.9fr_1.4fr]">
          <div className="rounded-[6px] border border-[rgb(var(--bf-dev-primary-rgb)/.22)] bg-[rgb(var(--bf-dev-primary-rgb)/.06)] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[6px] bg-[var(--bf-dev-primary)] text-white"><Plus size={20} /></div>
            <div className="mt-4 text-[17px] font-extrabold text-[var(--bf-dev-text)]">Create a New Company</div>
            <div className="mt-2 text-[13px] leading-5 text-[var(--bf-dev-text-2)]">Start a clean 5-step onboarding wizard. Your progress will auto-save as a new draft.</div>
            <PrimaryButton icon={busy === 'new' ? Loader2 : Plus} disabled={Boolean(busy) || atLimit} onClick={onCreateNew}>
              {busy === 'new' ? 'Creating…' : 'Create New'}
            </PrimaryButton>
            {atLimit && <div className="mt-3 text-[12px] font-semibold text-amber-500">You already have {limit} drafts. Delete one draft to start another.</div>}
          </div>

          <div className="rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[15px] font-extrabold text-[var(--bf-dev-text)]">Continue from Draft</div>
                <div className="mt-0.5 text-[12px] text-[var(--bf-dev-text-2)]">Recent {limit} drafts · newest first</div>
              </div>
              <span className="rounded-full border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-2.5 py-1 text-[11px] font-bold text-[var(--bf-dev-text-2)]">{drafts.length}/{limit}</span>
            </div>

            <div className="mt-4 space-y-2">
              {drafts.length === 0 && (
                <div className="rounded-[5px] border border-dashed border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-5 text-center text-[13px] text-[var(--bf-dev-text-2)]">No saved drafts yet.</div>
              )}
              {drafts.map((draft) => (
                <div key={draft.id} className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-bold text-[var(--bf-dev-text)]">{draft.name || 'Untitled company'}</div>
                      <div className="mt-1 text-[12px] text-[var(--bf-dev-text-2)]">Step {Number(draft.currentStep || 0) + 1} of {STEPS.length} · {STEPS[Number(draft.currentStep || 0)]?.label || 'Company Details'} · {formatDraftTime(draft.updatedAt)}</div>
                      {draft.ownerPhoto && <div className="mt-1 text-[11px] font-semibold text-emerald-500">Owner photo saved</div>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <SecondaryButton danger icon={Trash2} disabled={Boolean(busy)} onClick={() => onDelete(draft)}>Delete</SecondaryButton>
                      <PrimaryButton icon={busy === draft.id ? Loader2 : ArrowRight} disabled={Boolean(busy)} onClick={() => onContinue(draft.id)}>{busy === draft.id ? 'Opening…' : 'Continue'}</PrimaryButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="mx-5 mb-4 rounded-[5px] border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-[12px] font-semibold text-rose-500">{error}</div>}
        <div className="flex justify-end border-t border-[var(--bf-dev-border)] p-4"><SecondaryButton onClick={onClose}>Back to All Companies</SecondaryButton></div>
      </div>
    </div>
  );
}

function CreateCompanyWizard({ draft }) {
  const navigate = useNavigate();
  const draftId = draft?.id || '';
  const workflowKey = draftWorkflowKey(draftId);
  const draftDisabledRef = useRef(false);
  const [restoredDraft] = useState(() => loadCreateCompanyDraft(draftId, draft));
  const restored = restoredDraft?.data || {};
  const restoredStep = Number.isInteger(restored.step) ? Math.min(STEPS.length - 1, Math.max(0, restored.step)) : 0;
  const restoredMaxReached = Number.isInteger(restored.maxReached)
    ? Math.min(STEPS.length - 1, Math.max(restoredStep, restored.maxReached))
    : restoredStep;

  const [step, setStep] = useState(restoredStep);
  const [maxReached, setMaxReached] = useState(restoredMaxReached);
  const [metadata, setMetadata] = useState({ plans: [], fleetPacks: [], billingCycles: [1, 6, 12], trialDurations: [], trialPolicy: {}, accessSummary: {}, gstProviderConfigured: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [gstLoading, setGstLoading] = useState(false);
  const [gstError, setGstError] = useState('');
  const [gstResult, setGstResult] = useState(restored.gstResult || null);
  const [gstWarningAccepted, setGstWarningAccepted] = useState(Boolean(restored.gstWarningAccepted));
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState('');
  const [slugState, setSlugState] = useState(restored.slugState || { slug: '', available: null, suggestions: [], manualAvailable: null });
  const [slugDialog, setSlugDialog] = useState(false);
  const [slugInput, setSlugInput] = useState(restored.slugInput || '');
  const [slugChecking, setSlugChecking] = useState(false);
  const [phaseFourOpen, setPhaseFourOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [draftSyncState, setDraftSyncState] = useState('saved');
  const [draftPhotoMeta, setDraftPhotoMeta] = useState(draft?.ownerPhoto || null);

  const [form, setForm] = useState(() => ({
    ...createInitialForm(),
    ...(restored.form || {}),
    ownerPhoto: restoredDraft?.ownerPhoto || null,
    additionalFleets: Array.isArray(restored.form?.additionalFleets) ? restored.form.additionalFleets : [],
  }));

  const selectedCountry = COUNTRY_BY_CODE[form.countryCode] || COUNTRY_BY_CODE.IN;
  const selectedPlan = metadata.plans.find((plan) => plan.plan_key === form.planKey) || null;
  const primaryFleet = metadata.fleetPacks.find((pack) => pack.pack_key === form.primaryFleet) || null;
  const enabledFleetKeys = [form.primaryFleet, ...form.additionalFleets].filter(Boolean);
  const subscriptionEnd = endDateForMonths(form.subscriptionStart, form.billingCycle);
  const trialEnd = endDateForWeeks(form.subscriptionStart, form.trialWeeks);
  const basePrice = form.accountType === 'paid' ? Number(selectedPlan?.prices?.[String(form.billingCycle)] || 0) : 0;
  const discountAmount = basePrice * Math.min(100, Math.max(0, Number(form.discountPercent || 0))) / 100;
  const netPrice = Math.max(0, basePrice - discountAmount);
  const companyEmailCheckValue = validEmail(form.companyEmail) ? form.companyEmail.trim().toLowerCase() : '';
  const ownerEmailCheckValue = validEmail(form.ownerEmail) ? form.ownerEmail.trim().toLowerCase() : '';
  const companyPhoneCheckValue = validNationalPhone(form.companyPhone, form.countryCode)
    ? toE164(selectedCountry?.dialCode || '+91', form.companyPhone)
    : '';
  const ownerMobileCheckValue = validNationalPhone(form.ownerMobile, form.countryCode)
    ? toE164(selectedCountry?.dialCode || '+91', form.ownerMobile)
    : '';

  const companyEmailAvailability = useIdentityAvailability('company_email', companyEmailCheckValue, Boolean(companyEmailCheckValue));
  const companyPhoneAvailability = useIdentityAvailability('company_phone', companyPhoneCheckValue, Boolean(companyPhoneCheckValue));
  const ownerEmailAvailability = useIdentityAvailability('owner_email', ownerEmailCheckValue, Boolean(ownerEmailCheckValue));
  const ownerMobileAvailability = useIdentityAvailability('owner_mobile', ownerMobileCheckValue, Boolean(ownerMobileCheckValue));

  function patch(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: '' }));
  }

  async function onOwnerPhotoChange(file) {
    if (!file) {
      patch('ownerPhoto', null);
      setDraftPhotoMeta(null);
      removeWorkflowAsset(workflowKey, OWNER_PHOTO_ASSET, { version: CREATE_COMPANY_DRAFT_VERSION });
      const response = await saveCompanyDraft({ draftId, removeOwnerPhoto: true });
      if (!response.ok) setFieldErrors((current) => ({ ...current, ownerPhoto: 'Unable to remove the saved draft photo right now.' }));
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      patch('ownerPhoto', file);
      writeWorkflowAsset(workflowKey, OWNER_PHOTO_ASSET, {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        dataUrl,
      }, { version: CREATE_COMPANY_DRAFT_VERSION });
      setDraftSyncState('saving');
      const response = await saveCompanyDraft({
        draftId,
        ownerPhotoDataUrl: dataUrl,
        ownerPhotoName: file.name,
      });
      if (!response.ok) {
        setDraftSyncState('error');
        setFieldErrors((current) => ({ ...current, ownerPhoto: 'Photo selected locally, but secure draft upload failed. Retry before leaving this page.' }));
      } else {
        setDraftPhotoMeta(response.draft?.ownerPhoto || { name: file.name, mime: file.type });
        setDraftSyncState('saved');
      }
    } catch (photoError) {
      const messages = {
        INVALID_OWNER_PHOTO: 'Owner photo must be JPG, PNG or WebP.',
        OWNER_PHOTO_TOO_LARGE: 'Owner photo must be 1 MB or smaller.',
        OWNER_PHOTO_READ_FAILED: 'Unable to read the selected owner photo.',
      };
      setFieldErrors((current) => ({ ...current, ownerPhoto: messages[photoError?.code] || 'Unable to use the selected owner photo.' }));
    }
  }

  useEffect(() => {
    if (!draftId || draftDisabledRef.current) return undefined;

    const snapshot = {
      step,
      maxReached,
      form: serializeCreateCompanyForm(form),
      gstResult,
      gstWarningAccepted,
      slugState,
      slugInput,
    };

    writeWorkflowDraft(workflowKey, snapshot, { version: CREATE_COMPANY_DRAFT_VERSION });
    setDraftSyncState('saving');

    let active = true;
    const timer = window.setTimeout(async () => {
      const response = await saveCompanyDraft({
        draftId,
        draftName: form.tradeName || form.legalName || 'Untitled company',
        currentStep: step,
        maxReached,
        formData: serializeCreateCompanyForm(form),
        workflowState: { gstResult, gstWarningAccepted, slugState, slugInput },
      });
      if (!active) return;
      setDraftSyncState(response.ok ? 'saved' : 'error');
    }, 700);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [draftId, workflowKey, step, maxReached, form, gstResult, gstWarningAccepted, slugState, slugInput]);

  useEffect(() => subscribeSessionEvents((event) => {
    if (event?.type === 'SESSION_LOGOUT' || event?.type === 'SESSION_INVALIDATED') {
      draftDisabledRef.current = true;
      clearWorkflowDraftFamily(workflowKey);
    }
  }), []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const result = await getCompanyCreateMetadata();
      if (!active) return;
      if (result.ok) {
        setMetadata({
          plans: result.plans || [],
          fleetPacks: result.fleetPacks || [],
          billingCycles: result.billingCycles || [1, 6, 12],
          trialDurations: result.trialDurations || [],
          trialPolicy: result.trialPolicy || {},
          accessSummary: result.accessSummary || {},
          gstProviderConfigured: Boolean(result.gstProviderConfigured),
        });
        setForm((current) => ({
          ...current,
          primaryFleet: current.primaryFleet || result.fleetPacks?.[0]?.pack_key || '',
          planKey: current.planKey || result.plans?.[0]?.plan_key || '',
        }));
      } else setError(result.code || 'Unable to load Create Company metadata.');
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (form.sameTradeName && form.legalName && form.tradeName !== form.legalName) patch('tradeName', form.legalName);
  }, [form.sameTradeName, form.legalName]);

  useEffect(() => {
    const source = form.tradeName || form.legalName;
    if (!source.trim()) {
      setSlugState({ slug: '', available: null, suggestions: [], manualAvailable: null });
      patch('portalSlug', '');
      return undefined;
    }
    const expected = slugify(source);
    if (form.portalSlug && form.portalSlug !== slugState.slug && slugState.manualAvailable === true) return undefined;
    const timer = window.setTimeout(async () => {
      const result = await getCompanySlugPreview({ name: source });
      if (!result.ok) return;
      setSlugState({ slug: result.slug, available: result.available, suggestions: result.suggestions || [], manualAvailable: null });
      patch('portalSlug', result.slug || expected);
      if (!result.available) {
        setSlugInput(result.suggestions?.[0] || result.slug || expected);
        setSlugDialog(true);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [form.tradeName, form.legalName]);

  useEffect(() => {
    if (form.countryCode !== 'IN') {
      setPinMessage('Postal auto-fill is currently available for Indian PIN codes. Enter State/Province and City manually for this country.');
      return undefined;
    }
    if (!/^\d{6}$/.test(form.postalCode)) {
      setPinMessage('');
      return undefined;
    }
    const timer = window.setTimeout(async () => {
      setPinLoading(true);
      setPinMessage('Looking up PIN code…');
      const result = await lookupCompanyPostalCode({ country: 'IN', postalCode: form.postalCode });
      if (result.ok) {
        patch('state', result.state || '');
        patch('city', result.city || result.district || '');
        setPinMessage(result.localities?.length ? `${result.localities.length} postal localities found. State and City/District filled automatically.` : 'State and City/District filled automatically.');
      } else if (result.code === 'PINCODE_NOT_FOUND') setPinMessage('PIN code not found. You can enter State and City manually.');
      else setPinMessage('PIN lookup is temporarily unavailable. You can enter State and City manually.');
      setPinLoading(false);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [form.countryCode, form.postalCode]);

  async function verifyGst() {
    setGstLoading(true);
    setGstError('');
    setGstWarningAccepted(false);
    const result = await verifyCompanyGstin(form.gstin.toUpperCase());
    if (result.ok) {
      setGstResult(result);
      setForm((current) => ({
        ...current,
        gstin: result.gstin,
        legalName: result.legalName || current.legalName,
        tradeName: result.tradeName || result.legalName || current.tradeName,
        companyType: result.companyType || current.companyType,
        sameTradeName: Boolean(result.legalName && result.tradeName && result.legalName === result.tradeName),
      }));
    } else {
      setGstResult(null);
      const messages = {
        GST_PROVIDER_NOT_CONFIGURED: 'GST verification provider is not configured yet. Add GSTIN_API_KEY in Vercel to enable live verification.',
        GSTIN_NOT_FOUND: 'GSTIN was not found.',
        GST_PROVIDER_CREDITS_EXHAUSTED: 'GST verification credits are exhausted.',
        GST_PROVIDER_RATE_LIMITED: 'GST provider rate limit reached. Try again shortly.',
        GST_PROVIDER_AUTH_FAILED: 'GST provider API key is invalid.',
        INVALID_GSTIN: 'Enter a valid 15-character GSTIN.',
      };
      setGstError(messages[result.code] || 'GST verification is temporarily unavailable.');
    }
    setGstLoading(false);
  }

  function onGstinChange(value) {
    patch('gstin', value.toUpperCase().replace(/\s+/g, '').slice(0, 15));
    setGstResult(null);
    setGstError('');
    setGstWarningAccepted(false);
  }

  async function checkManualSlug() {
    setSlugChecking(true);
    const result = await getCompanySlugPreview({ slug: slugInput });
    if (result.ok) {
      setSlugInput(result.slug);
      setSlugState((current) => ({ ...current, suggestions: result.suggestions || current.suggestions, manualAvailable: Boolean(result.available) }));
      if (result.available) {
        patch('portalSlug', result.slug);
        setSlugState((current) => ({ ...current, slug: result.slug, available: true, manualAvailable: true }));
        setSlugDialog(false);
      }
    }
    setSlugChecking(false);
  }

  function validateCompany() {
    const next = {};
    if (!form.legalName.trim()) next.legalName = 'Legal Name is required.';
    if (!form.tradeName.trim()) next.tradeName = 'Trade Name is required.';
    if (!form.companyType) next.companyType = 'Company Type is required.';
    if (form.gstin && !validGstin(form.gstin)) next.gstin = 'Enter a valid 15-character GSTIN.';
    if (form.pan && !validPan(form.pan)) next.pan = 'Enter a valid PAN.';
    if (form.cin && !validCin(form.cin)) next.cin = 'Enter a valid 21-character CIN.';
    if (!validEmail(form.companyEmail)) next.companyEmail = 'Valid company email is required.';
    else {
      const availabilityError = identityAvailabilityError(companyEmailAvailability, 'Company Email');
      if (availabilityError) next.companyEmail = availabilityError;
    }
    if (!validWebsite(form.website)) next.website = 'Enter a valid website address.';
    if (!validNationalPhone(form.companyPhone, form.countryCode)) next.companyPhone = 'Enter a valid company phone number for the selected country.';
    else {
      const availabilityError = identityAvailabilityError(companyPhoneAvailability, 'Company Phone');
      if (availabilityError) next.companyPhone = availabilityError;
    }
    if (!form.addressLine1.trim()) next.addressLine1 = 'Registered address is required.';
    if (!form.countryCode) next.countryCode = 'Country is required.';
    if (!form.postalCode.trim()) next.postalCode = 'PIN / Postal Code is required.';
    if (form.countryCode === 'IN' && !/^\d{6}$/.test(form.postalCode)) next.postalCode = 'Indian PIN code must be 6 digits.';
    if (!form.state.trim()) next.state = 'State / Province is required.';
    if (!form.city.trim()) next.city = 'City / District is required.';
    if (!form.portalSlug || slugState.available !== true) next.portalSlug = 'Wait for slug availability or choose an available portal slug.';
    if (gstResult && String(gstResult.gstStatus || '').toLowerCase() !== 'active' && !gstWarningAccepted) next.gstin = 'Confirm the non-active GST status before continuing.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateOwner() {
    const next = {};
    if (!form.ownerName.trim()) next.ownerName = 'Owner Full Name is required.';
    if (!validEmail(form.ownerEmail)) next.ownerEmail = 'Valid Owner Email is required.';
    else {
      const availabilityError = identityAvailabilityError(ownerEmailAvailability, 'Owner Email');
      if (availabilityError) next.ownerEmail = availabilityError;
    }
    if (!validNationalPhone(form.ownerMobile, form.countryCode)) next.ownerMobile = 'Enter a valid owner mobile number.';
    else {
      const availabilityError = identityAvailabilityError(ownerMobileAvailability, 'Owner Mobile');
      if (availabilityError) next.ownerMobile = availabilityError;
    }
    if (form.ownerAlternateMobile && !validNationalPhone(form.ownerAlternateMobile, form.countryCode)) next.ownerAlternateMobile = 'Enter a valid alternate mobile number.';
    if (!form.ownerDesignation) next.ownerDesignation = 'Owner Designation is required.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateFleet() {
    const next = {};
    if (!form.primaryFleet) next.primaryFleet = 'Primary Fleet Pack is required.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateCommercial() {
    const next = {};
    if (!form.subscriptionStart) next.subscriptionStart = 'Start date is required.';
    if (form.accountType === 'trial') {
      if (![1, 2, 3, 4].includes(Number(form.trialWeeks))) next.trialWeeks = 'Choose a Developer trial duration.';
    } else {
      if (!form.planKey) next.planKey = 'Choose a plan.';
      if (![1, 6, 12].includes(Number(form.billingCycle))) next.billingCycle = 'Choose a billing cycle.';
      const discount = Number(form.discountPercent || 0);
      if (!Number.isFinite(discount) || discount < 0 || discount > 100) next.discountPercent = 'Discount must be between 0% and 100%.';
      if (discount > 0 && !form.discountReason.trim()) next.discountReason = 'Discount reason is required when a discount is applied.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateCurrent() {
    if (step === 0) return validateCompany();
    if (step === 1) return validateOwner();
    if (step === 2) return validateFleet();
    if (step === 3) return validateCommercial();
    return validateCompany() && validateOwner() && validateFleet() && validateCommercial();
  }

  function goToStep(target) {
    if (target < 0 || target >= STEPS.length || target > maxReached || target === step) return;
    if (target > step && !validateCurrent()) return;
    if (target < step) setFieldErrors({});
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextStep() {
    if (!validateCurrent()) return;
    const target = Math.min(STEPS.length - 1, step + 1);
    setMaxReached((current) => Math.max(current, target));
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function previousStep() {
    setFieldErrors({});
    setStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function jumpToReviewProvisioning() {
    const ok = validateCompany() && validateOwner() && validateFleet() && validateCommercial();
    if (!ok) return;
    setPhaseFourOpen(true);
  }

  const countryOptions = useMemo(() => COUNTRIES.map((country) => ({ value: country.code, label: country.name, meta: country.dialCode, searchText: `${country.code} ${country.dialCode}` })), []);
  const companyTypeOptions = COMPANY_TYPES.map((value) => ({ value, label: value }));
  const designationOptions = DESIGNATIONS.map((value) => ({ value, label: value }));
  const fleetOptions = metadata.fleetPacks.map((pack) => ({ value: pack.pack_key, label: pack.name }));
  const additionalFleetOptions = fleetOptions.filter((option) => option.value !== form.primaryFleet);

  useEffect(() => {
    if (form.additionalFleets.includes(form.primaryFleet)) patch('additionalFleets', form.additionalFleets.filter((key) => key !== form.primaryFleet));
  }, [form.primaryFleet]);

  if (loading) {
    return <Page><PageHeader eyebrow="SaaS Platform / Companies" title="Create Company" description="Loading onboarding configuration…" /><Card className="flex min-h-[260px] items-center justify-center"><Loader2 size={22} className="animate-spin text-[var(--bf-dev-primary)]" /></Card></Page>;
  }

  return (
    <Page>
      <PageHeader
        eyebrow="SaaS Platform / Companies / Create"
        title="Create Company"
        description="Guided tenant setup for company identity, owner access, Fleet Packs and commercial configuration with rollback-safe provisioning."
        actions={<div className="flex flex-wrap items-center gap-2">
          <span className={cx('text-[11px] font-semibold', draftSyncState === 'error' ? 'text-amber-200' : 'text-white/70')}>{draftSyncState === 'saving' ? 'Saving draft…' : draftSyncState === 'error' ? 'Draft sync needs retry' : 'Draft saved'}</span>
          <HeaderAction icon={Trash2} onClick={() => setDiscardDialogOpen(true)}>Discard Draft</HeaderAction>
          <HeaderAction icon={ArrowLeft} onClick={() => navigate('/saas-platform/companies/all-companies')}>All Companies</HeaderAction>
        </div>}
      />

      <Stepper current={step} maxReached={maxReached} onStepClick={goToStep} />

      {error && <div className="rounded-[5px] border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-[13px] font-medium text-rose-500">{error}</div>}

      {step === 0 && (
        <div className="space-y-4">
          <FieldCard title="Company identity" subtitle="Legal, trade and registration identity. Company Code is generated only by the backend." icon={Building2}>
            {!metadata.gstProviderConfigured && (
              <div className="mb-4 rounded-[5px] border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-[13px] leading-4 text-amber-600 dark:text-amber-400">
                Live GST verification is ready in code but the server key is not configured. Add <b>GSTIN_API_KEY</b> in Vercel when you want Verify GST to go live.
              </div>
            )}
            {gstError && (
              <div className="mb-4 rounded-[5px] border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-[13px] font-medium leading-5 text-rose-500">
                {gstError}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InputShell label="GSTIN" helper="Optional. If provided, Verify GST fills Legal Name, Trade Name, GST Status and Company Type." error={fieldErrors.gstin}>
                <div className="flex gap-2">
                  <TextInput value={form.gstin} onChange={onGstinChange} placeholder="24ABCDE1234F1Z5" className="uppercase" maxLength={15} />
                  <SecondaryButton icon={gstLoading ? Loader2 : Sparkles} disabled={gstLoading || !validGstin(form.gstin) || !form.gstin} onClick={verifyGst}>{gstLoading ? 'Verifying…' : 'Verify GST'}</SecondaryButton>
                </div>
              </InputShell>
              <InputShell label="PAN" helper="Optional" error={fieldErrors.pan}><TextInput value={form.pan} onChange={(value) => patch('pan', value.toUpperCase().replace(/\s+/g, '').slice(0, 10))} placeholder="ABCDE1234F" className="uppercase" maxLength={10} /></InputShell>
              <InputShell label="CIN" helper="Optional" error={fieldErrors.cin}><TextInput value={form.cin} onChange={(value) => patch('cin', value.toUpperCase().replace(/\s+/g, '').slice(0, 21))} placeholder="U12345GJ2020PTC123456" className="uppercase" maxLength={21} /></InputShell>
            </div>

            {gstResult && (
              <div className={cx('mt-4 rounded-[5px] border px-4 py-3', String(gstResult.gstStatus || '').toLowerCase() === 'active' ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-amber-500/25 bg-amber-500/8')}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {String(gstResult.gstStatus || '').toLowerCase() === 'active' ? <CheckCircle2 size={15} className="text-emerald-500" /> : <AlertTriangle size={15} className="text-amber-500" />}
                    <div className="text-[13px] font-bold text-[var(--bf-dev-text)]">GST Status: {gstResult.gstStatus}</div>
                  </div>
                  {String(gstResult.gstStatus || '').toLowerCase() !== 'active' && (
                    <button type="button" onClick={() => setGstWarningAccepted((current) => !current)} className={cx('rounded-[4px] border px-3 py-2 text-[12px] font-bold transition', gstWarningAccepted ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500' : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400')}>
                      {gstWarningAccepted ? 'Risk acknowledged' : 'Confirm and continue'}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InputShell label="Legal Name" required error={fieldErrors.legalName}><TextInput value={form.legalName} onChange={(value) => patch('legalName', value)} placeholder="Registered legal name" /></InputShell>
              <InputShell label="Trade Name" required error={fieldErrors.tradeName}>
                <TextInput value={form.tradeName} onChange={(value) => { patch('tradeName', value); patch('sameTradeName', false); }} placeholder="Company display / trade name" />
                <button type="button" onClick={() => patch('sameTradeName', !form.sameTradeName)} className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--bf-dev-primary)]">
                  <span className={cx('flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border', form.sameTradeName ? 'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white' : 'border-[var(--bf-dev-border)]')}>{form.sameTradeName && <Check size={9} />}</span>
                  Same as Legal Name
                </button>
              </InputShell>
              <InputShell label="Company Type" required error={fieldErrors.companyType}><SelectMenu value={form.companyType} options={companyTypeOptions} onChange={(value) => patch('companyType', value)} placeholder="Select company type" /></InputShell>
              <InputShell label="Company Code" helper="Generated automatically during final provisioning."><TextInput value="Auto-generated (BUDDY###)" readOnly /></InputShell>
              <InputShell label="Portal Slug" required helper={slugState.available === false ? 'Name-matched slug is already used. Choose a unique slug.' : 'Generated automatically from the Trade Name.'} error={fieldErrors.portalSlug}>
                <div className="flex gap-2">
                  <TextInput value={form.portalSlug || slugify(form.tradeName || form.legalName)} readOnly />
                  {slugState.available === false && <SecondaryButton icon={PencilLine} onClick={() => setSlugDialog(true)}>Choose</SecondaryButton>}
                </div>
              </InputShell>
            </div>
          </FieldCard>

          <FieldCard title="Company contact" subtitle="Primary business contact details for the tenant." icon={Globe2}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InputShell
                label="Company Email"
                required
                helper={<AvailabilityHint state={companyEmailAvailability} idleText="Checked against the live company database." />}
                error={fieldErrors.companyEmail || (companyEmailAvailability.status === 'unavailable' ? 'Company Email is already in use. Enter a different email.' : '')}
              ><TextInput type="email" value={form.companyEmail} onChange={(value) => patch('companyEmail', value)} placeholder="office@company.com" autoComplete="email" /></InputShell>
              <InputShell
                label="Company Phone"
                required
                helper={<AvailabilityHint state={companyPhoneAvailability} idleText={`Dial code follows Registered Country: ${selectedCountry?.name || 'India'} ${selectedCountry?.dialCode || '+91'} · checked live.`} />}
                error={fieldErrors.companyPhone || (companyPhoneAvailability.status === 'unavailable' ? 'Company Phone is already in use. Enter a different contact number.' : '')}
              ><PhoneInput value={form.companyPhone} onChange={(value) => patch('companyPhone', value)} countryCode={form.countryCode} /></InputShell>
              <InputShell label="Website" helper="Optional" error={fieldErrors.website}><TextInput value={form.website} onChange={(value) => patch('website', value)} placeholder="https://company.com" /></InputShell>
            </div>
          </FieldCard>

          <FieldCard title="Registered Address" subtitle="Head Office will initially copy this registered address during provisioning." icon={MapPin}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="md:col-span-2"><InputShell label="Address Line 1" required error={fieldErrors.addressLine1}><TextInput value={form.addressLine1} onChange={(value) => patch('addressLine1', value)} placeholder="Building / street / area" /></InputShell></div>
              <InputShell label="Address Line 2" helper="Optional"><TextInput value={form.addressLine2} onChange={(value) => patch('addressLine2', value)} placeholder="Landmark / locality" /></InputShell>
              <InputShell label="Country" required error={fieldErrors.countryCode}><SelectMenu value={form.countryCode} options={countryOptions} onChange={(value) => { patch('countryCode', value); patch('postalCode', ''); patch('state', ''); patch('city', ''); patch('locality', ''); }} placeholder="Select country" searchable /></InputShell>
              <InputShell label={form.countryCode === 'IN' ? 'PIN Code' : 'Postal Code'} required helper={pinLoading ? 'Looking up…' : pinMessage} error={fieldErrors.postalCode}><TextInput value={form.postalCode} onChange={(value) => patch('postalCode', form.countryCode === 'IN' ? digitsOnly(value, 6) : value.slice(0, 20))} placeholder={form.countryCode === 'IN' ? '380015' : 'Postal code'} /></InputShell>
              <InputShell label="State / Province" required error={fieldErrors.state}><TextInput value={form.state} onChange={(value) => patch('state', value)} placeholder="State / Province" readOnly={form.countryCode === 'IN' && pinLoading} /></InputShell>
              <InputShell label="City / District" required error={fieldErrors.city}><TextInput value={form.city} onChange={(value) => patch('city', value)} placeholder="City / District" readOnly={form.countryCode === 'IN' && pinLoading} /></InputShell>
            </div>
          </FieldCard>
        </div>
      )}

      {step === 1 && (
        <FieldCard title="Company Owner" subtitle="Primary account owner and Company Admin. The dial code follows the Registered Address country automatically." icon={UserRound}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InputShell label="Owner Full Name" required error={fieldErrors.ownerName}><TextInput value={form.ownerName} onChange={(value) => patch('ownerName', value)} placeholder="Full name" autoComplete="name" /></InputShell>
            <InputShell
              label="Owner Email"
              required
              helper={<AvailabilityHint state={ownerEmailAvailability} idleText="Primary login email · must be unused in the live Buddy Fleets database." />}
              error={fieldErrors.ownerEmail || (ownerEmailAvailability.status === 'unavailable' ? 'Owner Email is already in use. Enter a different owner email.' : '')}
            ><TextInput type="email" value={form.ownerEmail} onChange={(value) => patch('ownerEmail', value)} placeholder="owner@company.com" autoComplete="email" /></InputShell>
            <InputShell label="Designation" required error={fieldErrors.ownerDesignation}><SelectMenu value={form.ownerDesignation} options={designationOptions} onChange={(value) => patch('ownerDesignation', value)} placeholder="Select designation" /></InputShell>
            <InputShell
              label="Owner Mobile"
              required
              helper={<AvailabilityHint state={ownerMobileAvailability} idleText={`${selectedCountry?.name || 'India'} ${selectedCountry?.dialCode || '+91'} is applied automatically · checked live.`} />}
              error={fieldErrors.ownerMobile || (ownerMobileAvailability.status === 'unavailable' ? 'Owner Mobile is already in use. Enter a different owner contact number.' : '')}
            ><PhoneInput value={form.ownerMobile} onChange={(value) => patch('ownerMobile', value)} countryCode={form.countryCode} /></InputShell>
            <InputShell label="Alternate Mobile" helper="Optional" error={fieldErrors.ownerAlternateMobile}><PhoneInput value={form.ownerAlternateMobile} onChange={(value) => patch('ownerAlternateMobile', value)} countryCode={form.countryCode} /></InputShell>
            <InputShell label="Profile Photo" helper="Optional · JPG, PNG or WebP · maximum 1 MB · securely preserved with this draft." error={fieldErrors.ownerPhoto}>
              <div className="flex h-10 items-center gap-2 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] px-3 py-1.5 text-[12px] font-semibold text-[var(--bf-dev-text-2)] hover:text-[var(--bf-dev-primary)]">
                  <FileImage size={12} /> Choose Photo
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => onOwnerPhotoChange(event.target.files?.[0] || null)} />
                </label>
                <span className="min-w-0 truncate text-[12px] text-[var(--bf-dev-text-2)]">{form.ownerPhoto?.name || draftPhotoMeta?.name || 'No file selected'}</span>
              </div>
            </InputShell>
          </div>
          <div className="mt-5 rounded-[5px] border border-[rgb(var(--bf-dev-primary-rgb)/.18)] bg-[rgb(var(--bf-dev-primary-rgb)/.07)] px-4 py-3 text-[13px] leading-4 text-[var(--bf-dev-text-2)]">
            Account setup: <b>Send Set Password Link</b>. No permanent password is collected in this wizard.
          </div>
        </FieldCard>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <FieldCard title="Fleet Pack setup" subtitle="Only the centrally managed active Buddy Fleets Fleet Packs are available." icon={Truck}>
            <div className="grid gap-4 md:grid-cols-2">
              <InputShell label="Primary Fleet Type" required error={fieldErrors.primaryFleet}><SelectMenu value={form.primaryFleet} options={fleetOptions} onChange={(value) => patch('primaryFleet', value)} placeholder="Select Fleet Pack" /></InputShell>
              <InputShell label="Additional Fleet Types" helper="Optional. The same company plan will apply across all enabled Fleet Packs."><MultiSelectMenu values={form.additionalFleets} options={additionalFleetOptions} onChange={(value) => patch('additionalFleets', value)} /></InputShell>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {enabledFleetKeys.map((key, index) => {
                const pack = metadata.fleetPacks.find((item) => item.pack_key === key);
                if (!pack) return null;
                return <span key={key} className={cx('rounded-full border px-3 py-1.5 text-[12px] font-bold', index === 0 ? 'border-[rgb(var(--bf-dev-primary-rgb)/.25)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]')}>{index === 0 ? 'Primary · ' : ''}{pack.name}</span>;
              })}
            </div>
          </FieldCard>
          <FieldCard title="Primary Site" subtitle="Create Company will provision exactly one primary site initially." icon={MapPin}>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[12px] text-[var(--bf-dev-text-2)]">Site Name</div><div className="mt-1 text-[14px] font-bold text-[var(--bf-dev-text)]">Head Office</div></div>
              <div className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[12px] text-[var(--bf-dev-text-2)]">Address Source</div><div className="mt-1 text-[14px] font-bold text-[var(--bf-dev-text)]">Registered Address</div></div>
              <div className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[12px] text-[var(--bf-dev-text-2)]">Status</div><div className="mt-1 text-[14px] font-bold text-emerald-500">Primary · Active</div></div>
            </div>
          </FieldCard>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <FieldCard title="Account type" subtitle="Developer-created trials stay separate from the automatic 5-day public signup trial." icon={CircleDollarSign}>
            <Segmented value={form.accountType} onChange={(value) => patch('accountType', value)} options={[{ value: 'trial', label: 'Developer Trial' }, { value: 'paid', label: 'Paid Subscription' }]} />
          </FieldCard>

          {form.accountType === 'trial' ? (
            <FieldCard title="Developer Trial" subtitle="Only the duration changes. Trial limits and module policy remain the global trial policy." icon={Sparkles}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InputShell label="Trial Duration" required error={fieldErrors.trialWeeks}><SelectMenu value={String(form.trialWeeks)} options={(metadata.trialDurations || []).map((item) => ({ value: String(item.weeks), label: item.label }))} onChange={(value) => patch('trialWeeks', Number(value))} /></InputShell>
                <InputShell label="Trial Start" required error={fieldErrors.subscriptionStart}><TextInput type="date" value={form.subscriptionStart} onChange={(value) => patch('subscriptionStart', value)} /></InputShell>
                <InputShell label="Trial End"><TextInput value={formatDate(trialEnd)} readOnly /></InputShell>
                <InputShell label="After Expiry"><TextInput value="Read Only · Login Allowed" readOnly /></InputShell>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ['Vehicles', metadata.trialPolicy?.vehicleLimit ? `Up to ${metadata.trialPolicy.vehicleLimit}` : 'Policy controlled'],
                  ['Users', metadata.trialPolicy?.userLimit ? `Up to ${metadata.trialPolicy.userLimit}` : 'Policy controlled'],
                  ['Sites', metadata.trialPolicy?.siteLimit ? `${metadata.trialPolicy.siteLimit}` : 'Policy controlled'],
                ].map(([label, value]) => <div key={label} className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4"><div className="text-[12px] text-[var(--bf-dev-text-2)]">{label}</div><div className="mt-1 text-[15px] font-extrabold text-[var(--bf-dev-text)]">{value}</div></div>)}
              </div>
            </FieldCard>
          ) : (
            <>
              <FieldCard title="Plan Selection" subtitle="Live plan data. Plan limits are applied automatically and can be overridden later in Company 360." icon={CircleDollarSign}>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {metadata.plans.map((plan) => {
                    const active = plan.plan_key === form.planKey;
                    return (
                      <button key={plan.plan_key} type="button" onClick={() => patch('planKey', plan.plan_key)} className={cx('rounded-[6px] border p-4 text-left transition', active ? 'border-[var(--bf-dev-primary)] bg-[rgb(var(--bf-dev-primary-rgb)/.08)] shadow-[0_0_0_1px_rgb(var(--bf-dev-primary-rgb)/.10)]' : 'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] hover:border-[rgb(var(--bf-dev-primary-rgb)/.30)]')}>
                        <div className="flex items-start justify-between gap-2"><div className="text-[16px] font-extrabold text-[var(--bf-dev-text)]">{plan.name}</div>{active && <CheckCircle2 size={15} className="text-[var(--bf-dev-primary)]" />}</div>
                        <div className="mt-1 min-h-8 text-[12px] leading-4 text-[var(--bf-dev-text-2)]">{plan.tagline || 'Buddy Fleets subscription plan'}</div>
                        <div className="mt-3 text-[15px] font-extrabold text-[var(--bf-dev-primary)]">{formatMoney(plan.prices?.[String(form.billingCycle)] || 0, plan.currency || 'INR')}</div>
                        <div className="mt-2 grid grid-cols-3 gap-1 text-[11px] text-[var(--bf-dev-text-2)]">
                          <span>Vehicles<br/><b className="text-[var(--bf-dev-text-2)]">{plan.limits?.vehicles_max ?? '∞'}</b></span>
                          <span>Users<br/><b className="text-[var(--bf-dev-text-2)]">{plan.limits?.users ?? '—'}</b></span>
                          <span>Sites<br/><b className="text-[var(--bf-dev-text-2)]">{plan.limits?.sites ?? '—'}</b></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.planKey && <div className="mt-2 text-[12px] font-medium text-rose-500">{fieldErrors.planKey}</div>}
              </FieldCard>

              <FieldCard title="Billing & commercial terms" subtitle="Offline payment workflow: paid companies receive direct active access during provisioning." icon={CircleDollarSign}>
                <div className="space-y-4">
                  <InputShell label="Billing Cycle" required error={fieldErrors.billingCycle}><Segmented value={form.billingCycle} onChange={(value) => patch('billingCycle', Number(value))} options={(metadata.billingCycles || [1, 6, 12]).map((months) => ({ value: months, label: `${months} Month${months === 1 ? '' : 's'}` }))} /></InputShell>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InputShell label="Subscription Start" required error={fieldErrors.subscriptionStart}><TextInput type="date" value={form.subscriptionStart} onChange={(value) => patch('subscriptionStart', value)} /></InputShell>
                    <InputShell label="Subscription End"><TextInput value={formatDate(subscriptionEnd)} readOnly /></InputShell>
                    <InputShell label="Discount %" helper="Optional percentage discount" error={fieldErrors.discountPercent}><TextInput value={String(form.discountPercent)} onChange={(value) => patch('discountPercent', value.replace(/[^\d.]/g, '').slice(0, 6))} placeholder="0" /></InputShell>
                    <InputShell label="Discount Reason" required={Number(form.discountPercent || 0) > 0} helper="Required only when discount is applied." error={fieldErrors.discountReason}><TextInput value={form.discountReason} onChange={(value) => patch('discountReason', value)} placeholder="Commercial reason" /></InputShell>
                  </div>
                </div>
              </FieldCard>

              <FieldCard title="Price & entitlement preview" subtitle="Billing supports 1, 6 and 12 months only. Paid provisioning generates the initial invoice automatically." icon={ShieldCheck}>
                <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
                  <div className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-4">
                    <div className="space-y-2 text-[13px]">
                      <div className="flex justify-between gap-3"><span className="text-[var(--bf-dev-text-2)]">Base Plan Price</span><b className="text-[var(--bf-dev-text)]">{formatMoney(basePrice, selectedPlan?.currency || 'INR')}</b></div>
                      <div className="flex justify-between gap-3"><span className="text-[var(--bf-dev-text-2)]">Discount ({Number(form.discountPercent || 0)}%)</span><b className="text-emerald-500">− {formatMoney(discountAmount, selectedPlan?.currency || 'INR')}</b></div>
                      <div className="border-t border-[var(--bf-dev-border)] pt-2 flex justify-between gap-3"><span className="font-bold text-[var(--bf-dev-text-2)]">Net Subscription Amount</span><b className="text-[16px] text-[var(--bf-dev-primary)]">{formatMoney(netPrice, selectedPlan?.currency || 'INR')}</b></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {enabledFleetKeys.map((packKey) => {
                      const pack = metadata.fleetPacks.find((item) => item.pack_key === packKey);
                      const summary = metadata.accessSummary?.[`${form.planKey}:${packKey}`] || { full: 0, read_only: 0, blocked: 0, total: 0 };
                      return (
                        <div key={packKey} className="grid grid-cols-[1.4fr_repeat(3,.55fr)] gap-2 rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2.5 text-[12px]">
                          <div className="truncate font-bold text-[var(--bf-dev-text)]">{pack?.name || packKey}</div>
                          <div className="text-center text-emerald-500">Full <b>{summary.full}</b></div>
                          <div className="text-center text-amber-500">Read <b>{summary.read_only}</b></div>
                          <div className="text-center text-rose-500">Block <b>{summary.blocked}</b></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FieldCard>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <FieldCard title="Final Review" subtitle="Review the company, owner, Fleet Pack and commercial setup before creating the live tenant." icon={ShieldCheck}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                ['Legal Name', form.legalName],
                ['Trade Name', form.tradeName],
                ['Company Type', form.companyType],
                ['GSTIN', form.gstin || 'Not provided'],
                ['GST Status', gstResult?.gstStatus || (form.gstin ? 'Not verified' : 'Not applicable')],
                ['PAN / CIN', [form.pan, form.cin].filter(Boolean).join(' · ') || 'Not provided'],
                ['Company Email', form.companyEmail],
                ['Company Phone', `${selectedCountry?.dialCode || '+91'} ${form.companyPhone}`],
                ['Website', form.website || 'Not provided'],
                ['Registered Address', `${form.addressLine1}${form.addressLine2 ? `, ${form.addressLine2}` : ''}, ${form.city}, ${form.state} ${form.postalCode}, ${selectedCountry?.name || 'India'}`],
                ['Company Code', 'Auto-generated during provisioning'],
                ['Portal Slug', form.portalSlug],
                ['Owner', `${form.ownerName} · ${form.ownerDesignation}`],
                ['Owner Login', form.ownerEmail],
                ['Owner Mobile', `${selectedCountry?.dialCode || '+91'} ${form.ownerMobile}`],
                ['Primary Fleet', primaryFleet?.name || '—'],
                ['Additional Fleets', form.additionalFleets.map((key) => metadata.fleetPacks.find((pack) => pack.pack_key === key)?.name || key).join(', ') || 'None'],
                ['Primary Site', 'Head Office · Registered Address'],
                ['Account Type', form.accountType === 'trial' ? 'Developer Trial' : 'Paid Subscription'],
                ['Commercial', form.accountType === 'trial' ? `${form.trialWeeks} Week${form.trialWeeks === 1 ? '' : 's'} · ${formatDate(form.subscriptionStart)} – ${formatDate(trialEnd)}` : `${selectedPlan?.name || '—'} · ${form.billingCycle} Month${form.billingCycle === 1 ? '' : 's'} · ${formatMoney(netPrice, selectedPlan?.currency || 'INR')}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] p-3">
                  <div className="text-[12px] text-[var(--bf-dev-text-2)]">{label}</div>
                  <div className="mt-1 text-[13px] font-semibold leading-4 text-[var(--bf-dev-text)]">{value || '—'}</div>
                </div>
              ))}
            </div>
          </FieldCard>

          <div className="rounded-[5px] border border-[rgb(var(--bf-dev-primary-rgb)/.18)] bg-[rgb(var(--bf-dev-primary-rgb)/.07)] px-4 py-3 text-[13px] leading-5 text-[var(--bf-dev-text-2)]">
            <b>Ready to provision:</b> Company Code is generated by the backend. Paid companies receive direct active access and an initial invoice; Developer trials use the selected 1–4 week duration.
          </div>
        </div>
      )}

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[12px] text-[var(--bf-dev-text-2)]">Step {step + 1} of {STEPS.length} · {STEPS[step].label}</div>
        <div className="flex items-center justify-end gap-2">
          {step > 0 && <SecondaryButton icon={ArrowLeft} onClick={previousStep}>Back</SecondaryButton>}
          {step < STEPS.length - 1 ? <PrimaryButton icon={ArrowRight} onClick={nextStep}>Continue</PrimaryButton> : <PrimaryButton icon={CheckCircle2} onClick={jumpToReviewProvisioning}>Create & Provision Company</PrimaryButton>}
        </div>
      </Card>

      {slugDialog && (
        <SlugConflictDialog
          slugState={slugState}
          value={slugInput}
          onChange={(value) => { setSlugInput(slugify(value)); setSlugState((current) => ({ ...current, manualAvailable: null })); }}
          onPick={(value) => { setSlugInput(value); patch('portalSlug', value); setSlugState((current) => ({ ...current, slug: value, available: true, manualAvailable: true })); setSlugDialog(false); }}
          onCheck={checkManualSlug}
          onClose={() => setSlugDialog(false)}
          checking={slugChecking}
        />
      )}
      {phaseFourOpen && (
        <ProvisionCompanyDialog
          onClose={() => setPhaseFourOpen(false)}
          onAllCompanies={() => navigate('/saas-platform/companies/all-companies')}
          onOpenCompany={(companyId) => companyId && navigate(`/saas-platform/companies/${companyId}`)}
          onProvisioned={() => {
            draftDisabledRef.current = true;
            clearWorkflowDraftFamily(workflowKey);
          }}
          payload={{
            ...form,
            draftId,
            gstStatus: gstResult?.gstStatus || '',
            gstWarningAccepted,
            countryName: selectedCountry?.name || 'India',
            countryDialCode: selectedCountry?.dialCode || '+91',
            primaryFleetLabel: primaryFleet?.name || form.primaryFleet,
            planName: selectedPlan?.name || form.planKey,
          }}
        />
      )}

      {discardDialogOpen && (
        <ConfirmDraftDeleteDialog
          title="Discard this company draft?"
          description="All saved company details and the draft owner photo will be permanently deleted."
          confirmLabel="Discard Draft"
          onCancel={() => setDiscardDialogOpen(false)}
          onConfirm={async () => {
            const response = await deleteCompanyDraft(draftId);
            if (!response.ok) {
              setError(response.code || 'Unable to discard this draft.');
              setDiscardDialogOpen(false);
              return;
            }
            draftDisabledRef.current = true;
            clearWorkflowDraftFamily(workflowKey);
            navigate('/saas-platform/companies/all-companies');
          }}
        />
      )}
    </Page>
  );
}

export default function CreateCompanyPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [draftLimit, setDraftLimit] = useState(5);
  const [activeDraft, setActiveDraft] = useState(null);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  async function refreshDrafts() {
    setLoadingDrafts(true);
    const response = await getCompanyDrafts();
    if (response.ok) {
      setDrafts(response.drafts || []);
      setDraftLimit(Number(response.limit || 5));
      setError('');
    } else {
      setError(response.code || 'Unable to load saved company drafts.');
    }
    setLoadingDrafts(false);
  }

  useEffect(() => {
    refreshDrafts();
  }, []);

  async function startNew() {
    setBusy('new');
    setError('');
    const response = await createCompanyDraft({ draftName: 'Untitled company' });
    if (response.ok && response.draft?.id) {
      setActiveDraft({
        ...response.draft,
        formData: {},
        workflowState: {},
        ownerPhoto: null,
      });
    } else {
      setError(response.code === 'DRAFT_LIMIT_REACHED' ? `Maximum ${draftLimit} drafts allowed. Delete one draft before creating another.` : (response.code || 'Unable to create a company draft.'));
      await refreshDrafts();
    }
    setBusy('');
  }

  async function continueDraft(draftId) {
    setBusy(draftId);
    setError('');
    const response = await getCompanyDraft(draftId);
    if (response.ok && response.draft) {
      setActiveDraft(response.draft);
    } else {
      setError(response.code || 'Unable to open this draft.');
      await refreshDrafts();
    }
    setBusy('');
  }

  async function confirmDelete() {
    if (!pendingDelete?.id) return;
    const response = await deleteCompanyDraft(pendingDelete.id);
    if (!response.ok) throw new Error(response.code || 'DRAFT_DELETE_FAILED');
    clearWorkflowDraftFamily(draftWorkflowKey(pendingDelete.id));
    setPendingDelete(null);
    await refreshDrafts();
  }

  if (activeDraft) {
    return <CreateCompanyWizard key={activeDraft.id} draft={activeDraft} />;
  }

  return (
    <Page>
      <PageHeader
        eyebrow="SaaS Platform / Companies / Create"
        title="Create Company"
        description="Choose a clean onboarding flow or continue one of your recent secure drafts."
        actions={<HeaderAction icon={ArrowLeft} onClick={() => navigate('/saas-platform/companies/all-companies')}>All Companies</HeaderAction>}
      />
      <Card className="min-h-[320px] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]" />
          <div className="h-28 rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)]" />
        </div>
      </Card>

      {!loadingDrafts && (
        <CreateCompanyEntryDialog
          drafts={drafts}
          limit={draftLimit}
          busy={busy}
          error={error}
          onCreateNew={startNew}
          onContinue={continueDraft}
          onDelete={setPendingDelete}
          onClose={() => navigate('/saas-platform/companies/all-companies')}
        />
      )}

      {loadingDrafts && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-transparent p-4">
          <div className="flex items-center gap-3 rounded-[6px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-5 py-4 shadow-[0_28px_90px_rgba(2,6,23,.30)]">
            <Loader2 size={18} className="animate-spin text-[var(--bf-dev-primary)]" />
            <span className="text-[13px] font-semibold text-[var(--bf-dev-text)]">Loading company drafts…</span>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDraftDeleteDialog
          title={`Delete “${pendingDelete.name || 'Untitled company'}”?`}
          description="This draft and its saved owner photo will be permanently removed. This action cannot be undone."
          confirmLabel="Delete Draft"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </Page>
  );
}

