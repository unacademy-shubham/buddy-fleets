import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {ChevronRight,LogOut,Moon,Sun} from 'lucide-react';
import './clientPortal.css';
import './clientPortalTheme.css';
import {ClientPortalProvider} from './ClientPortalContext';
import ClientPortalShell from './components/ClientPortalShell';
import DashboardPage from './pages/DashboardPage';
import SitesPage from './pages/SitesPage';
import UsersPage from './pages/UsersPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import PartiesPage from './pages/PartiesPage';
import ReportsPage from './pages/ReportsPage';
import TravelsPage from './pages/TravelsPage';
import CementPage from './pages/CementPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';
import ProfileSecurityPage from './pages/ProfileSecurityPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AuditActivityPage from './pages/AuditActivityPage';
import FleetWorkspacePage from './pages/FleetWorkspacePage';
import ComingSoonPage from './pages/ComingSoonPage';
import {DEMO_FLEET_ORDER,getFleetPackBySlug,getFleetPack} from './config/fleetPacks';
import {getModuleByRoute} from './config/moduleCatalog';
import {iconFor} from './config/portalNavigation';
import {clientPortalApi} from './services/clientPortalApi';

const THEME_KEY='bf_client_theme_config_v2';
function readPickerTheme(){try{return {...JSON.parse(localStorage.getItem(THEME_KEY)||'{}')}}catch{return{}}}
function pickerVars(theme){
  const dark=theme==='dark';
  return {
    '--bf-primary':'#7A00FF','--bf-primary-2':'#5F22D6','--bf-primary-rgb':'122 0 255',
    '--bf-bg':dark?'#0E1929':'#F4F5F8','--bf-surface':dark?'#1B2433':'#FFFFFF','--bf-text':dark?'#F1F5F9':'#25252B',
    '--bf-text-2':dark?'#B6C2D2':'#667085','--bf-border':dark?'#313B4B':'#E2E6EE','--bf-shadow':dark?'0 3px 16px rgba(0,0,0,.22)':'0 3px 16px rgba(15,23,42,.08)',
    '--bf-header-bg':'#7A00FF','--bf-header-text':'#FFFFFF','--bf-header-muted':'rgba(255,255,255,.82)','--bf-header-border':'rgba(255,255,255,.14)'
  };
}

function page(route,allowedKeys=[]){
  const m=getModuleByRoute(route);
  const unrestricted=route==='profile-security'||route.startsWith('profile-security/');
  if(!unrestricted&&m&&!allowedKeys.includes(m.key))return <ComingSoonPage title="Access restricted" description="The current demo lifecycle does not allow this module."/>;
  if(route==='dashboard')return <DashboardPage/>;
  if(route==='sites')return <SitesPage/>;
  if(route==='users')return <UsersPage/>;
  if(route==='vehicles')return <VehiclesPage/>;
  if(route==='drivers')return <DriversPage/>;
  if(route==='parties')return <PartiesPage/>;
  if(route==='reports'||route.startsWith('reports/'))return <ReportsPage/>;
  if(route==='finance'||route==='expenses'||route.startsWith('finance/'))return <FinancePage/>;
  if(route==='settings')return <SettingsPage/>;
  if(route==='profile-security'||route.startsWith('profile-security/'))return <ProfileSecurityPage/>;
  if(route==='subscription'||route.startsWith('subscription/'))return <SubscriptionPage section={route.replace(/^subscription\/?/,'')}/>;
  if(route==='audit-activity'||route.startsWith('audit-activity/'))return <AuditActivityPage/>;
  if(route.startsWith('travels/'))return <TravelsPage section={route.split('/')[1]||'bookings'}/>;
  if(route.startsWith('cement/'))return <CementPage section={route.split('/')[1]||'dispatch'}/>;
  if(m)return <FleetWorkspacePage route={route}/>;
  return <ComingSoonPage title="Module"/>;
}

