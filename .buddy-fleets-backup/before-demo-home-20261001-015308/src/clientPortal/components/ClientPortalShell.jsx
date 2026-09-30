import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Check, ChevronDown, ChevronLeft, ChevronRight, Circle, Clock3, LogOut,
  Maximize2, Menu, MessageCircle, MessageSquare, Minimize2, Moon, Search, Settings, ShieldCheck, SlidersHorizontal,
  Sun, User, X
} from 'lucide-react';
import SiteSelector from './SiteSelector';
import PortalFooter from './PortalFooter';
import { useClientPortal } from '../ClientPortalContext';
import { getVisibleNavigation, iconFor } from '../config/portalNavigation';

const STORAGE_KEY = 'bf_client_theme_config_v2';
const LAST_ACTIVITY_KEY = 'buddy_fleets_last_activity';
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

const DEFAULT_THEME = {
  theme: 'light',
  primaryColor: '#7A00FF',
  backgroundLight: '#F4F5F8',
  backgroundDark: '#0E1929',
  sidebarStyle: 'gradient',
  headerStyle: 'color',
  navigationStyle: 'vertical',
  sideMenuLayout: 'default',
  sidebarLockedOpen: true,
};

const PRIMARY_PRESETS = [
  ['Purple', '#7A00FF'],
  ['Indigo', '#5551D7'],
  ['Buddy Blue', '#1689E5'],
  ['Violet', '#7C3AED'],
  ['Cyan', '#0891B2'],
  ['Emerald', '#059669'],
  ['Orange', '#EA580C'],
  ['Rose', '#E11D48'],
];

function cx(...values) { return values.filter(Boolean).join(' '); }
function initials(value) {
  const parts = String(value || 'BF').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'BF';
  return (parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts.at(-1)[0]}`).toUpperCase();
}
function hexToRgb(hex) {
  const clean = String(hex || '#7A00FF').replace('#', '');
  return { r: parseInt(clean.slice(0,2),16)||122, g: parseInt(clean.slice(2,4),16)||0, b: parseInt(clean.slice(4,6),16)||255 };
}
function rgbToHex(r,g,b) { return `#${[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}`.toUpperCase(); }
function darken(hex, amount=.14) { const {r,g,b}=hexToRgb(hex); return rgbToHex(r*(1-amount),g*(1-amount),b*(1-amount)); }
function lighten(hex, amount=.86) { const {r,g,b}=hexToRgb(hex); return rgbToHex(r+(255-r)*amount,g+(255-g)*amount,b+(255-b)*amount); }
function readTheme() {
  try { return { ...DEFAULT_THEME, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...DEFAULT_THEME }; }
}
function writeTheme(config) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {} }

