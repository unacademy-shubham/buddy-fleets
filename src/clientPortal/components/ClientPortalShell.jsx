import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlignJustify,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Mail,
  Maximize2,
  Menu,
  MessageCircle,
  Minimize2,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  User,
  X,
} from 'lucide-react';
import SiteSelector from './SiteSelector';
import PortalFooter from './PortalFooter';
import { useClientPortal } from '../ClientPortalContext';
import { getVisibleNavigation, iconFor } from '../config/portalNavigation';

/* ============================================================
   BUDDY FLEETS CLIENT / DEMO PORTAL SHELL

   Visual source of truth:
   Developer CPanel shell.

   Important:
   - Only shell geometry, theme tokens and shell behaviour are shared.
   - Client/demo page content and navigation remain data-driven.
   - No Developer page/menu content is used here.
============================================================ */

const STORAGE_KEY = 'bf_portal_theme_config_v4';
const SESSION_TIMEOUT_FALLBACK_MS = 60 * 60 * 1000;
const HEADER_H = 66;
const SIDEBAR_W = 250;
const SIDEBAR_COLLAPSED_W = 72;
const SIDEBAR_ICON_TEXT_W = 110;
const SIDEBAR_DOUBLE_RAIL_W = 80;
const SIDEBAR_DOUBLE_PANEL_W = 280;
const HORIZONTAL_NAV_H = 52;
const RIGHT_DRAWER_W = 302;

const DEFAULT_THEME = {
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
};

const PRIMARY_PRESETS = [
  ['Indigo', '#5551D7'],
  ['Buddy Blue', '#1689E5'],
  ['Violet', '#7C3AED'],
  ['Cyan', '#0891B2'],
  ['Emerald', '#059669'],
  ['Orange', '#EA580C'],
  ['Rose', '#E11D48'],
];

const DRAWER_ACTIVITY = [
  ['Workspace loaded', 'The current fleet workspace is ready.'],
  ['Navigation synced', 'Your authorized modules are available.'],
  ['Session verified', 'Your authenticated portal session is active.'],
  ['Site access checked', 'Authorized site access has been refreshed.'],
];

const DRAWER_CONTACTS = [
  ['Company Owner', 'Workspace administrator', 'CO'],
  ['Operations', 'Fleet operations', 'OP'],
  ['Accounts', 'Finance & billing', 'AC'],
  ['Support', 'Buddy Fleets support', 'SU'],
];

function cx(...values) {
  return values.filter(Boolean).join(' ');
}

function initials(value) {
  const parts = String(value || 'BF').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'BF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function clampRgb(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(255, Math.round(number)));
}

function hexToRgb(hex) {
  const clean = String(hex || '').trim().replace('#', '');
  if (clean.length !== 6) return { r: 85, g: 81, b: 215 };
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => clampRgb(value).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

function darken(hex, amount = 0.13) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function lighten(hex, amount = 0.84) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

function readTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_THEME };
    return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

function writeTheme(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Theme persistence is non-critical.
  }
}

function buildVars(config) {
  const dark = config.theme === 'dark';
  const primary = config.primaryColor || DEFAULT_THEME.primaryColor;
  const primaryStrong = darken(primary, 0.13);
  const primarySoft = lighten(primary, 0.84);
  const rgb = hexToRgb(primary);

  const darkSurface = '#1B2433';
  const darkSurface2 = '#162131';
  const darkSurface3 = '#253247';
  const lightSurface = '#FFFFFF';
  const lightSurface2 = '#F8F9FC';
  const lightSurface3 = '#EEF1F6';

  const page = dark ? (config.backgroundDark || '#0E1929') : (config.backgroundLight || '#ECECF3');
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
    sidebarBg = '#FFFFFF';
    sidebarSolid = '#FFFFFF';
    sidebarText = '#61708A';
    sidebarMuted = '#97A3B5';
    sidebarBorder = '#ECEEF3';
  }

  if (config.sidebarStyle === 'dark') {
    sidebarBg = darkSurface;
    sidebarSolid = darkSurface;
    sidebarText = '#EEF3F8';
    sidebarMuted = '#8B9AAF';
    sidebarBorder = '#313B4B';
  }

  if (config.sidebarStyle === 'color') {
    sidebarBg = primary;
    sidebarSolid = primaryStrong;
    sidebarText = '#FFFFFF';
    sidebarMuted = 'rgba(255,255,255,.72)';
    sidebarBorder = 'rgba(255,255,255,.16)';
  }

  if (config.sidebarStyle === 'gradient') {
    sidebarBg = `linear-gradient(180deg, ${primary} 0%, ${primaryStrong} 56%, ${darkSurface} 100%)`;
    sidebarSolid = primaryStrong;
    sidebarText = '#FFFFFF';
    sidebarMuted = 'rgba(255,255,255,.72)';
    sidebarBorder = 'rgba(255,255,255,.15)';
  }

  let headerBg = primary;
  let headerText = '#FFFFFF';
  let headerMuted = 'rgba(255,255,255,.82)';
  let headerBorder = 'rgba(255,255,255,.14)';

  if (config.headerStyle === 'light') {
    headerBg = '#FFFFFF';
    headerText = '#2B3544';
    headerMuted = '#69778B';
    headerBorder = '#E7EAF0';
  }

  if (config.headerStyle === 'dark') {
    headerBg = darkSurface;
    headerText = '#FFFFFF';
    headerMuted = '#ACB8C8';
    headerBorder = '#313B4B';
  }

  if (config.headerStyle === 'color') {
    headerBg = primary;
    headerText = '#FFFFFF';
    headerMuted = 'rgba(255,255,255,.82)';
    headerBorder = 'rgba(255,255,255,.14)';
  }

  if (config.headerStyle === 'gradient') {
    headerBg = `linear-gradient(90deg, ${primary} 0%, ${primaryStrong} 100%)`;
    headerText = '#FFFFFF';
    headerMuted = 'rgba(255,255,255,.82)';
    headerBorder = 'rgba(255,255,255,.14)';
  }

  const shadow = dark ? '0 3px 16px rgba(0,0,0,.22)' : '0 3px 16px rgba(15,23,42,.08)';

  return {
    '--bf-primary': primary,
    '--bf-primary-2': primaryStrong,
    '--bf-primary-strong': primaryStrong,
    '--bf-primary-soft': primarySoft,
    '--bf-primary-rgb': `${rgb.r} ${rgb.g} ${rgb.b}`,
    '--bf-bg': page,
    '--bf-page': page,
    '--bf-card': surface,
    '--bf-surface': surface,
    '--bf-surface-2': surface2,
    '--bf-surface-3': surface3,
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
    '--bf-shadow': shadow,
    '--bf-sidebar-width': `${SIDEBAR_W}px`,
    '--bf-sidebar-collapsed': `${SIDEBAR_COLLAPSED_W}px`,
    '--bf-header-height': `${HEADER_H}px`,
    '--bf-drawer-width': `${RIGHT_DRAWER_W}px`,
    '--bf-horizontal-nav-height': `${HORIZONTAL_NAV_H}px`,
    '--bf-sidebar-icon-text': `${SIDEBAR_ICON_TEXT_W}px`,
    '--bf-sidebar-double-rail': `${SIDEBAR_DOUBLE_RAIL_W}px`,
    '--bf-sidebar-double-panel': `${SIDEBAR_DOUBLE_PANEL_W}px`,
    '--bf-dev-primary': primary,
    '--bf-dev-primary-strong': primaryStrong,
    '--bf-dev-primary-soft': primarySoft,
    '--bf-dev-primary-rgb': `${rgb.r} ${rgb.g} ${rgb.b}`,
    '--bf-dev-page-bg': page,
    '--bf-dev-surface': surface,
    '--bf-dev-surface-2': surface2,
    '--bf-dev-surface-3': surface3,
    '--bf-dev-text': text,
    '--bf-dev-text-2': text2,
    '--bf-dev-text-3': text3,
    '--bf-dev-border': border,
    '--bf-dev-border-soft': dark ? '#283446' : '#EEF0F5',
    '--bf-dev-radius': '4px',
    '--bf-dev-card-radius': '5px',
    '--bf-dev-shadow': shadow,
  };
}