function DemoFleetPicker({currentUser,onLogout}){
  const saved=readPickerTheme();
  const [theme,setTheme]=useState(saved.theme==='dark'?'dark':'light');
  const toggle=()=>{const next=theme==='dark'?'light':'dark';setTheme(next);try{localStorage.setItem(THEME_KEY,JSON.stringify({...readPickerTheme(),theme:next,primaryColor:'#7A00FF'}));}catch{}};
  return <div className="bf-demo-v2" data-theme={theme} style={pickerVars(theme)}>
    <header className="bf-demo-v2-top">
      <div className="bf-demo-v2-brand"><div className="bf-client-brand-mark">BF</div><div><strong>Buddy Fleets Demo</strong><span>Authenticated backend demo workspace • signed in as {currentUser?.name||currentUser?.email||'Demo User'}</span></div></div>
      <div className="bf-demo-v2-actions"><button className="bf-client-header-icon" onClick={toggle} title="Light / Dark">{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}</button><button className="bf-client-header-icon" onClick={onLogout} title="Logout"><LogOut size={16}/></button></div>
    </header>
    <main className="bf-demo-v2-body">
      <div className="bf-demo-v2-hero"><div><h1>Choose a fleet dashboard</h1><p>All seven demos run through the authenticated Buddy Fleets backend. Each fleet workspace has an isolated persisted demo snapshot, while the shell, permissions model and APIs remain the same product architecture.</p></div></div>
      <div className="bf-demo-v2-grid">
        {DEMO_FLEET_ORDER.map(key=>{const pack=getFleetPack(key);const Icon=iconFor(pack?.icon);return <Link className="bf-demo-v2-card" key={key} to={`/demo/${pack.slug}/dashboard`}><div className="bf-demo-v2-card-icon"><Icon size={20}/></div><h3>{pack.name}</h3><p>{pack.description}</p><span>Open Dashboard <ChevronRight size={12}/></span></Link>;})}
      </div>
    </main>
  </div>;
}

function DemoFleetWorkspace({pack,currentUser,onLogout}){
  const location=useLocation();
  const basePath=`/demo/${pack.slug}`;
  const route=location.pathname.replace(basePath,'').replace(/^\/+|\/+$/g,'')||'dashboard';
  const [state,setState]=useState({loading:true,error:'',company:null,settings:null,sites:[],userAccess:null,runtime:null,data:{}});

  const load=useCallback(async()=>{
    setState(s=>({...s,loading:true,error:''}));
    try{
      const res=await clientPortalApi.demoBootstrap(pack.key);
      setState({loading:false,error:'',company:{...(res.company||{}),fleetPack:pack.key},settings:res.settings||{fleet_pack:pack.key},sites:res.sites||[],userAccess:res.userAccess||{moduleKeys:[],companyModuleKeys:[],modulePermissions:{}},runtime:res.runtime||{},data:res.data||{}});
    }catch(error){setState(s=>({...s,loading:false,error:error.message||'Unable to load demo workspace.'}));}
  },[pack.key]);

  useEffect(()=>{load();},[load]);

  const value=useMemo(()=>{
    const snapshotUser=state.data?.currentUser||{};
    const user={...snapshotUser,...(currentUser||{}),role:currentUser?.role||snapshotUser.role||'Company Owner',roleName:'Company Owner'};
    return {
      ...state,
      currentUser:user,
      runtimeNavigation:[],
      demo:true,
      demoMode:pack.slug,
      basePath,
      onLogout,
      refresh:load,
      apiAction:async(action,payload)=>clientPortalApi.demoAction(pack.key,action,payload),
      mutateDemo:()=>{},
    };
  },[state,basePath,pack.key,pack.slug,currentUser,onLogout,load]);

  if(state.loading)return <div className="bf-demo-home"><div className="bf-card bf-card-body">Loading persisted {pack.name} demo…</div></div>;
  if(state.error)return <div className="bf-demo-home"><div className="bf-card bf-card-body"><h3>Demo workspace unavailable</h3><p className="bf-muted">{state.error}</p><button className="bf-btn bf-btn-primary" onClick={load}>Retry</button></div></div>;

  return <ClientPortalProvider value={value}><ClientPortalShell>{page(route,state.userAccess?.moduleKeys||[])}</ClientPortalShell></ClientPortalProvider>;
}

export default function DemoPortalApp({currentUser,onLogout}){
  const location=useLocation();
  const parts=location.pathname.split('/').filter(Boolean);
  const pack=getFleetPackBySlug(parts[1]);
  if(!pack)return <DemoFleetPicker currentUser={currentUser} onLogout={onLogout}/>;
  return <DemoFleetWorkspace key={pack.key} pack={pack} currentUser={currentUser} onLogout={onLogout}/>;
}
