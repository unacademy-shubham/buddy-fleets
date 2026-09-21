import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Bell, LogOut, Menu, Search, ShieldCheck, UserCircle2, X } from 'lucide-react';
import SiteSelector from './SiteSelector';
import PortalFooter from './PortalFooter';
import { MODULE_CATALOG } from '../config/moduleCatalog';
import { useClientPortal } from '../ClientPortalContext';

function initials(name) { return String(name || 'BF').split(/\s+/).map(v=>v[0]).join('').slice(0,2).toUpperCase(); }

export default function ClientPortalShell({ children }) {
  const location = useLocation();
  const { company, currentUser, userAccess, demo, demoMode, basePath, onLogout, sidebarOpen, setSidebarOpen } = useClientPortal();
  const [profileOpen, setProfileOpen] = useState(false);
  const visibleModules = useMemo(() => {
    const allowed = new Set(userAccess?.moduleKeys || MODULE_CATALOG.map((m)=>m.key));
    return MODULE_CATALOG.filter((module) => allowed.has(module.key) && (!module.pack || module.pack === company?.fleetPack));
  }, [userAccess, company]);
  const groups = useMemo(() => Object.entries(visibleModules.reduce((acc,m)=>{ (acc[m.category] ||= []).push(m); return acc; },{})), [visibleModules]);
  const getUrl = (route) => `${basePath}/${route}`.replace(/\/+/g,'/');
  const isActive = (route) => location.pathname === getUrl(route) || location.pathname.startsWith(`${getUrl(route)}/`);

  return <div className="bf-portal"><div className="bf-shell">
    {sidebarOpen ? <div className="bf-backdrop" onClick={()=>setSidebarOpen(false)} /> : null}
    <aside className={`bf-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="bf-brand"><div className="bf-brand-mark">BF</div><div><strong>Buddy Fleets</strong><small>Fleet Intelligence</small></div><button className="bf-icon-btn bf-menu-btn" style={{marginLeft:'auto'}} onClick={()=>setSidebarOpen(false)}><X size={16}/></button></div>
      {demo ? <div className="bf-demo-chip">DEMO MODE • SAMPLE DATA</div> : null}
      <div className="bf-sidebar-user"><div className="bf-avatar">{currentUser?.photoUrl ? <img src={currentUser.photoUrl} alt=""/> : initials(currentUser?.name)}</div><div><strong>{currentUser?.name || 'Company User'}</strong><small>{currentUser?.role || 'User'} • {company?.company_name}</small></div></div>
      <div className="bf-sidebar-scroll">
        {groups.map(([category, modules]) => <div className="bf-nav-group" key={category}><div className="bf-nav-title">{category}</div>{modules.map((m)=>{ const Icon=Icons[m.icon] || Icons.Circle; return <Link key={m.key} to={getUrl(m.route)} className={`bf-nav-link ${isActive(m.route)?'active':''}`} onClick={()=>setSidebarOpen(false)}><Icon/><span>{m.label}</span></Link>; })}</div>)}
      </div>
      <div className="bf-sidebar-bottom"><Link className="bf-nav-link" to={getUrl('profile-security')}><ShieldCheck/><span>Profile & Security</span></Link>{demo ? <Link className="bf-nav-link" to="/demo"><LogOut/><span>Exit Demo</span></Link> : <button className="bf-nav-link" onClick={onLogout}><LogOut/><span>Logout</span></button>}</div>
    </aside>

    <div className="bf-main">
      <header className="bf-topbar">
        <div className="bf-top-left"><button className="bf-icon-btn bf-menu-btn" onClick={()=>setSidebarOpen(true)}><Menu size={18}/></button><div className="bf-greeting"><strong>{demo ? 'Explore Buddy Fleets' : `Welcome, ${String(currentUser?.name || '').split(' ')[0] || 'User'}`}</strong><small>{company?.company_name} • {company?.company_code}</small></div><label className="bf-global-search"><Search size={15}/><input placeholder="Search vehicle, driver, booking, dispatch..." /></label></div>
        <div className="bf-top-right"><SiteSelector/><button className="bf-icon-btn" title="Notifications"><Bell size={17}/></button><div style={{position:'relative'}}><button className="bf-icon-btn" onClick={()=>setProfileOpen(v=>!v)}><UserCircle2 size={18}/></button>{profileOpen ? <div className="bf-card" style={{position:'absolute',right:0,top:44,width:190,padding:8,zIndex:60}}><Link className="bf-nav-link" style={{color:'#4b4b55'}} to={getUrl('profile-security')} onClick={()=>setProfileOpen(false)}><ShieldCheck/><span>Profile & Security</span></Link>{!demo ? <button className="bf-nav-link" style={{color:'#4b4b55'}} onClick={onLogout}><LogOut/><span>Logout</span></button> : null}</div> : null}</div></div>
      </header>
      <main className="bf-content">{children}</main>
      <PortalFooter/>
    </div>
  </div></div>;
}