function getSidebarOffset(config) {
  if (config.navigationStyle === 'vertical') {
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
  return 0;
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
  const children = (Array.isArray(node.children) ? node.children : [])
    .map((child, childIndex) => normalizeRuntimeNode(child, childIndex))
    .filter(Boolean);
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
  return (nodes || []).some((node) =>
    ['submenu', 'level3'].includes(node.nodeType) ||
    (depth >= 1 && (node.children || []).length > 0) ||
    hasDeepRuntimeNavigation(node.children || [], depth + 1),
  );
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

function SessionCountdown() {
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + SESSION_TIMEOUT_FALLBACK_MS);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && data?.ok && data?.session?.expiresAt) {
          setExpiresAt(new Date(data.session.expiresAt).getTime());
        }
      } catch {
        // Keep the local display fallback when the session endpoint is temporarily unavailable.
      }
    };
    sync();
    const poll = window.setInterval(sync, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
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
  return (
    <div className="bf-client-session">
      <div className="bf-client-session-label">Session</div>
      <div className="bf-client-session-value">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div>
    </div>
  );
}

function UserAvatar({ currentUser, size = 'md', showStatus = false }) {
  const name = currentUser?.name || currentUser?.fullName || currentUser?.full_name || 'Company User';
  const avatarUrl = currentUser?.avatar_url || currentUser?.avatarUrl || currentUser?.photoURL || currentUser?.photoUrl || currentUser?.photo_url || currentUser?.image || null;
  const sizeClass = size === 'lg' ? 'large' : size === 'sm' ? 'small' : 'medium';
  return (
    <div className={cx('bf-client-user-avatar', sizeClass)}>
      {avatarUrl ? <img src={avatarUrl} alt={name} /> : <span>{initials(name)}</span>}
      {showStatus ? <span className="bf-client-online-dot" /> : null}
    </div>
  );
}

function CompactMenuButton({ menu, active, showLabel, onClick, onMouseEnter, onMouseLeave }) {
  const Icon = iconFor(menu.icon);
  return (
    <button
      type="button"
      title={showLabel ? undefined : menu.label}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cx('bf-client-sidebar-compact-button', active && 'active', showLabel && 'with-label')}
    >
      <Icon size={17} />
      {showLabel ? <span>{menu.label}</span> : null}
    </button>
  );
}