function buildVars(config) {
  const dark = config.theme === 'dark';
  const rgb = hexToRgb(config.primaryColor);
  const primaryStrong = darken(config.primaryColor);
  const primarySoft = lighten(config.primaryColor);
  const surface = dark ? '#1B2433' : '#FFFFFF';
  const surface2 = dark ? '#162131' : '#F8F9FC';
  const surface3 = dark ? '#253247' : '#EEF1F6';
  const text = dark ? '#F1F5F9' : '#25252B';
  const text2 = dark ? '#B6C2D2' : '#667085';
  const text3 = dark ? '#8F9CAF' : '#8793A8';
  const border = dark ? '#313B4B' : '#E2E6EE';
  let sidebarBg = dark ? '#1B2433' : '#FFFFFF';
  let sidebarText = dark ? '#EEF3F8' : '#61708A';
  let sidebarMuted = dark ? '#8B9AAF' : '#97A3B5';
  let sidebarBorder = dark ? '#313B4B' : '#ECEEF3';
  if (config.sidebarStyle === 'dark') sidebarBg = '#1B2433';
  if (config.sidebarStyle === 'light') { sidebarBg='#FFFFFF'; sidebarText='#61708A'; sidebarMuted='#97A3B5'; sidebarBorder='#ECEEF3'; }
  if (config.sidebarStyle === 'color') { sidebarBg=config.primaryColor; sidebarText='#FFFFFF'; sidebarMuted='rgba(255,255,255,.7)'; sidebarBorder='rgba(255,255,255,.16)'; }
  if (config.sidebarStyle === 'gradient') { sidebarBg=`linear-gradient(180deg, ${config.primaryColor} 0%, ${primaryStrong} 58%, #2D174D 100%)`; sidebarText='#FFFFFF'; sidebarMuted='rgba(255,255,255,.7)'; sidebarBorder='rgba(255,255,255,.15)'; }
  let headerBg = config.primaryColor, headerText='#FFFFFF', headerMuted='rgba(255,255,255,.82)', headerBorder='rgba(255,255,255,.14)';
  if (config.headerStyle === 'light') { headerBg='#FFFFFF'; headerText='#2B3544'; headerMuted='#69778B'; headerBorder='#E7EAF0'; }
  if (config.headerStyle === 'dark') { headerBg='#1B2433'; headerText='#FFFFFF'; headerMuted='#ACB8C8'; headerBorder='#313B4B'; }
  if (config.headerStyle === 'gradient') headerBg=`linear-gradient(90deg, ${config.primaryColor} 0%, ${primaryStrong} 100%)`;
  return {
    '--bf-primary': config.primaryColor,
    '--bf-primary-2': primaryStrong,
    '--bf-primary-soft': primarySoft,
    '--bf-primary-rgb': `${rgb.r} ${rgb.g} ${rgb.b}`,
    '--bf-bg': dark ? config.backgroundDark : config.backgroundLight,
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
    '--bf-sidebar-text': sidebarText,
    '--bf-sidebar-muted': sidebarMuted,
    '--bf-sidebar-border': sidebarBorder,
    '--bf-header-bg': headerBg,
    '--bf-header-text': headerText,
    '--bf-header-muted': headerMuted,
    '--bf-header-border': headerBorder,
    '--bf-shadow': dark ? '0 3px 16px rgba(0,0,0,.22)' : '0 3px 16px rgba(15,23,42,.08)',
  };
}

function nodeMatches(pathname, basePath, node) {
  if (node.route) {
    const url = `${basePath}/${node.route}`.replace(/\/+/g,'/');
    if (pathname === url || pathname.startsWith(`${url}/`)) return true;
  }
  return Array.isArray(node.children) && node.children.some((child)=>nodeMatches(pathname,basePath,child));
}

