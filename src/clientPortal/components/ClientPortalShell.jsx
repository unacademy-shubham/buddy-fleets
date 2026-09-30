import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, AlignJustify, Bell, Check, ChevronDown, ChevronLeft, ChevronRight, Circle,
  Clock3, Home, LogOut, Mail, Maximize2, Menu, MessageCircle, MessageSquare, Minimize2,
  Moon, Search, Settings, ShieldCheck, SlidersHorizontal, Sun, User, X
} from 'lucide-react';
import SiteSelector from './SiteSelector';
import PortalFooter from './PortalFooter';
import { useClientPortal } from '../ClientPortalContext';
import { getVisibleNavigation, iconFor } from '../config/portalNavigation';

const SIDEBAR_W = 250;
const SIDEBAR_COLLAPSED_W = 72;
const SIDEBAR_ICON_TEXT_W = 110;
const SIDEBAR_DOUBLE_RAIL_W = 80;
const SIDEBAR_DOUBLE_PANEL_W = 280;
const HEADER_H = 66;
const HORIZONTAL_NAV_H = 52;
const RIGHT_DRAWER_W = 302;

const STORAGE_KEY = 'bf_portal_theme_config_v4';
const LEGACY_STORAGE_KEY = 'bf_client_theme_config_v2';

const THEME_DEFAULTS = {
  direction: 'ltr',
  navigationStyle: 'vertical',
  horizontalLogo: 'default',
  theme: 'dark',
  primaryColor: '#5551D7',
  backgroundLight: '#ECECF3',
  backgroundDark: '#0E1929',
  sidebarStyle: 'dark',
  headerStyle: 'color',
  sideMenuLayout: 'default',
  sidebarLockedOpen: true,
  themeDrawerTab: 'theme',
  utilityDrawerTab: 'recent',
};

const PRIMARY_PRESETS = [
  { id: 'indigo', label: 'Indigo', value: '#5551D7' },
  { id: 'buddy-blue', label: 'Buddy Blue', value: '#1689E5' },
  { id: 'violet', label: 'Violet', value: '#7C3AED' },
  { id: 'cyan', label: 'Cyan', value: '#0891B2' },
  { id: 'emerald', label: 'Emerald', value: '#059669' },
  { id: 'orange', label: 'Orange', value: '#EA580C' },
  { id: 'rose', label: 'Rose', value: '#E11D48' },
];

const SUBMENU_TOGGLE_EVENT = 'bf-portal-submenu-toggle';

function cx(...values) { return values.filter(Boolean).join(' '); }