function NestedNavNode({ node, basePath, depth = 0, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const active = nodeMatches(location.pathname, basePath, node);
  const [expanded, setExpanded] = useState(active);

  useEffect(() => {
    if (active) setExpanded(true);
  }, [active, location.pathname]);

  const go = () => {
    if (hasChildren) {
      setExpanded((value) => !value);
      return;
    }
    if (node.route) {
      navigate(`${basePath}/${node.route}`.replace(/\/+/g, '/'));
      onNavigate?.();
    }
  };

  return (
    <div className="bf-client-nav-node">
      <button
        type="button"
        onClick={go}
        className={cx('bf-client-nav-row', active && 'active', depth > 0 && 'child')}
        style={{ paddingLeft: `${38 + depth * 16}px` }}
      >
        <span className="bf-client-nav-bullet" style={{ left: `${18 + depth * 16}px` }} />
        <span className="bf-client-nav-label">{node.label}</span>
        {hasChildren ? <ChevronDown size={12} className={cx('bf-client-nav-chevron', expanded && 'rotate')} /> : null}
      </button>
      {hasChildren && expanded ? (
        <div className="bf-client-nav-children">
          {node.children.map((child) => (
            <NestedNavNode key={`${child.label}-${child.route || depth}`} node={child} basePath={basePath} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FlyoutNode({ node, basePath, depth = 0, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const active = nodeMatches(location.pathname, basePath, node);
  const [expanded, setExpanded] = useState(active);

  useEffect(() => {
    if (active) setExpanded(true);
  }, [active, location.pathname]);

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={cx('bf-client-flyout-row', active && 'active')}
          style={{ paddingLeft: `${16 + depth * 16}px` }}
        >
          <span className="bf-client-flyout-bullet" />
          <span>{node.label}</span>
          <ChevronDown size={12} className={cx(expanded && 'rotate')} />
        </button>
        {expanded ? (
          <div className="bf-client-flyout-nested">
            {node.children.map((child) => (
              <FlyoutNode key={`${child.label}-${child.route || depth}`} node={child} basePath={basePath} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  const url = `${basePath}/${node.route}`.replace(/\/+/g, '/');
  return (
    <button
      type="button"
      onClick={() => {
        navigate(url);
        onNavigate?.();
      }}
      className={cx('bf-client-flyout-row', active && 'active')}
      style={{ paddingLeft: `${16 + depth * 16}px` }}
    >
      <span className="bf-client-flyout-bullet" />
      <span>{node.label}</span>
    </button>
  );
}

function SidebarFlyout({ menu, visible, basePath, onNavigate }) {
  if (!visible || !menu) return null;
  return (
    <div className="bf-client-sidebar-flyout">
      <div className="bf-client-sidebar-flyout-title">{menu.label}</div>
      <div className="bf-client-sidebar-flyout-body">
        {(menu.children || []).map((child) => (
          <FlyoutNode key={`${child.label}-${child.route || 'group'}`} node={child} basePath={basePath} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function Sidebar({ navigation, basePath, company, currentUser, demo, mobileOpen, onCloseMobile, config, onToggleLock }) {
  const location = useLocation();
  const activeCategory = navigation.find((menu) => nodeMatches(location.pathname, basePath, menu))?.id || navigation[0]?.id || '';
  const [openMenuId, setOpenMenuId] = useState(activeCategory);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [flyoutMenuId, setFlyoutMenuId] = useState(null);
  const [doubleMenuId, setDoubleMenuId] = useState(activeCategory);

  useEffect(() => {
    if (activeCategory) {
      setOpenMenuId(activeCategory);
      setDoubleMenuId(activeCategory);
    }
  }, [activeCategory]);

  useEffect(() => {
    setFlyoutMenuId(null);
  }, [location.pathname]);

  const layout = config.sideMenuLayout;
  const isDefault = layout === 'default';
  const isIconOverlay = layout === 'icon-overlay';
  const isIconText = layout === 'icon-text';
  const isHoverMenu = layout === 'hover-submenu' || layout === 'hover-submenu-1';
  const isHoverStyleOne = layout === 'hover-submenu-1';
  const isDouble = layout === 'double' || layout === 'double-tabs';
  const lockedOpen = isDefault ? config.sidebarLockedOpen : false;
  const visuallyExpanded = isDefault ? (lockedOpen || hoverExpanded) : isIconOverlay ? hoverExpanded : false;

  if (config.navigationStyle !== 'vertical' || layout === 'closed') return null;

  const widthClass = isDouble
    ? 'double'
    : isIconText || (isHoverMenu && !isHoverStyleOne)
      ? 'icon-text'
      : visuallyExpanded
        ? 'expanded'
        : 'collapsed';

  const activeDoubleMenu = navigation.find((menu) => menu.id === doubleMenuId) || navigation[0];

  return (
    <>
      {mobileOpen ? <button type="button" aria-label="Close sidebar" className="bf-client-mobile-backdrop" onClick={onCloseMobile} /> : null}
      <aside
        className={cx('bf-client-sidebar', `layout-${widthClass}`, mobileOpen && 'mobile-open')}
        onMouseEnter={() => {
          if ((isDefault || isIconOverlay) && !lockedOpen) setHoverExpanded(true);
        }}
        onMouseLeave={() => {
          if ((isDefault || isIconOverlay) && !lockedOpen) setHoverExpanded(false);
          if (isHoverMenu) setFlyoutMenuId(null);
        }}
      >
        {isDouble ? (
          <>
            <div className="bf-client-double-rail">
              <div className="bf-client-sidebar-brand compact-brand">
                <div className="bf-client-brand-mark">BF</div>
              </div>
              <div className="bf-client-profile-card compact">
                <UserAvatar currentUser={currentUser} size="md" showStatus />
              </div>
              <div className="bf-client-double-rail-scroll">
                {navigation.map((menu) => (
                  <CompactMenuButton
                    key={menu.id}
                    menu={menu}
                    active={doubleMenuId === menu.id}
                    showLabel={false}
                    onClick={() => setDoubleMenuId(menu.id)}
                  />
                ))}
              </div>
            </div>
            <div className="bf-client-double-panel">
              {layout === 'double-tabs' ? (
                <div className="bf-client-double-tabs">
                  {navigation.slice(0, 3).map((menu) => {
                    const Icon = iconFor(menu.icon);
                    return (
                      <button
                        type="button"
                        key={menu.id}
                        className={cx(doubleMenuId === menu.id && 'active')}
                        onClick={() => setDoubleMenuId(menu.id)}
                      >
                        <Icon size={14} />
                        <span>{menu.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
              <div className="bf-client-double-title">{activeDoubleMenu?.label || 'Navigation'}</div>
              <div className="bf-client-double-scroll">
                {(activeDoubleMenu?.children || []).map((child) => (
                  <NestedNavNode key={`${child.label}-${child.route || 'group'}`} node={child} basePath={basePath} onNavigate={onCloseMobile} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bf-client-sidebar-column">
            <div className={cx('bf-client-sidebar-brand', !visuallyExpanded && !isIconText && !isHoverMenu && 'compact-brand')}>
              <div className="bf-client-brand-mark">BF</div>
              {visuallyExpanded || isIconText || (isHoverMenu && !isHoverStyleOne) ? (
                <div className="bf-client-brand-copy">
                  <strong>Buddy Fleets</strong>
                  <small>{demo ? 'Demo Portal' : 'Client Portal'}</small>
                </div>
              ) : null}
              {isDefault && visuallyExpanded ? (
                <button type="button" className="bf-client-side-toggle" onClick={onToggleLock} title="Collapse menu">
                  <ChevronLeft size={15} />
                </button>
              ) : null}
            </div>

            {isDefault && visuallyExpanded ? (
              <div className="bf-client-profile-card">
                <UserAvatar currentUser={currentUser} size="lg" showStatus />
                <div className="bf-client-profile-copy">
                  <strong>{currentUser?.name || currentUser?.full_name || currentUser?.fullName || 'Company User'}</strong>
                  <span>{currentUser?.roleName || currentUser?.role || 'Company User'}</span>
                  <small>{company?.company_name || company?.companyName || 'Buddy Fleets'}</small>
                </div>
              </div>
            ) : (
              <div className="bf-client-profile-card compact">
                <UserAvatar currentUser={currentUser} size="md" showStatus />
              </div>
            )}

            {demo && visuallyExpanded ? <div className="bf-client-demo-chip">DEMO ACCOUNT • SAMPLE DATA</div> : null}

            <nav className={cx('bf-client-sidebar-scroll', (isIconText || isHoverMenu) && 'flyout-host')}>
              {isIconText ? (
                <div className="bf-client-compact-menu-list">
                  {navigation.map((menu) => (
                    <div className="bf-client-sidebar-flyout-host" key={menu.id}>
                      <CompactMenuButton
                        menu={menu}
                        active={nodeMatches(location.pathname, basePath, menu)}
                        showLabel
                        onClick={() => setFlyoutMenuId(flyoutMenuId === menu.id ? null : menu.id)}
                      />
                      <SidebarFlyout menu={menu} visible={flyoutMenuId === menu.id} basePath={basePath} onNavigate={onCloseMobile} />
                    </div>
                  ))}
                </div>
              ) : isHoverMenu ? (
                <div className="bf-client-compact-menu-list">
                  {navigation.map((menu) => (
                    <div
                      className="bf-client-sidebar-flyout-host"
                      key={menu.id}
                      onMouseEnter={() => setFlyoutMenuId(menu.id)}
                    >
                      <CompactMenuButton
                        menu={menu}
                        active={nodeMatches(location.pathname, basePath, menu)}
                        showLabel={!isHoverStyleOne}
                      />
                      <SidebarFlyout menu={menu} visible={flyoutMenuId === menu.id} basePath={basePath} onNavigate={onCloseMobile} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bf-client-default-menu-list">
                  {navigation.map((menu) => {
                    const active = nodeMatches(location.pathname, basePath, menu);
                    const expanded = openMenuId === menu.id;
                    const compact = !visuallyExpanded;
                    return (
                      <div key={menu.id}>
                        <button
                          type="button"
                          title={compact ? menu.label : undefined}
                          aria-expanded={expanded}
                          className={cx('bf-client-sidebar-parent', active && 'active', compact && 'compact')}
                          onClick={() => {
                            if (compact) return;
                            setOpenMenuId((current) => (current === menu.id ? null : menu.id));
                          }}
                        >
                          {(() => {
                            const Icon = iconFor(menu.icon);
                            return <span className="bf-client-sidebar-parent-icon"><Icon size={17} /></span>;
                          })()}
                          {visuallyExpanded ? (
                            <>
                              <span className="bf-client-sidebar-parent-label">{menu.label}</span>
                              <ChevronDown size={13} className={cx(expanded && 'rotate')} />
                            </>
                          ) : null}
                        </button>
                        {visuallyExpanded && expanded ? (
                          <div className="bf-client-sidebar-children">
                            {(menu.children || []).map((child) => (
                              <NestedNavNode key={`${child.label}-${child.route || 'group'}`} node={child} basePath={basePath} onNavigate={onCloseMobile} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </nav>

            {visuallyExpanded ? (
              <div className="bf-client-sidebar-foot">
                <span>{company?.company_code || company?.companyCode || 'BUDDY'}</span>
                <span>{config.theme === 'dark' ? 'Dark' : 'Light'} Theme</span>
              </div>
            ) : null}
          </div>
        )}
      </aside>
    </>
  );
}

function HorizontalFlyoutNode({ node, basePath, closeAll, hoverMode, depth = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const active = nodeMatches(location.pathname, basePath, node);
  const [nestedOpen, setNestedOpen] = useState(active);

  useEffect(() => {
    setNestedOpen(active);
  }, [active, location.pathname]);

  return (
    <div
      className="bf-client-horizontal-node"
      onMouseEnter={() => {
        if (hoverMode && hasChildren) setNestedOpen(true);
      }}
      onMouseLeave={() => {
        if (hoverMode && hasChildren && !active) setNestedOpen(false);
      }}
    >
      {hasChildren ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (hoverMode && window.matchMedia('(hover: hover)').matches) return;
            setNestedOpen((value) => !value);
          }}
          className={cx('bf-client-horizontal-link', active && 'active')}
        >
          <span className="bf-client-flyout-bullet" />
          <span>{node.label}</span>
          <ChevronRight size={13} />
        </button>
      ) : (
        <button
          type="button"
          className={cx('bf-client-horizontal-link', active && 'active')}
          onClick={() => {
            navigate(`${basePath}/${node.route}`.replace(/\/+/g, '/'));
            closeAll();
          }}
        >
          <span className="bf-client-flyout-bullet" />
          <span>{node.label}</span>
        </button>
      )}
      {hasChildren && nestedOpen ? (
        <div className="bf-client-horizontal-nested">
          <div className="bf-client-horizontal-nested-title">{node.label}</div>
          {(node.children || []).map((child) => (
            <HorizontalFlyoutNode key={`${child.label}-${child.route || depth}`} node={child} basePath={basePath} closeAll={closeAll} hoverMode={hoverMode} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HorizontalNav({ navigation, basePath, mode }) {
  const location = useLocation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const hoverMode = mode === 'horizontal-hover';

  useEffect(() => {
    setOpenMenuId(null);
  }, [location.pathname, mode]);

  return (
    <div
      className="bf-client-horizontal-nav"
      onMouseLeave={() => {
        if (hoverMode) setOpenMenuId(null);
      }}
    >
      <div className="bf-client-horizontal-inner">
        {navigation.map((menu) => {
          const Icon = iconFor(menu.icon);
          const active = nodeMatches(location.pathname, basePath, menu);
          const open = openMenuId === menu.id;
          return (
            <div
              className="bf-client-horizontal-item"
              key={menu.id}
              onMouseEnter={() => {
                if (hoverMode) setOpenMenuId(menu.id);
              }}
            >
              <button
                type="button"
                className={cx('bf-client-horizontal-button', active && 'active')}
                onClick={() => {
                  if (hoverMode && window.matchMedia('(hover: hover)').matches) return;
                  setOpenMenuId((current) => (current === menu.id ? null : menu.id));
                }}
              >
                <Icon size={15} />
                <span>{menu.label}</span>
                <ChevronDown size={11} className={cx(open && 'rotate')} />
              </button>
              {open ? (
                <div className="bf-client-horizontal-menu">
                  {(menu.children || []).map((child) => (
                    <HorizontalFlyoutNode key={`${child.label}-${child.route || 'group'}`} node={child} basePath={basePath} closeAll={() => setOpenMenuId(null)} hoverMode={hoverMode} />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeaderIcon({ label, children, onClick, badge, active }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx('bf-client-header-icon', active && 'active')}
    >
      {children}
      {badge != null ? <span className="bf-client-header-badge">{badge}</span> : null}
    </button>
  );
}

function Popover({ children, width = 315, align = 'right' }) {
  return (
    <div className={cx('bf-client-dev-pop', align === 'left' ? 'left' : 'right')} style={{ width, maxWidth: 'calc(100vw - 24px)' }}>
      <span className="bf-client-dev-pop-arrow" />
      <div className="bf-client-dev-pop-surface">{children}</div>
    </div>
  );
}

function SearchPopover({ navigation, basePath }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const flat = useMemo(() => flattenTreeNavigation(navigation), [navigation]);
  const results = query.trim() ? flat.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 7) : [];

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Popover width={315}>
      <form className="bf-client-dev-search-form" onSubmit={(event) => event.preventDefault()}>
        <div className="bf-client-dev-search-input">
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search....." />
          <button type="submit" aria-label="Search"><Search size={18} /></button>
        </div>
      </form>
      {results.length ? (
        <div className="bf-client-dev-search-results">
          {results.map((item) => (
            <button
              type="button"
              key={`${item.route}-${item.label}`}
              onClick={() => {
                navigate(`${basePath}/${item.route}`.replace(/\/+/g, '/'));
                setQuery('');
              }}
            >
              <span>{item.label}</span>
              <small>{item.trail.slice(0, -1).join(' / ')}</small>
            </button>
          ))}
        </div>
      ) : query ? <div className="bf-client-dev-search-empty">No module found</div> : null}
    </Popover>
  );
}

function MessagesPopover() {
  return (
    <Popover width={315}>
      <div className="bf-client-dev-pop-head">Messages</div>
      <div className="bf-client-dev-pop-list">
        <div className="bf-client-dev-pop-row">
          <div className="bf-client-dev-pop-avatar">OP</div>
          <div><strong>Workspace message</strong><span>Operational messages and announcements appear here.</span></div>
        </div>
        <div className="bf-client-dev-pop-row">
          <div className="bf-client-dev-pop-avatar">BF</div>
          <div><strong>Portal support</strong><span>Support and service updates will appear here.</span></div>
        </div>
      </div>
      <div className="bf-client-dev-pop-footer"><button type="button">View All</button></div>
    </Popover>
  );
}

function NotificationsPopover() {
  return (
    <Popover width={360}>
      <div className="bf-client-dev-pop-head with-action"><span>Notifications</span><button type="button">Mark all as read</button></div>
      <div className="bf-client-dev-pop-list scroll">
        {[
          ['Workspace ready', 'Authorized fleet modules are loaded.', ShieldCheck],
          ['Site access verified', 'Your current site permissions are active.', Home],
          ['Session active', 'Secure portal session remains verified.', ShieldCheck],
        ].map(([title, meta, Icon]) => (
          <div className="bf-client-dev-pop-row" key={title}>
            <div className="bf-client-dev-pop-icon"><Icon size={16} /></div>
            <div><strong>{title}</strong><span>{meta}</span></div>
          </div>
        ))}
      </div>
      <div className="bf-client-dev-pop-footer"><button type="button">View All</button></div>
    </Popover>
  );
}

function ProfilePopover({ currentUser, onLogout, onClose, demo, basePath, canBilling }) {
  const navigate = useNavigate();
  const name = currentUser?.name || currentUser?.full_name || currentUser?.fullName || 'Company User';
  const email = currentUser?.email || '';
  const go = (route) => {
    navigate(`${basePath}/${route}`.replace(/\/+/g, '/'));
    onClose?.();
  };
  return (
    <Popover width={250}>
      <div className="bf-client-dev-profile-head">
        <UserAvatar currentUser={currentUser} size="sm" />
        <div>
          <strong>{name}</strong>
          <small>{email}</small>
        </div>
      </div>
      <div className="bf-client-dev-profile-links">
        <button type="button" onClick={() => go('profile-security')}><User size={15} />My Profile</button>
        {canBilling ? <button type="button" onClick={() => go('subscription')}><ShieldCheck size={15} />Subscription & Billing</button> : null}
        <button type="button" onClick={() => go('settings')}><Settings size={15} />Company Settings</button>
        {demo ? <button type="button" onClick={() => { navigate('/demo'); onClose?.(); }}><Home size={15} />All Demo Fleets</button> : null}
      </div>
      <div className="bf-client-dev-profile-sep" />
      <button type="button" className="danger" onClick={onLogout}><LogOut size={15} />{demo ? 'Logout Demo Account' : 'Logout'}</button>
    </Popover>
  );
}

function UtilityRecentTab() {
  return (
    <div>
      {DRAWER_ACTIVITY.map(([title, text], index) => (
        <div className="bf-client-utility-row" key={title}>
          <div className="bf-client-utility-avatar">{index === 0 ? 'WS' : 'BF'}</div>
          <div className="bf-client-utility-copy"><strong>{title}</strong><span>{text}</span></div>
        </div>
      ))}
      <div className="bf-client-utility-action"><button type="button">View more</button></div>
    </div>
  );
}

function UtilityContactsTab() {
  return (
    <div>
      {DRAWER_CONTACTS.map(([name, meta, code], index) => (
        <div className="bf-client-utility-row" key={name}>
          <div className="bf-client-utility-avatar">{code}</div>
          <div className="bf-client-utility-copy"><strong>{name}</strong><span className={index === 0 ? 'online' : ''}>{meta}</span></div>
          <MessageCircle size={14} />
        </div>
      ))}
    </div>
  );
}

function Switch({ value, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={cx('bf-client-switch', value && 'on')}>
      <span />
    </button>
  );
}

function UtilitySettingsTab() {
  const [state, setState] = useState({ notifications: true, status: true, recent: true, updates: true });
  const rows = [
    ['Notifications', 'notifications'],
    ['Show your status', 'status'],
    ['Recent activity', 'recent'],
    ['Keep up to date', 'updates'],
  ];
  return (
    <div>
      <div className="bf-client-utility-section-title">General Settings</div>
      <div className="bf-client-utility-settings">
        {rows.map(([label, key]) => (
          <div className="bf-client-utility-setting" key={key}><span>{label}</span><Switch label={label} value={state[key]} onChange={(value) => setState((current) => ({ ...current, [key]: value }))} /></div>
        ))}
      </div>
    </div>
  );
}

function UtilityDrawer({ open, onClose, activeTab, setActiveTab }) {
  return (
    <>
      {open ? <button type="button" aria-label="Close utility drawer" className="bf-client-drawer-backdrop utility" onClick={onClose} /> : null}
      <aside className={cx('bf-client-utility-drawer', open && 'open')}>
        <div className="bf-client-utility-head">
          {['recent', 'contacts', 'settings'].map((tab) => (
            <button type="button" key={tab} className={cx(activeTab === tab && 'active')} onClick={() => setActiveTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}</button>
          ))}
          <button type="button" className="close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="bf-client-utility-body">
          {activeTab === 'recent' ? <UtilityRecentTab /> : null}
          {activeTab === 'contacts' ? <UtilityContactsTab /> : null}
          {activeTab === 'settings' ? <UtilitySettingsTab /> : null}
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ children }) {
  return <div className="bf-client-theme-section-title">{children}</div>;
}

function SettingRow({ label, selected, onClick }) {
  return (
    <div className="bf-client-theme-setting-row">
      <span>{label}</span>
      <Switch label={label} value={selected} onChange={() => onClick()} />
    </div>
  );
}

function ThemeSettings({ config, updateConfig, resetConfig }) {
  const horizontal = config.navigationStyle !== 'vertical';
  const set = (patch) => updateConfig(patch);
  return (
    <div className="bf-client-theme-settings">
      <SectionTitle>LTR and RTL Versions</SectionTitle>
      <SettingRow label="LTR" selected={config.direction === 'ltr'} onClick={() => set({ direction: 'ltr' })} />
      <SettingRow label="RTL" selected={config.direction === 'rtl'} onClick={() => set({ direction: 'rtl' })} />

      <SectionTitle>Navigation Style</SectionTitle>
      <SettingRow label="Vertical Menu" selected={config.navigationStyle === 'vertical'} onClick={() => set({ navigationStyle: 'vertical' })} />
      <SettingRow label="Horizontal Click Menu" selected={config.navigationStyle === 'horizontal-click'} onClick={() => set({ navigationStyle: 'horizontal-click' })} />
      <SettingRow label="Horizontal Hover Menu" selected={config.navigationStyle === 'horizontal-hover'} onClick={() => set({ navigationStyle: 'horizontal-hover' })} />

      {horizontal ? (
        <>
          <SectionTitle>Horizontal Layout Styles</SectionTitle>
          <SettingRow label="Default Logo" selected={config.horizontalLogo === 'default'} onClick={() => set({ horizontalLogo: 'default' })} />
          <SettingRow label="Center Logo" selected={config.horizontalLogo === 'center'} onClick={() => set({ horizontalLogo: 'center' })} />
        </>
      ) : null}

      <SectionTitle>Theme Style</SectionTitle>
      <SettingRow label="Light Theme" selected={config.theme === 'light'} onClick={() => set({ theme: 'light' })} />
      <SettingRow label="Dark Theme" selected={config.theme === 'dark'} onClick={() => set({ theme: 'dark' })} />

      <SectionTitle>Theme Colors</SectionTitle>
      <div className="bf-client-theme-color-row">
        <span>Theme Primary</span>
        <input type="color" value={config.primaryColor} onChange={(event) => set({ primaryColor: event.target.value.toUpperCase() })} />
      </div>
      <div className="bf-client-theme-color-row">
        <span>Theme Background</span>
        <input type="color" value={config.theme === 'dark' ? config.backgroundDark : config.backgroundLight} onChange={(event) => set(config.theme === 'dark' ? { backgroundDark: event.target.value.toUpperCase() } : { backgroundLight: event.target.value.toUpperCase() })} />
      </div>
      <div className="bf-client-theme-presets">
        <div className="bf-client-theme-label">Quick Primary Presets</div>
        <div className="bf-client-theme-preset-grid">
          {PRIMARY_PRESETS.map(([label, value]) => (
            <button type="button" key={value} title={label} className={cx(config.primaryColor === value && 'active')} style={{ background: value }} onClick={() => set({ primaryColor: value })}>
              {config.primaryColor === value ? <Check size={12} /> : null}
            </button>
          ))}
        </div>
      </div>

      <SectionTitle>Menu Styles</SectionTitle>
      {[
        ['light', 'Light Menu'],
        ['color', 'Color Menu'],
        ['dark', 'Dark Menu'],
        ['gradient', 'Gradient Menu'],
      ].map(([value, label]) => <SettingRow key={value} label={label} selected={config.sidebarStyle === value} onClick={() => set({ sidebarStyle: value })} />)}

      <SectionTitle>Header Styles</SectionTitle>
      {[
        ['light', 'Light Header'],
        ['color', 'Color Header'],
        ['dark', 'Dark Header'],
        ['gradient', 'Gradient Header'],
      ].map(([value, label]) => <SettingRow key={value} label={label} selected={config.headerStyle === value} onClick={() => set({ headerStyle: value })} />)}

      {!horizontal ? (
        <>
          <SectionTitle>Sidemenu Layout Styles</SectionTitle>
          {[
            ['default', 'Default Menu'],
            ['closed', 'Closed Menu'],
            ['icon-text', 'Icon with Text'],
            ['icon-overlay', 'Icon Overlay'],
            ['hover-submenu', 'Hover Submenu'],
            ['hover-submenu-1', 'Hover Submenu style 1'],
            ['double', 'Double Menu'],
            ['double-tabs', 'Double Menu with Tabs'],
          ].map(([value, label]) => <SettingRow key={value} label={label} selected={config.sideMenuLayout === value} onClick={() => set({ sideMenuLayout: value })} />)}
        </>
      ) : null}

      <SectionTitle>Reset All Styles</SectionTitle>
      <div className="bf-client-theme-reset-wrap"><button type="button" onClick={resetConfig}>Reset All</button></div>
    </div>
  );
}

function ThemeDrawer({ open, onClose, config, updateConfig, resetConfig }) {
  return (
    <>
      {open ? <button type="button" aria-label="Close theme customizer" className="bf-client-drawer-backdrop theme" onClick={onClose} /> : null}
      <aside className={cx('bf-client-theme-drawer', open && 'open')}>
        <div className="bf-client-drawer-head">
          <div><Settings size={15} className="bf-client-gear" /><strong>Theme Settings</strong></div>
          <button type="button" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="bf-client-drawer-body"><ThemeSettings config={config} updateConfig={updateConfig} resetConfig={resetConfig} /></div>
      </aside>
    </>
  );
}

function Header({ company, currentUser, demo, basePath, config, updateConfig, onOpenMobile, onToggleLock, onOpenTheme, onOpenUtility, onLogout, utilityOpen, themeOpen, navigation, canBilling }) {
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  const [openPopover, setOpenPopover] = useState(null);
  const horizontal = config.navigationStyle !== 'vertical';
  const centerLogo = horizontal && config.horizontalLogo === 'center';
  const name = currentUser?.name || currentUser?.full_name || currentUser?.fullName || 'Company User';

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    if (!openPopover) return undefined;
    const outside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpenPopover(null);
    };
    const escape = (event) => {
      if (event.key === 'Escape') setOpenPopover(null);
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [openPopover]);

  const togglePopover = (id) => {
    onOpenUtility?.(false);
    onOpenTheme?.(false);
    setOpenPopover((current) => (current === id ? null : id));
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Browser/OS can deny fullscreen.
    }
  };

  const handleMenu = () => {
    if (horizontal) return;
    if (window.innerWidth < 1024) {
      onOpenMobile();
      return;
    }
    if (config.sideMenuLayout === 'default') onToggleLock();
  };

  return (
    <header
      className="bf-client-header"
      style={{
        '--bf-client-header-left': `${getSidebarOffset(config)}px`,
      }}
    >
      <div ref={rootRef} className="bf-client-header-inner">
        <div className="bf-client-header-left">
          {!horizontal ? <HeaderIcon label="Toggle menu" onClick={handleMenu}><Menu size={19} /></HeaderIcon> : null}
          {horizontal ? <div className={cx('bf-client-horizontal-brand', centerLogo && 'center')}><div className="bf-client-brand-mark">BF</div><div><strong>Buddy Fleets</strong><span>{demo ? 'Demo Portal' : 'Client Portal'}</span></div></div> : null}
          <div className="bf-client-header-title">
            <strong>{demo ? 'Demo Workspace' : 'Company Portal'}</strong>
            <span>{company?.company_name || company?.companyName || 'Buddy Fleets'} • {company?.company_code || company?.companyCode || ''}</span>
          </div>
          <SessionCountdown />
        </div>

        <div className="bf-client-header-right">
          {demo ? <HeaderIcon label="All Demo Fleets" onClick={() => navigate('/demo')}><Home size={19} /></HeaderIcon> : null}
          <div className="bf-client-site-select-wrap"><SiteSelector /></div>
          <div className="bf-client-header-pop-host">
            <HeaderIcon label="Search" active={openPopover === 'search'} onClick={() => togglePopover('search')}><Search size={19} /></HeaderIcon>
            {openPopover === 'search' ? <SearchPopover navigation={navigation} basePath={basePath} /> : null}
          </div>
          <HeaderIcon label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={toggleFullscreen}><>{fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}</></HeaderIcon>
          <HeaderIcon label="Light / Dark" onClick={() => updateConfig({ theme: config.theme === 'dark' ? 'light' : 'dark' })}>{config.theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</HeaderIcon>
          <HeaderIcon label="Utility panel" active={utilityOpen} onClick={() => { setOpenPopover(null); onOpenTheme?.(false); onOpenUtility?.(!utilityOpen); }}><AlignJustify size={19} /></HeaderIcon>
          <HeaderIcon label="Theme settings" active={themeOpen} onClick={() => { setOpenPopover(null); onOpenUtility?.(false); onOpenTheme?.(!themeOpen); }}><Settings size={19} className="bf-client-gear" /></HeaderIcon>
          <div className="bf-client-header-pop-host">
            <HeaderIcon label="Messages" badge={3} active={openPopover === 'messages'} onClick={() => togglePopover('messages')}><Mail size={19} /></HeaderIcon>
            {openPopover === 'messages' ? <MessagesPopover /> : null}
          </div>
          <div className="bf-client-header-pop-host">
            <HeaderIcon label="Notifications" badge={4} active={openPopover === 'notifications'} onClick={() => togglePopover('notifications')}><Bell size={19} /></HeaderIcon>
            {openPopover === 'notifications' ? <NotificationsPopover /> : null}
          </div>
          <div className="bf-client-header-pop-host">
            <button type="button" className="bf-client-profile-button" onClick={() => togglePopover('profile')}>
              <span className="bf-client-profile-name">{name}</span>
              <UserAvatar currentUser={currentUser} size="sm" />
              <ChevronDown size={12} />
            </button>
            {openPopover === 'profile' ? <ProfilePopover currentUser={currentUser} onLogout={onLogout} onClose={() => setOpenPopover(null)} demo={demo} basePath={basePath} canBilling={canBilling} /> : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ClientPortalShell({ children }) {
  const { company, currentUser, userAccess, runtimeNavigation, runtime, demo, basePath, onLogout } = useClientPortal();
  const packKey = company?.fleetPack || company?.fleet_pack || null;
  const allowedKeys = userAccess?.moduleKeys || [];
  const navigation = useMemo(() => {
    if (!packKey) return [];
    const local = getVisibleNavigation(packKey, allowedKeys);
    const runtime = normalizeRuntimeNavigation(runtimeNavigation);
    return runtime.length && hasDeepRuntimeNavigation(runtime) ? runtime : local;
  }, [packKey, allowedKeys, runtimeNavigation]);

  const [config, setConfig] = useState(readTheme);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [utilityOpen, setUtilityOpen] = useState(false);
  const [utilityTab, setUtilityTab] = useState('recent');
  const [themeOpen, setThemeOpen] = useState(false);
  const location = useLocation();

  const updateConfig = useCallback((patch) => {
    setConfig((current) => {
      const requested = typeof patch === 'function' ? patch(current) : patch;
      const next = { ...current, ...requested };
      if (Object.prototype.hasOwnProperty.call(requested, 'theme') && requested.theme !== current.theme) {
        next.sidebarStyle = requested.theme === 'dark' ? 'dark' : 'light';
      }
      if (next.sideMenuLayout === 'compact') next.sideMenuLayout = 'default';
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({ ...DEFAULT_THEME });
    setUtilityOpen(false);
    setThemeOpen(false);
  }, []);

  useEffect(() => {
    writeTheme(config);
    document.documentElement.dir = config.direction;
    document.documentElement.dataset.bfTheme = config.theme;
  }, [config]);

  useEffect(() => {
    setMobileOpen(false);
    setUtilityOpen(false);
    setThemeOpen(false);
  }, [location.pathname]);

  const vars = useMemo(() => ({ ...buildVars(config), '--bf-main-offset': `${getSidebarOffset(config)}px` }), [config]);
  const vertical = config.navigationStyle === 'vertical';
  const sidebarVisible = vertical && config.sideMenuLayout !== 'closed';
  const canBilling = allowedKeys.includes('subscription') || userAccess?.isAdmin === true;

  return (
    <div className={cx('bf-client-shell-root', config.theme === 'dark' && 'dark')} style={vars} data-theme={config.theme} dir={config.direction}>
      {sidebarVisible ? (
        <Sidebar
          navigation={navigation}
          basePath={basePath}
          company={company}
          currentUser={currentUser}
          demo={demo}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          config={config}
          onToggleLock={() => updateConfig({ sidebarLockedOpen: !config.sidebarLockedOpen })}
        />
      ) : null}

      <div className={cx('bf-client-main', sidebarVisible && 'with-sidebar', !vertical && 'horizontal', !config.sidebarLockedOpen && config.sideMenuLayout === 'default' && 'sidebar-collapsed')}>
        <Header
          company={company}
          currentUser={currentUser}
          demo={demo}
          basePath={basePath}
          config={config}
          updateConfig={updateConfig}
          onOpenMobile={() => setMobileOpen(true)}
          onToggleLock={() => updateConfig({ sidebarLockedOpen: !config.sidebarLockedOpen })}
          onOpenTheme={(value) => value === undefined ? setThemeOpen((current) => !current) : setThemeOpen(value)}
          onOpenUtility={(value) => value === undefined ? setUtilityOpen((current) => !current) : setUtilityOpen(value)}
          onLogout={onLogout}
          utilityOpen={utilityOpen}
          themeOpen={themeOpen}
          navigation={navigation}
          canBilling={canBilling}
        />
        {!vertical ? <HorizontalNav navigation={navigation} basePath={basePath} mode={config.navigationStyle} /> : null}
        <main className="bf-client-content">
          {runtime?.lifecycleAccess === 'read_only' ? (
            <div className="bf-client-lifecycle-banner">
              <ShieldCheck size={14} />
              <div><strong>Read-only access</strong><span>This company lifecycle currently allows viewing, printing and exporting only. Create/edit/delete actions are disabled by the server.</span></div>
            </div>
          ) : null}
          {children}
        </main>
        <PortalFooter />
      </div>

      <UtilityDrawer open={utilityOpen} onClose={() => setUtilityOpen(false)} activeTab={utilityTab} setActiveTab={setUtilityTab} />
      <ThemeDrawer open={themeOpen} onClose={() => setThemeOpen(false)} config={config} updateConfig={updateConfig} resetConfig={resetConfig} />
    </div>
  );
}