function normalizeRuntimeNode(node, index=0) {
  if (!node || typeof node !== 'object') return null;
  const children = (Array.isArray(node.children) ? node.children : [])
    .map((child, childIndex)=>normalizeRuntimeNode(child, childIndex))
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

function hasDeepRuntimeNavigation(nodes, depth=0) {
  return (nodes || []).some((node)=>
    ['submenu','level3'].includes(node.nodeType) ||
    (depth >= 1 && (node.children || []).length > 0) ||
    hasDeepRuntimeNavigation(node.children || [], depth + 1)
  );
}

function flattenTreeNavigation(nodes, trail=[]) {
  const out=[];
  for (const node of nodes || []) {
    const nextTrail=[...trail,node.label];
    if (node.route) out.push({label:node.label,route:node.route,trail:nextTrail,moduleKey:node.moduleKey});
    out.push(...flattenTreeNavigation(node.children || [], nextTrail));
  }
  return out;
}

function SessionTimer() {
  const [remaining, setRemaining] = useState(SESSION_TIMEOUT_MS);
  useEffect(() => {
    const tick = () => {
      let last = Date.now();
      try { last = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now(); } catch {}
      setRemaining(Math.max(0, SESSION_TIMEOUT_MS - (Date.now() - last)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  const mins = Math.floor(remaining/60000);
  const secs = Math.floor((remaining%60000)/1000);
  return <div className="bf-client-session"><Clock3 size={13}/><span>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span></div>;
}

function NestedNavNode({ node, basePath, depth=0, onNavigate, compact=false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const active = nodeMatches(location.pathname, basePath, node);
  const [expanded, setExpanded] = useState(active);
  useEffect(()=>{ if (active) setExpanded(true); },[active, location.pathname]);
  const go = () => {
    if (hasChildren) { setExpanded(v=>!v); return; }
    if (node.route) { navigate(`${basePath}/${node.route}`.replace(/\/+/g,'/')); onNavigate?.(); }
  };
  if (compact && depth === 0) {
    return <button type="button" title={node.label} onClick={go} className={cx('bf-client-compact-dot',active&&'active')}><Circle size={7}/></button>;
  }
  return <div className="bf-client-nav-node">
    <button type="button" onClick={go} className={cx('bf-client-nav-row',active&&'active',depth>0&&'child')} style={{paddingLeft: 12 + depth*16}}>
      <span className="bf-client-nav-bullet">{depth ? <span/> : null}</span>
      <span className="bf-client-nav-label">{node.label}</span>
      {hasChildren ? <ChevronDown size={12} className={cx('bf-client-nav-chevron',expanded&&'rotate')}/> : null}
    </button>
    {hasChildren && expanded ? <div className="bf-client-nav-children">{node.children.map((child)=><NestedNavNode key={`${child.label}-${child.route||depth}`} node={child} basePath={basePath} depth={depth+1} onNavigate={onNavigate}/>)}</div> : null}
  </div>;
}

function Sidebar({ navigation, basePath, company, currentUser, demo, collapsed, mobileOpen, onCloseMobile, onToggleCollapse, config }) {
  const location = useLocation();
  const activeCategory = navigation.find(menu=>nodeMatches(location.pathname,basePath,menu))?.id || 'overview';
  const [openCategory,setOpenCategory]=useState(activeCategory);
  useEffect(()=>{ if(activeCategory) setOpenCategory(activeCategory); },[activeCategory,location.pathname]);
  const toggleCategory=(id)=>{
    if(collapsed){ setOpenCategory(id); onToggleCollapse?.(); return; }
    setOpenCategory(current=>current===id?'':id);
  };
  return <>
    {mobileOpen ? <button aria-label="Close menu" className="bf-client-mobile-backdrop" onClick={onCloseMobile}/> : null}
    <aside className={cx('bf-client-sidebar',collapsed&&'collapsed',mobileOpen&&'mobile-open')}>
      <div className="bf-client-brand-row">
        <div className="bf-client-brand-mark">BF</div>
        {!collapsed ? <div className="bf-client-brand-copy"><strong>Buddy Fleets</strong><small>{demo?'Demo Portal':'Client Portal'}</small></div> : null}
        <button className="bf-client-side-toggle desktop-only" onClick={onToggleCollapse}>{collapsed?<ChevronRight size={15}/>:<ChevronLeft size={15}/>}</button>
        <button className="bf-client-side-toggle mobile-only" onClick={onCloseMobile}><X size={16}/></button>
      </div>
      <div className={cx('bf-client-profile-card',collapsed&&'compact')}>
        <div className="bf-client-avatar">{currentUser?.photoUrl || currentUser?.photo_url ? <img src={currentUser.photoUrl||currentUser.photo_url} alt=""/> : initials(currentUser?.name||currentUser?.full_name)}</div>
        {!collapsed ? <div className="bf-client-profile-copy"><strong>{currentUser?.name||currentUser?.full_name||'Company User'}</strong><span>{currentUser?.roleName||currentUser?.role||'Company User'}</span><small>{company?.company_name||company?.companyName||'Buddy Fleets'}</small></div> : null}
      </div>
      {demo && !collapsed ? <div className="bf-client-demo-chip">DEMO ACCOUNT • SAMPLE DATA</div> : null}
      <div className="bf-client-sidebar-scroll">
        {navigation.map((menu)=>{
          const Icon = iconFor(menu.icon);
          const active = nodeMatches(location.pathname,basePath,menu);
          const expanded = !collapsed && openCategory===menu.id;
          return <div className="bf-client-category" key={menu.id}>
            <button type="button" className={cx('bf-client-category-head',active&&'active')} title={collapsed?menu.label:undefined} onClick={()=>toggleCategory(menu.id)} aria-expanded={expanded}>
              <Icon size={17}/>{!collapsed?<><span>{menu.label}</span><ChevronDown size={12} className={cx('bf-client-category-chevron',expanded&&'rotate')}/></>:null}
            </button>
            {expanded ? <div className="bf-client-category-body">
              {menu.children.map((child)=><NestedNavNode key={`${menu.id}-${child.label}`} node={child} basePath={basePath} onNavigate={onCloseMobile}/>) }
            </div> : null}
          </div>;
        })}
      </div>
      {!collapsed ? <div className="bf-client-sidebar-foot"><span>{company?.company_code||company?.companyCode||'BUDDY'}</span><span>{config.theme==='dark'?'Dark':'Light'} Theme</span></div> : null}
    </aside>
  </>;
}

function HorizontalNav({ navigation, basePath }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openId,setOpenId]=useState('');
  return <nav className="bf-client-horizontal-nav">
    {navigation.map((menu)=>{
      const Icon=iconFor(menu.icon); const active=nodeMatches(location.pathname,basePath,menu);
      return <div key={menu.id} className="bf-client-horizontal-item">
        <button className={cx('bf-client-horizontal-button',active&&'active')} onClick={()=>setOpenId(openId===menu.id?'':menu.id)}><Icon size={15}/>{menu.label}<ChevronDown size={11}/></button>
        {openId===menu.id ? <div className="bf-client-horizontal-menu">{menu.children.map((child)=><HorizontalMenuNode key={child.label} node={child} basePath={basePath} navigate={navigate} close={()=>setOpenId('')}/>)}</div>:null}
      </div>;
    })}
  </nav>;
}
function HorizontalMenuNode({node,basePath,navigate,close,depth=0}) {
  if (node.children?.length) return <div className="bf-client-horizontal-group"><div className="bf-client-horizontal-group-title">{node.label}</div>{node.children.map(c=><HorizontalMenuNode key={`${node.label}-${c.label}`} node={c} basePath={basePath} navigate={navigate} close={close} depth={depth+1}/>)}</div>;
  return <button className="bf-client-horizontal-link" onClick={()=>{navigate(`${basePath}/${node.route}`.replace(/\/+/g,'/'));close();}}>{node.label}</button>;
}

function ThemeDrawer({ open, onClose, config, setConfig }) {
  const patch = (next) => setConfig((prev)=>({...prev,...next}));
  const reset = () => setConfig({...DEFAULT_THEME});
  return <div className={cx('bf-client-theme-drawer',open&&'open')}>
    <div className="bf-client-drawer-head"><div><strong>Theme Customization</strong><span>Same control language as Developer CPanel</span></div><button onClick={onClose}><X size={17}/></button></div>
    <div className="bf-client-drawer-body">
      <section><h4>Appearance</h4><div className="bf-client-option-grid"><button className={cx(config.theme==='light'&&'active')} onClick={()=>patch({theme:'light'})}><Sun size={16}/>Light</button><button className={cx(config.theme==='dark'&&'active')} onClick={()=>patch({theme:'dark'})}><Moon size={16}/>Dark</button></div></section>
      <section><h4>Primary Color</h4><div className="bf-client-color-grid">{PRIMARY_PRESETS.map(([label,value])=><button key={value} title={label} className={cx(config.primaryColor===value&&'active')} onClick={()=>patch({primaryColor:value})}><span style={{background:value}}/>{config.primaryColor===value?<Check size={11}/>:null}</button>)}</div></section>
      <section><h4>Sidebar</h4><div className="bf-client-option-grid small">{['light','dark','color','gradient'].map(v=><button key={v} className={cx(config.sidebarStyle===v&&'active')} onClick={()=>patch({sidebarStyle:v})}>{v}</button>)}</div></section>
      <section><h4>Header</h4><div className="bf-client-option-grid small">{['light','dark','color','gradient'].map(v=><button key={v} className={cx(config.headerStyle===v&&'active')} onClick={()=>patch({headerStyle:v})}>{v}</button>)}</div></section>
      <section><h4>Navigation</h4><div className="bf-client-option-grid"><button className={cx(config.navigationStyle==='vertical'&&'active')} onClick={()=>patch({navigationStyle:'vertical'})}>Vertical</button><button className={cx(config.navigationStyle==='horizontal'&&'active')} onClick={()=>patch({navigationStyle:'horizontal'})}>Horizontal</button></div></section>
      <section><h4>Side Menu Layout</h4><div className="bf-client-option-grid"><button className={cx(config.sideMenuLayout==='default'&&'active')} onClick={()=>patch({sideMenuLayout:'default'})}>Default</button><button className={cx(config.sideMenuLayout==='compact'&&'active')} onClick={()=>patch({sideMenuLayout:'compact'})}>Compact</button></div></section>
      <button className="bf-client-reset-theme" onClick={reset}>Reset Client Theme</button>
    </div>
  </div>;
}

function Header({ company, currentUser, demo, basePath, config, setConfig, onOpenMobile, onToggleCollapse, onOpenTheme, onLogout, navigation, canBilling }) {
  const navigate = useNavigate();
  const [profileOpen,setProfileOpen]=useState(false);
  const [noticeOpen,setNoticeOpen]=useState(false);
  const [messageOpen,setMessageOpen]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [full,setFull]=useState(Boolean(document.fullscreenElement));
  const profileRef=useRef(null);
  const flat=useMemo(()=>flattenTreeNavigation(navigation),[navigation]);
  const results=query.trim()?flat.filter(x=>x.label.toLowerCase().includes(query.toLowerCase())).slice(0,7):[];
  useEffect(()=>{
    const handler=(e)=>{ if(profileRef.current&&!profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown',handler); return()=>document.removeEventListener('mousedown',handler);
  },[]);
  const toggleFull=async()=>{ try{ if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); setFull(Boolean(document.fullscreenElement)); }catch{} };
  const go=(route)=>{navigate(`${basePath}/${route}`.replace(/\/+/g,'/'));setProfileOpen(false);};
  return <header className="bf-client-header">
    <div className="bf-client-header-left">
      <button className="bf-client-header-icon mobile-only" onClick={onOpenMobile}><Menu size={18}/></button>
      <button className="bf-client-header-icon desktop-only" onClick={onToggleCollapse}><Menu size={18}/></button>
      <div className="bf-client-header-title"><strong>{demo?'Demo Workspace':'Company Portal'}</strong><span>{company?.company_name||company?.companyName||'Buddy Fleets'} • {company?.company_code||company?.companyCode||''}</span></div>
      <SessionTimer/>
    </div>
    <div className="bf-client-header-right">
      <SiteSelector/>
      <div className="bf-client-search-wrap">
        <button className="bf-client-header-icon" onClick={()=>setSearchOpen(v=>!v)} title="Search"><Search size={16}/></button>
        {searchOpen?<div className="bf-client-search-pop"><div className="bf-client-search-input"><Search size={14}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search module…"/></div>{results.map(r=><button key={`${r.route}-${r.label}`} onClick={()=>{go(r.route);setSearchOpen(false);setQuery('');}}><span>{r.label}</span><small>{r.trail.slice(0,-1).join(' / ')}</small></button>)}{query&&!results.length?<div className="bf-client-search-empty">No module found</div>:null}</div>:null}
      </div>
      <button className="bf-client-header-icon desktop-only" onClick={toggleFull} title="Fullscreen">{full?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
      <button className="bf-client-header-icon" onClick={()=>setConfig(c=>({...c,theme:c.theme==='dark'?'light':'dark'}))} title="Light / Dark">{config.theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}</button>
      <button className="bf-client-header-icon" onClick={onOpenTheme} title="Theme Settings"><SlidersHorizontal size={16}/></button>
      <div className="bf-client-pop-host"><button className="bf-client-header-icon" onClick={()=>{setMessageOpen(v=>!v);setNoticeOpen(false);}} title="Messages"><MessageCircle size={16}/><span className="bf-client-badge-dot soft"/></button>{messageOpen?<div className="bf-client-popover bf-client-notice-pop"><div className="bf-client-pop-title">Messages</div><div className="bf-client-notice"><MessageSquare size={15}/><div><strong>Company workspace</strong><span>Operational messages and announcements appear here.</span></div></div></div>:null}</div>
      <div className="bf-client-pop-host"><button className="bf-client-header-icon" onClick={()=>setNoticeOpen(v=>!v)} title="Notifications"><Bell size={16}/><span className="bf-client-badge-dot"/></button>{noticeOpen?<div className="bf-client-popover bf-client-notice-pop"><div className="bf-client-pop-title">Notifications</div><div className="bf-client-notice"><ShieldCheck size={15}/><div><strong>Secure session active</strong><span>Your portal session is verified.</span></div></div><div className="bf-client-notice"><MessageSquare size={15}/><div><strong>Fleet workspace ready</strong><span>{company?.fleetPack||company?.fleet_pack||'Fleet'} modules loaded.</span></div></div></div>:null}</div>
      <div className="bf-client-pop-host" ref={profileRef}><button className="bf-client-profile-button" onClick={()=>setProfileOpen(v=>!v)}><span>{initials(currentUser?.name||currentUser?.full_name)}</span><div className="desktop-only"><strong>{currentUser?.name||currentUser?.full_name||'User'}</strong><small>{currentUser?.roleName||currentUser?.role||'User'}</small></div><ChevronDown size={12}/></button>{profileOpen?<div className="bf-client-popover bf-client-profile-pop"><div className="bf-client-profile-pop-head"><span className="bf-client-avatar">{initials(currentUser?.name||currentUser?.full_name)}</span><div><strong>{currentUser?.name||currentUser?.full_name||'User'}</strong><small>{currentUser?.email||''}</small></div></div><button onClick={()=>go('profile-security')}><User size={15}/>My Profile</button>{canBilling?<button onClick={()=>go('subscription')}><ShieldCheck size={15}/>Subscription & Billing</button>:null}<button onClick={()=>go('settings')}><Settings size={15}/>Company Settings</button><div className="bf-client-pop-sep"/><button className="danger" onClick={onLogout}><LogOut size={15}/>{demo?'Logout Demo Account':'Logout'}</button></div>:null}</div>
    </div>
  </header>;
}

export default function ClientPortalShell({ children }) {
  const { company, currentUser, userAccess, runtimeNavigation, runtime, demo, basePath, onLogout } = useClientPortal();
  const packKey = company?.fleetPack || company?.fleet_pack || null;
  const allowedKeys = userAccess?.moduleKeys || [];
  const navigation = useMemo(()=>{
    if (!packKey) return [];
    const local = getVisibleNavigation(packKey, allowedKeys);
    const runtime = normalizeRuntimeNavigation(runtimeNavigation);
    // The first DB seed contains category + module rows only. Keep the richer
    // existing multi-level client hierarchy until Navigation Builder has real
    // submenu/level-3 nodes; once it does, the DB tree becomes authoritative.
    return runtime.length && hasDeepRuntimeNavigation(runtime) ? runtime : local;
  },[packKey,allowedKeys,runtimeNavigation]);
  const [config,setConfig]=useState(readTheme);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [collapsed,setCollapsed]=useState(()=>readTheme().sideMenuLayout==='compact');
  const [themeOpen,setThemeOpen]=useState(false);
  const location=useLocation();
  useEffect(()=>{writeTheme(config); if(config.sideMenuLayout==='compact')setCollapsed(true);},[config]);
  useEffect(()=>setMobileOpen(false),[location.pathname]);
  const vars=useMemo(()=>buildVars(config),[config]);
  const vertical=config.navigationStyle!=='horizontal';
  const actualCollapsed=vertical&&(collapsed||config.sideMenuLayout==='compact');
  return <div className={cx('bf-client-shell-root',config.theme==='dark'&&'dark')} style={vars} data-theme={config.theme}>
    {vertical?<Sidebar navigation={navigation} basePath={basePath} company={company} currentUser={currentUser} demo={demo} collapsed={actualCollapsed} mobileOpen={mobileOpen} onCloseMobile={()=>setMobileOpen(false)} onToggleCollapse={()=>setCollapsed(v=>!v)} config={config}/>:null}
    <div className={cx('bf-client-main',vertical&&'with-sidebar',actualCollapsed&&'sidebar-collapsed')}>
      <Header company={company} currentUser={currentUser} demo={demo} basePath={basePath} config={config} setConfig={setConfig} onOpenMobile={()=>setMobileOpen(true)} onToggleCollapse={()=>setCollapsed(v=>!v)} onOpenTheme={()=>setThemeOpen(true)} onLogout={onLogout} navigation={navigation} canBilling={allowedKeys.includes('subscription')||userAccess?.isAdmin===true}/>
      {!vertical?<HorizontalNav navigation={navigation} basePath={basePath}/>:null}
      <main className="bf-client-content">{runtime?.lifecycleAccess==='read_only'?<div className="bf-client-lifecycle-banner"><ShieldCheck size={14}/><div><strong>Read-only access</strong><span>This company lifecycle currently allows viewing, printing and exporting only. Create/edit/delete actions are disabled by the server.</span></div></div>:null}{children}</main>
      <PortalFooter/>
    </div>
    <ThemeDrawer open={themeOpen} onClose={()=>setThemeOpen(false)} config={config} setConfig={setConfig}/>
    {themeOpen?<button className="bf-client-drawer-backdrop" aria-label="Close theme settings" onClick={()=>setThemeOpen(false)}/>:null}
  </div>;
}