function getInitials(value) {
  const parts = String(value || 'BF').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'BF';
  return (parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts.at(-1)[0]}`).toUpperCase();
}

function hexToRgb(hex) {
  const clean = String(hex || '#5551D7').replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16) || 85,
    g: parseInt(clean.slice(2, 4), 16) || 81,
    b: parseInt(clean.slice(4, 6), 16) || 215,
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function darkenHex(hex, amount = 0.13) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function lightenHex(hex, amount = 0.84) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

function readTheme() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (current && typeof current === 'object') return { ...THEME_DEFAULTS, ...current };
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');
    if (legacy && typeof legacy === 'object') return { ...THEME_DEFAULTS, ...legacy };
  } catch {}
  return { ...THEME_DEFAULTS };
}

function writeTheme(config) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
}

function buildVars({ config }) {
  const dark = config.theme === 'dark';
  const primary = config.primaryColor || THEME_DEFAULTS.primaryColor;
  const primaryStrong = darkenHex(primary, 0.13);
  const primarySoft = lightenHex(primary, 0.84);
  const rgb = hexToRgb(primary);

  const darkSurface = '#1B2433';
  const darkSurface2 = '#162131';
  const darkSurface3 = '#253247';
  const lightSurface = '#FFFFFF';
  const lightSurface2 = '#F8F9FC';
  const lightSurface3 = '#EEF1F6';

  const page = dark ? config.backgroundDark : config.backgroundLight;
  const surface = dark ? darkSurface : lightSurface;
  const surface2 = dark ? darkSurface2 : lightSurface2;
  const surface3 = dark ? darkSurface3 : lightSurface3;
  const text = dark ? '#F1F5F9' : '#20283A';
  const text2 = dark ? '#B6C2D2' : '#667085';
  const text3 = dark ? '#8F9CAF' : '#8793A8';
  const border = dark ? '#313B4B' : '#E2E6EE';

  let sidebarBg = dark ? darkSurface : '#FFFFFF';
  let sidebarSolid = dark ? darkSurface : '#FFFFFF';
  let sidebarText = dark ? '#EEF3F8' : '#61708A';
  let sidebarMuted = dark ? '#8B9AAF' : '#97A3B5';
  let sidebarBorder = dark ? '#313B4B' : '#ECEEF3';

  if (config.sidebarStyle === 'light') {
    sidebarBg = '#FFFFFF'; sidebarSolid = '#FFFFFF'; sidebarText = '#61708A'; sidebarMuted = '#97A3B5'; sidebarBorder = '#ECEEF3';
  }
  if (config.sidebarStyle === 'dark') {
    sidebarBg = darkSurface; sidebarSolid = darkSurface; sidebarText = '#EEF3F8'; sidebarMuted = '#8B9AAF'; sidebarBorder = '#313B4B';
  }
  if (config.sidebarStyle === 'color') {
    sidebarBg = primary; sidebarSolid = primaryStrong; sidebarText = '#FFFFFF'; sidebarMuted = 'rgba(255,255,255,.72)'; sidebarBorder = 'rgba(255,255,255,.16)';
  }
  if (config.sidebarStyle === 'gradient') {
    sidebarBg = `linear-gradient(180deg, ${primary} 0%, ${primaryStrong} 56%, ${darkSurface} 100%)`;
    sidebarSolid = primaryStrong; sidebarText = '#FFFFFF'; sidebarMuted = 'rgba(255,255,255,.72)'; sidebarBorder = 'rgba(255,255,255,.15)';
  }

  let headerBg = primary;
  let headerText = '#FFFFFF';
  let headerMuted = 'rgba(255,255,255,.82)';
  let headerBorder = 'rgba(255,255,255,.14)';
  if (config.headerStyle === 'light') { headerBg = '#FFFFFF'; headerText = '#2B3544'; headerMuted = '#69778B'; headerBorder = '#E7EAF0'; }
  if (config.headerStyle === 'dark') { headerBg = darkSurface; headerText = '#FFFFFF'; headerMuted = '#ACB8C8'; headerBorder = '#313B4B'; }
  if (config.headerStyle === 'color') { headerBg = primary; headerText = '#FFFFFF'; headerMuted = 'rgba(255,255,255,.82)'; headerBorder = 'rgba(255,255,255,.14)'; }
  if (config.headerStyle === 'gradient') { headerBg = `linear-gradient(90deg, ${primary} 0%, ${primaryStrong} 100%)`; }

  return {
    '--bf-primary': primary,
    '--bf-primary-strong': primaryStrong,
    '--bf-primary-2': primaryStrong,
    '--bf-primary-soft': primarySoft,
    '--bf-primary-rgb': `${rgb.r} ${rgb.g} ${rgb.b}`,
    '--bf-page': page,
    '--bf-bg': page,
    '--bf-surface': surface,
    '--bf-surface-2': surface2,
    '--bf-surface-3': surface3,
    '--bf-card': surface,
    '--bf-text': text,
    '--bf-text-2': text2,
    '--bf-text-3': text3,
    '--bf-muted': text2,
    '--bf-border': border,
    '--bf-sidebar-bg': sidebarBg,
    '--bf-sidebar-solid': sidebarSolid,
    '--bf-sidebar-text': sidebarText,
    '--bf-sidebar-muted': sidebarMuted,
    '--bf-sidebar-border': sidebarBorder,
    '--bf-header-bg': headerBg,
    '--bf-header-text': headerText,
    '--bf-header-muted': headerMuted,
    '--bf-header-border': headerBorder,
    '--bf-shadow': dark ? '0 3px 16px rgba(0,0,0,.22)' : '0 3px 16px rgba(15,23,42,.08)',
    '--bf-sidebar-width': `${SIDEBAR_W}px`,
    '--bf-sidebar-collapsed': `${SIDEBAR_COLLAPSED_W}px`,
    '--bf-sidebar-icon-text': `${SIDEBAR_ICON_TEXT_W}px`,
    '--bf-sidebar-double-rail': `${SIDEBAR_DOUBLE_RAIL_W}px`,
    '--bf-sidebar-double-panel': `${SIDEBAR_DOUBLE_PANEL_W}px`,
    '--bf-header-height': `${HEADER_H}px`,
    '--bf-horizontal-nav-height': `${HORIZONTAL_NAV_H}px`,
    '--bf-drawer-width': `${RIGHT_DRAWER_W}px`,
    '--bf-main-offset': `${getSidebarOffset(config)}px`,
  };
}

function getSidebarOffset(config) {
  if (config.navigationStyle !== 'vertical') return 0;
  switch (config.sideMenuLayout) {
    case 'closed': return 0;
    case 'icon-text': return SIDEBAR_ICON_TEXT_W;
    case 'icon-overlay': return SIDEBAR_COLLAPSED_W;
    case 'hover-submenu': return SIDEBAR_ICON_TEXT_W;
    case 'hover-submenu-1': return SIDEBAR_COLLAPSED_W;
    case 'double':
    case 'double-tabs': return SIDEBAR_DOUBLE_RAIL_W + SIDEBAR_DOUBLE_PANEL_W;
    case 'default':
    default: return config.sidebarLockedOpen ? SIDEBAR_W : SIDEBAR_COLLAPSED_W;
  }
}

function nodeMatches(pathname, basePath, node) {
  if (node?.route) {
    const url = `${basePath}/${node.route}`.replace(/\/+/g, '/');
    if (pathname === url || pathname.startsWith(`${url}/`)) return true;
  }
  return Array.isArray(node?.children) && node.children.some((child) => nodeMatches(pathname, basePath, child));
}

function normalizeRuntimeNode(node, index = 0) {
  if (!node || typeof node !== 'object') return null;
  const children = (Array.isArray(node.children) ? node.children : []).map((child, childIndex) => normalizeRuntimeNode(child, childIndex)).filter(Boolean);
  return {
    id: node.node_key || `runtime-${index}`,
    nodeType: node.node_type || '',
    label: node.label || node.node_key || 'Navigation',
    icon: node.icon_key || (node.node_type === 'category' ? 'Circle' : ''),
    route: node.route || null,
    moduleKey: node.module_key || null,
    children,
  };
}

function normalizeRuntimeNavigation(nodes) {
  return (Array.isArray(nodes) ? nodes : []).map(normalizeRuntimeNode).filter(Boolean);
}

function hasDeepRuntimeNavigation(nodes, depth = 0) {
  return (nodes || []).some((node) => ['submenu', 'level3'].includes(node.nodeType) || (depth >= 1 && (node.children || []).length > 0) || hasDeepRuntimeNavigation(node.children || [], depth + 1));
}

function flattenTreeNavigation(nodes, trail = []) {
  const out = [];
  for (const node of nodes || []) {
    const nextTrail = [...trail, node.label];
    if (node.route) out.push({ label: node.label, route: node.route, trail: nextTrail, moduleKey: node.moduleKey });
    out.push(...flattenTreeNavigation(node.children || [], nextTrail));
  }
  return out;
}

function notifySiblingSubmenus(scope, key) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SUBMENU_TOGGLE_EVENT, { detail: { scope, key } }));
}

function PortalGlobalStyle() {
  return (
    <style>{`
      html, body, #root { min-height:100%; }
      .bf-dev-shell, .bf-dev-shell * { box-sizing:border-box; }
      .bf-dev-shell { min-height:100dvh; background:var(--bf-page); color:var(--bf-text); }
      .bf-dev-shell button,.bf-dev-shell input,.bf-dev-shell select,.bf-dev-shell textarea { font:inherit; }
      .bf-dev-sidebar-bg { background:var(--bf-sidebar-bg); }
      .bf-dev-header-bg { background:var(--bf-header-bg); color:var(--bf-header-text); }
      .bf-dev-header-bg .bf-header-main-text { color:var(--bf-header-text)!important; }
      .bf-dev-header-bg .bf-header-muted-text { color:var(--bf-header-muted)!important; }
      .bf-dev-gear { animation:bfGearSpin 5s linear infinite; }
      @keyframes bfGearSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      .bf-dev-online-dot { position:absolute!important; z-index:2; isolation:isolate; }
      .bf-dev-online-dot::after { content:''; position:absolute; inset:-1px; z-index:-1; border-radius:999px; background:rgba(34,197,94,.34); pointer-events:none; animation:bfOnlineRadar 1.8s ease-out infinite; }
      @keyframes bfOnlineRadar { 0%{opacity:.85;transform:scale(.9)} 75%,100%{opacity:0;transform:scale(2.7)} }
      .bf-dev-sidebar-parent:hover,.bf-dev-sidebar-parent:hover svg,.bf-dev-sidebar-child:hover { color:var(--bf-primary)!important; }
      .bf-dev-horizontal-menu { box-shadow:0 1px 0 var(--bf-border); }
      .bf-dev-shell .text-\\[8px\\]{font-size:10px!important;line-height:1.35!important}
      .bf-dev-shell .text-\\[9px\\]{font-size:11px!important;line-height:1.4!important}
      .bf-dev-shell .text-\\[10px\\]{font-size:12px!important;line-height:1.45!important}
      .bf-dev-shell .text-\\[11px\\]{font-size:13px!important;line-height:1.45!important}
      .bf-dev-shell .text-\\[12px\\]{font-size:13px!important;line-height:1.45!important}
      .bf-dev-shell .text-\\[13px\\]{font-size:14px!important;line-height:1.45!important}
      .bf-dev-popover-surface { background:var(--bf-surface); color:var(--bf-text); box-shadow:0 12px 32px rgba(15,23,42,.18); }
      .bf-dev-popover-arrow { position:absolute;top:-7px;right:22px;width:14px;height:14px;transform:rotate(45deg);background:var(--bf-surface);border-left:1px solid var(--bf-border);border-top:1px solid var(--bf-border); }
      .bf-dev-sidebar-flyout { z-index:140!important; overflow:visible!important; }
      .bf-dev-sidebar-flyout-host { overflow:visible!important; }
      .bf-dev-profile-email { overflow-wrap:anywhere;word-break:break-word; }
      .bf-dev-scroll { scrollbar-width:thin;scrollbar-color:rgb(var(--bf-primary-rgb)/.36) transparent; }
      .bf-dev-scroll::-webkit-scrollbar{width:6px;height:6px}.bf-dev-scroll::-webkit-scrollbar-track{background:transparent}.bf-dev-scroll::-webkit-scrollbar-thumb{border-radius:999px;background:rgb(var(--bf-primary-rgb)/.34)}
      .bf-dev-pop{animation:bfDevPop .12s ease-out}@keyframes bfDevPop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
      .bf-portal-site-select{display:flex;align-items:center;gap:8px;min-width:180px;height:44px;padding:0 11px;border:1px solid rgba(255,255,255,.15);border-radius:7px;background:rgba(255,255,255,.08);color:var(--bf-header-text);}
      .bf-portal-site-select svg{flex:none;opacity:.9}.bf-portal-site-select select{min-width:0;flex:1;border:0;outline:0;background:transparent;color:var(--bf-header-text);font-size:13px;font-weight:600;cursor:pointer}.bf-portal-site-select option{color:#20283A;background:#fff}
      .bf-portal-drawer-backdrop{position:fixed;inset:0;z-index:40;border:0;background:rgba(2,6,23,.20)}
      .bf-portal-content{min-width:0;flex:1;padding:28px 20px 34px;background:var(--bf-page)}
      .bf-portal-content .bf-page-head{margin-bottom:22px}.bf-portal-content .bf-page-head h1{font-size:24px!important;line-height:1.2!important;font-weight:800!important;letter-spacing:-.03em}.bf-portal-content .bf-page-head p{margin-top:6px;font-size:12px!important;line-height:1.5!important;color:var(--bf-text-2)!important}
      .bf-portal-content .bf-grid{gap:16px}.bf-portal-content .bf-card{border-radius:8px;background:var(--bf-surface);border-color:var(--bf-border);box-shadow:var(--bf-shadow)}
      .bf-portal-content .bf-card-head{min-height:52px;padding:14px 16px;border-color:var(--bf-border)}.bf-portal-content .bf-card-head h3{font-size:13px!important;font-weight:700!important;color:var(--bf-text)!important}
      .bf-client-shell-root .bf-kpi{min-height:112px;border-radius:8px;background:var(--bf-surface);border-color:var(--bf-border);box-shadow:var(--bf-shadow)}
      .bf-client-shell-root .bf-kpi-title{font-size:10px}.bf-client-shell-root .bf-kpi-value{font-size:24px;font-weight:900}.bf-client-shell-root .bf-kpi-note{font-size:10px}
      .bf-client-shell-root .bf-table th{background:var(--bf-surface-2);color:var(--bf-text-3);border-color:var(--bf-border)}.bf-client-shell-root .bf-table td{color:var(--bf-text-2);border-color:var(--bf-border)}
      @media(max-width:1024px){.bf-portal-content{padding:22px 16px 28px}.bf-portal-site-select{min-width:150px}}
      @media(max-width:860px){.desktop-only{display:none!important}.mobile-only{display:flex!important}.bf-portal-content{padding:18px 13px 26px}.bf-portal-site-select{display:none}.bf-portal-content .bf-page-head h1{font-size:21px!important}}
      @media(max-width:620px){.bf-portal-content{padding:16px 11px 24px}}
      @media(prefers-reduced-motion:reduce){.bf-dev-shell *,.bf-dev-shell *::before,.bf-dev-shell *::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
    `}</style>
  );
}

function SessionCountdown() {
  const [expiresAt, setExpiresAt] = useState(null);
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const response = await fetch('/api/auth/session', { credentials:'include', cache:'no-store', headers:{Accept:'application/json'} });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && data?.ok && data?.session?.expiresAt) setExpiresAt(new Date(data.session.expiresAt).getTime());
      } catch {}
    };
    sync();
    const poll = window.setInterval(sync, 60000);
    return () => { cancelled = true; window.clearInterval(poll); };
  }, []);
  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);
  if (remaining === null) return null;
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return <div className="hidden min-w-[112px] rounded-md border border-white/15 bg-black/10 px-2.5 py-1.5 text-right xl:block"><div className="text-[8px] font-bold uppercase tracking-[.12em] text-[var(--bf-header-muted)]">Session</div><div className="text-[11px] font-bold tabular-nums text-[var(--bf-header-text)]">{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</div></div>;
}

function UserAvatar({ currentUser, size='md', showStatus=false }) {
  const name = currentUser?.name || currentUser?.fullName || currentUser?.full_name || 'Company User';
  const avatarUrl = currentUser?.avatar_url || currentUser?.avatarUrl || currentUser?.photoURL || currentUser?.photoUrl || currentUser?.image || null;
  const sizeClass = size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  return <div className={cx('relative flex shrink-0 items-center justify-center overflow-visible rounded-full border border-[var(--bf-border)] bg-[rgb(var(--bf-primary-rgb)/.12)] font-black text-[var(--bf-primary)]',sizeClass)}>{avatarUrl?<img src={avatarUrl} alt={name} className="h-full w-full rounded-full object-cover"/>:<span>{getInitials(name)}</span>}{showStatus?<span className="bf-dev-online-dot absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bf-surface)] bg-emerald-500"/>:null}</div>;
}

function HeaderIcon({ label, children, onClick, badge, active }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={cx('relative flex h-9 w-9 items-center justify-center rounded-md text-[var(--bf-header-muted)] transition duration-150 hover:bg-black/10 hover:text-[var(--bf-header-text)]',active&&'bg-black/10 text-[var(--bf-header-text)]')}>{children}{badge!=null?<span className="absolute -right-0.5 -top-0.5 min-w-[15px] rounded-full bg-rose-500 px-1 text-center text-[8px] font-bold leading-[15px] text-white">{badge}</span>:null}</button>;
}

function Popover({ children, width, align='right' }) {
  return <div className={cx('bf-dev-pop absolute top-[calc(100%+10px)] z-[120]',align==='left'?'left-0':'right-0')} style={{width,maxWidth:'calc(100vw - 24px)'}}><span className="bf-dev-popover-arrow"/><div className="bf-dev-popover-surface overflow-hidden rounded-md border border-[var(--bf-border)]">{children}</div></div>;
}

function SearchPopover({ navigation, basePath, onNavigate }) {
  const inputRef=useRef(null); const [query,setQuery]=useState('');
  const flat=useMemo(()=>flattenTreeNavigation(navigation),[navigation]);
  const results=query.trim()?flat.filter(x=>x.label.toLowerCase().includes(query.toLowerCase())).slice(0,7):[];
  useEffect(()=>{const timer=window.setTimeout(()=>inputRef.current?.focus(),50);return()=>window.clearTimeout(timer)},[]);
  return <Popover width={360}><form onSubmit={(e)=>e.preventDefault()} className="p-3"><div className="flex overflow-hidden rounded-md border border-[var(--bf-border)] bg-[var(--bf-surface)]"><input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} type="search" placeholder="Search....." className="h-11 min-w-0 flex-1 bg-transparent px-4 text-[13px] text-[var(--bf-text)] outline-none placeholder:text-[var(--bf-text-3)]"/><button type="submit" aria-label="Search" className="flex h-11 w-12 shrink-0 items-center justify-center bg-[var(--bf-primary)] text-white"><Search size={18}/></button></div></form>{query?<div className="bf-dev-scroll max-h-[280px] overflow-y-auto border-t border-[var(--bf-border)]">{results.map(r=><button key={`${r.route}-${r.label}`} type="button" onClick={()=>{onNavigate(r.route);setQuery('')}} className="flex w-full items-start gap-3 border-b border-[var(--bf-border)] px-4 py-3 text-left hover:bg-[rgb(var(--bf-primary-rgb)/.06)]"><Search size={15} className="mt-0.5 shrink-0 text-[var(--bf-primary)]"/><span className="min-w-0"><strong className="block text-[12px] text-[var(--bf-text)]">{r.label}</strong><small className="mt-0.5 block text-[10px] text-[var(--bf-text-3)]">{r.trail.slice(0,-1).join(' / ')}</small></span></button>)}{!results.length?<div className="px-4 py-5 text-center text-[11px] text-[var(--bf-text-3)]">No module found</div>:null}</div>:null}</Popover>;
}

function MessagesPopover({ company }) {
  return <Popover width={405}><div className="flex items-center justify-between border-b border-[var(--bf-border)] px-5 py-4"><div className="text-[13px] font-semibold text-[var(--bf-primary)]">New Messages</div><button type="button" className="rounded-full bg-fuchsia-500 px-2.5 py-1 text-[10px] font-bold text-white">Mark all as read</button></div><div className="bf-dev-scroll max-h-[335px] overflow-y-auto"><div className="flex gap-3 border-b border-[var(--bf-border)] px-4 py-3"><UserAvatar size="sm" showStatus/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><span className="truncate text-[13px] font-semibold text-[var(--bf-text)]">{company?.company_name||company?.companyName||'Company workspace'}</span><span className="shrink-0 text-[11px] text-[var(--bf-text-3)]">Now</span></div><div className="mt-0.5 text-[12px] leading-5 text-[var(--bf-text-2)]">Operational messages and announcements for this workspace appear here.</div></div></div><div className="flex gap-3 border-b border-[var(--bf-border)] px-4 py-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--bf-primary-rgb)/.12)] text-[var(--bf-primary)]"><ShieldCheck size={17}/></div><div className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-[var(--bf-text)]">Secure portal</span><div className="mt-0.5 text-[12px] leading-5 text-[var(--bf-text-2)]">Your authenticated workspace is active.</div></div></div></div><div className="border-t border-[var(--bf-border)] p-4"><button type="button" className="h-11 w-full rounded-md bg-[var(--bf-primary)] text-[13px] font-semibold text-white">View All</button></div></Popover>;
}

function NotificationsPopover({ company }) {
  const rows=[
    {icon:ShieldCheck,title:'Secure session active',meta:'Authenticated portal session verified.'},
    {icon:Home,title:'Workspace ready',meta:`${company?.company_name||company?.companyName||'Company'} modules loaded.`},
    {icon:Bell,title:'Operational updates',meta:'New alerts will appear here.'},
  ];
  return <Popover width={360}><div className="flex items-center justify-between border-b border-[var(--bf-border)] px-5 py-4"><div className="text-[13px] font-semibold text-[var(--bf-primary)]">Notifications</div><button type="button" className="rounded-full bg-fuchsia-500 px-2.5 py-1 text-[10px] font-bold text-white">Mark all as read</button></div><div className="bf-dev-scroll max-h-[340px] overflow-y-auto">{rows.map((item)=><div key={item.title} className="flex items-center gap-3 border-b border-[var(--bf-border)] px-4 py-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--bf-primary-rgb)/.12)] text-[var(--bf-primary)]"><item.icon size={16}/></div><div className="min-w-0 flex-1"><div className="text-[13px] font-semibold text-[var(--bf-text)]">{item.title}</div><div className="mt-1 text-[11px] text-[var(--bf-text-3)]">{item.meta}</div></div><X size={14} className="shrink-0 text-[var(--bf-text-3)]"/></div>)}</div><div className="border-t border-[var(--bf-border)] p-4"><button type="button" className="h-11 w-full rounded-md bg-[var(--bf-primary)] text-[13px] font-semibold text-white">View All</button></div></Popover>;
}

function ProfilePopover({ currentUser, onLogout, onClose, onNavigate, demo, canBilling }) {
  const displayName=currentUser?.name||currentUser?.fullName||currentUser?.full_name||'Company User';
  const email=currentUser?.email||'';
  const rows=[
    ['My Profile',User,'profile-security'],
    ...(canBilling?[['Subscription & Billing',ShieldCheck,'subscription']]:[]),
    ['Company Settings',Settings,'settings'],
  ];
  return <Popover width={300}><div className="border-b border-[var(--bf-border)] px-5 py-4 text-center"><div className="flex justify-center"><UserAvatar currentUser={currentUser} size="lg" showStatus/></div><div className="mt-3 text-[15px] font-semibold text-[var(--bf-text)]">{displayName}</div>{email?<div className="bf-dev-profile-email mx-auto mt-1 max-w-[250px] text-[11px] text-[var(--bf-text-3)]">{email}</div>:null}</div><div className="py-2">{rows.map(([label,Icon,route])=><button key={label} type="button" onClick={()=>{onNavigate(route);onClose?.()}} className="flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] font-medium text-[var(--bf-text-2)] transition hover:bg-[rgb(var(--bf-primary-rgb)/.06)] hover:text-[var(--bf-primary)]"><Icon size={16} className="shrink-0 text-[var(--bf-primary)]"/><span>{label}</span></button>)}{demo?<button type="button" onClick={()=>{onNavigate('__demo_home__');onClose?.()}} className="flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] font-medium text-[var(--bf-text-2)] transition hover:bg-[rgb(var(--bf-primary-rgb)/.06)] hover:text-[var(--bf-primary)]"><Home size={16} className="shrink-0 text-[var(--bf-primary)]"/><span>All Demo Fleets</span></button>:null}<div className="my-2 border-t border-[var(--bf-border)]"/><button type="button" onClick={onLogout} className="flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] font-medium text-[var(--bf-text-2)] transition hover:bg-rose-500/10 hover:text-rose-500"><LogOut size={16} className="shrink-0 text-[var(--bf-primary)]"/><span>{demo?'Sign out demo':'Sign out'}</span></button></div></Popover>;
}

function SidebarProfile({ company, currentUser, compact=false }) {
  if (compact) return <div className="flex justify-center py-5"><UserAvatar currentUser={currentUser} size="sm" showStatus/></div>;
  return <div className="shrink-0 border-b border-[var(--bf-sidebar-border)] py-7 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--bf-sidebar-border)] bg-[rgb(var(--bf-primary-rgb)/.10)] text-[13px] font-black text-[var(--bf-primary)]"><UserAvatar currentUser={currentUser} size="lg" showStatus/></div><div className="mt-3 truncate px-3 text-[13px] font-bold text-[var(--bf-sidebar-text)]">{currentUser?.name||currentUser?.fullName||currentUser?.full_name||'Company User'}</div><div className="mt-0.5 text-[10px] text-[var(--bf-sidebar-muted)]">{currentUser?.roleName||currentUser?.role||'Company Owner'}</div><div className="mt-0.5 truncate px-3 text-[10px] text-[var(--bf-sidebar-muted)]">{company?.company_name||company?.companyName||'Buddy Fleets'}</div></div>;
}

function ChildLink({ node, basePath, depth=0, collapsed=false, onNavigate }) {
  const location=useLocation(); const navigate=useNavigate();
  const hasChildren=Array.isArray(node.children)&&node.children.length>0;
  const active=nodeMatches(location.pathname,basePath,node);
  const submenuKey=node.route||node.label; const submenuScope=`sidebar-depth-${depth}`;
  const [expanded,setExpanded]=useState(active);
  useEffect(()=>{if(active)setExpanded(true)},[active,location.pathname]);
  useEffect(()=>{const h=(e)=>{if(e?.detail?.scope===submenuScope&&e.detail.key!==submenuKey)setExpanded(false)};window.addEventListener(SUBMENU_TOGGLE_EVENT,h);return()=>window.removeEventListener(SUBMENU_TOGGLE_EVENT,h)},[submenuKey,submenuScope]);
  const go=()=>{if(hasChildren){const next=!expanded;if(next)notifySiblingSubmenus(submenuScope,submenuKey);setExpanded(next);return}if(node.route){navigate(`${basePath}/${node.route}`.replace(/\/+/g,'/'));onNavigate?.()}};
  if(collapsed) return <button type="button" title={node.label} aria-expanded={hasChildren?expanded:undefined} onClick={go} className={cx('bf-dev-sidebar-child relative flex min-h-[33px] w-full items-center justify-center rounded-md text-[12px] transition hover:bg-[rgb(var(--bf-primary-rgb)/.08)] hover:text-[var(--bf-primary)]',active?'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]':'text-[var(--bf-sidebar-text)]')}><span className="h-[5px] w-[5px] rounded-full border border-current"/></button>;
  return <div>{hasChildren?<><button type="button" aria-expanded={expanded} onClick={go} className={cx('bf-dev-sidebar-child group relative flex min-h-[35px] w-full items-center rounded-md pr-2 text-left text-[12px] transition duration-150 hover:bg-[rgb(var(--bf-primary-rgb)/.08)] hover:text-[var(--bf-primary)]',active?'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]':'text-[var(--bf-sidebar-text)]')} style={{paddingLeft:`${38+depth*16}px`}}><span className="absolute h-[5px] w-[5px] rounded-full border border-current" style={{left:`${18+depth*16}px`}}/><span className="min-w-0 flex-1 truncate">{node.label}</span><ChevronDown size={12} className={cx('ml-2 shrink-0 transition-transform',expanded&&'rotate-180')}/></button>{expanded?<div>{node.children.map((child)=><ChildLink key={`${child.label}-${child.route||depth}`} node={child} basePath={basePath} depth={depth+1} onNavigate={onNavigate}/>)}</div>:null}</>:<button type="button" onClick={go} className={cx('bf-dev-sidebar-child relative flex min-h-[35px] w-full items-center rounded-md pr-2 text-left text-[12px] transition duration-150 hover:bg-[rgb(var(--bf-primary-rgb)/.08)] hover:text-[var(--bf-primary)]',active?'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]':'text-[var(--bf-sidebar-text)]')} style={{paddingLeft:`${38+depth*16}px`}}><span className="absolute h-[5px] w-[5px] rounded-full border border-current" style={{left:`${18+depth*16}px`}}/><span className="truncate">{node.label}</span></button>}</div>;
}

function CompactMenuButton({ menu, active, showLabel, onClick }) {
  const Icon=iconFor(menu.icon);
  return <button type="button" title={showLabel?undefined:menu.label} onClick={onClick} className={cx('flex min-h-[38px] w-full items-center rounded-md text-[11px] transition hover:bg-[rgb(var(--bf-primary-rgb)/.08)] hover:text-[var(--bf-primary)]',showLabel?'gap-3 px-3':'justify-center',active?'bg-[rgb(var(--bf-primary-rgb)/.10)] font-semibold text-[var(--bf-primary)]':'text-[var(--bf-sidebar-text)]')}><Icon size={16} className="shrink-0"/>{showLabel?<span className="min-w-0 flex-1 truncate text-left">{menu.label}</span>:null}</button>;
}

function SidebarFlyout({ menu, visible, title=true, onNavigate, basePath }) {
  if(!visible)return null;
  return <div className="bf-dev-sidebar-flyout absolute left-full top-0 z-[140] ml-1 w-[250px] overflow-hidden rounded-md border border-[var(--bf-border)] bg-[var(--bf-surface)] shadow-[var(--bf-shadow)]"><div className="border-b border-[var(--bf-border)] px-4 py-3 text-[12px] font-bold text-[var(--bf-text)]">{title?menu.label:''}</div><div className="bf-dev-scroll max-h-[calc(100dvh-100px)] overflow-y-auto py-1">{menu.children?.map(child=><ChildLink key={`${child.label}-${child.route||child.moduleKey}`} node={child} basePath={basePath} onNavigate={onNavigate}/>)}</div></div>;
}

function Sidebar({ navigation, basePath, company, currentUser, demo, config, mobileOpen, setMobileOpen, updateConfig }) {
  const location=useLocation();
  const activeId=navigation.find(menu=>nodeMatches(location.pathname,basePath,menu))?.id||navigation[0]?.id||'overview';
  const [openMenuId,setOpenMenuId]=useState(activeId); const [hoverExpanded,setHoverExpanded]=useState(false); const [flyoutMenuId,setFlyoutMenuId]=useState(null); const [doubleMenuId,setDoubleMenuId]=useState(activeId);
  useEffect(()=>{setOpenMenuId(activeId);setDoubleMenuId(activeId)},[activeId]);
  useEffect(()=>{setMobileOpen(false);setFlyoutMenuId(null)},[location.pathname,setMobileOpen]);
  if(config.navigationStyle!=='vertical'||config.sideMenuLayout==='closed')return null;
  const layout=config.sideMenuLayout;
  const isDefault=layout==='default'; const isIconOverlay=layout==='icon-overlay'; const isIconText=layout==='icon-text'; const isHoverMenu=layout==='hover-submenu'||layout==='hover-submenu-1'; const isHoverStyleOne=layout==='hover-submenu-1'; const isDouble=layout==='double'||layout==='double-tabs';
  const lockedOpen=isDefault?config.sidebarLockedOpen:false; const visualExpandOnHover=isDefault||isIconOverlay; const visuallyExpanded=isDefault?(lockedOpen||hoverExpanded):isIconOverlay?hoverExpanded:false;
  const widthClass=isDouble?'lg:w-[360px]':isIconText||(isHoverMenu&&!isHoverStyleOne)?'lg:w-[var(--bf-sidebar-icon-text)]':visuallyExpanded?'lg:w-[var(--bf-sidebar-width)]':'lg:w-[var(--bf-sidebar-collapsed)]';
  const activeDouble=navigation.find(menu=>menu.id===doubleMenuId)||navigation[0];
  const renderMenus=(showLabels, compact=false)=>navigation.map(menu=>{
    const active=nodeMatches(location.pathname,basePath,menu); const expanded=!compact&&openMenuId===menu.id;
    return <div key={menu.id} className="relative mb-1">
      <button type="button" title={showLabels?undefined:menu.label} onClick={()=>{
        if(compact){setFlyoutMenuId(flyoutMenuId===menu.id?null:menu.id);return;}
        setOpenMenuId(openMenuId===menu.id?'':menu.id);
      }} className={cx('bf-dev-sidebar-parent group relative flex h-[44px] w-full items-center rounded-md text-[13px] font-medium transition duration-150',showLabels?'gap-3 px-3':'justify-center',active?'text-[var(--bf-primary)]':'text-[var(--bf-sidebar-text)] hover:bg-[rgb(var(--bf-primary-rgb)/.06)]')}>
        {React.createElement(iconFor(menu.icon),{size:17,className:cx('shrink-0',active?'text-[var(--bf-primary)]':'text-[var(--bf-sidebar-muted)]')})}
        {showLabels?<><span className="min-w-0 flex-1 truncate text-left">{menu.label}</span><ChevronDown size={13} className={cx('shrink-0 text-[var(--bf-sidebar-muted)] transition-transform',expanded&&'rotate-180')}/></>:null}
      </button>
      {expanded?<div className="mt-0.5">{menu.children?.map(child=><ChildLink key={`${child.label}-${child.route||child.moduleKey}`} node={child} basePath={basePath} onNavigate={()=>setMobileOpen(false)}/>)}</div>:null}
      {compact&&flyoutMenuId===menu.id?<SidebarFlyout menu={menu} visible title onNavigate={()=>setMobileOpen(false)} basePath={basePath}/>:null}
    </div>;
  });
  return <>
    {mobileOpen?<button type="button" aria-label="Close sidebar" onClick={()=>setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"/>:null}
    <aside onMouseEnter={()=>{if(visualExpandOnHover&&!lockedOpen)setHoverExpanded(true)}} onMouseLeave={()=>{if(visualExpandOnHover&&!lockedOpen)setHoverExpanded(false);if(isHoverMenu)setFlyoutMenuId(null)}} className={cx('bf-dev-sidebar-bg fixed inset-y-0 left-0 z-[60] flex overflow-visible border-r border-[var(--bf-sidebar-border)] transition-[width,transform] duration-200 ease-out',widthClass,mobileOpen?'w-[var(--bf-sidebar-width)] translate-x-0':'w-[var(--bf-sidebar-width)] -translate-x-full lg:translate-x-0')}>
      {isDouble?<>
        <div className="flex w-[var(--bf-sidebar-double-rail)] shrink-0 flex-col border-r border-[var(--bf-sidebar-border)]"><div className="flex h-[var(--bf-header-height)] items-center justify-center border-b border-[var(--bf-sidebar-border)]"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-[12px] font-black text-white">BF</div></div><SidebarProfile currentUser={currentUser} company={company} compact/><div className="bf-dev-scroll flex-1 overflow-y-auto px-2 py-3">{navigation.map(menu=><CompactMenuButton key={menu.id} menu={menu} active={doubleMenuId===menu.id} showLabel={false} onClick={()=>setDoubleMenuId(menu.id)}/>)}</div></div>
        <div className="flex w-[var(--bf-sidebar-double-panel)] min-w-0 flex-1 flex-col bg-[var(--bf-sidebar-solid)]">{layout==='double-tabs'?<div className="grid grid-cols-3 gap-2 border-b border-[var(--bf-sidebar-border)] p-3">{navigation.slice(0,3).map(menu=>{const Icon=iconFor(menu.icon);return <button key={menu.id} type="button" onClick={()=>setDoubleMenuId(menu.id)} className={cx('flex flex-col items-center gap-1 rounded-md border border-[var(--bf-sidebar-border)] px-2 py-2 text-[9px] transition',doubleMenuId===menu.id?'bg-[var(--bf-primary)] text-white':'text-[var(--bf-sidebar-text)] hover:text-[var(--bf-primary)]')}><Icon size={14}/>{menu.label.split(' ')[0]}</button>})}</div>:null}<div className="border-b border-[var(--bf-sidebar-border)] px-5 py-4 text-[13px] font-bold text-[var(--bf-sidebar-text)]">{activeDouble?.label||'Navigation'}</div><div className="bf-dev-scroll flex-1 overflow-y-auto px-3 py-3">{activeDouble?.children?.map(child=><ChildLink key={`${child.label}-${child.route||child.moduleKey}`} node={child} basePath={basePath} onNavigate={()=>setMobileOpen(false)}/>)}</div></div>
      </>:<>
        <div className={cx('flex h-[var(--bf-header-height)] shrink-0 items-center border-b border-[var(--bf-sidebar-border)]',visuallyExpanded||isIconText||isHoverMenu?'px-5':'justify-center px-2')}>
          <div className={cx('flex min-w-0 items-center',visuallyExpanded||isIconText||isHoverMenu?'gap-3':'justify-center')}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-[12px] font-black text-white">BF</div>{(visuallyExpanded||isIconText||isHoverMenu)&&<div className="min-w-0"><div className="truncate text-[19px] font-black tracking-[-0.03em] text-[var(--bf-sidebar-text)]">Buddy Fleets</div><div className="mt-0.5 text-[8px] font-extrabold uppercase tracking-[0.18em] text-[var(--bf-sidebar-muted)]">{demo?'Demo Portal':'Client Portal'}</div></div>}</div>
          {mobileOpen?<button type="button" onClick={()=>setMobileOpen(false)} className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-[var(--bf-sidebar-muted)] lg:hidden"><X size={16}/></button>:null}
        </div>
        {(visuallyExpanded||isIconText||isHoverMenu)?<SidebarProfile currentUser={currentUser} company={company}/>:<SidebarProfile currentUser={currentUser} company={company} compact/>}
        {demo&&visuallyExpanded?<div className="mx-2.5 mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-center text-[8px] font-black tracking-[.08em] text-amber-800">DEMO ACCOUNT • SAMPLE DATA</div>:null}
        <nav className={cx('bf-dev-scroll flex-1 overflow-y-auto px-3 py-4',isIconText||isHoverMenu?'overflow-visible':'')}>
          {isIconText?renderMenus(true,false):isHoverMenu?renderMenus(!isHoverStyleOne,false):renderMenus(visuallyExpanded,!visuallyExpanded)}
        </nav>
        {visuallyExpanded?<div className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-t border-[var(--bf-sidebar-border)] px-3 text-[8px] font-bold text-[var(--bf-sidebar-muted)]"><span>{company?.company_code||company?.companyCode||'BUDDY'}</span><span>{config.theme==='dark'?'Dark':'Light'} Theme</span></div>:null}
      </>}
    </aside>
  </>;
}

function HorizontalNavigation({ navigation, basePath, config }) {
  const location=useLocation(); const navigate=useNavigate(); const [openId,setOpenId]=useState(null); const hoverMode=config.navigationStyle==='horizontal-hover';
  useEffect(()=>setOpenId(null),[location.pathname,config.navigationStyle]);
  if(config.navigationStyle==='vertical')return null;
  return <div className="bf-dev-horizontal-menu fixed left-0 right-0 top-[var(--bf-header-height)] z-20 h-[var(--bf-horizontal-nav-height)] border-b border-[var(--bf-sidebar-border)] bg-[var(--bf-sidebar-solid)]" onMouseLeave={()=>{if(hoverMode)setOpenId(null)}}><div className="bf-dev-scroll mx-auto flex h-full max-w-[1500px] items-center gap-1 overflow-visible px-4">{navigation.map(menu=>{const Icon=iconFor(menu.icon);const active=nodeMatches(location.pathname,basePath,menu);const open=openId===menu.id;return <div key={menu.id} className="relative shrink-0" onMouseEnter={()=>hoverMode&&setOpenId(menu.id)}><button type="button" onClick={()=>{if(hoverMode&&window.matchMedia('(hover:hover)').matches)return;setOpenId(open?null:menu.id)}} className={cx('flex h-9 items-center gap-2 rounded-md px-3 text-[11px] font-medium transition hover:text-[var(--bf-primary)]',active?'text-[var(--bf-primary)]':'text-[var(--bf-sidebar-text)]')}><Icon size={15}/><span>{menu.label}</span><ChevronDown size={11} className={cx('transition-transform',open&&'rotate-180')}/></button>{open?<div className="absolute left-0 top-[calc(100%+7px)] z-[90] min-w-[250px] overflow-visible rounded-md border border-[var(--bf-border)] bg-[var(--bf-surface)] shadow-[var(--bf-shadow)]"><div className="bf-dev-scroll max-h-[calc(100dvh-120px)] overflow-y-auto py-1.5">{menu.children?.map(child=><HorizontalNode key={`${child.label}-${child.route||child.moduleKey}`} node={child} basePath={basePath} navigate={navigate} close={()=>setOpenId(null)}/>)}</div></div>:null}</div>})}</div></div>;
}

function HorizontalNode({ node, basePath, navigate, close, depth=0 }) {
  if(node.children?.length)return <div><div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-[var(--bf-text-3)]">{node.label}</div>{node.children.map(child=><HorizontalNode key={`${node.label}-${child.label}`} node={child} basePath={basePath} navigate={navigate} close={close} depth={depth+1}/>)}</div>;
  return <button type="button" onClick={()=>{if(node.route)navigate(`${basePath}/${node.route}`.replace(/\/+/g,'/'));close()}} className="flex min-h-[38px] w-full items-center gap-2 px-4 py-2.5 text-left text-[11px] text-[var(--bf-text-2)] transition hover:bg-[rgb(var(--bf-primary-rgb)/.08)] hover:text-[var(--bf-primary)]"><span className="h-[5px] w-[5px] shrink-0 rounded-full border border-current"/><span className="truncate">{node.label}</span></button>;
}

function UtilityDrawer({ open, onClose, activeTab, setActiveTab, company }) {
  return <><aside className={cx('fixed bottom-0 right-0 top-0 z-[70] w-[var(--bf-drawer-width)] border-l border-[var(--bf-border)] bg-[var(--bf-surface)] shadow-[-18px_0_40px_rgba(0,0,0,.14)] transition-transform duration-200',open?'translate-x-0':'translate-x-full')}><div className="flex h-[58px] items-center border-b border-[var(--bf-border)]">{[['recent','Recent'],['contacts','Contacts'],['settings','Settings']].map(([value,label])=><button key={value} type="button" onClick={()=>setActiveTab(value)} className={cx('relative flex h-full flex-1 items-center justify-center text-[10px] font-semibold',activeTab===value?'text-[var(--bf-primary)]':'text-[var(--bf-text-2)]')}>{label}{activeTab===value?<span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--bf-primary)]"/>:null}</button>)}<button type="button" onClick={onClose} className="mr-2 flex h-8 w-8 items-center justify-center rounded-md text-[var(--bf-text-3)] hover:bg-[var(--bf-surface-2)]"><X size={14}/></button></div><div className="bf-dev-scroll h-[calc(100dvh-58px)] overflow-y-auto">{activeTab==='recent'?<div>{['Workspace loaded','Dashboard preferences updated','Navigation permissions checked','Sample data ready','Secure session verified'].map((item,i)=><div key={item} className="flex gap-3 border-b border-[var(--bf-border)] px-4 py-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--bf-primary-rgb)/.12)] text-[var(--bf-primary)]"><Activity size={15}/></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><span className="text-[12px] font-semibold text-[var(--bf-text)]">{item}</span><span className="text-[10px] text-[var(--bf-text-3)]">{i<2?'Now':'Today'}</span></div><div className="mt-1 text-[10px] leading-4 text-[var(--bf-text-2)]">{company?.company_name||company?.companyName||'Buddy Fleets'} workspace activity.</div></div></div>)}</div>:activeTab==='contacts'?<div>{[['Fleet Operations','Operations team'],['Accounts','Finance team'],['Management','Management team']].map(([name,role])=><div key={name} className="flex items-center gap-3 border-b border-[var(--bf-border)] px-4 py-4"><UserAvatar/><div><div className="text-[12px] font-semibold text-[var(--bf-text)]">{name}</div><div className="mt-1 text-[10px] text-[var(--bf-text-3)]">{role}</div></div></div>)}</div>:<div className="p-4"><div className="text-[12px] font-bold text-[var(--bf-text)]">Quick Settings</div><p className="mt-2 text-[10px] leading-5 text-[var(--bf-text-2)]">Use the gear icon for the full Developer-style theme customizer. Utility preferences stay local to this workspace.</p></div>}</div></aside>{open?<button type="button" aria-label="Close utility drawer" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/20 lg:hidden"/>:null}</>;
}

function SettingRow({ label, selected, onClick }) { return <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-3 border-b border-[var(--bf-border)] px-4 py-3 text-left hover:bg-[rgb(var(--bf-primary-rgb)/.05)]"><span className="text-[11px] text-[var(--bf-text-2)]">{label}</span><span className={cx('relative h-[22px] w-[38px] rounded-full border border-[var(--bf-border)] transition',selected?'bg-[var(--bf-primary)]':'bg-[var(--bf-surface-3)]')}><span className={cx('absolute top-[2px] h-4 w-4 rounded-full bg-white shadow transition',selected?'left-[18px]':'left-[3px]')}/></span></button>; }
function SectionTitle({ children }) { return <div className="border-b border-[var(--bf-border)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--bf-text-3)]">{children}</div>; }
function ColorControl({ label, value, onChange }) { return <div className="border-b border-[var(--bf-border)] px-4 py-3"><div className="flex items-center justify-between gap-3"><span className="text-[11px] text-[var(--bf-text-2)]">{label}</span><input type="color" value={value} onChange={e=>onChange(e.target.value)} className="h-7 w-12 cursor-pointer rounded border border-[var(--bf-border)] bg-transparent"/></div></div>; }

function ThemeSettings({ config, updateConfig, resetConfig }) {
  const horizontal=config.navigationStyle!=='vertical';
  return <div className="pb-6"><SectionTitle>LTR and RTL Versions</SectionTitle><SettingRow label="LTR" selected={config.direction==='ltr'} onClick={()=>updateConfig({direction:'ltr'})}/><SettingRow label="RTL" selected={config.direction==='rtl'} onClick={()=>updateConfig({direction:'rtl'})}/><SectionTitle>Navigation Style</SectionTitle><SettingRow label="Vertical Menu" selected={config.navigationStyle==='vertical'} onClick={()=>updateConfig({navigationStyle:'vertical'})}/><SettingRow label="Horizontal Click Menu" selected={config.navigationStyle==='horizontal-click'} onClick={()=>updateConfig({navigationStyle:'horizontal-click'})}/><SettingRow label="Horizontal Hover Menu" selected={config.navigationStyle==='horizontal-hover'} onClick={()=>updateConfig({navigationStyle:'horizontal-hover'})}/>{horizontal?<><SectionTitle>Horizontal Layout Styles</SectionTitle><SettingRow label="Default Logo" selected={config.horizontalLogo==='default'} onClick={()=>updateConfig({horizontalLogo:'default'})}/><SettingRow label="Center Logo" selected={config.horizontalLogo==='center'} onClick={()=>updateConfig({horizontalLogo:'center'})}/></>:null}<SectionTitle>Theme Style</SectionTitle><SettingRow label="Light Theme" selected={config.theme==='light'} onClick={()=>updateConfig({theme:'light'})}/><SettingRow label="Dark Theme" selected={config.theme==='dark'} onClick={()=>updateConfig({theme:'dark'})}/><SectionTitle>Theme Colors</SectionTitle><ColorControl label="Theme Primary" value={config.primaryColor} onChange={value=>updateConfig({primaryColor:value})}/><ColorControl label="Theme Background" value={config.theme==='dark'?config.backgroundDark:config.backgroundLight} onChange={value=>updateConfig(config.theme==='dark'?{backgroundDark:value}:{backgroundLight:value})}/><div className="border-b border-[var(--bf-border)] px-4 py-4"><div className="text-[10px] font-semibold text-[var(--bf-text-3)]">Quick Primary Presets</div><div className="mt-3 grid grid-cols-7 gap-2">{PRIMARY_PRESETS.map(p=><button key={p.id} type="button" title={p.label} onClick={()=>updateConfig({primaryColor:p.value})} className={cx('relative h-7 rounded-md border border-[var(--bf-border)]',config.primaryColor===p.value&&'ring-2 ring-[var(--bf-primary)]')} style={{background:p.value}}>{config.primaryColor===p.value?<Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"/>:null}</button>)}</div></div><SectionTitle>Menu Styles</SectionTitle>{[['light','Light Menu'],['color','Color Menu'],['dark','Dark Menu'],['gradient','Gradient Menu']].map(([value,label])=><SettingRow key={value} label={label} selected={config.sidebarStyle===value} onClick={()=>updateConfig({sidebarStyle:value})}/>) }<SectionTitle>Header Styles</SectionTitle>{[['light','Light Header'],['color','Color Header'],['dark','Dark Header'],['gradient','Gradient Header']].map(([value,label])=><SettingRow key={value} label={label} selected={config.headerStyle===value} onClick={()=>updateConfig({headerStyle:value})}/>) }{!horizontal?<><SectionTitle>Sidemenu Layout Styles</SectionTitle>{[['default','Default Menu'],['closed','Closed Menu'],['icon-text','Icon with Text'],['icon-overlay','Icon Overlay'],['hover-submenu','Hover Submenu'],['hover-submenu-1','Hover Submenu style 1'],['double','Double Menu'],['double-tabs','Double Menu with Tabs']].map(([value,label])=><SettingRow key={value} label={label} selected={config.sideMenuLayout===value} onClick={()=>updateConfig({sideMenuLayout:value})}/>)}</>:null}<SectionTitle>Reset All Styles</SectionTitle><div className="px-4 py-4"><button type="button" onClick={resetConfig} className="h-10 w-full rounded-md bg-red-500 text-[11px] font-bold text-white transition hover:bg-red-600">Reset All</button></div></div>;
}

function ThemeDrawer({ open, onClose, config, updateConfig, resetConfig }) { return <><aside className={cx('fixed bottom-0 right-0 top-0 z-[72] w-[var(--bf-drawer-width)] border-l border-[var(--bf-border)] bg-[var(--bf-surface)] shadow-[-18px_0_40px_rgba(0,0,0,.14)] transition-transform duration-200',open?'translate-x-0':'translate-x-full')}><div className="flex h-[58px] items-center justify-between border-b border-[var(--bf-border)] px-4"><div className="flex items-center gap-2 text-[11px] font-bold text-[var(--bf-text)]"><Settings size={15} className="bf-dev-gear text-[var(--bf-primary)]"/>Theme Settings</div><button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--bf-text-3)] hover:bg-[var(--bf-surface-2)]"><X size={14}/></button></div><div className="bf-dev-scroll h-[calc(100dvh-58px)] overflow-y-auto"><ThemeSettings config={config} updateConfig={updateConfig} resetConfig={resetConfig}/></div></aside>{open?<button type="button" aria-label="Close theme settings" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/20 lg:hidden"/>:null}</>; }

function Header({ company, currentUser, demo, basePath, config, updateConfig, setMobileOpen, utilityDrawerOpen, setUtilityDrawerOpen, themeDrawerOpen, setThemeDrawerOpen, onLogout, navigation, canBilling }) {
  const rootRef=useRef(null); const [openPopover,setOpenPopover]=useState(null); const navigate=useNavigate();
  const [fullscreen,setFullscreen]=useState(Boolean(document.fullscreenElement));
  const displayName=currentUser?.name||currentUser?.fullName||currentUser?.full_name||'Company User';
  const handleMenuToggle=()=>{
    if(window.innerWidth<1024){ setMobileOpen(true); return; }
    if(config.navigationStyle==='vertical' && config.sideMenuLayout==='default'){
      updateConfig({sidebarLockedOpen:!config.sidebarLockedOpen});
    }
  };
  useEffect(()=>{const outside=e=>{if(rootRef.current&&!rootRef.current.contains(e.target))setOpenPopover(null)};const escape=e=>{if(e.key==='Escape')setOpenPopover(null)};document.addEventListener('mousedown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',escape)}},[]);
  useEffect(()=>{const sync=()=>setFullscreen(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',sync);return()=>document.removeEventListener('fullscreenchange',sync)},[]);
  const toggleFullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};
  const togglePopover=id=>{setThemeDrawerOpen(false);setUtilityDrawerOpen(false);setOpenPopover(v=>v===id?null:id)};
  const go=route=>{navigate(`${basePath}/${route}`.replace(/\/+/g,'/'));setOpenPopover(null)};
  const goDemoHome=()=>{navigate('/demo');setOpenPopover(null)};
  return <header className="bf-dev-header-bg fixed left-0 right-0 top-0 z-30 h-[var(--bf-header-height)] border-b border-[var(--bf-header-border)] transition-[left] duration-200 lg:left-[var(--bf-main-offset)]"><div ref={rootRef} className="relative flex h-full items-center px-4">
    <HeaderIcon label="Toggle menu" onClick={handleMenuToggle}><Menu size={19}/></HeaderIcon>
    <div className="ml-4 min-w-0 hidden md:block"><div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--bf-header-text)]"><span>{demo?'Demo Workspace':'Company Portal'}</span><ChevronDown size={12} className="text-[var(--bf-header-muted)]"/></div><div className="bf-header-muted-text mt-0.5 max-w-[220px] truncate text-[9px]">{company?.company_name||company?.companyName||'Buddy Fleets'} • {company?.company_code||company?.companyCode||''}</div></div>
    <div className="ml-4"><SessionCountdown/></div>
    <div className="ml-auto flex items-center gap-1.5">
      {demo?<HeaderIcon label="All Demo Fleets" onClick={goDemoHome}><Home size={19}/></HeaderIcon>:null}
      <SiteSelector/>
      <div className="relative"><HeaderIcon label="Search" active={openPopover==='search'} onClick={()=>togglePopover('search')}><Search size={19}/></HeaderIcon>{openPopover==='search'?<SearchPopover navigation={navigation} basePath={basePath} onNavigate={go}/>:null}</div>
      <HeaderIcon label={fullscreen?'Exit fullscreen':'Enter fullscreen'} onClick={toggleFullscreen}>{fullscreen?<Minimize2 size={19}/>:<Maximize2 size={19}/>}</HeaderIcon>
      <HeaderIcon label="Light / Dark" onClick={()=>updateConfig({theme:config.theme==='dark'?'light':'dark'})}>{config.theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</HeaderIcon>
      <HeaderIcon label="Utility panel" active={utilityDrawerOpen} onClick={()=>{setOpenPopover(null);setThemeDrawerOpen(false);setUtilityDrawerOpen(v=>!v)}}><AlignJustify size={19}/></HeaderIcon>
      <HeaderIcon label="Theme settings" active={themeDrawerOpen} onClick={()=>{setOpenPopover(null);setUtilityDrawerOpen(false);setThemeDrawerOpen(v=>!v)}}><Settings size={19} className="bf-dev-gear"/></HeaderIcon>
      <div className="relative"><HeaderIcon label="Messages" badge={3} active={openPopover==='messages'} onClick={()=>togglePopover('messages')}><Mail size={19}/></HeaderIcon>{openPopover==='messages'?<MessagesPopover company={company}/>:null}</div>
      <div className="relative"><HeaderIcon label="Notifications" badge={4} active={openPopover==='notifications'} onClick={()=>togglePopover('notifications')}><Bell size={19}/></HeaderIcon>{openPopover==='notifications'?<NotificationsPopover company={company}/>:null}</div>
      <div className="relative"><button type="button" onClick={()=>togglePopover('profile')} className="flex h-11 items-center gap-2.5 rounded-md px-2 text-[var(--bf-header-text)] transition hover:bg-black/10"><span className="hidden max-w-[145px] truncate text-[13px] font-semibold xl:block">{displayName}</span><UserAvatar currentUser={currentUser} size="sm" showStatus/><ChevronDown size={12} className="hidden text-[var(--bf-header-muted)] xl:block"/></button>{openPopover==='profile'?<ProfilePopover currentUser={currentUser} onLogout={onLogout} onClose={()=>setOpenPopover(null)} onNavigate={route=>route==='__demo_home__'?goDemoHome():go(route)} demo={demo} canBilling={canBilling}/>:null}</div>
    </div>
  </div></header>;
}

export default function ClientPortalShell({ children }) {
  const { company, currentUser, userAccess, runtimeNavigation, runtime, demo, basePath, onLogout } = useClientPortal();
  const packKey=company?.fleetPack||company?.fleet_pack||null;
  const allowedKeys=userAccess?.moduleKeys||[];
  const navigation=useMemo(()=>{if(!packKey)return[];const local=getVisibleNavigation(packKey,allowedKeys);const runtimeNodes=normalizeRuntimeNavigation(runtimeNavigation);return runtimeNodes.length&&hasDeepRuntimeNavigation(runtimeNodes)?runtimeNodes:local},[packKey,allowedKeys,runtimeNavigation]);
  const [config,setConfig]=useState(readTheme); const [mobileOpen,setMobileOpen]=useState(false); const [utilityDrawerOpen,setUtilityDrawerOpen]=useState(false); const [utilityDrawerTab,setUtilityDrawerTab]=useState(()=>readTheme().utilityDrawerTab||'recent'); const [themeDrawerOpen,setThemeDrawerOpen]=useState(false); const location=useLocation();
  const updateConfig=useCallback(patch=>{setConfig(current=>{const requested=typeof patch==='function'?patch(current):patch;const next={...current,...requested};if(Object.prototype.hasOwnProperty.call(requested,'theme')&&requested.theme!==current.theme){next.sidebarStyle=requested.theme==='dark'?'dark':'light';next.headerStyle=current.headerStyle}return next})},[]);
  const resetConfig=useCallback(()=>{setConfig({...THEME_DEFAULTS});setUtilityDrawerTab(THEME_DEFAULTS.utilityDrawerTab)},[]);
  useEffect(()=>{writeTheme({...config,utilityDrawerTab})},[config,utilityDrawerTab]);
  useEffect(()=>{document.documentElement.dir=config.direction;document.documentElement.dataset.bfTheme=config.theme},[config.direction,config.theme]);
  const vars=useMemo(()=>buildVars({config}),[config]);
  const horizontal=config.navigationStyle!=='vertical';
  return <><PortalGlobalStyle/><div className="bf-dev-shell bf-client-shell-root min-h-screen min-h-[100dvh] font-sans" style={vars} dir={config.direction}>
    <Sidebar navigation={navigation} basePath={basePath} company={company} currentUser={currentUser} demo={demo} config={config} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} updateConfig={updateConfig}/>
    <HorizontalNavigation navigation={navigation} basePath={basePath} config={config}/>
    <UtilityDrawer open={utilityDrawerOpen} onClose={()=>setUtilityDrawerOpen(false)} activeTab={utilityDrawerTab} setActiveTab={setUtilityDrawerTab} company={company}/>
    <ThemeDrawer open={themeDrawerOpen} onClose={()=>setThemeDrawerOpen(false)} config={config} updateConfig={updateConfig} resetConfig={resetConfig}/>
    <main className={cx('min-h-[100dvh] transition-[padding-left,padding-top] duration-200 lg:pl-[var(--bf-main-offset)]',horizontal?'pt-[calc(var(--bf-header-height)+var(--bf-horizontal-nav-height))]':'pt-[var(--bf-header-height)]')}>
      <div className="flex min-h-[calc(100dvh-var(--bf-header-height))] flex-col bg-[var(--bf-page)]"><div className="min-w-0 flex-1"><Header company={company} currentUser={currentUser} demo={demo} basePath={basePath} config={config} updateConfig={updateConfig} setMobileOpen={setMobileOpen} utilityDrawerOpen={utilityDrawerOpen} setUtilityDrawerOpen={setUtilityDrawerOpen} themeDrawerOpen={themeDrawerOpen} setThemeDrawerOpen={setThemeDrawerOpen} onLogout={onLogout} navigation={navigation} canBilling={allowedKeys.includes('subscription')||userAccess?.isAdmin===true}/><main className="bf-portal-content">{runtime?.lifecycleAccess==='read_only'?<div className="bf-client-lifecycle-banner"><ShieldCheck size={14}/><div><strong>Read-only access</strong><span>This company lifecycle currently allows viewing, printing and exporting only. Create/edit/delete actions are disabled by the server.</span></div></div>:null}{children}</main></div><PortalFooter/></div>
    </main>
  </div></>;
}
